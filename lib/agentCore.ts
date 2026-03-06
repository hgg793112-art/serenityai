/**
 * AI Agent Core — 核心調度
 *
 * 完整交互流程：
 * 用戶發送消息
 *   → Emotion Engine 識別情緒
 *   → Memory System 讀取用戶歷史
 *   → Task Planner 決定回覆策略
 *   → Prompt Engine 生成人格 Prompt
 *   → LLM 生成回答（流式）
 *   → 更新 Memory（情緒記錄 + 長期記憶抽取）
 *   → 返回 APP
 */

import type {
  ChatMessage, MemoryFact, EmotionResult,
  AgentStep, AgentToolResult, AgentResponse,
} from '../types';
import { detectEmotionFast } from './emotionEngine';
import { addEmotionRecord, getEmotionSummary, extractAndSaveMemory } from './memorySystem';
import { createPlan } from './taskPlanner';
import { executeTool } from './toolSystem';
import { buildAgentPrompt } from './promptEngine';
import { streamChat } from './streamHelper';
import {
  getOrCreateUserId,
  getRecentMessages,
  addMessage,
  getMemoryFacts,
  addMemoryFact,
} from './chatService';

const DOUBAO_BASE = 'https://ark.cn-beijing.volces.com/api/v3';

function isCapacitor(): boolean {
  return typeof (window as any)?.Capacitor !== 'undefined';
}

function getApiKey(): string {
  return (import.meta.env.VITE_DOUBAO_API_KEY as string)?.trim() ?? '';
}

/**
 * 快速 LLM 調用（非流式，用於情緒分析、記憶抽取等內部任務）
 */
async function callLLMQuick(prompt: string): Promise<string> {
  const apiKey = getApiKey();
  const messages = [{ role: 'user', content: prompt }];
  const body = JSON.stringify({
    model: 'ep-20260306165624-l9cfw',
    messages,
    max_tokens: 200,
    temperature: 0.3,
    stream: false,
  });

  const url = isCapacitor() && apiKey
    ? `${DOUBAO_BASE}/chat/completions`
    : '/api/qwen-chat';

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (isCapacitor() && apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const res = await fetch(url, { method: 'POST', headers, body });
  if (!res.ok) throw new Error(`LLM 調用失敗: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

/**
 * 流式 LLM 調用（用於最終回覆）
 */
function callLLMStream(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  onChunk: (accumulated: string) => void
): Promise<string> {
  const apiKey = getApiKey();
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];
  const body = JSON.stringify({
    model: 'ep-20260306165624-l9cfw',
    messages: fullMessages,
    max_tokens: 400,
    temperature: 0.85,
    stream: true,
  });

  if (isCapacitor() && apiKey) {
    return streamChat(
      `${DOUBAO_BASE}/chat/completions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body,
      },
      onChunk
    );
  }

  return streamChat(
    '/api/qwen-chat',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body },
    onChunk
  );
}

/* ─── Agent 主流程 ─── */

export interface AgentCallbacks {
  onChunk?: (accumulated: string) => void;
  onStep?: (step: AgentStep) => void;
  onEmotion?: (emotion: EmotionResult) => void;
  onToolResult?: (result: AgentToolResult) => void;
}

/**
 * Agent 核心：處理一輪用戶訊息
 *
 * 這是整個 AI Agent 的主入口。
 */
export async function processMessage(
  userContent: string,
  callbacks: AgentCallbacks = {}
): Promise<AgentResponse> {
  const { onChunk, onStep, onEmotion, onToolResult } = callbacks;
  const steps: AgentStep[] = [];
  const toolResults: AgentToolResult[] = [];

  const userId = getOrCreateUserId();

  // Step 1: Emotion Engine — 識別情緒
  const emotion = detectEmotionFast(userContent);
  steps.push({ type: 'emotion_detect', description: `情緒：${emotion.emotion}（${(emotion.confidence * 100).toFixed(0)}%）`, result: emotion });
  onStep?.(steps[steps.length - 1]);
  onEmotion?.(emotion);

  // Step 2: Memory System — 讀取歷史
  await addMessage(userId, 'user', userContent);
  const [recentMessages, memoryFacts, emotionSummary] = await Promise.all([
    getRecentMessages(userId, 12),
    getMemoryFacts(userId),
    getEmotionSummary(userId),
  ]);
  steps.push({ type: 'memory_read', description: `讀取 ${recentMessages.length} 條對話、${memoryFacts.length} 條記憶` });
  onStep?.(steps[steps.length - 1]);

  // Step 3: Task Planner — 規劃回覆策略
  const plan = createPlan({
    userMessage: userContent,
    emotion,
    emotionSummary,
    hasLongMemory: memoryFacts.length > 0,
    recentTopics: [],
  });
  steps.push({ type: 'plan', description: `意圖：${plan.intent}，策略：${plan.replyStrategy.slice(0, 30)}...` });
  onStep?.(steps[steps.length - 1]);

  // Step 4: Tool System — 調用工具（如果需要）
  if (plan.shouldCallTool && plan.suggestedToolId) {
    const params = {
      ...plan.suggestedToolParams,
      emotion: emotion.emotion,
      emotionSummary,
    };
    const toolResult = await executeTool(plan.suggestedToolId, params);
    toolResults.push(toolResult);
    steps.push({ type: 'tool_call', description: `工具：${plan.suggestedToolId}`, result: toolResult });
    onStep?.(steps[steps.length - 1]);
    onToolResult?.(toolResult);
  }

  // Step 5: Prompt Engine — 組裝 system prompt
  const systemPrompt = buildAgentPrompt({
    emotion,
    memoryFacts,
    emotionSummary,
    replyStrategy: plan.replyStrategy,
    toolResults,
  });

  // Step 6: LLM — 流式生成回覆
  const history = recentMessages.slice(-10).map(m => ({
    role: m.role as string,
    content: m.content,
  }));

  const chunk = onChunk ?? (() => {});
  const reply = await callLLMStream(systemPrompt, history, chunk);

  steps.push({ type: 'llm_generate', description: '生成回覆完成' });
  onStep?.(steps[steps.length - 1]);

  // Step 7: 更新 Memory
  await addMessage(userId, 'assistant', reply);
  await addEmotionRecord(userId, emotion.emotion, emotion.confidence, emotion.intensity, userContent.slice(0, 50));

  // 異步抽取長期記憶（不阻塞回覆）
  extractAndSaveMemory(userId, userContent, memoryFacts, callLLMQuick, addMemoryFact)
    .then(newFacts => {
      if (newFacts.length > 0) {
        steps.push({ type: 'memory_write', description: `新增記憶：${newFacts.join('、')}` });
      }
    })
    .catch(() => {});

  return {
    reply,
    emotion,
    steps,
    toolResults,
    memoryUpdated: true,
  };
}

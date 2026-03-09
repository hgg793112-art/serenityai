/**
 * AI Agent Core — 核心调度
 *
 * 完整交互流程：
 * 用户发送消息
 *   → Emotion Engine 识别情绪
 *   → Memory System 读取用户历史
 *   → Task Planner 决定回复策略
 *   → Prompt Engine 生成人格 Prompt
 *   → LLM 生成回答（流式）
 *   → 更新 Memory（情绪记录 + 长期记忆抽取）
 *   → 返回 APP
 */

import type {
  ChatMessage, MemoryFact, EmotionResult, EmotionType, Mood,
  AgentStep, AgentToolResult, AgentResponse,
} from '../types';
import { Mood as MoodEnum } from '../types';
import { detectEmotionFast } from './emotionEngine';
import { addEmotionRecord, getEmotionSummary, extractAndSaveMemory } from './memorySystem';
import { createPlan } from './taskPlanner';
import { executeTool } from './toolSystem';
import { buildAgentPrompt } from './promptEngine';
import { streamChat } from './streamHelper';
import { supabase, isSupabaseEnabled } from './supabase';
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
 * 快速 LLM 调用（非流式，用于情绪分析、记忆抽取等内部任务）
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
  if (!res.ok) throw new Error(`LLM 调用失败: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

/**
 * 流式 LLM 调用（用于最终回复）
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

/* ─── 情绪 → 压力值 / Mood 映射 ─── */

const EMOTION_TO_STRESS: Record<EmotionType, number> = {
  happy: 15, excited: 20, calm: 10, grateful: 12,
  neutral: 30, confused: 50, tired: 55,
  lonely: 60, sad: 70, anxious: 75, stressed: 85, angry: 80,
};

const EMOTION_TO_MOOD: Record<EmotionType, Mood> = {
  happy: MoodEnum.HAPPY, excited: MoodEnum.EXCITED, calm: MoodEnum.CALM,
  grateful: MoodEnum.HAPPY, neutral: MoodEnum.CALM,
  confused: MoodEnum.ANXIOUS, tired: MoodEnum.TIRED,
  lonely: MoodEnum.SAD, sad: MoodEnum.SAD,
  anxious: MoodEnum.ANXIOUS, stressed: MoodEnum.STRESSED, angry: MoodEnum.STRESSED,
};

async function autoWriteMoodLog(emotion: EmotionResult): Promise<void> {
  const stress = Math.round(
    (EMOTION_TO_STRESS[emotion.emotion] ?? 40) * (0.6 + emotion.intensity * 0.4)
  );
  const mood = EMOTION_TO_MOOD[emotion.emotion] ?? MoodEnum.CALM;
  const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);
  const timestamp = Date.now();

  const entry = { id, timestamp, mood, stressLevel: stress, note: 'AI 自动记录' };

  if (isSupabaseEnabled() && supabase) {
    try {
      await supabase.from('mood_logs').insert({
        id, timestamp, mood, note: entry.note, stress_level: stress,
      });
    } catch { /* ignore */ }
  }

  try {
    const raw = localStorage.getItem('mood_logs');
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift(entry);
    localStorage.setItem('mood_logs', JSON.stringify(arr.slice(0, 500)));
  } catch { /* ignore */ }
}

/* ─── Agent 主流程 ─── */

export interface AgentCallbacks {
  onChunk?: (accumulated: string) => void;
  onStep?: (step: AgentStep) => void;
  onEmotion?: (emotion: EmotionResult) => void;
  onToolResult?: (result: AgentToolResult) => void;
}

/**
 * Agent 核心：处理一轮用户讯息
 *
 * 这是整个 AI Agent 的主入口。
 */
export async function processMessage(
  userContent: string,
  callbacks: AgentCallbacks = {}
): Promise<AgentResponse> {
  const { onChunk, onStep, onEmotion, onToolResult } = callbacks;
  const steps: AgentStep[] = [];
  const toolResults: AgentToolResult[] = [];

  const userId = getOrCreateUserId();

  // Step 1: Emotion Engine — 识别情绪
  const emotion = detectEmotionFast(userContent);
  steps.push({ type: 'emotion_detect', description: `情绪：${emotion.emotion}（${(emotion.confidence * 100).toFixed(0)}%）`, result: emotion });
  onStep?.(steps[steps.length - 1]);
  onEmotion?.(emotion);

  // Step 2: Memory System — 读取历史
  await addMessage(userId, 'user', userContent);
  const [recentMessages, memoryFacts, emotionSummary] = await Promise.all([
    getRecentMessages(userId, 12),
    getMemoryFacts(userId),
    getEmotionSummary(userId),
  ]);
  steps.push({ type: 'memory_read', description: `读取 ${recentMessages.length} 条对话、${memoryFacts.length} 条记忆` });
  onStep?.(steps[steps.length - 1]);

  // Step 3: Task Planner — 规划回复策略
  const plan = createPlan({
    userMessage: userContent,
    emotion,
    emotionSummary,
    hasLongMemory: memoryFacts.length > 0,
    recentTopics: [],
  });
  steps.push({ type: 'plan', description: `意图：${plan.intent}，策略：${plan.replyStrategy.slice(0, 30)}...` });
  onStep?.(steps[steps.length - 1]);

  // Step 4: Tool System — 调用工具（如果需要）
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

  // Step 5: Prompt Engine — 组装 system prompt
  const systemPrompt = buildAgentPrompt({
    emotion,
    memoryFacts,
    emotionSummary,
    replyStrategy: plan.replyStrategy,
    toolResults,
  });

  // Step 6: LLM — 流式生成回复
  const history = recentMessages.slice(-10).map(m => ({
    role: m.role as string,
    content: m.content,
  }));

  const chunk = onChunk ?? (() => {});
  const reply = await callLLMStream(systemPrompt, history, chunk);

  steps.push({ type: 'llm_generate', description: '生成回复完成' });
  onStep?.(steps[steps.length - 1]);

  // Step 7: 更新 Memory
  await addMessage(userId, 'assistant', reply);
  await addEmotionRecord(userId, emotion.emotion, emotion.confidence, emotion.intensity, userContent.slice(0, 50));

  // 自动写入 moodLog（基于侦测情绪推算压力值），不阻塞回复
  autoWriteMoodLog(emotion).catch(() => {});

  // 异步抽取长期记忆（不阻塞回复）
  extractAndSaveMemory(userId, userContent, memoryFacts, callLLMQuick, addMemoryFact)
    .then(newFacts => {
      if (newFacts.length > 0) {
        steps.push({ type: 'memory_write', description: `新增记忆：${newFacts.join('、')}` });
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

/**
 * Task Planner — 任務規劃器
 *
 * 完整流程：
 * 1. 識別用戶意圖（emotional_support / goal_planning / relaxation / ...）
 * 2. 根據意圖 + 情緒 + 記憶，規劃回覆策略
 * 3. 決定是否調用工具
 * 4. 生成最終回覆的 system prompt 指令
 */

import type { UserIntent, EmotionResult, AgentStep, EmotionMemory } from '../types';
import { detectEmotionFast } from './emotionEngine';
import { buildToolsPrompt } from './toolSystem';

interface PlanContext {
  userMessage: string;
  emotion: EmotionResult;
  emotionSummary: EmotionMemory[];
  hasLongMemory: boolean;
  recentTopics: string[];
}

interface Plan {
  intent: UserIntent;
  steps: AgentStep[];
  shouldCallTool: boolean;
  suggestedToolId?: string;
  suggestedToolParams?: Record<string, any>;
  replyStrategy: string;
}

const INTENT_KEYWORDS: Record<UserIntent, string[]> = {
  emotional_support: ['難過', '傷心', '哭', '焦慮', '壓力', '累', '煩', '崩潰', '受不了', '孤獨', '害怕', '不開心', '低落', '沮喪'],
  goal_planning:     ['目標', '計劃', '想做', '怎麼做', '拆解', '規劃', '安排', '打算', '想要', '決定'],
  relaxation:        ['放鬆', '冥想', '呼吸', '休息', '睡不著', '失眠', '靜一靜', '安靜'],
  casual_chat:       ['聊聊', '你好', '嗨', '在嗎', '無聊', '今天', '最近'],
  self_reflection:   ['為什麼', '我是不是', '我覺得', '反思', '想想', '回顧', '意義'],
  knowledge_seeking: ['什麼是', '怎麼辦', '方法', '建議', '知識', '科學', '研究'],
};

/**
 * 快速意圖識別（規則）
 */
export function detectIntent(text: string, emotion: EmotionResult): UserIntent {
  const lower = text.toLowerCase();

  if (emotion.needsSupport && emotion.intensity > 0.6) {
    return 'emotional_support';
  }

  let bestIntent: UserIntent = 'casual_chat';
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [UserIntent, string[]][]) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestIntent;
}

/**
 * LLM 深度意圖識別 + 工具選擇
 */
export async function detectIntentDeep(
  text: string,
  emotion: EmotionResult,
  callLLM: (prompt: string) => Promise<string>
): Promise<{ intent: UserIntent; toolId?: string }> {
  const toolsDesc = buildToolsPrompt();

  const prompt = `你是意圖分析助手。分析用戶訊息，判斷意圖並決定是否需要調用工具。

用戶訊息：「${text}」
檢測到的情緒：${emotion.emotion}（強度 ${emotion.intensity}）

可用工具：
${toolsDesc}

意圖類型：emotional_support, goal_planning, relaxation, casual_chat, self_reflection, knowledge_seeking

返回 JSON（嚴格格式）：
{"intent":"<intent>","toolId":"<tool_id 或 null>"}

規則：
- 用戶焦慮/壓力大 + 強度 > 0.6 → 可推薦 breathing_exercise 或 meditation_recommend
- 用戶問情緒趨勢 → emotion_trend
- 用戶想了解心理知識 → psych_knowledge
- 大多數情況不需要工具，toolId 設為 null`;

  try {
    const raw = await callLLM(prompt);
    const match = raw.match(/\{[^}]+\}/);
    if (!match) return { intent: detectIntent(text, emotion) };

    const parsed = JSON.parse(match[0]);
    return {
      intent: parsed.intent || detectIntent(text, emotion),
      toolId: parsed.toolId === 'null' || !parsed.toolId ? undefined : parsed.toolId,
    };
  } catch {
    return { intent: detectIntent(text, emotion) };
  }
}

/**
 * 生成執行計劃
 */
export function createPlan(ctx: PlanContext): Plan {
  const { userMessage, emotion, emotionSummary } = ctx;
  const intent = detectIntent(userMessage, emotion);
  const steps: AgentStep[] = [];

  steps.push({ type: 'emotion_detect', description: `識別情緒：${emotion.emotion}（${(emotion.confidence * 100).toFixed(0)}%）` });
  steps.push({ type: 'memory_read', description: '讀取用戶歷史記憶' });

  let shouldCallTool = false;
  let suggestedToolId: string | undefined;
  let suggestedToolParams: Record<string, any> = {};
  let replyStrategy = '';

  switch (intent) {
    case 'emotional_support':
      if (emotion.intensity > 0.7 && ['anxious', 'stressed'].includes(emotion.emotion)) {
        shouldCallTool = true;
        suggestedToolId = 'breathing_exercise';
        steps.push({ type: 'tool_call', description: '推薦呼吸練習' });
      }
      replyStrategy = '以共情、陪伴為主。先接住情緒，再輕輕回應。不說教、不催促。';
      break;

    case 'goal_planning':
      replyStrategy = '先簡短接住情緒（若有），再溫和協助拆解目標，給出 3-5 個小步驟。';
      break;

    case 'relaxation':
      shouldCallTool = true;
      suggestedToolId = 'meditation_recommend';
      suggestedToolParams = { emotion: emotion.emotion };
      steps.push({ type: 'tool_call', description: '推薦冥想音頻' });
      replyStrategy = '引導放鬆，推薦合適的練習。';
      break;

    case 'self_reflection':
      replyStrategy = '溫和引導自我覺察，不急於給答案，陪伴用戶慢慢探索。';
      break;

    case 'knowledge_seeking': {
      shouldCallTool = true;
      const topic = emotion.needsSupport ? emotion.emotion : 'general';
      suggestedToolId = 'psych_knowledge';
      suggestedToolParams = { topic };
      steps.push({ type: 'tool_call', description: '提供心理知識' });
      replyStrategy = '分享相關知識，但保持溫和語氣，不要像教科書。';
      break;
    }

    default:
      replyStrategy = '正常對話，保持溫和、自然。';
  }

  if (emotionSummary.some(e => e.trend === 'worsening' && e.count > 5)) {
    replyStrategy += ' 注意：用戶近期某些情緒有加重趨勢，需要更多關注和支持。';
  }

  steps.push({ type: 'llm_generate', description: '生成回覆' });
  steps.push({ type: 'memory_write', description: '更新記憶' });

  return {
    intent,
    steps,
    shouldCallTool,
    suggestedToolId,
    suggestedToolParams,
    replyStrategy,
  };
}

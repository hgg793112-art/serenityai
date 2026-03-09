/**
 * Task Planner — 任务规划器
 *
 * 完整流程：
 * 1. 识别用户意图（emotional_support / goal_planning / relaxation / ...）
 * 2. 根据意图 + 情绪 + 记忆，规划回复策略
 * 3. 决定是否调用工具
 * 4. 生成最终回复的 system prompt 指令
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
  emotional_support: ['难过', '伤心', '哭', '焦虑', '压力', '累', '烦', '崩溃', '受不了', '孤独', '害怕', '不开心', '低落', '沮丧'],
  goal_planning:     ['目标', '计划', '想做', '怎么做', '拆解', '规划', '安排', '打算', '想要', '决定'],
  relaxation:        ['放松', '冥想', '呼吸', '休息', '睡不著', '失眠', '静一静', '安静'],
  casual_chat:       ['聊聊', '你好', '嗨', '在吗', '无聊', '今天', '最近'],
  self_reflection:   ['为什么', '我是不是', '我觉得', '反思', '想想', '回顾', '意义'],
  knowledge_seeking: ['什么是', '怎么办', '方法', '建议', '知识', '科学', '研究'],
};

/**
 * 快速意图识别（规则）
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
 * LLM 深度意图识别 + 工具选择
 */
export async function detectIntentDeep(
  text: string,
  emotion: EmotionResult,
  callLLM: (prompt: string) => Promise<string>
): Promise<{ intent: UserIntent; toolId?: string }> {
  const toolsDesc = buildToolsPrompt();

  const prompt = `你是意图分析助手。分析用户讯息，判断意图并决定是否需要调用工具。

用户讯息：「${text}」
检测到的情绪：${emotion.emotion}（强度 ${emotion.intensity}）

可用工具：
${toolsDesc}

意图类型：emotional_support, goal_planning, relaxation, casual_chat, self_reflection, knowledge_seeking

返回 JSON（严格格式）：
{"intent":"<intent>","toolId":"<tool_id 或 null>"}

规则：
- 用户焦虑/压力大 + 强度 > 0.6 → 可推荐 breathing_exercise 或 meditation_recommend
- 用户问情绪趋势 → emotion_trend
- 用户想了解心理知识 → psych_knowledge
- 大多数情况不需要工具，toolId 设为 null`;

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
 * 生成执行计划
 */
export function createPlan(ctx: PlanContext): Plan {
  const { userMessage, emotion, emotionSummary } = ctx;
  const intent = detectIntent(userMessage, emotion);
  const steps: AgentStep[] = [];

  steps.push({ type: 'emotion_detect', description: `识别情绪：${emotion.emotion}（${(emotion.confidence * 100).toFixed(0)}%）` });
  steps.push({ type: 'memory_read', description: '读取用户历史记忆' });

  let shouldCallTool = false;
  let suggestedToolId: string | undefined;
  let suggestedToolParams: Record<string, any> = {};
  let replyStrategy = '';

  switch (intent) {
    case 'emotional_support':
      if (emotion.intensity > 0.7 && ['anxious', 'stressed'].includes(emotion.emotion)) {
        shouldCallTool = true;
        suggestedToolId = 'breathing_exercise';
        steps.push({ type: 'tool_call', description: '推荐呼吸练习' });
      }
      replyStrategy = '以共情、陪伴为主。先接住情绪，再轻轻回应。不说教、不催促。';
      break;

    case 'goal_planning':
      replyStrategy = '先简短接住情绪（若有），再温和协助拆解目标，给出 3-5 个小步骤。';
      break;

    case 'relaxation':
      shouldCallTool = true;
      suggestedToolId = 'meditation_recommend';
      suggestedToolParams = { emotion: emotion.emotion };
      steps.push({ type: 'tool_call', description: '推荐冥想音频' });
      replyStrategy = '引导放松，推荐合适的练习。';
      break;

    case 'self_reflection':
      replyStrategy = '温和引导自我觉察，不急于给答案，陪伴用户慢慢探索。';
      break;

    case 'knowledge_seeking': {
      shouldCallTool = true;
      const topic = emotion.needsSupport ? emotion.emotion : 'general';
      suggestedToolId = 'psych_knowledge';
      suggestedToolParams = { topic };
      steps.push({ type: 'tool_call', description: '提供心理知识' });
      replyStrategy = '分享相关知识，但保持温和语气，不要像教科书。';
      break;
    }

    default:
      replyStrategy = '正常对话，保持温和、自然。';
  }

  if (emotionSummary.some(e => e.trend === 'worsening' && e.count > 5)) {
    replyStrategy += ' 注意：用户近期某些情绪有加重趋势，需要更多关注和支持。';
  }

  steps.push({ type: 'llm_generate', description: '生成回复' });
  steps.push({ type: 'memory_write', description: '更新记忆' });

  return {
    intent,
    steps,
    shouldCallTool,
    suggestedToolId,
    suggestedToolParams,
    replyStrategy,
  };
}

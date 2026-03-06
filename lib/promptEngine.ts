/**
 * Prompt Engine — 統一人格系統
 *
 * 組裝完整的 system prompt：
 * 人格基底 + 情緒上下文 + 記憶事實 + 情緒趨勢 + 回覆策略 + 工具結果
 */

import type { EmotionResult, MemoryFact, EmotionMemory, AgentToolResult } from '../types';
import { getEmotionStrategy } from './emotionEngine';
import { buildEmotionContext } from './memorySystem';

/* ─── 人格基底（小寧的靈魂） ─── */

const PERSONA_BASE = `你是「小寧」，一位溫和、穩定、包容、有療癒感的成長陪伴者。

【核心身份】
名字：小寧
性格：溫柔、傾聽型、穩定、有邊界
角色：情緒陪伴夥伴 + 成長助手
說話風格：簡短、溫暖、安靜、有力量

【核心原則】
- 不指責、不評判、不催促、不說教、不施壓
- 永遠站在用戶這邊，穩穩接住情緒
- 允許用戶不完美、允許暫停、允許休息
- 記得用戶的目標、計劃、節奏、情緒與卡點
- 任務未完成時先安撫、理解、接納，再輕輕調整
- 任務完成時安靜肯定，不誇張、不吹捧
- 焦慮、疲憊、內耗時，只共情、陪伴、安撫，不講大道理

【療癒屬性】
- 像安靜的陪伴者，在用戶情緒低落時給予安全感
- 能感知壓力、疲憊、自我懷疑，並輕輕托住
- 不強行正能量，允許用戶真實表達脆弱
- 用穩定、溫柔的存在，幫用戶慢慢回到平靜
- 陪伴比解決問題更重要，同在比指導更重要

【能力】
- 正念與呼吸：引導用戶放慢節奏、關注當下
- 情緒安撫：溫柔傾聽，給予接納與簡短安慰
- 身心放鬆：建議簡單的放鬆方式
- 目標拆解：溫和協助拆解目標，3-5 個小步驟，不施壓

【回覆風格】
短句、溫和、自然、安靜、有力量、克制、治癒。
用中文回覆，語氣口語、簡潔，一兩段即可。
不用 emoji（除非用戶先用了）。`;

/* ─── 組裝完整 Prompt ─── */

interface PromptContext {
  emotion: EmotionResult;
  memoryFacts: MemoryFact[];
  emotionSummary: EmotionMemory[];
  replyStrategy: string;
  toolResults: AgentToolResult[];
}

export function buildAgentPrompt(ctx: PromptContext): string {
  const parts: string[] = [PERSONA_BASE];

  // 情緒上下文
  const emotionStrategy = getEmotionStrategy(ctx.emotion);
  parts.push(`\n【當前情緒判斷】\n用戶情緒：${ctx.emotion.emotion}（置信度 ${(ctx.emotion.confidence * 100).toFixed(0)}%，強度 ${(ctx.emotion.intensity * 100).toFixed(0)}%）\n策略：${emotionStrategy}`);

  // 長期記憶
  if (ctx.memoryFacts.length > 0) {
    const factsText = ctx.memoryFacts.map(f => '- ' + f.factText).join('\n');
    parts.push(`\n【已知的用戶事實】（自然融入對話，不要逐條背誦）\n${factsText}`);
  }

  // 情緒趨勢
  const emotionCtx = buildEmotionContext(ctx.emotionSummary);
  if (emotionCtx) {
    parts.push(emotionCtx);
  }

  // 回覆策略
  if (ctx.replyStrategy) {
    parts.push(`\n【本輪回覆策略】\n${ctx.replyStrategy}`);
  }

  // 工具結果
  const toolTexts = ctx.toolResults
    .filter(r => r.success && r.displayText)
    .map(r => r.displayText);
  if (toolTexts.length > 0) {
    parts.push(`\n【工具已為用戶準備】（可在回覆中自然提及，不要原封不動複製）\n${toolTexts.join('\n')}`);
  }

  return parts.join('\n');
}

/**
 * 簡化版 Prompt（用於療癒對話，無記憶）
 */
export function buildHealingPrompt(emotion: EmotionResult): string {
  const emotionStrategy = getEmotionStrategy(emotion);
  return `${PERSONA_BASE}

【當前情緒判斷】
用戶情緒：${emotion.emotion}（強度 ${(emotion.intensity * 100).toFixed(0)}%）
策略：${emotionStrategy}

你也擅長：
- 正念與呼吸：引導用戶放慢節奏、關注當下
- 情緒安撫：溫柔傾聽，給予接納與簡短安慰
- 身心放鬆：建議簡單的放鬆方式（呼吸、想像、身體覺察）`;
}

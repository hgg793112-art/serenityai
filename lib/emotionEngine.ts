/**
 * Emotion Engine — 情緒識別引擎
 *
 * 雙模式：
 * 1. 規則快速判斷（零延遲，用於即時 UI 反饋）
 * 2. LLM 深度判斷（精準，用於記憶寫入和任務規劃）
 */

import type { EmotionType, EmotionResult } from '../types';

const EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  happy:    ['開心', '高興', '快樂', '好棒', '太好了', '哈哈', '嘻嘻', '幸福', '愉快', '美好'],
  excited:  ['興奮', '激動', '太棒了', '超讚', '期待', '好期待', '迫不及待'],
  calm:     ['平靜', '安靜', '放鬆', '舒服', '還好', '不錯', '挺好'],
  grateful: ['感謝', '謝謝', '感恩', '感激', '幸好', '多虧'],
  sad:      ['難過', '傷心', '哭', '眼淚', '心痛', '失落', '沮喪', '低落', '不開心'],
  anxious:  ['焦慮', '擔心', '害怕', '緊張', '不安', '恐懼', '慌', '怕'],
  stressed: ['壓力', '壓力大', '累', '好累', '疲憊', '撐不住', '喘不過氣', '崩潰', '受不了'],
  angry:    ['生氣', '憤怒', '煩', '煩死了', '討厭', '氣死', '火大', '不爽'],
  lonely:   ['孤獨', '寂寞', '一個人', '沒人', '孤單', '被忽略', '沒人理'],
  tired:    ['疲倦', '困', '好睏', '沒力氣', '無力', '沒精神', '懶'],
  confused: ['迷茫', '困惑', '不知道', '不確定', '猶豫', '糾結', '搞不懂'],
  neutral:  [],
};

const NEEDS_SUPPORT: Set<EmotionType> = new Set([
  'sad', 'anxious', 'stressed', 'angry', 'lonely', 'tired', 'confused',
]);

/**
 * 規則快速判斷（< 1ms，無 API 調用）
 * 適合即時 UI 反饋、loading 期間先顯示
 */
export function detectEmotionFast(text: string): EmotionResult {
  const lower = text.toLowerCase();
  let best: EmotionType = 'neutral';
  let bestScore = 0;

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS) as [EmotionType, string[]][]) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = emotion;
    }
  }

  const confidence = bestScore === 0 ? 0.3 : Math.min(0.6 + bestScore * 0.1, 0.85);
  const intensity = Math.min(bestScore * 0.25, 1);

  return {
    emotion: best,
    confidence,
    intensity,
    needsSupport: NEEDS_SUPPORT.has(best),
  };
}

/**
 * LLM 深度情緒判斷（精準，需要 API 調用）
 * 返回結構化情緒結果
 */
export async function detectEmotionDeep(
  text: string,
  callLLM: (prompt: string) => Promise<string>
): Promise<EmotionResult> {
  const prompt = `你是情緒分析專家。分析以下文本的情緒狀態，只返回 JSON，不要其他文字。

文本：「${text}」

返回格式（嚴格 JSON）：
{"emotion":"<emotion>","confidence":<0-1>,"intensity":<0-1>}

emotion 必須是以下之一：happy, excited, calm, grateful, sad, anxious, stressed, angry, lonely, tired, confused, neutral
confidence 是判斷的置信度（0-1）
intensity 是情緒的強度（0-1）`;

  try {
    const raw = await callLLM(prompt);
    const jsonMatch = raw.match(/\{[^}]+\}/);
    if (!jsonMatch) return detectEmotionFast(text);

    const parsed = JSON.parse(jsonMatch[0]);
    const emotion = (parsed.emotion as EmotionType) || 'neutral';
    const confidence = Math.max(0, Math.min(1, parsed.confidence ?? 0.5));
    const intensity = Math.max(0, Math.min(1, parsed.intensity ?? 0.5));

    return {
      emotion,
      confidence,
      intensity,
      needsSupport: NEEDS_SUPPORT.has(emotion),
    };
  } catch {
    return detectEmotionFast(text);
  }
}

/**
 * 根據情緒結果生成回覆策略提示
 */
export function getEmotionStrategy(result: EmotionResult): string {
  const { emotion, intensity } = result;

  const strategies: Record<string, string> = {
    sad:      intensity > 0.7 ? '用戶情緒低落且強烈，需要溫柔接住、陪伴、不要急著給建議。' : '用戶有些難過，輕輕安撫即可。',
    anxious:  intensity > 0.7 ? '用戶非常焦慮，先幫助穩定情緒，可以引導呼吸練習。' : '用戶有些擔心，給予安心和支持。',
    stressed: intensity > 0.7 ? '用戶壓力很大，先共情接納，不要催促或加壓。可建議放鬆練習。' : '用戶感到有壓力，溫和理解即可。',
    angry:    '用戶在生氣，先接納情緒、不評判，等情緒緩和再溝通。',
    lonely:   '用戶感到孤獨，強調「我在這裡」的陪伴感。',
    tired:    '用戶很疲憊，允許休息，不要催促任何事。',
    confused: '用戶感到迷茫，可以溫和地幫助梳理，但不要急。',
    happy:    '用戶心情好，可以一起分享喜悅，安靜肯定。',
    excited:  '用戶很興奮，一起開心，適度回應。',
    calm:     '用戶狀態平穩，正常對話即可。',
    grateful: '用戶表達感謝，溫暖回應。',
    neutral:  '正常對話，保持溫和。',
  };

  return strategies[emotion] || strategies.neutral;
}

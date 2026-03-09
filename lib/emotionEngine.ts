/**
 * Emotion Engine — 情绪识别引擎
 *
 * 双模式：
 * 1. 规则快速判断（零延迟，用于即时 UI 反馈）
 * 2. LLM 深度判断（精准，用于记忆写入和任务规划）
 */

import type { EmotionType, EmotionResult } from '../types';

const EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  happy:    ['开心', '高兴', '快乐', '好棒', '太好了', '哈哈', '嘻嘻', '幸福', '愉快', '美好'],
  excited:  ['兴奋', '激动', '太棒了', '超赞', '期待', '好期待', '迫不及待'],
  calm:     ['平静', '安静', '放松', '舒服', '还好', '不错', '挺好'],
  grateful: ['感谢', '谢谢', '感恩', '感激', '幸好', '多亏'],
  sad:      ['难过', '伤心', '哭', '眼泪', '心痛', '失落', '沮丧', '低落', '不开心'],
  anxious:  ['焦虑', '担心', '害怕', '紧张', '不安', '恐惧', '慌', '怕'],
  stressed: ['压力', '压力大', '累', '好累', '疲惫', '撑不住', '喘不过气', '崩溃', '受不了'],
  angry:    ['生气', '愤怒', '烦', '烦死了', '讨厌', '气死', '火大', '不爽'],
  lonely:   ['孤独', '寂寞', '一个人', '没人', '孤单', '被忽略', '没人理'],
  tired:    ['疲倦', '困', '好困', '没力气', '无力', '没精神', '懒'],
  confused: ['迷茫', '困惑', '不知道', '不确定', '犹豫', '纠结', '搞不懂'],
  neutral:  [],
};

const NEEDS_SUPPORT: Set<EmotionType> = new Set([
  'sad', 'anxious', 'stressed', 'angry', 'lonely', 'tired', 'confused',
]);

/**
 * 规则快速判断（< 1ms，无 API 调用）
 * 适合即时 UI 反馈、loading 期间先显示
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
 * LLM 深度情绪判断（精准，需要 API 调用）
 * 返回结构化情绪结果
 */
export async function detectEmotionDeep(
  text: string,
  callLLM: (prompt: string) => Promise<string>
): Promise<EmotionResult> {
  const prompt = `你是情绪分析专家。分析以下文本的情绪状态，只返回 JSON，不要其他文字。

文本：「${text}」

返回格式（严格 JSON）：
{"emotion":"<emotion>","confidence":<0-1>,"intensity":<0-1>}

emotion 必须是以下之一：happy, excited, calm, grateful, sad, anxious, stressed, angry, lonely, tired, confused, neutral
confidence 是判断的置信度（0-1）
intensity 是情绪的强度（0-1）`;

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
 * 根据情绪结果生成回复策略提示
 */
export function getEmotionStrategy(result: EmotionResult): string {
  const { emotion, intensity } = result;

  const strategies: Record<string, string> = {
    sad:      intensity > 0.7 ? '用户情绪低落且强烈，需要温柔接住、陪伴、不要急著给建议。' : '用户有些难过，轻轻安抚即可。',
    anxious:  intensity > 0.7 ? '用户非常焦虑，先帮助稳定情绪，可以引导呼吸练习。' : '用户有些担心，给予安心和支持。',
    stressed: intensity > 0.7 ? '用户压力很大，先共情接纳，不要催促或加压。可建议放松练习。' : '用户感到有压力，温和理解即可。',
    angry:    '用户在生气，先接纳情绪、不评判，等情绪缓和再沟通。',
    lonely:   '用户感到孤独，强调「我在这里」的陪伴感。',
    tired:    '用户很疲惫，允许休息，不要催促任何事。',
    confused: '用户感到迷茫，可以温和地帮助梳理，但不要急。',
    happy:    '用户心情好，可以一起分享喜悦，安静肯定。',
    excited:  '用户很兴奋，一起开心，适度回应。',
    calm:     '用户状态平稳，正常对话即可。',
    grateful: '用户表达感谢，温暖回应。',
    neutral:  '正常对话，保持温和。',
  };

  return strategies[emotion] || strategies.neutral;
}

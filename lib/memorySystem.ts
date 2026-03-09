/**
 * Memory System — 三层记忆架构
 *
 * Short Memory:  最近 N 轮对话（已有，由 chatService 管理）
 * Long Memory:   用户事实、偏好、故事（由 LLM 自动抽取）
 * Emotion Memory: 情绪历史统计（趋势、频率）
 */

import { supabase, isSupabaseEnabled } from './supabase';
import type { EmotionType, EmotionMemory, EmotionRecord, MemoryFact } from '../types';

const EMOTION_STORAGE_KEY = 'serenity_emotion_records';
const PROFILE_STORAGE_KEY = 'serenity_user_profile';

/* ─── Emotion Memory ─── */

export async function addEmotionRecord(
  userId: string,
  emotion: EmotionType,
  confidence: number,
  intensity: number,
  source: string
): Promise<void> {
  const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);
  const record: EmotionRecord = { id, userId, emotion, confidence, intensity, source, createdAt: Date.now() };

  if (isSupabaseEnabled() && supabase) {
    try {
      await supabase.from('emotion_records').insert({
        id, user_id: userId, emotion, confidence, intensity, source,
      });
    } catch { /* ignore */ }
  }

  const key = EMOTION_STORAGE_KEY + '_' + userId;
  const raw = localStorage.getItem(key);
  const arr: EmotionRecord[] = raw ? JSON.parse(raw) : [];
  arr.push(record);
  localStorage.setItem(key, JSON.stringify(arr.slice(-200)));
}

export async function getEmotionRecords(userId: string, limit = 50): Promise<EmotionRecord[]> {
  if (isSupabaseEnabled() && supabase) {
    const { data } = await supabase
      .from('emotion_records')
      .select('id, user_id, emotion, confidence, intensity, source, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (data) {
      return data.map((r: any) => ({
        id: r.id, userId: r.user_id, emotion: r.emotion,
        confidence: r.confidence, intensity: r.intensity,
        source: r.source, createdAt: new Date(r.created_at).getTime(),
      }));
    }
  }
  const raw = localStorage.getItem(EMOTION_STORAGE_KEY + '_' + userId);
  if (!raw) return [];
  return (JSON.parse(raw) as EmotionRecord[]).slice(-limit).reverse();
}

/**
 * 计算情绪趋势摘要
 */
export async function getEmotionSummary(userId: string): Promise<EmotionMemory[]> {
  const records = await getEmotionRecords(userId, 100);
  if (records.length === 0) return [];

  const grouped: Record<string, EmotionRecord[]> = {};
  for (const r of records) {
    (grouped[r.emotion] ??= []).push(r);
  }

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  return Object.entries(grouped).map(([emotion, recs]) => {
    const recentCount = recs.filter(r => r.createdAt > weekAgo).length;
    const olderCount = recs.filter(r => r.createdAt <= weekAgo).length;
    const trend: EmotionMemory['trend'] =
      recentCount > olderCount * 1.3 ? 'worsening' :
      recentCount < olderCount * 0.7 ? 'improving' : 'stable';

    return {
      emotion: emotion as EmotionType,
      count: recs.length,
      lastSeen: Math.max(...recs.map(r => r.createdAt)),
      trend,
    };
  }).sort((a, b) => b.count - a.count);
}

/* ─── Long Memory: LLM 自动抽取 ─── */

/**
 * 从 AI 回复中抽取值得记住的用户事实
 * 由 Agent Core 在每轮对话后调用
 */
export async function extractAndSaveMemory(
  userId: string,
  userMessage: string,
  existingFacts: MemoryFact[],
  callLLM: (prompt: string) => Promise<string>,
  saveFact: (userId: string, factText: string) => Promise<void>
): Promise<string[]> {
  const existingTexts = existingFacts.map(f => f.factText).join('\n');

  const prompt = `你是记忆抽取助手。从用户的最新讯息中，抽取值得长期记住的事实。

已知事实：
${existingTexts || '（暂无）'}

用户最新讯息：「${userMessage}」

规则：
- 只抽取具体的、有长期价值的事实（如：名字、职业、目标、重要事件、偏好）
- 不要重复已知事实
- 如果没有新事实，返回空阵列
- 返回 JSON 阵列，每项是一句话事实

返回格式（严格 JSON）：
["事实1", "事实2"]
如果没有新事实：[]`;

  try {
    const raw = await callLLM(prompt);
    const match = raw.match(/\[[\s\S]*?\]/);
    if (!match) return [];

    const facts: string[] = JSON.parse(match[0]);
    const newFacts: string[] = [];

    for (const fact of facts) {
      if (fact && fact.length > 2 && fact.length < 100) {
        await saveFact(userId, fact);
        newFacts.push(fact);
      }
    }
    return newFacts;
  } catch {
    return [];
  }
}

/* ─── 情绪趋势文字描述（注入 Prompt） ─── */

export function buildEmotionContext(summary: EmotionMemory[]): string {
  if (summary.length === 0) return '';

  const top3 = summary.slice(0, 3);
  const labels: Record<string, string> = {
    happy: '开心', excited: '兴奋', calm: '平静', grateful: '感恩',
    sad: '难过', anxious: '焦虑', stressed: '压力大', angry: '生气',
    lonely: '孤独', tired: '疲惫', confused: '迷茫', neutral: '平稳',
  };
  const trendLabels: Record<string, string> = {
    improving: '正在好转', stable: '持续', worsening: '有加重趋势',
  };

  const lines = top3.map(e =>
    `- ${labels[e.emotion] || e.emotion}（出现 ${e.count} 次，${trendLabels[e.trend]}）`
  );

  return '\n用户近期情绪趋势：\n' + lines.join('\n');
}

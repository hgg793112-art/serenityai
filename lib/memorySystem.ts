/**
 * Memory System — 三層記憶架構
 *
 * Short Memory:  最近 N 輪對話（已有，由 chatService 管理）
 * Long Memory:   用戶事實、偏好、故事（由 LLM 自動抽取）
 * Emotion Memory: 情緒歷史統計（趨勢、頻率）
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
    await supabase.from('emotion_records').insert({
      id, user_id: userId, emotion, confidence, intensity, source,
    }).catch(() => {});
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
 * 計算情緒趨勢摘要
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

/* ─── Long Memory: LLM 自動抽取 ─── */

/**
 * 從 AI 回覆中抽取值得記住的用戶事實
 * 由 Agent Core 在每輪對話後調用
 */
export async function extractAndSaveMemory(
  userId: string,
  userMessage: string,
  existingFacts: MemoryFact[],
  callLLM: (prompt: string) => Promise<string>,
  saveFact: (userId: string, factText: string) => Promise<void>
): Promise<string[]> {
  const existingTexts = existingFacts.map(f => f.factText).join('\n');

  const prompt = `你是記憶抽取助手。從用戶的最新訊息中，抽取值得長期記住的事實。

已知事實：
${existingTexts || '（暫無）'}

用戶最新訊息：「${userMessage}」

規則：
- 只抽取具體的、有長期價值的事實（如：名字、職業、目標、重要事件、偏好）
- 不要重複已知事實
- 如果沒有新事實，返回空陣列
- 返回 JSON 陣列，每項是一句話事實

返回格式（嚴格 JSON）：
["事實1", "事實2"]
如果沒有新事實：[]`;

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

/* ─── 情緒趨勢文字描述（注入 Prompt） ─── */

export function buildEmotionContext(summary: EmotionMemory[]): string {
  if (summary.length === 0) return '';

  const top3 = summary.slice(0, 3);
  const labels: Record<string, string> = {
    happy: '開心', excited: '興奮', calm: '平靜', grateful: '感恩',
    sad: '難過', anxious: '焦慮', stressed: '壓力大', angry: '生氣',
    lonely: '孤獨', tired: '疲憊', confused: '迷茫', neutral: '平穩',
  };
  const trendLabels: Record<string, string> = {
    improving: '正在好轉', stable: '持續', worsening: '有加重趨勢',
  };

  const lines = top3.map(e =>
    `- ${labels[e.emotion] || e.emotion}（出現 ${e.count} 次，${trendLabels[e.trend]}）`
  );

  return '\n用戶近期情緒趨勢：\n' + lines.join('\n');
}

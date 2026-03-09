/**
 * Wellness Engine — 三维度压力计算引擎
 *
 * 维度 1: 对话情绪 (47%) — emotion_records
 * 维度 2: 行为习惯 (20%) — dailyChat / dailyRelax / streak
 * 维度 3: 自评压力 (33%) — moodLogs
 *
 * 健康数据维度暂时权重为 0（未接入真实数据接口），
 * 待接入 Health Connect / HealthKit 后再启用。
 *
 * 输出 0–100 的 wellnessScore（越高越好）
 */

import type { MoodLogEntry, HealthMetric, EmotionRecord, EmotionType } from '../types';

/* ─── 公开型别 ─── */

export interface WellnessInput {
  moodLogs: MoodLogEntry[];
  emotionRecords: EmotionRecord[];
  healthData: HealthMetric[];
  dailyChatDone: boolean;
  dailyRelaxDone: boolean;
  streak: number;
}

export interface WellnessResult {
  score: number;
  dimensions: {
    emotion: number;
    health: number;
    behavior: number;
    selfReport: number;
  };
  trend: 'improving' | 'stable' | 'worsening';
  suggestion?: string;
}

/* ─── 权重配置 ─── */
// 健康数据暂未接入真实接口，权重为 0；原 25% 按比例分配给其他三维度
// 原比例 emotion:behavior:self = 35:15:25 → 归一化后 ≈ 47:20:33

const W_EMOTION = 0.47;
const W_HEALTH = 0;
const W_BEHAVIOR = 0.20;
const W_SELF = 0.33;

/* ─── 情绪分数映射 ─── */

const EMOTION_SCORES: Record<EmotionType, number> = {
  happy: 90,
  excited: 85,
  calm: 80,
  grateful: 90,
  neutral: 60,
  confused: 45,
  tired: 40,
  lonely: 35,
  sad: 25,
  anxious: 20,
  stressed: 15,
  angry: 10,
};

/* ─── 维度 1：对话情绪分 ─── */

function calcEmotionScore(records: EmotionRecord[]): number {
  if (records.length === 0) return 60;

  const recent = records.slice(0, 10);
  let totalWeight = 0;
  let weightedSum = 0;

  for (let i = 0; i < recent.length; i++) {
    const r = recent[i];
    const base = EMOTION_SCORES[r.emotion] ?? 50;
    const intensityFactor = 0.5 + r.intensity * 0.5;
    const confidenceFactor = 0.5 + r.confidence * 0.5;
    const recencyWeight = 1 - i * 0.08;

    const weight = intensityFactor * confidenceFactor * recencyWeight;
    weightedSum += base * weight;
    totalWeight += weight;
  }

  const raw = totalWeight > 0 ? weightedSum / totalWeight : 60;

  // 趋势加成：比较前 5 笔和后 5 笔
  if (recent.length >= 6) {
    const newer = recent.slice(0, Math.floor(recent.length / 2));
    const older = recent.slice(Math.floor(recent.length / 2));
    const newerAvg = newer.reduce((s, r) => s + (EMOTION_SCORES[r.emotion] ?? 50), 0) / newer.length;
    const olderAvg = older.reduce((s, r) => s + (EMOTION_SCORES[r.emotion] ?? 50), 0) / older.length;
    const diff = newerAvg - olderAvg;
    return clamp(raw + diff * 0.15, 0, 100);
  }

  return clamp(raw, 0, 100);
}

/* ─── 维度 2：健康数据分 ─── */

function calcHealthScore(data: HealthMetric[]): number {
  if (data.length === 0) return 65;

  const latest = data[data.length - 1];
  let score = 0;

  // 心率：60–80 最佳，偏离扣分
  const hr = latest.heartRate;
  if (hr >= 55 && hr <= 85) {
    score += 33;
  } else if (hr > 85 && hr <= 100) {
    score += 33 - (hr - 85) * 1.5;
  } else if (hr > 100) {
    score += Math.max(0, 33 - (hr - 85) * 2);
  } else {
    score += 33 - (55 - hr) * 1.5;
  }

  // 步数：8000+ 满分，3000 以下低分
  const steps = latest.steps;
  if (steps >= 8000) {
    score += 33;
  } else if (steps >= 3000) {
    score += 10 + (steps - 3000) * (23 / 5000);
  } else {
    score += Math.max(0, steps / 300);
  }

  // 睡眠：7–9h 最佳
  const sleep = latest.sleepHours;
  if (sleep >= 7 && sleep <= 9) {
    score += 34;
  } else if (sleep >= 6 && sleep < 7) {
    score += 20;
  } else if (sleep > 9 && sleep <= 10) {
    score += 25;
  } else {
    score += Math.max(0, 10 - Math.abs(sleep - 8) * 3);
  }

  return clamp(Math.round(score), 0, 100);
}

/* ─── 维度 3：行为习惯分 ─── */

function calcBehaviorScore(chatDone: boolean, relaxDone: boolean, streak: number): number {
  let score = 0;
  if (chatDone) score += 40;
  if (relaxDone) score += 40;
  score += Math.min(20, streak * 4);
  return clamp(score, 0, 100);
}

/* ─── 维度 4：自评压力分 ─── */

function calcSelfReportScore(moodLogs: MoodLogEntry[]): number {
  if (moodLogs.length === 0) return 75;
  const recent = moodLogs.slice(0, 5);
  const avgStress = recent.reduce((s, l) => s + l.stressLevel, 0) / recent.length;
  return clamp(Math.round(100 - avgStress), 0, 100);
}

/* ─── 趋势判断 ─── */

function detectTrend(records: EmotionRecord[]): WellnessResult['trend'] {
  if (records.length < 4) return 'stable';

  const half = Math.floor(records.length / 2);
  const newer = records.slice(0, half);
  const older = records.slice(half);

  const avg = (arr: EmotionRecord[]) =>
    arr.reduce((s, r) => s + (EMOTION_SCORES[r.emotion] ?? 50), 0) / arr.length;

  const diff = avg(newer) - avg(older);
  if (diff > 8) return 'improving';
  if (diff < -8) return 'worsening';
  return 'stable';
}

/* ─── 建议生成 ─── */

function generateSuggestion(dims: WellnessResult['dimensions']): string | undefined {
  const activeDims = Object.entries(dims).filter(([k]) => k !== 'health');
  const weakest = activeDims.sort((a, b) => a[1] - b[1])[0];
  if (!weakest) return undefined;

  switch (weakest[0]) {
    case 'emotion':
      if (weakest[1] < 40) return '近期情绪波动较大，试试和小宁聊聊心事吧';
      break;
    case 'behavior':
      if (weakest[1] < 40) return '今天还没做放松练习呢，给自己几分钟吧';
      break;
    case 'selfReport':
      if (weakest[1] < 40) return '记录的压力有些高，深呼吸，慢慢来';
      break;
  }
  return undefined;
}

/* ─── 主函数 ─── */

export function computeWellnessScore(input: WellnessInput): WellnessResult {
  const emotion = calcEmotionScore(input.emotionRecords);
  const health = calcHealthScore(input.healthData);
  const behavior = calcBehaviorScore(input.dailyChatDone, input.dailyRelaxDone, input.streak);
  const selfReport = calcSelfReportScore(input.moodLogs);

  const score = clamp(
    Math.round(
      emotion * W_EMOTION +
      health * W_HEALTH +
      behavior * W_BEHAVIOR +
      selfReport * W_SELF
    ),
    0, 100
  );

  const dimensions = { emotion, health, behavior, selfReport };
  const trend = detectTrend(input.emotionRecords);
  const suggestion = generateSuggestion(dimensions);

  return { score, dimensions, trend, suggestion };
}

/* ─── 工具 ─── */

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

import { MoodLogEntry } from '../types';

function toDateKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/**
 * 從今天起算，連續幾天有心情記錄（至少一天一筆）。
 */
export function getConsecutiveDays(moodLogs: MoodLogEntry[]): number {
  if (moodLogs.length === 0) return 0;
  const today = toDateKey(Date.now());
  const sorted = [...new Set(moodLogs.map(l => toDateKey(l.timestamp)))].sort().reverse();
  if (sorted[0] !== today) return 0;
  let count = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]).getTime();
    const curr = new Date(sorted[i]).getTime();
    const diffDays = (prev - curr) / 86400000;
    if (diffDays === 1) count++;
    else break;
  }
  return count;
}

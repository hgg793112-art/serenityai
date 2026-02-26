import { Health } from '@capgo/capacitor-health';
import { HealthMetric } from '../types';

export async function initHealth(): Promise<boolean> {
  try {
    const { available } = await Health.isAvailable();
    if (!available) return false;
    await Health.requestAuthorization({ read: ['heartRate'], write: [] });
    return true;
  } catch {
    return false;
  }
}

export async function fetchHeartRateData(days = 7): Promise<{ timestamp: number; heartRate: number }[]> {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const { samples } = await Health.queryAggregated({
    dataType: 'heartRate',
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    bucket: 'day',
    aggregation: 'average',
  });

  return samples.map(s => ({
    timestamp: new Date(s.startDate).getTime(),
    heartRate: Math.round(s.value),
  }));
}

export function generateMockData(): HealthMetric[] {
  return Array.from({ length: 7 }).map((_, i) => ({
    timestamp: Date.now() - (6 - i) * 24 * 60 * 60 * 1000,
    heartRate: 65 + Math.floor(Math.random() * 20),
    steps: 4000 + Math.floor(Math.random() * 8000),
    sleepHours: 5 + Math.random() * 4,
  }));
}

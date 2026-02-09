
export enum Mood {
  EXCITED = 'EXCITED',
  HAPPY = 'HAPPY',
  CALM = 'CALM',
  TIRED = 'TIRED',
  SAD = 'SAD',
  ANXIOUS = 'ANXIOUS',
  STRESSED = 'STRESSED'
}

export interface MoodLogEntry {
  id: string;
  timestamp: number;
  mood: Mood;
  note?: string;
  stressLevel: number; // 0-100
}

export interface HealthMetric {
  timestamp: number;
  heartRate: number;
  steps: number;
  sleepHours: number;
}

export interface AIInsight {
  title: string;
  description: string;
  type: 'advice' | 'warning' | 'positive';
}

export interface RelaxationExercise {
  id: string;
  title: string;
  duration: string;
  category: 'Breathing' | 'Meditation' | 'Muscle';
  icon: string;
  color: string;
  audioUrl?: string;
}

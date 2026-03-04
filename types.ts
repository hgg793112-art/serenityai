
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

/** 對話記憶：單條訊息 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

/** 長期記憶：關於用戶的一句話事實 */
export interface MemoryFact {
  id: string;
  factText: string;
  createdAt: number;
}

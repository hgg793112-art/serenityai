
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

/* ─── AI Agent 架構擴展類型 ─── */

/** 情緒類型（細粒度） */
export type EmotionType =
  | 'happy' | 'excited' | 'calm' | 'grateful'
  | 'sad' | 'anxious' | 'stressed' | 'angry'
  | 'lonely' | 'tired' | 'confused' | 'neutral';

/** 情緒識別結果 */
export interface EmotionResult {
  emotion: EmotionType;
  confidence: number;
  intensity: number;
  needsSupport: boolean;
}

/** 情緒記錄（持久化） */
export interface EmotionRecord {
  id: string;
  userId: string;
  emotion: EmotionType;
  confidence: number;
  intensity: number;
  source: string;
  createdAt: number;
}

/** 記憶類型 */
export type MemoryType = 'short' | 'long' | 'emotion';

/** 情緒記憶 */
export interface EmotionMemory {
  emotion: EmotionType;
  count: number;
  lastSeen: number;
  trend: 'improving' | 'stable' | 'worsening';
}

/** 用戶畫像 */
export interface UserProfile {
  userId: string;
  emotionHistory: EmotionMemory[];
  recentTopics: string[];
  preferences: Record<string, string>;
  lastActive: number;
}

/** Agent 意圖識別 */
export type UserIntent =
  | 'emotional_support'
  | 'goal_planning'
  | 'relaxation'
  | 'casual_chat'
  | 'self_reflection'
  | 'knowledge_seeking';

/** Agent 工具定義 */
export interface AgentTool {
  id: string;
  name: string;
  description: string;
  execute: (params: Record<string, any>) => Promise<AgentToolResult>;
}

/** 工具執行結果 */
export interface AgentToolResult {
  success: boolean;
  data?: any;
  displayText?: string;
  action?: 'navigate' | 'show_card' | 'play_audio' | 'none';
  actionPayload?: Record<string, any>;
}

/** Agent 任務步驟 */
export interface AgentStep {
  type: 'emotion_detect' | 'memory_read' | 'memory_write' | 'tool_call' | 'llm_generate' | 'plan';
  description: string;
  result?: any;
}

/** Agent 完整回覆 */
export interface AgentResponse {
  reply: string;
  emotion: EmotionResult;
  steps: AgentStep[];
  toolResults: AgentToolResult[];
  memoryUpdated: boolean;
}

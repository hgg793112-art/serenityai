
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
  durationMinutes: number; // 用於定時關閉
  category: 'Breathing' | 'Meditation' | 'Muscle';
  icon: string;
  color: string;
  audioUrl?: string;
}

/** 对话记忆：单条讯息 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

/** 长期记忆：关于用户的一句话事实 */
export interface MemoryFact {
  id: string;
  factText: string;
  createdAt: number;
}

/* ─── AI Agent 架构扩展类型 ─── */

/** 情绪类型（细粒度） */
export type EmotionType =
  | 'happy' | 'excited' | 'calm' | 'grateful'
  | 'sad' | 'anxious' | 'stressed' | 'angry'
  | 'lonely' | 'tired' | 'confused' | 'neutral';

/** 情绪识别结果 */
export interface EmotionResult {
  emotion: EmotionType;
  confidence: number;
  intensity: number;
  needsSupport: boolean;
}

/** 情绪记录（持久化） */
export interface EmotionRecord {
  id: string;
  userId: string;
  emotion: EmotionType;
  confidence: number;
  intensity: number;
  source: string;
  createdAt: number;
}

/** 记忆类型 */
export type MemoryType = 'short' | 'long' | 'emotion';

/** 情绪记忆 */
export interface EmotionMemory {
  emotion: EmotionType;
  count: number;
  lastSeen: number;
  trend: 'improving' | 'stable' | 'worsening';
}

/** 用户画像 */
export interface UserProfile {
  userId: string;
  emotionHistory: EmotionMemory[];
  recentTopics: string[];
  preferences: Record<string, string>;
  lastActive: number;
}

/** Agent 意图识别 */
export type UserIntent =
  | 'emotional_support'
  | 'goal_planning'
  | 'relaxation'
  | 'casual_chat'
  | 'self_reflection'
  | 'knowledge_seeking';

/** Agent 工具定义 */
export interface AgentTool {
  id: string;
  name: string;
  description: string;
  execute: (params: Record<string, any>) => Promise<AgentToolResult>;
}

/** 工具执行结果 */
export interface AgentToolResult {
  success: boolean;
  data?: any;
  displayText?: string;
  action?: 'navigate' | 'show_card' | 'play_audio' | 'none';
  actionPayload?: Record<string, any>;
}

/** Agent 任务步骤 */
export interface AgentStep {
  type: 'emotion_detect' | 'memory_read' | 'memory_write' | 'tool_call' | 'llm_generate' | 'plan';
  description: string;
  result?: any;
}

/** Agent 完整回复 */
export interface AgentResponse {
  reply: string;
  emotion: EmotionResult;
  steps: AgentStep[];
  toolResults: AgentToolResult[];
  memoryUpdated: boolean;
}

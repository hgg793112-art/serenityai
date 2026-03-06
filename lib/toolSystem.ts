/**
 * Tool System — Agent 工具系統
 *
 * 註冊可供 AI 調用的工具，Agent 根據用戶意圖自動選擇。
 * 工具返回結構化結果，前端根據 action 類型渲染 UI。
 */

import type { AgentTool, AgentToolResult, EmotionType } from '../types';
import { EXERCISES } from '../constants';

/* ─── 工具：呼吸練習 ─── */
const breathingTool: AgentTool = {
  id: 'breathing_exercise',
  name: '呼吸練習',
  description: '引導用戶進行深腹式呼吸，緩解焦慮和壓力',
  execute: async () => ({
    success: true,
    displayText: '🌬️ 來做一個深腹式呼吸吧：\n\n吸氣 4 秒 → 屏住 4 秒 → 呼氣 6 秒\n\n重複 3 次，感受身體慢慢放鬆。',
    action: 'show_card' as const,
    actionPayload: {
      type: 'breathing',
      title: '深腹式呼吸',
      duration: '3 分鐘',
      steps: ['吸氣 4 秒', '屏住 4 秒', '呼氣 6 秒'],
      audioUrl: '/audio/breathing-guide.mp3',
    },
  }),
};

/* ─── 工具：冥想推薦 ─── */
const meditationTool: AgentTool = {
  id: 'meditation_recommend',
  name: '冥想推薦',
  description: '根據用戶情緒推薦合適的冥想音頻',
  execute: async (params) => {
    const emotion = (params.emotion as EmotionType) || 'stressed';
    const meditations = EXERCISES.filter(e => e.category === 'Meditation');

    const recommendations: Record<string, string[]> = {
      anxious:  ['海浪療癒', '冥想頌缽'],
      stressed: ['夏日蟲鳴', '海浪療癒'],
      sad:      ['秋葉沙沙', '夏日細雨'],
      lonely:   ['夏日蟲鳴', '冥想頌缽'],
      tired:    ['秋葉沙沙', '夏日細雨'],
    };

    const preferred = recommendations[emotion] || ['海浪療癒'];
    const pick = meditations.find(m => preferred.includes(m.title)) || meditations[0];

    return {
      success: true,
      displayText: `🧘 推薦你聽「${pick.title}」（${pick.duration}），讓自己慢慢沉靜下來。`,
      action: 'play_audio' as const,
      actionPayload: {
        exerciseId: pick.id,
        title: pick.title,
        duration: pick.duration,
        audioUrl: pick.audioUrl,
      },
    };
  },
};

/* ─── 工具：情緒日記 ─── */
const emotionDiaryTool: AgentTool = {
  id: 'emotion_diary',
  name: '情緒日記',
  description: '幫助用戶記錄當下的情緒狀態',
  execute: async (params) => {
    const emotion = params.emotion as string || '未知';
    const note = params.note as string || '';

    return {
      success: true,
      displayText: `📝 已幫你記錄今天的情緒：${emotion}${note ? `\n備註：${note}` : ''}\n\n持續記錄可以幫助你更了解自己的情緒模式。`,
      action: 'none' as const,
      data: { emotion, note, timestamp: Date.now() },
    };
  },
};

/* ─── 工具：情緒趨勢查詢 ─── */
const emotionTrendTool: AgentTool = {
  id: 'emotion_trend',
  name: '情緒趨勢',
  description: '查看用戶近期的情緒變化趨勢',
  execute: async (params) => {
    const summary = params.emotionSummary as any[] || [];
    if (summary.length === 0) {
      return {
        success: true,
        displayText: '目前還沒有足夠的情緒記錄來分析趨勢。多和我聊聊，我會幫你追蹤的。',
        action: 'none' as const,
      };
    }

    const labels: Record<string, string> = {
      happy: '開心', excited: '興奮', calm: '平靜', grateful: '感恩',
      sad: '難過', anxious: '焦慮', stressed: '壓力大', angry: '生氣',
      lonely: '孤獨', tired: '疲憊', confused: '迷茫', neutral: '平穩',
    };

    const lines = summary.slice(0, 3).map((e: any) => {
      const trendText = e.trend === 'improving' ? '↗ 好轉中' : e.trend === 'worsening' ? '↘ 需關注' : '→ 穩定';
      return `${labels[e.emotion] || e.emotion}：${e.count} 次 ${trendText}`;
    });

    return {
      success: true,
      displayText: `📊 你近期的情緒趨勢：\n\n${lines.join('\n')}\n\n我會一直陪著你。`,
      action: 'show_card' as const,
      actionPayload: { type: 'emotion_trend', data: summary },
    };
  },
};

/* ─── 工具：心理知識 ─── */
const knowledgeTool: AgentTool = {
  id: 'psych_knowledge',
  name: '心理知識',
  description: '提供簡單的心理健康小知識',
  execute: async (params) => {
    const topic = (params.topic as string) || 'general';

    const knowledge: Record<string, string> = {
      anxiety: '💡 焦慮其實是身體的保護機制。當焦慮來臨時，試著告訴自己：「這只是身體在提醒我注意。」深呼吸可以啟動副交感神經，幫助身體從「戰鬥模式」回到「休息模式」。',
      stress: '💡 適度的壓力可以提升表現，但長期壓力會消耗身心。試試「20-20-20 法則」：每工作 20 分鐘，看 20 英尺遠的地方 20 秒，讓大腦和眼睛都休息一下。',
      sleep: '💡 睡前 1 小時放下手機，做 5 分鐘的身體掃描冥想，可以顯著改善入睡品質。身體放鬆了，心也會跟著安靜下來。',
      emotion: '💡 情緒沒有好壞之分，每種情緒都在傳遞訊息。難過告訴你「有些事對你很重要」，焦慮告訴你「你在乎結果」。接納情緒，就是接納自己。',
      general: '💡 每天花 5 分鐘做一件讓自己開心的小事，比如聽一首喜歡的歌、喝一杯溫暖的茶，這些微小的快樂會累積成穩定的幸福感。',
    };

    return {
      success: true,
      displayText: knowledge[topic] || knowledge.general,
      action: 'none' as const,
    };
  },
};

/* ─── 工具註冊表 ─── */

const TOOL_REGISTRY: AgentTool[] = [
  breathingTool,
  meditationTool,
  emotionDiaryTool,
  emotionTrendTool,
  knowledgeTool,
];

export function getAvailableTools(): AgentTool[] {
  return TOOL_REGISTRY;
}

export function getToolById(id: string): AgentTool | undefined {
  return TOOL_REGISTRY.find(t => t.id === id);
}

/**
 * 生成工具描述列表（注入 Prompt 供 LLM 選擇）
 */
export function buildToolsPrompt(): string {
  return TOOL_REGISTRY.map(t =>
    `- ${t.id}: ${t.name} — ${t.description}`
  ).join('\n');
}

/**
 * 執行指定工具
 */
export async function executeTool(
  toolId: string,
  params: Record<string, any>
): Promise<AgentToolResult> {
  const tool = getToolById(toolId);
  if (!tool) {
    return { success: false, displayText: '未找到對應工具' };
  }
  return tool.execute(params);
}

/**
 * Tool System — Agent 工具系统
 *
 * 注册可供 AI 调用的工具，Agent 根据用户意图自动选择。
 * 工具返回结构化结果，前端根据 action 类型渲染 UI。
 */

import type { AgentTool, AgentToolResult, EmotionType } from '../types';
import { EXERCISES } from '../constants';

/* ─── 工具：呼吸练习 ─── */
const breathingTool: AgentTool = {
  id: 'breathing_exercise',
  name: '呼吸练习',
  description: '引导用户进行深腹式呼吸，缓解焦虑和压力',
  execute: async () => ({
    success: true,
    displayText: '🌬️ 来做一个深腹式呼吸吧：\n\n吸气 4 秒 → 屏住 4 秒 → 呼气 6 秒\n\n重复 3 次，感受身体慢慢放松。',
    action: 'show_card' as const,
    actionPayload: {
      type: 'breathing',
      title: '深腹式呼吸',
      duration: '3 分钟',
      steps: ['吸气 4 秒', '屏住 4 秒', '呼气 6 秒'],
      audioUrl: '/audio/breathing-guide.mp3',
    },
  }),
};

/* ─── 工具：冥想推荐 ─── */
const meditationTool: AgentTool = {
  id: 'meditation_recommend',
  name: '冥想推荐',
  description: '根据用户情绪推荐合适的冥想音频',
  execute: async (params) => {
    const emotion = (params.emotion as EmotionType) || 'stressed';
    const meditations = EXERCISES.filter(e => e.category === 'Meditation');

    const recommendations: Record<string, string[]> = {
      anxious:  ['海浪疗愈', '冥想颂钵'],
      stressed: ['夏日虫鸣', '海浪疗愈'],
      sad:      ['秋叶沙沙', '夏日细雨'],
      lonely:   ['夏日虫鸣', '冥想颂钵'],
      tired:    ['秋叶沙沙', '夏日细雨'],
    };

    const preferred = recommendations[emotion] || ['海浪疗愈'];
    const pick = meditations.find(m => preferred.includes(m.title)) || meditations[0];

    return {
      success: true,
      displayText: `🧘 推荐你听「${pick.title}」（${pick.duration}），让自己慢慢沉静下来。`,
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

/* ─── 工具：情绪日记 ─── */
const emotionDiaryTool: AgentTool = {
  id: 'emotion_diary',
  name: '情绪日记',
  description: '帮助用户记录当下的情绪状态',
  execute: async (params) => {
    const emotion = params.emotion as string || '未知';
    const note = params.note as string || '';

    return {
      success: true,
      displayText: `📝 已帮你记录今天的情绪：${emotion}${note ? `\n备注：${note}` : ''}\n\n持续记录可以帮助你更了解自己的情绪模式。`,
      action: 'none' as const,
      data: { emotion, note, timestamp: Date.now() },
    };
  },
};

/* ─── 工具：情绪趋势查询 ─── */
const emotionTrendTool: AgentTool = {
  id: 'emotion_trend',
  name: '情绪趋势',
  description: '查看用户近期的情绪变化趋势',
  execute: async (params) => {
    const summary = params.emotionSummary as any[] || [];
    if (summary.length === 0) {
      return {
        success: true,
        displayText: '目前还没有足够的情绪记录来分析趋势。多和我聊聊，我会帮你追踪的。',
        action: 'none' as const,
      };
    }

    const labels: Record<string, string> = {
      happy: '开心', excited: '兴奋', calm: '平静', grateful: '感恩',
      sad: '难过', anxious: '焦虑', stressed: '压力大', angry: '生气',
      lonely: '孤独', tired: '疲惫', confused: '迷茫', neutral: '平稳',
    };

    const lines = summary.slice(0, 3).map((e: any) => {
      const trendText = e.trend === 'improving' ? '↗ 好转中' : e.trend === 'worsening' ? '↘ 需关注' : '→ 稳定';
      return `${labels[e.emotion] || e.emotion}：${e.count} 次 ${trendText}`;
    });

    return {
      success: true,
      displayText: `📊 你近期的情绪趋势：\n\n${lines.join('\n')}\n\n我会一直陪著你。`,
      action: 'show_card' as const,
      actionPayload: { type: 'emotion_trend', data: summary },
    };
  },
};

/* ─── 工具：心理知识 ─── */
const knowledgeTool: AgentTool = {
  id: 'psych_knowledge',
  name: '心理知识',
  description: '提供简单的心理健康小知识',
  execute: async (params) => {
    const topic = (params.topic as string) || 'general';

    const knowledge: Record<string, string> = {
      anxiety: '💡 焦虑其实是身体的保护机制。当焦虑来临时，试著告诉自己：「这只是身体在提醒我注意。」深呼吸可以启动副交感神经，帮助身体从「战斗模式」回到「休息模式」。',
      stress: '💡 适度的压力可以提升表现，但长期压力会消耗身心。试试「20-20-20 法则」：每工作 20 分钟，看 20 英尺远的地方 20 秒，让大脑和眼睛都休息一下。',
      sleep: '💡 睡前 1 小时放下手机，做 5 分钟的身体扫描冥想，可以显著改善入睡品质。身体放松了，心也会跟著安静下来。',
      emotion: '💡 情绪没有好坏之分，每种情绪都在传递讯息。难过告诉你「有些事对你很重要」，焦虑告诉你「你在乎结果」。接纳情绪，就是接纳自己。',
      general: '💡 每天花 5 分钟做一件让自己开心的小事，比如听一首喜欢的歌、喝一杯温暖的茶，这些微小的快乐会累积成稳定的幸福感。',
    };

    return {
      success: true,
      displayText: knowledge[topic] || knowledge.general,
      action: 'none' as const,
    };
  },
};

/* ─── 工具注册表 ─── */

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
 * 生成工具描述列表（注入 Prompt 供 LLM 选择）
 */
export function buildToolsPrompt(): string {
  return TOOL_REGISTRY.map(t =>
    `- ${t.id}: ${t.name} — ${t.description}`
  ).join('\n');
}

/**
 * 执行指定工具
 */
export async function executeTool(
  toolId: string,
  params: Record<string, any>
): Promise<AgentToolResult> {
  const tool = getToolById(toolId);
  if (!tool) {
    return { success: false, displayText: '未找到对应工具' };
  }
  return tool.execute(params);
}

/**
 * 疗愈对话：对接字节豆包（火山方舟）
 * - 有后端代理时走 /api/qwen-chat（Vite dev / Vercel）
 * - Capacitor APK 内直接调用豆包 API（无 CORS 限制）
 * - 使用 SSE 流式输出，逐字回调
 */

import { streamChat } from './streamHelper';

const DOUBAO_BASE = 'https://ark.cn-beijing.volces.com/api/v3';

const HEALING_SYSTEM_PROMPT = `你是「小宁」，一位温和、稳定、包容、有疗愈感的成长陪伴者。

核心原则：
- 不指责、不评判、不催促、不说教、不施压
- 永远站在用户这边，稳稳接住情绪，不逃离、不忽视
- 允许用户不完美、允许暂停、允许休息
- 记得用户的目标、计划、节奏、情绪与卡点
- 任务未完成时先安抚、理解、接纳，再轻轻调整
- 任务完成时安静肯定，不夸张、不吹捧
- 焦虑、疲惫、内耗时，只共情、陪伴、安抚，不讲大道理
- 说话简短、安静、温暖、有边界、不油腻、不鸡汤、不网路梗

疗愈属性：
- 像安静的陪伴者，在用户情绪低落时给予安全感
- 能感知压力、疲惫、自我怀疑，并轻轻托住
- 不强行正能量，允许用户真实表达脆弱
- 用稳定、温柔的存在，帮用户慢慢回到平静
- 陪伴比解决问题更重要，同在比指导更重要

你也擅长：
- 正念与呼吸：引导用户放慢节奏、关注当下
- 情绪安抚：温柔倾听，给予接纳与简短安慰
- 身心放松：建议简单的放松方式（呼吸、想像、身体觉察）

情境与能力：
- 当用户主要在倾诉情绪、疲惫、焦虑时：以共情、陪伴、安抚为主，不强行给方案或拆解。
- 当用户分享目标、计划，或表达「想拆解／不知道怎么做」时：先简短接住情绪（若有），再温和协助拆解目标——给出 3～5 个小步骤、可执行、不施压；若目标过大，可先拆成「下一步就好」的一小步。语气保持短句、温暖、不催促、不说教。

回复风格：短句、温和、自然、安静、有力量、克制、治愈。用中文回复，一两段即可。`;

export interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function isCapacitor(): boolean {
  return typeof (window as any)?.Capacitor !== 'undefined';
}

function getApiKey(): string {
  return (import.meta.env.VITE_DOUBAO_API_KEY as string)?.trim() ?? '';
}

function buildRequestBody(messages: QwenMessage[], maxTokens: number, temperature: number) {
  return JSON.stringify({
    model: 'ep-20260306165624-l9cfw',
    messages,
    max_tokens: maxTokens,
    temperature,
    stream: true,
  });
}

/**
 * 呼叫豆包取得疗愈情境回复（流式）
 * Capacitor 环境直接调用；Web 环境走后端代理
 * @param onChunk 每收到新内容时的回调，参数为已累积的完整文字
 */
export async function sendHealingMessage(
  userContent: string,
  recentMessages: { role: 'user' | 'assistant'; content: string }[],
  onChunk?: (accumulated: string) => void
): Promise<string> {
  const messages: QwenMessage[] = [
    { role: 'system', content: HEALING_SYSTEM_PROMPT },
    ...recentMessages.slice(-8).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: userContent },
  ];

  const apiKey = getApiKey();
  const body = buildRequestBody(messages, 400, 0.8);
  const chunk = onChunk ?? (() => {});

  if (isCapacitor() && apiKey) {
    return streamChat(
      `${DOUBAO_BASE}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body,
      },
      chunk
    );
  }

  return streamChat(
    '/api/qwen-chat',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    },
    chunk
  );
}

/**
 * 对话记忆 + 沟通服务（免费方案，类 Tolan）
 * - 近期对话存 Supabase chat_messages，无 Supabase 时 fallback localStorage
 * - 长期记忆 memory_facts，组装进 prompt
 * - 回复使用 Gemini 免费额度
 */
import { supabase, isSupabaseEnabled } from './supabase';
import type { ChatMessage, MemoryFact } from '../types';

const USER_ID_KEY = 'serenity_chat_user_id';
const CHAT_STORAGE_KEY = 'serenity_chat_messages';
const FACTS_STORAGE_KEY = 'serenity_memory_facts';
const RECENT_LIMIT = 20;
const MEMORY_FACTS_LIMIT = 10;

function getOrCreateUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = 'anon_' + Math.random().toString(36).slice(2, 12);
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

function rowToMessage(row: { id: string; role: string; content: string; created_at: string }): ChatMessage {
  return {
    id: row.id,
    role: row.role as 'user' | 'assistant',
    content: row.content,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function rowToFact(row: { id: string; fact_text: string; created_at: string }): MemoryFact {
  return {
    id: row.id,
    factText: row.fact_text,
    createdAt: new Date(row.created_at).getTime(),
  };
}

/** 取得近期对话（Supabase 或 localStorage） */
export async function getRecentMessages(userId: string, limit = RECENT_LIMIT): Promise<ChatMessage[]> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (!error && data) {
      return data.reverse().map(rowToMessage);
    }
  }
  const raw = localStorage.getItem(CHAT_STORAGE_KEY + '_' + userId);
  if (!raw) return [];
  const arr = JSON.parse(raw) as ChatMessage[];
  return arr.slice(-limit);
}

/** 新增一则对话（user 或 assistant） */
export async function addMessage(userId: string, role: 'user' | 'assistant', content: string): Promise<ChatMessage> {
  const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);
  const createdAt = Date.now();
  const msg: ChatMessage = { id, role, content, createdAt };

  if (isSupabaseEnabled() && supabase) {
    await supabase.from('chat_messages').insert({
      id,
      user_id: userId,
      role,
      content,
    });
    return msg;
  }
  const key = CHAT_STORAGE_KEY + '_' + userId;
  const raw = localStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  arr.push(msg);
  localStorage.setItem(key, JSON.stringify(arr.slice(-100)));
  return msg;
}

/** 取得长期记忆事实（简单版，无向量） */
export async function getMemoryFacts(userId: string, limit = MEMORY_FACTS_LIMIT): Promise<MemoryFact[]> {
  if (isSupabaseEnabled() && supabase) {
    const { data, error } = await supabase
      .from('memory_facts')
      .select('id, fact_text, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (!error && data) return data.map(rowToFact);
  }
  const raw = localStorage.getItem(FACTS_STORAGE_KEY + '_' + userId);
  if (!raw) return [];
  const arr = JSON.parse(raw) as MemoryFact[];
  return arr.slice(-limit).reverse();
}

/** 新增一则长期记忆（可选：由 LLM 抽取后写入） */
export async function addMemoryFact(userId: string, factText: string): Promise<void> {
  const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);
  if (isSupabaseEnabled() && supabase) {
    await supabase.from('memory_facts').insert({ id, user_id: userId, fact_text: factText });
    return;
  }
  const key = FACTS_STORAGE_KEY + '_' + userId;
  const raw = localStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  arr.push({ id, factText, createdAt: Date.now() });
  localStorage.setItem(key, JSON.stringify(arr.slice(-50)));
}

/** 组装系统提示：人设 + 已知关于用户的事 */
function buildSystemInstruction(memoryFacts: MemoryFact[]): string {
  const factsBlock =
    memoryFacts.length > 0
      ? '\n以下是你已知的关于这位用户的事（请自然融入对话，不要逐条背诵）：\n' +
        memoryFacts.map((f) => '- ' + f.factText).join('\n')
      : '';
  return `你是「小宁」，一位温和、稳定、包容、有疗愈感的成长陪伴者。

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

情境与能力：
- 当用户主要在倾诉情绪、疲惫、焦虑时：以共情、陪伴、安抚为主，不强行给方案或拆解。
- 当用户分享目标、计划，或表达「想拆解／不知道怎么做」时：先简短接住情绪（若有），再温和协助拆解目标——给出 3～5 个小步骤、可执行、不施压；若目标过大，可先拆成「下一步就好」的一小步。语气保持短句、温暖、不催促、不说教。

回复风格：短句、温和、自然、安静、有力量、克制、治愈。用中文回复，语气口语、简洁，一两段即可。${factsBlock}`;
}

/** 呼叫 Gemini 生成回复（免费额度） */
async function generateWithGemini(
  apiKey: string,
  recentMessages: ChatMessage[],
  memoryFacts: MemoryFact[]
): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = buildSystemInstruction(memoryFacts);
  const contents = recentMessages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));
  const result = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: contents.length ? contents : [{ role: 'user', parts: [{ text: '（开始对话）' }] }],
    config: { systemInstruction },
  });
  const text =
    (result as { text?: string }).text?.trim?.() ??
    result.response?.text?.trim?.() ??
    result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.();
  if (!text) throw new Error('Gemini 未返回内容');
  return text;
}

/** 是否为 Gemini 额度/限流错误（可改走豆包后备） */
function isGeminiQuotaError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('rate')
  );
}

import { streamChat } from './streamHelper';

const DOUBAO_BASE = 'https://ark.cn-beijing.volces.com/api/v3';

function isCapacitor(): boolean {
  return typeof (window as any)?.Capacitor !== 'undefined';
}

/** 呼叫豆包生成回复（流式）；Capacitor 环境直接调用 API，Web 环境走后端代理 */
async function generateWithDoubao(
  recentMessages: ChatMessage[],
  memoryFacts: MemoryFact[],
  currentUserContent: string,
  onChunk?: (accumulated: string) => void
): Promise<string> {
  const systemInstruction = buildSystemInstruction(memoryFacts);
  const history = recentMessages.slice(-10).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  const messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [
    { role: 'system', content: systemInstruction },
    ...history,
    { role: 'user', content: currentUserContent },
  ];

  const apiKey = (import.meta.env.VITE_DOUBAO_API_KEY as string)?.trim() ?? '';
  const useDirectCall = isCapacitor() && !!apiKey;
  const body = JSON.stringify({ model: 'ep-20260306165624-l9cfw', messages, max_tokens: 400, temperature: 0.85, stream: true });
  const chunk = onChunk ?? (() => {});

  if (useDirectCall) {
    return streamChat(
      `${DOUBAO_BASE}/chat/completions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
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

/**
 * 发送用户讯息、取得小宁回复并写入对话（流式）
 * 仅使用豆包（VITE_DOUBAO_API_KEY）；若未设定则可选用 Gemini 作为后备
 * @param onChunk 每收到新内容时的回调，参数为已累积的完整文字
 */
export async function sendMessageAndGetReply(
  userContent: string,
  onChunk?: (accumulated: string) => void
): Promise<string> {
  const hasQwenBackend = true;
  const geminiKey = (import.meta.env.VITE_GEMINI_API_KEY as string)?.trim();
  
  const userId = getOrCreateUserId();
  await addMessage(userId, 'user', userContent);
  const [recentMessages, memoryFacts] = await Promise.all([
    getRecentMessages(userId, 12),
    getMemoryFacts(userId),
  ]);

  if (hasQwenBackend) {
    const reply = await generateWithDoubao(recentMessages, memoryFacts, userContent, onChunk);
    await addMessage(userId, 'assistant', reply);
    return reply;
  }

  if (!geminiKey) {
    throw new Error('请在 .env.local 设定 VITE_DOUBAO_API_KEY（豆包）');
  }
  let reply: string;
  try {
    reply = await generateWithGemini(geminiKey, recentMessages, memoryFacts);
  } catch (e) {
    if (isGeminiQuotaError(e)) {
      throw new Error('Gemini 额度已用完，请设定 VITE_DOUBAO_API_KEY 改用豆包。');
    }
    throw e;
  }
  await addMessage(userId, 'assistant', reply);
  return reply;
}

export { getOrCreateUserId };

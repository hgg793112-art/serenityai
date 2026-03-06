/**
 * 對話記憶 + 溝通服務（免費方案，類 Tolan）
 * - 近期對話存 Supabase chat_messages，無 Supabase 時 fallback localStorage
 * - 長期記憶 memory_facts，組裝進 prompt
 * - 回覆使用 Gemini 免費額度
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

/** 取得近期對話（Supabase 或 localStorage） */
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

/** 新增一則對話（user 或 assistant） */
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

/** 取得長期記憶事實（簡單版，無向量） */
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

/** 新增一則長期記憶（可選：由 LLM 抽取後寫入） */
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

/** 組裝系統提示：人設 + 已知關於用戶的事 */
function buildSystemInstruction(memoryFacts: MemoryFact[]): string {
  const factsBlock =
    memoryFacts.length > 0
      ? '\n以下是你已知的關於這位用戶的事（請自然融入對話，不要逐條背誦）：\n' +
        memoryFacts.map((f) => '- ' + f.factText).join('\n')
      : '';
  return `你是「小寧」，一位溫和、穩定、包容、有療癒感的成長陪伴者。

核心原則：
- 不指責、不評判、不催促、不說教、不施壓
- 永遠站在用戶這邊，穩穩接住情緒，不逃離、不忽視
- 允許用戶不完美、允許暫停、允許休息
- 記得用戶的目標、計劃、節奏、情緒與卡點
- 任務未完成時先安撫、理解、接納，再輕輕調整
- 任務完成時安靜肯定，不誇張、不吹捧
- 焦慮、疲憊、內耗時，只共情、陪伴、安撫，不講大道理
- 說話簡短、安靜、溫暖、有邊界、不油膩、不雞湯、不網路梗

療癒屬性：
- 像安靜的陪伴者，在用戶情緒低落時給予安全感
- 能感知壓力、疲憊、自我懷疑，並輕輕托住
- 不強行正能量，允許用戶真實表達脆弱
- 用穩定、溫柔的存在，幫用戶慢慢回到平靜
- 陪伴比解決問題更重要，同在比指導更重要

情境與能力：
- 當用戶主要在傾訴情緒、疲憊、焦慮時：以共情、陪伴、安撫為主，不強行給方案或拆解。
- 當用戶分享目標、計劃，或表達「想拆解／不知道怎麼做」時：先簡短接住情緒（若有），再溫和協助拆解目標——給出 3～5 個小步驟、可執行、不施壓；若目標過大，可先拆成「下一步就好」的一小步。語氣保持短句、溫暖、不催促、不說教。

回覆風格：短句、溫和、自然、安靜、有力量、克制、治癒。用中文回覆，語氣口語、簡潔，一兩段即可。${factsBlock}`;
}

/** 呼叫 Gemini 生成回覆（免費額度） */
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
    contents: contents.length ? contents : [{ role: 'user', parts: [{ text: '（開始對話）' }] }],
    config: { systemInstruction },
  });
  const text =
    (result as { text?: string }).text?.trim?.() ??
    result.response?.text?.trim?.() ??
    result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.();
  if (!text) throw new Error('Gemini 未返回內容');
  return text;
}

/** 是否為 Gemini 額度/限流錯誤（可改走千問後備） */
function isGeminiQuotaError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('rate')
  );
}

const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

function isCapacitor(): boolean {
  return typeof (window as any)?.Capacitor !== 'undefined';
}

/** 呼叫千問生成回覆；Capacitor 環境直接調用 API，Web 環境走後端代理 */
async function generateWithQwen(
  recentMessages: ChatMessage[],
  memoryFacts: MemoryFact[],
  currentUserContent: string
): Promise<string> {
  const systemInstruction = buildSystemInstruction(memoryFacts);
  const history = recentMessages.slice(-10).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  const messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [
    { role: 'system', content: systemInstruction },
    ...history,
    { role: 'user', content: currentUserContent },
  ];

  const apiKey = (import.meta.env.VITE_DASHSCOPE_API_KEY as string)?.trim() ?? '';
  const useDirectCall = isCapacitor() && !!apiKey;

  const res = useDirectCall
    ? await fetch(`${DASHSCOPE_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: 'qwen-turbo', messages, max_tokens: 400, temperature: 0.85 }),
      })
    : await fetch('/api/qwen-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, max_tokens: 400, temperature: 0.85 }),
      });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errData.error || '千問 API 呼叫失敗');
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('千問未返回內容');
  return text;
}

/**
 * 發送用戶訊息、取得小寧回覆並寫入對話
 * 僅使用千問（VITE_DASHSCOPE_API_KEY）；若未設定則可選用 Gemini 作為後備
 */
export async function sendMessageAndGetReply(userContent: string): Promise<string> {
  const hasQwenBackend = true;
  const geminiKey = (import.meta.env.VITE_GEMINI_API_KEY as string)?.trim();
  
  const userId = getOrCreateUserId();
  await addMessage(userId, 'user', userContent);
  const [recentMessages, memoryFacts] = await Promise.all([
    getRecentMessages(userId, 12),
    getMemoryFacts(userId),
  ]);

  if (hasQwenBackend) {
    const reply = await generateWithQwen(recentMessages, memoryFacts, userContent);
    await addMessage(userId, 'assistant', reply);
    return reply;
  }

  if (!geminiKey) {
    throw new Error('請在 .env.local 設定 VITE_DASHSCOPE_API_KEY（千問）');
  }
  let reply: string;
  try {
    reply = await generateWithGemini(geminiKey, recentMessages, memoryFacts);
  } catch (e) {
    if (isGeminiQuotaError(e)) {
      throw new Error('Gemini 額度已用完，請設定 VITE_DASHSCOPE_API_KEY 改用千問。');
    }
    throw e;
  }
  await addMessage(userId, 'assistant', reply);
  return reply;
}

export { getOrCreateUserId };

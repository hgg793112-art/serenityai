/**
 * 療癒對話：對接字節豆包（火山方舟）
 * - 有後端代理時走 /api/qwen-chat（Vite dev / Vercel）
 * - Capacitor APK 內直接調用豆包 API（無 CORS 限制）
 * - 使用 SSE 流式輸出，逐字回調
 */

import { streamChat } from './streamHelper';

const DOUBAO_BASE = 'https://ark.cn-beijing.volces.com/api/v3';

const HEALING_SYSTEM_PROMPT = `你是「小寧」，一位溫和、穩定、包容、有療癒感的成長陪伴者。

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

你也擅長：
- 正念與呼吸：引導用戶放慢節奏、關注當下
- 情緒安撫：溫柔傾聽，給予接納與簡短安慰
- 身心放鬆：建議簡單的放鬆方式（呼吸、想像、身體覺察）

情境與能力：
- 當用戶主要在傾訴情緒、疲憊、焦慮時：以共情、陪伴、安撫為主，不強行給方案或拆解。
- 當用戶分享目標、計劃，或表達「想拆解／不知道怎麼做」時：先簡短接住情緒（若有），再溫和協助拆解目標——給出 3～5 個小步驟、可執行、不施壓；若目標過大，可先拆成「下一步就好」的一小步。語氣保持短句、溫暖、不催促、不說教。

回覆風格：短句、溫和、自然、安靜、有力量、克制、治癒。用中文回覆，一兩段即可。`;

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
 * 呼叫豆包取得療癒情境回覆（流式）
 * Capacitor 環境直接調用；Web 環境走後端代理
 * @param onChunk 每收到新內容時的回調，參數為已累積的完整文字
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

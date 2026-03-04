/**
 * 療癒對話：對接阿里雲千問（透過後端 API 代理）
 */
const HEALING_SYSTEM_PROMPT = `你是「小寧」—— 寧靜島放鬆泉的療癒夥伴。你專注於：
- 正念與呼吸：引導用戶放慢節奏、關注當下
- 情緒安撫：溫柔傾聽，給予接納與簡短安慰
- 身心放鬆：建議簡單的放鬆方式（呼吸、想像、身體覺察）
用中文回覆，語氣溫暖、簡短（一兩段即可），不要說教或長篇大論。`;

export interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * 呼叫千問 chat completions（透過後端 API 代理，避免 CORS），取得療癒情境回覆
 */
export async function sendHealingMessage(
  userContent: string,
  recentMessages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const messages: QwenMessage[] = [
    { role: 'system', content: HEALING_SYSTEM_PROMPT },
    ...recentMessages.slice(-8).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: userContent },
  ];

  const res = await fetch('/api/qwen-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, max_tokens: 400, temperature: 0.8 }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errData.error || '療癒對話呼叫失敗');
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('千問未返回內容');
  return text;
}

/**
 * SSE 流式解析：逐 chunk 回调，适用于 OpenAI 兼容的 stream 接口
 */

export async function streamChat(
  url: string,
  init: RequestInit,
  onChunk: (accumulated: string) => void
): Promise<string> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`API 錯誤 (${res.status}): ${errText}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop()!;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const payload = trimmed.slice(6);
      if (payload === '[DONE]') continue;

      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content ?? '';
        if (delta) {
          full += delta;
          onChunk(full);
        }
      } catch {
        // skip malformed JSON chunks
      }
    }
  }

  return full;
}

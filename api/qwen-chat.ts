import type { VercelRequest, VercelResponse } from '@vercel/node';

const DOUBAO_BASE = 'https://ark.cn-beijing.volces.com/api/v3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VITE_DOUBAO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '伺服器未设定豆包 API Key' });
  }

  try {
    const { messages, max_tokens = 400, temperature = 0.85, stream = false } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '缺少 messages 参数' });
    }

    const response = await fetch(`${DOUBAO_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'ep-20260306165624-l9cfw',
        messages,
        max_tokens,
        temperature,
        stream,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: response.status === 401 ? '豆包 API Key 无效' : `豆包 API 错误: ${errorText}`,
      });
    }

    if (stream && response.body) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = (response.body as any).getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { res.end(); break; }
          res.write(value);
        }
      };
      await pump();
      return;
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('豆包 API 代理错误:', error);
    return res.status(500).json({ error: '伺服器内部错误' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VITE_DASHSCOPE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '伺服器未設定千問 API Key' });
  }

  try {
    const { messages, max_tokens = 400, temperature = 0.85 } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '缺少 messages 參數' });
    }

    const response = await fetch(`${DASHSCOPE_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages,
        max_tokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: response.status === 401 ? '千問 API Key 無效' : `千問 API 錯誤: ${errorText}` 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('千問 API 代理錯誤:', error);
    return res.status(500).json({ error: '伺服器內部錯誤' });
  }
}

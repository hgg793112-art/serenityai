import axios from "axios";

const LLM_TIMEOUT_MS = 8000;

export async function callLLM(
  messages: { role: string; content: string }[],
  options?: { timeout?: number }
): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";

  if (!apiKey) {
    throw new Error("LLM_API_KEY not set");
  }

  const timeout = options?.timeout ?? LLM_TIMEOUT_MS;

  const response = await axios.post(
    `${baseUrl.replace(/\/$/, "")}/chat/completions`,
    {
      model: "qwen-turbo",
      messages,
      max_tokens: 1024,
      temperature: 0.2,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeout,
      validateStatus: () => true,
    }
  );

  if (response.status !== 200) {
    throw new Error(`LLM API error: ${response.status} ${JSON.stringify(response.data)}`);
  }

  const content = response.data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("LLM returned invalid response");
  }
  return content.trim();
}

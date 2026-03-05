import { callLLM } from "../lib/llm";

export interface ParsedDemand {
  category: string;
  budgetMin: number;
  budgetMax: number;
  priority: string;
  constraints: string[];
}

const PARSE_PROMPT = `你是購物需求解析引擎。
將用戶輸入轉換為 JSON。
必須輸出且僅輸出以下 JSON，禁止任何解釋文字：
{
  "category": "品類名稱，如：筆記本電腦、手機、耳機、家居",
  "budgetMin": 數字最低預算（元），
  "budgetMax": 數字最高預算（元），
  "priority": "用戶優先級：性價比/品質/品牌/便攜等",
  "constraints": ["約束1", "約束2"]
}

若用戶只說預算如「3000以內」，budgetMin 填 0，budgetMax 填 3000。
品類根據語意推斷，如「輕薄本」對應「筆記本電腦」。`;

function fallbackParse(input: string): ParsedDemand {
  const lower = input.toLowerCase();
  let category = "其他";
  if (lower.includes("輕薄") || lower.includes("筆記本") || lower.includes("筆電") || lower.includes("筆記型")) category = "筆記本電腦";
  else if (lower.includes("手機")) category = "手機";
  else if (lower.includes("耳機")) category = "耳機";
  else if (lower.includes("家居") || lower.includes("家電")) category = "家居";

  let budgetMin = 0;
  let budgetMax = 100000;
  const numMatch = input.match(/(\d+)\s*[以內內下]|(\d+)\s*[-~到至]\s*(\d+)|預算\s*(\d+)/);
  if (numMatch) {
    if (numMatch[2] && numMatch[3]) {
      budgetMin = parseInt(numMatch[2], 10) || 0;
      budgetMax = parseInt(numMatch[3], 10) || 100000;
    } else {
      const single = parseInt(numMatch[1] || numMatch[4] || "0", 10);
      if (single > 0) budgetMax = single;
    }
  }

  return {
    category,
    budgetMin,
    budgetMax,
    priority: "性價比",
    constraints: [],
  };
}

function extractJSON(text: string): string | null {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return trimmed.slice(start, end + 1);
}

function fixJSON(jsonStr: string): string {
  return jsonStr
    .replace(/\n/g, " ")
    .replace(/,(\s*[}\]])/g, "$1")
    .replace(/(["'])\s*:\s*([^",\s}\]]+)/g, '$1: "$2"');
}

export async function parseDemand(input: string): Promise<ParsedDemand> {
  const run = async (): Promise<ParsedDemand> => {
    const content = await callLLM(
      [
        { role: "system", content: PARSE_PROMPT },
        { role: "user", content: input },
      ],
      { timeout: 8000 }
    );

    let raw = extractJSON(content);
    if (!raw) throw new Error("No JSON in response");
    try {
      return JSON.parse(raw) as ParsedDemand;
    } catch {
      raw = fixJSON(raw);
      const parsed = JSON.parse(raw) as ParsedDemand;
      if (parsed && typeof parsed.category === "string" && typeof parsed.budgetMax === "number") {
        return {
          category: parsed.category || "其他",
          budgetMin: Number(parsed.budgetMin) || 0,
          budgetMax: Number(parsed.budgetMax) || 100000,
          priority: String(parsed.priority || "性價比"),
          constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
        };
      }
      throw new Error("Invalid parsed structure");
    }
  };

  try {
    return await run();
  } catch (e) {
    try {
      return await run();
    } catch {
      return fallbackParse(input);
    }
  }
}

import { callLLM } from "../lib/llm";
import type { ParsedDemand } from "./parseDemand";
import type { ProductItem } from "./matchScore";
import type { UserProfile } from "../services/profile";

export interface DecisionProduct {
  id: string;
  name: string;
  price: number;
  reason: string;
}

export interface DecisionSolution {
  type: "stable" | "value" | "upgrade";
  products: DecisionProduct[];
  reason: string;
}

export interface DecisionOutput {
  solutions: DecisionSolution[];
}

const DECISION_PROMPT = `你是購物決策助手。根據結構化需求、候選商品和用戶畫像，輸出三套方案 JSON。
必須僅輸出以下結構的 JSON，禁止解釋：
{
  "solutions": [
    {
      "type": "stable",
      "products": [{"id":"商品id","name":"名稱","price":價格,"reason":"推薦理由"}],
      "reason": "方案整體說明"
    },
    {
      "type": "value",
      "products": [...],
      "reason": "方案整體說明"
    },
    {
      "type": "upgrade",
      "products": [...],
      "reason": "方案整體說明"
    }
  ]
}
規則：stable=穩妥均衡，value=性價比優先，upgrade=品質/升級選擇。每方案 1～3 個商品，從候選列表選。`;

function buildCandidateText(products: ProductItem[]): string {
  return products
    .slice(0, 15)
    .map((p) => `id:${p.id} name:${p.name} category:${p.category} price:${p.price} brand:${p.brand} rating:${p.rating}`)
    .join("\n");
}

export async function generateDecision(
  structuredDemand: ParsedDemand,
  candidateProducts: ProductItem[],
  userProfile: UserProfile
): Promise<DecisionOutput> {
  const candidateText = buildCandidateText(candidateProducts);
  const userContext = `用戶畫像：價格敏感度=${userProfile.priceSensitivity}，衝動指數=${userProfile.impulseIndex}，品類權重=${JSON.stringify(userProfile.categoryWeight)}`;
  const demandContext = `需求：品類=${structuredDemand.category}，預算=${structuredDemand.budgetMin}-${structuredDemand.budgetMax}，優先級=${structuredDemand.priority}`;

  const run = async (): Promise<DecisionOutput> => {
    const content = await callLLM(
      [
        { role: "system", content: DECISION_PROMPT },
        {
          role: "user",
          content: `${demandContext}\n${userContext}\n候選商品：\n${candidateText}`,
        },
      ],
      { timeout: 8000 }
    );

    const raw = content.trim();
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const jsonStr = start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
    let parsed: DecisionOutput;
    try {
      parsed = JSON.parse(jsonStr) as DecisionOutput;
    } catch {
      parsed = JSON.parse(jsonStr.replace(/,(\s*[}\]])/g, "$1")) as DecisionOutput;
    }

    if (!parsed?.solutions || !Array.isArray(parsed.solutions)) {
      throw new Error("Invalid decision structure");
    }

    const types = ["stable", "value", "upgrade"];
    const filled: DecisionSolution[] = types.map((type) => {
      const found = parsed.solutions.find((s: DecisionSolution) => s.type === type);
      if (found && Array.isArray(found.products)) {
        return {
          type: type as "stable" | "value" | "upgrade",
          products: found.products.slice(0, 3).map((p: DecisionProduct) => ({
            id: p.id || "",
            name: p.name || "",
            price: Number(p.price) || 0,
            reason: p.reason || "",
          })),
          reason: found.reason || "",
        };
      }
      const fallbackProducts = candidateProducts.slice(0, 2).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        reason: "符合預算與品類",
      }));
      return {
        type: type as "stable" | "value" | "upgrade",
        products: fallbackProducts,
        reason: "預設推薦方案",
      };
    });

    return { solutions: filled };
  };

  try {
    return await run();
  } catch {
    return getDefaultDecision(candidateProducts);
  }
}

function getDefaultDecision(candidateProducts: ProductItem[]): DecisionOutput {
  const list = candidateProducts.slice(0, 5);
  const toProd = (p: ProductItem, reason: string) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    reason,
  });
  return {
    solutions: [
      { type: "stable", products: list.slice(0, 2).map((p) => toProd(p, "穩妥均衡之選")), reason: "預設穩妥方案" },
      { type: "value", products: list.slice(1, 3).map((p) => toProd(p, "性價比高")), reason: "預設性價比方案" },
      { type: "upgrade", products: list.slice(2, 4).map((p) => toProd(p, "品質升級之選")), reason: "預設升級方案" },
    ],
  };
}

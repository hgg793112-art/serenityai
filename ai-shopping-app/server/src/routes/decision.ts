import { Router, Request, Response } from "express";
import { parseDemand } from "../ai/parseDemand";
import { generateDecision } from "../ai/generateDecision";
import { sortByMatchScore, type ProductItem } from "../ai/matchScore";
import { getOrCreateUser, recordEvent, updateProfileFromBehavior } from "../services/profile";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

export async function getProductsForDemand(category: string, budgetMin: number, budgetMax: number): Promise<ProductItem[]> {
  const products = await prisma.product.findMany({
    where: {
      price: { gte: budgetMin * 0.5, lte: budgetMax * 1.2 },
    },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    brand: p.brand,
    rating: p.rating,
  }));
}

router.post("/decision", async (req: Request, res: Response) => {
  try {
    const { userId = "demo-user", input } = req.body as { userId?: string; input?: string };
    if (!input || typeof input !== "string") {
      res.status(400).json({ error: "缺少 input" });
      return;
    }

    const parsed = await parseDemand(input);
    const user = await getOrCreateUser(userId);
    let products = await getProductsForDemand(parsed.category, parsed.budgetMin, parsed.budgetMax);

    const demandForMatch = {
      category: parsed.category,
      budgetMin: parsed.budgetMin,
      budgetMax: parsed.budgetMax,
      priority: parsed.priority,
      constraints: parsed.constraints,
    };
    products = sortByMatchScore(products, demandForMatch, {
      priceSensitivity: user.priceSensitivity,
      impulseIndex: user.impulseIndex,
      categoryWeight: user.categoryWeight,
    });

    const top5 = products.slice(0, 5);
    if (top5.length === 0) {
      const anyProducts = await prisma.product.findMany({ take: 5 });
      products = anyProducts.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        brand: p.brand,
        rating: p.rating,
      }));
    }
    const candidates = top5.length >= 3 ? top5 : products.slice(0, 5);

    const decision = await generateDecision(parsed, candidates, user);

    await recordEvent(userId, "search", { category: parsed.category, price: parsed.budgetMax });
    await updateProfileFromBehavior(userId, { budgetMax: parsed.budgetMax, category: parsed.category });

    res.json(decision);
  } catch (e) {
    console.error("POST /decision error", e);
    res.status(500).json({ error: "決策生成失敗", detail: String(e) });
  }
});

export default router;

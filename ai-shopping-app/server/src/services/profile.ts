import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface UserProfile {
  id: string;
  priceSensitivity: number;
  impulseIndex: number;
  categoryWeight: Record<string, number>;
}

export async function getOrCreateUser(userId: string): Promise<UserProfile> {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        priceSensitivity: 0.5,
        impulseIndex: 0.5,
        categoryWeight: {},
      },
    });
  }
  return {
    id: user.id,
    priceSensitivity: user.priceSensitivity,
    impulseIndex: user.impulseIndex,
    categoryWeight: (user.categoryWeight as Record<string, number>) || {},
  };
}

export async function recordEvent(
  userId: string,
  type: string,
  data: { price?: number; category?: string }
): Promise<void> {
  await prisma.event.create({
    data: {
      userId,
      type,
      price: data.price ?? null,
      category: data.category ?? null,
    },
  });
}

export async function updateProfileFromBehavior(userId: string, demand: { budgetMax: number; category: string }, chosenPrice?: number): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const events = await prisma.event.findMany({
    where: { userId, createdAt: { gte: since } },
  });

  const withPrice = events.filter((e) => e.price != null);
  const avgPrice = withPrice.length ? withPrice.reduce((s, e) => s + (e.price ?? 0), 0) / withPrice.length : demand.budgetMax;
  const budgetDiff = Math.abs(avgPrice - demand.budgetMax) / (demand.budgetMax || 1);
  const priceSensitivity = Math.max(0.1, Math.min(0.9, 0.5 + budgetDiff * 0.3));

  const categoryCount: Record<string, number> = {};
  for (const e of events) {
    if (e.category) categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
  }
  const total = Object.values(categoryCount).reduce((a, b) => a + b, 0) || 1;
  const categoryWeight: Record<string, number> = {};
  for (const [cat, count] of Object.entries(categoryCount)) {
    categoryWeight[cat] = Math.min(1, (count / total) * 2);
  }
  if (demand.category) {
    categoryWeight[demand.category] = Math.min(1, (categoryWeight[demand.category] || 0) + 0.2);
  }

  const impulseIndex = user.impulseIndex;
  await prisma.user.update({
    where: { id: userId },
    data: {
      priceSensitivity,
      categoryWeight,
      impulseIndex,
    },
  });
}

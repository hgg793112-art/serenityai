import type { ParsedDemand } from "./parseDemand";

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  brand: string;
  rating: number;
}

export interface UserProfileForMatch {
  priceSensitivity: number;
  impulseIndex: number;
  categoryWeight: Record<string, number>;
}

const CATEGORY_ALIASES: Record<string, string[]> = {
  "筆記本電腦": ["筆記本", "筆電", "輕薄本", "筆記本電腦", "電腦"],
  "手機": ["手機", "智能手機"],
  "耳機": ["耳機", "藍牙耳機", "有線耳機"],
  "家居": ["家居", "家電", "生活"],
};

function categoryMatch(productCategory: string, demandCategory: string): number {
  const demandLower = demandCategory.toLowerCase().trim();
  const productLower = productCategory.toLowerCase().trim();
  if (productLower === demandLower) return 1;
  const aliases = Object.entries(CATEGORY_ALIASES).find(([, aliases]) =>
    aliases.some((a) => a.includes(demandLower) || demandLower.includes(a))
  );
  if (aliases) {
    const [canonical] = aliases;
    const productAliases = CATEGORY_ALIASES[productCategory] || [productCategory];
    if (canonical === productCategory || productAliases.some((a) => demandLower.includes(a))) return 0.9;
  }
  if (demandLower.includes(productLower) || productLower.includes(demandLower)) return 0.7;
  return 0.2;
}

function budgetScore(price: number, budgetMin: number, budgetMax: number): number {
  if (price >= budgetMin && price <= budgetMax) return 1;
  if (budgetMax > 0 && price <= budgetMax * 1.15) return 0.8;
  if (price < budgetMin && budgetMin > 0) return 0.5;
  return Math.max(0, 1 - Math.abs(price - (budgetMin + budgetMax) / 2) / (budgetMax || 1));
}

function historicalWeight(category: string, categoryWeight: Record<string, number>): number {
  const w = categoryWeight[category];
  if (typeof w === "number" && w >= 0) return Math.min(1, w);
  return 0.5;
}

function priceStability(price: number, budgetMax: number, priceSensitivity: number): number {
  if (budgetMax <= 0) return 0.5;
  const ratio = price / budgetMax;
  if (priceSensitivity > 0.6) return ratio <= 1 ? 1 : Math.max(0, 1.5 - ratio);
  return ratio <= 1.2 ? 1 : Math.max(0, 1.2 - (ratio - 1));
}

export function matchScore(
  product: ProductItem,
  demand: ParsedDemand,
  user: UserProfileForMatch
): number {
  const budget = budgetScore(product.price, demand.budgetMin, demand.budgetMax);
  const category = categoryMatch(product.category, demand.category);
  const history = historicalWeight(product.category, user.categoryWeight);
  const stability = priceStability(product.price, demand.budgetMax, user.priceSensitivity);

  return budget * 0.4 + category * 0.3 + history * 0.2 + stability * 0.1;
}

export function sortByMatchScore(
  products: ProductItem[],
  demand: ParsedDemand,
  user: UserProfileForMatch
): ProductItem[] {
  return [...products].sort((a, b) => matchScore(b, demand, user) - matchScore(a, demand, user));
}

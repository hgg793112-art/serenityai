export interface ParsedDemand {
  category: string;
  budgetMin: number;
  budgetMax: number;
  priority: string;
  constraints: string[];
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  brand: string;
  rating: number;
}

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

export interface DecisionResponse {
  solutions: DecisionSolution[];
}

export interface UserProfile {
  id: string;
  priceSensitivity: number;
  impulseIndex: number;
  categoryWeight: Record<string, number>;
}

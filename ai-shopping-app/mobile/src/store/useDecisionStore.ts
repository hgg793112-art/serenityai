import { create } from "zustand";

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

export interface DecisionState {
  solutions: DecisionSolution[] | null;
  loading: boolean;
  error: string | null;
  setSolutions: (s: DecisionSolution[] | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

export const useDecisionStore = create<DecisionState>((set) => ({
  solutions: null,
  loading: false,
  error: null,
  setSolutions: (solutions) => set({ solutions, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, solutions: null }),
  reset: () => set({ solutions: null, error: null }),
}));

import { create } from "zustand";

export interface ProfileState {
  priceSensitivity: number;
  impulseIndex: number;
  categoryWeight: Record<string, number>;
  loading: boolean;
  error: string | null;
  setProfile: (p: { priceSensitivity: number; impulseIndex: number; categoryWeight: Record<string, number> }) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  priceSensitivity: 0.5,
  impulseIndex: 0.5,
  categoryWeight: {},
  loading: false,
  error: null,
  setProfile: (p) => set({ ...p, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

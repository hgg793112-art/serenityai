import axios from "axios";
import { API_BASE, DEMO_USER_ID } from "../constants";

export interface DecisionSolution {
  type: "stable" | "value" | "upgrade";
  products: { id: string; name: string; price: number; reason: string }[];
  reason: string;
}

export interface DecisionResponse {
  solutions: DecisionSolution[];
}

export async function postDecision(input: string, userId: string = DEMO_USER_ID): Promise<DecisionResponse> {
  const { data } = await axios.post<DecisionResponse>(`${API_BASE}/decision`, {
    userId,
    input,
  });
  return data;
}

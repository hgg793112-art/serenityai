import axios from "axios";
import { API_BASE } from "../constants";

export interface ProfileResponse {
  id: string;
  priceSensitivity: number;
  impulseIndex: number;
  categoryWeight: Record<string, number>;
}

export async function getProfile(userId: string): Promise<ProfileResponse> {
  const { data } = await axios.get<ProfileResponse>(`${API_BASE}/profile/${userId}`);
  return data;
}

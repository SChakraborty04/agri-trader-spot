const API_BASE_URL = "https://v-box-backend.vercel.app";

export interface MarketChipAPI {
  id: string;
  name: string;
  emoji: string;
  price: number;
  change: number;
  changePercent: number;
}

export async function fetchTicker(limit: number = 50): Promise<MarketChipAPI[]> {
  const response = await fetch(`${API_BASE_URL}/vboxtrade/ticker?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch ticker data");
  }
  return response.json();
}

const API_BASE_URL = "https://v-box-backend.vercel.app";

export interface MarketChipAPI {
  id: string;
  commodity: string;
  variety: string;
  emoji: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface FPOOfferAPI {
  id: string;
  fpoName: string;
  fpoLogo: string;
  fpoType: string;
  address: string;
  pincode: string;
  commodity: string;
  price: number;
  quantity: number;
  unit: string;
  variety: string;
  minOrderQty: number;
  maxOrderQty: number;
  availableFrom: string;
  verified: boolean;
  grade: string;
}

export async function fetchTicker(limit: number = 50): Promise<MarketChipAPI[]> {
  const response = await fetch(`${API_BASE_URL}/vboxtrade/ticker?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch ticker data");
  }
  return response.json();
}

export async function fetchFPOOffers(commodity: string, variety: string): Promise<FPOOfferAPI[]> {
  const response = await fetch(`${API_BASE_URL}/vboxtrade/fpo-offers?commodity=${encodeURIComponent(commodity)}&variety=${encodeURIComponent(variety)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch FPO offers");
  }
  const data: FPOOfferAPI[] = await response.json();
  // Filter by commodity and variety client-side as API may return all
  return data.filter(
    (offer) => 
      offer.commodity.toLowerCase() === commodity.toLowerCase() && 
      offer.variety.toLowerCase() === variety.toLowerCase()
  );
}
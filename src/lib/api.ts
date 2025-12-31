// Read API hosts from environment (Vite). Falls back to known defaults.
const API_PRIMARY = import.meta.env.VITE_API_PRIMARY ?? "https://api3.boxfarming.in";
const API_FALLBACK = import.meta.env.VITE_API_FALLBACK ?? "https://v-box-backend.vercel.app";

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

// Auth related types (from OpenAPI)
export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

const AUTH_TOKEN_KEY = "api_token";

export function setAuthToken(token: string) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {}
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {}
}

async function fetchWithFallback(path: string, options?: RequestInit): Promise<Response> {
  const urlPrimary = `${API_PRIMARY}${path.startsWith("/") ? path : `/${path}`}`;
  const urlFallback = `${API_FALLBACK}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(urlPrimary, options);
    if (res.ok) return res;
  } catch (e) {}

  const res2 = await fetch(urlFallback, options);
  if (!res2.ok) throw new Error(`Failed to fetch ${path}`);
  return res2;
}

export async function fetchTicker(limit: number = 50): Promise<MarketChipAPI[]> {
  const response = await fetchWithFallback(`/vboxtrade/ticker?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch ticker data");
  }
  return response.json();
}

export async function fetchFPOOffers(commodity: string, variety: string): Promise<FPOOfferAPI[]> {
  const q = `?commodity=${encodeURIComponent(commodity)}&variety=${encodeURIComponent(variety)}`;
  const response = await fetchWithFallback(`/vboxtrade/fpo-offers${q}`);
  if (!response.ok) {
    throw new Error("Failed to fetch FPO offers");
  }
  const data: FPOOfferAPI[] = await response.json();
  // Filter by commodity and variety client-side as API may return all
  return data.filter((offer) => offer.commodity.toLowerCase() === commodity.toLowerCase() && offer.variety.toLowerCase() === variety.toLowerCase());
}

export async function fetchAllFPOOffers(): Promise<FPOOfferAPI[]> {
  const response = await fetchWithFallback(`/vboxtrade/fpo-offers`);
  if (!response.ok) {
    throw new Error("Failed to fetch FPO offers");
  }
  return response.json();
}

// Auth endpoints
export async function register(name: string, email: string, phone?: string): Promise<RegisterResponse> {
  const res = await fetchWithFallback(`/vboxtrade/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone }),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  const res = await fetchWithFallback(`/vboxtrade/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) throw new Error("OTP verification failed");
  const data: VerifyOtpResponse = await res.json();
  if (data.token) setAuthToken(data.token);
  return data;
}

export async function resendOtp(email: string): Promise<RegisterResponse> {
  const res = await fetchWithFallback(`/vboxtrade/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Resend OTP failed");
  return res.json();
}

export async function getProfile(): Promise<AuthUser> {
  const token = getAuthToken();
  if (!token) throw new Error("No auth token");
  const res = await fetchWithFallback(`/vboxtrade/auth/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  const data = await res.json();
  return data as AuthUser;
}
const API_BASE_URL = "https://api3.boxfarming.in";
const AUTH_BASE_URL = `${API_BASE_URL}/vboxtrade/auth`;

// Auth Types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

export interface AuthError {
  detail: string;
}

// Auth API Functions
export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error: AuthError = await response.json();
    throw new Error(error.detail || "Failed to send OTP");
  }
  
  return response.json();
}

export async function verifyOTP(data: VerifyOTPRequest): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error: AuthError = await response.json();
    throw new Error(error.detail || "OTP verification failed");
  }
  
  return response.json();
}

export async function resendOTP(email: string): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    const error: AuthError = await response.json();
    throw new Error(error.detail || "Failed to resend OTP");
  }
  
  return response.json();
}

export async function getProfile(token: string): Promise<AuthUser> {
  const response = await fetch(`${AUTH_BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    const error: AuthError = await response.json();
    throw new Error(error.detail || "Failed to fetch profile");
  }
  
  return response.json();
}

// Market Types
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
  return data.filter(
    (offer) => 
      offer.commodity.toLowerCase() === commodity.toLowerCase() && 
      offer.variety.toLowerCase() === variety.toLowerCase()
  );
}

export async function fetchAllFPOOffers(): Promise<FPOOfferAPI[]> {
  const response = await fetch(`${API_BASE_URL}/vboxtrade/fpo-offers`);
  if (!response.ok) {
    throw new Error("Failed to fetch FPO offers");
  }
  return response.json();
}

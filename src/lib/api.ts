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

// Quotation types
export interface QuotationRequest {
  seller_price_id: number;
  quantity: number;
  offer_price?: number;
  delivery_date?: string;
  delivery_location?: string;
  payment_terms?: string;
  valid_until?: string;
  notes?: string;
}

export interface QuotationResponse {
  id: string;
  quotation_number: string;
  quotation_date: string;
  seller_price_id: number;
  seller_name: string;
  commodity_name: string;
  variety_name: string;
  quantity: number;
  unit_of_measure: string;
  offer_price: number;
  currency: string;
  delivery_date: string | null;
  delivery_location: string | null;
  payment_terms: string | null;
  valid_until: string | null;
  status: "pending" | "negotiating" | "accepted" | "rejected" | "expired" | "converted_to_order";
  notes: string | null;
  created_at: string;
}

export interface QuotationsListResponse {
  quotations: QuotationResponse[];
  total: number;
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

// Auth endpoints - use Vercel API directly
const AUTH_API = "https://v-box-backend.vercel.app";

export async function register(name: string, email: string, phone?: string): Promise<RegisterResponse> {
  const res = await fetch(`${AUTH_API}/vboxtrade/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone }),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  const res = await fetch(`${AUTH_API}/vboxtrade/auth/verify-otp`, {
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
  const res = await fetch(`${AUTH_API}/vboxtrade/auth/resend-otp`, {
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

// Quotation endpoints
export async function createQuotation(data: QuotationRequest): Promise<QuotationResponse> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to create a quotation");
  
  const res = await fetchWithFallback(`/vboxtrade/quotations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to create quotation" }));
    throw new Error(error.detail || "Failed to create quotation");
  }
  
  return res.json();
}

export async function fetchQuotations(limit: number = 50, offset: number = 0): Promise<QuotationsListResponse> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to view quotations");
  
  const res = await fetchWithFallback(`/vboxtrade/quotations/?limit=${limit}&offset=${offset}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch quotations" }));
    throw new Error(error.detail || "Failed to fetch quotations");
  }
  
  return res.json();
}

// ============= Orders API =============

export interface OrderCreateRequest {
  quotation_id?: number;
  variety_id?: number;
  order_quantity?: number;
  unit_of_measure?: number;
  unit_price?: number;
  currency: string;
  delivery_date?: string;
  delivery_location?: string;
  payment_terms?: number;
  special_instructions?: string;
}

export interface OrderResponse {
  order_id: number;
  order_number: string;
  order_date: string;
  quotation_id: number | null;
  seller_name: string;
  buyer_name: string;
  commodity_name: string;
  variety_name: string;
  order_quantity: number;
  unit_of_measure: string;
  unit_price: number;
  currency: string;
  total_amount: number;
  delivery_date: string | null;
  delivery_location: string | null;
  payment_terms: string | null;
  order_status: string;
  special_instructions: string | null;
  confirmed_at: string | null;
  outstanding_amount: number;
  created_at: string;
}

export interface OrderStatusHistoryResponse {
  history_id: number;
  status_code: string;
  status_description: string;
  changed_by: number;
  changed_at: string;
  comments: string | null;
}

export interface OrderPaymentResponse {
  payment_id: number;
  payment_type: string;
  payment_amount: number;
  payment_mode: string;
  payment_status: string;
  transaction_reference: string | null;
  payment_gateway: string | null;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
}

export interface OrderDetailResponse extends OrderResponse {
  status_history: OrderStatusHistoryResponse[];
  payments: OrderPaymentResponse[];
}

export interface OrderListResponse {
  orders: OrderResponse[];
  total: number;
}

export interface OrderPaymentCreate {
  payment_type: string;
  payment_amount: number;
  payment_mode: string;
  transaction_reference?: string;
  payment_gateway?: string;
  discount_amount: number;
  tax_amount: number;
}

// Create order (typically from a quotation)
export async function createOrder(data: OrderCreateRequest): Promise<OrderResponse> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to create an order");

  const res = await fetchWithFallback(`/vboxtrade/orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to create order" }));
    throw new Error(error.detail || "Failed to create order");
  }

  return res.json();
}

// List orders for the authenticated user
export async function fetchOrders(
  role: "buyer" | "seller" = "buyer",
  limit: number = 50,
  offset: number = 0
): Promise<OrderListResponse> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to view orders");

  const res = await fetchWithFallback(
    `/vboxtrade/orders/?role=${role}&limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch orders" }));
    throw new Error(error.detail || "Failed to fetch orders");
  }

  return res.json();
}

// Get order details including status history and payments
export async function fetchOrderDetail(orderId: number): Promise<OrderDetailResponse> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to view order details");

  const res = await fetchWithFallback(`/vboxtrade/orders/${orderId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Order not found" }));
    throw new Error(error.detail || "Order not found");
  }

  return res.json();
}

// Update order status
export async function updateOrderStatus(
  orderId: number,
  statusId: number,
  comments?: string
): Promise<OrderResponse> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to update order status");

  const res = await fetchWithFallback(`/vboxtrade/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: statusId, comments }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to update status" }));
    throw new Error(error.detail || "Failed to update status");
  }

  return res.json();
}

// Record a payment for an order
export async function recordOrderPayment(
  orderId: number,
  payment: OrderPaymentCreate
): Promise<OrderPaymentResponse> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to record payment");

  const res = await fetchWithFallback(`/vboxtrade/orders/${orderId}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payment),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to record payment" }));
    throw new Error(error.detail || "Failed to record payment");
  }

  return res.json();
}
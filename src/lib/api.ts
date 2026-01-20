// Read API hosts from environment (Vite). Falls back to known defaults.
const API_PRIMARY = import.meta.env.VITE_API_PRIMARY ?? "https://api3.boxfarming.in";
const API_FALLBACK = import.meta.env.VITE_API_FALLBACK ?? "https://v-box-backend.vercel.app";

import { addDebugEntry, ApiDebugEntry } from "@/hooks/useApiDebug";

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
  payment_terms?: number; // Changed to number (ID from master_payment_terms)
  valid_until?: string;
  notes?: string;
}

// Payment Terms types - support all possible field name variations
export interface PaymentTermRaw {
  termid?: number;
  term_id?: number;
  id?: number;
  payment_term_id?: number;
  termname?: string;
  term_name?: string;
  name?: string;
  payment_term_name?: string;
  payment_term_code?: string;
  description?: string;
}

export interface PaymentTerm {
  id: number;
  name: string;
  description?: string;
}

// Fetch payment terms from API
export async function fetchPaymentTerms(): Promise<PaymentTerm[]> {
  // Try /vboxtrade/payment-terms first, fallback to /vboxtrade/master/payment-terms
  let res: Response;
  try {
    res = await fetchWithFallback(`/vboxtrade/payment-terms`);
    if (!res.ok) throw new Error("Not found");
  } catch {
    res = await fetchWithFallback(`/vboxtrade/master/payment-terms`);
  }
  
  if (!res.ok) {
    throw new Error("Failed to fetch payment terms");
  }
  
  const rawData = await res.json();
  
  // Handle both array and object with terms property
  const data: PaymentTermRaw[] = Array.isArray(rawData) ? rawData : (rawData.terms || rawData.data || []);
  
  // Normalize the response to a consistent format - check all possible field names
  return data.map((term) => ({
    id: term.payment_term_id ?? term.termid ?? term.term_id ?? term.id ?? 0,
    name: term.payment_term_name ?? term.termname ?? term.term_name ?? term.name ?? "Unknown",
    description: term.description,
  }));
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
  const method = options?.method || "GET";

  const debugEntry: ApiDebugEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date(),
    path,
    method,
    primary: { url: urlPrimary },
    success: false,
  };

  // Try primary
  try {
    const res = await fetch(urlPrimary, options);
    const body = await res.clone().text().catch(() => "");
    
    debugEntry.primary.status = res.status;
    debugEntry.primary.statusText = res.statusText;
    debugEntry.primary.body = body;

    if (res.ok) {
      debugEntry.success = true;
      addDebugEntry(debugEntry);
      return res;
    }
  } catch (e) {
    debugEntry.primary.error = e instanceof Error ? e.message : String(e);
  }

  // Fallback
  debugEntry.fallback = { url: urlFallback };

  let res2: Response;
  try {
    res2 = await fetch(urlFallback, options);
  } catch (e) {
    debugEntry.fallback.error = e instanceof Error ? e.message : String(e);
    addDebugEntry(debugEntry);
    throw new Error(
      `Request failed for ${path}\n` +
        `Primary: ${urlPrimary} -> ${debugEntry.primary.error || `${debugEntry.primary.status} ${debugEntry.primary.statusText}`}\n` +
        `Fallback: ${urlFallback} -> network error: ${debugEntry.fallback.error}`
    );
  }

  const body2 = await res2.clone().text().catch(() => "");
  debugEntry.fallback.status = res2.status;
  debugEntry.fallback.statusText = res2.statusText;
  debugEntry.fallback.body = body2;

  if (res2.ok) {
    debugEntry.success = true;
    addDebugEntry(debugEntry);
    return res2;
  }

  addDebugEntry(debugEntry);
  throw new Error(
    `Request failed for ${path}\n` +
      `Primary: ${urlPrimary} -> ${debugEntry.primary.error || `${debugEntry.primary.status} ${debugEntry.primary.statusText}`}\n` +
      `Fallback: ${urlFallback} -> ${res2.status} ${res2.statusText}${body2 ? ` | ${body2.slice(0, 400)}` : ""}`
  );
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

  const res = await fetchWithFallback(`/vboxtrade/orders`, {
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
    `/vboxtrade/orders?role=${role}&limit=${limit}&offset=${offset}`,
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

// ============= Profile API =============

export interface PersonalProfileAPI {
  first_name: string;
  last_name: string;
  display_name: string;
  date_of_birth: string | null;
  gender: "male" | "female" | null;
  profile_picture: string | null;
}

export interface BusinessProfileAPI {
  id?: number;
  business_name: string;
  legal_business_name: string;
  contact_person_name: string;
  contact_phone_number: string;
}

export interface AddressAPI {
  id: number;
  address_type: "business" | "warehouse" | "other";
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

export interface KYCDetailsAPI {
  pan_number: string;
  pan_file: string | null;
  gstin_number: string | null;
  gstin_file: string | null;
}

export interface FullProfileResponse {
  personal: PersonalProfileAPI | null;
  business: BusinessProfileAPI | null;
  addresses: AddressAPI[];
  kyc: KYCDetailsAPI | null;
}

// Fetch full profile data
export async function fetchFullProfile(): Promise<FullProfileResponse> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to view profile");

  const res = await fetchWithFallback(`/vboxtrade/buyer/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    // Return empty defaults if profile doesn't exist yet
    if (res.status === 404) {
      return {
        personal: null,
        business: null,
        addresses: [],
        kyc: null,
      };
    }
    const error = await res.json().catch(() => ({ detail: "Failed to fetch profile" }));
    throw new Error(error.detail || "Failed to fetch profile");
  }

  return res.json();
}

// Update personal profile
export async function updatePersonalProfile(data: PersonalProfileAPI): Promise<PersonalProfileAPI> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to update profile");

  const res = await fetchWithFallback(`/vboxtrade/buyer/profile/personal`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to update personal profile" }));
    throw new Error(error.detail || "Failed to update personal profile");
  }

  return res.json();
}

// Update/Create business profile
export async function updateBusinessProfile(data: BusinessProfileAPI): Promise<BusinessProfileAPI> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to update profile");

  const res = await fetchWithFallback(`/vboxtrade/buyer/profile/business`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to update business profile" }));
    throw new Error(error.detail || "Failed to update business profile");
  }

  return res.json();
}

// Fetch addresses
export async function fetchAddresses(): Promise<AddressAPI[]> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to view addresses");

  const res = await fetchWithFallback(`/vboxtrade/buyer/addresses`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 404) return [];
    const error = await res.json().catch(() => ({ detail: "Failed to fetch addresses" }));
    throw new Error(error.detail || "Failed to fetch addresses");
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.addresses || [];
}

// Add new address
export async function createAddress(data: Omit<AddressAPI, "id">): Promise<AddressAPI> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to add address");

  const res = await fetchWithFallback(`/vboxtrade/buyer/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to add address" }));
    throw new Error(error.detail || "Failed to add address");
  }

  return res.json();
}

// Update existing address
export async function updateAddressAPI(id: number, data: Partial<AddressAPI>): Promise<AddressAPI> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to update address");

  const res = await fetchWithFallback(`/vboxtrade/buyer/addresses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to update address" }));
    throw new Error(error.detail || "Failed to update address");
  }

  return res.json();
}

// Delete address
export async function deleteAddressAPI(id: number): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to delete address");

  const res = await fetchWithFallback(`/vboxtrade/buyer/addresses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to delete address" }));
    throw new Error(error.detail || "Failed to delete address");
  }
}

// Update KYC details
export async function updateKYCDetails(data: KYCDetailsAPI): Promise<KYCDetailsAPI> {
  const token = getAuthToken();
  if (!token) throw new Error("Please login to update KYC");

  const res = await fetchWithFallback(`/vboxtrade/buyer/profile/kyc`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to update KYC details" }));
    throw new Error(error.detail || "Failed to update KYC details");
  }

  return res.json();
}

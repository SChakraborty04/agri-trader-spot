import { FPOOfferAPI } from "@/lib/api";

// Simple global state for auth dialog - no external dependencies
interface AuthDialogState {
  isOpen: boolean;
  mode: 'login' | 'register';
  pendingOffer: FPOOfferAPI | null;
}

let listeners: Set<() => void> = new Set();
let state: AuthDialogState = { isOpen: false, mode: 'login', pendingOffer: null };

function notify() {
  listeners.forEach((l) => l());
}

export function openLoginDialog(pendingOffer?: FPOOfferAPI) {
  state = { isOpen: true, mode: 'login', pendingOffer: pendingOffer || null };
  notify();
}

export function openRegisterDialog() {
  state = { isOpen: true, mode: 'register', pendingOffer: null };
  notify();
}

export function closeAuthDialog() {
  state = { ...state, isOpen: false };
  notify();
}

export function clearPendingOffer() {
  state = { ...state, pendingOffer: null };
  notify();
}

export function getPendingOffer(): FPOOfferAPI | null {
  return state.pendingOffer;
}

export function getAuthDialogState() {
  return state;
}

export function subscribeAuthDialog(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

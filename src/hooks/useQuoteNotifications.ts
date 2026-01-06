import { useEffect, useRef, useCallback } from "react";
import { fetchQuotations, QuotationResponse, getAuthToken } from "@/lib/api";
import { toast } from "sonner";

const POLL_INTERVAL = 60000; // Poll every 60 seconds
const STORAGE_KEY = "quote_status_cache";

interface StatusCache {
  [quotationNumber: string]: QuotationResponse["status"];
}

function getStatusLabel(status: QuotationResponse["status"]): string {
  const labels: Record<QuotationResponse["status"], string> = {
    pending: "Pending",
    negotiating: "Negotiating",
    accepted: "Accepted",
    rejected: "Rejected",
    expired: "Expired",
    converted_to_order: "Converted to Order",
  };
  return labels[status] || status;
}

function getStatusEmoji(status: QuotationResponse["status"]): string {
  const emojis: Record<QuotationResponse["status"], string> = {
    pending: "⏳",
    negotiating: "💬",
    accepted: "✅",
    rejected: "❌",
    expired: "⌛",
    converted_to_order: "📦",
  };
  return emojis[status] || "📋";
}

export function useQuoteNotifications() {
  const intervalRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);

  const getStoredCache = useCallback((): StatusCache => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const setStoredCache = useCallback((cache: StatusCache) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {}
  }, []);

  const checkForUpdates = useCallback(async () => {
    const token = getAuthToken();
    if (!token || isPollingRef.current) return;

    isPollingRef.current = true;

    try {
      const response = await fetchQuotations(50, 0);
      const currentCache = getStoredCache();
      const newCache: StatusCache = {};
      
      for (const quote of response.quotations) {
        newCache[quote.quotation_number] = quote.status;
        
        const previousStatus = currentCache[quote.quotation_number];
        
        // Only notify if we have a previous status and it changed
        if (previousStatus && previousStatus !== quote.status) {
          const emoji = getStatusEmoji(quote.status);
          const statusLabel = getStatusLabel(quote.status);
          
          toast.info(`${emoji} Quote ${quote.quotation_number}`, {
            description: `Status changed to "${statusLabel}"`,
            action: {
              label: "View",
              onClick: () => {
                window.location.href = `/quote/${quote.quotation_number}`;
              },
            },
          });
        }
      }

      setStoredCache(newCache);
    } catch (err) {
      // Silently fail - don't spam user with errors
      console.error("Quote notification poll failed:", err);
    } finally {
      isPollingRef.current = false;
    }
  }, [getStoredCache, setStoredCache]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    
    // Initial check
    checkForUpdates();
    
    // Start interval
    intervalRef.current = window.setInterval(checkForUpdates, POLL_INTERVAL);
  }, [checkForUpdates]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      startPolling();
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  return {
    checkForUpdates,
    startPolling,
    stopPolling,
  };
}

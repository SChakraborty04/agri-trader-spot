import { useState, useCallback } from "react";

export interface ApiDebugEntry {
  id: string;
  timestamp: Date;
  path: string;
  method: string;
  primary: {
    url: string;
    status?: number;
    statusText?: string;
    body?: string;
    error?: string;
  };
  fallback?: {
    url: string;
    status?: number;
    statusText?: string;
    body?: string;
    error?: string;
  };
  success: boolean;
}

// Global debug log storage
let debugLog: ApiDebugEntry[] = [];
let listeners: Set<() => void> = new Set();

export function addDebugEntry(entry: ApiDebugEntry) {
  debugLog = [entry, ...debugLog].slice(0, 50); // Keep last 50 entries
  listeners.forEach((l) => l());
}

export function clearDebugLog() {
  debugLog = [];
  listeners.forEach((l) => l());
}

export function getDebugLog() {
  return debugLog;
}

export function useApiDebug() {
  const [, setTick] = useState(0);

  const subscribe = useCallback(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  // Subscribe on mount
  useState(() => {
    const unsub = subscribe();
    return unsub;
  });

  return {
    entries: debugLog,
    clear: clearDebugLog,
  };
}

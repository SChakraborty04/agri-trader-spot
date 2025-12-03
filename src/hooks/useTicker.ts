import { useQuery } from "@tanstack/react-query";
import { fetchTicker, MarketChipAPI } from "@/lib/api";

export function useTicker(limit: number = 50) {
  return useQuery<MarketChipAPI[], Error>({
    queryKey: ["ticker", limit],
    queryFn: () => fetchTicker(limit),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

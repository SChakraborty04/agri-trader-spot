import { useEffect, useState } from "react";
import { useTicker } from "@/hooks/useTicker";
import { cn } from "@/lib/utils";

export const PriceTicker = () => {
  const [offset, setOffset] = useState(0);
  const { data: tickerData } = useTicker(50);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % 100);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const tickerItems = tickerData ? [...tickerData, ...tickerData] : [];

  if (!tickerData || tickerData.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden bg-primary/10 border-b border-primary/10 backdrop-blur-xl py-2.5">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{
          transform: `translateX(-${offset}%)`,
          transition: "transform 0.05s linear",
        }}
      >
        {tickerItems.map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{item.commodity}</span>
            <span className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</span>
            <span
              className={cn(
                "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                item.change >= 0 
                  ? "bg-gain/10 text-gain" 
                  : "bg-loss/10 text-loss"
              )}
            >
              {item.change >= 0 ? "+" : ""}
              {item.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

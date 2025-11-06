import { useEffect, useState } from "react";
import { marketChips } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export const PriceTicker = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % 100);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const tickerItems = [...marketChips, ...marketChips];

  return (
    <div className="relative w-full overflow-hidden bg-card border-y border-border py-2">
      <div
        className="flex gap-6 whitespace-nowrap"
        style={{
          transform: `translateX(-${offset}%)`,
          transition: "transform 0.05s linear",
        }}
      >
        {tickerItems.map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{item.name}</span>
            <span className="text-muted-foreground">₹{item.price.toFixed(2)}</span>
            <span
              className={cn(
                "font-semibold",
                item.change >= 0 ? "text-gain" : "text-loss"
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

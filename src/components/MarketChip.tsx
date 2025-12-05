import { TrendingUp, TrendingDown } from "lucide-react";
import { MarketChip as MarketChipType } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MarketChipProps {
  data: MarketChipType;
}

export const MarketChip = ({ data }: MarketChipProps) => {
  const isPositive = data.change >= 0;
  const navigate = useNavigate();

  const slug = `${data.commodity.toLowerCase().replace(/\s+/g, '')}-${data.variety.toLowerCase().replace(/\s+/g, '')}`;

  return (
    <div
      onClick={() => navigate(`/${slug}`)}
      className={cn(
        "apple-card p-4 cursor-pointer press-effect group",
        "hover:shadow-apple-lg"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
          {data.emoji}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">
            {data.commodity}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {data.variety}
          </span>
        </div>
      </div>
      
      <div className="mt-3 flex items-end justify-between">
        <span className="text-lg font-bold text-foreground">
          ₹{data.price.toFixed(2)}
          <span className="text-xs font-normal text-muted-foreground">/kg</span>
        </span>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
          isPositive 
            ? "bg-gain/10 text-gain" 
            : "bg-loss/10 text-loss"
        )}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>
            {isPositive ? "+" : ""}{data.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};

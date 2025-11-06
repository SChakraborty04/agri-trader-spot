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

  return (
    <div
      onClick={() => navigate(`/commodity/${data.name}`)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 cursor-pointer",
        isPositive 
          ? "bg-gain-light border-gain/20 hover:border-gain/40" 
          : "bg-loss-light border-loss/20 hover:border-loss/40"
      )}
    >
      <span className="text-2xl flex-shrink-0">{data.emoji}</span>
      <div className="flex flex-col flex-1">
        <span className="text-sm font-medium text-foreground">
          {data.name}
        </span>
        <span className="text-xs font-semibold text-foreground whitespace-nowrap">
          ₹{data.price.toFixed(2)}/kg
        </span>
      </div>
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-gain" />
        ) : (
          <TrendingDown className="w-4 h-4 text-loss" />
        )}
        <span
          className={cn(
            "text-xs font-bold",
            isPositive ? "text-gain" : "text-loss"
          )}
        >
          {isPositive ? "+" : ""}
          {data.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

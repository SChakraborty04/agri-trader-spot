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
      onClick={() => navigate(`/commodity/${data.commodity}`)}
      className={cn(
        "flex items-center gap-3 px-6 py-4 rounded-lg border transition-all duration-300 cursor-pointer",
        isPositive 
          ? "bg-gain-light border-gain/20 hover:border-gain/40" 
          : "bg-loss-light border-loss/20 hover:border-loss/40"
      )}
    >
      <span className="text-3xl flex-shrink-0">{data.emoji}</span>
      <div className="flex flex-col flex-1">
        <span className="text-base font-medium text-foreground">
          {data.commodity} - {data.variety}
        </span>
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
          ₹{data.price.toFixed(2)}/kg
        </span>
      </div>
      <div className="flex items-center gap-2">
        {isPositive ? (
          <TrendingUp className="w-5 h-5 text-gain" />
        ) : (
          <TrendingDown className="w-5 h-5 text-loss" />
        )}
        <span
          className={cn(
            "text-sm font-bold",
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

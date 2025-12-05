import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.div
      onClick={() => navigate(`/${slug}`)}
      className="apple-card p-4 cursor-pointer"
      whileHover={{ 
        y: -3, 
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08), 0 6px 12px rgba(0, 0, 0, 0.04)" 
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
    >
      <div className="flex items-center gap-3">
        <motion.div 
          className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl"
          whileHover={{ scale: 1.05, rotate: 3 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
        >
          {data.emoji}
        </motion.div>
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
        <motion.div 
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
            isPositive 
              ? "bg-gain/10 text-gain" 
              : "bg-loss/10 text-loss"
          )}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>
            {isPositive ? "+" : ""}{data.changePercent.toFixed(2)}%
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

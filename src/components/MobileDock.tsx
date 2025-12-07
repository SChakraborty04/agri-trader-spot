import { Home, Wheat, Store, Search, TrendingUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const dockItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Wheat, label: "Crops", path: "/all-crops" },
  { icon: Store, label: "FPOs", path: "/all-fpos" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: TrendingUp, label: "Quotes", path: "/quote-tracking" },
];

// Simulate haptic feedback via vibration API (if supported)
const triggerHaptic = (style: "light" | "medium" | "heavy" = "light") => {
  if ("vibrate" in navigator) {
    const patterns = { light: 10, medium: 20, heavy: 30 };
    navigator.vibrate(patterns[style]);
  }
};

export const MobileDock = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    triggerHaptic("light");
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Blur background */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" 
      />
      
      {/* Dock container */}
      <nav className="relative flex items-end justify-around px-2 pb-safe pt-2">
        {dockItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                delay: index * 0.05 
              }}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-2xl min-w-[56px]",
                "transition-colors duration-200",
                "hover:bg-secondary/60",
              )}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isActive ? "hsl(var(--primary))" : "transparent",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl",
                  isActive 
                    ? "text-primary-foreground shadow-apple-md" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              
              {/* Active indicator dot */}
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1 : 0,
                  opacity: isActive ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-1 h-1 rounded-full bg-primary"
              />
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};

import { Home, Wheat, Store, Search, TrendingUp, Truck, History } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const dockItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Wheat, label: "Crops", path: "/all-crops" },
  { icon: Store, label: "FPOs", path: "/all-fpos" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: TrendingUp, label: "Quotes", path: "/quote-tracking" },
];

export const MobileDock = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Blur background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      
      {/* Dock container */}
      <nav className="relative flex items-end justify-around px-2 pb-safe pt-2">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-2xl min-w-[56px]",
                "transition-all duration-200 ease-apple",
                "active:scale-90",
                "hover:bg-secondary/60",
                isActive && "dock-item-active"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl",
                  "transition-all duration-200 ease-apple",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-apple-md scale-110" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              
              {/* Active indicator dot */}
              <div
                className={cn(
                  "w-1 h-1 rounded-full transition-all duration-200",
                  isActive 
                    ? "bg-primary opacity-100 scale-100" 
                    : "opacity-0 scale-0"
                )}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

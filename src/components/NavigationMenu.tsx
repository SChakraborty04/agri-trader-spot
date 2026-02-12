import { Menu, Home, Search, History, TrendingUp, Truck, Wheat, Store, Heart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Wheat, label: "All Crops", path: "/all-crops" },
  { icon: Store, label: "All FPOs", path: "/all-fpos" },
  { icon: Heart, label: "Watchlist", path: "/watchlist" },
  { icon: Search, label: "Advanced Search", path: "/search" },
  { icon: TrendingUp, label: "Quote Tracking", path: "/quote-tracking" },
  { icon: Truck, label: "Order Tracking", path: "/order-tracking" },
  { icon: History, label: "Quote History", path: "/quote-history" },
];

export const NavigationMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex items-center gap-3">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl hover:bg-secondary/80 press-effect"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0 border-r border-border/50">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
            <SheetTitle className="flex items-center gap-3">
              <img src={logo} alt="BoxFarming" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-semibold">BoxFarming</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start rounded-xl h-12 px-4 press-effect",
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-secondary/80"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className={cn(
                    "w-5 h-5 mr-3",
                    isActive && "text-primary"
                  )} />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

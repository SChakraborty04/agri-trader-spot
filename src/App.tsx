import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import Search from "./pages/Search";
import AllCrops from "./pages/AllCrops";
import AllFPOs from "./pages/AllFPOs";
import CommodityDetail from "./pages/CommodityDetail";
import QuoteTracking from "./pages/QuoteTracking";
import QuoteHistory from "./pages/QuoteHistory";
import QuoteDetail from "./pages/QuoteDetail";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  duration: 0.25,
};

// Animated routes wrapper
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/all-crops" element={<AllCrops />} />
          <Route path="/all-fpos" element={<AllFPOs />} />
          <Route path="/:slug" element={<CommodityDetail />} />
          <Route path="/quote-tracking" element={<QuoteTracking />} />
          <Route path="/quote-history" element={<QuoteHistory />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/quote/:quoteNo" element={<QuoteDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

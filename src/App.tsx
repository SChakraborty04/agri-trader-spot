import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
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
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/all-crops" element={<AllCrops />} />
            <Route path="/all-fpos" element={<AllFPOs />} />
            <Route path="/:slug" element={<CommodityDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/quote-tracking" element={<QuoteTracking />} />
            <Route path="/quote-history" element={<QuoteHistory />} />
            <Route path="/order-tracking" element={<OrderTracking />} />
            <Route path="/quote/:quoteNo" element={<QuoteDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

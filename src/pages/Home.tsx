import { useState } from "react";
import { NavigationMenu } from "@/components/NavigationMenu";
import { MarketChip } from "@/components/MarketChip";
import { FPOCard } from "@/components/FPOCard";
import { PriceTicker } from "@/components/PriceTicker";
import { Button } from "@/components/ui/button";
import { fpoOffers } from "@/lib/mockData";
import { useTicker } from "@/hooks/useTicker";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Home = () => {
  const { data: tickerData, isLoading, error } = useTicker(50);
  const [page, setPage] = useState(0);
  const itemsPerPage = 6;
  
  const totalPages = tickerData ? Math.ceil(tickerData.length / itemsPerPage) : 0;
  const visibleData = tickerData?.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="absolute left-4">
              <NavigationMenu />
            </div>
            <h1 className="text-2xl font-bold text-primary">VBOX Trading</h1>
          </div>
        </div>
      </header>

      {/* Price Ticker */}
      <PriceTicker />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Market Overview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Market Overview
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {tickerData ? `${page + 1}/${totalPages}` : ''}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))
            ) : error ? (
              <p className="text-destructive col-span-full">Failed to load market data</p>
            ) : (
              visibleData?.map((chip) => (
                <MarketChip key={chip.id} data={chip} />
              ))
            )}
          </div>
        </section>

        {/* FPO Offers */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Latest FPO Offers
            </h2>
            <Button variant="link" className="text-primary">
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fpoOffers.map((offer) => (
              <FPOCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

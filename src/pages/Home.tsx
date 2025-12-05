import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationMenu } from "@/components/NavigationMenu";
import { MarketChip } from "@/components/MarketChip";
import { PriceTicker } from "@/components/PriceTicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTicker } from "@/hooks/useTicker";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, MapPin, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllFPOOffers } from "@/lib/api";

const Home = () => {
  const navigate = useNavigate();
  const { data: tickerData, isLoading, error } = useTicker(50);
  const [page, setPage] = useState(0);
  const itemsPerPage = 6;
  
  const { data: fpoOffers = [], isLoading: fpoLoading } = useQuery({
    queryKey: ['all-fpo-offers'],
    queryFn: fetchAllFPOOffers,
  });

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
              <Button variant="link" className="text-primary px-0" onClick={() => navigate("/all-crops")}>
                View All
              </Button>
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
            <span className="text-sm text-muted-foreground">
              {fpoOffers.length} offers
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fpoLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))
            ) : (
              fpoOffers.slice(0, 12).map((offer) => {
                const addressParts = offer.address.split(", ");
                const state = addressParts[addressParts.length - 1] || "";
                const district = addressParts[addressParts.length - 2] || "";
                const slug = `${offer.commodity.toLowerCase().replace(/\s+/g, '')}-${offer.variety.toLowerCase().replace(/\s+/g, '')}`;

                return (
                  <Card 
                    key={offer.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/${slug}`)}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header with Badge */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <span className="text-xl">🏢</span>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm">
                              {offer.fpoName}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{district}, {state}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400 text-xs">
                          {offer.fpoType}
                        </Badge>
                      </div>

                      {/* Commodity Info */}
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Commodity</span>
                          <span className="font-medium">{offer.commodity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Variety</span>
                          <span className="font-medium">{offer.variety}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Grade</span>
                          <Badge variant="destructive" className="bg-red-500 text-xs">
                            {offer.grade}
                          </Badge>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          ₹{offer.price}/{offer.unit}
                        </span>
                        <Button size="sm" variant="outline">
                          <Package className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
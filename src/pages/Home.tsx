import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationMenu } from "@/components/NavigationMenu";
import { MarketChip } from "@/components/MarketChip";
import { PriceTicker } from "@/components/PriceTicker";
import { MobileDock } from "@/components/MobileDock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTicker } from "@/hooks/useTicker";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MapPin, FileText, Search, ArrowUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllFPOOffers, FPOOfferAPI } from "@/lib/api";
import { QuoteFormDialog } from "@/components/QuoteFormDialog";
import { FPOOffer } from "@/lib/mockData";

type SortOption = "price-asc" | "price-desc" | "commodity" | "location";

const Home = () => {
  const navigate = useNavigate();
  const { data: tickerData, isLoading, error } = useTicker(50);
  const [page, setPage] = useState(0);
  const [fpoPage, setFpoPage] = useState(0);
  const itemsPerPage = 6;
  const fpoItemsPerPage = 6;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<FPOOffer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  
  const { data: fpoOffers = [], isLoading: fpoLoading } = useQuery({
    queryKey: ['all-fpo-offers'],
    queryFn: fetchAllFPOOffers,
  });

  const totalPages = tickerData ? Math.ceil(tickerData.length / itemsPerPage) : 0;
  const visibleData = tickerData?.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const filteredAndSortedFPOs = useMemo(() => {
    let filtered = fpoOffers;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(offer =>
        offer.fpoName.toLowerCase().includes(query) ||
        offer.commodity.toLowerCase().includes(query) ||
        offer.variety.toLowerCase().includes(query) ||
        offer.address.toLowerCase().includes(query)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "commodity":
          return a.commodity.localeCompare(b.commodity);
        case "location":
          return a.address.localeCompare(b.address);
        default:
          return 0;
      }
    });

    return sorted;
  }, [fpoOffers, searchQuery, sortBy]);

  const fpoTotalPages = Math.ceil(filteredAndSortedFPOs.length / fpoItemsPerPage);
  const visibleFPOs = filteredAndSortedFPOs.slice(fpoPage * fpoItemsPerPage, (fpoPage + 1) * fpoItemsPerPage);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setFpoPage(0);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setFpoPage(0);
  };

  const handleGenerateQuote = (offer: FPOOfferAPI, e: React.MouseEvent) => {
    e.stopPropagation();
    const legacyOffer: FPOOffer = {
      id: offer.id,
      fpoName: offer.fpoName,
      fpoLogo: "🏢",
      commodity: offer.commodity,
      variety: offer.variety,
      price: offer.price,
      unit: offer.unit,
      quantity: offer.maxOrderQty,
      minOrderQty: offer.minOrderQty,
      location: offer.address,
      pincode: "",
      block: "",
      district: "",
      state: "",
      distance: "N/A",
      lat: 0,
      lng: 0,
      quality: offer.grade,
      availableFrom: new Date().toISOString(),
      verified: true
    };
    setSelectedOffer(legacyOffer);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Apple vibrancy style */}
      <header className="sticky top-0 z-50 vibrancy border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center relative">
            <div className="absolute left-0">
              <NavigationMenu />
            </div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              VBOX Trading
            </h1>
          </div>
        </div>
      </header>

      {/* Price Ticker */}
      <PriceTicker />

      <main className="container mx-auto px-4 py-8 pb-dock space-y-10">
        {/* Market Overview */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                Market Overview
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Live commodity prices
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-primary font-medium hover:bg-primary/10 rounded-xl"
                onClick={() => navigate("/all-crops")}
              >
                View All
              </Button>
              <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-2 min-w-[40px] text-center">
                  {tickerData ? `${page + 1}/${totalPages}` : '-'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-destructive">Failed to load market data</p>
              </div>
            ) : (
              visibleData?.map((chip, i) => (
                <div key={chip.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <MarketChip data={chip} />
                </div>
              ))
            )}
          </div>
        </section>

        {/* FPO Offers */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col gap-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                  FPO Offers
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredAndSortedFPOs.length} available offers
                </p>
              </div>
              <Button 
                variant="ghost" 
                className="text-primary font-medium hover:bg-primary/10 rounded-xl"
                onClick={() => navigate("/all-fpos")}
              >
                View All
              </Button>
            </div>

            {/* Search and Sort Controls - Apple style */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FPO, commodity, location..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-11 h-12 rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              <Select value={sortBy} onValueChange={(v) => handleSortChange(v as SortOption)}>
                <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl bg-secondary border-0">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="price-asc" className="rounded-lg">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc" className="rounded-lg">Price: High to Low</SelectItem>
                  <SelectItem value="commodity" className="rounded-lg">Commodity A-Z</SelectItem>
                  <SelectItem value="location" className="rounded-lg">Location A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setFpoPage(p => Math.max(0, p - 1))}
                  disabled={fpoPage === 0 || fpoLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-2 min-w-[40px] text-center">
                  {fpoTotalPages > 0 ? `${fpoPage + 1}/${fpoTotalPages}` : '-'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setFpoPage(p => Math.min(fpoTotalPages - 1, p + 1))}
                  disabled={fpoPage >= fpoTotalPages - 1 || fpoLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fpoLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))
            ) : visibleFPOs.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">No offers found matching your search.</p>
              </div>
            ) : (
              visibleFPOs.map((offer, i) => {
                const addressParts = offer.address.split(", ");
                const state = addressParts[addressParts.length - 1] || "";
                const district = addressParts[addressParts.length - 2] || "";
                const slug = `${offer.commodity.toLowerCase().replace(/\s+/g, '')}-${offer.variety.toLowerCase().replace(/\s+/g, '')}`;

                return (
                  <div 
                    key={offer.id} 
                    className="apple-card p-5 cursor-pointer press-effect animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                    onClick={() => navigate(`/${slug}`)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-xl">
                          🏢
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm leading-tight">
                            {offer.fpoName}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{district}, {state}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px] font-medium rounded-md">
                        {offer.fpoType}
                      </Badge>
                    </div>

                    {/* Commodity Info */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Commodity</span>
                        <span className="font-medium text-foreground">{offer.commodity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Variety</span>
                        <span className="font-medium text-foreground">{offer.variety}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Grade</span>
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-[10px] font-medium rounded-md">
                          {offer.grade}
                        </Badge>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-foreground">
                          ₹{offer.price}
                        </span>
                        <span className="text-sm text-muted-foreground">/{offer.unit}</span>
                      </div>
                      <Button 
                        size="sm"
                        className="rounded-xl h-9 px-4 bg-primary hover:bg-primary/90 press-effect"
                        onClick={(e) => handleGenerateQuote(offer, e)}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        Quote
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Mobile Dock */}
      <MobileDock />

      {selectedOffer && (
        <QuoteFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          offer={selectedOffer}
          onQuoteGenerated={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;

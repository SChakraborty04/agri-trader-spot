import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationMenu } from "@/components/NavigationMenu";
import { MobileDock } from "@/components/MobileDock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MapPin, ArrowLeft, FileText, Search, ArrowUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllFPOOffers, FPOOfferAPI, getAuthToken } from "@/lib/api";
import { QuoteFormDialog } from "@/components/QuoteFormDialog";
import { toast } from "sonner";

type SortOption = "price-asc" | "price-desc" | "commodity" | "location" | "fpo-name";

const AllFPOs = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const itemsPerPage = 12;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<FPOOfferAPI | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  
  const { data: fpoOffers = [], isLoading } = useQuery({
    queryKey: ['all-fpo-offers'],
    queryFn: fetchAllFPOOffers,
  });

  const filteredAndSortedOffers = useMemo(() => {
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
        case "fpo-name":
          return a.fpoName.localeCompare(b.fpoName);
        default:
          return 0;
      }
    });

    return sorted;
  }, [fpoOffers, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedOffers.length / itemsPerPage);
  const visibleOffers = filteredAndSortedOffers.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setPage(0);
  };

  const handleGenerateQuote = (offer: FPOOfferAPI, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = getAuthToken();
    if (!token) {
      toast.error("Please login to request a quotation");
      return;
    }
    setSelectedOffer(offer);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      <main className="container mx-auto px-4 py-8 pb-dock">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6 -ml-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* FPO Offers */}
        <section className="animate-fade-in">
          <div className="flex flex-col gap-5 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                All FPO Offers
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredAndSortedOffers.length} offers available
              </p>
            </div>

            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by FPO, commodity, variety, or location..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-11 h-12 rounded-xl bg-secondary border-0"
                />
              </div>
              <Select value={sortBy} onValueChange={(v) => handleSortChange(v as SortOption)}>
                <SelectTrigger className="w-full sm:w-52 h-12 rounded-xl bg-secondary border-0">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="price-asc" className="rounded-lg">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc" className="rounded-lg">Price: High to Low</SelectItem>
                  <SelectItem value="commodity" className="rounded-lg">Commodity A-Z</SelectItem>
                  <SelectItem value="location" className="rounded-lg">Location A-Z</SelectItem>
                  <SelectItem value="fpo-name" className="rounded-lg">FPO Name A-Z</SelectItem>
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
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-3 min-w-[60px] text-center">
                  {totalPages > 0 ? `${page + 1} / ${totalPages}` : '-'}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))
            ) : visibleOffers.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">No offers found matching your search.</p>
              </div>
            ) : (
              visibleOffers.map((offer, i) => {
                const addressParts = offer.address.split(", ");
                const state = addressParts[addressParts.length - 1] || "";
                const district = addressParts[addressParts.length - 2] || "";
                const slug = `${offer.commodity.toLowerCase().replace(/\s+/g, '')}-${offer.variety.toLowerCase().replace(/\s+/g, '')}`;

                return (
                  <div 
                    key={offer.id} 
                    className="apple-card p-5 cursor-pointer press-effect animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
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

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <Button
                variant="secondary"
                className="rounded-xl"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="secondary"
                className="rounded-xl"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </section>
      </main>

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

export default AllFPOs;

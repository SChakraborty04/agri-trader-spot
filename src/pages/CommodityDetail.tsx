import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Package, Filter, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QuoteFormDialog } from "@/components/QuoteFormDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useTicker } from "@/hooks/useTicker";
import { useQuery } from "@tanstack/react-query";
import { fetchFPOOffers, FPOOfferAPI } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { FPOOffer } from "@/lib/mockData";

const CommodityDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<FPOOffer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quoteNumbers, setQuoteNumbers] = useState<Record<string, string>>({});
  const { data: tickerData = [], isLoading: tickerLoading } = useTicker(100);

  // Find matching ticker item by comparing slugified versions
  const commodityData = tickerData.find((chip) => {
    const chipSlug = `${chip.commodity.toLowerCase().replace(/\s+/g, '')}-${chip.variety.toLowerCase().replace(/\s+/g, '')}`;
    return chipSlug === slug?.toLowerCase();
  });

  // Fetch FPO offers from API
  const { data: fpoOffers = [], isLoading: fpoLoading, error: fpoError } = useQuery({
    queryKey: ['fpo-offers', commodityData?.commodity, commodityData?.variety],
    queryFn: () => fetchFPOOffers(commodityData?.commodity || '', commodityData?.variety || ''),
    enabled: !!commodityData,
  });

  const filteredFPOs = fpoOffers.filter((offer) => {
    const matchesSearch =
      searchQuery === "" ||
      offer.fpoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation = location === "all" || offer.address.includes(location);
    const matchesPrice = offer.price >= priceRange[0] && offer.price <= priceRange[1];

    return matchesSearch && matchesLocation && matchesPrice;
  });

  // Extract unique locations from addresses (state part)
  const locations = ["all", ...new Set(fpoOffers.map((o) => {
    const parts = o.address.split(", ");
    return parts[parts.length - 1]; // Get state
  }))];

  const handleQuoteGenerated = (quoteNo: string, offerId: string) => {
    setQuoteNumbers(prev => ({ ...prev, [offerId]: quoteNo }));
  };

  // Convert API offer to legacy format for QuoteFormDialog
  const convertToLegacyOffer = (offer: FPOOfferAPI): FPOOffer => {
    const addressParts = offer.address.split(", ");
    const state = addressParts[addressParts.length - 1] || "";
    const district = addressParts[addressParts.length - 2] || "";
    
    return {
      id: offer.id,
      fpoName: offer.fpoName,
      fpoLogo: offer.fpoLogo || "🏢",
      location: offer.address,
      commodity: offer.commodity,
      variety: offer.variety,
      quality: offer.grade,
      price: offer.price,
      unit: offer.unit,
      quantity: offer.quantity,
      availableFrom: offer.availableFrom,
      minOrderQty: offer.minOrderQty,
      verified: offer.verified,
      pincode: offer.pincode,
      block: addressParts[0] || "",
      district: district,
      state: state,
      distance: "N/A",
    };
  };

  if (tickerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!commodityData && tickerData.length > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Commodity Not Found
          </h1>
          <Button onClick={() => navigate("/")}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{commodityData?.emoji}</span>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  {commodityData?.commodity} - {commodityData?.variety}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredFPOs.length} FPO{filteredFPOs.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search FPO or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          className="mb-4 w-full md:w-auto"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? "Hide" : "Show"} Filters
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-foreground">Filters</h3>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l === "all" ? "All States" : l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2">
                  <Label>
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}/{fpoOffers[0]?.unit || "kg"}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={10000}
                    step={100}
                    className="mt-2"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setLocation("all");
                    setPriceRange([0, 10000]);
                    setSearchQuery("");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </aside>
          )}

          {/* Results */}
          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            {fpoLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-lg" />
                ))}
              </div>
            ) : fpoError ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Failed to load FPO offers. Please try again.
                  </p>
                </CardContent>
              </Card>
            ) : filteredFPOs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No FPOs found matching your criteria
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Found {filteredFPOs.length} offer{filteredFPOs.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFPOs.map((offer) => {
                    const addressParts = offer.address.split(", ");
                    const state = addressParts[addressParts.length - 1] || "";
                    const district = addressParts[addressParts.length - 2] || "";
                    
                    return (
                      <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 space-y-4">
                          {/* Registration Type Badge */}
                          <div className="flex justify-end">
                            <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
                              {offer.fpoType}
                            </Badge>
                          </div>

                          {/* FPO Header */}
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🏢</span>
                            <div>
                              <h3 className="font-semibold text-foreground underline">
                                {offer.fpoName}
                              </h3>
                              <div className="flex items-start gap-1 text-sm text-muted-foreground mt-1">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{district} - {state}</span>
                              </div>
                            </div>
                          </div>

                          {/* Commodity Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-semibold">Commodity</span>
                              <span>{offer.commodity} - {offer.variety}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Grade</span>
                              <Badge variant="destructive" className="bg-red-500">
                                {offer.grade}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold">Price</span>
                              <span className="font-bold text-primary">
                                ₹{offer.price}/{offer.unit}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold">Max Order Quant</span>
                              <span>{offer.maxOrderQty} {offer.unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold">Avl</span>
                              <span>{new Date(offer.availableFrom).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* FPO Details Section */}
                          <div className="border-t border-border pt-3 space-y-2 text-sm">
                            <h4 className="font-semibold text-primary">FPO Details</h4>
                            <div className="flex justify-between">
                              <span className="font-semibold">Reg No.</span>
                              <span>{offer.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold">Address</span>
                              <span className="text-right max-w-[60%]">
                                {offer.address} - {offer.pincode}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button 
                            className="w-full" 
                            size="lg"
                            onClick={() => {
                              if (quoteNumbers[offer.id]) {
                                navigate("/quote-tracking");
                              } else {
                                setSelectedOffer(convertToLegacyOffer(offer));
                                setDialogOpen(true);
                              }
                            }}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            {quoteNumbers[offer.id] 
                              ? `Track Quote: ${quoteNumbers[offer.id]}` 
                              : "Generate Quote"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedOffer && (
        <QuoteFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          offer={selectedOffer}
          onQuoteGenerated={(quoteNo) => handleQuoteGenerated(quoteNo, selectedOffer.id)}
        />
      )}
    </div>
  );
};

export default CommodityDetail;
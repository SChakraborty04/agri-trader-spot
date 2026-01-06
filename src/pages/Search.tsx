import { useState } from "react";
import { ArrowLeft, Filter, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FPOCard } from "@/components/FPOCard";
import { MobileDock } from "@/components/MobileDock";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllFPOOffers } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [commodity, setCommodity] = useState("all");
  const [location, setLocation] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(true);

  const { data: fpoOffers = [], isLoading } = useQuery({
    queryKey: ['all-fpo-offers'],
    queryFn: fetchAllFPOOffers,
  });

  const filteredOffers = fpoOffers.filter((offer) => {
    const matchesSearch =
      searchQuery === "" ||
      offer.fpoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.variety.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCommodity =
      commodity === "all" || offer.commodity === commodity;

    const matchesLocation = location === "all" || offer.address.includes(location);

    const matchesPrice =
      offer.price >= priceRange[0] && offer.price <= priceRange[1];

    return matchesSearch && matchesCommodity && matchesLocation && matchesPrice;
  });

  const commodities = ["all", ...new Set(fpoOffers.map((o) => o.commodity))];
  const locations = ["all", ...new Set(fpoOffers.map((o) => {
    const parts = o.address.split(", ");
    return parts[parts.length - 1]; // Get state
  }))];

  const maxPrice = Math.max(...fpoOffers.map(o => o.price), 10000);

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
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-primary">Advanced Search</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search FPO, commodity or variety..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          className="mb-4 w-full md:w-auto rounded-xl"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? "Hide" : "Show"} Filters
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
                <h3 className="font-semibold text-foreground">Filters</h3>

                {/* Commodity Filter */}
                <div className="space-y-2">
                  <Label>Commodity</Label>
                  <Select value={commodity} onValueChange={setCommodity}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {commodities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c === "all" ? "All Commodities" : c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l === "all" ? "All Locations" : l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2">
                  <Label>
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={maxPrice}
                    step={10}
                    className="mt-2"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => {
                    setCommodity("all");
                    setLocation("all");
                    setPriceRange([0, maxPrice]);
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
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `Found ${filteredOffers.length} offer${filteredOffers.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOffers.map((offer) => (
                  <FPOCard key={offer.id} offer={offer} />
                ))}
              </div>
            )}
            {!isLoading && filteredOffers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No offers found matching your criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileDock />
    </div>
  );
};

export default Search;

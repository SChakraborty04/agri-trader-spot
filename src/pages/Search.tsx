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
import { fpoOffers } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [commodity, setCommodity] = useState("all");
  const [location, setLocation] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(true);

  const filteredOffers = fpoOffers.filter((offer) => {
    const matchesSearch =
      searchQuery === "" ||
      offer.fpoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.commodity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCommodity =
      commodity === "all" || offer.commodity === commodity;

    const matchesLocation = location === "all" || offer.location === location;

    const matchesPrice =
      offer.price >= priceRange[0] && offer.price <= priceRange[1];

    return matchesSearch && matchesCommodity && matchesLocation && matchesPrice;
  });

  const commodities = ["all", ...new Set(fpoOffers.map((o) => o.commodity))];
  const locations = ["all", ...new Set(fpoOffers.map((o) => o.location))];

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
            <h1 className="text-xl font-bold text-primary">Advanced Search</h1>
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
              placeholder="Search FPO or commodity..."
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

                {/* Commodity Filter */}
                <div className="space-y-2">
                  <Label>Commodity</Label>
                  <Select value={commodity} onValueChange={setCommodity}>
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}/kg
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCommodity("all");
                    setLocation("all");
                    setPriceRange([0, 100]);
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
                Found {filteredOffers.length} offer{filteredOffers.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOffers.map((offer) => (
                <FPOCard key={offer.id} offer={offer} />
              ))}
            </div>
            {filteredOffers.length === 0 && (
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

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarketChip } from "@/components/MarketChip";
import { MobileDock } from "@/components/MobileDock";
import { useTicker } from "@/hooks/useTicker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AllCrops = () => {
  const navigate = useNavigate();
  const { data: tickerData, isLoading, error } = useTicker(100); // Fetch all
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [filterChange, setFilterChange] = useState<string>("all");

  const filteredAndSortedData = useMemo(() => {
    if (!tickerData) return [];

    let result = [...tickerData];

    // Filter by search query
    if (searchQuery) {
      result = result.filter((item) =>
        item.commodity.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price change
    if (filterChange === "gainers") {
      result = result.filter((item) => item.change >= 0);
    } else if (filterChange === "losers") {
      result = result.filter((item) => item.change < 0);
    }

    // Sort
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.commodity.localeCompare(b.commodity));
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "change-high":
        result.sort((a, b) => b.changePercent - a.changePercent);
        break;
      case "change-low":
        result.sort((a, b) => a.changePercent - b.changePercent);
        break;
    }

    return result;
  }, [tickerData, searchQuery, sortBy, filterChange]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">All Crops</h1>
            <span className="text-sm text-muted-foreground ml-auto">
              {tickerData?.length ?? 0} commodities
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 pb-dock space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price-high">Price (High)</SelectItem>
              <SelectItem value="price-low">Price (Low)</SelectItem>
              <SelectItem value="change-high">Top Gainers</SelectItem>
              <SelectItem value="change-low">Top Losers</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterChange} onValueChange={setFilterChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="gainers">Gainers</SelectItem>
              <SelectItem value="losers">Losers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedData.length} of {tickerData?.length ?? 0} crops
        </p>

        {/* Crops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))
          ) : error ? (
            <p className="text-destructive col-span-full">Failed to load market data</p>
          ) : filteredAndSortedData.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No crops found matching your criteria
            </p>
          ) : (
            filteredAndSortedData.map((chip) => (
              <MarketChip key={chip.id} data={chip} />
            ))
          )}
        </div>
      </main>

      <MobileDock />
    </div>
  );
};

export default AllCrops;

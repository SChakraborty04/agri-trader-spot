import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketChip } from "@/components/MarketChip";
import { FPOCard } from "@/components/FPOCard";
import { PriceTicker } from "@/components/PriceTicker";
import { marketChips, fpoOffers } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">VBOX Trading</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/search")}
            >
              <Search className="w-4 h-4 mr-2" />
              Advanced Search
            </Button>
          </div>
        </div>
      </header>

      {/* Price Ticker */}
      <PriceTicker />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Market Overview */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Market Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {marketChips.map((chip) => (
              <MarketChip key={chip.id} data={chip} />
            ))}
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

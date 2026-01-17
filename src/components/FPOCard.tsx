import { useState } from "react";
import { MapPin, Package, Calendar, BadgeCheck, Heart } from "lucide-react";
import { FPOOfferAPI, getAuthToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuoteFormDialog } from "./QuoteFormDialog";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { openLoginDialog } from "@/hooks/useAuthDialog";

interface FPOCardProps {
  offer: FPOOfferAPI;
}

export const FPOCard = ({ offer }: FPOCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quoteNo, setQuoteNo] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  const isFav = isFavorite(offer.id);

  const handleQuoteGenerated = (newQuoteNo: string) => {
    setQuoteNo(newQuoteNo);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(offer);
    toast.success(isFav ? "Removed from watchlist" : "Added to watchlist");
  };

  const handleRequestQuote = () => {
    const token = getAuthToken();
    if (!token) {
      openLoginDialog(offer);
      return;
    }
    setDialogOpen(true);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{offer.fpoName}</h3>
              {offer.verified && (
                <BadgeCheck className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <MapPin className="w-3 h-3" />
              <span>{offer.address}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              📍 {offer.pincode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-lg transition-colors ${
                isFav 
                  ? "text-red-500 bg-red-500/10 hover:bg-red-500/20" 
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              }`}
              aria-label={isFav ? "Remove from watchlist" : "Add to watchlist"}
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
            </button>
            <Badge variant="secondary" className="text-xs">
              {offer.grade}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Commodity</span>
            <span className="font-medium text-foreground">{offer.commodity} - {offer.variety}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="font-bold text-lg text-primary">
              ₹{offer.price.toFixed(2)}/{offer.unit}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Package className="w-3 h-3" />
              <span>Quantity</span>
            </div>
            <span className="font-medium text-foreground">
              {offer.quantity} {offer.unit}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Available</span>
            </div>
            <span className="font-medium text-foreground">
              {new Date(offer.availableFrom).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Min Order</span>
            <span className="font-medium text-foreground">
              {offer.minOrderQty} {offer.unit}
            </span>
          </div>
        </div>

        <Button 
          className="w-full rounded-xl" 
          size="sm"
          onClick={() => quoteNo ? null : handleRequestQuote()}
        >
          {quoteNo ? `Quote: ${quoteNo}` : "Request Quotation"}
        </Button>
      </div>

      <QuoteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        offer={offer}
        onQuoteGenerated={handleQuoteGenerated}
      />
    </>
  );
};

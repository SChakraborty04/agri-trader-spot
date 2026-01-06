import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FPOOfferAPI, createQuotation, getAuthToken } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface QuoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: FPOOfferAPI;
  onQuoteGenerated: (quoteNo: string) => void;
}

export const QuoteFormDialog = ({
  open,
  onOpenChange,
  offer,
  onQuoteGenerated,
}: QuoteFormDialogProps) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(offer.minOrderQty.toString());
  const [location, setLocation] = useState("");
  const [offerPrice, setOfferPrice] = useState(offer.price.toString());
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = getAuthToken();
    if (!token) {
      toast.error("Please login to request a quotation");
      onOpenChange(false);
      return;
    }
    
    const qty = parseFloat(quantity);
    if (qty < offer.minOrderQty) {
      toast.error(`Minimum order quantity is ${offer.minOrderQty} ${offer.unit}`);
      return;
    }
    if (qty > offer.maxOrderQty) {
      toast.error(`Maximum order quantity is ${offer.maxOrderQty} ${offer.unit}`);
      return;
    }

    setLoading(true);
    try {
      const response = await createQuotation({
        seller_price_id: parseInt(offer.id),
        quantity: qty,
        offer_price: parseFloat(offerPrice),
        delivery_date: deliveryDate || undefined,
        delivery_location: location || undefined,
        notes: notes || undefined,
      });

      toast.success(`Quote created: ${response.quotation_number}`);
      onQuoteGenerated(response.quotation_number);
      onOpenChange(false);
      
      // Reset form
      setQuantity(offer.minOrderQty.toString());
      setLocation("");
      setOfferPrice(offer.price.toString());
      setDeliveryDate("");
      setNotes("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Request Quotation</DialogTitle>
          <DialogDescription>
            Fill in the details to request a quote for {offer.commodity} - {offer.variety}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity ({offer.unit}) *
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={offer.minOrderQty}
              max={offer.maxOrderQty}
              className="h-11 rounded-xl"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Min: {offer.minOrderQty} {offer.unit} | Max: {offer.maxOrderQty} {offer.unit}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offerPrice">
              Your Offer Price (₹/{offer.unit}) *
            </Label>
            <Input
              id="offerPrice"
              type="number"
              step="0.01"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="h-11 rounded-xl"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              FPO base price: ₹{offer.price}/{offer.unit}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Delivery Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter delivery address"
              className="h-11 rounded-xl"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryDate">Preferred Delivery Date</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="h-11 rounded-xl"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or instructions..."
              className="rounded-xl resize-none"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 rounded-xl"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

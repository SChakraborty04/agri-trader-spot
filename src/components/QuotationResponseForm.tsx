import { useState } from "react";
import { Send, Check, X, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createQuotationResponse, QuotationResponseRequest, QuotationResponse } from "@/lib/api";
import { toast } from "sonner";

interface QuotationResponseFormProps {
  quotation: QuotationResponse;
  onResponseSent: () => void;
}

export function QuotationResponseForm({ quotation, onResponseSent }: QuotationResponseFormProps) {
  const [counterPrice, setCounterPrice] = useState("");
  const [counterQuantity, setCounterQuantity] = useState("");
  const [counterDeliveryDate, setCounterDeliveryDate] = useState("");
  const [counterDeliveryLocation, setCounterDeliveryLocation] = useState("");
  const [counterPaymentTerms, setCounterPaymentTerms] = useState("");
  const [comments, setComments] = useState("");
  const [sending, setSending] = useState(false);
  const [responseType, setResponseType] = useState<"counter" | "accept" | "reject" | null>(null);

  const handleSendResponse = async (type: "counter" | "accept" | "reject") => {
    setResponseType(type);
    setSending(true);

    try {
      const data: QuotationResponseRequest = {
        response_type: type,
        comments: comments || undefined,
        is_final_response: type === "accept" || type === "reject",
      };

      // Add counter fields if it's a counter-offer
      if (type === "counter") {
        if (counterPrice) data.counter_price = parseFloat(counterPrice);
        if (counterQuantity) data.counter_quantity = parseFloat(counterQuantity);
        if (counterDeliveryDate) data.counter_delivery_date = counterDeliveryDate;
        if (counterDeliveryLocation) data.counter_delivery_location = counterDeliveryLocation;
        if (counterPaymentTerms) data.counter_payment_terms = counterPaymentTerms;
      }

      await createQuotationResponse(parseInt(quotation.id), data);
      
      if (type === "accept") {
        toast.success("Quotation accepted! You can now create an order.");
      } else if (type === "reject") {
        toast.success("Quotation rejected.");
      } else {
        toast.success("Counter-offer sent successfully!");
      }
      
      // Clear form
      setCounterPrice("");
      setCounterQuantity("");
      setCounterDeliveryDate("");
      setCounterDeliveryLocation("");
      setCounterPaymentTerms("");
      setComments("");
      
      onResponseSent();
    } catch (error) {
      console.error("Failed to send response:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send response");
    } finally {
      setSending(false);
      setResponseType(null);
    }
  };

  const canRespond = quotation.status === "pending" || quotation.status === "negotiating";

  if (!canRespond) {
    return (
      <Card className="rounded-2xl border-muted">
        <CardContent className="py-8 text-center">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            This quotation is <strong>{quotation.status}</strong>. No further responses allowed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-primary" />
          Send Response
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Counter-offer fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="counterPrice">Counter Price ({quotation.currency})</Label>
            <Input
              id="counterPrice"
              type="number"
              step="0.01"
              value={counterPrice}
              onChange={(e) => setCounterPrice(e.target.value)}
              placeholder={`Current: ${quotation.offer_price}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="counterQuantity">Counter Quantity ({quotation.unit_of_measure})</Label>
            <Input
              id="counterQuantity"
              type="number"
              step="0.01"
              value={counterQuantity}
              onChange={(e) => setCounterQuantity(e.target.value)}
              placeholder={`Current: ${quotation.quantity}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="counterDeliveryDate">Counter Delivery Date</Label>
            <Input
              id="counterDeliveryDate"
              type="date"
              value={counterDeliveryDate}
              onChange={(e) => setCounterDeliveryDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="counterDeliveryLocation">Counter Delivery Location</Label>
            <Input
              id="counterDeliveryLocation"
              type="text"
              value={counterDeliveryLocation}
              onChange={(e) => setCounterDeliveryLocation(e.target.value)}
              placeholder={quotation.delivery_location || "Enter location"}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="counterPaymentTerms">Counter Payment Terms</Label>
          <Input
            id="counterPaymentTerms"
            type="text"
            value={counterPaymentTerms}
            onChange={(e) => setCounterPaymentTerms(e.target.value)}
            placeholder={quotation.payment_terms || "e.g., 60% advance, 40% on delivery"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comments">Comments / Message</Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add your message here..."
            rows={3}
            className="rounded-xl resize-none"
          />
        </div>

        <Separator />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => handleSendResponse("counter")}
            disabled={sending}
            className="flex-1 min-w-[140px]"
          >
            {sending && responseType === "counter" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Counter-Offer
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleSendResponse("accept")}
            disabled={sending}
            className="border-green-500/50 text-green-600 hover:bg-green-500/10 hover:text-green-600"
          >
            {sending && responseType === "accept" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Accept
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleSendResponse("reject")}
            disabled={sending}
            className="border-red-500/50 text-red-600 hover:bg-red-500/10 hover:text-red-600"
          >
            {sending && responseType === "reject" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <X className="w-4 h-4 mr-2" />
            )}
            Reject
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Counter-offer will continue the negotiation. Accept or Reject will close the negotiation.
        </p>
      </CardContent>
    </Card>
  );
}

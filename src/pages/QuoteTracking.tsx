import { useState, useEffect } from "react";
import { ArrowLeft, Package, MapPin, Calendar, Clock, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileDock } from "@/components/MobileDock";
import { NavigationMenu } from "@/components/NavigationMenu";
import { AuthWidget } from "@/components/AuthWidget";
import { fetchQuotations, QuotationResponse, getAuthToken } from "@/lib/api";
import { toast } from "sonner";

const getStatusColor = (status: QuotationResponse["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    case "negotiating":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "accepted":
      return "bg-green-500/10 text-green-600 dark:text-green-400";
    case "rejected":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
    case "expired":
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    case "converted_to_order":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const QuoteTracking = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<QuotationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadQuotations = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchQuotations(50, 0);
      // Filter to show only active quotes (pending, negotiating)
      const activeQuotes = response.quotations.filter(
        (q) => q.status === "pending" || q.status === "negotiating"
      );
      setQuotations(activeQuotes);
      setTotal(activeQuotes.length);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const isLoggedIn = !!getAuthToken();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavigationMenu />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Quote Tracking</h1>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                onClick={loadQuotations}
                className="rounded-xl"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            )}
            <AuthWidget />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {!isLoggedIn ? (
          <Card className="rounded-2xl">
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Please login to view your quotes</p>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-2xl animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : quotations.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No active quotes to track</p>
              <Button
                className="mt-4 rounded-xl"
                onClick={() => navigate("/")}
              >
                Browse FPO Offers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tracking {total} active quote{total !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotations.map((quote) => (
                <Card 
                  key={quote.id} 
                  className="rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/quote/${quote.quotation_number}`)}
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Quote Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground hover:text-primary transition-colors">
                          {quote.quotation_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {quote.commodity_name} - {quote.variety_name}
                        </p>
                      </div>
                      <Badge className={getStatusColor(quote.status)}>
                        {formatStatus(quote.status)}
                      </Badge>
                    </div>

                    {/* Seller Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{quote.seller_name}</span>
                      </div>
                      {quote.delivery_location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{quote.delivery_location}</span>
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(quote.quotation_date).toLocaleDateString()}
                      </span>
                      <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                      <span className="text-muted-foreground">
                        {new Date(quote.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Quantity & Price */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Quantity</p>
                        <p className="font-medium text-foreground">
                          {quote.quantity} {quote.unit_of_measure}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Offer Price</p>
                        <p className="font-medium text-foreground">
                          {quote.currency} {quote.offer_price}/{quote.unit_of_measure}
                        </p>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-primary">
                        {quote.currency} {(quote.offer_price * quote.quantity).toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <MobileDock />
    </div>
  );
};

export default QuoteTracking;

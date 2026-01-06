import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, MessageSquare, RefreshCw, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

const QuoteHistory = () => {
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
      setQuotations(response.quotations);
      setTotal(response.total);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const grossTotal = quotations.reduce((total, quote) => {
    return total + quote.offer_price * quote.quantity;
  }, 0);

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
            <h1 className="text-lg font-semibold">Quote History</h1>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn && quotations.length > 0 && (
              <div className="text-right mr-2 hidden sm:block">
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-sm font-bold text-primary">
                  ₹{grossTotal.toFixed(2)}
                </p>
              </div>
            )}
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
              <p className="text-muted-foreground mb-4">Please login to view your quote history</p>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : quotations.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No quote history available</p>
              <Button onClick={() => navigate("/")} className="rounded-xl">
                Browse FPO Offers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {total} quote{total !== 1 ? "s" : ""} in history
              </p>
              <p className="text-sm font-medium text-primary sm:hidden">
                Total: ₹{grossTotal.toFixed(2)}
              </p>
            </div>
            <div className="space-y-3">
              {quotations.map((quote) => (
                <div
                  key={quote.id}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/quote/${quote.quotation_number}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-lg text-primary hover:underline flex items-center gap-2">
                        {quote.quotation_number}
                        <MessageSquare className="w-4 h-4" />
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(quote.quotation_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(quote.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(quote.status)}>
                      {formatStatus(quote.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Commodity</p>
                      <p className="font-medium text-foreground">{quote.commodity_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Seller</p>
                      <p className="font-medium text-foreground">{quote.seller_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-medium text-foreground">
                        {quote.quantity} {quote.unit_of_measure}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Offer Price</p>
                      <p className="font-medium text-foreground">
                        {quote.currency} {quote.offer_price}/{quote.unit_of_measure}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Variety</p>
                      <p className="font-medium text-foreground">{quote.variety_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-bold text-primary">
                        {quote.currency} {(quote.offer_price * quote.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuoteHistory;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, MapPin, Calendar, Clock, RefreshCw, User, Building2, CreditCard, FileText, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { NavigationMenu } from "@/components/NavigationMenu";
import { AuthWidget } from "@/components/AuthWidget";
import { MobileDock } from "@/components/MobileDock";
import { fetchQuotations, QuotationResponse, getAuthToken, createOrder } from "@/lib/api";
import { toast } from "sonner";

const getStatusColor = (status: QuotationResponse["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
    case "negotiating":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "accepted":
      return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    case "rejected":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    case "expired":
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    case "converted_to_order":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// Mock conversation messages (since API doesn't have messages endpoint yet)
interface ConversationMessage {
  id: string;
  sender: "buyer" | "seller" | "system";
  senderName: string;
  message: string;
  timestamp: string;
}

const generateMockConversation = (quote: QuotationResponse): ConversationMessage[] => {
  const messages: ConversationMessage[] = [
    {
      id: "1",
      sender: "system",
      senderName: "System",
      message: `Quote request created for ${quote.quantity} ${quote.unit_of_measure} of ${quote.commodity_name} (${quote.variety_name}) at ${quote.currency} ${quote.offer_price}/${quote.unit_of_measure}.`,
      timestamp: quote.created_at,
    },
  ];

  if (quote.notes) {
    messages.push({
      id: "2",
      sender: "buyer",
      senderName: "You",
      message: quote.notes,
      timestamp: quote.created_at,
    });
  }

  if (quote.status === "negotiating") {
    messages.push({
      id: "3",
      sender: "seller",
      senderName: quote.seller_name,
      message: `Thank you for your interest. We're reviewing your offer of ${quote.currency} ${quote.offer_price}/${quote.unit_of_measure}. We'll get back to you shortly with our response.`,
      timestamp: new Date(new Date(quote.created_at).getTime() + 3600000).toISOString(),
    });
  }

  if (quote.status === "accepted") {
    messages.push({
      id: "3",
      sender: "seller",
      senderName: quote.seller_name,
      message: `Great news! We've accepted your quotation for ${quote.quantity} ${quote.unit_of_measure} at ${quote.currency} ${quote.offer_price}/${quote.unit_of_measure}. Please proceed with the order.`,
      timestamp: new Date(new Date(quote.created_at).getTime() + 7200000).toISOString(),
    });
  }

  if (quote.status === "rejected") {
    messages.push({
      id: "3",
      sender: "seller",
      senderName: quote.seller_name,
      message: `We regret to inform you that we cannot accept your offer at this time. Please feel free to submit a new quotation.`,
      timestamp: new Date(new Date(quote.created_at).getTime() + 7200000).toISOString(),
    });
  }

  return messages;
};

const QuoteDetail = () => {
  const { quoteNo } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuotationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const loadQuote = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchQuotations(100, 0);
      const foundQuote = response.quotations.find(
        (q) => q.quotation_number === quoteNo
      );
      
      if (foundQuote) {
        setQuote(foundQuote);
        setMessages(generateMockConversation(foundQuote));
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load quote details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuote();
  }, [quoteNo]);

  const isLoggedIn = !!getAuthToken();

  const handleConvertToOrder = async () => {
    if (!quote) return;
    
    try {
      setCreatingOrder(true);
      const order = await createOrder({
        quotation_id: parseInt(quote.id),
        currency: quote.currency,
      });
      toast.success(`Order ${order.order_number} created successfully!`);
      navigate("/order-tracking");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create order");
    } finally {
      setCreatingOrder(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="rounded-2xl max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Please login to view quote details</p>
            <Button onClick={() => navigate("/login")} className="rounded-xl">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
            <NavigationMenu />
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-40" />
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
          <Card className="rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="rounded-2xl max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Quote not found</p>
            <p className="text-muted-foreground mb-4">
              The quote "{quoteNo}" could not be found
            </p>
            <Button onClick={() => navigate("/quote-history")} className="rounded-xl">
              Back to Quote History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAmount = quote.offer_price * quote.quantity;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavigationMenu />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{quote.quotation_number}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {quote.commodity_name} - {quote.variety_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={loadQuote}
              className="rounded-xl"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <AuthWidget />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24 space-y-6">
        {/* Status Banner */}
        <Card className="rounded-2xl overflow-hidden">
          <div className={`px-6 py-4 ${getStatusColor(quote.status)} border-b`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Quote Status</p>
                <p className="text-xl font-bold">{formatStatus(quote.status)}</p>
              </div>
              <Badge variant="outline" className={getStatusColor(quote.status)}>
                {formatStatus(quote.status)}
              </Badge>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Quote Date
                </p>
                <p className="font-medium">
                  {new Date(quote.quotation_date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Created At
                </p>
                <p className="font-medium">
                  {new Date(quote.created_at).toLocaleTimeString([], { 
                    hour: "2-digit", 
                    minute: "2-digit" 
                  })}
                </p>
              </div>
              {quote.valid_until && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Valid Until</p>
                  <p className="font-medium">
                    {new Date(quote.valid_until).toLocaleDateString()}
                  </p>
                </div>
              )}
              {quote.delivery_date && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Delivery Date</p>
                  <p className="font-medium">
                    {new Date(quote.delivery_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Convert to Order Button for Pending or Accepted Quotes */}
        {(quote.status === "pending" || quote.status === "accepted") && (
          <Card className={`rounded-2xl ${quote.status === "accepted" ? "border-green-500/30 bg-green-500/5" : "border-primary/30 bg-primary/5"}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${quote.status === "accepted" ? "bg-green-500/10" : "bg-primary/10"}`}>
                    <ShoppingCart className={`w-5 h-5 ${quote.status === "accepted" ? "text-green-600" : "text-primary"}`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${quote.status === "accepted" ? "text-green-600" : "text-primary"}`}>
                      {quote.status === "accepted" ? "Quote Accepted!" : "Ready to Order"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {quote.status === "accepted" 
                        ? "Convert this quotation to an order to proceed with the purchase."
                        : "Convert this pending quote to an order. The order will also be in pending status."}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleConvertToOrder}
                  disabled={creatingOrder}
                  className={`rounded-xl text-white ${quote.status === "accepted" ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"}`}
                >
                  {creatingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Convert to Order
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quote Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Info */}
          <Card className="rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Product Details</h3>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commodity</span>
                  <span className="font-medium">{quote.commodity_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Variety</span>
                  <span className="font-medium">{quote.variety_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{quote.quantity} {quote.unit_of_measure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Offer Price</span>
                  <span className="font-medium">{quote.currency} {quote.offer_price}/{quote.unit_of_measure}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-primary">
                    {quote.currency} {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller & Delivery Info */}
          <Card className="rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Seller & Delivery</h3>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller</span>
                  <span className="font-medium">{quote.seller_name}</span>
                </div>
                {quote.delivery_location && (
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Delivery
                    </span>
                    <span className="font-medium text-right max-w-[60%]">
                      {quote.delivery_location}
                    </span>
                  </div>
                )}
                {quote.payment_terms && (
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      Payment
                    </span>
                    <span className="font-medium text-right max-w-[60%]">
                      {quote.payment_terms}
                    </span>
                  </div>
                )}
                {quote.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1 mb-2">
                        <FileText className="w-3 h-3" />
                        Notes
                      </p>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">{quote.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation History */}
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Conversation History</h3>
            </div>
            <Separator className="mb-4" />
            
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No conversation history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.sender === "buyer" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender !== "buyer" && (
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarFallback 
                          className={
                            msg.sender === "system" 
                              ? "bg-muted text-muted-foreground text-xs" 
                              : "bg-primary/10 text-primary text-xs"
                          }
                        >
                          {msg.sender === "system" ? "SYS" : msg.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`flex flex-col max-w-[75%] ${
                        msg.sender === "buyer" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          msg.sender === "buyer"
                            ? "bg-primary text-primary-foreground"
                            : msg.sender === "system"
                            ? "bg-muted/50 border border-border"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-xs font-medium mb-1 opacity-80">
                          {msg.senderName}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(msg.timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {msg.sender === "buyer" && (
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          You
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Read-only notice */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                📧 Conversation history is read-only. Messages are managed through the seller portal.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <MobileDock />
    </div>
  );
};

export default QuoteDetail;

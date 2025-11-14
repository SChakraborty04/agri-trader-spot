import { useState, useEffect } from "react";
import { ArrowLeft, Package, MapPin, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote } from "@/lib/mockData";

const getStatusColor = (status: Quote["status"]) => {
  switch (status) {
    case "Open":
      return "bg-blue-500/10 text-blue-500";
    case "Ordered":
      return "bg-green-500/10 text-green-500";
    case "Closed":
      return "bg-gray-500/10 text-gray-500";
    case "Cancelled":
      return "bg-orange-500/10 text-orange-500";
    case "Rejected":
      return "bg-red-500/10 text-red-500";
  }
};

const QuoteTracking = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    const storedQuotes = JSON.parse(localStorage.getItem("quotes") || "[]");
    setQuotes(storedQuotes);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-primary">Quote Tracking</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {quotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No quotes to track yet</p>
              <Button
                className="mt-4"
                onClick={() => navigate("/")}
              >
                Browse FPO Offers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tracking {quotes.length} quote{quotes.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quotes.map((quote) => (
                <Card key={quote.quoteNo} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    {/* Quote Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <button
                          onClick={() => navigate(`/quote/${quote.quoteNo}`)}
                          className="font-semibold text-foreground hover:text-primary hover:underline transition-colors"
                        >
                          {quote.quoteNo}
                        </button>
                        <p className="text-sm text-muted-foreground">
                          {quote.cropName}
                        </p>
                      </div>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                    </div>

                    {/* FPO Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{quote.fpoName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {quote.location}
                        </span>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{quote.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{quote.time}</span>
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Quantity</p>
                        <p className="font-medium text-foreground">
                          {quote.quantity} {quote.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-medium text-foreground">
                          ₹{quote.price}/{quote.unit}
                        </p>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{(quote.price * quote.quantity).toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuoteTracking;

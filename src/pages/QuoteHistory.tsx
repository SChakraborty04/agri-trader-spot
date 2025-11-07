import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quote } from "@/lib/mockData";

// Mock history data
const mockQuoteHistory: Quote[] = [
  {
    quoteNo: "QT12345678",
    date: "2025-10-15",
    time: "10:30 AM",
    cropName: "Tomato",
    fpoName: "Sunrise Agro Collective",
    quantity: 100,
    unit: "kg",
    price: 11.50,
    offerPrice: 11.50,
    location: "Mumbai",
    status: "Ordered",
  },
  {
    quoteNo: "QT87654321",
    date: "2025-10-20",
    time: "2:45 PM",
    cropName: "Onion",
    fpoName: "Green Valley Farmers",
    quantity: 150,
    unit: "kg",
    price: 18.00,
    offerPrice: 18.00,
    location: "Pune",
    status: "Closed",
  },
  {
    quoteNo: "QT11223344",
    date: "2025-10-25",
    time: "11:15 AM",
    cropName: "Wheat",
    fpoName: "Golden Harvest FPO",
    quantity: 300,
    unit: "kg",
    price: 22.20,
    offerPrice: 22.20,
    location: "Delhi",
    status: "Cancelled",
  },
  {
    quoteNo: "QT55667788",
    date: "2025-11-01",
    time: "4:00 PM",
    cropName: "Rice",
    fpoName: "Delta Rice Producers",
    quantity: 200,
    unit: "kg",
    price: 28.20,
    offerPrice: 28.20,
    location: "Bangalore",
    status: "Rejected",
  },
];

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

const QuoteHistory = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    const storedQuotes = JSON.parse(localStorage.getItem("quotes") || "[]");
    setQuotes([...mockQuoteHistory, ...storedQuotes]);
  }, []);

  const grossTotal = quotes.reduce((total, quote) => {
    return total + quote.price * quote.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-primary">Quote History</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Gross Total</p>
              <p className="text-lg font-bold text-primary">
                ₹{grossTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {quotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No quote history available</p>
            <Button onClick={() => navigate("/")}>
              Browse FPO Offers
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {quotes.length} quote{quotes.length !== 1 ? "s" : ""} in history
            </p>
            <div className="space-y-3">
              {quotes.map((quote) => (
                <div
                  key={quote.quoteNo}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-lg text-foreground">
                        {quote.quoteNo}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{quote.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{quote.time}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Crop Name</p>
                      <p className="font-medium text-foreground">{quote.cropName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">FPO Name</p>
                      <p className="font-medium text-foreground">{quote.fpoName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-medium text-foreground">
                        {quote.quantity} {quote.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium text-foreground">
                        ₹{quote.price}/{quote.unit}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium text-foreground">{quote.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-bold text-primary">
                        ₹{(quote.price * quote.quantity).toFixed(2)}
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

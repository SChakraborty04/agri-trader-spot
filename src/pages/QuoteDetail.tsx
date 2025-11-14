import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Quote, Message } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

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

const QuoteDetail = () => {
  const { quoteNo } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const storedQuotes = JSON.parse(localStorage.getItem("quotes") || "[]");
    const foundQuote = storedQuotes.find((q: Quote) => q.quoteNo === quoteNo);
    
    if (foundQuote) {
      setQuote(foundQuote);
    }
  }, [quoteNo]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !quote) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: "buyer",
      senderName: "You",
      message: newMessage,
      timestamp: new Date().toLocaleString(),
    };

    const updatedQuote = {
      ...quote,
      messages: [...(quote.messages || []), message],
    };

    // Update localStorage
    const storedQuotes = JSON.parse(localStorage.getItem("quotes") || "[]");
    const updatedQuotes = storedQuotes.map((q: Quote) =>
      q.quoteNo === quoteNo ? updatedQuote : q
    );
    localStorage.setItem("quotes", JSON.stringify(updatedQuotes));

    setQuote(updatedQuote);
    setNewMessage("");
    
    toast({
      title: "Message sent",
      description: "Your message has been sent to the FPO",
    });
  };

  if (!quote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Quote not found</p>
          <Button onClick={() => navigate("/quote-history")}>
            Back to Quote History
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/quote-history")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-primary">{quote.quoteNo}</h1>
                <p className="text-sm text-muted-foreground">
                  {quote.cropName} - {quote.fpoName}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(quote.status)}>
              {quote.status}
            </Badge>
          </div>
        </div>
      </header>

      {/* Quote Details */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium text-foreground">
                {quote.quantity} {quote.unit}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="font-medium text-foreground">
                ₹{quote.price}/{quote.unit}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium text-foreground">{quote.location}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-medium text-primary">
                ₹{(quote.price * quote.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {(!quote.messages || quote.messages.length === 0) ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No messages yet. Start the conversation with the FPO.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {quote.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === "buyer" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "fpo" && (
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {quote.fpoName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`flex flex-col max-w-[70%] ${
                      message.sender === "buyer" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.sender === "buyer"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {message.senderName}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp}
                    </p>
                  </div>
                  {message.sender === "buyer" && (
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        You
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message to the FPO..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="min-h-[80px] resize-none"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
              className="h-[80px] w-[80px]"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail;

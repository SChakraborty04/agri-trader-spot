import { useState } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createQuotationResponse, QuotationResponse } from "@/lib/api";
import { toast } from "sonner";

interface QuotationResponseFormProps {
  quotation: QuotationResponse;
  onResponseSent: () => void;
}

export function QuotationResponseForm({ quotation, onResponseSent }: QuotationResponseFormProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);

    try {
      await createQuotationResponse(parseInt(quotation.id), {
        comments: message.trim(),
      });
      
      toast.success("Message sent!");
      setMessage("");
      onResponseSent();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const canRespond = quotation.status === "pending" || quotation.status === "negotiating";

  if (!canRespond) {
    return (
      <Card className="rounded-2xl border-muted">
        <CardContent className="py-6 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            This quotation is <strong>{quotation.status}</strong>. No further messages allowed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="flex gap-3 items-end">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={2}
            className="flex-1 rounded-xl resize-none min-h-[60px]"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !message.trim()}
            size="icon"
            className="h-10 w-10 rounded-xl shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </CardContent>
    </Card>
  );
}

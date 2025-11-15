import { ArrowLeft, Package, MapPin, Calendar, Clock, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockOrderHistory, Quote } from "@/lib/mockData";
import OrderTrackingProgress from "@/components/OrderTrackingProgress";
import { useState } from "react";

const getStatusColor = (status: Quote["status"]) => {
  switch (status) {
    case "Accepted":
      return "bg-blue-500/10 text-blue-500";
    case "Packaging":
      return "bg-purple-500/10 text-purple-500";
    case "Loading":
      return "bg-indigo-500/10 text-indigo-500";
    case "Paid":
      return "bg-green-500/10 text-green-500";
    case "Shipped":
      return "bg-cyan-500/10 text-cyan-500";
    case "Closed":
      return "bg-gray-500/10 text-gray-500";
    case "Cancelled":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};

const getStatusIcon = (status: Quote["status"]) => {
  switch (status) {
    case "Accepted":
      return <CheckCircle2 className="w-4 h-4" />;
    case "Packaging":
      return <Package className="w-4 h-4" />;
    case "Loading":
      return <Package className="w-4 h-4" />;
    case "Paid":
      return <CheckCircle2 className="w-4 h-4" />;
    case "Shipped":
      return <Truck className="w-4 h-4" />;
    case "Closed":
      return <CheckCircle2 className="w-4 h-4" />;
    case "Cancelled":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

const OrderTracking = () => {
  const navigate = useNavigate();
  const orders = mockOrderHistory;
  const [selectedOrder, setSelectedOrder] = useState<Quote | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-primary">Order Tracking</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No orders to track yet</p>
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
              Tracking {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <Card key={order.orderNo} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    {/* Order Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="font-semibold text-foreground hover:text-primary hover:underline transition-colors"
                        >
                          {order.orderNo}
                        </button>
                        <p className="text-sm text-muted-foreground">
                          {order.cropName}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </Badge>
                    </div>

                    {/* FPO Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{order.fpoName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {order.location}
                        </span>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium text-foreground">
                          {order.quantity} {order.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium text-foreground">
                          ₹{order.price.toFixed(2)}/{order.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold text-primary">
                          ₹{(order.quantity * order.price).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Date */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{order.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{order.time}</span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Tracking
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Order Tracking Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Tracking</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedOrder.orderNo}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quote: <button
                        onClick={() => {
                          setSelectedOrder(null);
                          navigate(`/quote/${selectedOrder.quoteNo}`);
                        }}
                        className="text-primary hover:underline"
                      >
                        {selectedOrder.quoteNo}
                      </button>
                    </p>
                  </div>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Commodity</p>
                    <p className="font-medium">{selectedOrder.cropName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">FPO</p>
                    <p className="font-medium">{selectedOrder.fpoName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">{selectedOrder.quantity} {selectedOrder.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-medium text-primary">
                      ₹{(selectedOrder.quantity * selectedOrder.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Progress */}
              <div className="border border-border rounded-lg p-4">
                <OrderTrackingProgress status={selectedOrder.status} />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedOrder(null);
                    navigate(`/quote/${selectedOrder.quoteNo}`);
                  }}
                >
                  View Quote Details
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderTracking;

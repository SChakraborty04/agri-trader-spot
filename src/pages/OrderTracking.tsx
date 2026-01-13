import { ArrowLeft, Package, MapPin, Calendar, Clock, Truck, CheckCircle2, AlertCircle, RefreshCw, LogIn, Loader2, Store, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MobileDock } from "@/components/MobileDock";
import { AuthWidget } from "@/components/AuthWidget";
import { ApiDebugDrawer } from "@/components/ApiDebugDrawer";
import OrderTrackingProgress from "@/components/OrderTrackingProgress";
import { useState, useEffect, useCallback } from "react";
import { fetchOrders, fetchOrderDetail, updateOrderStatus, getAuthToken, OrderResponse, OrderDetailResponse } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("pending")) return "bg-yellow-500/10 text-yellow-600";
  if (statusLower.includes("confirmed")) return "bg-blue-500/10 text-blue-500";
  if (statusLower.includes("processing")) return "bg-purple-500/10 text-purple-500";
  if (statusLower.includes("ready")) return "bg-indigo-500/10 text-indigo-500";
  if (statusLower.includes("shipped") || statusLower.includes("transit")) return "bg-cyan-500/10 text-cyan-500";
  if (statusLower.includes("delivered")) return "bg-green-500/10 text-green-500";
  if (statusLower.includes("cancel")) return "bg-red-500/10 text-red-500";
  return "bg-gray-500/10 text-gray-500";
};

const getStatusIcon = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("pending")) return <Clock className="w-4 h-4" />;
  if (statusLower.includes("confirmed")) return <CheckCircle2 className="w-4 h-4" />;
  if (statusLower.includes("processing") || statusLower.includes("ready")) return <Package className="w-4 h-4" />;
  if (statusLower.includes("shipped") || statusLower.includes("transit") || statusLower.includes("delivery")) return <Truck className="w-4 h-4" />;
  if (statusLower.includes("delivered")) return <CheckCircle2 className="w-4 h-4" />;
  if (statusLower.includes("cancel")) return <AlertCircle className="w-4 h-4" />;
  return <Package className="w-4 h-4" />;
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatTime = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

// Status IDs for order status transitions (from trade_status_master)
const ORDER_STATUS_IDS: Record<string, number> = {
  confirmed: 2,
  processing: 3,
  ready_to_ship: 4,
  shipped: 5,
  delivered: 6,
  cancelled: 7,
};

// Get next possible status for seller
const getNextStatusForSeller = (currentStatus: string): { statusId: number; label: string } | null => {
  const status = currentStatus.toLowerCase();
  if (status.includes("pending")) return { statusId: ORDER_STATUS_IDS.confirmed, label: "Confirm Order" };
  if (status.includes("confirmed")) return { statusId: ORDER_STATUS_IDS.processing, label: "Start Processing" };
  if (status.includes("processing")) return { statusId: ORDER_STATUS_IDS.ready_to_ship, label: "Mark Ready to Ship" };
  if (status.includes("ready")) return { statusId: ORDER_STATUS_IDS.shipped, label: "Mark as Shipped" };
  if (status.includes("shipped") || status.includes("transit")) return { statusId: ORDER_STATUS_IDS.delivered, label: "Mark Delivered" };
  return null;
};

const OrderTracking = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusComment, setStatusComment] = useState("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ orderId: number; statusId: number; label: string } | null>(null);
  const isLoggedIn = !!getAuthToken();

  const loadOrders = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchOrders(role, 50, 0);
      setOrders(response.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, role]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleViewOrder = async (order: OrderResponse) => {
    try {
      setDetailLoading(true);
      const detail = await fetchOrderDetail(order.order_id);
      setSelectedOrder(detail);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = (order: OrderResponse) => {
    const nextStatus = getNextStatusForSeller(order.order_status);
    if (nextStatus) {
      setPendingStatusUpdate({ orderId: order.order_id, ...nextStatus });
      setStatusComment("");
      setShowStatusDialog(true);
    }
  };

  const confirmStatusUpdate = async () => {
    if (!pendingStatusUpdate) return;

    try {
      setStatusUpdateLoading(true);
      await updateOrderStatus(
        pendingStatusUpdate.orderId,
        pendingStatusUpdate.statusId,
        statusComment || undefined
      );
      toast.success("Order status updated successfully");
      setShowStatusDialog(false);
      setPendingStatusUpdate(null);
      setStatusComment("");
      
      // Refresh orders and detail
      loadOrders();
      if (selectedOrder && selectedOrder.order_id === pendingStatusUpdate.orderId) {
        const updatedDetail = await fetchOrderDetail(pendingStatusUpdate.orderId);
        setSelectedOrder(updatedDetail);
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error?.message || "Failed to update order status");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
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

        <main className="container mx-auto px-4 py-6 pb-dock">
          <Card>
            <CardContent className="py-12 text-center">
              <LogIn className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Please login to view your orders</p>
              <Button onClick={() => navigate("/login")}>Login</Button>
            </CardContent>
          </Card>
        </main>

        <MobileDock />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-primary">Order Tracking</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={loadOrders} disabled={loading}>
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <AuthWidget />
            </div>
          </div>
          
          {/* Role Toggle */}
          <Tabs value={role} onValueChange={(v) => setRole(v as "buyer" | "seller")}>
            <TabsList className="grid w-full grid-cols-2 max-w-xs">
              <TabsTrigger value="buyer" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                My Purchases
              </TabsTrigger>
              <TabsTrigger value="seller" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                My Sales
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>


      <main className="container mx-auto px-4 py-6 pb-dock">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No orders to track yet</p>
              <Button className="mt-4" onClick={() => navigate("/")}>
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
                <Card key={order.order_id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    {/* Order Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="font-semibold text-foreground hover:text-primary hover:underline transition-colors"
                        >
                          {order.order_number}
                        </button>
                        <p className="text-sm text-muted-foreground">
                          {order.commodity_name} - {order.variety_name}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.order_status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.order_status)}
                          {order.order_status}
                        </span>
                      </Badge>
                    </div>

                    {/* Seller Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{order.seller_name}</span>
                      </div>
                      {order.delivery_location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{order.delivery_location}</span>
                        </div>
                      )}
                    </div>

                    {/* Order Details */}
                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium text-foreground">
                          {order.order_quantity} {order.unit_of_measure}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium text-foreground">
                          {order.currency === "INR" ? "₹" : order.currency}
                          {order.unit_price.toFixed(2)}/{order.unit_of_measure}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold text-primary">
                          {order.currency === "INR" ? "₹" : order.currency}
                          {order.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {order.outstanding_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Outstanding:</span>
                          <span className="font-medium text-destructive">
                            {order.currency === "INR" ? "₹" : order.currency}
                            {order.outstanding_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Order Date */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(order.order_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(order.order_date)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewOrder(order)}
                        disabled={detailLoading}
                      >
                        View Tracking
                      </Button>
                      {role === "seller" && getNextStatusForSeller(order.order_status) && (
                        <Button
                          className="flex-1"
                          onClick={() => handleStatusUpdate(order)}
                          disabled={statusUpdateLoading}
                        >
                          {getNextStatusForSeller(order.order_status)?.label}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Order Tracking Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Tracking</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedOrder.order_number}</h3>
                    {selectedOrder.quotation_id && (
                      <p className="text-sm text-muted-foreground">
                        From Quote #{selectedOrder.quotation_id}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(selectedOrder.order_status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedOrder.order_status)}
                      {selectedOrder.order_status}
                    </span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Commodity</p>
                    <p className="font-medium">
                      {selectedOrder.commodity_name} - {selectedOrder.variety_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seller</p>
                    <p className="font-medium">{selectedOrder.seller_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">
                      {selectedOrder.order_quantity} {selectedOrder.unit_of_measure}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-medium text-primary">
                      {selectedOrder.currency === "INR" ? "₹" : selectedOrder.currency}
                      {selectedOrder.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {selectedOrder.delivery_location && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Delivery Location</p>
                      <p className="font-medium">{selectedOrder.delivery_location}</p>
                    </div>
                  )}
                  {selectedOrder.delivery_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Delivery</p>
                      <p className="font-medium">{formatDate(selectedOrder.delivery_date)}</p>
                    </div>
                  )}
                  {selectedOrder.outstanding_amount > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                      <p className="font-medium text-destructive">
                        {selectedOrder.currency === "INR" ? "₹" : selectedOrder.currency}
                        {selectedOrder.outstanding_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Progress */}
              <div className="border border-border rounded-lg p-4">
                <OrderTrackingProgress status={selectedOrder.order_status} />
              </div>

              {/* Status History */}
              {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Status History</h4>
                  <div className="space-y-2">
                    {selectedOrder.status_history.map((history) => (
                      <div
                        key={history.history_id}
                        className="flex items-start gap-3 text-sm border-l-2 border-primary/30 pl-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{history.status_description}</p>
                          {history.comments && (
                            <p className="text-muted-foreground">{history.comments}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(history.changed_at)} at {formatTime(history.changed_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payments */}
              {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Payment History</h4>
                  <div className="space-y-2">
                    {selectedOrder.payments.map((payment) => (
                      <div
                        key={payment.payment_id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm"
                      >
                        <div>
                          <p className="font-medium capitalize">{payment.payment_type} Payment</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.payment_mode.toUpperCase()} • {formatDate(payment.created_at)}
                          </p>
                          {payment.transaction_reference && (
                            <p className="text-xs text-muted-foreground">
                              Ref: {payment.transaction_reference}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            +₹{payment.payment_amount.toLocaleString("en-IN")}
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              payment.payment_status === "completed"
                                ? "text-green-600"
                                : payment.payment_status === "failed"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }
                          >
                            {payment.payment_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              {selectedOrder.special_instructions && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Special Instructions</p>
                  <p className="text-sm">{selectedOrder.special_instructions}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {role === "seller" && getNextStatusForSeller(selectedOrder.order_status) && (
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => {
                      const nextStatus = getNextStatusForSeller(selectedOrder.order_status);
                      if (nextStatus) {
                        setPendingStatusUpdate({ orderId: selectedOrder.order_id, ...nextStatus });
                        setStatusComment("");
                        setShowStatusDialog(true);
                      }
                    }}
                    disabled={statusUpdateLoading}
                  >
                    {getNextStatusForSeller(selectedOrder.order_status)?.label}
                  </Button>
                )}
                <Button variant="outline" className="flex-1" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Confirmation Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              {pendingStatusUpdate?.label ? `You are about to: ${pendingStatusUpdate.label}` : "Update the order status"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Add a comment (optional)</label>
              <Textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="E.g., Order shipped via courier, tracking #12345..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowStatusDialog(false);
                setPendingStatusUpdate(null);
              }}
              disabled={statusUpdateLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={confirmStatusUpdate}
              disabled={statusUpdateLoading}
            >
              {statusUpdateLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ApiDebugDrawer />
      <MobileDock />
    </div>
  );
};

export default OrderTracking;
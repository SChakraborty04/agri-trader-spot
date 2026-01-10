import { CheckCircle2 } from "lucide-react";

interface OrderTrackingProgressProps {
  status: string;
}

const OrderTrackingProgress = ({ status }: OrderTrackingProgressProps) => {
  const steps = [
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Processing" },
    { key: "ready_to_ship", label: "Ready" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const getStepIndex = (currentStatus: string) => {
    const statusLower = currentStatus.toLowerCase().replace(/\s+/g, "_");
    const index = steps.findIndex(step => step.key === statusLower);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getStepIndex(status);
  const isCancelled = status.toLowerCase().includes("cancel");

  if (isCancelled) {
    return (
      <div className="py-6 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
          <span className="text-destructive text-lg">✕</span>
        </div>
        <p className="text-sm text-destructive font-medium">Order Cancelled</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-border"
                }`}
              >
                {isCompleted && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <span
                className={`text-xs mt-2 text-center ${
                  isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTrackingProgress;
import { CheckCircle2 } from "lucide-react";
import { Quote } from "@/lib/mockData";

interface OrderTrackingProgressProps {
  status: Quote["status"];
}

const OrderTrackingProgress = ({ status }: OrderTrackingProgressProps) => {
  const steps = [
    { key: "Accepted", label: "Ordered" },
    { key: "Packaging", label: "Packaging" },
    { key: "Loading", label: "Loading" },
    { key: "Paid", label: "Paid" },
    { key: "Shipped", label: "Shipped" },
  ];

  const getStepIndex = (currentStatus: Quote["status"]) => {
    const statusOrder = ["Accepted", "Packaging", "Loading", "Paid", "Shipped", "Closed"];
    return statusOrder.indexOf(currentStatus);
  };

  const currentStepIndex = getStepIndex(status);

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

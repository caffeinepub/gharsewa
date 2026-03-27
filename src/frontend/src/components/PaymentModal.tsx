import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { PaymentMethod, type ServiceRequest } from "../backend.d";
import { useCreatePayment } from "../hooks/useQueries";

const PAYMENT_METHODS = [
  {
    id: PaymentMethod.esewa,
    name: "eSewa",
    icon: "💚",
    color: "border-green-300 bg-green-50 hover:bg-green-100",
    activeColor: "border-green-500 bg-green-50",
    badge: "bg-green-500",
    desc: "Pay via eSewa digital wallet",
  },
  {
    id: PaymentMethod.khalti,
    name: "Khalti",
    icon: "💜",
    color: "border-purple-300 bg-purple-50 hover:bg-purple-100",
    activeColor: "border-purple-500 bg-purple-50",
    badge: "bg-purple-500",
    desc: "Pay via Khalti digital wallet",
  },
  {
    id: PaymentMethod.mobile_banking,
    name: "Mobile Banking",
    icon: "🏦",
    color: "border-blue-300 bg-blue-50 hover:bg-blue-100",
    activeColor: "border-blue-500 bg-blue-50",
    badge: "bg-blue-500",
    desc: "Pay via your bank's mobile app",
  },
];

interface Props {
  request: ServiceRequest;
  onClose: () => void;
}

export default function PaymentModal({ request, onClose }: Props) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [paid, setPaid] = useState(false);
  const createPayment = useCreatePayment();

  const handlePay = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }
    try {
      await createPayment.mutateAsync({
        requestId: request.id,
        method: selectedMethod,
      });
      setPaid(true);
      toast.success("Payment successful! 🎉");
      setTimeout(onClose, 2500);
    } catch {
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm rounded-2xl p-0 overflow-hidden"
        data-ocid="payment.dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">
              Pay for Service
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              data-ocid="payment.close_button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-muted-foreground">Amount due</p>
            <p className="text-xl font-bold text-mustard">
              NRs {request.price.toString()}
            </p>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {paid ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
                data-ocid="payment.success_state"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Payment Successful!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your payment has been processed.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-sm font-medium text-foreground mb-3">
                  Select Payment Method
                </p>
                <div className="space-y-3 mb-5">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                        selectedMethod === method.id
                          ? `${method.activeColor} ring-1 ring-offset-0`
                          : method.color
                      }`}
                      data-ocid="payment.select"
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{method.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {method.desc}
                        </p>
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle2 className="w-5 h-5 ml-auto text-terracotta" />
                      )}
                    </button>
                  ))}
                </div>
                <Button
                  className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-semibold h-11"
                  onClick={handlePay}
                  disabled={createPayment.isPending || !selectedMethod}
                  data-ocid="payment.submit_button"
                >
                  {createPayment.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Proceed to Pay — NRs {request.price.toString()}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full mt-2 text-muted-foreground"
                  onClick={onClose}
                  data-ocid="payment.cancel_button"
                >
                  Cancel
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

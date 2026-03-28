import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  ClipboardList,
  Clock,
  Loader2,
  LogOut,
  PlusCircle,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ServiceRequest,
  ServiceType,
  Status,
  Urgency,
} from "../backend.d";
import PaymentModal from "../components/PaymentModal";
import RatingModal from "../components/RatingModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCancelRequest,
  useCustomerRequests,
  useSubmitRequest,
  useUpdatePrice,
} from "../hooks/useQueries";

const SERVICE_OPTIONS = [
  { type: ServiceType.cleaning, icon: "🧹", label: "Cleaning" },
  { type: ServiceType.plumbing, icon: "🔧", label: "Plumbing" },
  { type: ServiceType.painting, icon: "🎨", label: "Painting" },
  { type: ServiceType.electrical, icon: "⚡", label: "Electrical" },
  { type: ServiceType.moving, icon: "📦", label: "Moving" },
];

const URGENCY_OPTIONS = [
  { value: Urgency.high, label: "Urgent (ASAP)", icon: "🚨" },
  { value: Urgency.medium, label: "Within 1 Hour", icon: "⏰" },
  { value: Urgency.low, label: "Flexible", icon: "🗓️" },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  inProgress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-600 border-red-200",
  },
};

interface Props {
  onLogout: () => void;
}

export default function CustomerDashboard({ onLogout }: Props) {
  const { identity, clear } = useInternetIdentity();
  const { data: requests, isLoading } = useCustomerRequests();
  const submitRequest = useSubmitRequest();
  const updatePrice = useUpdatePrice();
  const cancelRequest = useCancelRequest();

  const [tab, setTab] = useState<"post" | "active" | "history">("post");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null,
  );
  const [selectedUrgency, setSelectedUrgency] = useState<Urgency | null>(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [paymentRequest, setPaymentRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [ratingRequest, setRatingRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [increasePriceId, setIncreasePriceId] = useState<bigint | null>(null);
  const [newPrice, setNewPrice] = useState("");

  const activeRequests =
    requests?.filter(
      (r) =>
        r.status === Status.pending ||
        r.status === Status.accepted ||
        r.status === Status.inProgress,
    ) ?? [];
  const historyRequests =
    requests?.filter(
      (r) => r.status === Status.completed || r.status === Status.cancelled,
    ) ?? [];

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!selectedService) e.service = "Select a service";
    if (!selectedUrgency) e.urgency = "Select urgency";
    if (!price || Number.isNaN(Number(price)) || Number(price) <= 0)
      e.price = "Enter a valid price";
    if (!description.trim()) e.description = "Add a description";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !identity) return;
    const req: ServiceRequest = {
      id: BigInt(0),
      status: Status.pending,
      serviceType: selectedService!,
      urgency: selectedUrgency!,
      customer: identity.getPrincipal(),
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
      description: description.trim(),
      price: BigInt(Math.round(Number(price))),
    };
    try {
      await submitRequest.mutateAsync(req);
      toast.success("Service request posted! Waiting for providers 🎉");
      setSelectedService(null);
      setSelectedUrgency(null);
      setPrice("");
      setDescription("");
      setFormErrors({});
      setTab("active");
    } catch {
      toast.error("Failed to post request. Try again.");
    }
  };

  const handleIncreasePrice = async (requestId: bigint) => {
    if (!newPrice || Number.isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    try {
      await updatePrice.mutateAsync({
        requestId,
        newPrice: BigInt(Math.round(Number(newPrice))),
      });
      toast.success("Price updated!");
      setIncreasePriceId(null);
      setNewPrice("");
    } catch {
      toast.error("Failed to update price.");
    }
  };

  const handleCancel = async (requestId: bigint) => {
    try {
      await cancelRequest.mutateAsync(requestId);
      toast.success("Request cancelled.");
    } catch {
      toast.error("Failed to cancel request.");
    }
  };

  const handleLogout = () => {
    clear();
    onLogout();
  };

  return (
    <div className="min-h-screen pattern-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-beige/95 backdrop-blur-sm border-b border-border shadow-xs">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg terracotta-gradient flex items-center justify-center">
              <span className="text-sm">🏠</span>
            </div>
            <span className="font-bold text-lg text-terracotta">GHARSEWA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                {identity?.getPrincipal().toString().slice(0, 10)}...
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-terracotta"
              data-ocid="header.logout_button"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex">
            {[
              {
                key: "post",
                icon: <PlusCircle className="w-4 h-4" />,
                label: "Post Job",
              },
              {
                key: "active",
                icon: <ClipboardList className="w-4 h-4" />,
                label: "Active",
              },
              {
                key: "history",
                icon: <Clock className="w-4 h-4" />,
                label: "History",
              },
            ].map((t) => (
              <button
                type="button"
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-terracotta text-terracotta"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`dashboard.${t.key}_tab`}
              >
                {t.icon} {t.label}
                {t.key === "active" && activeRequests.length > 0 && (
                  <span className="ml-1 text-xs bg-terracotta text-white rounded-full px-1.5 py-0.5">
                    {activeRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* POST JOB */}
          {tab === "post" && (
            <motion.div
              key="post"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div
                className="bg-white rounded-2xl shadow-card p-5 border border-border"
                data-ocid="job.panel"
              >
                <h2 className="text-lg font-bold mb-4">
                  Post a Service Request
                </h2>

                {/* Service type */}
                <div className="mb-4">
                  <Label className="font-medium mb-2 block">Service Type</Label>
                  {formErrors.service && (
                    <p
                      className="text-xs text-destructive mb-2"
                      data-ocid="job.error_state"
                    >
                      {formErrors.service}
                    </p>
                  )}
                  <div className="grid grid-cols-5 gap-2">
                    {SERVICE_OPTIONS.map((s) => (
                      <button
                        key={s.type}
                        type="button"
                        onClick={() => {
                          setSelectedService(s.type);
                          setFormErrors((p) => ({ ...p, service: "" }));
                        }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-center ${
                          selectedService === s.type
                            ? "border-terracotta bg-terracotta text-white"
                            : "border-border bg-white text-foreground hover:border-terracotta/40"
                        }`}
                        data-ocid="job.select"
                      >
                        <span className="text-xl">{s.icon}</span>
                        <span className="text-xs font-medium leading-tight">
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Urgency */}
                <div className="mb-4">
                  <Label className="font-medium mb-2 block">Urgency</Label>
                  {formErrors.urgency && (
                    <p
                      className="text-xs text-destructive mb-2"
                      data-ocid="job.error_state"
                    >
                      {formErrors.urgency}
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {URGENCY_OPTIONS.map((u) => (
                      <button
                        key={u.value}
                        type="button"
                        onClick={() => {
                          setSelectedUrgency(u.value);
                          setFormErrors((p) => ({ ...p, urgency: "" }));
                        }}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                          selectedUrgency === u.value
                            ? "border-terracotta bg-terracotta/5 text-terracotta"
                            : "border-border bg-white text-foreground hover:border-terracotta/40"
                        }`}
                        data-ocid="job.toggle"
                      >
                        <span className="text-lg">{u.icon}</span>
                        <span className="text-xs font-medium">{u.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <Label htmlFor="price" className="font-medium">
                    Your Offer Price
                  </Label>
                  {formErrors.price && (
                    <p
                      className="text-xs text-destructive mt-1 mb-1"
                      data-ocid="job.error_state"
                    >
                      {formErrors.price}
                    </p>
                  )}
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                      NRs
                    </span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="500"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        setFormErrors((p) => ({ ...p, price: "" }));
                      }}
                      className={`pl-12 ${formErrors.price ? "border-destructive" : ""}`}
                      data-ocid="job.input"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <Label htmlFor="desc" className="font-medium">
                    Description
                  </Label>
                  {formErrors.description && (
                    <p
                      className="text-xs text-destructive mt-1 mb-1"
                      data-ocid="job.error_state"
                    >
                      {formErrors.description}
                    </p>
                  )}
                  <Textarea
                    id="desc"
                    placeholder="Describe the work needed, e.g. 3-room apartment mopping and dusting..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setFormErrors((p) => ({ ...p, description: "" }));
                    }}
                    className={`mt-1 resize-none ${formErrors.description ? "border-destructive" : ""}`}
                    rows={3}
                    data-ocid="job.textarea"
                  />
                </div>

                <Button
                  className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-semibold h-11"
                  onClick={handleSubmit}
                  disabled={submitRequest.isPending}
                  data-ocid="job.submit_button"
                >
                  {submitRequest.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <PlusCircle className="w-4 h-4 mr-2" />
                  )}
                  Post Service Request
                </Button>
              </div>
            </motion.div>
          )}

          {/* ACTIVE REQUESTS */}
          {tab === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold">My Active Requests</h2>
              {isLoading ? (
                <div className="space-y-3" data-ocid="active.loading_state">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                  ))}
                </div>
              ) : activeRequests.length === 0 ? (
                <div
                  className="bg-white rounded-2xl shadow-card p-8 text-center border border-border"
                  data-ocid="active.empty_state"
                >
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-medium text-foreground">
                    No active requests
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Post a job to get started!
                  </p>
                  <Button
                    className="mt-4 bg-terracotta hover:bg-terracotta/90 text-white"
                    onClick={() => setTab("post")}
                    data-ocid="active.primary_button"
                  >
                    Post a Job
                  </Button>
                </div>
              ) : (
                activeRequests.map((req, idx) => {
                  const badge =
                    STATUS_BADGE[req.status] ?? STATUS_BADGE.pending;
                  const svc = SERVICE_OPTIONS.find(
                    (s) => s.type === req.serviceType,
                  );
                  const urg = URGENCY_OPTIONS.find(
                    (u) => u.value === req.urgency,
                  );
                  return (
                    <motion.div
                      key={req.id.toString()}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="bg-white rounded-2xl shadow-card border border-border p-5"
                      data-ocid={`active.item.${idx + 1}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{svc?.icon}</span>
                          <div>
                            <p className="font-bold text-sm">
                              <span className="text-terracotta">Urgent: </span>
                              {svc?.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {urg?.label}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full border font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {req.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-mustard">
                          NRs {req.price.toString()}
                        </span>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {req.status === Status.pending &&
                            (increasePriceId === req.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder="New price"
                                  value={newPrice}
                                  onChange={(e) => setNewPrice(e.target.value)}
                                  className="w-24 h-8 text-sm"
                                  data-ocid="active.input"
                                />
                                <Button
                                  size="sm"
                                  className="bg-mustard hover:bg-mustard/90 text-white h-8 text-xs"
                                  onClick={() => handleIncreasePrice(req.id)}
                                  disabled={updatePrice.isPending}
                                  data-ocid="active.save_button"
                                >
                                  {updatePrice.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    "Update"
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs"
                                  onClick={() => {
                                    setIncreasePriceId(null);
                                    setNewPrice("");
                                  }}
                                  data-ocid="active.cancel_button"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs border-mustard text-mustard hover:bg-mustard/5"
                                onClick={() => {
                                  setIncreasePriceId(req.id);
                                  setNewPrice(req.price.toString());
                                }}
                                data-ocid="active.edit_button"
                              >
                                <TrendingUp className="w-3 h-3 mr-1" /> Increase
                                Price
                              </Button>
                            ))}
                          {req.status === Status.accepted && (
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => setPaymentRequest(req)}
                              data-ocid="active.primary_button"
                            >
                              💳 Pay Now
                            </Button>
                          )}
                          {(req.status === Status.pending ||
                            req.status === Status.accepted) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs border-red-400 text-red-500 hover:bg-red-50"
                              onClick={() => handleCancel(req.id)}
                              disabled={cancelRequest.isPending}
                              data-ocid="active.delete_button"
                            >
                              {cancelRequest.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" /> Cancel
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* HISTORY */}
          {tab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold">Job History</h2>
              {isLoading ? (
                <div className="space-y-3" data-ocid="history.loading_state">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                  ))}
                </div>
              ) : historyRequests.length === 0 ? (
                <div
                  className="bg-white rounded-2xl shadow-card p-8 text-center border border-border"
                  data-ocid="history.empty_state"
                >
                  <div className="text-4xl mb-3">📋</div>
                  <p className="font-medium">No completed jobs yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your completed jobs will appear here.
                  </p>
                </div>
              ) : (
                historyRequests.map((req, idx) => {
                  const badge =
                    STATUS_BADGE[req.status] ?? STATUS_BADGE.completed;
                  const svc = SERVICE_OPTIONS.find(
                    (s) => s.type === req.serviceType,
                  );
                  return (
                    <motion.div
                      key={req.id.toString()}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="bg-white rounded-2xl shadow-card border border-border p-5"
                      data-ocid={`history.item.${idx + 1}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{svc?.icon}</span>
                          <span className="font-semibold text-sm">
                            {svc?.label}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full border font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                        {req.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-mustard">
                          NRs {req.price.toString()}
                        </span>
                        {req.status === Status.completed && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-mustard text-mustard hover:bg-mustard/5"
                            onClick={() => setRatingRequest(req)}
                            data-ocid="history.edit_button"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Rate
                            Provider
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Payment Modal */}
      {paymentRequest && (
        <PaymentModal
          request={paymentRequest}
          onClose={() => setPaymentRequest(null)}
        />
      )}

      {/* Rating Modal */}
      {ratingRequest && (
        <RatingModal
          request={ratingRequest}
          onClose={() => setRatingRequest(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 py-6 bg-footer-bg text-footer-text">
        <div className="max-w-lg mx-auto px-4 text-center text-xs text-footer-text/50">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline hover:text-footer-text transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}

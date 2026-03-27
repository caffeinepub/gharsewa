import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  Briefcase,
  CheckCircle2,
  Loader2,
  LogOut,
  Star,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { type Rating, type ServiceRequest, Status } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAcceptRequest,
  useMarkComplete,
  useMyRatings,
  usePendingRequests,
  useProviderRequests,
} from "../hooks/useQueries";

const SERVICE_OPTIONS: Record<string, { icon: string; label: string }> = {
  cleaning: { icon: "🧹", label: "Cleaning" },
  plumbing: { icon: "🔧", label: "Plumbing" },
  painting: { icon: "🎨", label: "Painting" },
  electrical: { icon: "⚡", label: "Electrical" },
  moving: { icon: "📦", label: "Moving" },
};

const URGENCY_LABELS: Record<string, string> = {
  high: "🚨 Urgent",
  medium: "⏰ Within 1hr",
  low: "🗓️ Flexible",
};

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

export default function ProviderDashboard({ onLogout }: Props) {
  const { identity, clear } = useInternetIdentity();
  const { data: pendingRequests, isLoading: pendingLoading } =
    usePendingRequests();
  const { data: myRequests, isLoading: myLoading } = useProviderRequests();
  const { data: ratings, isLoading: ratingsLoading } = useMyRatings();
  const acceptRequest = useAcceptRequest();
  const markComplete = useMarkComplete();

  const [tab, setTab] = useState<"incoming" | "active" | "ratings">("incoming");
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Track previous pending count to detect new arrivals
  const prevPendingCount = useRef<number | undefined>(undefined);

  // Request browser notification permission on mount
  useEffect(() => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  const visiblePending =
    pendingRequests?.filter((r) => !declinedIds.has(r.id.toString())) ?? [];

  // Watch for new pending requests and notify
  useEffect(() => {
    const currentCount = visiblePending.length;

    if (
      prevPendingCount.current !== undefined &&
      currentCount > prevPendingCount.current
    ) {
      // Fire browser push notification
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        new Notification("New Job Request! 🔔", {
          body: "A customer needs your service. Open GharSewa to accept.",
          icon: "/assets/generated/gharsewa-logo-icon.dim_80x80.png",
        });
      }

      // Show toast alert
      toast("🔔 New job request!", {
        description: "A customer is waiting for your service.",
        duration: 8000,
        action: {
          label: "View",
          onClick: () => setTab("incoming"),
        },
      });

      // Auto-switch to incoming tab if not already there
      setTab((prev) => (prev !== "incoming" ? "incoming" : prev));
    }

    prevPendingCount.current = currentCount;
  }, [visiblePending.length]);

  const activeJobs =
    myRequests?.filter(
      (r) => r.status === Status.accepted || r.status === Status.inProgress,
    ) ?? [];

  const avgRating =
    ratings && ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ratings.length
        ).toFixed(1)
      : null;

  const handleAccept = async (requestId: bigint) => {
    const idStr = requestId.toString();
    setAcceptingId(idStr);
    try {
      await acceptRequest.mutateAsync(requestId);
      toast.success("Job accepted! Get ready to serve 💪");
    } catch {
      toast.error("Failed to accept. Try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDecline = (requestId: bigint) => {
    setDeclinedIds((prev) => new Set([...prev, requestId.toString()]));
  };

  const handleMarkComplete = async (requestId: bigint) => {
    const idStr = requestId.toString();
    setCompletingId(idStr);
    try {
      await markComplete.mutateAsync(requestId);
      toast.success("Job marked as complete! ✅");
    } catch {
      toast.error("Failed to mark complete.");
    } finally {
      setCompletingId(null);
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
            <div>
              <span className="font-bold text-lg text-terracotta">
                GHARSEWA
              </span>
              <span className="ml-2 text-xs bg-mustard/20 text-mustard px-1.5 py-0.5 rounded-full font-medium">
                Provider
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {visiblePending.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-terracotta text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {visiblePending.length}
                </span>
              )}
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

      {/* Stats Row */}
      {avgRating && (
        <div className="bg-white border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-mustard">
              <Star className="w-4 h-4 fill-mustard" />
              <span className="font-bold">{avgRating}</span>
              <span className="text-xs text-muted-foreground">
                avg rating ({ratings?.length} reviews)
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {identity?.getPrincipal().toString().slice(0, 12)}...
            </span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex">
            {[
              {
                key: "incoming",
                icon: <Bell className="w-4 h-4" />,
                label: "Incoming",
                count: visiblePending.length,
              },
              {
                key: "active",
                icon: <Briefcase className="w-4 h-4" />,
                label: "Active Jobs",
                count: activeJobs.length,
              },
              {
                key: "ratings",
                icon: <Star className="w-4 h-4" />,
                label: "Ratings",
                count: 0,
              },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                type="button"
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-terracotta text-terracotta"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`provider.${t.key}_tab`}
              >
                {t.icon} {t.label}
                {t.count > 0 && (
                  <span className="ml-1 text-xs bg-terracotta text-white rounded-full px-1.5 py-0.5">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* INCOMING REQUESTS */}
          {tab === "incoming" && (
            <motion.div
              key="incoming"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold">Incoming Service Requests</h2>
              {pendingLoading ? (
                <div className="space-y-3" data-ocid="incoming.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-36 w-full rounded-2xl" />
                  ))}
                </div>
              ) : visiblePending.length === 0 ? (
                <div
                  className="bg-white rounded-2xl shadow-card p-8 text-center border border-border"
                  data-ocid="incoming.empty_state"
                >
                  <div className="text-4xl mb-3">🔔</div>
                  <p className="font-medium">No new requests</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    New service requests will appear here.
                  </p>
                </div>
              ) : (
                visiblePending.map((req, idx) => (
                  <IncomingRequestCard
                    key={req.id.toString()}
                    req={req}
                    idx={idx}
                    isAccepting={acceptingId === req.id.toString()}
                    onAccept={() => handleAccept(req.id)}
                    onDecline={() => handleDecline(req.id)}
                  />
                ))
              )}
            </motion.div>
          )}

          {/* ACTIVE JOBS */}
          {tab === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold">My Active Jobs</h2>
              {myLoading ? (
                <div className="space-y-3" data-ocid="activejobs.loading_state">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                  ))}
                </div>
              ) : activeJobs.length === 0 ? (
                <div
                  className="bg-white rounded-2xl shadow-card p-8 text-center border border-border"
                  data-ocid="activejobs.empty_state"
                >
                  <div className="text-4xl mb-3">💼</div>
                  <p className="font-medium">No active jobs</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Accept incoming requests to see them here.
                  </p>
                </div>
              ) : (
                activeJobs.map((req, idx) => {
                  const svc = SERVICE_OPTIONS[req.serviceType];
                  const badge =
                    STATUS_BADGE[req.status] ?? STATUS_BADGE.accepted;
                  const isCompleting = completingId === req.id.toString();
                  return (
                    <motion.div
                      key={req.id.toString()}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="bg-white rounded-2xl shadow-card border border-border p-5"
                      data-ocid={`activejobs.item.${idx + 1}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{svc?.icon}</span>
                          <div>
                            <p className="font-bold text-sm">{svc?.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {URGENCY_LABELS[req.urgency]}
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
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-terracotta hover:bg-terracotta/90 text-white"
                          onClick={() => handleMarkComplete(req.id)}
                          disabled={isCompleting}
                          data-ocid="activejobs.primary_button"
                        >
                          {isCompleting ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          Mark Complete
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* RATINGS */}
          {tab === "ratings" && (
            <motion.div
              key="ratings"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">My Ratings</h2>
                {avgRating && (
                  <div className="flex items-center gap-1 bg-mustard/10 text-mustard px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-mustard" />
                    <span className="font-bold">{avgRating}</span>
                  </div>
                )}
              </div>
              {ratingsLoading ? (
                <div className="space-y-3" data-ocid="ratings.loading_state">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                  ))}
                </div>
              ) : !ratings || ratings.length === 0 ? (
                <div
                  className="bg-white rounded-2xl shadow-card p-8 text-center border border-border"
                  data-ocid="ratings.empty_state"
                >
                  <div className="text-4xl mb-3">⭐</div>
                  <p className="font-medium">No ratings yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete jobs to receive ratings from customers.
                  </p>
                </div>
              ) : (
                ratings.map((r: Rating, idx: number) => (
                  <motion.div
                    key={`rating-${idx}-${r.createdAt.toString()}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="bg-white rounded-2xl shadow-card border border-border p-5"
                    data-ocid={`ratings.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= Number(r.rating) ? "fill-mustard text-mustard" : "text-border"}`}
                        />
                      ))}
                    </div>
                    {r.comment && (
                      <p className="text-sm text-muted-foreground italic">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(
                        Number(r.createdAt) / 1_000_000,
                      ).toLocaleDateString("en-NP", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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

function IncomingRequestCard({
  req,
  idx,
  isAccepting,
  onAccept,
  onDecline,
}: {
  req: ServiceRequest;
  idx: number;
  isAccepting: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const svc = SERVICE_OPTIONS[req.serviceType];
  const badge = STATUS_BADGE[req.status] ?? STATUS_BADGE.pending;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      className="bg-white rounded-2xl shadow-card border border-border p-5"
      data-ocid={`incoming.item.${idx + 1}`}
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
              {URGENCY_LABELS[req.urgency]}
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
        <div>
          <span className="font-bold text-mustard text-lg">
            NRs {req.price.toString()}
          </span>
          <p className="text-xs text-muted-foreground">
            {new Date(Number(req.createdAt) / 1_000_000).toLocaleTimeString(
              "en-NP",
              { hour: "2-digit", minute: "2-digit" },
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs border-destructive text-destructive hover:bg-destructive/5"
            onClick={onDecline}
            data-ocid="incoming.delete_button"
          >
            <XCircle className="w-3 h-3 mr-1" /> Decline
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs bg-terracotta hover:bg-terracotta/90 text-white"
            onClick={onAccept}
            disabled={isAccepting}
            data-ocid="incoming.primary_button"
          >
            {isAccepting ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            )}
            Accept
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

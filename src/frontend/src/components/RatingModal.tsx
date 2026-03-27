import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ServiceRequest } from "../backend.d";
import { useAddRating } from "../hooks/useQueries";

const SERVICE_LABELS: Record<string, string> = {
  cleaning: "Cleaning",
  plumbing: "Plumbing",
  painting: "Painting",
  electrical: "Electrical",
  moving: "Moving",
};

interface Props {
  request: ServiceRequest;
  onClose: () => void;
}

export default function RatingModal({ request, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const addRating = useAddRating();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    try {
      await addRating.mutateAsync({
        requestId: request.id,
        ratingValue: BigInt(rating),
        comment: comment.trim(),
      });
      setSubmitted(true);
      toast.success("Rating submitted! Thank you 🙏");
      setTimeout(onClose, 2000);
    } catch {
      toast.error("Failed to submit rating.");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm rounded-2xl p-0 overflow-hidden"
        data-ocid="rating.dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">
              Rate the Service
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              data-ocid="rating.close_button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {SERVICE_LABELS[request.serviceType]} — NRs{" "}
            {request.price.toString()}
          </p>
        </DialogHeader>

        <div className="px-6 py-5">
          {submitted ? (
            <div className="py-8 text-center" data-ocid="rating.success_state">
              <div className="text-5xl mb-3">🙏</div>
              <h3 className="font-bold text-lg">Thank You!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your feedback helps improve our service.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium mb-3">How was the service?</p>
              {/* Star picker */}
              <div className="flex justify-center gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onMouseEnter={() => setHovered(val)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(val)}
                    className="transition-transform hover:scale-110"
                    data-ocid="rating.toggle"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        val <= (hovered || rating)
                          ? "fill-mustard text-mustard"
                          : "text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm font-medium text-mustard mb-4">
                  {
                    ["Terrible", "Bad", "Okay", "Good", "Excellent!"][
                      rating - 1
                    ]
                  }
                </p>
              )}
              <Textarea
                placeholder="Share your experience (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none mb-4"
                rows={3}
                data-ocid="rating.textarea"
              />
              <Button
                className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-semibold h-11"
                onClick={handleSubmit}
                disabled={addRating.isPending || rating === 0}
                data-ocid="rating.submit_button"
              >
                {addRating.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Submit Rating
              </Button>
              <Button
                variant="ghost"
                className="w-full mt-2 text-muted-foreground"
                onClick={onClose}
                data-ocid="rating.cancel_button"
              >
                Skip for Now
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

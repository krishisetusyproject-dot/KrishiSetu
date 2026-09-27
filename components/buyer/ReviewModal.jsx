"use client";

import { useState } from "react";
import { X, Star, MessageSquare } from "lucide-react";

export default function ReviewModal({ isOpen, onClose, order, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !order) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment, orderId: order.id });
      // Reset form
      setRating(0);
      setComment("");
      onClose();
    } catch (err) {
      setError("Failed to submit review. Check connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Rate Farmer</h3>
            <p className="text-xs text-slate-500">How was your experience with {order.farmer}?</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <span className="text-sm font-bold text-slate-700">Overall Quality & Service</span>
            <div className="flex gap-1.5" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`h-9 w-9 ${
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-100 text-slate-300"
                    } transition-colors duration-150`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                {["Poor", "Fair", "Good", "Very Good", "Excellent"][rating - 1]}
              </span>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Additional Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., The tomatoes were perfectly sorted and delivered on time."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          {error && <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600 active:scale-95 transition disabled:opacity-50 shadow-md shadow-amber-500/20"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

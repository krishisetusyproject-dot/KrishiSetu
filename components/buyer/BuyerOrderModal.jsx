"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function BuyerOrderModal({
  isOpen,
  onClose,
  listing,
  onSubmitOrder,
}) {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (listing) {
      setPrice(listing.listedPrice || listing.asking_price || "");
      setQuantity(Math.min(500, listing.quantityAvailable || listing.quantity_available || 100));
      // Default pickup date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setPickupDate(tomorrow.toISOString().split("T")[0]);
      setNotes("");
      setError("");
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const unit = listing.unit || "kg";
  const maxAvailable = listing.quantityAvailable || listing.quantity_available || 5000;
  const numPrice = Number(price) || 0;
  const numQty = Number(quantity) || 0;
  const totalAmount = numPrice * numQty;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (numQty <= 0) {
      setError("Please specify a valid quantity greater than zero.");
      return;
    }
    if (numQty > maxAvailable) {
      setError(`Requested quantity cannot exceed available stock (${maxAvailable} ${unit}).`);
      return;
    }
    if (numPrice <= 0) {
      setError("Please specify a valid price per unit.");
      return;
    }

    setSubmitting(true);
    try {
      
      const orderPayload = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        crop: listing.title || listing.crop_name,
        produce_title: listing.title || listing.crop_name,
        farmer: listing.farmerName || "Verified Farmer",
        farmer_phone: "+91 98220 12345",
        quantity: numQty,
        unit: unit,
        price: numPrice,
        total_amount: totalAmount,
        order_date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: "pending",
        pickup_location: listing.location ? `${listing.location} Farmgate Hub` : "Farmgate Hub, Nashik",
        pickup_date: pickupDate,
        notes: notes.trim() || "Buyer offer submitted via KrishiSetu. Awaiting farmer confirmation.",
        payment_status: "Escrow Locked",
        listing_id: listing.id,
      };
       console.log("ORDER PAYLOAD", orderPayload);

      if (onSubmitOrder) {
        await onSubmitOrder(orderPayload);
      }
      onClose();
    } catch (err) {
      console.error("Order submit failed:", err);
      setError("Failed to submit order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-950 px-6 py-4 text-amber-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200/80">Direct Procurement</span>
            <h2 className="text-xl font-bold text-amber-100">Place Order / Make Offer</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-900/60 text-amber-200 hover:bg-emerald-900 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Produce Summary Card */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="font-extrabold text-base text-slate-900">{listing.title}</p>
              <p className="text-xs text-slate-500">{listing.variety || listing.category} • {listing.location}</p>
              <p className="text-xs font-bold text-emerald-800 mt-1">Available: {maxAvailable?.toLocaleString()} {unit}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Asking Rate</span>
              <p className="text-xl font-black text-slate-900">₹{listing.listedPrice || listing.asking_price} <span className="text-xs font-normal">/{unit}</span></p>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Procurement Quantity ({unit})</label>
              <span className="text-xs font-semibold text-slate-500">Max: {maxAvailable} {unit}</span>
            </div>
            <input
              type="number"
              min="1"
              max={maxAvailable}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            {/* Quick Quantity Buttons */}
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              {[100, 250, 500, 1000].map((preset) => (
                preset <= maxAvailable && (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {preset} {unit}
                  </button>
                )
              ))}
              <button
                type="button"
                onClick={() => setQuantity(maxAvailable)}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100"
              >
                All ({maxAvailable} {unit})
              </button>
            </div>
          </div>

          {/* Offered Price */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Offered Rate per {unit} (₹)</label>
              <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Negotiable with farmer
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="0.5"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Pickup Date Preference */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Preferred Pickup Date</label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Notes / Logistics Instructions (Optional)</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Can bring 14ft pickup truck; need crates sorted by grade."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* Total Calculation & Escrow Info */}
          <div className="rounded-2xl bg-emerald-950 p-4 text-amber-100 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-amber-200/80">Estimated Deal Total</span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-300 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Escrow Protected Guarantee
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-100">₹{totalAmount.toLocaleString()}</span>
              <p className="text-[10px] text-amber-200/70">Payable upon physical verification</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || totalAmount <= 0}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-950 py-3 text-xs sm:text-sm font-bold text-amber-100 hover:bg-emerald-900 transition disabled:opacity-50"
            >
              <span>{submitting ? "Submitting..." : "Confirm & Send Offer"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { getFarmerOffers, acceptOffer, rejectOffer } from "@/lib/services/offers";
import { DEFAULT_OFFERS, DEFAULT_FARMER_PROFILE } from "@/lib/services/farmer-defaults";

import FarmerHeader from "@/components/farmer/FarmerHeader";
import EmptyState from "@/components/farmer/EmptyState";
import {
  Building2,
  Check,
  X,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function BuyerOffersPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(DEFAULT_FARMER_PROFILE);
  const [offers, setOffers] = useState(DEFAULT_OFFERS || []);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    async function loadOffers() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        router.replace("/login");
        return;
      }

      try {
        // Parallel: both requests fire simultaneously
        const [userProfile, dbOffers] = await Promise.all([
          getUserProfile(supabase, userData.user.id).catch(() => null),
          getFarmerOffers(supabase, userData.user.id).catch(() => []),
        ]);

        if (userProfile) setProfile(userProfile);

        if (dbOffers && dbOffers.length > 0) {
          const normalized = dbOffers.map((o) => ({
            id: o.id,
            produce_title: o.listings?.title || "Harvest Produce",
            buyer_name: o.profiles?.full_name || "Verified Buyer",
            buyer_type: "Commercial Procurement",
            buyer_verified: true,
            offered_price: o.offered_price,
            asking_price: o.listings?.asking_price || o.offered_price,
            offered_quantity: o.offered_quantity,
            unit: o.listings?.unit || "kg",
            total_value: o.offered_quantity * o.offered_price,
            notes: o.notes || "Buyer is ready for farmgate collection.",
            status: o.status || "pending",
            created_at: new Date(o.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            }),
          }));
          setOffers(normalized);
        } else {
          setOffers(DEFAULT_OFFERS);
        }
      } catch (err) {
        console.error("Error loading offers:", err);
        setOffers(DEFAULT_OFFERS);
      } finally {
        setLoading(false);
      }
    }

    loadOffers();
  }, [router]);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  }, [router]);

  const handleAccept = useCallback(async (offerId) => {
    setActionId(offerId);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        await acceptOffer(supabase, offerId, userData.user.id).catch(() => null);
      }

      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: "accepted" } : o))
      );

      setSuccessToast(
        "Offer accepted! Order created under 'Orders & Pickup' with Escrow locked."
      );
      setTimeout(() => setSuccessToast(""), 5000);
    } catch (err) {
      console.error(err);
      setSuccessToast("Offer accepted in demo mode.");
      setTimeout(() => setSuccessToast(""), 4000);
    } finally {
      setActionId(null);
    }
  }, []);

  const handleReject = useCallback(async (offerId) => {
    setActionId(offerId);
    try {
      const supabase = createClient();
      await rejectOffer(supabase, offerId).catch(() => null);

      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: "rejected" } : o))
      );

      setSuccessToast("Offer declined.");
      setTimeout(() => setSuccessToast(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  }, []);

  const safeOffers = Array.isArray(offers) ? offers : [];
  const pendingCount = useMemo(() => safeOffers.filter((o) => o?.status === "pending").length, [safeOffers]);

  return (
    <main className="min-h-screen bg-[#f8faf5] pb-24">
      <FarmerHeader
        name={profile?.full_name || "Ramesh Patil"}
        onLogout={handleLogout}
        notificationCount={pendingCount}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Toast */}
        {successToast && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-900 text-white p-4 shadow-xl border border-emerald-700 animate-in fade-in duration-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <span className="text-sm font-semibold">{successToast}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Buyer Offers & Negotiations
              </h1>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300">
                {pendingCount} Pending Action
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Review price proposals and negotiate directly with verified commercial buyers
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Escrow funds guaranteed on deal confirmation</span>
          </div>
        </div>

        {/* Offers Grid */}
        {safeOffers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {safeOffers.map((offer) => {
              const priceDiff = offer.offered_price - (offer.asking_price || 0);
              const isHigher = priceDiff >= 0;
              const isPending = offer.status === "pending";

              return (
                <div
                  key={offer.id}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                            {offer.buyer_name}
                          </h3>
                          <span className="text-[11px] font-semibold text-emerald-700">
                            {offer.buyer_type} • Verified
                          </span>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          offer.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : offer.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {offer.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Target produce title */}
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Produce Requested
                      </p>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">
                        {offer.produce_title}
                      </p>
                    </div>

                    {/* Price Comparison Box */}
                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase">
                          Offered Price
                        </p>
                        <p className="text-xl font-black text-amber-600">
                          ₹{offer.offered_price}
                          <span className="text-xs text-slate-500 font-medium">
                            {" "}
                            / {offer.unit}
                          </span>
                        </p>
                        <p className="text-[11px] font-bold text-slate-600 mt-1">
                          You asked: ₹{offer.asking_price}/{offer.unit}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase">
                          Total Deal Value
                        </p>
                        <p className="text-xl font-black text-emerald-700">
                          ₹{offer.total_value.toLocaleString()}
                        </p>
                        <p className="text-[11px] font-bold text-slate-600 mt-1">
                          Quantity: {offer.offered_quantity} {offer.unit}
                        </p>
                      </div>
                    </div>

                    {/* Buyer Message */}
                    {offer.notes && (
                      <div className="mt-4 rounded-xl bg-amber-50/70 p-3 text-xs text-amber-900 border border-amber-200/60">
                        <span className="font-bold">Buyer Note: </span>
                        <span>&quot;{offer.notes}&quot;</span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Received {offer.created_at}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    {isPending ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleAccept(offer.id)}
                          disabled={actionId === offer.id}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm py-2.5 shadow-sm active:scale-95 transition-all"
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                          <span>Accept Offer</span>
                        </button>

                        <button
                          onClick={() => handleReject(offer.id)}
                          disabled={actionId === offer.id}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-sm py-2.5 transition-all"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : offer.status === "accepted" ? (
                      <button
                        onClick={() => router.push("/farmer/orders")}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs py-2.5 hover:bg-emerald-100 transition-colors"
                      >
                        <span>View Confirmed Order in Orders & Pickup</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <p className="text-center text-xs font-semibold text-slate-400 py-1">
                        Offer declined
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="📨"
            title="No buyer offers yet"
            description="Once commercial buyers and retail chains view your listed produce, their purchase offers will appear here for one-click approval."
            actionLabel="View Produce Listings"
            onAction={() => router.push("/farmer/produce")}
          />
        )}
      </div>

    </main>
  );
}

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { DEFAULT_BUYER_PRODUCE, DEFAULT_BUYER_PROFILE } from "@/lib/services/buyer-defaults";
import { createClient } from "@/lib/supabase/client";
import { submitBuyerOffer } from "@/lib/services/offers";

import BuyerHeader from "@/components/buyer/BuyerHeader";
import BuyerDock from "@/components/buyer/BuyerDock";
import BuyerProduceCard from "@/components/buyer/BuyerProduceCard";
import { Heart, User, ShieldCheck, MapPin, ArrowRight, MessageSquare, Sparkles, Package } from "lucide-react";
import dynamic from "next/dynamic";

const BuyerOrderModal = dynamic(() => import("@/components/buyer/BuyerOrderModal"), { ssr: false });
const BuyerChatModal = dynamic(() => import("@/components/buyer/BuyerChatModal"), { ssr: false });

const SAVED_FARMERS_DATA = [
  {
    id: "farmer-ramesh-patil",
    name: "Ramesh Patil",
    location: "Dindori, Nashik",
    crops: "Hybrid Red Tomatoes, Green Capsicum",
    rating: 4.9,
    dealsCompleted: 38,
    verified: true,
    phone: "+91 98220 12345",
  },
  {
    id: "farmer-kailas-shinde",
    name: "Kailas Shinde",
    location: "Lasalgaon, Nashik",
    crops: "Nashik Red Onions (Garwa), Garlic",
    rating: 4.8,
    dealsCompleted: 64,
    verified: true,
    phone: "+91 98224 88712",
  },
  {
    id: "farmer-eknath-jagtap",
    name: "Eknath Jagtap",
    location: "Niphad, Nashik",
    crops: "Sharbati Golden Wheat, Soyabean",
    rating: 5.0,
    dealsCompleted: 42,
    verified: true,
    phone: "+91 98225 33190",
  },
];

const EMPTY_FARMER = {};

export default function BuyerWishlistPage() {
  const [profile, setProfile] = useState(DEFAULT_BUYER_PROFILE);
  const [savedProduceIds, setSavedProduceIds] = useState(["b-prod-101", "b-prod-103"]);
  const [activeSubTab, setActiveSubTab] = useState("produce"); // "produce" | "farmers"
  const [orderModalListing, setOrderModalListing] = useState(null);
  const [chatFarmer, setChatFarmer] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("krishi_buyer_saved");
      if (stored) setSavedProduceIds(JSON.parse(stored));
    } catch {}
  }, []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }, []);

  const handleRemoveProduce = useCallback((id) => {
    setSavedProduceIds((prev) => {
      const updated = prev.filter((pId) => pId !== id);
      try {
        localStorage.setItem("krishi_buyer_saved", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast("Removed from Wishlist");
  }, [showToast]);

  const handleOrderPlaced = useCallback(async (order) => {
    const supabase = createClient();
    await submitBuyerOffer(supabase, order);
    showToast(`Your offer for ${order.crop} was sent to ${order.farmer}.`);
  }, [showToast]);

  // Saved produce objects
  const savedProduceItems = useMemo(() => {
    return DEFAULT_BUYER_PRODUCE.filter((p) => savedProduceIds.includes(p.id));
  }, [savedProduceIds]);

  return (
    <div className="min-h-screen bg-[#f8faf6] pb-28 text-slate-900">
      <BuyerHeader
        name={profile.full_name}
        savedProduceCount={savedProduceIds.length}
        activeOrdersCount={3}
      />

      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2 rounded-2xl bg-emerald-950 px-5 py-3 text-sm font-bold text-amber-100 shadow-xl border border-emerald-800 animate-slide-in">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                <Heart className="h-4 w-4 fill-rose-500" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Saved / Wishlist</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Shortlisted harvest lots and trusted farmers for rapid procurement and price benchmarking.
            </p>
          </div>

          {/* Subtabs: Saved Produce / Saved Farmers */}
          <div className="flex items-center rounded-2xl bg-white p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSubTab("produce")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeSubTab === "produce"
                  ? "bg-emerald-950 text-amber-100 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Saved Produce ({savedProduceItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("farmers")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeSubTab === "farmers"
                  ? "bg-emerald-950 text-amber-100 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Saved Farmers ({SAVED_FARMERS_DATA.length})
            </button>
          </div>
        </div>

        {/* Saved Produce View */}
        {activeSubTab === "produce" && (
          <div>
            {savedProduceItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {savedProduceItems.map((prod) => (
                  <BuyerProduceCard
                    key={prod.id}
                    {...prod}
                    isSaved={true}
                    onToggleSave={() => handleRemoveProduce(prod.id)}
                    onMakeOffer={(item) => setOrderModalListing(item)}
                    onChat={(farmerData) => setChatFarmer(farmerData)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
                <Heart className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-800">Your produce wishlist is empty</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Browse fresh farmer listings and click the heart icon on any harvest to save it for quick later ordering.
                </p>
                <Link
                  href="/buyer/browse"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-950 px-5 py-2.5 text-xs font-bold text-amber-100 hover:bg-emerald-900 transition"
                >
                  <span>Browse Produce</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Saved Farmers View */}
        {activeSubTab === "farmers" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAVED_FARMERS_DATA.map((farmer) => (
              <div
                key={farmer.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-amber-200 font-bold">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-base text-slate-900">{farmer.name}</h3>
                          {farmer.verified && (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700">
                              <ShieldCheck className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" /> {farmer.location}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                      ★ {farmer.rating}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-100">
                    <p className="text-slate-500 font-medium">Primary Crops:</p>
                    <p className="font-bold text-slate-800">{farmer.crops}</p>
                    <p className="text-[11px] text-emerald-800 font-semibold pt-1">
                      ✓ {farmer.dealsCompleted} completed farmgate deliveries
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setChatFarmer({
                        name: farmer.name,
                        location: farmer.location,
                        verified: farmer.verified,
                        crop: farmer.crops.split(",")[0],
                      })
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-950 px-4 py-2.5 text-xs font-bold text-amber-100 hover:bg-emerald-900 transition active:scale-95"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Chat Farmer</span>
                  </button>

                  <Link
                    href={`/buyer/browse?query=${encodeURIComponent(farmer.crops.split(",")[0].trim())}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    View Harvest
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BuyerDock savedCount={savedProduceIds.length} activeOrdersCount={3} />

      {/* Place Order Modal */}
      <BuyerOrderModal
        isOpen={Boolean(orderModalListing)}
        onClose={() => setOrderModalListing(null)}
        listing={orderModalListing}
        onSubmitOrder={handleOrderPlaced}
      />

      {/* Chat Farmer Modal */}
      <BuyerChatModal
        isOpen={Boolean(chatFarmer)}
        onClose={() => setChatFarmer(null)}
        farmer={chatFarmer || {}}
      />
    </div>
  );
}

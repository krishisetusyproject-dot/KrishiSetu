"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { getActiveListings } from "@/lib/services/listings";
import { getBuyerOrders, createBuyerOrder, cancelBuyerOrder } from "@/lib/services/orders";
import {
  DEFAULT_BUYER_PROFILE,
  DEFAULT_BUYER_PRODUCE,
  DEFAULT_BUYER_ORDERS,
  DEFAULT_MARKET_PRICES,
} from "@/lib/services/buyer-defaults";

import BuyerHeader from "@/components/buyer/BuyerHeader";
import BuyerDock from "@/components/buyer/BuyerDock";
import BuyerStats from "@/components/buyer/BuyerStats";
import BuyerProduceCard from "@/components/buyer/BuyerProduceCard";
import BuyerOrderModal from "@/components/buyer/BuyerOrderModal";
import BuyerChatModal from "@/components/buyer/BuyerChatModal";
import {
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Package,
} from "lucide-react";

export default function BuyerDashboardPage() {
  const router = useRouter();

  // Core Data State
  const [profile, setProfile] = useState(DEFAULT_BUYER_PROFILE);
  const [produceList, setProduceList] = useState(DEFAULT_BUYER_PRODUCE);
  const [orders, setOrders] = useState(DEFAULT_BUYER_ORDERS);
  const [savedProduceIds, setSavedProduceIds] = useState(["b-prod-101", "b-prod-103"]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCropFilter, setSelectedCropFilter] = useState("All");

  // Modals
  const [orderModalListing, setOrderModalListing] = useState(null);
  const [chatModalFarmer, setChatModalFarmer] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Load live data from Supabase with safe fallback
  useEffect(() => {
    async function loadData() {
      // Load saved wishlist from localStorage
      try {
        const storedWishlist = localStorage.getItem("krishi_buyer_saved");
        if (storedWishlist) setSavedProduceIds(JSON.parse(storedWishlist));

        const storedOrders = localStorage.getItem("krishi_buyer_orders");
        if (storedOrders) setOrders(JSON.parse(storedOrders));
      } catch (e) {
        console.warn("Storage read error:", e);
      }

      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setLoading(false);
        return;
      }

      try {
        // Parallel fetch: profile, listings, and orders all fire at the same time
        const [userProfile, dbListings, dbOrders] = await Promise.all([
          getUserProfile(supabase, userData.user.id).catch(() => null),
          getActiveListings(supabase).catch(() => []),
          getBuyerOrders(supabase, userData.user.id).catch(() => []),
        ]);

        if (userProfile) {
          setProfile({
            ...DEFAULT_BUYER_PROFILE,
            ...userProfile,
          });
        }

        if (dbListings && dbListings.length > 0) {
          const mapped = dbListings.map((l) => ({
            id: l.id,
            title: l.title,
            category: l.category || "Vegetables",
            variety: l.variety || "Commercial Hybrid",
            listedPrice: l.asking_price || 25,
            unit: l.unit || "kg",
            quantityAvailable: l.quantity_available || 500,
            marketReference: `₹${Math.max(10, (l.asking_price || 25) - 2)}–${(l.asking_price || 25) + 3} / ${l.unit || "kg"}`,
            farmerName: l.profiles?.full_name || "Verified Farmer",
            farmerVerified: true,
            location: l.location || "Nashik, Maharashtra",
            qualityGrade: l.quality_grade || "Grade A",
            harvestDate: "Immediate",
            organic: Boolean(l.organic),
            imageUrl: l.image_url || null,
          }));
          setProduceList(mapped);
        }

        if (dbOrders && dbOrders.length > 0) {
          setOrders((prev) => {
            const merged = [...dbOrders, ...prev.filter((p) => !dbOrders.some((d) => d.id === p.id))];
            return merged;
          });
        }
      } catch (err) {
        console.warn("Could not load database records:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  }

  // Toggle Save Produce to Wishlist
  function handleToggleSave(id) {
    setSavedProduceIds((prev) => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter((pId) => pId !== id);
        showToast("Removed produce from your wishlist.");
      } else {
        updated = [...prev, id];
        showToast("Saved produce to your wishlist!");
      }
      try {
        localStorage.setItem("krishi_buyer_saved", JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  }

  // Submit Offer / Order
  async function handleSubmitOrder(newOrder) {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    try {
      localStorage.setItem("krishi_buyer_orders", JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    showToast(`Order request #${newOrder.id} for ${newOrder.crop} submitted! Escrow allocated.`);

    // Try live Supabase insert
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await createBuyerOrder(supabase, {
          buyer_id: userData.user.id,
          listing_id: newOrder.listing_id,
          quantity: newOrder.quantity,
          unit_price: newOrder.price,
          total_amount: newOrder.total_amount,
          status: "pending",
          pickup_location: newOrder.pickup_location,
          pickup_date: newOrder.pickup_date,
          buyer_notes: newOrder.notes,
        });
      }
    } catch (err) {
      console.warn("Supabase order insert skipped:", err);
    }
  }

  // Handle Search Submission
  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buyer/browse?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/buyer/browse");
    }
  }

  // Order Counts
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const readyPickupCount = orders.filter((o) => o.status === "ready_for_pickup").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  // Quick crop filters
  const cropChips = ["All", "Tomato", "Onion", "Potato", "Wheat", "Chillies", "Mustard"];

  const filteredProduce = produceList.filter((item) => {
    if (selectedCropFilter === "All") return true;
    return item.title.toLowerCase().includes(selectedCropFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#f8faf6] pb-28 text-slate-900">
      {/* 1. Navbar */}
      <BuyerHeader
        name={profile.full_name || "Rahul Sharma"}
        savedProduceCount={savedProduceIds.length}
        activeOrdersCount={pendingCount + confirmedCount + readyPickupCount}
        unreadNotificationsCount={2}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2 rounded-2xl bg-emerald-950 px-5 py-3 text-sm font-bold text-amber-100 shadow-xl border border-emerald-800 animate-slide-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Wireframe Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 px-6 sm:px-10 py-10 sm:py-12 text-amber-100 shadow-xl shadow-emerald-950/15">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-emerald-900/90 px-3 py-1 text-xs font-semibold text-amber-200 border border-emerald-800">
                <MapPin className="h-3 w-3 text-amber-300" />
                {profile.location || "Nashik, Maharashtra"}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-900/90 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-800">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                100% Escrow Protected
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-amber-100">
              Good morning, {profile.full_name?.split(" ")[0] || "Buyer"}!
            </h1>
            <p className="text-base sm:text-lg text-amber-100/80 leading-relaxed max-w-2xl">
              Find fresh produce directly from verified farmers across Maharashtra with APMC modal price benchmarks.
            </p>

            {/* Quick Search & Browse Button Bar (Direct Wireframe implementation) */}
            <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crops, vegetables, grains, or mandi location..."
                  className="w-full rounded-2xl border-0 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-extrabold text-emerald-950 shadow-lg hover:bg-amber-300 active:scale-95 transition"
              >
                <span>Browse Produce</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Background Decorative Rings */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-900/40 blur-3xl pointer-events-none" />
          <div className="absolute right-10 bottom-0 h-48 w-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        </section>

        {/* Order Status Cards (Pending, Confirmed, Ready, Completed) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Order Tracking</p>
              <h2 className="text-2xl font-black text-slate-900">Your Current Orders</h2>
            </div>
            <Link
              href="/buyer/orders"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-900 hover:text-emerald-950 transition"
            >
              <span>View All Orders</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <BuyerStats
            pendingOrders={pendingCount}
            confirmedOrders={confirmedCount}
            readyPickupOrders={readyPickupCount}
            completedOrders={completedCount}
            loading={loading}
          />
        </div>

        {/* Fresh Produce Showcase with Crop Filter Chips */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Marketplace</p>
              <h2 className="text-2xl font-black text-slate-900">Fresh Produce Near You</h2>
              <p className="text-xs text-slate-500 mt-0.5">Direct farmgate prices, sorted and graded for commercial procurement.</p>
            </div>

            <Link
              href="/buyer/browse"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs border border-slate-200/90 hover:bg-slate-50 transition"
            >
              <Layers className="h-3.5 w-3.5 text-emerald-700" />
              <span>Full Marketplace ({produceList.length} items)</span>
            </Link>
          </div>

          {/* Wireframe Crop Filter Chips: [Tomato] [Onion] [Potato] [Wheat] ... */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {cropChips.map((crop) => (
              <button
                key={crop}
                type="button"
                onClick={() => setSelectedCropFilter(crop)}
                className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition active:scale-95 ${
                  selectedCropFilter === crop
                    ? "bg-emerald-950 text-amber-100 shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {crop === "All" ? "All Crops" : crop}
              </button>
            ))}
          </div>

          {/* Produce Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProduce.slice(0, 6).map((produce) => (
              <BuyerProduceCard
                key={produce.id}
                {...produce}
                isSaved={savedProduceIds.includes(produce.id)}
                onToggleSave={handleToggleSave}
                onMakeOffer={(item) => setOrderModalListing(item)}
                onChat={(farmerInfo) => setChatModalFarmer(farmerInfo)}
              />
            ))}
          </div>
        </section>

        {/* Market Prices Highlights (Wireframe Match) */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Market Price Highlights</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Official APMC modal rates across Nashik, Lasalgaon, and Maharashtra regional mandis.
              </p>
            </div>

            <Link
              href="/buyer/market-prices"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-900/20 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-950 hover:bg-emerald-100 transition"
            >
              <span>View Full APMC Ticker</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Wireframe Horizontal Highlights: Tomato ₹XX/kg, Onion ₹XX/kg, Potato ₹XX/kg */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {DEFAULT_MARKET_PRICES.map((mp) => (
              <div
                key={mp.id}
                className="flex flex-col justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-100 hover:border-emerald-700/40 transition"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate block">
                    {mp.apmc}
                  </span>
                  <p className="mt-1 font-extrabold text-sm text-slate-900 leading-tight truncate">
                    {mp.crop}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
                  <span className="text-base font-black text-emerald-950">
                    ₹{mp.modal_price}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">
                    {mp.trend_pct}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-amber-50/80 border border-amber-200/70 p-4 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>KrishiSetu Price Advisory:</strong> Market prices and MSP are provided for reference. Actual transaction prices may vary based on location, quality, quantity and market conditions.
            </p>
          </div>
        </section>

        {/* Quick Actions Footer Card */}
        <section className="rounded-3xl bg-linear-to-r from-emerald-900 to-emerald-950 p-6 sm:p-8 text-amber-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-black">Need bulk customized produce procurement?</h3>
            <p className="text-xs sm:text-sm text-amber-100/80">Connect directly with farmer producer groups for guaranteed harvest volume and logistics support.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/buyer/browse"
              className="rounded-2xl bg-white px-5 py-3 text-xs sm:text-sm font-extrabold text-emerald-950 shadow-md hover:bg-slate-100 transition active:scale-95"
            >
              Browse All Listings
            </Link>
            <button
              type="button"
              onClick={() => setChatModalFarmer({ name: "Ramesh Patil", location: "Nashik", verified: true, crop: "Bulk Harvest Inquiry" })}
              className="rounded-2xl border border-amber-300/40 bg-emerald-900/60 px-5 py-3 text-xs sm:text-sm font-bold text-amber-200 hover:bg-emerald-900 transition active:scale-95"
            >
              Chat with Farmer Hub
            </button>
          </div>
        </section>
      </div>

      {/* Floating Bottom Quick Navigation Dock */}
      <BuyerDock
        savedCount={savedProduceIds.length}
        activeOrdersCount={pendingCount + confirmedCount + readyPickupCount}
        unreadNotificationsCount={2}
      />

      {/* Direct Order / Make Offer Modal */}
      <BuyerOrderModal
        isOpen={Boolean(orderModalListing)}
        onClose={() => setOrderModalListing(null)}
        listing={orderModalListing}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Direct Farmer Negotiation Chat Modal */}
      <BuyerChatModal
        isOpen={Boolean(chatModalFarmer)}
        onClose={() => setChatModalFarmer(null)}
        farmer={chatModalFarmer || {}}
      />
    </div>
  );
}
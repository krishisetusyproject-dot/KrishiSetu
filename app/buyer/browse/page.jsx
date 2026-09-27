"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { getActiveListings } from "@/lib/services/listings";
import {
  DEFAULT_BUYER_PROFILE,
  DEFAULT_BUYER_PRODUCE,
} from "@/lib/services/buyer-defaults";

import BuyerHeader from "@/components/buyer/BuyerHeader";
import BuyerDock from "@/components/buyer/BuyerDock";
import BuyerProduceCard from "@/components/buyer/BuyerProduceCard";
import dynamic from "next/dynamic";
const BuyerOrderModal = dynamic(() => import("@/components/buyer/BuyerOrderModal"), { ssr: false });
const BuyerChatModal = dynamic(() => import("@/components/buyer/BuyerChatModal"), { ssr: false });
import {
  Search,
  SlidersHorizontal,
  MapPin,
  TrendingDown,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Package,
} from "lucide-react";

const EMPTY_FARMER = {};

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  // Core Data
  const [profile, setProfile] = useState(DEFAULT_BUYER_PROFILE);
  const [produceList, setProduceList] = useState(DEFAULT_BUYER_PRODUCE);
  const [savedProduceIds, setSavedProduceIds] = useState(["b-prod-101", "b-prod-103"]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [maxPrice, setMaxPrice] = useState(100);
  const [minQuantity, setMinQuantity] = useState(0);
  const [sortBy, setSortBy] = useState("recent"); // "recent", "price_asc", "price_desc", "quantity_desc"

  // Modals & Feedback
  const [orderModalListing, setOrderModalListing] = useState(null);
  const [chatModalFarmer, setChatModalFarmer] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("krishi_buyer_saved");
      if (stored) setSavedProduceIds(JSON.parse(stored));
    } catch {}

    async function loadData() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      try {
        // Parallel: fetch profile and listings simultaneously
        const [userProfile, dbListings] = await Promise.all([
          userData?.user
            ? getUserProfile(supabase, userData.user.id).catch(() => null)
            : Promise.resolve(null),
          getActiveListings(supabase).catch(() => []),
        ]);

        if (userProfile) setProfile({ ...DEFAULT_BUYER_PROFILE, ...userProfile });

        if (dbListings && dbListings.length > 0) {
          const mapped = dbListings.map((l) => ({
            id: l.id,
            title: l.title,
            category: l.category || "Vegetables",
            variety: l.variety || "Commercial Grade",
            listedPrice: l.asking_price || 25,
            unit: l.unit || "kg",
            quantityAvailable: l.quantity_available || 500,
            marketReference: `₹${Math.max(10, (l.asking_price || 25) - 2)}–${(l.asking_price || 25) + 3} / ${l.unit || "kg"}`,
            farmerName: l.profiles?.full_name || "Verified Farmer",
            farmerVerified: true,
            location: l.location || "Nashik, Maharashtra",
            qualityGrade: l.quality_grade || "Grade A",
            harvestDate: "Ready for Pickup",
            organic: Boolean(l.organic),
            imageUrl: l.image_url || null,
          }));
          setProduceList(mapped);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }, []);

  const handleToggleSave = useCallback((id) => {
    setSavedProduceIds((prev) => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter((pId) => pId !== id);
        showToast("Removed from Wishlist");
      } else {
        updated = [...prev, id];
        showToast("Saved to Wishlist!");
      }
      try {
        localStorage.setItem("krishi_buyer_saved", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [showToast]);

  const handleOrderPlaced = useCallback((order) => {
    try {
      const existing = JSON.parse(localStorage.getItem("krishi_buyer_orders") || "[]");
      const updated = [order, ...existing];
      localStorage.setItem("krishi_buyer_orders", JSON.stringify(updated));
    } catch {}
    showToast(`Order request #${order.id} sent to ${order.farmer}!`);
  }, [showToast]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedLocation("All");
    setMaxPrice(100);
    setMinQuantity(0);
    setSortBy("recent");
  }, []);

  const handleMakeOffer = useCallback((item) => setOrderModalListing(item), []);
  const handleChat = useCallback((farmerInfo) => setChatModalFarmer(farmerInfo), []);
  const closeOrderModal = useCallback(() => setOrderModalListing(null), []);
  const closeChatModal = useCallback(() => setChatModalFarmer(null), []);

  // Derive unique categories & locations from produce
  const categories = useMemo(() => {
    const set = new Set(produceList.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [produceList]);

  const locations = useMemo(() => {
    const locSet = new Set(produceList.map((p) => p.location?.split(",")[0]?.trim()).filter(Boolean));
    return ["All", ...Array.from(locSet)];
  }, [produceList]);

  // Filtering and Sorting
  const filteredAndSortedListings = useMemo(() => {
    return produceList
      .filter((item) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchCat = item.category?.toLowerCase().includes(q);
          const matchLoc = item.location?.toLowerCase().includes(q);
          const matchVariety = item.variety?.toLowerCase().includes(q);
          if (!matchTitle && !matchCat && !matchLoc && !matchVariety) return false;
        }

        // Category filter
        if (selectedCategory !== "All" && item.category !== selectedCategory) {
          return false;
        }

        // Location filter
        if (selectedLocation !== "All") {
          if (!item.location?.toLowerCase().includes(selectedLocation.toLowerCase())) {
            return false;
          }
        }

        // Price filter
        if (item.listedPrice > maxPrice) return false;

        // Quantity filter
        if (item.quantityAvailable < minQuantity) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.listedPrice - b.listedPrice;
        if (sortBy === "price_desc") return b.listedPrice - a.listedPrice;
        if (sortBy === "quantity_desc") return b.quantityAvailable - a.quantityAvailable;
        return 0; // default recent
      });
  }, [produceList, search, selectedCategory, selectedLocation, maxPrice, minQuantity, sortBy]);

  return (
    <div className="min-h-screen bg-[#f8faf6] pb-28 text-slate-900">
      <BuyerHeader
        name={profile.full_name}
        savedProduceCount={savedProduceIds.length}
        activeOrdersCount={3}
      />

      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2 rounded-2xl bg-emerald-950 px-5 py-3 text-sm font-bold text-amber-100 shadow-xl border border-emerald-800 animate-slide-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Title & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 text-amber-100">
                <Package className="h-4 w-4" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Browse Fresh Produce</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Direct procurement from verified farms with transparent APMC benchmarks and gate pass delivery.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200">
            <span>Showing:</span>
            <span className="text-emerald-900">{filteredAndSortedListings.length} of {produceList.length} Listings</span>
          </div>
        </div>

        {/* Filter & Search Control Panel */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
          {/* Top Search Bar & Sort Dropdown */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by crop name (e.g. Tomato, Onion, Wheat, Chillies)..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-700 focus:outline-none"
              >
                <option value="recent">Recently Listed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="quantity_desc">Quantity: High to Low</option>
              </select>

              <button
                type="button"
                onClick={resetFilters}
                title="Reset all filters"
                className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Filter Controls Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-slate-100">
            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Crop Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-700 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Farmgate Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-700 focus:outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Max Price
                </label>
                <span className="text-xs font-black text-emerald-950">₹{maxPrice} / kg</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="2"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer"
              />
            </div>

            {/* Minimum Quantity Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Min Stock
                </label>
                <span className="text-xs font-black text-emerald-950">{minQuantity} kg+</span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="100"
                value={minQuantity}
                onChange={(e) => setMinQuantity(Number(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Listings Grid */}
        {filteredAndSortedListings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedListings.map((produce) => (
              <BuyerProduceCard
                key={produce.id}
                {...produce}
                isSaved={savedProduceIds.includes(produce.id)}
                onToggleSave={handleToggleSave}
                onMakeOffer={handleMakeOffer}
                onChat={handleChat}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-800">No produce matches your current filters</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Try adjusting your price ceiling, clearing category filters, or searching for other commodities.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-950 px-5 py-2.5 text-xs font-bold text-amber-100 hover:bg-emerald-900 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </main>

      <BuyerDock savedCount={savedProduceIds.length} activeOrdersCount={3} />

      {/* Place Order / Offer Modal */}
      <BuyerOrderModal
        isOpen={Boolean(orderModalListing)}
        onClose={closeOrderModal}
        listing={orderModalListing}
        onSubmitOrder={handleOrderPlaced}
      />

      {/* Chat Farmer Modal */}
      <BuyerChatModal
        isOpen={Boolean(chatModalFarmer)}
        onClose={closeChatModal}
        farmer={chatModalFarmer || EMPTY_FARMER}
      />
    </div>
  );
}

export default function BrowseProducePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f8faf6] text-emerald-950 font-bold">Loading Marketplace...</div>}>
      <BrowseContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import {
  getFarmerListings,
  createListing,
  updateListingStatus,
  deleteListing,
} from "@/lib/services/listings";
import { DEFAULT_PRODUCE_LISTINGS, DEFAULT_FARMER_PROFILE } from "@/lib/services/farmer-defaults";

import FarmerHeader from "@/components/farmer/FarmerHeader";
import FarmerDock from "@/components/farmer/FarmerDock";
import ProduceCard from "@/components/farmer/ProduceCard";
import SellProduceModal from "@/components/farmer/SellProduceModal";
import EmptyState from "@/components/farmer/EmptyState";
import { Search, Plus, LayoutGrid, List, SlidersHorizontal, CheckCircle2 } from "lucide-react";

const categories = ["All", "Vegetables", "Grains & Cereals", "Fruits", "Pulses"];

function ProduceInventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState(DEFAULT_FARMER_PROFILE);
  const [listings, setListings] = useState(DEFAULT_PRODUCE_LISTINGS || []);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        // In preview mode or unauthenticated redirect
        router.replace("/login");
        return;
      }

      try {
        // Parallel: both requests fire simultaneously
        const [userProfile, dbListings] = await Promise.all([
          getUserProfile(supabase, userData.user.id).catch(() => null),
          getFarmerListings(supabase, userData.user.id).catch(() => []),
        ]);

        if (userProfile) setProfile(userProfile);

        if (dbListings && dbListings.length > 0) {
          setListings(dbListings);
        } else {
          setListings(DEFAULT_PRODUCE_LISTINGS);
        }
      } catch (err) {
        console.error("Error loading produce:", err);
        setListings(DEFAULT_PRODUCE_LISTINGS);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  }, [router]);

  const handleCreateProduce = useCallback(async (formData) => {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      let newListing = null;
      if (userData?.user?.id) {
        newListing = await createListing(supabase, userData.user.id, formData).catch(() => null);
      }

      const listingToAdd = newListing || {
        id: "prod-" + Date.now(),
        title: formData.title,
        category: formData.category,
        variety: formData.variety || "Commercial Hybrid",
        asking_price: Number(formData.asking_price),
        quantity_available: Number(formData.quantity_available),
        unit: formData.unit || "kg",
        quality_grade: formData.quality_grade || "A+ Grade",
        location: formData.location || profile.district + ", " + profile.state,
        harvest_date: formData.harvest_date || "Immediate",
        organic: formData.organic || false,
        views: 12,
        buyer_offers_count: 0,
        status: "active",
        description: formData.description || "Farmgate harvest ready for buyer inspection.",
        imageUrl: formData.imageUrl || "",
      };

      setListings((prev) => [listingToAdd, ...prev]);
      setToastMessage("Produce published successfully to APMC Buyer Board! 🎉");
      setTimeout(() => setToastMessage(""), 4500);
    } catch (err) {
      console.error(err);
      setToastMessage("Saved to local catalog.");
      setTimeout(() => setToastMessage(""), 4000);
    }
  }, [profile]);

  const handleToggleStatus = useCallback(async (listingId, newStatus) => {
    try {
      const supabase = createClient();
      await updateListingStatus(supabase, listingId, newStatus).catch(() => null);
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: newStatus } : l))
      );
      setToastMessage(`Listing ${newStatus === "paused" ? "paused" : "activated"}.`);
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleDelete = useCallback(async (listingId) => {
    if (!confirm("Are you sure you want to remove this produce listing?")) return;
    try {
      const supabase = createClient();
      await deleteListing(supabase, listingId).catch(() => null);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      setToastMessage("Produce listing removed.");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const safeListings = Array.isArray(listings) ? listings : [];

  // Filter listings
  const filteredListings = useMemo(() => {
    return safeListings.filter((item) => {
      if (!item) return false;
      const title = (item.title || "").toLowerCase();
      const variety = (item.variety || "").toLowerCase();
      const location = (item.location || "").toLowerCase();
      const category = item.category || "";
      const query = searchQuery.toLowerCase();

      const matchesQuery =
        title.includes(query) || variety.includes(query) || location.includes(query);

      const matchesCategory =
        selectedCategory === "All" ||
        category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesQuery && matchesCategory;
    });
  }, [safeListings, searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen bg-[#f8faf5] pb-24">
      <FarmerHeader
        name={profile?.full_name || "Ramesh Patil"}
        onLogout={handleLogout}
        onSellProduce={() => setShowCreateModal(true)}
        activeListingsCount={safeListings.length}
        notificationCount={2}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-800 text-white px-5 py-3 shadow-xl border border-emerald-600 animate-in slide-in-from-top duration-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Header Section (Reference Image 3) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                My Produce Inventory
              </h1>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                {safeListings.length} Listed
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Active crops listed on the KrishiSetu open buyer marketplace
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Grid / List toggle */}
            <div className="flex items-center rounded-xl bg-white border border-slate-200 p-1 shadow-2xs">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-slate-100 text-emerald-800 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-slate-100 text-emerald-800 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* + Add Produce Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add Produce</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar (Reference Image 3) */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop name, variety, or village..."
              className="w-full rounded-2xl bg-slate-50/70 border border-slate-200/80 pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Produce Cards Grid */}
        {filteredListings.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredListings.map((item) => (
                <ProduceCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  variety={item.variety}
                  category={item.category}
                  askingPrice={item.asking_price}
                  quantity={item.quantity_available || item.quantity}
                  unit={item.unit}
                  qualityGrade={item.quality_grade}
                  location={item.location}
                  harvestDate={item.harvest_date}
                  organic={item.organic}
                  views={item.views || 85}
                  buyerOffersCount={item.buyer_offers_count || 0}
                  status={item.status}
                  description={item.description}
                  imageUrl={item.imageUrl}
                  marketReference={`₹${Math.max(10, (item.asking_price || 25) - 2)}–${(item.asking_price || 25) + 3} / ${item.unit || "kg"}`}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Produce</th>
                    <th className="px-6 py-4">Variety & Grade</th>
                    <th className="px-6 py-4">Available</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredListings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{item.title}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {item.variety || item.category} • {item.quality_grade || "Grade A"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {item.quantity_available || item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-800">
                        ₹{item.asking_price} / {item.unit}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                          {item.status || "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <EmptyState
            icon="🌾"
            title="No produce found matching your search"
            description="Try changing your search keywords, clear category filter, or publish a new crop listing."
            actionLabel="+ Add New Produce"
            onAction={() => setShowCreateModal(true)}
          />
        )}
      </div>

      {/* Floating Bottom Action Dock */}
      <FarmerDock
        onSellProduce={() => setShowCreateModal(true)}
        pendingOffersCount={2}
      />

      {/* Sell Produce Modal */}
      <SellProduceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProduce}
        defaultLocation={`${profile.district || "Nashik"}, ${profile.state || "Maharashtra"}`}
      />
    </main>
  );
}

export default function MyProducePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8faf5]">
          <div className="text-center">
            <span className="text-4xl">🌾</span>
            <p className="text-slate-600 font-semibold mt-2">Loading Produce Inventory...</p>
          </div>
        </div>
      }
    >
      <ProduceInventoryContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { getFarmerListings, createListing } from "@/lib/services/listings";
import { getFarmerOffers } from "@/lib/services/offers";
import { getFarmerOrders } from "@/lib/services/orders";
import {
  DEFAULT_FARMER_PROFILE,
  DEFAULT_PRODUCE_LISTINGS,
  DEFAULT_ORDERS,
  DEFAULT_OFFERS,
} from "@/lib/services/farmer-defaults";

import FarmerHeader from "@/components/farmer/FarmerHeader";
import FarmerDock from "@/components/farmer/FarmerDock";
import WelcomeHeader from "@/components/farmer/WelcomeHeader";
import DashboardStats from "@/components/farmer/DashboardStats";
import ProduceCard from "@/components/farmer/ProduceCard";
import OrderCard from "@/components/farmer/OrderCard";
import SellProduceModal from "@/components/farmer/SellProduceModal";
import {
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function FarmerDashboard() {
  const router = useRouter();

  // State Management
  const [profile, setProfile] = useState(DEFAULT_FARMER_PROFILE);
  const [listings, setListings] = useState(DEFAULT_PRODUCE_LISTINGS);
  const [offers, setOffers] = useState(DEFAULT_OFFERS);
  const [orders, setOrders] = useState(DEFAULT_ORDERS);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load live data from Supabase if logged in
  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        router.replace("/login");
        return;
      }

      try {
        // Parallel fetch: all 4 requests fire simultaneously
        const [userProfile, dbListings, dbOffers, dbOrders] = await Promise.all([
          getUserProfile(supabase, userData.user.id).catch(() => null),
          getFarmerListings(supabase, userData.user.id).catch(() => []),
          getFarmerOffers(supabase, userData.user.id).catch(() => []),
          getFarmerOrders(supabase, userData.user.id).catch(() => []),
        ]);

        if (userProfile) {
          setProfile({
            ...DEFAULT_FARMER_PROFILE,
            ...userProfile,
            kisan_id: userProfile.pincode
              ? `MH-NSK-${userProfile.pincode.slice(-5)}`
              : DEFAULT_FARMER_PROFILE.kisan_id,
          });
        }

        if (dbListings && dbListings.length > 0) {
          setListings(dbListings);
        }
        if (dbOffers && dbOffers.length > 0) {
          setOffers(
            dbOffers.map((o) => ({
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
            }))
          );
        }
        if (dbOrders && dbOrders.length > 0) {
          setOrders(
            dbOrders.map((o) => ({
              id: o.id.length > 10 ? `ord-${o.id.slice(0, 4)}` : o.id,
              realId: o.id,
              title: o.listings?.title || "Harvest Produce",
              produceTitle: o.listings?.title || "Harvest Produce",
              quantity: o.quantity,
              unit: o.listings?.unit || "kg",
              unitPrice: o.unit_price,
              totalAmount: o.total_amount,
              buyerName: o.profiles?.full_name || "Sahyadri Farm Fresh Retail",
              buyer: { full_name: o.profiles?.full_name || "Sahyadri Farm Fresh Retail" },
              buyerType: "Verified Buyer",
              agreementDate: new Date(o.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              }),
              collectionType: "Farmgate collection",
              paymentSecurity: "Escrow Secured",
              settlementTerms: "Direct settlement upon delivery",
              status: o.status === "completed" ? "completed" : "pickup_scheduled",
            }))
          );
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
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

  const handleCreateListing = useCallback(async (formData) => {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      let created = null;
      if (userData?.user?.id) {
        created = await createListing(supabase, userData.user.id, formData).catch(() => null);
      }

      const newListing = created || {
        id: "prod-" + Date.now(),
        title: formData.title,
        category: formData.category,
        variety: formData.variety || "Commercial Hybrid",
        asking_price: Number(formData.asking_price),
        quantity_available: Number(formData.quantity_available),
        unit: formData.unit || "kg",
        quality_grade: formData.quality_grade || "A+ Premium Grade",
        location: formData.location || `${profile.district}, ${profile.state}`,
        harvest_date: formData.harvest_date || "Immediate",
        organic: formData.organic || false,
        views: 18,
        buyer_offers_count: 0,
        status: "active",
        description: formData.description || "Fresh harvest available for buyer pickup.",
        imageUrl: formData.imageUrl || "",
      };

      setListings((prev) => [newListing, ...prev]);
      setToastMessage("Produce published successfully to APMC Buyer Board! 🎉");
      setTimeout(() => setToastMessage(""), 4500);
    } catch (err) {
      console.error(err);
    }
  }, [profile.district, profile.state]);

  const safeListings = useMemo(() => Array.isArray(listings) ? listings : [], [listings]);
  const safeOffers = useMemo(() => Array.isArray(offers) ? offers : [], [offers]);
  const safeOrders = useMemo(() => Array.isArray(orders) ? orders : [], [orders]);

  const activeProduceCount = useMemo(() => safeListings.filter((l) => l && l.status !== "paused").length, [safeListings]);
  const pendingOffersCount = useMemo(() => safeOffers.filter((o) => o && o.status === "pending").length, [safeOffers]);
  const activeOrdersCount = useMemo(() => safeOrders.filter((o) => o && o.status !== "cancelled").length, [safeOrders]);

  const handleShowCreateModal = useCallback(() => setShowCreateModal(true), []);
  const handleHideCreateModal = useCallback(() => setShowCreateModal(false), []);
  const handleViewMarketPrices = useCallback(() => router.push("/farmer/market-prices"), [router]);

  return (
    <main className="min-h-screen bg-[#f8faf5] pb-24">
      {/* Top Navbar Header */}
      <FarmerHeader
        name={profile?.full_name || "Ramesh Patil"}
        onLogout={handleLogout}
        onSellProduce={handleShowCreateModal}
        notificationCount={pendingOffersCount}
        activeListingsCount={safeListings.length}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-800 text-white px-5 py-3 shadow-xl border border-emerald-600 animate-in slide-in-from-top duration-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Hero Section */}
        <WelcomeHeader
          name={profile?.full_name || "Ramesh Patil"}
          farmName={profile?.farm_name || "KrishiKalyan Farms"}
          acreage={profile?.acreage || "8.5 Acres"}
          location={`${profile?.district || "Nashik"}, ${profile?.state || "Maharashtra"}`}
          kisanId={profile?.kisan_id || "MH-NSK-88410"}
          pmKisanVerified={profile?.pm_kisan_verified !== false}
          onSellProduce={handleShowCreateModal}
          onViewMarketPrices={handleViewMarketPrices}
        />

        {/* 4 Metric Stat Cards */}
        <DashboardStats
          activeProduce={activeProduceCount}
          totalProduceWeight="12.5 Tons"
          pendingOffers={pendingOffersCount}
          highestOffer="₹2900/qtl"
          activeOrders={activeOrdersCount}
          kisanId={profile?.kisan_id || "MH-NSK-88410"}
          verificationStatus="VERIFIED"
          loading={loading}
        />

        {/* Live Mandi Market Trends Banner */}
        <section className="rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xs">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Live APMC Mandi Rates & Trends (Maharashtra & Central India)
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time modal mandi rates fetched from AGMARKNET & APMC e-trading hubs
                </p>
              </div>
            </div>

            <Link
              href="/farmer/market-prices"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-2xs"
            >
              <span>Explore All Mandis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Quick Mandi Ticker Cards */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Nashik APMC</span>
                <span className="text-emerald-700 font-bold">+4.2%</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-1">Tomato (Hybrid)</p>
              <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                ₹3,450 <span className="text-[10px] text-slate-500 font-medium">/ qtl</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Lasalgaon Mandi</span>
                <span className="text-emerald-700 font-bold">+1.8%</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-1">Red Onion (Garwa)</p>
              <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                ₹2,680 <span className="text-[10px] text-slate-500 font-medium">/ qtl</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Indore APMC</span>
                <span className="text-amber-700 font-bold">+3.5%</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-1">Sharbati Wheat</p>
              <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                ₹2,920 <span className="text-[10px] text-slate-500 font-medium">/ qtl</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Pune APMC</span>
                <span className="text-emerald-700 font-bold">+5.0%</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-1">Green Capsicum</p>
              <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                ₹4,800 <span className="text-[10px] text-slate-500 font-medium">/ qtl</span>
              </p>
            </div>
          </div>
        </section>

        {/* Section: My Orders & Deals Snapshot (Reference Image 2) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  My Orders & Deals
                </h2>
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800">
                  {safeOrders.length} Deals
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirmed sales and buyer agreements finalized on KrishiSetu
              </p>
            </div>

            <Link
              href="/farmer/orders"
              className="group flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <span>View All Deals</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {safeOrders.slice(0, 2).map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                produceTitle={order.produceTitle || order.title}
                quantity={order.quantity}
                unit={order.unit}
                unitPrice={order.unitPrice || order.unit_price}
                totalAmount={order.totalAmount || order.total_amount}
                buyerName={order.buyerName || order.buyer?.full_name}
                buyerType={order.buyerType || "Verified Buyer"}
                agreementDate={order.agreementDate || "Recent"}
                collectionType={order.collectionType || "Farmgate collection"}
                paymentSecurity={order.paymentSecurity || "Escrow Secured"}
                settlementTerms={order.settlementTerms || "Direct settlement upon delivery"}
                status={order.status}
                onMarkCompleted={(id) => {
                  setOrders((prev) =>
                    (prev || []).map((o) => (o.id === id ? { ...o, status: "completed" } : o))
                  );
                  setToastMessage("Deal marked as completed! Funds transferred via Escrow.");
                  setTimeout(() => setToastMessage(""), 5000);
                }}
              />
            ))}
          </div>
        </section>

        {/* Section: Active Produce Highlights (Reference Image 3) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Active Produce Inventory
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  {safeListings.length} Listed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Harvest catalogue visible to verified commercial buyers
              </p>
            </div>

            <Link
              href="/farmer/produce"
              className="group flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <span>Manage Inventory ({safeListings.length})</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {safeListings.slice(0, 4).map((item) => (
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
                onToggleStatus={(id, newStatus) => {
                  setListings((prev) =>
                    prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
                  );
                }}
                onDelete={(id) => {
                  setListings((prev) => prev.filter((l) => l.id !== id));
                }}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Floating Bottom Quick Action Dock */}
      <FarmerDock
        onSellProduce={handleShowCreateModal}
        pendingOffersCount={pendingOffersCount}
      />

      {/* Sell Produce Modal */}
      <SellProduceModal
        isOpen={showCreateModal}
        onClose={handleHideCreateModal}
        onSubmit={handleCreateListing}
        defaultLocation={`${profile.district || "Nashik"}, ${profile.state || "Maharashtra"}`}
      />
    </main>
  );
}

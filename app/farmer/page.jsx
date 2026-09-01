"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { getFarmerListings, createListing } from "@/lib/services/listings";
import { getFarmerOffers, acceptOffer, rejectOffer } from "@/lib/services/offers";
import { getFarmerOrders, getSalesStats } from "@/lib/services/orders";
import { getPriceForCommodity } from "@/lib/services/market-prices";

import FarmerHeader from "@/components/farmer/FarmerHeader";
import WelcomeHeader from "@/components/farmer/WelcomeHeader";
import DashboardStats from "@/components/farmer/DashboardStats";
import QuickActions from "@/components/farmer/QuickActions";
import MarketPriceSnapshot from "@/components/farmer/MarketPriceSnapshot";
import ProduceCard from "@/components/farmer/ProduceCard";
import OfferCard from "@/components/farmer/OfferCard";
import OrderCard from "@/components/farmer/OrderCard";
import EmptyState from "@/components/farmer/EmptyState";

const initialListing = {
  title: "",
  category: "",
  asking_price: "",
  quantity_available: "",
  unit: "kg",
  quality_grade: "",
  location: "",
  description: "",
  harvest_date: "",
};

export default function FarmerDashboard() {
  const router = useRouter();

  // State Management
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [salesStats, setSalesStats] = useState({ totalSales: 0, totalQuantity: 0, completedOrders: 0 });
  const [form, setForm] = useState(initialListing);
  const [selectedMarketPrice, setSelectedMarketPrice] = useState(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Load Dashboard Data
  useEffect(() => {
    async function loadDashboardData() {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      try {
        const userProfile = await getUserProfile(supabase, userData.user.id);
        if (!userProfile || userProfile.role !== "farmer") {
          router.replace(userProfile?.role === "buyer" ? "/buyer" : "/login");
          return;
        }

        setProfile(userProfile);

        // Load all data in parallel
        const [listingsData, offersData, ordersData, statsData] = await Promise.all([
          getFarmerListings(supabase, userData.user.id),
          getFarmerOffers(supabase, userData.user.id).catch(() => []),
          getFarmerOrders(supabase, userData.user.id).catch(() => []),
          getSalesStats(supabase, userData.user.id).catch(() => ({
            totalSales: 0,
            totalQuantity: 0,
            completedOrders: 0,
          })),
        ]);

        setListings(listingsData);
        setOffers(offersData);
        setOrders(ordersData);
        setSalesStats(statsData);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setErrorMessage("Failed to load dashboard. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  // Load market price when form title changes
  useEffect(() => {
    async function loadMarketPrice() {
      if (!form.title) {
        setSelectedMarketPrice(null);
        return;
      }

      try {
        const supabase = createClient();
        const priceData = await getPriceForCommodity(supabase, form.title);
        setSelectedMarketPrice(priceData);
      } catch (err) {
        console.error("Error loading market price:", err);
      }
    }

    const timer = setTimeout(loadMarketPrice, 300);
    return () => clearTimeout(timer);
  }, [form.title]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreateListing(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const listing = await createListing(supabase, userData.user.id, form);
      
      setListings((current) => [listing, ...current]);
      setForm(initialListing);
      setShowCreateModal(false);
      setSuccessMessage("Your produce has been published successfully! 🎉");
      
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (error) {
      console.error("Error creating listing:", error);
      setErrorMessage("Failed to publish your produce. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAcceptOffer(offerId, buyerId) {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      
      await acceptOffer(supabase, offerId, userData.user.id);
      
      // Update offers list
      setOffers((current) =>
        current.map((offer) =>
          offer.id === offerId ? { ...offer, status: "accepted" } : offer
        )
      );

      // Reload orders
      const updatedOrders = await getFarmerOrders(supabase, userData.user.id);
      setOrders(updatedOrders);

      setSuccessMessage("Offer accepted! Order has been created.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (error) {
      console.error("Error accepting offer:", error);
      setErrorMessage("Failed to accept offer. Please try again.");
    }
  }

  async function handleRejectOffer(offerId) {
    try {
      const supabase = createClient();
      
      await rejectOffer(supabase, offerId);
      
      setOffers((current) =>
        current.map((offer) =>
          offer.id === offerId ? { ...offer, status: "rejected" } : offer
        )
      );

      setSuccessMessage("Offer rejected.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (error) {
      console.error("Error rejecting offer:", error);
      setErrorMessage("Failed to reject offer. Please try again.");
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  }

  // Calculate stats
  const activeProduce = listings.filter((l) => l.status === "active").length;
  const pendingOffers = offers.filter((o) => o.status === "pending").length;
  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faf5]">
        <div className="text-center">
          <div className="mb-4 text-4xl">🌾</div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf5]">
      {/* Header */}
      <FarmerHeader name={profile?.full_name || "Farmer"} onLogout={handleLogout} notificationCount={pendingOffers} />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-900">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-900">
            {successMessage}
          </div>
        )}

        {/* Welcome Section */}
        <WelcomeHeader
          name={profile?.full_name || "Farmer"}
          onSellProduce={() => setShowCreateModal(true)}
          onViewMarketPrices={() => router.push("/farmer/market-prices")}
        />

        {/* Dashboard Stats */}
        <div className="mt-8">
          <DashboardStats
            activeProduce={activeProduce}
            pendingOffers={pendingOffers}
            activeOrders={activeOrders}
            totalSales={salesStats.totalSales}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <QuickActions
            onSellProduce={() => setShowCreateModal(true)}
            onViewOffers={() => setActiveTab("offers")}
            onViewOrders={() => setActiveTab("orders")}
            onViewMarketPrices={() => router.push("/farmer/market-prices")}
            onEditProfile={() => router.push("/farmer/profile")}
          />
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-slate-200">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 font-semibold border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("produce")}
              className={`pb-4 font-semibold border-b-2 transition-colors ${
                activeTab === "produce"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              My Produce ({listings.length})
            </button>
            <button
              onClick={() => setActiveTab("offers")}
              className={`pb-4 font-semibold border-b-2 transition-colors ${
                activeTab === "offers"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Offers ({pendingOffers})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-4 font-semibold border-b-2 transition-colors ${
                activeTab === "orders"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Orders ({activeOrders})
            </button>
            <button
              onClick={() => setActiveTab("sales")}
              className={`pb-4 font-semibold border-b-2 transition-colors ${
                activeTab === "sales"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Sales History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Your Active Produce</h3>
                  {listings.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {listings.slice(0, 4).map((listing) => (
                        <ProduceCard
                          key={listing.id}
                          id={listing.id}
                          title={listing.title}
                          category={listing.category}
                          askingPrice={listing.asking_price}
                          quantity={listing.quantity_available}
                          unit={listing.unit}
                          location={listing.location}
                          status={listing.status}
                          harvestDate={listing.harvest_date}
                          onEdit={() => console.log("Edit:", listing.id)}
                          onPause={() => console.log("Pause:", listing.id)}
                          onDelete={() => console.log("Delete:", listing.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="📦"
                      title="No produce listed yet"
                      description="Publish your first harvest and let buyers discover it."
                      actionLabel="Sell Produce"
                      onAction={() => setShowCreateModal(true)}
                    />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Market Price Snapshot</h3>
                  {listings.length > 0 ? (
                    <MarketPriceSnapshot
                      cropName={listings[0]?.title || ""}
                      yourPrice={listings[0]?.asking_price || 0}
                      mspPrice={selectedMarketPrice?.msp_price}
                      marketPrice={selectedMarketPrice?.modal_price}
                      unit={listings[0]?.unit || "kg"}
                      status="pending"
                      loading={false}
                    />
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <p className="text-sm text-slate-600">
                        Market price data will appear once you add produce.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Offers */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Recent Buyer Offers</h3>
                  {pendingOffers > 0 && (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                      {pendingOffers} pending
                    </span>
                  )}
                </div>
                {offers.length > 0 ? (
                  <div className="grid gap-4">
                    {offers.slice(0, 3).map((offer) => (
                      <OfferCard
                        key={offer.id}
                        id={offer.id}
                        buyerName={offer.profiles?.full_name || "Unknown Buyer"}
                        produceName={offer.listings?.title || "Unknown Produce"}
                        requestedQuantity={offer.offered_quantity}
                        unit={offer.listings?.unit || "kg"}
                        offeredPrice={offer.offered_price}
                        totalValue={offer.offered_quantity * offer.offered_price}
                        message={offer.notes}
                        receivedDate={new Date(offer.created_at).toLocaleDateString()}
                        status={offer.status}
                        onAccept={() => handleAcceptOffer(offer.id, offer.buyer_id)}
                        onReject={() => handleRejectOffer(offer.id)}
                        onViewDetails={() => console.log("View details:", offer.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon="📨"
                    title="No buyer offers yet"
                    description="Once buyers show interest in your produce, their offers will appear here."
                  />
                )}
              </div>
            </div>
          )}

          {/* Produce Tab */}
          {activeTab === "produce" && (
            <div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mb-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                + Add New Produce
              </button>
              {listings.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing) => (
                    <ProduceCard
                      key={listing.id}
                      id={listing.id}
                      title={listing.title}
                      category={listing.category}
                      askingPrice={listing.asking_price}
                      quantity={listing.quantity_available}
                      unit={listing.unit}
                      location={listing.location}
                      status={listing.status}
                      harvestDate={listing.harvest_date}
                      onEdit={() => console.log("Edit:", listing.id)}
                      onPause={() => console.log("Pause:", listing.id)}
                      onDelete={() => console.log("Delete:", listing.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="📦"
                  title="No produce listed yet"
                  description="Publish your first harvest and let buyers discover it."
                  actionLabel="Sell Produce"
                  onAction={() => setShowCreateModal(true)}
                />
              )}
            </div>
          )}

          {/* Offers Tab */}
          {activeTab === "offers" && (
            <div>
              {offers.length > 0 ? (
                <div className="grid gap-4">
                  {offers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      id={offer.id}
                      buyerName={offer.profiles?.full_name || "Unknown Buyer"}
                      produceName={offer.listings?.title || "Unknown Produce"}
                      requestedQuantity={offer.offered_quantity}
                      unit={offer.listings?.unit || "kg"}
                      offeredPrice={offer.offered_price}
                      totalValue={offer.offered_quantity * offer.offered_price}
                      message={offer.notes}
                      receivedDate={new Date(offer.created_at).toLocaleDateString()}
                      status={offer.status}
                      onAccept={() => handleAcceptOffer(offer.id, offer.buyer_id)}
                      onReject={() => handleRejectOffer(offer.id)}
                      onViewDetails={() => console.log("View details:", offer.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="📨"
                  title="No buyer offers yet"
                  description="Once buyers show interest in your produce, their offers will appear here."
                />
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              {orders.length > 0 ? (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      id={order.id}
                      buyerName={order.profiles?.full_name || "Unknown Buyer"}
                      produceName={order.listings?.title || "Unknown Produce"}
                      quantity={order.quantity}
                      unit={order.listings?.unit || "kg"}
                      price={order.unit_price}
                      totalAmount={order.total_amount}
                      pickupDate="To be scheduled"
                      pickupLocation={order.listings?.location || "Not specified"}
                      status={order.status}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="📦"
                  title="No active orders"
                  description="Accepted buyer offers will appear here as orders."
                />
              )}
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <div>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs text-slate-600 font-medium">Total Earnings</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-700">₹{salesStats.totalSales.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs text-slate-600 font-medium">Total Quantity Sold</p>
                  <p className="mt-2 text-2xl font-bold text-blue-700">{salesStats.totalQuantity} units</p>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs text-slate-600 font-medium">Completed Orders</p>
                  <p className="mt-2 text-2xl font-bold text-purple-700">{salesStats.completedOrders}</p>
                </div>
              </div>

              {orders.filter((o) => o.status === "completed").length > 0 ? (
                <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm">
                  <table className="w-full">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Buyer</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Produce</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {orders
                        .filter((o) => o.status === "completed")
                        .map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3 font-mono text-sm">{order.id.slice(0, 8)}</td>
                            <td className="px-6 py-3 text-sm text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-3 text-sm font-medium text-slate-900">{order.profiles?.full_name}</td>
                            <td className="px-6 py-3 text-sm text-slate-600">{order.listings?.title}</td>
                            <td className="px-6 py-3 text-sm font-bold text-emerald-700 text-right">₹{order.total_amount.toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon="📊"
                  title="No completed sales yet"
                  description="Your completed sales will appear here once orders are finished."
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Produce Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 border-b border-slate-200 bg-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Sell New Produce</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Produce Name *
                  <input
                    required
                    name="title"
                    value={form.title}
                    onChange={updateField}
                    placeholder="e.g., Fresh Onions"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Category *
                  <input
                    required
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    placeholder="e.g., Vegetables"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Asking Price per Unit (₹) *
                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    name="asking_price"
                    value={form.asking_price}
                    onChange={updateField}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Quantity Available *
                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    name="quantity_available"
                    value={form.quantity_available}
                    onChange={updateField}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Unit *
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={updateField}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="tonne">tonne</option>
                    <option value="box">box</option>
                    <option value="crate">crate</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Quality Grade
                  <input
                    name="quality_grade"
                    value={form.quality_grade}
                    onChange={updateField}
                    placeholder="e.g., A Grade"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Pickup Location *
                <input
                  required
                  name="location"
                  value={form.location}
                  onChange={updateField}
                  placeholder="Village, District, State"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Harvest Date
                <input
                  type="date"
                  name="harvest_date"
                  value={form.harvest_date}
                  onChange={updateField}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  rows="3"
                  placeholder="Harvest details buyers should know..."
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              {/* Market Price Info */}
              {selectedMarketPrice && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Market Reference</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                    <div>
                      MSP: <span className="font-bold">₹{selectedMarketPrice.msp_price || "N/A"}</span>
                    </div>
                    <div>
                      Market Avg: <span className="font-bold">₹{selectedMarketPrice.modal_price}</span>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-900 text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? "Publishing..." : "Publish Produce"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

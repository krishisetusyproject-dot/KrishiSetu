"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { getBuyerOrders, cancelBuyerOrder } from "@/lib/services/orders";
import {
  DEFAULT_BUYER_PROFILE,
  DEFAULT_BUYER_ORDERS,
} from "@/lib/services/buyer-defaults";

import BuyerHeader from "@/components/buyer/BuyerHeader";
import BuyerDock from "@/components/buyer/BuyerDock";
import BuyerOrderCard from "@/components/buyer/BuyerOrderCard";
import BuyerChatModal from "@/components/buyer/BuyerChatModal";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Award,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [profile, setProfile] = useState(DEFAULT_BUYER_PROFILE);
  const [orders, setOrders] = useState(DEFAULT_BUYER_ORDERS);
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [searchFilter, setSearchFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Chat Modal State
  const [chatFarmer, setChatFarmer] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("krishi_buyer_orders");
      if (stored) {
        setOrders(JSON.parse(stored));
      }
    } catch {}

    async function loadData() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        try {
          const userProfile = await getUserProfile(supabase, userData.user.id);
          if (userProfile) setProfile({ ...DEFAULT_BUYER_PROFILE, ...userProfile });

          const dbOrders = await getBuyerOrders(supabase, userData.user.id);
          if (dbOrders && dbOrders.length > 0) {
            setOrders((prev) => {
              const merged = [...dbOrders, ...prev.filter((p) => !dbOrders.some((d) => d.id === p.id))];
              return merged;
            });
          }
        } catch (e) {
          console.warn("Could not load database orders:", e);
        }
      }
      setLoading(false);
    }

    loadData();
  }, []);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  // Cancel / Withdraw an order
  async function handleCancelOrder(orderId) {
    if (!window.confirm(`Are you sure you want to withdraw purchase offer #${orderId}? Full escrow deposit will be refunded.`)) {
      return;
    }

    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: "cancelled",
            notes: "Buyer withdrew offer. Escrow refunded to buyer wallet.",
            payment_status: "Refunded to Buyer",
          }
        : o
    );

    setOrders(updated);
    try {
      localStorage.setItem("krishi_buyer_orders", JSON.stringify(updated));
    } catch {}

    showToast(`Order #${orderId} has been cancelled and refunded.`);

    // Try Supabase cancel
    try {
      const supabase = createClient();
      await cancelBuyerOrder(supabase, orderId);
    } catch (e) {
      console.warn(e);
    }
  }

  // Tabs Configuration
  const tabs = [
    { key: "all", label: "All Orders", count: orders.length, icon: Package },
    { key: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length, icon: Clock },
    { key: "confirmed", label: "Confirmed", count: orders.filter((o) => o.status === "confirmed").length, icon: CheckCircle2 },
    { key: "ready_for_pickup", label: "Ready for Pickup", count: orders.filter((o) => o.status === "ready_for_pickup").length, icon: Truck },
    { key: "completed", label: "Completed", count: orders.filter((o) => o.status === "completed").length, icon: Award },
    { key: "cancelled", label: "Cancelled", count: orders.filter((o) => o.status === "cancelled").length, icon: XCircle },
  ];

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Tab filter
      if (activeTab !== "all" && ord.status !== activeTab) {
        return false;
      }
      // Search filter
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchCrop = ord.crop?.toLowerCase().includes(q);
        const matchFarmer = ord.farmer?.toLowerCase().includes(q);
        const matchId = ord.id?.toLowerCase().includes(q);
        if (!matchCrop && !matchFarmer && !matchId) return false;
      }
      return true;
    });
  }, [orders, activeTab, searchFilter]);

  const activeCount = orders.filter((o) => ["pending", "confirmed", "ready_for_pickup"].includes(o.status)).length;

  return (
    <div className="min-h-screen bg-[#f8faf6] pb-28 text-slate-900">
      <BuyerHeader
        name={profile.full_name}
        activeOrdersCount={activeCount}
        savedProduceCount={2}
      />

      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2 rounded-2xl bg-emerald-950 px-5 py-3 text-sm font-bold text-amber-100 shadow-xl border border-emerald-800 animate-slide-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 text-amber-100">
                <Package className="h-4 w-4" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">My Procurement Orders</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track farmgate pickups, order statuses, logistics receipts, and release escrow payments.
            </p>
          </div>

          <Link
            href="/buyer/browse"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-950 px-5 py-2.5 text-xs font-bold text-amber-100 hover:bg-emerald-900 transition active:scale-95 shadow-xs"
          >
            <span>Browse New Produce</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  isActive
                    ? "border-emerald-950 text-emerald-950"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    isActive ? "bg-emerald-950 text-amber-100" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search within Orders */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter orders by crop, farmer name, or order ID..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none"
          />
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((ord) => (
              <BuyerOrderCard
                key={ord.id}
                id={ord.id}
                crop={ord.crop || ord.produce_title}
                farmer={ord.farmer}
                farmerPhone={ord.farmer_phone}
                quantity={ord.quantity}
                unit={ord.unit}
                price={ord.price}
                totalAmount={ord.total_amount}
                orderDate={ord.order_date}
                status={ord.status}
                pickupLocation={ord.pickup_location}
                pickupDate={ord.pickup_date}
                notes={ord.notes}
                paymentStatus={ord.payment_status}
                onCancelOrder={handleCancelOrder}
                onChat={(farmerData) => setChatFarmer(farmerData)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-800">No {activeTab !== "all" ? activeTab : ""} orders found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              You do not have any orders matching this category currently. Browse fresh farmer listings to submit procurement offers.
            </p>
            <Link
              href="/buyer/browse"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-950 px-5 py-2.5 text-xs font-bold text-amber-100 hover:bg-emerald-900 transition"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </main>

      <BuyerDock activeOrdersCount={activeCount} />

      {/* Chat Farmer Modal */}
      <BuyerChatModal
        isOpen={Boolean(chatFarmer)}
        onClose={() => setChatFarmer(null)}
        farmer={chatFarmer || {}}
      />
    </div>
  );
}

export default function BuyerOrdersPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f8faf6] text-emerald-950 font-bold">Loading Orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}

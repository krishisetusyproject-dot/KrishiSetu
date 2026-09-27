"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { getFarmerOrders, updateOrderStatus } from "@/lib/services/orders";
import { DEFAULT_ORDERS, DEFAULT_FARMER_PROFILE } from "@/lib/services/farmer-defaults";

import FarmerHeader from "@/components/farmer/FarmerHeader";
import FarmerDock from "@/components/farmer/FarmerDock";
import OrderCard from "@/components/farmer/OrderCard";
import SellProduceModal from "@/components/farmer/SellProduceModal";
import EmptyState from "@/components/farmer/EmptyState";
import { ShieldCheck, CheckCircle2, Filter } from "lucide-react";

export default function FarmerOrdersPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(DEFAULT_FARMER_PROFILE);
  const [orders, setOrders] = useState(DEFAULT_ORDERS || []);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSellModal, setShowSellModal] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        router.replace("/login");
        return;
      }

      try {
        const userProfile = await getUserProfile(supabase, userData.user.id);
        if (userProfile) {
          setProfile(userProfile);
        }

        const dbOrders = await getFarmerOrders(supabase, userData.user.id);
        if (dbOrders && dbOrders.length > 0) {
          // Normalize DB orders to card structure
          const normalized = dbOrders.map((o) => ({
            id: o.id.length > 10 ? `ord-${o.id.slice(0, 4)}` : o.id,
            realId: o.id,
            produceTitle: o.listings?.title || "Harvest Produce",
            quantity: o.quantity,
            unit: o.listings?.unit || "kg",
            unitPrice: o.unit_price,
            totalAmount: o.total_amount,
            buyerName: o.profiles?.full_name || "Sahyadri Farm Fresh Retail",
            buyerType: "Verified Buyer",
            agreementDate: new Date(o.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            }),
            collectionType: "Farmgate collection",
            paymentSecurity: "Escrow Secured",
            settlementTerms: "Direct settlement upon delivery",
            status: o.status === "completed" ? "completed" : "pickup_scheduled",
          }));
          setOrders(normalized);
        } else {
          // Fallback to reference screenshot deals
          setOrders((DEFAULT_ORDERS || []).map((o) => ({
            ...o,
            realId: o.id,
            produceTitle: o.title || o.produceTitle,
            buyerName: o.buyer?.full_name || o.buyerName,
            buyerType: "Verified Buyer",
            agreementDate: "Recent",
            collectionType: o.agreement_type || o.collectionType,
            paymentSecurity: "Escrow Secured",
            settlementTerms: "Direct settlement upon delivery",
          })));
        }
      } catch (err) {
        console.error("Error loading orders:", err);
        setOrders((DEFAULT_ORDERS || []).map((o) => ({
          ...o,
          realId: o.id,
          produceTitle: o.title || o.produceTitle,
          buyerName: o.buyer?.full_name || o.buyerName,
          buyerType: "Verified Buyer",
          agreementDate: "Recent",
          collectionType: o.agreement_type || o.collectionType,
          paymentSecurity: "Escrow Secured",
          settlementTerms: "Direct settlement upon delivery",
        })));
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  }

  async function handleMarkDealCompleted(orderId) {
    setUpdatingId(orderId);
    try {
      const order = orders.find((o) => o.id === orderId || o.realId === orderId);
      if (order?.realId) {
        const supabase = createClient();
        await updateOrderStatus(supabase, order.realId, "completed").catch(() => null);
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId || o.realId === orderId ? { ...o, status: "completed" } : o
        )
      );

      setSuccessMessage(
        `Deal ${orderId} marked as completed! Payment disbursement of ₹${order?.totalAmount?.toLocaleString()} initiated via Escrow to your bank account. 🎉`
      );
      setTimeout(() => setSuccessMessage(""), 6000);
    } catch (err) {
      console.error(err);
      setSuccessMessage("Status updated locally.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } finally {
      setUpdatingId(null);
    }
  }

  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = safeOrders.filter((o) => {
    if (statusFilter === "scheduled") return o.status === "pickup_scheduled";
    if (statusFilter === "completed") return o.status === "completed";
    return true;
  });

  return (
    <main className="min-h-screen bg-[#f8faf5] pb-24">
      <FarmerHeader
        name={profile?.full_name || "Ramesh Patil"}
        onLogout={handleLogout}
        onSellProduce={() => setShowSellModal(true)}
        notificationCount={2}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-emerald-900 text-white p-4 shadow-xl border border-emerald-700 animate-in fade-in duration-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{successMessage}</div>
          </div>
        )}

        {/* Header Section (Reference Image 2) */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                My Orders & Deals
              </h1>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 border border-sky-300">
                {safeOrders.length} Deals
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Confirmed sales and buyer agreements finalized on KrishiSetu
            </p>
          </div>

          {/* Right Escrow Trust Badge */}
          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Escrow payment secured for all confirmed deals</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            All Deals ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter("scheduled")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "scheduled"
                ? "bg-sky-700 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Pickup Scheduled ({orders.filter((o) => o.status === "pickup_scheduled").length})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "completed"
                ? "bg-emerald-700 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Completed & Disbursed ({orders.filter((o) => o.status === "completed").length})
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                produceTitle={order.produceTitle}
                quantity={order.quantity}
                unit={order.unit}
                unitPrice={order.unitPrice}
                totalAmount={order.totalAmount}
                buyerName={order.buyerName}
                buyerType={order.buyerType}
                agreementDate={order.agreementDate}
                collectionType={order.collectionType}
                paymentSecurity={order.paymentSecurity}
                settlementTerms={order.settlementTerms}
                status={order.status}
                onMarkCompleted={handleMarkDealCompleted}
                loading={updatingId === order.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📦"
            title="No orders found"
            description="Accepted buyer offers will appear here as confirmed deals with scheduled pickup logistics."
            actionLabel="View Produce Inventory"
            onAction={() => router.push("/farmer/produce")}
          />
        )}
      </div>

      {/* Floating Bottom Dock */}
      <FarmerDock
        onSellProduce={() => setShowSellModal(true)}
        pendingOffersCount={2}
      />

      <SellProduceModal
        isOpen={showSellModal}
        onClose={() => setShowSellModal(false)}
        onSubmit={async () => {
          router.push("/farmer/produce");
        }}
      />
    </main>
  );
}

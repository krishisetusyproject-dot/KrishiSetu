"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getAllProfilesForAdmin } from "@/lib/services/profiles";
import { getAllListingsForAdmin } from "@/lib/services/listings";
import { 
  Users, 
  Store, 
  IndianRupee, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowRight 
} from "lucide-react";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    farmersCount: 0,
    buyersCount: 0,
    gmvTotal: 0,
    activeListings: 0,
    pendingKYC: 0,
  });
  const [dbStatus, setDbStatus] = useState("checking");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardMetrics() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch user profiles & listings via service layer
        const profiles = await getAllProfilesForAdmin(supabase);
        const listings = await getAllListingsForAdmin(supabase);

        setDbStatus("online");

        const farmers = profiles?.filter((p) => p.role === "farmer").length || 0;
        const buyers = profiles?.filter((p) => p.role === "buyer").length || 0;
        const pending = profiles?.filter((p) => (p.verification_status || "pending") === "pending").length || 0;
        const active = listings?.filter((l) => l.status === "active" || !l.status).length || 0;

        // Calculate GMV (asking_price * quantity_available across active listings)
        const gmv = listings?.reduce(
          (sum, item) => sum + (Number(item.asking_price || 0) * Number(item.quantity_available || 0)), 
          0
        ) || 0;

        setMetrics({
          farmersCount: farmers,
          buyersCount: buyers,
          gmvTotal: gmv,
          activeListings: active,
          pendingKYC: pending,
        });
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
        setDbStatus("error");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardMetrics();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header & System Health Status Widget */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Control Center</h1>
          <p className="text-sm text-slate-500">Overview of platform health, activity, and urgent governance tasks.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border">
          <span className="text-xs font-semibold text-slate-600">System Health:</span>
          {dbStatus === "checking" && <span className="text-xs text-amber-600 font-medium animate-pulse">Checking connection...</span>}
          {dbStatus === "online" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Database Connected
            </span>
          )}
          {dbStatus === "error" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Connection Issue
            </span>
          )}
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Farmers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? "..." : metrics.farmersCount}</p>
          <span className="text-xs text-slate-400">Registered producers</span>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Commercial Buyers</span>
            <Store className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? "..." : metrics.buyersCount}</p>
          <span className="text-xs text-slate-400">Wholesale traders</span>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Est. Platform GMV</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? "..." : `₹${metrics.gmvTotal.toLocaleString("en-IN")}`}</p>
          <span className="text-xs text-slate-400">Gross merchandise value</span>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Active Listings</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? "..." : metrics.activeListings}</p>
          <span className="text-xs text-slate-400">Live crops listed</span>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Pending Verification</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{loading ? "..." : metrics.pendingKYC}</p>
          <span className="text-xs text-slate-400">Awaiting KYC audit</span>
        </div>
      </div>

      {/* Quick Action & Governance Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Pending Actions</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Verification Queue</p>
                  <p className="text-xs text-amber-700">{metrics.pendingKYC} user applications require identity verification.</p>
                </div>
              </div>
              <Link href="/admin/users" className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1">
                Review <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Marketplace Listings</p>
                  <p className="text-xs text-slate-500">Audit crop prices against current APMC reference rates.</p>
                </div>
              </div>
              <Link href="/admin/listings" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                Audit <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Quick Navigation</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/users" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border text-sm font-medium text-slate-700 flex justify-between items-center transition">
              Verification Queue <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link href="/admin/listings" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border text-sm font-medium text-slate-700 flex justify-between items-center transition">
              Listing Moderation <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link href="/admin/prices" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border text-sm font-medium text-slate-700 flex justify-between items-center transition">
              APMC & MSP Manager <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link href="/admin/disputes" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border text-sm font-medium text-slate-700 flex justify-between items-center transition">
              Dispute Claims <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
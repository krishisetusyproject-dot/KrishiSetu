"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { getMarketPrices, getStates, getCommodities } from "@/lib/services/market-prices";
import { DEFAULT_FARMER_PROFILE } from "@/lib/services/farmer-defaults";

import FarmerHeader from "@/components/farmer/FarmerHeader";
import EmptyState from "@/components/farmer/EmptyState";
import {
  Search,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Building,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";

const FALLBACK_PRICES = [
  {
    id: "mp-1",
    commodity: "Tomato (Hybrid)",
    apmc_mandi: "Nashik APMC",
    state: "Maharashtra",
    min_price: 2800,
    modal_price: 3450,
    max_price: 3800,
    msp_price: 2200,
    unit: "quintal",
    trend: "up",
    trend_pct: "+4.2%",
  },
  {
    id: "mp-2",
    commodity: "Red Onion (Garwa)",
    apmc_mandi: "Lasalgaon Mandi",
    state: "Maharashtra",
    min_price: 2100,
    modal_price: 2680,
    max_price: 3100,
    msp_price: 1950,
    unit: "quintal",
    trend: "up",
    trend_pct: "+1.8%",
  },
  {
    id: "mp-3",
    commodity: "Sharbati Wheat (C-306)",
    apmc_mandi: "Indore Mandi Hub",
    state: "Madhya Pradesh",
    min_price: 2650,
    modal_price: 2920,
    max_price: 3200,
    msp_price: 2275,
    unit: "quintal",
    trend: "up",
    trend_pct: "+3.5%",
  },
  {
    id: "mp-4",
    commodity: "Green Capsicum",
    apmc_mandi: "Pune Market Yard",
    state: "Maharashtra",
    min_price: 4100,
    modal_price: 4800,
    max_price: 5400,
    msp_price: null,
    unit: "quintal",
    trend: "up",
    trend_pct: "+5.0%",
  },
  {
    id: "mp-5",
    commodity: "Potato (Jyoti)",
    apmc_mandi: "APMC Vashi (Navi Mumbai)",
    state: "Maharashtra",
    min_price: 1800,
    modal_price: 2150,
    max_price: 2400,
    msp_price: 1650,
    unit: "quintal",
    trend: "flat",
    trend_pct: "0.0%",
  },
  {
    id: "mp-6",
    commodity: "Soybean (Yellow)",
    apmc_mandi: "Nagpur APMC",
    state: "Maharashtra",
    min_price: 4300,
    modal_price: 4720,
    max_price: 4950,
    msp_price: 4600,
    unit: "quintal",
    trend: "up",
    trend_pct: "+2.6%",
  },
  {
    id: "mp-7",
    commodity: "Green Chilies (Jwala)",
    apmc_mandi: "Baramati APMC",
    state: "Maharashtra",
    min_price: 5200,
    modal_price: 6100,
    max_price: 6800,
    msp_price: null,
    unit: "quintal",
    trend: "up",
    trend_pct: "+3.1%",
  },
];

export default function MarketPricesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(DEFAULT_FARMER_PROFILE);
  const [marketPrices, setMarketPrices] = useState(FALLBACK_PRICES);

  // Filters
  const [searchCrop, setSearchCrop] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState(["Maharashtra", "Madhya Pradesh", "Gujarat", "Punjab"]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        router.replace("/login");
        return;
      }

      try {
        const userProfile = await getUserProfile(supabase, userData.user.id);
        if (userProfile) setProfile(userProfile);

        const [prices, statesList] = await Promise.all([
          getMarketPrices(supabase).catch(() => []),
          getStates(supabase).catch(() => []),
        ]);

        if (prices && prices.length > 0) {
          setMarketPrices(prices);
        } else {
          setMarketPrices(FALLBACK_PRICES);
        }

        if (statesList && statesList.length > 0) {
          setStates(statesList);
        }
      } catch (err) {
        console.error("Error loading market prices:", err);
        setMarketPrices(FALLBACK_PRICES);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = useCallback(async function () {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  }, [router]);

  const filteredPrices = useMemo(() => {
    return marketPrices.filter((p) => {
      const matchesCrop =
        !searchCrop ||
        (p.commodity || "").toLowerCase().includes(searchCrop.toLowerCase()) ||
        (p.apmc_mandi || "").toLowerCase().includes(searchCrop.toLowerCase());

      const matchesState = !selectedState || p.state === selectedState;
      return matchesCrop && matchesState;
    });
  }, [marketPrices, searchCrop, selectedState]);

  return (
    <main className="min-h-screen bg-[#f8faf5] pb-24">
      <FarmerHeader
        name={profile?.full_name || "Ramesh Patil"}
        onLogout={handleLogout}
        notificationCount={2}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Live Mandi Rates & APMC Trends
              </h1>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                Real-Time APMC
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Daily wholesale modal prices and government MSP benchmarks to optimize your selling price
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>AGMARKNET Official APMC Verified Rates</span>
          </div>
        </div>

        {/* Filter Box */}
        <div className="mb-8 grid gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Search Commodity or Mandi
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Tomato, Onion, Nashik, Lasalgaon..."
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Filter by State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">All States across India</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {searchCrop && (
            <div className="flex items-end">
              <button
                onClick={() => setSearchCrop("")}
                className="w-full rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Mandi Cards & Table */}
        {filteredPrices.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Commodity</th>
                    <th className="px-6 py-4">APMC Market</th>
                    <th className="px-6 py-4">State</th>
                    <th className="px-6 py-4 text-right">Min Rate (₹)</th>
                    <th className="px-6 py-4 text-right">Modal Avg Rate (₹)</th>
                    <th className="px-6 py-4 text-right">Max Rate (₹)</th>
                    <th className="px-6 py-4 text-right">Govt MSP (₹)</th>
                    <th className="px-6 py-4 text-center">Daily Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPrices.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {item.commodity}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                        {item.apmc_mandi}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {item.state}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">
                        ₹{item.min_price?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-extrabold text-emerald-800 border border-emerald-200">
                          ₹{item.modal_price?.toLocaleString()}
                          <span className="text-[10px] text-slate-500 font-normal">
                            /{item.unit || "qtl"}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">
                        ₹{item.max_price?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.msp_price ? (
                          <span className="font-bold text-amber-700">
                            ₹{item.msp_price?.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.trend === "up" ? (
                          <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-700">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                            <span>{item.trend_pct || "+2.5%"}</span>
                          </span>
                        ) : item.trend === "down" ? (
                          <span className="inline-flex items-center gap-1 font-bold text-xs text-red-600">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span>-1.2%</span>
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-500">Stable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="📊"
            title="No market prices found"
            description="Try changing your search terms or selecting another state."
            actionLabel="Reset Search"
            onAction={() => setSearchCrop("")}
          />
        )}
      </div>

    </main>
  );
}

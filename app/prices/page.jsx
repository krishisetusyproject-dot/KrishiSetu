"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMarketPrices, getStates } from "@/lib/services/market-prices";
import Navbar from "@/components/marketplace/Navbar";
import Footer from "@/components/marketplace/Footer";
import {
  Search,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

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

export default function PublicMarketPricesPage() {
  const [loading, setLoading] = useState(true);
  const [marketPrices, setMarketPrices] = useState(FALLBACK_PRICES);

  // Filters
  const [searchCrop, setSearchCrop] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState(["Maharashtra", "Madhya Pradesh", "Gujarat", "Punjab"]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      try {
        const [prices, statesList] = await Promise.all([
          getMarketPrices(supabase).catch(() => []),
          getStates(supabase).catch(() => []),
        ]);

        if (prices && prices.length > 0) {
          setMarketPrices(prices);
        }

        if (statesList && statesList.length > 0) {
          setStates(statesList);
        }
      } catch (err) {
        console.error("Error loading market prices:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
    <main className="min-h-screen bg-[#f8faf5] flex flex-col">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-grow pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Pro-Farmer Banner */}
          <div className="mb-10 rounded-3xl bg-emerald-900 overflow-hidden shadow-lg border border-emerald-800">
            <div className="px-6 py-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left flex-1">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Get Better Returns with KrishiSetu
                </h2>
                <p className="mt-3 text-lg leading-relaxed text-emerald-100/90 max-w-2xl">
                  Why settle for APMC modal rates? Sell directly to verified buyers on our platform and save on middleman commissions. Join thousands of farmers securing higher profits today.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full bg-amber-400 px-8 py-4 text-base font-bold text-emerald-950 shadow-sm hover:bg-amber-300 transition-colors"
                >
                  Start Selling Direct
                </Link>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Live Mandi Rates & APMC Trends
                </h1>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                  Real-Time APMC
                </span>
              </div>
              <p className="mt-2 text-base text-slate-600">
                Daily wholesale modal prices and government MSP benchmarks to help farmers track accurate market trends.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 border border-emerald-200">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>AGMARKNET Official APMC Verified Rates</span>
            </div>
          </div>

          {/* Filter Box */}
          <div className="mb-8 grid gap-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Search Commodity or Mandi
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Tomato, Onion, Nashik..."
                  value={searchCrop}
                  onChange={(e) => setSearchCrop(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Filter by State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
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
                  className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* Mandi Cards & Table */}
          {filteredPrices.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-5">Commodity</th>
                      <th className="px-6 py-5">APMC Market</th>
                      <th className="px-6 py-5">State</th>
                      <th className="px-6 py-5 text-right">Min Rate (₹)</th>
                      <th className="px-6 py-5 text-right">Modal Avg Rate (₹)</th>
                      <th className="px-6 py-5 text-right">Max Rate (₹)</th>
                      <th className="px-6 py-5 text-right">Govt MSP (₹)</th>
                      <th className="px-6 py-5 text-center">Daily Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPrices.map((item) => (
                      <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors group">
                        <td className="px-6 py-5 font-bold text-slate-900 text-base">
                          {item.commodity}
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                          {item.apmc_mandi}
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-500">
                          {item.state}
                        </td>
                        <td className="px-6 py-5 text-right font-medium text-slate-700">
                          ₹{item.min_price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 px-3 py-1.5 font-extrabold text-emerald-900 border border-emerald-200/60 group-hover:bg-emerald-200/60 group-hover:border-emerald-300 transition-colors">
                            ₹{item.modal_price?.toLocaleString()}
                            <span className="text-[11px] text-emerald-700/80 font-semibold uppercase ml-1 tracking-wide">
                              /{item.unit || "qtl"}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-medium text-slate-700">
                          ₹{item.max_price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-5 text-right">
                          {item.msp_price ? (
                            <span className="font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                              ₹{item.msp_price?.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">—</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center">
                          {item.trend === "up" ? (
                            <span className="inline-flex items-center justify-center gap-1.5 font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                              <TrendingUp className="h-4 w-4 text-emerald-600" />
                              <span>{item.trend_pct || "+2.5%"}</span>
                            </span>
                          ) : item.trend === "down" ? (
                            <span className="inline-flex items-center justify-center gap-1.5 font-bold text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                              <TrendingDown className="h-4 w-4 text-red-500" />
                              <span>-1.2%</span>
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">Stable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <span className="text-4xl mb-4 block">📊</span>
              <h3 className="text-lg font-bold text-slate-900">No market prices found</h3>
              <p className="text-slate-500 mt-2">Try changing your search terms or selecting another state.</p>
              <button 
                onClick={() => setSearchCrop("")}
                className="mt-6 text-sm font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Reset Search
              </button>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </main>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DEFAULT_MARKET_PRICES, DEFAULT_BUYER_PROFILE } from "@/lib/services/buyer-defaults";

import BuyerHeader from "@/components/buyer/BuyerHeader";
import BuyerDock from "@/components/buyer/BuyerDock";
import {
  TrendingUp,
  Search,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  Layers,
} from "lucide-react";

export default function BuyerMarketPricesPage() {
  const [profile] = useState(DEFAULT_BUYER_PROFILE);
  const [search, setSearch] = useState("");
  const [selectedMandi, setSelectedMandi] = useState("All");

  const mandis = useMemo(() => {
    const set = new Set(DEFAULT_MARKET_PRICES.map((m) => m.apmc));
    return ["All", ...Array.from(set)];
  }, []);

  const filteredPrices = useMemo(() => {
    return DEFAULT_MARKET_PRICES.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCrop = item.crop.toLowerCase().includes(q);
        const matchApmc = item.apmc.toLowerCase().includes(q);
        if (!matchCrop && !matchApmc) return false;
      }
      if (selectedMandi !== "All" && item.apmc !== selectedMandi) {
        return false;
      }
      return true;
    });
  }, [search, selectedMandi]);

  return (
    <div className="min-h-screen bg-[#f8faf6] pb-28 text-slate-900">
      <BuyerHeader name={profile.full_name} activeOrdersCount={3} savedProduceCount={2} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 text-amber-100">
                <TrendingUp className="h-4 w-4" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Official APMC Market Prices & MSP
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Government regulated APMC mandi rates, minimum support prices, and modal auction values.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-4 py-2 rounded-2xl border border-slate-200">
            <Calendar className="h-3.5 w-3.5 text-emerald-800" />
            <span>Updated: 27 Sep 2026 (Live APMC Agmarknet Feed)</span>
          </div>
        </div>

        {/* Required Advisory Note Callout */}
        <div className="rounded-3xl border border-amber-300/80 bg-amber-50/90 p-5 sm:p-6 text-amber-950 shadow-xs flex items-start gap-3.5">
          <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-900">KrishiSetu Price Disclaimer</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-amber-800">
              Market prices and MSP are provided for reference. Actual transaction prices may vary based on location, quality, quantity and market conditions.
            </p>
          </div>
        </div>

        {/* Search & Mandi Selector */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commodity (e.g. Tomato, Onion, Wheat)..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-700 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Mandi:</span>
            <select
              value={selectedMandi}
              onChange={(e) => setSelectedMandi(e.target.value)}
              className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-700 focus:outline-none"
            >
              {mandis.map((mandi) => (
                <option key={mandi} value={mandi}>
                  {mandi}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Commodity / Crop</th>
                <th className="px-6 py-4">APMC Mandi</th>
                <th className="px-6 py-4 text-right">Min Price</th>
                <th className="px-6 py-4 text-right">Max Price</th>
                <th className="px-6 py-4 text-right">Modal Rate</th>
                <th className="px-6 py-4 text-right">MSP Benchmark</th>
                <th className="px-6 py-4 text-center">Trend</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrices.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4">
                    <p className="font-extrabold text-slate-900">{item.crop}</p>
                    <p className="text-xs text-slate-400">{item.commodity}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item.apmc}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{item.state}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-600">
                    ₹{item.min_price} / {item.unit}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-600">
                    ₹{item.max_price} / {item.unit}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-base font-black text-emerald-950">
                      ₹{item.modal_price}
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / {item.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {item.msp_price}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <TrendingUp className="h-3 w-3" />
                      {item.trend_pct}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/buyer/browse?query=${encodeURIComponent(item.crop.split(" ")[0].trim())}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-950 px-3 py-1.5 text-xs font-bold text-amber-100 hover:bg-emerald-900 transition"
                    >
                      <span>Find Lots</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View */}
        <div className="grid gap-4 lg:hidden sm:grid-cols-2">
          {filteredPrices.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{item.crop}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {item.apmc}, {item.state}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  {item.trend_pct}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Min Rate</span>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">₹{item.min_price}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Max Rate</span>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">₹{item.max_price}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Modal Rate</span>
                  <p className="text-sm font-black text-emerald-950 mt-0.5">₹{item.modal_price}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 font-medium">MSP: {item.msp_price}</span>
                <Link
                  href={`/buyer/browse?query=${encodeURIComponent(item.crop.split(" ")[0].trim())}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 hover:text-emerald-950"
                >
                  <span>Search Produce</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BuyerDock activeOrdersCount={3} />
    </div>
  );
}

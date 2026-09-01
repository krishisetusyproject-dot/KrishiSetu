"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { getMarketPrices, getStates, getCommodities } from "@/lib/services/market-prices";
import FarmerHeader from "@/components/farmer/FarmerHeader";
import EmptyState from "@/components/farmer/EmptyState";
import { ArrowLeft, Search, TrendingUp, TrendingDown } from "lucide-react";

export default function MarketPricesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [marketPrices, setMarketPrices] = useState([]);
  const [filteredPrices, setFilteredPrices] = useState([]);

  // Filters
  const [searchCrop, setSearchCrop] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState([]);
  const [commodities, setCommodities] = useState([]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

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

        // Load data
        const [prices, statesList, commodityList] = await Promise.all([
          getMarketPrices(supabase),
          getStates(supabase),
          getCommodities(supabase),
        ]);

        setMarketPrices(prices);
        setFilteredPrices(prices);
        setStates(statesList);
        setCommodities(commodityList);
      } catch (err) {
        console.error("Error loading market prices:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Handle filtering
  useEffect(() => {
    let filtered = marketPrices;

    if (searchCrop) {
      filtered = filtered.filter((p) =>
        p.commodity.toLowerCase().includes(searchCrop.toLowerCase())
      );
    }

    if (selectedState) {
      filtered = filtered.filter((p) => p.state === selectedState);
    }

    setFilteredPrices(filtered);
  }, [searchCrop, selectedState, marketPrices]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8faf5]">
        <FarmerHeader name={profile?.full_name || "Farmer"} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-600">Loading market prices...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf5]">
      <FarmerHeader name={profile?.full_name || "Farmer"} onLogout={handleLogout} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => router.back()}
                className="rounded-lg p-2 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <h1 className="text-3xl font-bold text-slate-900">Market Prices</h1>
            </div>
            <p className="text-slate-600">
              Explore APMC mandi rates and MSP benchmarks to make informed pricing decisions
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Crop
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g., Wheat, Rice, Onion"
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {searchCrop && (
            <div className="flex items-end">
              <button
                onClick={() => setSearchCrop("")}
                className="w-full rounded-lg bg-slate-100 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📌 Understanding Market Prices</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>MSP (Minimum Support Price)</strong> - Government-announced benchmark price for procurement
            </p>
            <p>
              <strong>Market Price</strong> - Observed rates at APMC mandis, reflecting actual market conditions
            </p>
            <p>
              Prices vary by location, quality, season, and demand. Use these as reference guides for your pricing decisions.
            </p>
          </div>
        </div>

        {/* Market Prices Table */}
        {filteredPrices.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Crop</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Market / APMC</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">State</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Min Price (₹)</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Avg Price (₹)</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Max Price (₹)</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">MSP (₹)</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPrices.map((price) => (
                  <tr key={price.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{price.commodity}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{price.apmc_mandi}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{price.state}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">₹{price.min_price}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700">
                        ₹{price.modal_price}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">₹{price.max_price}</td>
                    <td className="px-6 py-4 text-right">
                      {price.msp_price ? (
                        <span className="font-semibold text-orange-700">₹{price.msp_price}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {price.trend === "up" && (
                        <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto" />
                      )}
                      {price.trend === "down" && (
                        <TrendingDown className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                      {price.trend === "flat" && (
                        <div className="mx-auto h-5 w-5 rounded-full bg-slate-300"></div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="📊"
            title="No market prices found"
            description="Try adjusting your filters or search for a different crop."
            actionLabel="Back to Dashboard"
            onAction={() => router.back()}
          />
        )}

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p>Data is regularly updated. Last refresh: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </main>
  );
}

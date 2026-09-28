"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/marketplace/Navbar";
import Footer from "@/components/marketplace/Footer";
import {
  DEFAULT_BUYER_PRODUCE,
  DEFAULT_MARKET_PRICES,
} from "@/lib/services/buyer-defaults";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  TrendingUp,
  Package,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Layers,
  Scale,
  User,
} from "lucide-react";

// Mock verified commercial buyer demands looking to procure directly from farmers
const BUYER_DEMANDS = [
  {
    id: "DEM-101",
    crop: "Hybrid Red Tomatoes",
    category: "Vegetables",
    buyerName: "Sahyadri Fresh Retail & Mart",
    buyerType: "Supermarket Chain",
    targetQuantity: "2,500 kg",
    targetPrice: "₹24 – ₹26 / kg",
    destination: "Nashik City Hub",
    deliveryTimeline: "Within 48 hours",
    urgency: "High Demand",
    verified: true,
  },
  {
    id: "DEM-102",
    crop: "Nashik Red Onions (Garwa)",
    category: "Vegetables",
    buyerName: "Maharashtra Agro Traders",
    buyerType: "Wholesale Exporter",
    targetQuantity: "10,000 kg (100 Quintals)",
    targetPrice: "₹22 – ₹24 / kg",
    destination: "Vashi APMC Yard",
    deliveryTimeline: "This Week",
    urgency: "Immediate Pickup",
    verified: true,
  },
  {
    id: "DEM-103",
    crop: "Sharbati Golden Wheat",
    category: "Grains & Cereals",
    buyerName: "Kisan Flour Mills & Food Processing",
    buyerType: "Food Processor",
    targetQuantity: "5,000 kg (50 Quintals)",
    targetPrice: "₹28 – ₹30 / kg",
    destination: "Niphad Processing Plant",
    deliveryTimeline: "Flexible / Stored Grains",
    urgency: "Bulk Procurement",
    verified: true,
  },
  {
    id: "DEM-104",
    crop: "Spicy Green Chillies (Jwala)",
    category: "Vegetables",
    buyerName: "Daily Greens Distribution",
    buyerType: "Kirana Merchant Network",
    targetQuantity: "800 kg",
    targetPrice: "₹65 – ₹70 / kg",
    destination: "Sinnar Collection Gate",
    deliveryTimeline: "Tomorrow Morning",
    urgency: "High Demand",
    verified: true,
  },
  {
    id: "DEM-105",
    crop: "Jyoti Table Potatoes (Grade A)",
    category: "Vegetables",
    buyerName: "Sagar Snacks & Wafer Processors",
    buyerType: "Snack Manufacturer",
    targetQuantity: "4,000 kg",
    targetPrice: "₹18 – ₹20 / kg",
    destination: "Pune MIDC Hub",
    deliveryTimeline: "Within 3 Days",
    urgency: "Weekly Contract",
    verified: true,
  },
  {
    id: "DEM-106",
    crop: "Pusa Bold Mustard Seed",
    category: "Grains & Cereals",
    buyerName: "Shree Ganesh Oil Industries",
    buyerType: "Oil Mill Operator",
    targetQuantity: "2,000 kg",
    targetPrice: "₹68 – ₹72 / kg",
    destination: "Deola Mandi Point",
    deliveryTimeline: "Immediate",
    urgency: "Standard",
    verified: true,
  },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [search, setSearch] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("demands"); // "demands" | "listings" | "prices"
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Vegetables", "Grains & Cereals", "Fruits", "Spices"];

  // Filter Buyer Demands
  const filteredDemands = useMemo(() => {
    return BUYER_DEMANDS.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCrop = item.crop.toLowerCase().includes(q);
        const matchBuyer = item.buyerName.toLowerCase().includes(q);
        const matchLoc = item.destination.toLowerCase().includes(q);
        if (!matchCrop && !matchBuyer && !matchLoc) return false;
      }
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [search, selectedCategory]);

  // Filter Harvest Listings
  const filteredProduce = useMemo(() => {
    return DEFAULT_BUYER_PRODUCE.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchFarmer = item.farmer_name.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        if (!matchTitle && !matchFarmer && !matchLoc) return false;
      }
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [search, selectedCategory]);

  // Filter Mandi Rates
  const filteredPrices = useMemo(() => {
    return DEFAULT_MARKET_PRICES.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCrop = item.crop.toLowerCase().includes(q);
        const matchApmc = item.apmc.toLowerCase().includes(q);
        if (!matchCrop && !matchApmc) return false;
      }
      return true;
    });
  }, [search]);

  return (
    <div className="min-h-screen bg-[#f8faf6] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-emerald-950 px-4 py-12 sm:px-6 sm:py-16 text-amber-100">
          <div className="mx-auto max-w-5xl space-y-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/90 px-3.5 py-1 text-xs font-bold text-amber-200 border border-emerald-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Farmer & Market Explorer • शेतकरी एक्सप्लोरर
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-amber-100">
              Explore Live Demands & Mandi Prices
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-base text-amber-100/80 leading-relaxed">
              Find verified commercial buyers actively seeking bulk harvest lots, compare daily APMC modal rates, and sell your produce without middlemen commissions.
            </p>

            {/* Universal Search Bar */}
            <div className="pt-4 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search any crop, buyer demand, APMC mandi, or city..."
                  className="w-full rounded-2xl border-0 bg-white py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-900 shadow-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {/* Main Explorer Navigation Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("demands")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap active:scale-95 ${
                  activeTab === "demands"
                    ? "bg-emerald-950 text-amber-100 shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Buyer Demands ({filteredDemands.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("listings")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap active:scale-95 ${
                  activeTab === "listings"
                    ? "bg-emerald-950 text-amber-100 shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Farmer Produce ({filteredProduce.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("prices")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap active:scale-95 ${
                  activeTab === "prices"
                    ? "bg-emerald-950 text-amber-100 shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>APMC Rates ({filteredPrices.length})</span>
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-emerald-900 text-amber-100 font-bold"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: BUYER DEMANDS (What buyers want to purchase from farmers) */}
          {activeTab === "demands" && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Active Buyer Demands Across Maharashtra
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Verified supermarket chains, wholesale traders, and food mills waiting for farm harvest.
                  </p>
                </div>
                <Link
                  href="/farmer/produce?action=new"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-950 px-4 py-2.5 text-xs font-bold text-amber-100 hover:bg-emerald-900 transition shadow-xs shrink-0"
                >
                  <span>Have Produce to Sell? Post Here</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDemands.map((demand) => (
                  <article
                    key={demand.id}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            {demand.category}
                          </span>
                          <h3 className="mt-1.5 text-lg font-black text-slate-900 leading-tight">
                            {demand.crop}
                          </h3>
                        </div>
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-200">
                          {demand.urgency}
                        </span>
                      </div>

                      {/* Buyer Details */}
                      <div className="rounded-2xl bg-slate-50 p-3.5 text-xs space-y-1 border border-slate-100">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            {demand.buyerName}
                          </span>
                          {demand.verified && (
                            <span className="inline-flex items-center text-[10px] text-emerald-700">
                              <ShieldCheck className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500">{demand.buyerType}</p>
                        <p className="text-slate-600 flex items-center gap-1 pt-1">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          Delivery Hub: <strong>{demand.destination}</strong>
                        </p>
                      </div>

                      {/* Quantity & Target Buying Rate */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            Needed Volume
                          </span>
                          <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                            {demand.targetQuantity}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-emerald-50/80 p-3 border border-emerald-100">
                          <span className="text-[10px] uppercase font-bold text-emerald-800">
                            Buyer Budget Rate
                          </span>
                          <p className="text-sm font-black text-emerald-950 mt-0.5">
                            {demand.targetPrice}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <Link
                        href="/farmer"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-950 py-3 text-xs font-bold text-amber-100 hover:bg-emerald-900 transition active:scale-95 shadow-xs"
                      >
                        <span>Fulfill Demand as Farmer</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* TAB 2: ACTIVE FARMER HARVEST LISTINGS */}
          {activeTab === "listings" && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Current Farmer Harvest Listings
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  See what fellow farmers are listing, grades, packaging, and asking rates.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProduce.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition"
                  >
                    <div className="h-48 overflow-hidden bg-slate-100 relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-emerald-950/80 backdrop-blur-sm px-3 py-1 text-[11px] font-bold uppercase text-amber-100">
                          {item.quality_grade}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {item.category} • {item.variety}
                        </span>
                        <h3 className="text-lg font-black text-slate-900 mt-0.5">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-100">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            {item.farmer_name}
                          </span>
                          <span className="text-emerald-700 text-[10px] font-bold">Verified Farmer</span>
                        </div>
                        <p className="text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" /> {item.location}
                        </p>
                      </div>

                      <div className="flex items-baseline justify-between rounded-2xl bg-emerald-50/80 p-3 border border-emerald-100">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            Available Stock
                          </span>
                          <p className="text-xs font-bold text-slate-800">
                            {item.quantity_available.toLocaleString()} {item.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            Asking Rate
                          </span>
                          <p className="text-lg font-black text-emerald-950">
                            ₹{item.listed_price} <span className="text-xs font-normal">/ {item.unit}</span>
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/login"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-950 py-2.5 text-xs font-bold text-amber-100 hover:bg-emerald-900 transition"
                      >
                        <span>Connect to Trade</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* TAB 3: APMC MANDI RATES SNAPSHOT */}
          {activeTab === "prices" && (
            <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Live APMC Mandi Rates & MSP Benchmarks
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Regulated wholesale auction benchmarks across Maharashtra markets.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPrices.map((mp) => (
                  <div
                    key={mp.id}
                    className="flex flex-col justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {mp.apmc}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 mt-0.5">
                          {mp.crop}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" /> {mp.state}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        {mp.trend_pct}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-white p-3 text-center border border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Min Rate</span>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">₹{mp.min_price}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Max Rate</span>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">₹{mp.max_price}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800">Modal Rate</span>
                        <p className="text-sm font-black text-emerald-950 mt-0.5">₹{mp.modal_price}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">MSP: {mp.msp_price}</span>
                      <span className="text-slate-400">{mp.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Farmer Sell CTA Section */}
          <section className="rounded-3xl bg-linear-to-r from-emerald-900 to-emerald-950 p-8 sm:p-10 text-amber-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <span className="rounded-full bg-emerald-800/80 px-3 py-1 text-[11px] font-bold text-amber-200 border border-emerald-700">
                Direct Farmer Selling • थेट विक्री
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                Ready to list your harvest directly to commercial buyers?
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed">
                Post your produce in 2 minutes, negotiate rates directly, and receive 100% secured escrow payments upon pickup.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/farmer"
                className="rounded-2xl bg-amber-400 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-emerald-950 shadow-md hover:bg-amber-300 transition active:scale-95"
              >
                Go to Farmer Portal
              </Link>
              <Link
                href="/register"
                className="rounded-2xl border border-amber-200/40 bg-emerald-900/60 px-5 py-3.5 text-xs sm:text-sm font-bold text-amber-100 hover:bg-emerald-900 transition active:scale-95"
              >
                Register as Farmer
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f8faf6] text-emerald-950 font-bold">Loading Explorer...</div>}>
      <ExploreContent />
    </Suspense>
  );
}

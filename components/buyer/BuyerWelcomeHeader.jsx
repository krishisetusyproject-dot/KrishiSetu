"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, MapPin, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function BuyerWelcomeHeader({
  name = "Rahul Sharma",
  businessName = "Sahyadri Fresh Retail",
  location = "Nashik, Maharashtra",
  verified = true,
  onSearch,
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      router.push(`/buyer/browse?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-emerald-950 px-6 sm:px-8 py-8 sm:py-10 shadow-xl shadow-emerald-950/10 text-amber-100">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
        <div>
          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/80">
              <MapPin className="h-3.5 w-3.5 text-amber-200/80" />
              {location}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200 border border-emerald-800">
              {businessName}
            </span>
            {verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-800">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Verified Commercial Buyer
              </span>
            )}
          </div>

          {/* Heading */}
          <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-amber-100">
            Good morning, {name}!
          </h1>

          <p className="mt-2 text-sm sm:text-base leading-relaxed text-amber-100/80 max-w-xl">
            Find fresh harvest directly from verified farmers across Maharashtra with APMC modal price benchmarks and 100% escrow protection.
          </p>

          {/* Quick Search Bar (Matching ASCII Wireframe) */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-2xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search crops, varieties, or districts (e.g. Tomato, Onion, Wheat)..."
                className="w-full rounded-full border border-emerald-800/80 bg-white/95 px-11 py-3 text-sm text-slate-900 placeholder:text-slate-500 shadow-inner outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-200/30 transition"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-100 px-6 py-3 text-sm font-bold text-emerald-950 shadow-md hover:bg-white active:scale-95 transition-all"
            >
              <span>Browse Produce</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Trust badges */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-amber-100/70">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Direct Farmgate Sourcing
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Escrow Payment Security
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Live APMC Benchmark Rates
            </span>
          </div>
        </div>

        {/* Visual Graphic Banner */}
        <div className="hidden lg:block">
          <div className="relative h-60 w-full rounded-[1.75rem] overflow-hidden bg-emerald-900/40 border border-emerald-800/40 shadow-inner">
            <img
              src="/icons/fresh_produce.png"
              alt="Fresh Farm Produce"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent flex items-end p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Zero Intermediaries • Transparent Modal Mandi Benchmarks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

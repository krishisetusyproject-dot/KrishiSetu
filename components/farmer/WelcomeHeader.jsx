"use client";

import { Plus, TrendingUp, ShieldCheck, CheckCircle2, Award, MapPin } from "lucide-react";

export default function WelcomeHeader({
  name = "Ramesh Patil",
  farmName = "KrishiKalyan Farms",
  acreage = "8.5 Acres",
  location = "Nashik, Maharashtra",
  kisanId = "MH-NSK-88410",
  pmKisanVerified = true,
  onSellProduce,
  onViewMarketPrices,
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-emerald-950 px-6 sm:px-8 py-8 sm:py-10 shadow-xl shadow-emerald-950/10 text-amber-100">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/80">
              <MapPin className="h-3.5 w-3.5 text-amber-200/80" />
              {location}
            </span>
            {kisanId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/90 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-amber-200 border border-emerald-800">
                Kisan ID: {kisanId}
              </span>
            )}
            {pmKisanVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-800">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                PM-Kisan Verified
              </span>
            )}
          </div>

          {/* Heading */}
          <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-amber-100">
            Welcome back, {name}
          </h1>

          {/* Subheading / Farm Info */}
          <p className="mt-2 text-sm sm:text-base font-medium text-emerald-200/90">
            {farmName} • <span className="text-amber-100/90">{acreage} Landholding</span>
          </p>

          <p className="mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-amber-100/80">
            List your harvest for verified farmgate collection, review transparent APMC mandi benchmarks, and connect directly with institutional buyers with zero intermediary cut.
          </p>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onSellProduce}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-100 px-6 py-3 text-xs sm:text-sm font-bold text-emerald-950 shadow-sm shadow-emerald-950/15 hover:bg-white active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Sell Produce</span>
            </button>
            <button
              onClick={onViewMarketPrices}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-100/20 bg-emerald-900/60 px-6 py-3 text-xs sm:text-sm font-semibold text-amber-100 hover:bg-emerald-900 active:scale-95 transition-all"
            >
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Live Mandi Rates</span>
            </button>
          </div>
        </div>

        {/* Visual Graphic Banner */}
        <div className="hidden lg:block">
          <div className="relative h-64 w-full rounded-[1.75rem] overflow-hidden bg-emerald-900/40 border border-emerald-800/40 shadow-inner">
            <img
              src="/icons/farmer_with_laptop.jpg"
              alt="KrishiSetu Digital Farmer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent flex items-end p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>100% Direct APMC & Institutional Buyer Settlement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

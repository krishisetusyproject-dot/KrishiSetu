"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, TrendingUp, User, Tag } from "lucide-react";

export default function FarmerDock({ onSellProduce, pendingOffersCount = 2 }) {
  const router = useRouter();

  function handleSellClick() {
    if (onSellProduce) {
      onSellProduce();
    } else {
      router.push("/farmer/produce?action=new");
    }
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-1.5 sm:gap-2 rounded-2xl bg-white/95 p-1.5 shadow-2xl backdrop-blur-md border border-slate-200/90 ring-1 ring-black/5">
        {/* Sell Produce */}
        <button
          onClick={handleSellClick}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-amber-600 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Sell Produce</span>
        </button>

        {/* Market Prices */}
        <Link
          href="/farmer/market-prices"
          className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 active:scale-95 transition-all"
        >
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <span className="hidden xs:inline">Market Prices</span>
          <span className="xs:hidden">Prices</span>
        </Link>

        {/* My Profile */}
        <Link
          href="/farmer/profile"
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
        >
          <User className="h-4 w-4 text-slate-500" />
          <span>My Profile</span>
        </Link>

        {/* Offers Pill */}
        <Link
          href="/farmer/offers"
          className="flex items-center gap-1.5 rounded-xl bg-amber-100/80 px-3 py-2 text-xs sm:text-sm font-semibold text-amber-900 hover:bg-amber-200/70 border border-amber-300/60 active:scale-95 transition-all"
        >
          <Tag className="h-4 w-4 text-amber-700" />
          <span>{pendingOffersCount} Offers</span>
        </Link>
      </div>
    </div>
  );
}

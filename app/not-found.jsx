"use client";

import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag, ShieldCheck } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f8faf5] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-950 text-amber-100 shadow-xl shadow-emerald-950/15 mb-6">
          <span className="text-3xl font-extrabold">404</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Page Not Found
        </h1>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          The requested page or navigation link does not exist or has moved. Return to the dashboard or marketplace to continue.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/farmer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-amber-100 shadow-sm hover:bg-emerald-900 transition"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Farmer Portal</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Home className="h-4 w-4" />
            <span>Marketplace Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

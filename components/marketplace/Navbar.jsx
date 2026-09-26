"use client";

import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Explore Produce", href: "#produce" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Market Prices", href: "#market-prices" },
  { label: "About", href: "#why-krishi" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-950 text-amber-100 shadow-sm shadow-emerald-950/10">
            <span className="text-lg font-semibold">K</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-emerald-950">KrishiSetu</p>
            <p className="text-xs text-slate-500">Farm-to-buyer marketplace</p>
          </div>
        </a>

        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-700 transition hover:text-emerald-950"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/register"
            className="rounded-full border border-emerald-900/10 bg-white px-4 py-2 text-sm font-medium text-emerald-950 shadow-sm shadow-slate-500/5 hover:bg-slate-50"
          >
            Sell Produce
          </a>
          <a
            href="#buyer"
            className="rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-amber-100 shadow-sm shadow-emerald-950/10 hover:bg-emerald-900"
          >
            Buy Produce
          </a>
          <a href="/login" className="text-sm font-medium text-slate-700 hover:text-emerald-950">
            Sign In
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open ? (
        <div className="lg:hidden border-t border-slate-200/80 bg-slate-50/95 px-4 pb-5">
          <div className="space-y-3 pt-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            <a
              href="/register"
              className="flex items-center justify-between rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-amber-100"
            >
              Sell Produce
              <ArrowRight size={16} />
            </a>
            <a
              href="/register"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-950"
            >
              Buy Produce
              <ArrowRight size={16} />
            </a>
            <a
              href="/login"
              className="block rounded-2xl px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign In
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

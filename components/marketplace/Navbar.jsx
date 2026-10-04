"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const navItems = [
  { label: "Home", href: "/#home" },
  { label: "Explore", href: "/explore" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Market Prices", href: "/prices" },
  { label: "About", href: "/#why-krishi" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo
            className="h-11 w-auto"
            nameClassName="text-lg font-bold text-emerald-950"
            subtitle="Farm-to-buyer marketplace"
            subtitleClassName="text-xs text-slate-500"
          />
        </Link>

        <nav className="hidden shrink-0 items-center gap-6 2xl:flex 2xl:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium text-slate-700 transition hover:text-emerald-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 2xl:flex">
          <LanguageSwitcher />

          <Link
            href="/farmer"
            className="whitespace-nowrap rounded-full border border-emerald-900/10 bg-white px-4 py-2 text-sm font-semibold text-emerald-950 shadow-xs hover:bg-slate-50 transition"
          >
            Farmer Portal
          </Link>
          <Link
            href="/buyer"
            className="whitespace-nowrap rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-amber-100 shadow-xs hover:bg-emerald-900 transition"
          >
            Buyer Portal
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-emerald-950 transition ml-1"
          >
            Sign In
          </Link>
        </div>

        <div className="flex items-center gap-2 2xl:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
            aria-label="Toggle navigation menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="2xl:hidden border-t border-slate-200/80 bg-slate-50/95 px-4 pb-5 shadow-lg">
          <div className="space-y-2 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-2xl px-4 py-2.5 text-base font-medium text-slate-700 transition hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 space-y-2.5 pt-3 border-t border-slate-200">
            <Link
              href="/farmer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-amber-100"
            >
              <span>Farmer Portal</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/buyer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-950"
            >
              <span>Buyer Portal</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Menu, X, Plus, LogOut, User, ShoppingBag } from "lucide-react";

export default function FarmerHeader({
  name = "Ramesh Patil",
  onLogout,
  onSellProduce,
  notificationCount = 0,
  activeListingsCount,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItems = useMemo(() => [
    { label: "Dashboard", href: "/farmer" },
    { label: "Produce", href: "/farmer/produce" },
    { label: "Buyer Offers", href: "/farmer/offers", badge: notificationCount },
    { label: "Orders & Pickup", href: "/farmer/orders" },
    { label: "Live Mandi Rates", href: "/farmer/market-prices" },
    { label: "Logistics Hub", href: "/farmer/logistics" },
  ], [notificationCount]);

  function isActive(href) {
    if (href === "/farmer") return pathname === "/farmer";
    return pathname.startsWith(href);
  }

  const handleDefaultLogout = useCallback(async () => {
    if (onLogout) {
      await onLogout();
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  }, [onLogout, router]);

  const handleSellClick = useCallback(() => {
    if (onSellProduce) {
      onSellProduce();
    } else {
      router.push("/farmer/produce?action=new");
    }
  }, [onSellProduce, router]);

  const initial = (name || "F").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/farmer" className="flex items-center gap-3 group shrink-0">
          <BrandLogo
            className="h-11 w-auto transition-transform group-hover:scale-[1.02]"
            nameClassName="text-lg font-extrabold text-emerald-950 whitespace-nowrap"
            subtitle="Farmer Portal"
            subtitleClassName="text-[11px] font-medium text-slate-500 whitespace-nowrap"
          />
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden shrink-0 items-center gap-3 2xl:flex 2xl:gap-5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative shrink-0 whitespace-nowrap text-xs sm:text-sm transition flex items-center gap-1.5 pb-1 ${
                  active
                    ? "font-bold text-emerald-950 border-b-2 border-emerald-950"
                    : "font-medium text-slate-600 hover:text-emerald-950"
                }`}
              >
                <span>{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden shrink-0 items-center gap-3 2xl:flex">
          <LanguageSwitcher />

          <button
            onClick={handleSellClick}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950 px-4 py-2 text-xs sm:text-sm font-bold text-amber-100 shadow-sm shadow-emerald-950/10 hover:bg-emerald-900 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Sell Produce</span>
          </button>

          {/* User Profile Pill */}
          <Link
            href="/farmer/profile"
            className={`flex items-center gap-2.5 rounded-full border bg-white px-3 py-1.5 shadow-xs hover:bg-slate-50 transition ${
              pathname === "/farmer/profile"
                ? "border-emerald-700 ring-2 ring-emerald-600/20"
                : "border-slate-200"
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-950/10 text-xs font-bold text-emerald-950">
              {initial}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 max-w-[120px] truncate">
              {name}
            </span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleDefaultLogout}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-full p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile controls */}
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

      {/* Mobile Drawer */}
      {open && (
        <div className="2xl:hidden border-t border-slate-200/80 bg-slate-50/95 px-4 pb-5 shadow-lg">
          <div className="space-y-1.5 pt-4">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm ${
                    active
                      ? "bg-emerald-950 text-amber-100 font-bold"
                      : "font-medium text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{item.label}</span>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 space-y-2.5">
            <button
              onClick={() => {
                setOpen(false);
                handleSellClick();
              }}
              className="w-full flex items-center justify-center gap-1.5 rounded-full bg-emerald-950 px-4 py-2.5 text-sm font-bold text-amber-100 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Sell Produce</span>
            </button>

            <Link
              href="/farmer/profile"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-950/10 text-xs font-bold text-emerald-950">
                  {initial}
                </div>
                <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                  {name}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Profile</span>
            </Link>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  setOpen(false);
                  handleDefaultLogout();
                }}
                className="text-xs font-semibold text-red-600 hover:underline px-2 py-1"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

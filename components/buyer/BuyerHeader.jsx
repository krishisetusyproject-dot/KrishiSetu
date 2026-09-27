"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BrandLogo from "@/components/BrandLogo";
import {
  Menu,
  X,
  ShoppingBag,
  Heart,
  Bell,
  LogOut,
  User,
  Search,
  TrendingUp,
  Package,
  LayoutDashboard,
} from "lucide-react";

export default function BuyerHeader({
  name = "Rahul Sharma",
  onLogout,
  unreadNotificationsCount = 2,
  savedProduceCount = 2,
  activeOrdersCount = 3,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItems = useMemo(() => [
    { label: "Dashboard", href: "/buyer", icon: LayoutDashboard },
    {
      label: "My Orders",
      href: "/buyer/orders",
      icon: Package,
      badge: activeOrdersCount,
      badgeColor: "bg-sky-600",
    },
    {
      label: "Saved",
      href: "/buyer/saved",
      icon: Heart,
      badge: savedProduceCount,
      badgeColor: "bg-rose-500",
    },
    { label: "Market Prices", href: "/buyer/market-prices", icon: TrendingUp },
    { label: "Logistics Hub", href: "/buyer/logistics", icon: Package },
    {
      label: "Notifications",
      href: "/buyer/notifications",
      icon: Bell,
      badge: unreadNotificationsCount,
      badgeColor: "bg-amber-500",
    },
  ], [activeOrdersCount, savedProduceCount, unreadNotificationsCount]);

  function isActive(href) {
    if (href === "/buyer") return pathname === "/buyer";
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

  const initial = (name || "B").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/buyer" className="flex items-center gap-3 group shrink-0">
          <BrandLogo
            className="h-11 w-auto transition-transform group-hover:scale-[1.02]"
            nameClassName="text-lg font-extrabold text-emerald-950 whitespace-nowrap"
            subtitle="Buyer Portal"
            subtitleClassName="text-[11px] font-medium text-slate-500 whitespace-nowrap"
          />
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden items-center gap-3 xl:gap-6 lg:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-xs sm:text-sm transition flex items-center gap-1.5 pb-1 ${
                  active
                    ? "font-bold text-emerald-950 border-b-2 border-emerald-950"
                    : "font-medium text-slate-600 hover:text-emerald-950"
                }`}
              >
                <span>{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span
                    className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
                      item.badgeColor || "bg-amber-500"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/buyer/browse"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950 px-4 py-2 text-xs sm:text-sm font-bold text-amber-100 shadow-sm shadow-emerald-950/10 hover:bg-emerald-900 active:scale-95 transition-all"
          >
            <Search className="h-4 w-4" />
            <span>Browse Produce</span>
          </Link>

          {/* User Profile Pill */}
          <Link
            href="/buyer/profile"
            className={`flex items-center gap-2.5 rounded-full border bg-white px-3 py-1.5 shadow-xs hover:bg-slate-50 transition ${
              pathname === "/buyer/profile"
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

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden border-t border-slate-200/80 bg-slate-50/95 px-4 pb-5 shadow-lg">
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
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 opacity-75" />
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${
                        item.badgeColor || "bg-amber-500"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 space-y-2.5">
            <Link
              href="/buyer/browse"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 rounded-full bg-emerald-950 px-4 py-2.5 text-sm font-bold text-amber-100 shadow-sm"
            >
              <Search className="h-4 w-4" />
              <span>Browse Produce</span>
            </Link>

            <Link
              href="/buyer/profile"
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

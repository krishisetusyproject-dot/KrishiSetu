"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Package, Heart, TrendingUp, Bell } from "lucide-react";

export default function BuyerDock({
  unreadNotificationsCount = 2,
  savedCount = 2,
  activeOrdersCount = 3,
}) {
  const pathname = usePathname();

  const dockItems = [
    {
      label: "Browse",
      href: "/buyer/browse",
      icon: Search,
      badge: null,
    },
    {
      label: "Orders",
      href: "/buyer/orders",
      icon: Package,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      badgeColor: "bg-sky-600",
    },
    {
      label: "Saved",
      href: "/buyer/saved",
      icon: Heart,
      badge: savedCount > 0 ? savedCount : null,
      badgeColor: "bg-rose-500",
    },
    {
      label: "Prices",
      href: "/buyer/market-prices",
      icon: TrendingUp,
      badge: null,
    },
    {
      label: "Alerts",
      href: "/buyer/notifications",
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
      badgeColor: "bg-amber-500",
    },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-1 sm:gap-2 rounded-2xl bg-white/95 p-1.5 shadow-2xl backdrop-blur-md border border-slate-200/90 ring-1 ring-black/5">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
                isActive
                  ? "bg-emerald-950 text-amber-100 shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden xs:inline">{item.label}</span>
              {Boolean(item.badge) && (
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
      </div>
    </div>
  );
}

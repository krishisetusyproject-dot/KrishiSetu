"use client";

import Link from "next/link";
import { Package, ShoppingBag, Truck, ShieldCheck, ArrowRight } from "lucide-react";

export default function DashboardStats({
  activeProduce = 0,
  pendingOffers = 0,
  activeOrders = 0,
  verificationStatus = "Verified",
  loading = false,
}) {
  const stats = [
    {
      label: "Active Produce Listings",
      value: activeProduce,
      subtext: "Live on open buyer marketplace",
      icon: Package,
      href: "/farmer/produce",
      actionText: "Manage Produce",
    },
    {
      label: "Pending Buyer Offers",
      value: pendingOffers,
      subtext: "Awaiting your price response",
      icon: ShoppingBag,
      href: "/farmer/offers",
      actionText: "Review Offers",
    },
    {
      label: "Confirmed Orders",
      value: activeOrders,
      subtext: "Ready for buyer pickup",
      icon: Truck,
      href: "/farmer/orders",
      actionText: "Track Pickups",
    },
    {
      label: "Account Status",
      value: verificationStatus,
      subtext: "Direct escrow settlement ready",
      icon: ShieldCheck,
      href: "/farmer/profile",
      actionText: "View Profile",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 transition hover:border-emerald-950/20"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-950/10 text-emerald-950">
                  <IconComponent className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-950/70">
                  Metric
                </span>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-bold tracking-tight text-slate-950">
                  {loading ? "..." : stat.value}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-emerald-950">
                  {stat.label}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {stat.subtext}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href={stat.href}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-950 hover:underline"
              >
                <span>{stat.actionText}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import { Clock, CheckCircle2, Truck, Award, ArrowRight, Heart } from "lucide-react";

export default function BuyerStats({
  pendingOrders = 1,
  confirmedOrders = 1,
  readyPickupOrders = 1,
  completedOrders = 1,
  loading = false,
}) {
  const stats = [
    {
      label: "Pending Orders",
      value: pendingOrders,
      subtext: "Awaiting farmer acceptance",
      icon: Clock,
      href: "/buyer/orders?status=pending",
      actionText: "View Pending",
      colorClass: "text-amber-700 bg-amber-500/10",
    },
    {
      label: "Confirmed Orders",
      value: confirmedOrders,
      subtext: "Scheduled for farmgate pickup",
      icon: CheckCircle2,
      href: "/buyer/orders?status=confirmed",
      actionText: "Track Orders",
      colorClass: "text-emerald-700 bg-emerald-500/10",
    },
    {
      label: "Ready for Pickup",
      value: readyPickupOrders,
      subtext: "Weighed & packed at farmgate",
      icon: Truck,
      href: "/buyer/orders?status=ready_for_pickup",
      actionText: "Pickup Details",
      colorClass: "text-sky-700 bg-sky-500/10",
    },
    {
      label: "Completed Deals",
      value: completedOrders,
      subtext: "Successfully disbursed & delivered",
      icon: Award,
      href: "/buyer/orders?status=completed",
      actionText: "Order History",
      colorClass: "text-purple-700 bg-purple-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-[1.75rem] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm shadow-slate-900/5 transition hover:border-emerald-950/20 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl ${stat.colorClass}`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Orders
                </span>
              </div>

              <div className="mt-3 sm:mt-4">
                <p className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  {loading ? "..." : stat.value}
                </p>
                <h3 className="mt-1 text-xs sm:text-sm font-bold text-slate-800">
                  {stat.label}
                </h3>
                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-slate-500 leading-tight">
                  {stat.subtext}
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100">
              <Link
                href={stat.href}
                className="group inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-emerald-950"
              >
                <span>{stat.actionText}</span>
                <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

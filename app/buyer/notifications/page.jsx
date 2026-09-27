"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DEFAULT_BUYER_NOTIFICATIONS, DEFAULT_BUYER_PROFILE } from "@/lib/services/buyer-defaults";

import BuyerHeader from "@/components/buyer/BuyerHeader";
import BuyerDock from "@/components/buyer/BuyerDock";
import {
  Bell,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  TrendingUp,
  XCircle,
  ArrowRight,
  CheckCheck,
} from "lucide-react";

export default function BuyerNotificationsPage() {
  const [profile] = useState(DEFAULT_BUYER_PROFILE);
  const [notifications, setNotifications] = useState(DEFAULT_BUYER_NOTIFICATIONS);
  const [filter, setFilter] = useState("all"); // "all" | "unread"
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("krishi_buyer_notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch {}
  }, []);

  function saveNotifications(updated) {
    setNotifications(updated);
    try {
      localStorage.setItem("krishi_buyer_notifications", JSON.stringify(updated));
    } catch {}
  }

  function markAsRead(id) {
    const updated = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    saveNotifications(updated);
  }

  function markAllAsRead() {
    const updated = notifications.map((n) => ({ ...n, is_read: true }));
    saveNotifications(updated);
    setToastMessage("All notifications marked as read.");
    setTimeout(() => setToastMessage(""), 3500);
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const iconMap = {
    order_confirmed: { icon: CheckCircle2, color: "text-emerald-700 bg-emerald-100", href: "/buyer/orders?status=confirmed" },
    order_ready: { icon: Truck, color: "text-sky-700 bg-sky-100", href: "/buyer/orders?status=ready_for_pickup" },
    new_produce: { icon: Sparkles, color: "text-amber-700 bg-amber-100", href: "/buyer/browse" },
    market_price: { icon: TrendingUp, color: "text-purple-700 bg-purple-100", href: "/buyer/market-prices" },
    order_rejected: { icon: XCircle, color: "text-rose-700 bg-rose-100", href: "/buyer/orders?status=cancelled" },
  };

  return (
    <div className="min-h-screen bg-[#f8faf6] pb-28 text-slate-900">
      <BuyerHeader
        name={profile.full_name}
        unreadNotificationsCount={unreadCount}
        activeOrdersCount={3}
      />

      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2 rounded-2xl bg-emerald-950 px-5 py-3 text-sm font-bold text-amber-100 shadow-xl border border-emerald-800 animate-slide-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Bell className="h-4 w-4" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Notifications</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time updates on farmer acceptances, farmgate gate passes, and harvest alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition active:scale-95"
            >
              <CheckCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>Mark all as read</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
              filter === "all" ? "bg-emerald-950 text-amber-100" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
              filter === "unread" ? "bg-emerald-950 text-amber-100" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((n) => {
              const meta = iconMap[n.type] || { icon: Bell, color: "text-slate-700 bg-slate-100", href: "/buyer" };
              const Icon = meta.icon;

              return (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border p-5 transition cursor-pointer ${
                    n.is_read
                      ? "border-slate-200/80 bg-white"
                      : "border-emerald-700/30 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-700/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-sm ${n.is_read ? "text-slate-800" : "text-emerald-950"}`}>
                          {n.title}
                        </h3>
                        {!n.is_read && (
                          <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{n.message}</p>
                      <span className="text-[10px] font-semibold text-slate-400 block pt-0.5">{n.time}</span>
                    </div>
                  </div>

                  <div className="sm:self-center shrink-0">
                    <Link
                      href={meta.href}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 hover:text-emerald-950 group"
                    >
                      <span>View</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <Bell className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-800">No {filter === "unread" ? "unread " : ""}notifications</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              You're all caught up! New order progress and mandi updates will appear here in real time.
            </p>
          </div>
        )}
      </main>

      <BuyerDock unreadNotificationsCount={unreadCount} activeOrdersCount={3} />
    </div>
  );
}

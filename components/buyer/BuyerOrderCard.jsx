"use client";

import { Building2, Calendar, ShieldCheck, CheckCircle2, Truck, Clock, XCircle, MapPin, Phone, MessageSquare } from "lucide-react";

export default function BuyerOrderCard({
  id = "ORD-8941",
  crop = "Hybrid Red Tomatoes",
  farmer = "Ramesh Patil",
  farmerPhone = "+91 98220 12345",
  quantity = 600,
  unit = "kg",
  price = 24,
  totalAmount = 14400,
  orderDate = "27 Sep 2026",
  status = "pending", // pending, confirmed, ready_for_pickup, completed, cancelled
  pickupLocation = "Dindori Farmgate Hub, Gate #1, Nashik",
  pickupDate = "28 Sep 2026 (08:00 AM)",
  notes = "Farmer is packing crates for pickup inspection.",
  paymentStatus = "Escrow Locked",
  onCancelOrder,
  onChat,
}) {
  const statusConfig = {
    pending: {
      label: "Pending Farmer Response",
      bgClass: "bg-amber-100 text-amber-900 border-amber-300",
      icon: Clock,
    },
    confirmed: {
      label: "Confirmed & Scheduled",
      bgClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      icon: CheckCircle2,
    },
    ready_for_pickup: {
      label: "Ready for Farmgate Pickup",
      bgClass: "bg-sky-100 text-sky-900 border-sky-300",
      icon: Truck,
    },
    completed: {
      label: "Completed & Disbursed",
      bgClass: "bg-purple-100 text-purple-900 border-purple-300",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Cancelled & Refunded",
      bgClass: "bg-rose-100 text-rose-900 border-rose-300",
      icon: XCircle,
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700">
            {id}
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {crop}
          </h3>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${currentStatus.bgClass}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{currentStatus.label}</span>
          </span>
        </div>

        {/* Pricing */}
        <div className="text-left sm:text-right">
          <p className="text-2xl font-black text-slate-900">
            ₹{totalAmount?.toLocaleString()}{" "}
            <span className="text-xs font-semibold text-slate-500">
              ({quantity} {unit} @ ₹{price} / {unit})
            </span>
          </p>
        </div>
      </div>

      {/* 3 Columns Details Box */}
      <div className="my-5 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-slate-50/80 p-4 sm:p-5 border border-slate-100">
        {/* Farmer Details */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Farmer & Contact
          </p>
          <div className="mt-1 flex items-start gap-2">
            <Building2 className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-slate-900 leading-snug">{farmer}</p>
              {farmerPhone && (
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" /> {farmerPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pickup & Agreement Date */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Pickup Date & Time
          </p>
          <div className="mt-1 flex items-start gap-2">
            <Calendar className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-slate-900 leading-snug">{pickupDate}</p>
              <p className="text-xs font-medium text-slate-500">Ordered: {orderDate}</p>
            </div>
          </div>
        </div>

        {/* Pickup Location & Escrow Status */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Pickup Hub & Security
          </p>
          <div className="mt-1 flex items-start gap-2">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-slate-900 leading-snug truncate max-w-[220px]">
                {pickupLocation}
              </p>
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3 w-3 text-emerald-600" /> {paymentStatus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Dispatch Status: </span>
          {notes}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onChat && (
            <button
              type="button"
              onClick={() =>
                onChat({
                  name: farmer,
                  location: pickupLocation,
                  verified: true,
                  crop: crop,
                  orderId: id,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-900/20 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-950 hover:bg-emerald-100 transition active:scale-95"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-800" />
              <span>Chat Farmer</span>
            </button>
          )}

          {status === "pending" && onCancelOrder && (
            <button
              type="button"
              onClick={() => onCancelOrder(id)}
              className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
            >
              Withdraw Offer
            </button>
          )}

          {status === "ready_for_pickup" && (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-4 py-2 text-xs font-bold text-sky-800 border border-sky-300">
              <Truck className="h-3.5 w-3.5" />
              <span>Gate Pass Ready for Truck Loading</span>
            </div>
          )}

          {status === "completed" && (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-4 py-2 text-xs font-bold text-purple-800 border border-purple-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Transaction Finalized & Receipt Issued</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

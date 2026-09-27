"use client";

import { Building2, Calendar, ShieldCheck, CheckCircle2, Truck } from "lucide-react";

export default function OrderCard({
  id = "ord-2078",
  produceTitle = "Roma Tomatoes",
  quantity = 1500,
  unit = "kg",
  unitPrice = 35.5,
  totalAmount = 53250,
  buyerName = "Sahyadri Farm Fresh Retail",
  buyerType = "Verified Buyer",
  agreementDate = "Recent",
  collectionType = "Farmgate collection",
  paymentSecurity = "Escrow Secured",
  settlementTerms = "Direct settlement upon delivery",
  status = "pickup_scheduled",
  onMarkCompleted,
  loading = false,
}) {
  const isCompleted = status === "completed";
  const isCancelled = status === "cancelled";

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700">
            {id}
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {produceTitle}
          </h3>
          {isCompleted ? (
            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
              Completed & Disbursed
            </span>
          ) : isCancelled ? (
            <span className="rounded-full bg-red-100 px-3 py-0.5 text-xs font-bold text-red-800 border border-red-300">
              Cancelled
            </span>
          ) : (
            <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-bold text-sky-800 border border-sky-300">
              Pickup Scheduled
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="text-left sm:text-right">
          <p className="text-2xl font-black text-slate-900">
            ₹{totalAmount?.toLocaleString()}{" "}
            <span className="text-xs font-semibold text-slate-500">
              ({quantity} {unit} @ ₹{unitPrice} / {unit})
            </span>
          </p>
        </div>
      </div>

      {/* 3 Columns Details Box */}
      <div className="my-5 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-slate-50/80 p-4 sm:p-5 border border-slate-100">
        {/* Buyer */}
        <div>
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Buyer Details</p>
          <div className="mt-1 flex items-start gap-2">
            <Building2 className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-slate-900 leading-snug">{buyerName}</p>
              <p className="text-xs font-semibold text-emerald-700">{buyerType}</p>
            </div>
          </div>
        </div>

        {/* Agreement / Date */}
        <div>
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Agreement Date</p>
          <div className="mt-1 flex items-start gap-2">
            <Calendar className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-slate-900 leading-snug">{agreementDate}</p>
              <p className="text-xs font-medium text-slate-500">{collectionType}</p>
            </div>
          </div>
        </div>

        {/* Payment Security */}
        <div>
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Payment Security</p>
          <div className="mt-1 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-emerald-800 leading-snug">{paymentSecurity}</p>
              <p className="text-xs font-medium text-slate-500">{settlementTerms}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Truck className="h-4 w-4 text-slate-400" />
          <span>Vehicle details: Dispatch gate coordination active</span>
        </div>

        <div>
          {isCompleted ? (
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-2.5 text-xs font-bold text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Escrow Payment Transferred to Farmer Bank</span>
            </div>
          ) : (
            <button
              onClick={() => onMarkCompleted && onMarkCompleted(id)}
              disabled={loading}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#094734] hover:bg-[#073829] active:scale-95 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark Deal as Completed & Disbursed</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

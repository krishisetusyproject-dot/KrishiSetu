"use client";

import { memo } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";

// Defined outside component so it's never re-created on re-renders
const CROP_IMAGES = {
  tomato: "/icons/tomatoes.jpg",
  chilli: "/icons/green_chillies.jpg",
  chill: "/icons/green_chillies.jpg",
  mirch: "/icons/green_chillies.jpg",
  mustard: "/icons/mustard_seeds.jpg",
  sarson: "/icons/mustard_seeds.jpg",
  wheat: "/icons/wheat_crop.png",
  gehu: "/icons/wheat_crop.png",
  grain: "/icons/wheat_crop.png",
};
const DEFAULT_IMAGE = "/icons/fresh_produce.png";

function resolveImage(title, imageUrl) {
  if (imageUrl) return imageUrl;
  const lower = (title || "").toLowerCase();
  for (const [key, path] of Object.entries(CROP_IMAGES)) {
    if (lower.includes(key)) return path;
  }
  return DEFAULT_IMAGE;
}

function getSmartPriceIndicator(listedPrice, marketRefString) {
  if (!marketRefString || !listedPrice) return null;
  const numbers = marketRefString.match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;
  
  let marketAvg = numbers.length >= 2 
    ? (parseInt(numbers[0]) + parseInt(numbers[1])) / 2 
    : parseInt(numbers[0]);
  
  const diffPercent = ((listedPrice - marketAvg) / marketAvg) * 100;
  
  if (diffPercent < -5) {
    return { label: "Below Market", color: "bg-amber-400/90 text-amber-950", icon: "🟡" };
  } else if (diffPercent > 5) {
    return { label: "Above Market", color: "bg-rose-600/90 text-white", icon: "🔴" };
  } else {
    return { label: "Fair Price", color: "bg-emerald-600/90 text-white", icon: "🟢" };
  }
}

// memo prevents unnecessary re-renders when parent state changes (e.g. toast messages)
const ProduceCard = memo(function ProduceCard({
  id,
  title,
  variety,
  category,
  askingPrice,
  quantity,
  unit = "kg",
  qualityGrade,
  location,
  status = "active",
  imageUrl,
  marketReference,
  onToggleStatus,
  onDelete,
}) {
  const isPaused = status === "paused";
  const resolvedImage = resolveImage(title, imageUrl);
  const priceIndicator = getSmartPriceIndicator(askingPrice, marketReference);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5 transition hover:shadow-md">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <Image
          src={resolvedImage}
          alt={title || "Produce"}
          fill
          className="object-cover transition duration-500 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
              isPaused
                ? "bg-amber-100 text-amber-900"
                : "bg-emerald-950/80 backdrop-blur-sm text-amber-100"
            }`}
          >
            {isPaused ? "Paused" : "Active"}
          </span>
          {priceIndicator && (
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide backdrop-blur-sm shadow-sm ${priceIndicator.color}`}
              title="Smart Price Indicator (compared to APMC Reference)"
            >
              <span className="text-[10px]">{priceIndicator.icon}</span>
              {priceIndicator.label}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-emerald-950">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {variety ? `${variety} • ` : ""}{category || "Produce"}
            </p>
          </div>
          {qualityGrade && (
            <span className="rounded-full bg-emerald-950/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-950">
              {qualityGrade}
            </span>
          )}
        </div>

        <div className="grid gap-1 text-sm text-slate-600">
          <p>{location || "Maharashtra"}</p>
          <p className="font-medium text-slate-900">
            {quantity} {unit} available
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-50 px-4 py-3">
          <div>
            <p className="text-xs text-slate-500">Your Asking Price</p>
            <p className="mt-0.5 text-lg font-semibold text-slate-950">
              ₹{askingPrice} <span className="text-xs font-normal text-slate-500">/ {unit}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Status</p>
            <p className="mt-0.5 text-sm font-semibold text-emerald-950">
              {isPaused ? "Hidden from Buyers" : "Visible to Buyers"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(id, isPaused ? "active" : "paused")}
              className="flex-1 rounded-full border border-emerald-950/15 bg-white py-2 text-xs font-semibold text-emerald-950 hover:bg-slate-50 transition"
            >
              {isPaused ? "Resume Listing" : "Pause Listing"}
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              title="Delete produce"
              className="rounded-full p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-700 transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

export default ProduceCard;

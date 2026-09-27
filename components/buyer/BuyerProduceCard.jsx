"use client";

import { memo } from "react";
import Image from "next/image";
import {
  Heart,
  MapPin,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Scale,
  MessageSquare,
} from "lucide-react";

// Static lookup — defined outside component so it's allocated once
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

// memo: prevents re-renders when parent list state (savedIds, toast) changes
const BuyerProduceCard = memo(function BuyerProduceCard({
  id,
  title = "Tomato",
  category = "Vegetables",
  variety = "Hybrid",
  listedPrice = 24,
  unit = "kg",
  quantityAvailable = 500,
  marketReference = "₹22–26 / kg",
  farmerName = "Ramesh Patil",
  farmerVerified = true,
  location = "Nashik",
  qualityGrade = "A+ Premium",
  harvestDate = "Immediate",
  organic = false,
  imageUrl,
  isSaved = false,
  onToggleSave,
  onMakeOffer,
  onChat,
}) {
  const resolvedImage = resolveImage(title, imageUrl);
  const priceIndicator = getSmartPriceIndicator(listedPrice, marketReference);

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-300">
      {/* Produce Image Header */}
      <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-100">
        <Image
          src={resolvedImage}
          alt={title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
          {priceIndicator && (
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide backdrop-blur-sm shadow-sm ${priceIndicator.color}`}
              title="Smart Price Indicator (compared to APMC Reference)"
            >
              <span className="text-[10px]">{priceIndicator.icon}</span>
              {priceIndicator.label}
            </span>
          )}
          <span className="rounded-full bg-emerald-950/80 backdrop-blur-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-100">
            {qualityGrade || "Grade A"}
          </span>
          {organic && (
            <span className="rounded-full bg-emerald-600/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white">
              Organic
            </span>
          )}
        </div>

        {/* Wishlist Heart Toggle */}
        <button
          type="button"
          onClick={() => onToggleSave && onToggleSave(id)}
          title={isSaved ? "Remove from Saved" : "Save to Wishlist"}
          aria-label="Save produce"
          className="absolute top-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white active:scale-90"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isSaved ? "fill-rose-500 text-rose-500" : "text-slate-600 hover:text-rose-500"
            }`}
          />
        </button>

        {/* Harvest Date Tag */}
        <div className="absolute bottom-2.5 left-3.5">
          <span className="rounded-lg bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-white">
            Harvest: {harvestDate}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-emerald-950 transition-colors">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {variety ? `${variety} • ` : ""}
            <span className="font-semibold text-slate-600">{category}</span>
          </p>
        </div>

        {/* Farmer & Location Info */}
        <div className="rounded-2xl bg-slate-50 p-3 text-xs space-y-1.5 border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>{farmerName}</span>
            </div>
            {farmerVerified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Quantity Available */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
          <span className="flex items-center gap-1 text-slate-500">
            <Scale className="h-3.5 w-3.5 text-slate-400" /> Available Stock:
          </span>
          <span className="text-slate-900 font-bold">
            {quantityAvailable?.toLocaleString()} {unit}
          </span>
        </div>

        {/* Price & Market Reference */}
        <div className="rounded-2xl bg-emerald-50/80 p-3.5 border border-emerald-100/80 space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
              Listed Price
            </span>
            <span className="text-xl font-black text-emerald-950">
              ₹{listedPrice}{" "}
              <span className="text-xs font-medium text-emerald-800">/ {unit}</span>
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-emerald-200/50 text-[11px]">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Sparkles className="h-3 w-3 text-amber-500" /> Market Ref:
            </span>
            <span className="font-bold text-slate-700">{marketReference}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onMakeOffer &&
              onMakeOffer({ id, title, farmerName, location, listedPrice, unit, quantityAvailable })
            }
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-950 px-3.5 py-3 text-xs sm:text-sm font-bold text-amber-100 shadow-sm hover:bg-emerald-900 active:scale-95 transition-all"
          >
            <span>Place Order / Offer</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              onChat &&
              onChat({ name: farmerName, location, verified: farmerVerified, crop: title, produceId: id })
            }
            title="Chat with Farmer"
            aria-label="Chat with Farmer"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-900/20 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 hover:text-emerald-950 active:scale-95 transition-all shadow-xs"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
});

export default BuyerProduceCard;

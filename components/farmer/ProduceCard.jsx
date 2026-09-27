"use client";

import { Eye, Trash2, Pause, Play } from "lucide-react";

export default function ProduceCard({
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
  onToggleStatus,
  onDelete,
}) {
  const isPaused = status === "paused";

  const defaultCropImages = {
    tomato: "/icons/tomatoes.jpg",
    onion: "/icons/wheat_crop.png",
    wheat: "/icons/wheat_crop.png",
    chilli: "/icons/green_chillies.jpg",
    mustard: "/icons/mustard_seeds.jpg",
    default: "/icons/fresh_produce.png",
  };

  const cropName = (title || "").toLowerCase();
  let resolvedImage = imageUrl;
  if (!resolvedImage) {
    if (cropName.includes("tomato")) resolvedImage = defaultCropImages.tomato;
    else if (cropName.includes("chili") || cropName.includes("chill") || cropName.includes("mirch"))
      resolvedImage = defaultCropImages.chilli;
    else if (cropName.includes("mustard") || cropName.includes("sarson"))
      resolvedImage = defaultCropImages.mustard;
    else if (cropName.includes("wheat") || cropName.includes("gehu") || cropName.includes("grain"))
      resolvedImage = defaultCropImages.wheat;
    else resolvedImage = defaultCropImages.default;
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5 transition hover:shadow-md">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          src={resolvedImage}
          alt={title}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute top-4 right-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
              isPaused
                ? "bg-amber-100 text-amber-900"
                : "bg-emerald-950/80 backdrop-blur-sm text-amber-100"
            }`}
          >
            {isPaused ? "Paused" : "Active"}
          </span>
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

        {/* Asking price block */}
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

        {/* Actions */}
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
}

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function ProductCard({ product }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const titleId = `produce-title-${product.name.replace(/[^a-z0-9]/gi, "-")}`;

  useEffect(() => {
    if (!detailsOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setDetailsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [detailsOpen]);

  return (
    <>
      <article className="overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5">
        <div className="relative h-52 overflow-hidden bg-slate-100 sm:h-64">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xl font-semibold text-emerald-950">{product.name}</p>
              <p className="mt-1 text-sm text-slate-600">{product.farmer}</p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-950/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-950">
              Verified
            </span>
          </div>
          <div className="grid gap-2 text-sm text-slate-600">
            <p>{product.location}</p>
            <p>{product.quantity}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm text-slate-500">Asking Price</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{product.askingPrice}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">APMC Reference</p>
              <p className="mt-1 text-lg font-semibold text-emerald-950">{product.referencePrice}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="w-full rounded-full bg-emerald-950 px-4 py-3 text-sm font-semibold text-amber-100 hover:bg-emerald-900"
          >
            View Details
          </button>
        </div>
      </article>

      {detailsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl"
          >
            <div className="relative h-52 bg-slate-100 sm:h-64">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                aria-label="Close crop details"
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 shadow-md hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5 p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Verified crop listing</p>
                  <h2 id={titleId} className="mt-1 text-2xl font-bold text-emerald-950">
                    {product.name}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-950/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Verified
                </span>
              </div>

              <dl className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Farmer</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{product.farmer}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Farm location</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{product.location}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Available quantity</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{product.quantity}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Asking price</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{product.askingPrice}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">APMC reference price</dt>
                  <dd className="mt-1 font-semibold text-emerald-950">{product.referencePrice}</dd>
                </div>
              </dl>

              <a
                href="/buyer/browse"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-amber-100 hover:bg-emerald-900"
              >
                Browse all produce
              </a>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default function ProductCard({ product }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5">
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xl font-semibold text-emerald-950">{product.name}</p>
            <p className="mt-1 text-sm text-slate-600">{product.farmer}</p>
          </div>
          <span className="rounded-full bg-emerald-950/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-950">
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
        <button className="w-full rounded-full bg-emerald-950 px-4 py-3 text-sm font-semibold text-amber-100 hover:bg-emerald-900">
          View Details
        </button>
      </div>
    </article>
  );
}

export default function MarketPriceCard({ item }) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-emerald-950">{item.name}</p>
          <p className="mt-1 text-sm text-slate-500">{item.market}</p>
        </div>
        <span className="inline-flex rounded-2xl bg-emerald-950/10 px-3 py-1 text-xs font-semibold text-emerald-950">
          Reference
        </span>
      </div>
      <div className="mt-6 flex items-end gap-2">
        <p className="text-4xl font-bold tracking-tight text-slate-950">{item.price}</p>
        <span className="pb-1 text-base font-semibold text-slate-500">{item.unit}</span>
      </div>
      <p className="mt-4 text-sm uppercase tracking-[0.18em] text-emerald-950/70">{item.note}</p>
      <p className="mt-2 text-sm text-slate-500">{item.update}</p>
    </article>
  );
}

import { Plus, TrendingUp } from "lucide-react";

export default function WelcomeHeader({
  name,
  onSellProduce,
  onViewMarketPrices,
}) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="rounded-2xl bg-gradient-to-br from-emerald-950 to-emerald-900 p-8 text-white shadow-lg">
      <div className="mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Good morning, {name} 👋
        </h1>
        <p className="mt-2 text-amber-100/90 max-w-xl">
          Manage your produce, track buyer interest and make informed selling decisions.
        </p>
        <p className="mt-3 text-sm text-amber-100/70">{today}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <button
          onClick={onSellProduce}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition-colors shadow-md"
        >
          <Plus className="h-5 w-5" />
          Sell New Produce
        </button>
        <button
          onClick={onViewMarketPrices}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-emerald-800/50 px-6 py-3 font-semibold text-amber-100 hover:bg-emerald-700/50 transition-colors"
        >
          <TrendingUp className="h-5 w-5" />
          View Market Prices
        </button>
      </div>
    </section>
  );
}

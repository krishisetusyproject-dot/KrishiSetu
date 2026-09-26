import MarketPriceCard from "./MarketPriceCard";
import { marketPrices } from "@/lib/homeData.mjs";

export default function MarketPrices() {
  return (
    <section id="market-prices" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-950/70">
            Know the Market Before You Buy or Sell
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
            See APMC reference prices for better pricing confidence.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            KrishiSetu shows government market data as a reference price to help farmers and buyers make informed decisions.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {marketPrices.map((item) => (
            <MarketPriceCard key={item.name} item={item} />
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-emerald-950/10 bg-emerald-950/5 px-5 py-4 text-center text-sm text-emerald-950/90 sm:px-8">
          Source: Government market data. APMC prices are shown as a reference price only.
        </div>
      </div>
    </section>
  );
}

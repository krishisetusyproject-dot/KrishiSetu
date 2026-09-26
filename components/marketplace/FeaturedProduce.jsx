import ProductCard from "./ProductCard";
import { produceList } from "@/lib/homeData.mjs";

export default function FeaturedProduce() {
  return (
    <section id="produce" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:items-center lg:justify-between lg:flex-row">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-950/70">
              Fresh Produce From Verified Farmers
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              Discover transparent listings from trusted farms.
            </h2>
          </div>
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-amber-100 shadow-sm shadow-emerald-950/15 hover:bg-emerald-900"
          >
            View All Produce
          </a>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {produceList.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

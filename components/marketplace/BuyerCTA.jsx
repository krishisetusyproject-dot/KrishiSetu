export default function BuyerCTA() {
  return (
    <section id="buyer" className="bg-[#edf6ea] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-[2rem] border border-emerald-950/10 bg-white p-8 shadow-sm shadow-slate-900/5 lg:grid-cols-[0.95fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-950/70">Source Directly From Farmers</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              Find fresh produce, compare prices, and connect directly.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Find fresh agricultural produce, compare market reference prices, and connect directly with verified farmers.
            </p>
            <a
              href="#produce"
              className="mt-8 inline-flex rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-amber-100 shadow-sm shadow-emerald-950/15 hover:bg-emerald-900"
            >
              Start Buying
            </a>
          </div>
          <div className="rounded-[1.75rem] overflow-hidden bg-slate-100">
            <img
              src="/icons/fresh_produce.png"
              alt="Buyers and farmers assessing produce in a farm market"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

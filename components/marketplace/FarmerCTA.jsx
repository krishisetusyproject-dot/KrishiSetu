export default function FarmerCTA() {
  return (
    <section id="farmer" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-[2rem] border border-slate-200/80 bg-emerald-950 px-8 py-10 shadow-xl shadow-emerald-950/10 lg:grid-cols-[0.9fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-100/80">Have Produce to Sell?</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-amber-100 sm:text-4xl">
              Cut out the middlemen. Get the price your hard work deserves.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-amber-100/80">
              List your produce, reach verified buyers directly, and see transparent market reference prices. Enjoy higher margins, zero hidden commissions, and fast payments directly to your account.
            </p>
            <a
              href="/login"
              className="mt-8 inline-flex rounded-full bg-amber-100 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-sm shadow-emerald-950/15 hover:bg-slate-100"
            >
              List Your Produce
            </a>
          </div>
          <div className="rounded-[1.75rem] overflow-hidden bg-slate-100">
            <img
              src="/icons/wheat_crop.png"
              alt="Farmer with produce ready to list and sell"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

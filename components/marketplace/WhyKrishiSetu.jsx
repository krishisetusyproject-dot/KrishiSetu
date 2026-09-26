export default function WhyKrishiSetu() {
  const features = [
    {
      title: "Verified Participants",
      text: "Know who you're dealing with through verification for farmers and buyers.",
    },
    {
      title: "Transparent Pricing",
      text: "See market reference prices before making decisions.",
    },
    {
      title: "Direct Connections",
      text: "Connect farmers directly with buyers without intermediaries.",
    },
    {
      title: "Simple Procurement",
      text: "Buyer-arranged pickup keeps the process straightforward.",
    },
  ];

  return (
    <section id="why-krishi" className="bg-[#f4f7eb] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-950/70">
            Why KrishiSetu
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
            Built for transparent farm-to-market relationships.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5">
              <div className="mb-4 h-12 w-12 rounded-3xl bg-emerald-950/10 text-emerald-950" />
              <h3 className="text-lg font-semibold text-emerald-950">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

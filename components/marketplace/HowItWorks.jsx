import { ArrowRightCircle, Crop, Handshake, Leaf, Truck } from "lucide-react";

const sections = [
  {
    title: "Farmers",
    steps: [
      { icon: Leaf, label: "Register" },
      { icon: Crop, label: "List Your Produce" },
      { icon: Handshake, label: "Connect With Buyers" },
      { icon: Truck, label: "Buyer Picks Up" },
    ],
  },
  {
    title: "Buyers",
    steps: [
      { icon: ArrowRightCircle, label: "Browse Produce" },
      { icon: Leaf, label: "Compare Prices" },
      { icon: Handshake, label: "Buy or Make an Offer" },
      { icon: Truck, label: "Arrange Pickup" },
    ],
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#f8faf5] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-950/70">
            How KrishiSetu Works
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
            A simple process for farmers and buyers.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Create your listing or source fresh produce, then complete the transaction with direct pickup arrangements.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {sections.map((group) => (
            <div key={group.title} className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/5">
              <p className="text-lg font-semibold text-emerald-950">{group.title}</p>
              <div className="mt-8 space-y-6">
                {group.steps.map((step, index) => (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-950/10 text-emerald-950">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                      <p className="mt-1 text-sm text-slate-500">Step {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

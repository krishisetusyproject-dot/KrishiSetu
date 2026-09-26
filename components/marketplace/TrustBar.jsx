import { CheckCircle2, Tag, Users, Truck } from "lucide-react";

const points = [
  { icon: CheckCircle2, title: "Verified Farmers", subtitle: "Trusted sellers verified by the platform." },
  { icon: Tag, title: "Transparent Market Prices", subtitle: "Compare asking price with APMC reference." },
  { icon: Users, title: "Direct Farmer–Buyer Connection", subtitle: "Connect without intermediaries." },
  { icon: Truck, title: "Buyer Pickup", subtitle: "Buyers arrange pickup directly from farms." },
];

export default function TrustBar() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 rounded-[2rem] bg-white/90 px-4 py-6 shadow-sm shadow-slate-900/5 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {points.map((point) => {
          const Icon = point.icon;
          return (
            <div key={point.title} className="flex gap-4 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-950 text-amber-100 shadow-sm shadow-emerald-950/10">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-950">{point.title}</p>
                <p className="mt-1 text-sm text-slate-600">{point.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

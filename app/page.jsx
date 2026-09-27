import dynamic from "next/dynamic";
import Navbar from "@/components/marketplace/Navbar";
import Hero from "@/components/marketplace/Hero";
import TrustBar from "@/components/marketplace/TrustBar";

const MarketPrices = dynamic(() => import("@/components/marketplace/MarketPrices"), { loading: () => <div /> });
const HowItWorks = dynamic(() => import("@/components/marketplace/HowItWorks"), { loading: () => <div /> });
const FeaturedProduce = dynamic(() => import("@/components/marketplace/FeaturedProduce"), { loading: () => <div /> });
const BuyerCTA = dynamic(() => import("@/components/marketplace/BuyerCTA"), { loading: () => <div /> });
const FarmerCTA = dynamic(() => import("@/components/marketplace/FarmerCTA"), { loading: () => <div /> });
const WhyKrishiSetu = dynamic(() => import("@/components/marketplace/WhyKrishiSetu"), { loading: () => <div /> });
const Footer = dynamic(() => import("@/components/marketplace/Footer"), { ssr: false });

export default function HomePage() {
  return (
    <main className="bg-[#f8faf5] text-slate-900">
      <Navbar />
      <Hero />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <TrustBar />
      </div>
      <MarketPrices />
      <HowItWorks />
      <FeaturedProduce />
      <BuyerCTA />
      <FarmerCTA />
      <WhyKrishiSetu />
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-950/70">Final Call</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
            Let&apos;s Build a More Transparent Farm-to-Market Journey.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            KrishiSetu brings verified farmers and buyers together with clear pricing and direct pickup coordination.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-emerald-950 px-7 py-3 text-sm font-semibold text-amber-100 shadow-sm shadow-emerald-950/20 hover:bg-emerald-900"
            >
              Sell Your Produce
            </a>
            <a
              href="#produce"
              className="inline-flex items-center justify-center rounded-full border border-emerald-950/15 bg-white px-7 py-3 text-sm font-semibold text-emerald-950 shadow-sm shadow-slate-900/5 hover:bg-slate-50"
            >
              Explore Produce
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

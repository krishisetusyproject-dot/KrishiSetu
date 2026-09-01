import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-[#f3f6ed]">
      <div className="relative mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-[#eef6ea] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <img
            src="/icons/farmer_with_laptop.jpg"
            alt="Farmer using laptop"
            className="h-[620px] w-full object-cover object-center md:h-[700px] lg:h-[760px]"
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45),rgba(255,255,255,0.18)_38%,rgba(19,54,26,0.12))]" />

          <div className="absolute inset-0 flex items-center px-4 sm:px-8 lg:px-12">
            <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="max-w-[700px]">
                <h1 className="text-3xl font-black leading-[0.95] tracking-[-0.06em] text-[#1b120d] sm:text-6xl lg:text-[6.3rem]">
                  From Farm to Buyer,
                  <span className="mt-2 block text-[#f48a3b]">Without the</span>
                  <span className="mt-2 block text-[#1b120d]">Uncertainty.</span>
                </h1>

                <p className="mt-6 max-w-[620px] text-base leading-8 text-[#1e293b] sm:text-xl">
                  KrishiSetu helps farmers find verified buyers and helps buyers source fresh produce directly from farms.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <a
                    href="#produce"
                    className="inline-flex items-center justify-center rounded-full bg-[#112b1c] px-6 py-3 text-base font-semibold text-[#fef7e6] shadow-lg shadow-emerald-950/15 transition hover:bg-[#0d2016]"
                  >
                    Explore Produce
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <a
                    href="http://localhost:3000/register"
                    className="inline-flex items-center justify-center rounded-full border border-[#1a2d24]/10 bg-white/75 px-6 py-3 text-base font-semibold text-[#1b120d] shadow-sm shadow-slate-900/5 backdrop-blur-sm transition hover:bg-white"
                  >
                    Sell Your Produce
                  </a>
                </div>
              </div>

              <div className="hidden lg:block" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

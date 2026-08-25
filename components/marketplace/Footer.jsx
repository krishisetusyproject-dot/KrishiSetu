export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xl font-semibold text-amber-200">KrishiSetu</p>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">
              Connecting farms to markets with trust, transparency, and direct farmer–buyer connections.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Platform</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li><a href="#produce" className="hover:text-white">Explore Produce</a></li>
              <li><a href="#farmer" className="hover:text-white">Sell Produce</a></li>
              <li><a href="#market-prices" className="hover:text-white">Market Prices</a></li>
              <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Company</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li><a href="#why-krishi" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">For Users</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li><a href="/farmer" className="hover:text-white">Farmers</a></li>
              <li><a href="/buyer" className="hover:text-white">Buyers</a></li>
              <li><a href="/admin" className="hover:text-amber-200 text-amber-100/70 font-medium">Admin Portal</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-sm text-slate-500">
          <p>© 2026 KrishiSetu</p>
          <p className="mt-2">Built for a more transparent agricultural marketplace.</p>
        </div>
      </div>
    </footer>
  );
}

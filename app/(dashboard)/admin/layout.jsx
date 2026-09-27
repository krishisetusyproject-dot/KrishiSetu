"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, 
  UserCheck, 
  Store, 
  TrendingUp, 
  ShieldAlert, 
  LogOut, 
  ExternalLink 
} from "lucide-react";

const adminNav = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "KYC Verification", href: "/admin/users", icon: UserCheck },
  { label: "Produce Moderation", href: "/admin/listings", icon: Store },
  { label: "Mandi Rates", href: "/admin/prices", icon: TrendingUp },
  { label: "Disputes & Claims", href: "/admin/disputes", icon: ShieldAlert },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100/70">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
              <BrandLogo
                className="h-8 sm:h-9 w-auto"
                nameClassName="font-bold text-emerald-950 text-base sm:text-lg whitespace-nowrap"
                wrapperClassName="inline-flex items-center gap-2 sm:gap-3 shrink-0"
              />
            </Link>
            <span className="hidden sm:inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200 whitespace-nowrap">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-900 bg-slate-100 px-3 py-1.5 rounded-lg transition shrink-0 whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" /> <span className="hidden sm:inline">View Marketplace</span>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition shrink-0 whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6">
            <nav className="flex space-x-1 py-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition ${
                      isActive
                        ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="mx-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}

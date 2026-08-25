"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { getActiveListings } from "@/lib/services/listings";

export default function BuyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Buyer");
  const [listings, setListings] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadBuyer() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      try {
        const profile = await getUserProfile(supabase, userData.user.id);
        if (!profile || (profile.role !== "buyer" && profile.role !== "admin")) {
          router.replace(profile?.role === "farmer" ? "/farmer" : "/login");
          return;
        }

        setName(profile.full_name || (profile.role === "admin" ? "Admin (Viewing as Buyer)" : "Buyer"));
        const activeListings = await getActiveListings(supabase);
        setListings(activeListings);
      } catch (err) {
        console.error("Error loading buyer profile/listings:", err);
        setErrorMessage("Listings could not be loaded. Please check that the latest database migration is applied.");
      } finally {
        setLoading(false);
      }
    }

    loadBuyer();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f8faf5] text-emerald-950">Loading your account...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f8faf5] px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
          <a href="/" className="text-lg font-bold text-emerald-950">KrishiSetu</a>
          <button type="button" onClick={handleLogout} className="rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-emerald-950">Logout</button>
        </header>
        <section className="mt-10 rounded-[2rem] bg-emerald-950 p-8 text-amber-100 shadow-sm sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100/70">Buyer account</p>
          <h1 className="mt-4 text-3xl font-bold">Welcome, {name}</h1>
          <p className="mt-3 max-w-xl text-amber-100/80">Find produce directly from farmers, compare asking prices, and plan your next procurement.</p>
        </section>
        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">Marketplace</p>
              <h2 className="mt-2 text-2xl font-bold text-emerald-950">Fresh listings</h2>
            </div>
            <span className="text-sm text-slate-500">{listings.length} available</span>
          </div>
          {errorMessage && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</p>}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {listings.map((listing) => (
              <article key={listing.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{listing.category}</p>
                    <h3 className="mt-2 text-xl font-bold text-emerald-950">{listing.title}</h3>
                  </div>
                  <p className="text-lg font-bold text-emerald-950">Rs. {listing.asking_price}<span className="text-xs font-normal text-slate-500"> / {listing.unit}</span></p>
                </div>
                <p className="mt-4 text-sm text-slate-600">{listing.description || "Direct from the farmer."}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                  <span className="rounded-full bg-emerald-50 px-3 py-1">{listing.quantity_available} {listing.unit} available</span>
                  <span className="rounded-full bg-amber-50 px-3 py-1">{listing.quality_grade || "Grade pending"}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{listing.location}</span>
                </div>
                <button type="button" className="mt-5 w-full rounded-xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-amber-100">Make an offer</button>
              </article>
            ))}
          </div>
          {!loading && !errorMessage && listings.length === 0 && <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">No active produce listings yet.</p>}
        </section>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { getActiveListings } from "@/lib/services/listings";
import { createOffer } from "@/lib/services/offers";

export default function BuyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Buyer");
  const [userId, setUserId] = useState(null);
  const [listings, setListings] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Offer Modal State
  const [selectedListing, setSelectedListing] = useState(null);
  const [offerForm, setOfferForm] = useState({ price: "", quantity: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadBuyer() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      setUserId(userData.user.id);

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

  function openOfferModal(listing) {
    setSelectedListing(listing);
    setOfferForm({ price: listing.asking_price, quantity: listing.quantity_available, notes: "" });
  }

  async function submitOffer(e) {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);
    
    try {
      const supabase = createClient();
      await createOffer(supabase, {
        listing_id: selectedListing.id,
        buyer_id: userId,
        offered_price: Number(offerForm.price),
        offered_quantity: Number(offerForm.quantity),
        notes: offerForm.notes
      });
      
      setSuccessMessage("Offer submitted successfully! The farmer will review it soon.");
      setSelectedListing(null);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error submitting offer:", err);
      setErrorMessage("Failed to submit offer. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
        
        {successMessage && (
          <div className="mt-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-900">
            {successMessage}
          </div>
        )}
        
        <section className="mt-6 rounded-[2rem] bg-emerald-950 p-8 text-amber-100 shadow-sm sm:p-12">
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
              <article key={listing.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div>
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
                </div>
                <button type="button" onClick={() => openOfferModal(listing)} className="mt-5 w-full rounded-xl bg-emerald-950 hover:bg-emerald-900 transition-colors px-4 py-3 text-sm font-semibold text-amber-100">Make an offer</button>
              </article>
            ))}
          </div>
          {!loading && !errorMessage && listings.length === 0 && <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">No active produce listings yet.</p>}
        </section>
      </div>

      {/* Offer Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Make an Offer</h3>
              <button onClick={() => setSelectedListing(null)} className="text-slate-500 hover:text-slate-800">✕</button>
            </div>
            <form onSubmit={submitOffer} className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Negotiating for <strong>{selectedListing.title}</strong></p>
                <p className="text-xs text-slate-500">Asking price: ₹{selectedListing.asking_price} / {selectedListing.unit}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Your Price (₹ per {selectedListing.unit})</label>
                <input required type="number" step="0.01" min="1" value={offerForm.price} onChange={e => setOfferForm({...offerForm, price: e.target.value})} className="mt-1 w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Quantity ({selectedListing.unit})</label>
                <input required type="number" step="0.01" max={selectedListing.quantity_available} min="1" value={offerForm.quantity} onChange={e => setOfferForm({...offerForm, quantity: e.target.value})} className="mt-1 w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-emerald-600" />
                <p className="text-xs text-slate-500 mt-1">Max available: {selectedListing.quantity_available} {selectedListing.unit}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Message for Farmer (Optional)</label>
                <textarea rows="2" value={offerForm.notes} onChange={e => setOfferForm({...offerForm, notes: e.target.value})} className="mt-1 w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-emerald-600" placeholder="e.g. I will arrange my own transport."></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelectedListing(null)} className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-colors py-2 text-sm font-semibold text-white disabled:opacity-50">{submitting ? "Sending..." : "Send Offer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
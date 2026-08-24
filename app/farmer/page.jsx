"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { getFarmerListings, createListing } from "@/lib/services/listings";

const initialListing = {
  title: "",
  category: "",
  asking_price: "",
  quantity_available: "",
  unit: "kg",
  quality_grade: "",
  location: "",
  description: "",
};

export default function FarmerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("Farmer");
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState(initialListing);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadFarmer() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      try {
        const profile = await getUserProfile(supabase, userData.user.id);
        if (!profile || profile.role !== "farmer") {
          router.replace(profile?.role === "buyer" ? "/buyer" : "/login");
          return;
        }

        setName(profile.full_name || "Farmer");
        const farmerListings = await getFarmerListings(supabase, userData.user.id);
        setListings(farmerListings);
      } catch (err) {
        console.error("Error loading farmer profile/listings:", err);
        setErrorMessage("Your listings could not be loaded. Please check that the latest database migration is applied.");
      } finally {
        setLoading(false);
      }
    }

    loadFarmer();
  }, [router]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleCreateListing(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const listing = await createListing(supabase, userData.user.id, form);
      setListings((current) => [listing, ...current]);
      setForm(initialListing);
      setSuccessMessage("Your produce listing is now visible to buyers.");
    } catch (error) {
      console.error("Supabase listing error:", error);
      setErrorMessage("We could not publish this listing. Please check your details and database permissions.");
    } finally {
      setSaving(false);
    }
  }

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
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
          <a href="/" className="text-lg font-bold text-emerald-950">KrishiSetu</a>
          <button type="button" onClick={handleLogout} className="rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-emerald-950">Logout</button>
        </header>

        <section className="mt-10 rounded-[2rem] bg-emerald-950 p-8 text-amber-100 shadow-sm sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100/70">Farmer account</p>
          <h1 className="mt-4 text-3xl font-bold">Welcome, {name}</h1>
          <p className="mt-3 max-w-xl text-amber-100/80">Publish your harvest, show a clear price, and connect directly with serious buyers.</p>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">Sell produce</p>
            <h2 className="mt-2 text-2xl font-bold text-emerald-950">Create a listing</h2>
            <form onSubmit={handleCreateListing} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700">Produce name<input required name="title" value={form.title} onChange={updateField} placeholder="e.g. Fresh onions" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700" /></label>
              <label className="block text-sm font-medium text-slate-700">Category<input required name="category" value={form.category} onChange={updateField} placeholder="e.g. Vegetables" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">Price per unit<input required min="0" step="0.01" type="number" name="asking_price" value={form.asking_price} onChange={updateField} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700" /></label>
                <label className="block text-sm font-medium text-slate-700">Available quantity<input required min="0" step="0.01" type="number" name="quantity_available" value={form.quantity_available} onChange={updateField} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700" /></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">Unit<select name="unit" value={form.unit} onChange={updateField} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-700"><option value="kg">kg</option><option value="quintal">quintal</option><option value="tonne">tonne</option></select></label>
                <label className="block text-sm font-medium text-slate-700">Quality grade<input name="quality_grade" value={form.quality_grade} onChange={updateField} placeholder="e.g. A grade" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700" /></label>
              </div>
              <label className="block text-sm font-medium text-slate-700">Pickup location<input required name="location" value={form.location} onChange={updateField} placeholder="Village, district" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700" /></label>
              <label className="block text-sm font-medium text-slate-700">Description<textarea name="description" value={form.description} onChange={updateField} rows="3" placeholder="Harvest details buyers should know" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700" /></label>
              {errorMessage && <p className="text-sm text-red-700">{errorMessage}</p>}
              {successMessage && <p className="text-sm text-emerald-700">{successMessage}</p>}
              <button disabled={saving} className="w-full rounded-xl bg-emerald-950 px-5 py-3.5 font-semibold text-amber-100 disabled:opacity-60">{saving ? "Publishing..." : "Publish listing"}</button>
            </form>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">Your inventory</p>
                <h2 className="mt-2 text-2xl font-bold text-emerald-950">Active listings</h2>
              </div>
              <span className="text-sm text-slate-500">{listings.length} total</span>
            </div>
            <div className="mt-5 space-y-4">
              {listings.map((listing) => (
                <article key={listing.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{listing.category}</p>
                      <h3 className="mt-2 text-xl font-bold text-emerald-950">{listing.title}</h3>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-800">{listing.status}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
                    <span><strong className="block text-emerald-950">Rs. {listing.asking_price}</strong>per {listing.unit}</span>
                    <span><strong className="block text-emerald-950">{listing.quantity_available}</strong>{listing.unit} available</span>
                    <span><strong className="block text-emerald-950">{listing.quality_grade || "Pending"}</strong>quality</span>
                    <span><strong className="block text-emerald-950">{listing.location}</strong>pickup</span>
                  </div>
                </article>
              ))}
              {listings.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">Your published listings will appear here.</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

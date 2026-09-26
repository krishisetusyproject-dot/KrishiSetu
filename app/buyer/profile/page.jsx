"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { ArrowLeft, User } from "lucide-react";

export default function BuyerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      try {
        const userProfile = await getUserProfile(supabase, userData.user.id);
        if (!userProfile || userProfile.role !== "buyer") {
          router.replace(userProfile?.role === "farmer" ? "/farmer" : "/login");
          return;
        }

        setProfile(userProfile);
        setForm({
          full_name: userProfile.full_name || "",
          email: userProfile.email || "",
          phone: userProfile.phone || "",
          village: userProfile.village || "",
          city: userProfile.city || "",
          district: userProfile.district || "",
          state: userProfile.state || "",
          pincode: userProfile.pincode || "",
        });
      } catch (err) {
        console.error("Error loading buyer profile:", err);
        setErrorMessage("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const profileKey = profile?.profile_id ? "profile_id" : "id";
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          village: form.village,
          city: form.city,
          district: form.district,
          state: form.state,
          pincode: form.pincode,
        })
        .eq(profileKey, userData.user.id);

      if (error) throw error;

      setSuccessMessage("Your buyer profile has been updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
      setProfile((current) => ({ ...current, ...form }));
    } catch (err) {
      console.error("Error saving buyer profile:", err);
      setErrorMessage("Failed to save your profile. Please try again.");
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
    return (
      <main className="min-h-screen bg-[#f8faf5]">
        <div className="flex min-h-screen items-center justify-center bg-[#f8faf5] text-slate-700">
          Loading your profile...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf5]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg p-2 transition-colors hover:bg-slate-200"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <h1 className="text-3xl font-bold text-slate-900">Your Buyer Profile</h1>
            </div>
            <p className="text-slate-600">Manage your buyer account details</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-emerald-950"
          >
            Logout
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">{successMessage}</div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-start gap-6 border-b border-slate-200 pb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-950">
              {form.full_name?.[0]?.toUpperCase() || "B"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{form.full_name || "Buyer"}</h2>
              <p className="mt-1 text-sm text-slate-600">Role: Buyer</p>
              <p className="text-sm text-slate-600">Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Recently"}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Personal Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Full Name *</span>
                  <input
                    required
                    type="text"
                    name="full_name"
                    value={form.full_name || ""}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone || ""}
                    onChange={handleChange}
                    placeholder="+91 9999999999"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Address</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Village</span>
                  <input
                    type="text"
                    name="village"
                    value={form.village || ""}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">City</span>
                  <input
                    type="text"
                    name="city"
                    value={form.city || ""}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">District</span>
                  <input
                    type="text"
                    name="district"
                    value={form.district || ""}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">State</span>
                  <input
                    type="text"
                    name="state"
                    value={form.state || ""}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Pincode</span>
                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode || ""}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/buyer")}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

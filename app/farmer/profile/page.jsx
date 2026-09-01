"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import FarmerHeader from "@/components/farmer/FarmerHeader";
import { ArrowLeft, User } from "lucide-react";

export default function ProfilePage() {
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
        if (!userProfile || userProfile.role !== "farmer") {
          router.replace(userProfile?.role === "buyer" ? "/buyer" : "/login");
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
        console.error("Error loading profile:", err);
        setErrorMessage("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      const profileKey = profile.profile_id ? "profile_id" : "id";
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

      setSuccessMessage("Your profile has been updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);

      // Update local profile
      setProfile((current) => ({ ...current, ...form }));
    } catch (err) {
      console.error("Error saving profile:", err);
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
        <FarmerHeader name={profile?.full_name || "Farmer"} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf5]">
      <FarmerHeader name={profile?.full_name || "Farmer"} onLogout={handleLogout} />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => router.back()}
                className="rounded-lg p-2 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
            </div>
            <p className="text-slate-600">
              Manage your farmer profile information
            </p>
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-900">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-900">
            {successMessage}
          </div>
        )}

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Profile Header */}
          <div className="mb-8 flex items-start gap-6 pb-8 border-b border-slate-200">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-950 font-bold text-2xl">
              {form.full_name?.[0]?.toUpperCase() || "F"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{form.full_name || "Farmer"}</h2>
              <p className="text-sm text-slate-600 mt-1">Role: Farmer</p>
              <p className="text-sm text-slate-600">Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Recently"}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Full Name *</span>
                  <input
                    required
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 9999999999"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Address</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Village</span>
                  <input
                    type="text"
                    name="village"
                    value={form.village}
                    onChange={handleChange}
                    placeholder="Your village name"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">City</span>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Nearest city"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">District</span>
                  <input
                    type="text"
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    placeholder="Your district"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">State</span>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Your state"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Pincode</span>
                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">🔒 Account Information</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Your email and phone are securely stored</li>
            <li>• Buyers will see your farm location (village/district) when placing offers</li>
            <li>• Keep your contact information current for better communication</li>
            <li>• Your profile role is: <strong>Farmer</strong></li>
          </ul>
        </div>
      </div>
    </main>
  );
}

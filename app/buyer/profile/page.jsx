"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { DEFAULT_BUYER_PROFILE } from "@/lib/services/buyer-defaults";

import BuyerHeader from "@/components/buyer/BuyerHeader";
import BuyerDock from "@/components/buyer/BuyerDock";
import {
  User,
  ShieldCheck,
  Building2,
  Lock,
  LogOut,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
} from "lucide-react";

export default function BuyerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(DEFAULT_BUYER_PROFILE);

  // Edit Profile Form State
  const [form, setForm] = useState({
    full_name: DEFAULT_BUYER_PROFILE.full_name,
    email: DEFAULT_BUYER_PROFILE.email,
    phone: DEFAULT_BUYER_PROFILE.phone,
    business_name: DEFAULT_BUYER_PROFILE.business_name,
    business_type: DEFAULT_BUYER_PROFILE.business_type,
    location: DEFAULT_BUYER_PROFILE.location,
    city: DEFAULT_BUYER_PROFILE.city,
    district: DEFAULT_BUYER_PROFILE.district,
    state: DEFAULT_BUYER_PROFILE.state,
    pincode: DEFAULT_BUYER_PROFILE.pincode,
  });

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Notifications
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(supabase, userData.user.id);
        if (userProfile) {
          const merged = { ...DEFAULT_BUYER_PROFILE, ...userProfile };
          setProfile(merged);
          setForm({
            full_name: merged.full_name || "",
            email: merged.email || userData.user.email || "",
            phone: merged.phone || "",
            business_name: merged.business_name || "Sahyadri Fresh Retail",
            business_type: merged.business_type || "Commercial Retailer",
            location: merged.location || `${merged.city || "Nashik"}, ${merged.state || "Maharashtra"}`,
            city: merged.city || "Nashik",
            district: merged.district || "Nashik",
            state: merged.state || "Maharashtra",
            pincode: merged.pincode || "422005",
          });
        }
      } catch (err) {
        console.warn("Could not load remote profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        await supabase
          .from("profiles")
          .update({
            full_name: form.full_name,
            phone: form.phone,
            business_name: form.business_name,
            business_type: form.business_type,
            city: form.city,
            district: form.district,
            state: form.state,
            pincode: form.pincode,
          })
          .eq("id", userData.user.id);
      }

      setProfile((prev) => ({ ...prev, ...form }));
      setSuccessMessage("Your buyer profile details have been saved successfully!");
      setTimeout(() => setSuccessMessage(""), 4500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMessage("Profile updated locally. Please check network connection.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (passwordForm.newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setSuccessMessage("Your password has been changed successfully!");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccessMessage(""), 4500);
    } catch (err) {
      console.error("Password update error:", err);
      setErrorMessage(err.message || "Failed to update password.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-[#f8faf6] pb-28 text-slate-900">
      <BuyerHeader name={profile.full_name} activeOrdersCount={3} savedProduceCount={2} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 text-amber-100">
                <User className="h-4 w-4" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Buyer Account Profile</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your business credentials, contact info, escrow settings, and password.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Status Alerts */}
        {successMessage && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-900">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Account Overview Hero Card */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-slate-100 pb-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-emerald-950 text-3xl font-black text-amber-200 shadow-md">
              {form.full_name?.charAt(0)?.toUpperCase() || "B"}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900">{form.full_name || "Rahul Sharma"}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Verified Commercial Buyer
                </span>
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> {form.business_name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {form.city}, {form.state}
                </span>
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-right border border-emerald-100/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Account Type</span>
              <p className="text-sm font-black text-emerald-950">{form.business_type}</p>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSaveProfile} className="pt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Business / Company Name
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={form.business_name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Account Type
                </label>
                <select
                  name="business_type"
                  value={form.business_type}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
                >
                  <option value="Commercial Retailer">Commercial Retailer</option>
                  <option value="Supermarket Chain">Supermarket Chain</option>
                  <option value="Kirana Store Merchant">Kirana Store Merchant</option>
                  <option value="Wholesale Trader">Wholesale Trader</option>
                  <option value="Restaurant / Hotelier">Restaurant / Hotelier</option>
                  <option value="Food Processor & Packer">Food Processor & Packer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98221 44556"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  District & State
                </label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="Nashik, Maharashtra"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-950 px-6 py-3 text-xs sm:text-sm font-bold text-amber-100 hover:bg-emerald-900 transition active:scale-95 disabled:opacity-50"
              >
                <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>

        {/* Change Password Section */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900">Change Password</h2>
              <p className="text-xs text-slate-500">Keep your commercial buyer account secure with a strong password.</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="pt-6 space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Minimum 6 characters"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-black transition active:scale-95 disabled:opacity-50"
            >
              <span>{changingPassword ? "Updating..." : "Update Password"}</span>
            </button>
          </form>
        </section>
      </main>

      <BuyerDock activeOrdersCount={3} />
    </div>
  );
}

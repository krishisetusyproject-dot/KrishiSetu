"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  village: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
};

const fields = [
  ["fullName", "Full Name *", "text"],
  ["email", "Email Address *", "email"],
  ["phone", "Phone Number *", "tel"],
  ["password", "Password (min 6 characters) *", "password"],
  ["confirmPassword", "Confirm Password *", "password"],
  ["village", "Village / Street Address", "text"],
  ["city", "City *", "text"],
  ["district", "District *", "text"],
  ["state", "State *", "text"],
  ["pincode", "Pincode *", "text"],
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [selectedRole, setSelectedRole] = useState("farmer"); // default to farmer so form is visible
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!selectedRole) {
      setErrorMessage("Please select Farmer or Buyer before continuing.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { password, confirmPassword, fullName, ...profileFields } = form;
    let data;
    let error;

    try {
      ({ data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            ...profileFields,
            full_name: fullName,
            role: selectedRole,
          },
        },
      }));
    } catch (requestError) {
      console.error("Supabase sign-up request error:", requestError);
      setErrorMessage("Unable to connect to database. Check your internet connection.");
      setLoading(false);
      return;
    }

    if (error) {
      console.error("Supabase sign-up error:", error);
      const msg = error.message.toLowerCase();
      setErrorMessage(
        msg.includes("already registered") || msg.includes("already been registered")
          ? "This email is already registered. Please sign in instead."
          : error.message
      );
      setLoading(false);
      return;
    }

    if (data.session && data.user) {
      try {
        await supabase.from("profiles").upsert({
          profile_id: data.user.id,
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          role: selectedRole,
          village: form.village,
          city: form.city,
          district: form.district,
          state: form.state,
          pincode: form.pincode,
        });
      } catch (profileError) {
        console.warn("Profile save warning:", profileError);
      }

      router.replace(selectedRole === "farmer" ? "/farmer" : "/buyer");
      return;
    }

    setMessage("Account created successfully! Check your email to verify or proceed to sign in.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f8faf5] px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" aria-label="KrishiSetu home" className="inline-flex">
          <BrandLogo className="h-10 w-auto" nameClassName="text-lg font-semibold text-emerald-950" />
        </Link>

        <div className="mt-8 rounded-[2.5rem] border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">Join KrishiSetu</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Connect directly with verified agricultural partners and trade with 100% price transparency.
          </p>

          {/* Role Selection: Exactly 2 Roles (Farmer & Buyer) - No Admin */}
          <div className="mt-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Select Your Role / तुमची भूमिका निवडा
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Farmer Option */}
              <button
                type="button"
                onClick={() => setSelectedRole("farmer")}
                className={`relative flex items-start gap-4 rounded-3xl border-2 p-5 text-left transition-all duration-150 active:scale-[0.98] ${
                  selectedRole === "farmer"
                    ? "border-emerald-800 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-800/10"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/50"
                }`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xs text-2xl border border-slate-200/80">
                  👨‍🌾
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-emerald-950">I'm a Farmer</span>
                    {selectedRole === "farmer" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800 text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                    List and sell your harvested produce directly to verified commercial buyers.
                  </span>
                </div>
              </button>

              {/* Buyer Option */}
              <button
                type="button"
                onClick={() => setSelectedRole("buyer")}
                className={`relative flex items-start gap-4 rounded-3xl border-2 p-5 text-left transition-all duration-150 active:scale-[0.98] ${
                  selectedRole === "buyer"
                    ? "border-emerald-800 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-800/10"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/50"
                }`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xs text-2xl border border-slate-200/80">
                  🛒
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-emerald-950">I'm a Buyer</span>
                    {selectedRole === "buyer" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800 text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                    Find fresh harvest directly from farms with APMC modal price benchmarks.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="mt-8 pt-6 border-t border-slate-100 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2 flex items-center justify-between pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Registering as:{" "}
                <span className="text-emerald-900 font-extrabold capitalize">
                  {selectedRole === "farmer" ? "👨‍🌾 Farmer" : "🛒 Commercial Buyer"}
                </span>
              </span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% Free & Secure
              </span>
            </div>

            {fields.map(([name, label, type]) => (
              <label key={name} className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {label}
                <input
                  required
                  minLength={name === "password" ? 6 : undefined}
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={updateField}
                  placeholder={`Enter your ${label.replace(/[*()]/g, "").trim().toLowerCase()}`}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none focus:bg-white focus:border-emerald-700 transition"
                />
              </label>
            ))}

            {errorMessage && (
              <div className="sm:col-span-2 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-bold text-rose-800">
                {errorMessage}
              </div>
            )}

            {message && (
              <div className="sm:col-span-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-900">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-950 px-5 py-4 text-sm font-bold text-amber-100 shadow-md hover:bg-emerald-900 active:scale-[0.99] transition disabled:opacity-60"
            >
              <span>
                {loading
                  ? "Creating account..."
                  : `Create ${selectedRole === "farmer" ? "Farmer" : "Buyer"} Account`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-xs sm:text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-emerald-950 underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
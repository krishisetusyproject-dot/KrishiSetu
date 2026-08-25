"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  ["fullName", "Full Name", "text"],
  ["email", "Email", "email"],
  ["phone", "Phone Number", "tel"],
  ["password", "Password", "password"],
  ["confirmPassword", "Confirm Password", "password"],
  ["village", "Village / Area", "text"],
  ["city", "City", "text"],
  ["district", "District", "text"],
  ["state", "State", "text"],
  ["pincode", "Pincode", "text"],
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [selectedRole, setSelectedRole] = useState(null);
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
      setErrorMessage("Unable to connect to Supabase. Check your internet connection and try again.");
      setLoading(false);
      return;
    }

    if (error) {
      console.error("Supabase sign-up error:", error);
      const message = error.message.toLowerCase();
      const detail = [error.message, error.code, error.hint].filter(Boolean).join(" ");
      setErrorMessage(
        message.includes("already registered") || message.includes("already been registered")
          ? "This email is already registered. Please sign in instead."
          : message.includes("password")
            ? "Your password must be at least 6 characters long."
            : message.includes("database error saving new user")
              ? "Supabase could not save the new user. Run supabase/migrations/farmer_auth.sql in your Supabase SQL Editor."
              : detail
      );
      setLoading(false);
      return;
    }

    if (data.session && data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
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

      if (profileError) {
        console.error("Supabase profile error:", profileError);
        setErrorMessage("Your account was created, but the profile could not be saved. Run supabase/migrations/farmer_auth.sql in your Supabase SQL Editor, then sign in again.");
        setLoading(false);
        return;
      }

      router.replace(
        selectedRole === "admin" ? "/admin" : selectedRole === "farmer" ? "/farmer" : "/buyer"
      );
      return;
    }

    setMessage("Account created successfully. Please check your email to verify your account.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f8faf5] px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm font-semibold text-emerald-950">KrishiSetu</a>
        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold text-emerald-950">Join KrishiSetu</h1>
          <p className="mt-2 max-w-xl text-slate-600">Connect directly with buyers and sell your agricultural produce with greater transparency.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[{
              role: "farmer", icon: "👨‍🌾", title: "I'm a Farmer", description: "List and sell your produce directly to buyers.",
            }, {
              role: "buyer", icon: "🛒", title: "I'm a Buyer", description: "Find fresh produce directly from farmers.",
            }, {
              role: "admin", icon: "🛡️", title: "I'm an Admin", description: "Manage platform listings, verify users, and monitor MSP rates.",
            }].map((option) => (
              <button
                key={option.role}
                type="button"
                onClick={() => setSelectedRole(option.role)}
                className={`rounded-2xl border p-5 text-left ${selectedRole === option.role ? "border-emerald-800 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"}`}
              >
                <span className="text-3xl" aria-hidden="true">{option.icon}</span>
                <span className="mt-3 block font-bold text-emerald-950">{option.title}</span>
                <span className="mt-1 block text-sm text-slate-600">{option.description}</span>
              </button>
            ))}
          </div>

          {selectedRole && (
            <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
              {fields.map(([name, label, type]) => (
                <label key={name} className="text-sm font-medium text-slate-700">
                  {label}
                  <input required minLength={name === "password" ? 6 : undefined} name={name} type={type} value={form[name]} onChange={updateField} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700" />
                </label>
              ))}
              {errorMessage && <p className="sm:col-span-2 text-sm text-red-700">{errorMessage}</p>}
              {message && <p className="sm:col-span-2 text-sm text-emerald-800">{message}</p>}
              <button disabled={loading} className="sm:col-span-2 rounded-xl bg-emerald-950 px-5 py-3.5 font-semibold text-amber-100 disabled:opacity-60">
                {loading ? "Creating account..." : `Create ${selectedRole === "admin" ? "Admin" : selectedRole === "farmer" ? "Farmer" : "Buyer"} Account`}
              </button>
            </form>
          )}

          <p className="mt-8 text-sm text-slate-600">Already have an account? <a href="/login" className="font-semibold text-emerald-900">Sign In</a></p>
        </div>
      </div>
    </main>
  );
}
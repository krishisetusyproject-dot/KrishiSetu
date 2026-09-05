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

export default function BuyerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!form.fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Please enter your email address.");
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

    const supabase = createClient();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            phone: form.phone.trim(),
            role: "buyer",
            village: form.village.trim(),
            city: form.city.trim(),
            district: form.district.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          },
        },
      });

      if (error) {
        const errorText = error.message.toLowerCase();
        console.error("Supabase buyer sign-up error:", error);

        if (
          errorText.includes("already registered") ||
          errorText.includes("already been registered")
        ) {
          setErrorMessage("This email is already registered. Please sign in instead.");
        } else if (errorText.includes("password")) {
          setErrorMessage("Your password must be at least 6 characters long.");
        } else if (errorText.includes("database error saving new user")) {
          setErrorMessage("Supabase could not create your account. Please check the profiles table and RLS setup.");
        } else {
          setErrorMessage(error.message);
        }

        setLoading(false);
        return;
      }

      if (data?.session && data?.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          profile_id: data.user.id,
          full_name: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: "buyer",
          village: form.village.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        });

        if (profileError) {
          console.error("Supabase buyer profile error:", profileError);
          setErrorMessage("Your account was created, but the profile could not be saved. Please check your Supabase profiles table and policies.");
          setLoading(false);
          return;
        }

        router.replace("/buyer");
        return;
      }

      setMessage("Buyer account created successfully. Please check your email to verify your account.");
      setLoading(false);
    } catch (requestError) {
      console.error("Unexpected buyer registration error:", requestError);
      setErrorMessage("Unable to connect to Supabase. Please check your internet connection and try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8f3] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center rounded-full bg-[#003f32] px-4 py-2 text-sm font-medium text-white">
            KrishiSetu
          </div>

          <h1 className="text-3xl font-bold text-[#12372a] sm:text-4xl">Create Your Buyer Account</h1>
          <p className="mt-3 text-gray-600">Connect with farmers and source fresh produce directly.</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-8 rounded-2xl bg-[#eef7f1] p-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#087f5b]">Buyer Account</p>
            <h2 className="mt-1 text-xl font-bold text-[#12372a]">Join KrishiSetu as a Buyer</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Discover fresh produce from farmers, make offers, manage orders, and arrange direct pickup.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {fields.map(([name, label, type]) => (
                <div key={name}>
                  <label htmlFor={name} className="mb-2 block text-sm font-semibold text-[#183b2e]">
                    {label}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={updateField}
                    required
                    autoComplete={
                      name === "password"
                        ? "new-password"
                        : name === "confirmPassword"
                          ? "new-password"
                          : name === "email"
                            ? "email"
                            : "on"
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-[#087f5b] focus:ring-2 focus:ring-[#087f5b]/10"
                    placeholder={
                      name === "fullName"
                        ? "Enter your full name"
                        : name === "email"
                          ? "Enter your email"
                          : name === "phone"
                            ? "Enter phone number"
                            : name === "village"
                              ? "Enter village / area"
                              : name === "city"
                                ? "Enter city"
                                : name === "district"
                                  ? "Enter district"
                                  : name === "state"
                                    ? "Enter state"
                                    : name === "pincode"
                                      ? "Enter pincode"
                                      : ""
                    }
                  />
                </div>
              ))}
            </div>

            {errorMessage && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {message && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-[#003f32] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#005743] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Buyer Account..." : "Create Buyer Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button type="button" onClick={() => router.push("/login")} className="font-semibold text-[#087f5b] hover:underline">
              Sign In
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            Want to sell your produce instead?{" "}
            <button type="button" onClick={() => router.push("/register")} className="font-semibold text-[#087f5b] hover:underline">
              Register as Farmer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
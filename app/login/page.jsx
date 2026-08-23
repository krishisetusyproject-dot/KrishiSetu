"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Please enter the password you used when creating your account.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    let data;
    let error;

    try {
      ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
    } catch (requestError) {
      console.error("Supabase sign-in request error:", requestError);
      setErrorMessage("Unable to connect to Supabase. Check your internet connection and try again.");
      setLoading(false);
      return;
    }

    if (error || !data.user) {
      console.error("Supabase sign-in error:", error);
      const message = error?.message?.toLowerCase() || "";
      setErrorMessage(
        message.includes("email not confirmed")
          ? "Please verify your email before signing in."
          : "Incorrect email or password. Please check your details and try again."
      );
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("profile_id", data.user.id)
      .single();

    if (profileError || !profile?.role) {
      const metadata = data.user.user_metadata || {};
      const role = metadata.role === "buyer" ? "buyer" : "farmer";
      const { error: createProfileError } = await supabase.from("profiles").upsert({
        profile_id: data.user.id,
        full_name: metadata.full_name || "KrishiSetu user",
        email: data.user.email,
        phone: metadata.phone || null,
        role,
        village: metadata.village || null,
        city: metadata.city || null,
        district: metadata.district || null,
        state: metadata.state || null,
        pincode: metadata.pincode || null,
      });

      if (createProfileError) {
        console.error("Supabase profile lookup and creation error:", profileError, createProfileError);
        setErrorMessage(`Profile setup failed: ${createProfileError.message}`);
        setLoading(false);
        return;
      }

      router.replace(role === "farmer" ? "/farmer" : "/buyer");
      return;
    }

    router.replace(profile.role === "farmer" ? "/farmer" : "/buyer");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8faf5] px-4 py-10 text-slate-900">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <a href="/" className="text-sm font-semibold text-emerald-950">KrishiSetu</a>
        <h1 className="mt-8 text-3xl font-bold text-emerald-950">Welcome back</h1>
        <p className="mt-2 text-slate-600">Sign in to manage your KrishiSetu account.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-slate-700">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700" /></label>
          <label className="block text-sm font-medium text-slate-700">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700" /></label>
          {errorMessage && <p className="text-sm text-red-700">{errorMessage}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-emerald-950 px-5 py-3.5 font-semibold text-amber-100 disabled:opacity-60">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
        <p className="mt-8 text-sm text-slate-600">New to KrishiSetu? <a href="/register" className="font-semibold text-emerald-900">Create an account</a></p>
      </div>
    </main>
  );
}
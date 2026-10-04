"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("profile_id", user.id)
            .maybeSingle();
          const role = profile?.role || user.user_metadata?.role || "user";
          setCurrentSession({
            email: user.email,
            role,
            dashboardUrl: role === "admin" ? "/admin" : role === "farmer" ? "/farmer" : "/buyer",
          });
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    }
    checkExistingSession();
  }, []);

  async function handleLogoutExisting() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentSession(null);
  }

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

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("profile_id", data.user.id)
        .maybeSingle();
      if (profileError) {
        console.warn("Could not read profile role after sign-in:", profileError);
      }

      let role = profile?.role;

      if (!role) {
        const metadata = data.user.user_metadata || {};
        role = ["admin", "farmer", "buyer"].includes(metadata.role)
          ? metadata.role
          : null;

        if (!role) {
          throw new Error(profileError?.message || "Your account role is missing or invalid. Please contact support.");
        }

        if (!profileError) {
          const { error: upsertError } = await supabase.from("profiles").upsert({
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
          if (upsertError) console.warn("Could not create missing profile row:", upsertError);
        }
      }

      router.replace(role === "admin" ? "/admin" : role === "farmer" ? "/farmer" : "/buyer");
    } catch (profileErr) {
      console.error("Profile resolution error:", profileErr);
      setErrorMessage(profileErr?.message || "Your account is signed in, but its role could not be verified. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8faf5] px-4 py-10 text-slate-900">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <a href="/" aria-label="KrishiSetu home" className="inline-flex">
          <BrandLogo className="h-10 w-auto" nameClassName="text-lg font-semibold text-emerald-950" />
        </a>
        <h1 className="mt-8 text-3xl font-bold text-emerald-950">Welcome back</h1>
        <p className="mt-2 text-slate-600">Sign in to manage your KrishiSetu account.</p>

        {currentSession && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-slate-700 space-y-2">
            <p className="font-medium text-emerald-950">
              Active Session: <strong className="capitalize">{currentSession.role}</strong> ({currentSession.email})
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => router.push(currentSession.dashboardUrl)}
                className="flex-1 rounded-lg bg-emerald-950 px-3 py-2 font-semibold text-amber-100"
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={handleLogoutExisting}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Switch Account
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700"
            />
          </label>
          {errorMessage && <p className="text-sm text-red-700">{errorMessage}</p>}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-emerald-950 px-5 py-3.5 font-semibold text-amber-100 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-sm text-slate-600">
          New to KrishiSetu? <a href="/register" className="font-semibold text-emerald-900">Create an account</a>
        </p>
      </div>
    </main>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { DEFAULT_FARMER_PROFILE } from "@/lib/services/farmer-defaults";
import FarmerHeader from "@/components/farmer/FarmerHeader";
import LogisticsHub from "@/components/common/LogisticsHub";

export default function FarmerLogisticsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(DEFAULT_FARMER_PROFILE);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const p = await getUserProfile(supabase, user.id);
      if (p) setProfile(p);
    }
    loadUser();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-[#f8faf6]">
      <FarmerHeader
        name={profile.full_name}
        onLogout={handleLogout}
        notificationCount={2}
        activeListingsCount={0}
      />
      <main>
        <LogisticsHub userRole="farmer" />
      </main>
    </div>
  );
}

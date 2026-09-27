"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/services/profiles";
import { DEFAULT_BUYER_PROFILE } from "@/lib/services/buyer-defaults";
import BuyerHeader from "@/components/buyer/BuyerHeader";
import LogisticsHub from "@/components/common/LogisticsHub";

export default function BuyerLogisticsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(DEFAULT_BUYER_PROFILE);

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
      <BuyerHeader
        name={profile.full_name}
        onLogout={handleLogout}
        unreadNotificationsCount={2}
        savedProduceCount={2}
        activeOrdersCount={3}
      />
      <main>
        <LogisticsHub userRole="buyer" />
      </main>
    </div>
  );
}

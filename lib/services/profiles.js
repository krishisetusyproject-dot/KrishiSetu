/**
 * Service Layer for User Profiles & KYC Verification
 */

export async function getUserProfile(supabase, userId) {
  const profileFields = "id, profile_id, full_name, role, phone, email, village, city, district, state, pincode, verification_status, rejection_reason";
  const profileIdQuery = await supabase
    .from("profiles")
    .select(profileFields)
    .eq("profile_id", userId)
    .maybeSingle();

  if (!profileIdQuery.error && profileIdQuery.data) return profileIdQuery.data;

  // Older installations use profiles.id as the auth user key.
  const idQuery = await supabase
    .from("profiles")
    .select(profileFields)
    .eq("id", userId)
    .maybeSingle();

  if (!idQuery.error) return idQuery.data;

  // profile_id was added later; keep the service usable before that migration.
  const legacyQuery = await supabase
    .from("profiles")
    .select("id, full_name, role, phone, email, village, city, district, state, pincode, verification_status, rejection_reason")
    .eq("id", userId)
    .maybeSingle();

  if (legacyQuery.error) throw legacyQuery.error;
  return legacyQuery.data;
}

export async function getAllProfilesForAdmin(supabase) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateVerificationStatus(supabase, userId, status, reason = null) {
  const updateData = {
    verification_status: status,
    ...(reason !== null ? { rejection_reason: reason } : {}),
  };

  const profileIdUpdate = await supabase
    .from("profiles")
    .update(updateData)
    .eq("profile_id", userId)
    .select();

  if (!profileIdUpdate.error && profileIdUpdate.data?.length) return profileIdUpdate.data;

  const idUpdate = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select();

  if (idUpdate.error) throw idUpdate.error;
  return idUpdate.data;
}

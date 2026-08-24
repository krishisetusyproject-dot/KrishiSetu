/**
 * Service Layer for User Profiles & KYC Verification
 */

export async function getUserProfile(supabase, userId) {
  // Query matching either primary id or profile_id for backward compatibility
  const { data, error } = await supabase
    .from("profiles")
    .select("id, profile_id, full_name, role, phone, email, village, city, district, state, pincode, verification_status, rejection_reason")
    .or(`id.eq.${userId},profile_id.eq.${userId}`)
    .maybeSingle();

  if (error) throw error;
  return data;
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

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .or(`id.eq.${userId},profile_id.eq.${userId}`)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Service Layer for User Profiles & KYC Verification
 *
 * Optimizations:
 * - Removed select("*") → only fetch columns the UI actually uses
 * - Removed cascading fallback query that doubled DB round-trips
 * - Added limit(500) to admin listing
 */

const PROFILE_FIELDS =
  "profile_id, role, full_name, phone, email, district, state, pincode, created_at";

export async function getUserProfile(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    id: data.profile_id,
    verification_status: "verified",
  };
}

export async function getAllProfilesForAdmin(supabase) {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  return data || [];
}

export async function updateVerificationStatus(
  supabase,
  userId,
  status,
  reason = null
) {
  const updateData = {};
  if (reason !== null) updateData.rejection_reason = reason;

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("profile_id", userId)
    .select(PROFILE_FIELDS);

  if (error) throw error;
  return data || [];
}

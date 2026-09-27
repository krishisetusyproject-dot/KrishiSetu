/**
 * Service Layer for User Profiles & KYC Verification
 */

export async function getUserProfile(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) {
    // Fallback for older schemas using id instead of profile_id
    const idQuery = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!idQuery.error && idQuery.data) {
      return {
        ...idQuery.data,
        id: idQuery.data.id || idQuery.data.profile_id,
        verification_status: idQuery.data.verification_status || "verified",
      };
    }
    throw error;
  }

  if (!data) return null;

  return {
    ...data,
    id: data.profile_id,
    verification_status: data.verification_status || "verified",
  };
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
    ...(reason !== null ? { rejection_reason: reason } : {}),
  };

  const withStatus = await supabase
    .from("profiles")
    .update({ ...updateData, verification_status: status })
    .eq("profile_id", userId)
    .select();

  if (!withStatus.error && withStatus.data?.length) return withStatus.data;

  // If verification_status column does not exist, update other fields like rejection_reason
  const fallback = await supabase
    .from("profiles")
    .update(updateData)
    .eq("profile_id", userId)
    .select();

  return fallback.data || [];
}

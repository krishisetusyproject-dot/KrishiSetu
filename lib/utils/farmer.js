/**
 * Utility helper to dynamically resolve a farmer's display name and location
 * from their Supabase profile and Auth user object.
 */
export function getFarmerDisplayName(profile, user) {
  if (profile?.full_name && profile.full_name.trim().length > 0) {
    return profile.full_name.trim();
  }
  if (user?.user_metadata?.full_name && user.user_metadata.full_name.trim().length > 0) {
    return user.user_metadata.full_name.trim();
  }
  if (user?.user_metadata?.name && user.user_metadata.name.trim().length > 0) {
    return user.user_metadata.name.trim();
  }
  if (user?.email) {
    const localPart = user.email.split("@")[0];
    const words = localPart
      .replace(/[._0-9-]/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length > 0) {
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
    return localPart;
  }
  return "Farmer";
}

export function getFarmerLocation(profile) {
  const parts = [profile?.village, profile?.district, profile?.state].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(", ");
  }
  return "Maharashtra, India";
}

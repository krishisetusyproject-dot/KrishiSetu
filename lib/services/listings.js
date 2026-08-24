/**
 * Service Layer for Listings / Produce Management
 */

export async function getActiveListings(supabase) {
  const { data, error } = await supabase
    .from("listings")
    .select("id, farmer_id, title, category, asking_price, quantity_available, unit, quality_grade, location, description, created_at, status")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getFarmerListings(supabase, farmerId) {
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, category, asking_price, quantity_available, unit, quality_grade, location, description, status, created_at")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createListing(supabase, farmerId, listingData) {
  const { data, error } = await supabase
    .from("listings")
    .insert({
      farmer_id: farmerId,
      title: listingData.title,
      category: listingData.category,
      asking_price: Number(listingData.asking_price),
      quantity_available: Number(listingData.quantity_available),
      unit: listingData.unit || "kg",
      quality_grade: listingData.quality_grade || null,
      location: listingData.location,
      description: listingData.description || null,
    })
    .select("id, title, category, asking_price, quantity_available, unit, quality_grade, location, description, status")
    .single();

  if (error) throw error;
  return data;
}

export async function getAllListingsForAdmin(supabase) {
  const { data, error } = await supabase
    .from("listings")
    .select("id, farmer_id, title, category, asking_price, quantity_available, unit, quality_grade, location, description, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

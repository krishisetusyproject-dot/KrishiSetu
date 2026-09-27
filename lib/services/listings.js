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
  const listingsQuery = await supabase
    .from("listings")
    .select("id, title, category, asking_price, quantity_available, unit, quality_grade, location, description, status, created_at")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (!listingsQuery.error) return listingsQuery.data || [];

  // Some deployments use the canonical produce table instead of legacy listings.
  const produceQuery = await supabase
    .from("produce")
    .select("produce_id, crop_name, crop_variety, asking_price, quantity, unit, quality_grade, location, description, status, created_at")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (!produceQuery.error) {
    return (produceQuery.data || []).map((produce) => ({
      id: produce.produce_id,
      title: produce.crop_name,
      category: produce.crop_variety,
      asking_price: produce.asking_price,
      quantity_available: produce.quantity,
      unit: produce.unit,
      quality_grade: produce.quality_grade,
      location: produce.location,
      description: produce.description,
      status: produce.status,
      created_at: produce.created_at,
    }));
  }

  const compatibilityQuery = await supabase
    .from("produce")
    .select("id, title, category, asking_price, quantity_available, unit, quality_grade, location, description, status, created_at")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (compatibilityQuery.error) throw listingsQuery.error;
  return compatibilityQuery.data || [];
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

export async function updateListingStatus(supabase, listingId, status) {
  const { data, error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", listingId)
    .select()
    .single();

  if (error) {
    // Attempt fallback for produce table if listings table errors
    const produceUpdate = await supabase
      .from("produce")
      .update({ status })
      .eq("produce_id", listingId)
      .select()
      .single();
    if (!produceUpdate.error) return produceUpdate.data;
    throw error;
  }
  return data;
}

export async function updateListing(supabase, listingId, updates) {
  const { data, error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", listingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteListing(supabase, listingId) {
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId);

  if (error) {
    const produceDelete = await supabase
      .from("produce")
      .delete()
      .eq("produce_id", listingId);
    if (!produceDelete.error) return true;
    throw error;
  }
  return true;
}

export async function getAllListingsForAdmin(supabase) {
  const { data, error } = await supabase
    .from("listings")
    .select("id, farmer_id, title, category, asking_price, quantity_available, unit, quality_grade, location, description, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

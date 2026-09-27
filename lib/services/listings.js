/**
 * Service Layer for Listings / Produce Management
 */

export async function getActiveListings(supabase) {
  const { data, error } = await supabase
    .from("produce")
    .select("produce_id, farmer_id, crop_name, crop_variety, asking_price, quantity, unit, quality_grade, location, description, created_at, status")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(p => ({
    id: p.produce_id,
    farmer_id: p.farmer_id,
    title: p.crop_name,
    category: p.crop_variety,
    asking_price: p.asking_price,
    quantity_available: p.quantity,
    unit: p.unit,
    quality_grade: p.quality_grade,
    location: p.location,
    description: p.description,
    created_at: p.created_at,
    status: p.status
  }));
}

export async function getFarmerListings(supabase, farmerId) {
  const { data, error } = await supabase
    .from("produce")
    .select("produce_id, crop_name, crop_variety, asking_price, quantity, unit, quality_grade, location, description, status, created_at")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  return (data || []).map((p) => ({
    id: p.produce_id,
    title: p.crop_name,
    category: p.crop_variety,
    asking_price: p.asking_price,
    quantity_available: p.quantity,
    unit: p.unit,
    quality_grade: p.quality_grade,
    location: p.location,
    description: p.description,
    status: p.status,
    created_at: p.created_at,
  }));
}

export async function createListing(supabase, farmerId, listingData) {
  const { data, error } = await supabase
    .from("produce")
    .insert({
      farmer_id: farmerId,
      crop_name: listingData.title,
      crop_variety: listingData.category,
      asking_price: Number(listingData.asking_price),
      quantity: Number(listingData.quantity_available),
      unit: listingData.unit || "kg",
      quality_grade: listingData.quality_grade || null,
      location: listingData.location,
      description: listingData.description || null,
    })
    .select("produce_id, crop_name, crop_variety, asking_price, quantity, unit, quality_grade, location, description, status")
    .single();

  if (error) throw error;
  return {
    id: data.produce_id,
    title: data.crop_name,
    category: data.crop_variety,
    asking_price: data.asking_price,
    quantity_available: data.quantity,
    unit: data.unit,
    quality_grade: data.quality_grade,
    location: data.location,
    description: data.description,
    status: data.status
  };
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
    .from("produce")
    .select("produce_id, farmer_id, crop_name, crop_variety, asking_price, quantity, unit, quality_grade, location, description, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(p => ({
    id: p.produce_id,
    farmer_id: p.farmer_id,
    title: p.crop_name,
    category: p.crop_variety,
    asking_price: p.asking_price,
    quantity_available: p.quantity,
    unit: p.unit,
    quality_grade: p.quality_grade,
    location: p.location,
    description: p.description,
    status: p.status,
    created_at: p.created_at,
  }));
}

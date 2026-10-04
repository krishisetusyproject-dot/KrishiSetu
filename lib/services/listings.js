/**
 * Service Layer for Listings / Produce Management
 */

export async function getActiveListings(supabase) {
  const { data, error } = await supabase
    .from("produce")
    .select("produce_id, farmer_id, crop_name, crop_variety, asking_price, quantity, unit, location, description, image_url, created_at, status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(100);



  console.log("DATA:", data);
  console.log("ERROR:", error);
 
  if (error) throw error;
  const listings = (data || []).map(p => ({
    id: p.produce_id,
    farmer_id: p.farmer_id,
    title: p.crop_name,
    category: p.crop_variety,
    asking_price: p.asking_price,
    quantity_available: p.quantity,
    unit: p.unit,
    quality_grade: null,
    location: p.location,
    description: p.description,
    imageUrl: p.image_url,
    created_at: p.created_at,
    status: p.status
  }));

  const uniqueListings = new Map();
  for (const listing of listings) {
    const duplicateKey = JSON.stringify([
      listing.farmer_id,
      listing.title?.trim().toLowerCase(),
      listing.category?.trim().toLowerCase(),
      Number(listing.asking_price),
      Number(listing.quantity_available),
      listing.unit?.trim().toLowerCase(),
      listing.location?.trim().toLowerCase(),
    ]);
    const existing = uniqueListings.get(duplicateKey);

    if (!existing || (!existing.imageUrl && listing.imageUrl)) {
      uniqueListings.set(duplicateKey, listing);
    }
  }

  return [...uniqueListings.values()];
}

export async function getFarmerListings(supabase, farmerId) {
  const { data, error } = await supabase
    .from("produce")
    .select("produce_id, crop_name, crop_variety, asking_price, quantity, unit, location, description, image_url, status, created_at")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  
  return (data || []).map((p) => ({
    id: p.produce_id,
    title: p.crop_name,
    category: p.crop_variety,
    asking_price: p.asking_price,
    quantity_available: p.quantity,
    unit: p.unit,
    quality_grade: null,
    location: p.location,
    description: p.description,
    imageUrl: p.image_url,
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
      location: listingData.location,
      description: listingData.description || null,
      image_url: listingData.imageUrl || null,
      status: "active"
    })
    .select("produce_id, crop_name, crop_variety, asking_price, quantity, unit, location, description, image_url, status")
    .single();

  if (error) throw error;
  return {
    id: data.produce_id,
    title: data.crop_name,
    category: data.crop_variety,
    asking_price: data.asking_price,
    quantity_available: data.quantity,
    unit: data.unit,
    quality_grade: listingData.quality_grade || null,
    location: data.location,
    description: data.description,
    imageUrl: data.image_url,
    status: data.status
  };
}

export async function updateListingStatus(supabase, listingId, status) {
  const { data, error } = await supabase
    .from("produce")
    .update({ status })
    .eq("produce_id", listingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateListing(supabase, listingId, updates) {
  const { data, error } = await supabase
    .from("produce")
    .update(updates)
    .eq("produce_id", listingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteListing(supabase, listingId) {
  const { error } = await supabase
    .from("produce")
    .delete()
    .eq("produce_id", listingId);

  if (error) throw error;
  return true;
}

export async function getAllListingsForAdmin(supabase) {
  const { data, error } = await supabase
    .from("produce")
    .select("produce_id, farmer_id, crop_name, crop_variety, asking_price, quantity, unit, location, description, image_url, status, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  return (data || []).map(p => ({
    id: p.produce_id,
    farmer_id: p.farmer_id,
    title: p.crop_name,
    category: p.crop_variety,
    asking_price: p.asking_price,
    quantity_available: p.quantity,
    unit: p.unit,
    quality_grade: null,
    location: p.location,
    description: p.description,
    imageUrl: p.image_url,
    status: p.status,
    created_at: p.created_at,
  }));
}

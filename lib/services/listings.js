/**
 * Service Layer for Listings / Produce Management
 */

export async function getActiveListings(supabase) {
  const { data, error } = await supabase
    .from("produce")
    .select("produce_id, farmer_id, crop_name, crop_variety, asking_price, quantity, unit, location, description, created_at, status")
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
    quality_grade: null,
    location: p.location,
    description: p.description,
    created_at: p.created_at,
    status: p.status
  }));
}

export async function getFarmerListings(supabase, farmerId) {
  const { data, error } = await supabase
    .from("produce")
    .select("produce_id, crop_name, crop_variety, asking_price, quantity, unit, location, description, status, created_at")
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
    quality_grade: null,
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
      location: listingData.location,
      description: listingData.description || null,
      status: "active"
    })
    .select("produce_id, crop_name, crop_variety, asking_price, quantity, unit, location, description, status")
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
    status: data.status
  };
}

export async function getAllListingsForAdmin(supabase) {
  const { data, error } = await supabase
    .from("produce")
    .select("produce_id, farmer_id, crop_name, crop_variety, asking_price, quantity, unit, location, description, status, created_at")
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
    quality_grade: null,
    location: p.location,
    description: p.description,
    status: p.status,
    created_at: p.created_at,
  }));
}

/**
 * Service Layer for Buyer Offers Management
 */

export async function getFarmerOffers(supabase, farmerId) {
  const { data, error } = await supabase
    .from("offers")
    .select(`
      id,
      listing_id,
      buyer_id,
      offered_price,
      offered_quantity,
      notes,
      status,
      created_at,
      updated_at,
      listings!inner(title, category),
      profiles!buyer_id(full_name, phone, email)
    `)
    .eq("listings.farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOfferDetails(supabase, offerId) {
  const { data, error } = await supabase
    .from("offers")
    .select(`
      id,
      listing_id,
      buyer_id,
      offered_price,
      offered_quantity,
      notes,
      status,
      created_at,
      updated_at,
      listings(id, title, category, asking_price, quantity_available, unit, location),
      profiles!buyer_id(full_name, phone, email, verification_status)
    `)
    .eq("id", offerId)
    .single();

  if (error) throw error;
  return data;
}

export async function acceptOffer(supabase, offerId, farmerId) {
  // Update offer status to accepted
  const { data: offerData, error: offerError } = await supabase
    .from("offers")
    .update({ status: "accepted" })
    .eq("id", offerId)
    .select()
    .single();

  if (offerError) throw offerError;

  // Create an order from the accepted offer
  const offer = offerData;
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      listing_id: offer.listing_id,
      buyer_id: offer.buyer_id,
      farmer_id: farmerId,
      quantity: offer.offered_quantity,
      unit_price: offer.offered_price,
      total_amount: offer.offered_quantity * offer.offered_price,
      status: "confirmed",
    })
    .select()
    .single();

  if (orderError) throw orderError;

  return { offer: offerData, order: orderData };
}

export async function rejectOffer(supabase, offerId) {
  const { data, error } = await supabase
    .from("offers")
    .update({ status: "rejected" })
    .eq("id", offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOfferCount(supabase, farmerId, status = null) {
  let query = supabase
    .from("offers")
    .select("id", { count: "exact", head: true })
    .eq("listings.farmer_id", farmerId);

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
}

export async function createOffer(supabase, offerData) {
  const { data, error } = await supabase
    .from("offers")
    .insert([offerData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

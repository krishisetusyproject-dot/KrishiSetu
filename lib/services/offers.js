/**
 * Service Layer for Buyer Offers Management
 */

export async function getFarmerOffers(supabase, farmerId) {
  const { data, error } = await supabase
    .from("offers")
    .select(`
      id,
      listing_id:produce_id,
      buyer_id,
      offered_price,
      offered_quantity:quantity,
      notes:message,
      status,
      created_at,
      updated_at,
      listings:produce!inner(title:crop_name, category:crop_variety, unit),
      profiles!buyer_id(full_name, phone, email)
    `)
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOfferDetails(supabase, offerId) {
  const { data, error } = await supabase
    .from("offers")
    .select(`
      id,
      listing_id:produce_id,
      buyer_id,
      offered_price,
      offered_quantity:quantity,
      notes:message,
      status,
      created_at,
      updated_at,
      listings:produce(id:produce_id, title:crop_name, category:crop_variety, asking_price, quantity_available:quantity, unit, location),
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

  // Fetch produce details for order_items
  const { data: produceData } = await supabase
    .from("produce")
    .select("crop_name, unit")
    .eq("produce_id", offerData.produce_id)
    .single();

  // Create an order from the accepted offer
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      offer_id: offerData.id,
      buyer_id: offerData.buyer_id,
      farmer_id: farmerId,
      status: "confirmed",
      payment_status: "pending"
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Insert into order_items
  const orderId = orderData.order_id || orderData.id;
  
  const { data: orderItemData, error: itemError } = await supabase
    .from("order_items")
    .insert({
      order_id: orderId,
      produce_id: offerData.produce_id,
      crop_name: produceData?.crop_name || "Produce",
      quantity: offerData.quantity,
      unit: produceData?.unit || "kg",
      price_per_unit: offerData.offered_price,
      subtotal: offerData.quantity * offerData.offered_price
    })
    .select()
    .single();

  if (itemError) throw itemError;

  return { offer: offerData, order: orderData, orderItem: orderItemData };
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
    .eq("farmer_id", farmerId);

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
}

export async function createOffer(supabase, offerData) {
  // We need farmer_id to insert into offers due to RLS policy
  const { data: produceData, error: produceError } = await supabase
    .from("produce")
    .select("farmer_id")
    .eq("produce_id", offerData.listing_id)
    .single();
    
  if (produceError) throw produceError;

  const payload = {
    produce_id: offerData.listing_id,
    buyer_id: offerData.buyer_id,
    farmer_id: produceData.farmer_id,
    quantity: offerData.offered_quantity,
    offered_price: offerData.offered_price,
    message: offerData.notes,
  };

  const { data, error } = await supabase
    .from("offers")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBuyerOffers(supabase, buyerId) {
  try {
    const { data, error } = await supabase
      .from("offers")
      .select(`
        id,
        listing_id,
        produce_id,
        buyer_id,
        farmer_id,
        offered_price,
        offered_quantity,
        notes,
        status,
        created_at,
        listings(title, category, unit, asking_price, location)
      `)
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Could not query offers by buyer_id:", err);
    return [];
  }
}

export async function cancelBuyerOffer(supabase, offerId) {
  const { data, error } = await supabase
    .from("offers")
    .update({ status: "cancelled" })
    .eq("id", offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}



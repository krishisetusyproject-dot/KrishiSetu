/**
 * Service Layer for Buyer Offers Management
 */

export async function getFarmerOffers(supabase, farmerId) {
  const { data, error } = await supabase
    .from("offers")
    .select(`
      id:offer_id,
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
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}

export async function getOfferDetails(supabase, offerId) {
  const { data, error } = await supabase
    .from("offers")
    .select(`
      id:offer_id,
      listing_id:produce_id,
      buyer_id,
      offered_price,
      offered_quantity:quantity,
      notes:message,
      status,
      created_at,
      updated_at,
      listings:produce(id:produce_id, title:crop_name, category:crop_variety, asking_price, quantity_available:quantity, unit, location),
      profiles!buyer_id(full_name, phone, email)
    `)
    .eq("offer_id", offerId)
    .single();

  if (error) throw error;
  return data;
}

export async function acceptOffer(supabase, offerId, farmerId) {
  const { data: offerData, error: offerError } = await supabase
    .from("offers")
    .select()
    .eq("offer_id", offerId)
    .eq("farmer_id", farmerId)
    .single();

  if (offerError) throw offerError;

  const { data: produceData, error: produceError } = await supabase
    .from("produce")
    .select("crop_name, unit")
    .eq("produce_id", offerData.produce_id)
    .single();
  if (produceError) throw produceError;

  const totalAmount = Number(offerData.quantity) * Number(offerData.offered_price);
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error("This offer has an invalid quantity or price.");
  }

  const { data: existingOrder, error: existingOrderError } = await supabase
    .from("orders")
    .select("order_id")
    .eq("offer_id", offerId)
    .maybeSingle();

  if (existingOrderError) throw existingOrderError;

  let orderData = existingOrder;
  if (!orderData) {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        offer_id: offerId,
        buyer_id: offerData.buyer_id,
        farmer_id: farmerId,
        total_amount: totalAmount,
        status: "confirmed",
        payment_status: "pending"
      })
      .select()
      .single();

    if (error) throw error;
    orderData = data;
  }

  const orderId = orderData.order_id || orderData.id;
  const { data: existingOrderItem, error: existingItemError } = await supabase
    .from("order_items")
    .select("order_item_id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existingItemError) throw existingItemError;

  let orderItemData = existingOrderItem;
  if (!orderItemData) {
    const { data, error } = await supabase
      .from("order_items")
      .insert({
        order_id: orderId,
        produce_id: offerData.produce_id,
        crop_name: produceData?.crop_name || "Produce",
        quantity: offerData.quantity,
        unit: produceData?.unit || "kg",
        price_per_unit: offerData.offered_price,
        subtotal: totalAmount
      })
      .select()
      .single();

    if (error) throw error;
    orderItemData = data;
  }

  let acceptedOffer = offerData;
  if (offerData.status !== "accepted") {
    const { data, error } = await supabase
      .from("offers")
      .update({ status: "accepted" })
      .eq("offer_id", offerId)
      .eq("farmer_id", farmerId)
      .select()
      .single();

    if (error) throw error;
    acceptedOffer = data;
  }

  return { offer: acceptedOffer, order: orderData, orderItem: orderItemData };
}

export async function rejectOffer(supabase, offerId) {
  const { data, error } = await supabase
    .from("offers")
    .update({ status: "rejected" })
    .eq("offer_id", offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOfferCount(supabase, farmerId, status = null) {
  let query = supabase
    .from("offers")
    .select("offer_id", { count: "exact", head: true })
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

export async function submitBuyerOffer(supabase, orderData) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in with a buyer account to send an offer.");

  return createOffer(supabase, {
    buyer_id: user.id,
    listing_id: orderData.listing_id,
    offered_quantity: orderData.quantity,
    offered_price: orderData.price,
    notes: orderData.notes,
  });
}

export async function getBuyerOffers(supabase, buyerId) {
  try {
    const { data, error } = await supabase
      .from("offers")
      .select(`
        id:offer_id,
        listing_id:produce_id,
        buyer_id,
        farmer_id,
        offered_price,
        offered_quantity:quantity,
        notes:message,
        status,
        created_at,
        listings:produce!inner(title:crop_name, category:crop_variety, unit, asking_price, location)
      `)
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false })
      .limit(100);

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
    .eq("offer_id", offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

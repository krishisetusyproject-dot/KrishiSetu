/**
 * Service Layer for Orders Management
 */

export async function getFarmerOrders(supabase, farmerId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id:order_id,
      buyer_id,
      status,
      created_at,
      pickup_location,
      order_items!inner(
        produce_id,
        quantity,
        price_per_unit,
        subtotal,
        produce!inner(crop_name, crop_variety, unit, location)
      ),
      profiles!buyer_id(full_name, phone, email)
    `)
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  return (data || []).map(order => {
    const item = order.order_items[0] || {};
    return {
      id: order.id,
      listing_id: item.produce_id,
      buyer_id: order.buyer_id,
      quantity: item.quantity,
      unit_price: item.price_per_unit,
      total_amount: item.subtotal,
      status: order.status,
      created_at: order.created_at,
      listings: {
        title: item.produce?.crop_name,
        category: item.produce?.crop_variety,
        unit: item.produce?.unit,
        location: item.produce?.location || order.pickup_location
      },
      profiles: order.profiles
    };
  });
}

export async function getOrderDetails(supabase, orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id:order_id,
      buyer_id,
      farmer_id,
      status,
      created_at,
      pickup_location,
      order_items!inner(
        produce_id,
        quantity,
        price_per_unit,
        subtotal,
        produce!inner(produce_id, crop_name, crop_variety, quantity, unit, location)
      ),
      profiles!buyer_id(full_name, phone, email, verification_status)
    `)
    .eq("order_id", orderId)
    .single();

  if (error) throw error;
  
  const item = data.order_items[0] || {};
  return {
    id: data.id,
    listing_id: item.produce_id,
    buyer_id: data.buyer_id,
    farmer_id: data.farmer_id,
    quantity: item.quantity,
    unit_price: item.price_per_unit,
    total_amount: item.subtotal,
    status: data.status,
    created_at: data.created_at,
    listings: {
      id: item.produce?.produce_id,
      title: item.produce?.crop_name,
      category: item.produce?.crop_variety,
      asking_price: item.price_per_unit,
      quantity_available: item.produce?.quantity,
      unit: item.produce?.unit,
      location: item.produce?.location || data.pickup_location
    },
    profiles: data.profiles
  };
}

export async function getOrdersByStatus(supabase, farmerId, status) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id:order_id,
      buyer_id,
      status,
      created_at,
      order_items!inner(
        produce_id,
        quantity,
        price_per_unit,
        subtotal,
        produce!inner(crop_name, crop_variety, unit)
      ),
      profiles!buyer_id(full_name)
    `)
    .eq("farmer_id", farmerId)
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  return (data || []).map(order => {
    const item = order.order_items[0] || {};
    return {
      id: order.id,
      listing_id: item.produce_id,
      buyer_id: order.buyer_id,
      quantity: item.quantity,
      unit_price: item.price_per_unit,
      total_amount: item.subtotal,
      status: order.status,
      created_at: order.created_at,
      listings: {
        title: item.produce?.crop_name,
        category: item.produce?.crop_variety,
        unit: item.produce?.unit
      },
      profiles: order.profiles
    };
  });
}

export async function getCompletedSales(supabase, farmerId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id:order_id,
      status,
      created_at,
      order_items!inner(
        quantity,
        price_per_unit,
        subtotal,
        produce!inner(crop_name, crop_variety, unit)
      ),
      profiles!buyer_id(full_name)
    `)
    .eq("farmer_id", farmerId)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  return (data || []).map(order => {
    const item = order.order_items[0] || {};
    return {
      id: order.id,
      quantity: item.quantity,
      unit_price: item.price_per_unit,
      total_amount: item.subtotal,
      status: order.status,
      created_at: order.created_at,
      listings: {
        title: item.produce?.crop_name,
        category: item.produce?.crop_variety,
        unit: item.produce?.unit
      },
      profiles: order.profiles
    };
  });
}

export async function getSalesStats(supabase, farmerId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      status,
      order_items!inner(quantity, subtotal)
    `)
    .eq("farmer_id", farmerId)
    .eq("status", "completed");

  if (error) throw error;

  const sales = data || [];
  let totalSales = 0;
  let totalQuantity = 0;
  
  sales.forEach(order => {
    const item = order.order_items[0] || {};
    totalSales += (item.subtotal || 0);
    totalQuantity += (item.quantity || 0);
  });

  return {
    totalSales,
    totalQuantity,
    completedOrders: sales.length,
  };
}

export async function getActiveOrderCount(supabase, farmerId) {
  const { count, error } = await supabase
    .from("orders")
    .select("order_id", { count: "exact", head: true })
    .eq("farmer_id", farmerId)
    .not("status", "eq", "completed")
    .not("status", "eq", "cancelled");

  if (error) throw error;
  return count || 0;
}

export async function updateOrderStatus(supabase, orderId, status) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("order_id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBuyerOrders(supabase, buyerId) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        listing_id,
        buyer_id,
        farmer_id,
        quantity,
        unit_price,
        total_amount,
        status,
        created_at,
        updated_at,
        pickup_location,
        pickup_date,
        buyer_notes,
        farmer_notes,
        payment_status,
        listings(title, category, unit, location, asking_price)
      `)
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Could not query orders by buyer_id:", err);
    return [];
  }
}

export async function createBuyerOrder(supabase, orderData) {
  const { data, error } = await supabase
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelBuyerOrder(supabase, orderId) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}


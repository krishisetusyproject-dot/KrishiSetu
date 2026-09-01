/**
 * Service Layer for Orders Management
 */

export async function getFarmerOrders(supabase, farmerId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      listing_id,
      buyer_id,
      quantity,
      unit_price,
      total_amount,
      status,
      created_at,
      updated_at,
      listings(title, category, unit, location),
      profiles!buyer_id(full_name, phone, email)
    `)
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOrderDetails(supabase, orderId) {
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
      listings(id, title, category, unit, location, quantity_available),
      profiles!buyer_id(full_name, phone, email, verification_status)
    `)
    .eq("id", orderId)
    .single();

  if (error) throw error;
  return data;
}

export async function getOrdersByStatus(supabase, farmerId, status) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      listing_id,
      buyer_id,
      quantity,
      unit_price,
      total_amount,
      status,
      created_at,
      updated_at,
      listings(title, category, unit),
      profiles!buyer_id(full_name)
    `)
    .eq("farmer_id", farmerId)
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCompletedSales(supabase, farmerId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      quantity,
      unit_price,
      total_amount,
      status,
      created_at,
      listings(title, category, unit),
      profiles!buyer_id(full_name)
    `)
    .eq("farmer_id", farmerId)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSalesStats(supabase, farmerId) {
  const { data, error } = await supabase
    .from("orders")
    .select("quantity, unit_price, total_amount, status")
    .eq("farmer_id", farmerId)
    .eq("status", "completed");

  if (error) throw error;

  const sales = data || [];
  const totalSales = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalQuantity = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const completedOrders = sales.length;

  return {
    totalSales,
    totalQuantity,
    completedOrders,
  };
}

export async function getActiveOrderCount(supabase, farmerId) {
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
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
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

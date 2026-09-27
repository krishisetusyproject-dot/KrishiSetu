/**
 * Service Layer for Ratings & Reviews
 */

export async function submitReview(supabase, { orderId, rating, comment }) {
  // First get the order to find the farmer id
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('farmer_id')
    .eq('order_id', orderId)
    .single();

  if (orderError) throw orderError;
  if (!order) throw new Error("Order not found");

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      order_id: orderId,
      reviewer_id: user.id,
      reviewee_id: order.farmer_id,
      rating: rating,
      comment: comment
    }])
    .select()
    .single();

  if (error) {
    console.error("Failed to insert review:", error);
    throw error;
  }

  return data;
}

export async function getReviewsForUser(supabase, userId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      rating,
      comment,
      created_at,
      reviewer:profiles!reviewer_id(full_name, district, state)
    `)
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Failed to fetch reviews:", error);
    return [];
  }

  return data;
}

/**
 * Service Layer for Market Prices & MSP Data
 */

export async function getMarketPrices(supabase, filters = {}) {
  let query = supabase
    .from("market_prices")
    .select("*")
    .order("updated_at", { ascending: false });

  if (filters.commodity) {
    query = query.ilike("commodity", `%${filters.commodity}%`);
  }

  if (filters.state) {
    query = query.eq("state", filters.state);
  }

  if (filters.district) {
    query = query.ilike("apmc_mandi", `%${filters.district}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getPriceForCommodity(supabase, commodity, state = null) {
  let query = supabase
    .from("market_prices")
    .select("*")
    .ilike("commodity", `%${commodity}%`);

  if (state) {
    query = query.eq("state", state);
  }

  query = query.order("updated_at", { ascending: false }).limit(1);

  const { data, error } = await query;

  if (error) throw error;
  return data?.[0] || null;
}

export async function getStates(supabase) {
  const { data, error } = await supabase
    .from("market_prices")
    .select("state")
    .distinct()
    .order("state");

  if (error) throw error;
  return [...new Set(data?.map(d => d.state) || [])];
}

export async function getDistricts(supabase, state) {
  const { data, error } = await supabase
    .from("market_prices")
    .select("apmc_mandi")
    .eq("state", state)
    .distinct()
    .order("apmc_mandi");

  if (error) throw error;
  return [...new Set(data?.map(d => d.apmc_mandi) || [])];
}

export async function getCommodities(supabase) {
  const { data, error } = await supabase
    .from("market_prices")
    .select("commodity")
    .distinct()
    .order("commodity");

  if (error) throw error;
  return [...new Set(data?.map(d => d.commodity) || [])];
}

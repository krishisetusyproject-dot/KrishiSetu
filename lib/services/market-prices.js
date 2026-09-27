/**
 * Service Layer for Market Prices & MSP Data
 */

export async function getMarketPrices(supabase, filters = {}) {
  let query = supabase
    .from("market_prices")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters.commodity) {
    query = query.ilike("crop_name", `%${filters.commodity}%`);
  }

  if (filters.state) {
    query = query.eq("state", filters.state);
  }

  if (filters.district) {
    query = query.or(`district.ilike.%${filters.district}%,market_name.ilike.%${filters.district}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []).map(d => ({
    ...d,
    id: d.market_price_id,
    commodity: d.crop_name,
    apmc_mandi: d.market_name || d.district,
    updated_at: d.price_date || d.created_at,
  }));
}

export async function getPriceForCommodity(supabase, commodity, state = null) {
  let query = supabase
    .from("market_prices")
    .select("*")
    .ilike("crop_name", `%${commodity}%`);

  if (state) {
    query = query.eq("state", state);
  }

  query = query.order("created_at", { ascending: false }).limit(1);

  const { data, error } = await query;

  if (error) throw error;
  if (!data?.[0]) return null;
  const d = data[0];
  return {
    ...d,
    id: d.market_price_id,
    commodity: d.crop_name,
    apmc_mandi: d.market_name || d.district,
    updated_at: d.price_date || d.created_at,
  };
}

export async function getStates(supabase) {
  const { data, error } = await supabase
    .from("market_prices")
    .select("state")
    .order("state")
    .limit(1000);

  if (error) throw error;
  return [...new Set(data?.map(d => d.state).filter(Boolean) || [])];
}

export async function getDistricts(supabase, state) {
  let query = supabase.from("market_prices").select("market_name, district").limit(1000);
  if (state) {
    query = query.eq("state", state);
  }
  const { data, error } = await query;

  if (error) throw error;
  const list = (data || []).map(d => d.market_name || d.district).filter(Boolean);
  return [...new Set(list)];
}

export async function getCommodities(supabase) {
  const { data, error } = await supabase
    .from("market_prices")
    .select("crop_name")
    .order("crop_name")
    .limit(1000);

  if (error) throw error;
  return [...new Set(data?.map(d => d.crop_name).filter(Boolean) || [])];
}

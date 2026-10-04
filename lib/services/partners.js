/**
 * Service Layer for Partner Platforms & Logistics Hub
 * 
 * Provides verified references for agricultural freight and transport services.
 */

export const MOCK_PARTNERS = [
  {
    id: "part-1",
    name: "Kisan Rath",
    type: "logistics",
    description: "Official Govt of India app facilitating farmers and traders in searching for transport vehicles for agricultural produce.",
    contact_info: "1800-180-1551 (Toll Free)",
    website_url: "https://kisanrath.nic.in/",
    logo_url: "/icons/kisan_rath_logo.png",
    is_verified: true,
  },
  {
    id: "part-2",
    name: "KisanSabha",
    type: "logistics",
    description: "CSIR portal connecting farmers to supply chain and freight transportation management systems.",
    contact_info: "support@kisansabha.in",
    website_url: "https://kisansabha.in/",
    logo_url: "/icons/kisansabha_logo.png",
    is_verified: true,
  },
  {
    id: "part-3",
    name: "Porter / Fast Logistics",
    type: "logistics",
    description: "On-demand mini-truck and tempo booking for intra-city and inter-city agricultural produce delivery.",
    contact_info: "4444-4444",
    website_url: "https://porter.in/",
    logo_url: "/icons/porter_logo.png",
    is_verified: true,
  }
];

export async function getPartnerPlatforms(supabase) {
  // If the partner_platforms table exists, we'd query it here.
  // Fallback to static references to ensure UI works out-of-the-box.
  try {
    const { data, error } = await supabase
      .from('partner_platforms')
      .select('*')
      .eq('is_verified', true)
      .eq('type', 'logistics')
      .order('type', { ascending: true });
      
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("partner_platforms table may not exist yet, falling back to static data.");
  }

  return MOCK_PARTNERS;
}

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { getPartnerPlatforms } from "@/lib/services/partners";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  ExternalLink,
  ShieldCheck,
  Truck,
  ShoppingCart,
  ShoppingBasket,
  Landmark,
  Leaf,
} from "lucide-react";

const typeIcons = {
  logistics: <Truck className="h-4 w-4 text-sky-600" />,
  f2c_platform: <ShoppingCart className="h-4 w-4 text-emerald-600" />,
  government: <Landmark className="h-4 w-4 text-amber-600" />,
};

const typeLabels = {
  logistics: "Transport & Logistics",
  f2c_platform: "F2C Marketplaces",
  government: "Government Initiatives",
};

const partnerIcons = {
  "kisan rath": { Icon: Truck, color: "text-sky-700", background: "bg-sky-50" },
  "kisansabha": { Icon: Landmark, color: "text-emerald-700", background: "bg-emerald-50" },
  "porter / fast logistics": { Icon: Truck, color: "text-orange-700", background: "bg-orange-50" },
  "otipy": { Icon: ShoppingBasket, color: "text-rose-700", background: "bg-rose-50" },
  "ninjacart": { Icon: Leaf, color: "text-lime-700", background: "bg-lime-50" },
};

export default function LogisticsHub({ userRole = "farmer" }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    async function fetchPartners() {
      const supabase = createClient();
      const data = await getPartnerPlatforms(supabase);
      setPartners(data || []);
      setLoading(false);
    }
    fetchPartners();
  }, []);

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "All" || p.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [partners, search, filterType]);



  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            Partner Platforms & Logistics
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-2xl">
            {userRole === "farmer" 
              ? "Find verified transport references like Kisan Rath to move your harvest, or explore direct-to-consumer partner apps."
              : "Access trusted transport and freight providers to assist with farmgate pickups and large-scale procurement moving."}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Verified by KrishiSetu</span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search partners, logistics, or services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-600"
        >
          <option value="All">All Categories</option>
          <option value="logistics">Logistics & Transport</option>
          <option value="f2c_platform">F2C Marketplaces</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-56 bg-slate-100 animate-pulse rounded-3xl border border-slate-200/60" />
          ))}
        </div>
      ) : filteredPartners.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => {
            const visual = partnerIcons[partner.name.toLowerCase()] || {
              Icon: partner.type === "logistics" ? Truck : ShoppingCart,
              color: "text-emerald-700",
              background: "bg-emerald-50",
            };
            const PartnerIcon = visual.Icon;

            return (
            <article key={partner.id} className="group relative flex flex-col bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-200 transition-all">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 ${visual.background}`}>
                    <PartnerIcon className={`h-6 w-6 ${visual.color}`} aria-hidden="true" />
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-600 border border-slate-100">
                    {typeIcons[partner.type]} {typeLabels[partner.type]}
                  </span>
                </div>
                
                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-950 transition-colors">
                  {partner.name}
                </h3>
                
                <p className="mt-2 text-sm text-slate-500 leading-relaxed flex-1">
                  {partner.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600 flex items-center gap-2">
                  <span>Contact:</span>
                  <span className="text-slate-900">{partner.contact_info}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <a
                  href={partner.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-950 text-amber-100 rounded-xl text-xs font-bold hover:bg-emerald-900 active:scale-95 transition-all"
                >
                  Visit Platform <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <Truck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No platforms found</h3>
          <p className="text-slate-500 text-sm mt-1">Try clearing your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}

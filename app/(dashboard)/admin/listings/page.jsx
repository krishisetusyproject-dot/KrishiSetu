"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAllListingsForAdmin } from "@/lib/services/listings";

export default function AdminListingsPage() {
  const [produceListings, setProduceListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduceListings() {
      try {
        setLoading(true);
        const supabase = createClient();
        const data = await getAllListingsForAdmin(supabase);
        setProduceListings(data);
      } catch (err) {
        console.error("Unexpected error fetching produce listings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduceListings();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Produce Moderation & Listings</h1>
        <p className="text-sm text-slate-500">Monitor active crop listings posted by farmers across regions.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading produce listings...</div>
        ) : produceListings.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No active produce listings found in database.</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b text-slate-700 font-medium">
              <tr>
                <th className="p-4">Crop Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Asking Price</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produceListings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-800">{item.title || item.crop_name}</td>
                  <td className="p-4">{item.category || item.crop_variety || "N/A"}</td>
                  <td className="p-4">{item.quantity_available ?? item.quantity} {item.unit}</td>
                  <td className="p-4 font-semibold text-emerald-700">₹{item.asking_price}/{item.unit}</td>
                  <td className="p-4">{item.location}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

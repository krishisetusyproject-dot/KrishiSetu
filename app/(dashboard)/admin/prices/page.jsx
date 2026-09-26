"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Plus, X } from "lucide-react";

export default function MandiPricesPage() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State mapped to teammate's schema
  const [formData, setFormData] = useState({
    crop_name: "",
    market_name: "",
    state: "",
    min_price: "",
    max_price: "",
    modal_price: "",
    unit: "₹/quintal",
  });

  useEffect(() => {
    async function fetchPrices() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("market_prices").select("*");
        if (error) console.error("Error fetching prices:", error.message);
        else setPrices(data || []);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        crop_name: formData.crop_name,
        market_name: formData.market_name,
        state: formData.state,
        min_price: Number(formData.min_price),
        max_price: Number(formData.max_price),
        modal_price: Number(formData.modal_price),
        unit: formData.unit,
        price_date: new Date().toISOString().split("T")[0],
      };

      const { data, error } = await supabase.from("market_prices").insert([payload]).select();

      if (!error && data) {
        setPrices((prev) => [data[0], ...prev]);
        setIsModalOpen(false);
        setFormData({ crop_name: "", market_name: "", state: "", min_price: "", max_price: "", modal_price: "", unit: "₹/quintal" });
      } else {
        console.error("Error inserting price:", error?.message);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daily Mandi & MSP Rates</h1>
          <p className="text-sm text-slate-500">Publish and update benchmark market rates across APMC mandis.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Benchmark Rate
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading live market prices...</div>
        ) : prices.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No market price records found in database.</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b text-slate-700 font-medium">
              <tr>
                <th className="p-4">Crop Name</th>
                <th className="p-4">APMC Market</th>
                <th className="p-4">State</th>
                <th className="p-4">Min Rate (₹)</th>
                <th className="p-4">Max Rate (₹)</th>
                <th className="p-4">Modal Rate (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prices.map((p) => (
                <tr key={p.id || p.crop_name} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-800">{p.crop_name}</td>
                  <td className="p-4">{p.market_name}</td>
                  <td className="p-4">{p.state}</td>
                  <td className="p-4">₹{p.min_price}</td>
                  <td className="p-4">₹{p.max_price}</td>
                  <td className="p-4 font-semibold text-emerald-700">₹{p.modal_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Publish New Benchmark Rate</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Crop Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Tomato"
                    value={formData.crop_name}
                    onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Market Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Vashi APMC"
                    value={formData.market_name}
                    onChange={(e) => setFormData({ ...formData, market_name: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">State</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Min Rate (₹)</label>
                  <input
                    required
                    type="number"
                    value={formData.min_price}
                    onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Max Rate (₹)</label>
                  <input
                    required
                    type="number"
                    value={formData.max_price}
                    onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Modal Rate (₹)</label>
                  <input
                    required
                    type="number"
                    value={formData.modal_price}
                    onChange={(e) => setFormData({ ...formData, modal_price: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Publish Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

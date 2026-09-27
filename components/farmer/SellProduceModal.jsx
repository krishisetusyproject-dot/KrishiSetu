"use client";

import { useState } from "react";
import { X, Sparkles, Upload, Check } from "lucide-react";

const PRESET_CROPS = [
  {
    name: "Roma Tomatoes",
    category: "Vegetables",
    variety: "Abhinav / F1 Hybrid",
    unit: "kg",
    price: 34,
    grade: "A+ Premium Grade",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Nashik Red Onions",
    category: "Vegetables",
    variety: "Garwa / Late Kharif Red",
    unit: "kg",
    price: 26,
    grade: "A Grade (50mm+)",
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sharbati Golden Wheat",
    category: "Grains & Cereals",
    variety: "C-306 Desi Sharbati",
    unit: "quintal",
    price: 2850,
    grade: "A+ Export Grade",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Green Capsicum",
    category: "Vegetables",
    variety: "Indra F1 Bell Pepper",
    unit: "kg",
    price: 48,
    grade: "Grade A Polyhouse",
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80",
  },
];

export default function SellProduceModal({
  isOpen,
  onClose,
  onSubmit,
  defaultLocation = "Nashik, Maharashtra",
}) {
  const [form, setForm] = useState({
    title: "",
    category: "Vegetables",
    variety: "",
    asking_price: "",
    quantity_available: "",
    unit: "kg",
    quality_grade: "A+ Premium Grade",
    location: defaultLocation,
    harvest_date: "",
    organic: false,
    description: "",
    imageUrl: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function updateField(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSelectPreset(preset) {
    setForm((prev) => ({
      ...prev,
      title: preset.name,
      category: preset.category,
      variety: preset.variety,
      unit: preset.unit,
      asking_price: preset.price,
      quality_grade: preset.grade,
      imageUrl: preset.image,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title || !form.asking_price || !form.quantity_available) {
      setError("Please fill in crop name, price, and available quantity.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to publish produce. Please check your connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-100">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">List Produce for Sale</h2>
            <p className="text-xs text-slate-500">
              Publish directly to verified APMC & institutional commercial buyers
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick presets */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">
              Quick Crop Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_CROPS.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => handleSelectPreset(p)}
                  className={`flex flex-col items-center text-center p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                    form.title === p.name
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-10 w-10 rounded-xl object-cover mb-1.5 shadow-2xs"
                  />
                  <span className="truncate w-full">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Crop Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Crop Name *
              </label>
              <input
                required
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="e.g. Roma Tomatoes"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={updateField}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Grains & Cereals">Grains & Cereals</option>
                <option value="Fruits">Fruits</option>
                <option value="Pulses">Pulses</option>
                <option value="Spices">Spices</option>
                <option value="Cash Crops">Cash Crops</option>
              </select>
            </div>
          </div>

          {/* Variety & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Variety / Seedline
              </label>
              <input
                name="variety"
                value={form.variety}
                onChange={updateField}
                placeholder="e.g. Abhinav F1 / C-306 Desi"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Quality Grade
              </label>
              <select
                name="quality_grade"
                value={form.quality_grade}
                onChange={updateField}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="A+ Premium Grade">A+ Premium Grade</option>
                <option value="A+ Export Grade">A+ Export Grade</option>
                <option value="A Grade (50mm+)">A Grade (50mm+)</option>
                <option value="Grade A Polyhouse">Grade A Polyhouse</option>
                <option value="Grade B (Commercial)">Grade B (Commercial)</option>
              </select>
            </div>
          </div>

          {/* Price & Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Asking Price (₹) *
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="1"
                name="asking_price"
                value={form.asking_price}
                onChange={updateField}
                placeholder="35"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Available Quantity *
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="1"
                name="quantity_available"
                value={form.quantity_available}
                onChange={updateField}
                placeholder="1000"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Unit *
              </label>
              <select
                name="unit"
                value={form.unit}
                onChange={updateField}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="kg">kg</option>
                <option value="quintal">quintal</option>
                <option value="tonne">tonne</option>
                <option value="crate">crate (20kg)</option>
                <option value="box">box</option>
              </select>
            </div>
          </div>

          {/* Location & Ready Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pickup Location *
              </label>
              <input
                required
                name="location"
                value={form.location}
                onChange={updateField}
                placeholder="Village, District, State"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Harvest Readiness Date
              </label>
              <input
                type="text"
                name="harvest_date"
                value={form.harvest_date}
                onChange={updateField}
                placeholder="e.g. Immediate or 2 Sept"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Organic checkbox */}
          <div className="flex items-center gap-2.5 rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200/60">
            <input
              type="checkbox"
              id="organicCheck"
              name="organic"
              checked={form.organic}
              onChange={updateField}
              className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="organicCheck" className="text-xs font-semibold text-amber-950 cursor-pointer flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Certified / Naturally Grown Organic Produce (Attracts premium buyers)</span>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description & Quality Notes
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              rows={2}
              placeholder="e.g. Farmgate collection ready, sorted in crates, moisture under 10%..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-800 border border-red-200">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 py-3 text-sm font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? "Publishing to Mandi..." : "Publish Produce Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { MoreVertical, Pause, Eye, Trash2 } from "lucide-react";

export default function ProduceCard({
  id,
  title,
  category,
  askingPrice,
  quantity,
  unit,
  location,
  status,
  harvestDate,
  onEdit,
  onPause,
  onDelete,
  imageUrl,
}) {
  const statusColors = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paused: "bg-yellow-50 text-yellow-700 border-yellow-200",
    sold: "bg-gray-50 text-gray-700 border-gray-200",
    expired: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Image or placeholder */}
      <div className="h-32 bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="text-center">
            <p className="text-3xl">🌾</p>
            <p className="text-xs text-slate-500 mt-1">{category}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">{category}</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${statusColors[status] || statusColors.active}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-600">Price</p>
            <p className="font-bold text-emerald-950">₹{askingPrice} / {unit}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Available</p>
            <p className="font-bold text-emerald-950">{quantity} {unit}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-600">Pickup</p>
            <p className="font-semibold text-slate-900">{location}</p>
          </div>
          {harvestDate && (
            <div className="col-span-2">
              <p className="text-xs text-slate-600">Harvest</p>
              <p className="font-semibold text-slate-900">{harvestDate}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <Eye className="h-4 w-4" />
            View
          </button>
          {status === "active" && (
            <button
              onClick={onPause}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-yellow-50 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 transition-colors"
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
          )}
          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

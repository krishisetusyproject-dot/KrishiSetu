import { Truck, Calendar, MapPin } from "lucide-react";

export default function OrderCard({
  id,
  buyerName,
  produceName,
  quantity,
  unit,
  price,
  totalAmount,
  pickupDate,
  pickupLocation,
  status,
}) {
  const statusColors = {
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    pickup_ready: "bg-yellow-50 text-yellow-700 border-yellow-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  const statusLabels = {
    confirmed: "Order Confirmed",
    pickup_ready: "Ready for Pickup",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">{id}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{buyerName}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${statusColors[status] || statusColors.confirmed}`}>
          {statusLabels[status] || status}
        </span>
      </div>

      {/* Order Details */}
      <div className="space-y-3 bg-slate-50 rounded-lg p-4 mb-4">
        <div>
          <p className="text-xs text-slate-600 font-medium mb-1">Produce</p>
          <p className="font-semibold text-slate-900">{produceName}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-600 font-medium">Quantity</p>
            <p className="font-bold text-slate-900">{quantity} {unit}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium">Price / Unit</p>
            <p className="font-bold text-slate-900">₹{price}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium">Total</p>
            <p className="font-bold text-emerald-700">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Pickup Info */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex gap-3 items-start">
          <Calendar className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-600 font-medium">Pickup Date</p>
            <p className="font-semibold text-slate-900">{pickupDate}</p>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <MapPin className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-600 font-medium">Pickup Location</p>
            <p className="font-semibold text-slate-900">{pickupLocation}</p>
          </div>
        </div>
      </div>

      {status === "pickup_ready" && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
          <p className="text-emerald-900">✓ Waiting for buyer pickup</p>
        </div>
      )}
    </div>
  );
}

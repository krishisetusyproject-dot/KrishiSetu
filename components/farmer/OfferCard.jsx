import { Check, X, ChevronRight } from "lucide-react";

export default function OfferCard({
  id,
  buyerName,
  produceName,
  requestedQuantity,
  unit,
  offeredPrice,
  totalValue,
  message,
  receivedDate,
  status,
  onAccept,
  onReject,
  onViewDetails,
}) {
  const statusColors = {
    pending: "bg-blue-50 text-blue-700 border-blue-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    expired: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const isActionable = status === "pending";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Buyer Offer</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{buyerName}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${statusColors[status] || statusColors.pending}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Offer Details */}
      <div className="space-y-3 bg-slate-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-600 font-medium">For</p>
            <p className="font-semibold text-slate-900">{requestedQuantity} {unit}</p>
            <p className="text-xs text-slate-600">{produceName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium">Offered Price</p>
            <p className="font-bold text-orange-600">₹{offeredPrice}/{unit}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-600 font-medium">Total Value</p>
            <p className="text-xl font-bold text-emerald-700">₹{totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Comparison with your asking price */}
        <div className="border-t border-slate-200 pt-3 mt-3 text-xs">
          <p className="text-slate-600">
            You asked for: <span className="font-semibold text-slate-900">₹{(totalValue / requestedQuantity).toFixed(0)}/{unit}</span>
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 border border-amber-200">
          <p className="text-xs font-medium text-amber-900 mb-1">Buyer Message</p>
          <p className="text-sm text-amber-900">{message}</p>
        </div>
      )}

      {/* Metadata */}
      <p className="text-xs text-slate-500 mb-4">Received {receivedDate}</p>

      {/* Actions */}
      <div className="flex gap-2">
        {isActionable ? (
          <>
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              Accept Offer
            </button>
            <button
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
            >
              <X className="h-4 w-4" />
              Reject
            </button>
          </>
        ) : (
          <button
            onClick={onViewDetails}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            View Details
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

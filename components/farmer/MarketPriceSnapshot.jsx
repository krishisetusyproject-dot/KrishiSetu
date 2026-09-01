import { Info } from "lucide-react";

export default function MarketPriceSnapshot({
  cropName,
  yourPrice,
  mspPrice,
  marketPrice,
  unit,
  status,
  loading = false,
}) {
  const getPriceStatus = () => {
    if (!yourPrice || !marketPrice) return null;

    if (yourPrice < marketPrice * 0.9) {
      return { label: "Below market range", color: "text-red-600", bg: "bg-red-50" };
    } else if (yourPrice > marketPrice * 1.1) {
      return { label: "Above market range", color: "text-orange-600", bg: "bg-orange-50" };
    } else {
      return { label: "Within market range", color: "text-emerald-600", bg: "bg-emerald-50" };
    }
  };

  const priceStatus = getPriceStatus();

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Market Price Snapshot</h3>
        <span className="text-xs font-semibold text-slate-500">Reference Guide</span>
      </div>

      <div className="mb-6">
        <p className="text-sm text-slate-600 mb-2">Crop</p>
        <p className="text-xl font-bold text-slate-900">{cropName || "No crop selected"}</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Your Price */}
        <div className="flex items-start justify-between p-4 rounded-lg bg-blue-50 border border-blue-100">
          <div>
            <p className="text-xs font-semibold text-blue-900 uppercase">Your Asking Price</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">₹{yourPrice || "—"}</p>
            <p className="text-xs text-blue-700 mt-1">per {unit}</p>
          </div>
        </div>

        {/* MSP Price */}
        {mspPrice && (
          <div className="flex items-start justify-between p-4 rounded-lg bg-yellow-50 border border-yellow-100">
            <div>
              <p className="text-xs font-semibold text-yellow-900 uppercase">MSP (Reference)</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">₹{mspPrice}</p>
              <p className="text-xs text-yellow-700 mt-1">Government benchmark</p>
            </div>
          </div>
        )}

        {/* Market Reference Price */}
        {marketPrice && (
          <div className="flex items-start justify-between p-4 rounded-lg bg-emerald-50 border border-emerald-100">
            <div>
              <p className="text-xs font-semibold text-emerald-900 uppercase">Market Reference</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">₹{marketPrice}</p>
              <p className="text-xs text-emerald-700 mt-1">APMC/Local Market Average</p>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      {priceStatus && yourPrice && (
        <div className={`rounded-lg p-4 ${priceStatus.bg}`}>
          <p className={`text-sm font-semibold ${priceStatus.color}`}>
            ✓ {priceStatus.label}
          </p>
        </div>
      )}

      {/* Info Note */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900 mb-1">📌 Important Note</p>
          <p className="text-blue-800 text-xs">
            MSP is shown as a reference benchmark. Actual transaction prices may vary based on market conditions, quality, location and buyer demand. KrishiSetu does not guarantee MSP or any fixed price.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EmptyState({
  icon = "📋",
  title,
  description,
  actionLabel,
  onAction,
  actionLabel2,
  onAction2,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="text-4xl mb-3">{icon}</p>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">{description}</p>
      <div className="flex gap-3 justify-center flex-wrap">
        {actionLabel && (
          <button
            onClick={onAction}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            {actionLabel}
          </button>
        )}
        {actionLabel2 && (
          <button
            onClick={onAction2}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white transition-colors"
          >
            {actionLabel2}
          </button>
        )}
      </div>
    </div>
  );
}

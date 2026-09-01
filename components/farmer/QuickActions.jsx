import { Plus, AlertCircle, Truck, TrendingUp, User } from "lucide-react";

export default function QuickActions({
  onSellProduce,
  onViewOffers,
  onViewOrders,
  onViewMarketPrices,
  onEditProfile,
}) {
  const actions = [
    {
      icon: Plus,
      label: "Sell Produce",
      onClick: onSellProduce,
      color: "bg-emerald-50 text-emerald-600",
      hoverColor: "hover:bg-emerald-100",
    },
    {
      icon: AlertCircle,
      label: "View Offers",
      onClick: onViewOffers,
      color: "bg-orange-50 text-orange-600",
      hoverColor: "hover:bg-orange-100",
    },
    {
      icon: Truck,
      label: "View Orders",
      onClick: onViewOrders,
      color: "bg-blue-50 text-blue-600",
      hoverColor: "hover:bg-blue-100",
    },
    {
      icon: TrendingUp,
      label: "Market Prices",
      onClick: onViewMarketPrices,
      color: "bg-purple-50 text-purple-600",
      hoverColor: "hover:bg-purple-100",
    },
    {
      icon: User,
      label: "Edit Profile",
      onClick: onEditProfile,
      color: "bg-slate-100 text-slate-600",
      hoverColor: "hover:bg-slate-200",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <button
            key={idx}
            onClick={action.onClick}
            className={`flex flex-col items-center gap-2 rounded-lg p-4 font-semibold text-sm ${action.color} ${action.hoverColor} transition-colors`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

import { Leaf, AlertCircle, TrendingUp } from "lucide-react";

export default function DashboardStats({
  activeProduce = 0,
  pendingOffers = 0,
  activeOrders = 0,
  totalSales = 0,
  loading = false,
}) {
  const stats = [
    {
      icon: Leaf,
      label: "Active Produce",
      value: activeProduce,
      subtext: "Currently listed",
      color: "emerald",
    },
    {
      icon: AlertCircle,
      label: "Pending Offers",
      value: pendingOffers,
      subtext: "Offers awaiting response",
      color: "orange",
    },
    {
      icon: TrendingUp,
      label: "Active Orders",
      value: activeOrders,
      subtext: "Orders in progress",
      color: "blue",
    },
    {
      icon: TrendingUp,
      label: "Total Sales",
      value: `₹${totalSales.toLocaleString()}`,
      subtext: "Completed sales",
      color: "green",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const colorClasses = {
          emerald: "bg-emerald-50 text-emerald-600",
          orange: "bg-orange-50 text-orange-600",
          blue: "bg-blue-50 text-blue-600",
          green: "bg-green-50 text-green-600",
        };

        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "..." : stat.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{stat.subtext}</p>
              </div>
              <div className={`rounded-lg p-3 ${colorClasses[stat.color]}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

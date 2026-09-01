import { ChevronDown, LogOut, Bell } from "lucide-react";

export default function FarmerHeader({ name, onLogout, notificationCount = 0 }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-emerald-950">KrishiSetu</span>
        </a>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative rounded-lg p-2 hover:bg-slate-100">
            <Bell className="h-5 w-5 text-slate-600" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{name}</p>
              <p className="text-xs text-slate-500">Farmer</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-950 font-bold">
              {name?.[0]?.toUpperCase() || "F"}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

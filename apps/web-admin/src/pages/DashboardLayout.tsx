import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuthStore } from "../store/adminAuthStore";
import { api } from "../api/client";

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuthStore();
  const [pendingCount, setPendingCount] = useState<number>(0);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setPendingCount(res.data.pending_count || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // refresh pending counter every 10s
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      path: "/",
      label: "Overview",
      icon: "📊",
    },
    {
      path: "/approvals",
      label: "Pending Approvals",
      icon: "⏳",
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      path: "/users",
      label: "User Management",
      icon: "👥",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col border-r border-slate-800">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-blue-600 text-white font-black text-sm px-2.5 py-1.5 rounded-lg shadow-md shadow-blue-500/20">
            UGNAY
          </div>
          <div>
            <h2 className="font-extrabold text-base leading-tight tracking-tight">
              Cooperative Admin
            </h2>
            <p className="text-[11px] text-slate-400">Management Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className="bg-amber-500 text-slate-950 font-black text-[11px] px-2 py-0.5 rounded-full shadow-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-sm">
              {admin?.full_name ? admin.full_name[0].toUpperCase() : "A"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-slate-200 truncate">
                {admin?.full_name || "Administrator"}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {admin?.email || "admin@ugnay.coop"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/40 rounded-lg border border-rose-900/40 transition cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-900">
            {navItems.find((n) => n.path === location.pathname)?.label ||
              "Dashboard"}
          </h1>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-500">
              System Live
            </span>
          </div>
        </header>
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};


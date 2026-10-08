import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { DashboardStats, User } from "../types";

export const Overview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPending, setRecentPending] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, pendingRes] = await Promise.all([
        api.get<DashboardStats>("/admin/stats"),
        api.get<User[]>("/admin/pending-registrations"),
      ]);
      setStats(statsRes.data);
      setRecentPending(pendingRes.data.slice(0, 5));
    } catch (e) {
      console.error("Failed to load overview data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const departmentMeta: Record<
    string,
    { name: string; icon: string; color: string }
  > = {
    logistics: {
      name: "Logistics & Inventory",
      icon: "📦",
      color: "border-sky-500 text-sky-700 bg-sky-50",
    },
    production: {
      name: "Production Department",
      icon: "🏭",
      color: "border-amber-500 text-amber-700 bg-amber-50",
    },
    marketing: {
      name: "Marketing & Distribution",
      icon: "📢",
      color: "border-rose-500 text-rose-700 bg-rose-50",
    },
    microfinance: {
      name: "Microfinance Division",
      icon: "💳",
      color: "border-emerald-500 text-emerald-700 bg-emerald-50",
    },
    savings: {
      name: "Savings & Deposits",
      icon: "💰",
      color: "border-purple-500 text-purple-700 bg-purple-50",
    },
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-slate-400 text-sm">
        Loading system overview metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Accounts</span>
            <span className="text-xl">👥</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">
            {stats?.total_users ?? 0}
          </div>
          <p className="mt-1 text-xs text-slate-400">Enrolled cooperative users</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/40 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase tracking-wider">
            <span>Pending Approvals</span>
            <span className="text-xl">⏳</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-600">
            {stats?.pending_count ?? 0}
          </div>
          <Link
            to="/approvals"
            className="mt-1 inline-block text-xs font-semibold text-amber-700 hover:text-amber-800 underline"
          >
            Review applications →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span>Active Operatives</span>
            <span className="text-xl">✅</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-600">
            {stats?.active_count ?? 0}
          </div>
          <p className="mt-1 text-xs text-emerald-700/80">Approved and operational</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Rejected Queue</span>
            <span className="text-xl">🛑</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-700">
            {stats?.rejected_count ?? 0}
          </div>
          <p className="mt-1 text-xs text-slate-400">Declined applications</p>
        </div>
      </div>

      {/* Role Distribution Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Department Operatives Distribution
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(departmentMeta).map(([roleKey, meta]) => {
            const count = stats?.by_role?.[roleKey] ?? 0;
            return (
              <div
                key={roleKey}
                className={`p-4 rounded-xl border ${meta.color} flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{meta.icon}</span>
                  <span className="text-xl font-black">{count}</span>
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {meta.name}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Pending Applicants Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pending Registrations Requiring Review
            </h3>
            <p className="text-xs text-slate-500">
              Applicants awaiting identity verification and role assignment
            </p>
          </div>
          <Link
            to="/approvals"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg transition"
          >
            Go to Approvals Queue ({recentPending.length}) →
          </Link>
        </div>

        {recentPending.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            🎉 No pending registrations! All applications have been reviewed.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentPending.map((user) => (
              <div
                key={user.id}
                className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/80 transition"
              >
                <div className="flex items-center space-x-4">
                  {user.face_data?.image_url ? (
                    <img
                      src={user.face_data.image_url}
                      alt={user.full_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center shrink-0">
                      {user.full_name[0]}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {user.full_name}
                    </h4>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Registered:{" "}
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Link
                  to="/approvals"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Review & Assign Role
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

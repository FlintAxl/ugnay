import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import type { User, UserRole, UserStatus } from "../types";
import { ImageModal } from "../components/ImageModal";

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [zoomImage, setZoomImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get<User[]>("/admin/users", { params });
      setUsers(res.data);
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus =
      user.status === "active" ? "suspended" : "active";
    const confirmPrompt = window.confirm(
      `Are you sure you want to change ${user.full_name}'s status to ${nextStatus.toUpperCase()}?`
    );
    if (!confirmPrompt) return;

    try {
      await api.patch(`/admin/users/${user.id}/status`, {
        status: nextStatus,
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update user status.");
    }
  };

  const getRoleBadge = (role?: UserRole | null) => {
    if (!role) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
          Unassigned
        </span>
      );
    }
    const styles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800 border-purple-200",
      logistics: "bg-sky-100 text-sky-800 border-sky-200",
      production: "bg-amber-100 text-amber-800 border-amber-200",
      marketing: "bg-rose-100 text-rose-800 border-rose-200",
      microfinance: "bg-emerald-100 text-emerald-800 border-emerald-200",
      savings: "bg-violet-100 text-violet-800 border-violet-200",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${
          styles[role] || "bg-gray-100 text-gray-800"
        }`}
      >
        {role}
      </span>
    );
  };

  const getStatusBadge = (status: UserStatus) => {
    const styles: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-800 border-emerald-200",
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      suspended: "bg-gray-200 text-gray-800 border-gray-300",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
          styles[status] || ""
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member name or email..."
            className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-l-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-r-xl transition cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="logistics">Logistics</option>
              <option value="production">Production</option>
              <option value="marketing">Marketing</option>
              <option value="microfinance">Microfinance</option>
              <option value="savings">Savings</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <button
            onClick={fetchUsers}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            Loading member directory...
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            No users match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-6">Assigned Department</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6">Biometric Profile</th>
                  <th className="py-3.5 px-6">Approved By</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition">
                    {/* User profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {user.face_data?.image_url ? (
                          <img
                            src={user.face_data.image_url}
                            alt={user.full_name}
                            onClick={() =>
                              setZoomImage({
                                url: user.face_data.image_url!,
                                title: user.full_name,
                              })
                            }
                            className="w-10 h-10 rounded-full object-cover border border-slate-300 cursor-pointer hover:opacity-80 transition"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">
                            {user.full_name[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {user.full_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department Role */}
                    <td className="py-4 px-6">{getRoleBadge(user.role)}</td>

                    {/* Status */}
                    <td className="py-4 px-6">{getStatusBadge(user.status)}</td>

                    {/* Face status */}
                    <td className="py-4 px-6 text-xs">
                      {user.face_data?.is_registered ? (
                        <span className="text-emerald-700 font-medium">
                          ✓ Face Enrolled
                        </span>
                      ) : (
                        <span className="text-slate-400">Not Registered</span>
                      )}
                    </td>

                    {/* Approved info */}
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {user.approval?.approved_by ? (
                        <div>
                          <span className="font-semibold text-slate-700">
                            {user.approval.approved_by}
                          </span>
                          <div className="text-[11px] text-slate-400">
                            {user.approval.approved_at
                              ? new Date(
                                  user.approval.approved_at
                                ).toLocaleDateString()
                              : ""}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                            user.status === "active"
                              ? "bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {user.status === "active"
                            ? "Suspend"
                            : "Reactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image zoom modal */}
      <ImageModal
        isOpen={Boolean(zoomImage)}
        imageUrl={zoomImage?.url || null}
        title={zoomImage?.title || ""}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
};

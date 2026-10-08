import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import type { User, UserRole } from "../types";
import { ImageModal } from "../components/ImageModal";
import { ApproveModal } from "../components/ApproveModal";
import { RejectModal } from "../components/RejectModal";

export const Approvals: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [zoomImage, setZoomImage] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [userToApprove, setUserToApprove] = useState<User | null>(null);
  const [userToReject, setUserToReject] = useState<User | null>(null);

  const fetchPendingUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<User[]>("/admin/pending-registrations");
      setUsers(res.data);
    } catch (e) {
      console.error("Failed to fetch pending registrations:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = async (assignedRole: UserRole) => {
    if (!userToApprove) return;
    try {
      setActionLoading(true);
      const res = await api.patch(
        `/admin/registrations/${userToApprove.id}/approve`,
        { role: assignedRole }
      );
      showToast(
        `✓ ${res.data.full_name} was approved and assigned to ${assignedRole.toUpperCase()}!`
      );
      setUserToApprove(null);
      await fetchPendingUsers();
    } catch (err: any) {
      alert(
        err.response?.data?.detail || "Failed to approve registration."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!userToReject) return;
    try {
      setActionLoading(true);
      const res = await api.patch(
        `/admin/registrations/${userToReject.id}/reject`,
        { reason }
      );
      showToast(`⚠️ Application for ${res.data.full_name} was rejected.`);
      setUserToReject(null);
      await fetchPendingUsers();
    } catch (err: any) {
      alert(
        err.response?.data?.detail || "Failed to reject registration."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Pending User Approvals ({users.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify member identity selfies and designate their department role
            before activating account access.
          </p>
        </div>
        <button
          onClick={fetchPendingUsers}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5"
        >
          <span>🔄</span>
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Applications Table / Cards */}
      {isLoading ? (
        <div className="bg-white p-16 rounded-2xl border border-slate-200/80 text-center text-slate-400 text-sm">
          Loading pending queue...
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-slate-200/80 text-center">
          <span className="text-4xl">🎉</span>
          <h3 className="text-base font-bold text-slate-800 mt-3">
            All Caught Up!
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            There are currently no new registration applications waiting for
            approval.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Applicant Photo</th>
                  <th className="py-3.5 px-6">Full Name & Email</th>
                  <th className="py-3.5 px-6">Contact Number</th>
                  <th className="py-3.5 px-6">Biometric Status</th>
                  <th className="py-3.5 px-6">Registered Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition">
                    {/* Selfie Photo */}
                    <td className="py-4 px-6">
                      {user.face_data?.image_url ? (
                        <div
                          onClick={() =>
                            setZoomImage({
                              url: user.face_data.image_url!,
                              title: `${user.full_name} - Biometric Facial Photo`,
                            })
                          }
                          className="relative group cursor-pointer w-14 h-14"
                        >
                          <img
                            src={user.face_data.image_url}
                            alt={user.full_name}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-blue-400 shadow-xs group-hover:opacity-90 transition"
                          />
                          <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                            🔍
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs text-center font-medium">
                          No Photo
                        </div>
                      )}
                    </td>

                    {/* Name & Email */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">
                        {user.full_name}
                      </div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {user.phone || "—"}
                    </td>

                    {/* Biometrics */}
                    <td className="py-4 px-6">
                      {user.face_data?.is_registered ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Face Enrolled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          ⚠️ Not Captured
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(user.created_at).toLocaleString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          onClick={() => setUserToReject(user)}
                          className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setUserToApprove(user)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition shadow-xs flex items-center space-x-1"
                        >
                          <span>Assign Role & Approve</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <ImageModal
        isOpen={Boolean(zoomImage)}
        imageUrl={zoomImage?.url || null}
        title={zoomImage?.title || ""}
        onClose={() => setZoomImage(null)}
      />

      <ApproveModal
        isOpen={Boolean(userToApprove)}
        user={userToApprove}
        isLoading={actionLoading}
        onClose={() => setUserToApprove(null)}
        onApprove={handleApprove}
      />

      <RejectModal
        isOpen={Boolean(userToReject)}
        user={userToReject}
        isLoading={actionLoading}
        onClose={() => setUserToReject(null)}
        onReject={handleReject}
      />
    </div>
  );
};

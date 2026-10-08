import React, { useState } from "react";
import type { User } from "../types";

interface RejectModalProps {
  isOpen: boolean;
  user: User | null;
  isLoading: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
}

const QUICK_REASONS = [
  "Facial photo is blurry or obscured. Please retake with clear frontal lighting.",
  "Unverified cooperative membership credentials.",
  "Duplicate registration detected.",
];

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  user,
  isLoading,
  onClose,
  onReject,
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onReject(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-red-600">
              Reject Registration Application
            </h3>
            <p className="text-xs text-gray-500">
              Provide an explanation reason for the applicant
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <span className="text-xs font-semibold text-red-800">Applicant:</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {user.full_name} ({user.email})
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Reason for Rejection *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this application was not approved..."
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
            />

            {/* Quick Reasons Chips */}
            <div className="mt-2 space-y-1">
              <span className="text-[11px] font-semibold text-gray-400">
                Quick templates:
              </span>
              {QUICK_REASONS.map((r, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setReason(r)}
                  className="block text-left text-[11px] text-gray-600 hover:text-red-600 hover:underline cursor-pointer truncate max-w-full"
                >
                  • {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-bold cursor-pointer transition shadow-sm"
            >
              {isLoading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

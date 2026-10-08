import React, { useState } from "react";
import type { User, UserRole } from "../types";

interface ApproveModalProps {
  isOpen: boolean;
  user: User | null;
  isLoading: boolean;
  onClose: () => void;
  onApprove: (role: UserRole) => void;
}

const ROLES: { id: UserRole; name: string; desc: string; icon: string }[] = [
  {
    id: "logistics",
    name: "Logistics",
    desc: "Warehouse inventory management, supply tracking & AI demand prediction.",
    icon: "📦",
  },
  {
    id: "production",
    name: "Production",
    desc: "Manufacturing runs, raw material usage, processing batches & output.",
    icon: "🏭",
  },
  {
    id: "marketing",
    name: "Marketing",
    desc: "Sales channels, product orders, customer records & market campaigns.",
    icon: "📢",
  },
  {
    id: "microfinance",
    name: "Microfinance",
    desc: "Member loan applications, credit approval, disbursements & repayments.",
    icon: "💳",
  },
  {
    id: "savings",
    name: "Savings",
    desc: "Member deposit passbooks, account balances, withdrawals & dividends.",
    icon: "💰",
  },
];

export const ApproveModal: React.FC<ApproveModalProps> = ({
  isOpen,
  user,
  isLoading,
  onClose,
  onApprove,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("logistics");

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Approve Member & Assign Role
            </h3>
            <p className="text-xs text-gray-500">
              Select the operational role for this applicant
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        {/* Applicant Profile Card */}
        <div className="my-4 p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center space-x-3">
          {user.face_data?.image_url ? (
            <img
              src={user.face_data.image_url}
              alt={user.full_name}
              className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center shrink-0">
              {user.full_name[0].toUpperCase()}
            </div>
          )}
          <div className="overflow-hidden">
            <h4 className="font-bold text-gray-900 text-sm truncate">
              {user.full_name}
            </h4>
            <p className="text-xs text-gray-600 truncate">{user.email}</p>
            <p className="text-xs text-gray-500">{user.phone || "No phone"}</p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Designate Operational Department
          </label>
          <div className="space-y-2">
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{role.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-bold ${
                          isSelected ? "text-blue-900" : "text-gray-800"
                        }`}
                      >
                        {role.name}
                      </span>
                      {isSelected && (
                        <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {role.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApprove(selectedRole)}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold cursor-pointer transition shadow-sm flex items-center justify-center space-x-1"
          >
            {isLoading ? (
              <span>Activating...</span>
            ) : (
              <span>Confirm & Approve</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

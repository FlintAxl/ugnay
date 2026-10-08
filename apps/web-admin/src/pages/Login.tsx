import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAdminAuthStore } from "../store/adminAuthStore";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAdminAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFillDemoAdmin = () => {
    setEmail("admin@ugnay.coop");
    setPassword("AdminPassword123!");
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setIsLoading(true);
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password: password,
      });

      const { user, access_token } = res.data;
      if (user.role !== "admin") {
        setErrorMessage(
          "Access Denied: This web administration portal is strictly restricted to Cooperative Administrators. Mobile roles must log in via the Android application."
        );
        return;
      }

      setAuth(user, access_token);
      navigate("/");
    } catch (err: any) {
      console.error("Admin login error:", err);
      const detail = err.response?.data?.detail;
      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Invalid email or password. Please verify credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-600 text-white font-black text-xl tracking-widest px-4 py-2 rounded-xl mb-3 shadow-lg shadow-blue-500/20">
            UGNAY
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Cooperative Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Web Portal for User Verification & System Management
          </p>
        </div>

        {/* Demo Helper Banner */}
        <div className="mb-6 p-3 bg-blue-950/60 rounded-xl border border-blue-800/80 flex items-center justify-between">
          <div className="text-xs text-blue-300">
            <span className="font-bold text-blue-200">Default Admin:</span>
            <br />
            admin@ugnay.coop
          </div>
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 px-3 rounded-lg cursor-pointer transition"
          >
            Fill Credentials
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-900/40 border border-red-700/60 rounded-xl text-xs text-red-200 leading-relaxed">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ugnay.coop"
              className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 cursor-pointer transition text-sm flex items-center justify-center"
          >
            {isLoading ? "Authenticating..." : "Sign In to Admin Dashboard"}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-700/60 text-center">
          <p className="text-[11px] text-slate-500">
            UGNAY Cooperative System • Capstone Project
          </p>
        </div>
      </div>
    </div>
  );
};


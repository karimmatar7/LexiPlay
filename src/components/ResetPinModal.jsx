import React from "react";
import { useTranslation } from "react-i18next";

export default function ResetPinModal({
  show,
  name,
  recoveryCode,
  newPin,
  error,
  onNameChange,
  onRecoveryCodeChange,
  onNewPinChange,
  onReset,
  onClose,
}) {
  const { t } = useTranslation();
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-[0_25px_60px_rgba(15,23,42,0.25)] border border-gray-100 p-6 sm:p-8 w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3 bg-purple-50 rounded-2xl p-3 border border-purple-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-purple-600"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">
            {t("resetpin.title")}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              {t("name")}
            </label>
            <input
              type="text"
              placeholder={t("name")}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              {t("resetpin.recovery_code")}
            </label>
            <input
              type="text"
              placeholder={t("resetpin.recovery_code")}
              value={recoveryCode}
              onChange={(e) => onRecoveryCodeChange(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              {t("resetpin.new_pin")}
            </label>
            <input
              type="password"
              placeholder={t("resetpin.new_pin")}
              value={newPin}
              onChange={(e) => onNewPinChange(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 tracking-widest transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-3 flex items-start gap-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-red-700 font-semibold text-sm leading-relaxed">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-7">
          <button
            onClick={onClose}
            className="flex-1 order-2 sm:order-1 bg-white hover:bg-gray-50 text-gray-600 py-3 rounded-full font-bold border border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-200"
          >
            {t("close")}
          </button>

          <button
            onClick={onReset}
            className="flex-1 order-1 sm:order-2 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-full font-bold shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_10px_24px_rgba(16,185,129,0.45)] transition-all duration-200"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 flex-shrink-0"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>{t("resetpin.reset_pin")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
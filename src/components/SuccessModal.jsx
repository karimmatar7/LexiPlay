import React from "react";
import { useTranslation } from "react-i18next";

export default function SuccessModal({ show, onClose }) {
  const { t } = useTranslation();
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-[0_25px_60px_rgba(15,23,42,0.25)] border border-emerald-100 p-6 sm:p-8 w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-emerald-500"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-emerald-600 mb-2">
          {t("modals.success.title")}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {t("modals.success.subtitle")}
        </p>

        <button
          onClick={onClose}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-full font-bold shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_10px_24px_rgba(16,185,129,0.45)] transition-all duration-200"
        >
          {t("modals.success.button")}
        </button>
      </div>
    </div>
  );
}
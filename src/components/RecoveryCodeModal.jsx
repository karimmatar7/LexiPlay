import React from "react";
import { useTranslation } from "react-i18next";

export default function RecoveryCodeModal({
  show,
  recoveryCode,
  copied,
  onCopy,
  onClose,
}) {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-[0_25px_60px_rgba(15,23,42,0.25)] border border-gray-100 p-6 sm:p-8 w-full max-w-sm text-center">
        <div className="flex flex-col items-center mb-5">
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
              <path d="M12 2l2.09 6.26L20 9l-5 4.14L16.18 20 12 16.6 7.82 20 9 13.14 4 9l5.91-.74L12 2z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-purple-700">
            {t("modals.recoveryCode.title")}
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          {t("modals.recoveryCode.instructions")}
        </p>

        {/* Recovery Code Display */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 flex justify-center items-center mb-6">
          <p className="text-xl sm:text-2xl font-black text-purple-700 tracking-widest break-all">
            {recoveryCode}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onCopy}
            className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-purple-50 text-purple-700 py-3 rounded-full font-bold border border-purple-200 hover:border-purple-300 shadow-sm transition-all duration-200"
          >
            {copied ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-shrink-0 text-emerald-500" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
            <span>{copied ? t("modals.recoveryCode.copied") : t("modals.recoveryCode.copy")}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-full font-bold shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_10px_24px_rgba(16,185,129,0.45)] transition-all duration-200"
          >
            {t("modals.recoveryCode.understood")}
          </button>
        </div>

        {/* Warning */}
        <div className="mt-5 bg-red-50 border border-red-200 rounded-2xl p-3 flex items-start gap-2.5 text-left">
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
          <p className="text-xs text-red-700 font-semibold leading-relaxed">
            {t("modals.recoveryCode.warning")}
          </p>
        </div>
      </div>
    </div>
  );
}
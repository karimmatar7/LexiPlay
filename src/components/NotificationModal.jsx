import React from "react";
import { useTranslation } from "react-i18next";

export default function NotificationModal({
  show,
  onClose,
  title,
  message,
  type = "success",
}) {
  const { t } = useTranslation();

  if (!show) return null;

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warning: "⚠️",
  };

  const colors = {
    success: "border-green-400",
    error: "border-red-400",
    info: "border-blue-400",
    warning: "border-yellow-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-3xl border-4 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.25)] sm:p-8 ${colors[type]}`}
        role="dialog"
        aria-modal="true"
        aria-live="assertive"
      >
        <div className="space-y-4 text-center">
          <div className="text-6xl" aria-hidden="true">
            {icons[type]}
          </div>

          {title && (
            <h2 className="text-2xl font-black text-gray-900">{title}</h2>
          )}

          <p className="text-lg font-medium text-gray-700">{message}</p>

          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="mt-4 inline-flex min-w-32 items-center justify-center gap-2.5 rounded-full bg-purple-600 px-8 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(147,51,234,0.35)] transition-all duration-200 hover:bg-purple-700 hover:shadow-[0_10px_24px_rgba(147,51,234,0.45)] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 active:scale-[0.98]"
          >
            {t("notificationModal.ok")}
          </button>
        </div>
      </div>
    </div>
  );
}
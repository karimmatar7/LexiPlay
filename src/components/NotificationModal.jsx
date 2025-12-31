import React from "react";
import { useTranslation } from "react-i18next";

export default function NotificationModal({ show, onClose, title, message, type = "success" }) {
  const { t } = useTranslation();
  if (!show) return null;

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warning: "⚠️"
  };

  const colors = {
    success: "bg-green-100 border-green-400",
    error: "bg-red-100 border-red-400",
    info: "bg-blue-100 border-blue-400",
    warning: "bg-yellow-100 border-yellow-400"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-3xl shadow-2xl border-4 ${colors[type]} max-w-md w-full p-8 transform transition-all`}>
        <div className="text-center space-y-4">
          <div className="text-6xl">{icons[type]}</div>
          {title && <h2 className="text-2xl font-bold text-gray-800">{title}</h2>}
          <p className="text-lg text-gray-700">{message}</p>
          <button
            onClick={onClose}
            className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-md hover:shadow-lg border-b-4 border-indigo-700 transform hover:scale-105 transition-all duration-200"
          >
            {t("notificationModal.ok")}
          </button>
        </div>
      </div>
    </div>
  );
}

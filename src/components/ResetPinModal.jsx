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
  onClose 
}) {
  const { t } = useTranslation();
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-lg">
        <h2 className="text-xl font-bold text-purple-700 text-center">{t("resetpin.title")}</h2>
        
        <input
          type="text"
          placeholder={t("name")}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
        />
        
        <input
          type="text"
          placeholder={t("resetpin.recovery_code")}
          value={recoveryCode}
          onChange={(e) => onRecoveryCodeChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
        />
        
        <input
          type="password"
          placeholder={t("resetpin.new_pin")}
          value={newPin}
          onChange={(e) => onNewPinChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
        />
        
        {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
        
        <div className="flex justify-center gap-3">
          <button
            onClick={onReset}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl font-bold"
          >
            🔑 {t("resetpin.reset_pin")}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-xl font-bold"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

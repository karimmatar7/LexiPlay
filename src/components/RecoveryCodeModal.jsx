import React from "react";
import { useTranslation } from "react-i18next";

export default function RecoveryCodeModal({ 
  show, 
  recoveryCode, 
  copied, 
  onCopy, 
  onClose 
}) {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center space-y-4 shadow-lg">
        <h2 className="text-xl font-bold text-purple-700">✨ {t("modals.recoveryCode.title")}</h2>
        <p className="text-sm text-gray-600">{t("modals.recoveryCode.instructions")}</p>
        
        {/* Recovery Code Display */}
        <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 flex justify-center items-center">
          <p className="text-2xl font-black text-purple-700 tracking-widest break-all">
            {recoveryCode}
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onCopy}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {copied ? t("modals.recoveryCode.copied") : t("modals.recoveryCode.copy")}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {t("modals.recoveryCode.understood")}
          </button>
        </div>
        
        {/* Warning */}
        <p className="text-xs text-red-600 font-bold">{t("modals.recoveryCode.warning")}</p>
      </div>
    </div>
  );
}

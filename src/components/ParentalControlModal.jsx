import React from "react";
import { useTranslation } from "react-i18next";

export default function ParentalControlModal({ show, returnTime, onClose }) {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50 p-6">
      <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-lg border-4 border-red-400">
        <div className="text-6xl mb-4">⏰</div>
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          {t("parentalControlModal.limitReached")}
        </h2>
   <p className="text-lg text-gray-700 mb-6">
  {t("parentalControlModal.message")}
  <br/>
  <span className="font-bold text-purple-700">
    {t(`parentalControlModal.${returnTime}`)}
  </span>
</p>


        <button 
          onClick={onClose}
          className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-md hover:shadow-lg border-b-4 border-purple-800 transform hover:scale-105 transition-all"
        >
          {t("parentalControlModal.okButton")}
        </button>
      </div>
    </div>
  );
}

// src/components/ParentalControlModal.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import AppButton from "./AppButton";

export default function ParentalControlModal({ show, returnTime, onClose }) {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50 p-6">
      <div className="w-full max-w-md rounded-3xl border-4 border-red-400 bg-white p-8 text-center shadow-lg">
        <div className="mb-4 text-6xl">⏰</div>

        <h2 className="mb-4 text-3xl font-bold text-red-600">
          {t("parentalControlModal.limitReached")}
        </h2>

        <p className="mb-6 text-lg text-gray-700">
          {t("parentalControlModal.message")}
          <br />
          <span className="font-bold text-purple-700">
            {t(`parentalControlModal.${returnTime}`)}
          </span>
        </p>

        <AppButton
          type="button"
          onClick={onClose}
          variant="indigo"
          size="lg"
          className="min-w-36"
        >
          {t("parentalControlModal.okButton")}
        </AppButton>
      </div>
    </div>
  );
}
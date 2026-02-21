import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function PrintButton() {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl border-b-4 border-purple-800 hover:scale-105 transition-all duration-200 text-sm shadow-md"
    >
      🖨️ {t("print.button")}
    </button>
  );
}

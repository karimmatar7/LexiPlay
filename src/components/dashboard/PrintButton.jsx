import React from "react";
import { useTranslation } from "react-i18next";
import printIcon from "../../assets/icons/print.png";

export default function PrintButton() {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-[0_8px_20px_rgba(147,51,234,0.35)] hover:shadow-[0_10px_24px_rgba(147,51,234,0.45)] transition-all duration-200 text-sm"
    >
      <img
        src={printIcon}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="h-4 w-4 object-contain flex-shrink-0"
      />
      <span>{t("print.button")}</span>
    </button>
  );
}
// src/components/dashboard/PrintButton.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import AppButton from "../AppButton";
import printIcon from "../../assets/icons/print.png";

export default function PrintButton() {
  const { t } = useTranslation();

  return (
    <AppButton
      type="button"
      onClick={() => window.print()}
      variant="purple"
      size="sm"
      className="px-5"
    >
      <img
        src={printIcon}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="h-4 w-4 shrink-0 object-contain"
      />

      <span>{t("print.button")}</span>
    </AppButton>
  );
}
import React from "react";
import { useTranslation } from "react-i18next";
import useAppLanguage from "../hooks/useAppLanguage";

export default function LanguageButton({
  labelKey = "changeLanguage",
  className = "",
}) {
  const { t } = useTranslation();
  const { languageCode, cycleLanguage } = useAppLanguage();

  return (
    <button
      type="button"
      onClick={cycleLanguage}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 ${className}`}
      aria-label={t(labelKey)}
      title={t(labelKey)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
        />
      </svg>

      {languageCode}
    </button>
  );
}
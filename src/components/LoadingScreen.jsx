import React from "react";
import { useTranslation } from "react-i18next";
import AppButton from "./AppButton";

export default function LoadingScreen({ startNewGame, fontClass, sizeMap }) {
  const { t } = useTranslation();

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-4 ${fontClass} ${
        sizeMap?.small || "text-base"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-20 top-20 h-48 w-48 rounded-full bg-purple-200 opacity-30" />
        <div className="absolute bottom-20 right-20 h-56 w-56 rounded-full bg-pink-200 opacity-25" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border-3 border-indigo-300 bg-white p-8 text-center shadow-lg md:p-12">
        <div className="mb-6 inline-block rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-100 to-purple-100 p-8 shadow-sm">
          <span className="text-7xl md:text-8xl">🔤</span>
        </div>

        <p className="mb-6 text-2xl font-black text-indigo-700 md:text-3xl">
          {t("loadingScreen.loading")}
          <span className="inline-block animate-bounce">.</span>
          <span
            className="inline-block animate-bounce"
            style={{ animationDelay: "0.1s" }}
          >
            .
          </span>
          <span
            className="inline-block animate-bounce"
            style={{ animationDelay: "0.2s" }}
          >
            .
          </span>
        </p>

        <div className="mb-6 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>

        {startNewGame && (
          <AppButton
            type="button"
            onClick={startNewGame}
            variant="indigo"
            size="lg"
          >
            {t("loadingScreen.startNewGame")}
          </AppButton>
        )}
      </div>
    </div>
  );
}
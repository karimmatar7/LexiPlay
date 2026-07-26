import React from "react";
import { useTranslation } from "react-i18next";
import playIcon from "../assets/icons/play.png";
import pauseIcon from "../assets/icons/pause.png";

export default function PauseOverlay() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-20">
      <div className="inline-block bg-gradient-to-br from-amber-100 to-yellow-100 border-3 border-amber-300 rounded-3xl p-10 mb-6 shadow-sm">
        <span className="text-8xl md:text-9xl">
          <img
            src={pauseIcon}
            alt=""
            aria-hidden="true"
            draggable="false"
            className="h-16 w-16 object-contain"
          />
        </span>
      </div>

      <h2 className="text-3xl md:text-4xl font-black text-amber-700 mb-4">
        {t("pauseOverlay.paused")}
      </h2>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-6 py-4 shadow-sm">
        <p className="flex items-center justify-center gap-2 text-lg md:text-xl text-gray-700 font-medium">
          <img
            src={playIcon}
            alt=""
            aria-hidden="true"
            draggable="false"
            className="h-5 w-5 shrink-0 object-contain"
          />
          <span>{t("pauseOverlay.clickToContinue")}</span>
        </p>
      </div>
    </div>
  );
}
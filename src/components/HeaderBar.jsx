import React from "react";
import { useTranslation } from "react-i18next";
import homeIcon from "../assets/icons/home.png";
import keyIcon from "../assets/icons/key.png";
import playIcon from "../assets/icons/play.png";
import pauseIcon from "../assets/icons/pause.png";

export default function HeaderBar({
  keys = 0,
  paused,
  onPauseToggle,
  onHome,
  onReset,
}) {
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      <div className="rounded-3xl border border-purple-100 bg-white/95 backdrop-blur-sm p-4 shadow-[0_14px_30px_rgba(147,51,234,0.08)] md:p-5">
        <div className="flex items-center justify-between">
          {/* Left: Home + Keys */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={onHome}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-400 hover:bg-pink-500 shadow-[0_8px_20px_rgba(244,114,182,0.4)] hover:shadow-[0_10px_24px_rgba(244,114,182,0.5)] transition-all duration-200 md:h-14 md:w-14"
            >
              <img
                src={homeIcon}
                alt={t("header.home") || "Home"}
                draggable="false"
                className="h-6 w-6 object-contain"
              />
            </button>

            {/* Keys display: same height as Home/Pause */}
            <div className="flex h-12 items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 shadow-sm md:h-14">
              <img
                src={keyIcon}
                alt=""
                aria-hidden="true"
                draggable="false"
                className="h-5 w-5 shrink-0 object-contain md:h-6 md:w-6"
              />

              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  {t("header.keys") || "Keys"}
                </span>

                <span className="text-xl font-black text-yellow-600 md:text-2xl">
                  {keys}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Pause */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={onPauseToggle}
              className={`flex h-12 w-12 items-center justify-center rounded-full font-bold transition-all duration-200 md:h-14 md:w-14 ${
                paused
                  ? "bg-emerald-400 hover:bg-emerald-500 shadow-[0_8px_20px_rgba(52,211,153,0.4)] hover:shadow-[0_10px_24px_rgba(52,211,153,0.5)]"
                  : "bg-amber-400 hover:bg-amber-500 shadow-[0_8px_20px_rgba(251,191,36,0.4)] hover:shadow-[0_10px_24px_rgba(251,191,36,0.5)]"
              }`}
            >
              <img
                src={paused ? playIcon : pauseIcon}
                alt={paused ? "Play" : "Pause"}
                draggable="false"
                className="h-6 w-6 object-contain"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
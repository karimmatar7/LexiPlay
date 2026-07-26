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
      <div className="rounded-2xl border-2 border-purple-200 bg-white p-4 shadow-md md:p-5">
        <div className="flex items-center justify-between">
          {/* Left: Home + Keys */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={onHome}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-pink-500 bg-pink-400 shadow-sm transition-all duration-200 hover:scale-110 hover:bg-pink-500 hover:shadow-md md:h-14 md:w-14"
            >
              <img
                src={homeIcon}
                alt={t("header.home") || "Home"}
                draggable="false"
                className="h-6 w-6 object-contain"
              />
            </button>

            {/* Keys display: same height as Home/Pause */}
            <div className="flex h-12 items-center gap-2 rounded-xl border-2 border-yellow-300 bg-yellow-50 px-3 shadow-sm md:h-14">
              <img
                src={keyIcon}
                alt=""
                aria-hidden="true"
                draggable="false"
                className="h-5 w-5 shrink-0 object-contain md:h-6 md:w-6"
              />

              <div className="flex flex-col leading-none">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  {t("header.keys") || "Keys"}
                </span>

                <span className="text-2xl font-black text-yellow-600 md:text-3xl">
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
              className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 font-bold shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md md:h-14 md:w-14 ${
                paused
                  ? "border-green-500 bg-green-400 hover:bg-green-500"
                  : "border-amber-500 bg-amber-400 hover:bg-amber-500"
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
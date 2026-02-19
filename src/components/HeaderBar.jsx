import React from "react";
import { useTranslation } from "react-i18next";

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
      <div className="bg-white rounded-2xl border-2 border-purple-200 p-4 md:p-5 shadow-md">
        <div className="flex items-center justify-between">

          {/* Left: Home + Keys */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onHome}
              className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-pink-400 hover:bg-pink-500 border-2 border-pink-500 rounded-xl shadow-sm hover:shadow-md transform hover:scale-110 transition-all duration-200"
            >
              <span className="text-2xl md:text-3xl">🏠</span>
            </button>

            {/* Keys display */}
            <div className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-300 px-3 py-2 rounded-xl shadow-sm">
              <span className="text-2xl md:text-3xl">🗝️</span>
              <div className="flex flex-col leading-none">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                  {t("header.keys") || "Keys"}
                </span>
                <span className="text-2xl md:text-3xl font-black text-yellow-600">
                  {keys}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Pause + Reset */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onPauseToggle}
              className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl font-bold shadow-sm hover:shadow-md border-2 transform hover:scale-110 transition-all duration-200 ${
                paused
                  ? "bg-green-400 hover:bg-green-500 border-green-500"
                  : "bg-amber-400 hover:bg-amber-500 border-amber-500"
              }`}
            >
              <span className="text-2xl md:text-3xl text-white">
                {paused ? "▶️" : "⏸️"}
              </span>
            </button>

            <button
              onClick={onReset}
              className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-red-400 hover:bg-red-500 border-2 border-red-500 rounded-xl shadow-sm hover:shadow-md transform hover:scale-110 transition-all duration-200"
            >
              <span className="text-2xl md:text-3xl">🔄</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

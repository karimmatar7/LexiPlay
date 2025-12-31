import React from "react"
import { calculateStars } from "../utils/progressStars"
import { useTranslation } from "react-i18next";

export default function HeaderBar({
  score,
  total,
  paused,
  onPauseToggle,
  onHome,
  onReset,
  rewardsEarned = [false, false, false] // <-- default so it never crashes
}) {
  const progressPercent = total > 0 ? (score / total) * 100 : 0;
  const stars = calculateStars(progressPercent);
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      <div className="bg-white rounded-2xl border-3 border-purple-200 p-4 md:p-5 shadow-md">
        <div className="flex items-center justify-between">
          {/* Left: Home + Score */}
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={onHome} className="group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-pink-400 hover:bg-pink-500 border-2 border-pink-500 rounded-xl shadow-sm hover:shadow-md transform hover:scale-110 transition-all duration-200">
              <span className="text-2xl md:text-3xl">🏠</span>
            </button>
            <div className="flex flex-col">
              <p className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wide">{t("header.score")}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl md:text-4xl font-black text-pink-600">{score}</span>
                <span className="text-lg md:text-xl text-gray-400 font-bold">/ {total}</span>
              </div>
            </div>
          </div>

          {/* Right: Stars + Controls */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden sm:flex gap-1 bg-amber-50 border-2 border-amber-200 px-3 py-2 rounded-xl shadow-sm">
              {[0, 1, 2].map(i => (
                <span 
                  key={i} 
                  className={`text-xl md:text-2xl transition-all duration-300 ${
                    rewardsEarned[i] ? "scale-110 text-yellow-400" : "opacity-30 grayscale"
                  }`}
                >
                  {rewardsEarned[i] ? "🌟" : "⭐"}
                </span>
              ))}
            </div>

            <button
              onClick={onPauseToggle}
              className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl font-bold shadow-sm hover:shadow-md border-2 transform hover:scale-110 transition-all duration-200 ${
                paused 
                  ? "bg-green-400 hover:bg-green-500 border-green-500" 
                  : "bg-amber-400 hover:bg-amber-500 border-amber-500"
              }`}
            >
              <span className="text-2xl md:text-3xl text-white">{paused ? "▶️" : "⏸️"}</span>
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
  )
}


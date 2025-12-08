import React from "react"
import { Link } from "react-router-dom"

export default function HeaderBar({ score, total, paused, onPauseToggle, onHome }) {
  const stars = total > 0 ? Math.min(3, Math.ceil((score / total) * 3)) : 0

  return (
    <div className="mb-6 space-y-3">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 md:p-5 shadow-2xl border-2 border-white flex items-center justify-between">
        
        {/* Left: Home + Score */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onHome}
            className="group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-110 hover:rotate-6 transition-all duration-300"
          >
            <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform">🏠</span>
          </button>
          <div className="flex flex-col">
            <p className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-wide">Score</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text">{score}</span>
              <span className="text-lg md:text-xl text-gray-400 font-bold">/ {total}</span>
            </div>
          </div>
        </div>

        {/* Right: Stars + Pause */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden sm:flex gap-1 bg-gradient-to-br from-amber-50 to-yellow-50 px-3 py-2 rounded-xl shadow-inner">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-xl md:text-2xl transition-all duration-300 ${i < stars ? "scale-110 animate-bounce-slow" : "opacity-30 grayscale"}`}>
                {i < stars ? "🌟" : "⭐"}
              </span>
            ))}
          </div>
          <button
            onClick={onPauseToggle}
            className={`group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 overflow-hidden ${
              paused ? "bg-gradient-to-br from-emerald-400 to-green-500" : "bg-gradient-to-br from-amber-400 to-orange-500"
            }`}
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            <span className="relative text-2xl md:text-3xl text-white">{paused ? "▶️" : "⏸️"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

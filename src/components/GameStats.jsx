import React from "react"

export default function GameStats({ timeLeft, mistakes, maxMistakes, isWarning = false }) {
  return (
    <div className="flex justify-center items-center gap-4 md:gap-6 flex-wrap">
      <div className={`bg-white rounded-2xl px-4 md:px-6 py-3 md:py-4 shadow-lg border-3 ${
        isWarning ? 'border-red-400 animate-pulse' : 'border-purple-200'
      }`}>
        <div className="text-xs md:text-sm text-gray-500 font-bold mb-1">TIJD</div>
        <div className={`text-xl md:text-2xl font-black flex items-center gap-2 ${
          isWarning ? 'text-red-600' : 'text-purple-600'
        }`}>
          <span className="text-2xl md:text-3xl">⏱️</span>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      </div>
      
      <div className="bg-white rounded-2xl px-4 md:px-6 py-3 md:py-4 shadow-lg border-3 border-pink-200">
        <div className="text-xs md:text-sm text-gray-500 font-bold mb-1">FOUTEN</div>
        <div className="text-xl md:text-2xl font-black text-pink-600 flex items-center gap-2">
          <span className="text-2xl md:text-3xl">❌</span>
          {mistakes}/{maxMistakes}
        </div>
      </div>
    </div>
  )
}

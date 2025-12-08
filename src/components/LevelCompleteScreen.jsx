import React from "react"
import Button from "./Button"

export default function LevelCompleteScreen({ nextLevel, fontClass, sizeMap }) {
  return (
    <div className={`min-h-screen flex justify-center items-center bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 ${fontClass} ${sizeMap.small || "text-base"} p-4 relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-xl w-full">
        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-8 mb-6 inline-block">
          <span className="text-7xl md:text-9xl animate-bounce">🎉</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text mb-4">
          Niveau voltooid!
        </h2>
        <p className="text-lg md:text-2xl text-gray-700 mb-8 font-medium">
          Super gedaan! Klaar voor het volgende avontuur? 🚀
        </p>
        <button
          onClick={nextLevel}
          className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-5 rounded-2xl text-xl md:text-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          <span>Volgend niveau</span>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  )
}

import React from "react"
import Button from "./Button"

export default function VictoryScreen({ startNewGame, score, words, fontClass, sizeMap }) {
  return (
    <div className={`min-h-screen flex justify-center items-center bg-gradient-to-br from-amber-100 via-orange-100 to-pink-100 ${fontClass} ${sizeMap.small || "text-base"} p-4 relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-5xl animate-spin-slow">🏆</div>
        <div className="absolute top-1/4 right-10 text-4xl animate-bounce">⭐</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce animation-delay-2000">🌟</div>
      </div>
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-2xl w-full">
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8 mb-6 inline-block animate-float">
          <span className="text-7xl md:text-9xl">🏆</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text mb-4">
          Alle woorden voltooid!
        </h2>
        <p className="text-lg md:text-2xl text-gray-700 mb-6 font-medium">
          Je bent een echte ster!⭐
        </p>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 mb-8 border-4 border-amber-200">
          <p className="text-5xl md:text-6xl font-black text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text mb-2">
            {score}/{words.flat().length}
          </p>
          <p className="text-lg md:text-xl text-gray-600 font-semibold">Goede antwoorden!</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={startNewGame} className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <span className="text-2xl">🔄</span> Opnieuw spelen
          </button>
          <Button to="/menu" className="inline-flex items-center justify-center gap-3 bg-white text-gray-700 px-8 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border-2 border-gray-200">
            <span className="text-2xl">🏠</span> Terug naar menu
          </Button>
        </div>
      </div>
    </div>
  )
}

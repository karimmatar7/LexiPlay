import React from "react"
import Button from "./Button"

export default function LoadingScreen({ startNewGame, fontClass, sizeMap }) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 ${fontClass} ${sizeMap.small || "text-base"} relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-md">
        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-6 mb-6 inline-block">
          <span className="text-7xl md:text-8xl">🔤</span>
        </div>
        <p className="text-2xl md:text-3xl font-bold mb-6 text-indigo-900">Laden...</p>
        <Button onClick={startNewGame} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all">
          Nieuw spel starten
        </Button>
      </div>
    </div>
  )
}

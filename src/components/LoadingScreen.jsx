import React from "react"
import Button from "./Button"

export default function LoadingScreen({ startNewGame, fontClass, sizeMap }) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 ${fontClass} ${sizeMap?.small || "text-base"} relative overflow-hidden p-4`}>
      {/* Simple background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-48 h-48 bg-purple-200 rounded-full opacity-30" />
        <div className="absolute bottom-20 right-20 w-56 h-56 bg-pink-200 rounded-full opacity-25" />
      </div>
      
      <div className="relative bg-white rounded-3xl border-3 border-indigo-300 shadow-lg p-8 md:p-12 text-center max-w-md">
        {/* Icon Container */}
        <div className="inline-block bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300 rounded-2xl p-8 mb-6 shadow-sm">
          <span className="text-7xl md:text-8xl">🔤</span>
        </div>
        
        {/* Loading Text with Animation */}
        <p className="text-2xl md:text-3xl font-black text-indigo-700 mb-6">
          Laden
          <span className="inline-block animate-bounce">.</span>
          <span className="inline-block animate-bounce" style={{animationDelay: '0.1s'}}>.</span>
          <span className="inline-block animate-bounce" style={{animationDelay: '0.2s'}}>.</span>
        </p>
        
        {/* Loading Spinner */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>

        {startNewGame && (
          <Button 
            onClick={startNewGame} 
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-md border-b-4 border-indigo-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            🎮 Nieuw spel starten
          </Button>
        )}
      </div>
    </div>
  )
}

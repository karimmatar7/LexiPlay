import React from "react"
import { Link } from "react-router-dom"
import { useSettings } from "../context/SettingsContext"

export default function Reward() {
  const { fontType, fontSize } = useSettings()
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { 
    small: "text-base md:text-lg", 
    medium: "text-lg md:text-xl", 
    large: "text-xl md:text-2xl" 
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 p-4 sm:p-6 md:p-8 text-center ${fontClass} ${sizeMap[fontSize]} relative overflow-hidden`}>
      
      {/* Simplified Celebration Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-5xl animate-bounce">🎉</div>
        <div className="absolute top-20 right-20 text-4xl animate-bounce" style={{animationDelay: '0.2s'}}>⭐</div>
        <div className="absolute bottom-20 left-1/4 text-5xl animate-bounce" style={{animationDelay: '0.4s'}}>✨</div>
        <div className="absolute bottom-10 right-1/3 text-4xl">🌟</div>
        <div className="absolute top-1/2 left-10 text-3xl animate-bounce" style={{animationDelay: '0.3s'}}>🎊</div>
        <div className="absolute top-1/3 right-1/4 text-4xl animate-bounce" style={{animationDelay: '0.5s'}}>💫</div>
        
        {/* Soft background shapes */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-200 rounded-full opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-200 rounded-full opacity-25" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full">
        
        {/* Trophy Container */}
        <div className="mb-8">
          <div className="inline-block bg-white rounded-full p-10 md:p-12 shadow-lg border-4 border-amber-300">
            <span className="text-7xl md:text-8xl">🏆</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-amber-700 mb-6 md:mb-8" style={{letterSpacing: '-0.02em'}}>
          Super gedaan!
        </h1>

        {/* Stars Display */}
        <div className="bg-white rounded-3xl border-3 border-amber-300 p-8 md:p-10 shadow-lg mb-8 md:mb-10">
          <p className="text-xl md:text-2xl text-gray-700 font-bold mb-6">
            Je hebt verdiend:
          </p>
          <div className="flex justify-center gap-4 md:gap-6 mb-6">
            <span className="text-5xl md:text-6xl animate-bounce">🌟</span>
            <span className="text-5xl md:text-6xl animate-bounce" style={{animationDelay: '0.2s'}}>🌟</span>
            <span className="text-5xl md:text-6xl animate-bounce" style={{animationDelay: '0.4s'}}>🌟</span>
          </div>
          <p className="text-3xl md:text-4xl font-black text-amber-600">
            3 Sterren!
          </p>
        </div>

        {/* Encouragement Message */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-300 p-6 mb-8 shadow-sm">
          <p className="text-xl md:text-2xl text-gray-700 font-bold">
            Je bent een echte kampioen! 🎯
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
          <Link
            to="/game"
            className="group inline-flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-white px-10 py-5 rounded-2xl text-xl md:text-2xl font-bold shadow-md border-b-4 border-amber-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-2xl">▶️</span>
            <span>Verder spelen</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          
          <Link
            to="/menu"
            className="group inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 px-10 py-5 rounded-2xl text-xl md:text-2xl font-bold shadow-md border-2 border-gray-300 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-2xl">🏠</span>
            <span>Terug naar menu</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

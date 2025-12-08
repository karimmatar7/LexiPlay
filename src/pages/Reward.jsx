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
      
      {/* Celebration Animation Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-5xl md:text-6xl animate-bounce">🎉</div>
        <div className="absolute top-20 right-20 text-4xl md:text-5xl animate-bounce animation-delay-2000">⭐</div>
        <div className="absolute bottom-20 left-1/4 text-5xl md:text-6xl animate-bounce animation-delay-4000">✨</div>
        <div className="absolute bottom-10 right-1/3 text-4xl md:text-5xl animate-spin-slow">🌟</div>
        <div className="absolute top-1/2 left-10 text-3xl md:text-4xl animate-bounce">🎊</div>
        <div className="absolute top-1/3 right-1/4 text-4xl md:text-5xl animate-bounce animation-delay-2000">💫</div>
        
        {/* Blob animations */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full">
        
        {/* Trophy Container */}
        <div className="mb-8">
          <div className="inline-block bg-white rounded-full p-8 md:p-12 shadow-2xl animate-float">
            <span className="text-7xl md:text-8xl lg:text-9xl">🏆</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text mb-6 md:mb-8 leading-tight">
          Super gedaan!
        </h1>

        {/* Stars Display */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-2xl mb-8 md:mb-10">
          <p className="text-lg md:text-xl lg:text-2xl text-gray-700 font-semibold mb-4">
            Je hebt verdiend:
          </p>
          <div className="flex justify-center gap-3 md:gap-4 mb-4">
            <span className="text-5xl md:text-6xl lg:text-7xl animate-bounce">🌟</span>
            <span className="text-5xl md:text-6xl lg:text-7xl animate-bounce animation-delay-2000">🌟</span>
            <span className="text-5xl md:text-6xl lg:text-7xl animate-bounce animation-delay-4000">🌟</span>
          </div>
          <p className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
            3 Sterren!
          </p>
        </div>

        {/* Encouragement Message */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 mb-8 border-4 border-amber-200 shadow-lg">
          <p className="text-lg md:text-xl lg:text-2xl text-gray-700 font-medium">
            Je bent een echte kampioen! 🎯
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
          <Link
            to="/game"
            className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl text-lg md:text-xl lg:text-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="text-2xl">▶️</span>
            <span>Verder spelen</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          
          <Link
            to="/menu"
            className="group inline-flex items-center justify-center gap-3 bg-white text-gray-700 px-8 md:px-10 py-4 md:py-5 rounded-2xl text-lg md:text-xl lg:text-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-200"
          >
            <span className="text-2xl">🏠</span>
            <span>Terug naar menu</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

import React from "react"
import { useNavigate } from "react-router-dom"

export default function UnlockModal({ 
  fontClass, 
  sizeClass, 
  gameName = "Letter Bouw",
  gameEmoji = "🔤",
  gameRoute = "/letterbuild",
  onClose 
}) {
  const navigate = useNavigate()

  return (
    <div className={`min-h-screen flex justify-center items-center bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 ${fontClass} ${sizeClass} p-4 relative overflow-hidden`}>
      {/* Celebration Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-4xl animate-bounce animation-delay-1000">🎉</div>
        <div className="absolute top-20 right-20 text-3xl animate-bounce">⭐</div>
        <div className="absolute bottom-20 left-1/4 text-4xl animate-bounce animation-delay-2000">✨</div>
        <div className="absolute bottom-10 right-1/3 text-3xl animate-bounce animation-delay-4000">🎊</div>
      </div>

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-2xl w-full">
        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-8 mb-6 inline-block animate-float">
          <span className="text-7xl md:text-9xl">{gameEmoji}</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text mb-4">
          {gameName} Ontgrendeld!
        </h2>
        <p className="text-lg md:text-2xl text-gray-700 font-medium mb-6">
          Geweldig gedaan! Je hebt een nieuw spel ontgrendeld 🎯
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate(gameRoute)}
            className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-5 rounded-2xl text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <span className="text-2xl">{gameEmoji}</span>
            <span>Speel {gameName}</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            onClick={onClose} 
            className="inline-flex items-center justify-center gap-3 bg-white text-gray-700 px-8 py-5 rounded-2xl text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border-2 border-gray-200"
          >
            <span className="text-2xl">▶️</span>
            <span>Blijf hier spelen</span>
          </button>
        </div>
      </div>
    </div>
  )
}
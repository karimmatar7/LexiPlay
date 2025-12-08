import React from "react"
import { Link } from "react-router-dom"
import { useSettings } from "../context/SettingsContext"

export default function Home() {
  const { fontType, fontSize } = useSettings()
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-xl" }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 sm:p-6 md:p-8 ${fontClass} ${sizeMap[fontSize]} overflow-hidden relative`}>
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["top-20 left-10 w-64 h-64 bg-purple-300", "top-40 right-10 w-72 h-72 bg-pink-300", "-bottom-20 left-1/2 w-80 h-80 bg-indigo-300"].map((c, i) => (
          <div key={i} className={`absolute ${c} rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob ${i > 0 ? `animation-delay-${i * 2000}` : ""}`} />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen py-8">
        
        {/* Logo & Title */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block mb-6 relative">
            <div className="bg-white rounded-full p-8 md:p-12 shadow-2xl animate-float text-7xl md:text-9xl">🦊</div>
            <span className="absolute -top-2 -right-2 text-3xl animate-spin-slow">✨</span>
            <span className="absolute -bottom-2 -left-2 text-2xl animate-bounce-slow">⭐</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            LexiPlay
          </h1>

          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
            <p className="text-base sm:text-lg md:text-xl text-gray-700 font-semibold">🌟 Speels leren voor kinderen met dyslexie</p>
          </div>
        </div>

        {/* Start Button */}
        <Link
          to="/menu"
          className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-10 py-5 md:px-12 md:py-6 rounded-full text-xl md:text-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 mb-10 overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative text-3xl animate-bounce-slow">🎮</span>
          <span className="relative">Start Spel</span>
          <span className="relative text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl">
          <NavCard to="/settings" icon="⚙️" title="Instellingen" description="Pas de app aan" gradient="from-indigo-400 to-indigo-600" />
          <NavCard to="/about" icon="ℹ️" title="Over LexiPlay" description="Meer informatie" gradient="from-purple-400 to-purple-600" />
        </div>
      </div>
    </div>
  )
}

// NavCard Component
const NavCard = ({ to, icon, title, description, gradient }) => (
  <Link to={to} className="group relative bg-white rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
    <div className="relative flex items-center gap-4">
      <div className={`flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${gradient} text-white text-2xl md:text-3xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm md:text-base text-gray-500">{description}</p>
      </div>
      <span className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all text-xl">→</span>
    </div>
  </Link>
)

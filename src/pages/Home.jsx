import React from "react"
import { Link } from "react-router-dom"
import { useSettings } from "../context/SettingsContext"
import Button from "../components/Button"

export default function Home() {
  const { fontType, fontSize } = useSettings()
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-2xl" }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-6 sm:p-12 ${fontClass} ${sizeMap[fontSize]}`}
    >
      <h1 className="text-6xl sm:text-7xl font-bold text-purple-600 mb-3 animate-pulse text-center">
        LexiPlay
      </h1>
      <p className="text-lg sm:text-2xl text-gray-700 mb-8 text-center">
        Speels leren voor kinderen met dyslexie 💫
      </p>

      <div className="bg-white rounded-full p-8 sm:p-10 shadow-xl mb-10">
        <span className="text-9xl">🦊</span>
      </div>

      <Button to="/menu" variant="primary" className="text-2xl sm:text-3xl mb-8">
        ✨ Start Spel
      </Button>

      <div className="flex flex-wrap justify-center gap-6">
        <Link
          to="/settings"
          className="bg-purple-100 px-8 py-4 rounded-2xl text-lg sm:text-xl font-semibold text-purple-700 hover:scale-105 hover:shadow-md transition-all"
        >
          ⚙️ Instellingen
        </Link>
        <Link
          to="/about"
          className="bg-blue-100 px-8 py-4 rounded-2xl text-lg sm:text-xl font-semibold text-blue-700 hover:scale-105 hover:shadow-md transition-all"
        >
          ℹ️ Over
        </Link>
      </div>
    </div>
  )
}

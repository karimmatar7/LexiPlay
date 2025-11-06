import React from "react"
import { Link } from "react-router-dom"
import { useSettings } from "../context/SettingsContext"
import Button from "../components/Button"

export default function Reward() {
  const { fontType, fontSize } = useSettings()
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-2xl" }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 p-6 sm:p-10 text-center ${fontClass} ${sizeMap[fontSize]}`}
    >
      <div className="text-8xl mb-4 animate-bounce">🏆</div>
      <h1 className="text-5xl font-bold text-yellow-600 mb-6">Super gedaan!</h1>
      <p className="text-2xl text-gray-700 mb-10">Je hebt 3 sterren verdiend! 🌟</p>

      <div className="flex flex-wrap justify-center gap-6">
        <Button to="/game" variant="primary">
          ▶️ Verder spelen
        </Button>
        <Button to="/menu" variant="secondary">
          🏠 Terug naar menu
        </Button>
      </div>
    </div>
  )
}

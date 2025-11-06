import React from "react"
import { Link } from "react-router-dom"
import { useSettings } from "../context/SettingsContext"
import GameCard from "../components/GameCard"

export default function GameMenu() {
  const { fontType, fontSize } = useSettings()
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-2xl" }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-6 sm:p-10 ${fontClass} ${sizeMap[fontSize]}`}
    >
      <div className="text-center mb-10">
        <div className="text-8xl mb-4">🦊</div>
        <h2 className="text-5xl font-bold text-purple-600 mb-2">Kies een spel 🎮</h2>
        <p className="text-lg sm:text-xl text-gray-700">Welk avontuur kies jij?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto mb-10">
        <GameCard icon="🧩" title="Woord Match" desc="Match woorden met geluiden!" active to="/game" />
        <GameCard icon="🔤" title="Letter Bouw" desc="Bouw woorden letter voor letter!" />
        <GameCard icon="🎧" title="Luister en Kies" desc="Luister goed en kies het juiste woord!" />
        <GameCard icon="✨" title="Verrassing!" desc="Meer spellen komen eraan..." />
      </div>

      <div className="text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xl text-gray-700 bg-white px-8 py-4 rounded-full shadow-md hover:scale-105 transition-all"
        >
          ⬅️ Terug naar Start
        </Link>
      </div>
    </div>
  )
}

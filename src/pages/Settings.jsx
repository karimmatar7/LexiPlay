import React from "react"
import { Link } from "react-router-dom"
import { useSettings } from "../context/SettingsContext"

export default function Settings() {
  const { fontType, setFontType, fontSize, setFontSize, soundOn, setSoundOn } = useSettings()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-6 sm:p-10">
      <h2 className="text-5xl font-bold text-purple-600 mb-10 text-center">
        ⚙️ Instellingen
      </h2>

      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 w-full max-w-xl space-y-8">
        {/* Font Type */}
        <div className="bg-purple-50 rounded-2xl p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔤</span>
            <span className="text-xl font-semibold text-gray-800">Lettertype</span>
          </div>
          <select
            value={fontType}
            onChange={(e) => setFontType(e.target.value)}
            className="border-2 border-purple-300 rounded-xl px-4 py-2 text-lg"
          >
            <option value="normal">Normaal</option>
            <option value="dyslexic">OpenDyslexic</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="bg-blue-50 rounded-2xl p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📏</span>
            <span className="text-xl font-semibold text-gray-800">Lettergrootte</span>
          </div>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="border-2 border-blue-300 rounded-xl px-4 py-2 text-lg"
          >
            <option value="small">Klein</option>
            <option value="medium">Middel</option>
            <option value="large">Groot</option>
          </select>
        </div>

        {/* Sound Toggle */}
        <div className="bg-green-50 rounded-2xl p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔊</span>
            <span className="text-xl font-semibold text-gray-800">Geluid</span>
          </div>
          <input
            type="checkbox"
            checked={soundOn}
            onChange={() => setSoundOn(!soundOn)}
            className="w-7 h-7 accent-green-400"
          />
        </div>
      </div>

      <Link
        to="/"
        className="mt-10 text-gray-700 hover:text-purple-600 bg-white px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        ⬅️ Terug naar Start
      </Link>
    </div>
  )
}

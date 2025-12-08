// src/pages/Settings.jsx
import React from "react"
import { Link } from "react-router-dom"
import { useSettings } from "../context/SettingsContext"
import SettingCard from "../components/SettingCard"
import SettingButton from "../components/SettingButton"


export default function Settings({user, setUser}) {
  const { fontType, setFontType, soundOn, setSoundOn } = useSettings()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <div className="inline-block mb-6 bg-white rounded-3xl p-6 md:p-8 shadow-2xl">
            <span className="text-6xl md:text-7xl">⚙️</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Instellingen
          </h1>
          <p className="text-base md:text-lg text-gray-600 font-medium">Pas LexiPlay aan naar jouw wensen</p>
        </div>

        {/* Settings */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-10 mb-10 space-y-5">
          <SettingCard icon="🔤" title="Lettertype" description="Kies het lettertype dat het makkelijkst leest">
            <div className="grid grid-cols-2 gap-3">
              <SettingButton active={fontType==="normal"} onClick={()=>setFontType("normal")} label="Normaal"/>
              <SettingButton active={fontType==="dyslexic"} onClick={()=>setFontType("dyslexic")} label="OpenDyslexic"/>
            </div>
          </SettingCard>

          <SettingCard icon="🔊" title="Geluid" description="Zet geluidseffecten aan of uit">
            <button
              onClick={()=>setSoundOn(!soundOn)}
              className={`relative w-20 h-10 md:w-24 md:h-12 rounded-full shadow-inner transition-all duration-300 ${soundOn?"bg-gradient-to-r from-green-400 to-emerald-500":"bg-gray-300"}`}
              aria-label="Toggle sound"
            >
              <span className={`absolute top-1 ${soundOn?"right-1":"left-1"} w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300`}>
                {soundOn?"🔊":"🔇"}
              </span>
            </button>

          </SettingCard>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="group inline-flex items-center gap-3 bg-white text-gray-700 px-8 py-4 md:px-10 md:py-5 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <span className="text-2xl group-hover:-translate-x-1 transition-transform">⬅️</span>Terug
          </Link>
          <Link to="/menu" className="group inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 md:px-10 md:py-5 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <span className="text-2xl">🎮</span>Naar Spellen
          </Link>
        </div>

        <button
  onClick={() => {
    localStorage.removeItem("lexiplay_user"); // remove saved user
    if (setUser) setUser(null);              // reset state in App
    window.location.href = "/";              // redirect to login
  }}
  className="mt-4 w-full bg-red-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-red-600 transform hover:scale-105 transition-all"
>
  🔓 Logout
</button>

      </div>
    </div>
  )
}

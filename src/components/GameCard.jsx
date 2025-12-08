import React from "react"
import { Link } from "react-router-dom"

export default function GameCard({ icon, title, desc, active, to, unlockMsg }) {
  const Wrapper = active && to ? Link : "div"

  return (
    <Wrapper
      {...(active && to ? { to } : {})}
      className={`group relative overflow-hidden rounded-3xl transition-all duration-500 ${
        active
          ? "bg-gradient-to-br from-white to-indigo-50 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
          : "bg-gradient-to-br from-gray-100 to-gray-200 cursor-not-allowed"
      }`}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 rounded-full blur-2xl" />
      </div>

      <div className="relative p-6 md:p-8 text-center">
        <div className={`mx-auto mb-5 w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 bg-gradient-to-br ${
          active ? "from-indigo-100 to-purple-100 group-hover:scale-110" : "from-gray-200 to-gray-300"
        }`}>
          <span className="text-4xl md:text-5xl">{icon}</span>
        </div>

        <h3 className={`text-xl md:text-2xl font-bold mb-3 ${active ? "text-indigo-900" : "text-gray-500"}`}>{title}</h3>
        <p className={`text-sm md:text-base mb-6 leading-relaxed ${active ? "text-gray-600" : "text-gray-400"}`}>{desc}</p>

        {active ? (
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full text-base md:text-lg font-bold shadow-lg group-hover:shadow-xl transition-all">
            <span>▶️</span>
            <span>Speel nu!</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 bg-gray-300 text-gray-600 px-6 py-3 rounded-full text-base font-semibold">
              <span>🔒</span>
              <span>Vergrendeld</span>
            </div>
            {unlockMsg && <p className="text-xs md:text-sm text-gray-500 leading-snug px-2">{unlockMsg}</p>}
          </div>
        )}

        {active && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span>Beschikbaar</span>
          </div>
        )}
      </div>
    </Wrapper>
  )
}

import React from "react"
import { Link } from "react-router-dom"

export default function GameCard({ icon, title, desc, active, to, unlockMsg, bgColor = "bg-white", borderColor = "border-gray-300" }) {
  const Wrapper = active && to ? Link : "div"

  return (
    <Wrapper
      {...(active && to ? { to } : {})}
      className={`relative rounded-2xl border-3 ${borderColor} ${bgColor} p-6 shadow-sm transition-all duration-200 ${
        active
          ? "hover:shadow-md hover:-translate-y-1 cursor-pointer"
          : "opacity-70 cursor-not-allowed"
      }`}
    >
      {/* Available Badge */}
      {active && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border-2 border-green-500">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span>Beschikbaar</span>
        </div>
      )}

      <div className="flex flex-col items-center text-center h-full">
        {/* Icon Container */}
        <div 
          className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 ${borderColor} bg-white flex items-center justify-center mb-5 transition-transform duration-200 ${
            active ? "group-hover:scale-110" : "grayscale"
          }`}
        >
          <span className="text-4xl md:text-5xl">{icon}</span>
        </div>

        {/* Title & Description */}
        <h3 className={`text-xl md:text-2xl font-bold mb-3 ${active ? "text-gray-800" : "text-gray-500"}`}>
          {title}
        </h3>
        <p className={`text-sm md:text-base leading-relaxed mb-6 flex-grow ${active ? "text-gray-600" : "text-gray-400"}`}>
          {desc}
        </p>

        {/* Action Button */}
        {active ? (
          <div className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl text-base md:text-lg font-bold shadow-md border-b-4 border-indigo-700 transition-all duration-200">
            <span>▶️</span>
            <span>Speel nu!</span>
          </div>
        ) : (
          <div className="space-y-3 w-full">
            <div className="inline-flex items-center justify-center gap-2 bg-gray-300 text-gray-600 px-6 py-3 rounded-xl text-base font-bold border-2 border-gray-400">
              <span>🔒</span>
              <span>Vergrendeld</span>
            </div>
            {unlockMsg && (
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl px-4 py-3 text-xs md:text-sm text-gray-700 leading-snug">
                {unlockMsg}
              </div>
            )}
          </div>
        )}
      </div>
    </Wrapper>
  )
}

import React from "react"

export default function PauseOverlay() {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-20">
      <div className="inline-block bg-gradient-to-br from-amber-100 to-yellow-100 border-3 border-amber-300 rounded-3xl p-10 mb-6 shadow-sm">
        <span className="text-8xl md:text-9xl">⏸️</span>
      </div>
      
      <h2 className="text-3xl md:text-4xl font-black text-amber-700 mb-4">
        Gepauzeerd
      </h2>
      
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-6 py-4 shadow-sm">
        <p className="text-lg md:text-xl text-gray-700 font-medium">
          Klik op ▶️ om verder te gaan
        </p>
      </div>
    </div>
  )
}

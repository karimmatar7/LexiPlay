// src/components/PauseOverlay.jsx
import React from "react"

export default function PauseOverlay() {
  return (
    <div className="py-16 text-center">
      <div className="text-7xl sm:text-8xl mb-4">⏸️</div>
      <p className="text-2xl sm:text-3xl text-gray-600 leading-relaxed">
        Spel gepauzeerd... <br /> Je kunt later doorgaan!
      </p>
    </div>
  )
}

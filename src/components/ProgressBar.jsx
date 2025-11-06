// src/components/ProgressBar.jsx
import React from "react"

export default function ProgressBar({ progress }) {
  return (
    <div className="bg-white rounded-full h-4 sm:h-6 mb-10 shadow-inner overflow-hidden">
      <div
        className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 h-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

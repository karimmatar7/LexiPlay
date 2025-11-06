// src/components/HeaderBar.jsx
import React from "react"
import { Link } from "react-router-dom"

export default function HeaderBar({ score, total, paused, onPauseToggle }) {
  return (
    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
      <Link
        to="/menu"
        className="bg-white rounded-full p-3 sm:p-4 shadow-md hover:shadow-lg transition-all"
      >
        🏠
      </Link>

      <div className="bg-white rounded-full px-6 py-3 shadow-md text-xl font-bold text-purple-600">
        {score}/{total}
      </div>

      <button
        onClick={onPauseToggle}
        className={`px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-lg transition-all shadow-md ${
          paused
            ? "bg-green-400 text-white hover:bg-green-500"
            : "bg-yellow-400 text-gray-800 hover:bg-yellow-500"
        }`}
      >
        {paused ? "▶️ Hervat" : "⏸️ Pauzeer"}
      </button>
    </div>
  )
}

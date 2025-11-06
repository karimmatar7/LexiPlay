// src/components/GameCard.jsx
import React from "react"
import Button from "./Button"

export default function GameCard({ icon, title, desc, active, to }) {
  return (
    <div
      className={`rounded-3xl shadow-xl p-8 sm:p-10 transition-all ${
        active
          ? "bg-white hover:scale-105 hover:shadow-2xl"
          : "bg-gray-100 opacity-75"
      }`}
    >
      <div className="text-7xl sm:text-8xl mb-4">{icon}</div>
      <h3 className="text-2xl sm:text-3xl font-bold mb-3">{title}</h3>
      <p className="text-lg sm:text-xl mb-6 text-gray-600">{desc}</p>

      {active ? (
        <Button to={to}>▶️ Speel nu</Button>
      ) : (
        <div className="bg-gray-300 text-gray-600 px-6 py-3 rounded-full text-lg font-semibold">
          🔒 Binnenkort
        </div>
      )}
    </div>
  )
}

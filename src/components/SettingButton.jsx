import React from "react"

export default function SettingButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 md:px-6 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
        active
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  )
}

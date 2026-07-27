import React from "react"

export default function SettingButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 md:px-6 md:py-3.5 rounded-full font-bold text-sm md:text-base transition-all duration-200 border ${
        active
          ? "bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500 shadow-[0_8px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_10px_24px_rgba(99,102,241,0.45)]"
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
      }`}
    >
      {label}
    </button>
  )
}
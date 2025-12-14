import React from "react"

export default function SettingButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 md:px-6 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-200 border-2 shadow-sm hover:shadow-md transform hover:scale-105 ${
        active
          ? "bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-700 border-b-4"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  )
}

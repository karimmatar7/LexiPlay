// src/components/SettingCard.jsx
import React from "react"

export default function SettingCard({ icon, title, description, children }) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center text-2xl md:text-3xl shadow-md">
            {icon}
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm md:text-base text-gray-600">{description}</p>
          </div>
        </div>
        <div className="lg:ml-auto">{children}</div>
      </div>
    </div>
  )
}

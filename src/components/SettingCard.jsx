import React from "react"

export default function SettingCard({ icon, title, description, children }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-purple-200 rounded-xl flex items-center justify-center text-2xl md:text-3xl shadow-sm">
            {icon}
          </div>
          <div className="flex-1">
            <h3 
              className="text-lg md:text-xl font-bold text-gray-800 mb-1.5" 
              style={{ fontFamily: "inherit" }}
            >
              {title}
            </h3>
            <p 
              className="text-sm md:text-base text-gray-600 leading-relaxed" 
              style={{ fontFamily: "inherit" }}
            >
              {description}
            </p>
          </div>
        </div>
        
        {/* Controls Section */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  )
}

import React from "react"

export default function ProgressBar({ progress }) {
  return (
    <div className="mb-8 md:mb-10">
      <div className="bg-white border-3 border-gray-200 rounded-full h-5 sm:h-6 shadow-sm overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 h-full transition-all duration-500 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {/* Optional: Add a subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
        </div>
      </div>
      
      {/* Progress Percentage Text */}
      <div className="flex justify-between items-center mt-2 px-1">
        <span className="text-xs md:text-sm text-gray-600 font-bold">
          {Math.round(progress)}% voltooid
        </span>
        <span className="text-xs md:text-sm text-gray-500 font-medium">
          {progress === 100 ? "🎉 Klaar!" : "Blijf doorgaan! 💪"}
        </span>
      </div>
    </div>
  )
}

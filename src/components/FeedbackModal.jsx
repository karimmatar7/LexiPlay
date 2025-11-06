// src/components/FeedbackModal.jsx
import React from "react"

export default function FeedbackModal({ type }) {
  if (!type) return null

  const data = {
    correct: {
      emoji: "🎉",
      title: "Goed gedaan!",
      text: "Perfect! 🌟",
      color: "text-green-600",
    },
    incorrect: {
      emoji: "🦊",
      title: "Probeer opnieuw!",
      text: "Je kunt het! 💪",
      color: "text-gray-700",
    },
  }

  const { emoji, title, text, color } = data[type] || {}

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center max-w-sm w-full animate-bounce">
        <div className="text-8xl mb-4">{emoji}</div>
        <h3 className={`text-3xl sm:text-4xl font-bold ${color} mb-3`}>
          {title}
        </h3>
        <p className="text-xl text-gray-600">{text}</p>
      </div>
    </div>
  )
}

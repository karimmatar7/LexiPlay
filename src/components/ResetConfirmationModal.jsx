import React from "react"

export default function ResetConfirmationModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl border-3 border-red-300 shadow-xl p-8 max-w-md w-full text-center animate-scale-in">
        
        <div className="inline-block bg-red-100 border-2 border-red-300 rounded-full p-6 mb-6">
          <span className="text-5xl">⚠️</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-black mb-4 text-gray-800">
          Score resetten?
        </h2>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6">
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            Je score wordt teruggezet naar <strong className="text-red-600">0</strong>.
            <br />
            <span className="text-sm text-gray-600">✅ Ontgrendelde spellen blijven beschikbaar.</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 text-lg font-bold shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            ❌ Annuleren
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-4 rounded-xl bg-red-500 hover:bg-red-600 border-b-4 border-red-700 text-white text-lg font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  )
}

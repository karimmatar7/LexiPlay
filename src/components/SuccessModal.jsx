import React from "react";

export default function SuccessModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center space-y-4 shadow-lg">
        <div className="text-5xl mb-2">✅</div>
        <h2 className="text-xl font-bold text-green-600">PIN succesvol gereset!</h2>
        <p className="text-sm text-gray-600">Log opnieuw in met je nieuwe PIN.</p>
        
        <button
          onClick={onClose}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Begrepen
        </button>
      </div>
    </div>
  );
}

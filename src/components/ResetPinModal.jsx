import React from "react";

export default function ResetPinModal({ 
  show, 
  name,
  recoveryCode,
  newPin,
  error,
  onNameChange,
  onRecoveryCodeChange,
  onNewPinChange,
  onReset,
  onClose 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-lg">
        <h2 className="text-xl font-bold text-purple-700 text-center">
          Reset je PIN
        </h2>
        
        <input
          type="text"
          placeholder="Naam"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
        />
        
        <input
          type="text"
          placeholder="Recovery code"
          value={recoveryCode}
          onChange={(e) => onRecoveryCodeChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
        />
        
        <input
          type="password"
          placeholder="Nieuwe PIN"
          value={newPin}
          onChange={(e) => onNewPinChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
        />
        
        {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
        
        <div className="flex justify-center gap-3">
          <button
            onClick={onReset}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl font-bold"
          >
            🔑 Reset PIN
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-xl font-bold"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}

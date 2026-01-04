import React from "react";

export default function SupportModal({ title, message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <button
          onClick={onClose}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-full font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
}

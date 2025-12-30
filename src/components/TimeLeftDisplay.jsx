import React from "react";

export default function TimeLeftDisplay({ timeLeft, limitReached, formatTime }) {
  if (timeLeft === null || limitReached) return null;

  return (
    <div className="inline-block bg-white rounded-2xl px-6 py-3 shadow-lg border-3 border-orange-300">
      <p className="text-2xl text-orange-600 font-black">
        ⏰ Tijd over: <span className="text-red-600">{formatTime(timeLeft)}</span>
      </p>
    </div>
  );
}

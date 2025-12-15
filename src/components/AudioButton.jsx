import React from "react";

export default function AudioButton({ 
  word, 
  soundOn, 
  paused, 
  label = "Speel het woord af",
  className = "" 
}) {
  const playWord = (word) => {
    if (!soundOn || paused || !word) return;
    const audio = new Audio(`/sounds/${word}.mp3`);
    audio.play().catch(err => console.error("Audio play error:", err));
  };

  return (
    <button
      onClick={() => playWord(word)}
      className={`bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-md border-b-4 border-indigo-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${className}`}
    >
      <span className="text-3xl md:text-4xl mr-2 md:mr-3">🔊</span>
      {label}
    </button>
  );
}

import React, { useEffect } from "react";
import Button from "./Button";

export default function LevelCompleteScreen({ nextLevel, fontClass, sizeMap }) {
  useEffect(() => {
const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/level-passed.mp3`);
audio.volume = 0.5;
audio.play().catch(err => console.error("Audio play error:", err));

  }, []);

  return (
    <div className={`min-h-screen flex justify-center items-center bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 ${fontClass} ${sizeMap?.small || "text-base"} p-4 relative overflow-hidden`}>
      {/* Simple background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-emerald-200 rounded-full opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-teal-200 rounded-full opacity-25" />
        <div className="absolute top-10 right-10 text-5xl animate-bounce">⭐</div>
        <div className="absolute bottom-10 left-10 text-4xl animate-bounce" style={{animationDelay: '0.3s'}}>✨</div>
      </div>
      
      <div className="relative bg-white rounded-3xl border-3 border-green-300 shadow-lg p-8 md:p-12 text-center max-w-xl w-full">
        {/* Success Icon */}
        <div className="inline-block bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-300 rounded-3xl p-8 mb-6 shadow-sm">
          <span className="text-7xl md:text-9xl">🎉</span>
        </div>
        
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-700 mb-4" style={{letterSpacing: '-0.02em'}}>
          Niveau voltooid!
        </h2>
        
        {/* Message Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-8 shadow-sm">
          <p className="text-lg md:text-2xl text-gray-700 font-bold">
            Super gedaan! 🌟
          </p>
          <p className="text-base md:text-lg text-gray-600 mt-2">
            Klaar voor het volgende avontuur? 🚀
          </p>
        </div>
        
        {/* Next Level Button */}
        <button
          onClick={nextLevel}
          className="group inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl text-xl md:text-2xl font-bold shadow-md border-b-4 border-emerald-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <span>Volgend niveau</span>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
}

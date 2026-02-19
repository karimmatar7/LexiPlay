import React from "react";

export function HeartsDisplay({ hearts, heartAnimating, maxHearts }) {
  return (
    <>
      <style>{`
        @keyframes heart-lose {
          0%   { transform: scale(1);    opacity: 1; }
          30%  { transform: scale(1.35); opacity: 0.9; }
          60%  { transform: scale(0.6) translateY(8px); opacity: 0.5; }
          100% { transform: scale(0) translateY(16px);  opacity: 0; }
        }
        .heart-losing {
          animation: heart-lose 0.45s ease-in forwards;
        }
      `}</style>

      <div className="flex justify-center items-center gap-2 sm:gap-3 mb-5 sm:mb-6 flex-wrap">
        {Array.from({ length: maxHearts }).map((_, i) => (
          <span
            key={i}
            className={`
              text-2xl sm:text-3xl md:text-4xl select-none transition-colors duration-300
              ${i < hearts ? "text-red-500 drop-shadow-sm" : "opacity-20 grayscale"}
              ${heartAnimating === i ? "heart-losing" : ""}
            `}
            style={{ display: "inline-block", lineHeight: 1 }}
          >
            ❤️
          </span>
        ))}
      </div>
    </>
  );
}

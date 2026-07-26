import React from "react";
import heartIcon from "../assets/icons/heart.png";

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

     <div className="mb-5 flex flex-wrap items-center justify-center gap-2 sm:mb-6 sm:gap-3">
  {Array.from({ length: maxHearts }).map((_, i) => (
    <span
      key={i}
      className={`
        inline-block leading-none transition-all duration-300
        ${i < hearts ? "drop-shadow-sm" : "opacity-20 grayscale"}
        ${heartAnimating === i ? "heart-losing" : ""}
      `}
    >
      <img
        src={heartIcon}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="h-6 w-6 object-contain sm:h-8 sm:w-8 md:h-10 md:w-10"
      />
    </span>
  ))}
</div>
    </>
  );
}

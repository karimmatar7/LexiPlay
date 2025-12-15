import React from "react";

export default function BackgroundDecoration({ variant = "default" }) {
  const variants = {
    default: {
      colors: ["bg-blue-200", "bg-purple-200", "bg-pink-200"],
      positions: [
        "top-10 left-10 w-40 h-40",
        "bottom-20 right-20 w-48 h-48",
        "top-1/2 right-1/4 w-32 h-32"
      ]
    },
    cyan: {
      colors: ["bg-cyan-200", "bg-blue-200"],
      positions: [
        "top-10 right-10 w-40 h-40",
        "bottom-20 left-20 w-48 h-48"
      ]
    },
    purple: {
      colors: ["bg-purple-200", "bg-pink-200"],
      positions: [
        "top-10 left-10 w-40 h-40",
        "bottom-20 right-20 w-48 h-48"
      ]
    }
  };

  const config = variants[variant] || variants.default;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {config.positions.map((position, idx) => (
        <div
          key={idx}
          className={`absolute ${position} ${config.colors[idx]} rounded-full opacity-30`}
        />
      ))}
    </div>
  );
}

import React from "react"

export default function FloatingLetterButton({ letter, index, onClick, disabled }) {
  return (
    <button
      onClick={() => onClick(letter)}
      disabled={disabled}
      className={`float-anim w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-white text-2xl md:text-3xl font-black shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 border-3 border-white ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:from-pink-500 hover:via-purple-500 hover:to-blue-500"
      }`}
      style={{
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        animationDelay: `${index * 0.2}s`
      }}
    >
      {letter.toUpperCase()}
    </button>
  )
}

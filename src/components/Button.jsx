// src/components/Button.jsx
import React from "react"
import { Link } from "react-router-dom"

export default function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
  disabled = false,
  to,
}) {
  const base =
    "inline-block text-center font-bold rounded-full px-8 py-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"

  const variants = {
    primary:
      "bg-gradient-to-r from-emerald-400 to-sky-400 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_10px_24px_rgba(16,185,129,0.45)]",
    secondary:
      "bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-[0_8px_20px_rgba(192,132,252,0.35)] hover:shadow-[0_10px_24px_rgba(192,132,252,0.45)]",
    neutral:
      "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
  }

  const style = `${base} ${variants[variant]} ${className}`

  // if "to" is given, render <Link>
  if (to) {
    return (
      <Link to={to} className={style}>
        {children}
      </Link>
    )
  }

  // else render <button>
  return (
    <button onClick={onClick} className={style} disabled={disabled}>
      {children}
    </button>
  )
}
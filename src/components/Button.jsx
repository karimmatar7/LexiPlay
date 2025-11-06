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
    "inline-block text-center font-bold rounded-full px-8 py-4 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    primary:
      "bg-gradient-to-r from-green-400 to-blue-400 text-white hover:shadow-xl",
    secondary:
      "bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:shadow-xl",
    neutral: "bg-white text-gray-700 hover:bg-gray-100",
  }

  const style = `${base} ${variants[variant]} ${className}`

  // if “to” is given, render <Link>
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

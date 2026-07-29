import React from "react";
import { Link } from "react-router-dom";

export default function AppButton({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  onClick,
  className = "",
  disabled = false,
  to,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full text-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none";

  const sizes = {
    sm: "min-h-10 px-4 py-2 text-sm",
    md: "min-h-[52px] px-6 py-3 text-base",
    lg: "min-h-[56px] px-8 py-3.5 text-lg",
  };

  const variants = {
    primary:
      "bg-gradient-to-r from-emerald-400 to-sky-400 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:from-emerald-500 hover:to-sky-500 hover:shadow-[0_10px_24px_rgba(16,185,129,0.45)]",

    secondary:
      "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_8px_20px_rgba(192,132,252,0.35)] hover:from-purple-600 hover:to-pink-600 hover:shadow-[0_10px_24px_rgba(192,132,252,0.45)]",

    neutral:
      "border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-gray-300 hover:bg-gray-50",

    indigo:
      "bg-indigo-500 text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] hover:bg-indigo-600 hover:shadow-[0_10px_24px_rgba(99,102,241,0.45)]",

      success:
  "bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:bg-emerald-600 hover:shadow-[0_10px_24px_rgba(16,185,129,0.45)]",

  purple:
  "bg-purple-600 text-white shadow-[0_8px_20px_rgba(147,51,234,0.35)] hover:bg-purple-700 hover:shadow-[0_10px_24px_rgba(147,51,234,0.45)]",

  yellow:
  "bg-yellow-400 text-yellow-900 shadow-[0_8px_20px_rgba(202,138,4,0.3)] hover:bg-yellow-500 hover:shadow-[0_10px_24px_rgba(202,138,4,0.4)]",

  pink:
  "bg-pink-400 text-white shadow-[0_8px_20px_rgba(236,72,153,0.35)] hover:bg-pink-500 hover:shadow-[0_10px_24px_rgba(236,72,153,0.45)]",
  };

  const style = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (to) {
    if (disabled) {
      return (
        <span
          className={`${style} pointer-events-none`}
          aria-disabled="true"
          {...props}
        >
          {children}
        </span>
      );
    }

    return (
      <Link to={to} className={style} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={style}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
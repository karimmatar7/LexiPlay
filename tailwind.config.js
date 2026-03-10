/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        softbeige: "#FFF9F3",
        softgreen: "#6EB6A6",
        softblue: "#E6F5F1",
      },
      fontFamily: {
        dyslexic: ["OpenDyslexic", "Comic Sans MS", "sans-serif"],
      },
      animation: {
        "blob":        "blob 7s infinite",
        "float":       "float 3s ease-in-out infinite",
        "bounce-slow": "bounce 2s infinite",
        "spin-slow":   "spin 3s linear infinite",
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        // ── LetterDraw ──
        "net-shake":   "net-shake 0.5s ease-in-out",
        "fade-in":     "fade-in 0.2s ease-out forwards",
        "shake":       "shake 0.4s ease-in-out",
      },
      keyframes: {
        blob: {
          "0%":   { transform: "translate(0px, 0px) scale(1)" },
          "33%":  { transform: "translate(30px, -50px) scale(1.1)" },
          "66%":  { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-20px)" },
        },
        // ── LetterDraw ──
        "net-shake": {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "20%":      { transform: "translateX(-3px) translateY(-2px)" },
          "40%":      { transform: "translateX(3px) translateY(2px)" },
          "60%":      { transform: "translateX(-2px) translateY(-1px)" },
          "80%":      { transform: "translateX(2px) translateY(1px)" },
        },
        "fade-in": {
          "0%":   { opacity: 0, transform: "scale(0.8)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%":      { transform: "translateX(-4px)" },
          "40%":      { transform: "translateX(4px)" },
          "60%":      { transform: "translateX(-4px)" },
          "80%":      { transform: "translateX(4px)" },
        },
      },
      animationDelay: {
        "2000": "2s",
        "4000": "4s",
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        ".animation-delay-2000": { "animation-delay": "2s" },
        ".animation-delay-4000": { "animation-delay": "4s" },
      };
      addUtilities(newUtilities);
    },
  ],
};

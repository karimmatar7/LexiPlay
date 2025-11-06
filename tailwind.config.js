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
    },
  },
  plugins: [],
}

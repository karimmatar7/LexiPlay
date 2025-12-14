import React from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

export default function Home() {
  const { fontType, fontSize } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-xl" };

  return (
    <div className={`min-h-screen bg-amber-50 p-6 md:p-8 ${fontClass} ${sizeMap[fontSize]} relative`}>
      {/* Decorative blobs */}
      <div className="absolute top-8 right-8 w-24 h-24 bg-purple-200 rounded-full opacity-40" />
      <div className="absolute bottom-12 left-12 w-32 h-32 bg-blue-200 rounded-full opacity-30" />

      <div className="relative max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen py-12 space-y-12">
        {/* Logo Section */}
        <div className="text-center space-y-6">
          <div className="inline-block p-8 rounded-3xl bg-white shadow-lg border-4 border-orange-300">
            <img src="/fox.png" alt="LexiPlay Logo" className="w-28 h-28 md:w-32 md:h-32 mx-auto" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-indigo-700" style={{ letterSpacing: "-0.02em" }}>
            LexiPlay
          </h1>
          <p className="bg-white px-6 py-3 rounded-2xl shadow-md border-2 border-purple-200 text-gray-700 text-xl md:text-2xl font-medium">
            🌟 Speels leren voor kinderen met dyslexie
          </p>
        </div>

        {/* Start Button */}
        <Link
          to="/menu"
          className="group inline-flex items-center justify-center gap-4 bg-indigo-500 hover:bg-indigo-600 text-white px-12 py-6 rounded-2xl text-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-b-4 border-indigo-700"
        >
          <span className="text-3xl">🎮</span>
          <span>Start Spel</span>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <NavCard
            to="/settings"
            icon="⚙️"
            title="Instellingen"
            description="Pas de app aan"
            bgColor="bg-blue-100"
            borderColor="border-blue-300"
          />
          <NavCard
            to="/about"
            icon="ℹ️"
            title="Over LexiPlay"
            description="Meer informatie"
            bgColor="bg-purple-100"
            borderColor="border-purple-300"
          />
        </div>
      </div>
    </div>
  );
}

const NavCard = ({ to, icon, title, description, bgColor, borderColor }) => (
  <Link
    to={to}
    className={`group ${bgColor} border-2 ${borderColor} rounded-2xl p-6 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200`}
  >
    <div className="flex items-center gap-4">
      <div className={`flex items-center justify-center w-16 h-16 rounded-xl bg-white border-2 ${borderColor} text-3xl`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-base text-gray-600">{description}</p>
      </div>
      <span className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all text-2xl">→</span>
    </div>
  </Link>
);

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import GameCard from "../components/GameCard";

export default function GameMenu({ user }) {
  const { fontType, fontSize } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = { small: "text-base md:text-lg", medium: "text-lg md:text-xl", large: "text-xl md:text-2xl" };

  const [letterBuildUnlocked, setLetterBuildUnlocked] = useState(false);

  // Set unlocked state directly from the passed user
  useEffect(() => {
    if (user?.progress?.wordMatch?.letterBuildUnlocked) {
      setLetterBuildUnlocked(true);
    }
  }, [user]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 sm:p-6 md:p-8 ${fontClass} ${sizeMap[fontSize]} relative overflow-hidden`}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <div className="inline-block mb-6 relative bg-white rounded-3xl p-6 md:p-8 shadow-2xl transform hover:scale-105 transition-transform">
            <span className="text-6xl md:text-7xl">🦊</span>
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
              Kies een spel!
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Spelletjes Menu
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-medium">Welk avontuur kies jij vandaag? 🎮</p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8 mb-12">
          <GameCard
            icon="🧩"
            title="Woord Match"
            desc="Match woorden met geluiden en maak de juiste combinaties!"
            active
            to="/game"
          />
          <GameCard
            icon="🔤"
            title="Letter Bouw"
            desc="Bouw woorden letter voor letter en wordt een spelling-kampioen!"
            active={letterBuildUnlocked}
            to={letterBuildUnlocked ? "/letterbuild" : null}
            unlockMsg="Voltooi eerst Niveau 1 van Woord Match om dit spel te ontgrendelen"
          />
          <GameCard
            icon="🎧"
            title="Luister en Kies"
            desc="Luister goed naar het woord en kies de juiste optie!"
            active={false}
            unlockMsg="Binnenkort beschikbaar - blijf spelen!"
          />
          <GameCard
            icon="✨"
            title="Mysterie Spel"
            desc="Een verrassend nieuw spel komt binnenkort beschikbaar!"
            active={false}
            unlockMsg="We werken hard aan nieuwe avonturen voor jou!"
          />
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Link
            to="/"
            className="group inline-flex items-center justify-center gap-3 bg-white text-gray-700 px-8 py-4 md:px-10 md:py-5 rounded-2xl text-base md:text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <span className="text-2xl group-hover:-translate-x-1 transition-transform">⬅️</span>
            <span>Terug naar Start</span>
          </Link>
          <Link
            to="/settings"
            className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 md:px-10 md:py-5 rounded-2xl text-base md:text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <span className="text-2xl">⚙️</span>
            <span>Instellingen</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

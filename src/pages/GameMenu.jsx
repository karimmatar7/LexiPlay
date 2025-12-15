import React from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import GameCard from "../components/GameCard";

export default function GameMenu({ user }) {
  const { fontType, fontSize } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-xl" };

  const letterBuildUnlocked = user?.progress?.wordMatch?.letterBuildUnlocked || false;
  const mazeUnlocked = user?.progress?.letterBuild?.mazeUnlocked || false;
  const wordMazeUnlocked = mazeUnlocked;

  return (
    <div className={`min-h-screen bg-sky-50 p-6 md:p-8 ${fontClass} ${sizeMap[fontSize]} relative`}>
      {/* Background shapes */}
      <div className="absolute top-8 left-8 w-32 h-32 bg-pink-200 rounded-full opacity-30" />
      <div className="absolute bottom-12 right-12 w-40 h-40 bg-yellow-200 rounded-full opacity-25" />

      <div className="relative max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-block p-8 rounded-3xl bg-white shadow-lg border-4 border-yellow-300">
            <img src="/fox.png" alt="LexiPlay Logo" className="w-28 h-28 md:w-32 md:h-32 mx-auto" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-purple-700" style={{ letterSpacing: "-0.02em" }}>
            Spelletjes Menu
          </h1>
          <p className="text-2xl text-gray-700 font-medium">
            Welk avontuur kies jij vandaag? 🎮
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <GameCard
            icon="🧩"
            title="Woord Match"
            desc="Match woorden met geluiden en maak de juiste combinaties!"
            active
            to="/game"
            bgColor="bg-green-100"
            borderColor="border-green-400"
          />
          <GameCard
            icon="🔤"
            title="Letter Bouw"
            desc="Bouw woorden letter voor letter en wordt een spelling-kampioen!"
            active={letterBuildUnlocked}
            to={letterBuildUnlocked ? "/letterbuild" : null}
            unlockMsg="Scoor 7 punten in Woord Match"
            bgColor="bg-blue-100"
            borderColor="border-blue-400"
          />
          <GameCard
            icon="🌀"
            title="Woorden Doolhof"
            desc="Vind je weg door het doolhof door de juiste letters te kiezen!"
            active={wordMazeUnlocked}
            to={wordMazeUnlocked ? "/wordmaze" : null}
            unlockMsg="Scoor 10 punten in Letter Bouw"
            bgColor="bg-purple-100"
            borderColor="border-purple-400"
          />
          <GameCard
            icon="✨"
            title="Mysterie Spel"
            desc="Een verrassend nieuw spel komt binnenkort!"
            active={false}
            unlockMsg="We werken hard aan nieuwe avonturen!"
            bgColor="bg-pink-100"
            borderColor="border-pink-400"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/settings"
            className="group inline-flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-md hover:shadow-lg border-b-4 border-indigo-700 transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-2xl">⚙️</span>
            <span>Instellingen</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

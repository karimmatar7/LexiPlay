import React from "react";

export default function GameMenuHeader({ fontClass, sizeMap, fontSize, children, name }) {
  return (
    <div className="text-center space-y-6">
      <div className="inline-block p-8 rounded-3xl bg-white shadow-lg border-4 border-yellow-300">
        <img src="/fox.png" alt="LexiPlay Logo" className="w-28 h-28 md:w-32 md:h-32 mx-auto" />
      </div>
      <h1 className="text-5xl md:text-6xl font-black text-purple-700" style={{ letterSpacing: "-0.02em" }}>
        Spelletjes Menu
      </h1>
      <p className="text-2xl text-gray-700 font-medium">
        Welk avontuur kies jij vandaag, {name}? 🎮
      </p>
      {children}
    </div>
  );
}

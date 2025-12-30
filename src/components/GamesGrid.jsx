import React from "react";
import GameCard from "./GameCard";

export default function GamesGrid({ 
  displayWordMatch, 
  displayLetterBuild, 
  displayMaze, 
  displayFinal, 
  limitReached 
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <GameCard 
        icon="🧩" 
        title="Woord Match" 
        desc="Match woorden met geluiden en maak de juiste combinaties!" 
        active={displayWordMatch} 
        to={displayWordMatch ? "/game" : null} 
        unlockMsg={limitReached ? "Dagelijkse limiet bereikt" : null}
        bgColor="bg-green-100" 
        borderColor="border-green-400" 
      />
      <GameCard 
        icon="🔤" 
        title="Letter Bouw" 
        desc="Bouw woorden letter voor letter en wordt een spelling-kampioen!" 
        active={displayLetterBuild} 
        to={displayLetterBuild ? "/letterbuild" : null} 
        unlockMsg={limitReached ? "Dagelijkse limiet bereikt" : "Scoor 7 punten in Woord Match"} 
        bgColor="bg-blue-100" 
        borderColor="border-blue-400" 
      />
      <GameCard 
        icon="🌀" 
        title="Woorden Doolhof" 
        desc="Vind je weg door het doolhof door de juiste letters te kiezen!" 
        active={displayMaze} 
        to={displayMaze ? "/wordmaze" : null} 
        unlockMsg={limitReached ? "Dagelijkse limiet bereikt" : "Scoor 10 punten in Letter Bouw"} 
        bgColor="bg-purple-100" 
        borderColor="border-purple-400" 
      />
      <GameCard 
        icon="🏆" 
        title="Finale Woorden Bouw" 
        desc="Bouw woorden onder tijdsdruk en word een echte kampioen!" 
        active={displayFinal} 
        to={displayFinal ? "/finalwordbuilder" : null} 
        unlockMsg={limitReached ? "Dagelijkse limiet bereikt" : "Scoor 10 punten in Woorden Doolhof"} 
        bgColor="bg-pink-100" 
        borderColor="border-pink-400" 
      />
    </div>
  );
}

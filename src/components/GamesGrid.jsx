import React from "react";
import GameCard from "./GameCard";
import { useTranslation } from "react-i18next";

export default function GamesGrid({ 
  displayWordMatch, 
  displayLetterBuild, 
  displayMaze, 
  displayFinal, 
  limitReached 
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <GameCard 
        icon="🧩" 
        title={t("gameCards.wordMatch.title")} 
        desc={t("gameCards.wordMatch.desc")} 
        active={displayWordMatch} 
        to={displayWordMatch ? "/game" : null} 
        unlockMsg={limitReached ? t("gameCards.limitReached") : t("gameCards.wordMatch.unlockMsg")}
        bgColor="bg-green-100" 
        borderColor="border-green-400" 
      />
      <GameCard 
        icon="🔤" 
        title={t("gameCards.letterBuild.title")} 
        desc={t("gameCards.letterBuild.desc")} 
        active={displayLetterBuild} 
        to={displayLetterBuild ? "/letterbuild" : null} 
        unlockMsg={limitReached ? t("gameCards.limitReached") : t("gameCards.letterBuild.unlockMsg")} 
        bgColor="bg-blue-100" 
        borderColor="border-blue-400" 
      />
      <GameCard 
        icon="🌀" 
        title={t("gameCards.wordMaze.title")} 
        desc={t("gameCards.wordMaze.desc")} 
        active={displayMaze} 
        to={displayMaze ? "/wordmaze" : null} 
        unlockMsg={limitReached ? t("gameCards.limitReached") : t("gameCards.wordMaze.unlockMsg")} 
        bgColor="bg-purple-100" 
        borderColor="border-purple-400" 
      />
      <GameCard 
        icon="🏆" 
        title={t("gameCards.finalWordBuilder.title")} 
        desc={t("gameCards.finalWordBuilder.desc")} 
        active={displayFinal} 
        to={displayFinal ? "/finalwordbuilder" : null} 
        unlockMsg={limitReached ? t("gameCards.limitReached") : t("gameCards.finalWordBuilder.unlockMsg")} 
        bgColor="bg-pink-100" 
        borderColor="border-pink-400" 
      />
    </div>
  );
}

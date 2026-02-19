import React from "react";
import GameCard from "./GameCard";
import { useTranslation } from "react-i18next";

export default function GamesGrid({
  displayWordMatch,
  displayLetterBuild,
  displayMaze,
  displayFinal,
  limitReached,
  currentKeys = 0,
  keyThresholds = { letterBuild: 5, maze: 15, final: 30 },
  onUnlock,
  unlocking,
  purchasedLetterBuild = false,
  purchasedMaze = false,
  purchasedFinal = false,
  globallyLocked = false,
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

      {/* WordMatch — always free, never globally locked */}
      <GameCard
        icon="🧩"
        title={t("gameCards.wordMatch.title")}
        desc={t("gameCards.wordMatch.desc")}
        active={displayWordMatch}
        to={displayWordMatch ? "/game" : null}
        bgColor="bg-green-100"
        borderColor="border-green-400"
        purchased={true}
        globallyLocked={false}
        unlockMsg={limitReached ? t("gameCards.limitReached") : undefined}
      />

      {/* Letter Bouw */}
      <GameCard
        icon="🔤"
        title={t("gameCards.letterBuild.title")}
        desc={t("gameCards.letterBuild.desc")}
        active={displayLetterBuild}
        to={displayLetterBuild ? "/letterbuild" : null}
        bgColor="bg-blue-100"
        borderColor="border-blue-400"
        keysRequired={keyThresholds.letterBuild}
        currentKeys={currentKeys}
        canAfford={!limitReached && !globallyLocked && currentKeys >= keyThresholds.letterBuild}
        purchased={purchasedLetterBuild}
        globallyLocked={globallyLocked}
        isUnlocking={unlocking === "letterBuild"}
        onUnlock={onUnlock ? () => onUnlock("letterBuild", keyThresholds.letterBuild) : null}
        unlockMsg={
          limitReached
            ? t("gameCards.limitReached")
            : t("gameCards.letterBuild.unlockMsg")
        }
      />

      {/* Woorden Doolhof */}
      <GameCard
        icon="🌀"
        title={t("gameCards.wordMaze.title")}
        desc={t("gameCards.wordMaze.desc")}
        active={displayMaze}
        to={displayMaze ? "/wordmaze" : null}
        bgColor="bg-purple-100"
        borderColor="border-purple-400"
        keysRequired={keyThresholds.maze}
        currentKeys={currentKeys}
        canAfford={!limitReached && !globallyLocked && currentKeys >= keyThresholds.maze}
        purchased={purchasedMaze}
        globallyLocked={globallyLocked}
        isUnlocking={unlocking === "wordMaze"}
        onUnlock={onUnlock ? () => onUnlock("wordMaze", keyThresholds.maze) : null}
        unlockMsg={
          limitReached
            ? t("gameCards.limitReached")
            : t("gameCards.wordMaze.unlockMsg")
        }
      />

      {/* Finale Woorden Bouw */}
      <GameCard
        icon="🏆"
        title={t("gameCards.finalWordBuilder.title")}
        desc={t("gameCards.finalWordBuilder.desc")}
        active={displayFinal}
        to={displayFinal ? "/finalwordbuilder" : null}
        bgColor="bg-pink-100"
        borderColor="border-pink-400"
        keysRequired={keyThresholds.final}
        currentKeys={currentKeys}
        canAfford={!limitReached && !globallyLocked && currentKeys >= keyThresholds.final}
        purchased={purchasedFinal}
        globallyLocked={globallyLocked}
        isUnlocking={unlocking === "finalWordBuilder"}
        onUnlock={onUnlock ? () => onUnlock("finalWordBuilder", keyThresholds.final) : null}
        unlockMsg={
          limitReached
            ? t("gameCards.limitReached")
            : t("gameCards.finalWordBuilder.unlockMsg")
        }
      />

    </div>
  );
}

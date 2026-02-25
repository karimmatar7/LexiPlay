// src/components/GamesGrid.jsx
import React from "react";
import GameCard from "./GameCard";
import { useTranslation } from "react-i18next";

export default function GamesGrid({
  displayWordMatch, displayLetterBuild, displayMaze, displayFinal, displayLetterDraw,
  limitReached, currentKeys = 0,
  keyThresholds = { letterBuild: 5, maze: 15, final: 30, letterDraw: 10 },
  onUnlock, unlocking,
  purchasedLetterBuild = false, purchasedMaze = false,
  purchasedFinal = false, purchasedLetterDraw = false,
  globallyLocked = false,
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

      <GameCard icon="🧩"
        title={t("gameCards.wordMatch.title")} desc={t("gameCards.wordMatch.desc")}
        active={displayWordMatch && !globallyLocked}
        to={displayWordMatch && !globallyLocked ? "/game" : null}
        bgColor="bg-green-100" borderColor="border-green-400"
        purchased={true} globallyLocked={globallyLocked}
        unlockMsg={limitReached ? t("gameCards.limitReached") : undefined}
      />

      <GameCard icon="🔤"
        title={t("gameCards.letterBuild.title")} desc={t("gameCards.letterBuild.desc")}
        active={displayLetterBuild} to={displayLetterBuild ? "/letterbuild" : null}
        bgColor="bg-blue-100" borderColor="border-blue-400"
        keysRequired={keyThresholds.letterBuild} currentKeys={currentKeys}
        canAfford={!limitReached && !globallyLocked && currentKeys >= keyThresholds.letterBuild}
        purchased={purchasedLetterBuild} globallyLocked={globallyLocked}
        isUnlocking={unlocking === "letterBuild"}
        onUnlock={onUnlock ? () => onUnlock("letterBuild", keyThresholds.letterBuild) : null}
        unlockMsg={limitReached ? t("gameCards.limitReached") : t("gameCards.letterBuild.unlockMsg")}
      />

      <GameCard icon="🌀"
        title={t("gameCards.wordMaze.title")} desc={t("gameCards.wordMaze.desc")}
        active={displayMaze} to={displayMaze ? "/wordmaze" : null}
        bgColor="bg-purple-100" borderColor="border-purple-400"
        keysRequired={keyThresholds.maze} currentKeys={currentKeys}
        canAfford={!limitReached && !globallyLocked && currentKeys >= keyThresholds.maze}
        purchased={purchasedMaze} globallyLocked={globallyLocked}
        isUnlocking={unlocking === "wordMaze"}
        onUnlock={onUnlock ? () => onUnlock("wordMaze", keyThresholds.maze) : null}
        unlockMsg={limitReached ? t("gameCards.limitReached") : t("gameCards.wordMaze.unlockMsg")}
      />

      <GameCard icon="🏆"
        title={t("gameCards.finalWordBuilder.title")} desc={t("gameCards.finalWordBuilder.desc")}
        active={displayFinal} to={displayFinal ? "/finalwordbuilder" : null}
        bgColor="bg-pink-100" borderColor="border-pink-400"
        keysRequired={keyThresholds.final} currentKeys={currentKeys}
        canAfford={!limitReached && !globallyLocked && currentKeys >= keyThresholds.final}
        purchased={purchasedFinal} globallyLocked={globallyLocked}
        isUnlocking={unlocking === "finalWordBuilder"}
        onUnlock={onUnlock ? () => onUnlock("finalWordBuilder", keyThresholds.final) : null}
        unlockMsg={limitReached ? t("gameCards.limitReached") : t("gameCards.finalWordBuilder.unlockMsg")}
      />

      {/* 5th card:
          - mobile: full width (col-span-1 on 1-col grid = full width naturally)
          - sm+: centered at half width using nested 2-col grid trick */}
      <div className="col-span-1 sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4">
        <div className="hidden sm:block" /> {/* empty left cell — desktop only */}
        <GameCard icon="✏️"
          title={t("gameCards.letterDraw.title", "Letter Draw")}
          desc={t("gameCards.letterDraw.desc", "Draw letters and score goals!")}
          active={displayLetterDraw} to={displayLetterDraw ? "/letterdraw" : null}
          bgColor="bg-orange-100" borderColor="border-orange-400"
          keysRequired={keyThresholds.letterDraw} currentKeys={currentKeys}
          canAfford={!limitReached && !globallyLocked && currentKeys >= keyThresholds.letterDraw}
          purchased={purchasedLetterDraw} globallyLocked={globallyLocked}
          isUnlocking={unlocking === "letterDraw"}
          onUnlock={onUnlock ? () => onUnlock("letterDraw", keyThresholds.letterDraw) : null}
          unlockMsg={limitReached ? t("gameCards.limitReached") : t("gameCards.letterDraw.unlockMsg", "Unlock for 10 🗝️")}
        />
      </div>

    </div>
  );
}

// src/components/GamesGrid.jsx
import React from "react";
import { useTranslation } from "react-i18next";

import GameCard from "./GameCard";

import puzzleIcon from "../assets/icons/puzzle.png";
import abcIcon from "../assets/icons/abc.png";
import mazeIcon from "../assets/icons/maze.png";
import cupIcon from "../assets/icons/cup.png";
import pencilIcon from "../assets/icons/pencil.png";
import keyIcon from "../assets/icons/key.png";

export default function GamesGrid({
  displayWordMatch,
  displayLetterBuild,
  displayMaze,
  displayFinal,
  displayLetterDraw,
  limitReached,
  currentKeys = 0,
  keyThresholds = {
    letterBuild: 5,
    maze: 15,
    final: 30,
    letterDraw: 10,
  },
  onUnlock,
  unlocking,
  purchasedLetterBuild = false,
  purchasedMaze = false,
  purchasedFinal = false,
  purchasedLetterDraw = false,
  globallyLocked = false,
}) {
  const { t } = useTranslation();

  const letterDrawUnlockMessage = limitReached
    ? t("gameCards.limitReached")
    : (
      <>
        {t("gameCards.letterDraw.unlockMsg")}
        <img
          src={keyIcon}
          alt=""
          aria-hidden="true"
          className="ml-1 inline-block h-4 w-4 align-text-bottom object-contain"
        />
      </>
    );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <GameCard
        icon={puzzleIcon}
        title={t("gameCards.wordMatch.title")}
        desc={t("gameCards.wordMatch.desc")}
        active={displayWordMatch && !globallyLocked}
        to={displayWordMatch && !globallyLocked ? "/game" : null}
        bgColor="bg-green-100"
        borderColor="border-green-400"
        purchased
        globallyLocked={globallyLocked}
        unlockMsg={limitReached ? t("gameCards.limitReached") : undefined}
      />

      <GameCard
        icon={abcIcon}
        title={t("gameCards.letterBuild.title")}
        desc={t("gameCards.letterBuild.desc")}
        active={displayLetterBuild}
        to={displayLetterBuild ? "/letterbuild" : null}
        bgColor="bg-blue-100"
        borderColor="border-blue-400"
        keysRequired={keyThresholds.letterBuild}
        currentKeys={currentKeys}
        canAfford={
          !limitReached &&
          !globallyLocked &&
          currentKeys >= keyThresholds.letterBuild
        }
        purchased={purchasedLetterBuild}
        globallyLocked={globallyLocked}
        isUnlocking={unlocking === "letterBuild"}
        onUnlock={
          onUnlock
            ? () => onUnlock("letterBuild", keyThresholds.letterBuild)
            : null
        }
        unlockMsg={
          limitReached
            ? t("gameCards.limitReached")
            : t("gameCards.letterBuild.unlockMsg")
        }
      />

      <GameCard
        icon={mazeIcon}
        title={t("gameCards.wordMaze.title")}
        desc={t("gameCards.wordMaze.desc")}
        active={displayMaze}
        to={displayMaze ? "/wordmaze" : null}
        bgColor="bg-purple-100"
        borderColor="border-purple-400"
        keysRequired={keyThresholds.maze}
        currentKeys={currentKeys}
        canAfford={
          !limitReached &&
          !globallyLocked &&
          currentKeys >= keyThresholds.maze
        }
        purchased={purchasedMaze}
        globallyLocked={globallyLocked}
        isUnlocking={unlocking === "wordMaze"}
        onUnlock={
          onUnlock
            ? () => onUnlock("wordMaze", keyThresholds.maze)
            : null
        }
        unlockMsg={
          limitReached
            ? t("gameCards.limitReached")
            : t("gameCards.wordMaze.unlockMsg")
        }
      />

      <GameCard
        icon={cupIcon}
        title={t("gameCards.finalWordBuilder.title")}
        desc={t("gameCards.finalWordBuilder.desc")}
        active={displayFinal}
        to={displayFinal ? "/finalwordbuilder" : null}
        bgColor="bg-pink-100"
        borderColor="border-pink-400"
        keysRequired={keyThresholds.final}
        currentKeys={currentKeys}
        canAfford={
          !limitReached &&
          !globallyLocked &&
          currentKeys >= keyThresholds.final
        }
        purchased={purchasedFinal}
        globallyLocked={globallyLocked}
        isUnlocking={unlocking === "finalWordBuilder"}
        onUnlock={
          onUnlock
            ? () => onUnlock("finalWordBuilder", keyThresholds.final)
            : null
        }
        unlockMsg={
          limitReached
            ? t("gameCards.limitReached")
            : t("gameCards.finalWordBuilder.unlockMsg")
        }
      />

      <div className="col-span-1 sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4">
        <div className="hidden sm:block" />

        <GameCard
          icon={pencilIcon}
          title={t("gameCards.letterDraw.title")}
          desc={t("gameCards.letterDraw.desc")}
          active={displayLetterDraw}
          to={displayLetterDraw ? "/letterdraw" : null}
          bgColor="bg-orange-100"
          borderColor="border-orange-400"
          keysRequired={keyThresholds.letterDraw}
          currentKeys={currentKeys}
          canAfford={
            !limitReached &&
            !globallyLocked &&
            currentKeys >= keyThresholds.letterDraw
          }
          purchased={purchasedLetterDraw}
          globallyLocked={globallyLocked}
          isUnlocking={unlocking === "letterDraw"}
          onUnlock={
            onUnlock
              ? () =>
                  onUnlock("letterDraw", keyThresholds.letterDraw)
              : null
          }
          unlockMsg={letterDrawUnlockMessage}
        />
      </div>
    </div>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import GameCard from "./GameCard";
import MobileGameLauncher from "./games/MobileGameLauncher";
import MobileGameWheel from "./games/MobileGameWheel";

import puzzleIcon from "../assets/icons/puzzle.png";
import abcIcon from "../assets/icons/abc.png";
import mazeIcon from "../assets/icons/maze.png";
import cupIcon from "../assets/icons/cup.png";
import pencilIcon from "../assets/icons/pencil.png";
import keyIcon from "../assets/icons/key.png";

const tr = (t, key, fallback) => {
  const value = t(key);
  return value === key ? fallback : value;
};

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
  const navigate = useNavigate();
  const [isWheelOpen, setIsWheelOpen] = useState(false);

  const blocked = limitReached || globallyLocked;

  useEffect(() => {
    if (!isWheelOpen) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsWheelOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isWheelOpen]);

  const games = useMemo(
    () => {
      const letterDrawMessage = limitReached ? (
        t("gameCards.limitReached")
      ) : (
        <>
          {t("gameCards.letterDraw.unlockMsg")}
          <img
            src={keyIcon}
            alt=""
            aria-hidden="true"
            draggable="false"
            className="ml-1 inline-block h-4 w-4 align-text-bottom object-contain"
          />
        </>
      );

      const baseGames = [
        {
          id: "wordMatch",
          icon: puzzleIcon,
          title: t("gameCards.wordMatch.title"),
          desc: t("gameCards.wordMatch.desc"),
          active: displayWordMatch && !globallyLocked,
          to: "/game",
          bgColor: "bg-green-100",
          borderColor: "border-green-400",
          pickerColor: "from-green-300 to-emerald-500",
          purchased: true,
          unlockMsg: limitReached ? t("gameCards.limitReached") : undefined,
        },
        {
          id: "letterBuild",
          icon: abcIcon,
          title: t("gameCards.letterBuild.title"),
          desc: t("gameCards.letterBuild.desc"),
          active: displayLetterBuild,
          to: "/letterbuild",
          bgColor: "bg-blue-100",
          borderColor: "border-blue-400",
          pickerColor: "from-sky-300 to-blue-500",
          keysRequired: keyThresholds.letterBuild,
          purchased: purchasedLetterBuild,
          unlockMsg: blocked
            ? t("gameCards.limitReached")
            : t("gameCards.letterBuild.unlockMsg"),
        },
        {
          id: "wordMaze",
          icon: mazeIcon,
          title: t("gameCards.wordMaze.title"),
          desc: t("gameCards.wordMaze.desc"),
          active: displayMaze,
          to: "/wordmaze",
          bgColor: "bg-purple-100",
          borderColor: "border-purple-400",
          pickerColor: "from-violet-300 to-purple-500",
          keysRequired: keyThresholds.maze,
          purchased: purchasedMaze,
          unlockMsg: blocked
            ? t("gameCards.limitReached")
            : t("gameCards.wordMaze.unlockMsg"),
        },
        {
          id: "finalWordBuilder",
          icon: cupIcon,
          title: t("gameCards.finalWordBuilder.title"),
          desc: t("gameCards.finalWordBuilder.desc"),
          active: displayFinal,
          to: "/finalwordbuilder",
          bgColor: "bg-pink-100",
          borderColor: "border-pink-400",
          pickerColor: "from-pink-300 to-rose-500",
          keysRequired: keyThresholds.final,
          purchased: purchasedFinal,
          unlockMsg: blocked
            ? t("gameCards.limitReached")
            : t("gameCards.finalWordBuilder.unlockMsg"),
        },
        {
          id: "letterDraw",
          icon: pencilIcon,
          title: t("gameCards.letterDraw.title"),
          desc: t("gameCards.letterDraw.desc"),
          active: displayLetterDraw,
          to: "/letterdraw",
          bgColor: "bg-orange-100",
          borderColor: "border-orange-400",
          pickerColor: "from-orange-300 to-amber-400",
          keysRequired: keyThresholds.letterDraw,
          purchased: purchasedLetterDraw,
          unlockMsg: letterDrawMessage,
        },
      ];

      return baseGames.map((game) => ({
        ...game,
        currentKeys,
        globallyLocked,
        canAfford:
          !blocked &&
          (game.purchased || currentKeys >= (game.keysRequired || 0)),
        isUnlocking: unlocking === game.id,
        onUnlock:
          game.id === "wordMatch" || !onUnlock
            ? null
            : () => onUnlock(game.id, game.keysRequired),
      }));
    },
    [
      t,
      blocked,
      currentKeys,
      globallyLocked,
      displayWordMatch,
      displayLetterBuild,
      displayMaze,
      displayFinal,
      displayLetterDraw,
      keyThresholds,
      purchasedLetterBuild,
      purchasedMaze,
      purchasedFinal,
      purchasedLetterDraw,
      limitReached,
      onUnlock,
      unlocking,
    ]
  );

  const handleGameSelect = (game) => {
    if (!game.active) return;
    setIsWheelOpen(false);
    navigate(game.to);
  };

  return (
    <>
      <MobileGameLauncher
        games={games}
        onOpen={() => setIsWheelOpen(true)}
        labels={{
          title: tr(t, "gamePicker.myGames", "My games"),
          subtitle: tr(
            t,
            "gamePicker.chooseAdventure",
            "Choose your adventure"
          ),
        }}
      />

      <MobileGameWheel
        open={isWheelOpen}
        games={games}
        currentKeys={currentKeys}
        onClose={() => setIsWheelOpen(false)}
        onSelect={handleGameSelect}
        labels={{
          title: tr(t, "gamePicker.title", "Pick a game"),
          close: tr(t, "gamePicker.close", "Close"),
          locked: tr(t, "gamePicker.locked", "Locked"),
        }}
      />

      <div className="hidden md:grid md:grid-cols-2 md:gap-4">
        {games.map((game) => (
          <GameCard
            key={game.id}
            icon={game.icon}
            title={game.title}
            desc={game.desc}
            active={game.active}
            to={game.active ? game.to : null}
            bgColor={game.bgColor}
            borderColor={game.borderColor}
            keysRequired={game.keysRequired}
            currentKeys={game.currentKeys}
            canAfford={game.canAfford}
            purchased={game.purchased}
            globallyLocked={game.globallyLocked}
            isUnlocking={game.isUnlocking}
            onUnlock={game.onUnlock}
            unlockMsg={game.unlockMsg}
          />
        ))}
      </div>
    </>
  );
}
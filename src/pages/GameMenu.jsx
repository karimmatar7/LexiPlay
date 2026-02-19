import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import { useParentalControl } from "../hooks/useParentalControl";
import GameMenuHeader from "../components/GameMenuHeader";
import GamesGrid from "../components/GamesGrid";
import TimeLeftDisplay from "../components/TimeLeftDisplay";
import ParentalControlModal from "../components/ParentalControlModal";
import { getUser, unlockGame } from "../utils/user.js";

const KEY_THRESHOLDS = { letterBuild: 5, maze: 15, final: 30 };
const MAX_HEARTS = 5;

function formatCountdown(seconds) {
  if (seconds === null || seconds === undefined) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GameMenu({ user, setUser }) {
  const { t } = useTranslation();
  const { fontType, fontSize } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-xl" };
  const navigate = useNavigate();
  const location = useLocation();

  const [progress, setProgress] = useState(user?.progress || {});
  const [unlocking, setUnlocking] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const {
    timeLeft,
    limitReached,
    showLimitModal,
    returnTime,
    handleCloseModal,
    setShowLimitModal,
    setLimitReached,
    modalShownRef,
  } = useParentalControl(user);

  useEffect(() => {
    if (location.state?.limitReached) {
      setShowLimitModal(true);
      setLimitReached(true);
      modalShownRef.current = true;
      navigate("/menu", { replace: true, state: {} });
    }
  }, [location.state]);

  // Load progress on mount
  useEffect(() => {
    async function loadProgress() {
      if (!user?.id) return;
      const latestUser = await getUser(user.id);
      if (latestUser?.progress) {
        setProgress(latestUser.progress);
        setUser((prev) => ({ ...prev, progress: latestUser.progress }));
      }
    }
    loadProgress();
  }, [user?.id]);

  // Poll DB every 30s while globally locked to catch heart refills
  useEffect(() => {
    const finalCooldown = progress?.finalWordBuilder?.cooldownUntil;
    const finalHearts = progress?.finalWordBuilder?.hearts ?? MAX_HEARTS;
    const isLocked =
      finalHearts <= 0 &&
      finalCooldown &&
      new Date(finalCooldown) > new Date();

    if (!isLocked) return;

    const poll = setInterval(async () => {
      const latestUser = await getUser(user.id);
      if (latestUser?.progress) {
        setProgress(latestUser.progress);
        setUser((prev) => ({ ...prev, progress: latestUser.progress }));
      }
    }, 30000);

    return () => clearInterval(poll);
  }, [progress?.finalWordBuilder?.cooldownUntil, progress?.finalWordBuilder?.hearts]);

  // Live countdown ticker — 1 second interval
  const finalCooldown = progress?.finalWordBuilder?.cooldownUntil;
  useEffect(() => {
    if (!finalCooldown) {
      setCountdown(null);
      return;
    }

    const tick = () => {
      const secs = Math.max(0, Math.round((new Date(finalCooldown) - new Date()) / 1000));
      setCountdown(secs);

      // When countdown hits 0, immediately re-fetch from DB
      if (secs <= 0) {
        getUser(user.id).then((latestUser) => {
          if (latestUser?.progress) {
            setProgress(latestUser.progress);
            setUser((prev) => ({ ...prev, progress: latestUser.progress }));
          }
        });
      }
    };

    tick(); // run immediately on mount
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [finalCooldown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const keys = progress?.currency?.keys || 0;

  const finalHearts = progress?.finalWordBuilder?.hearts ?? MAX_HEARTS;
  const finalGloballyLocked =
    finalHearts <= 0 &&
    finalCooldown &&
    new Date(finalCooldown) > new Date();

  const letterBuildUnlocked = progress?.letterBuild?.unlocked === true;
  const mazeUnlocked        = progress?.wordMaze?.unlocked === true;
  const finalUnlocked       = progress?.finalWordBuilder?.unlocked === true;

  const displayWordMatch   = !limitReached;
  const displayLetterBuild = !limitReached && !finalGloballyLocked && letterBuildUnlocked;
  const displayMaze        = !limitReached && !finalGloballyLocked && mazeUnlocked;
  const displayFinal       = !limitReached && !finalGloballyLocked && finalUnlocked;

  const handleUnlock = async (gameKey, keyCost) => {
    if (keys < keyCost || finalGloballyLocked) return;
    setUnlocking(gameKey);
    const result = await unlockGame(user.id, gameKey, keyCost);
    if (result.success) {
      const newProgress = result.user.progress;
      setProgress(newProgress);
      if (typeof setUser === "function") {
        setUser((prev) => ({ ...prev, progress: newProgress }));
      }
    }
    setUnlocking(null);
  };

  return (
    <div className={`min-h-screen bg-sky-50 p-4 md:p-8 ${fontClass} ${sizeMap[fontSize]} relative overflow-hidden`}>
      <div className="absolute top-8 left-8 w-32 h-32 bg-pink-200 rounded-full opacity-30 pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-40 h-40 bg-yellow-200 rounded-full opacity-25 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <GameMenuHeader fontClass={fontClass} sizeMap={sizeMap} fontSize={fontSize} name={user?.name}>
          <TimeLeftDisplay timeLeft={timeLeft} limitReached={limitReached} formatTime={formatTime} />
        </GameMenuHeader>

        {/* Global heart lock banner */}
        {finalGloballyLocked && (
          <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-3xl p-6 shadow-md">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-5 select-none pointer-events-none">
              🔒
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">

              {/* Icon */}
              <div className="flex-shrink-0 w-16 h-16 bg-red-100 border-2 border-red-300 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-3xl">🔒</span>
              </div>

              {/* Text */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-lg font-black text-red-600 mb-1">
                  {t("finalWordBuilder.allLockedTitle")}
                </p>
                <p className="text-sm text-red-400 mb-2">
                  {t("finalWordBuilder.allLockedDesc")}
                </p>
                <div className="inline-flex items-center gap-2 bg-white border border-red-200 rounded-full px-4 py-1.5 shadow-sm">
                  <span className="text-sm">⏳</span>
                  <span className="text-sm font-bold text-red-500 tabular-nums">
                    {t("letterBuild.tryLater")}{" "}
                    {countdown !== null ? formatCountdown(countdown) : "..."}
                  </span>
                </div>
              </div>

              {/* Hearts */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <div className="flex gap-1.5">
                  {Array.from({ length: MAX_HEARTS }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-2xl leading-none transition-all duration-300 ${
                        i < finalHearts ? "opacity-100" : "opacity-20 grayscale"
                      }`}
                    >
                      ❤️
                    </span>
                  ))}
                </div>
                <p className="text-xs font-bold text-red-400 mt-1">
                  {finalHearts}/{MAX_HEARTS}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Keys pill */}
        <div className="flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-3 bg-white border-2 border-yellow-300 rounded-2xl px-5 py-3 shadow-sm w-fit">
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none">🗝️</span>
              <div className="leading-tight">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t("gameMenu.yourKeys") || "Jouw sleutels"}
                </p>
                <p className="text-2xl font-black text-yellow-500 leading-none">{keys}</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-yellow-200" />

            <div className="flex flex-col gap-0.5 text-xs">
              {[
                { threshold: KEY_THRESHOLDS.letterBuild, label: t("gameCards.letterBuild.title"), unlocked: letterBuildUnlocked },
                { threshold: KEY_THRESHOLDS.maze,        label: t("gameCards.wordMaze.title"),    unlocked: mazeUnlocked },
                { threshold: KEY_THRESHOLDS.final,       label: t("gameCards.finalWordBuilder.title"), unlocked: finalUnlocked },
              ].map(({ threshold, label, unlocked }) => (
                <p
                  key={threshold}
                  className={`flex items-center gap-1 font-semibold ${
                    unlocked ? "text-green-600" : keys >= threshold ? "text-yellow-600" : "text-gray-400"
                  }`}
                >
                  <span>{unlocked ? "✅" : keys >= threshold ? "🔓" : "🔒"}</span>
                  <span>{threshold} → {label}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Games grid */}
        <GamesGrid
          displayWordMatch={displayWordMatch}
          displayLetterBuild={displayLetterBuild}
          displayMaze={displayMaze}
          displayFinal={displayFinal}
          limitReached={limitReached}
          globallyLocked={finalGloballyLocked}
          currentKeys={keys}
          keyThresholds={KEY_THRESHOLDS}
          onUnlock={limitReached || finalGloballyLocked ? null : handleUnlock}
          unlocking={unlocking}
          purchasedLetterBuild={letterBuildUnlocked}
          purchasedMaze={mazeUnlocked}
          purchasedFinal={finalUnlocked}
        />

        {/* Settings */}
        <div className="flex justify-center pb-4">
          <Link
            to="/settings"
            className="inline-flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-600 text-white px-10 py-4 rounded-2xl text-lg font-bold shadow-md hover:shadow-lg border-b-4 border-indigo-700 transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-xl">⚙️</span>
            <span>{t("gameMenu.settings")}</span>
          </Link>
        </div>
      </div>

      <button
        onClick={() => navigate("/unlock-parental")}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg border-2 border-purple-400 hover:bg-purple-700 hover:scale-110 transition-transform duration-200 z-50"
        title={t("gameMenu.parentalControl")}
      >
        👨‍👩‍👧
      </button>

      <ParentalControlModal show={showLimitModal} returnTime={returnTime} onClose={handleCloseModal} />
    </div>
  );
}

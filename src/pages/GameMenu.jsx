// src/pages/GameMenu.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import { useParentalControl } from "../hooks/useParentalControl";
import GameMenuHeader from "../components/GameMenuHeader";
import GamesGrid from "../components/GamesGrid";
import TimeLeftDisplay from "../components/TimeLeftDisplay";
import ParentalControlModal from "../components/ParentalControlModal";
import AnimatedBlobs from "../components/AnimatedBlobs";
import FloatingBgEmojis from "../components/FloatingBgEmojis";
import XPCard from "../components/XPCard";
import KeysCard from "../components/KeysCard";
import GlobalLockBanner from "../components/GlobalLockBanner";
import GameMenuTour from "../components/GameMenuTour";
import { getUser, unlockGame, updateSettings } from "../utils/user.js";

const KEY_THRESHOLDS = { letterBuild: 5, maze: 15, final: 30 };
const MAX_HEARTS = 5;

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

  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

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
  }, [location.state, modalShownRef, navigate, setLimitReached, setShowLimitModal]);

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
  }, [user?.id, setUser]);

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
  }, [progress?.finalWordBuilder?.cooldownUntil, progress?.finalWordBuilder?.hearts, setUser, user?.id]);

  const finalCooldown = progress?.finalWordBuilder?.cooldownUntil;

  useEffect(() => {
    if (!finalCooldown) {
      setCountdown(null);
      return;
    }
    const tick = () => {
      const secs = Math.max(
        0,
        Math.round((new Date(finalCooldown) - new Date()) / 1000)
      );
      setCountdown(secs);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [finalCooldown]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, "0")}:${(s % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  const keys = progress?.currency?.keys || 0;
  const userXP = progress?.xp || 0;
  const userLevel = progress?.level || 1;

  const finalHearts = progress?.finalWordBuilder?.hearts ?? MAX_HEARTS;
  const finalGloballyLocked =
    finalHearts <= 0 &&
    finalCooldown &&
    new Date(finalCooldown) > new Date();

  const letterBuildUnlocked = progress?.letterBuild?.unlocked === true;
  const mazeUnlocked = progress?.wordMaze?.unlocked === true;
  const finalUnlocked = progress?.finalWordBuilder?.unlocked === true;

  const handleUnlock = async (gameKey, keyCost) => {
    if (keys < keyCost || finalGloballyLocked) return;
    setUnlocking(gameKey);
    const result = await unlockGame(user.id, gameKey, keyCost);
    if (result.success) {
      const newProgress = result.user.progress;
      setProgress(newProgress);
      setUser?.((prev) => ({ ...prev, progress: newProgress }));
    }
    setUnlocking(null);
  };

  const tourSteps = [
    { key: "header",  icon: "🦊", title: t("menuTour.headerTitle"),  description: t("menuTour.headerDesc"),  hint: t("menuTour.headerHint"),  skipLabel: t("menuTour.skip"),  nextLabel: t("menuTour.next"),  finishLabel: t("menuTour.finish") },
    { key: "xp",      icon: "⭐", title: t("menuTour.xpTitle"),      description: t("menuTour.xpDesc"),      hint: t("menuTour.xpHint"),      skipLabel: t("menuTour.skip"),  nextLabel: t("menuTour.next"),  finishLabel: t("menuTour.finish") },
    { key: "keys",    icon: "🗝️",title: t("menuTour.keysTitle"),    description: t("menuTour.keysDesc"),    hint: t("menuTour.keysHint"),    skipLabel: t("menuTour.skip"),  nextLabel: t("menuTour.next"),  finishLabel: t("menuTour.finish") },
    { key: "games",   icon: "🎮", title: t("menuTour.gamesTitle"),   description: t("menuTour.gamesDesc"),   hint: t("menuTour.gamesHint"),   skipLabel: t("menuTour.skip"),  nextLabel: t("menuTour.next"),  finishLabel: t("menuTour.finish") },
    { key: "settings",icon: "⚙️", title: t("menuTour.settingsTitle"),description: t("menuTour.settingsDesc"),hint: t("menuTour.settingsHint"),skipLabel: t("menuTour.skip"),  nextLabel: t("menuTour.next"),  finishLabel: t("menuTour.finish") }
  ];

  useEffect(() => {
    if (!user) return;
    const hasSeen = user.settings?.hasSeenMenuTour;
    if (!hasSeen) {
      setTourStep(0);
      setShowTour(true);
    }
  }, [user]);

  const startTour  = () => { setTourStep(0); setShowTour(true); };
  const skipTour   = () => setShowTour(false);
  const finishTour = async () => {
    setShowTour(false);
    if (!user) return;
    const updated = await updateSettings(user.id, { hasSeenMenuTour: true });
    if (updated) {
      const newUser = { ...user, settings: updated.settings };
      setUser(newUser);
      localStorage.setItem("lexiplay_user", JSON.stringify(newUser));
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-sky-50 via-sky-50 to-indigo-50 px-3 pb-6 pt-4 md:px-6 md:pt-6 ${fontClass} ${sizeMap[fontSize]} relative overflow-hidden`}
    >
      <style>{`
        @keyframes gm-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .gm-s1 { animation: gm-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .gm-s2 { animation: gm-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.10s both; }
        .gm-s3 { animation: gm-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .gm-s4 { animation: gm-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.20s both; }
        .gm-s5 { animation: gm-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
      `}</style>

      <AnimatedBlobs />
      <FloatingBgEmojis />

      <div className="relative max-w-5xl mx-auto flex flex-col gap-4 md:gap-6 z-10">

        {/* HEADER CARD: logo on top, avatar row below for better hierarchy */}
    <section className="gm-s1">
  <div className="rounded-3xl bg-white/95 backdrop-blur-xl shadow-[0_25px_50px_rgba(0,0,0,0.1)] border border-white/50 px-0 py-0 overflow-hidden">
    <GameMenuHeader
      avatar={user?.avatar}
      fontClass={fontClass}
      sizeMap={sizeMap}
      fontSize={fontSize}
      name={user?.name}
    >
      <TimeLeftDisplay timeLeft={timeLeft} limitReached={limitReached} formatTime={formatTime} />
    </GameMenuHeader>
  </div>
</section>


        {/* XP + Keys: same width, same height, aligned to games card width */}
        <section className="gm-s2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="h-full">
              <div className="h-full rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] border border-slate-100 flex">
                <div className="flex-1 px-4 py-3 sm:px-5 sm:py-4  border-2 border-indigo-200 rounded-3xl shadow-lg">
                  <XPCard xp={userXP} level={userLevel} />
                </div>
              </div>
            </div>
            <div className="h-full">
              <div className="h-full rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] border border-slate-100 flex">
                <div className="flex-1 px-4 py-3 sm:px-5 sm:py-4 border-2 border-yellow-300 rounded-3xl shadow-md">
                  <KeysCard
                    keys={keys}
                    thresholds={KEY_THRESHOLDS}
                    unlocked={{
                      letterBuild: letterBuildUnlocked,
                      maze: mazeUnlocked,
                      final: finalUnlocked,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {finalGloballyLocked && (
          <section className="gm-s3">
            <GlobalLockBanner
              hearts={finalHearts}
              cooldownUntil={finalCooldown}
              countdown={countdown}
              userId={user.id}
              onHeartsRefilled={(updatedUser) => {
                const newProgress = updatedUser.progress;
                setProgress(newProgress);
                setUser((prev) => ({ ...prev, progress: newProgress }));
              }}
            />
          </section>
        )}

        {/* Games grid in full-width card */}
        <section className="gm-s4">
          <div className="rounded-3xl bg-white/95 backdrop-blur-sm shadow-[0_18px_40px_rgba(15,23,42,0.08)] border border-slate-100 px-3 py-4 sm:px-5 sm:py-5">
            <GamesGrid
              displayWordMatch={!limitReached}
              displayLetterBuild={
                !limitReached && !finalGloballyLocked && letterBuildUnlocked
              }
              displayMaze={
                !limitReached && !finalGloballyLocked && mazeUnlocked
              }
              displayFinal={
                !limitReached && !finalGloballyLocked && finalUnlocked
              }
              limitReached={limitReached}
              globallyLocked={finalGloballyLocked}
              currentKeys={keys}
              keyThresholds={KEY_THRESHOLDS}
              onUnlock={
                limitReached || finalGloballyLocked ? null : handleUnlock
              }
              unlocking={unlocking}
              purchasedLetterBuild={letterBuildUnlocked}
              purchasedMaze={mazeUnlocked}
              purchasedFinal={finalUnlocked}
            />
          </div>
        </section>

        {/* Settings + tour link */}
        <section className="gm-s5 flex flex-col items-center gap-2 pb-2">
          <Link
            to="/settings"
            className="inline-flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold shadow-md hover:shadow-lg border-b-4 border-indigo-700 transform hover:scale-105 active:scale-100 transition-all duration-200 px-7 py-3 text-sm sm:text-base"
          >
            <span className="text-lg sm:text-xl">⚙️</span>
            <span>{t("gameMenu.settings")}</span>
          </Link>

          <button
            type="button"
            onClick={startTour}
            className="text-[11px] sm:text-xs font-semibold text-purple-600 hover:text-purple-800 underline decoration-dotted"
          >
            {t("menuTour.showAgain")}
          </button>
        </section>
      </div>

      {/* parental FAB */}
      <button
        onClick={() => navigate("/unlock-parental")}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 bg-purple-600 text-white rounded-full shadow-lg border-2 border-purple-400 hover:bg-purple-700 hover:scale-110 active:scale-95 transition-transform duration-200 z-50 flex items-center justify-center"
        style={{
          width: "clamp(44px,11vw,56px)",
          height: "clamp(44px,11vw,56px)",
          fontSize: "clamp(18px,4vw,24px)",
        }}
        title={t("gameMenu.parentalControl")}
      >
        👨‍👩‍👧
      </button>

      <ParentalControlModal
        show={showLimitModal}
        returnTime={returnTime}
        onClose={handleCloseModal}
      />

      <GameMenuTour
        open={showTour}
        stepIndex={tourStep}
        steps={tourSteps}
        fontClass={fontClass}
        onNext={() =>
          setTourStep((i) => Math.min(i + 1, tourSteps.length - 1))
        }
        onPrev={() => setTourStep((i) => Math.max(i - 1, 0))}
        onSkip={skipTour}
        onFinish={finishTour}
      />
    </div>
  );
}

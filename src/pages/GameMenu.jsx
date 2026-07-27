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
import parentsIcon from "../assets/icons/parents.png";
import foxIcon from "../assets/icons/fox.png";
import starIcon from "../assets/icons/star.png";
import keyIcon from "../assets/icons/key.png";
import gamesIcon from "../assets/icons/games.png";
import settingsIcon from "../assets/icons/settings.png";

const KEY_THRESHOLDS = { letterBuild: 5, maze: 15, final: 30, letterDraw: 10 };
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
  const letterDrawUnlocked = progress?.letterDraw?.unlocked === true;

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
    {
      key: "header",
      icon: foxIcon,
      title: t("menuTour.headerTitle"),
      description: t("menuTour.headerDesc"),
      hint: t("menuTour.headerHint"),
      skipLabel: t("menuTour.skip"),
      nextLabel: t("menuTour.next"),
      finishLabel: t("menuTour.finish"),
    },
    {
      key: "xp",
      icon: starIcon,
      title: t("menuTour.xpTitle"),
      description: t("menuTour.xpDesc"),
      hint: t("menuTour.xpHint"),
      skipLabel: t("menuTour.skip"),
      nextLabel: t("menuTour.next"),
      finishLabel: t("menuTour.finish"),
    },
    {
      key: "keys",
      icon: keyIcon,
      title: t("menuTour.keysTitle"),
      description: t("menuTour.keysDesc"),
      hint: t("menuTour.keysHint"),
      skipLabel: t("menuTour.skip"),
      nextLabel: t("menuTour.next"),
      finishLabel: t("menuTour.finish"),
    },
    {
      key: "games",
      icon: gamesIcon,
      title: t("menuTour.gamesTitle"),
      description: t("menuTour.gamesDesc"),
      hint: t("menuTour.gamesHint"),
      skipLabel: t("menuTour.skip"),
      nextLabel: t("menuTour.next"),
      finishLabel: t("menuTour.finish"),
    },
    {
      key: "settings",
      icon: settingsIcon,
      title: t("menuTour.settingsTitle"),
      description: t("menuTour.settingsDesc"),
      hint: t("menuTour.settingsHint"),
      skipLabel: t("menuTour.skip"),
      nextLabel: t("menuTour.next"),
      finishLabel: t("menuTour.finish"),
    },
  ];

  useEffect(() => {
    if (!user) return;
    const hasSeen = user.settings?.hasSeenMenuTour;
    if (!hasSeen) {
      setTourStep(0);
      setShowTour(true);
    }
  }, [user]);

  const startTour = () => { setTourStep(0); setShowTour(true); };
  const skipTour = () => setShowTour(false);
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

      {/* Fox watermark — large, soft, tucked in the corner so it reads even behind cards */}
      <div
        className="absolute -bottom-16 -right-16 md:-bottom-24 md:-right-24 z-0 pointer-events-none"
        style={{
          width: "min(60vw, 560px)",
          height: "min(60vw, 560px)",
          backgroundImage: "url(/fox.png)",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(6px)",
          opacity: 0.4,
        }}
        aria-hidden="true"
      />

      <AnimatedBlobs />
      <FloatingBgEmojis />

      <div className="relative max-w-5xl mx-auto flex flex-col gap-4 md:gap-6 z-10">

        {/* HEADER */}
        <section className="gm-s1 rounded-3xl bg-white/90 backdrop-blur-xl shadow-[0_25px_50px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden">
          <GameMenuHeader
            avatar={user?.avatar}
            fontClass={fontClass}
            sizeMap={sizeMap}
            fontSize={fontSize}
            name={user?.name}
          >
            <TimeLeftDisplay timeLeft={timeLeft} limitReached={limitReached} formatTime={formatTime} />
          </GameMenuHeader>
        </section>

        {/* XP + Keys — single flat cards, no nested boxes */}
        <section className="gm-s2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="rounded-3xl bg-white/90 backdrop-blur-sm shadow-[0_14px_30px_rgba(15,23,42,0.06)] border border-indigo-100 px-4 py-3 sm:px-5 sm:py-4">
            <XPCard xp={userXP} level={userLevel} />
          </div>
          <div className="rounded-3xl bg-white/90 backdrop-blur-sm shadow-[0_14px_30px_rgba(15,23,42,0.06)] border border-yellow-100 px-4 py-3 sm:px-5 sm:py-4">
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

        {/* Games grid — no extra card wrapper, GamesGrid's own cards carry the visual weight */}
        <section className="gm-s4">
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
            displayLetterDraw={
              !limitReached && !finalGloballyLocked && letterDrawUnlocked
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
            purchasedLetterDraw={letterDrawUnlocked}
          />
        </section>

     {/* Settings + tour — two balanced pill buttons, responsive */}
<section className="gm-s5 pb-2">
  <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
    <Link
      to="/settings"
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-bold shadow-[0_8px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_10px_24px_rgba(99,102,241,0.45)] transition-all duration-200 px-6 py-3 text-sm sm:text-base"
    >
      <img
        src={settingsIcon}
        alt=""
        aria-hidden="true"
        className="h-5 w-5 object-contain"
        draggable="false"
      />
      <span>{t("gameMenu.settings")}</span>
    </Link>

    <button
      type="button"
      onClick={startTour}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white hover:bg-purple-50 text-purple-700 rounded-full font-semibold border border-purple-200 hover:border-purple-300 shadow-sm transition-all duration-200 px-6 py-3 text-sm sm:text-base"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4.5 w-4.5 flex-shrink-0"
        style={{ height: 18, width: 18 }}
        aria-hidden="true"
      >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
      <span>{t("menuTour.showAgain")}</span>
    </button>
  </div>
</section>
      </div>

   {/* parental FAB — bottom-left, bolder pill style, clear of the fox watermark */}
<button
  onClick={() => navigate("/unlock-parental")}
  className="fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-50 flex items-center gap-2 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-[0_10px_25px_rgba(126,34,206,0.4)] border-2 border-white/70 hover:shadow-[0_14px_32px_rgba(126,34,206,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 pl-3 pr-3 sm:pr-5 py-3"
  title={t("gameMenu.parentalControl")}
>
  <img
    src={parentsIcon}
    alt=""
    aria-hidden="true"
    draggable="false"
    className="h-6 w-6 sm:h-7 sm:w-7 object-contain flex-shrink-0"
  />
  <span className="hidden sm:inline text-sm font-bold tracking-wide whitespace-nowrap">
    {t("gameMenu.parentalControl")}
  </span>
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
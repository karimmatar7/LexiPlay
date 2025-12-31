import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import { useParentalControl } from "../hooks/useParentalControl";
import GameMenuHeader from "../components/GameMenuHeader";
import GamesGrid from "../components/GamesGrid";
import TimeLeftDisplay from "../components/TimeLeftDisplay";
import ParentalControlModal from "../components/ParentalControlModal";
import { getUser } from "../utils/user.js";

export default function GameMenu({ user }) {
  const { t } = useTranslation();
  const { fontType, fontSize } = useSettings();
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans";
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-xl" };
  const navigate = useNavigate();
  const location = useLocation();

  const [progress, setProgress] = useState(user?.progress || {});
  
  const {
    timeLeft,
    limitReached,
    showLimitModal,
    returnTime,
    handleCloseModal,
    setShowLimitModal,
    setLimitReached,
    modalShownRef
  } = useParentalControl(user);

  // Handle redirect from game when limit reached
  useEffect(() => {
    if (location.state?.limitReached) {
      setShowLimitModal(true);
      setLimitReached(true);
      modalShownRef.current = true;
      navigate('/menu', { replace: true, state: {} });
    }
  }, [location.state, navigate, setShowLimitModal, setLimitReached, modalShownRef]);

  // Load progress
  useEffect(() => {
    async function loadProgress() {
      if (!user?.id) return;
      const latestUser = await getUser(user.id);
      if (latestUser?.progress) setProgress(latestUser.progress);
    }
    loadProgress();
  }, [user?.id]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Determine unlock states
  const letterBuildUnlocked = progress?.wordMatch?.letterBuildUnlocked || false;
  const mazeUnlocked = progress?.letterBuild?.mazeUnlocked || false;
  const finalUnlocked = progress?.wordMaze?.finalWordBuilderUnlocked || false;

  // Override unlocks if limit reached
  const displayWordMatch = !limitReached;
  const displayLetterBuild = limitReached ? false : letterBuildUnlocked;
  const displayMaze = limitReached ? false : mazeUnlocked;
  const displayFinal = limitReached ? false : finalUnlocked;

  return (
    <div className={`min-h-screen bg-sky-50 p-6 md:p-8 ${fontClass} ${sizeMap[fontSize]} relative`}>
      {/* Background shapes */}
      <div className="absolute top-8 left-8 w-32 h-32 bg-pink-200 rounded-full opacity-30" />
      <div className="absolute bottom-12 right-12 w-40 h-40 bg-yellow-200 rounded-full opacity-25" />

      <div className="relative max-w-6xl mx-auto space-y-12">
        <GameMenuHeader fontClass={fontClass} sizeMap={sizeMap} fontSize={fontSize} name={user?.name}>
          <TimeLeftDisplay timeLeft={timeLeft} limitReached={limitReached} formatTime={formatTime} />
        </GameMenuHeader>

        <GamesGrid
          displayWordMatch={displayWordMatch}
          displayLetterBuild={displayLetterBuild}
          displayMaze={displayMaze}
          displayFinal={displayFinal}
          limitReached={limitReached}
        />

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/settings" 
            className="group inline-flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-md hover:shadow-lg border-b-4 border-indigo-700 transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-2xl">⚙️</span>
            <span>{t("gameMenu.settings")}</span>
          </Link>
        </div>
      </div>

      {/* Parental Control Floating Button */}
      <button 
        onClick={() => navigate("/unlock-parental")} 
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg border-2 border-purple-400 hover:bg-purple-700 hover:scale-110 transition-transform duration-200 z-50" 
        title={t("gameMenu.parentalControl")}
      >
        👨‍👩‍👧
      </button>

      <ParentalControlModal 
        show={showLimitModal} 
        returnTime={returnTime} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}

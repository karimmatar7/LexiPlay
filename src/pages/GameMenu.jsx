import React, { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useSettings } from "../context/SettingsContext"
import { useParentalControl } from "../hooks/useParentalControl"
import GameMenuHeader from "../components/GameMenuHeader"
import GamesGrid from "../components/GamesGrid"
import TimeLeftDisplay from "../components/TimeLeftDisplay"
import ParentalControlModal from "../components/ParentalControlModal"
import AnimatedBlobs from "../components/AnimatedBlobs"
import FloatingBgEmojis from "../components/FloatingBgEmojis"
import XPCard from "../components/XPCard"
import KeysCard from "../components/KeysCard"
import GlobalLockBanner from "../components/GlobalLockBanner"
import { getUser, unlockGame } from "../utils/user.js"

const KEY_THRESHOLDS = { letterBuild: 5, maze: 15, final: 30 }
const MAX_HEARTS = 5

export default function GameMenu({ user, setUser }) {
  const { t } = useTranslation()
  const { fontType, fontSize } = useSettings()
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-xl" }
  const navigate = useNavigate()
  const location = useLocation()

  const [progress, setProgress] = useState(user?.progress || {})
  const [unlocking, setUnlocking] = useState(null)
  const [countdown, setCountdown] = useState(null)

  const {
    timeLeft, limitReached, showLimitModal, returnTime,
    handleCloseModal, setShowLimitModal, setLimitReached, modalShownRef,
  } = useParentalControl(user)

  useEffect(() => {
    if (location.state?.limitReached) {
      setShowLimitModal(true)
      setLimitReached(true)
      modalShownRef.current = true
      navigate("/menu", { replace: true, state: {} })
    }
  }, [location.state])

  useEffect(() => {
    async function loadProgress() {
      if (!user?.id) return
      const latestUser = await getUser(user.id)
      if (latestUser?.progress) {
        setProgress(latestUser.progress)
        setUser((prev) => ({ ...prev, progress: latestUser.progress }))
      }
    }
    loadProgress()
  }, [user?.id])

  useEffect(() => {
    const finalCooldown = progress?.finalWordBuilder?.cooldownUntil
    const finalHearts   = progress?.finalWordBuilder?.hearts ?? MAX_HEARTS
    const isLocked = finalHearts <= 0 && finalCooldown && new Date(finalCooldown) > new Date()
    if (!isLocked) return
    const poll = setInterval(async () => {
      const latestUser = await getUser(user.id)
      if (latestUser?.progress) {
        setProgress(latestUser.progress)
        setUser((prev) => ({ ...prev, progress: latestUser.progress }))
      }
    }, 30000)
    return () => clearInterval(poll)
  }, [progress?.finalWordBuilder?.cooldownUntil, progress?.finalWordBuilder?.hearts])

  const finalCooldown = progress?.finalWordBuilder?.cooldownUntil
  useEffect(() => {
    if (!finalCooldown) { setCountdown(null); return }
    const tick = () => {
      const secs = Math.max(0, Math.round((new Date(finalCooldown) - new Date()) / 1000))
      setCountdown(secs)
      if (secs <= 0) {
        getUser(user.id).then((u) => {
          if (u?.progress) {
            setProgress(u.progress)
            setUser((prev) => ({ ...prev, progress: u.progress }))
          }
        })
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [finalCooldown])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
  }

  const keys        = progress?.currency?.keys || 0
  const userXP      = progress?.xp    || 0
  const userLevel   = progress?.level || 1

  const finalHearts = progress?.finalWordBuilder?.hearts ?? MAX_HEARTS
  const finalGloballyLocked =
    finalHearts <= 0 && finalCooldown && new Date(finalCooldown) > new Date()

  const letterBuildUnlocked = progress?.letterBuild?.unlocked === true
  const mazeUnlocked        = progress?.wordMaze?.unlocked === true
  const finalUnlocked       = progress?.finalWordBuilder?.unlocked === true

  const handleUnlock = async (gameKey, keyCost) => {
    if (keys < keyCost || finalGloballyLocked) return
    setUnlocking(gameKey)
    const result = await unlockGame(user.id, gameKey, keyCost)
    if (result.success) {
      const newProgress = result.user.progress
      setProgress(newProgress)
      setUser?.((prev) => ({ ...prev, progress: newProgress }))
    }
    setUnlocking(null)
  }

  return (
    <div className={`min-h-screen bg-sky-50 p-4 md:p-8 ${fontClass} ${sizeMap[fontSize]} relative overflow-hidden`}>
      <style>{`
        @keyframes gm-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .gm-s1 { animation: gm-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .gm-s2 { animation: gm-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .gm-s3 { animation: gm-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
        .gm-s4 { animation: gm-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
        .gm-s5 { animation: gm-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.45s both; }
        .gm-s6 { animation: gm-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
      `}</style>

      <AnimatedBlobs />
      <FloatingBgEmojis />

      <div className="relative max-w-6xl mx-auto flex flex-col gap-5 md:gap-7 z-10">

        <div className="gm-s1">
          <GameMenuHeader avatar={user?.avatar} fontClass={fontClass} sizeMap={sizeMap} fontSize={fontSize} name={user?.name}>
            <TimeLeftDisplay timeLeft={timeLeft} limitReached={limitReached} formatTime={formatTime} />
          </GameMenuHeader>
        </div>

        <div className="flex justify-center gm-s2">
          <XPCard xp={userXP} level={userLevel} />
        </div>

   {finalGloballyLocked && (
  <div className="gm-s2">
    <GlobalLockBanner
      hearts={finalHearts}
      cooldownUntil={finalCooldown}
      countdown={countdown}
      userId={user.id}
      onHeartsRefilled={(updatedUser) => {
        const newProgress = updatedUser.progress
        setProgress(newProgress)
        setUser((prev) => ({ ...prev, progress: newProgress }))
      }}
    />
  </div>
)}

        <div className="flex justify-center gm-s3">
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

        <div className="gm-s4">
          <GamesGrid
            displayWordMatch={!limitReached}
            displayLetterBuild={!limitReached && !finalGloballyLocked && letterBuildUnlocked}
            displayMaze={!limitReached && !finalGloballyLocked && mazeUnlocked}
            displayFinal={!limitReached && !finalGloballyLocked && finalUnlocked}
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
        </div>

        <div className="flex justify-center pb-4 gm-s5">
          <Link
            to="/settings"
            className="inline-flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold shadow-md hover:shadow-lg border-b-4 border-indigo-700 transform hover:scale-105 transition-all duration-200"
            style={{
              padding: "clamp(12px,3vw,16px) clamp(24px,6vw,40px)",
              fontSize: "clamp(14px,3vw,18px)",
            }}
          >
            <span style={{ fontSize: "clamp(16px,3.5vw,22px)" }}>⚙️</span>
            <span>{t("gameMenu.settings")}</span>
          </Link>
        </div>
      </div>

      <button
        onClick={() => navigate("/unlock-parental")}
        className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full shadow-lg border-2 border-purple-400 hover:bg-purple-700 hover:scale-110 transition-transform duration-200 z-50 flex items-center justify-center"
        style={{
          width: "clamp(44px,10vw,56px)",
          height: "clamp(44px,10vw,56px)",
          fontSize: "clamp(18px,4vw,24px)",
        }}
        title={t("gameMenu.parentalControl")}
      >
        👨‍👩‍👧
      </button>

      <ParentalControlModal show={showLimitModal} returnTime={returnTime} onClose={handleCloseModal} />
    </div>
  )
}

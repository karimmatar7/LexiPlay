import React, { useState, useEffect, useCallback } from "react"
import { useSettings } from "../context/SettingsContext"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import GameContainer from "../components/GameContainer"
import LoadingScreen from "../components/LoadingScreen"
import ResetConfirmationModal from "../components/ResetConfirmationModal"
import NoHeartsScreen from "../components/NoHeartsScreen"          // ← ADD
import WordDisplay from "../components/WordDisplay"
import FloatingLetterButton from "../components/FloatingLetterButton"
import { HeartsDisplay } from "../components/HeartsDisplay"
import { useHearts } from "../hooks/useHearts"
import XPBadge from "../components/XPBadge"
import LevelUpToast from "../components/LevelUpToast"
import KeyStreakBar from "../components/KeyStreakBar"
import wordData from "../data/words.json"
import { gameAnimations } from "../styles/GameAnimations"
import { useGameAudio } from "../hooks/useGameAudio"
import { useGameProgress } from "../hooks/useGameProgress"
import { useGameTimer } from "../hooks/useGameTimer"
import usePlaytimeTracker from "../hooks/usePlaytimeTracker"
import { getUser, addKeysAndXP } from "../supabaseFunctions.js"
import clockIcon from "../assets/icons/clock.png"
import writingIcon from "../assets/icons/writing.png"
import AppButton from "../components/AppButton";

const TOTAL_WORDS  = 20
const GAME_TIME    = 400
const WARNING_TIME = 30
const MAX_HEARTS   = 5
const KEY_EVERY_N  = 4

const warningSeenKey = (userId) => `finalWordBuilder_warningSeen_${userId}`
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

function GlobalLockWarningModal({ onClose, t }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl border-2 border-red-300 shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-black text-red-600 mb-3">
          {t("finalWordBuilder.warningTitle")}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          {t("finalWordBuilder.warningDesc")}
        </p>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 mb-5">
          <p className="text-xs text-red-700 font-semibold flex items-center justify-center gap-2">
            <span>🔒</span>
            <span>{t("finalWordBuilder.warningLockAll")}</span>
          </p>
        </div>
    <AppButton
  type="button"
  onClick={onClose}
  variant="red"
  className="w-full rounded-2xl"
>
  <span aria-hidden="true">✅</span>
  <span>{t("finalWordBuilder.warningUnderstood")}</span>
</AppButton>
      </div>
    </div>
  )
}

export default function FinalWordBuilder({ user, setUser }) {
  usePlaytimeTracker(user)

  const { fontType, fontSize, soundOn } = useSettings()
  const { t, i18n } = useTranslation()
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-xl" }
  const navigate = useNavigate()

  const [words,           setWords]           = useState([])
  const [currentIndex,    setCurrentIndex]    = useState(0)
  const [selected,        setSelected]        = useState([])
  const [timeLeft,        setTimeLeft]        = useState(GAME_TIME)
  const [gameOver,        setGameOver]        = useState(false)
  const [gameOverReason,  setGameOverReason]  = useState(null)
  const [paused,          setPaused]          = useState(false)
  const [showResetModal,  setShowResetModal]  = useState(false)
  const [shakeWrong,      setShakeWrong]      = useState(false)
  const [floatingLetters, setFloatingLetters] = useState([])
  const [showWarning,     setShowWarning]     = useState(false)
  const [heartsInit,      setHeartsInit]      = useState(null)
  const [cooldownInit,    setCooldownInit]    = useState(null)
  const [justLeveledUp,   setJustLeveledUp]   = useState(false)
  const [keyStreak,       setKeyStreak]       = useState(0)
  const [keyJustEarned,   setKeyJustEarned]   = useState(false)

  const {
    loaded, initialGameState, finalProgress, setFinalProgress,
    saveProgressToDb, checkAndAwardStars,
  } = useGameProgress(user, setUser, wordData, TOTAL_WORDS, shuffle)

  // ── ADD setHearts + setCooldownUntil ──────────────────────────
  const {
    hearts, cooldownUntil, heartAnimating, loseHeart,
    maxHearts, heartsReady, setHearts, setCooldownUntil,
  } = useHearts({
    user, gameKey: "finalWordBuilder",
    initialHearts: heartsInit, initialCooldown: cooldownInit,
  })

  const keys    = user?.progress?.currency?.keys || 0
  const xp      = user?.progress?.xp    || 0
  const xpLevel = user?.progress?.level || 1

  // ── Initial load from Supabase ────────────────────────────────
  useEffect(() => {
    async function loadHearts() {
      if (!user?.id) return
      const userData = await getUser(user.id)
      const saved = userData?.progress?.finalWordBuilder
      setHeartsInit(saved?.hearts         ?? MAX_HEARTS)
      setCooldownInit(saved?.cooldownUntil ?? null)
    }
    loadHearts()
  }, [user?.id])

  // ── Re-sync when parent user.progress changes (e.g. after menu purchase) ──
  useEffect(() => {
    const saved = user?.progress?.finalWordBuilder
    if (saved?.hearts === undefined) return
    setHeartsInit(saved.hearts)
    setCooldownInit(saved.cooldownUntil ?? null)
    // Also push directly into useHearts so the guard re-evaluates immediately
    setHearts(saved.hearts)
    setCooldownUntil(saved.cooldownUntil ?? null)
  }, [user?.progress?.finalWordBuilder?.hearts]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user?.id) return
    const seen = localStorage.getItem(warningSeenKey(user.id))
    if (!seen) setShowWarning(true)
  }, [user?.id])

  const handleCloseWarning = () => {
    localStorage.setItem(warningSeenKey(user.id), "true")
    setShowWarning(false)
  }

  const getLocalizedWord = useCallback((wordObj) => {
    if (!wordObj) return ""
    const lang = (i18n.language || "en").toLowerCase()
    if (lang.startsWith("en")) return wordObj.en     || ""
    if (lang.startsWith("fr")) return wordObj.fr     || ""
    if (lang.startsWith("nl")) return wordObj.correct|| ""
    return wordObj.correct || wordObj.en || ""
  }, [i18n.language])

  useEffect(() => {
    const word = words[currentIndex]
    if (!word) return
    const displayWord = getLocalizedWord(word)
    if (!displayWord) return
    setFloatingLetters(shuffle(displayWord.split("")))
    const interval = setInterval(() => {
      setFloatingLetters(prev => shuffle(prev))
    }, 2000)
    return () => clearInterval(interval)
  }, [currentIndex, words, i18n.language, getLocalizedWord])

  useEffect(() => {
    if (!loaded) return
    if (initialGameState) {
      setWords(
        initialGameState.words.map(w => ({
          ...wordData.find(orig => orig.sound === w.sound) || w,
        }))
      )
      setCurrentIndex(initialGameState.currentIndex)
      setSelected(initialGameState.selected || [])
      setTimeLeft(initialGameState.timeLeft)
    } else {
      setWords(shuffle(wordData).slice(0, TOTAL_WORDS))
      setCurrentIndex(0)
      setSelected([])
      setTimeLeft(GAME_TIME)
    }
  }, [initialGameState, loaded])

const isPlaying = loaded && !paused && !gameOver && !showResetModal && !showWarning && hearts > 0
  const { playCuteBeep } = useGameAudio(soundOn, isPlaying)

  useGameTimer(
    timeLeft, setTimeLeft, loaded, false, gameOver,
    paused, showResetModal, false, setGameOver, setGameOverReason,
    playCuteBeep, WARNING_TIME
  )

  const currentWordData = words[currentIndex]
  const currentWord = currentWordData
    ? { ...currentWordData, displayWord: getLocalizedWord(currentWordData) }
    : null

  const saveProgress = async () => {
    if (!user) return
    const progressData = {
      ...finalProgress,
      score: currentIndex,
      gameState: {
        words: words.map(w => ({ ...w })),
        selected, currentIndex, timeLeft,
      },
    }
    await saveProgressToDb(progressData)
    setFinalProgress(progressData)
  }

  const handleLetterClick = async (letter) => {
    if (gameOver || paused || !currentWord) return
    const correctLetter = currentWord.displayWord[selected.length]

    if (letter === correctLetter) {
      const updated = [...selected, letter]
      setSelected(updated)
      playCuteBeep(1000, 0.08)

      if (updated.length === currentWord.displayWord.length) {
        const newStreak = keyStreak + 1
        const earnKey   = newStreak >= KEY_EVERY_N
        const result = await addKeysAndXP(user.id, earnKey ? 1 : 0, 10)
        if (result) {
          setUser((prev) => ({ ...prev, progress: result.user.progress }))
          if (result.leveledUp) {
            setJustLeveledUp(true)
            setTimeout(() => setJustLeveledUp(false), 3000)
          }
        }
        if (earnKey) {
          setKeyStreak(0); setKeyJustEarned(true)
          setTimeout(() => setKeyJustEarned(false), 1500)
        } else {
          setKeyStreak(newStreak)
        }
        setTimeout(() => playCuteBeep(1200, 0.15), 100)
        setTimeout(nextWord, 600)
      }
    } else {
      setShakeWrong(true)
      setTimeout(() => setShakeWrong(false), 500)
      playCuteBeep(300, 0.2)
      setKeyStreak(0)
      await loseHeart()
      if (hearts - 1 <= 0) { setGameOver(true); setGameOverReason("hearts") }
    }
  }

  const nextWord = async () => {
    setSelected([])
    const newIndex = currentIndex + 1
    if (newIndex >= TOTAL_WORDS) {
      await loopGame()
    } else {
      setCurrentIndex(newIndex)
      await checkAndAwardStars(newIndex, { words, timeLeft })
    }
  }

  const loopGame = async () => {
    const freshWords = shuffle(wordData).slice(0, TOTAL_WORDS)
    const newProgress = { ...finalProgress, score: 0, rewardsEarned: [false, false, false], gameState: {} }
    setWords(freshWords); setCurrentIndex(0); setSelected([])
    setTimeLeft(GAME_TIME); setKeyStreak(0)
    setFinalProgress(newProgress)
    await saveProgressToDb(newProgress)
  }

  const resetGame = async () => {
    const newProgress = { ...finalProgress, score: 0, rewardsEarned: [false, false, false], gameState: {} }
    setShowResetModal(false); setGameOver(false); setGameOverReason(null)
    setPaused(false); setKeyStreak(0)
    setWords(shuffle(wordData).slice(0, TOTAL_WORDS))
    setCurrentIndex(0); setSelected([]); setTimeLeft(GAME_TIME)
    setFinalProgress(newProgress)
    await saveProgressToDb(newProgress)
  }

  const togglePause = async () => {
    const newPaused = !paused
    setPaused(newPaused)
    if (newPaused) await saveProgress()
  }

  const goHome = async () => {
    await saveProgress()
    navigate("/menu", { replace: true })
  }

  // ── Guards ────────────────────────────────────────────────────
  if (!loaded || !heartsReady)
    return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />

  // ── REPLACED: now uses NoHeartsScreen so buy-hearts works ────
  if (hearts <= 0) return (
    <NoHeartsScreen
      hearts={hearts}
      cooldownUntil={cooldownUntil}
      fontClass={fontClass}
      sizeClass={sizeMap[fontSize]}
      userId={user.id}
      gameKey="finalWordBuilder"
          isGlobalLock={true}          
      onHeartsRefilled={(updatedUser) => {
        const g = updatedUser.progress.finalWordBuilder
        setHearts(g.hearts)
        setCooldownUntil(g.cooldownUntil)
        setUser(updatedUser)
        setGameOver(false)
        setGameOverReason(null)
      }}
    />
  )

  // ── gameOver: hearts → NoHeartsScreen, time → own screen ─────
  if (gameOver) {
    if (gameOverReason === "hearts") return (
      <NoHeartsScreen
        hearts={0}
        cooldownUntil={cooldownUntil}
        fontClass={fontClass}
        sizeClass={sizeMap[fontSize]}
        userId={user.id}
        gameKey="finalWordBuilder"
          isGlobalLock={true} 
        onHeartsRefilled={(updatedUser) => {
          const g = updatedUser.progress.finalWordBuilder
          setHearts(g.hearts)
          setCooldownUntil(g.cooldownUntil)
          setUser(updatedUser)
          setGameOver(false)
          setGameOverReason(null)
        }}
      />
    )

    return (
      <div className={`min-h-screen bg-sky-50 flex items-center justify-center p-4 ${fontClass} ${sizeMap[fontSize]}`}>
        <div className="bg-white w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-3xl border-2 border-red-300 shadow-lg text-center">
          <div className="text-5xl mb-4">⏰</div>
          <h2 className="text-xl font-black text-red-600 mb-3">
            {t("game.timeUp") || "Tijd op!"}
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            {t("game.timeUpDesc") || "Je tijd is op. Probeer het opnieuw!"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={resetGame}
              className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-md border-b-4 border-indigo-700 transition-all duration-200 hover:scale-105">
              🔄 {t("game.tryAgain") || "Opnieuw"}
            </button>
            <button onClick={goHome}
              className="inline-flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-2xl font-bold border-2 border-gray-300 transition-all duration-200 hover:scale-105">
              🏠 {t("letterBuild.backToMenu")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showResetModal)
    return (
      <ResetConfirmationModal
        onConfirm={resetGame}
        onCancel={() => setShowResetModal(false)}
        cancelText={t("finalWordBuilder.cancel")}
      />
    )

  if (!currentWord) return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />

  const isWarningTime = timeLeft <= WARNING_TIME

  return (
    <div className={`min-h-screen bg-sky-50 p-6 md:p-8 ${fontClass} ${sizeMap[fontSize]} relative`}>
      <div className="absolute top-8 left-8 w-32 h-32 bg-pink-200 rounded-full opacity-30" />
      <div className="absolute bottom-12 right-12 w-40 h-40 bg-yellow-200 rounded-full opacity-25" />

      <style>{gameAnimations}</style>

      {showWarning && <GlobalLockWarningModal onClose={handleCloseWarning} t={t} />}

      <button
        onClick={() => setShowWarning(true)}
        className="fixed top-6 right-6 z-40 w-10 h-10 bg-red-500 hover:bg-red-600 text-white font-black text-lg rounded-full shadow-lg border-2 border-red-700 flex items-center justify-center transition-all duration-200 hover:scale-110"
        title={t("finalWordBuilder.warningTitle")}
      >
        !
      </button>

      <div className="relative max-w-6xl mx-auto space-y-10">
        <GameContainer
          fontClass={fontClass} sizeClass={sizeMap[fontSize]}
          score={currentIndex} total={TOTAL_WORDS} keys={keys}
          progress={(currentIndex / TOTAL_WORDS) * 100}
          paused={paused} rewardsEarned={finalProgress.rewardsEarned}
          onPauseToggle={togglePause} onHome={goHome}
          onReset={() => setShowResetModal(true)}
        >
          <HeartsDisplay hearts={hearts} heartAnimating={heartAnimating} maxHearts={maxHearts} />
          <XPBadge xp={xp} level={xpLevel} />
          <KeyStreakBar keyStreak={keyStreak} keyEveryN={KEY_EVERY_N} justEarned={keyJustEarned} soundOn={soundOn} />

          <div className="text-center space-y-6 md:space-y-10">
            <div className="flex justify-center">
              <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold shadow-md border-2 ${
                isWarningTime ? "bg-red-100 border-red-400 text-red-600 animate-pulse" : "bg-white border-sky-300 text-sky-700"
              }`}>
<span className="flex h-5 w-5 items-center justify-center">
  {isWarningTime ? (
    <span className="text-xl">⚠️</span>
  ) : (
    <img
      src={clockIcon}
      alt=""
      aria-hidden="true"
      draggable="false"
      className="h-5 w-5 object-contain sm:h-6 sm:w-6"
    />
  )}
</span>                <span className="text-lg tabular-nums">{timeLeft}s</span>
              </div>
            </div>

            <WordDisplay selected={selected} totalLetters={currentWord?.displayWord.length || 0} shakeWrong={shakeWrong} />

            <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
              {floatingLetters.map((l, i) => (
                <FloatingLetterButton key={i} letter={l} index={i} onClick={handleLetterClick} disabled={paused} />
              ))}
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border-2 border-sky-300">
                <img
                  src={writingIcon}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  className="h-5 w-5 object-contain sm:h-6 sm:w-6"
                />
                <span className="text-lg font-bold text-gray-700">
                  {t("finalWordBuilder.word")}{" "}
                  <span className="text-sky-600">{currentIndex + 1}</span> / {TOTAL_WORDS}
                </span>
              </div>
            </div>
          </div>
        </GameContainer>
      </div>

      <LevelUpToast level={xpLevel} show={justLeveledUp} />
    </div>
  )
}

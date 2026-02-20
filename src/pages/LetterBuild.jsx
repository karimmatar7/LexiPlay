import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useSettings } from "../context/SettingsContext"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import GameContainer from "../components/GameContainer"
import LoadingScreen from "../components/LoadingScreen"
import ResetConfirmationModal from "../components/ResetConfirmationModal"
import NoHeartsScreen from "../components/NoHeartsScreen"
import { HeartsDisplay } from "../components/HeartsDisplay"
import { useHearts } from "../hooks/useHearts"
import XPBadge from "../components/XPBadge"
import LevelUpToast from "../components/LevelUpToast"
import KeyStreakBar from "../components/KeyStreakBar"
import LetterBuildGameArea from "../components/letterBuild/LetterBuildGameArea"
import { useLetterBuildSlots } from "../hooks/useLetterBuildSlots"
import wordData from "../data/words.json"
import { updateProgress, getUser, addReward, addKeysAndXP } from "../supabaseFunctions.js"
import { calculateStars } from "../utils/progressStars"
import usePlaytimeTracker from "../hooks/usePlaytimeTracker"

const MAX_HEARTS  = 5
const KEY_EVERY_N = 4

function buildLevels(wordsPerLevel) {
  const shuffled = [...wordData].sort(() => 0.5 - Math.random())
  return Array.from(
    { length: Math.ceil(shuffled.length / wordsPerLevel) },
    (_, i) => shuffled.slice(i * wordsPerLevel, i * wordsPerLevel + wordsPerLevel)
  )
}

export default function LetterBuild({ user, setUser, wordsPerLevel = 7 }) {
  const { t, i18n } = useTranslation()
  usePlaytimeTracker(user)

  const { fontType, fontSize, soundOn } = useSettings()
  const navigate = useNavigate()

  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = {
    small:  "text-base md:text-lg",
    medium: "text-lg md:text-xl",
    large:  "text-xl md:text-2xl",
  }
  const sizeClass = sizeMap[fontSize || "medium"]

  const [words,               setWords]               = useState(() => buildLevels(wordsPerLevel))
  const [letterBuildProgress, setLetterBuildProgress] = useState({
    level: 0, levelIndex: 0, rewardsEarned: [false, false, false],
  })
  const [heartsInit,     setHeartsInit]     = useState(null)
  const [cooldownInit,   setCooldownInit]   = useState(null)
  const [feedback,       setFeedback]       = useState("")
  const [paused,         setPaused]         = useState(false)
  const [shuffleKey,     setShuffleKey]     = useState(0)
  const [letterSlots,    setLetterSlots]    = useState([])
  const [loading,        setLoading]        = useState(true)
  const [showResetModal, setShowResetModal] = useState(false)
  const [justLeveledUp,  setJustLeveledUp]  = useState(false)
  const [keyStreak,      setKeyStreak]      = useState(0)
  const [keyJustEarned,  setKeyJustEarned]  = useState(false)

  const currentWordRef    = useRef(null)
  const checkingRef       = useRef(false)

  // ── Refs to break stale closure in useEffect dep arrays ──
  const keyStreakRef       = useRef(keyStreak)
  const loseHeartRef      = useRef(null)
  const nextWordOrLevelRef = useRef(null)
  const userRef           = useRef(user)
  const setUserRef        = useRef(setUser)

  useEffect(() => { keyStreakRef.current    = keyStreak },   [keyStreak])
  useEffect(() => { userRef.current        = user },        [user])
  useEffect(() => { setUserRef.current     = setUser },     [setUser])

  const { level, levelIndex, rewardsEarned } = letterBuildProgress

  const xp      = user?.progress?.xp    || 0
  const xpLevel = user?.progress?.level || 1
  const keys    = user?.progress?.currency?.keys || 0

  const getLocalizedWord = useCallback((wordObj) => {
    if (!wordObj) return ""
    if (i18n.language === "en") return wordObj.en
    if (i18n.language === "fr") return wordObj.fr
    return wordObj.correct
  }, [i18n.language])

  const currentWordData = (words[level] || [])[levelIndex]
  const currentWord = useMemo(() =>
    currentWordData
      ? { ...currentWordData, displayWord: getLocalizedWord(currentWordData) }
      : null,
    [currentWordData, getLocalizedWord]
  )
  currentWordRef.current = currentWord

  const availableLetters = useMemo(
    () => letterSlots.filter((s) => s.zone === "available"),
    [letterSlots]
  )
  const selectedLetters = useMemo(
    () => letterSlots.filter((s) => s.zone === "selected").sort((a, b) => a.order - b.order),
    [letterSlots]
  )

  const { hearts, cooldownUntil, heartAnimating, loseHeart, maxHearts, heartsReady } =
    useHearts({ user, gameKey: "letterBuild", initialHearts: heartsInit, initialCooldown: cooldownInit })

  // Keep loseHeart ref fresh
  useEffect(() => { loseHeartRef.current = loseHeart }, [loseHeart])

  const {
    handlePickById, handleUndoById,
    handleMoveToSelected, handleMoveToAvailable, handleReorderSelected,
  } = useLetterBuildSlots(setLetterSlots, currentWordRef)

  // ── Initialise letter slots when word changes ────────────
  useEffect(() => {
    if (!currentWord) return
    const slots = currentWord.displayWord
      .split("")
      .map((letter, i) => ({
        letter,
        id: `${letter}-${i}-${shuffleKey}`,
        zone: "available",
        order: null,
      }))
      .sort(() => Math.random() - 0.5)
    setLetterSlots(slots)
    checkingRef.current = false
  }, [currentWord?.displayWord, shuffleKey]) // ✅ displayWord is the stable primitive dep

  useEffect(() => {
    async function load() {
      const userData = await getUser(user.id)
      const saved    = userData?.progress?.letterBuild
      setWords(buildLevels(wordsPerLevel))
      setLetterBuildProgress({
        level:         saved?.level         || 0,
        levelIndex:    saved?.levelIndex    || 0,
        rewardsEarned: saved?.rewardsEarned || [false, false, false],
      })
      setHeartsInit(saved?.hearts         ?? MAX_HEARTS)
      setCooldownInit(saved?.cooldownUntil ?? null)
      setLoading(false)
    }
    load()
  }, [user.id, wordsPerLevel, i18n.language])

  const saveToSupabase = async (progressData = letterBuildProgress) => {
    if (!user) return
    const updated = await updateProgress(user.id, { letterBuild: progressData })
    if (updated) setUser((prev) => ({ ...prev, progress: updated.progress }))
  }

  const checkAndAwardStars = useCallback(async (newProgress, progressPercent) => {
    const starsEarned = calculateStars(progressPercent)
    const rewards     = newProgress.rewardsEarned || [false, false, false]
    let rewardsAdded  = 0
    for (let i = 0; i < starsEarned; i++) {
      if (!rewards[i]) { rewards[i] = true; rewardsAdded++ }
    }
    newProgress.rewardsEarned = rewards
    await updateProgress(userRef.current.id, { letterBuild: newProgress })
    if (rewardsAdded > 0) {
      await addReward(userRef.current.id, rewardsAdded)
      setUserRef.current((prev) => ({
        ...prev,
        rewards: (prev.rewards || 0) + rewardsAdded,
        progress: { ...prev.progress, letterBuild: newProgress },
      }))
    }
  }, [])

  const nextWordOrLevel = useCallback(async (progress) => {
    const currentLevelWords = words[progress.level] || []
    let newProgress = { ...progress }

    if (progress.levelIndex + 1 < currentLevelWords.length) {
      newProgress.levelIndex += 1
    } else if (progress.level + 1 < words.length) {
      newProgress.level += 1
      newProgress.levelIndex = 0
    } else {
      setWords(buildLevels(wordsPerLevel))
      newProgress = { level: 0, levelIndex: 0, rewardsEarned: [false, false, false] }
      setLetterBuildProgress(newProgress)
      setFeedback("")
      setShuffleKey((k) => k + 1)
      return
    }

    const totalWords      = words.flat().length
    const currentPosition = newProgress.level * wordsPerLevel + newProgress.levelIndex + 1
    await checkAndAwardStars(newProgress, Math.min((currentPosition / totalWords) * 100, 100))
    setLetterBuildProgress(newProgress)
    setFeedback("")
  }, [words, wordsPerLevel, checkAndAwardStars])

  // Keep nextWordOrLevel ref fresh so the answer-check effect can call
  // the latest version without listing it as a dep
  useEffect(() => { nextWordOrLevelRef.current = nextWordOrLevel }, [nextWordOrLevel])

  // ── Check answer when all slots are filled ───────────────
  useEffect(() => {
    const word = currentWordRef.current
    if (!word) return
    if (selectedLetters.length !== word.displayWord.length) return
    if (checkingRef.current) return
    checkingRef.current = true

    setTimeout(async () => {
      const latestWord = currentWordRef.current
      if (!latestWord) return
      const attempt = selectedLetters.map((s) => s.letter).join("")

      if (attempt === latestWord.displayWord) {
        setFeedback("correct")

        const streak  = keyStreakRef.current
        const newStreak = streak + 1
        const earnKey   = newStreak >= KEY_EVERY_N

        const result = await addKeysAndXP(userRef.current.id, earnKey ? 1 : 0, 10)
        if (result) {
          setUserRef.current((prev) => ({ ...prev, progress: result.user.progress }))
          if (result.leveledUp) {
            setJustLeveledUp(true)
            setTimeout(() => setJustLeveledUp(false), 3000)
          }
        }

        if (earnKey) {
          setKeyStreak(0)
          setKeyJustEarned(true)
          setTimeout(() => setKeyJustEarned(false), 1500)
        } else {
          setKeyStreak(newStreak)
        }

        setLetterBuildProgress((prev) => {
          const updated = { ...prev }
          setTimeout(() => nextWordOrLevelRef.current(updated), 1500)
          return updated
        })
      } else {
        setFeedback("incorrect")
        setKeyStreak(0)
        await loseHeartRef.current?.()
        setTimeout(() => {
          setFeedback("")
          setShuffleKey((k) => k + 1)
        }, 1500)
      }
    }, 300)
  }, [selectedLetters]) // ✅ all other values accessed via refs

  const togglePause = async () => {
    setPaused((prev) => !prev)
    if (!paused) await saveToSupabase()
  }

  const resetScore = async () => {
    const newProgress = { level: 0, levelIndex: 0, rewardsEarned: [false, false, false] }
    setWords(buildLevels(wordsPerLevel))
    setLetterBuildProgress(newProgress)
    setShuffleKey((k) => k + 1)
    setFeedback("")
    setKeyStreak(0)
    setPaused(false)
    setShowResetModal(false)
    await saveToSupabase(newProgress)
  }

  if (loading || !heartsReady) return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />
  if (!currentWord)            return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />
  if (hearts <= 0)             return <NoHeartsScreen hearts={hearts} cooldownUntil={cooldownUntil} fontClass={fontClass} sizeClass={sizeClass} />

  const totalWords      = words.flat().length
  const currentPosition = level * wordsPerLevel + levelIndex + 1

  return (
    <>
      <GameContainer
        fontClass={fontClass} sizeClass={sizeClass}
        bgColor="bg-sky-50" bgVariant="default"
        score={currentPosition - 1} total={totalWords} keys={keys}
        paused={paused} rewardsEarned={rewardsEarned}
        progress={(currentPosition / totalWords) * 100}
        feedback={feedback}
        onPauseToggle={togglePause}
        onHome={async () => { await saveToSupabase(); navigate("/menu", { replace: true }) }}
        onReset={() => setShowResetModal(true)}
      >
        <HeartsDisplay hearts={hearts} heartAnimating={heartAnimating} maxHearts={maxHearts} />
        <XPBadge xp={xp} level={xpLevel} />
        <KeyStreakBar
          keyStreak={keyStreak}
          keyEveryN={KEY_EVERY_N}
          justEarned={keyJustEarned}
          soundOn={soundOn}
        />

        <LetterBuildGameArea
          currentWord={currentWord}
          selectedLetters={selectedLetters}
          availableLetters={availableLetters}
          onPickById={handlePickById}
          onUndoById={handleUndoById}
          onMoveToSelected={handleMoveToSelected}
          onMoveToAvailable={handleMoveToAvailable}
          onReorderSelected={handleReorderSelected}
          soundOn={soundOn} paused={paused} t={t}
          fontClass={fontClass} sizeClass={sizeClass}
        />
      </GameContainer>

      <LevelUpToast level={xpLevel} show={justLeveledUp} />

      {showResetModal && (
        <ResetConfirmationModal
          onCancel={() => setShowResetModal(false)}
          onConfirm={resetScore}
        />
      )}
    </>
  )
}

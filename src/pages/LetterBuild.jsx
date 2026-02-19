import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useSettings } from "../context/SettingsContext"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import GameContainer from "../components/GameContainer"
import AudioButton from "../components/AudioButton"
import LoadingScreen from "../components/LoadingScreen"
import LevelCompleteScreen from "../components/LevelCompleteScreen"
import VictoryScreen from "../components/VictoryScreen"
import ResetConfirmationModal from "../components/ResetConfirmationModal"
import UnlockModal from "../components/UnlockModal"
import NoHeartsScreen from "../components/NoHeartsScreen"
import { HeartsDisplay } from "../components/HeartsDisplay"
import { useHearts } from "../hooks/useHearts"
import wordData from "../data/words.json"
import { updateProgress, getUser, addReward, addKeys } from "../supabaseFunctions.js"
import { calculateStars } from "../utils/progressStars"
import usePlaytimeTracker from "../hooks/usePlaytimeTracker"

const MAX_HEARTS = 5

// Drag state outside React — never causes re-renders, never stale
const dragState = { item: null, fromArea: null, fromIndex: null }

function GameArea({
  currentWord,
  selectedLetters,
  availableLetters,
  onPickLetter,
  onUndoLetter,
  onDragStartAvailable,
  onDragStartSelected,
  onDropOnSelected,
  onDropOnAvailable,
  soundOn,
  paused,
  t,
  fontClass,
  sizeClass,
}) {
  return (
    <div className={`flex flex-col items-center gap-8 ${fontClass} ${sizeClass}`}>
      <AudioButton
        word={currentWord.displayWord}
        soundOn={soundOn}
        paused={paused}
        label={t("letterBuild.listen")}
        className="px-8 py-4 text-xl md:text-2xl"
      />

      {/* Drop zone — selected letters */}
      <div
        className="min-h-[100px] w-full flex items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-blue-50 border-b-4 border-indigo-400 border-dashed rounded-2xl px-6 py-4 shadow-sm transition-colors duration-200"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDropOnSelected}
      >
        {selectedLetters.length === 0 ? (
          <p className="text-gray-400 italic font-medium text-lg">
            {t("letterBuild.dragLettersHere")}
          </p>
        ) : (
          selectedLetters.map((item, i) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => onDragStartSelected(e, item, i)}
              onClick={() => onUndoLetter(i)}
              className="cursor-pointer bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-3xl md:text-4xl rounded-2xl px-6 py-4 shadow-md border-b-4 border-purple-700 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-110 active:scale-95 select-none"
            >
              {item.letter}
            </div>
          ))
        )}
      </div>

      {/* Available letters */}
      <div
        className="flex flex-wrap justify-center gap-3 md:gap-4 mt-6 p-6 bg-white rounded-2xl shadow-md border-2 border-gray-200 transition-colors duration-200"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDropOnAvailable}
      >
        {availableLetters.map((item, i) =>
          item ? (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => onDragStartAvailable(e, item, i)}
              onClick={() => onPickLetter(i)}
              className="cursor-pointer bg-gradient-to-br from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-black text-3xl md:text-4xl rounded-2xl px-6 py-4 shadow-md border-b-4 border-pink-600 transition-all duration-200 transform hover:scale-110 active:scale-95 select-none"
            >
              {item.letter}
            </div>
          ) : (
            <div key={`empty-${i}`} className="w-16 h-16" />
          )
        )}
      </div>
    </div>
  )
}

export default function LetterBuild({ user, setUser, wordsPerLevel = 7 }) {
  const { t, i18n } = useTranslation()
  usePlaytimeTracker(user)

  const { fontType, fontSize, soundOn } = useSettings()
  const navigate = useNavigate()

  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = {
    small: "text-base md:text-lg",
    medium: "text-lg md:text-xl",
    large: "text-xl md:text-2xl",
  }
  const sizeClass = sizeMap[fontSize || "medium"]

  const [words, setWords] = useState([])
  const [letterBuildProgress, setLetterBuildProgress] = useState({
    level: 0,
    levelIndex: 0,
    rewardsEarned: [false, false, false],
  })
  const [heartsInit, setHeartsInit] = useState(null)
  const [cooldownInit, setCooldownInit] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [paused, setPaused] = useState(false)
  const [shuffleKey, setShuffleKey] = useState(0)

  // Single source of truth: one flat array of all letter slots
  // Each slot: { letter, id, zone: "available" | "selected" }
  const [letterSlots, setLetterSlots] = useState([])

  const [loading, setLoading] = useState(true)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [starEarned, setStarEarned] = useState(false)

  const currentWordRef = useRef(null)
  const checkingRef = useRef(false)
  const { level, levelIndex, rewardsEarned } = letterBuildProgress

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

  // Derive the two zones from the single array — no state sync needed
  const availableLetters = useMemo(
    () => letterSlots.filter((s) => s.zone === "available"),
    [letterSlots]
  )
const selectedLetters = useMemo(
  () =>
    letterSlots
      .filter((s) => s.zone === "selected")
      .sort((a, b) => a.order - b.order),
  [letterSlots]
)


  const {
    hearts,
    cooldownUntil,
    heartAnimating,
    loseHeart,
    maxHearts,
    heartsReady,
  } = useHearts({
    user,
    gameKey: "letterBuild",
    initialHearts: heartsInit,
    initialCooldown: cooldownInit,
  })

  const keys = user?.progress?.currency?.keys || 0

  // ── Initialize slots when word or shuffleKey changes ──────────────────────
  useEffect(() => {
    if (!currentWord) return
    const slots = currentWord.displayWord
  .split("")
  .map((letter, i) => ({
    letter,
    id: `${letter}-${i}-${shuffleKey}`,
    zone: "available",
    order: null   // 👈 ADD THIS
  }))
  .sort(() => Math.random() - 0.5)

    setLetterSlots(slots)
    checkingRef.current = false
  }, [currentWord?.displayWord, shuffleKey])

  useEffect(() => {
    async function load() {
      const userData = await getUser(user.id)
      const saved = userData?.progress?.letterBuild

      const shuffled = [...wordData].sort(() => 0.5 - Math.random())
      const levels = Array.from(
        { length: Math.ceil(shuffled.length / wordsPerLevel) },
        (_, i) => shuffled.slice(i * wordsPerLevel, i * wordsPerLevel + wordsPerLevel)
      )
      setWords(levels)

      setLetterBuildProgress({
        level: saved?.level || 0,
        levelIndex: saved?.levelIndex || 0,
        rewardsEarned: saved?.rewardsEarned || [false, false, false],
      })

      setHeartsInit(saved?.hearts ?? MAX_HEARTS)
      setCooldownInit(saved?.cooldownUntil ?? null)
      setLoading(false)
    }
    load()
  }, [user, wordsPerLevel, i18n.language])

  const saveToSupabase = async (progressData = letterBuildProgress) => {
    if (!user) return
    const updated = await updateProgress(user.id, { letterBuild: progressData })
    if (updated) setUser((prev) => ({ ...prev, progress: updated.progress }))
  }

  // ── Move a slot between zones by its id ───────────────────────────────────
const moveSlot = useCallback((id, toZone) => {
  setLetterSlots((prev) =>
    prev.map((s) =>
      s.id === id
        ? { ...s, zone: toZone, order: toZone === "selected" ? s.order : null }
        : s
    )
  );
}, []);


  // ── Click handlers ────────────────────────────────────────────────────────
const handlePickLetter = useCallback((id) => {
  const word = currentWordRef.current;
  if (!word) return;

  setLetterSlots((prev) => {
    const selectedCount = prev.filter((s) => s.zone === "selected").length;
    if (selectedCount >= word.displayWord.length) return prev;

    const idx = prev.findIndex((s) => s.id === id);
    if (idx === -1) return prev;

    const next = [...prev];
    next[idx] = {
      ...next[idx],
      zone: "selected",
      order: selectedCount  // 👈 assign order
    };

    return next;
  });
}, []);

const handleUndoLetter = useCallback((id) => {
  setLetterSlots((prev) =>
    prev.map((s) =>
      s.id === id ? { ...s, zone: "available", order: null } : s
    )
  );
}, []);


  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStartAvailable = useCallback((e, item) => {
    dragState.item = item
    dragState.fromArea = "available"
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", item.letter)
  }, [])

  const handleDragStartSelected = useCallback((e, item) => {
    dragState.item = item
    dragState.fromArea = "selected"
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", item.letter)
  }, [])

  const handleDropOnSelected = useCallback((e) => {
    e.preventDefault()
    const { item, fromArea } = dragState
    if (!item) return
    if (fromArea === "available") {
      const word = currentWordRef.current
      if (!word) return
 setLetterSlots((prev) => {
  const selectedCount = prev.filter((s) => s.zone === "selected").length;
  if (selectedCount >= word.displayWord.length) return prev;

  const idx = prev.findIndex((s) => s.id === item.id);
  if (idx === -1) return prev;

  const next = [...prev];
  next[idx] = {
    ...next[idx],
    zone: "selected",
    order: selectedCount
  };

  return next;
});

    }
    // selected → selected reorder: no-op for now (order is insertion order)
    dragState.item = null
  }, [])

  const handleDropOnAvailable = useCallback((e) => {
    e.preventDefault()
    const { item, fromArea } = dragState
    if (!item) return
    if (fromArea === "selected") {
      moveSlot(item.id, "available");

    }
    dragState.item = null
  }, [moveSlot])

  // ── Answer check ──────────────────────────────────────────────────────────
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

        await addKeys(user.id, 1)
        setUser((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            currency: {
              ...prev.progress?.currency,
              keys: (prev.progress?.currency?.keys || 0) + 1,
            },
          },
        }))

        setLetterBuildProgress((prev) => {
          const updated = { ...prev }
          setTimeout(() => nextWordOrLevel(updated), 1500)
          return updated
        })
      } else {
        setFeedback("incorrect")
        await loseHeart()
        setTimeout(() => {
          setFeedback("")
          setShuffleKey((k) => k + 1)
        }, 1500)
      }
    }, 300)
  }, [selectedLetters])

  const nextWordOrLevel = async (progress = letterBuildProgress) => {
    const currentLevelWords = words[progress.level] || []
    let newProgress = { ...progress }

    if (progress.levelIndex + 1 < currentLevelWords.length) {
      newProgress.levelIndex += 1
    } else if (progress.level + 1 < words.length) {
      newProgress.level += 1
      newProgress.levelIndex = 0
    } else {
      newProgress.rewardsEarned = [true, true, true]
      setLetterBuildProgress(newProgress)
      setFeedback("victory")
      return
    }

    const totalWords = words.flat().length
    const currentPosition = newProgress.level * wordsPerLevel + newProgress.levelIndex + 1
    const progressPercent = Math.min((currentPosition / totalWords) * 100, 100)

    await checkAndAwardStars(newProgress, progressPercent)
    setLetterBuildProgress(newProgress)
    setFeedback("")
  }

  const checkAndAwardStars = async (newProgress, progressPercent) => {
    const starsEarned = calculateStars(progressPercent)
    const rewards = newProgress.rewardsEarned || [false, false, false]
    let rewardsAdded = 0

    for (let i = 0; i < starsEarned; i++) {
      if (!rewards[i]) {
        rewards[i] = true
        rewardsAdded += 1
      }
    }

    newProgress.rewardsEarned = rewards
    await updateProgress(user.id, { letterBuild: newProgress })

    if (rewardsAdded > 0) {
      setStarEarned(true)
      await addReward(user.id, rewardsAdded)
      setUser((prev) => ({
        ...prev,
        rewards: (prev.rewards || 0) + rewardsAdded,
        progress: { ...prev.progress, letterBuild: newProgress },
      }))
    }
  }

  const goToNextLevel = async () => {
    setStarEarned(false)
    setFeedback("")
    await saveToSupabase()
  }

  const togglePause = async () => {
    setPaused((prev) => !prev)
    if (!paused) await saveToSupabase()
  }

  const resetScore = async () => {
    const newProgress = { level: 0, levelIndex: 0, rewardsEarned: [false, false, false] }
    setLetterBuildProgress(newProgress)
    setShuffleKey((k) => k + 1)
    setFeedback("")
    setPaused(false)
    setShowResetModal(false)
    setStarEarned(false)
    await saveToSupabase(newProgress)
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading || !heartsReady)
    return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />

  if (!currentWord)
    return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />

  if (hearts <= 0)
    return (
      <NoHeartsScreen
        cooldownUntil={cooldownUntil}
        fontClass={fontClass}
        sizeClass={sizeClass}
      />
    )

  if (showUnlockModal)
    return (
      <UnlockModal
        fontClass={fontClass}
        sizeClass={sizeClass}
        gameName={t("gameCards.wordMaze.title")}
        gameEmoji="🧩"
        gameRoute="/wordmaze"
        onClose={async () => {
          setShowUnlockModal(false)
          setFeedback("")
          await saveToSupabase()
        }}
      />
    )

  if (starEarned)
    return (
      <LevelCompleteScreen
        nextLevel={goToNextLevel}
        fontClass={fontClass}
        sizeMap={sizeMap}
      />
    )

  if (feedback === "victory")
    return (
      <VictoryScreen
        onRestart={resetScore}
        words={words}
        fontClass={fontClass}
        sizeMap={sizeMap}
      />
    )

  const totalWords = words.flat().length
  const currentPosition = level * wordsPerLevel + levelIndex + 1
  const displayProgress = (currentPosition / totalWords) * 100

  return (
    <>
      <GameContainer
        fontClass={fontClass}
        sizeClass={sizeClass}
        bgColor="bg-sky-50"
        bgVariant="default"
        score={currentPosition - 1}
        total={totalWords}
        keys={keys}
        paused={paused}
        rewardsEarned={rewardsEarned}
        progress={displayProgress}
        feedback={feedback}
        onPauseToggle={togglePause}
        onHome={async () => {
          await saveToSupabase()
          navigate("/menu", { replace: true })
        }}
        onReset={() => setShowResetModal(true)}
      >
        <HeartsDisplay
          hearts={hearts}
          heartAnimating={heartAnimating}
          maxHearts={maxHearts}
        />

        <GameArea
          currentWord={currentWord}
          selectedLetters={selectedLetters}
          availableLetters={availableLetters}
          onPickLetter={(i) => handlePickLetter(availableLetters[i]?.id)}
          onUndoLetter={(i) => handleUndoLetter(selectedLetters[i]?.id)}
          onDragStartAvailable={handleDragStartAvailable}
          onDragStartSelected={handleDragStartSelected}
          onDropOnSelected={handleDropOnSelected}
          onDropOnAvailable={handleDropOnAvailable}
          soundOn={soundOn}
          paused={paused}
          t={t}
          fontClass={fontClass}
          sizeClass={sizeClass}
        />
      </GameContainer>

      {showResetModal && (
        <ResetConfirmationModal
          onCancel={() => setShowResetModal(false)}
          onConfirm={resetScore}
        />
      )}
    </>
  )
}

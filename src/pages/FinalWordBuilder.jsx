import React, { useState, useEffect } from "react"
import { useSettings } from "../context/SettingsContext"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import GameContainer from "../components/GameContainer"
import VictoryScreen from "../components/VictoryScreen"
import LoadingScreen from "../components/LoadingScreen"
import LevelCompleteScreen from "../components/LevelCompleteScreen"
import ResetConfirmationModal from "../components/ResetConfirmationModal"
import GameStats from "../components/GameStats"
import WordDisplay from "../components/WordDisplay"
import FloatingLetterButton from "../components/FloatingLetterButton"
import GameOverModal from "../components/GameOverModal"
import wordData from "../data/words.json"
import { gameAnimations } from "../styles/GameAnimations"
import { useGameAudio } from "../hooks/useGameAudio"
import { useGameProgress } from "../hooks/useGameProgress"
import { useGameTimer } from "../hooks/useGameTimer"
import usePlaytimeTracker from "../hooks/usePlaytimeTracker"


const TOTAL_WORDS = 20
const GAME_TIME = 400
const MAX_MISTAKES = 8
const WARNING_TIME = 30


const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)


export default function FinalWordBuilder({ user, setUser }) {
  usePlaytimeTracker(user)
  
  const { fontType, fontSize, soundOn } = useSettings()
  const { t, i18n } = useTranslation()
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-xl" }
  const navigate = useNavigate()

  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState([])
  const [mistakes, setMistakes] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [gameOver, setGameOver] = useState(false)
  const [gameOverReason, setGameOverReason] = useState(null)
  const [victory, setVictory] = useState(false)
  const [paused, setPaused] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [starEarned, setStarEarned] = useState(false)
  const [shakeWrong, setShakeWrong] = useState(false)

  const { loaded, initialGameState, finalProgress, setFinalProgress, saveProgressToDb, checkAndAwardStars } = 
    useGameProgress(user, setUser, wordData, TOTAL_WORDS, shuffle)

  // Helper to get localized word
  const getLocalizedWord = (wordObj) => {
    if (!wordObj) return ""
    return i18n.language === "en" ? wordObj.en : wordObj.correct
  }

  // Initialize game state from loaded progress
  useEffect(() => {
    if (initialGameState && loaded) {
      setWords(initialGameState.words)
      setCurrentIndex(initialGameState.currentIndex)
      setSelected(initialGameState.selected || [])
      setMistakes(initialGameState.mistakes)
      setTimeLeft(initialGameState.timeLeft)
    }
  }, [initialGameState, loaded])

  const isPlaying = loaded && !paused && !gameOver && !victory && !showResetModal && !starEarned
  const { playCuteBeep } = useGameAudio(soundOn, isPlaying)

  useGameTimer(timeLeft, setTimeLeft, loaded, victory, gameOver, paused, showResetModal, starEarned, 
    setGameOver, setGameOverReason, playCuteBeep, WARNING_TIME)

  // Get current word with display word
  const currentWordData = words[currentIndex]
  const currentWord = currentWordData ? {
    ...currentWordData,
    displayWord: getLocalizedWord(currentWordData)
  } : null

  const saveProgress = async () => {
    if (!user) return
    const progressData = {
      ...finalProgress,
      score: currentIndex,
      gameState: { words, mistakes, selected, currentIndex, timeLeft }
    }
    await saveProgressToDb(progressData)
    setFinalProgress(progressData)
  }

  const handleLetterClick = (letter) => {
    if (gameOver || victory || paused || !currentWord) return
    const nextIndex = selected.length
    const correctLetter = currentWord.displayWord[nextIndex]
    
    if (letter === correctLetter) {
      const updated = [...selected, letter]
      setSelected(updated)
      playCuteBeep(1000, 0.08)
      if (updated.length === currentWord.displayWord.length) {
        setTimeout(() => playCuteBeep(1200, 0.15), 100)
        setTimeout(nextWord, 600)
      }
    } else {
      setShakeWrong(true)
      setTimeout(() => setShakeWrong(false), 500)
      playCuteBeep(300, 0.2)
      const newMistakes = mistakes + 1
      setMistakes(newMistakes)
      if (newMistakes >= MAX_MISTAKES) {
        setGameOver(true)
        setGameOverReason('mistakes')
      }
    }
  }

  const nextWord = async () => {
    setSelected([])
    const newIndex = currentIndex + 1
    
    if (newIndex === TOTAL_WORDS) {
      finishGame()
    } else {
      setCurrentIndex(newIndex)
      const shouldShowStar = await checkAndAwardStars(newIndex, { words, mistakes, timeLeft })
      if (shouldShowStar) setStarEarned(true)
    }
  }

  const finishGame = async () => {
    setVictory(true)
    const permanentRewards = [...(finalProgress.permanentRewards || [false, false, false])]
    
    let newStarsToAdd = 0
    for (let i = 0; i < 3; i++) {
      if (!permanentRewards[i]) {
        permanentRewards[i] = true
        newStarsToAdd += 1
      }
    }
    
    const newProgress = {
      ...finalProgress,
      score: TOTAL_WORDS - mistakes,
      rewardsEarned: [true, true, true],
      permanentRewards,
      gameState: {}
    }
    
    await saveProgressToDb(newProgress)
    setFinalProgress(newProgress)
    
    if (newStarsToAdd > 0) {
      const { addReward } = await import("../supabaseFunctions")
      await addReward(user.id, newStarsToAdd)
      setUser(prev => ({
        ...prev,
        rewards: (prev.rewards || 0) + newStarsToAdd,
        progress: { ...prev.progress, finalWordBuilder: newProgress }
      }))
    }
  }

  const resetGame = async () => {
    const chosenWords = shuffle(wordData).slice(0, TOTAL_WORDS)
    const newProgress = {
      ...finalProgress,
      score: 0,
      rewardsEarned: [false, false, false],
      gameState: {}
    }

    setShowResetModal(false)
    setGameOver(false)
    setGameOverReason(null)
    setVictory(false)
    setPaused(false)
    setStarEarned(false)
    setWords(chosenWords)
    setCurrentIndex(0)
    setSelected([])
    setMistakes(0)
    setTimeLeft(GAME_TIME)
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

  if (!loaded) return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />
  if (starEarned && !victory) return <LevelCompleteScreen nextLevel={() => setStarEarned(false)} fontClass={fontClass} sizeMap={sizeMap} />
  if (victory) return <VictoryScreen gameType="game4" score={TOTAL_WORDS - mistakes} words={words} mistakes={mistakes} maxMistakes={MAX_MISTAKES} timeLeft={timeLeft} onRestart={resetGame} fontClass={fontClass} sizeMap={sizeMap} />
  if (gameOver) return <GameOverModal gameOverReason={gameOverReason} currentIndex={currentIndex} totalWords={TOTAL_WORDS} mistakes={mistakes} maxMistakes={MAX_MISTAKES} onRestart={resetGame} onHome={goHome} />
  if (showResetModal) return <ResetConfirmationModal onConfirm={resetGame} onCancel={() => setShowResetModal(false)} cancelText={t("finalWordBuilder.cancel")} />

  const floatingLetters = currentWord ? shuffle(currentWord.displayWord.split("")) : []
  const isWarningTime = timeLeft <= WARNING_TIME

  return (
    <>
      <style>{gameAnimations}</style>
      <GameContainer
        fontClass={fontClass}
        sizeClass={sizeMap[fontSize]}
        bgColor="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
        bgVariant="default"
        score={currentIndex}
        total={TOTAL_WORDS}
        progress={(currentIndex / TOTAL_WORDS) * 100}
        paused={paused}
        rewardsEarned={finalProgress.rewardsEarned}
        onPauseToggle={togglePause}
        onHome={goHome}
        onReset={() => setShowResetModal(true)}
      >
        <div className="text-center space-y-4 md:space-y-8">
          <GameStats timeLeft={timeLeft} mistakes={mistakes} maxMistakes={MAX_MISTAKES} isWarning={isWarningTime} />
          <WordDisplay selected={selected} totalLetters={currentWord?.displayWord.length || 0} shakeWrong={shakeWrong} />
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-2xl mx-auto">
            {floatingLetters.map((l, i) => (
              <FloatingLetterButton key={i} letter={l} index={i} onClick={handleLetterClick} disabled={paused} />
            ))}
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg border-2 border-purple-200">
              <span className="text-xl md:text-2xl">📝</span>
              <span className="text-base md:text-lg font-bold text-gray-700">
                {t("finalWordBuilder.word")} <span className="text-purple-600">{currentIndex + 1}</span> / {TOTAL_WORDS}
              </span>
            </div>
          </div>
        </div>
      </GameContainer>
    </>
  )
}

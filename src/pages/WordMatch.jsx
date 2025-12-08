import React, { useState, useEffect } from "react"
import { useSettings } from "../context/SettingsContext"
import { useNavigate } from "react-router-dom"
import HeaderBar from "../components/HeaderBar"
import ProgressBar from "../components/ProgressBar"
import FeedbackModal from "../components/FeedbackModal"
import PauseOverlay from "../components/PauseOverlay"
import LoadingScreen from "../components/LoadingScreen"
import LevelCompleteScreen from "../components/LevelCompleteScreen"
import VictoryScreen from "../components/VictoryScreen"
import UnlockModal from "../components/UnlockModal"
import wordData from "../data/words.json"
import { updateProgress } from "../supabaseFunctions.js"

export default function WordMatch({ user }) {
  const { fontType, fontSize, soundOn } = useSettings()
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { small: "text-base md:text-lg", medium: "text-lg md:text-xl", large: "text-xl md:text-2xl" }
  const WORDS_PER_LEVEL = 7
  const navigate = useNavigate()

  const [words, setWords] = useState([])
  const [wordMatchProgress, setWordMatchProgress] = useState({
    level: 0,
    levelIndex: 0,
    score: 0,
    letterBuildUnlocked: false
  })
  const [feedback, setFeedback] = useState("")
  const [answered, setAnswered] = useState(false)
  const [paused, setPaused] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const { level, levelIndex, score, letterBuildUnlocked } = wordMatchProgress

  // --- Load user progress ---
  useEffect(() => {
    if (!user || loaded) return

    const loadProgress = async () => {
      try {
        const progress = user.progress || {}
        const wm = progress.wordMatch || {}
        const levels = Array.from(
          { length: Math.ceil(wordData.length / WORDS_PER_LEVEL) },
          (_, i) => wordData.slice(i * WORDS_PER_LEVEL, i * WORDS_PER_LEVEL + WORDS_PER_LEVEL)
        )
        setWords(levels)
        setWordMatchProgress({
          level: wm.level || 0,
          levelIndex: wm.levelIndex || 0,
          score: wm.score || 0,
          letterBuildUnlocked: wm.letterBuildUnlocked || false
        })
        setLoaded(true)
      } catch (err) {
        console.error("Error loading user progress:", err)
        startNewGame()
      }
    }

    loadProgress()
  }, [user, loaded])

  // --- Save progress ---
  const saveProgress = async () => {
    if (!user) return
    const updated = await updateProgress(user.id, { wordMatch: wordMatchProgress })
    if (updated) user.progress = updated.progress
  }

  // --- Handle tab close / refresh ---
  useEffect(() => {
    const handleBeforeUnload = () => saveProgress()
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [wordMatchProgress])

  // --- Auto-save every 1s ---
  useEffect(() => {
    const interval = setInterval(saveProgress, 1000)
    return () => clearInterval(interval)
  }, [wordMatchProgress])

  // --- Start a new game ---
  const startNewGame = () => {
    const shuffled = [...wordData].sort(() => 0.5 - Math.random())
    const levels = Array.from(
      { length: Math.ceil(shuffled.length / WORDS_PER_LEVEL) },
      (_, i) => shuffled.slice(i * WORDS_PER_LEVEL, i * WORDS_PER_LEVEL + WORDS_PER_LEVEL)
    )
    setWords(levels)
    setWordMatchProgress({ level: 0, levelIndex: 0, score: 0, letterBuildUnlocked: false })
    setFeedback("")
    setAnswered(false)
    setShowUnlockModal(false)
    setLoaded(true)
  }

  const togglePause = async () => {
    setPaused(prev => !prev)
    if (!paused) await saveProgress()
  }

  const goHome = async () => {
    await saveProgress()
    navigate("/menu")
  }

  const currentWord = (words[level] || [])[levelIndex]

  const playWord = (word) => {
    if (!soundOn || paused || !word) return
    const utter = new SpeechSynthesisUtterance(word)
    utter.lang = "nl-NL"
    utter.rate = 0.7
    speechSynthesis.speak(utter)
  }

  const handleAnswer = (opt) => {
    if (answered || paused) return
    setAnswered(true)

    if (opt === currentWord.correct) {
      setFeedback("correct")
      setWordMatchProgress(prev => ({ ...prev, score: prev.score + 1 }))
      setTimeout(nextWordOrLevel, 1500)
    } else setTimeout(() => { setFeedback("incorrect"); setAnswered(false) }, 1500)
  }

  const nextWordOrLevel = async () => {
    const currentLevelWords = words[level] || []
    if (levelIndex + 1 < currentLevelWords.length) {
      setWordMatchProgress(prev => ({ ...prev, levelIndex: prev.levelIndex + 1 }))
      setFeedback("")
      setAnswered(false)
      await saveProgress()
    } else if (level + 1 < words.length) {
      setFeedback("level_complete")
      if (level === 0 && !letterBuildUnlocked) {
        setWordMatchProgress(prev => ({ ...prev, letterBuildUnlocked: true }))
        setShowUnlockModal(true)
        await saveProgress()
      }
    } else {
      setFeedback("victory")
      await saveProgress()
    }
  }

  // --- Next level handler ---
  const goToNextLevel = async () => {
    setWordMatchProgress(prev => ({
      ...prev,
      level: prev.level + 1,
      levelIndex: 0
    }))
    setFeedback("")
    setAnswered(false)
    await saveProgress()
  }

  // --- UI Modals ---
  if (!loaded) 
    return <LoadingScreen startNewGame={startNewGame} fontClass={fontClass} sizeMap={sizeMap} />

  if (showUnlockModal) 
    return (
      <UnlockModal
        fontClass={fontClass}
        sizeClass={sizeMap[fontSize]}
        onPlayLetterBuild={() => navigate("/letterbuild")}
        onClose={async () => {
          setShowUnlockModal(false)
          setFeedback("")
          setAnswered(false)
          await saveProgress()
        }}
      />
    )

  if (feedback === "level_complete") 
    return <LevelCompleteScreen fontClass={fontClass} sizeMap={sizeMap} nextLevel={goToNextLevel} />

  if (feedback === "victory") 
    return <VictoryScreen fontClass={fontClass} sizeMap={sizeMap} score={score} words={words} onRestart={startNewGame} />

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 sm:p-6 md:p-8 ${fontClass} ${sizeMap[fontSize]} relative overflow-hidden`}>
      <BackgroundDecor />
      <div className="relative max-w-5xl mx-auto">
        <HeaderBar 
          score={score} 
          total={words.flat().length} 
          paused={paused} 
          onPauseToggle={togglePause} 
          onHome={goHome} 
        />
        <ProgressBar progress={((levelIndex + 1 + level * WORDS_PER_LEVEL) / words.flat().length) * 100} />
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-10 lg:p-12">
          {paused ? 
            <PauseOverlay /> : 
            <WordOptions currentWord={currentWord} answered={answered} playWord={playWord} handleAnswer={handleAnswer} />
          }
        </div>
        <FeedbackModal type={feedback === "correct" ? "correct" : feedback === "incorrect" ? "incorrect" : ""} />
      </div>
    </div>
  )
}

// --- Helper Components ---
const BackgroundDecor = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
  </div>
)

const WordOptions = ({ currentWord, answered, playWord, handleAnswer }) => (
  <>
    <div className="mb-8 md:mb-12">
      <button onClick={() => playWord(currentWord.sound)} className="group w-full flex items-center justify-center gap-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xl md:text-2xl lg:text-3xl rounded-3xl py-6 md:py-8 lg:py-10 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-white relative overflow-hidden">
        <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative text-4xl md:text-5xl animate-pulse">🔊</span>
        <span className="relative">Speel het woord af</span>
      </button>
    </div>
    <div className="text-center mb-6">
      <div className="inline-block bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl px-6 py-3 shadow-md">
        <p className="text-base md:text-lg text-gray-600 font-semibold">Kies het juiste woord 👇</p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      {currentWord.options.map((opt, i) => (
        <button key={i} onClick={() => handleAnswer(opt)} disabled={answered} className={`group relative overflow-hidden rounded-2xl md:rounded-3xl py-6 md:py-8 px-6 text-xl md:text-2xl lg:text-3xl font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ${answered ? "cursor-not-allowed opacity-50" : "cursor-pointer bg-gradient-to-br from-white to-indigo-50 hover:from-indigo-50 hover:to-purple-50"}`}>
          <span className="relative z-10 text-indigo-900">{opt}</span>
          {!answered && <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
        </button>
      ))}
    </div>
  </>
)

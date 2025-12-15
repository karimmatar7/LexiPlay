import React, { useState, useEffect } from "react"
import { useSettings } from "../context/SettingsContext"
import { useNavigate } from "react-router-dom"
import HeaderBar from "../components/HeaderBar"
import ProgressBar from "../components/ProgressBar"
import FeedbackModal from "../components/FeedbackModal"
import PauseOverlay from "../components/PauseOverlay"
import wordData from "../data/words.json"
import LoadingScreen from "../components/LoadingScreen"
import LevelCompleteScreen from "../components/LevelCompleteScreen"
import VictoryScreen from "../components/VictoryScreen"
import ResetConfirmationModal from "../components/ResetConfirmationModal"
import UnlockModal from "../components/UnlockModal"
import { updateProgress, getUser, addReward } from "../supabaseFunctions.js"
import { calculateStars } from "../utils/progressStars"


function GameArea({
  currentWord,
  selectedLetters,
  currentLetters,
  handleLetterClick,
  handleUndo,
  handleDragStart,
  handleDragOver,
  handleDropOnSelected,
  handleDropOnAvailable,
  playWord
}) {
  return (
    <div className="flex flex-col items-center gap-8">

      {/* Word Playback Button */}
      <button
        onClick={() => playWord(currentWord.correct)}
        className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xl md:text-2xl rounded-2xl shadow-md border-b-4 border-indigo-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
      >
        <span className="text-3xl mr-2">🔊</span>
        Luister
      </button>

      {/* Selected Letters Drop Zone */}
      <div
        className="min-h-[100px] w-full flex items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-blue-50 border-3 border-indigo-400 border-dashed rounded-2xl px-6 py-4 shadow-sm"
        onDragOver={handleDragOver}
        onDrop={handleDropOnSelected}
      >
        {selectedLetters.length === 0 ? (
          <p className="text-gray-400 italic font-medium text-lg">
            👆 Sleep letters hierheen
          </p>
        ) : (
          selectedLetters.map((letter, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => handleDragStart(e, letter, i, "selected")}
              onClick={() => handleUndo(letter, i)}
              className="cursor-pointer bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-3xl md:text-4xl rounded-xl px-6 py-4 shadow-md border-b-4 border-purple-700 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              {letter}
            </div>
          ))
        )}
      </div>

      {/* Available Letters */}
      <div
        className="flex flex-wrap justify-center gap-3 md:gap-4 mt-6 p-6 bg-white rounded-2xl shadow-md border-3 border-gray-200"
        onDragOver={handleDragOver}
        onDrop={handleDropOnAvailable}
      >
        {currentLetters.map((letter, i) =>
          letter ? (
            <div
              key={i}
              draggable
              onDragStart={(e) => handleDragStart(e, letter, i, "available")}
              onClick={() => handleLetterClick(letter, i)}
              className="cursor-pointer bg-gradient-to-br from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-black text-3xl md:text-4xl rounded-xl px-6 py-4 shadow-md border-b-4 border-pink-600 transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              {letter}
            </div>
          ) : (
            <div key={i} className="w-16 h-16" />
          )
        )}
      </div>
    </div>
  )
}


export default function LetterBuild({ user, setUser, wordsPerLevel = 7 }) {
  const { fontType, fontSize, soundOn } = useSettings()
  const navigate = useNavigate()

  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { small: "text-base md:text-lg", medium: "text-lg md:text-xl", large: "text-xl md:text-2xl" }

  // ---------------- STATE ----------------
  const [words, setWords] = useState([])
  const [letterBuildProgress, setLetterBuildProgress] = useState({
    level: 0,
    levelIndex: 0,
    score: 0,
    mazeUnlocked: false,
    rewardsEarned: [false, false, false]
  })
  const [feedback, setFeedback] = useState("")
  const [paused, setPaused] = useState(false)
  const [currentLetters, setCurrentLetters] = useState([])
  const [selectedLetters, setSelectedLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [starEarned, setStarEarned] = useState(false)

  // Dragging
  const [dragged, setDragged] = useState({ letter: null, index: null, area: null })

  const { level, levelIndex, score, mazeUnlocked, rewardsEarned } = letterBuildProgress

  // ---------------- INIT: LOAD FROM SUPABASE ----------------
  useEffect(() => {
    async function load() {
      const userData = await getUser(user.id)
      const saved = userData?.progress?.letterBuild

      // Generate levels
      const shuffled = [...wordData].sort(() => 0.5 - Math.random())
      const levels = Array.from(
        { length: Math.ceil(shuffled.length / wordsPerLevel) },
        (_, i) => shuffled.slice(i * wordsPerLevel, i * wordsPerLevel + wordsPerLevel)
      )
      setWords(levels)

      setLetterBuildProgress({
        level: saved?.level || 0,
        levelIndex: saved?.levelIndex || 0,
        score: saved?.score || 0,
        mazeUnlocked: saved?.mazeUnlocked || false,
        rewardsEarned: saved?.rewardsEarned || [false, false, false]
      })

      const restoredWord = saved
        ? levels[saved.level || 0][saved.levelIndex || 0].correct
        : levels[0][0].correct

      setupLetters(restoredWord)
      setLoading(false)
    }

    load()
  }, [user, wordsPerLevel])

  // ---------------- SUPABASE SAVE ----------------
  const saveToSupabase = async (progressData = letterBuildProgress) => {
    if (!user) return
    const updated = await updateProgress(user.id, { letterBuild: progressData })
    if (updated) {
      user.progress = updated.progress
      setUser(prev => ({
        ...prev,
        progress: updated.progress
      }))
    }
  }

  const setupLetters = (word) => {
    setCurrentLetters(word.split("").sort(() => 0.5 - Math.random()))
    setSelectedLetters([])
  }

  const currentWord = (words[level] || [])[levelIndex]

  // ---------------- SOUND ----------------
  const playWord = (word) => {
    if (!soundOn || paused || !word) return
    const utter = new SpeechSynthesisUtterance(word)
    utter.lang = "nl-NL"
    utter.rate = 0.7
    speechSynthesis.speak(utter)
  }

  // ---------------- LETTER HANDLING ----------------
  const handleLetterClick = (letter, index) => {
    if (selectedLetters.length < currentWord.correct.length) {
      setSelectedLetters([...selectedLetters, letter])
      setCurrentLetters((c) => {
        const arr = [...c]
        arr[index] = null
        return arr
      })
    }
  }

  const handleUndo = (letter, index) => {
    setSelectedLetters((s) => s.filter((_, i) => i !== index))
    setCurrentLetters((c) => {
      const arr = [...c]
      const empty = arr.indexOf(null)
      arr[empty === -1 ? arr.length : empty] = letter
      return arr
    })
  }

  const handleDragStart = (e, letter, index, area) => {
    setDragged({ letter, index, area })
  }

  const handleDragOver = (e) => e.preventDefault()

  const handleDropOnSelected = (e) => {
    e.preventDefault()
    if (dragged.area === "available" && selectedLetters.length < currentWord.correct.length) {
      setSelectedLetters([...selectedLetters, dragged.letter])
      setCurrentLetters((c) => {
        const arr = [...c]
        arr[dragged.index] = null
        return arr
      })
    }
    setDragged({ letter: null, index: null, area: null })
  }

  const handleDropOnAvailable = (e) => {
    e.preventDefault()
    if (dragged.area === "selected") {
      setSelectedLetters((s) => s.filter((_, i) => i !== dragged.index))
      setCurrentLetters((c) => {
        const arr = [...c]
        const empty = arr.indexOf(null)
        arr[empty === -1 ? arr.length : empty] = dragged.letter
        return arr
      })
    }
    setDragged({ letter: null, index: null, area: null })
  }

  // ---------------- CHECK WORD ----------------
  useEffect(() => {
    if (!currentWord) return

    if (selectedLetters.length === currentWord.correct.length) {
      setTimeout(async () => {
        if (selectedLetters.join("") === currentWord.correct) {
          setFeedback("correct")
          playWord(currentWord.correct)

          setLetterBuildProgress(prev => {
            const updated = { ...prev, score: prev.score + 1 }
           
            // Check if score reaches 10 and maze not unlocked yet
            if (updated.score === 10 && !prev.mazeUnlocked) {
              updated.mazeUnlocked = true
              setShowUnlockModal(true)
             
              // Update user state so GameMenu knows immediately
              if (typeof setUser === "function") {
                setUser(prevUser => ({
                  ...prevUser,
                  progress: {
                    ...prevUser.progress,
                    letterBuild: updated
                  }
                }))
              }
            }
           
            setTimeout(() => nextWordOrLevel(updated), 1500)
            return updated
          })
        } else {
          setFeedback("incorrect")
          setTimeout(() => {
            setFeedback("")
            setupLetters(currentWord.correct)
          }, 1500)
        }
      }, 300)
    }
  }, [selectedLetters])

  // ---------------- NEXT WORD / NEXT LEVEL ----------------
  const nextWordOrLevel = async (progress = letterBuildProgress) => {
    const currentLevelWords = words[progress.level] || []
    let newProgress = { ...progress }

    // Next word inside same level
    if (progress.levelIndex + 1 < currentLevelWords.length) {
      newProgress.levelIndex += 1
    }
    // Next level
    else if (progress.level + 1 < words.length) {
      newProgress.level += 1
      newProgress.levelIndex = 0
    }
    // Victory
    else {
      newProgress.rewardsEarned = [true, true, true]
      setLetterBuildProgress(newProgress)
      setFeedback("victory")
      return
    }

    // Calculate stars and check if new star earned
    const totalWords = words.flat().length
    const currentPosition = newProgress.level * wordsPerLevel + newProgress.levelIndex + 1
    const progressPercent = Math.min((currentPosition / totalWords) * 100, 100)
    
    await checkAndAwardStars(newProgress, progressPercent)
    
    setLetterBuildProgress(newProgress)
    
    // Show star screen if new rewards earned, otherwise continue
    if (newProgress.rewardsEarned.some((r, i) => !progress.rewardsEarned[i] && r)) {
      setFeedback("")
    } else {
      setupLetters(words[newProgress.level][newProgress.levelIndex].correct)
      setFeedback("")
    }
  }

  // Helper function to check and award stars
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
      setUser(prev => ({
        ...prev,
        rewards: (prev.rewards || 0) + rewardsAdded,
        progress: { ...prev.progress, letterBuild: newProgress }
      }))
    }
  }

  // ---------------- CONTINUE TO NEXT LEVEL AFTER STAR ----------------
// ---------------- CONTINUE TO NEXT LEVEL AFTER STAR ----------------
const goToNextLevel = async () => {
  setStarEarned(false)
  setupLetters(words[letterBuildProgress.level][letterBuildProgress.levelIndex].correct)
  setFeedback("")
  await saveToSupabase()
}


  // ---------------- PAUSE ----------------
  const togglePause = async () => {
    setPaused(prev => !prev)
    if (!paused) await saveToSupabase()
  }

  // ---------------- RESET ----------------
  const resetScore = async () => {
    const newProgress = {
      score: 0,
      level: 0,
      levelIndex: 0,
      mazeUnlocked,
      rewardsEarned: [false, false, false]
    }
   
    setLetterBuildProgress(newProgress)
    setFeedback("")
    setPaused(false)
    setShowResetModal(false)
    setStarEarned(false)
   
    // Reset to first word
    if (words.length > 0 && words[0].length > 0) {
      setupLetters(words[0][0].correct)
    }
   
    await saveToSupabase(newProgress)
  }

  if (loading) return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />
  if (!currentWord) return null

  // Show unlock modal when maze is unlocked
  if (showUnlockModal)
    return (
      <UnlockModal
        fontClass={fontClass}
        sizeClass={sizeMap[fontSize || "medium"]}
        gameName="Woord Doolhof"
        gameEmoji="🧩"
        gameRoute="/maze"
        onClose={async () => {
          setShowUnlockModal(false)
          setFeedback("")
          await saveToSupabase()
        }}
      />
    )

  // Show level complete screen when star is earned
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
        score={score}
        words={words}
        fontClass={fontClass}
        sizeMap={sizeMap}
      />
    )

  // Calculate current progress for display
  const totalWords = words.flat().length
  const currentPosition = level * wordsPerLevel + levelIndex + 1
  const displayProgress = (currentPosition / totalWords) * 100

  return (
    <div className={`min-h-screen bg-cyan-50 p-4 sm:p-6 md:p-8 ${fontClass} ${sizeMap[fontSize]} relative`}>
      {/* Simple Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-40 h-40 bg-cyan-200 rounded-full opacity-30" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-blue-200 rounded-full opacity-25" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        <HeaderBar
          score={currentPosition - 1} // Show completed words
          total={totalWords}
          paused={paused}
          rewardsEarned={rewardsEarned}
          onPauseToggle={togglePause}
          onHome={async () => {
            await saveToSupabase()
            navigate("/menu")
          }}
          onReset={() => setShowResetModal(true)}
        />

        <ProgressBar progress={displayProgress} />

        <div className="bg-white rounded-3xl border-3 border-blue-200 shadow-lg p-6 md:p-10 lg:p-12">
          {paused ? (
            <PauseOverlay />
          ) : (
            <GameArea
              currentWord={currentWord}
              selectedLetters={selectedLetters}
              currentLetters={currentLetters}
              handleLetterClick={handleLetterClick}
              handleUndo={handleUndo}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDropOnSelected={handleDropOnSelected}
              handleDropOnAvailable={handleDropOnAvailable}
              playWord={playWord}
            />
          )}
        </div>

        <FeedbackModal type={feedback === "correct" ? "correct" : feedback === "incorrect" ? "incorrect" : ""} />
      </div>

      {showResetModal && (
        <ResetConfirmationModal
          onCancel={() => setShowResetModal(false)}
          onConfirm={resetScore}
        />
      )}
    </div>
  )
}

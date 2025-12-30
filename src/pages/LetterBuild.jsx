import React, { useState, useEffect, useRef } from "react"
import { useSettings } from "../context/SettingsContext"
import { useNavigate } from "react-router-dom"
import GameContainer from "../components/GameContainer"
import AudioButton from "../components/AudioButton"
import LoadingScreen from "../components/LoadingScreen"
import LevelCompleteScreen from "../components/LevelCompleteScreen"
import VictoryScreen from "../components/VictoryScreen"
import ResetConfirmationModal from "../components/ResetConfirmationModal"
import UnlockModal from "../components/UnlockModal"
import wordData from "../data/words.json"
import { updateProgress, getUser, addReward } from "../supabaseFunctions.js"
import { calculateStars } from "../utils/progressStars"
import { useLetterDrag } from "../hooks/useLetterDrag"
import usePlaytimeTracker from "../hooks/usePlaytimeTracker"


function GameArea({
  currentWord,
  selectedLetters,
  currentLetters,
  handleLetterClick,
  handleUndo,
  dragHandlers,
  soundOn,
  paused
}) {
  return (
    <div className="flex flex-col items-center gap-8">
      <style>{`
        .dragging-element {
          position: fixed;
          pointer-events: none;
          z-index: 1000;
          opacity: 0.8;
          transform: scale(1.1) rotate(5deg);
          transition: none;
        }
        .drag-placeholder {
          background: linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 100%);
          border: 3px dashed #8b5cf6;
          opacity: 0.5;
        }
      `}</style>
      
      <AudioButton
        word={currentWord.correct}
        soundOn={soundOn}
        paused={paused}
        label="Luister"
        className="px-8 py-4 text-xl md:text-2xl"
      />

      <div
        data-drop-zone="selected"
        className="min-h-[100px] w-full flex items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-blue-50 border-3 border-indigo-400 border-dashed rounded-2xl px-6 py-4 shadow-sm transition-colors duration-200"
        onDragOver={dragHandlers.handleDragOver}
        onDrop={dragHandlers.handleDropOnSelected}
        style={{ touchAction: 'none' }}
      >
        {selectedLetters.length === 0 ? (
          <p className="text-gray-400 italic font-medium text-lg">
            👆 Sleep letters hierheen
          </p>
        ) : (
          selectedLetters.map((letter, i) => (
            <div
              key={`${letter}-${i}`}
              data-selected-letter
              data-index={i}
              draggable
              onDragStart={(e) => dragHandlers.handleDragStart(e, letter, i, "selected")}
              onTouchStart={(e) => dragHandlers.handleTouchStart(e, letter, i, "selected")}
              onTouchMove={dragHandlers.handleTouchMove}
              onTouchEnd={dragHandlers.handleTouchEnd}
              onClick={() => handleUndo(letter, i)}
              className="cursor-pointer bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-3xl md:text-4xl rounded-xl px-6 py-4 shadow-md border-b-4 border-purple-700 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-110 active:scale-95"
              style={{ touchAction: 'none' }}
            >
              {letter}
            </div>
          ))
        )}
      </div>

      <div
        data-drop-zone="available"
        className="flex flex-wrap justify-center gap-3 md:gap-4 mt-6 p-6 bg-white rounded-2xl shadow-md border-3 border-gray-200 transition-colors duration-200"
        onDragOver={dragHandlers.handleDragOver}
        onDrop={dragHandlers.handleDropOnAvailable}
        style={{ touchAction: 'none' }}
      >
        {currentLetters.map((letter, i) =>
          letter ? (
            <div
              key={`${letter}-${i}`}
              data-available-letter
              data-index={i}
              draggable
              onDragStart={(e) => dragHandlers.handleDragStart(e, letter, i, "available")}
              onTouchStart={(e) => dragHandlers.handleTouchStart(e, letter, i, "available")}
              onTouchMove={dragHandlers.handleTouchMove}
              onTouchEnd={dragHandlers.handleTouchEnd}
              onClick={() => handleLetterClick(letter, i)}
              className="cursor-pointer bg-gradient-to-br from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-black text-3xl md:text-4xl rounded-xl px-6 py-4 shadow-md border-b-4 border-pink-600 transition-all duration-200 transform hover:scale-110 active:scale-95"
              style={{ touchAction: 'none' }}
            >
              {letter}
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
  usePlaytimeTracker(user)

  const { fontType, fontSize, soundOn } = useSettings()
  const navigate = useNavigate()

  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { small: "text-base md:text-lg", medium: "text-lg md:text-xl", large: "text-xl md:text-2xl" }

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

  const { level, levelIndex, score, mazeUnlocked, rewardsEarned } = letterBuildProgress

  const dragHook = useLetterDrag()

  const dragHandlers = {
    handleDragStart: dragHook.handleDragStart,
    handleDragOver: dragHook.handleDragOver,
    handleDropOnSelected: (e) => dragHook.handleDropOnSelected(e, selectedLetters, setSelectedLetters, setCurrentLetters, currentWord.correct.length),
    handleDropOnAvailable: (e) => dragHook.handleDropOnAvailable(e, setSelectedLetters, setCurrentLetters),
    handleTouchStart: dragHook.handleTouchStart,
    handleTouchMove: dragHook.handleTouchMove,
    handleTouchEnd: (e) => {
      const onClickCallback = (letter, index, area) => {
        if (area === 'available') handleLetterClick(letter, index)
        else if (area === 'selected') handleUndo(letter, index)
      }
      dragHook.handleTouchEnd(e, selectedLetters, setSelectedLetters, setCurrentLetters, currentWord.correct.length, onClickCallback)
    }
  }

  // --- Load words + progress ---
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

  const saveToSupabase = async (progressData = letterBuildProgress) => {
    if (!user) return
    const updated = await updateProgress(user.id, { letterBuild: progressData })
    if (updated) setUser(prev => ({ ...prev, progress: updated.progress }))
  }

  const setupLetters = (word) => {
    setCurrentLetters(word.split("").sort(() => 0.5 - Math.random()))
    setSelectedLetters([])
  }

  const currentWord = (words[level] || [])[levelIndex]

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

  useEffect(() => {
    if (!currentWord) return
    if (selectedLetters.length === currentWord.correct.length) {
      setTimeout(async () => {
        if (selectedLetters.join("") === currentWord.correct) {
          setFeedback("correct")
          setLetterBuildProgress(prev => {
            const updated = { ...prev, score: prev.score + 1 }
            if (updated.score === 10 && !prev.mazeUnlocked) {
              updated.mazeUnlocked = true
              setShowUnlockModal(true)
              setUser(prevUser => ({
                ...prevUser,
                progress: { ...prevUser.progress, letterBuild: updated }
              }))
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

  const nextWordOrLevel = async (progress = letterBuildProgress) => {
    const currentLevelWords = words[progress.level] || []
    let newProgress = { ...progress }

    if (progress.levelIndex + 1 < currentLevelWords.length) newProgress.levelIndex += 1
    else if (progress.level + 1 < words.length) {
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
    setupLetters(words[newProgress.level][newProgress.levelIndex].correct)
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
      setUser(prev => ({
        ...prev,
        rewards: (prev.rewards || 0) + rewardsAdded,
        progress: { ...prev.progress, letterBuild: newProgress }
      }))
    }
  }

  const goToNextLevel = async () => {
    setStarEarned(false)
    setupLetters(words[letterBuildProgress.level][letterBuildProgress.levelIndex].correct)
    setFeedback("")
    await saveToSupabase()
  }

  const togglePause = async () => {
    setPaused(prev => !prev)
    if (!paused) await saveToSupabase()
  }

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
    if (words.length > 0 && words[0].length > 0) setupLetters(words[0][0].correct)
    await saveToSupabase(newProgress)
  }

  if (loading) return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />
  if (!currentWord) return null

  if (showUnlockModal)
    return (
      <UnlockModal
        fontClass={fontClass}
        sizeClass={sizeMap[fontSize || "medium"]}
        gameName="Woorden Doolhof"
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
        score={score}
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
        sizeClass={sizeMap[fontSize]}
        bgColor="bg-cyan-50"
        bgVariant="cyan"
        score={currentPosition - 1}
        total={totalWords}
        paused={paused}
        rewardsEarned={rewardsEarned}
        progress={displayProgress}
        feedback={feedback}
        onPauseToggle={togglePause}
        onHome={async () => { await saveToSupabase(); navigate("/menu", { replace: true }) }}
        onReset={() => setShowResetModal(true)}
      >
        <GameArea
          currentWord={currentWord}
          selectedLetters={selectedLetters}
          currentLetters={currentLetters}
          handleLetterClick={handleLetterClick}
          handleUndo={handleUndo}
          dragHandlers={dragHandlers}
          soundOn={soundOn}
          paused={paused}
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

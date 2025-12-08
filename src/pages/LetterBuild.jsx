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
import { updateProgress, getUser } from "../supabaseFunctions.js"

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

      {/* Word Playback */}
      <button
        onClick={() => playWord(currentWord.correct)}
        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-lg transition-transform hover:scale-105"
      >
        🔊 Luister
      </button>

      {/* Selected Letters (Drop Target) */}
      <div
        className="min-h-[90px] flex items-center justify-center gap-3 bg-indigo-100 border-2 border-indigo-300 border-dashed rounded-2xl px-6 py-4 shadow-inner"
        onDragOver={handleDragOver}
        onDrop={handleDropOnSelected}
      >
        {selectedLetters.length === 0 ? (
          <p className="text-gray-400 italic">Sleep letters hierheen</p>
        ) : (
          selectedLetters.map((letter, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => handleDragStart(e, letter, i, "selected")}
              onClick={() => handleUndo(letter, i)}
              className="cursor-pointer bg-indigo-500 text-white font-bold text-3xl rounded-xl px-5 py-3 shadow-md hover:bg-indigo-600 transition"
            >
              {letter}
            </div>
          ))
        )}
      </div>

      {/* Available Letters */}
      <div
        className="flex flex-wrap justify-center gap-4 mt-6 p-4 bg-white rounded-2xl shadow-md border-2 border-gray-200"
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
              className="cursor-pointer bg-purple-500 text-white font-bold text-3xl rounded-xl px-5 py-3 shadow-lg hover:bg-purple-600 transition"
            >
              {letter}
            </div>
          ) : (
            <div key={i} className="w-12 h-12" />
          )
        )}
      </div>
    </div>
  )
}


export default function LetterBuild({ user }) {
  const { fontType, fontSize, soundOn } = useSettings()
  const navigate = useNavigate()

  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { small: "text-base md:text-lg", medium: "text-lg md:text-xl", large: "text-xl md:text-2xl" }
  const WORDS_PER_LEVEL = 7

  // ---------------- STATE ----------------
  const [words, setWords] = useState([])
  const [level, setLevel] = useState(0)
  const [levelIndex, setLevelIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [paused, setPaused] = useState(false)
  const [currentLetters, setCurrentLetters] = useState([])
  const [selectedLetters, setSelectedLetters] = useState([])
  const [loading, setLoading] = useState(true)

  // Dragging
  const [dragged, setDragged] = useState({ letter: null, index: null, area: null })

  // ---------------- INIT: LOAD FROM SUPABASE ----------------
  useEffect(() => {
    async function load() {
      const userData = await getUser(user.id)

      const saved = userData?.progress?.letterBuild

      if (saved) {
        setLevel(saved.level || 0)
        setLevelIndex(saved.levelIndex || 0)
        setScore(saved.score || 0)
      }

      // Generate levels
      const shuffled = [...wordData].sort(() => 0.5 - Math.random())
      const levels = Array.from(
        { length: Math.ceil(shuffled.length / WORDS_PER_LEVEL) },
        (_, i) => shuffled.slice(i * WORDS_PER_LEVEL, i * WORDS_PER_LEVEL + WORDS_PER_LEVEL)
      )

      setWords(levels)

      const restoredWord = saved
        ? levels[saved.level][saved.levelIndex].correct
        : levels[0][0].correct

      setupLetters(restoredWord)

      setLoading(false)
    }

    load()
  }, [])

  // ---------------- SUPABASE SAVE ----------------
  const saveToSupabase = (customData = {}) => {
    updateProgress(user.id, {
      letterBuild: {
        score,
        level,
        levelIndex,
        ...customData
      }
    })
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
      setTimeout(() => {
        if (selectedLetters.join("") === currentWord.correct) {
          setFeedback("correct")
          setScore((s) => s + 1)
          playWord(currentWord.correct)

          saveToSupabase({ score: score + 1 })

          setTimeout(nextWordOrLevel, 1500)
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
  const nextWordOrLevel = () => {
    // Next word inside same level
    if (levelIndex + 1 < words[level].length) {
      const nextIndex = levelIndex + 1
      setLevelIndex(nextIndex)
      setupLetters(words[level][nextIndex].correct)
      saveToSupabase({ levelIndex: nextIndex })
      setFeedback("")
      return
    }

    // Next level
    if (level + 1 < words.length) {
      const nextLevel = level + 1
      setLevel(nextLevel)
      setLevelIndex(0)
      setupLetters(words[nextLevel][0].correct)
      saveToSupabase({ level: nextLevel, levelIndex: 0 })
      setFeedback("level_complete")
      return
    }

    // Victory
    setFeedback("victory")
    saveToSupabase({ completed: true })
  }

  // ---------------- PAUSE ----------------
  const togglePause = () => {
    if (!paused) saveToSupabase()
    setPaused(!paused)
  }

  if (loading) return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />
  if (!currentWord) return null

  if (feedback === "level_complete")
    return (
      <LevelCompleteScreen
        nextLevel={() => {
          setFeedback("")
        }}
      />
    )

  if (feedback === "victory")
    return (
      <VictoryScreen
        startNewGame={() => window.location.reload()}
        score={score}
        words={words}
      />
    )

  return (
    <div className={`min-h-screen bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 p-4 sm:p-6 md:p-8 ${fontClass} ${sizeMap[fontSize]}`}>
      <div className="relative max-w-5xl mx-auto">
        <HeaderBar
          score={score}
          total={words.flat().length}
          paused={paused}
          onPauseToggle={togglePause}
          onHome={() => {
            saveToSupabase()
            navigate("/menu")
          }}
        />

        <ProgressBar
          progress={((levelIndex + 1 + level * WORDS_PER_LEVEL) / words.flat().length) * 100}
        />

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-10 lg:p-12">
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
    </div>
  )
}

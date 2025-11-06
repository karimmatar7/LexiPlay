import React, { useState, useEffect } from "react"
import { useSettings } from "../context/SettingsContext"
import HeaderBar from "../components/HeaderBar"
import ProgressBar from "../components/ProgressBar"
import FeedbackModal from "../components/FeedbackModal"
import PauseOverlay from "../components/PauseOverlay"
import Button from "../components/Button"
import wordData from "../data/words.json"

export default function WordMatch() {
  const { fontType, fontSize, soundOn } = useSettings()
  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = { small: "text-base", medium: "text-lg", large: "text-2xl" }

  const [words, setWords] = useState([])
  const [level, setLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [answered, setAnswered] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("lexiplay_progress")
    if (saved) {
      const { savedWords, savedLevel, savedScore } = JSON.parse(saved)
      setWords(savedWords)
      setLevel(savedLevel)
      setScore(savedScore)
    } else startNewGame()
  }, [])

  const startNewGame = () => {
    const shuffled = [...wordData].sort(() => 0.5 - Math.random())
    setWords(shuffled.slice(0, 7))
    setLevel(0)
    setScore(0)
    setFeedback("")
    localStorage.removeItem("lexiplay_progress")
  }

  const saveProgress = () =>
    localStorage.setItem(
      "lexiplay_progress",
      JSON.stringify({ savedWords: words, savedLevel: level, savedScore: score })
    )

  const togglePause = () => {
    if (!paused) saveProgress()
    setPaused(!paused)
  }

  const current = words[level]

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
    if (opt === current.correct) {
      setFeedback("correct")
      setScore((s) => s + 1)
      setTimeout(nextLevel, 1500)
    } else {
      setFeedback("incorrect")
      setTimeout(() => {
        setFeedback("")
        setAnswered(false)
      }, 1500)
    }
  }

  const nextLevel = () => {
    if (level + 1 < words.length) {
      setLevel((l) => l + 1)
      setFeedback("")
      setAnswered(false)
    } else {
      setFeedback("victory")
      localStorage.removeItem("lexiplay_progress")
    }
  }

  // Loading state
  if (!current)
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 ${fontClass} ${sizeMap[fontSize]}`}
      >
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
          <div className="text-8xl mb-6">🦊</div>
          <p className="text-3xl font-bold mb-8">Laden...</p>
          <Button onClick={startNewGame}>Nieuw spel starten</Button>
        </div>
      </div>
    )

  // Victory Screen
  if (feedback === "victory")
    return (
      <div
        className={`min-h-screen flex justify-center items-center bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 ${fontClass} ${sizeMap[fontSize]}`}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-xl w-full">
          <div className="text-9xl animate-bounce mb-6">🏆</div>
          <h2 className="text-5xl font-bold text-yellow-600 mb-4">
            Alle woorden voltooid!
          </h2>
          <p className="text-2xl text-gray-700 mb-6">Je bent een ster! ⭐</p>

          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 mb-8">
            <p className="text-6xl font-bold text-purple-600 mb-2">
              {score}/{words.length}
            </p>
            <p className="text-xl text-gray-600">Goede antwoorden!</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={startNewGame}>🔄 Opnieuw spelen</Button>
            <Button to="/menu" variant="secondary">
              🏠 Terug naar menu
            </Button>
          </div>
        </div>
      </div>
    )

  // Main Game Screen
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4 sm:p-8 ${fontClass} ${sizeMap[fontSize]}`}
    >
      <div className="max-w-4xl mx-auto">
        <HeaderBar
          score={score}
          total={words.length}
          paused={paused}
          onPauseToggle={togglePause}
        />
        <ProgressBar progress={((level + 1) / words.length) * 100} />

        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center">
          {paused ? (
            <PauseOverlay />
          ) : (
            <>
<button
  onClick={() => playWord(current.sound)}
  className="w-full flex items-center justify-center gap-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-2xl sm:text-3xl rounded-3xl py-8 sm:py-10 mb-10 shadow-xl hover:scale-105 hover:shadow-2xl transition-all border-4 border-white"
>
  <span className="text-4xl">🔊</span>
  Speel het woord af
</button>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {current.options.map((opt, i) => (
                  <Button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={answered}
                    className="text-2xl sm:text-3xl bg-gradient-to-br from-green-100 to-blue-100"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>

        <FeedbackModal type={feedback === "correct" ? "correct" : feedback === "incorrect" ? "incorrect" : ""} />
      </div>
    </div>
  )
}

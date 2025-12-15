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
import ResetConfirmationModal from "../components/ResetConfirmationModal"
import wordData from "../data/words.json"
import { updateProgress, addReward } from "../supabaseFunctions.js"
import { supabase } from "../supaBaseClient";
import { calculateStars } from "../utils/progressStars";

// --- Helpers ---
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5)

const generateOptions = (correctWord, allWords) => {
  const targetLength = correctWord.length
  const distractors = shuffleArray(
    allWords.map(w => w.correct).filter(w => w !== correctWord && Math.abs(w.length - targetLength) <= 1)
  ).slice(0, 3)

  while (distractors.length < 3) {
    const random = allWords[Math.floor(Math.random() * allWords.length)].correct
    if (random !== correctWord && !distractors.includes(random)) distractors.push(random)
  }

  return shuffleArray([correctWord, ...distractors])
}

// --- Main Component ---
export default function WordMatch({ user, setUser }) {
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
    letterBuildUnlocked: false,
    rewardsEarned: [false, false, false]
  })
  const [feedback, setFeedback] = useState("")
  const [answered, setAnswered] = useState(false)
  const [paused, setPaused] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const { level, levelIndex, score, letterBuildUnlocked, rewardsEarned } = wordMatchProgress

  // --- Load progress ---
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      const progress = data.progress?.wordMatch || {};
      const levels = Array.from(
        { length: Math.ceil(wordData.length / WORDS_PER_LEVEL) },
        (_, i) => wordData.slice(i * WORDS_PER_LEVEL, i * WORDS_PER_LEVEL + WORDS_PER_LEVEL)
      );
      setWords(levels);

      setWordMatchProgress({
        level: progress.level || 0,
        levelIndex: progress.levelIndex || 0,
        score: progress.score || 0,
        letterBuildUnlocked: progress.letterBuildUnlocked || false,
        rewardsEarned: progress.rewardsEarned || [false, false, false]
      });

      setLoaded(true);
    };

    loadProgress();
  }, [user]);

  // --- Save progress ---
  const saveProgress = async (progressData = wordMatchProgress) => {
    if (!user) return
    const updated = await updateProgress(user.id, { wordMatch: progressData })
    if (updated) {
      user.progress = updated.progress
      // Update local user state to keep rewards in sync
      setUser(prev => ({
        ...prev,
        progress: updated.progress
      }))
    }
  }

  // --- Reset score handler ---
  const resetScore = async () => {
    const newProgress = {
      ...wordMatchProgress,
      score: 0,
      level: 0,
      levelIndex: 0,
      rewardsEarned: [false, false, false]
    }
    setWordMatchProgress(newProgress)
    setFeedback("")
    setAnswered(false)
    setPaused(false)
    setShowResetModal(false)
    await saveProgress(newProgress)
  }

  // --- Pause toggle ---
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

      setWordMatchProgress(prev => {
        const updated = { ...prev, score: prev.score + 1 }
        // Pass the updated progress to nextWordOrLevel
        setTimeout(() => nextWordOrLevel(updated), 1500)
        return updated
      })
      
    } else {
      setFeedback("incorrect")
      setTimeout(() => { setFeedback(""); setAnswered(false) }, 1500)
    }
  }

  const nextWordOrLevel = async (progress = wordMatchProgress) => {
    const currentLevelWords = words[progress.level] || []
    let newProgress = { ...progress }

    // --- Check if more words in the level ---
    if (progress.levelIndex + 1 < currentLevelWords.length) {
      newProgress.levelIndex += 1
      
      // Calculate stars AFTER updating position
      const totalWords = words.flat().length
      const currentPosition = newProgress.level * WORDS_PER_LEVEL + newProgress.levelIndex + 1
      const progressPercent = (currentPosition / totalWords) * 100
      
      await checkAndAwardStars(newProgress, progressPercent, totalWords)
      
      setWordMatchProgress(newProgress)
      setFeedback("")
      setAnswered(false)

    } else if (progress.level + 1 < words.length) {
      setFeedback("level_complete")
      if (progress.level === 0 && !progress.letterBuildUnlocked) {
        newProgress.letterBuildUnlocked = true
        setShowUnlockModal(true)
      }
      newProgress.level += 1
      newProgress.levelIndex = 0
      
      // Calculate stars AFTER updating to new level
      const totalWords = words.flat().length
      const currentPosition = newProgress.level * WORDS_PER_LEVEL + newProgress.levelIndex + 1
      const progressPercent = (currentPosition / totalWords) * 100
      
      await checkAndAwardStars(newProgress, progressPercent, totalWords)
      
    } else {
      // Victory - ensure all stars are awarded
      const totalWords = words.flat().length
      newProgress.rewardsEarned = [true, true, true]
      await checkAndAwardStars(newProgress, 100, totalWords)
      setFeedback("victory")
    }

    setWordMatchProgress(newProgress)
  }

  // Helper function to check and award stars
  const checkAndAwardStars = async (newProgress, progressPercent, totalWords) => {
    const starsEarned = calculateStars(progressPercent)
    
    const rewardsEarned = newProgress.rewardsEarned || [false, false, false]
    let rewardsAdded = 0
    
    for (let i = 0; i < starsEarned; i++) {
      if (!rewardsEarned[i]) {
        rewardsEarned[i] = true
        rewardsAdded += 1
      }
    }
    
    newProgress.rewardsEarned = rewardsEarned
    
    await updateProgress(user.id, { wordMatch: newProgress })

    if (rewardsAdded > 0) {
      await addReward(user.id, rewardsAdded)
      setUser(prev => ({
        ...prev,
        rewards: (prev.rewards || 0) + rewardsAdded,
        progress: { ...prev.progress, wordMatch: newProgress }
      }))
    }
  }

  const goToNextLevel = async () => {
    setWordMatchProgress(prev => ({ ...prev, level: prev.level + 1, levelIndex: 0 }))
    setFeedback("")
    setAnswered(false)
    await saveProgress()
  }

  // --- UI States ---
  if (!loaded)
    return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />

  if (showUnlockModal)
    return (
      <UnlockModal
        fontClass={fontClass}
        sizeClass={sizeMap[fontSize || "medium"]}
        gameName="Letter Bouw"
        gameEmoji="🔤"
        gameRoute="/letterbuild"        
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
    return <VictoryScreen fontClass={fontClass} sizeMap={sizeMap} score={score} words={words} onRestart={resetScore} />

  // Calculate current progress for display
  const totalWords = words.flat().length
  const currentPosition = level * WORDS_PER_LEVEL + levelIndex + 1
  const displayProgress = (currentPosition / totalWords) * 100

  return (
    <div className={`min-h-screen bg-sky-50 p-4 md:p-6 ${fontClass} ${sizeMap[fontSize || "medium"]} relative`}>
      <BackgroundDecor />
      <div className="relative max-w-5xl mx-auto">
        <HeaderBar 
          score={currentPosition - 1} // Show completed words
          total={totalWords}
          paused={paused}
          rewardsEarned={rewardsEarned} 
          onPauseToggle={togglePause}
          onHome={goHome}
          onReset={() => setShowResetModal(true)}
        />
        <ProgressBar progress={displayProgress} />
        <div className="bg-white rounded-3xl border-3 border-blue-200 shadow-lg p-6 md:p-10 lg:p-12">
          {paused ? <PauseOverlay /> :
            <WordOptions currentWord={currentWord} answered={answered} playWord={playWord} handleAnswer={handleAnswer} />
          }
        </div>
        <FeedbackModal type={feedback === "correct" ? "correct" : feedback === "incorrect" ? "incorrect" : ""} />
      </div>

      {showResetModal &&
        <ResetConfirmationModal
          onCancel={() => setShowResetModal(false)}
          onConfirm={resetScore}
        />
      }
    </div>
  )
}

// --- Helper Components ---
const BackgroundDecor = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-10 left-10 w-40 h-40 bg-blue-200 rounded-full opacity-30" />
    <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-200 rounded-full opacity-25" />
    <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-pink-200 rounded-full opacity-30" />
  </div>
)

const WordOptions = ({ currentWord, answered, playWord, handleAnswer }) => {
  if (!currentWord) return null
  const options = generateOptions(currentWord.correct, wordData)

  return (
    <>
      <div className="mb-8 md:mb-12">
        <button 
          onClick={() => playWord(currentWord.sound)} 
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-2xl md:text-3xl rounded-2xl py-6 md:py-8 shadow-md border-b-4 border-indigo-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <span className="text-4xl mr-3">🔊</span>
          Speel het woord af
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {options.map((opt, i) => (
          <button
            key={i}
            disabled={answered}
            onClick={() => handleAnswer(opt)}
            className={`py-6 md:py-8 px-4 rounded-2xl font-bold text-xl md:text-2xl transition-all duration-200 ${
              answered 
                ? "opacity-50 cursor-not-allowed bg-gray-200 border-3 border-gray-400" 
                : "bg-gradient-to-br from-purple-50 to-pink-50 border-3 border-purple-400 hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 shadow-md hover:shadow-lg transform hover:scale-105"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  )
}
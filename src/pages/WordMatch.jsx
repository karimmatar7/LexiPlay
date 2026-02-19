import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useSettings } from "../context/SettingsContext"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import GameContainer from "../components/GameContainer"
import AudioButton from "../components/AudioButton"
import LoadingScreen from "../components/LoadingScreen"
import VictoryScreen from "../components/VictoryScreen"
import ResetConfirmationModal from "../components/ResetConfirmationModal"
import NoHeartsScreen from "../components/NoHeartsScreen"
import { HeartsDisplay } from "../components/HeartsDisplay"
import { useHearts } from "../hooks/useHearts"
import wordData from "../data/words.json"
import { supabase } from "../supaBaseClient"
import { addKeys } from "../supabaseFunctions"
import usePlaytimeTracker from "../hooks/usePlaytimeTracker"

const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5)
const MAX_HEARTS = 5

function scrambleWord(word) {
  if (word.length <= 2) return word.split("").reverse().join("")
  const letters = word.split("")
  let scrambled
  let attempts = 0
  do {
    scrambled = shuffleArray(letters).join("")
    attempts++
  } while (scrambled === word && attempts < 20)
  return scrambled
}

function generateScrambles(word) {
  const scrambles = new Set()
  let attempts = 0
  while (scrambles.size < 3 && attempts < 50) {
    const s = scrambleWord(word)
    if (s !== word) scrambles.add(s)
    attempts++
  }
  while (scrambles.size < 3) {
    const arr = word.split("")
    const i = Math.floor(Math.random() * arr.length)
    const j = (i + 1) % arr.length
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    scrambles.add(arr.join(""))
  }
  return [...scrambles]
}

export default function WordMatch({ user, setUser }) {
  usePlaytimeTracker(user)

  const { fontType, fontSize, soundOn } = useSettings()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const fontClass = fontType === "dyslexic" ? "font-dyslexic" : "font-sans"
  const sizeMap = {
    small: "text-base md:text-lg",
    medium: "text-lg md:text-xl",
    large: "text-xl md:text-2xl",
  }
  const sizeClass = sizeMap[fontSize || "medium"]

  const [words] = useState(() => shuffleArray(wordData))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [heartsInit, setHeartsInit] = useState(null)
  const [cooldownInit, setCooldownInit] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [answered, setAnswered] = useState(false)
  const [paused, setPaused] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [victory, setVictory] = useState(false)

  const processingRef = useRef(false)
  const keys = user?.progress?.currency?.keys || 0

  const getLocalizedWord = useCallback((wordObj) => {
    if (!wordObj) return ""
    if (wordObj[i18n.language]) return wordObj[i18n.language]
    return wordObj.correct || wordObj.en
  }, [i18n.language])

  const currentWordObj = words[currentIndex]

  const currentWord = useMemo(() => {
    if (!currentWordObj) return null
    const correct = getLocalizedWord(currentWordObj)
    if (!correct) return null
    const scrambles = generateScrambles(correct)
    const options = shuffleArray([correct, ...scrambles])
    return { displayWord: correct, options }
  }, [currentIndex, currentWordObj, getLocalizedWord])

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()
      const progress = data.progress?.wordMatch || {}
      setHeartsInit(progress.hearts ?? MAX_HEARTS)
      setCooldownInit(progress.cooldownUntil ?? null)
      setLoaded(true)
    }
    load()
  }, [user])

  const {
    hearts,
    cooldownUntil,
    heartAnimating,
    loseHeart,
    maxHearts,
    heartsReady,
  } = useHearts({
    user,
    gameKey: "wordMatch",
    initialHearts: heartsInit,
    initialCooldown: cooldownInit,
  })

  const handleAnswer = useCallback(async (opt) => {
    if (processingRef.current || answered || paused || !currentWord) return
    if (hearts <= 0) return

    processingRef.current = true
    setAnswered(true)

    if (opt === currentWord.displayWord) {
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

      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1
          if (next >= words.length) {
            setVictory(true)
            return prev
          }
          return next
        })
        setAnswered(false)
        setFeedback("")
        processingRef.current = false
      }, 1200)

    } else {
      setFeedback("incorrect")
      await loseHeart()

      setTimeout(() => {
        setFeedback("")
        setAnswered(false)
        processingRef.current = false
      }, 1200)
    }
  }, [answered, paused, currentWord, hearts, words.length, loseHeart])

  if (!loaded || !heartsReady)
    return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />

  if (hearts <= 0)
    return (
      <NoHeartsScreen
        cooldownUntil={cooldownUntil}
        fontClass={fontClass}
        sizeClass={sizeClass}
      />
    )

  if (victory)
    return (
      <VictoryScreen
        score={words.length}
        words={words}
        onRestart={() => {
          setCurrentIndex(0)
          setVictory(false)
          setAnswered(false)
          setFeedback("")
          processingRef.current = false
        }}
        fontClass={fontClass}
        sizeMap={sizeMap}
      />
    )

  if (!currentWord)
    return <LoadingScreen fontClass={fontClass} sizeMap={sizeMap} />

  return (
    <>
      <GameContainer
        fontClass={fontClass}
        sizeClass={sizeClass}
        bgColor="bg-sky-50"
        bgVariant="default"
        score={currentIndex}
        total={words.length}
        keys={keys}
        paused={paused}
        progress={(currentIndex / words.length) * 100}
        feedback={feedback}
        onPauseToggle={() => setPaused((p) => !p)}
        onHome={() => navigate("/menu")}
        onReset={() => setShowResetModal(true)}
      >
        <HeartsDisplay
          hearts={hearts}
          heartAnimating={heartAnimating}
          maxHearts={maxHearts}
        />

        <div className="mb-6 md:mb-12">
          <AudioButton
            word={currentWord.displayWord}
            soundOn={soundOn}
            paused={paused}
            label={t("wordMatch.playWord")}
            className="w-full text-xl md:text-3xl py-6"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {currentWord.options.map((opt, i) => (
            <button
              key={i}
              disabled={answered}
              onClick={() => handleAnswer(opt)}
              className={`${fontClass} ${sizeClass} py-6 px-4 rounded-2xl font-bold transition-all duration-200 border-b-4 ${
                answered
                  ? opt === currentWord.displayWord
                    ? "bg-green-100 border-green-400 text-green-700"
                    : "opacity-50 cursor-not-allowed bg-gray-200 border-gray-400 text-gray-500"
                  : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-400 hover:border-purple-500 hover:from-purple-100 hover:to-pink-100 shadow-md hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </GameContainer>

      {showResetModal && (
        <ResetConfirmationModal
          onCancel={() => setShowResetModal(false)}
          onConfirm={() => {
            setCurrentIndex(0)
            setVictory(false)
            setAnswered(false)
            setFeedback("")
            processingRef.current = false
            setShowResetModal(false)
          }}
        />
      )}
    </>
  )
}

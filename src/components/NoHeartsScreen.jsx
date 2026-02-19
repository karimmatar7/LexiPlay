import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

const MAX_HEARTS = 5

export default function NoHeartsScreen({ cooldownUntil, fontClass, sizeClass }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [secondsLeft, setSecondsLeft] = useState(() =>
    cooldownUntil
      ? Math.max(0, Math.round((new Date(cooldownUntil) - new Date()) / 1000))
      : 0
  )

  useEffect(() => {
    if (!cooldownUntil) return
    const interval = setInterval(() => {
      setSecondsLeft(
        Math.max(0, Math.round((new Date(cooldownUntil) - new Date()) / 1000))
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldownUntil])

  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60

  return (
    <div className={`min-h-screen bg-sky-50 flex items-center justify-center p-4 ${fontClass} ${sizeClass}`}>
      <div className="bg-white w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-3xl border-2 border-purple-300 shadow-lg text-center">
        <div className="text-4xl sm:text-5xl mb-4">💔</div>
        <h2 className="text-xl sm:text-2xl font-bold text-purple-700 mb-3">
          {t("hearts.noHearts")}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-3">
          {t("hearts.tryLater")}{" "}
          <span className="font-bold text-purple-600 tabular-nums">
            ({m}:{s.toString().padStart(2, "0")})
          </span>
        </p>
        <div className="flex justify-center gap-2 mb-5">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <span key={i} className="text-2xl opacity-20 grayscale">❤️</span>
          ))}
        </div>
        <button
          onClick={() => navigate("/menu")}
          className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-md border-b-4 border-indigo-700 hover:scale-105 transition-all duration-200"
        >
          ← {t("hearts.backToMenu")}
        </button>
      </div>
    </div>
  )
}

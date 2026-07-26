import React, { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import keyIcon from "../assets/icons/key.png"

export default function KeyStreakBar({ keyStreak, keyEveryN = 4, justEarned = false, soundOn = true }) {
  const { t } = useTranslation()
  const audioRef = useRef(null)

  useEffect(() => {
    if (!justEarned || !soundOn) return
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/keys.mp3")
        audioRef.current.volume = 0.7
      }
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    } catch (_) {}
  }, [justEarned, soundOn])

  return (
    <div className="flex justify-center mb-3">
      <div
        className={`flex items-center gap-2 border rounded-full px-4 py-1.5 transition-all duration-300 ${
          justEarned
            ? "bg-yellow-100 border-yellow-400 scale-110 shadow-md"
            : "bg-yellow-50 border-yellow-200"
        }`}
      >
      <span
  className={`inline-flex items-center justify-center transition-transform duration-500 ${
    justEarned ? "animate-spin" : ""
  }`}
  style={
    justEarned
      ? { animationIterationCount: 1, animationDuration: "0.5s" }
      : {}
  }
>
  <img
    src={keyIcon}
    alt=""
    aria-hidden="true"
    draggable="false"
    className="h-4 w-4 object-contain sm:h-5 sm:w-5"
  />
</span>

        {Array.from({ length: keyEveryN }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full border-2 transition-all duration-300 ${
              justEarned
                ? "w-5 h-5 bg-yellow-400 border-yellow-500 scale-125"
                : i < keyStreak
                ? "w-4 h-4 bg-yellow-400 border-yellow-500 scale-110"
                : "w-4 h-4 bg-gray-100 border-gray-300"
            }`}
          />
        ))}

        <span
          className={`text-xs font-bold transition-colors duration-300 ${
            justEarned ? "text-yellow-600" : "text-yellow-500"
          }`}
        >
          {justEarned ? `+1 ${t("streak.keyEarned")}` : `${keyStreak}/${keyEveryN}`}
        </span>
      </div>
    </div>
  )
}

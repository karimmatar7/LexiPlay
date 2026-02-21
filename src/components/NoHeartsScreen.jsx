import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { buyHearts } from "../utils/user"
import { MAX_HEARTS, MS_PER_HEART } from "../utils/heartConstants"
import HeartShopPanel from "./hearts/HeartShopPanel"

function getSecondsLeft(until, hearts) {
  if (!until) return 0
  const nextHeartMs  = new Date(until).getTime()
  const fullRefillMs = nextHeartMs + Math.max(0, (MAX_HEARTS - hearts) - 1) * MS_PER_HEART
  return Math.max(0, Math.round((fullRefillMs - Date.now()) / 1000))
}

export default function NoHeartsScreen({
  hearts = 0, cooldownUntil,
  fontClass, sizeClass,
  userId, gameKey, onHeartsRefilled,
}) {
  const { t }    = useTranslation()
  const navigate = useNavigate()

  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(cooldownUntil, hearts))
  const [showShop,    setShowShop]    = useState(false)
  const [buying,      setBuying]      = useState(false)
  const [feedback,    setFeedback]    = useState(null)

  useEffect(() => {
    if (!cooldownUntil) return
    const id = setInterval(() => setSecondsLeft(getSecondsLeft(cooldownUntil, hearts)), 1000)
    return () => clearInterval(id)
  }, [cooldownUntil, hearts]) // eslint-disable-line react-hooks/exhaustive-deps

  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60

  async function handleBuy(deal) {
    if (buying) return
    setBuying(true)
    setFeedback(null)
    const result = await buyHearts(userId, gameKey, deal.hearts, deal.keys)
    if (result?.success) {
      setFeedback({ type: "success", msg: t("hearts.added", { count: deal.hearts, defaultValue: `+${deal.hearts} ❤️ added!` }) })
      setTimeout(() => { setShowShop(false); setFeedback(null); onHeartsRefilled?.(result.user) }, 1200)
    } else {
      setFeedback({
        type: "error",
        msg: result?.message === "Not enough keys"
          ? t("hearts.notEnoughKeys", "Not enough 🗝️ keys!")
          : t("hearts.error", "Something went wrong"),
      })
    }
    setBuying(false)
  }

  return (
    <div className={`min-h-screen bg-sky-50 flex items-center justify-center p-4 ${fontClass} ${sizeClass}`}>
      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-3xl border-2 border-purple-300 shadow-lg text-center overflow-visible">

        <div className="p-5 sm:p-8">
          <div className="text-4xl sm:text-5xl mb-3 select-none">💔</div>

          <h2 className="text-xl sm:text-2xl font-bold text-purple-700 mb-2">
            {t("hearts.noHearts", "No hearts left!")}
          </h2>

          <p className="text-sm sm:text-base text-gray-600 mb-3">
            {t("hearts.tryLater", "Full refill in")}{" "}
            <span className="font-bold text-purple-600 tabular-nums">
              ({m}:{String(s).padStart(2, "0")})
            </span>
          </p>

          <div className="flex justify-center gap-2 mb-6" aria-hidden>
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <span key={i} className="text-2xl opacity-20 grayscale select-none">❤️</span>
            ))}
          </div>

          <button
            onClick={() => setShowShop((v) => !v)}
            className="w-full mb-3 inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-yellow-900 px-6 py-3 rounded-2xl font-bold shadow-md border-b-4 border-yellow-600 hover:scale-105 transition-all duration-200"
          >
            🗝️ {t("hearts.buyHearts", "Buy Hearts with Keys")}
          </button>

          <button
            onClick={() => navigate("/menu")}
            className="w-full inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white px-6 py-3 rounded-2xl font-bold shadow-md border-b-4 border-indigo-700 hover:scale-105 transition-all duration-200"
          >
           {t("hearts.backToMenu", "Back to Menu")}
          </button>
        </div>

        {showShop && (
          <HeartShopPanel
            onClose={() => { setShowShop(false); setFeedback(null) }}
            buying={buying}
            onBuy={handleBuy}
            feedback={feedback}
            t={t}
          />
        )}
      </div>
    </div>
  )
}

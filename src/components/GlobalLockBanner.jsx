import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import HeartShopPanel, { DEALS_ALL } from "./hearts/HeartShopPanel"
import { buyHeartsAllGames } from "../utils/user"

const MAX_HEARTS = 5

export default function GlobalLockBanner({ hearts, cooldownUntil, countdown, userId, onHeartsRefilled }) {
  const { t } = useTranslation()

  const [showShop, setShowShop] = useState(false)
  const [buying,   setBuying]   = useState(false)
  const [feedback, setFeedback] = useState(null)

  function formatCountdown(seconds) {
    if (seconds === null || seconds === undefined) return "..."
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, "0")}`
  }

  async function handleBuy(deal) {
    if (buying) return
    setBuying(true)
    setFeedback(null)

    const result = await buyHeartsAllGames(userId, deal.hearts, deal.keys)

    if (result?.success) {
      setFeedback({
        type: "success",
        msg: t("hearts.addedAll", {
          count: deal.hearts,
          defaultValue: `+${deal.hearts} ❤️ added to all games!`,
        }),
      })
      setTimeout(() => {
        setShowShop(false)
        setFeedback(null)
        onHeartsRefilled?.(result.user)
      }, 1200)
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
    <div
      className="relative overflow-visible bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-3xl shadow-md"
      style={{ padding: "clamp(16px,4vw,24px)" }}
    >
      {/* Watermark */}
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 select-none pointer-events-none"
        style={{ fontSize: "clamp(48px,12vw,96px)" }}
      >
        🔒
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">

        {/* Icon */}
        <div className="flex-shrink-0 w-14 h-14 bg-red-100 border-2 border-red-300 rounded-2xl flex items-center justify-center shadow-sm text-3xl">
          🔒
        </div>

        {/* Text */}
        <div className="flex-1 text-center sm:text-left">
          <p className="font-black text-red-600 mb-1" style={{ fontSize: "clamp(14px,3vw,18px)" }}>
            {t("finalWordBuilder.allLockedTitle")}
          </p>
          <p className="text-red-400 mb-2 text-sm">
            {t("finalWordBuilder.allLockedDesc")}
          </p>
          <div className="inline-flex items-center gap-2 bg-white border border-red-200 rounded-full px-4 py-1.5 shadow-sm">
            <span className="text-sm">⏳</span>
            <span className="text-sm font-bold text-red-500 tabular-nums">
              {t("letterBuild.tryLater")} {formatCountdown(countdown)}
            </span>
          </div>
        </div>

        {/* Hearts + buy button */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <span
                key={i}
                style={{ fontSize: "clamp(16px,3vw,24px)" }}
                className={`leading-none transition-all duration-300 ${
                  i < hearts ? "opacity-100" : "opacity-20 grayscale"
                }`}
              >
                ❤️
              </span>
            ))}
          </div>
          <p className="text-xs font-bold text-red-400">{hearts}/{MAX_HEARTS}</p>

          <button
            onClick={() => setShowShop((v) => !v)}
            className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-black px-3 py-1.5 rounded-full border-b-2 border-yellow-600 shadow hover:scale-105 transition-all duration-200"
          >
            🗝️ {t("hearts.buyHeartsAll", "Buy Hearts for All Games")}
          </button>
        </div>
      </div>

      {/* Shop panel */}
      {showShop && (
        <div className="mt-4">
          <HeartShopPanel
            onClose={() => { setShowShop(false); setFeedback(null) }}
            buying={buying}
            onBuy={handleBuy}
            feedback={feedback}
            t={t}
            deals={DEALS_ALL}
          />
        </div>
      )}
    </div>
  )
}

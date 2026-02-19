import React from "react"
import { useTranslation } from "react-i18next"

const MAX_HEARTS = 5

export default function GlobalLockBanner({ hearts, cooldownUntil, countdown }) {
  const { t } = useTranslation()

  function formatCountdown(seconds) {
    if (seconds === null || seconds === undefined) return "..."
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-3xl shadow-md"
      style={{ padding: "clamp(16px,4vw,24px)" }}
    >
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 select-none pointer-events-none"
        style={{ fontSize: "clamp(48px,12vw,96px)" }}
      >
        🔒
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-shrink-0 w-14 h-14 bg-red-100 border-2 border-red-300 rounded-2xl flex items-center justify-center shadow-sm text-3xl">
          🔒
        </div>

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

        <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
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
        </div>
      </div>
    </div>
  )
}

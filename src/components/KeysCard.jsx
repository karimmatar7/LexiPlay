import React from "react"
import { useTranslation } from "react-i18next"

export default function KeysCard({ keys, thresholds, unlocked }) {
  const { t } = useTranslation()

  const rows = [
    { threshold: thresholds.letterBuild, label: t("gameCards.letterBuild.title"),       isUnlocked: unlocked.letterBuild },
    { threshold: thresholds.maze,        label: t("gameCards.wordMaze.title"),           isUnlocked: unlocked.maze        },
    { threshold: thresholds.final,       label: t("gameCards.finalWordBuilder.title"),   isUnlocked: unlocked.final       },
  ]

  return (
    <>
      <style>{`
        @keyframes key-pop {
          0%, 100% { transform: scale(1) rotate(0deg); }
          30%  { transform: scale(1.25) rotate(-12deg); }
          60%  { transform: scale(1.1)  rotate(6deg); }
        }
        @keyframes keys-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>

      <div
        className="relative overflow-hidden w-full max-w-md bg-white"
        style={{ padding: "clamp(14px,3.5vw,20px) clamp(16px,4vw,24px)" }}
      >
        {/* Shimmer */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            width: "30%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            animation: "keys-shimmer 4s ease-in-out 2s infinite",
          }}
        />

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Key icon + count */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              className="select-none"
              style={{
                fontSize: "clamp(28px,6vw,40px)",
                display: "inline-block",
                animation: "key-pop 3s ease-in-out 1s infinite",
              }}
            >
              🗝️
            </span>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                {t("gameMenu.yourKeys") || "Your keys"}
              </p>
              <p
                className="font-black text-yellow-500 leading-none tabular-nums"
                style={{ fontSize: "clamp(22px,5vw,32px)" }}
              >
                {keys}
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-px self-stretch bg-yellow-200" />
          <div className="w-full sm:hidden h-px bg-yellow-100" />

          {/* Threshold pills */}
          <div className="flex flex-row sm:flex-col gap-2 sm:gap-1 flex-wrap justify-center sm:justify-start">
            {rows.map(({ threshold, label, isUnlocked }) => (
              <p
                key={threshold}
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${
                  isUnlocked
                    ? "bg-green-50 border-green-200 text-green-600"
                    : keys >= threshold
                    ? "bg-yellow-50 border-yellow-200 text-yellow-600"
                    : "bg-gray-50 border-gray-200 text-gray-400"
                }`}
              >
                <span>{isUnlocked ? "✅" : keys >= threshold ? "🔓" : "🔒"}</span>
                <span>{threshold} → {label}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

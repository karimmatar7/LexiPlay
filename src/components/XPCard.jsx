import React from "react"
import { useTranslation } from "react-i18next"
import cupIcon from "../assets/icons/cup.png";
import starIcon from "../assets/icons/star.png";


export default function XPCard({ xp, level }) {
  const { t } = useTranslation()
  const xpIntoLevel = xp % 100

  return (
    <>
      <style>{`
        @keyframes xp-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes xp-grow {
          from { width: 0%; }
          to   { width: var(--xp-pct); }
        }
        @keyframes xp-spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="relative overflow-hidden w-full max-w-md bg-white"
        style={{ padding: "clamp(16px,4vw,24px) clamp(18px,5vw,28px)" }}
      >
        {/* Shimmer sweep */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            width: "35%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
            animation: "xp-shimmer 3s ease-in-out 1s infinite",
          }}
        />

        <div className="flex items-center justify-between mb-3 gap-3">
          {/* Level badge */}
          <div className="flex items-center gap-3">
            <div
              className="relative flex-shrink-0 rounded-2xl flex items-center justify-center shadow-md border-b-4 border-indigo-600"
              style={{
                width: "clamp(44px,10vw,60px)",
                height: "clamp(44px,10vw,60px)",
                background: "linear-gradient(135deg,#818cf8,#a855f7)",
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl border-2 border-white opacity-30"
                style={{ animation: "xp-spin-slow 8s linear infinite" }}
              />
              <span
                className="text-white font-black relative z-10"
                style={{ fontSize: "clamp(16px,4vw,22px)" }}
              >
                {level}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                {t("gameMenu.level") || "Level"}
              </p>
              <p
                className="font-black text-indigo-700 leading-none"
                style={{ fontSize: "clamp(13px,3vw,17px)" }}
              >
                {t("gameMenu.adventurer") || "Adventurer"} <img src={cupIcon} alt="Cup" className="h-5 w-5" />
              </p>
            </div>
          </div>

          {/* XP number */}
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">XP</p>
            <p
              className="font-black text-indigo-500 leading-none tabular-nums"
              style={{ fontSize: "clamp(15px,3.5vw,20px)" }}
            >
              {xpIntoLevel}
              <span className="text-sm font-bold text-gray-300"> / 100</span>
            </p>
          </div>
        </div>

        {/* XP bar */}
        <div
          className="w-full bg-indigo-100 rounded-full overflow-hidden"
          style={{ height: "clamp(10px,2vw,16px)" }}
        >
          <div
            style={{
              "--xp-pct": `${xpIntoLevel}%`,
              width: `${xpIntoLevel}%`,
              height: "100%",
              borderRadius: "9999px",
              background: "linear-gradient(90deg,#818cf8,#a855f7,#ec4899)",
              backgroundSize: "200% auto",
              animation: "xp-grow 1.2s cubic-bezier(0.22,1,0.36,1) 0.5s both",
              transition: "width 0.8s ease",
            }}
          />
        </div>

        <div className="flex justify-between mt-2 gap-2">
          <p className="text-xs font-semibold text-indigo-300">
            <img src={starIcon} alt="Star" className="h-4 w-4 inline mr-1" />
            {t("gameMenu.totalXP") || "Total XP"}: {xp}
          </p>
          <p className="text-xs font-bold text-gray-400">
            {100 - xpIntoLevel} XP {t("gameMenu.toNextLevel") || "to next level"}
          </p>
        </div>
      </div>
    </>
  )
}

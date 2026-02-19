import React, { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSettings } from "../context/SettingsContext"

const PARTICLES = ["⭐", "✨", "🌟", "💫", "⭐", "✨"]

export default function LevelUpToast({ level, show }) {
  const { t } = useTranslation()
  const { soundOn } = useSettings()
  const audioRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (!show) return

    setVisible(true)
    setExiting(false)

    if (soundOn) {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio("/sounds/levelUp.mp3")
          audioRef.current.volume = 0.8
        }
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      } catch (_) {}
    }

    // Start exit animation 700ms before parent hides it (parent hides at 3000ms)
    const exitTimer = setTimeout(() => setExiting(true), 2300)
    return () => clearTimeout(exitTimer)
  }, [show, soundOn])

  if (!show && !visible) return null

  return (
    <>
      <style>{`
        @keyframes lvl-drop-in {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-40px) scale(0.7); }
          60%  { transform: translateX(-50%) translateY(6px) scale(1.06); }
          80%  { transform: translateX(-50%) translateY(-3px) scale(0.98); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0px) scale(1); }
        }
        @keyframes lvl-fade-out {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0px) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-24px) scale(0.85); }
        }
        @keyframes lvl-shine {
          0%   { left: -60%; }
          100% { left: 130%; }
        }
        @keyframes lvl-particle {
          0%   { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.3); }
        }
        @keyframes lvl-pulse-ring {
          0%   { transform: translateX(-50%) translateY(-50%) scale(0.8); opacity: 0.6; }
          100% { transform: translateX(-50%) translateY(-50%) scale(1.6); opacity: 0; }
        }
        @keyframes lvl-badge-pop {
          0%   { transform: scale(0.5) rotate(-12deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes lvl-number-count {
          0%   { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Pulse ring behind the toast */}
      <div
        className="fixed z-40 pointer-events-none"
        style={{
          top: "clamp(40px, 6vw, 72px)",
          left: "50%",
          width: "clamp(220px, 60vw, 420px)",
          height: "clamp(64px, 12vw, 90px)",
          borderRadius: "9999px",
          background: "radial-gradient(ellipse, rgba(251,191,36,0.35) 0%, transparent 70%)",
          animation: "lvl-pulse-ring 0.8s ease-out forwards",
        }}
      />

      {/* Main toast */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          top: "clamp(12px, 3vw, 24px)",
          left: "50%",
          animation: exiting
            ? "lvl-fade-out 0.5s cubic-bezier(0.4,0,1,1) forwards"
            : "lvl-drop-in 0.55s cubic-bezier(0.22,1,0.36,1) forwards",
          transformOrigin: "top center",
          overflow: "visible",
        }}
      >
        {/* Floating particles */}
        {PARTICLES.map((emoji, i) => (
          <span
            key={i}
            className="absolute text-base md:text-lg pointer-events-none"
            style={{
              top: "50%",
              left: "50%",
              "--tx": `${(i % 2 === 0 ? -1 : 1) * (28 + i * 14)}px`,
              "--ty": `${-30 - i * 8}px`,
              animation: `lvl-particle 0.9s ease-out ${0.15 + i * 0.07}s forwards`,
              opacity: 0,
            }}
          >
            {emoji}
          </span>
        ))}

        {/* Card */}
        <div
          className="relative flex items-center gap-3 md:gap-4 px-5 py-3 md:px-7 md:py-4 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #f97316 100%)",
            border: "3px solid rgba(255,255,255,0.3)",
            boxShadow: "0 8px 32px rgba(245,158,11,0.5), 0 2px 8px rgba(0,0,0,0.2)",
            minWidth: "clamp(200px, 50vw, 360px)",
          }}
        >
          {/* Shine sweep */}
          <div
            className="absolute top-0 bottom-0 w-16 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
              animation: "lvl-shine 1.2s ease-in-out 0.3s forwards",
            }}
          />

          {/* Badge */}
          <div
            className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl shadow-inner"
            style={{
              background: "rgba(255,255,255,0.25)",
              animation: "lvl-badge-pop 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both",
            }}
          >
            🏆
          </div>

          {/* Text */}
          <div className="flex flex-col leading-tight">
            <span
              className="text-white font-black uppercase tracking-widest"
              style={{ fontSize: "clamp(9px, 2vw, 11px)", opacity: 0.85 }}
            >
              {t("gameMenu.levelUp") || "Level up!"}
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className="text-white font-black"
                style={{
                  fontSize: "clamp(18px, 5vw, 28px)",
                  textShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  animation: "lvl-number-count 0.4s ease-out 0.25s both",
                }}
              >
                {t("gameMenu.level") || "Level"} {level}
              </span>
              <span style={{ fontSize: "clamp(14px, 3vw, 20px)" }}>🎉</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

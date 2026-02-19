import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const CORRECT_PARTICLES = ["🎉", "⭐", "✨", "🌟", "💛", "🎊"]
const INCORRECT_PARTICLES = ["💪", "🦊", "✨", "🌀", "💫", "🔥"]

const CONFIG = {
  correct: {
    emoji: "🎉",
    gradient: "linear-gradient(135deg, #bbf7d0 0%, #86efac 50%, #4ade80 100%)",
    border: "rgba(74,222,128,0.6)",
    glow: "rgba(74,222,128,0.4)",
    titleColor: "#15803d",
    textColor: "#166534",
    particles: CORRECT_PARTICLES,
    ring: "#86efac",
  },
  incorrect: {
    emoji: "🦊",
    gradient: "linear-gradient(135deg, #fed7aa 0%, #fdba74 50%, #fb923c 100%)",
    border: "rgba(251,146,60,0.6)",
    glow: "rgba(251,146,60,0.4)",
    titleColor: "#c2410c",
    textColor: "#9a3412",
    particles: INCORRECT_PARTICLES,
    ring: "#fdba74",
  },
}

export default function FeedbackModal({ type }) {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (type) {
      setShow(false)
      requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
    } else {
      setShow(false)
    }
  }, [type])

  if (!type) return null

  const cfg = CONFIG[type]
  const titleKey = `feedbackModal.${type}.title`
  const textKey  = `feedbackModal.${type}.text`

  return (
    <>
      <style>{`
        @keyframes fb-backdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fb-card-in {
          0%   { opacity: 0; transform: scale(0.5) rotate(-6deg); }
          65%  { transform: scale(1.08) rotate(2deg); opacity: 1; }
          82%  { transform: scale(0.96) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fb-emoji-pop {
          0%   { transform: scale(0) rotate(-20deg); }
          60%  { transform: scale(1.3) rotate(8deg); }
          80%  { transform: scale(0.9) rotate(-4deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes fb-text-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fb-particle {
          0%   { opacity: 1; transform: translate(0,0) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.2) rotate(var(--tr)); }
        }
        @keyframes fb-ring-pulse {
          0%   { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes fb-shine {
          from { left: -80%; }
          to   { left: 130%; }
        }
        @keyframes fb-wobble {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25%  { transform: rotate(-8deg) scale(1.05); }
          75%  { transform: rotate(8deg) scale(1.05); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          animation: "fb-backdrop 0.2s ease forwards",
        }}
      >
        {/* Card */}
        <div
          className="relative overflow-hidden text-center"
          style={{
            background: cfg.gradient,
            border: `3px solid ${cfg.border}`,
            borderRadius: "28px",
            boxShadow: `0 0 0 6px ${cfg.glow}, 0 24px 60px rgba(0,0,0,0.25)`,
            padding: "clamp(28px, 6vw, 52px) clamp(24px, 5vw, 48px)",
            maxWidth: "clamp(280px, 85vw, 400px)",
            width: "100%",
            animation: show ? "fb-card-in 0.55s cubic-bezier(0.22,1,0.36,1) forwards" : "none",
          }}
        >
          {/* Shine sweep */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              width: "40%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              animation: "fb-shine 0.9s ease-out 0.3s forwards",
            }}
          />

          {/* Pulse ring behind emoji */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "clamp(32px, 8vw, 52px)",
              left: "50%",
              transform: "translateX(-50%)",
              width: "clamp(72px, 18vw, 96px)",
              height: "clamp(72px, 18vw, 96px)",
              borderRadius: "50%",
              border: `3px solid ${cfg.ring}`,
              animation: "fb-ring-pulse 0.7s ease-out 0.15s forwards",
              opacity: 0,
            }}
          />

          {/* Particles */}
          {cfg.particles.map((p, i) => {
            const angle = (i / cfg.particles.length) * 360
            const dist = 80 + Math.random() * 50
            const tx = Math.cos((angle * Math.PI) / 180) * dist
            const ty = Math.sin((angle * Math.PI) / 180) * dist - 30
            const tr = (Math.random() - 0.5) * 360
            return (
              <span
                key={i}
                className="absolute pointer-events-none select-none"
                style={{
                  top: "clamp(44px, 10vw, 64px)",
                  left: "50%",
                  fontSize: "clamp(14px, 3.5vw, 20px)",
                  "--tx": `${tx}px`,
                  "--ty": `${ty}px`,
                  "--tr": `${tr}deg`,
                  animation: `fb-particle 0.8s ease-out ${0.1 + i * 0.06}s forwards`,
                  opacity: 0,
                }}
              >
                {p}
              </span>
            )
          })}

          {/* Emoji */}
          <div
            className="relative inline-flex items-center justify-center rounded-full mb-4 shadow-lg"
            style={{
              width: "clamp(72px, 18vw, 96px)",
              height: "clamp(72px, 18vw, 96px)",
              background: "rgba(255,255,255,0.5)",
              border: "3px solid rgba(255,255,255,0.8)",
              animation: "fb-emoji-pop 0.55s cubic-bezier(0.22,1,0.36,1) 0.1s both",
            }}
          >
            <span
              style={{
                fontSize: "clamp(32px, 9vw, 52px)",
                animation: type === "correct"
                  ? "fb-wobble 0.6s ease-in-out 0.5s 2 both"
                  : "none",
              }}
            >
              {cfg.emoji}
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-black leading-tight mb-2"
            style={{
              fontSize: "clamp(22px, 6vw, 32px)",
              color: cfg.titleColor,
              textShadow: "0 1px 3px rgba(255,255,255,0.6)",
              animation: "fb-text-rise 0.4s ease-out 0.25s both",
            }}
          >
            {t(titleKey)}
          </h3>

          {/* Message */}
          <p
            className="font-bold leading-snug"
            style={{
              fontSize: "clamp(14px, 3.5vw, 18px)",
              color: cfg.textColor,
              animation: "fb-text-rise 0.4s ease-out 0.35s both",
            }}
          >
            {t(textKey)}
          </p>
        </div>
      </div>
    </>
  )
}

import React from "react"

const BG_EMOJIS = [
  { emoji: "⭐", top: "6%",  left: "3%",  size: "clamp(18px,3vw,28px)",   delay: "0s",   dur: "4s"   },
  { emoji: "🌈", top: "12%", left: "88%", size: "clamp(20px,3.5vw,32px)", delay: "0.6s", dur: "5s"   },
  { emoji: "✨", top: "70%", left: "2%",  size: "clamp(16px,2.5vw,22px)", delay: "1s",   dur: "3.5s" },
  { emoji: "🎈", top: "78%", left: "91%", size: "clamp(18px,3vw,30px)",   delay: "0.8s", dur: "4.5s" },
  { emoji: "🌟", top: "44%", left: "93%", size: "clamp(16px,2.5vw,24px)", delay: "1.5s", dur: "4s"   },
  { emoji: "💫", top: "52%", left: "1%",  size: "clamp(14px,2vw,20px)",   delay: "0.3s", dur: "3s"   },
  { emoji: "🎉", top: "26%", left: "95%", size: "clamp(16px,2.5vw,26px)", delay: "2s",   dur: "5s"   },
]

export default function FloatingBgEmojis() {
  return (
    <>
      <style>{`
        @keyframes fbg-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%  { transform: translateY(-14px) rotate(4deg); }
          66%  { transform: translateY(-7px) rotate(-3deg); }
        }
      `}</style>
      {BG_EMOJIS.map((b, i) => (
        <span
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            top: b.top, left: b.left,
            fontSize: b.size,
            opacity: 0.18,
            animation: `fbg-float ${b.dur} ease-in-out ${b.delay} infinite`,
            zIndex: 0,
          }}
        >
          {b.emoji}
        </span>
      ))}
    </>
  )
}

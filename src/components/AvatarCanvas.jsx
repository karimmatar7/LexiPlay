import React from "react"
import { SKIN_TONES, AVATAR_PARTS } from "../data/avatarParts"

const EYE_SHAPES = {
  normal:  <><circle cx="36" cy="52" r="5" fill="#333"/><circle cx="64" cy="52" r="5" fill="#333"/><circle cx="38" cy="50" r="2" fill="white"/><circle cx="66" cy="50" r="2" fill="white"/></>,
  happy:   <><path d="M31 52 Q36 46 41 52" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/><path d="M59 52 Q64 46 69 52" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/></>,
  cool:    <><rect x="28" y="48" width="16" height="8" rx="4" fill="#333"/><rect x="56" y="48" width="16" height="8" rx="4" fill="#333"/><line x1="44" y1="52" x2="56" y2="52" stroke="#333" strokeWidth="2"/></>,
  sleepy:  <><path d="M31 50 Q36 56 41 50" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/><path d="M59 50 Q64 56 69 50" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/></>,
  star:    <><text x="28" y="58" fontSize="16">⭐</text><text x="56" y="58" fontSize="16">⭐</text></>,
  wink:    <><path d="M31 52 Q36 46 41 52" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/><line x1="59" y1="50" x2="69" y2="54" stroke="#333" strokeWidth="3" strokeLinecap="round"/></>,
}

const MOUTH_SHAPES = {
  smile:   <path d="M36 70 Q50 82 64 70" fill="none" stroke="#c0524f" strokeWidth="3" strokeLinecap="round"/>,
  grin:    <path d="M34 69 Q50 85 66 69" fill="#c0524f" stroke="#a03a38" strokeWidth="2"/>,
  tongue:  <><path d="M36 70 Q50 82 64 70" fill="#c0524f" stroke="#a03a38" strokeWidth="2"/><ellipse cx="50" cy="78" rx="8" ry="6" fill="#e87070"/></>,
  cool:    <path d="M38 72 Q50 76 62 72" fill="none" stroke="#c0524f" strokeWidth="3" strokeLinecap="round"/>,
  open:    <ellipse cx="50" cy="74" rx="12" ry="8" fill="#c0524f"/>,
}

const HAIR_PATHS = {
  short:  <path d="M18 45 Q20 15 50 12 Q80 15 82 45 Q70 25 50 24 Q30 25 18 45Z" fill="#3D2314"/>,
  long:   <><path d="M18 45 Q20 15 50 12 Q80 15 82 45 Q70 25 50 24 Q30 25 18 45Z" fill="#3D2314"/><path d="M18 45 Q10 70 14 100" fill="none" stroke="#3D2314" strokeWidth="12" strokeLinecap="round"/><path d="M82 45 Q90 70 86 100" fill="none" stroke="#3D2314" strokeWidth="12" strokeLinecap="round"/></>,
  curly:  <><path d="M18 45 Q20 15 50 12 Q80 15 82 45 Q70 22 50 20 Q30 22 18 45Z" fill="#6B3A2A"/><circle cx="22" cy="38" r="8" fill="#6B3A2A"/><circle cx="30" cy="22" r="9" fill="#6B3A2A"/><circle cx="50" cy="14" r="9" fill="#6B3A2A"/><circle cx="70" cy="22" r="9" fill="#6B3A2A"/><circle cx="78" cy="38" r="8" fill="#6B3A2A"/></>,
  bun:    <><path d="M18 48 Q20 18 50 15 Q80 18 82 48 Q70 28 50 27 Q30 28 18 48Z" fill="#3D2314"/><circle cx="50" cy="10" r="12" fill="#3D2314"/></>,
  cap:    <><rect x="20" y="38" width="60" height="16" rx="4" fill="#ef4444"/><rect x="14" y="50" width="72" height="8" rx="4" fill="#dc2626"/><rect x="38" y="30" width="24" height="18" rx="4" fill="#ef4444"/></>,
  crown:  <><path d="M22 50 L30 25 L50 38 L70 25 L78 50Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/><circle cx="30" cy="26" r="5" fill="#ef4444"/><circle cx="50" cy="18" r="5" fill="#a855f7"/><circle cx="70" cy="26" r="5" fill="#3b82f6"/></>,
  none:   null,
}

const ACCESSORY_LAYER = {
  none:    null,
  glasses: <><rect x="26" y="47" width="18" height="12" rx="6" fill="none" stroke="#333" strokeWidth="3"/><rect x="56" y="47" width="18" height="12" rx="6" fill="none" stroke="#333" strokeWidth="3"/><line x1="44" y1="53" x2="56" y2="53" stroke="#333" strokeWidth="2"/><line x1="20" y1="53" x2="26" y2="53" stroke="#333" strokeWidth="2"/><line x1="74" y1="53" x2="80" y2="53" stroke="#333" strokeWidth="2"/></>,
  bow:     <><path d="M38 25 Q50 32 62 25 Q50 18 38 25Z" fill="#ec4899"/><path d="M38 25 Q50 18 62 25 Q50 32 38 25Z" fill="#f472b6"/><circle cx="50" cy="25" r="5" fill="#be185d"/></>,
  flower:  <><circle cx="50" cy="20" r="6" fill="#fbbf24"/><circle cx="38" cy="22" r="5" fill="#f9a8d4"/><circle cx="43" cy="12" r="5" fill="#f9a8d4"/><circle cx="57" cy="12" r="5" fill="#f9a8d4"/><circle cx="62" cy="22" r="5" fill="#f9a8d4"/></>,
  horn:    <path d="M50 0 L44 22 L56 22Z" fill="#c084fc" stroke="#a855f7" strokeWidth="1"/>,
  halo:    <ellipse cx="50" cy="12" rx="22" ry="7" fill="none" stroke="#fbbf24" strokeWidth="4" opacity="0.85"/>,
  mask:    <path d="M30 60 Q50 90 70 60 Q60 70 50 68 Q40 70 30 60Z" fill="#dc2626"/>,
}

const OUTFIT_LAYER = {
  tshirt:    <><path d="M20 100 L10 78 L30 72 L50 80 L70 72 L90 78 L80 100Z" fill="#6366f1"/><path d="M30 72 L20 62 L50 58 L80 62 L70 72 L50 80Z" fill="#818cf8"/></>,
  hoodie:    <><path d="M20 100 L10 76 L28 68 L50 76 L72 68 L90 76 L80 100Z" fill="#374151"/><path d="M28 68 L22 58 L50 54 L78 58 L72 68 L50 76Z" fill="#4b5563"/><path d="M38 54 Q50 72 62 54" fill="none" stroke="#9ca3af" strokeWidth="2"/></>,
  suit:      <><path d="M20 100 L12 76 L32 68 L50 80 L68 68 L88 76 L80 100Z" fill="#1e293b"/><path d="M32 68 L44 56 L50 68 L56 56 L68 68 L50 80Z" fill="#334155"/><rect x="46" y="60" width="8" height="28" fill="white" rx="2"/><path d="M44 56 L50 80" stroke="#e2e8f0" strokeWidth="1"/><path d="M56 56 L50 80" stroke="#e2e8f0" strokeWidth="1"/></>,
  dress:     <><path d="M32 70 Q20 80 18 100 L82 100 Q80 80 68 70 L60 100 L50 78 L40 100Z" fill="#f472b6"/><path d="M32 70 L50 78 L68 70 L60 58 L50 62 L40 58Z" fill="#ec4899"/></>,
  wizard:    <><path d="M20 100 L14 76 L30 70 L50 78 L70 70 L86 76 L80 100Z" fill="#4c1d95"/><path d="M30 70 L24 58 L50 54 L76 58 L70 70 L50 78Z" fill="#5b21b6"/><path d="M38 54 Q50 70 62 54" fill="none" stroke="#fbbf24" strokeWidth="2"/><circle cx="50" cy="54" r="4" fill="#fbbf24"/></>,
  ninja:     <><path d="M20 100 L12 74 L28 66 L50 74 L72 66 L88 74 L80 100Z" fill="#111827"/><path d="M28 66 L50 74 L72 66 L60 54 L40 54Z" fill="#1f2937"/><rect x="20" y="62" width="60" height="10" rx="3" fill="#111827"/></>,
  astronaut: <><path d="M18 100 L12 74 L26 66 L50 72 L74 66 L88 74 L82 100Z" fill="#cbd5e1"/><path d="M26 66 L50 72 L74 66 L66 54 L34 54Z" fill="#94a3b8"/><rect x="40" y="72" width="20" height="14" rx="3" fill="#60a5fa"/></>,
}

export default function AvatarCanvas({ avatar, size = 120, animated = false }) {
  const skin = SKIN_TONES[avatar.skin] || SKIN_TONES.light
  const bg   = AVATAR_PARTS.bg.find(b => b.id === avatar.bg)?.color || AVATAR_PARTS.bg[0].color

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        ...(animated ? { animation: "avatar-idle 3s ease-in-out infinite" } : {}),
      }}
    >
      {animated && (
        <style>{`
          @keyframes avatar-idle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
        `}</style>
      )}

      {/* Background */}
      <defs>
        <linearGradient id={`bg-${avatar.bg}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {bg.includes("135deg") && (() => {
            const stops = bg.match(/#[a-f0-9]{6}/gi) || []
            return stops.map((c, i) => (
              <stop key={i} offset={i === 0 ? "0%" : "100%"} stopColor={c} />
            ))
          })()}
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#bg-${avatar.bg})`} />

      {/* Outfit (behind body) */}
      {OUTFIT_LAYER[avatar.outfit]}

      {/* Neck */}
      <rect x="42" y="85" width="16" height="14" rx="4" fill={skin.face} />

      {/* Face */}
      <ellipse cx="50" cy="55" rx="32" ry="34" fill={skin.face} />

      {/* Cheeks */}
      <ellipse cx="26" cy="65" rx="8" ry="5" fill={skin.cheek} opacity="0.4" />
      <ellipse cx="74" cy="65" rx="8" ry="5" fill={skin.cheek} opacity="0.4" />

      {/* Hair (behind face top) */}
      {HAIR_PATHS[avatar.hair]}

      {/* Eyes */}
      {EYE_SHAPES[avatar.eyes]}

      {/* Mouth */}
      {MOUTH_SHAPES[avatar.mouth]}

      {/* Accessory */}
      {ACCESSORY_LAYER[avatar.accessory]}
    </svg>
  )
}

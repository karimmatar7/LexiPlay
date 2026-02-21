import React from "react"
import { SKIN_TONES, AVATAR_PARTS } from "../data/avatarParts"

// ─────────────────────────────────────────────────────────────
// PRO FULL-BODY AVATAR (same AvatarCanvas API)
// - fullBody toggle (default true)
// - gender-specific face/body
// - connected body (no gaps)
// - modern lashes / brows (no weird pasted look)
// viewBox full body: 0 0 100 220
// viewBox head only : 0 0 100 100
// ─────────────────────────────────────────────────────────────

// helpers
function mix(hexA, hexB, t = 0.5) {
  const a = parseInt(hexA.slice(1), 16)
  const b = parseInt(hexB.slice(1), 16)
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `rgb(${r},${g},${bl})`
}
function darken(hex, pct) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - pct)
  const g = Math.max(0, ((n >> 8) & 255) - pct)
  const b = Math.max(0, (n & 255) - pct)
  return `rgb(${r},${g},${b})`
}
function lighten(hex, pct) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, (n >> 16) + pct)
  const g = Math.min(255, ((n >> 8) & 255) + pct)
  const b = Math.min(255, (n & 255) + pct)
  return `rgb(${r},${g},${b})`
}

// ── DEFINITIONS (shared) ──────────────────────────────────────
function SharedDefs({ avatar, skin, bg }) {
  const stops = bg.match(/#[a-f0-9]{6}/gi) || ["#bae6fd", "#e0f2fe"]
  const blush = mix(skin.face, "#ff6b6b", 0.20)

  return (
    <defs>
      <linearGradient id={`bg-${avatar.bg}`} x1="0%" y1="0%" x2="100%" y2="100%">
        {stops.map((c, i) => (
          <stop key={i} offset={i === 0 ? "0%" : "100%"} stopColor={c} />
        ))}
      </linearGradient>

      {/* face shading */}
      <radialGradient id="g-face" cx="42%" cy="36%" r="70%">
        <stop offset="0%" stopColor={lighten(skin.face, 16)} />
        <stop offset="62%" stopColor={skin.face} />
        <stop offset="100%" stopColor={darken(skin.face, 14)} />
      </radialGradient>

      {/* skin for neck/hands */}
      <linearGradient id="g-skin" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={darken(skin.face, 14)} />
        <stop offset="45%" stopColor={skin.face} />
        <stop offset="100%" stopColor={darken(skin.face, 20)} />
      </linearGradient>

      {/* blush */}
      <radialGradient id="g-blush" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor={blush} stopOpacity="0.28" />
        <stop offset="100%" stopColor={blush} stopOpacity="0" />
      </radialGradient>

      {/* ground shadow */}
      <radialGradient id="g-ground" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#00000024" />
        <stop offset="100%" stopColor="#00000000" />
      </radialGradient>
    </defs>
  )
}

// ── BROWS (lifted for female, softer for male) ────────────────
const BROWS = {
  male: (
    <>
      <path d="M28 43.3 Q36 39.8 44 42.8" fill="none" stroke="#2d1a0e" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
      <path d="M56 42.8 Q64 39.8 72 43.3" fill="none" stroke="#2d1a0e" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
    </>
  ),
  female: (
    <>
      <path d="M29 41.0 Q36 37.8 43 40.6" fill="none" stroke="#2d1a0e" strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />
      <path d="M57 40.6 Q64 37.8 71 41.0" fill="none" stroke="#2d1a0e" strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />
    </>
  ),
}

// ── EYES (same keys, with lashes applied cleanly) ─────────────
const EYE_SHAPES = {
  normal: {
    male: (
      <>
        <circle cx="36" cy="52" r="5" fill="white" />
        <circle cx="36" cy="52" r="3.5" fill="#2d1a0e" />
        <circle cx="64" cy="52" r="5" fill="white" />
        <circle cx="64" cy="52" r="3.5" fill="#2d1a0e" />
        <circle cx="37.4" cy="50.6" r="1.3" fill="white" opacity="0.95" />
        <circle cx="65.4" cy="50.6" r="1.3" fill="white" opacity="0.95" />
        <ellipse cx="36" cy="55" rx="5" ry="1.3" fill="black" opacity="0.06" />
        <ellipse cx="64" cy="55" rx="5" ry="1.3" fill="black" opacity="0.06" />
      </>
    ),
    female: (
      <>
        <circle cx="36" cy="52" r="5" fill="white" />
        <circle cx="36" cy="52" r="3.5" fill="#2d1a0e" />
        <circle cx="64" cy="52" r="5" fill="white" />
        <circle cx="64" cy="52" r="3.5" fill="#2d1a0e" />
        <circle cx="37.4" cy="50.6" r="1.3" fill="white" opacity="0.95" />
        <circle cx="65.4" cy="50.6" r="1.3" fill="white" opacity="0.95" />
        <ellipse cx="36" cy="55" rx="5" ry="1.3" fill="black" opacity="0.06" />
        <ellipse cx="64" cy="55" rx="5" ry="1.3" fill="black" opacity="0.06" />
      </>
    ),
  },

  happy: {
    male: (
      <>
        <path d="M31 52 Q36 46 41 52" fill="none" stroke="#2d1a0e" strokeWidth="3" strokeLinecap="round" />
        <path d="M59 52 Q64 46 69 52" fill="none" stroke="#2d1a0e" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
    female: (
      <>
        <path d="M31 52 Q36 46 41 52" fill="none" stroke="#2d1a0e" strokeWidth="3" strokeLinecap="round" />
        <path d="M59 52 Q64 46 69 52" fill="none" stroke="#2d1a0e" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },

  cool: {
    male: (
      <>
        <rect x="28" y="48" width="16" height="8" rx="4" fill="#1a1a1a" />
        <rect x="56" y="48" width="16" height="8" rx="4" fill="#1a1a1a" />
        <line x1="44" y1="52" x2="56" y2="52" stroke="#1a1a1a" strokeWidth="2" />
      </>
    ),
    female: (
      <>
        <rect x="28" y="48" width="16" height="8" rx="4" fill="#1a1a1a" />
        <rect x="56" y="48" width="16" height="8" rx="4" fill="#1a1a1a" />
        <line x1="44" y1="52" x2="56" y2="52" stroke="#1a1a1a" strokeWidth="2" />
      </>
    ),
  },

  sleepy: {
    male: (
      <>
        <path d="M31 50 Q36 56 41 50" fill="none" stroke="#2d1a0e" strokeWidth="3" strokeLinecap="round" />
        <path d="M59 50 Q64 56 69 50" fill="none" stroke="#2d1a0e" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
    female: (
      <>
        <path d="M31 50 Q36 56 41 50" fill="none" stroke="#2d1a0e" strokeWidth="3" strokeLinecap="round" />
        <path d="M59 50 Q64 56 69 50" fill="none" stroke="#2d1a0e" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },

  star: {
    male: (
      <>
        <text x="28" y="58" fontSize="16">⭐</text>
        <text x="56" y="58" fontSize="16">⭐</text>
      </>
    ),
    female: (
      <>
        <text x="28" y="58" fontSize="16">⭐</text>
        <text x="56" y="58" fontSize="16">⭐</text>
      </>
    ),
  },

  wink: {
    male: (
      <>
        <path d="M31 52 Q36 46 41 52" fill="none" stroke="#2d1a0e" strokeWidth="3" strokeLinecap="round" />
        <line x1="59" y1="50" x2="69" y2="54" stroke="#2d1a0e" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
    female: (
      <>
        <path d="M31 52 Q36 46 41 52" fill="none" stroke="#2d1a0e" strokeWidth="3" strokeLinecap="round" />
        <line x1="59" y1="50" x2="69" y2="54" stroke="#2d1a0e" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
}

// ── MOUTH (same keys) ─────────────────────────────────────────
const MOUTH_SHAPES = {
  smile: {
    male: <path d="M36 70 Q50 82 64 70" fill="none" stroke="#a03a38" strokeWidth="3" strokeLinecap="round" />,
    female: <path d="M36 70 Q50 82 64 70" fill="none" stroke="#b03030" strokeWidth="2.6" strokeLinecap="round" />,
  },
  grin: {
    male: <path d="M34 69 Q50 85 66 69" fill="#c0524f" stroke="#7d2b21" strokeWidth="2" />,
    female: <path d="M34 69 Q50 85 66 69" fill="#c0524f" stroke="#a03a38" strokeWidth="2" />,
  },
  tongue: {
    male: (
      <>
        <path d="M36 70 Q50 82 64 70" fill="#c0524f" stroke="#7d2b21" strokeWidth="2" />
        <ellipse cx="50" cy="78" rx="8" ry="6" fill="#e87070" />
      </>
    ),
    female: (
      <>
        <path d="M36 70 Q50 82 64 70" fill="#c0524f" stroke="#a03a38" strokeWidth="2" />
        <ellipse cx="50" cy="78" rx="8" ry="6" fill="#f09090" />
      </>
    ),
  },
  cool: {
    male: <path d="M38 72 Q50 76 62 72" fill="none" stroke="#a03a38" strokeWidth="3" strokeLinecap="round" />,
    female: <path d="M38 72 Q50 76 62 72" fill="none" stroke="#b03030" strokeWidth="2.6" strokeLinecap="round" />,
  },
  open: {
    male: <ellipse cx="50" cy="74" rx="12" ry="8" fill="#a03a38" />,
    female: <ellipse cx="50" cy="74" rx="12" ry="8" fill="#b03030" />,
  },
}

// ── HAIR (same keys) ──────────────────────────────────────────
const HAIR_PATHS = {
  short: <path d="M18 45 Q20 15 50 12 Q80 15 82 45 Q70 25 50 24 Q30 25 18 45Z" fill="#3D2314" />,
  long: (
    <>
      <path d="M18 45 Q20 15 50 12 Q80 15 82 45 Q70 25 50 24 Q30 25 18 45Z" fill="#3D2314" />
      <path d="M18 45 Q10 70 14 106" fill="none" stroke="#3D2314" strokeWidth="12" strokeLinecap="round" />
      <path d="M82 45 Q90 70 86 106" fill="none" stroke="#3D2314" strokeWidth="12" strokeLinecap="round" />
    </>
  ),
  curly: (
    <>
      <path d="M18 45 Q20 15 50 12 Q80 15 82 45 Q70 22 50 20 Q30 22 18 45Z" fill="#6B3A2A" />
      <circle cx="22" cy="38" r="8" fill="#6B3A2A" />
      <circle cx="30" cy="22" r="9" fill="#6B3A2A" />
      <circle cx="50" cy="14" r="9" fill="#6B3A2A" />
      <circle cx="70" cy="22" r="9" fill="#6B3A2A" />
      <circle cx="78" cy="38" r="8" fill="#6B3A2A" />
    </>
  ),
  bun: (
    <>
      <path d="M18 48 Q20 18 50 15 Q80 18 82 48 Q70 28 50 27 Q30 28 18 48Z" fill="#3D2314" />
      <circle cx="50" cy="10" r="12" fill="#3D2314" />
    </>
  ),
  cap: (
    <>
      <rect x="20" y="38" width="60" height="16" rx="4" fill="#ef4444" />
      <rect x="14" y="50" width="72" height="8" rx="4" fill="#dc2626" />
      <rect x="38" y="30" width="24" height="18" rx="4" fill="#ef4444" />
    </>
  ),
  crown: (
    <>
      <path d="M22 50 L30 25 L50 38 L70 25 L78 50Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="30" cy="26" r="5" fill="#ef4444" />
      <circle cx="50" cy="18" r="5" fill="#a855f7" />
      <circle cx="70" cy="26" r="5" fill="#3b82f6" />
    </>
  ),
  none: null,
}

// ── ACCESSORIES (same keys) ───────────────────────────────────
const ACCESSORY_LAYER = {
  none: null,
  glasses: (
    <>
      <rect x="26" y="47" width="18" height="12" rx="6" fill="none" stroke="#333" strokeWidth="3" />
      <rect x="56" y="47" width="18" height="12" rx="6" fill="none" stroke="#333" strokeWidth="3" />
      <line x1="44" y1="53" x2="56" y2="53" stroke="#333" strokeWidth="2" />
      <line x1="20" y1="53" x2="26" y2="53" stroke="#333" strokeWidth="2" />
      <line x1="74" y1="53" x2="80" y2="53" stroke="#333" strokeWidth="2" />
    </>
  ),
  bow: (
    <>
      <path d="M38 25 Q50 32 62 25 Q50 18 38 25Z" fill="#ec4899" />
      <path d="M38 25 Q50 18 62 25 Q50 32 38 25Z" fill="#f472b6" />
      <circle cx="50" cy="25" r="5" fill="#be185d" />
    </>
  ),
  flower: (
    <>
      <circle cx="50" cy="20" r="6" fill="#fbbf24" />
      <circle cx="38" cy="22" r="5" fill="#f9a8d4" />
      <circle cx="43" cy="12" r="5" fill="#f9a8d4" />
      <circle cx="57" cy="12" r="5" fill="#f9a8d4" />
      <circle cx="62" cy="22" r="5" fill="#f9a8d4" />
    </>
  ),
  horn: <path d="M50 0 L44 22 L56 22Z" fill="#c084fc" stroke="#a855f7" strokeWidth="1" />,
  halo: <ellipse cx="50" cy="12" rx="22" ry="7" fill="none" stroke="#fbbf24" strokeWidth="4" opacity="0.85" />,
  mask: <path d="M30 60 Q50 90 70 60 Q60 70 50 68 Q40 70 30 60Z" fill="#dc2626" />,
}

// ── CONNECTED LEGS (start higher, overlap into outfit) ────────
function LegsFull({ gender }) {
  if (gender === "female") {
    return (
      <>
        {/* legs start at 160 and overlap into outfit by a few px */}
        <rect x="31" y="160" width="14" height="48" rx="6" fill={mix("#fecdd3", "#fb7185", 0.30)} />
        <rect x="55" y="160" width="14" height="48" rx="6" fill={mix("#fecdd3", "#fb7185", 0.30)} />

        {/* heels */}
        <path d="M28 206 Q38 214 46 208 L46 212 Q38 218 28 212Z" fill="#e11d48" />
        <rect x="40" y="206" width="4" height="10" rx="1.2" fill="#9f1239" />
        <path d="M54 208 Q64 214 72 206 L72 212 Q64 218 54 212Z" fill="#e11d48" />
        <rect x="62" y="206" width="4" height="10" rx="1.2" fill="#9f1239" />
      </>
    )
  }

  return (
    <>
      <rect x="30" y="160" width="16" height="50" rx="7" fill="#1e293b" />
      <rect x="54" y="160" width="16" height="50" rx="7" fill="#1e293b" />
      <ellipse cx="38" cy="212" rx="10" ry="5.5" fill="#111827" />
      <ellipse cx="62" cy="212" rx="10" ry="5.5" fill="#111827" />
    </>
  )
}

// ── OUTFITS FULL (CONNECTED ARMS/HANDS + OVERLAP) ─────────────
const OUTFITS_FULL = {
  male: {
    tshirt: () => (
      <>
        <path d="M28 98 Q22 102 20 112 L20 156 Q28 160 50 160 Q72 160 80 156 L80 112 Q78 102 72 98 Q64 106 50 106 Q36 106 28 98Z" fill="#6366f1" />
        <path d="M38 98 Q50 108 62 98" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.75" />

        {/* sleeves go down to 160 and hands overlap up to remove gaps */}
        <path d="M20 114 Q10 134 12 160 Q16 166 22 162 Q20 140 28 120Z" fill="#6366f1" />
        <path d="M80 114 Q90 134 88 160 Q84 166 78 162 Q80 140 72 120Z" fill="#6366f1" />

        <circle cx="14" cy="160" r="6.8" fill="url(#g-skin)" />
        <circle cx="86" cy="160" r="6.8" fill="url(#g-skin)" />
      </>
    ),
    hoodie: () => (
      <>
        <path d="M26 96 Q20 102 18 114 L18 160 Q26 164 50 164 Q74 164 82 160 L82 114 Q80 102 74 96 Q66 108 50 108 Q34 108 26 96Z" fill="#374151" />
        <path d="M44 96 Q46 118 44 132" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M56 96 Q54 118 56 132" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="36" y="142" width="28" height="14" rx="4" fill="#111827" opacity="0.30" />

        <path d="M18 118 Q8 142 10 166 Q14 172 20 168 Q18 146 26 124Z" fill="#374151" />
        <path d="M82 118 Q92 142 90 166 Q86 172 80 168 Q82 146 74 124Z" fill="#374151" />

        <circle cx="12" cy="166" r="7.0" fill="url(#g-skin)" />
        <circle cx="88" cy="166" r="7.0" fill="url(#g-skin)" />
      </>
    ),
    suit: () => (
      <>
        <path d="M28 98 Q22 102 20 114 L20 160 Q28 164 50 164 Q72 164 80 160 L80 114 Q78 102 72 98 L62 96 L50 112 L38 96Z" fill="#1e293b" />
        <path d="M38 96 L44 108 L50 100Z" fill="#334155" />
        <path d="M62 96 L56 108 L50 100Z" fill="#334155" />
        <rect x="46" y="102" width="8" height="40" rx="1" fill="white" />
        <path d="M50 104 L47 122 L50 130 L53 122Z" fill="#ef4444" />

        <path d="M20 118 Q10 142 12 166 Q16 172 22 168 Q20 146 28 124Z" fill="#0f172a" />
        <path d="M80 118 Q90 142 88 166 Q84 172 78 168 Q80 146 72 124Z" fill="#0f172a" />

        <rect x="6" y="162" width="14" height="6" rx="3" fill="white" />
        <rect x="80" y="162" width="14" height="6" rx="3" fill="white" />

        <circle cx="12" cy="170" r="6.8" fill="url(#g-skin)" />
        <circle cx="88" cy="170" r="6.8" fill="url(#g-skin)" />
      </>
    ),
    dress: () => (
      <>
        <path d="M34 98 L50 106 L66 98 L62 92 L50 96 L38 92Z" fill="#ec4899" />
        <path d="M34 98 Q18 124 16 170 L84 170 Q82 124 66 98 L50 106Z" fill="#f472b6" />

        <path d="M22 118 Q12 138 16 162 Q20 166 26 162 Q22 144 30 126Z" fill="#ec4899" />
        <path d="M78 118 Q88 138 84 162 Q80 166 74 162 Q78 144 70 126Z" fill="#ec4899" />

        <circle cx="18" cy="168" r="6.4" fill="url(#g-skin)" />
        <circle cx="82" cy="168" r="6.4" fill="url(#g-skin)" />
      </>
    ),
    wizard: () => (
      <>
        <path d="M26 96 Q20 102 18 114 L18 166 Q26 170 50 170 Q74 170 82 166 L82 114 Q80 102 74 96 Q66 108 50 108 Q34 108 26 96Z" fill="#4c1d95" />
        {[[30, 134], [70, 132], [50, 152]].map(([x, y], i) => (
          <text key={i} x={x - 5} y={y + 5} fontSize="10" opacity="0.7">✨</text>
        ))}
        <path d="M42 96 Q50 110 58 96" fill="none" stroke="#fbbf24" strokeWidth="2" />

        <path d="M18 120 Q6 150 10 174 Q14 178 22 174 Q18 154 26 126Z" fill="#3b0764" />
        <path d="M82 120 Q94 150 90 174 Q86 178 78 174 Q82 154 74 126Z" fill="#3b0764" />

        <circle cx="12" cy="180" r="6.8" fill="url(#g-skin)" />
        <circle cx="88" cy="180" r="6.8" fill="url(#g-skin)" />
      </>
    ),
    ninja: () => (
      <>
        <path d="M24 96 Q18 102 16 116 L16 166 Q24 170 50 170 Q76 170 84 166 L84 116 Q82 102 76 96 L50 104Z" fill="#111827" />
        <rect x="16" y="140" width="68" height="7" rx="3" fill="#374151" />

        <path d="M16 120 Q6 146 10 174 Q14 178 20 174 Q16 154 24 126Z" fill="#111827" />
        <path d="M84 120 Q94 146 90 174 Q86 178 80 174 Q84 154 76 126Z" fill="#111827" />

        <circle cx="12" cy="180" r="6.8" fill="url(#g-skin)" />
        <circle cx="88" cy="180" r="6.8" fill="url(#g-skin)" />
      </>
    ),
    astronaut: () => (
      <>
        <path d="M22 96 Q16 104 14 120 L14 172 Q22 176 50 176 Q78 176 86 172 L86 120 Q84 104 78 96 Q70 108 50 108 Q30 108 22 96Z" fill="#cbd5e1" />
        <rect x="38" y="126" width="24" height="18" rx="4" fill="#60a5fa" />
        <circle cx="56" cy="130" r="3.5" fill="#ef4444" />
        <circle cx="56" cy="138" r="3.5" fill="#22c55e" />

        <path d="M14 126 Q4 152 8 176 Q12 180 18 176 Q14 156 22 130Z" fill="#94a3b8" />
        <path d="M86 126 Q96 152 92 176 Q88 180 82 176 Q86 156 78 130Z" fill="#94a3b8" />

        <ellipse cx="10" cy="184" rx="7" ry="5.5" fill="#475569" />
        <ellipse cx="90" cy="184" rx="7" ry="5.5" fill="#475569" />
      </>
    ),
  },

  female: {
    tshirt: () => (
      <>
        <path d="M30 98 Q24 104 22 114 L22 156 Q30 160 50 160 Q70 160 78 156 L78 114 Q76 104 70 98 Q62 106 50 106 Q38 106 30 98Z" fill="#ec4899" />
        <path d="M40 98 Q50 108 60 98" fill="none" stroke="#f9a8d4" strokeWidth="2" opacity="0.75" />

        <path d="M22 116 Q12 136 14 160 Q18 166 24 162 Q22 142 30 124Z" fill="#ec4899" />
        <path d="M78 116 Q88 136 86 160 Q82 166 76 162 Q78 142 70 124Z" fill="#ec4899" />

        <circle cx="16" cy="160" r="6.4" fill="url(#g-skin)" />
        <circle cx="84" cy="160" r="6.4" fill="url(#g-skin)" />
      </>
    ),
    hoodie: () => (
      <>
        <path d="M28 96 Q22 104 20 116 L20 162 Q28 166 50 166 Q72 166 80 162 L80 116 Q78 104 72 96 Q64 110 50 110 Q36 110 28 96Z" fill="#7c3aed" />
        <path d="M44 96 Q46 118 44 132" fill="none" stroke="#ddd6fe" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
        <path d="M56 96 Q54 118 56 132" fill="none" stroke="#ddd6fe" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
        <rect x="37" y="144" width="26" height="13" rx="4" fill="#4c1d95" opacity="0.28" />

        <path d="M20 120 Q10 146 12 170 Q16 174 22 170 Q20 150 28 126Z" fill="#7c3aed" />
        <path d="M80 120 Q90 146 88 170 Q84 174 78 170 Q80 150 72 126Z" fill="#7c3aed" />

        <circle cx="14" cy="172" r="6.6" fill="url(#g-skin)" />
        <circle cx="86" cy="172" r="6.6" fill="url(#g-skin)" />
      </>
    ),
    suit: () => (
      <>
        <path d="M30 98 Q24 104 22 116 L22 162 Q30 166 50 166 Q70 166 78 162 L78 116 Q76 104 70 98 L62 96 L50 112 L38 96Z" fill="#1e293b" />
        <path d="M38 96 L44 108 L50 100Z" fill="#334155" />
        <path d="M62 96 L56 108 L50 100Z" fill="#334155" />
        <rect x="47" y="102" width="6" height="40" rx="1" fill="white" />
        <path d="M44 106 Q50 110 56 106 Q50 102 44 106Z" fill="#ec4899" />
        <path d="M44 106 Q50 102 56 106 Q50 110 44 106Z" fill="#f472b6" />
        <circle cx="50" cy="106" r="2" fill="#be185d" />

        <path d="M22 120 Q12 146 14 170 Q18 174 24 170 Q22 150 30 126Z" fill="#0f172a" />
        <path d="M78 120 Q88 146 86 170 Q82 174 76 170 Q78 150 70 126Z" fill="#0f172a" />

        <rect x="6" y="162" width="14" height="6" rx="3" fill="white" />
        <rect x="80" y="162" width="14" height="6" rx="3" fill="white" />

        <circle cx="14" cy="172" r="6.4" fill="url(#g-skin)" />
        <circle cx="86" cy="172" r="6.4" fill="url(#g-skin)" />
      </>
    ),
    dress: () => (
      <>
        <path d="M36 98 L50 106 L64 98 L60 92 L50 96 L40 92Z" fill="#c026d3" />
        <path d="M36 98 Q16 126 14 174 L86 174 Q84 126 64 98 L50 106Z" fill="#e879f9" />

        <path d="M24 120 Q14 140 18 164 Q22 168 28 164 Q24 146 32 128Z" fill="#c026d3" />
        <path d="M76 120 Q86 140 82 164 Q78 168 72 164 Q76 146 68 128Z" fill="#c026d3" />

        <circle cx="20" cy="170" r="6.2" fill="url(#g-skin)" />
        <circle cx="80" cy="170" r="6.2" fill="url(#g-skin)" />
      </>
    ),
    wizard: () => (
      <>
        <path d="M28 96 Q22 104 20 116 L20 168 Q28 172 50 172 Q72 172 80 168 L80 116 Q78 104 72 96 Q64 110 50 110 Q36 110 28 96Z" fill="#6b21a8" />
        {[[30, 136], [70, 134], [50, 154]].map(([x, y], i) => (
          <text key={i} x={x - 5} y={y + 5} fontSize="10" opacity="0.75">✨</text>
        ))}
        <path d="M42 96 Q50 110 58 96" fill="none" stroke="#fbbf24" strokeWidth="2" />

        <path d="M20 122 Q10 150 12 176 Q16 180 22 176 Q20 156 28 130Z" fill="#4a044e" />
        <path d="M80 122 Q90 150 88 176 Q84 180 78 176 Q80 156 72 130Z" fill="#4a044e" />

        <circle cx="14" cy="182" r="6.6" fill="url(#g-skin)" />
        <circle cx="86" cy="182" r="6.6" fill="url(#g-skin)" />
      </>
    ),
    ninja: () => (
      <>
        <path d="M26 96 Q20 104 18 116 L18 168 Q26 172 50 172 Q74 172 82 168 L82 116 Q80 104 74 96 L50 104Z" fill="#2d0050" />
        <rect x="18" y="142" width="64" height="7" rx="3" fill="#3b0067" />
        <text x="46" y="138" fontSize="9" opacity="0.85">🌸</text>

        <path d="M18 122 Q8 146 10 176 Q14 180 20 176 Q18 156 26 130Z" fill="#1a0030" />
        <path d="M82 122 Q92 146 90 176 Q86 180 80 176 Q82 156 74 130Z" fill="#1a0030" />

        <circle cx="12" cy="182" r="6.6" fill="url(#g-skin)" />
        <circle cx="88" cy="182" r="6.6" fill="url(#g-skin)" />
      </>
    ),
    astronaut: () => (
      <>
        <path d="M24 96 Q18 104 16 120 L16 176 Q24 180 50 180 Q76 180 84 176 L84 120 Q82 104 76 96 Q68 110 50 110 Q32 110 24 96Z" fill="#e5e7eb" />
        <rect x="38" y="126" width="24" height="18" rx="4" fill="#93c5fd" />
        <circle cx="56" cy="130" r="3.5" fill="#f472b6" />
        <circle cx="56" cy="138" r="3.5" fill="#34d399" />

        <path d="M16 126 Q6 152 8 176 Q12 180 18 176 Q16 156 24 130Z" fill="#9ca3af" />
        <path d="M84 126 Q94 152 92 176 Q88 180 82 176 Q84 156 76 130Z" fill="#9ca3af" />

        <ellipse cx="10" cy="184" rx="6.5" ry="5" fill="#475569" />
        <ellipse cx="90" cy="184" rx="6.5" ry="5" fill="#475569" />
      </>
    ),
  },
}

// ── HEAD / FACE GROUP ─────────────────────────────────────────
function Head({ avatar, skin, gender }) {
  const eyeKey = avatar.eyes || "normal"
  const mouthKey = avatar.mouth || "smile"

  const eyes = EYE_SHAPES[eyeKey]?.[gender] || EYE_SHAPES.normal.male
  const mouth = MOUTH_SHAPES[mouthKey]?.[gender] || MOUTH_SHAPES.smile.male
  const brows = BROWS[gender] || BROWS.male

  const faceRx = gender === "female" ? 29 : 31
  const faceRy = gender === "female" ? 33 : 34
  const jawY = gender === "female" ? 78 : 80

  return (
    <>
      {HAIR_PATHS[avatar.hair]}

      <ellipse cx="50" cy="55" rx={faceRx} ry={faceRy} fill="url(#g-face)" />
      <ellipse cx="50" cy={jawY} rx="16" ry="3.6" fill="black" opacity="0.06" />

      <ellipse cx="26" cy="65" rx="10" ry="7" fill="url(#g-blush)" />
      <ellipse cx="74" cy="65" rx="10" ry="7" fill="url(#g-blush)" />

      <path
        d="M49 62 Q50 66 51 62"
        fill="none"
        stroke={darken(skin.face, gender === "female" ? 20 : 24)}
        strokeWidth={gender === "female" ? "1.1" : "1.3"}
        strokeLinecap="round"
        opacity="0.55"
      />

      {brows}
      {eyes}
      {mouth}

      {ACCESSORY_LAYER[avatar.accessory]}
    </>
  )
}

// ── COLLAR ONLY (head-mode) ───────────────────────────────────
// Just the top shoulder/neckline strip — no arms, no torso body
const COLLAR_COLORS = {
  tshirt:    { male: "#6366f1", female: "#ec4899" },
  hoodie:    { male: "#374151", female: "#7c3aed" },
  suit:      { male: "#1e293b", female: "#1e293b" },
  dress:     { male: "#ec4899", female: "#c026d3" },
  wizard:    { male: "#4c1d95", female: "#6b21a8" },
  ninja:     { male: "#111827", female: "#2d0050" },
  astronaut: { male: "#cbd5e1", female: "#e5e7eb" },
}

function CollarOnly({ outfit, gender }) {
  const colors = COLLAR_COLORS[outfit] || COLLAR_COLORS.tshirt
  const fill = colors[gender] || colors.male

  // A wide rounded rectangle that sits just below the neck,
  // only the top edge is visible inside the 115-height viewBox
  // The shape starts at y=100 and extends to y=130 (outside viewport = clipped)
  return (
    <>
      {/* Shoulder band */}
      <path
        d={`M10 115 Q10 100 30 97 Q${gender === "female" ? "40 103 50 103" : "38 104 50 104"} Q${gender === "female" ? "60 103 70 97" : "62 104 70 97"} Q90 100 90 115Z`}
        fill={fill}
      />
      {/* Collar highlight */}
      <path
        d={`M30 97 Q50 ${gender === "female" ? "101" : "102"} 70 97`}
        fill="none"
        stroke="white"
        strokeWidth="1.2"
        opacity="0.2"
        strokeLinecap="round"
      />
      {/* Suit lapels */}
      {outfit === "suit" && (
        <>
          <path d={`M44 97 L47 115`} fill="none" stroke="white" strokeWidth="3" opacity="0.9"/>
          <path d={`M56 97 L53 115`} fill="none" stroke="white" strokeWidth="3" opacity="0.9"/>
        </>
      )}
      {/* Hoodie drawstring line */}
      {outfit === "hoodie" && (
        <>
          <path d="M44 98 L44 115" fill="none" stroke="white" strokeWidth="1.2" opacity="0.3" strokeLinecap="round"/>
          <path d="M56 98 L56 115" fill="none" stroke="white" strokeWidth="1.2" opacity="0.3" strokeLinecap="round"/>
        </>
      )}
      {/* Wizard star */}
      {outfit === "wizard" && (
        <text x="44" y="115" fontSize="9" opacity="0.7">✨</text>
      )}
    </>
  )
}


// ── MAIN ──────────────────────────────────────────────────────
export default function AvatarCanvas({
  avatar,
  size = 120,
  animated = false,
  fullBody = true,
}) {
  const skin = SKIN_TONES[avatar.skin] || SKIN_TONES.light
  const bg = AVATAR_PARTS.bg.find((b) => b.id === avatar.bg)?.color || AVATAR_PARTS.bg[0].color

  // accept both "female" and "girl" just in case (safe)
  const gender =
    avatar.gender === "female" || avatar.gender === "girl" ? "female" : "male"

  const OutfitFull =
    OUTFITS_FULL[gender]?.[avatar.outfit] || OUTFITS_FULL.male.tshirt

  if (fullBody) {
    return (
      <svg
        width={size}
        height={size * 2.2}
        viewBox="0 0 100 220"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          borderRadius: "18px",
          overflow: "hidden",
          flexShrink: 0,
          display: "block",
          ...(animated ? { animation: "avatar-idle 3s ease-in-out infinite" } : {}),
        }}
      >
        {animated && (
          <style>{`
            @keyframes avatar-idle {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
          `}</style>
        )}

        <SharedDefs avatar={avatar} skin={skin} bg={bg} />

        <rect width="100" height="220" fill={`url(#bg-${avatar.bg})`} />

        <ellipse cx="50" cy="214" rx="30" ry="6" fill="url(#g-ground)" />

        {/* legs behind */}
        <LegsFull gender={gender} />

        {/* outfit overlaps legs slightly -> removes gap */}
        <OutfitFull skin={skin} />

        {/* neck */}
        <rect
          x={gender === "female" ? 43 : 42}
          y="86"
          width={gender === "female" ? 14 : 16}
          height="16"
          rx="5"
          fill="url(#g-skin)"
        />

        {/* head */}
        <Head avatar={avatar} skin={skin} gender={gender} />
      </svg>
    )
  }

// head only — face + neck + collar strip only, no arms/torso
return (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 115"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      borderRadius: "50%",
      overflow: "hidden",
      flexShrink: 0,
      display: "block",
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

    <SharedDefs avatar={avatar} skin={skin} bg={bg} />
    <rect width="100" height="115" fill={`url(#bg-${avatar.bg})`} />

    {/* LAYER 1 — Face + hair + accessories */}
    <Head avatar={avatar} skin={skin} gender={gender} />

    {/* LAYER 2 — Neck */}
    <rect
      x={gender === "female" ? 43 : 42}
      y="87"
      width={gender === "female" ? 14 : 16}
      height="16"
      rx="5"
      fill="url(#g-skin)"
    />

    {/* LAYER 3 — Collar only: a simple trapezoid that peeks at the bottom */}
    <CollarOnly outfit={avatar.outfit} gender={gender} />
  </svg>
)

}
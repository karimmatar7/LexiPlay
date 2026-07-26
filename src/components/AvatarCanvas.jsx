// src/components/AvatarCanvas.jsx
import React, { useId } from "react";
import {
  SKIN_TONES,
  AVATAR_PARTS,
  DEFAULT_AVATAR,
} from "../data/avatarParts";

const INK = "#26324A";

const OUTFITS = {
  tshirt: { primary: "#5B67E8", secondary: "#AEB8FF", kind: "tshirt" },
  hoodie: { primary: "#7C4DDB", secondary: "#CDB8FF", kind: "hoodie" },
  suit: { primary: "#26324A", secondary: "#F8FAFC", kind: "suit" },
  dress: { primary: "#EF5B9C", secondary: "#FFC5DF", kind: "dress" },
  wizard: { primary: "#6842C2", secondary: "#FFD266", kind: "wizard" },
  ninja: { primary: "#26324A", secondary: "#64748B", kind: "ninja" },
  astronaut: { primary: "#E8EEF7", secondary: "#59A8F4", kind: "astronaut" },
};

function normalizeGender(value) {
  return value === "female" || value === "girl" ? "female" : "male";
}

function getSkin(avatar) {
  return SKIN_TONES[avatar.skin] || SKIN_TONES.light;
}

function getBackgroundValue(avatar) {
  const options = AVATAR_PARTS.bg || [];
  const chosen = options.find((item) => item.id === avatar.bg) || options[0];

  return chosen?.color || "#DDF3FF";
}

function parseBackground(value) {
  const colors =
    typeof value === "string"
      ? value.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g)
      : null;

  if (colors?.length >= 2) {
    return {
      start: colors[0],
      end: colors[colors.length - 1],
    };
  }

  if (colors?.length === 1) {
    return {
      start: colors[0],
      end: colors[0],
    };
  }

  return {
    start: "#DDF3FF",
    end: "#BFE8FF",
  };
}

function AvatarDefs({ uid, background }) {
  return (
    <defs>
      <linearGradient id={`${uid}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={background.start} />
        <stop offset="100%" stopColor={background.end} />
      </linearGradient>

      <linearGradient id={`${uid}-face-light`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.07" />
      </linearGradient>

      <filter id={`${uid}-shadow`} x="-35%" y="-35%" width="170%" height="180%">
        <feDropShadow
          dx="0"
          dy="3"
          stdDeviation="2.5"
          floodColor="#26324A"
          floodOpacity="0.16"
        />
      </filter>
    </defs>
  );
}

function BackgroundScene({ uid, fullBody }) {
  const height = fullBody ? 190 : 115;
  const groundY = fullBody ? 150 : 103;

  return (
    <>
      <rect width="100" height={height} fill={`url(#${uid}-bg)`} />

      <circle cx="15" cy="20" r="8" fill="#FFFFFF" opacity="0.24" />
      <circle cx="82" cy="28" r="13" fill="#FFFFFF" opacity="0.17" />
      <circle cx="72" cy="12" r="5" fill="#FFFFFF" opacity="0.2" />

      <path
        d={`M0 ${groundY}Q25 ${groundY - 8} 50 ${groundY}Q75 ${
          groundY + 8
        } 100 ${groundY}V${height}H0Z`}
        fill="#FFFFFF"
        opacity="0.17"
      />
    </>
  );
}

const HAIR = {
  // make none bald
  none: (
    <>
    </>
  ),

  short: (
    <>
      <path
        d="M21 49C20 27 34 15 50 15C68 15 81 29 79 50C72 39 63 34 50 34C37 34 29 39 21 49Z"
        fill="#493027"
      />
      <path
        d="M27 42C35 30 47 27 60 30C51 33 42 38 34 48Z"
        fill="#644235"
        opacity="0.72"
      />
    </>
  ),

  long: (
    <>
      <path
        d="M21 49C20 27 34 15 50 15C68 15 81 29 79 50C72 39 63 34 50 34C37 34 29 39 21 49Z"
        fill="#43291E"
      />
      <path
        d="M25 42C18 56 18 75 23 92"
        fill="none"
        stroke="#43291E"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M75 42C82 56 82 75 77 92"
        fill="none"
        stroke="#43291E"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M25 43C20 56 20 70 23 82"
        fill="none"
        stroke="#6C4839"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M75 43C80 56 80 70 77 82"
        fill="none"
        stroke="#6C4839"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.65"
      />
    </>
  ),

  curly: (
    <>
      <circle cx="24" cy="39" r="10" fill="#5A362A" />
      <circle cx="33" cy="26" r="11" fill="#5A362A" />
      <circle cx="49" cy="20" r="12" fill="#5A362A" />
      <circle cx="65" cy="26" r="11" fill="#5A362A" />
      <circle cx="76" cy="40" r="10" fill="#5A362A" />
      <path
        d="M25 50C25 32 36 25 50 25C65 25 76 34 76 50C70 41 61 38 50 38C39 38 30 41 25 50Z"
        fill="#5A362A"
      />
      <path
        d="M32 29C39 24 51 23 61 28"
        fill="none"
        stroke="#7B4F3C"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
    </>
  ),

  bun: (
    <>
      <circle cx="51" cy="15" r="13" fill="#472C21" />
      <path
        d="M22 49C20 28 34 17 50 17C68 17 80 30 78 49C72 39 63 34 50 34C37 34 29 39 22 49Z"
        fill="#472C21"
      />
      <path
        d="M26 42C34 31 45 28 58 30"
        fill="none"
        stroke="#6A4534"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.56"
      />
    </>
  ),

  cap: (
    <>
      <path
        d="M21 46C23 28 35 19 50 19C65 19 77 28 79 46Z"
        fill="#EF5B66"
      />
      <path
        d="M15 46H85C87 46 88 47 88 49C88 51 86 52 84 52H16C14 52 12 51 12 49C12 47 13 46 15 46Z"
        fill="#D83D4B"
      />
      <path
        d="M50 20V45"
        stroke="#FF9CB0"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
    </>
  ),

};

function Eyes({ type = "normal", gender }) {
  const lash = gender === "female";

  if (type === "happy") {
    return (
      <>
        <path
          d="M31 58Q36 52 41 58"
          fill="none"
          stroke={INK}
          strokeWidth={lash ? "2.35" : "2.7"}
          strokeLinecap="round"
        />
        <path
          d="M59 58Q64 52 69 58"
          fill="none"
          stroke={INK}
          strokeWidth={lash ? "2.35" : "2.7"}
          strokeLinecap="round"
        />
        {lash && (
          <>
            <path d="M31 56L28 54" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
            <path d="M69 56L72 54" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
          </>
        )}
      </>
    );
  }

  if (type === "sleepy") {
    return (
      <>
        <path
          d="M31 57Q36 61 41 57"
          fill="none"
          stroke={INK}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M59 57Q64 61 69 57"
          fill="none"
          stroke={INK}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </>
    );
  }

  if (type === "cool") {
    return (
      <>
        <rect x="26" y="51" width="19" height="11" rx="4" fill={INK} />
        <rect x="55" y="51" width="19" height="11" rx="4" fill={INK} />
        <path d="M45 56.5H55" stroke={INK} strokeWidth="2.4" />
        <path
          d="M29 53L41 60M58 53L70 60"
          stroke="#A7D8FF"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.85"
        />
      </>
    );
  }

  if (type === "star") {
    return (
      <>
        <path
          d="M36 50L38 55L43 55.5L39 59L40.2 64L36 61.5L31.8 64L33 59L29 55.5L34 55Z"
          fill="#F6B93B"
        />
        <path
          d="M64 50L66 55L71 55.5L67 59L68.2 64L64 61.5L59.8 64L61 59L57 55.5L62 55Z"
          fill="#F6B93B"
        />
      </>
    );
  }

  if (type === "wink") {
    return (
      <>
        <path
          d="M31 58Q36 52 41 58"
          fill="none"
          stroke={INK}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <ellipse cx="64" cy="57" rx="5.6" ry="6.6" fill="#FFFFFF" />
        <ellipse cx="64" cy="58" rx="3.3" ry="4.5" fill={INK} />
        <circle cx="65.4" cy="56.3" r="1.2" fill="#FFFFFF" />
      </>
    );
  }

  return (
    <>
      <ellipse cx="36" cy="57" rx="5.6" ry="6.6" fill="#FFFFFF" />
      <ellipse cx="64" cy="57" rx="5.6" ry="6.6" fill="#FFFFFF" />
      <ellipse cx="36" cy="58" rx="3.3" ry="4.5" fill={INK} />
      <ellipse cx="64" cy="58" rx="3.3" ry="4.5" fill={INK} />
      <circle cx="37.4" cy="56.3" r="1.2" fill="#FFFFFF" />
      <circle cx="65.4" cy="56.3" r="1.2" fill="#FFFFFF" />

      {lash && (
        <>
          <path d="M30.5 53L27.5 51" stroke={INK} strokeWidth="1.35" strokeLinecap="round" />
          <path d="M41.5 53L44 51" stroke={INK} strokeWidth="1.35" strokeLinecap="round" />
          <path d="M58.5 53L56 51" stroke={INK} strokeWidth="1.35" strokeLinecap="round" />
          <path d="M69.5 53L72.5 51" stroke={INK} strokeWidth="1.35" strokeLinecap="round" />
        </>
      )}
    </>
  );
}

function Mouth({ type = "smile", gender }) {
  const lipColor = gender === "female" ? "#C74B70" : "#B84E62";

  if (type === "grin") {
    return (
      <>
        <path
          d="M38 73Q50 83 62 73Q61 84 50 86Q39 84 38 73Z"
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M40 78H60" stroke="#D7E0EC" strokeWidth="1.2" />
      </>
    );
  }

  if (type === "tongue") {
    return (
      <>
        <path
          d="M39 73Q50 82 61 73Q60 84 50 85Q40 84 39 73Z"
          fill="#C85868"
          stroke={INK}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M50 78V84" stroke="#F7A1AC" strokeWidth="1.4" strokeLinecap="round" />
      </>
    );
  }

  if (type === "cool") {
    return (
      <path
        d="M41 78Q50 81 59 77"
        fill="none"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    );
  }

  if (type === "open") {
    return (
      <>
        <ellipse cx="50" cy="78" rx="9" ry="7" fill="#7C3347" />
        <path
          d="M44 75Q50 72 56 75"
          fill="none"
          stroke="#F3A6AF"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    );
  }

  return (
    <>
      <path
        d="M39 75Q50 83 61 75"
        fill="none"
        stroke={lipColor}
        strokeWidth={gender === "female" ? "2.6" : "2.8"}
        strokeLinecap="round"
      />

      {gender === "female" && (
        <path
          d="M46 78Q50 80 54 78"
          fill="none"
          stroke="#F8A7BD"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.8"
        />
      )}
    </>
  );
}

function Accessory({ type }) {
  if (type === "glasses") {
    return (
      <>
        <rect
          x="25"
          y="50"
          width="21"
          height="15"
          rx="6"
          fill="#FFFFFF"
          fillOpacity="0.12"
          stroke={INK}
          strokeWidth="2.3"
        />
        <rect
          x="54"
          y="50"
          width="21"
          height="15"
          rx="6"
          fill="#FFFFFF"
          fillOpacity="0.12"
          stroke={INK}
          strokeWidth="2.3"
        />
        <path d="M46 57H54" stroke={INK} strokeWidth="2.2" />
      </>
    );
  }

  if (type === "bow") {
    return (
      <>
        <path
          d="M22 34Q31 28 39 35Q31 42 22 37Z"
          fill="#FF6FAE"
          stroke="#D94788"
          strokeWidth="1.5"
        />
        <path
          d="M39 35Q47 28 55 34Q47 42 39 37Z"
          fill="#FF93C4"
          stroke="#D94788"
          strokeWidth="1.5"
        />
        <circle cx="39" cy="36" r="4" fill="#D94788" />
      </>
    );
  }

  if (type === "flower") {
    return (
      <>
        <circle cx="25" cy="32" r="5" fill="#FF9FC9" />
        <circle cx="34" cy="28" r="5" fill="#FF9FC9" />
        <circle cx="38" cy="37" r="5" fill="#FF9FC9" />
        <circle cx="29" cy="41" r="5" fill="#FF9FC9" />
        <circle cx="31.5" cy="34.5" r="4.5" fill="#FFD15B" />
      </>
    );
  }

  if (type === "horn") {
    return (
      <path
        d="M50 6L43 29H57Z"
        fill="#B980FF"
        stroke="#8750CF"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    );
  }

  if (type === "halo") {
    return (
      <ellipse
        cx="50"
        cy="12"
        rx="22"
        ry="6"
        fill="none"
        stroke="#FFD15B"
        strokeWidth="3.5"
      />
    );
  }

  if (type === "mask") {
    return (
      <path
        d="M27 63Q38 67 50 62Q62 67 73 63V70Q62 76 50 71Q38 76 27 70Z"
        fill="#EF5B66"
        stroke="#B93E4E"
        strokeWidth="1.4"
      />
    );
  }

if (type === "crown") {
  return (
    <g aria-label="Crown">
      {/* Crown points */}
      <path
        d="M24 43L28 19L40 32L50 12L60 32L72 19L76 43Z"
        fill="#FFD15B"
        stroke="#B87916"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Jewels */}
      <circle cx="50" cy="24.5" r="3.6" fill="#8B5CF6" />
      <circle cx="31" cy="29" r="2.7" fill="#F0528D" />
      <circle cx="69" cy="29" r="2.7" fill="#4B9EFF" />

      {/* Crown band: positioned above the fringe */}
      <path
        d="M25 40Q50 44 75 40V48Q50 52 25 48Z"
        fill="#F2AE35"
        stroke="#B87916"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="M30 43Q50 46 70 43"
        fill="none"
        stroke="#FFF1AD"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.9"
      />
    </g>
  );
}

  return null;
}

function Face({ avatar, skin, gender, uid }) {
  const female = gender === "female";

  const hair = HAIR[avatar.hair] || HAIR.short;
  const faceRx = female ? 28.5 : 31;
  const faceRy = female ? 34 : 35;
  const faceY = female ? 55 : 54;

  return (
    <>
      {/* Different face silhouettes */}
      {female ? (
        <path
          d="M50 19C33 19 22 33 22 53C22 73 34 89 50 89C66 89 78 73 78 53C78 33 67 19 50 19Z"
          fill={skin.face}
        />
      ) : (
        <rect
          x={50 - faceRx}
          y={faceY - faceRy}
          width={faceRx * 2}
          height={faceRy * 2}
          rx="29"
          fill={skin.face}
        />
      )}

      {/* Light overlay follows the same approximate face */}
      {female ? (
        <path
          d="M50 19C33 19 22 33 22 53C22 73 34 89 50 89C66 89 78 73 78 53C78 33 67 19 50 19Z"
          fill={`url(#${uid}-face-light)`}
          opacity="0.65"
        />
      ) : (
        <rect
          x={50 - faceRx}
          y={faceY - faceRy}
          width={faceRx * 2}
          height={faceRy * 2}
          rx="29"
          fill={`url(#${uid}-face-light)`}
          opacity="0.65"
        />
      )}

      {/* Hair stays above the face */}
      {hair}

<ellipse
  cx={female ? "31" : "28"}
  cy={female ? "68" : "68"}
  rx={female ? "6.2" : "7.5"}
  ry={female ? "4" : "4.5"}
  fill="#F57B8C"
  opacity={female ? "0.18" : "0.14"}
/>

<ellipse
  cx={female ? "69" : "72"}
  cy={female ? "68" : "68"}
  rx={female ? "6.2" : "7.5"}
  ry={female ? "4" : "4.5"}
  fill="#F57B8C"
  opacity={female ? "0.18" : "0.14"}
/>

      {/* Different brows */}
      {female ? (
        <>
          <path
            d="M29 46Q36 40.5 43 44"
            fill="none"
            stroke={INK}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M57 44Q64 40.5 71 46"
            fill="none"
            stroke={INK}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M29 47Q36 43 43 46"
            fill="none"
            stroke={INK}
            strokeWidth="2.35"
            strokeLinecap="round"
          />
          <path
            d="M57 46Q64 43 71 47"
            fill="none"
            stroke={INK}
            strokeWidth="2.35"
            strokeLinecap="round"
          />
        </>
      )}

      <Eyes type={avatar.eyes} gender={gender} />

      <path
        d={female ? "M50 62L49.2 67L51 67" : "M50 62L48.6 67L51.5 67"}
        fill="none"
        stroke={INK}
        strokeWidth={female ? "1.15" : "1.4"}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />

      <Mouth type={avatar.mouth} gender={gender} />
      <Accessory type={avatar.accessory} />
    </>
  );
}

function Outfit({ outfit = "tshirt", skin, gender }) {
  const theme = OUTFITS[outfit] || OUTFITS.tshirt;
  const { primary, secondary, kind } = theme;
  const female = gender === "female";

  return (
    <>
      <path
        d="M31 101Q25 105 21 116L16 143Q20 148 27 145L31 127V153Q39 158 50 158Q61 158 69 153V127L73 145Q80 148 84 143L79 116Q75 105 69 101Q61 107 50 107Q39 107 31 101Z"
        fill={primary}
      />

      <path
        d="M39 101Q50 110 61 101Q59 113 50 115Q41 113 39 101Z"
        fill={secondary}
        opacity="0.95"
      />

      <circle cx="21" cy="145" r="5.8" fill={skin.face} />
      <circle cx="79" cy="145" r="5.8" fill={skin.face} />

      {kind === "hoodie" && (
        <>
          <path
            d="M36 108Q50 121 64 108"
            fill="none"
            stroke={secondary}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M45 112V129M55 112V129"
            stroke={secondary}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <rect
            x="38"
            y="135"
            width="24"
            height="12"
            rx="5"
            fill="#000000"
            opacity="0.1"
          />
        </>
      )}

      {kind === "suit" && (
        <>
          <path d="M39 103L47 120L50 113L53 120L61 103" fill="#FFFFFF" />
          {female ? (
            <>
              <path d="M44 110Q50 105 56 110Q50 115 44 110Z" fill="#F472B6" />
              <circle cx="50" cy="110" r="2.4" fill="#D94788" />
            </>
          ) : (
            <path d="M50 112L46.5 128L50 133L53.5 128Z" fill="#EF5B66" />
          )}
        </>
      )}

      {kind === "dress" && (
        <>
          <path
            d="M31 121Q23 142 18 157H82Q77 142 69 121Q60 126 50 126Q40 126 31 121Z"
            fill={secondary}
          />
          <path
            d="M28 151Q50 158 72 151"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            opacity="0.55"
          />
        </>
      )}

      {kind === "wizard" && (
        <>
          <path
            d="M36 119L42 129L50 117L58 129L64 119"
            fill="none"
            stroke={secondary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="43" cy="137" r="2.2" fill={secondary} />
          <circle cx="57" cy="143" r="2.2" fill={secondary} />
          <circle cx="62" cy="132" r="1.6" fill={secondary} />
        </>
      )}

      {kind === "ninja" && (
        <>
          <path
            d="M29 124H71"
            stroke={secondary}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M50 101V151"
            stroke="#000000"
            strokeWidth="1.3"
            opacity="0.24"
          />
        </>
      )}

      {kind === "astronaut" && (
        <>
          <rect
            x="38"
            y="122"
            width="24"
            height="20"
            rx="5"
            fill={secondary}
          />
          <circle cx="56" cy="127" r="2.5" fill="#F15A76" />
          <circle cx="56" cy="135" r="2.5" fill="#38C58A" />
          <path
            d="M42 127H51M42 133H51"
            stroke="#D9F2FF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </>
  );
}

function Legs({ outfit, skin, gender }) {
  const female = gender === "female";
  const isDress = outfit === "dress";
  const isAstronaut = outfit === "astronaut";

  if (isDress) {
    return (
      <>
        <rect x="35" y="154" width="11" height="24" rx="5.5" fill={skin.face} />
        <rect x="54" y="154" width="11" height="24" rx="5.5" fill={skin.face} />
        <path d="M30 178H47V184H30Z" fill={female ? "#EF5B9C" : "#5B67E8"} />
        <path d="M53 178H70V184H53Z" fill={female ? "#EF5B9C" : "#5B67E8"} />
      </>
    );
  }

  if (isAstronaut) {
    return (
      <>
        <rect x="33" y="153" width="14" height="27" rx="5" fill="#C7D2E1" />
        <rect x="53" y="153" width="14" height="27" rx="5" fill="#C7D2E1" />
        <path d="M29 177H47V184H29Z" fill="#64748B" />
        <path d="M53 177H71V184H53Z" fill="#64748B" />
      </>
    );
  }

  return (
    <>
      <rect x="33" y="152" width="14" height="28" rx="5" fill="#52627A" />
      <rect x="53" y="152" width="14" height="28" rx="5" fill="#52627A" />
      <path d="M28 177Q38 175 47 179V185H28Z" fill="#26324A" />
      <path d="M53 179Q62 175 72 177V185H53Z" fill="#26324A" />
    </>
  );
}

function HeadOnlyCollar({ outfit }) {
  const theme = OUTFITS[outfit] || OUTFITS.tshirt;

  return (
    <path
      d="M17 115Q18 101 32 98Q40 105 50 105Q60 105 68 98Q82 101 83 115Z"
      fill={theme.primary}
    />
  );
}

export default function AvatarCanvas({
  avatar = DEFAULT_AVATAR,
  size = 120,
  animated = false,
  fullBody = true,
}) {
  const uid = useId().replace(/:/g, "");
  const mergedAvatar = { ...DEFAULT_AVATAR, ...avatar };

  const gender = normalizeGender(mergedAvatar.gender);
  const skin = getSkin(mergedAvatar);

  const rawBackground = getBackgroundValue(mergedAvatar);
  const background = parseBackground(rawBackground);

  const svgHeight = fullBody ? size * 1.9 : size;

  return (
    <>
      {animated && (
        <style>{`
          @keyframes lexipal-idle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }

          @media (prefers-reduced-motion: reduce) {
            .lexipal-idle {
              animation: none !important;
            }
          }
        `}</style>
      )}

      <svg
        width={size}
        height={svgHeight}
        viewBox={fullBody ? "0 0 100 190" : "0 0 100 115"}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        style={{
          display: "block",
          overflow: "hidden",
          borderRadius: fullBody ? "20px" : "50%",
          filter: "drop-shadow(0 8px 10px rgba(38, 50, 74, 0.14))",
          animation: animated ? "lexipal-idle 3.4s ease-in-out infinite" : "none",
        }}
      >
        <AvatarDefs uid={uid} background={background} />
        <BackgroundScene uid={uid} fullBody={fullBody} />

        {fullBody ? (
          <g filter={`url(#${uid}-shadow)`}>
            <ellipse
              cx="50"
              cy="184"
              rx="27"
              ry="4.8"
              fill="#26324A"
              opacity="0.12"
            />

            <Legs
              outfit={mergedAvatar.outfit}
              skin={skin}
              gender={gender}
            />

            <Outfit
              outfit={mergedAvatar.outfit}
              skin={skin}
              gender={gender}
            />

            <rect
              x={gender === "female" ? "43" : "42"}
              y="88"
              width={gender === "female" ? "14" : "16"}
              height="16"
              rx="6"
              fill={skin.face}
            />

            <Face
              avatar={mergedAvatar}
              skin={skin}
              gender={gender}
              uid={uid}
            />
          </g>
        ) : (
          <>
            <HeadOnlyCollar outfit={mergedAvatar.outfit} />

            <rect
              x={gender === "female" ? "43" : "42"}
              y="87"
              width={gender === "female" ? "14" : "16"}
              height="17"
              rx="6"
              fill={skin.face}
            />

            <Face
              avatar={mergedAvatar}
              skin={skin}
              gender={gender}
              uid={uid}
            />
          </>
        )}
      </svg>
    </>
  );
}
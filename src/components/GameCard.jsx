import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function GameCard({
  icon,
  title,
  desc,
  active,
  to,
  unlockMsg,
  keysRequired = 0,
  currentKeys = 0,
  canAfford = false,
  purchased = false,
  onUnlock,
  globallyLocked = false,
  isUnlocking = false,
  bgColor = "bg-white",
  borderColor = "border-gray-300",
}) {
  const { t } = useTranslation();
  const Wrapper = active && to ? Link : "div";

  const progressPct =
    keysRequired > 0 ? Math.min((currentKeys / keysRequired) * 100, 100) : 0;

  return (
    <Wrapper
      {...(active && to ? { to } : {})}
      className={`relative rounded-2xl border-2 ${borderColor} ${bgColor} p-6 shadow-sm transition-all duration-200 ${
        active
          ? "hover:shadow-md hover:-translate-y-1 cursor-pointer"
          : "opacity-80 cursor-default"
      }`}
    >
      {/* Available badge */}
      {active && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border-2 border-green-500">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span>{t("game.available")}</span>
        </div>
      )}

      <div className="flex flex-col items-center text-center h-full">

        {/* Icon */}
        <div
          className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 ${borderColor} bg-white flex items-center justify-center mb-5`}
        >
          <span
            className="text-4xl md:text-5xl select-none"
            style={{
              fontFamily:
                "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif",
            }}
          >
            {icon}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-xl md:text-2xl font-bold mb-3 ${
            active ? "text-gray-800" : "text-gray-500"
          }`}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={`text-sm md:text-base leading-relaxed mb-6 flex-grow ${
            active ? "text-gray-600" : "text-gray-400"
          }`}
        >
          {desc}
        </p>

        {/* Bottom action */}
        {active ? (
          <div className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl text-base md:text-lg font-bold shadow-md border-b-4 border-indigo-700 transition-all duration-200">
            <span>▶️</span>
            <span>{t("game.play_now")}</span>
          </div>
        ) : (
          <div className="space-y-3 w-full">

            {/*
              Priority order:
              1. globally locked (hearts ran out in FinalWordBuilder) → red lock
              2. purchased but parental time limit → orange time lock
              3. not purchased + key threshold → progress bar + unlock/locked button
              4. fallback
            */}

            {globallyLocked ? (
              /* Case 1 — heart lock: FinalWordBuilder drained all hearts */
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="inline-flex items-center justify-center gap-2 bg-red-100 text-red-600 border-2 border-red-300 px-6 py-3 rounded-xl text-sm font-bold w-full">
                  <span>🔒</span>
                  <span>{t("finalWordBuilder.allLockedTitle")}</span>
                </div>
                <p className="text-xs text-red-400 leading-snug">
                  {t("finalWordBuilder.allLockedDesc")}
                </p>
              </div>

            ) : purchased ? (
              /* Case 2 — parental time limit reached, game was purchased */
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="inline-flex items-center justify-center gap-2 bg-orange-100 text-orange-700 border-2 border-orange-300 px-6 py-3 rounded-xl text-sm font-bold w-full">
                  <span>⏰</span>
                  <span>{t("game.timeLocked") || "Tijdslimiet bereikt"}</span>
                </div>
              </div>

            ) : (
              /* Case 3 — not yet purchased, show key progress */
              <>
                {keysRequired > 0 && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl px-4 py-3 text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-yellow-700 flex items-center gap-1">
                        🗝️ {t("game.keysNeeded") || "Sleutels nodig"}
                      </span>
                      <span className="text-xs font-black text-yellow-800">
                        {Math.min(currentKeys, keysRequired)}/{keysRequired}
                      </span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2.5 overflow-hidden mb-2">
                      <div
                        className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
        
                  </div>
                )}

                {/* Unlock button — enough keys */}
                {keysRequired > 0 && canAfford && onUnlock && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onUnlock();
                    }}
                    disabled={isUnlocking}
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-bold border-b-4 shadow-md transition-all duration-200 ${
                      isUnlocking
                        ? "bg-yellow-300 border-yellow-400 text-yellow-800 cursor-wait"
                        : "bg-yellow-400 hover:bg-yellow-500 border-yellow-600 text-white hover:scale-105"
                    }`}
                  >
                    {isUnlocking ? (
                      <>
                        <span className="animate-spin inline-block">⏳</span>
                        <span>{t("game.unlocking") || "Ontgrendelen..."}</span>
                      </>
                    ) : (
                      <>
                        <span>🗝️</span>
                        <span>
                          {t("game.unlockFor") || "Ontgrendel voor"} {keysRequired}{" "}
                          {t("game.keys") || "sleutels"}
                        </span>
                      </>
                    )}
                  </button>
                )}

                {/* Not enough keys yet */}
                {keysRequired > 0 && !canAfford && (
                  <div className="inline-flex items-center justify-center gap-2 bg-gray-300 text-gray-600 px-6 py-3 rounded-xl text-base font-bold border-2 border-gray-400 w-full">
                    <span>🔒</span>
                    <span>{t("game.locked")}</span>
                  </div>
                )}

                {/* Fallback: no key threshold, plain message */}
                {keysRequired === 0 && unlockMsg && (
                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl px-4 py-3 text-xs md:text-sm text-gray-700 leading-snug">
                    {unlockMsg}
                  </div>
                )}
              </>
            )}

          </div>
        )}
      </div>
    </Wrapper>
  );
}

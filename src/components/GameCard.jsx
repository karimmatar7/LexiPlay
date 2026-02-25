// src/components/GameCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function GameCard({
  icon, title, desc, active, to, unlockMsg,
  keysRequired = 0, currentKeys = 0, canAfford = false,
  purchased = false, onUnlock, globallyLocked = false,
  isUnlocking = false, bgColor = "bg-white", borderColor = "border-gray-300",
}) {
  const { t } = useTranslation();
  const Wrapper = active && to ? Link : "div";
  const progressPct = keysRequired > 0 ? Math.min((currentKeys / keysRequired) * 100, 100) : 0;

  return (
    <Wrapper
      {...(active && to ? { to } : {})}
      className={`rounded-2xl border-2 ${borderColor} ${bgColor} p-4 sm:p-3 shadow-sm transition-all duration-200 flex flex-col ${
        active ? "hover:shadow-md hover:-translate-y-1 cursor-pointer" : "opacity-80 cursor-default"
      }`}
    >
      {/* Badge row — in normal flow, never overflows */}
      <div className="flex justify-end mb-2 min-h-[24px]">
        {active && (
          <div className="flex items-center gap-1 bg-green-400 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-green-500">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span>{t("game.available")}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center text-center flex-1">

        {/* Icon — bigger on mobile since it's full width */}
        <div className={`w-20 h-20 sm:w-14 sm:h-14 rounded-xl border-2 ${borderColor} bg-white flex items-center justify-center mb-3 sm:mb-2`}>
          <span className="text-4xl sm:text-3xl select-none"
            style={{ fontFamily: "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif" }}>
            {icon}
          </span>
        </div>

        {/* Title */}
        <h3 className={`text-base sm:text-sm font-bold mb-1 leading-tight ${active ? "text-gray-800" : "text-gray-500"}`}>
          {title}
        </h3>

        {/* Description */}
        <p className={`text-xs sm:text-[11px] leading-snug mb-4 sm:mb-3 flex-1 ${active ? "text-gray-600" : "text-gray-400"}`}>
          {desc}
        </p>

        {/* Bottom action */}
        {active ? (
          <div className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 sm:px-4 sm:py-2 rounded-xl text-sm sm:text-xs font-bold shadow-md border-b-4 border-indigo-700 transition-all duration-200 w-full">
            <span>▶️</span>
            <span>{t("game.play_now")}</span>
          </div>
        ) : (
          <div className="space-y-2 w-full">
            {globallyLocked ? (
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="inline-flex items-center justify-center gap-1.5 bg-red-100 text-red-600 border-2 border-red-300 px-3 py-2 rounded-xl text-xs font-bold w-full">
                  <span>🔒</span><span>{t("finalWordBuilder.allLockedTitle")}</span>
                </div>
                <p className="text-[10px] text-red-400 leading-snug">{t("finalWordBuilder.allLockedDesc")}</p>
              </div>
            ) : purchased ? (
              <div className="inline-flex items-center justify-center gap-1.5 bg-orange-100 text-orange-700 border-2 border-orange-300 px-3 py-2 rounded-xl text-xs font-bold w-full">
                <span>⏰</span><span>{t("game.timeLocked") || "Tijdslimiet bereikt"}</span>
              </div>
            ) : (
              <>
                {keysRequired > 0 && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl px-3 py-2 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-yellow-700 flex items-center gap-1">
                        🗝️ {t("game.keysNeeded") || "Sleutels nodig"}
                      </span>
                      <span className="text-[11px] font-black text-yellow-800">
                        {Math.min(currentKeys, keysRequired)}/{keysRequired}
                      </span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-yellow-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}
                {keysRequired > 0 && canAfford && onUnlock && (
                  <button onClick={(e) => { e.preventDefault(); onUnlock(); }} disabled={isUnlocking}
                    className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold border-b-4 shadow-md transition-all duration-200 ${
                      isUnlocking
                        ? "bg-yellow-300 border-yellow-400 text-yellow-800 cursor-wait"
                        : "bg-yellow-400 hover:bg-yellow-500 border-yellow-600 text-white hover:scale-105"
                    }`}>
                    {isUnlocking
                      ? <><span className="animate-spin inline-block">⏳</span><span>{t("game.unlocking") || "Ontgrendelen..."}</span></>
                      : <><span>🗝️</span><span>{t("game.unlockFor") || "Ontgrendel voor"} {keysRequired} {t("game.keys") || "sleutels"}</span></>
                    }
                  </button>
                )}
                {keysRequired > 0 && !canAfford && (
                  <div className="inline-flex items-center justify-center gap-1.5 bg-gray-300 text-gray-600 px-3 py-2 rounded-xl text-sm font-bold border-2 border-gray-400 w-full">
                    <span>🔒</span><span>{t("game.locked")}</span>
                  </div>
                )}
                {keysRequired === 0 && unlockMsg && (
                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl px-3 py-2 text-xs text-gray-700 leading-snug">
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

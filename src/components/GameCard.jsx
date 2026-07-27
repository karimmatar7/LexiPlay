// src/components/GameCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import playIcon from "../assets/icons/play.png";
import lockIcon from "../assets/icons/lock.png";
import clockIcon from "../assets/icons/clock.png";
import keyIcon from "../assets/icons/key.png";

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
  const progressPct =
    keysRequired > 0
      ? Math.min((currentKeys / keysRequired) * 100, 100)
      : 0;

  return (
    <div
      className={`rounded-2xl border ${borderColor} ${bgColor} p-4 sm:p-3 shadow-sm transition-all duration-200 flex flex-col ${
        active
          ? "hover:shadow-md hover:-translate-y-1"
          : "opacity-80 cursor-default"
      }`}
    >
      {/* Badge row — in normal flow, never overflows */}
      <div className="flex justify-end mb-2 min-h-[24px]">
        {active && (
          <div className="flex items-center gap-1 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span>{t("game.available")}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center text-center flex-1">
        {/* Icon */}
        <div
          className={`w-20 h-20 sm:w-14 sm:h-14 rounded-2xl border ${borderColor} bg-white flex items-center justify-center mb-3 sm:mb-2`}
        >
          <img
            src={icon}
            alt=""
            aria-hidden="true"
            className="h-8 w-8 object-contain"
            draggable="false"
          />
        </div>

        {/* Title */}
        <h3
          className={`text-base sm:text-sm font-bold mb-1 leading-tight ${
            active ? "text-gray-800" : "text-gray-500"
          }`}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={`text-xs sm:text-[11px] leading-snug mb-4 sm:mb-3 flex-1 ${
            active ? "text-gray-600" : "text-gray-400"
          }`}
        >
          {desc}
        </p>

        {/* Bottom action */}
        {active ? (
          to ? (
            <Link
              to={to}
              className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-xs font-bold shadow-[0_8px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_10px_24px_rgba(99,102,241,0.45)] transition-all duration-200 w-full"
            >
              <img
                src={playIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 shrink-0 object-contain"
                draggable="false"
              />
              <span>{t("game.play_now")}</span>
            </Link>
          ) : (
            <div className="inline-flex items-center justify-center gap-2 bg-indigo-500 text-white px-5 py-2.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-xs font-bold shadow-[0_8px_20px_rgba(99,102,241,0.35)] w-full">
              <img
                src={playIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 shrink-0 object-contain"
                draggable="false"
              />
              <span>{t("game.play_now")}</span>
            </div>
          )
        ) : (
          <div className="space-y-2 w-full">
            {globallyLocked ? (
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="inline-flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-2.5 rounded-full text-xs font-bold w-full">
                  <img
                    src={lockIcon}
                    alt=""
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 object-contain"
                    draggable="false"
                  />
                  <span>{t("finalWordBuilder.allLockedTitle")}</span>
                </div>

                <p className="text-[10px] text-red-400 leading-snug">
                  {t("finalWordBuilder.allLockedDesc")}
                </p>
              </div>
            ) : purchased ? (
              <div className="inline-flex items-center justify-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-200 px-3 py-2.5 rounded-full text-xs font-bold w-full">
                <img
                  src={clockIcon}
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 object-contain"
                  draggable="false"
                />
                <span>{t("game.timeLocked") || "Tijdslimiet bereikt"}</span>
              </div>
            ) : (
              <>
                {keysRequired > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-3 py-2.5 text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-yellow-700 flex items-center gap-1">
                        <img
                          src={keyIcon}
                          alt=""
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 object-contain"
                          draggable="false"
                        />
                        {t("game.keysNeeded") || "Sleutels nodig"}
                      </span>

                      <span className="text-[11px] font-black text-yellow-800">
                        {Math.min(currentKeys, keysRequired)}/{keysRequired}
                      </span>
                    </div>

                    <div className="w-full bg-yellow-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {keysRequired > 0 && canAfford && onUnlock && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onUnlock();
                    }}
                    disabled={isUnlocking}
                    className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                      isUnlocking
                        ? "bg-yellow-200 text-yellow-700 cursor-wait shadow-none"
                        : "bg-yellow-400 hover:bg-yellow-500 text-white shadow-[0_8px_20px_rgba(250,204,21,0.4)] hover:shadow-[0_10px_24px_rgba(250,204,21,0.5)]"
                    }`}
                  >
                    {isUnlocking ? (
                      <>
                        <img
                          src={clockIcon}
                          alt=""
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 animate-spin object-contain"
                          draggable="false"
                        />
                        <span>{t("game.unlocking") || "Ontgrendelen..."}</span>
                      </>
                    ) : (
                      <>
                        <img
                          src={keyIcon}
                          alt=""
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 object-contain"
                          draggable="false"
                        />
                        <span>
                          {t("game.unlockFor") || "Ontgrendel voor"}{" "}
                          {keysRequired} {t("game.keys") || "sleutels"}
                        </span>
                      </>
                    )}
                  </button>
                )}

                {keysRequired > 0 && !canAfford && (
                  <div className="inline-flex items-center justify-center gap-1.5 bg-gray-100 text-gray-500 px-3 py-2.5 rounded-full text-sm font-bold border border-gray-200 w-full">
                    <img
                      src={lockIcon}
                      alt=""
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 object-contain"
                      draggable="false"
                    />
                    <span>{t("game.locked")}</span>
                  </div>
                )}

                {keysRequired === 0 && unlockMsg && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-3 py-2.5 text-xs text-gray-700 leading-snug">
                    {unlockMsg}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
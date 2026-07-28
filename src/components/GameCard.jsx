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
  isRandomFocused = false,
  isRandomizing = false,
}) {
  const { t } = useTranslation();

  const progressPct =
    keysRequired > 0
      ? Math.min((currentKeys / keysRequired) * 100, 100)
      : 0;

  const shouldShowActionButton = active && (!to || onUnlock);

  const randomFocusClasses = isRandomFocused
    ? "relative z-20 scale-[1.035] border-amber-400 ring-4 ring-amber-300 ring-offset-4 ring-offset-slate-100 shadow-[0_0_36px_rgba(251,191,36,0.9)]"
    : isRandomizing
      ? "scale-[0.985] opacity-50"
      : "";

  const renderPlayButton = () => (
    <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] sm:px-4 sm:py-2 sm:text-xs">
      <img
        src={playIcon}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="h-4 w-4 shrink-0 object-contain"
      />
      <span>{t("game.play_now")}</span>
    </div>
  );

  return (
    <div
      className={`flex flex-col rounded-2xl border ${borderColor} ${bgColor} p-4 shadow-sm transition-all duration-150 sm:p-3 ${
        active
          ? "hover:-translate-y-1 hover:shadow-md"
          : "cursor-default opacity-80"
      } ${randomFocusClasses}`}
    >
      <div className="mb-2 flex min-h-[24px] justify-end">
        {active && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            <span>{t("game.available")}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center text-center">
        <div
          className={`mb-3 flex h-20 w-20 items-center justify-center rounded-2xl border ${borderColor} bg-white sm:mb-2 sm:h-14 sm:w-14`}
        >
          <img
            src={icon}
            alt=""
            aria-hidden="true"
            draggable="false"
            className="h-8 w-8 object-contain"
          />
        </div>

        <h3
          className={`mb-1 text-base font-bold leading-tight sm:text-sm ${
            active ? "text-gray-800" : "text-gray-500"
          }`}
        >
          {title}
        </h3>

        <p
          className={`mb-4 flex-1 text-xs leading-snug sm:mb-3 sm:text-[11px] ${
            active ? "text-gray-600" : "text-gray-400"
          }`}
        >
          {desc}
        </p>

        {active ? (
          to ? (
            <Link
              to={to}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] transition-all duration-200 hover:bg-indigo-600 hover:shadow-[0_10px_24px_rgba(99,102,241,0.45)] sm:px-4 sm:py-2 sm:text-xs ${
                isRandomizing ? "pointer-events-none" : ""
              }`}
            >
              <img
                src={playIcon}
                alt=""
                aria-hidden="true"
                draggable="false"
                className="h-4 w-4 shrink-0 object-contain"
              />
              <span>{t("game.play_now")}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onUnlock}
              disabled={!onUnlock || isUnlocking}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 sm:px-4 sm:py-2 sm:text-xs ${
                isUnlocking
                  ? "cursor-wait bg-indigo-300 shadow-none"
                  : "bg-indigo-500 shadow-[0_8px_20px_rgba(99,102,241,0.35)] hover:bg-indigo-600 hover:shadow-[0_10px_24px_rgba(99,102,241,0.45)]"
              }`}
            >
              <img
                src={isUnlocking ? clockIcon : playIcon}
                alt=""
                aria-hidden="true"
                draggable="false"
                className={`h-4 w-4 shrink-0 object-contain ${
                  isUnlocking ? "animate-spin" : ""
                }`}
              />
              <span>
                {isUnlocking
                  ? unlockMsg || t("game.unlocking")
                  : t("game.play_now")}
              </span>
            </button>
          )
        ) : (
          <div className="w-full space-y-2">
            {globallyLocked ? (
              <div className="flex w-full flex-col items-center gap-1.5">
                <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600">
                  <img
                    src={lockIcon}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                    className="h-4 w-4 shrink-0 object-contain"
                  />
                  <span>{t("finalWordBuilder.allLockedTitle")}</span>
                </div>

                <p className="text-[10px] leading-snug text-red-400">
                  {t("finalWordBuilder.allLockedDesc")}
                </p>
              </div>
            ) : purchased ? (
              <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs font-bold text-orange-600">
                <img
                  src={clockIcon}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  className="h-4 w-4 shrink-0 object-contain"
                />
                <span>{t("game.timeLocked") || "Tijdslimiet bereikt"}</span>
              </div>
            ) : (
              <>
                {keysRequired > 0 && (
                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-3 py-2.5 text-left">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-yellow-700">
                        <img
                          src={keyIcon}
                          alt=""
                          aria-hidden="true"
                          draggable="false"
                          className="h-4 w-4 shrink-0 object-contain"
                        />
                        {t("game.keysNeeded") || "Sleutels nodig"}
                      </span>

                      <span className="text-[11px] font-black text-yellow-800">
                        {Math.min(currentKeys, keysRequired)}/{keysRequired}
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-yellow-200">
                      <div
                        className="h-2 rounded-full bg-yellow-500 transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {keysRequired > 0 && canAfford && onUnlock && (
                  <button
                    type="button"
                    onClick={onUnlock}
                    disabled={isUnlocking}
                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-bold transition-all duration-200 ${
                      isUnlocking
                        ? "cursor-wait bg-yellow-200 text-yellow-700 shadow-none"
                        : "bg-yellow-400 text-white shadow-[0_8px_20px_rgba(250,204,21,0.4)] hover:bg-yellow-500 hover:shadow-[0_10px_24px_rgba(250,204,21,0.5)]"
                    }`}
                  >
                    {isUnlocking ? (
                      <>
                        <img
                          src={clockIcon}
                          alt=""
                          aria-hidden="true"
                          draggable="false"
                          className="h-4 w-4 shrink-0 animate-spin object-contain"
                        />
                        <span>{t("game.unlocking") || "Ontgrendelen..."}</span>
                      </>
                    ) : (
                      <>
                        <img
                          src={keyIcon}
                          alt=""
                          aria-hidden="true"
                          draggable="false"
                          className="h-4 w-4 shrink-0 object-contain"
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
                  <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm font-bold text-gray-500">
                    <img
                      src={lockIcon}
                      alt=""
                      aria-hidden="true"
                      draggable="false"
                      className="h-4 w-4 shrink-0 object-contain"
                    />
                    <span>{t("game.locked")}</span>
                  </div>
                )}

                {keysRequired === 0 && unlockMsg && (
                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-3 py-2.5 text-xs leading-snug text-gray-700">
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
import React from "react";
import { useTranslation } from "react-i18next";
import keyIcon from "../assets/icons/key.png";
import checkIcon from "../assets/icons/check.png";
import lockIcon from "../assets/icons/lock.png";
import unlockIcon from "../assets/icons/unlock.png";

export default function KeysCard({ keys, thresholds, unlocked }) {
  const { t } = useTranslation();

  const rows = [
    {
      threshold: thresholds.letterBuild,
      label: t("gameCards.letterBuild.title"),
      isUnlocked: unlocked.letterBuild,
    },
    {
      threshold: thresholds.maze,
      label: t("gameCards.wordMaze.title"),
      isUnlocked: unlocked.maze,
    },
    {
      threshold: thresholds.final,
      label: t("gameCards.finalWordBuilder.title"),
      isUnlocked: unlocked.final,
    },
      {
    threshold: thresholds.letterDraw,
    label: t("gameCards.letterDraw.title"),
    isUnlocked: unlocked.letterDraw,
  },
  ];

  return (
    <>
      <style>{`
        @keyframes key-pop {
          0%, 100% { transform: scale(1) rotate(0deg); }
          30% { transform: scale(1.25) rotate(-12deg); }
          60% { transform: scale(1.1) rotate(6deg); }
        }

        @keyframes keys-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>

      <div
        className="relative w-full max-w-md overflow-hidden bg-white"
        style={{ padding: "clamp(14px,3.5vw,20px) clamp(16px,4vw,24px)" }}
      >
        <div
          className="pointer-events-none absolute bottom-0 top-0"
          style={{
            width: "30%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            animation: "keys-shimmer 4s ease-in-out 2s infinite",
          }}
        />

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* Key icon + count */}
          <div className="flex shrink-0 items-center gap-3">
            <span
              className="inline-flex items-center justify-center"
              style={{
                animation: "key-pop 3s ease-in-out 1s infinite",
              }}
            >
              <img
                src={keyIcon}
                alt=""
                aria-hidden="true"
                draggable="false"
                className="h-9 w-9 object-contain sm:h-10 sm:w-10"
              />
            </span>

            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase leading-none tracking-widest text-gray-400">
                {t("gameMenu.yourKeys") || "Your keys"}
              </p>

              <p
                className="font-black leading-none tabular-nums text-yellow-500"
                style={{ fontSize: "clamp(22px,5vw,32px)" }}
              >
                {keys}
              </p>
            </div>
          </div>

          <div className="hidden w-px self-stretch bg-yellow-200 sm:block" />
          <div className="h-px w-full bg-yellow-100 sm:hidden" />

          {/* Threshold pills */}
          <div className="flex flex-row flex-wrap justify-center gap-2 sm:flex-col sm:justify-start sm:gap-1">
            {rows.map(({ threshold, label, isUnlocked }) => {
              const canUnlock = keys >= threshold;

              const statusIcon = isUnlocked
                ? checkIcon
                : canUnlock
                ? unlockIcon
                : lockIcon;

              return (
                <p
                  key={threshold}
                  className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
                    isUnlocked
                      ? "border-green-200 bg-green-50 text-green-600"
                      : canUnlock
                      ? "border-yellow-200 bg-yellow-50 text-yellow-600"
                      : "border-gray-200 bg-gray-50 text-gray-400"
                  }`}
                >
                  <img
                    src={statusIcon}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                    className="h-3.5 w-3.5 shrink-0 object-contain"
                  />

                  <span>
                    {threshold} → {label}
                  </span>
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
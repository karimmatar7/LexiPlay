import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import HeartShopPanel, { DEALS_ALL } from "./hearts/HeartShopPanel";
import { buyHeartsAllGames } from "../utils/user";

import lockIcon from "../assets/icons/lock.png";
import heartIcon from "../assets/icons/heart.png";
import keyIcon from "../assets/icons/key.png";
import timerIcon from "../assets/icons/sandclock.png";

const MAX_HEARTS = 5;

export default function GlobalLockBanner({
  hearts,
  cooldownUntil,
  countdown,
  userId,
  onHeartsRefilled,
}) {
  const { t } = useTranslation();

  const [showShop, setShowShop] = useState(false);
  const [buying, setBuying] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function formatCountdown(seconds) {
    if (seconds === null || seconds === undefined) return "...";

    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m}:${String(s).padStart(2, "0")}`;
  }

  async function handleBuy(deal) {
    if (buying) return;

    setBuying(true);
    setFeedback(null);

    const result = await buyHeartsAllGames(userId, deal.hearts, deal.keys);

    if (result?.success) {
      setFeedback({
        type: "success",
        msg: t("hearts.addedAll", {
          count: deal.hearts,
          defaultValue: `+${deal.hearts} hearts added to all games!`,
        }),
      });

      setTimeout(() => {
        setShowShop(false);
        setFeedback(null);
        onHeartsRefilled?.(result.user);
      }, 1200);
    } else {
      setFeedback({
        type: "error",
        msg:
          result?.message === "Not enough keys"
            ? t("hearts.notEnoughKeys", "Not enough keys!")
            : t("hearts.error", "Something went wrong"),
      });
    }

    setBuying(false);
  }

  return (
    <div
      className="relative overflow-visible rounded-3xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-rose-50 shadow-md"
      style={{ padding: "clamp(16px, 4vw, 24px)" }}
    >
      {/* Watermark */}
      <img
        src={lockIcon}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="pointer-events-none absolute right-4 top-1/2 h-16 w-16 -translate-y-1/2 select-none object-contain opacity-5 sm:h-20 sm:w-20 md:h-24 md:w-24"
      />

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        {/* Lock icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-red-300 bg-red-100 shadow-sm">
          <img
            src={lockIcon}
            alt=""
            aria-hidden="true"
            draggable="false"
            className="h-8 w-8 object-contain sm:h-9 sm:w-9"
          />
        </div>

        {/* Text */}
        <div className="flex-1 text-center sm:text-left">
          <p
            className="mb-1 font-black text-red-600"
            style={{ fontSize: "clamp(14px, 3vw, 18px)" }}
          >
            {t("finalWordBuilder.allLockedTitle")}
          </p>

          <p className="mb-2 text-sm text-red-400">
            {t("finalWordBuilder.allLockedDesc")}
          </p>

          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-1.5 shadow-sm">
            <img
              src={timerIcon}
              alt=""
              aria-hidden="true"
              draggable="false"
              className="h-4 w-4 shrink-0 object-contain"
            />

            <span className="text-sm font-bold tabular-nums text-red-500">
              {t("letterBuild.tryLater")} {formatCountdown(countdown)}
            </span>
          </div>
        </div>

        {/* Hearts + buy button */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <img
                key={i}
                src={heartIcon}
                alt=""
                aria-hidden="true"
                draggable="false"
                className={`h-5 w-5 object-contain transition-all duration-300 sm:h-6 sm:w-6 ${
                  i < hearts ? "opacity-100" : "opacity-20 grayscale"
                }`}
              />
            ))}
          </div>

          <p className="text-xs font-bold text-red-400">
            {hearts}/{MAX_HEARTS}
          </p>

          <button
            type="button"
            onClick={() => setShowShop((v) => !v)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border-b-2 border-yellow-600 bg-yellow-400 px-3 py-1.5 text-xs font-black text-yellow-900 shadow transition-all duration-200 hover:scale-105 hover:bg-yellow-500"
          >
            <img
              src={keyIcon}
              alt=""
              aria-hidden="true"
              draggable="false"
              className="h-4 w-4 shrink-0 object-contain"
            />

            <span>{t("hearts.buyHeartsAll", "Buy Hearts for All Games")}</span>
          </button>
        </div>
      </div>

      {showShop && (
        <div className="mt-4">
          <HeartShopPanel
            onClose={() => {
              setShowShop(false);
              setFeedback(null);
            }}
            buying={buying}
            onBuy={handleBuy}
            feedback={feedback}
            t={t}
            deals={DEALS_ALL}
          />
        </div>
      )}
    </div>
  );
}
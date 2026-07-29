// src/components/hearts/HeartDealButton.jsx
import React from "react";
import AppButton from "../AppButton";
import heartIcon from "../../assets/icons/heart.png";

export default function HeartDealButton({ deal, onBuy, buying, t }) {
  const label = deal.hearts === 5 ? t("hearts.deal5") : t("hearts.deal3");

  return (
<AppButton
  type="button"
  onClick={() => onBuy(deal)}
  disabled={buying}
  variant={deal.highlight ? "pink" : "neutral"}
  className={`relative w-full justify-between rounded-2xl px-4 py-3 pr-16 ${
    deal.highlight
      ? "border-b-4 border-pink-700"
      : "border-b-4 border-pink-200 text-purple-700 hover:bg-pink-50"
  }`}
>
      <span className="mr-3 flex min-w-0 flex-1 items-center gap-1.5 text-base sm:text-lg">
        {Array.from({ length: deal.hearts }).map((_, i) => (
          <img
            key={i}
            src={heartIcon}
            alt=""
            aria-hidden="true"
            draggable="false"
            className="h-4 w-4 shrink-0 object-contain"
          />
        ))}

        <span className="ml-1 truncate">{label}</span>
      </span>

      <span className="flex shrink-0 items-center gap-1 text-sm font-black sm:text-base">
        <span className="text-lg" aria-hidden="true">
          🗝️
        </span>
        <span>{deal.keys}</span>
      </span>

      {deal.highlight && (
        <span className="pointer-events-none absolute -top-2.5 right-2 select-none rounded-full border border-yellow-600 bg-yellow-400 px-2 py-0.5 text-[10px] font-black text-yellow-900 shadow-sm">
          {t("hearts.best", "BEST")}
        </span>
      )}
    </AppButton>
  );
}
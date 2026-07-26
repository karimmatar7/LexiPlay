import React from "react"
import heartIcon from "../../assets/icons/heart.png"

export default function HeartDealButton({ deal, onBuy, buying, t }) {
  const label = deal.hearts === 5 ? t("hearts.deal5") : t("hearts.deal3")

  return (
    <button
      onClick={() => onBuy(deal)}
      disabled={buying}
      className={`
        relative w-full flex items-center justify-between
        px-4 py-3 pr-16 rounded-2xl font-bold
        border-b-4 transition-all duration-150
        disabled:opacity-60 disabled:cursor-not-allowed
        ${deal.highlight
          ? "bg-pink-400 hover:bg-pink-500 border-pink-700 text-white shadow-md hover:scale-105"
          : "bg-white hover:bg-pink-50 border-pink-200 text-purple-700 shadow hover:scale-105"}
      `}
    >
      <span className="flex items-center gap-1.5 text-base sm:text-lg min-w-0 flex-1 mr-3">
        {Array.from({ length: deal.hearts }).map((_, i) => (
          <img
            key={i}
            src={heartIcon}
            alt="Heart"
            aria-hidden="true"
            draggable="false"
            className="h-4 w-4 object-contain"
          />
        ))}
        <span className="ml-1 truncate">{label}</span>
      </span>

      <span className="flex items-center gap-1 text-sm sm:text-base shrink-0 font-black">
        <span className="text-lg">🗝️</span>
        <span>{deal.keys}</span>
      </span>

      {deal.highlight && (
        <span className="
          absolute -top-2.5 right-2
          bg-yellow-400 text-yellow-900
          text-[10px] font-black
          px-2 py-0.5 rounded-full
          border border-yellow-600 shadow-sm
          pointer-events-none select-none
        ">
          {t("hearts.best", "BEST")}
        </span>
      )}
    </button>
  )
}

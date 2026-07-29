import React from "react"
import HeartDealButton from "./HeartDealButton"

export const DEALS_SINGLE = [
  { hearts: 3, keys: 5,  highlight: false },
  { hearts: 5, keys: 10, highlight: true  },
]

export const DEALS_ALL = [
  { hearts: 3, keys: 12, highlight: false },
  { hearts: 5, keys: 20, highlight: true  },
]

function FeedbackBanner({ feedback }) {
  if (!feedback) return null
  return (
    <div className={`
      mt-3 text-sm font-bold rounded-xl px-4 py-2 text-center
      ${feedback.type === "success"
        ? "bg-green-100 text-green-700 border border-green-300"
        : "bg-red-100 text-red-600 border border-red-300"}
    `}>
      {feedback.msg}
    </div>
  )
}

export default function HeartShopPanel({ onClose, buying, onBuy, feedback, t, deals = DEALS_SINGLE }) {
  return (
    <div className="border-t-2 border-purple-100 bg-purple-50 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-purple-700 text-base sm:text-lg">
          🏪 {t("hearts.shop", "Heart Shop")}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close shop"
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-purple-100 transition-colors text-lg font-bold"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-5 mt-4">
         {deals.map((deal) => (
      <HeartDealButton key={deal.hearts} deal={deal} onBuy={onBuy} buying={buying} t={t} />
    ))}
      </div>

      <FeedbackBanner feedback={feedback} />

      <p className="mt-3 text-xs text-gray-400 text-center">
        {t("hearts.keysEarned", "Earn 🗝️ keys by completing games")}
      </p>
    </div>
  )
}

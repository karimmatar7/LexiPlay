import React from "react"
import { useTranslation } from "react-i18next"
import starIcon from "../assets/icons/star.png"

export default function XPBadge({ xp, level }) {
  const { t } = useTranslation()
  const xpIntoLevel = xp % 100

  return (
    <div className="flex justify-center mb-2">
      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5">
        <img
          src={starIcon}
          alt="Star"
          aria-hidden="true"
          draggable="false"
          className="h-4 w-4 object-contain sm:h-5 sm:w-5"
        />
        <span className="text-sm font-black text-indigo-600">
          {t("gameMenu.level") || "Level"} {level}
        </span>
        <div className="w-20 bg-indigo-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-400 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${xpIntoLevel}%` }}
          />
        </div>
        <span className="text-xs font-bold text-indigo-400">
          {xpIntoLevel}/100
        </span>
      </div>
    </div>
  )
}

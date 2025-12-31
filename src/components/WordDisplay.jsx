import React from "react";
import { useTranslation } from "react-i18next";

export default function WordDisplay({ selected, totalLetters, shakeWrong }) {
  const { t } = useTranslation();

  return (
    <div className={`bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-purple-300 ${shakeWrong ? 'shake-anim' : ''}`}>
      {/* Instruction */}
      <div className="text-xs md:text-sm text-gray-500 font-bold mb-3 md:mb-4 tracking-wider">
        {t("wordDisplay.instruction")}
      </div>

      {/* Letters */}
      <div className="flex justify-center gap-2 md:gap-3 text-4xl md:text-5xl font-black min-h-[3.5rem] md:min-h-[4rem] flex-wrap">
        {selected.map((l, i) => (
          <span 
            key={i} 
            className="pop-anim bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-xl px-3 md:px-4 py-2 shadow-lg"
          >
            {l}
          </span>
        ))}
        {Array.from({ length: totalLetters - selected.length }).map((_, i) => (
          <span 
            key={`empty-${i}`} 
            className="pulse-anim bg-gray-100 text-gray-300 rounded-xl px-3 md:px-4 py-2 border-3 border-dashed border-gray-300"
          >
            _
          </span>
        ))}
      </div>
    </div>
  );
}

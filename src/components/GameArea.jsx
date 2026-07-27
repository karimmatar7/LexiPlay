import React from "react";
import DraggableLetter from "../hooks/draggableLetter";
import useDragTouch from "../hooks/useDragTouch";
import { useTranslation } from "react-i18next";

export default function GameArea({
  currentWord,
  selectedLetters,
  currentLetters,
  handleLetterClick,
  handleUndo,
  setSelectedLetters,
  setCurrentLetters
}) {
  const { t } = useTranslation();
  const dragHandlers = useDragTouch(setSelectedLetters, setCurrentLetters, currentWord);

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        data-drop-zone="selected"
        className="min-h-[100px] w-full flex flex-wrap justify-center items-center gap-3 bg-indigo-50/70 border-2 border-dashed border-indigo-200 rounded-3xl p-4 sm:p-5 transition-colors duration-200"
      >
        {selectedLetters.length === 0 ? (
          <p className="text-gray-400 italic text-sm sm:text-base">{t("gameArea.dragHere")}</p>
        ) : selectedLetters.map((l, i) => (
          <DraggableLetter
            key={`${l}-${i}`}
            letter={l}
            index={i}
            area="selected"
            onClick={handleUndo}
            dragHandlers={dragHandlers}
            selected
          />
        ))}
      </div>

      <div
        data-drop-zone="available"
        className="flex flex-wrap justify-center gap-3 mt-2 p-5 sm:p-6 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-3xl shadow-[0_20px_45px_rgba(15,23,42,0.06)] w-full"
      >
        {currentLetters.map((l, i) => l && (
          <DraggableLetter
            key={`${l}-${i}`}
            letter={l}
            index={i}
            area="available"
            onClick={handleLetterClick}
            dragHandlers={dragHandlers}
          />
        ))}
      </div>
    </div>
  );
}
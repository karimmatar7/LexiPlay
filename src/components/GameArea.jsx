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
        className="min-h-[100px] w-full flex justify-center gap-3 bg-indigo-50 border-dashed rounded-2xl p-4"
      >
        {selectedLetters.length === 0 ? (
          <p className="text-gray-400 italic">{t("gameArea.dragHere")}</p>
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
        className="flex flex-wrap justify-center gap-3 mt-6 p-6 bg-white rounded-2xl shadow-md"
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

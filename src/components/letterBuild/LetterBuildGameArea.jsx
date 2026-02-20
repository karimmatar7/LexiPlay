import React, { useRef } from "react"
import AudioButton from "../AudioButton"
import { AvailableTile, SelectedTile } from "./LetterTile"
import { useLetterDrag } from "../../hooks/useLetterDrag"

export default function LetterBuildGameArea({
  currentWord, selectedLetters, availableLetters,
  onPickById, onUndoById,
  onMoveToSelected, onMoveToAvailable, onReorderSelected,
  soundOn, paused, t, fontClass, sizeClass,
}) {
  const selectedZoneRef  = useRef(null)
  const availableZoneRef = useRef(null)

  const { startDrag } = useLetterDrag({
    selectedZoneRef,
    availableZoneRef,
    onPickById,
    onUndoById,
    onMoveToSelected,
    onMoveToAvailable,
    onReorderSelected,
  })

  return (
    <div className={`flex flex-col items-center gap-6 ${fontClass} ${sizeClass}`}>
      <AudioButton
        word={currentWord.displayWord}
        soundOn={soundOn}
        paused={paused}
        label={t("letterBuild.listen")}
        className="px-8 py-4 text-xl md:text-2xl"
      />

      {/* ── Selected zone ── */}
      <div
        ref={selectedZoneRef}
        className="min-h-[90px] w-full flex flex-wrap items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-blue-50 border-b-4 border-indigo-400 border-dashed rounded-2xl px-4 py-4 shadow-sm"
      >
        {selectedLetters.length === 0 ? (
          <p className="text-gray-400 italic font-medium text-base md:text-lg select-none pointer-events-none">
            {t("letterBuild.dragLettersHere")}
          </p>
        ) : (
          selectedLetters.map((item) => (
            <SelectedTile
              key={item.id}
              item={item}
              onMouseDown={(e) => { e.preventDefault(); startDrag(e, item.id, "selected") }}
              onTouchStart={(e) => startDrag(e, item.id, "selected")}
            />
          ))
        )}
      </div>

      {/* ── Available zone ── */}
      <div
        ref={availableZoneRef}
        className="flex flex-wrap justify-center gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-2xl shadow-md border-2 border-gray-200 w-full"
      >
        {availableLetters.map((item, i) =>
          item ? (
            <AvailableTile
              key={item.id}
              item={item}
              onMouseDown={(e) => { e.preventDefault(); startDrag(e, item.id, "available") }}
              onTouchStart={(e) => startDrag(e, item.id, "available")}
            />
          ) : (
            <div key={`empty-${i}`} className="w-14 h-14 md:w-16 md:h-16" />
          )
        )}
      </div>
    </div>
  )
}

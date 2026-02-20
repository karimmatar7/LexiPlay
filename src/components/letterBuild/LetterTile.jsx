import React from "react"

const tileBase =
  "select-none touch-manipulation font-black text-2xl md:text-4xl rounded-2xl px-5 py-3 shadow-md border-b-4 transition-all duration-150 transform active:scale-95 cursor-grab active:cursor-grabbing"

export function AvailableTile({ item, onMouseDown, onTouchStart }) {
  return (
    <div
      data-slot-id={item.id}
      data-zone="available"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`${tileBase} bg-gradient-to-br from-purple-400 to-pink-500 text-white border-pink-600 hover:from-purple-500 hover:to-pink-600 hover:scale-110`}
    >
      {item.letter}
    </div>
  )
}

export function SelectedTile({ item, onMouseDown, onTouchStart }) {
  return (
    <div
      data-slot-id={item.id}
      data-zone="selected"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`${tileBase} bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-purple-700 hover:from-indigo-600 hover:to-purple-700 hover:scale-110`}
    >
      {item.letter}
    </div>
  )
}

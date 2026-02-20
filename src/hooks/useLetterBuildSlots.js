import { useCallback } from "react"

export function useLetterBuildSlots(setLetterSlots, currentWordRef) {

  const handleMoveToSelected = useCallback((id, beforeId = null) => {
    const word = currentWordRef.current
    if (!word) return
    setLetterSlots((prev) => {
      const selected = prev.filter((s) => s.zone === "selected")
      if (selected.length >= word.displayWord.length) return prev

      if (beforeId) {
        const targetOrder = prev.find((s) => s.id === beforeId)?.order ?? selected.length
        const shifted = prev.map((s) =>
          s.zone === "selected" && s.order >= targetOrder
            ? { ...s, order: s.order + 1 }
            : s
        )
        return shifted.map((s) =>
          s.id === id ? { ...s, zone: "selected", order: targetOrder } : s
        )
      }

      return prev.map((s) =>
        s.id === id ? { ...s, zone: "selected", order: selected.length } : s
      )
    })
  }, [setLetterSlots, currentWordRef])

  const handleMoveToAvailable = useCallback((id) => {
    setLetterSlots((prev) => {
      const removedOrder = prev.find((s) => s.id === id)?.order
      return prev
        .map((s) => (s.id === id ? { ...s, zone: "available", order: null } : s))
        .map((s) =>
          s.zone === "selected" && s.order > removedOrder
            ? { ...s, order: s.order - 1 }
            : s
        )
    })
  }, [setLetterSlots])

  const handleReorderSelected = useCallback((draggedId, targetId) => {
    setLetterSlots((prev) => {
      const dragged = prev.find((s) => s.id === draggedId)
      const target  = prev.find((s) => s.id === targetId)
      if (!dragged || !target) return prev
      return prev.map((s) => {
        if (s.id === draggedId) return { ...s, order: target.order }
        if (s.id === targetId)  return { ...s, order: dragged.order }
        return s
      })
    })
  }, [setLetterSlots])

  const handlePickById  = useCallback((id) => handleMoveToSelected(id, null),  [handleMoveToSelected])
  const handleUndoById  = useCallback((id) => handleMoveToAvailable(id),        [handleMoveToAvailable])

  return {
    handlePickById,
    handleUndoById,
    handleMoveToSelected,
    handleMoveToAvailable,
    handleReorderSelected,
  }
}

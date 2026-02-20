import { useCallback, useEffect } from "react"
import { ds, spawnClone, repositionClone, destroyClone, elAt } from "./dragState"

export function useLetterDrag({
  selectedZoneRef,
  availableZoneRef,
  onPickById,
  onUndoById,
  onMoveToSelected,
  onMoveToAvailable,
  onReorderSelected,
}) {
  const startDrag = useCallback((e, slotId, fromArea) => {
    const isTouch = e.type === "touchstart"
    const clientX = isTouch ? e.touches[0].clientX : e.clientX
    const clientY = isTouch ? e.touches[0].clientY : e.clientY
    ds.active   = true
    ds.id       = slotId
    ds.fromArea = fromArea
    ds.startX   = clientX
    ds.startY   = clientY
    ds.moved    = false
    ds.clone    = null
  }, [])

  const onMove = useCallback((e) => {
    if (!ds.active) return
    const isTouch = e.type === "touchmove"
    const clientX = isTouch ? e.touches[0].clientX : e.clientX
    const clientY = isTouch ? e.touches[0].clientY : e.clientY
    const dx = Math.abs(clientX - ds.startX)
    const dy = Math.abs(clientY - ds.startY)

    if (!ds.moved && (dx > 6 || dy > 6)) {
      ds.moved = true
      const srcEl = document.querySelector(`[data-slot-id="${ds.id}"]`)
      if (srcEl) ds.clone = spawnClone(srcEl)
    }

    if (ds.moved) {
      if (isTouch) e.preventDefault()
      repositionClone(ds.clone, clientX, clientY)
    }
  }, [])

  const onUp = useCallback((e) => {
    if (!ds.active) return
    ds.active = false
    const isTouch = e.type === "touchend"
    const clientX = isTouch ? e.changedTouches[0].clientX : e.clientX
    const clientY = isTouch ? e.changedTouches[0].clientY : e.clientY

    if (!ds.moved) {
      destroyClone()
      if (ds.fromArea === "available") onPickById(ds.id)
      else                             onUndoById(ds.id)
      ds.id = null
      return
    }

    const target       = elAt(clientX, clientY)
    destroyClone()

    const overSelected  = selectedZoneRef.current?.contains(target)
    const overAvailable = availableZoneRef.current?.contains(target)
    const targetSlotEl  = target?.closest("[data-slot-id][data-zone='selected']")
    const targetSlotId  = targetSlotEl?.dataset?.slotId

    if (ds.fromArea === "available" && overSelected) {
      onMoveToSelected(ds.id, targetSlotId || null)
    } else if (ds.fromArea === "selected" && overAvailable) {
      onMoveToAvailable(ds.id)
    } else if (ds.fromArea === "selected" && overSelected && targetSlotId && targetSlotId !== ds.id) {
      onReorderSelected(ds.id, targetSlotId)
    }

    ds.id = null
  }, [onPickById, onUndoById, onMoveToSelected, onMoveToAvailable, onReorderSelected, selectedZoneRef, availableZoneRef])

  useEffect(() => {
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup",   onUp)
    window.addEventListener("touchmove", onMove, { passive: false })
    window.addEventListener("touchend",  onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup",   onUp)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend",  onUp)
    }
  }, [onMove, onUp])

  return { startDrag }
}

export const ds = {
  active:   false,
  id:       null,
  fromArea: null,
  clone:    null,
  startX:   0,
  startY:   0,
  moved:    false,
}

export function spawnClone(sourceEl) {
  const rect  = sourceEl.getBoundingClientRect()
  const clone = sourceEl.cloneNode(true)
  Object.assign(clone.style, {
    position:        "fixed",
    left:            `${rect.left}px`,
    top:             `${rect.top}px`,
    width:           `${rect.width}px`,
    height:          `${rect.height}px`,
    margin:          "0",
    opacity:         "0.85",
    pointerEvents:   "none",
    zIndex:          "9999",
    transform:       "scale(1.12)",
    transformOrigin: "center",
    transition:      "none",
    borderRadius:    getComputedStyle(sourceEl).borderRadius,
  })
  document.body.appendChild(clone)
  return clone
}

export function repositionClone(clone, clientX, clientY) {
  if (!clone) return
  clone.style.left = `${clientX - clone.offsetWidth  / 2}px`
  clone.style.top  = `${clientY - clone.offsetHeight / 2}px`
}

export function destroyClone() {
  if (ds.clone?.parentNode) ds.clone.parentNode.removeChild(ds.clone)
  ds.clone = null
}

export function elAt(x, y) {
  if (ds.clone) ds.clone.style.visibility = "hidden"
  const el = document.elementFromPoint(x, y)
  if (ds.clone) ds.clone.style.visibility = ""
  return el
}

import { useState, useRef } from "react"

export const useLetterDrag = () => {
  const [dragged, setDragged] = useState({ letter: null, index: null, area: null })
  const draggedRef = useRef({ letter: null, index: null, area: null })
  const dragCloneRef = useRef(null)
  const touchStartTimeRef = useRef(0)
  const touchStartPosRef = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)

  const reorderArray = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  const handleDragStart = (e, letter, index, area) => {
    setDragged({ letter, index, area })
    draggedRef.current = { letter, index, area }
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move"
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move"
    }
  }

  const findInsertIndex = (clientX) => {
    const selectedContainer = document.querySelector('[data-drop-zone="selected"]')
    if (!selectedContainer) return null

    const letterElements = Array.from(selectedContainer.querySelectorAll('[data-selected-letter]'))
    
    for (let i = 0; i < letterElements.length; i++) {
      const rect = letterElements[i].getBoundingClientRect()
      const midX = rect.left + rect.width / 2
      
      if (clientX < midX) {
        return i
      }
    }
    
    return letterElements.length
  }

  const handleDropOnSelected = (e, selectedLetters, setSelectedLetters, setCurrentLetters, maxLength) => {
    e.preventDefault()
    const dragInfo = draggedRef.current

    if (dragInfo.area === "selected") {
      const insertIndex = findInsertIndex(e.clientX) ?? selectedLetters.length - 1

      if (insertIndex !== dragInfo.index) {
        setSelectedLetters(prev => reorderArray(prev, dragInfo.index, insertIndex))
      }
    } else if (dragInfo.area === "available" && selectedLetters.length < maxLength) {
      const insertIndex = findInsertIndex(e.clientX) ?? selectedLetters.length

      setSelectedLetters(prev => {
        const newArr = [...prev]
        newArr.splice(insertIndex, 0, dragInfo.letter)
        return newArr
      })

      setCurrentLetters((c) => {
        const arr = [...c]
        arr[dragInfo.index] = null
        return arr
      })
    }

    setDragged({ letter: null, index: null, area: null })
  }

  const handleDropOnAvailable = (e, setSelectedLetters, setCurrentLetters) => {
    e.preventDefault()
    const dragInfo = draggedRef.current

    if (dragInfo.area === "selected") {
      setSelectedLetters((s) => s.filter((_, i) => i !== dragInfo.index))
      setCurrentLetters((c) => {
        const arr = [...c]
        const empty = arr.indexOf(null)
        arr[empty === -1 ? arr.length : empty] = dragInfo.letter
        return arr
      })
    }

    setDragged({ letter: null, index: null, area: null })
  }

  const handleTouchStart = (e, letter, index, area) => {
    const touch = e.touches[0]
    touchStartTimeRef.current = Date.now()
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }
    hasMoved.current = false
    
    setDragged({ letter, index, area })
    draggedRef.current = { letter, index, area }
  }

  const handleTouchMove = (e) => {
    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x)
    const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y)
    
    // If moved more than 10px, it's a drag
    if (deltaX > 10 || deltaY > 10) {
      hasMoved.current = true
      e.preventDefault()
      
      const target = document.querySelector(`[data-index="${draggedRef.current.index}"]`)
      
      // Create clone if not exists
      if (!dragCloneRef.current && target) {
        const rect = target.getBoundingClientRect()
        const clone = target.cloneNode(true)
        clone.classList.add('dragging-element')
        clone.style.left = `${rect.left}px`
        clone.style.top = `${rect.top}px`
        clone.style.width = `${rect.width}px`
        clone.style.height = `${rect.height}px`
        document.body.appendChild(clone)
        dragCloneRef.current = clone
        
        target.style.opacity = "0.3"
      }
      
      if (dragCloneRef.current) {
        dragCloneRef.current.style.left = `${touch.clientX - 50}px`
        dragCloneRef.current.style.top = `${touch.clientY - 50}px`
      }
      
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
      if (elementBelow) {
        const dropZone = elementBelow.closest('[data-drop-zone]')
        
        document.querySelectorAll('[data-drop-zone]').forEach(zone => {
          zone.style.borderColor = ''
          zone.style.backgroundColor = ''
        })
        
        if (dropZone) {
          dropZone.style.borderColor = '#8b5cf6'
          dropZone.style.backgroundColor = '#ede9fe'
        }
      }
    }
  }

  const handleTouchEnd = (e, selectedLetters, setSelectedLetters, setCurrentLetters, maxLength, onClickCallback) => {
    const touch = e.changedTouches[0]
    const timeDiff = Date.now() - touchStartTimeRef.current
    
    // Clean up visual feedback
    if (dragCloneRef.current) {
      dragCloneRef.current.remove()
      dragCloneRef.current = null
    }
    
    const target = document.querySelector(`[data-index="${draggedRef.current.index}"]`)
    if (target) {
      target.style.opacity = "1"
    }
    
    document.querySelectorAll('[data-drop-zone]').forEach(zone => {
      zone.style.borderColor = ''
      zone.style.backgroundColor = ''
    })

    // If it's a quick tap (< 200ms) and no movement, treat as click
    if (timeDiff < 200 && !hasMoved.current) {
      const dragInfo = draggedRef.current
      if (onClickCallback) {
        onClickCallback(dragInfo.letter, dragInfo.index, dragInfo.area)
      }
      setDragged({ letter: null, index: null, area: null })
      draggedRef.current = { letter: null, index: null, area: null }
      return
    }

    // Otherwise, handle as drag
    const dragInfo = draggedRef.current
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)

    if (elementBelow && hasMoved.current) {
      const dropZone = elementBelow.closest('[data-drop-zone]')
      const dropArea = dropZone?.getAttribute('data-drop-zone')
      
      if (dropArea === 'selected') {
        const insertIndex = findInsertIndex(touch.clientX) ?? selectedLetters.length
        
        if (dragInfo.area === 'selected') {
          if (insertIndex !== dragInfo.index) {
            setSelectedLetters(prev => reorderArray(prev, dragInfo.index, insertIndex))
          }
        } else if (dragInfo.area === 'available' && selectedLetters.length < maxLength) {
          setSelectedLetters(prev => {
            const newArr = [...prev]
            newArr.splice(insertIndex, 0, dragInfo.letter)
            return newArr
          })
          
          setCurrentLetters((c) => {
            const arr = [...c]
            arr[dragInfo.index] = null
            return arr
          })
        }
      } else if (dropArea === 'available' && dragInfo.area === 'selected') {
        setSelectedLetters((s) => s.filter((_, i) => i !== dragInfo.index))
        setCurrentLetters((c) => {
          const arr = [...c]
          const empty = arr.indexOf(null)
          arr[empty === -1 ? arr.length : empty] = dragInfo.letter
          return arr
        })
      }
    }
    
    setDragged({ letter: null, index: null, area: null })
    draggedRef.current = { letter: null, index: null, area: null }
    hasMoved.current = false
  }

  return {
    handleDragStart,
    handleDragOver,
    handleDropOnSelected,
    handleDropOnAvailable,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}

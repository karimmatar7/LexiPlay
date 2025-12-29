import { useEffect, useRef } from "react"

export const useGameTimer = (
  timeLeft, 
  setTimeLeft, 
  loaded, 
  victory, 
  gameOver, 
  paused, 
  showResetModal, 
  starEarned,
  setGameOver,
  setGameOverReason,
  playCuteBeep,
  WARNING_TIME
) => {
  const timerRef = useRef(null)

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (!loaded || victory || gameOver || paused || showResetModal || starEarned) return

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setGameOver(true)
          setGameOverReason('time')
          return 0
        }
        
        if (t <= 10) {
          playCuteBeep(1200, 0.15)
        } else if (t <= WARNING_TIME && t % 5 === 0) {
          playCuteBeep(900, 0.1)
        }
        
        return t - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [loaded, victory, gameOver, paused, showResetModal, starEarned])

  return timerRef
}

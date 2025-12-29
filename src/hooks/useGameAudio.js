import { useEffect, useRef } from "react"

export const useGameAudio = (soundOn, isPlaying) => {
  const audioContextRef = useRef(null)
  const tickSoundRef = useRef(null)

  // Initialize Audio Context
  useEffect(() => {
    if (!audioContextRef.current && soundOn) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
  }, [soundOn])

  // Initialize tick sound
  useEffect(() => {
    if (soundOn && !tickSoundRef.current) {
      tickSoundRef.current = new Audio('/sounds/tick.mp3')
      tickSoundRef.current.loop = true
      tickSoundRef.current.volume = 0.3
    }
  }, [soundOn])

  // Control tick sound
  useEffect(() => {
    const tickSound = tickSoundRef.current
    if (!tickSound || !soundOn) return

    if (isPlaying) {
      tickSound.play().catch(e => console.log('Tick sound play prevented:', e))
    } else {
      tickSound.pause()
    }

    return () => {
      if (tickSound) tickSound.pause()
    }
  }, [isPlaying, soundOn])

  // Cleanup
  useEffect(() => {
    return () => {
      if (tickSoundRef.current) {
        tickSoundRef.current.pause()
        tickSoundRef.current = null
      }
    }
  }, [])

  const playCuteBeep = (frequency = 800, duration = 0.1) => {
    if (!soundOn || !audioContextRef.current) return
    
    try {
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (error) {
      console.error('Audio playback error:', error)
    }
  }

  return { playCuteBeep }
}

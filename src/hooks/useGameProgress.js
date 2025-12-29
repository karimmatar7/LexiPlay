import { useState, useEffect } from "react"
import { supabase } from "../supaBaseClient"
import { updateProgress, addReward } from "../supabaseFunctions"
import { calculateStars } from "../utils/progressStars"

export const useGameProgress = (user, setUser, wordData, TOTAL_WORDS, shuffle) => {
  const [loaded, setLoaded] = useState(false)
  const [initialGameState, setInitialGameState] = useState(null)
  const [finalProgress, setFinalProgress] = useState({
    level: 0,
    levelIndex: 0,
    score: 0,
    rewardsEarned: [false, false, false],
    permanentRewards: [false, false, false],
    gameState: {}
  })

  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()
      if (error) return console.error(error)

      const savedProgress = data.progress?.finalWordBuilder || {
        level: 0, 
        score: 0, 
        rewardsEarned: [false, false, false],
        permanentRewards: [false, false, false],
        gameState: {} 
      }

      setFinalProgress(savedProgress)

      // Extract saved game state if it exists
      if (savedProgress.gameState && savedProgress.gameState.words?.length) {
        setInitialGameState(savedProgress.gameState)
      } else {
        // Create fresh game state
        setInitialGameState({
          words: shuffle(wordData).slice(0, TOTAL_WORDS),
          currentIndex: 0,
          selected: [],
          mistakes: 0,
          timeLeft: 400 // Use the GAME_TIME constant value
        })
      }
      
      setLoaded(true)
    }
    loadProgress()
  }, [user])

  const saveProgressToDb = async (progressData) => {
    if (!user) return
    const updated = await updateProgress(user.id, { finalWordBuilder: progressData })
    if (updated) {
      setUser(prev => ({ ...prev, progress: updated.progress }))
    }
  }

  const checkAndAwardStars = async (newIndex, currentState) => {
    const progressPercent = (newIndex / TOTAL_WORDS) * 100
    const starsEarned = calculateStars(progressPercent)
    const newRewards = [...finalProgress.rewardsEarned]
    const permanentRewards = [...(finalProgress.permanentRewards || [false, false, false])]
    let rewardsAdded = 0

    for (let i = 0; i < starsEarned; i++) {
      if (!newRewards[i]) {
        newRewards[i] = true
        if (!permanentRewards[i]) {
          permanentRewards[i] = true
          rewardsAdded += 1
        }
      }
    }

    if (rewardsAdded > 0 || newRewards.some((r, i) => r && !finalProgress.rewardsEarned[i])) {
      const updatedProgress = {
        ...finalProgress,
        rewardsEarned: newRewards,
        permanentRewards: permanentRewards,
        score: newIndex,
        gameState: { ...currentState, selected: [], currentIndex: newIndex }
      }
      
      await saveProgressToDb(updatedProgress)
      setFinalProgress(updatedProgress)
      
      if (rewardsAdded > 0) {
        await addReward(user.id, rewardsAdded)
        setUser(prev => ({
          ...prev,
          rewards: (prev.rewards || 0) + rewardsAdded,
          progress: { ...prev.progress, finalWordBuilder: updatedProgress }
        }))
      }
      
      return newRewards.some((r, i) => r && !finalProgress.rewardsEarned[i])
    }
    return false
  }

  return { loaded, initialGameState, finalProgress, setFinalProgress, saveProgressToDb, checkAndAwardStars }
}

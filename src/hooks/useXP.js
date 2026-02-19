import { useState, useCallback } from "react"
import { addXP } from "../utils/user"

export function useXP(user, setUser) {
  const [justLeveledUp, setJustLeveledUp] = useState(false)

  const gainXP = useCallback(async (amount = 10) => {
    if (!user?.id) return
    const result = await addXP(user.id, amount)
    if (!result) return

    setUser((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        xp: result.xp,
        level: result.level,
      },
    }))

    if (result.leveledUp) {
      setJustLeveledUp(true)
      setTimeout(() => setJustLeveledUp(false), 3000)
    }
  }, [user?.id, setUser])

  return {
    xp: user?.progress?.xp || 0,
    level: user?.progress?.level || 1,
    justLeveledUp,
    gainXP,
  }
}

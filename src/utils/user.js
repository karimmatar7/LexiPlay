import { supabase } from '../supaBaseClient.js'

/* =========================
   CREATE USER
========================= */
export async function createUser(name, pin) {
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('name', name)
      .eq('pin', pin)
      .maybeSingle()

    if (existing) {
      console.error('User with this name and PIN already exists')
      return null
    }

    const defaultProgress = {
      wordMatch: {
        level: 0,
        levelIndex: 0,
        score: 0,
        letterBuildUnlocked: false,
        rewardsEarned: [false, false, false]
      }
    }

    const defaultSettings = {
      fontType: 'normal',
      fontSize: 'medium',
      soundOn: true
    }

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          pin,
          rewards: 0,
          progress: defaultProgress,
          settings: defaultSettings
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error creating user:', err)
    return null
  }
}

/* =========================
   LOGIN USER
========================= */
export async function loginUser(name, pin) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .eq('pin', pin)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error logging in:', err)
    return null
  }
}

/* =========================
   UPDATE PROGRESS (SAFE)
========================= */
export async function updateProgress(userId, newProgressPart) {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('progress')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    const mergedProgress = { ...(user.progress || {}) }

    for (const gameKey in newProgressPart) {
      mergedProgress[gameKey] = {
        ...(mergedProgress[gameKey] || {}),
        ...newProgressPart[gameKey],
        rewardsEarned:
          newProgressPart[gameKey]?.rewardsEarned ??
          mergedProgress[gameKey]?.rewardsEarned ??
          [false, false, false]
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update({ progress: mergedProgress })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error updating progress:', err)
    return null
  }
}

/* =========================
   ADD REWARD (TOTAL STARS)
========================= */
export async function addReward(userId, stars = 1) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('rewards')
      .eq('id', userId)
      .single()

    if (error) throw error

    const newRewards = (user.rewards || 0) + stars

    const { data, error: updateError } = await supabase
      .from('users')
      .update({ rewards: newRewards })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) throw updateError
    return data.rewards
  } catch (err) {
    console.error('Error adding reward:', err)
    return null
  }
}

/* =========================
   UPDATE SETTINGS
========================= */
export async function updateSettings(userId, newSettings) {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('settings')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    const mergedSettings = {
      ...(user.settings || {}),
      ...newSettings
    }

    const { data, error } = await supabase
      .from('users')
      .update({ settings: mergedSettings })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error updating settings:', err)
    return null
  }
}

import { supabase } from '../supaBaseClient.js'

// Create a new user
export async function createUser(name, pin) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, pin, rewards: 0, progress: { wordMatch: { level: 0, levelIndex: 0 }, letterBuildUnlocked: false } }])
    .select()

  if (error) {
    console.error('Error creating user:', error)
    return null
  }

  return data[0]
}

// Login user
export async function loginUser(name, pin) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('name', name)
    .eq('pin', pin)
    .single()

  if (error) {
    console.error('Error logging in:', error)
    return null
  }

  return data
}

// Update user's progress and rewards
export async function updateProgress(userId, newProgress, reward = 0) {
  const { data, error } = await supabase
    .from('users')
    .update({
      rewards: supabase.raw('rewards + ?', [reward]),
      progress: newProgress
    })
    .eq('id', userId)
    .select()

  if (error) console.error('Error updating progress:', error)
  return data[0]
}

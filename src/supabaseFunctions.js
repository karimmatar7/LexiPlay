import { supabase } from './supaBaseClient.js'

export async function getUser(userId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, progress")
      .eq("id", userId)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error("Error fetching user:", err)
    return null
  }
}

export async function updateProgress(userId, newProgress) {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('progress, rewards')
      .eq('id', userId)
      .single()
    if (fetchError) throw fetchError

    const mergedProgress = {
      ...existing.progress,
      ...newProgress
    }

    const { data, error: updateError } = await supabase
      .from('users')
      .update({ progress: mergedProgress })
      .eq('id', userId)
      .select()

    if (updateError) throw updateError
    return data[0]
  } catch (err) {
    console.error('Error updating progress:', err)
    return null
  }
}

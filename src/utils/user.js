import { supabase } from '../supaBaseClient.js'

// Create a new user
export async function createUser(name, pin) {
  try {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("name", name)
      .eq("pin", pin)
      .maybeSingle();

    if (existing) {
      console.error("User with this name and PIN already exists");
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        name, 
        pin, 
        rewards: 0, 
        progress: { wordMatch: { level: 0, levelIndex: 0, score: 0, letterBuildUnlocked: false } },
        settings: { fontType: "normal", fontSize: "medium", soundOn: true } // ← default settings
      }])
      .select();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data[0];
  } catch (err) {
    console.error("Error in createUser:", err);
    return null;
  }
}


// Login user
export async function loginUser(name, pin) {
  const { data, error } = await supabase
    .from('users')
    .select('*') // must include settings!
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
export async function updateProgress(userId, newProgressPart, reward = 0) {
  // 1️⃣ Fetch existing progress first
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('progress')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching user for progress update:', fetchError);
    return null;
  }

  const mergedProgress = {
    ...user.progress,          // existing progress
    ...newProgressPart         // merge in new updates
  };

  // 2️⃣ Update merged progress
  const { data, error } = await supabase
    .from('users')
    .update({
      rewards: supabase.raw('rewards + ?', [reward]),
      progress: mergedProgress
    })
    .eq('id', userId)
    .select();

  if (error) console.error('Error updating progress:', error);
  return data[0];
}

// Update user settings
export async function updateSettings(userId, newSettings) {
  try {
    // Fetch existing settings
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('settings')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user for settings update:', fetchError);
      return null;
    }

    const mergedSettings = { ...user.settings, ...newSettings };

    const { data, error } = await supabase
      .from('users')
      .update({ settings: mergedSettings })
      .eq('id', userId)
      .select()
      .single();

    if (error) console.error('Error updating settings:', error);
    return data;
  } catch (err) {
    console.error("Error in updateSettings:", err);
    return null;
  }
}


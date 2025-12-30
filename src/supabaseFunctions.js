import { supabase } from './supaBaseClient.js'

export async function getUser(userId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, progress, settings, parental_control") // <- add parental_control
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
      .from("users")
      .select("progress")
      .eq("id", userId)
      .single()

    if (fetchError) throw fetchError

    const mergedProgress = { ...(existing.progress || {}) }

    for (const gameKey in newProgress) {
      mergedProgress[gameKey] = {
        ...(mergedProgress[gameKey] || {}),
        ...newProgress[gameKey],
        rewardsEarned:
          newProgress[gameKey]?.rewardsEarned ??
          mergedProgress[gameKey]?.rewardsEarned ??
          [false, false, false]
      }
    }

    const { data, error: updateError } = await supabase
      .from("users")
      .update({ progress: mergedProgress })
      .eq("id", userId)
      .select()
      .single()

    if (updateError) throw updateError

    return data
  } catch (err) {
    console.error("Error updating progress:", err)
    return null
  }
}


// Update user's settings
export async function updateSettings(userId, newSettings) {
  try {
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("settings")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    const mergedSettings = { ...(user.settings || {}), ...newSettings };

    const { data, error: updateError } = await supabase
      .from("users")
      .update({ settings: mergedSettings })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return data; // full user object with updated settings
  } catch (err) {
    console.error("Error updating settings:", err);
    return null;
  }
}

export const addReward = async (userId, stars = 3) => {
  // Get current rewards
  const { data, error } = await supabase
    .from("users")
    .select("rewards")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching rewards:", error);
    return null;
  }

  const newRewards = (data.rewards || 0) + stars;

  const { data: updated, error: updateError } = await supabase
    .from("users")
    .update({ rewards: newRewards })
    .eq("id", userId)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating rewards:", updateError);
    return null;
  }

  return updated.rewards;
};

export async function updateParentalControl(userId, newControl) {
  try {
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("parental_control")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    const mergedControl = { ...(user.parental_control || {}), ...newControl };

    const { data, error: updateError } = await supabase
      .from("users")
      .update({ parental_control: mergedControl })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return data; // returns full user object with updated parental_control
  } catch (err) {
    console.error("Error updating parental control:", err);
    return null;
  }
}


export async function addPlaytime(userId, minutesPlayed) {
  try {
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("playtimeHistory, totalPlaytime")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    const today = new Date().toISOString().split("T")[0];

    const playtimeHistory = { ...(user.playtimeHistory || {}) };
    playtimeHistory[today] = parseFloat(((playtimeHistory[today] || 0) + minutesPlayed).toFixed(2));

    const totalPlaytime = parseFloat(((user.totalPlaytime || 0) + minutesPlayed).toFixed(2));

    console.log("Updating playtimeHistory:", playtimeHistory);
    console.log("Updating totalPlaytime:", totalPlaytime);

    const { data, error } = await supabase
      .from("users")
      .update({
        playtimeHistory,
        totalPlaytime: totalPlaytime // make sure this is number
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    console.log("Updated user:", data);

    return data;
  } catch (err) {
    console.error("Error adding playtime:", err);
    return null;
  }
}



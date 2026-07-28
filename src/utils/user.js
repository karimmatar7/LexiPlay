// src/utils/user.js
import { supabase } from '../supaBaseClient.js';
import { MAX_HEARTS, MS_PER_HEART } from './heartConstants.js';

/* =========================
   GET USER BY ID
========================= */
export async function getUser(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.error('Error fetching user:', err);
    return null;
  }
}


/* =========================
   UPDATE PROGRESS (SAFE)
========================= */
export async function updateProgress(userId, newProgressPart) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('progress')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const mergedProgress = { ...(user.progress || {}) };

    for (const gameKey in newProgressPart) {
      mergedProgress[gameKey] = {
        ...(mergedProgress[gameKey] || {}),
        ...newProgressPart[gameKey],
        rewardsEarned:
          newProgressPart[gameKey]?.rewardsEarned ??
          mergedProgress[gameKey]?.rewardsEarned ??
          [false, false, false],
      };
    }

    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ progress: mergedProgress })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updated;
  } catch (err) {
    console.error('Error updating progress:', err);
    return null;
  }
}

/* =========================
   UPDATE SETTINGS
========================= */
export async function updateSettings(userId, newSettings) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('settings')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const mergedSettings = {
      ...(user.settings || {}),
      ...newSettings,
    };

    const { data, error: updateError } = await supabase
      .from('users')
      .update({ settings: mergedSettings })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data;
  } catch (err) {
    console.error('Error updating settings:', err);
    return null;
  }
}

/* =========================
   UPDATE PARENTAL CONTROL
========================= */
export async function updateParentalControl(userId, newControl) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('parental_control')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const mergedControl = {
      ...(user.parental_control || {}),
      ...newControl,
    };

    const { data, error: updateError } = await supabase
      .from('users')
      .update({ parental_control: mergedControl })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data;
  } catch (err) {
    console.error('Error updating parental control:', err);
    return null;
  }
}


/* =========================
   UNLOCK GAME WITH KEYS
========================= */
export async function unlockGame(userId, gameKey, keyCost) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("progress")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const progress = user.progress || {};
    const currentKeys = progress?.currency?.keys || 0;

    if (currentKeys < keyCost) {
      return { success: false, message: "Not enough keys" };
    }

    const updatedProgress = {
      ...progress,
      currency: {
        ...progress.currency,
        keys: currentKeys - keyCost,
      },
      [gameKey]: {
        ...(progress[gameKey] || {}),
        unlocked: true,
      },
    };

    const { data, error: updateError } = await supabase
      .from("users")
      .update({ progress: updatedProgress })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return { success: true, user: data };
  } catch (err) {
    console.error("Error unlocking game:", err);
    return { success: false, message: "Something went wrong" };
  }
}


/* =========================
   BUY HEARTS WITH KEYS
========================= */
export async function buyHearts(userId, gameKey, heartsToAdd, keyCost) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("progress")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const progress = user.progress || {};
    const currentKeys = progress?.currency?.keys || 0;

    if (currentKeys < keyCost) {
      return { success: false, message: "Not enough keys" };
    }

    const gameProgress = progress[gameKey] || {};
    const currentHearts = gameProgress.hearts || 0;
    const newHearts = Math.min(currentHearts + heartsToAdd, MAX_HEARTS);
    const heartsActuallyAdded = newHearts - currentHearts;

    if (heartsActuallyAdded <= 0) {
      return { success: false, message: "Hearts already full" };
    }

    // Recalculate cooldown: if now full, clear it; otherwise shift it back
    let newCooldown = gameProgress.cooldownUntil;
    if (newHearts >= MAX_HEARTS) {
      newCooldown = null;
    } else if (gameProgress.cooldownUntil) {
      // Shift cooldown earlier by the number of hearts added × MS_PER_HEART
      const MINUTES_PER_HEART = 12;
      const MS_PER_HEART = MINUTES_PER_HEART * 60 * 1000;
      const existing = new Date(gameProgress.cooldownUntil).getTime();
      const shifted = existing - heartsActuallyAdded * MS_PER_HEART;
      // If the shifted time is in the past, clear it (hearts would already have refilled)
      newCooldown = shifted <= Date.now() ? null : new Date(shifted).toISOString();
    }


    if (newHearts < MAX_HEARTS && !newCooldown) {
  newCooldown = new Date(Date.now() + MS_PER_HEART).toISOString();
}

    const updatedProgress = {
      ...progress,
      currency: {
        ...progress.currency,
        keys: currentKeys - keyCost,
      },
      [gameKey]: {
        ...gameProgress,
        hearts: newHearts,
        cooldownUntil: newCooldown,
      },
    };

    const { data, error: updateError } = await supabase
      .from("users")
      .update({ progress: updatedProgress })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return { success: true, user: data, newHearts, newCooldown };
  } catch (err) {
    console.error("Error buying hearts:", err);
    return { success: false, message: "Something went wrong" };
  }
}

/* =========================
   BUY HEARTS FOR ALL GAMES (menu purchase)
========================= */
export async function buyHeartsAllGames(userId, heartsToAdd, keyCost) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("progress")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const progress    = user.progress || {};
    const currentKeys = progress?.currency?.keys || 0;

    if (currentKeys < keyCost) {
      return { success: false, message: "Not enough keys" };
    }

    const GAME_KEYS = ["wordMatch", "letterBuild", "wordMaze", "finalWordBuilder"];
    const updatedGames = {};

 for (const key of GAME_KEYS) {
  const gp        = progress[key] || {};
  const current   = gp.hearts ?? MAX_HEARTS;
  const newHearts = Math.min(current + heartsToAdd, MAX_HEARTS);

  let newCooldown = gp.cooldownUntil ?? null;
  if (newHearts >= MAX_HEARTS) {
    newCooldown = null;
  } else if (gp.cooldownUntil) {
    const existing = new Date(gp.cooldownUntil).getTime();
    const shifted  = existing - heartsToAdd * MS_PER_HEART;
    newCooldown = shifted <= Date.now() ? null : new Date(shifted).toISOString();
  }

  // ── If still below max and no cooldown, start a fresh one ──
  if (newHearts < MAX_HEARTS && !newCooldown) {
    newCooldown = new Date(Date.now() + MS_PER_HEART).toISOString();
  }

  updatedGames[key] = { ...gp, hearts: newHearts, cooldownUntil: newCooldown };
}


    const updatedProgress = {
      ...progress,
      currency: { ...progress.currency, keys: currentKeys - keyCost },
      ...updatedGames,
    };

    const { data, error: updateError } = await supabase
      .from("users")
      .update({ progress: updatedProgress })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return { success: true, user: data };
  } catch (err) {
    console.error("Error buying hearts for all games:", err);
    return { success: false, message: "Something went wrong" };
  }
}



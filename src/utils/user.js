// src/utils/user.js
import { supabase } from '../supaBaseClient.js';
import { sha256 } from 'js-sha256';
import { MAX_HEARTS, MS_PER_HEART } from './heartConstants.js';

/* =========================
   BROWSER-SAFE RECOVERY CODE GENERATOR
========================= */
function generateRecoveryCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randIndex = Math.floor(
      (window.crypto.getRandomValues(new Uint32Array(1))[0] /
        (0xffffffff + 1)) *
        chars.length
    );
    code += chars[randIndex];
  }

  return code;
}

/* =========================
   CREATE USER
========================= */
export async function createUser(name, pin) {
  try {
    const hashedPin = sha256(pin);

    const recoveryCode = generateRecoveryCode();
    const hashedRecovery = sha256(recoveryCode);

const defaultProgress = {
  currency: {
    keys: 0
  },
  xp: 0,
  level: 1,

  wordMatch: {
    score: 0,
    rewardsEarned: [false, false, false],
    hearts: 5,
    cooldownUntil: null,
    keysEarnedThisRun: 0
  },

  letterBuild: {
    score: 0,
    rewardsEarned: [false, false, false],
    hearts: 5,
    cooldownUntil: null,
    unlocked: false
  },

  wordMaze: {
    score: 0,
    rewardsEarned: [false, false, false],
    hearts: 5,
    cooldownUntil: null,
    unlocked: false
  },

  finalWordBuilder: {
    score: 0,
    rewardsEarned: [false, false, false],
    hearts: 5,
    cooldownUntil: null,
    unlocked: false
  }
};

    const defaultSettings = {
      fontType: 'normal',
      fontSize: 'medium',
      soundOn: true,
      language: 'en',
      parentalPin: null,
    };

    const defaultParentalControl = {
      enabled: false,
      dailyLimitMinutes: 60,
      playtimeToday: 0,
      lastPlayedDate: null,
    };

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          pin: hashedPin,
          recovery_code: hashedRecovery,
          rewards: 0,
          progress: defaultProgress,
          settings: defaultSettings,
          parental_control: defaultParentalControl,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // return plain recovery code ONLY to show once
    return { user: data, recoveryCode };
  } catch (err) {
    console.error('Error creating user:', err);
    return null;
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
      .single();

    if (error || !data) return null;
    if (sha256(pin) !== data.pin) return null;

    return data;
  } catch (err) {
    console.error('Error logging in:', err);
    return null;
  }
}

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
   RESET PIN WITH RECOVERY CODE
========================= */
export async function resetPin(name, recoveryCode, newPin) {
  try {
    const hashedRecovery = sha256(recoveryCode);
    const hashedPin = sha256(newPin);

    const { data, error } = await supabase
      .from('users')
      .update({ pin: hashedPin })
      .eq('name', name)
      .eq('recovery_code', hashedRecovery)
      .select()
      .single();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.error('Error resetting PIN:', err);
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
   ADD REWARD
========================= */
export async function addReward(userId, stars = 1) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('rewards')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const newRewards = (user.rewards || 0) + stars;

    const { data, error: updateError } = await supabase
      .from('users')
      .update({ rewards: newRewards })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data.rewards;
  } catch (err) {
    console.error('Error adding reward:', err);
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
   RESET PARENTAL PIN (FIXED & HASHED)
========================= */
export async function resetParentalPinWithCode(name, recoveryCode, newPin) {
  try {
    // 1️⃣ Fetch user by name
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("name", name)
      .single();

    if (error || !user) return { success: false, message: "Incorrect recovery code or name" };

    // 2️⃣ Hash input recovery code
    const hashedInput = sha256(recoveryCode);

    // 3️⃣ Compare with hashed recovery code stored in column
    if (hashedInput !== user.recovery_code) {
      return { success: false, message: "Incorrect recovery code or name" };
    }

    // 4️⃣ Hash the new PIN
    const hashedPin = sha256(newPin);

    // 5️⃣ Update user PIN (and optionally reset attempts/lock)
    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update({
        pin: hashedPin,
        parentalAttempts: 0,
        parentalLockUntil: null,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      return { success: false, message: "Failed to reset PIN" };
    }

    return { success: true, user: updated };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Something went wrong" };
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
   ADD XP + LEVEL UP
========================= */
export async function addXP(userId, amount = 10) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("progress")
      .eq("id", userId)
      .single()

    if (error) throw error

    const progress = user.progress || {}
    const currentXP = (progress.xp || 0) + amount
    const currentLevel = progress.level || 1

    // Every 100 XP = 1 level (10 correct answers × 10 XP each)
    const newLevel = Math.floor(currentXP / 100) + 1

    const updatedProgress = {
      ...progress,
      xp: currentXP,
      level: newLevel,
    }

    const { data, error: updateError } = await supabase
      .from("users")
      .update({ progress: updatedProgress })
      .eq("id", userId)
      .select()
      .single()

    if (updateError) throw updateError
    return { xp: currentXP, level: newLevel, leveledUp: newLevel > currentLevel, user: data }
  } catch (err) {
    console.error("Error adding XP:", err)
    return null
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



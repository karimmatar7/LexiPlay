// src/utils/user.js
import { supabase } from '../supaBaseClient.js';
import { sha256 } from 'js-sha256';

/* =========================
   BROWSER-SAFE RECOVERY CODE GENERATOR
========================= */
function generateRecoveryCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    const randIndex = Math.floor(window.crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1) * chars.length);
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

    // Generate a 6-character recovery code
    const recoveryCode = generateRecoveryCode();
    const hashedRecovery = sha256(recoveryCode);

    const defaultProgress = {
      wordMatch: {
        level: 0,
        levelIndex: 0,
        score: 0,
        letterBuildUnlocked: false,
        rewardsEarned: [false, false, false],
      },
    };

    const defaultSettings = {
      fontType: 'normal',
      fontSize: 'medium',
      soundOn: true,
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
        },
      ])
      .select()
      .single();

    if (error) throw error;
    // return plain recovery code so you can show it to the kid
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

    // DON'T invalidate the recovery code - keep it for future use
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
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('progress')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

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

    const { data, error } = await supabase
      .from('users')
      .update({ progress: mergedProgress })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating progress:', err);
    return null;
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
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('settings')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const mergedSettings = {
      ...(user.settings || {}),
      ...newSettings,
    };

    const { data, error } = await supabase
      .from('users')
      .update({ settings: mergedSettings })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating settings:', err);
    return null;
  }
}

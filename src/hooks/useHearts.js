import { useState, useEffect, useRef } from "react";
import { updateProgress } from "../supabaseFunctions.js";

import { MAX_HEARTS, MINUTES_PER_HEART, MS_PER_HEART } from '../utils/heartConstants.js';

function resolveHearts(savedHearts, savedCooldown) {
  if (savedHearts >= MAX_HEARTS || !savedCooldown) {
    return { hearts: Math.min(savedHearts ?? MAX_HEARTS, MAX_HEARTS), cooldownUntil: null };
  }

  const now        = Date.now();
  const cooldownMs = new Date(savedCooldown).getTime();

  if (cooldownMs > now) {
    return { hearts: savedHearts, cooldownUntil: savedCooldown };
  }

  const elapsed        = now - cooldownMs;
  const heartsRegained = 1 + Math.floor(elapsed / MS_PER_HEART);
  const newHearts      = Math.min(savedHearts + heartsRegained, MAX_HEARTS);

  if (newHearts >= MAX_HEARTS) {
    return { hearts: MAX_HEARTS, cooldownUntil: null };
  }

  const timeUsed     = (heartsRegained - 1) * MS_PER_HEART;
  const nextCooldown = new Date(cooldownMs + timeUsed + MS_PER_HEART).toISOString();
  return { hearts: newHearts, cooldownUntil: nextCooldown };
}

/**
 * Given the next-heart cooldown timestamp and current hearts,
 * returns seconds until ALL missing hearts are refilled.
 * e.g. 3 hearts missing → nextCooldown + 2 × 12min
 */
function secondsUntilFull(cooldownIso, currentHearts) {
  if (!cooldownIso || currentHearts >= MAX_HEARTS) return null;
  const heartsNeeded  = MAX_HEARTS - currentHearts;
  const nextHeartMs   = new Date(cooldownIso).getTime();
  const fullRefillMs  = nextHeartMs + (heartsNeeded - 1) * MS_PER_HEART;
  return Math.max(0, Math.round((fullRefillMs - Date.now()) / 1000));
}

export function useHearts({ user, gameKey, initialHearts, initialCooldown }) {
  const [hearts,         setHearts]         = useState(null);
  const [cooldownUntil,  setCooldownUntil]  = useState(null);
  const [heartAnimating, setHeartAnimating] = useState(null);
  const [synced,         setSynced]         = useState(false);
  const [timeUntilFull,  setTimeUntilFull]  = useState(null); // seconds until ALL hearts back
  const [timeUntilNext,  setTimeUntilNext]  = useState(null); // seconds until NEXT single heart

  const heartsRef   = useRef(null);
  const cooldownRef = useRef(null);

  useEffect(() => { heartsRef.current   = hearts;       }, [hearts]);
  useEffect(() => { cooldownRef.current = cooldownUntil;}, [cooldownUntil]);

  // ── Initial sync ──────────────────────────────────────────────
  useEffect(() => {
    if (initialHearts === null || initialHearts === undefined) return;
    if (synced) return;

    const { hearts: resolvedHearts, cooldownUntil: resolvedCooldown } =
      resolveHearts(initialHearts, initialCooldown ?? null);

    setHearts(resolvedHearts);
    setCooldownUntil(resolvedCooldown);
    heartsRef.current   = resolvedHearts;
    cooldownRef.current = resolvedCooldown;
    setSynced(true);

    if (resolvedHearts !== initialHearts || resolvedCooldown !== initialCooldown) {
      updateProgress(user.id, {
        [gameKey]: { hearts: resolvedHearts, cooldownUntil: resolvedCooldown },
      });
    }
  }, [initialHearts, initialCooldown]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live tick ─────────────────────────────────────────────────
  useEffect(() => {
    if (!synced) return;

    const tick = async () => {
      const cd            = cooldownRef.current;
      const currentHearts = heartsRef.current;

      if (!cd || currentHearts === null || currentHearts >= MAX_HEARTS) {
        setTimeUntilNext(null);
        setTimeUntilFull(null);
        return;
      }

      // Next single heart countdown
      const nextSecs = Math.max(0, Math.round((new Date(cd) - Date.now()) / 1000));
      setTimeUntilNext(nextSecs);

      // Full refill countdown
      setTimeUntilFull(secondsUntilFull(cd, currentHearts));

      if (nextSecs <= 0) {
        const { hearts: newHearts, cooldownUntil: newCooldown } =
          resolveHearts(heartsRef.current, cooldownRef.current);

        setHearts(newHearts);
        heartsRef.current = newHearts;
        setCooldownUntil(newCooldown);
        cooldownRef.current = newCooldown;

        setTimeUntilNext(newCooldown ? Math.max(0, Math.round((new Date(newCooldown) - Date.now()) / 1000)) : null);
        setTimeUntilFull(newCooldown ? secondsUntilFull(newCooldown, newHearts) : null);

        await updateProgress(user.id, {
          [gameKey]: { hearts: newHearts, cooldownUntil: newCooldown },
        });
      }
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [synced]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Lose a heart ──────────────────────────────────────────────
  const loseHeart = async () => {
    if (heartsRef.current === null || heartsRef.current <= 0) return;

    const lostIndex = heartsRef.current - 1;
    setHeartAnimating(lostIndex);

    setTimeout(async () => {
      const newHearts = heartsRef.current - 1;
      setHearts(newHearts);
      heartsRef.current = newHearts;
      setHeartAnimating(null);

      let newCooldown = cooldownRef.current;
      if (!newCooldown || new Date(newCooldown) <= new Date()) {
        newCooldown = new Date(Date.now() + MS_PER_HEART).toISOString();
      }

      setCooldownUntil(newCooldown);
      cooldownRef.current = newCooldown;

      // Immediately update both timers after losing a heart
      setTimeUntilNext(Math.max(0, Math.round((new Date(newCooldown) - Date.now()) / 1000)));
      setTimeUntilFull(secondsUntilFull(newCooldown, newHearts));

      await updateProgress(user.id, {
        [gameKey]: { hearts: newHearts, cooldownUntil: newCooldown },
      });
    }, 450);
  };

  const isInCooldown = !!(cooldownUntil && new Date(cooldownUntil) > new Date());

  return {
    hearts:        hearts ?? MAX_HEARTS,
    setHearts,
    cooldownUntil,
    setCooldownUntil,
    heartAnimating,
    isInCooldown,
    loseHeart,
    maxHearts:     MAX_HEARTS,
    heartsReady:   synced,
    timeUntilNext, // seconds to next single heart (use for per-heart progress bar)
    timeUntilFull, // seconds until ALL hearts full (use for display label)
  };
}

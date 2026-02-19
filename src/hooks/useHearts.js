import { useState, useEffect, useRef } from "react";
import { updateProgress } from "../supabaseFunctions.js";

const MAX_HEARTS = 5;
const MINUTES_PER_HEART = 12;

export function useHearts({ user, gameKey, initialHearts, initialCooldown }) {
  const [hearts, setHearts] = useState(null);
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [heartAnimating, setHeartAnimating] = useState(null);
  const [synced, setSynced] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState(null); // seconds

  const heartsRef = useRef(null);
  const cooldownRef = useRef(null);

  useEffect(() => { heartsRef.current = hearts; }, [hearts]);
  useEffect(() => { cooldownRef.current = cooldownUntil; }, [cooldownUntil]);

  // Sync from DB once
  useEffect(() => {
    if (initialHearts === null || initialHearts === undefined) return;
    if (synced) return;
    setHearts(initialHearts);
    setCooldownUntil(initialCooldown ?? null);
    heartsRef.current = initialHearts;
    cooldownRef.current = initialCooldown ?? null;
    setSynced(true);
  }, [initialHearts, initialCooldown]);

  const isInCooldown = cooldownUntil && new Date(cooldownUntil) > new Date();

const loseHeart = async () => {
  if (heartsRef.current === null || heartsRef.current <= 0) return;

  const lostIndex = heartsRef.current - 1;
  setHeartAnimating(lostIndex);

  setTimeout(async () => {
    const newHearts = heartsRef.current - 1;
    setHearts(newHearts);
    heartsRef.current = newHearts;
    setHeartAnimating(null);

    // Only set cooldown if one isn't already running
    let newCooldown = cooldownRef.current;
    if (!newCooldown || new Date(newCooldown) <= new Date()) {
      const next = new Date();
      next.setMinutes(next.getMinutes() + MINUTES_PER_HEART);
      newCooldown = next.toISOString();
    }

    setCooldownUntil(newCooldown);
    cooldownRef.current = newCooldown;

    await updateProgress(user.id, {
      [gameKey]: { hearts: newHearts, cooldownUntil: newCooldown },
    });
  }, 450);
};



  // Master tick — every second: update countdown + refill heart if ready
  useEffect(() => {
    const tick = async () => {
      const cd = cooldownRef.current;
      const currentHearts = heartsRef.current;

      if (!cd || currentHearts === null || currentHearts >= MAX_HEARTS) {
        setTimeUntilNext(null);
        return;
      }

      const secondsLeft = Math.max(0, Math.round((new Date(cd) - new Date()) / 1000));
      setTimeUntilNext(secondsLeft);

      if (secondsLeft <= 0) {
        // Refill one heart immediately
        const newHearts = Math.min(currentHearts + 1, MAX_HEARTS);
        setHearts(newHearts);
        heartsRef.current = newHearts;

        let newCooldown = null;
        if (newHearts < MAX_HEARTS) {
          const next = new Date();
          next.setMinutes(next.getMinutes() + MINUTES_PER_HEART);
          newCooldown = next.toISOString();
        }

        setCooldownUntil(newCooldown);
        cooldownRef.current = newCooldown;
        setTimeUntilNext(newCooldown ? MINUTES_PER_HEART * 60 : null);

        await updateProgress(user.id, {
          [gameKey]: { hearts: newHearts, cooldownUntil: newCooldown },
        });
      }
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [synced]); // only depends on synced — refs handle fresh values

  return {
    hearts: hearts ?? MAX_HEARTS,
    setHearts,
    cooldownUntil,
    setCooldownUntil,
    heartAnimating,
    isInCooldown,
    loseHeart,
    maxHearts: MAX_HEARTS,
    heartsReady: synced,
    timeUntilNext, // seconds until next heart — use this for display
  };
}

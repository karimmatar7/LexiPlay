const MAX_HEARTS        = 5;
const MINUTES_PER_HEART = 12;
const MS_PER_HEART      = MINUTES_PER_HEART * 60 * 1000;

export function heartStatus(gameData) {
  if (!gameData) return null;
  const hearts         = gameData.hearts ?? MAX_HEARTS;
  const cooldown       = gameData.cooldownUntil ?? null;
  const cooldownActive = cooldown && new Date(cooldown) > new Date();
  const isRefilling    = cooldownActive && hearts < MAX_HEARTS;
  const outOfHearts    = hearts === 0 && !cooldownActive;

  let fullRefillAt = null;
  if (isRefilling && cooldown) {
    const heartsNeeded = MAX_HEARTS - hearts;
    fullRefillAt = new Date(new Date(cooldown).getTime() + (heartsNeeded - 1) * MS_PER_HEART);
  }

  return { hearts, isRefilling, outOfHearts, cooldown, fullRefillAt };
}

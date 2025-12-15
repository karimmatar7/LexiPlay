export function calculateStars(progressPercent) {
  if (progressPercent >= 100) return 3;
  if (progressPercent >= 70) return 2;
  if (progressPercent >= 35) return 1;
  return 0;
}

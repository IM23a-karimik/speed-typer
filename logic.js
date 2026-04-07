export function calculateWpm(correctKeystrokes, timeInMinutes) {
  if (timeInMinutes <= 0) return 0;
  return Math.round(correctKeystrokes / 5 / timeInMinutes);
}

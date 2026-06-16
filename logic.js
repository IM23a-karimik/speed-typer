export function calculateWpm(totalCorrectCharacters, elapsedMinutes) {
  if (elapsedMinutes <= 0) return 0;
  const words = totalCorrectCharacters / 5;
  const wpm = Math.round(words / elapsedMinutes);
  return wpm;
}

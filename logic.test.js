import { describe, it, expect } from 'vitest';
import { calculateWpm } from './logic.js';

describe('WPM Calculator', () => {
  it('sollte die WPM korrekt berechnen', () => {
    // Arrange (Vorbereitung)
    const correctKeystrokes = 250; // 50 Wörter getippt
    const timeInMinutes = 1; // in 1 Minute

    // Act (Ausführung)
    const result = calculateWpm(correctKeystrokes, timeInMinutes);

    // Assert (Überprüfung)
    expect(result).not.toBeNull();
    expect(result).toBe(50);
  });
});

import {describe, it, expect} from 'vitest';
import {calculateWpm} from './logic.js';

describe('WPM Calculator', () => {
  // --- ERSTER TEST (LU05.A01) ---
  it('sollte die WPM korrekt berechnen', () => {
    // Arrange
    const correctKeystrokes = 250;
    const timeInMinutes = 1;

    // Act
    const result = calculateWpm(correctKeystrokes, timeInMinutes);

    // Assert
    expect(result).not.toBeNull();
    expect(result).toBe(50);
  });

  // --- ZWEITER TEST (LU05.A02) ---
  it('sollte 0 WPM zurückgeben, wenn die Zeit 0 ist (Edge Case)', () => {
    // Arrange
    const correctKeystrokes = 100; // Selbst wenn Tasten gedrückt wurden...
    const timeInMinutes = 0;       // ...aber keine Zeit vergangen ist.

    // Act
    const result = calculateWpm(correctKeystrokes, timeInMinutes);

    // Assert
    expect(result).not.toBeNull();
    expect(result).toBe(0); // Erwartung: 0, da wir Division durch 0 abfangen
  });
});

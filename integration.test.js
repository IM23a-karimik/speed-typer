import { describe, it, expect } from 'vitest';
import { GameManager } from './GameManager.js';
import { QuoteServiceStub } from './tests/doubles/QuoteServiceStub.js';
import { ScoreServiceFake } from './tests/doubles/ScoreServiceFake.js';
import { LoggerSpy } from './tests/doubles/LoggerSpy.js';

describe('GameManager Integration Tests', () => {
  it('sollte das Zusammenspiel der Services bei Spielende testen (Normalfall)', () => {
    // 1. Arrange: Wir bauen den Manager mit unseren Doubles zusammen!
    const stub = new QuoteServiceStub();
    const fake = new ScoreServiceFake();
    const spy = new LoggerSpy();
    const manager = new GameManager(stub, fake, spy);

    // 2. Act: Wir rufen die Hauptmethode auf
    const message = manager.endSession(50);

    // 3. Assert: Wir prüfen, ob alle Systeme richtig integriert sind
    expect(spy.callCount).toBe(1); // Hat der Logger etwas empfangen?
    expect(spy.lastMessage).toContain('50'); // Wurde die richtige WPM geloggt?
    expect(fake.scores).toContain(50); // Hat der Fake-Speicher die 50 gespeichert?
    expect(message).toBe('STUB_ANTWORT'); // Hat der Stub geantwortet?
  });

  it('sollte bei 0 WPM den ScoreService ignorieren (Edge Case)', () => {
    // Arrange
    const stub = new QuoteServiceStub();
    const fake = new ScoreServiceFake();
    const spy = new LoggerSpy();
    const manager = new GameManager(stub, fake, spy);

    // Act
    manager.endSession(0);

    // Assert
    expect(spy.callCount).toBe(1); // Es sollte trotzdem geloggt werden
    expect(fake.scores.length).toBe(0); // ABER das Array muss leer bleiben!
  });
});

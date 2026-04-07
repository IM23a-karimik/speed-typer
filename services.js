export class QuoteService {
  getMotivationalQuote() {
    return 'Gut gemacht! Mach gleich noch eine Runde!';
  }
}

export class ScoreService {
  saveScore(wpm) {
    // Speichert den Score im echten Browser-Speicher
    localStorage.setItem('highscore', wpm);
  }
}

export class LoggerService {
  log(message) {
    console.log('[GAME LOG] ' + message);
  }
}

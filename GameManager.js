export class GameManager {
  constructor(quoteService, scoreService, loggerService) {
    this.quoteService = quoteService;
    this.scoreService = scoreService;
    this.loggerService = loggerService;
  }

  // Diese Methode testen wir!
  endSession(wpm) {
    this.loggerService.log('Spielrunde beendet mit WPM: ' + wpm);

    if (wpm > 0) {
      this.scoreService.saveScore(wpm);
    }

    return this.quoteService.getMotivationalQuote();
  }
}

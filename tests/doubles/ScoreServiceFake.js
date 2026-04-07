export class ScoreServiceFake {
  constructor() {
    this.scores = [];
  }

  saveScore(wpm) {
    this.scores.push(wpm); // Speichert nur temporär im RAM
  }
}

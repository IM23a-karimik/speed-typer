export class LoggerSpy {
  constructor() {
    this.callCount = 0;
    this.lastMessage = '';
  }

  log(message) {
    this.callCount++;
    this.lastMessage = message;
  }
}

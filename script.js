import { calculateWpm } from './logic.js';

// 1. Array mit verschiedenen Texten/Sätzen
const quotes = [
  'Das ist ein einfacher Text zum Üben.',
  'Programmieren macht Spass, wenn es funktioniert.',
  'Jeder Fehler ist eine neue Gelegenheit zu lernen.',
  'Schnelles Tippen spart dir auf Dauer sehr viel Zeit.',
  'JavaScript ist die Sprache des Internets.',
  'Ein guter Entwickler liest mehr Code als er schreibt.',
];

// 2. HTML-Elemente holen
const quoteDisplayElement = document.getElementById('quote-display');
const quoteInputElement = document.getElementById('quote-input');
const timerElement = document.getElementById('timer');
const wpmElement = document.getElementById('wpm');
const restartBtn = document.getElementById('restart-btn');

// --- NEU: Variablen für das Spiel ---
let timeLeft = 10;
let timerInterval = null;
let isStarted = false;
let completedKeystrokes = 0; // Speichert die Anschläge von bereits fertigen Sätzen

// 3. Funktion: Neuen Text anzeigen
function renderNewQuote() {
  quoteDisplayElement.innerHTML = '';
  quoteInputElement.value = '';

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  randomQuote.split('').forEach((character) => {
    const characterSpan = document.createElement('span');
    characterSpan.innerText = character;
    quoteDisplayElement.appendChild(characterSpan);
  });

  if (quoteDisplayElement.firstChild) {
    quoteDisplayElement.firstChild.classList.add('active');
  }
}

// --- NEU: Timer starten ---
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval); // Stoppt die Uhr
      endGame();
    }
  }, 1000);
}

// --- NEU: Spiel beenden und WPM berechnen ---
function endGame() {
  quoteInputElement.disabled = true; // Sperrt das Eingabefeld

  // Wir zählen alle Tasten von fertigen Sätzen + die richtigen Tasten vom aktuellen Satz
  const correctInCurrentQuote = quoteDisplayElement.querySelectorAll('.correct').length;
  const totalCorrect = completedKeystrokes + correctInCurrentQuote;

  // Standard-Formel für WPM: (Alle richtigen Tasten / 5) / Zeit in Minuten
  // Da unser Spiel genau 1 Minute geht, teilen wir einfach nur durch 5.
  const wpm = calculateWpm(totalCorrect, 1);
  wpmElement.innerText = wpm;

  // Nachricht an den Spieler
  quoteDisplayElement.innerHTML = `<span style="color: #4CAF50;">Zeit abgelaufen! Deine WPM: ${wpm}</span>`;
}

// --- NEU: Neustart-Button Logik ---
restartBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timeLeft = 10;
  timerElement.innerText = timeLeft;
  wpmElement.innerText = '0';
  isStarted = false;
  completedKeystrokes = 0;
  quoteInputElement.disabled = false; // Eingabefeld wieder freigeben
  quoteInputElement.focus(); // Cursor direkt wieder reinsetzen
  renderNewQuote();
});

// 4. Die Tipp-Logik
quoteInputElement.addEventListener('input', () => {
  // Wenn das Spiel noch nicht läuft, starte den Timer beim ersten Tastendruck!
  if (!isStarted) {
    isStarted = true;
    startTimer();
  }

  const arrayQuote = quoteDisplayElement.querySelectorAll('span');
  const arrayValue = quoteInputElement.value.split('');
  let allCorrect = true;

  arrayQuote.forEach((characterSpan, index) => {
    const character = arrayValue[index];

    if (character == null) {
      characterSpan.classList.remove('correct', 'incorrect', 'active');
      allCorrect = false;
      if (arrayValue.length === index) characterSpan.classList.add('active');
    } else if (character === characterSpan.innerText) {
      characterSpan.classList.add('correct');
      characterSpan.classList.remove('incorrect', 'active');
    } else {
      characterSpan.classList.remove('correct', 'active');
      characterSpan.classList.add('incorrect');
      allCorrect = false;
    }
  });

  if (allCorrect) {
    // Satz ist fertig! Wir merken uns die Anzahl der Tasten für die WPM-Berechnung
    completedKeystrokes += arrayQuote.length;
    renderNewQuote();
  }
});

// Spiel initialisieren
renderNewQuote();

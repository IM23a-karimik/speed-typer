import { calculateWpm } from './logic.js';

// 1. Array mit verschiedenen Texten/Sätzen
const quotes = [
  'Das ist ein einfacher Text zum Ueben. ',
  'Programmieren macht Spass, wenn es funktioniert. ',
  'Jeder Fehler ist eine neue Gelegenheit zu lernen. ',
  'Schnelles Tippen spart dir auf Dauer sehr viel Zeit. ',
  'JavaScript ist die Sprache des Internets. ',
  'Ein guter Entwickler liest mehr Code als er schreibt. ',
];

// 2. HTML-Elemente holen (angepasst an das neue HTML)
const textTrack = document.getElementById('text-track');
const typingWindow = document.getElementById('typing-window');
const timerElement = document.getElementById('timer');
const wpmElement = document.getElementById('wpm');
const restartBtn = document.getElementById('restart-btn');

// Variablen für das Spiel
let timeLeft = 60; // Habe es auf 60 Sekunden gestellt, damit die WPM-Berechnung perfekt stimmt!
let timerInterval = null;
let isStarted = false;
let currentIndex = 0;

// --- NEU: Einen sehr langen Text generieren ---
function generateLongText() {
  let longArray = [];
  // Wir kopieren und mischen die Sätze 10 Mal, damit uns der Text nicht ausgeht
  for (let i = 0; i < 10; i++) {
    longArray = longArray.concat([...quotes].sort(() => Math.random() - 0.5));
  }
  return longArray.join('');
}

// 3. Funktion: Spiel vorbereiten und Text rendern
function initGame() {
  textTrack.innerHTML = '';
  currentIndex = 0;

  const text = generateLongText();

  // Jeden Buchstaben in ein <span> packen
  text.split('').forEach((character, index) => {
    const span = document.createElement('span');
    span.innerText = character;
    span.classList.add('char');
    if (index === 0) span.classList.add('active'); // Start-Cursor
    textTrack.appendChild(span);
  });

  updateScrollPosition();
}

// 4. Timer starten
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

// 5. Spiel beenden und WPM berechnen
function endGame() {
  // Wir zählen einfach, wie viele Buchstaben die Klasse "correct" haben
  const totalCorrect = textTrack.querySelectorAll('.correct').length;

  // WPM berechnen (Wir nutzen deine Funktion. 1 Minute = 1)
  const wpm = calculateWpm(totalCorrect, 1);
  wpmElement.innerText = wpm;

  // Schöne End-Nachricht direkt im Text-Band anzeigen
  textTrack.style.transform = 'translateX(0px)'; // Wieder in die Mitte schieben
  textTrack.innerHTML = `<span style="color: #4CAF50; font-family: sans-serif;">Zeit abgelaufen! Deine WPM: ${wpm}</span>`;
}

// 6. Neustart-Button Logik
restartBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timeLeft = 60; // Wieder auf 60 Sekunden
  timerElement.innerText = timeLeft;
  wpmElement.innerText = '0';
  isStarted = false;
  initGame(); // Generiert ein neues Text-Band
});

// 7. --- DIE NEUE TIPP-LOGIK (Scrollend) ---
document.addEventListener('keydown', (e) => {
  // Wenn die Zeit abgelaufen ist, darf nicht mehr getippt werden
  if (timeLeft <= 0) return;

  const spans = document.querySelectorAll('.char');
  if (currentIndex >= spans.length) return;

  // BACKSPACE-LOGIK (Löschen)
  if (e.key === 'Backspace' && currentIndex > 0) {
    spans[currentIndex].classList.remove('active'); // Aktuellen Cursor entfernen
    currentIndex--; // Einen Schritt zurück
    spans[currentIndex].classList.remove('correct', 'incorrect'); // Farbe weg
    spans[currentIndex].classList.add('active'); // Cursor dorthin setzen
    updateScrollPosition(); // Kamera zurückschieben
    return;
  }

  // Ignoriere Tasten wie Shift, Strg, Alt (die sind länger als 1 Zeichen, z.B. "Shift")
  if (e.key.length !== 1) return;

  // Starte den Timer beim allerersten Buchstaben
  if (!isStarted) {
    isStarted = true;
    startTimer();
  }

  const currentSpan = spans[currentIndex];
  const typedChar = e.key;

  // Prüfen, ob der Buchstabe stimmt
  if (typedChar === currentSpan.innerText) {
    currentSpan.classList.add('correct');
  } else {
    currentSpan.classList.add('incorrect');
  }

  // Cursor weiterbewegen
  currentSpan.classList.remove('active');
  currentIndex++;

  if (currentIndex < spans.length) {
    spans[currentIndex].classList.add('active');
  }

  // Kamera-Scroll-Effekt auslösen
  updateScrollPosition();
});

// 8. Das magische Scrolling
function updateScrollPosition() {
  const spans = document.querySelectorAll('.char');
  if (currentIndex >= spans.length) return;

  const currentSpan = spans[currentIndex];

  // Berechnet genau die Mitte des Fensters
  const containerHalfWidth = typingWindow.offsetWidth / 2;
  const offsetLeft = currentSpan.offsetLeft;

  // Schiebt das Band so, dass der Buchstabe exakt in der Mitte sitzt
  const centerPosition = containerHalfWidth - offsetLeft;
  textTrack.style.transform = `translateX(${centerPosition}px)`;
}

// Spiel ganz am Anfang einmal starten
initGame();

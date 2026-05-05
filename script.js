import { calculateWpm } from './logic.js';

const quotes = [
  'Das ist ein einfacher Text zum Ueben. ',
  'Programmieren macht Spass, wenn es funktioniert. ',
  'Jeder Fehler ist eine neue Gelegenheit zu lernen. ',
  'Schnelles Tippen spart dir auf Dauer sehr viel Zeit. ',
  'JavaScript ist die Sprache des Internets. ',
  'Ein guter Entwickler liest mehr Code als er schreibt. ',
];

const textTrack = document.getElementById('text-track');
const typingWindow = document.getElementById('typing-window');
const timerElement = document.getElementById('timer');
const wpmElement = document.getElementById('wpm');
const restartBtn = document.getElementById('restart-btn');
const timeOptions = document.querySelectorAll('.time-opt');

let selectedTime = 60; // Standardzeit
let timeLeft = selectedTime;
let timerInterval = null;
let isStarted = false;
let currentIndex = 0;

// --- ZEIT-AUSWAHL LOGIK ---
timeOptions.forEach((option) => {
  option.addEventListener('click', (e) => {
    // Aktive Klasse verschieben
    timeOptions.forEach((opt) => opt.classList.remove('active'));
    e.target.classList.add('active');

    // Neue Zeit übernehmen und Spiel resetten
    selectedTime = parseInt(e.target.getAttribute('data-time'), 10);
    resetGame();
  });
});

function generateLongText() {
  let longArray = [];
  for (let i = 0; i < 10; i++) {
    longArray = longArray.concat([...quotes].sort(() => Math.random() - 0.5));
  }
  return longArray.join('');
}

function initGame() {
  textTrack.innerHTML = '';
  currentIndex = 0;
  const text = generateLongText();

  text.split('').forEach((character, index) => {
    const span = document.createElement('span');
    span.innerText = character;
    span.classList.add('char');
    if (index === 0) span.classList.add('active');
    textTrack.appendChild(span);
  });

  updateScrollPosition();
}

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

function endGame() {
  const totalCorrect = textTrack.querySelectorAll('.correct').length;
  // WPM Formel anpassen: Wie viel Anteil einer Minute war eingestellt?
  const minutesPassed = selectedTime / 60;
  const wpm = calculateWpm(totalCorrect, minutesPassed);

  wpmElement.innerText = wpm;

  textTrack.style.transform = 'translateX(0px)';
  textTrack.innerHTML = `<span style="color: var(--accent); font-family: 'Inter', sans-serif;">Zeit abgelaufen! Deine WPM: ${wpm}</span>`;
}

// Ausgelagerte Reset-Funktion, da sie nun vom Button UND den Zeit-Optionen gebraucht wird
function resetGame() {
  clearInterval(timerInterval);
  timeLeft = selectedTime;
  timerElement.innerText = timeLeft;
  wpmElement.innerText = '0';
  isStarted = false;
  initGame();
}

restartBtn.addEventListener('click', resetGame);

document.addEventListener('keydown', (e) => {
  if (timeLeft <= 0) return;

  const spans = document.querySelectorAll('.char');
  if (currentIndex >= spans.length) return;

  if (e.key === 'Backspace' && currentIndex > 0) {
    spans[currentIndex].classList.remove('active');
    currentIndex--;
    spans[currentIndex].classList.remove('correct', 'incorrect');
    spans[currentIndex].classList.add('active');
    updateScrollPosition();
    return;
  }

  if (e.key.length !== 1) return;

  if (!isStarted) {
    isStarted = true;
    startTimer();
  }

  const currentSpan = spans[currentIndex];
  const typedChar = e.key;

  if (typedChar === currentSpan.innerText) {
    currentSpan.classList.add('correct');
  } else {
    currentSpan.classList.add('incorrect');
  }

  currentSpan.classList.remove('active');
  currentIndex++;

  if (currentIndex < spans.length) {
    spans[currentIndex].classList.add('active');
  }

  updateScrollPosition();
});

function updateScrollPosition() {
  const spans = document.querySelectorAll('.char');
  if (currentIndex >= spans.length) return;

  const currentSpan = spans[currentIndex];
  const containerHalfWidth = typingWindow.offsetWidth / 2;
  const offsetLeft = currentSpan.offsetLeft;

  const centerPosition = containerHalfWidth - offsetLeft;
  textTrack.style.transform = `translateX(${centerPosition}px)`;
}

initGame();

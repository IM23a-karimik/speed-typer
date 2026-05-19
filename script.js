import { calculateWpm } from './logic.js';

const sentencesPool = [
  'Programmieren ist die Kunst, Algorithmen in ausfuehrbaren Code zu verwandeln.',
  'Ein guter Entwickler liest deutlich mehr Code, als er selbst schreibt.',
  'Jeder Fehler ist eine neue Gelegenheit, etwas Wichtiges zu lernen.',
  'Technologie entwickelt sich rasant, aber die Grundlagen bleiben gleich.',
  'Wer aufhoert, besser werden zu wollen, hat aufgehoert, gut zu sein.',
  'Ein sauberer Code ist wie ein Buch, er erklaert sich von selbst.',
  'Das Internet hat die Art und Weise, wie wir kommunizieren, veraendert.',
  'Schnelles Tippen spart dir auf Dauer sehr viel Zeit am Computer.',
  'Es ist besser, eine Aufgabe richtig zu machen, als sie zweimal zu tun.',
  'Kuenstliche Intelligenz wird uns helfen, noch kreativer zu arbeiten.',
];

const typingArea = document.getElementById('typing-area');
const statusLine = document.getElementById('status-line');
const restartBtn = document.getElementById('restart-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const valBtns = document.querySelectorAll('.val-btn');
const progressBar = document.getElementById('progress-bar');

// Modal Elemente
const resultModal = document.getElementById('result-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalRestartBtn = document.getElementById('modal-restart-btn');
const finalWpmDisplay = document.getElementById('final-wpm');
const finalAccDisplay = document.getElementById('final-acc');
const finalErrorsDisplay = document.getElementById('final-errors');

let currentMode = 'time';
let currentValue = 5; // Startwert passend zu deinen HTML Buttons
let timerInterval = null;
let isStarted = false;
let isGameOver = false;
let currentIndex = 0;
let charElements = [];
let startTime = null;

let totalKeystrokes = 0;
let errorsCount = 0;

function generateTextArray() {
  let shuffled = [...sentencesPool].sort(() => 0.5 - Math.random());

  while (shuffled.length < 15) {
    shuffled = shuffled.concat([...sentencesPool].sort(() => 0.5 - Math.random()));
  }

  const fullText = shuffled.join(' ');
  let wordsArray = fullText.split(' ');

  if (currentMode === 'words') {
    wordsArray = wordsArray.slice(0, currentValue);
  } else {
    wordsArray = wordsArray.slice(0, 150);
  }

  return wordsArray;
}

function initGame() {
  typingArea.innerHTML = '';
  charElements = [];
  currentIndex = 0;
  totalKeystrokes = 0;
  errorsCount = 0;
  isStarted = false;
  isGameOver = false;
  resultModal.classList.add('hidden');
  clearInterval(timerInterval);
  statusLine.innerText = currentMode === 'time' ? currentValue : `${currentValue} W.`;

  // Progress Bar zurücksetzen
  progressBar.style.width = currentMode === 'time' ? '100%' : '0%';
  progressBar.classList.remove('danger');

  const words = generateTextArray();

  words.forEach((word, wordIdx) => {
    const wordDiv = document.createElement('div');
    wordDiv.className = 'word';

    word.split('').forEach((char) => {
      const span = document.createElement('span');
      span.innerText = char;
      span.className = 'char';
      wordDiv.appendChild(span);
      charElements.push(span);
    });

    if (wordIdx < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.innerText = ' ';
      spaceSpan.className = 'char space-char';
      wordDiv.appendChild(spaceSpan);
      charElements.push(spaceSpan);
    }

    typingArea.appendChild(wordDiv);
  });

  if (charElements.length > 0) {
    charElements[0].classList.add('active');
  }
}

modeBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    modeBtns.forEach((b) => b.classList.remove('active'));
    e.target.classList.add('active');
    currentMode = e.target.dataset.mode;
    initGame();
  });
});

valBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    valBtns.forEach((b) => b.classList.remove('active'));
    e.target.classList.add('active');
    currentValue = parseInt(e.target.dataset.val, 10);
    initGame();
  });
});

document.addEventListener('keydown', (e) => {
  if (isGameOver) return;
  if (e.key === 'Escape') {
    initGame();
    return;
  }
  if (e.key.length !== 1 && e.key !== 'Backspace') return;
  if (e.key === ' ') e.preventDefault();
  if (currentIndex >= charElements.length) return;

  if (!isStarted) {
    isStarted = true;
    startTime = Date.now();
    startTimer();
  }

  if (e.key === 'Backspace' && currentIndex > 0) {
    charElements[currentIndex].classList.remove('active');
    currentIndex--;
    charElements[currentIndex].classList.remove('correct', 'incorrect');
    charElements[currentIndex].classList.add('active');
    charElements[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (e.key.length === 1) {
    totalKeystrokes++;
    const currentSpan = charElements[currentIndex];

    if (e.key === currentSpan.innerText) {
      currentSpan.classList.add('correct');
    } else {
      currentSpan.classList.add('incorrect');
      errorsCount++;
    }

    currentSpan.classList.remove('active');
    currentIndex++;

    // Balken auffüllen im Wörter-Modus
    if (currentMode === 'words') {
      const percentage = (currentIndex / charElements.length) * 100;
      progressBar.style.width = `${percentage}%`;
      progressBar.style.transition = 'width 0.1s linear';
    }

    if (currentIndex < charElements.length) {
      charElements[currentIndex].classList.add('active');
      charElements[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (currentMode === 'words') {
      endGame();
    }
  }
});

function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    if (currentMode === 'time') {
      const left = currentValue - elapsed;
      statusLine.innerText = left;

      // Balken verkleinern und rot machen
      const percentage = (left / currentValue) * 100;
      progressBar.style.width = `${percentage}%`;
      if (left <= 3) progressBar.classList.add('danger');

      if (left <= 0) endGame();
    } else {
      statusLine.innerText = `${elapsed}s`;
    }
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  isStarted = false;
  isGameOver = true;

  const totalCorrect = document.querySelectorAll('.char.correct').length;
  let elapsedMinutes = (Date.now() - startTime) / 60000;
  if (elapsedMinutes <= 0) {
    elapsedMinutes = currentValue / 60;
  }

  const wpm = calculateWpm(totalCorrect, elapsedMinutes);

  let accuracy = 100;
  if (totalKeystrokes > 0) {
    accuracy = Math.max(0, Math.round(((totalKeystrokes - errorsCount) / totalKeystrokes) * 100));
  }

  finalWpmDisplay.innerText = wpm;
  finalAccDisplay.innerText = `${accuracy}%`;
  finalErrorsDisplay.innerText = errorsCount;

  resultModal.classList.remove('hidden');
}

restartBtn.addEventListener('click', initGame);
closeModalBtn.addEventListener('click', initGame);
modalRestartBtn.addEventListener('click', initGame);

initGame();

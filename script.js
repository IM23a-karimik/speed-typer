import { calculateWpm } from './logic.js';

// NEU: Datenbank mit Sätzen in 3 Sprachen
const sentencesData = {
  de: [
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
  ],
  en: [
    'Programming is the art of turning algorithms into executable code.',
    'A good developer reads significantly more code than they write.',
    'Every mistake is a new opportunity to learn something important.',
    'Technology evolves rapidly, but the fundamentals remain the same.',
    'He who stops wanting to become better has stopped being good.',
    'Clean code is like a book, it explains itself.',
    'The internet has changed the way we communicate.',
    'Fast typing saves you a lot of time on the computer.',
    'It is better to do a task right than to do it twice.',
    'Artificial intelligence will help us work even more creatively.',
  ],
  es: [
    'Programar es el arte de convertir algoritmos en codigo ejecutable.',
    'Un buen desarrollador lee mucho mas codigo del que escribe.',
    'Cada error es una nueva oportunidad para aprender algo importante.',
    'La tecnologia evoluciona rapidamente, pero los fundamentos son los mismos.',
    'Quien deja de mejorar, ha dejado de ser bueno.',
    'El codigo limpio es como un libro, se explica por si mismo.',
    'Internet ha cambiado la forma en que nos comunicamos.',
    'Escribir rapido te ahorra mucho tiempo en la computadora.',
    'Es mejor hacer una tarea bien que hacerla dos veces.',
    'La inteligencia artificial nos ayudara a ser mas creativos.',
  ]
};

const typingArea = document.getElementById('typing-area');
const statusLine = document.getElementById('status-line');
const restartBtn = document.getElementById('restart-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const valBtns = document.querySelectorAll('.val-btn');
const themeBtns = document.querySelectorAll('.theme-btn');
const langBtns = document.querySelectorAll('.lang-btn'); // NEU
const progressBar = document.getElementById('progress-bar');

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsModalBtn = document.getElementById('close-settings-modal');

const resultModal = document.getElementById('result-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalRestartBtn = document.getElementById('modal-restart-btn');
const finalWpmDisplay = document.getElementById('final-wpm');
const finalAccDisplay = document.getElementById('final-acc');
const finalErrorsDisplay = document.getElementById('final-errors');

let currentLang = 'de'; // Standardsprache
let currentMode = 'time';
let currentValue = 5;
let timerInterval = null;
let isStarted = false;
let isGameOver = false;
let currentIndex = 0;
let charElements = [];
let startTime = null;

let totalKeystrokes = 0;
let errorsCount = 0;

function generateTextArray() {
  // Wählt den richtigen Pool basierend auf der aktuellen Sprache
  const pool = sentencesData[currentLang];
  let shuffled = [...pool].sort(() => 0.5 - Math.random());

  while (shuffled.length < 15) {
    shuffled = shuffled.concat([...pool].sort(() => 0.5 - Math.random()));
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

// Settings & Modal Logik
settingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('hidden');
});

closeSettingsModalBtn.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

// NEU: Event-Listener für die Sprachen
langBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    langBtns.forEach((b) => b.classList.remove('active'));
    e.target.classList.add('active');
    currentLang = e.target.dataset.lang;
    initGame();
  });
});

themeBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    themeBtns.forEach((b) => b.classList.remove('active'));
    e.target.classList.add('active');

    const selectedTheme = e.target.dataset.theme;
    document.body.className = '';
    if (selectedTheme !== 'default') {
      document.body.classList.add(selectedTheme);
    }
  });
});

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
  if (!settingsModal.classList.contains('hidden') || isGameOver) return;

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

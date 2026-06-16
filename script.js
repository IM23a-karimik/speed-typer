import { calculateWpm } from './logic.js';

const sentencesData = {
  de: [
    'Programmieren ist die Kunst, Algorithmen in ausführbaren Code zu verwandeln.',
    'Ein guter Entwickler liest deutlich mehr Code, als er selbst schreibt.',
    'Jeder Fehler ist eine neue Gelegenheit, etwas Wichtiges zu lernen.',
    'Technologie entwickelt sich rasant, aber die Grundlagen bleiben gleich.',
    'Ein sauberer Code ist wie ein Buch, er erklärt sich von selbst.',
  ],
  en: [
    'Programming is the art of turning algorithms into executable code.',
    'A good developer reads significantly more code than they write.',
    'Every mistake is a new opportunity to learn something important.',
    'Technology evolves rapidly, but the fundamentals remain the same.',
    'Clean code is like a book, it explains itself.',
  ],
  es: [
    'Programar es el arte de convertir algoritmos en codigo ejecutable.',
    'Un buen desarrollador lee mucho mas codigo del que escribe.',
    'Cada error es una nueva oportunidad para aprender algo importante.',
    'La tecnologia evoluciona rapidamente, pero los fundamentos son los mismos.',
    'El codigo limpio es como un libro, se explica por si mismo.',
  ],
  code: [
    'const str = "Hello World";',
    'function sum(a, b) { return a + b; }',
    'let items = array.map(x => x * 2);',
    'if (isTrue) { execute(); } else { return false; }',
    'console.log("Debugging is fun!");',
    'document.getElementById("app").innerHTML = "Done";',
  ],
};

const typingArea = document.getElementById('typing-area');
const statusLine = document.getElementById('status-line');
const restartBtn = document.getElementById('restart-btn');
const progressBar = document.getElementById('progress-bar');
const startHint = document.getElementById('start-hint');
const wpmChart = document.getElementById('wpm-chart');
const historyList = document.getElementById('history-list');

// Settings Elements
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsModalBtn = document.getElementById('close-settings-modal');

// Buttons Arrays
const langBtns = document.querySelectorAll('.lang-btn');
const themeBtns = document.querySelectorAll('.theme-btn');
const diffBtns = document.querySelectorAll('.diff-btn');
const soundBtns = document.querySelectorAll('.sound-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const valBtns = document.querySelectorAll('.val-btn');

// Result Elements
const resultModal = document.getElementById('result-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalRestartBtn = document.getElementById('modal-restart-btn');
const finalWpmDisplay = document.getElementById('final-wpm');
const finalAccDisplay = document.getElementById('final-acc');
const finalErrorsDisplay = document.getElementById('final-errors');
const finalRawWpmDisplay = document.getElementById('final-raw-wpm');
const caretBtns = document.querySelectorAll('.caret-btn');

// Game State
let currentCaret = 'line';
let currentLang = 'de';
let currentTheme = 'default';
let currentDiff = 'hard'; // 'normal' = kleinbuchstaben, keine satzzeichen
let soundEnabled = true;
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
let wpmHistory = [];

// Audio Setup (Web Audio API)
let audioCtx;

function playTypingSound(isError) {
  if (!soundEnabled) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  if (isError) {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }
}

// Local Storage History
function loadHistory() {
  const history = JSON.parse(localStorage.getItem('speedTyperHistory')) || [];
  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.innerHTML = '<li>Noch keine Spiele absolviert.</li>';
    return;
  }
  history.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>📅 ${item.date}</span> <span>⚡ ${item.wpm} WPM | 🎯 ${item.acc}%</span>`;
    historyList.appendChild(li);
  });
}

function saveToHistory(wpm, acc) {
  const history = JSON.parse(localStorage.getItem('speedTyperHistory')) || [];
  const date = new Date().toLocaleDateString('de-DE', { hour: '2-digit', minute: '2-digit' });
  history.unshift({ wpm, acc, date });
  if (history.length > 5) history.pop();
  localStorage.setItem('speedTyperHistory', JSON.stringify(history));
  loadHistory();
}

function generateTextArray() {
  const pool = sentencesData[currentLang];
  let shuffled = [...pool].sort(() => 0.5 - Math.random());
  while (shuffled.length < 15) {
    shuffled = shuffled.concat([...pool].sort(() => 0.5 - Math.random()));
  }

  let fullText = shuffled.join(' ');

  // Normal Mode: Alles klein, keine Satzzeichen
  if (currentDiff === 'normal') {
    fullText = fullText.toLowerCase().replace(/[.,;:!?]/g, '');
  }

  let wordsArray = fullText.split(' ');
  if (currentMode === 'words') {
    wordsArray = wordsArray.slice(0, currentValue);
  } else {
    wordsArray = wordsArray.slice(0, 150);
  }
  return wordsArray;
}

function initGame() {
  document.body.classList.remove('zen-mode');

  typingArea.innerHTML = '';
  charElements = [];
  currentIndex = 0;
  totalKeystrokes = 0;
  errorsCount = 0;
  wpmHistory = [];
  isStarted = false;
  isGameOver = false;

  startHint.classList.remove('hidden');
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

  if (charElements.length > 0) charElements[0].classList.add('active');
}

// Local Storage Settings
function saveSettings() {
  const settings = {
    currentLang,
    currentTheme,
    currentDiff,
    soundEnabled,
    currentMode,
    currentValue,
    currentCaret,
  };
  localStorage.setItem('speedTyperSettings', JSON.stringify(settings));
}

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem('speedTyperSettings'));
  if (!saved) return;
  currentLang = saved.currentLang;
  currentTheme = saved.currentTheme;
  currentDiff = saved.currentDiff;
  soundEnabled = saved.soundEnabled;
  currentMode = saved.currentMode;
  currentValue = saved.currentValue;
  currentCaret = saved.currentCaret;

  if (currentTheme !== 'default') document.body.classList.add(currentTheme);
  typingArea.className = `typing-area caret-${currentCaret}`;

  document.querySelector(`.lang-btn[data-lang="${currentLang}"]`)?.click();
  document.querySelector(`.diff-btn[data-diff="${currentDiff}"]`)?.click();
  document.querySelector(`.theme-btn[data-theme="${currentTheme}"]`)?.click();
  document.querySelector(`.sound-btn[data-sound="${soundEnabled ? 'on' : 'off'}"]`)?.click();
  document.querySelector(`.mode-btn[data-mode="${currentMode}"]`)?.click();
  document.querySelector(`.val-btn[data-val="${currentValue}"]`)?.click();
  document.querySelector(`.caret-btn[data-caret="${currentCaret}"]`)?.click();
}

// Event Listeners for Settings
function setupToggleButtons(nodeList, updateVarFn) {
  nodeList.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      nodeList.forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');
      updateVarFn(e.target);
      saveSettings();
      initGame();
    });
  });
}

setupToggleButtons(langBtns, (t) => (currentLang = t.dataset.lang));
setupToggleButtons(diffBtns, (t) => (currentDiff = t.dataset.diff));
setupToggleButtons(soundBtns, (t) => (soundEnabled = t.dataset.sound === 'on'));
setupToggleButtons(modeBtns, (t) => (currentMode = t.dataset.mode));
setupToggleButtons(valBtns, (t) => (currentValue = parseInt(t.dataset.val, 10)));
setupToggleButtons(caretBtns, (t) => {
  currentCaret = t.dataset.caret;
  typingArea.className = `typing-area caret-${currentCaret}`;
});

themeBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    themeBtns.forEach((b) => b.classList.remove('active'));
    e.target.classList.add('active');
    document.body.className = '';
    const selectedTheme = e.target.dataset.theme;
    currentTheme = selectedTheme;
    if (selectedTheme !== 'default') document.body.classList.add(selectedTheme);
    saveSettings();
  });
});

settingsBtn.addEventListener('click', () => {
  loadHistory();
  settingsModal.classList.remove('hidden');
});
closeSettingsModalBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

// Keyboard Logic
document.addEventListener('keydown', (e) => {
  if (!settingsModal.classList.contains('hidden') || isGameOver) return;

  // Tab oder Esc für schnellen Neustart
  if (e.key === 'Escape' || e.key === 'Tab') {
    e.preventDefault();
    initGame();
    return;
  }
  if (e.key.length !== 1 && e.key !== 'Backspace') return;
  if (e.key === ' ') e.preventDefault();
  if (currentIndex >= charElements.length) return;

  if (!isStarted) {
    isStarted = true;
    startHint.classList.add('hidden');
    document.body.classList.add('zen-mode'); // Zen-Modus aktivieren
    startTime = Date.now();
    startTimer();
  }

  if (e.key === 'Backspace' && currentIndex > 0) {
    charElements[currentIndex].classList.remove('active');
    currentIndex--;
    charElements[currentIndex].classList.remove('correct', 'incorrect');
    charElements[currentIndex].classList.add('active');
    charElements[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    playTypingSound(false);
    return;
  }

  if (e.key.length === 1) {
    totalKeystrokes++;
    const currentSpan = charElements[currentIndex];

    if (e.key === currentSpan.innerText) {
      currentSpan.classList.add('correct');
      playTypingSound(false);
    } else {
      currentSpan.classList.add('incorrect');
      errorsCount++;
      playTypingSound(true);
    }

    currentSpan.classList.remove('active');
    currentIndex++;

    if (currentMode === 'words') {
      const percentage = (currentIndex / charElements.length) * 100;
      progressBar.style.width = `${percentage}%`;
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
    const elapsedSecs = Math.floor((Date.now() - startTime) / 1000);
    const elapsedMins = elapsedSecs / 60;

    // WPM Tracking for Chart
    const totalCorrect = document.querySelectorAll('.char.correct').length;
    const currentWpm = elapsedMins > 0 ? calculateWpm(totalCorrect, elapsedMins) : 0;
    wpmHistory.push(currentWpm);

    if (currentMode === 'time') {
      const left = currentValue - elapsedSecs;
      statusLine.innerText = left;
      const percentage = (left / currentValue) * 100;
      progressBar.style.width = `${percentage}%`;
      if (left <= 3) progressBar.classList.add('danger');
      if (left <= 0) endGame();
    } else {
      statusLine.innerText = `${elapsedSecs}s`;
    }
  }, 1000);
}

function renderChart() {
  wpmChart.innerHTML = '';
  if (wpmHistory.length === 0) return;
  const maxWpm = Math.max(...wpmHistory, 10); // Verhindert div/0

  wpmHistory.forEach((wpm) => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    const heightPercent = (wpm / maxWpm) * 100;
    bar.style.height = `${heightPercent}%`;
    bar.setAttribute('data-wpm', wpm);
    wpmChart.appendChild(bar);
  });
}

function endGame() {
  document.body.classList.remove('zen-mode');

  clearInterval(timerInterval);
  isStarted = false;
  isGameOver = true;

  const totalCorrect = document.querySelectorAll('.char.correct').length;
  let elapsedMinutes = (Date.now() - startTime) / 60000;
  if (elapsedMinutes <= 0) elapsedMinutes = currentValue / 60;

  const wpm = calculateWpm(totalCorrect, elapsedMinutes);
  let accuracy = 100;
  if (totalKeystrokes > 0) {
    accuracy = Math.max(0, Math.round(((totalKeystrokes - errorsCount) / totalKeystrokes) * 100));
  }

  const rawWpm = Math.round(totalKeystrokes / 5 / elapsedMinutes);
  finalRawWpmDisplay.innerText = rawWpm;

  finalWpmDisplay.innerText = wpm;
  finalAccDisplay.innerText = `${accuracy}%`;
  finalErrorsDisplay.innerText = errorsCount;

  renderChart();
  saveToHistory(wpm, accuracy);

  resultModal.classList.remove('hidden');
}

restartBtn.addEventListener('click', initGame);
closeModalBtn.addEventListener('click', initGame);
modalRestartBtn.addEventListener('click', initGame);

loadHistory();
loadSettings();
initGame();

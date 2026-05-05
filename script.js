import { calculateWpm } from './logic.js';

// Sauber formatiert, damit ESLint nicht wegen der Zeilenlänge meckert!
const wordsPool = [
  'der',
  'die',
  'das',
  'und',
  'in',
  'zu',
  'den',
  'nicht',
  'von',
  'sie',
  'ist',
  'des',
  'sich',
  'mit',
  'dem',
  'dass',
  'er',
  'es',
  'ein',
  'ich',
  'auf',
  'so',
  'eine',
  'auch',
  'als',
  'an',
  'nach',
  'wie',
  'im',
  'man',
  'aber',
  'aus',
  'durch',
  'wenn',
  'nur',
  'war',
  'noch',
  'werden',
  'bei',
  'hat',
  'wir',
  'was',
  'wird',
  'sein',
  'einen',
  'welche',
  'sind',
  'oder',
  'zur',
  'um',
  'haben',
  'einer',
  'mir',
  'ueber',
  'ihm',
  'diese',
  'einem',
  'ihr',
  'eines',
  'da',
  'zum',
  'kann',
  'doch',
  'vor',
  'mich',
  'ihn',
  'du',
  'hatte',
  'seine',
  'mehr',
  'am',
  'denn',
  'nun',
  'unter',
  'sehr',
  'selbst',
  'schon',
  'hier',
  'bis',
  'habe',
  'ihre',
  'dann',
  'ihnen',
  'seiner',
  'alle',
  'wieder',
  'meine',
  'zeit',
  'gegen',
  'vom',
  'ganz',
  'wo',
  'muss',
  'ohne',
  'koennen',
  'sei',
  'ja',
  'wurde',
  'jetzt',
  'immer',
  'seinen',
  'wohl',
  'dieses',
  'ihren',
  'wuerde',
  'diesen',
  'sondern',
  'weil',
  'welcher',
  'nichts',
  'diesem',
  'alles',
  'waren',
  'will',
  'herr',
  'viel',
  'mein',
  'also',
  'soll',
  'worden',
  'lassen',
  'dies',
  'machen',
  'ihrer',
];

const typingArea = document.getElementById('typing-area');
const statusLine = document.getElementById('status-line');
const restartBtn = document.getElementById('restart-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const valBtns = document.querySelectorAll('.val-btn');

let currentMode = 'time';
let currentValue = 30; // Startwert auf 30 Sekunden gesetzt!
let timerInterval = null;
let isStarted = false;
let currentIndex = 0;
let charElements = [];
let startTime = null;

function initGame() {
  typingArea.innerHTML = '';
  charElements = [];
  currentIndex = 0;
  isStarted = false;
  clearInterval(timerInterval);
  statusLine.innerText = currentMode === 'time' ? currentValue : `${currentValue} W.`;

  const wordCount = currentMode === 'time' ? 100 : currentValue;
  const words = Array.from(
    { length: wordCount },
    () => wordsPool[Math.floor(Math.random() * wordsPool.length)],
  );

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
      spaceSpan.className = 'char space-char'; // Hier nutzen wir die neue CSS Klasse
      wordDiv.appendChild(spaceSpan);
      charElements.push(spaceSpan);
    }

    typingArea.appendChild(wordDiv);
  });

  if (charElements.length > 0) charElements[0].classList.add('active');
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
  if (e.key === 'Escape') initGame();
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
    const currentSpan = charElements[currentIndex];
    if (e.key === currentSpan.innerText) {
      currentSpan.classList.add('correct');
    } else {
      currentSpan.classList.add('incorrect');
    }

    currentSpan.classList.remove('active');
    currentIndex++;

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
      if (left <= 0) endGame();
    } else {
      statusLine.innerText = `${elapsed}s`;
    }
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  const totalCorrect = document.querySelectorAll('.char.correct').length;
  const elapsedMinutes = (Date.now() - startTime) / 60000;
  const wpm = calculateWpm(totalCorrect, elapsedMinutes);
  statusLine.innerText = `Ergebnis: ${wpm} WPM`;
  isStarted = false;
}

restartBtn.addEventListener('click', initGame);
initGame();

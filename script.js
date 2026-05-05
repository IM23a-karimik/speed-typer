import { calculateWpm } from './logic.js';

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
const timeDisplay = document.getElementById('time-display');
const restartBtn = document.getElementById('restart-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const valBtns = document.querySelectorAll('.val-btn');
const timeValues = document.getElementById('time-values');
const wordValues = document.getElementById('word-values');

let currentMode = 'time';
let currentValue = 30;
let timerInterval = null;
let isStarted = false;
let currentIndex = 0;
let charElements = [];
let startTime = null;

// Menü: Zeit oder Wörter auswählen
modeBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    modeBtns.forEach((b) => b.classList.remove('active'));
    e.target.classList.add('active');
    currentMode = e.target.dataset.mode;

    if (currentMode === 'time') {
      timeValues.classList.remove('hidden');
      wordValues.classList.add('hidden');
      currentValue = parseInt(
        document.querySelector('#time-values .val-btn.active').dataset.val,
        10,
      );
    } else {
      timeValues.classList.add('hidden');
      wordValues.classList.remove('hidden');
      currentValue = parseInt(
        document.querySelector('#word-values .val-btn.active').dataset.val,
        10,
      );
    }
    initGame();
  });
});

// Menü: Zahlen auswählen (15, 30, 60 bzw. 10, 25, 50)
valBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const parent = e.target.parentElement;
    parent.querySelectorAll('.val-btn').forEach((b) => b.classList.remove('active'));
    e.target.classList.add('active');
    currentValue = parseInt(e.target.dataset.val, 10);
    initGame();
  });
});

function generateText() {
  let wordCount = currentMode === 'time' ? 200 : currentValue;
  let textArray = [];
  for (let i = 0; i < wordCount; i++) {
    textArray.push(wordsPool[Math.floor(Math.random() * wordsPool.length)]);
  }
  return textArray;
}

function initGame() {
  typingArea.innerHTML = '';
  charElements = [];
  currentIndex = 0;
  isStarted = false;
  clearInterval(timerInterval);

  if (currentMode === 'time') {
    timeDisplay.innerText = currentValue;
  } else {
    timeDisplay.innerText = `${currentValue} W.`;
  }

  const words = generateText();

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

    // Leerzeichen am Ende des Wortes (außer beim allerletzten Wort)
    if (wordIdx < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.innerText = ' ';
      spaceSpan.className = 'char space';
      wordDiv.appendChild(spaceSpan);
      charElements.push(spaceSpan);
    }

    typingArea.appendChild(wordDiv);
  });

  if (charElements.length > 0) {
    charElements[0].classList.add('active');
  }
}

function startGame() {
  isStarted = true;
  startTime = Date.now();

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    if (currentMode === 'time') {
      const left = currentValue - elapsed;
      timeDisplay.innerText = left;
      if (left <= 0) endGame();
    } else {
      timeDisplay.innerText = `${elapsed}s`; // Im Wort-Modus die Stoppuhr hochzählen
    }
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  const totalCorrect = document.querySelectorAll('.char.correct').length;
  const elapsedMinutes = (Date.now() - startTime) / 60000;
  const wpm = calculateWpm(totalCorrect, elapsedMinutes);

  typingArea.innerHTML = '';
  timeDisplay.innerText = `WPM: ${wpm}`;
  isStarted = false;
}

restartBtn.addEventListener('click', initGame);

document.addEventListener('keydown', (e) => {
  // Ignoriere alles, was keine Taste zum Tippen ist
  if (e.key.length !== 1 && e.key !== 'Backspace') return;

  // Verhindert, dass die Leertaste die Website nach unten scrollt
  if (e.key === ' ') e.preventDefault();

  if (currentIndex >= charElements.length) return;

  // Backspace (Löschen)
  if (e.key === 'Backspace' && currentIndex > 0) {
    charElements[currentIndex].classList.remove('active');
    currentIndex--;
    charElements[currentIndex].classList.remove('correct', 'incorrect');
    charElements[currentIndex].classList.add('active');

    // Kamera fährt sanft zurück nach oben, falls nötig
    charElements[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (e.key.length !== 1) return;

  if (!isStarted) startGame();

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
    // Die Kamera fährt sanft nach unten, wenn du in eine neue Zeile tippst!
    charElements[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else if (currentMode === 'words') {
    endGame(); // Spiel sofort beenden, wenn das letzte Wort getippt wurde
  }
});

// Spiel beim Start initialisieren
initGame();

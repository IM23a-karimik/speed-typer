// 1. Array mit verschiedenen Texten/Sätzen
const quotes = [
    "Das ist ein einfacher Text zum Üben.",
    "Programmieren macht Spass, wenn es funktioniert.",
    "Jeder Fehler ist eine neue Gelegenheit zu lernen.",
    "Schnelles Tippen spart dir auf Dauer sehr viel Zeit.",
    "JavaScript ist die Sprache des Internets.",
    "Ein guter Entwickler liest mehr Code als er schreibt."
];

// 2. HTML-Elemente aus dem DOM holen
const quoteDisplayElement = document.getElementById('quote-display');
const quoteInputElement = document.getElementById('quote-input');

// 3. Funktion: Neuen Text anzeigen
function renderNewQuote() {
    quoteDisplayElement.innerHTML = '';
    quoteInputElement.value = '';

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    randomQuote.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });

    // WICHTIG: Setzt den "Cursor" (grauer Hintergrund) auf den allerersten Buchstaben
    if (quoteDisplayElement.firstChild) {
        quoteDisplayElement.firstChild.classList.add('active');
    }
}

// ==========================================
// NEU: ISSUE 5 - DIE TIPP-LOGIK
// ==========================================
quoteInputElement.addEventListener('input', () => {
    // Alle <span> Elemente (Buchstaben) im Display-Feld als Array holen
    const arrayQuote = quoteDisplayElement.querySelectorAll('span');

    // Den aktuell vom Nutzer getippten Text in einzelne Buchstaben zerlegen
    const arrayValue = quoteInputElement.value.split('');

    let allCorrect = true; // Hilfsvariable für den Wechsel zum nächsten Satz

    // Jeden Buchstaben des Originalsatzes mit der Eingabe vergleichen
    arrayQuote.forEach((characterSpan, index) => {
        const character = arrayValue[index];

        // Fall 1: Nutzer hat diesen Buchstaben noch gar nicht getippt
        if (character == null) {
            characterSpan.classList.remove('correct');
            characterSpan.classList.remove('incorrect');
            characterSpan.classList.remove('active');
            allCorrect = false;

            // Der erste noch nicht getippte Buchstabe bekommt die "active" Klasse (unser Cursor)
            if (arrayValue.length === index) {
                characterSpan.classList.add('active');
            }

        // Fall 2: Der getippte Buchstabe ist RICHTIG
        } else if (character === characterSpan.innerText) {
            characterSpan.classList.add('correct');
            characterSpan.classList.remove('incorrect');
            characterSpan.classList.remove('active');

        // Fall 3: Der getippte Buchstabe ist FALSCH
        } else {
            characterSpan.classList.remove('correct');
            characterSpan.classList.add('incorrect');
            characterSpan.classList.remove('active');
            allCorrect = false;
        }
    });

    // Wenn der Satz komplett und fehlerfrei abgetippt wurde, lade sofort den nächsten!
    if (allCorrect) {
        renderNewQuote();
    }
});

// 4. Das Spiel direkt beim Laden der Seite einmal starten
renderNewQuote();

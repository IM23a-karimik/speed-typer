// 1. Array mit verschiedenen Texten/Sätzen
const quotes = [
    "Das ist ein einfacher Text zum Üben.",
    "Programmieren macht Spass, wenn es funktioniert.",
    "Jeder Fehler ist eine neue Gelegenheit zu lernen.",
    "Schnelles Tippen spart dir auf Dauer sehr viel Zeit.",
    "JavaScript ist die Sprache des Internets.",
    "Ein guter Entwickler liest mehr Code als er schreibt."
];

// 2. HTML-Elemente aus dem DOM (Document Object Model) holen
const quoteDisplayElement = document.getElementById('quote-display');
const quoteInputElement = document.getElementById('quote-input');

// 3. Funktion, um einen neuen zufälligen Text auf den Bildschirm zu bringen
function renderNewQuote() {
    // Vorherigen Text löschen
    quoteDisplayElement.innerHTML = '';
    quoteInputElement.value = '';

    // Einen zufälligen Satz aus unserem Array auswählen
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    // Den Satz in einzelne Buchstaben zerlegen
    // Jeder Buchstabe wird in ein eigenes <span>-Tag gepackt
    randomQuote.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });
}

// 4. Das Spiel direkt beim Laden der Seite einmal starten
renderNewQuote();
import { Selector } from 'testcafe';

fixture('Wikipedia Random Page Test').page('https://en.wikipedia.org/wiki/Special:Random');

test('Follow first Wikipedia links until Philosophy or loop', async (t) => {
  // Ein "Set" ist perfekt, um sich gemerkte Seiten abzuspeichern
  const visitedPages = new Set();
  let reachedTarget = false;
  let isLoop = false;

  console.log('Starte die Suche nach Philosophy...');

  // Solange wir das Ziel nicht erreicht haben und in keiner Schleife stecken
  while (!reachedTarget && !isLoop) {
    // 1. Aktuellen Seitentitel auslesen
    const currentTitle = await getTitleText(t);
    console.log(`➡️ Aktuelle Seite: ${currentTitle}`);

    // 2. Prüfen, ob wir das Ziel erreicht haben
    if (currentTitle === 'Philosophy') {
      console.log(`🎉 Ziel erreicht nach ${visitedPages.size} Klicks!`);
      reachedTarget = true;
      break;
    }

    // 3. Prüfen, ob wir im Kreis laufen (Schleife)
    if (visitedPages.has(currentTitle)) {
      console.log(`🔁 Schleife erkannt bei "${currentTitle}". Abbruch!`);
      console.log(`Zurückgelegte Kette: ${visitedPages.size} Seiten.`);
      isLoop = true;
      break;
    }

    // 4. Seite als "besucht" markieren
    visitedPages.add(currentTitle);

    // 5. Den nächsten validen Link suchen und klicken
    const nextLink = await getFirstValidLink(t);
    await t.click(nextLink);
  }
});

// --- Hilfsfunktionen vom Lehrer ---

const getTitleText = async (t) => {
  const title = Selector('#firstHeading');
  await t.expect(title.exists).ok({ timeout: 10000 });
  return await title.innerText;
};

const getFirstValidLink = async (t) => {
  const content = Selector('#mw-content-text');
  await t.expect(content.exists).ok({ timeout: 10000 });

  const firstValidLink = content
    .find('p a')
    .filter((node) => {
      return (
        !node.closest('i') &&
        !node.closest('sup') &&
        !node.closest('.infobox') &&
        !node.closest('.sidebar') && // <-- NEU: Sidebars komplett ignorieren
        !node.closest('.navbox') &&  // <-- NEU: Navigationsboxen ignorieren
        node.getAttribute('href') &&
        node.getAttribute('href').startsWith('/wiki/')
      );
    })
    .nth(0);

  await t.expect(firstValidLink.exists).ok({ timeout: 10000 });
  return firstValidLink;
};

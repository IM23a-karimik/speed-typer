import { Selector } from 'testcafe';

fixture('Wikipedia Random Page Test').page('https://en.wikipedia.org/wiki/Special:Random');

test('Follow first Wikipedia links until Philosophy or loop', async (t) => {
  const visitedPages = new Set();
  let reachedTarget = false;
  let isLoop = false;

  console.log('Starte die Suche nach Philosophy...');

  while (!reachedTarget && !isLoop) {
    const currentTitle = await getTitleText(t);
    console.log(`➡️ Aktuelle Seite: ${currentTitle}`);

    if (currentTitle === 'Philosophy') {
      console.log(`🎉 Ziel erreicht nach ${visitedPages.size} Klicks!`);
      reachedTarget = true;
      break;
    }

    if (visitedPages.has(currentTitle)) {
      console.log(`🔁 Schleife erkannt bei "${currentTitle}". Abbruch!`);
      isLoop = true;
      break;
    }

    visitedPages.add(currentTitle);

    const nextLink = await getFirstValidLink(t);

    // NEU: Wenn es keinen Link gibt -> sauber abbrechen statt Absturz!
    if (!nextLink) {
      console.log(`🛑 Sackgasse erreicht! Kein gültiger Link auf "${currentTitle}" gefunden.`);
      break;
    }

    await t.click(nextLink);
  }
});

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
        !node.closest('.sidebar') &&
        !node.closest('.navbox') &&
        node.getAttribute('href') &&
        node.getAttribute('href').startsWith('/wiki/')
      );
    })
    .nth(0);

  // NEU: Wir prüfen sanft, ob der Link existiert, statt hart abzustürzen
  const linkExists = await firstValidLink.exists;
  if (linkExists) {
    return firstValidLink;
  } else {
    return null;
  }
};

---
title: "Nyelvek"
nav_order: 17
lang: "hu"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Nyelvek

A megjelenítő az Ön nyelvén beszél: minden gomb, tipp és üzenet, valamint a verseny- és meccselemzés minden mondata abban a nyelvben jelenik meg, amelyet kiválaszt. 40 nyelvet ismer, és a böngészője nyelvén indul, ha van ilyen.

Európa hivatalos nyelvei mind megvannak (az EU 24 nyelve, plusz a norvég, az izlandi, az ukrán, az orosz, a belarusz, a szerb, a bosnyák, a macedón, az albán, a török, a luxemburgi és a katalán), valamint a japán, a koreai, az egyszerűsített és a hagyományos kínai. A teljes lista: [Nyelvlista](ref-languages.md).

Az angol az a forrás, amelyből minden más nyelv készül, és amelyre egy hiányzó üzenet visszaesik.

## A nyelv megváltoztatása {#change-the-language}

1. Nyissa meg a legördülő listát az oldalsáv tetején lévő név mellett. Az első bejegyzése **Automatikus – <nyelv>** (a böngészőé, ahogyan most felismerte); utána minden nyelv a saját nevén, így a sajátját akkor is megtalálja, ha a jelenlegit nem tudja olvasni.
2. Válasszon egyet. Azonnal átvált, és ebben a böngészőben megmarad. Az *Automatikus* választása elfelejti a döntést.

Privát ablakban vagy letiltott tárolásnál a választás az oldal bezárásáig tart.

A váltás hatásai:

- minden felirat, tipp és üzenet újra megjelenik az új nyelven;
- a versenyelemzés **újra kiszámítódik** abban a nyelven (a mondatai a mérésekből épülnek, nem utólag fordítódnak),
  a demóköröket átnevezi, a diagramok pedig újrarajzolódnak;
- a számok, listák és többes számok az új nyelv szerint alakulnak.

## Melyik nyelven indul {#which-language-it-starts-in}

1. Az ebben a böngészőben **kiválasztott** nyelv, ha van (a `localStorage`-ban tárolva
   a `heat3d.language` kulcs alatt).
2. Különben a **böngészőé**: a `navigator.languages` első olyan nyelve, amelyet a megjelenítő beszél.
   A címkét a nyelvrésze alapján párosítjuk (`de-AT` → `de`), a következő álnevekkel:
   `nb` és `nn` → norvég (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` és minden `Hant` írásjelű címke →
   hagyományos kínai; `zh-Hans`, `zh-CN`, `zh-SG` és más `zh` → egyszerűsített kínai;
   `cnr` (montenegrói) → szerb.
3. Különben **angol**.

Az oldal `<html lang>` attribútuma a beszélt nyelvre van állítva.

## Számok, listák és többes számok {#numbers-lists-and-plurals}

A megjelenítő szövegében a számok, listák és többes számok az adott nyelv szerint íródnak („3.5” vagy „3,5”, „a, b és c”). Az angolnál hosszabb feliratok sortörést kapnak, a nyelv szabályai szerint kötőjellel tagolva, ahelyett hogy kilógnának az oldalsávból. A túl hosszú diagram-sornevek három ponttal lerövidülnek, és egérrel rájuk húzva teljes egészükben látszanak.

A mezőkbe beírt számokban lehet pont vagy vessző is.

## Fordítóknak és fejlesztőknek {#for-translators-and-developers}

Kód: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Hogyan íródnak a számok, listák és többes számok {#how-numbers-lists-and-plurals-are-written}

- A **tizedes törtek** (`num`) a nyelv tizedesjelét használják, és **nincs számjegycsoportosítás** – a 3108 m távolság minden nyelven egyetlen szám marad.
- A **darabszámok vagy méretek egész számai** (`int`) a nyelv számjegycsoportosítását használják.
- A **listák** (`list`) a nyelv szerint fűződnek össze: „a, b és c”, „a, b vagy
  c”, vagy egymás után a nyelv saját elválasztójával (a `common.listSeparator` üzenet: „, ” angolul, „、” japánul és mindkét kínaiul).
- A **többes számok** a nyelv saját szabályait követik az `Intl.PluralRules` révén
  (`one`, `two`, `few`, `many`, `other`).
- Az `Intl`-nek átadott nyelvi kód a nyelv címkéje, kivéve ahol a címke önmagában egy másik ország szabályait adná: a portugál `pt-PT` (a brazil többes szám a 0-t egyesnek számolja), a norvég `nb`, az egyszerűsített kínai `zh-CN`, a hagyományos `zh-TW`.

### A katalógusok {#the-catalogs}

`src/i18n/locales/<nyelv>/<rész>.json`, egy fájl a megjelenítő minden részéhez,
ugyanazok a részek minden nyelven.

A megjelenítő minden részéhez egy fájl tartozik (ma 30, például `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), és minden nyelvnek ugyanaz a készlete van. A mappa mindet felsorolja.

Minden fájl egy lapos JSON-objektum: a teljes kulcs (`"race.ui.laps.load"`), értékként az üzenet. Az angol a megjelenítővel együtt érkezik; minden más nyelvet a kiválasztásakor tölt be.

**Keresés:** az aktuális nyelv üzenete, különben az angol, különben maga a kulcs (fejlesztéskor a konzol figyelmeztet: „i18n: no message …”). Az az üzenet, amelynek formázása sikertelen, az angolra esik vissza, így egy hibás fordítás soha nem töri meg a megjelenítőt.

#### Az üzenetszintaxis {#the-message-syntax}

Az ICU üzenetszintaxisnak az a része, amelyet a megjelenítő használ:

| Forma | Példa | Jelentés |
|---|---|---|
| `{name}` | `{file} has no rows` | egy érték, változtatás nélkül behelyettesítve |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | az ág a szám alapján, a nyelv többes-szám szabályai szerint, vagy egy pontos `=0`, `=1` …; a `#` a szám a nyelv módján írva |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | az ág egy szó alapján |

Az ágak egymásba ágyazhatók, és minden `plural` és `select`-nek kell legyen `other` ága.
A teljes ICU-val szemben az **aposztróf csak aposztróf** – az autónevek és az angol birtokos esetek tele vannak velük –, így semmit sem kell idézőjelbe tenni. Szó szerinti `{` vagy `}` nem írható.

Üzenetek, amelyek értékeit a fordításnak meg kell tartania: a kapcsos zárójelek közötti neveket a kód tölti ki; a `select` szavait a kód választja ki (`crash`, `onto-straight`, `yes`/`none`), és maradniuk kell angolul; a többes-szám kategóriák eltérhetnek (minden nyelv a sajátját használja: a lengyel `one`, `few`, `many`, `other`; a japán csak `other`).

### Hogyan készültek a fordítások, és a tesztek {#how-the-translations-were-made-and-the-tests}

A fordítások egy AI-modellel készültek az angolból, a versenyzési szakkifejezések szójegyzékével, a verseny-szövegeket pedig a behelyettesített értékekkel együtt másodszor is átnézték. Az anyanyelvi beszélők javításait szívesen fogadjuk (lent).

Az `src/i18n/i18n.test.ts` ellenőrzi:

- hogy a kód által kért minden üzenet létezik angolul – minden `t('…')` hívás, és minden táblázatban tárolt, később a `t()`-nek átadott kulcs (a rész nevével kezdődő kulcsok, például `app.` vagy `heat.`);
- hogy a kód által részekből épített üzenetek léteznek: minden hiba `label`, `short`, `count` és `here` mezője, minden autó-összehasonlítási jellemző, minden csatorna felirata;
- hogy minden üzenet **értelmezhető** minden nyelven;
- hogy minden fordítás **megtartja az angol üzenet értékeit és választásait** (nincs hozzáadott vagy elveszett érték; minden `select` megtartja a szavait);
- hogy minden nyelvnek **minden** angol üzenete megvan, és hogy a fordított nyelvek halmaza pontosan a fenti lista;
- hogy egy üzenet a kiválasztott nyelven jelenik meg, és angolra esik vissza.

### Fordítás javítása {#correcting-a-translation}

Az anyanyelvi beszélő javításait szívesen fogadjuk – mindegyik egy JSON-sor.

1. Keresse meg az üzenetet: keresse meg angol katalógusban (`src/i18n/locales/en/`) a látott szöveget angolul (a választót állítsa angolra, hogy olvashassa), és jegyezze fel a kulcsát.
2. Nyissa meg ugyanazt a részt a saját nyelvén, például `src/i18n/locales/de/race-ui.json`, és módosítsa a kulcs értékét. Tartsa meg benne minden `{name}` részt, a `select` szavakat, és írja meg a nyelvének szükséges többes-szám ágakat:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Futtassa az `npm test` parancsot (vagy csak az `npx vitest run src/i18n`-t): a tesztek megmondják, ha egy érték vagy választás elveszett, vagy egy üzenet már nem értelmezhető.
4. Ha a fejlesztői szerver fut, a módosítás a nyelv váltása után (vagy újratöltéskor) látszik.

**Üzenet hozzáadása** (kódban): először az angol részhez adja, aztán minden más nyelvhez (a tesztek addig hibáznak, amíg mindegyiknél nincs meg).

**Nyelv hozzáadása**: vegye fel a `LANGUAGES`-be a `languages.ts`-ben (a BCP 47 címkéjével és a saját nevével, szükség esetén álnévvel vagy `Intl` nyelvi kóddal), és hozzon létre egy `src/i18n/locales/<címke>/` mappát az összes résszel.

---
title: "Språk"
nav_order: 17
lang: "sv"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Språk

Visaren kan tala ditt språk: varje knapp, varje tips och varje meddelande, och varje mening i lopp- och matchanalysen, visas på det språk du väljer. Den kan 40 språk och startar på din webbläsares språk när den har det.

Alla Europas officiella språk finns med (EU:s 24, och norska, isländska, ukrainska, ryska, vitryska, serbiska, bosniska, makedonska, albanska, turkiska, luxemburgska och katalanska), och även japanska, koreanska samt kinesiska i förenklad och traditionell skrift. Hela listan: [Språklista](ref-languages.md).

Engelska är källan som alla andra språk översätts från. Det är också det som ett saknat meddelande faller tillbaka på.

## Byt språk {#change-the-language}

1. Öppna rullgardinsmenyn bredvid namnet överst i sidofältet. Den första posten är **Automatiskt - <språk>** (webbläsarens språk, som det upptäcks nu). Sedan följer alla språk med sitt eget namn, så att du hittar ditt även om du inte kan läsa det språk som visas.
2. Välj ett. Det byter direkt och sparas i den här webbläsaren. Välj *Automatiskt* för att glömma valet.

I ett privat fönster, eller när lagringen är blockerad, gäller valet till dess sidan stängs.

Det här händer när du byter språk:

- varje etikett, tips och meddelande ritas om på det nya språket,
- loppanalysen **räknas om** på det språket (dess meningar byggs av mätvärdena, de översätts inte i efterhand), demovarven får nya namn och graferna ritas om,
- siffror, listor och pluraler följer det nya språket.

## Vilket språk den startar på {#which-language-it-starts-in}

1. Språket som **valts** i den här webbläsaren, om något (sparat i `localStorage` under `heat3d.language`).
2. Annars **webbläsarens**: det första i `navigator.languages` som visaren talar. En språkkod matchas med sin språkdel (`de-AT` blir `de`). Dessa alias gäller också: `nb` och `nn` blir norska (`no`). `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` och alla koder med skriftsystemet `Hant` blir traditionell kinesiska. `zh-Hans`, `zh-CN`, `zh-SG` och andra `zh` blir förenklad kinesiska. `cnr` (montenegrinska) blir serbiska.
3. Annars **engelska**.

Sidans `<html lang>` sätts till det språk som talas.

## Siffror, listor och pluraler {#numbers-lists-and-plurals}

Siffror, listor och pluraler i visarens text skrivs på språkets sätt ("3.5" eller "3,5", "a, b och c"). Etiketter som är längre än de engelska bryts, med avstavning där språket tillåter det, i stället för att gå utanför sidofältet. Namn på diagramrader som är för långa kortas med en ellips och visas i sin helhet när du för musen över dem.

Siffror du skriver i en ruta kan använda antingen punkt eller kommatecken.

## För översättare och utvecklare {#for-translators-and-developers}

Kod: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Hur siffror, listor och pluraler skrivs {#how-numbers-lists-and-plurals-are-written}

- **Tal med decimaler** (`num`) använder språkets decimaltecken och **ingen siffergruppering**. Ett avstånd på 3108 m förblir ett tal på alla språk.
- **Heltal som är antal eller storlekar** (`int`) använder språkets siffergruppering.
- **Listor** (`list`) sätts ihop på språkets sätt: "a, b och c", "a, b eller c", eller efter varandra med språkets egen avdelare (meddelandet `common.listSeparator`: ", " på engelska, "、" på japanska och på båda kinesiska).
- **Pluraler** följer språkets egna regler via `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Språkkoden som ges till `Intl` är språkets egen kod, utom där koden ensam skulle ge ett annat lands regler. Portugisiska är `pt-PT` (Brasiliens plural räknar 0 som ett). Norska är `nb`, förenklad kinesiska `zh-CN` och traditionell `zh-TW`.

### Katalogerna {#the-catalogs}

`src/i18n/locales/<språk>/<del>.json`, en fil per del av visaren, med samma delar på varje språk.

Det finns en fil per del av visaren (30 idag, till exempel `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), och varje språk har samma uppsättning. Mappen listar dem alla.

Varje fil är ett platt JSON-objekt: nyckeln skriven helt (`"race.ui.laps.load"`) och meddelandet som värde. Engelska är inbyggt i visaren. Alla andra språk hämtas när de väljs.

**Uppslagning:** det aktuella språkets meddelande, annars det engelska, annars nyckeln själv (i utvecklingsläge varnar konsolen "i18n: no message …"). Ett meddelande som inte kan formateras faller tillbaka på det engelska. En trasig översättning kan alltså aldrig bryta visaren.

#### Meddelandesyntaxen {#the-message-syntax}

Den del av ICU-meddelandesyntaxen som visaren använder:

| Form | Exempel | Betydelse |
|---|---|---|
| `{name}` | `{file} has no rows` | ett värde som sätts in som det är |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | grenen för talet enligt språkets pluralregler, eller en exakt `=0`, `=1` …. `#` är talet skrivet på språkets sätt |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | grenen för ett ord |

Grenar kan vara inbäddade, och varje `plural` och `select` måste ha en gren `other`. Till skillnad från full ICU är en **apostrof bara en apostrof**. Bilnamn och engelska possessiver är fulla av dem, så ingenting behöver citeras. En bokstavlig `{` eller `}` kan inte skrivas.

Meddelanden med värden som en översättning måste behålla: namnen i klammer fylls i av koden. Orden i en `select` är de som koden väljer efter (`crash`, `onto-straight`, `yes`/`none`) och måste vara kvar som på engelska. Pluralkategorierna får skilja sig: ett språk använder sina egna (polska `one`, `few`, `many`, `other`. Japanska bara `other`).

### Hur översättningarna gjordes, och testerna {#how-the-translations-were-made-and-the-tests}

Översättningarna gjordes med en AI-modell från den engelska texten, med en ordlista över tävlingstermer. Loppteksterna lästes sedan igenom en gång till med värdena ifyllda. Rättelser från modersmålstalare välkomnas (se nedan).

`src/i18n/i18n.test.ts` kontrollerar:

- att varje meddelande som koden begär finns på engelska: varje anrop `t('…')`, och varje nyckel som hålls i en tabell och skickas till `t()` senare (nycklar som börjar med namnet på en del, till exempel `app.` eller `heat.`),
- att de meddelanden koden bygger av delar finns: varje misstags `label`, `short`, `count` och `here`, varje jämförelsedrag för bilar och varje kanals etikett,
- att varje meddelande **går att tolka**, på varje språk,
- att varje översättning **behåller det engelska meddelandets värden och val** (inget värde tillagt eller borttaget, varje `select` behåller sina ord),
- att varje språk har **alla** engelska meddelanden, och att mängden översatta språk är exakt listan ovan,
- att ett meddelande visas på det valda språket och faller tillbaka på engelska.

### Rätta en översättning {#correcting-a-translation}

Ett modersmålstalares rättelser är välkomna. Varje rättelse är en rad JSON.

1. Hitta meddelandet: sök i de engelska katalogerna (`src/i18n/locales/en/`) efter texten du ser på engelska (byt språkväljaren till engelska för att läsa den), och anteckna dess nyckel.
2. Öppna samma del på ditt språk, till exempel `src/i18n/locales/de/race-ui.json`, och ändra den nyckelns värde. Behåll varje `{name}`, behåll orden i `select`, och skriv de pluralgrenar ditt språk behöver:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Kör `npm test` (eller bara `npx vitest run src/i18n`). Testerna visar om ett värde eller ett val har försvunnit, eller om ett meddelande inte längre går att tolka.
4. Med utvecklingsservern igång syns ändringen när du byter språk (eller laddar om).

**Lägga till ett meddelande** (i koden): lägg till det i den engelska delen först, och sedan i varje annat språk. Testerna misslyckas tills varje språk har det.

**Lägga till ett språk**: lägg till det i `LANGUAGES` i `languages.ts` (dess BCP 47-kod och dess eget namn, samt ett alias eller en `Intl`-lokal vid behov), och en mapp `src/i18n/locales/<kod>/` med alla delar.

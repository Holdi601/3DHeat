---
title: "Språk"
nav_order: 17
lang: "no"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Språk

Visningen kan snakke ditt språk: hver knapp, hvert hint og hver melding, og hver setning i løps- og kampanalysen, vises på språket du velger. Det kan 40 språk, og starter på nettleserens språk når det finnes.

Alle Europas statsspråk er med (de 24 i EU, og norsk, islandsk, ukrainsk, russisk, hviterussisk, serbisk, bosnisk, makedonsk, albansk, tyrkisk, luxembourgsk og katalansk), i tillegg til japansk, koreansk, og kinesisk forenklet og tradisjonell. Hele listen: [Språkliste](ref-languages.md).

Engelsk er kilden alle andre språk er oversatt fra, og det en manglende melding faller tilbake til.

## Endre språket {#change-the-language}

1. Åpne rullegardinlisten ved navnet øverst i sidepanelet. Det første valget er **Automatisk - <språk>** (nettleserens, slik den er oppdaget nå); deretter alle språk med sitt eget navn, slik at du finner ditt selv om du ikke kan lese det som vises.
2. Velg ett. Det bytter med en gang, og valget lagres i denne nettleseren. Velg *Automatisk* for å glemme valget.

I et privat vindu eller når lagring er blokkert, gjelder valget til siden lukkes.

Dette gjør bytte av språk:

- alle etiketter, hint og meldinger tegnes på nytt på det nye språket;
- løpsanalysen **regnes ut på nytt** på det språket (setningene bygges av målingene, ikke oversettes i etterkant), demoomgangene får nye navn, og diagrammene tegnes om;
- tall, lister og flertallsformer følger det nye språket.

## Hvilket språk den starter på {#which-language-it-starts-in}

1. Språket som er **valgt** i denne nettleseren, hvis det finnes (lagret i `localStorage` under `heat3d.language`).
2. Ellers **nettleserens**: den første av `navigator.languages` som visningen snakker. En kode blir matchet på sin språkdel (`de-AT` → `de`), med disse aliasene: `nb` og `nn` → norsk (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` og alle koder med skriften `Hant` → tradisjonell kinesisk; `zh-Hans`, `zh-CN`, `zh-SG` og andre `zh` → forenklet kinesisk; `cnr` (montenegrinsk) → serbisk.
3. Ellers **engelsk**.

Sidens `<html lang>` settes til språket som brukes.

## Tall, lister og flertallsformer {#numbers-lists-and-plurals}

Tall, lister og flertallsformer i visningens tekst skrives slik språket gjør det («3.5» eller «3,5», «a, b og c»). Etiketter som er lengre enn på engelsk, brytes over flere linjer, med bindestrek der språket tillater det, i stedet for å gå ut av sidepanelet. Navn på diagramrader som er for lange, kuttes med tre prikker og vises fullt når du holder musepekeren over dem.

Tall du skriver inn i en boks, kan bruke både punktum og komma.

## For oversettere og utviklere {#for-translators-and-developers}

Kode: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Hvordan tall, lister og flertallsformer skrives {#how-numbers-lists-and-plurals-are-written}

- **Tall** med desimaler (`num`) bruker språkets desimaltegn og **ingen siffergruppering** – en avstand på 3108 m forblir ett tall på alle språk.
- **Hele tall som er antall eller størrelser** (`int`) bruker språkets siffergruppering.
- **Lister** (`list`) settes sammen på språkets vis: «a, b og c», «a, b eller c», eller etter hverandre med språkets eget skilletegn (meldingen `common.listSeparator`: «, » på engelsk, «、» på japansk og begge kinesiske).
- **Flertallsformer** følger språkets egne regler gjennom `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Lokalen som `Intl` får, er språkets kode, unntatt der koden alene ville gitt et annet lands regler: portugisisk er `pt-PT` (Brasils flertall regner 0 som én), norsk `nb`, forenklet kinesisk `zh-CN`, tradisjonell `zh-TW`.

### Katalogene {#the-catalogs}

`src/i18n/locales/<språk>/<del>.json`, én fil per del av visningen, de samme delene på hvert språk.

Det finnes én fil per del av visningen (30 i dag, for eksempel `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), og hvert språk har det samme settet. Mappen lister dem alle.

Hver fil er et flatt JSON-objekt: nøkkelen skrevet helt ut (`"race.ui.laps.load"`), og meldingen som verdi. Engelsk er innebygd i visningen; alle andre språk hentes når de velges.

**Oppslag:** den gjeldende språkets melding, ellers den engelske, ellers selve nøkkelen (i utvikling advarer konsollen «i18n: no message …»). En melding som ikke kan formateres, faller tilbake til den engelske, så en ødelagt oversettelse knekker aldri visningen.

#### Meldingssyntaksen {#the-message-syntax}

Den delen av ICU-meldingssyntaksen visningen bruker:

| Form | Eksempel | Betydning |
|---|---|---|
| `{name}` | `{file} has no rows` | en verdi satt inn slik den er gitt |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | grenen for tallet etter språkets flertallsregler, eller en nøyaktig `=0`, `=1` …; `#` er tallet skrevet slik språket gjør det |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | grenen for et ord |

Grener kan være nøstet, og hver `plural` og `select` må ha en `other`-gren.
I motsetning til full ICU er en **apostrof bare en apostrof** – bilnavn og engelske eieformer har mange av dem – så ingenting må settes i anførselstegn. En bokstavelig `{` eller `}` kan ikke skrives.

Meldinger med verdier som en oversettelse må beholde: navnene i klammer blir fylt inn av koden; ordene i en `select` er det koden velger etter (`crash`, `onto-straight`, `yes`/`none`), og de må være som på engelsk; flertallskategoriene kan variere (et språk bruker sine egne: polsk `one`, `few`, `many`, `other`; japansk bare `other`).

### Hvordan oversettelsene ble laget, og testene {#how-the-translations-were-made-and-the-tests}

Oversettelsene ble laget med en AI-modell fra engelsk, med en ordliste over løpstermer, og løpstekstene ble lest over en gang til med verdiene fylt inn. Rettelser fra morsmålsbrukere er velkomne (se under).

`src/i18n/i18n.test.ts` sjekker:

- at hver melding koden ber om, finnes på engelsk – hvert `t('…')`-kall, og hver nøkkel som lagres i en tabell og gis til `t()` senere (nøkler som begynner med navnet på en del, som `app.` eller `heat.`);
- at meldingene koden bygger av deler finnes: hver feils `label`, `short`, `count` og `here`, hver bilsammenlignings-egenskap, hver kanals etikett;
- at hver melding **kan analyseres** på alle språk;
- at hver oversettelse **beholder den engelske meldingens verdier og valg** (ingen verdi lagt til eller tapt; hver `select` beholder ordene sine);
- at hvert språk har **alle** de engelske meldingene, og at settet med oversatte språk er nøyaktig listen over;
- at en melding blir sagt på valgt språk og faller tilbake til engelsk.

### Rette en oversettelse {#correcting-a-translation}

Et morsmålsmenneskes rettelser er velkomne – hver er én linje med JSON.

1. Finn meldingen: søk i de engelske katalogene (`src/i18n/locales/en/`) etter teksten du ser på engelsk (sett velgeren til engelsk for å lese den), og noter nøkkelen.
2. Åpne den samme delen på ditt språk, for eksempel `src/i18n/locales/de/race-ui.json`, og endre verdien for den nøkkelen. Behold hvert `{name}`, behold ordene i `select`, og skriv flertallsgrenene ditt språk trenger:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Kjør `npm test` (eller bare `npx vitest run src/i18n`): testene sier fra om en verdi eller et valg mangler, eller en melding ikke lenger kan analyseres.
4. Med utviklingsserveren kjørende, vises endringen etter at du bytter språk (eller laster inn siden på nytt).

**Legge til en melding** (i koden): legg den først til i den engelske delen, og deretter i hvert annet språk (testene feiler til hvert språk har den).

**Legge til et språk**: legg det til i `LANGUAGES` i `languages.ts` (BCP 47-koden og språkets eget navn, og et alias eller en `Intl`-lokal om nødvendig), og en mappe `src/i18n/locales/<kode>/` med alle delene.

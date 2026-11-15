---
title: "Sprog"
nav_order: 17
lang: "da"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Sprog

Viseren kan tale dit sprog: hver knap, hvert hint og hver besked og hver sætning i løbs- og kampanalysen vises på det sprog, du vælger. Den kender 40 og starter på din browsers sprog, når den har det.

Europas statssprog er alle med (EU's 24, og norsk, islandsk, ukrainsk, russisk, hviderussisk, serbisk, bosnisk, makedonsk, albansk, tyrkisk, luxembourgsk og katalansk), plus japansk, koreansk og kinesisk forenklet og traditionelt. Hele listen: [Sprogliste](ref-languages.md).

Engelsk er kilden, alle andre sprog oversættes fra, og det er det, en manglende besked falder tilbage til.

## Skift sprog {#change-the-language}

1. Åbn rullemenuen ved navnet øverst i sidepanelet. Dens første linje er **Automatisk - <sprog>** (browserens, som den registreres nu); derefter alle sprog med deres eget navn, så du kan finde dit, selv når du ikke kan læse det viste.
2. Vælg et. Det skifter med det samme og gemmes i denne browser. Vælg *Automatisk* for at glemme valget.

I et privat vindue eller når lagring er blokeret, varer valget, til siden lukkes.

Det, skiftet gør:

- hver etiket, hvert hint og hver besked tegnes igen på det nye sprog;
- løbsanalysen **regnes igen ud** på det (dens sætninger er bygget
  op af målingerne, ikke oversat bagefter), demo-rundene omdøbes, og
  diagrammerne tegnes om;
- tal, lister og flertalsformer følger det nye sprog.

## Hvilket sprog den starter på {#which-language-it-starts-in}

1. Det sprog, der er **valgt** i denne browser, hvis der er et (gemt i `localStorage`
   under `heat3d.language`).
2. Ellers **browserens**: den første i `navigator.languages`, som viseren
   understøtter. Et mærke matches på sin sprogdel (`de-AT` → `de`), med
   disse aliasser: `nb` og `nn` → norsk (`no`); `zh-TW`, `zh-HK`,
   `zh-MO`, `zh-Hant` og ethvert mærke med skriftsystemet `Hant` → kinesisk
   traditionelt; `zh-Hans`, `zh-CN`, `zh-SG` og andre `zh` → kinesisk
   forenklet; `cnr` (montenegrinsk) → serbisk.
3. Ellers **engelsk**.

Sidens `<html lang>` sættes til det sprog, der tales.

## Tal, lister og flertalsformer {#numbers-lists-and-plurals}

Tal, lister og flertalsformer i visernes tekst skrives efter sprogets måde ("3.5" eller "3,5", "a, b og c"). Etiketter, der er længere end den engelske, brydes over flere linjer, med bindestreg hvor sproget tillader det, i stedet for at løbe ud af sidepanelet. Diagrammers rækkenavne, der er for lange, forkortes med tre prikker og vises helt, når du holder musen over dem.

Tal, du skriver i et felt, må bruge enten et punktum eller et komma.

## For oversættere og udviklere {#for-translators-and-developers}

Kode: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Hvordan tal, lister og flertalsformer skrives {#how-numbers-lists-and-plurals-are-written}

- **Tal** med decimaler (`num`) bruger sprogets decimaltegn og **ingen
  ciffergruppering** - en afstand på 3108 m forbliver ét tal på alle sprog.
- **Hele tal, der er antal eller størrelser** (`int`) bruger sprogets
  ciffergruppering.
- **Lister** (`list`) sammenføjes på sprogets måde: "a, b og c", "a, b eller
  c" eller én efter én med sprogets eget skilletegn (beskeden
  `common.listSeparator`: ", " på engelsk, "、" på japansk og begge kinesiske).
- **Flertalsformer** følger sprogets egne regler gennem `Intl.PluralRules`
  (`one`, `two`, `few`, `many`, `other`).
- Den locale, der bedes om hos `Intl`, er sprogets mærke, undtagen hvor mærket
  alene ville give et andet lands regler: portugisisk er `pt-PT` (Brasiliens
  flertal tæller 0 som én), norsk `nb`, kinesisk forenklet `zh-CN`,
  kinesisk traditionelt `zh-TW`.

### Katalogerne {#the-catalogs}

`src/i18n/locales/<sprog>/<del>.json`, én fil pr. del af viseren, de samme
dele på alle sprog.

Der er én fil pr. del af viseren (30 i dag, for eksempel `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), og hvert sprog har det samme sæt. Mappen viser dem alle.

Hver fil er et fladt JSON-objekt: nøglen skrevet helt ud
(`"race.ui.laps.load"`), beskeden som værdi. Engelsk følger med viseren;
ethvert andet sprog hentes, når det vælges.

**Opslag:** det aktuelle sprogs besked, ellers den engelske, ellers selve
nøglen (under udvikling advarer konsollen "i18n: no message …"). En besked, der
ikke kan formateres, falder tilbage til den engelske, så en defekt oversættelse
aldrig knækker viseren.

#### Beskedsyntaksen {#the-message-syntax}

Den del af ICU-beskedsyntaksen, viseren bruger:

| Form | Eksempel | Betydning |
|---|---|---|
| `{navn}` | `{file} har ingen rækker` | en værdi, indsat som den er |
| `{n, plural, …}` | `{laps, plural, one {# runde} other {# runder}}` | grenen for tallet efter sprogets flertalsregler, eller et nøjagtigt `=0`, `=1` …; `#` er tallet skrevet efter sprogets måde |
| `{w, select, …}` | `{kind, select, crash {Kollision} other {Ramt}}` | grenen for et ord |

Grene kan indlejres, og hver `plural` og `select` skal have en `other`-gren.
Anderledes end fuld ICU er en **apostrof kun en apostrof** - bilnavne og
engelske ejefald har dem i massevis - så intet skal sættes i citationstegn. En
bogstavelig `{` eller `}` kan ikke skrives.

Beskeder med værdier, en oversættelse skal beholde: navnene i klammer udfyldes
af koden; ordene i et `select` er det, koden vælger efter (`crash`,
`onto-straight`, `yes`/`none`) og skal være som på engelsk; flertalskategorierne
må variere (et sprog bruger sine egne: polsk `one`, `few`, `many`, `other`;
japansk kun `other`).

### Hvordan oversættelserne er lavet, og testene {#how-the-translations-were-made-and-the-tests}

Oversættelserne er lavet med en AI-model ud fra engelsk, med en ordliste over
køreterminologi, og løbsteksterne er læst igennem en ekstra gang med
værdierne udfyldt. Rettelser fra indfødte talere er velkomne (nedenfor).

`src/i18n/i18n.test.ts` kontrollerer:

- at hver besked, koden beder om, findes på engelsk - hvert `t('…')`-kald og
  hver nøgle, der holdes i en tabel og senere gives til `t()` (nøgler, der
  starter med navnet på en del, såsom `app.` eller `heat.`);
- at de beskeder, koden bygger ud fra dele, findes: hver fejls `label`, `short`,
  `count` og `here`, hver bilsammenlignings-egenskab, hver kanals etiket;
- at hver besked **kan læses**, på hvert sprog;
- at hver oversættelse **beholder den engelske beskeds værdier og valg** (ingen
  værdi tilføjet eller tabt; hvert `select` beholder sine ord);
- at hvert sprog har **alle** engelske beskeder, og at sættet af oversatte
  sprog er præcis listen ovenfor;
- at en besked siges på det valgte sprog og falder tilbage til engelsk.

### Rette en oversættelse {#correcting-a-translation}

En indfødt talers rettelser er velkomne - hver er en linje JSON.

1. Find beskeden: søg i de engelske kataloger (`src/i18n/locales/en/`) efter
   den tekst, du ser på engelsk (skift vælgeren til engelsk for at læse den),
   og notér dens nøgle.
2. Åbn den samme del på dit sprog, fx `src/i18n/locales/de/race-ui.json`, og
   ændr nøglens værdi. Behold hver `{navn}` i den, behold `select`-ordene, og
   skriv de flertalsgrene, dit sprog har brug for:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Kør `npm test` (eller bare `npx vitest run src/i18n`): testene siger, om en
   værdi eller et valg er forsvundet, eller en besked ikke længere kan læses.
4. Med udviklingsserveren kørende vises ændringen, efter du skifter sprog
   (eller genindlæser).

**Tilføje en besked** (i koden): tilføj den først til den engelske del, derefter
til hvert andet sprog (testene fejler, indtil hvert har den).

**Tilføje et sprog**: tilføj det til `LANGUAGES` i `languages.ts` (dets BCP 47-mærke
og dets eget navn, og et alias eller en `Intl`-locale, hvis det er nødvendigt), og
en mappe `src/i18n/locales/<mærke>/` med alle dele.

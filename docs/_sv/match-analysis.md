---
title: "Matchanalys (CS2)"
nav_order: 10
lang: "sv"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# Matchanalys (Counter-Strike 2)

Fliken **Match** spelar upp en inspelning som figurer, och för en Counter-Strike 2-match visar den också resultattavlan: vem som vann varje runda, hur, och vem som fick fällningarna. Använd den för att gå igenom en match runda för runda, och hoppa sedan till samma ögonblick i värmekartan.

Fliken Match spelar upp vilken inspelning som helst som figurer: en War Thunder- eller Tacview-inspelning, eller en CS2-demo, listad under **Matcher i reprisen** ([Matchrepris](match-replay.md)). En CS2-fil `.match.json` lägger till resultattavlan som beskrivs på den här sidan.

## Gå igenom en CS2-match {#review-a-cs2-match}

1. Konvertera demon ([nedan](#where-the-data-comes-from)) till en `.parquet`- och en `.match.json`-fil.
2. Läs in `.parquet`-filen under **Källa** i fliken **Värmekarta**.
3. Öppna fliken **Match** och klicka på **Läs in matchfiler…**, eller släpp filen `.match.json` på vyn.
4. Klicka på en match i **Matchsammanfattningar**, och sedan på en cell i rundremsan för att öppna den rundan.
5. Klicka på **Visa runda** för att se den rundan i värmekartan, eller **Spela upp runda** för att titta på den som figurer.

![Fliken Match: rundremsa med en runda öppen, dödsflöde och resultattavla](../assets/img/en/match-analysis-round.webp)

Ord som KAST, ADR, eco, force buy och trade finns i [ordlistan](glossary.md#counter-strike-words).

## Var datan kommer ifrån {#where-the-data-comes-from}

Demokonverteraren i [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)
gör demor till två filer per match, i en mapp per karta:

```bash
python -m heat3d_cs2 demos <demofiler eller mappar> -o out
```

| Fil | Läses in i | Innehåller |
|---|---|---|
| `<match>.parquet` | fliken **Värmekarta** (panelen Källa, som vilken Parquet som helst – en fil, flera, eller hela mappen) | varje spelares position åtta gånger per sekund, och varje händelse där den inträffade: fällning, dödsfall, skada, skott, kast, rök, flash, HE, molotov, lockbete, blindning, planting, avinstallation, explosion; med `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, blickriktning, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | fliken **Match** | lagen, ställningen, varje runda (vinnare, hur, ekonomi, planteringen, varje fällning i ordning, clutches, överlevare), varje spelares rad i resultattavlan |

Parquet-filens fotnot bär läsinstruktioner (nyckel `heat3d`), så den öppnas utan att något behöver ställas in: spelaren som personen, sidan som gruppen, varje runda (`roundId`, ”<match> #NN”) som en session, blickriktningen på, och världen åt rätt håll (CS2:s värld är högerhänt med Z upp; läst med den vanliga Z-upp-mappningen skulle den bli spegelvänd). Se [Kolumnmappning](column-mapping.md) och [Läsa in filer](loading-files.md). `python -m heat3d_cs2 map <karta>` exporterar kartans geometri i samma ram, inläst i **Bakgrund / nivå**.

De konventioner som siffrorna bygger på är konverterarens (de anges i dess README och finns i varje sammanfattning): en död är **tradad** när dess dödare dödas av en av offrets lagkamrater inom **5 s**; **KAST** är andelen rundor med en fällning, en assist (en flash-assist räknas), överlevnad eller ett tradat dödsfall; **skada** är hälsa som verkligen förlorats, bara fiender; en **clutch** är att vara den sista levande på en sida med fiender kvar, vunnen när sidan vinner; **köp** per sida utifrån medelvärdet av utrustningens värde vid slutet av frystiden – första rundan i varje reguljär halvlek är en pistolrunda (ingen i övertid), sedan under 1 500 $ en eco, under 4 000 $ ett force buy, allt mer ett fullt köp.

## Fliken {#the-tab}

Sidofältet i fliken Match har värmekartans lägesväxel och sessionsväljare överst, sedan matchavsnitten nedanför, och sist värmekartans paneler **Filter**, **Bakgrund / nivå** och **Kamera & scen** – vyn är värmekartan för vilken Parquet som helst som lästs in i fliken Värmekarta.

### Matchsammanfattningar {#match-summaries}

| Kontroll | Gör |
|---|---|
| **Läs in matchfiler…** | väljer `.json`-filer (flera på en gång): sammanfattningarna `.match.json` |
| släpp på vyn | JSON-filer som släpps på vyn medan fliken Match är öppen läses in på samma sätt (andra filer ignoreras) |
| **Rensa** | tar bort varje match |
| **Alla matcher** (med två eller fler) | ”N matcher, M rundor”: statistiken över alla |
| en matchrad | ”TeamA 13 mot TeamB 9”, karta · N rundor: öppnar den matchen |

En fil godtas när den är JSON med `"format": "heat3d-cs2-match"` och arrayerna `rounds`, `players` och `teams`. Fel listas under knapparna: ”<fil>: inte JSON”, ”<fil>: inte en CS2-matchsammanfattning (heat3d-cs2-match)”, ”<fil>: rounds, players eller teams saknas”. En match som läses in igen (samma `match`-namn) ersätter den tidigare. Matcherna sorteras efter karta, sedan efter namn. Med exakt en match inläst öppnas den; annars behålls valet (alla matcher som standard).

När inget är inläst förklarar avsnittet: konvertera med `python -m heat3d_cs2 demos`, läs in `.match.json`-filerna här och `.parquet`-filerna i fliken Värmekarta.

### Match (en match öppen) {#match-one-match-open}

**Rubriken:** båda lagen med sin ställning, kartan, halvlekarna – ”halvlekar 7-5, 6-6”: rundorna 1–12 och 13–24 (premier- och tävlingsspel MR12; en sammanfattnings egen halvlekslängd när den anger en, så 1–15 och 16–30 för MR15) – sedan, när matchen gick till övertid, dess ställning för sig: ”övertid 4-2”, rundorna efter båda halvlekarna. En oavgjord runda räknas för inget lag. Och ”N rundor avbrutna i demon” när sammanfattningen listar ofullständiga rundor.

**Rundremsan:** en cell per runda, färgad efter den sida som vann, med sitt nummer och en markering för hur den slutade. En oavgjord runda (ingen vinnare) är en neutral grå cell märkt `=`, aldrig en sidas färg; dess verktygstips säger ”Runda 30: oavgjort – ingen av sidorna vann den”.

| Markering | Slutade med |
|---|---|
| B | bomben exploderade |
| D | bomben avinstallerades |
| K | utslagen |
| T | tiden tog slut |
| S | kapitulation |
| = | oavgjort |
| ? | annat |

Ett skiljestreck markerar starten på andra halvleken (runda 13, eller rundan efter sammanfattningens halvlekslängd) och på varje tre-rundors övertidshalva (rundorna 25, 28, 31, …). Håll musen över en cell: ”Runda 7: TeamA (T) – bomben exploderade, planterad på A” (”…, planterad, plats okänd” när sammanfattningen saknar plats) och båda sidors köp och utrustningsvärde. Klicka för att öppna rundan; klicka igen för att stänga den (”Klicka på en runda för dess fällningar, ekonomi och repris.”).

**Rundan:**

- ”Runda 7: <lag> vann – <hur>” (”Runda 30: oavgjort – ingen av sidorna vann den” vid oavgjort) och hur lång tid rundan tog (från frysslut till avgjord, m:ss);
- ekonomin: varje sidas lag, köp (pistol, eco, force buy, fullt köp) och utrustningsvärde (”4 350 $”);
- planteringen: plats, spelare och tid in i rundan (från någon av sammanfattningsversionerna); ”Planterad av <spelare> vid 1:05, plats okänd” när platsen inte är känd;
- **dödsflödet**, i ordning: tid in i rundan, angripare (i sidans färg; ”world” när det inte finns någon angripare), vapen, och flaggor – **HS** huvudskott, **WB** genom en vägg, **SM** genom rök; **open** rundans första fällning, **trade** (hämnade en lagkamrat inom 5 s), **traded** (dödaren dödades inom 5 s), **team** en lagkamratsfällning (ett självmord är ingen). Fällningar efter att rundan blivit avgjord tonas ned;
- clutcharna: ”<spelare> (T) ensam mot 3: vann clutchen” / ”förlorade den”;
- vem som var vid liv i slutet, per sida (”ingen”);
- **Visa runda**: allt i den här rundan, i värmekartan;
- **Spela upp runda**: spelar upp rundan som lådor, från dess start (nedan).

Knapparna **Visa i värmekartan** (se [nedan](#show-in-the-heatmap)) för den här matchen, eller för den öppna rundan.

### Resultattavla {#scoreboard}

En tabell per lag, en rad per spelare:

| Kolumn | Är |
|---|---|
| K, D | fällningar, dödsfall |
| A | assist, inklusive flash-assist |
| ± | fällningar minus dödsfall (grönt över 0, rött under) |
| ADR | skada per runda, hälsa som verkligen förlorats |
| KAST | % av rundorna med en fällning, en assist, överlevnad eller ett tradat dödsfall |
| HS | % huvudskottsfällningar |
| Open | vunna–förlorade öppningsdueller |
| Cl | vunna/spelade clutcher |

Håll musen över en spelare: trade-fällningar, gånger tradad, flash-assist, fiender bländade, skada från verktyg, och multifällningsrundor (”2×3k”). **Klicka på en spelare** för dess fällningar och dödsfall i värmekartan (den här matchen).

### Över matcher (Alla matcher) {#across-matches-all-matches}

Över varje inläst match:

- ”N matcher · M rundor · <kartor>”, och ”N rundor oavgjorda, vunna av ingen sida” när det fanns oavgjorda;
- **Vunna ronder** per sida: totalt, i **pistol**-rundor (sammanfattningens pistolrundor), och vid **eco**-, **force**- och **full**-köp (var och en som en procentsats med de spelade rundorna; håll musen för ”vunna av spelade”). En oavgjord runda spelas av båda sidor och vinns av ingen;
- **Bomb**: planteringar per plats, och hur ofta T-sidan sedan vann de rundorna (”12 planteringar på A (T vann 67 %)”), planteringar vars plats sammanfattningen inte känner till på egen hand (”2 planteringar på en okänd plats (T vann 50 %)”), eller ”aldrig planterad”; hur rundorna slutade, vanligast först;
- ”Sidan som tog den första fällningen vann N % av de rundorna.” (ett självmord är ingen öppningsfällning; en oavgjord runda ger ingen omvandling av öppningen);
- **Öppningsdueller, var**: de tio platser med flest öppningsfällningar (efter var offret var; spelets platsnamn gjorda läsbara, ”TopofMid” → ”Top of Mid”), dueller och den andel T-sidan vann;
- **Spelare**: de femton bästa efter fällningar minus dödsfall, sammanslagna över alla deras matcher (matchade efter Steam-ID): matcher, K-D, ADR och KAST viktade efter spelade rundor, HS-% viktad efter fällningar, öppningsdueller. **Klicka på en spelare** för dess fällningar och dödsfall över alla matcher i värmekartan.

Knapparna Visa i värmekartan för alla inlästa matcher sitter under den.

## Visa i värmekartan {#show-in-the-heatmap}

Varje länk sätter värmekartans egna **filter**, så det som visas förblir synligt och redigerbart i panelen Filter, och **Visa alla** rensar dem. De fungerar på värmekartans tabell som lästs in i fliken Värmekarta; fliken Match läser aldrig in den själv.

| Knapp | Visade händelser |
|---|---|
| **Positioner** | `position` – var spelarna var, åtta gånger per sekund |
| **Fällningar** | `kill` – var dödaren stod |
| **Dödsfall** | `death` – var offret föll |
| **Öppningar** | `kill` och `death` med `opening` = 1 – den första fällningen i varje runda, där båda stod (erbjuds bara när tabellen har en kolumn `opening`) |
| **Smokes** | `smoke` – var rök landade |
| **Flashes** | `flash` – var flashar small |
| **Molotovs** | `molotov` – var molotovs och brandbomber brann |
| **HE** | `he` – var HE-granater small av |
| **Planteringar** | `plant` – var bomben planterades |
| **Skott** | `shot` – var skott avlossades |

Avgränsat efter var knapparna sitter: alla inlästa matcher, den här matchen, eller den här rundan (”Visa i värmekartan – runda 7”).

Det som inte kan tillämpas sägs under knapparna, i stället för att tyst filtreras bort till ingenting: ”ingen matchkolumn behållen – match inte tillämpad”, ”match: X finns inte i den inlästa datan”, samma för runda och händelser, ”spelaren X finns inte i den inlästa datan”, ”sidan X finns inte i den inlästa datan”, ”ingen värmekartedata inläst: läs in matchernas .parquet-filer i fliken Värmekarta”. Utan inläst data säger länkarna också ”Läs in matchernas .parquet-filer i fliken Värmekarta för att se dem på kartan.”

**Spela upp runda** byter dessutom värmekartan till **Lådrepris**, tidslinjen till läget *spela* med sitt fönster satt till *livstid*, söker till början av rundans session och spelar upp. När rundan inte är en session i den inlästa datan: ”den här rundan är inte en session i den inlästa datan: inget att spela upp”.

## För utvecklare {#for-developers}

Kod: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Sammanfattningsversioner {#summary-versions}

Fliken läser sammanfattningar av version 1 och version 2 (`"version"` i filen) sida vid sida, och behandlar dem lika:

| | Version 2 | Version 1 |
|---|---|---|
| plantingstid | sekunder in i rundan, som fällningarna | matchsekunder; fliken subtraherar rundans start |
| planteringsplats | `A` eller `B`; tomt när demon inte anger det | `A`, `B` eller ett entitetsnummer – läses som en okänd plats |
| halvlekslängd | `halfLength`, från där sidorna först byter; 12 när den är null | 12 (MR12) |
| pistolrundor | `pistolRounds` (runda 1 och första rundan efter halvleken) | de rundor vars köp är `pistol` |
| oavgjord runda | `winner` och `winnerTeam` tomma | - |
| självmord | `suicide` på fällningen, aldrig en lagkamratsfällning | känt av att angripare och offer är samma spelare |

En fällnings `noscope` och `attackerBlind` (version 2) visas inte i fliken Match, som heller inte visar någon plats från värmekartetabellen, så en granatrads tomma `place` där ändrar ingenting här.

Så blir ett fokus till filter (`focusFilters`):

- **match** → ett kategorifilter på kolumnen `match`;
- **round** → ett intervallfilter `round` = N på en numerisk kolumn `round` (ett kategorifilter på en kategorisk), och rundans session (`<match> #NN`) väljs i sessionsväljaren;
- **events** → ett kategorifilter på kolumnen `event`;
- **player** → ett personfilter på just den spelaren;
- **side** → ett gruppfilter.

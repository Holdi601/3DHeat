---
title: "Wedstrijdanalyse (CS2)"
nav_order: 10
lang: "nl"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# Wedstrijdanalyse (CS2)

Het tabblad **Match** speelt een opname af als figuren. Voor een Counter-Strike 2-match toont het ook het scorebord: wie elke ronde won, hoe, en wie de kills maakte. Gebruik het om een match ronde voor ronde te bekijken, en spring dan naar hetzelfde moment in de heatmap.

Het tabblad Match speelt elke opname af als figuren: een opname van War Thunder of Tacview, of een CS2-demo, die onder **Matches in de replay** staat ([Matchreplay](match-replay.md)). Een CS2-bestand `.match.json` voegt het scorebord toe dat op deze pagina wordt beschreven.

## Een CS2-match bekijken {#review-a-cs2-match}

1. Zet de demo om naar een `.parquet`- en een `.match.json`-bestand ([hieronder](#where-the-data-comes-from)).
2. Laad in het tabblad **Heatmap** het `.parquet`-bestand onder **Bron**.
3. Open het tabblad **Match** en klik op **Matchbestanden laden…**, of sleep het `.match.json`-bestand op het beeld.
4. Klik op een match in **Matchoverzichten**, en daarna op een cel van de rondestrook om die ronde te openen.
5. Klik op **Ronde tonen** om die ronde in de heatmap te zien, of op **Ronde afspelen** om hem als figuren te bekijken.

![Het tabblad Match: rondestrook met een geopende ronde, killfeed en Scorebord](../assets/img/en/match-analysis-round.webp)

Woorden als KAST, ADR, eco, force buy en trade staan in de [woordenlijst](glossary.md#counter-strike-words).

## Waar de data vandaan komt {#where-the-data-comes-from}

De democonverter van [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) zet demo's om in twee bestanden per match, in een map per kaart:

```bash
python -m heat3d_cs2 demos <demobestanden of mappen> -o out
```

| Bestand | Geladen in | Bevat |
|---|---|---|
| `<match>.parquet` | het tabblad **Heatmap** (paneel Bron, zoals elk Parquet - één bestand, meerdere of de hele map) | de positie van elke speler acht keer per seconde, en elke gebeurtenis op de plek waar die gebeurde: kill, dood, geraakt, schot, gooi, rook, flits, HE, molotov, decoy, verblind, plant, defuse, explosie; met `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, kijkrichting, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | het tabblad **Match** | teams, score, elke ronde (winnaar, hoe, economie, de plant, elke kill in volgorde, clutches, overlevers), de scorebordregel van elke speler |

De voettekst van het Parquet-bestand bevat leesinstructies (sleutel `heat3d`). Het opent daardoor zonder dat je iets instelt: de speler als persoon, de kant als groep, elke ronde (`roundId`, "<match> #NN") als sessie, de kijkrichting aan, en de wereld de goede kant op (de wereld van CS2 is rechtshandig met Z omhoog; leest men die met de standaard Z-omhoog-toewijzing, dan komt hij gespiegeld uit). Zie [Kolomtoewijzing](column-mapping.md) en [Bestanden laden](loading-files.md).
`python -m heat3d_cs2 map <kaart>` exporteert de geometrie van de kaart in hetzelfde kader. Die wordt geladen in **Niveau**.

De achtergrond van de getallen is die van de converter (beschreven in zijn README en opgenomen in elke samenvatting). Een dood is **getradet** als zijn doder door een teamgenoot van het slachtoffer wordt gedood binnen **5 s**. **KAST** is het aandeel van de rondes met een kill, een assist (een flitsassist telt mee), overleven of een getradete dood. **Schade** is de gezondheid die echt verloren is, alleen van vijanden. Een **clutch** is de laatste die nog leeft aan een kant terwijl er vijanden staan, gewonnen als die kant de ronde wint. **Aankoop** per kant volgt uit de gemiddelde waarde van de uitrusting aan het eind van de freezetijd. De eerste ronde van elke reguliere helft is een pistoolronde (in de verlenging geen), daarna onder $1.500 een eco, onder $4.000 een force buy, en alles daarboven een volle aankoop.

## Het tabblad {#the-tab}

De zijbalk van het tabblad Match bevat bovenaan de modusschakelaar en de sessiekiezer van de heatmap, daaronder de matchgedeelten, en daaronder de paneelen **Filters**, **Niveau** en **Camera** van de heatmap. Het beeld is de heatmap van welk Parquet ook geladen is in het tabblad Heatmap.

### Matchoverzichten {#match-summaries}

| Instelling | Doet |
|---|---|
| **Matchbestanden laden…** | kiest `.json`-bestanden (meerdere tegelijk): de samenvattingen `.match.json` |
| op het beeld slepen | JSON-bestanden die op het beeld worden gesleept terwijl het tabblad Match open is, worden zo geladen (andere bestanden worden genegeerd) |
| **Wissen** | verwijdert elke match |
| **Alle matches** (bij twee of meer) | "N matches, M rondes": de statistieken over alle matches samen |
| een matchrij | "TeamA 13 - TeamB 9", kaart · N rondes: opent die match |

Een bestand wordt geaccepteerd als het JSON is met `"format": "heat3d-cs2-match"` en de arrays `rounds`, `players` en `teams`. Fouten staan onder de knoppen: "<bestand>: geen JSON", "<bestand>: geen CS2-matchsamenvatting (heat3d-cs2-match)", "<bestand>: rounds, players of teams ontbreekt". Een match die opnieuw wordt geladen (dezelfde naam `match`), vervangt de eerdere. Matches worden gesorteerd op kaart en daarna op naam. Is precies één match geladen, dan wordt die geopend. Anders blijft de selectie staan (standaard alle matches).

Zonder geladen data legt het gedeelte uit: zet om met `python -m heat3d_cs2 demos`, laad hier de `.match.json`-bestanden en in het tabblad Heatmap de `.parquet`-bestanden.

### Match (één match geopend) {#match-one-match-open}

**De kop:** beide teams met hun score, de kaart, de helften: "helften 7-5, 6-6": rondes 1-12 en 13-24 (premier- en competitief spel MR12; de eigen helftlengte van een samenvatting als die er een opgeeft, dus 1-15 en 16-30 bij MR15). Gaat de match in de verlenging, dan staat daarna de score daarvan apart: "verlenging 4-2", de rondes na beide helften. Een gelijkspel telt voor geen van de teams. En "N rondes afgesneden in de demo" wanneer de samenvatting onvolledige rondes bevat.

**De rondestrook:** een cel per ronde, gekleurd naar de kant die won, met het nummer en een teken voor hoe die eindigde. Een gelijkspel (geen winnaar) is een neutrale grijze cel met `=`, nooit de kleur van een kant. De tooltip zegt "Ronde 30: gelijkspel - geen van beide kanten won hem".

| Teken | Beëindigd door |
|---|---|
| B | bom ontploft |
| D | bom ontmanteld |
| K | uitgeschakeld |
| T | tijd op |
| S | overgave |
| = | gelijkspel |
| ? | anders |

Een scheidingslijn markeert het begin van de tweede helft (ronde 13, of de ronde na de helftlengte van de samenvatting) en van elke helft van drie rondes in de verlenging (rondes 25, 28, 31, …). Beweeg over een cel: "Ronde 7: TeamA (T) - bom ontploft, geplant A" ("…, geplant, locatie onbekend" als de samenvatting geen locatie heeft), en de aankoop en uitrustingswaarde van beide kanten. Klik om de ronde te openen; klik nogmaals om hem te sluiten ("Klik op een ronde voor de kills, economie en replay").

**De ronde:**

- "Ronde 7: <team> gewonnen - <hoe>" ("Ronde 30: gelijkspel - geen van beide kanten won hem" bij gelijkspel) en hoelang de ronde duurde (van einde freeze tot beslist, m:ss);
- de economie: het team van elke kant, aankoop (pistool, eco, force buy, volle aankoop) en uitrustingswaarde ("$4.350");
- de plant: locatie, speler en tijd in de ronde (uit beide versies van de samenvatting); "Geplant door <speler> om 1:05, locatie onbekend" als de locatie niet bekend is;
- **de killfeed**, in volgorde: tijd in de ronde, aanvaller (in de kleur van de kant; "world" als er geen aanvaller is), wapen, en vlaggen - **HS** headshot, **WB** door een muur, **SM** door rook; **open** de eerste kill van de ronde, **trade** (wraak voor een teamgenoot binnen 5 s), **getradet** (de doder werd binnen 5 s gedood), **team** een teamkill (een zelfmoord telt niet). Kills nadat de ronde was beslist, zijn gedimd;
- de clutches: "<speler> (T) alleen tegen 3: clutch gewonnen" / "verloren";
- wie er aan het eind per kant nog leefde ("niemand");
- **Ronde tonen**: alles in deze ronde, in de heatmap;
- **Ronde afspelen**: speelt de ronde af als boxen, vanaf het begin (hieronder).

De knoppen **In de heatmap tonen** (zie [hieronder](#show-in-the-heatmap)) gelden voor deze match, of voor de geopende ronde.

### Scorebord {#scoreboard}

Een tabel per team, een rij per speler:

| Kolom | Is |
|---|---|
| K, D | kills, doden |
| A | assists, inclusief flitsassists |
| ± | kills min doden (groen boven 0, rood eronder) |
| ADR | schade per ronde, gezondheid die echt verloren is |
| KAST | % van de rondes met een kill, assist, overleven of een getradete dood |
| HS | % headshot-kills |
| Open | openingsduels gewonnen-verloren |
| Cl | clutches gewonnen/gespeeld |

Beweeg over een speler: trade-kills, keren getradet, flitsassists, vijanden geflitst, schade met hulpmiddelen en rondes met meerdere kills ("2×3k"). **Klik op een speler** voor zijn kills en doden in de heatmap (deze match).

### Over matches heen (Alle matches) {#across-matches-all-matches}

Over alle geladen matches:

- "N matches · M rondes · <kaarten>", en "N rondes gelijkgespeeld, door geen van beide kanten gewonnen" als er gelijkspelen waren;
- **Gewonnen rondes** per kant: in het algemeen, in **pistool**-rondes (de pistoolrondes van de samenvatting), en bij **eco**, **force** en **vol** aankopen (elk als percentage met de gespeelde rondes; beweeg voor "gewonnen van gespeeld"). Een gelijkspel wordt door beide kanten gespeeld en door geen van beide gewonnen;
- **Bom**: plants per locatie, en hoe vaak de T-kant die rondes daarna wint ("12 plants op A (T wint 67%)"), plants waarvan de locatie de samenvatting niet kent ("2 plants op een onbekende locatie (T wint 50%)"), of "nooit geplant"; hoe rondes eindigden, het vaakst eerst;
- "De kant die de openingskill nam, won N% van die rondes." (een zelfmoord is geen openingskill; een gelijkspel zet geen opening om);
- **Openingsduels, waar**: de tien plekken met de meeste openingskills (naar de plek van het slachtoffer; de plaatsnamen van het spel leesbaar gemaakt, "TopofMid" → "Top of Mid"), duels en het aandeel dat de T-kant won;
- **Spelers**: de vijftien beste op kills min doden, samengevoegd over al hun matches (gekoppeld via de Steam-ID): matches, K-D, ADR en KAST gewogen naar gespeelde rondes, HS% gewogen naar kills, openingsduels. **Klik op een speler** voor zijn kills en doden over alle matches in de heatmap.

De knoppen In de heatmap tonen voor alle geladen matches staan eronder.

## In de heatmap tonen {#show-in-the-heatmap}

Elke link zet de **filters** van de heatmap zelf, zodat wat getoond wordt zichtbaar en bewerkbaar blijft in het paneel Filters. **Alles tonen** wist ze. Ze werken op de heatmaptabel die in het tabblad Heatmap is geladen. Het tabblad Match laadt die nooit zelf.

| Knop | Getoonde gebeurtenissen |
|---|---|
| **Posities** | `position` - waar spelers waren, acht keer per seconde |
| **Kills** | `kill` - waar de doder stond |
| **Doden** | `death` - waar het slachtoffer viel |
| **Openingskills** | `kill` en `death` met `opening` = 1 - de eerste kill van elke ronde, waar beiden stonden (alleen aangeboden als de tabel een kolom `opening` heeft) |
| **Smokes** | `smoke` - waar rook neerkwam |
| **Flashes** | `flash` - waar flitsen knalden |
| **Molotovs** | `molotov` - waar molotovs en incendiaries brandden |
| **HE** | `he` - waar HE-granaten afgingen |
| **Plants** | `plant` - waar de bom werd geplant |
| **Schoten** | `shot` - waar schoten werden gelost |

De reikwijdte hangt af van waar de knoppen staan: alle geladen matches, deze match, of deze ronde ("In de heatmap tonen - ronde 7").

Wat niet toegepast kan worden, wordt onder de knoppen gezegd, en niet stil gefilterd tot niets: "geen matchkolom bewaard - match niet toegepast", "match: X niet in de geladen data", hetzelfde voor ronde en gebeurtenissen, "speler X niet in de geladen data", "kant X niet in de geladen data", "geen heatmapdata geladen: laad de .parquet-bestanden van de matches in het tabblad Heatmap". Zonder geladen data zeggen de links ook: "Laad de .parquet-bestanden van de matches in het tabblad Heatmap om ze op de kaart te zien."

**Ronde afspelen** zet bovendien de heatmap op **Boxreplay**, de tijdlijn op de modus *afspelen* met het venster op *levensduur*, springt naar het begin van de sessie van de ronde en speelt af. Is de ronde geen sessie van de geladen data: "deze ronde is geen sessie van de geladen data: niets om af te spelen".

## Voor ontwikkelaars {#for-developers}

Code: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Versies van de samenvatting {#summary-versions}

Het tabblad leest samenvattingen van versie 1 en versie 2 (`"version"` in het bestand) naast elkaar, en behandelt ze gelijk:

| | Versie 2 | Versie 1 |
|---|---|---|
| tijd van de plant | seconden in de ronde, zoals de kills | matchseconden; het tabblad trekt het begin van de ronde af |
| locatie van de plant | `A` of `B`; leeg wanneer de demo het niet zegt | `A`, `B`, of een entiteitsnummer - gelezen als onbekende locatie |
| helftlengte | `halfLength`, vanaf waar de kanten voor het eerst wisselen; 12 als het null is | 12 (MR12) |
| pistoolrondes | `pistolRounds` (ronde 1 en de eerste ronde na de helft) | de rondes waarvan de aankoop `pistol` is |
| gelijkspel | `winner` en `winnerTeam` leeg | - |
| zelfmoord | `suicide` op de kill, nooit een teamkill | herkend doordat aanvaller en slachtoffer dezelfde speler zijn |

De `noscope` en `attackerBlind` van een kill (versie 2) worden niet getoond in het tabblad Match. Dat tabblad toont ook geen plek uit de heatmaptabel, dus een lege `place` van een granaatrij verandert hier niets.

Hoe een focus filters wordt (`focusFilters`):

- **match** → een categoriefilter op de kolom `match`;
- **ronde** → een bereikfilter `round` = N op een numerieke kolom `round` (een categoriefilter op een categorische), en de sessie van de ronde (`<match> #NN`) wordt gekozen in de sessiekiezer;
- **gebeurtenissen** → een categoriefilter op de kolom `event`;
- **speler** → een persoonsfilter op die speler;
- **kant** → een groepsfilter.

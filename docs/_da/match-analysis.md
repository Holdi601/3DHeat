---
title: "Kampanalyse (CS2)"
nav_order: 10
lang: "da"
source: "match-analysis.md"
source_hash: "0b9ab06a759f"
translated: true
outdated: false
---

# Kampanalyse (Counter-Strike 2)

Fanen **Kamp** afspiller en optagelse som figurer, og for en Counter-Strike 2-kamp viser den også resultattavlen: hvem der vandt hver runde, hvordan, og hvem der fik drabene. Brug den til at gennemgå en kamp runde for runde og derefter hoppe til det samme øjeblik i heatmappet.

Fanen Kamp afspiller enhver optagelse som figurer: en War Thunder- eller Tacview-optagelse, eller en CS2-demo, opført under **Kampe i replayet** ([Kamp-replay](match-replay.md)). En CS2 `.match.json`-fil tilføjer resultattavlen beskrevet på denne side.

## Gennemgå en CS2-kamp {#review-a-cs2-match}

1. Konverter demoen ([nedenfor](#where-the-data-comes-from)) til en `.parquet`- og en `.match.json`-fil.
2. I fanen **Heatmap** indlæses `.parquet`-filen under **Kilde**.
3. Åbn fanen **Kamp** og klik på **Indlæs kampfiler …**, eller slip `.match.json`-filen på visningen.
4. Klik på en kamp under **Kampoversigter**, og derefter på en celle i runde-stripen for at åbne den runde.
5. Klik på **Vis runde** for at se den runde i heatmappet, eller på **Afspil runde** for at se den som figurer.

![Fanen Kamp: rundestribe med en åben runde, dræbelisten og resultattavlen](../assets/img/en/match-analysis-round.webp)

Ord som KAST, ADR, eco, force buy og trade står i [ordlisten](glossary.md#counter-strike-words).

## Hvor dataene kommer fra {#where-the-data-comes-from}

Demokonverteren i [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)
laver demoer om til to filer pr. kamp, i en mappe pr. kort:

```bash
python -m heat3d_cs2 demos <demofiler eller mapper> -o out
```

| Fil | Indlæses i | Indeholder |
|---|---|---|
| `<kamp>.parquet` | fanen **Heatmap** (panelet Kilde, som enhver Parquet - én fil, flere eller hele mappen) | hver spillers position otte gange i sekundet, og hver hændelse, hvor den skete: drab, dødsfald, skade, skud, kast, røg, blænding, HE, molotov, decoy, blind, plantning, desaktivering, eksplosion; med `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, kiggeretning, `weapon`, `place`, `opening`, `traded` ... |
| `<kamp>.match.json` | fanen **Kamp** | hold, stilling, hver runde (vinder, hvordan, økonomi, plantningen, hvert drab i rækkefølge, clutches, overlevende), hver spillers linje i resultattavlen |

Parquet-filens footer bærer læseinstruktioner (nøglen `heat3d`), så den åbnes uden at
noget skal indstilles: spilleren som personen, siden som gruppen, hver runde (`roundId`,
"<kamp> #NN") som en session, kiggeretningen på, og verden den rigtige vej rundt (CS2's
verden er højrehåndet med Z op; læst med standardkortlægningen for Z op ville den komme spejlvendt
ud). Se [Kolonnekortlægning](column-mapping.md) og [Indlæsning af filer](loading-files.md).
`python -m heat3d_cs2 map <kort>` eksporterer kortets geometri i samme ramme,
indlæst i **Bane**.

Konventionerne bag tallene er konverterens (angivet i dens
README og bragt med i hvert resumé): en død er **tradet**, når dens dræber bliver
dræbt af et af offerets holdkammerater inden for **5 s**; **KAST** er andelen af runder med et
drab, en assist (en blændingsassist tæller), overlevelse eller et tradet dødsfald; **skade** er
det liv, der faktisk er tabt, kun fjendtlig; en **clutch** er at være den sidste i live på en side med
fjender stående, vundet når siden vinder; **køb** pr. side ud fra den gennemsnitlige udstyrsværdi ved
slutningen af freeze-tiden - den første runde i hver halvdel af reglerne en pistolrunde
(ingen i overtid), derefter under 1.500 $ et eco, under 4.000 $ et force buy, alt mere et fuldt køb.

## Fanen {#the-tab}

Sidepanelet i fanen Kamp rummer heatmappets tilstandsskifter og sessionsvælger øverst, derefter kampens
afsnit nedenfor, og heatmappets paneler **Filtre**, **Bane** og **Kamera** - visningen er heatmappet
for den Parquet, der er indlæst i fanen Heatmap.

### Kampoversigter {#match-summaries}

| Kontrol | Gør |
|---|---|
| **Indlæs kampfiler …** | vælger `.json`-filer (flere ad gangen): `.match.json`-resuméerne |
| slip på visningen | JSON-filer, der slippes på visningen, mens fanen Kamp er åben, indlæses på samme måde (andre filer ignoreres) |
| **Ryd** | fjerner hver kamp |
| **Alle kampe** (med to eller flere) | "N kampe, M runder": statistikken for dem alle |
| en kamp-række | "HoldA 13 mod HoldB 9", kort · N runder: åbner den kamp |

En fil accepteres, når den er JSON med `"format": "heat3d-cs2-match"` og
arrays `rounds`, `players` og `teams`. Fejl vises under knapperne:
"<fil>: ikke JSON", "<fil>: ikke et CS2-kampresumé (heat3d-cs2-match)",
"<fil>: rounds, players eller teams mangler". En kamp indlæst igen (samme
`match`-navn) erstatter den tidligere. Kampene sorteres efter kort og derefter efter
navn. Med præcis én kamp indlæst åbnes den; ellers bliver valget
(alle kampe som standard).

Uden noget indlæst forklarer afsnittet: konvertér med `python -m heat3d_cs2
demos`, indlæs `.match.json`-filerne her og `.parquet`-filerne i
fanen Heatmap.

### Kamp (én kamp åben) {#match-one-match-open}

**Hovedet:** begge hold med deres stilling, kortet, halvdelene -
"halvdele 7-5, 6-6": runde 1-12 og 13-24 (premier- og konkurrencespil MR12;
resuméets egen halvlængde, når det angiver en, så 1-15 og 16-30 for MR15) -
og derefter, når kampen gik til overtid, dens stilling for sig selv: "overtid 4-2",
runderne efter begge halvdele. En uafgjort runde tæller for ingen af holdene. Og "N
runder skåret af i demoen", når resuméet lister ufuldstændige runder.

**Rundestriben:** en celle pr. runde, farvet efter den side, der vandt, med
sit nummer og et mærke for, hvordan den endte. En uafgjort runde (ingen vinder) er en neutral grå
celle markeret `=`, aldrig en sides farve; dens tooltip siger "Runde
30: uafgjort - ingen af siderne vandt den".

| Mærke | Endt af |
|---|---|
| B | bomben eksploderede |
| D | bomben blev desaktiveret |
| K | elimineret |
| T | tiden løb ud |
| S | overgivelse |
| = | uafgjort |
| ? | andet |

En skillelinje markerer starten på anden halvdel (runde 13, eller runden efter
resuméets halvlængde) og hver tre-runders overtidshalvdel (runde 25,
28, 31, …). Hold musen over en celle: "Runde 7: HoldA (T) - bomben eksploderede, plantet A"
("…, plantet, sted ukendt" når resuméet ikke har et sted) og begge siders
køb og udstyrsværdi. Klik for at åbne runden; klik igen for at lukke den ("Klik på en runde for
dens drab, økonomi og replay.").

**Runden:**

- "Runde 7: <hold> vandt - <hvordan>" ("Runde 30: uafgjort - ingen af siderne vandt den"
  for en uafgjort runde) og hvor lang runden varede (freeze-slut til afgjort, m:ss);
- økonomien: hver sides hold, køb (pistol, eco, force buy, fuldt køb) og udstyrsværdi ("4.350 $");
- plantningen: sted, spiller og tid inde i runden (fra begge resumé-versioner); "Plantet af <spiller> kl. 1:05, sted ukendt", når stedet ikke kendes;
- **dræbelisten**, i rækkefølge: tid inde i runden, angriber (i sidens farve; "world" for ingen angriber), våben og flag - **HS** headshot,
  **WB** gennem en væg, **SM** gennem røg; **åbning** rundens første drab,
  **trade** (hævnede en holdkammerat inden for 5 s), **tradet** (dræberen blev dræbt inden for 5 s), **hold** et holddrab (et selvmord tæller ikke). Drab efter at runden var afgjort, er dæmpet;
- clutches: "<spiller> (T) alene mod 3: vandt clutchen" / "tabte den";
- hvem der var i live til sidst, pr. side ("ingen");
- **Vis runde**: alt i denne runde, i heatmappet;
- **Afspil runde**: afspiller runden som bokse, fra dens start (nedenfor).

**Knapperne Vis i heatmappet** (se [nedenfor](#show-in-the-heatmap)) for denne
kamp, eller for den åbne runde.

### Resultattavle {#scoreboard}

En tabel pr. hold, en række pr. spiller:

| Kolonne | Er |
|---|---|
| K, D | drab, dødsfald |
| A | assists, inklusive blændingsassists |
| ± | drab minus dødsfald (grønt over 0, rødt under) |
| ADR | skade pr. runde, det liv der faktisk er tabt |
| KAST | % af runderne med et drab, en assist, overlevelse eller et tradet dødsfald |
| HS | % headshot-drab |
| Åbning | åbningsdueller vundet-tabt |
| Cl | clutches vundet/spillet |

Hold musen over en spiller: tradede drab, gange tradet, blændingsassists, blændede fjender,
hjælpeskade og multidrab-runder ("2×3k"). **Klik på en spiller** for deres
drab og dødsfald i heatmappet (denne kamp).

### På tværs af kampe (Alle kampe) {#across-matches-all-matches}

Over alle indlæste kampe:

- "N kampe · M runder · <kort>", og "N runder uafgjort, vundet af ingen af siderne"
  når der var uafgjorte;
- **Vundne runder** pr. side: samlet, på **pistol**-runder (resuméets pistolrunder), og på **eco**-, **force**- og **fulde** køb (hver som en procentdel med de spillede runder; hold musen for "vundet af spillede"). En uafgjort
  runde spilles af begge sider og vindes af ingen;
- **Bombe**: plantninger pr. sted, og hvor ofte T-siden gik videre til at vinde de runder ("12 plantninger på A (T vandt 67 %)"), plantninger hvis sted resuméet ikke kender alene ("2 plantninger på et ukendt sted (T vandt 50 %)"), eller "aldrig plantet"; hvordan runderne endte, hyppigste først;
- "Siden, der tog det første drab, vandt N % af de runder." (et selvmord er ikke et åbningsdrab; en uafgjort runde konverterer ingen åbning);
- **Åbningsdueller, hvor**: de ti steder med flest åbningsdrab (efter hvor offeret var; spillets stednavne gjort læsbare, "TopofMid" →
  "Top of Mid"), dueller og den andel T-siden vandt;
- **Spillere**: de femten bedste efter drab minus dødsfald, samlet over alle deres kampe (matchet efter Steam-ID): kampe, K-D, ADR og KAST vægtet efter spillede runder, HS% vægtet efter drab, åbningsdueller. **Klik på en spiller** for deres drab og dødsfald på tværs af alle kampe i heatmappet.

Knapperne Vis i heatmappet for alle indlæste kampe står under den.

## Hvad der afgjorde runderne {#what-decided-the-rounds}

Fanen tæller; [Indsigter](insights.md#who-won-what-decided-the-rounds) forklarer. Med en kamps heatmap-tabel indlæst (den har kolonnen `won`) deler **Indsigter** hver sides runder efter, hvad der skete i dem – åbningsduellen, købet, en byttet første død, plantningen, udstyr, en tidlig første kontakt, hvert sted holdt og hvert sted nået i de første 25 s – og siger, hvad der gjorde forskellen, med forskellen mellem vinderaterne, dens 95 %-interval og q, og *få runder*, hvor en arm har færre end otte. Den nævner vendepunkterne (de drab og plantninger, der flyttede vindersandsynligheden mest) og de spillere og steder, der tilføjede eller kostede mest, og **Gennemgang** og **Kommentator** begynder med dem. Et opdigtet eksempel:

> T vandt 79 % af de 19 runder, hvor den holdt Mid, mod 24 % af 21 uden (55 point, 95 % 26 til 74) – q 0,004.
>
> Vendepunkter: runde 17 ved 48 s, et drab af CT ved B site flyttede dens chance fra 31 % til 58 %, og den tog runden.

Én kamp har færre end 30 runder, så dens vindersandsynligheder kommer fra en fast prior-model ud fra de levende mænd, plantningen og uret; teksten siger det. Over mange kampe stilles de samme spørgsmål af [masseanalysen](mass-analysis.md#who-won).

## Vis i heatmappet {#show-in-the-heatmap}

Hvert link sætter heatmappets egne **filtre**, så det, der vises, forbliver synligt og kan redigeres i panelet Filtre, og **Vis alle** rydder dem.
De virker på heatmap-tabellen indlæst i fanen Heatmap; kamp-fanen indlæser
den aldrig selv.

| Knap | Hændelser, der vises |
|---|---|
| **Positioner** | `position` - hvor spillerne var, otte gange i sekundet |
| **Drab** | `kill` - hvor dræberen stod |
| **Dødsfald** | `death` - hvor offeret faldt |
| **Åbninger** | `kill` og `death` med `opening` = 1 - rundens første drab i hver runde, hvor begge stod (kun tilbudt, når tabellen har en kolonne `opening`) |
| **Smokes** | `smoke` - hvor røg landede |
| **Flashes** | `flash` - hvor blændinger sprang |
| **Molotovs** | `molotov` - hvor molotovs og brandbomber brændte |
| **HE** | `he` - hvor HE-granater eksploderede |
| **Plants** | `plant` - hvor bomben blev plantet |
| **Skud** | `shot` - hvor skud blev affyret fra |

Afgrænset efter hvor knapperne står: alle indlæste kampe, denne kamp eller denne
runde ("Vis i heatmappet - runde 7").

Det, der ikke kan anvendes, siges under knapperne i stedet for stille at filtrere til ingenting: "ingen kampkolonne bevaret - kamp ikke anvendt", "kamp: X ikke i de indlæste data", det samme for runde og hændelser, "spiller X ikke i de indlæste data", "side X ikke i de indlæste data", "ingen heatmap-data indlæst: indlæs kampenes .parquet-filer i fanen Heatmap". Uden indlæste data siger
linkene også "Indlæs kampenes .parquet-filer i fanen Heatmap for at se dem på kortet."

**Afspil runde** skifter desuden heatmappet til **Boksreplay**, tidslinjen til *afspil*-tilstand med dens vindue sat til *levetid*, springer til
starten af rundens session og afspiller. Når runden ikke er en session i de indlæste data: "denne runde er ikke en session i de indlæste data: intet at afspille".

## Til udviklere {#for-developers}

Kode: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Resumé-versioner {#summary-versions}

Fanen læser resuméer af version 1 og version 2 (`"version"` i filen) side om side og behandler dem ens:

| | Version 2 | Version 1 |
|---|---|---|
| plantningstid | sekunder inde i runden, som drabene | kampsekunder; fanen trækker rundens start fra |
| plantningssted | `A` eller `B`; tomt når demoen ikke siger det | `A`, `B` eller et entitetsnummer - læst som et ukendt sted |
| halvlængde | `halfLength`, fra hvor siderne først skifter; 12 når den er null | 12 (MR12) |
| pistolrunder | `pistolRounds` (runde 1 og den første runde efter halvdelen) | de runder, hvis køb er `pistol` |
| uafgjort runde | `winner` og `winnerTeam` tomme | - |
| selvmord | `suicide` på drabet, aldrig et holddrab | angivet ved, at angriber og offer er den samme spiller |

Et drabs `noscope` og `attackerBlind` (version 2) vises ikke i fanen Kamp, som heller ikke viser noget sted fra heatmap-tabellen, så en granatrækkes tomme `place` ændrer intet her.

Sådan bliver et fokus til filtre (`focusFilters`):

- **kamp** → et kategorifilter på kolonnen `match`;
- **runde** → et intervalfilter `round` = N på en numerisk kolonne `round` (et kategorifilter på en kategorisk), og rundens session
  (`<kamp> #NN`) vælges i sessionsvælgeren;
- **hændelser** → et kategorifilter på kolonnen `event`;
- **spiller** → et personfilter på den spiller;
- **side** → et gruppefilter.

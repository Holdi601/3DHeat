---
title: "Massanalyse"
nav_order: 8
lang: "no"
source: "mass-analysis.md"
source_hash: "88fad1d761e0"
translated: true
outdated: false
---

# Masseanalyse: tusenvis av kamper samtidig

**Masseanalyse** viser hva en hel mappe med kamper blir til samlet: hvilket kjøretøy som vinner mest, hvilken side som er favorisert, og hvor handlingen er. Bruk den når du har langt flere kamper enn du kan se på.

Den jobber fra et lite sammendrag av hver kamp, så tusen eller ti tusen kamper åpnes raskt. Den laster bare de fulle radene for kampene du klikker på.

## Prøv det {#try-it}

1. Åpne **Masseanalyse** i sidepanelet for Varmekart.
2. Trykk **Mappe...** (eller **Filer...**) og velg dine `.3dheat`-kamper.
3. Vent mens panelet leser sammendragene ("Sammendrag... n av N").
4. Trykk **Åpne analyse**. Et vindu åpnes med faner.
5. Sett filtrene (Spill, Kart, Modus, Fra, Til), og les en fane, for eksempel Balanse.
6. Klikk på en rad, en celle eller en innsikt: kampene deres lastes inn i 3D-visningen, med kameraet på stedet.

![The Balance tab: win rate and kills per death by vehicle](../assets/img/en/mass-balance.webp)

```
mappe med .3dheat -> sammendrag -> vindu (faner) -> klikk på en rad -> kamper åpnes i 3D
```

En `.3dheat`-fil er én kamp ([Én fil per kamp](container.md)). Et *varmekart* og en *rad* er forklart i [ordlisten](glossary.md).

## Få sammendragene {#getting-the-summaries}

For de fleste er det ingenting å gjøre: panelet finner selv ut manglende sammendrag. For å forberede en stor mappe én gang, bruk det frakoblede verktøyet nedenfor.

Hver `.3dheat`-kamp får et sammendrag (`src/mass/summarize.ts`), lagret i
containeren som medlemmet `<match>.summary.json` (rolle `summary`, se
[Én fil per kamp](container.md)). Det frakoblede verktøyet skriver dem, og
en indeks per mappe. Det er et utviklerverktøy; kjør det på en stor mappe for å spare panelet arbeidet:

```
node tools/3dheat-summarize.mjs <mappe>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- En kamp som allerede er oppsummert (samme formatversjon) bare leses; `--force`
  regner den ut på nytt. `--no-write` lar containerne være i fred.
- En fil som er endret de siste `--settle`-minuttene (10) utelates: en konverterer
  kan fortsatt skrive på den.
- `<mappe>/3dheat-index.jsonl.gz`: en linje per kamp – stien, størrelsen, tiden
  og sammendraget uten rutenettet. `<mappe>/3dheat-index.grids.jsonl.gz`: en
  linje per kamp med rutenettet.
- Kjør den på maskinen som har filene, med lav prioritet (for eksempel `nice -n 19 ionice -c3` på Linux).

For hver kamp tar panelet det første av disse: mappens indeksslinje (samme
sti og størrelse), nettleserens buffer (IndexedDB, etter navn, størrelse og tid),
containerens `summary`-medlem, eller et sammendrag som regnes ut i en gruppe
arbeidere og lagres i buffer. En mappe uten indeks fungerer dermed også – første gang
i hastigheten for å lese tabellene, deretter fra bufferen.

## Panelet {#the-panel}

Velg en mappe (eller filer; **Legg til mappe...** legger til en ny). Vinduet har filtrene **Spill**, **Kart**, **Modus**, **Fra** og **Til**, et valg for **Del etter**, **Færrest liv** og **Bare spillere**, og disse fanene. Alle tall kommer fra sammendragene. Et klikk på en rad, en celle eller en innsikt laster kampene inn i visningen som overlegget for mange kamper, med filtrene som viser det (kjøretøy, klasse, våpen, lag, spiller), og kameraet på stedet:

| Fane | Hva |
|---|---|
| Oversikt | kamper, timer, spillere, liv, rader, datoer; kamper per dag; etter spill, kart, modus; hendelsestotaler; økonomi etter valuta; når i kampen ting skjer |
| Balanse | etter kjøretøy, klasse, våpen eller lag, delt etter kart, modus, nivå eller spill: K/D med sitt ~95 % konfidensintervall, seiersrate (Wilson), overlevelse, drap og treff per minutt, inntjening per minutt, og q – Benjamini-Hochberg-falsk-oppdagelsesraten for K/D og seier mot resten av delingen. **Færrest liv** skjuler rader med for få liv til å stole på; **Bare spillere** utelater det oppdragets AI kjørte |
| Trender | bruk (andel av tilstedeværelse), K/D eller seiersrate for de beste kjøretøyene eller klassene per dag, uke eller måned |
| Spillere | ulike spillere, kamper per spiller, spillere per kamp, de hyppigste spillerne |
| Sider | hver side på hvert kart: kamper vunnet mot en jevn fordeling |
| Nærkamp | rundedata: åpningsdueller etter side og hvor ofte de blir til noe, tradinger, den som kikker mot den som holder, krysningsild, blendede innganger, sikte, plantinger, mannsovervekt og, **Etter kart**, stedene som dreper spillerne som går inn i dem – hver med en andel og sitt Wilson-intervall, fra sammendragenes `cqb`-tall ([Nærkamp og runder](close-quarters.md)) |
| Kart | et karts summerte rutenett: tilstedeværelse, drap, dødsfall, K/D, enhver hendelse, flyt, og **varm i hvor mange kamper** (stabilitet); etter lag, i 1, 2, 4 eller 8 ganger cellen |
| Steder | steder som skiller seg ut i tallene, men ikke i varmekartet (et stort område som er travelt som helhet, korridorer, høydebånd); **Finn steder** |
| Nisjer | grupper som gjør det markert bedre eller dårligere enn resten (et kjøretøy på ett kart, en sektor i én høyde); **Finn nisjer** |
| Innsikter | massedetektorene og kartdetektorene (nedenfor); **Kopier rapport (JSON)** gir JSON-en en språkmodell leser |

## Innsikter over mange kamper {#insights-over-many-matches}

Fanen **Steder** finner steder som skiller seg ut i tallene, men ikke i varmekartet: et stort område som er travelt som helhet, en korridor, et høydebånd, et sted som bare er travelt i en del av kampen. Den merker de som det vanlige varmekartet ikke viser, som **skjult**, og tegner dem opp i 3D-visningen. **Last inn** flyr dit med kampene det hadde. Fanen **Nisjer** finner grupper (et kjøretøy på ett kart og en side, en sektor i én høyde) som gjør det markert bedre eller dårligere enn resten. Klikk på en for å se finjusteringene.

Fanen **Innsikter** finner over alle kamper kjøretøy som bytter eller vinner bedre eller dårligere enn resten, steder som er varme i en jevn andel av kampene, sider som vinner mer enn en jevn fordeling, kjøretøy der bruken endrer seg over datoene, og deler av kampen som har flere drap enn en jevn spredning. Hvert funn har sine tall, sin effekt, sitt intervall og en falsk-oppdagelsesrate (holdt under 5 %), og et klikk laster kampene. Detaljer: [For utviklere](#for-developers).

## Skala {#scale}

Du kan selv gjøre en liten versjon av dette: `node tools/demo-data.mjs` skriver 150 syntetiske tankkamper til `tools/.shots/demo/mass` (omtrent 1 000 rader hver). Målt på de 150 syntetiske demokampene fra `tools/demo-data.mjs` på en stasjonær PC (en ekte kamp er langt større):

- `tools/3dheat-summarize.mjs` med 4 arbeidere: 2,6 til 4,8 s for alle 150, 8 til 21 ms per kamp inne i en arbeider. En andre kjøring som bare leser sammendragene, tar omtrent 2 s.
- Å åpne mappen i panelet, med indeksen til stede, til vinduet vises: 0,9 til 1,6 s (arbeiderens egen del, å lese de 150 indekslinjene, er 20 til 40 ms).
- Å bytte til en fane, til tabellen er tegnet: Oversikt 10 til 30 ms, Balanse 30 til 70 ms, Trender 30 til 45 ms, Spillere 15 til 35 ms, Sider 15 til 20 ms, Kart 55 til 130 ms.
- Lageret holder de 150 kampene i omtrent 0,5 MB.

Å åpne vinduet tar ett kort bilde: de valgte filene sendes til arbeideren 16 om gangen, og datofeltene og den første fanen kommer ett bilde etter vinduet.

Lageret bruker omtrent 15 KB per kamp, så 10 000 kamper tar ~150 MB i
arbeideren. Rutenett holdes aldri lenger enn kartet ba om.

## For utviklere {#for-developers}

### Innsikter over mange kamper {#insights-over-many-matches}

`src/mass/detect.ts` – hvert funn med sine tall, effekt og intervall,
p og q (Benjamini-Hochberg over alt detektoren prøvde, holdt under 5 %),
utforskingen som laster kampene og en setningsnøkkel med sine verdier.
Rapporten (`heat3d.mass/1`) er det `massReportForModel` gir en forteller,
i samme form som enkeltkamp-rapporten (`insights/seam.ts`).

| Detektor | Finner |
|---|---|
| `balance` | et spillerkjøretøy som bytter eller vinner bedre eller dårligere enn resten på et kart eller i en modus |
| `hotspot` | steder som er varme i en jevn andel av kampene som ble lagt til (kamper varme / kamper sett, mot kartets andre celler) – ikke bare varme i sum |
| `side` | en side på et kart som vinner mer enn en jevn fordeling |
| `meta` | et kjøretøys andel av spillerliv, eller K/D-en, som endrer seg mellom den tidligere og den senere halvdelen av datoene, per kart – stor nok til å bety noe, trender over kvartalene, på samme måte på de fleste kart (under) |
| `phase` | en del av kamplengden som har flere drap, treff, oppskytinger ... enn en jevn spredning |
| `place` | steder som skiller seg ut over mange kamper (Trinn B, under): en regions rate eller drapsandel mot hver kamps egen, sirkler, korridorer, vokste soner, høydebånd, faser; skjult når det vanlige varmekartet ikke viser dem |
| `niche` | grupper som gjør det markert bedre eller dårligere (Trinn B, under) |
| `grid.*` | enkeltdatasett-detektorene (kraftposisjoner, varme og stille soner, klasseplasser) på hvert karts summerte rutenett: `GridMerge.toInsightJob` fyller innsiktspassets rutenett fra sammendragene; detektorene som trenger spor hopper over |

### Sammendraget {#the-summary}

Vanlig JSON (`src/mass/types.ts`), omtrent 5–30 KB komprimert per kamp:

- kampen: spill, kart, modus, oppdrag, start, lengde, rader, liv, spillere,
  AI, lag (liv, spillere, tilstedeværelse, drap, dødsfall, seier, penger), vinner;
- per kjøretøy og lag: klasse, nivå, liv, spillerliv, tilstedeværelse, hendelser
  etter kanonisk type, drap etter målets klasse, seire, penger;
- per spiller (etter bruker-id, ellers navn): lag, liv, tilstedeværelse, drap, dødsfall,
  treff, oppskytinger, seier, kjøretøy; per våpen: hendelser etter type;
- økonomikolonnene (`cost_*`, `earn_*`) og deres totaler;
- faser: hendelser etter type i 20 bolker av kamplengden og etter minutt;
- atferd: kampens mål for kollektiv atferd (samstemthet, rutestyring, baner, trengsel,
  ledere, hengere, bruddpunkt, risiko etter tap, rekker, kjøpsenighet, undertrykking),
  hver med sin egen nullmodell, p og q – se [Kollektiv atferd](collective-behaviour.md);
- rutenettet (under).

Telt slik visningsprogrammet teller: kolonner funnet slik massespilleren finner dem
(`leanSpec`), hendelser etter `data/canonical.ts`; et drap et Tacview-våpen
scorer, teller for skytteren; en død som er sagt to ganger samtidig (`dead`, `death`)
teller én gang.

#### Rutenettet: det Trinn B bygger på {#the-grid-what-stage-b-builds-on}

Den romlige delen er laget for skanningsstatistikk over regioner av enhver størrelse
og form, ikke bare for varmebilder:

- **En pyramide.** Cellene er justerte potenser av to i verdenshenhold (x, z slik visningsprogrammet plasserer dem). Nivå `k` er cellene summert etter `ix >> k, iz >> k` –
  eksakt, innen en kamp og over kamper med andre cellestørrelser – og et hvilket
  som helst område (en boks, en korridor langs en linje, en ring) er en sum av celler. Det finste
  nivået passer kampens robuste utstrekning (cellene som har 99 % av tilstedeværelsen) i
  128 celler; spredte celler utenfor den beholdes.
- **Eksponering ved siden av hver telling.** Tilstedeværelsessekunder per celle, per lag (`pt`),
  per klasse av kjøretøy (`pc`) og per høydebånd (`ph`), slik at et områdes rate, forventning og forhold
  kan regnes ut for enhver undergruppe.
- **Høyde.** Bånd over kampens gulv (1. persentil av høyden): under 3 m, 3–10,
  10–30, 30–100, 100–300, 300–1000, 1000–3000, over; en fil med en kolonne `floor`/`storey`/`deck`
  deler inn etter etasjer i stedet. `y` er hver celles gjennomsnittlige høyde, `y0` dens laveste (dens etasje, for høyde over den).
- **Hendelser** som tupler `[celle, type, lag, klasse, bånd, antall]`.
- **Tidsskiver** på et grovt nivå (8 celler per side), etter minutt fra kampstart:
  `[cx, cz, minutt, type, verdi]`, tilstedeværelsessekunder som type
  `GRID_KINDS.length`; kampfaser er minutter over lengden.
- Sparsomt, tellinger som heltall, sekunder til en tiendedel: begrenset av det som skjedde.

### Trinn B: steder og nisjer {#stage-b-places-and-niches}

Trinn B leter etter det som skiller seg ut i tallene uten å fange øyet:
et stort område som er travelt som helhet uten en varm celle i seg, et merkelig
drap-dødsforhold på få hendelser, en korridor, et høydebånd, en klynge som bare er der
i én del av kampen – og grupper (et kjøretøy på ett kart på én side, en sektor i én høyde)
som gjør det markert bedre eller dårligere enn resten. En
**Finn steder** / **Finn nisjer** / **Finn innsikter** kjører alle detektorene;
de tre fanene deler rapporten.

#### Steder (`src/mass/scan.ts`) {#places-srcmassscants}

Hvert karts kamper leses to ganger, én kamp om gangen; minnet holder summer på et raster
med høyst 64 celler per side (16 for rom-tid-skanningen), aldri kampene.

- **Mål.** En hendelses rate per sekund med tilstedeværelse – drap, dødsfall,
  treff, oppskytinger, erobringer, for alle enheter, per klasse (de 4 med flest
  hendelser), per høydebånd – og andelen av drap i drap og dødsfall (alle, per side, per bånd). Hvilke klasser og sider som tas med, kommer fra hodene (`planOf`).
- **Forventning per kamp.** Hver kamps egen rate, fordelt over sin egen tilstedeværelse i en
  celle, er cellens forventning (en Kulldorff-skanning justert for kovariater og lagdelt etter kamp):
  noen få blodige kamper eller én travel server gir ingen plass.
- **Spredning.** Kampene er uenige langt mer enn Poisson. Hver kamps residualer
  summeres i blokker på 1, 2, 4, 8, 16 celler; spredningen for hver blokkstørrelse
  (kvadrerte residualer delt på nullvariansen, samlet, de verste 5 % av blokkene utelatt)
  skalerer hver test av en region av den størrelsen: et kvasi-sannsynlighetsforhold,
  Poisson for rater, binomisk for andeler.
- **Regioner.** Sirkler på 0,75 til 18 celler; ellipser i seks vinkler, 3 og 6
  ganger så lange som brede, 3 til 18 celler (korridorer; aksen er innsiktens
  `place.path`); soner vokst celle for celle fra de sterkeste lokale
  Getis-Ord Gi*-cellene mens regionens z vokser (uregelmessige former) – vokst
  på den ene halvdelen av kampene og testet på den andre, slik at vekstens frihet
  ikke koster falske steder; hvert høydebånd mot kartets andre bånd over hele kartet
  (klyngerobust); rom-tid-sylindere: en sirkel i én eller to femtedeler av kamplengden,
  mot kampens egen spredning av hendelsene over sted og tid (rom-tid-permutasjonsskanningen).
- **Testing.** p fra kvasi-sannsynlighetsforholdet; Benjamini-Hochberg over hver
  region som ble prøvd på hvert kart (700 000 på tre kart er vanlig) ved 5 %. Det som består,
  beskjæres (en region som mest ligger inne i en sterkere av samme mål, sier det samme),
  leses om for sin **stabilitet** – kamper som så den, kamper den var i, retningen i fem
  foldinger av kampene – og testes en gang til ved variansen kampene selv viser
  (klyngerobust, kampene som klynger, aldri under Poisson), BH igjen. Stille steder på en base
  (2 % eller mer av kartets spawn, avganger og landinger) utelates.
- **Effekt.** Rate- (eller odds-) forholdet, krympet med empirisk Bayes (en gamma-
  forhåndsfordeling tilpasset kartets 2×2-blokker), med et ~95 %-intervall ved spredningen; Gi* ved 1, 2 og 4 celler og lokal Moran i midten.
- **Visuell åpenbarhet.** Hvor mye regionen allerede viser i det vanlige varmekartet for sin hendelse (logaritmisk skala til den lyseste cellen, slik visningene tegner den):
  dens kontrast mot en ring rundt den (en tiendedel av paletten er vanskelig å se,
  to femtedeler enkelt) og en lys topp som bærer overskuddet; et forhold tegnes aldri av varmekartet, så en andel teller halvt. Under 35 % er **skjult**. Rangeringen: styrke (effekten metter ved 4 ganger, stille steder ved 0,7) ganger
  `1 - 0,7 × åpenbarhet` ganger foldenes enighet.

Fanen **Steder** lister dem (skjult bare som standard; etter kart, form, retning), et klikk tegner kartets steder opp i 3D-visningen (`placeLines.ts`:
motorens toppelinjer, bygget én gang – magenta skjult, gul vanlig, cyan stille,
det valgte fullt; et bånd som en boks fra gulvet til taket) og på lerretet i fanen
Kart; **Last inn** flyr dit og laster de 60 kampene det hadde flest av i, filtrert til sin hendelse (og klasse).

#### Nisjer (`src/mass/niche.ts`) {#niches-srcmassnichets}

Stråle-søk (bredde 24, dybde 3) over tre tabeller: **liv** (spillernes liv:
spill, kart, modus, klasse, kjøretøy, side, nivå, kvartal av datoene, tredjedel av
kamplengdene; K/D, seier, død som et liv, drap per time, inntjening per
minutt), **steder** (drap og dødsfall etter kart, modus, datoer, sektor av kartet
4 × 4, klasse, side, bånd) og **faser** (sektor og femtedel av kampen:
K/D, dødsfall per time tilstedeværelse). En gruppe testes mot helheten med kampene som klynger
(sandwich-variansen av dens residualer etter kamp), dens effekt et odds- eller ratio-forhold
krympet av en forhåndsfordeling på 20 utfall; den trenger 30 utfall i 8 kamper, en
finjustering må være 10 % sterkere enn sin forelder, og grupper der utfallet er ingen eller alle
(ikke registrert for dem) utelates. Beholdt: BH under 5 % over alle grupper som ble vurdert, et
krympet forhold på minst 1,25 (eller 1/1,25), fire av fem foldinger enige, og ikke en finjustering
som bare gjentar sin forelder. Fanen **Nisjer** lister dem; et klikk viser hver
én-betingelses-finjustering av gruppen (utforskeren), og **Last inn** laster kampene. Utstyr finnes ikke i sammendragene ennå.

#### Endringer i meta med praktisk betydning {#meta-shifts-with-practical-significance}

På blandede datoer kalte den binomiske testen på liv nesten hver endring betydelig. `meta` testes nå klyngerobust (hver kamps
liv er en klynge), beholder en bruksendring bare når den er på minst 2 prosentpoeng og 25 %, en K/D-endring på 1,3 ganger, kvartalene av datoene trender likt (Kendalls tau på minst 0,5) og, for et kjøretøy på flere kart, samme retning på de fleste av dem. Det gir bare noen få endringer på et testsett der den vanlige testen flagget nesten alle.

#### For en modell {#for-a-model}

`massReportForModel` gir hvert sted sin `region` (form, skjult,
åpenbarhet, høyder, fase) og hver nisje sine `conditions`, pluss hvor mange
regioner og grupper som ble prøvd. Kunnskapslinsen kan lese steder som drapssoner og
angrepsveier: typene deres er `place.*` og `niche.*`.

#### Kontroller {#checks}

`scan.test.ts` planter et diffust område (1,6 ganger dødsraten over en sirkel
på 22 celler, svakt i hver celle), en korridor, et høydebånd og en klynge som bare er i én fase, i 240 syntetiske overspredte kamper – alle funnet, det diffuse skjult – og kjører åtte nullsett på 60 kamper: ingen steder.
`niche.test.ts` finner en plantet gruppe av kjøretøy × kart × side og ingenting i
fem nulltabeller.

---
title: "Massanalys"
nav_order: 8
lang: "sv"
source: "mass-analysis.md"
source_hash: "88fad1d761e0"
translated: true
outdated: true
---

# Masanalys: tusentals matcher på en gång

**Masanalys** visar vad en hel mapp med matcher lägger ihop till: vilket fordon som vinner oftast, vilken sida som gynnas, var striden är. Använd den när du har långt fler matcher än du hinner titta på.

Den arbetar från en kort sammanfattning av varje match, så att tusen eller tiotusen matcher öppnas snabbt. Den läser in hela raderna bara för de matcher du klickar på.

## Prova {#try-it}

1. Öppna **Masanalys** i värmekartans sidofält.
2. Tryck på **Mapp…** (eller **Filer…**) och välj dina `.3dheat`-matcher.
3. Vänta medan panelen läser sammanfattningarna (”Sammanfattningar… n av N”).
4. Tryck på **Öppna analys**. Ett fönster öppnas med flikar.
5. Ställ in filtren (Spel, Karta, Läge, Från, Till) och läs en flik, till exempel Balans.
6. Klicka på en rad, en cell eller en insikt: dess matcher läses in i 3D-vyn, med kameran på platsen.

![Fliken Balans: vinstchans och nedskjutningar per död för varje fordon](../assets/img/en/mass-balance.webp)

```
mapp med .3dheat -> sammanfattningar -> fönster (flikar) -> klicka på en rad -> matcherna öppnas i 3D
```

En `.3dheat`-fil är en match ([En fil per match](container.md)). En *värmekarta* och en *rad* förklaras i [ordlistan](glossary.md).

## Få sammanfattningarna {#getting-the-summaries}

Ingenting att göra för de flesta: panelen tar själv fram de sammanfattningar som saknas. För att förbereda en stor mapp en gång, använd det offline-verktyg som beskrivs nedan.

Varje `.3dheat`-match får en sammanfattning (`src/mass/summarize.ts`), sparad i
containern som medlemmen `<match>.summary.json` (roll `summary`, se
[En fil per match](container.md)). Offline-verktyget skriver dem, och ett
index per mapp. Det är ett utvecklarverktyg; kör det på en stor mapp för att spara panelen arbetet:

```
node tools/3dheat-summarize.mjs <mapp>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- En match som redan sammanfattats (samma formatversion) bara läses; `--force`
  räknar ut den igen. `--no-write` lämnar containrarna orörda.
- En fil som ändrats under de senaste `--settle`-minuterna (10) utelämnas: ett
  konverteringsverktyg kan fortfarande skriva på den.
- `<mapp>/3dheat-index.jsonl.gz`: en rad per match – dess sökväg, storlek, tid
  och sammanfattning utan rutnätet. `<mapp>/3dheat-index.grids.jsonl.gz`: en
  rad per match med dess rutnät.
- Kör det på datorn som har filerna, med låg prioritet (till exempel `nice -n 19 ionice -c3` på Linux).

Panelen tar för varje match det första av: mappens indexrad (samma
sökväg och storlek), webbläsarens cache (IndexedDB, efter namn, storlek och tid),
containerns medlem `summary`, eller en sammanfattning som räknas ut i en pool av
arbetare och cachas. En mapp utan index fungerar alltså också – första gången i
läshastigheten för tabellerna, sedan från cachen.

## Panelen {#the-panel}

Välj en mapp (eller filer; **Lägg till mapp…** lägger till en mapp till). Fönstret har filtren **Spel**, **Karta**, **Läge**, **Från** och **Till**, ett val för **Dela upp efter**, **Färst liv** och **Endast spelare**, samt dessa flikar. Alla siffror kommer från sammanfattningarna, och ett klick på en rad, en cell eller en insikt läser in dess matcher i vyn som översikten för många matcher, med de filter som visar den (fordon, klass, vapen, lag, spelare) och kameran på platsen:

| Flik | Vad |
|---|---|
| Översikt | matcher, timmar, spelare, liv, rader, datum; matcher per dag; per spel, karta, läge; händelsesummor; ekonomi per valuta; när i matchen saker händer |
| Balans | per fordon, klass, vapen eller lag, uppdelat efter karta, läge, nivå eller spel: K/D med sitt ~95 %-intervall, vinstchans (Wilson), överlevnad, nedskjutningar och träffar per minut, intäkter per minut, och q – Benjamini-Hochbergs falska upptäcktsfrekvens för K/D och vinst mot resten av uppdelningen. **Färst liv** döljer rader med för få liv för att lita på; **Endast spelare** utelämnar det som uppdragets AI körde |
| Trender | användning (andel av närvaron), K/D eller vinstchans för de främsta fordonen eller klasserna per dag, vecka eller månad |
| Spelare | olika spelare, matcher per spelare, spelare per match, de vanligaste spelarna |
| Sidor | varje sida på varje karta: matcher vunna jämfört med en jämn fördelning |
| Närstrid | rundedata: öppningsdueller per sida och deras omvandling, byten, den som kikar mot den som håller, korseldar, blindade inträden, sikte, bombplantningar, mannaövertag och, **Per karta**, platserna som dödar spelarna som går in i dem – var och en en andel med sitt Wilson-intervall, från sammanfattningarnas `cqb`-räkningar ([Närstrid och rundor](close-quarters.md)) |
| Karta | en kartas summerade rutnät: närvaro, nedskjutningar, förluster, K/D, valfri händelse, flöde, och **het i hur många matcher** (stabilitet); per lag, vid 1, 2, 4 eller 8 gånger cellen |
| Platser | platser som sticker ut i siffrorna men inte i värmen (ett stort område som är upptaget som helhet, korridorer, höjdband); **Hitta platser** |
| Nischer | grupper som gör klart bättre eller sämre än resten (ett fordon på en karta, en sektor på en höjd); **Hitta nischer** |
| Insikter | massdetektorerna och kartdetektorerna (nedan); **Kopiera rapport (JSON)** ger den JSON som en språkmodell läser |

## Insikter över många matcher {#insights-over-many-matches}

Fliken **Platser** hittar platser som sticker ut i siffrorna men inte i värmen – ett stort område som är upptaget som helhet, en korridor, ett höjdband, en plats som bara är upptagen i en del av matchen – markerar de som den vanliga värmen inte visar som **dolda**, och ritar upp dem i 3D-vyn. **Läs in** flyger dit med de matcher den höll. Fliken **Nischer** hittar grupper (ett fordon på en karta och sida, en sektor på en höjd) som gör klart bättre eller sämre än resten; klicka på en för att se dess förfining.

Fliken **Insikter** hittar, över alla matcher, fordon som byter eller vinner bättre eller sämre än resten, platser som är heta i en stadig andel av matcherna, sidor som vinner mer än en jämn fördelning, fordon vars användning rör sig över datumen, och delar av matchen som har fler nedskjutningar än en jämn spridning. Varje fynd har sina räkningar, effekt, intervall och en falsk upptäcktsfrekvens (hållen på 5 %), och ett klick läser in dess matcher. Detaljer: [För utvecklare](#for-developers).

## Skala {#scale}

Du kan själv upprepa en liten version av detta: `node tools/demo-data.mjs` skriver 150 syntetiska tankmatcher till `tools/.shots/demo/mass` (ungefär 1 000 rader vardera). Uppmätt på de 150 syntetiska demomatcherna från `tools/demo-data.mjs` på en stationär dator (en verklig match är mycket större):

- `tools/3dheat-summarize.mjs` med 4 arbetare: 2,6 till 4,8 s för alla 150, 8 till 21 ms per match i en arbetare; en andra körning som bara läser sammanfattningarna tar cirka 2 s.
- Öppna mappen i panelen, med indexet på plats, tills fönstret visas: 0,9 till 1,6 s (arbetarens egen del, läsningen av de 150 indexraderna, är 20 till 40 ms).
- Byta flik, tills dess tabell är ritad: Översikt 10 till 30 ms, Balans 30 till 70 ms, Trender 30 till 45 ms, Spelare 15 till 35 ms, Sidor 15 till 20 ms, Karta 55 till 130 ms.
- Lagret håller de 150 matcherna på cirka 0,5 MB.

Att öppna fönstret tar en kort bildruta: de valda filerna skickas till arbetaren 16 åt gången, och datumfälten och den första fliken kommer en bildruta senare.

Lagret håller cirka 15 KB per match, så 10 000 matcher tar ~150 MB i arbetaren; rutnäten hålls aldrig längre än kartan begärde.

## För utvecklare {#for-developers}

### Insikter över många matcher {#insights-over-many-matches}

`src/mass/detect.ts` – varje fynd med sina räkningar, effekt och intervall,
p och q (Benjamini-Hochberg över allt detektorn prövade, hållen på 5 %),
den genomgång som läser in dess matcher och en meningsnyckel med dess värden;
rapporten (`heat3d.mass/1`) är det `massReportForModel` ger en berättare,
i samma form som enmatchsrapporten (`insights/seam.ts`).

| Detektor | Hittar |
|---|---|
| `balance` | ett spelarfordon som byter eller vinner bättre eller sämre än resten på en karta eller i ett läge |
| `hotspot` | platser som är heta i en stadig andel av de matcher som kom in (matcher heta / matcher sedda, mot kartans andra celler) – inte bara heta i summan |
| `side` | en sida på en karta som vinner mer än en jämn fördelning |
| `meta` | ett fordons andel av spelarnas liv eller dess K/D som rör sig mellan den tidigare och den senare halvan av datumen, per karta – tillräckligt stor för att betyda något, trendar över kvartalen, på samma sätt på de flesta kartor (nedan) |
| `phase` | en del av matchens längd som har fler nedskjutningar, träffar, uppskjutningar ... än en jämn spridning |
| `place` | platser som sticker ut över många matcher (Steg B, nedan): ett områdes takt eller nedskjutningsandel mot varje matchs egen, cirklar, korridorer, växta zoner, höjdband, faser; dolda när den vanliga värmen inte visar dem |
| `niche` | grupper som gör klart bättre eller sämre (Steg B, nedan) |
| `grid.*` | detektorerna för en enda datamängd (kraftpositioner, heta och tysta zoner, klassplatser) på varje kartas summerade rutnät: `GridMerge.toInsightJob` fyller insiktspassets rutnät från sammanfattningarna; detektorerna som behöver spår hoppar över |

### Sammanfattningen {#the-summary}

Vanlig JSON (`src/mass/types.ts`), ungefär 5–30 KB komprimerad per match:

- matchen: spel, karta, läge, uppdrag, start, längd, rader, liv, spelare,
  AI, lag (liv, spelare, närvaro, nedskjutningar, förluster, vinst, pengar), vinnare;
- per fordon och lag: klass, nivå, liv, spelarliv, närvaro, händelser
  efter kanonisk sort, nedskjutningar efter målets klass, vinster, pengar;
- per spelare (efter användar-id, annars namn): lag, liv, närvaro, nedskjutningar, förluster,
  träffar, uppskjutningar, vunnet, fordon; per vapen: händelser per sort;
- ekonomins kolumner (`cost_*`, `earn_*`) och deras summor;
- faser: händelser per sort i 20 fack av matchens längd och per minut;
- beteende: matchens mått på kollektivt beteende (samordning, ruttstyrning, körfält,
  trängsel, ledare, efterblivna, brytpunkt, risk efter förluster, rader,
  köpöverenskommelse, undertryckande), vart och ett med sin egen nollmodell,
  p och q – se [Kollektivt beteende](collective-behaviour.md);
- rutnätet (nedan).

Räknat så som visaren räknar: kolumner hittade så som massladdaren hittar dem
(`leanSpec`), händelser efter `data/canonical.ts`; en nedskjutning som ett Tacview-vapen
gör räknas för dess skytt; en död som sägs två gånger samtidigt (`dead`, `death`)
räknas en gång.

#### Rutnätet: det som Steg B bygger på {#the-grid-what-stage-b-builds-on}

Den rumsliga delen är gjord för skanningsstatistik över områden av vilken storlek och form som helst, inte bara för värmebilder:

- **En pyramid.** Celler är linjerade tvåpotenser i världsenheter (x, z så som visaren placerar dem). Nivå `k` är cellerna summerade med `ix >> k, iz >> k` – exakt, inom en match och över matcher med andra cellstorlekar – och varje område (en låda, en korridor längs en linje, en ring) är en summa av celler. Den finaste nivån får matchens robusta utsträckning (cellerna som håller 99 % av närvaron) att rymmas i 128 celler; avvikare utanför den behålls.
- **Exponering vid varje räkning.** Närvarosekunder per cell, per lag (`pt`), per fordonsklass (`pc`) och per höjdband (`ph`), så att ett områdes takt, förväntan och kvot räknas ut för vilken undergrupp som helst.
- **Höjd.** Band över matchens golv (1:a percentilen av höjden): under 3 m, 3–10, 10–30, 30–100, 100–300, 300–1000, 1000–3000, över; en fil med kolumnen `floor`/`storey`/`deck` delar i band efter sina våningar i stället. `y` är varje celles medelhöjd, `y0` dess lägsta (dess våning, för höjd över den).
- **Händelser** som tupler `[cell, kind, team, class, band, count]`.
- **Tidsskivor** på en grov nivå (8 celler per sida), per minut från matchstarten: `[cx, cz, minute, kind, value]`, närvarosekunder som sort `GRID_KINDS.length`; matchfaser är minuter över längden.
- Glest, räkningar som heltal, sekunder till en tiondel: begränsat av vad som hände.

### Steg B: platser och nischer {#stage-b-places-and-niches}

Steg B letar efter det som sticker ut i siffrorna utan att fånga ögat:
ett stort område som är upptaget som helhet utan någon het cell i sig, ett märkligt
nedskjutnings-/dödskvot på få händelser, en korridor, ett höjdband, ett kluster som bara finns i
en del av matchen – och grupper (ett fordon på en karta på en sida, en sektor på en höjd) som gör klart bättre eller sämre än resten. En
**Hitta platser** / **Hitta nischer** / **Hitta insikter** kör alla detektorer;
de tre flikarna delar rapporten.

#### Platser (`src/mass/scan.ts`) {#places-srcmassscants}

Varje kartas matcher läses två gånger, en match i taget; minnet håller summor på ett raster med högst 64 celler per sida (16 för rum-tid-skanningen), aldrig matcherna.

- **Mått.** En händelses takt per sekund av närvaro – nedskjutningar, förluster,
  träffar, uppskjutningar, erövringar, för alla enheter, per klass (de 4 med flest
  händelser), per höjdband – och andelen nedskjutningar i nedskjutningar och förluster
  (alla, per sida, per band). Vilka klasser och sidor som räknas kommer från huvudena (`planOf`).
- **Förväntan per match.** Varje matchs egna takt, utspridd över dess egen närvaro i en
  cell, är cellens förväntan (en kovariatjusterad Kulldorff-skanning, stratifierad per match):
  några blodiga matcher eller en upptagen server gör ingen plats.
- **Spridning.** Matcher skiljer sig långt mer än Poisson. Varje matchs residualer summeras i
  block om 1, 2, 4, 8, 16 celler; spridningen för varje blockstorlek (kvadrerade residualer
  över nollvariansen, sammanslagna, de värsta 5 % av blocken utelämnade) skalar varje test av ett
  område av den storleken: ett kvasi-likelihoodkvot, Poisson för takter, binomial för andelar.
- **Områden.** Cirklar på 0,75 till 18 celler; ellipser i sex vinklar, 3 och 6
  gånger så långa som breda, 3 till 18 celler (korridorer; axeln är insiktens
  `place.path`); zoner som växer cell för cell från de starkaste lokala
  Getis-Ord Gi*-cellerna medan områdets z växer (oregelbundna former) – växta på
  ena hälften av matcherna och prövade på den andra, så att tillväxtens frihet inte
  kostar några falska platser; varje höjdband mot matchens andra band över hela kartan
  (klusterrobust); rum-tid-cylindrar: en cirkel under en eller två femtedelar av matchens
  längd, mot matchens egna spridning av sina händelser över plats och tid (rum-tid-permutationsskanningen).
- **Prövning.** p från kvasi-likelihooden; Benjamini-Hochberg över varje område som prövats på varje karta
  (700 000 på tre kartor är vanligt) på 5 %. Det som går igenom beskärs (ett område som mest
  ligger inom ett starkare av sitt mått säger samma sak), läses igen för sin **stabilitet** –
  matcher som såg det, matcher det höll sig i, dess riktning i fem veck av matcherna – och prövas
  en gång till vid den varians som matcherna själva visar (klusterrobust, matcher
  som kluster, aldrig under Poisson), BH igen. Tysta platser på en bas (2 % eller mer av kartans uppgångar,
  starter och landningar) utelämnas.
- **Effekt.** Takt- (eller odds-) kvoten, krympt med empirisk Bayes (en gammaprior anpassad till
  kartans 2×2-block), med ett ~95 %-intervall vid spridningen; Gi* vid 1, 2 och 4 celler och lokal Moran i mitten.
- **Visuell uppenbarhet.** Hur mycket området redan visar i områdets vanliga värme (logaritmisk skala till
  den ljusaste cellen, så som vyerna ritar den): dess kontrast mot en ring runt det (en tiondel av paletten är svår att se,
  två femtedelar vanlig) och en ljus topp som bär överskottet; en kvot ritas aldrig av värmen, så en andel räknas som hälften. Under 35 % är det **dolt**.
  Rangordningen: styrka (effekt som mättas vid 4 gånger, tysta platser vid 0,7) gånger
  `1 - 0,7 × uppenbarhet` gånger veckens enighet.

Fliken **Platser** listar dem (dolda bara som standard; per karta, form, riktning), ett klick ritar upp kartans platser i 3D-vyn (`placeLines.ts`:
motorns översta linjer, byggda en gång – magenta dolda, bärnsten vanliga, cyan tysta,
den valda hel; ett band som en låda från dess golv till dess tak) och på fliken Kartas canvas; **Läs in** flyger dit och läser in de 60 matcher den höll
flest, filtrerade på dess händelse (och klass).

#### Nischer (`src/mass/niche.ts`) {#niches-srcmassnichets}

Strålsökning (bredd 24, djup 3) över tre tabeller: **liv** (spelarnas liv:
spel, karta, läge, klass, fordon, sida, nivå, kvartal av datumen, tredjedel av matchlängderna; K/D, vinst, död som ett liv, nedskjutningar per timme, intäkter per
minut), **platser** (nedskjutningar och förluster per karta, läge, datum, kartans sektor
4 × 4, klass, sida, band) och **faser** (sektor och femtedel av matchen:
K/D, förluster per timme närvaro). En grupp prövas mot helheten med matcher
som kluster (sandwichvariansen för dess residualer per match), dess effekt en odds- eller takt­kvot krympt av en prior på 20 utfall; den behöver 30
utfall i 8 matcher, en förfining måste vara 10 % starkare än sin förälder, grupper där utfallet är inget eller allt (inte registrerat för dem) utelämnas. Behålls: BH under 5 % över varje prövad grupp, en krympt kvot på minst 1,25
(eller 1/1,25), fyra av fem veck i överensstämmelse, inte en förfining som bara upprepar sin förälder. Fliken **Nischer** listar dem; ett klick visar varje
enkelvillkorsförfining av gruppen (utforskaren), **Läs in** läser in dess matcher. Utrustningar finns inte i sammanfattningarna ännu.

#### Metaförskjutningar med praktisk betydelse {#meta-shifts-with-practical-significance}

På blandade datum fångade binomialtestet på liv nästan varje förändring som signifikant. `meta` testar nu klusterrobust (varje matchs
liv ett kluster), behåller en användningsförskjutning först vid 2 punkter och minst 25 %, en K/D-förskjutning på 1,3 gånger, datumens kvartal trendar åt samma håll (Kendalls
tau minst 0,5) och, för ett fordon på flera kartor, samma riktning på de flesta av dem. Det lämnar bara några få förskjutningar på en testmängd där det vanliga testet flaggade nästan alla.

#### För en modell {#for-a-model}

`massReportForModel` ger varje plats dess `region` (form, dold, uppenbarhet, höjder, fas) och varje nisch dess `conditions`, plus hur många
områden och grupper som prövades. Kunskapslinsen kan läsa platser som dödszoner och anfallsvägar: deras sorter är `place.*` och `niche.*`.

#### Kontroller {#checks}

`scan.test.ts` planterar ett diffust område (1,6 gånger dödstakten över en cirkel
på 22 celler, svagt i varje cell), en korridor, ett höjdband och ett kluster som bara
gäller en fas i 240 syntetiska överspridda matcher – alla hittas, det diffusa dolt – och kör åtta nollmängder på 60 matcher: ingen plats.
`niche.test.ts` hittar en planterad grupp fordon × karta × sida och ingenting i
fem nolltabeller.

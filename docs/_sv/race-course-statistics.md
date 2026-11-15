---
title: "Banstatistik"
parent: "Racinganalys"
nav_order: 57
lang: "sv"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Banstatistik

Läs in många varv av en bana och betraktaren räknar misstagen: vilken kurva som kostar mest tid, hur många av varven som gick fel där och varför. Använd den för att hitta kurvan som lönar sig att träna på.

Prova: **Demovarv** ger tre varv, tillräckligt för att det här avsnittet ska visas.

![Banstatistik med misstagskartan: banan målad efter hur många varv som tappade tid i varje kurva, och listan över kurvorna](../assets/img/en/race-course-mistake-map.webp)

Läs in en banas hela mapp – dussintals varv, flera bilar, flera prestandaklasser – så bedöms varje varv och räknas sedan. Den här sidan täcker jämförelsen per klass, vad som räknas som misstag, avsnittet **Banstatistik**, misstagskartan, exporten till värmekartan, banor från flera spår och prestandagränserna med många varv.

## Mot det bästa i den egna klassen {#against-the-best-of-its-own-class}

Ett varv jämförs kurva för kurva med det **snabbaste kompletta varvet i sin egen prestandaklass** (referensen, i referensens klass). Det varvet självt jämförs med den som i sin klass var snabbast genom varje kurva, eller med alla varv när det är ensamt i sin klass. Bilar grupperas efter spelets prestandaklass (i Forza D upp till X; C och S2 är två av dem). En C-klassbils inbromsningspunkt mot en S2-bils säger inget om körningen. Tidskartan, skillnaderna i varvlistan och tabellen *Kurva för kurva* följer samma jämförelse (se [mot vilket varv varje varv jämförs](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statistiken bygger på analysen av varje varv, inte bredvid den.

## Vad som räknas som ett misstag {#what-counts-as-a-mistake}

En **förekomst** är ett varvs misstag i en kurva (ett segment). Ett varvs misstag i en kurva är:

1. **Körorsaken** analysen hittade för dess förlust där – ett fynd som är en förlust, lagt på föraren (inte bilen eller läget), som kostar **0,05 s** eller mer mot dess jämförelsevarv. Dess kostnad är kurvans förlust.
2. **Varje bilkontrollfel** det gjorde där som det andra varvet inte gjorde (ej delat), som kostar **0,03 s** eller mer – blockering, hjulspinn, bakvagnen som går ut, understyrning, snurr. Dess kostnad är händelsens egen.
3. **Varje träff och krasch**, delad eller inte, vad den än kostade.

En kurva kan innehålla flera; varje slag räknas **en gång per varv och kurva**. Vinster, bilens andel och en senare ankomst beslutad i kurvan före är inte misstag.

### Från fynd till misstag {#from-findings-to-mistakes}

| Fynd | Misstag |
|---|---|
| för snabbt in, långsamt ut, från inbromsning mer än några meter senare än den andra | Bromsade för sent |
| bromsade tidigt | Bromsade för tidigt |
| bromsade försiktigt | Bromsade för försiktigt |
| en låsning som orsak | Låste ett hjul |
| frirullade | Frirullade |
| grepp kvar, långsammare till scheiteln, bromsade där den andra bara släppte gasen | För långsam genom mitten |
| en för snäv linje | För snäv linje |
| gick för brett (understyrning) | Understyrde |
| vred bilen för lite / för mycket | Vred bilen fel |
| på gasen senare, full gas senare, tvekade | Sen på gasen |
| långsammare ut ur kurvan | Långsammare ut |
| hjulspinn | Hjulspinn |
| bakvagnen gick ut, i sidled genom mitten | Bakvagnen släppte |
| körde brett | Gick för brett |
| tappade fart | Tappade fart |
| släppte gasen (på väg in, eller på raksträckan) | Släppte gasen |
| en nästan-stopp, snurr, träff eller krasch som orsak | Snurrade / Träffade något / Kraschade, när händelserna i varvet där säger vilket (krasch först, sedan snurr, sedan träff); annars Stannade nästan |
| ett längre hopp | Flög för långt |

De två mönstren räknas som den orsak som finns inuti dem, enligt samma tabell. *Gav mer ifrån sig på väg in än utgången tog tillbaka* är misstaget för dess posts orsak: tidig inbromsning är *Bromsade för tidigt*, en låsning *Låste ett hjul*, frirullning *Frirullade*, outnyttjat grepp *För långsam genom mitten*. *För snabbt in, långsamt ut* är *Bromsade för sent* när varvet bromsade senare än den andra; annars misstaget för utgångens orsak – *Sen på gasen*, *Hjulspinn*, *Bakvagnen släppte*, *Gick för brett*, *Långsammare ut*. Ett mönster vars orsak är bilens, eller en senare ankomst, räknas inte.

Räknas inte: senare ankomst, starten, varje *bil*-fynd (drag, grepp, bromsar, drivning) och varje vinst eller jämn kurva.

### Slagen, i sin ordning {#the-kinds-in-their-order}

Inbromsning: *Bromsade för sent*, *Bromsade för tidigt*, *Bromsade för försiktigt*, *Låste ett hjul*. In i kurvan: *Frirullade*, *För långsam genom mitten*, *För snäv linje*, *Understyrde*, *Vred bilen fel*. Utgång: *Sen på gasen*, *Långsammare ut*, *Hjulspinn*, *Bakvagnen släppte*, *Gick för brett*, *Tappade fart*. Raksträcka: *Släppte gasen*. Händelser: *Snurrade*, *Träffade något*, *Kraschade*, *Stannade nästan*, *Flög för långt*.

## Avsnittet Banstatistik {#the-course-statistics-section}

Visas från **3** varv och uppåt, mellan **Varv** och **Var det finns tid att hämta**.

- **Sammanfattningen**: "40 varv i 9 bilar, 3 klasser: vart och ett bedömt kurva för kurva mot det snabbaste varvet i sin egen klass." (bilar räknas efter startnummer, eller namn).
- **Klassbrickor** (när det finns flera klasser): **Alla** och en bricka per klass, var och en med sitt antal varv, i spelets ordning (D, C, B, A, S1, S2, R, X, sedan övriga). Klicka på en klass för dess varv ensamma; **Shift+klick** lägger till eller tar bort en. Allt nedanför – listorna, kartan, exporten till värmekartan – följer de valda klasserna.
- **Vad som oftast går fel**: varje slag av misstag, med flest varv först (sedan flest gånger, sedan högst kostnad), högst 8 (**Alla N slag** visar resten, **Färre** döljer dem igen). Varje rad: dess namn, "N av M varv", ett stapeldiagram över den andelen, och "K gånger · cirka X s · oftast i T3 (5), T7 (4), T1 (2)" – hur ofta det gjordes (varv för varv, kurva för kurva), vad det kostade sammanlagt och de tre kurvor där flest varv gjorde det. **Klicka på en rad** för att visa den på misstagskartan (och slå på kartan); klicka igen för varje misstag.
- **Kurva för kurva** (eller *Kurva för kurva – <misstag>* när ett valts): per segment, "N av M tappade tid · X s" – varv som körde hela kurvan, de som tappade **0,05 s** eller mer där mot klassens bästa, och all tid de tappade. Ihopfälld visar den dess tre vanligaste misstag med deras antal varv. **Klicka på en kurva** för att öppna den, rama in den med kameran och byta till misstagskartan: för varje misstag (eller bara det valda) en rad som "12 av 40 varv bromsade för tidigt här. I 9 olika bilar – cirka 0,21 s vardera." och de varv som gjorde det, **värsta först**, var och ett med sin kostnad – högst 8, "+N till" för resten. **Klicka på ett varv** för att fokusera det och spela upp just det misstaget (inriktat 40 m före det).
- **Visa i värmekartan**: se nedan. "Bygger värmekartan…" medan den körs; inaktiverad när det inte finns några misstag.

## Misstagskartan {#the-mistake-map}

**Vy → Misstagskarta** målar längs referensbanan hur många av varven (i de valda klasserna) som gjorde ett misstag vid varje meter – av alla slag, eller det som valts i statistiken. Varje varv räknas en gång per meter; varje förekomsts sträcka (där dess orsak eller händelse var) breddas med 6 m åt vardera hållet, så att en kort syns. Bredare och ljusare där fler varv gjorde det: bredd `3 + 10 · (varv här / flest varv någonstans)` meter, färg från dämpat brunt till starkt orange; en grå 2 m remsa där inga gjorde det. Teckenförklaring: *få varv ↔ flest varv*.

Med **Etiketter** på bär varje kurvas scheitel sitt vanligaste misstag: "T3 · 12/40 sen inbromsning" (varv som gjorde det / varv som körde kurvan), "T3 · 12/40" när ett slag är valt, "T3 · ren" när inget är valt. Om man håller musen över en etikett visas kurvans förluster och dess fem vanligaste misstag; ett klick på den öppnar eller stänger den kurvan i statistiken.

## Visa i värmekartan {#show-in-the-heatmap}

**Visa i värmekartan** lämnar samma till värmekartans flik som ett dataset med namnet "Misstag på <bana>" (eller "Misstag på banan"), så att hela värmekartans verktygslåda – värmelägen, filter, tidslinjen, skivning – fungerar på var varven går fel.

Det är en CSV som byggs i minnet (`mistakeTable`), en rad per rutnätspunkt (var 2 m) för varje förekomst, på **varvets egen position** där:

| Kolumn | Innehåll |
|---|---|
| `x`, `y`, `z` | varvets position vid den meter (spelets koordinater) |
| `elapsed` | varvets tid där, s |
| `lap` | varvets etikett |
| `car` | bilens namn (eller "car 1234") |
| `mistake` | misstagets namn, på det aktuella språket |
| `car_class` | klassen, `-` när det saknas |
| `corner` | kurvans etikett, `T3` |
| `cost` | förekomstens kostnad, s |

Den läses in genom värmekartans egen inläsare med kopplingstips: Y upp, inga axelvändningar, skala 1; tiden `elapsed` i sekunder; **person** = `car`, **grupp** = `mistake`, **session** = `lap`; ingen blickriktning; `car_class`, `corner` och `cost` behålls som filterkolumner. Fliken byter sedan till **Värmekarta** och ramar in datan. Bara de klasser som valts i statistiken exporteras.

## Banor från flera spår {#courses-from-several-tracks}

Varv analyseras **en bana i taget**. En mapp med varv från flera banor – hela varvbiblioteket – erbjuder varje bana att läsas in för sig (med sitt antal varv, flest först); varv från körningar som aldrig gick i mål (FH Companions `unfinished/`) följer med sin bana och markeras *delvis*. Varv från flera namngivna banor som valts som filer erbjuds på samma sätt, och varv som inte anger någon bana följer med den som valts. Att läsa in varv från en annan namngiven bana än de som redan lästs in ersätter dem. Mer: [Läsa in varv](race-loading-laps.md#folders-and-courses).

## Prestanda med många varv {#performance-with-many-laps}

Dussintals varv analyseras på en eller två sekunder (alla, alltid). Det som ritas begränsas så att vyn håller bildfrekvensen:

| Gräns | Värde | Effekt |
|---|---|---|
| varv som ritas som standard | 8 (`SHOW_ALL_UP_TO`) | efter 8 inlästa varv döljs nytillkomna varv om de inte är referensen, det fokuserade varvet eller det bästa i sin klass. **Visa alla** ritar varje varv; **Bara de som granskas** går tillbaka. Att fokusera ett varv gör det synligt igen, liksom dess klassens bästa |
| enkla bilar och tunna linjer | fler än 10 synliga (`PLAIN_PAST`) | varv andra än fokus, den jagade bilen och referensen: en linjepunkt var 6 m (i stället för var 1,5 m), bilar ritade enkelt |
| varv i diagrammet | 8 (`CHART_LAPS`) | fokus, dess klassens bästa och referensen först; "+N till ritade, inte i diagrammet" |
| HUD-kort | 6 | de första sex synliga varven |
| statistik | från 3 varv | avsnittet är dolt under det |
| listade fynd | 12 förare, 8 bil/sammanhang, 10 vinster | per fokuserat varv |
| visade bilpar | 3 | efter 3 par, ett par med en väljare |

Misstagsförekomsterna räknas ut en gång per analys och cachas; misstagskartans täthet cachas per klassval och misstag.

## För utvecklare {#for-developers}

Kod: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` i [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).

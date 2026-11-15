---
title: "Banestatistikk"
parent: "Løpsanalyse"
nav_order: 57
lang: "no"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Banestatistikk

Last inn mange runder på én bane, så teller seeren feilene: hvilket sving som koster mest tid, hvor mange av rundene som gikk galt der, og hvorfor. Bruk den til å finne svingen som er verdt å øve på.

Prøv den: **Demorunder** gir tre runder, nok til at denne delen vises.

![Banestatistikk med feilkartet: banen farget etter hvor mange runder som mistet tid i hvert sving, og listen over svingene](../assets/img/en/race-course-mistake-map.webp)

Last inn hele mappen til en bane – dusinvis av runder, flere biler, flere ytelsesklasser – så blir hver runde vurdert, og deretter talt. Denne siden dekker sammenligningen per klasse, hva som regnes som en feil, delen **Banestatistikk**, feilkartet, eksporten til varmekartet, baner fra flere spor og ytelsesgrensene med mange runder.

## Mot den beste i sin egen klasse {#against-the-best-of-its-own-class}

En runde sammenlignes sving for sving med den **raskeste fullførte runden i sin egen ytelsesklasse** (referansen, i referansens klasse). Den runden sammenlignes selv med den som var raskest gjennom hvert sving i sin klasse, eller med alle runder når den er alene i sin klasse. Biler grupperes etter spillets ytelsesklasse (i Forza, D opp til X; C og S2 er to av dem). Et bremsepunkt for en C-bil mot en S2-bil sier ingenting om kjøringen. Tidskartet, forskjellene i rundelisten og tabellen *Sving for sving* følger den samme sammenligningen (se [hvem hver runde sammenlignes med](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statistikken bygger på analysen av hver runde, ikke ved siden av den.

## Hva som regnes som en feil {#what-counts-as-a-mistake}

En **forekomst** er én rundes feil i ett sving (segment). En rundes feil i et sving er:

1. **Den kjøringsårsaken** analysen fant for tapet der – et funn som er et tap, tilskrevet føreren (ikke bilen eller situasjonen), og som koster **0,05 s** eller mer mot sin sammenligningsrunde. Kostnaden er svingets tap.
2. **Hver bilkontroll-feil** den gjorde der og den andre runden ikke gjorde (ikke delt), og som koster **0,03 s** eller mer – blokkering, hjulspinn, bakenden som glir ut, understyring, snurr. Kostnaden er hendelsens egen.
3. **Hvert treff og hver krasj**, delt eller ikke, uansett hva de kostet.

Ett sving kan ha flere; hver type telles **én gang per runde og sving**. Gevinster, bilens andel og en tregere ankomst bestemt i svingen før, er ikke feil.

### Fra funn til feil {#from-findings-to-mistakes}

| Funn | Feil |
|---|---|
| for fort inn, sakte ut, fra å bremse mer enn noen meter senere enn den andre | Bremset for sent |
| bremset tidlig | Bremset for tidlig |
| bremset forsiktig | Bremset for forsiktig |
| en blokkering som årsak | Blokkerte et hjul |
| rullet uten gass | Rullet |
| grep å gi av, saktere til toppunktet, bremset der den andre bare løftet | For sakte gjennom midten |
| for trang linje | For trang linje |
| dyttet ut | Dyttet ut |
| snudde bilen mindre / for mye | Snudde bilen feil |
| på gassen senere, full gass senere, nølte | Sen gass |
| tregere ut av svingen | Tregere ut |
| hjulspinn | Hjulspinn |
| bakenden gled ut, sideveis gjennom midten | Bakenden gled ut |
| kjørte bredt | Kjørte bredt |
| mistet fart | Mistet fart |
| løftet (på vei inn, eller på rettstrekket) | Løftet |
| nesten stans, snurr, treff eller krasj som årsak | Snurret / Traff noe / Krasjet når hendelsene i runden der sier det (krasj først, så snurr, så treff); ellers Nesten stoppet |
| en lengre flyging | Fløy for langt |

De to mønstrene telles som årsaken som finnes inni dem, etter samme tabell. *Ga mer fra seg på vei inn enn utgangen fikk tilbake* er feilen til årsaken i oppføringen: tidlig bremsing er *Bremset for tidlig*, en blokkering *Blokkerte et hjul*, rulling *Rullet*, ubrukt grep *For sakte gjennom midten*. *For fort inn, sakte ut* er *Bremset for sent* der runden bremset senere enn den andre; ellers feilen til årsaken i utgangen – *Sen gass*, *Hjulspinn*, *Bakenden gled ut*, *Kjørte bredt*, *Tregere ut*. Et mønster der årsaken er bilens, eller en tregere ankomst, telles ikke.

Telles ikke: tregere ankomst, start, hvert *bil*-funn (trekk, grep, bremser, kjøring) og hver gevinst eller svinger uten tap.

### Typene, i rekkefølge {#the-kinds-in-their-order}

Bremsing: *Bremset for sent*, *Bremset for tidlig*, *Bremset for forsiktig*, *Blokkerte et hjul*. Inn i svingen: *Rullet*, *For sakte gjennom midten*, *For trang linje*, *Dyttet ut*, *Snudde bilen feil*. Ut av svingen: *Sen gass*, *Tregere ut*, *Hjulspinn*, *Bakenden gled ut*, *Kjørte bredt*, *Mistet fart*. Rettstrekk: *Løftet*. Hendelser: *Snurret*, *Traff noe*, *Krasjet*, *Nesten stoppet*, *Fløy for langt*.

## Delen Banestatistikk {#the-course-statistics-section}

Vises fra **3** runder og oppover, mellom **Runder** og **Hvor du kan forbedre deg**.

- **Oppsummeringen**: «40 runder i 9 biler, 3 klasser: hvert sving vurdert mot den raskeste runden i sin egen klasse.» (biler telles etter bilnummer, eller navn).
- **Klassebrikker** (med flere klasser): **Alle** og én brikke per klasse, hver med sitt antall runder, i spillets rekkefølge (D, C, B, A, S1, S2, R, X, så andre). Klikk på en klasse for bare dens runder; **Shift+klikk** legger til eller fjerner én. Alt under – listene, kartet, eksporten til varmekartet – følger klassene som er valgt.
- **Hva som oftest går galt**: hver type feil, med flest runder først (deretter flest ganger, så størst kostnad), til høyst 8 (**Alle N typer** viser resten, **Færre** skjuler dem igjen). Hver rad: navnet, «N av M runder», en stolpe for den andelen, og «K ganger · omtrent X s · oftest i T3 (5), T7 (4), T1 (2)» – hvor ofte den ble gjort (runde for sving), hva den kostet til sammen, og de tre svingene der flest runder gjorde den. **Klikk på en rad** for å vise den på feilkartet (og slå kartet på); klikk igjen for alle feil.
- **Sving for sving** (eller *Sving for sving – <feil>* med én valgt): per segment, «N av M mistet tid · X s» – runder som kjørte hele svingen, de som mistet **0,05 s** eller mer der mot klassens beste, og all tiden de mistet. Når den er brettet ut, lister den de tre vanligste feilene med antall runder. **Klikk på et sving** for å åpne det, ramme det inn med kameraet og bytte til feilkartet: for hver feil (eller bare den valgte) en linje som «12 av 40 runder bremset for tidlig her. I 9 ulike biler – omtrent 0,21 s hver.» og rundene som gjorde den, **verst først**, hver med sin kostnad – høyst 8, «+N til» for resten. **Klikk på en runde** for å fokusere den og spille av den feilen (stilt opp 40 m før den).
- **Vis i varmekartet**: se nedenfor. «Bygger varmekartet…» mens det kjører; deaktivert når det ikke finnes feil.
## Feilkartet {#the-mistake-map}

**Vis → Feilkart** maler langs referansebanen hvor mange av rundene (i de valgte klassene) som gjorde en feil ved hver meter – av alle typer, eller den som er valgt i statistikken. Hver runde teller én gang per meter; hver forekomsts område (der årsaken eller hendelsen var) utvides med 6 m på hver side, så en kort en også vises. Bredere og lysere der flere runder gjorde det: bredde `3 + 10 · (runder her / flest runder noe sted)` meter, farge fra mørk brun til lys oransje; en grå 2 m stripe der ingen gjorde det. Forklaring: *få runder ↔ flest runder*.

Med **Etiketter** på får hvert svings toppunkt sin vanligste feil: «T3 · 12/40 tidlig bremsing» (runder som gjorde den / runder som kjørte svingen), «T3 · 12/40» med én type valgt, «T3 · rent» uten noen. Når du holder musa over en etikett, listes svingets tap og dets fem vanligste feil; et klikk på den åpner eller lukker svingen i statistikken.

## Vis i varmekartet {#show-in-the-heatmap}

**Vis i varmekartet** gir det samme til varmekartfanen som et datasett kalt «Feil på <bane>» (eller «Feil på banen»), slik at hele verktøysettet i varmekartet – varmemodi, filtre, tidslinjen, snitt – virker på hvor rundene går galt.

Det er en CSV bygget i minnet (`mistakeTable`), én rad per rutepunkt (hvert 2 m) for hver forekomst, på **rundens egen posisjon** der:

| Kolonne | Innhold |
|---|---|
| `x`, `y`, `z` | rundens posisjon ved den meteren (spillets koordinater) |
| `elapsed` | rundens tid der, s |
| `lap` | rundens etikett |
| `car` | bilens navn (eller «car 1234») |
| `mistake` | feilens navn, på det gjeldende språket |
| `car_class` | klassen, `-` når den mangler |
| `corner` | svingets etikett, `T3` |
| `cost` | forekomstens kostnad, s |

Den lastes gjennom varmekartets egen innlasting med kartleggingstips: Y opp, ingen akseomvending, skala 1; tid `elapsed` i sekunder; **person** = `car`, **gruppe** = `mistake`, **økt** = `lap`; ingen blikkretning; `car_class`, `corner` og `cost` beholdes som filterkolonner. Fanen går så over til **Varme** og rammer inn dataene. Bare klassene som er valgt i statistikken eksporteres.

## Baner fra flere spor {#courses-from-several-tracks}

Runder analyseres **én bane om gangen**. En mappe med runder fra flere baner – hele rundebiblioteket – tilbyr hver bane å laste for seg (med antall runder, flest først); runder fra kjøringer som aldri ble fullført (FH Companions `unfinished/`) følger sin bane, merket *delvis*. Runder fra flere navngitte baner valgt som filer tilbys på samme måte; runder som ikke nevner en bane følger den som er valgt. Å laste runder fra en annen navngitt bane enn de som er lastet, erstatter dem. Detaljer: [Laste inn runder](race-loading-laps.md#folders-and-courses).

## Ytelse med mange runder {#performance-with-many-laps}

Dusinvis av runder analyseres på ett til to sekunder (alle, alltid). Det som tegnes, er begrenset slik at visningen holder bildefrekvensen:

| Grense | Verdi | Effekt |
|---|---|---|
| runder tegnet som standard | 8 (`SHOW_ALL_UP_TO`) | etter 8 innlastede runder skjules nylig lagte runder med mindre de er referansen, den fokuserte runden eller den beste i sin klasse. **Vis alle** tegner hver runde; **Bare de du ser på** går tilbake. Å fokusere en runde viser den igjen, og klassens beste |
| vanlige biler og tynne linjer | over 10 synlige (`PLAIN_PAST`) | runder annet enn fokuset, den forfulgte bilen og referansen: et linjepunkt hver 6 m (i stedet for 1,5 m), biler tegnet vanlig |
| runder i diagrammet | 8 (`CHART_LAPS`) | fokuset, dets klasses beste og referansen først; «+N til tegnet, ikke i diagrammet» |
| HUD-kort | 6 | de seks første synlige rundene |
| statistikk | fra 3 runder | delen er skjult under det |
| funn som listes | 12 fører, 8 bil/sammenheng, 10 gevinster | per fokusert runde |
| biler-par vist | 3 | etter 3 par, ett par med en velger |

Feilforekomster regnes ut én gang per analyse og lagres i buffer; tettheten på feilkartet lagres i buffer per klassevalg og feil.

## For utviklere {#for-developers}

Kode: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` i [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).

---
title: "Løpsanalyse"
nav_order: 14
has_children: true
lang: "no"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Løpsanalyse

Du kjørte samme bane to ganger. Fanen **Løpsanalyse** spiller begge kjøringene sammen i 3D, viser hvor den ene runden var tregere, og forteller deg hvorfor. Ingen runder ennå? Trykk **Demorunder**.

![Fanen Løpsanalyse med demorunder: sidepanelet med Runder og Hvor du kan forbedre deg, bilene på banen, diagrammene under visningen](../assets/img/en/race-analysis-overview.webp)

Fanen sammenligner to eller flere runder på samme bane. Den deler lerretet, kameraet og banemodellen (**Bakgrunn / nivå**) med varmekartet; alt annet er sitt eget: sitt eget sidepanel og sin egen linje under visningen. Ord som *runde*, *referanse* og *apex* forklares i [ordlisten](glossary.md).

Denne siden er kartet over fanen. Hver del har sin egen side:

| Side | Hva den dekker |
|---|---|
| [Laste inn runder](race-loading-laps.md) | alle filformater, mapper og baner, bilnavn, demorunder, rundelisten, referanse og fokus |
| [Replay og 3D-scenen](race-replay-and-scene.md) | transportlinjen, de tre replaymodusene, å plassere bilene på linje, jaktkameraet, linjer, kart, biler, etiketter, speilvendte verdener |
| [Diagrammer og HUD](race-charts-and-hud.md) | avstandsdiagrammene, diagramvelgeren, peking og zoom, bilkortene, kanaltabellen |
| [Hendelser for bilkontroll](race-control-events.md) | blokkeringer, hjulspinn, understyring, overstyring, spinn, undersyring, treff, krasj, ABS/TC, håndbrems, luft – hvordan hver oppdages, med alle terskler |
| [Analyse sving for sving](race-corner-analysis.md) | justering etter avstand, svinger og segmenter, tidsregnskapet for en sving, hver årsak og rekkefølgen de prøves i, linjeformen og rådet |
| [Bilprofiler og sammenligning](race-car-profiles.md) | hva hver bil kan gjøre, målt fra rundene; *Biler sammenlignet*; hva bilen avgjør i hver sving |
| [Banestatistikk](race-course-statistics.md) | mange runder på samme bane: feil per sving og per type, feilkartet, eksport av varmekartet, ytelsesgrenser |
| [Løpsanalyse: metoden](race-analytics.md) | forskningen bak reglene, med kilder |
| [Andre racingspill](other-games.md) | hva visningen gjør med runder fra hvert spill: glidning og driv beregnet der et spill ikke sender dem, speilvendte verdener, de ekstra kanalene |

## Skjermen {#the-screen}

**Sidepanelet**, fra topp til bunn (seksjoner kan foldes sammen):

1. **Runder** – last inn, liste, vis/skjul, referanse, fokus, jakt.
   Se [Laste inn runder](race-loading-laps.md).
2. **Banestatistikk** – bare fra tre innlastede runder.
   Se [Banestatistikk](race-course-statistics.md).
3. **Hvor du kan forbedre deg** – den fokuserte rundens funn, sving for sving.
   Se [Analyse sving for sving](race-corner-analysis.md).
4. **Sving for sving** (eller *Sving for sving – klasse X* med flere klasser) – den raskeste runden gjennom hver sving og linjen den. Vises med to eller flere runder.
5. **Bilkontroll** – den fokuserte rundens låsinger, glidninger, understyring og treff.
   Se [Hendelser for bilkontroll](race-control-events.md).
6. **Biler sammenlignet** (eller **Bilen** med én bil) – se [Bilprofiler og sammenligning](race-car-profiles.md).
7. **Visning** – hvilket kart som males på banen, og hva som tegnes.
   Se [Replay og 3D-scenen](race-replay-and-scene.md).
8. De delte panelene **Nivå** og **Kamera og scene** (banemodellen, inverterte akser, kamera) – dokumentert sammen med varmekartet og [Kamera](camera.md).

**Visningen** viser banen, de kjørte linjene, kartet, bilene, etiketter festet til banen, og opptil seks bilkort øverst til venstre (se [Diagrammer og HUD](race-charts-and-hud.md)). Uten lastede runder står det «Ingen runder lastet – slipp to eller flere rundefiler her, eller last inn demorundene fra sidepanelet.»

**Linjen under visningen** holder transportknappene for replayet og, med mindre de er skjult, avstandsdiagrammene.

## Hurtigstart {#quick-start}

1. Åpne fanen **Løpsanalyse** (ved siden av **Varmekart** øverst i sidepanelet).
2. Få inn runder. Trykk **Demorunder** for å se hva fanen gjør med tre oppdiktede runder. For dine egne runder tar du dem opp først ([filformater og opptakere](race-loading-laps.md#file-formats)), og trykker deretter **Last inn rundefiler…** eller **Mappe…**, eller slipper filer eller mapper på visningen.
3. Den raskeste fullførte runden blir referansen; den tregeste av de andre rundene blir fokusert. Klikk på en runde i listen for å fokusere den; ★ gjør en runde til referanse.
4. Les **Hvor du kan forbedre deg**. Klikk på et funn: bilene plasseres på linje 40 m før det, kameraet rammer det, replayet spiller gjennom det, og målingene åpnes.
5. Hold musepekeren over diagrammene for å flytte hver bil til den meteren; Shift+klikk for å plassere dem på linje der.

## Tastatur {#keyboard}

Mens fanen Løpsanalyse er åpen:

| Tast | Gjør |
|---|---|
| **K** | spill av / pause replayet |
| **Home** | tilbake til starten av replayet |
| sifferknappene | ingenting (i varmekartet bytter de modus) |

Taster som skrives i et tekstfelt eller en rullegardin ignoreres. Kameratastene virker som i varmekartet (**W A S D**, **Mellomrom** opp, **Q** ned, **Shift** raskere, **Alt** saktere, musen for å se; alt i [Kamera](camera.md)); **F** rammer de innlastede rundene (som innlasting av runder gjør).

## Mange runder {#many-laps}

- Alle innlastede runder analyseres og telles; dusinvis tar et sekund eller to.
- Utover **8** runder (`SHOW_ALL_UP_TO`) tegnes runder som legges til bare når de er referansen, den fokuserte runden, eller den beste runden i den fokuserte rundens klasse. *Vis alle* / *Bare de som er sett på* bytter.
- Utover **10** synlige biler (`PLAIN_PAST`) tegnes runder som ikke er sett på (ikke fokus, den jagede bilen eller referansen) med linjer tynnet til ett punkt hver 6 m i stedet for 1,5 m, og med enkle biler.
- Diagrammene tegner høyst **8** runder; HUD-et viser høyst **6** kort.
- Banestatistikken vises fra **3** runder.

Detaljer: [Banestatistikk](race-course-statistics.md#performance-with-many-laps).

## Standardinnstillinger for visningen {#default-view-settings}

| Innstilling | Standard |
|---|---|
| Kart | Tidskart |
| Kjørte linjer, Biler, Dekk og fjæring, Etiketter, Bane fra rundene | på |
| Alle verdier på kortene | av |
| Bilstørrelse | 1× |
| Diagrammer | vist |
| Replaymodus | Fra linjen |
| Replayhastighet | 1× |
| Løkke | på |

Ingen av disse lagres; en ny innlasting starter fra standardverdiene. Det som huskes i nettleseren: språket, og bilnavnene lært fra rundefiler (se [Laste inn runder](race-loading-laps.md#car-names)).

## For utviklere {#for-developers}

### Hva som skjer når runder lastes inn {#what-happens-when-laps-are-loaded}

Hver gang settet av runder, referansen eller språket endres, gjøres hele analysen om (`analyse` i [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Avledede kanaler legges til hver runde der spillet ikke sender dem: driftvinkel, hjulglidning fra hjulhastigheter, i luften, løst underlag, giringshastighet ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Referansen velges, og hver runde projiseres på banen sin og resamples hver 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Om spillets verden er speilvendt, finnes ut fra rundene ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Svinger finnes på referansen, og grupperes i segmenter fra én bremsesone til den neste ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Per bil: dens omhylling (grep, bremsing, trekk per fart), profil og dekkkurver ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Per runde og segment: hva den gjorde (bremsepunkt, tregeste punkt, full gass ...) og linjen den kjørte ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Per runde: dens hendelser for bilkontroll, hver lagt mot runden den sammenlignes med der.
8. Per runde og segment: tidsregnskapet mot sammenligningsrunden og funnet i ord.
9. Tidskartet og årsakskartet per runde.

Tekstene lages på gjeldende språk; å bytte språk kjører analysen på nytt (og gir demorundene nye navn). En feil i analysen vises under knappene **Runder** som en feilmelding, og rundene forblir lastet.

### Kildefiler {#source-files}

| Fil | Rolle |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | lesing av rundefiler |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | rundetypen, navngivning, demorunder |
| `src/race/derive.ts`, `handedness.ts` | avledede kanaler, speilvendte verdener |
| `src/race/align.ts`, `segments.ts`, `line.ts` | avstandsakse, svinger, linjer |
| `src/race/analysis.ts` | sammenlignede svinger, årsaker, funn |
| `src/race/envelope.ts`, `profile.ts` | hva en bil kan gjøre |
| `src/race/control.ts`, `impacts.ts` | bilkontroll, treff og krasj |
| `src/race/stats.ts` | mange runder |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | replay og tegning |
| `src/race/schema.ts`, `graphs.ts` | kanaltabellen, diagrammenes rader |
| `src/ui/race/*` | sidepanelet, diagrammene, HUD-et, etikettene |
| `src/state/raceStore.ts` | fanens tilstand og replayklokken |

---
title: "Banestatistik"
parent: "Løbsanalyse"
nav_order: 57
lang: "da"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Banestatistik

Indlæs mange omgange af én bane, og vieweren tæller fejlene: hvilket sving koster mest tid, hvor mange af omgangene der gik galt dér, og hvorfor. Brug den til at finde det sving, der er værd at øve.

Prøv det: **Demo-omgange** giver tre omgange, nok til at dette afsnit vises.

![Banestatistik med fejlkortet: banen malet efter, hvor mange omgange der tabte tid i hvert sving, og listen over sving](../assets/img/en/race-course-mistake-map.webp)

Indlæs en bane's hele mappe - snesevis af omgange, flere biler, flere ydelsesklasser - og hver omgang bedømmes og tælles derefter. Denne side dækker sammenligningen efter klasse, hvad der tæller som en fejl, afsnittet **Banestatistik**, fejlkortet, eksporten til heatmappet, baner fra flere spor og ydelsesgrænserne ved mange omgange.

## Mod det bedste i sin egen klasse {#against-the-best-of-its-own-class}

En omgang sammenlignes sving for sving med den **hurtigste fulde omgang i sin egen ydelsesklasse** (referencen, i referencens klasse); den omgang selv med den af klassen, der var hurtigst gennem hvert sving, eller med alle omgange, når den er alene i sin klasse. Biler grupperes efter spillets ydelsesklasse (i Forza, D op til X; C og S2 er to af dem). En C-klasse-bils bremsepunkt mod en S2-bils siger intet om kørslen. Tidskortet, hullerne i omgangslisten og tabellen *Sving for sving* følger den samme sammenligning (se [hvem hver omgang sammenlignes med](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statistikken bygges på analysen af hver omgang, ikke ved siden af den.

## Hvad der tæller som en fejl {#what-counts-as-a-mistake}

En **forekomst** er én omgangs fejl i ét sving (segment). En omgangs fejl i et sving er:

1. **Den kørselsårsag**, analysen fandt for tabet dér - et fund, der er et tab, og som
   føres på føreren (ikke bilen eller situationen), og som koster **0,05 s** eller mere i
   forhold til dens sammenligningsomgang. Dens omkostning er svingets tab.
2. **Hver bilkontrol-fejl**, den lavede dér, og som den anden omgang ikke lavede
   (ikke delt), og som koster **0,03 s** eller mere - blokering, hjulspin, bagenden der
   glider ud, skub, snurren. Dens omkostning er hændelsens egen.
3. **Hvert træf og hvert styrt**, delt eller ej, uanset hvad det kostede.

Et sving kan rumme flere; hver type tælles **én gang pr. omgang og sving**. Gevinster, bilens
andel og en langsommere ankomst bestemt i det foregående sving er ikke fejl.

### Fra fund til fejl {#from-findings-to-mistakes}

| Fund | Fejl |
|---|---|
| for hurtig ind, langsom ud, fra at bremse mere end nogle få meter senere end den anden | Bremsede for sent |
| bremsede tidligt | Bremsede for tidligt |
| bremsede blidt | Bremsede for blidt |
| en blokering som årsag | Blokerede et hjul |
| rullede ud | Rullede ud |
| grip til gode, langsommere til toppunktet, bremsede hvor den anden kun løftede | For langsom gennem midten |
| for snæver linje | For snæver linje |
| skubbet ud | Skubbet ud |
| drejede bilen for lidt / for meget | Drejede bilen forkert |
| på speedet senere, fuld gas senere, tøvede | Sent på speedet |
| langsommere ud af svinget | Langsommere ud |
| hjulspin | Hjulspin |
| bagenden gled ud, sidelæns gennem midten | Bagenden gled ud |
| kørte for langt ud | Kørte for langt ud |
| slæbte fart | Slæbte fart |
| løftede (på vej ind, eller på lige strækningen) | Løftede |
| næsten stoppet, snurren, træf eller styrt som årsag | Snurrede / Ramte noget / Væltede, når omgangens hændelser dér siger det (styrt først, så snurren, så træf); ellers Næsten stoppet |
| en længere flyvetur | Fløj for langt |

De to mønstre tælles som den årsag, der findes i dem, efter samme tabel. *Gav mere fra sig på vej
ind, end udgangen fik tilbage* er fejlen i dens indgangsårsag: tidlig bremsning er *Bremsede for
tidligt*, en blokering *Blokerede et hjul*, rulning *Rullede ud*, ubrugt grip *For langsom gennem
midten*. *For hurtig ind, langsom ud* er *Bremsede for sent*, når omgangen bremsede senere end den
anden; ellers fejlen i dens udgangsårsag - *Sent på speedet*, *Hjulspin*, *Bagenden gled ud*, *Kørte
for langt ud*, *Langsommere ud*. Et mønster, hvis årsag er bilens, eller en langsommere ankomst, tælles
ikke.

Tæller ikke med: langsommere ankomst, startet, hvert *bil*-fund (træk, grip, bremser, kørsel) og
hver gevinst eller plant sving.

### Typerne, i deres rækkefølge {#the-kinds-in-their-order}

Bremsning: *Bremsede for sent*, *Bremsede for tidligt*, *Bremsede for blidt*, *Blokerede et
hjul*. Indgang: *Rullede ud*, *For langsom gennem midten*, *For snæver linje*, *Skubbet ud*,
*Drejede bilen forkert*. Udgang: *Sent på speedet*, *Langsommere ud*, *Hjulspin*, *Bagenden gled
ud*, *Kørte for langt ud*, *Slæbte fart*. Lige strækning: *Løftede*. Hændelser: *Snurrede*, *Ramte
noget*, *Væltede*, *Næsten stoppet*, *Fløj for langt*.

## Afsnittet Banestatistik {#the-course-statistics-section}

Vises fra **3** omgange og op, mellem **Omgange** og **Hvor du kan forbedre dig**.

- **Resuméet**: "40 omgange i 9 biler, 3 klasser: hver bedømt sving for sving mod den hurtigste
  omgang i sin egen klasse." (biler tælles efter startnummer eller navn).
- **Klassemærker** (med flere klasser): **Alle** og ét mærke pr. klasse, hver med sit antal
  omgange, i spillets rækkefølge (D, C, B, A, S1, S2, R, X, derefter andre). Klik på en klasse for
  kun dens omgange; **Shift+klik** tilføjer eller fjerner én. Alt nedenfor - listerne, kortet,
  heatmap-eksporten - følger de valgte klasser.
- **Hvad der oftest går galt**: hver type fejl, flest omgange først (så flest gange, så størst
  omkostning), højst 8 (**Alle N typer** viser resten, **Færre** skjuler dem igen). Hver række: navnet,
  "N af M omgange", en bjælke for den andel, og "K gange · ca. X s · flest i T3 (5), T7 (4), T1 (2)" -
  hvor ofte den blev lavet (omgang for sving), hvad den kostede i alt, og de tre sving, hvor flest
  omgange lavede den. **Klik på en række** for at vise den på fejlkortet (og tænde kortet); klik igen
  for alle fejl.
- **Sving for sving** (eller *Sving for sving - <fejl>* med én valgt): pr. segment, "N af M tabte tid · X s" -
  omgange, der kørte hele svinget, dem der tabte **0,05 s** eller mere dér mod deres klasses bedste, og al
  den tid, de tabte. Når den er foldet sammen, lister den sine tre hyppigste fejl med deres antal omgange.
  **Klik på et sving** for at åbne det, indramme det med kameraet og skifte til fejlkortet: for hver fejl (eller
  kun den valgte) en linje som "12 af 40 omgange bremsede for tidligt her. I 9 forskellige biler - ca.
  0,21 s hver." og de omgange, der lavede den, **værste først**, hver med sin omkostning - højst 8, "+N
  flere" for resten. **Klik på en omgang** for at fokusere den og afspille den fejl (rettet op 40 m før den).
- **Vis i heatmappet**: se nedenfor. "Bygger heatmappet…" mens det kører; slået fra når der ingen fejl er.

## Fejlkortet {#the-mistake-map}

**Vis → Fejlkort** maler langs referencestien, hvor mange af omgangene (i de valgte klasser) der lavede
en fejl ved hver meter - af hver type, eller den, der er valgt i statistikken. Hver omgang tæller én gang pr.
meter; hver forekomsts spænd (hvor dens årsag eller hændelse var) gøres 6 m bredere til hver side, så en kort
en også vises. Bredere og klarere, hvor flere omgange gjorde det: bredde
`3 + 10 · (omgange her / flest omgange hvor som helst)` meter, farve fra mat brun til klar orange; en grå
2 m stribe, hvor ingen gjorde det. Forklaring: *få omgange ↔ flest omgange*.

Med **Etiketter** tændt bærer hvert sving's toppunkt sin hyppigste fejl: "T3 · 12/40 tidlig bremsning" (omgange
der lavede den / omgange der kørte svinget), "T3 · 12/40" med én type valgt, "T3 · ren" med ingen. Når du
holder musen over en etiket, lister den svingets tab og dets fem hyppigste fejl; et klik på den åbner eller
lukker svinget i statistikken.

## Vis i heatmappet {#show-in-the-heatmap}

**Vis i heatmappet** giver det samme til heatmap-fanen som et datasæt med navnet "Fejl på <bane>" (eller "Fejl på
banen"), så hele heatmappets værktøjskasse - varmetilstande, filtre, tidslinjen, udskæring - virker på, hvor
omgangene går galt.

Det er en CSV bygget i hukommelsen (`mistakeTable`), én række pr. gitterpunkt (hver 2 m) for hver forekomst, ved
**omgangens egen position** dér:

| Kolonne | Indhold |
|---|---|
| `x`, `y`, `z` | omgangens position ved den meter (spilkoordinater) |
| `elapsed` | omgangens tid dér, s |
| `lap` | omgangens etiket |
| `car` | bilens navn (eller "bil 1234") |
| `mistake` | fejlens navn, på det aktuelle sprog |
| `car_class` | klassen, `-` når der ingen er |
| `corner` | svingets etiket, `T3` |
| `cost` | forekomstens omkostning, s |

Den indlæses gennem heatmappets egen indlæser med kortlægningstips: Y op, ingen aksevending, skala 1; tid `elapsed`
i sekunder; **person** = `car`, **gruppe** = `mistake`, **session** = `lap`; ingen kigge-retning; `car_class`,
`corner` og `cost` beholdes som filterkolonner. Fanen skifter så til **Heatmap** og indrammer dataene. Kun de
klasser, der er valgt i statistikken, eksporteres.

## Baner fra flere spor {#courses-from-several-tracks}

Omgange analyseres **én bane ad gangen**. En mappe med omgange fra flere baner - hele omgangsbiblioteket - tilbyder
hver bane at indlæse for sig (med dens antal omgange, flest først); omgange fra kørsler, der aldrig blev afsluttet
(FH Companions `unfinished/`), hører til deres bane og er markeret *delvis*. Omgange fra flere navngivne spor valgt
som filer tilbydes på samme måde, og omgange uden navn på spor hører til den, der er valgt. At indlæse omgange fra et
andet navngivet spor end de indlæste erstatter dem. Detaljer: [Indlæs omgange](race-loading-laps.md#folders-and-courses).

## Ydeevne med mange omgange {#performance-with-many-laps}

Snesevis af omgange analyseres på et sekund eller to (alle af dem, altid). Det, der tegnes, er begrænset, så
visningen holder billedfrekvensen:

| Grænse | Værdi | Virkning |
|---|---|---|
| omgange tegnet som standard | 8 (`SHOW_ALL_UP_TO`) | ud over 8 indlæste omgange skjules nye omgange, medmindre de er referencen, den fokuserede omgang eller den bedste i sin klasse. **Vis alle** tegner hver omgang; **Kun dem, du kigger på** går tilbage. Fokus på en omgang viser den igen og dens klasses bedste |
| almindelige biler og tynde linjer | over 10 synlige (`PLAIN_PAST`) | omgange ud over fokus, den forfulgte bil og referencen: et linjepunkt hver 6 m (i stedet for 1,5 m), biler tegnet almindeligt |
| omgange i diagrammet | 8 (`CHART_LAPS`) | fokus, dens klasses bedste og referencen først; "+N flere tegnet, ikke i diagrammet" |
| HUD-kort | 6 | de første seks synlige omgange |
| statistik | fra 3 omgange | afsnittet skjules under det |
| fund listet | 12 fører, 8 bil/kontekst, 10 gevinster | pr. fokuseret omgang |
| bilpar vist | 3 | ud over 3 par, ét par med en vælger |

Fejlforekomster regnes ud én gang pr. analyse og gemmes i cachen; fejlkortets tæthed gemmes i cachen pr. klassevalg
og fejl.

## Til udviklere {#for-developers}

Kode: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` i [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).

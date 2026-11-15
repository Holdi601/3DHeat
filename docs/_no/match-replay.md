---
title: "Kampreplay"
parent: "Repriser"
nav_order: 1
has_children: true
lang: "no"
source: "match-replay.md"
source_hash: "14a8aade5ff0"
translated: true
outdated: true
---

# Kampreplay

Replayet er en film av kampen der hver spiller tegnes som det de kjørte. Bruk det til å se en kamp på nytt, følge én enhet og se hvem som traff hvem.

Skudd, treff, branner og vrak tegnes på enhetene og målene i banen. Kameraer, etiketter og en taktisk visning hjelper deg å lese kampen. Kjenner du Tacview? [Tacview-paritet](tacview-parity.md) viser hvor hvert av verktøyene finnes.

![Figurreplay av stridsvognsdemoen: stridsvogner som egne figurer, med etiketter for navn, kjøretøy og fart](../assets/img/no/replay-overview.webp)

## Start et replay {#start-a-replay}

1. Last inn et opptak med **Kilde → Filer…** eller ved å slippe det på panelet Kilde (en hvilken som helst tabell med en **person**- og en **tid**-kolonne, en Tacview-fil, et konvertert replay, en [`.3dheat`](container.md)-kamp). Se [Få inn data](getting-data-in.md).
2. Åpne fanen **Kamp** og velg **Figurreplay**, eller velg **Figuroverlegg** i modusraden i fanen Varmekart.
3. Under **Kamper i reprisen** velger du én kamp, alle på én gang, eller flere.
4. Trykk **Spill av** på tidslinjen (eller `K`). Dra tidslinjen for å hoppe.

Figurer erstatter bokser for hver enhet hvis navn eller type er kjent (se [Figurer](figures.md)). Data uten navne- eller typekolonne tegnes som soldater.

![Fanen Kamp: kampvelgeren, seksjonen Figurer, kameravisningene, Spill av og hendelseslisten](../assets/img/no/match-replay-tab.webp)

## Figurer {#figures}

![En brennende stridsvogn i banekameraet, med skuddet som traff den](../assets/img/no/replay-tanks.webp)

| Innstilling (seksjonen **Figurer**) | Standard | Hva den gjør |
|---|---|---|
| **Figurer i stedet for bokser** | på | Av tegner vanlige bokser. |
| **Figurstørrelse** (ganger ekte størrelse) | 1 | 1 er ekte størrelse; 0,25 til 20 ganger (logaritmisk skala). Større hjelper på avstand. |
| **Minste figur på skjermen** | 36 px | Fjerne figurer vokser for å være så lange, 0 til 200 px; 0 beholder ekte størrelse. |
| **På avstand**: Figur, Pil, Symbol | Figur | Hva en fjern enhet blir. |
| **Symboler** | NATO (APP-6) | NATO (APP-6), russiske taktiske tegn, ikoner for **Spillkart**, eller **Bare former (fargeblind-trygg)**. |
| **Symbolstørrelse**, **Min side**, **Fiendtlig / Nøytral**, **Kursstreker** | 28 px (12 til 64), automatisk, fiendtlig, på | Hvordan symbolene ser ut, og hvilken side som er vennlig. |
| **Loddlinjer** | på | En linje fra hver enhet rett ned til bakken, slik at høyder leses i 3D. |
| **Loddlinjer og etiketter på våpen** | av | Linjer til bakken og etiketter på missiler og bomber. |
| **Branner på enheter** | på | Flammer fra det øyeblikket en enhet tar fyr til den slokkes. |
| **Treff på enheter** | på | Merker der skuddene traff (under). **Treff blir stående**: 1 til 300 sekunder, eller **Hele livet**. **Svevende merker**: merker tegnet over overflaten. |
| **Sikte- og tårnlinjer** | av | Stiplet: der spilleren ser; heltrukket: der kanonen peker. |
| **Bygninger** | solide | Solide eller gjennomsiktige bygninger, når nivået maler dem. |

### Symboler på avstand {#symbols-at-a-distance}

Når en enhet ville vært mindre enn **Minste figur på skjermen**, kan den bli et symbol som forblir lesbart. Formen forteller typen (for eksempel en avrundet boks med et beltemerke for pansrede kjøretøy); fargen forteller siden. Åpne menyen **Symboler** for å endre stilen.

![De samme seks enhetene som NATO-symboler, russiske taktiske tegn, ikoner for spillkart og bare former](../assets/img/no/match-replay-symbols-styles.webp)

### Treffmerker, vrak og branner {#hit-marks-wrecks-and-fires}

- **Treffmerker** ligger på flaten skuddet traff, i figurens skala. Utseendet forteller hva som skjedde: et hull (gikk gjennom), et lyst sprut (gikk ikke gjennom), et rift (gled av), en sotstjerne (eksplosiv runde). En farget ring sier hva det gjorde: dødelig skudd, modul ødelagt, kritisk, alvorlig, skade, ingen skade, treff. Hold musepekeren over et merke for rundens navn.
- En ødelagt enhet tegnes **forkullet** som et vrak fra døden til den gjenoppstår eller fjernes; symbolet er streket over.
- **Branner** brenner på en enhet fra det øyeblikket den tar fyr til den slokkes.
- **Tårn** dreier seg dit dataene sier at kanonen peker (eller, uten det, dit spilleren ser).

### Våpen, lokkemidler og sporlys {#weapons-decoys-and-tracers}

Med **Våpen, skudd og treff** på (seksjonen Lagvisning): missiler, raketter, bomber og torpedoer flyr som egne figurer med en røykstripe; kuler og granater er sporlys; nedslag og eksplosjoner blinker. En sporlys tegnet **stiplet** ble regnet ut fra et treff, fordi dataene ikke hadde skuddet. Blusser og luftfoliestrimler tegnes som lokkemidler; de skjules i enhetslisten med mindre *Lokkemidler og granater* er krysset av.

## Kameraer {#cameras}

Klikk på en enhet eller etiketten for å **følge** den; seksjonen **Reprise** tilbyr **Jakt**, **Bane**, **Cockpit** (med head-up-display, `H`), **Fast**, **Padlock**, **Mål** og **Satellitt**. `V` går gjennom dem, og **Kameraavstand** setter hvor langt unna. Esc stopper.

- **Visning med to enheter**: velg et **Mål** (eller Ctrl/Alt-klikk på en enhet) for å se på den fra den som følges; **Bytt** bytter dem.
- **Mål**: Shift-klikk på to enheter for peiling, avstand og høydeforskjell mellom dem.
- **2D-kart** (`M`): hjørne eller hele visningen, med haler og navn.
- **Bokmerker** (`B`): lagre øyeblikket og kameraet; opptakets egne drap, dødsfall og merker listes også.
- **Hendelser**: hver hendelse i tidsrekkefølge; et klikk hopper dit. `Page Up` / `Page Down` hopper mellom hendelser; **Pause ved hendelse** stopper ved hver.

## Taktisk visning {#tactical-display}

![Luftdemoen med utseendet for taktisk visning (T): trådmodell-terreng, drap- og hendelsespaneler](../assets/img/no/replay-air-tactical.webp)

Seksjonen **Taktisk visning** tegner, for ingen enhet, de valgte, alle, eller én type (fly, bakke, skip, våpen): hastighetsvektorer og banen forover, nese- og løftelinjer, radarkjegler, låsinger, datalenker, engasjementssoner og -linjer, siktelinjer, der spillere ser (synskjegler), tårnsikte og det innspilte kameraet.

### Visningsstil {#display-style}

`T` (eller bryteren **Vis som taktisk visning**) bytter utseendet til en radarskjermstil: glød, konturer, høydekurver, et målenett, skannelinjer, avstandsringer, høydestiger, paneler med drap og hendelser, og en **Regissør** som flytter kameraet til hendelser av seg selv.

![Det samme luftslaget i det vanlige utseendet](../assets/img/no/replay-air.webp)

## Mål {#objectives}

Når en kamp følger med sine mål, tegner seksjonen **Mål** dem på nivået: erobringssoner (med eier og erobringsfremdrift), spawnpunkter, flyplasser, områder og bombemål, hvert lag kan slås av og på, med etiketter. De sees gjennom bakken. Med flere spillmodi lastet inn filtrerer **Modus** kampene etter modus. Målene kommer fra en konverters kampfil ved siden av opptaket, eller inni en [`.3dheat`](container.md)-beholder.

## Etiketter og statistikk {#labels-and-statistics}

- **Etiketter**: regler per type (**Valgte**, **Fly**, **Bakke**, **Skip**, **Våpen**, **KI**): vist eller ikke, hvilke verdier, og en **Prioritet** for hvem som får plassen når etiketter overlapper. **Hold etikettene fra hverandre** flytter en etikett ved siden av enheten sin når den ville dekke en annen, og utelater den der det ikke er plass. **Etikettstørrelse** er 60 til 250 %. **Tilbake til navn, kjøretøy, høyde og fart** tilbakestiller reglene.
  - Bakkeenheter starter med navn, kjøretøy og fart.
  - Fly starter med navn, kjøretøy, høyde og fart.
  - Skip starter med navn, kjøretøy, fart og kurs.
  - Hold musepekeren over en enhet for å se alle verdiene den har.
- **Statistikk**: per lag og enhet: drap, dødsfall, skudd, treff, treffrate, avganger, landinger, tid i luften, toppfart, høyde og G, avstand. CSV-eksport.
- **Diagrammer**: en enhets verdier over tid, to enheter sammenlignet, eller én verdi mot en annen.

## Mange kamper samtidig {#many-matches-at-once}

For å legge hundrevis eller tusenvis av kamper over hverandre, se [Mange kamper samtidig](many-matches.md). Figurdetaljer (røyk, ild, andre tidsstyrte effekter): [Figurer i figuroverlegget](figure-replay.md). Liste over Tacview-funksjoner: [Tacview-paritet](tacview-parity.md), en underside av denne.

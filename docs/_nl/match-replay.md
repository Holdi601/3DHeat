---
title: "Wedstrijdreplay"
nav_order: 9
has_children: true
lang: "nl"
source: "match-replay.md"
source_hash: "9d61f24a5a04"
translated: true
outdated: false
---

# Wedstrijdreplay

De replay is een film van de wedstrijd waarin elke speler wordt getekend als het ding dat hij bestuurde. Gebruik hem om een gevecht opnieuw te bekijken, één eenheid te volgen en te zien wie wie raakte.

Schoten, treffers, branden en wrakken worden getekend op de eenheden en doelen op het niveau. Camera's, labels en een tactische weergave helpen je het gevecht te lezen. Ken je Tacview? [Tacview-gelijkwaardigheid](tacview-parity.md) laat zien waar elk van zijn hulpmiddelen zit.

![Figurenreplay van de tankdemo: tanks als hun eigen figuren, met labels voor naam, voertuig en snelheid](../assets/img/en/replay-overview.webp)

## Een replay starten {#start-a-replay}

1. Laad een opname met **Bron → Bestanden…** of door hem op het paneel Bron te zetten (elke tabel met een kolom **persoon** en een **tijd**kolom, een Tacview-bestand, een omgezette replay, een [`.3dheat`](container.md)-wedstrijd). Zie [Gegevens binnenhalen](getting-data-in.md).
2. Open het tabblad **Match** en kies **Figurenreplay**, of kies **Figurenoverlay** in de modusbalk van het tabblad Heatmap.
3. Kies onder **Matches in de replay** één wedstrijd, alle tegelijk, of meerdere.
4. Druk op **Afspelen** op de tijdlijn (of `K`). Sleep de tijdlijn om te springen.

Figuren vervangen blokken voor elke eenheid waarvan de naam of het type bekend is (zie [Figuren](figures.md)). Data zonder naam- of typekolom wordt als soldaten getekend.

![Het tabblad Match: de wedstrijdkiezer, het gedeelte Figuren, de cameraweergaven, Afspelen en de gebeurtenislijst](../assets/img/en/match-replay-tab.webp)

## Figuren {#figures}

![Een brandende tank in de omcirkelingscamera, met het schot dat hem raakte](../assets/img/en/replay-tanks.webp)

| Instelling (gedeelte **Figuren**) | Standaard | Wat het doet |
|---|---|---|
| **Figuren in plaats van blokken** | aan | Uit tekent gewone blokken. |
| **Figuurgrootte** (keer ware grootte) | 1 | 1 is ware grootte; 0,25 tot 20 keer (logschaal). Groter helpt van ver. |
| **Kleinste figuur op het scherm** | 36 px | Verre figuren groeien om deze lengte te blijven, 0 tot 200 px; 0 houdt de ware grootte aan. |
| **Op afstand**: Figuur, Pijl, Symbool | Figuur | Wat een verre eenheid wordt. |
| **Symbolen** | NAVO (APP-6) | NAVO (APP-6), Russische tactische tekens, pictogrammen van de **Spelkaart**, of **Alleen vormen (kleurenblind-veilig)**. |
| **Symboolgrootte**, **Mijn kant**, **Vijandig / Neutraal**, **Koersstreepjes** | 28 px (12 tot 64), automatisch, vijandig, aan | Hoe symbolen eruitzien en welke kant de vriendelijke is. |
| **Loodlijnen** | aan | Een lijn van elke eenheid recht omlaag naar de grond, zodat hoogtes in 3D leesbaar zijn. |
| **Loodlijnen en labels bij wapens** | uit | Lijnen naar de grond en labels bij missiles en bommen. |
| **Branden op eenheden** | aan | Vlammen vanaf het moment dat een eenheid vuur vat tot het gebluscht is. |
| **Treffers op eenheden** | aan | Markeringen waar schoten raakten (hieronder). **Treffers blijven**: 1 tot 300 seconden, of **Heel het leven**. **Zwevende markeringen**: markeringen die boven het oppervlak getekend worden. |
| **Kijk- en koepellijnen** | uit | Gestippeld: waar de speler kijkt; doorgetrokken: waar het kanon wijst. |
| **Gebouwen** | massief | Massieve of doorzichtige gebouwen, wanneer het niveau ze tekent. |

### Symbolen op afstand {#symbols-at-a-distance}

Wanneer een eenheid kleiner zou zijn dan **Kleinste figuur op het scherm**, kan ze een symbool worden dat leesbaar blijft. De vorm vertelt de soort (bijvoorbeeld een afgeronde doos met een rupsmerk voor pantservoertuigen); de kleur vertelt de kant. Open het menu **Symbolen** om de stijl te wijzigen.

![Dezelfde zes eenheden als NAVO-symbolen, Russische tactische tekens, pictogrammen van de spelkaart en alleen vormen](../assets/img/en/match-replay-symbols-styles.webp)

### Treffermarkeringen, wrakken en branden {#hit-marks-wrecks-and-fires}

- **Treffermarkeringen** zitten op het oppervlak waar het schot kwam, op de schaal van de figuur. Hun uiterlijk vertelt wat er gebeurde: een gat (door heen), een helderwitte spatting (niet door heen), een kerf (afgeketst), een roetster (explosieve granaat). Een gekleurde ring zegt wat het deed: dodelijk schot, module vernietigd, kritiek, zwaar, schade, geen schade, treffer. Wijs een markering aan voor de naam van de ronde.
- Een vernietigde eenheid wordt **verkoold** als wrak getekend vanaf haar dood tot ze herleeft of verwijderd wordt; haar symbool is doorgehaald.
- **Branden** branden op een eenheid vanaf het moment dat ze vuur vat tot het gebluscht is.
- **Torentjes** draaien naar waar de data zegt dat het kanon wijst (of, zonder die data, waar de speler kijkt).

### Wapens, lokmiddelen en tracers {#weapons-decoys-and-tracers}

Met **Wapens, schoten en treffers** aan (gedeelte Teamweergave): missiles, raketten, bommen en torpedo's vliegen als hun eigen figuren met een rookspoor; kogels en granaten zijn tracers; inslagen en explosies flitsen. Een tracer die **gestippeld** getekend wordt, is afgeleid uit een treffer, omdat de data geen schot had. Flares en chaff worden als lokmiddelen getekend; ze zijn uit de eenhedenlijst verborgen tenzij *Lokmiddelen en granaten* is aangevinkt.

## Camera's {#cameras}

Klik op een eenheid of haar label om die te **volgen**; het gedeelte **Replay** biedt **Achtervolgen**, **Omcirkelen**, **Cockpit** (met een head-up display, `H`), **Vast**, **Padlock**, **Doel** en **Satelliet**. `V` wisselt ertussen, **Cameraafstand** stelt de afstand in. Esc stopt.

- **Weergave van twee eenheden**: kies een **Doel** (of Ctrl/Alt-klik een eenheid) om die vanuit de gevolgde te bekijken; **Wisselen** ruilt ze om.
- **Meten**: Shift-klik twee eenheden voor de peiling, afstand en hoogteverschil tussen hen.
- **2D-kaart** (`M`): hoek- of volledige weergave, met sporen en namen.
- **Bladwijzers** (`B`): sla het moment en de camera op; de eigen kills, doden en markeringen van de opname staan er ook in.
- **Gebeurtenissen**: elke gebeurtenis in tijdsvolgorde; klikken springt er naartoe. `Page Up` / `Page Down` springen tussen gebeurtenissen; **Pauze bij gebeurtenis** stopt bij elke.

## Tactische weergave {#tactical-display}

![De luchtdemo met de tactische weergave (T): draadmodel-terrein, kill- en gebeurtenispanelen](../assets/img/en/replay-air-tactical.webp)

Het gedeelte **Tactische weergave** tekent, voor geen enkele eenheid, de geselecteerde, alle, of één soort (vliegtuigen, grond, schepen, wapens): snelheidsvectoren en het pad vooruit, neus- en liftlijnen, radarkegels, vergrendelingen, datalinks, betrokkenheidszones en -lijnen, zichtlijnen, waar spelers kijken (kijkkegels), kanonrichting en de opgenomen camera.

### Weergavestijl {#display-style}

`T` (of de schakelaar **Tonen als tactisch scherm**) zet de weergave om naar een radarscherm-stijl: gloed, contouren, hoogtelijnen, een meetraster, scanlijnen, afstandsringen, hoogteladders, panelen met kills en gebeurtenissen, en een **Regisseur** die de camera zelf naar gebeurtenissen verplaatst.

![Hetzelfde luchtgevecht in de gewone weergave](../assets/img/en/replay-air.webp)

## Doelen {#objectives}

Als een wedstrijd met zijn doelen meekomt, tekent het gedeelte **Doelen** ze op het niveau: veroveringszones (met eigenaar en voortgang van de verovering), spawns, vliegvelden, gebieden en bomdoelen, elke laag los aan of uit te zetten, met labels. Ze worden door de grond heen gezien. Met meerdere spelmodi geladen filtert **Modus** de wedstrijden op modus. Doelen komen uit het wedstrijdbestand van een converter naast de opname, of binnen een [`.3dheat`](container.md)-container.

## Labels en statistieken {#labels-and-statistics}

- **Labels**: regels per soort (**Geselecteerd**, **Vliegtuigen**, **Grond**, **Schepen**, **Wapens**, **AI**): getoond of niet, welke waarden, en een **Prioriteit** voor wie de ruimte krijgt wanneer labels overlappen. **Labels uit elkaar houden** zet een label naast zijn eenheid wanneer het een andere zou bedekken, en laat het weg waar geen ruimte is. **Labelgrootte** is 60 tot 250%. **Terug naar naam, voertuig, hoogte en snelheid** zet de regels terug.
  - Grondeenheden beginnen met naam, voertuig en snelheid.
  - Vliegtuigen beginnen met naam, voertuig, hoogte en snelheid.
  - Schepen beginnen met naam, voertuig, snelheid en koers.
  - Wijs een eenheid aan om elke waarde die ze heeft te zien.
- **Statistieken**: per team en eenheid: kills, doden, schoten, treffers, trefferverhouding, opstijgingen, landingen, tijd in de lucht, topsnelheid, hoogte en G, afstand. Export als CSV.
- **Grafieken**: de waarden van een eenheid over de tijd, twee eenheden vergeleken, of de ene waarde tegen de andere.

## Veel wedstrijden tegelijk {#many-matches-at-once}

Om honderden of duizenden wedstrijden over elkaar heen te leggen, zie [Veel wedstrijden tegelijk](many-matches.md). Details van figuren (rook, vuur, andere getimede effecten): [Figuren in de figurenoverlay](figure-replay.md). Lijst met Tacview-functies: [Tacview-gelijkwaardigheid](tacview-parity.md), een subpagina van deze.

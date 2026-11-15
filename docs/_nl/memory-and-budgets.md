---
title: "Geheugen en budgetten"
parent: "Gegevens binnenhalen"
nav_order: 6
lang: "nl"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Geheugen, budgetten en de passingscontrole

Je computer heeft beperkt geheugen. 3DHeat telt op wat je bestanden nodig hebben, en laat je vóór **Laden** zien of ze passen.

![De Geheugenschatting op past niet, met Elke [N]e rij laden al ingevuld en de Laden-knop met Te groot – verklein of dun uit](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Te groot voor deze computer? 3DHeat stelt voor om elke N-de rij te laden.*

Een browsertabblad dat halverwege het laden geheugen tekortkomt, crasht en verliest minuten werk. Een GPU die meer vraagt dan hij heeft, verliest zijn context of wordt heel traag. Daarom zegt het paneel Bron vóór het laden hoeveel geheugen er nodig is. Het vergelijkt dat met de budgetten die voor deze machine zijn gevonden, en weigert het laden, met een uitweg, als het niet past. Het model staat in [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## De geheugenschatting {#the-memory-estimate}

Staat boven de knop **Laden** zodra de rijen geteld zijn.

| Regel | Betekenis |
|---|---|
| **Geheugenschatting** - *past* / *krap* / *past niet* | Het oordeel, groen, oranje of rood. |
| `N rijen · B B/rij` | Rijen die geladen worden (na de stap) en de vaste bytes per rij. |
| `RAM X in gebruik, Y piek tijdens het laden` | Geheugen dat na het laden vastzit, en de hoogste waarde tijdens het laden. |
| `GPU Z · geschatte laadtijd T` | GPU-geheugen voor de rijen, en een geschatte duur bij 1,2 miljoen rijen per seconde. |
| GPU-naam | De naam van de renderer, als het stuurprogramma die meldt. |
| Berichten | Waarom het niet past of krap is, en wat je kunt doen. |
| **Elke [N]e rij laden** | De stap van het uitdunnen (zie hieronder). |
| `Budget: X RAM, Y GPU. Aan te passen onder Prestaties → Resourcebudgetten.` | De budgetten die de controle gebruikte. |

### Bytes per rij {#bytes-per-row}

| Kolom | Vast (RAM) | Opmerkingen |
|---|---|---|
| Positie | 12 | Drie 32-bits getallen met komma, altijd (een platte as is ook een reeks) |
| Tijd | 4 | Wanneer toegewezen |
| Levensduur | 4 | Wanneer tijd en persoon toegewezen zijn |
| Persoon | 4 | Wanneer toegewezen |
| Groep | 2 | Wanneer toegewezen |
| Sessie | 4 | Wanneer toegewezen |
| `Bronbestand` | 4 | Wanneer meer dan één bestand geladen is |
| Elke filterkolom | 4 | Per aangevinkte *Bewaren voor filteren*-kolom |

De **piek** telt op wat het laden alleen tijdelijk nodig heeft: 8 bytes voor 64-bits tijd tijdens het samenvoegen, 12 bytes voor sorteersleutels en indexen, 4 bytes voor tussengeheugen bij het ordenen (alle drie als tijd is toegewezen), en 4 bytes zolang de groepskolom nog 32-bits is. Die som wordt vermenigvuldigd met **2,0**. Die factor is gemeten: een echt laden van meerdere bestanden piekte op 1,9× de afzonderlijke arrays, door de werkset van de Parquet-decoder, de kopieën die elke kolom op lengte knippen, en geheugen dat vrijgegeven is maar nog niet teruggegeven. Hij is naar boven afgerond. Een te lage schatting kost een gecrasht tabblad, een te hoge kost alleen een onnodige stap.

Op de **GPU** kost elke rij 8 bytes (positie en groep, elk 16 bits), plus 4 bytes (tijd en levensduur, elk 16 bits) wanneer tijd en persoon allebei zijn toegewezen. Zie [GPU-geheugen](gpu-memory.md). Filtertexturen (4 bytes per rij voor elk actief filter) en de segmentstarts van lijnwarmte (8 bytes per rij zolang de modus Lijnen aan staat) horen niet bij deze schatting.

## De passingscontrole {#the-fit-check}

Drie grenzen worden vergeleken ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- piek-RAM tegen het **RAM-budget**,
- GPU-bytes tegen het **GPU-budget**,
- het aantal rijen tegen de **sorteergrens** van 400.000.000 rijen, wanneer een tijdkolom is toegewezen.

De slechtste van de drie verhoudingen beslist. Tot 70% is het *past*, tot 100% is het *krap* (het zou moeten laden, maar het wordt waarschijnlijk traag), daarboven *past niet*. Als het niet past, noemt het paneel de beperkende grens en stelt voor:

- elke *N*-de rij laden, met *N* = ⌈rijen / rijen die passen⌉, al ingevuld in het stapvak;
- filterkolommen weglaten, de tijdkolom van de toewijzing halen (dat haalt de sortering en de grens weg, ten koste van de tijdlijn), of het budget verhogen.

Als het budget zelf geen feit over de hardware is (de browser heeft het RAM-cijfer begrensd, de standaardwaarde is laag gehouden door wat er nu vrij is, of het GPU-cijfer is een gok), dan zegt het bericht dat ook. Zo grijp je niet naar een stap die je niet nodig hebt.

### Uitdunnen {#decimation}

**Elke [N]e rij laden** houdt per bestand één rij op *N*. Warmte is een gemiddelde, dus elke *N*-de rij geeft dezelfde verdeling met meer ruis. Dat is dezelfde afweging die de renderer al bij elk beeld maakt. Het vak begint op 1 (*rij (alle)*). Als de selectie niet past, staat de voorgestelde stap erin, tenzij je zelf in het vak hebt getypt. De knop Laden leest dan *Laad N bestanden (1 op K)*, en de naam van de dataset bevat `elke K-de rij`.

### De sorteergrens {#the-sort-ceiling}

De renderer heeft de rijen in oplopende tijdsvolgorde nodig. Een toegewezen tijdkolom betekent dus dat elke rij gesorteerd wordt, met een radixsortering over 32-bits sleutels ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Boven **400 miljoen** rijen wordt dat geweigerd in plaats van in een tabblad geprobeerd. Dit wordt vóór het laden gecontroleerd. Een selectie boven de grens wordt dus geweigerd met een voorstel voor een stap, in plaats van volledig gelezen te worden en pas op het laatste moment te mislukken. Vlak onder de grens (*krap*) waarschuwt het paneel dat het sorteren een lange doorgang is zonder eigen voortgang. Zonder tijdkolom wordt niets gesorteerd en geldt de grens niet.

## Resourcebudgetten {#resource-budgets}

**Prestaties → Resourcebudgetten** (een inklapbare regel onderaan het paneel Prestaties, met de tekst `Resource budgets - RAM, GPU, cores`). De budgetten worden gedetecteerd. De gedetecteerde waarde is de standaard. De schuiven gaan niet hoger dan een **plafond**. Dat is de gedetecteerde waarde, behalve waar bekend is dat de detectie geen meting is.

| Instelling | Bereik | Betekenis |
|---|---|---|
| **RAM voor rijdata** | 256 MiB tot het RAM-plafond, logaritmisch | Het RAM-budget voor de passingscontrole. Staat op *(boven gedetecteerd)* voorbij de gedetecteerde standaard, en op *(max)* bij het plafond. |
| **GPU voor rijdata** | 128 MiB tot het GPU-plafond, logaritmisch | Het GPU-budget voor de passingscontrole en voor het uploaden van rijen. Staat op *(boven gedetecteerd)* voorbij de gedetecteerde standaard, en op *(max)* bij het plafond. |
| **Parserthreads** | 1 tot het aantal logische kernen | Hoeveel bestanden een laadbeurt tegelijk verwerkt, elk in een eigen worker. Standaard kernen - 2 (kernen - 1 bij vier kernen of minder). Zie [Parserthreads](#parser-threads) (onder Voor ontwikkelaars). |
| Regel Bronnen | | Waar elk cijfer vandaan komt (`RAM: …. GPU: …. CPU: ….`). |
| **Opnieuw detecteren** | | Vraagt de dev-server om een nieuwe geheugenmeting en berekent elk budget opnieuw. |
| GPU-naam | | De korte naam van de adapter. De volledige renderer-tekst staat in de tooltip. |

### Het GPU-budget verhogen {#raising-the-gpu-budget}

Een GPU-budget boven de gedetecteerde waarde werkt zoals ingesteld. De passingscontrole en het uploaden gebruiken hetzelfde cijfer uit één functie ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)). Die begrenst alleen op het GPU-plafond waar de schuif stopt. Een laadbeurt die de controle haalt, wordt dus volledig geüpload. Voorbij de gedetecteerde waarde staat de schuif op *(boven gedetecteerd)*. Het getal is dan jouw oordeel over de kaart, geen meting. Hoger zetten dan de kaart aankan, riskeert een verloren context of een traag tabblad.

## Enorme datasets: de hendels {#huge-datasets-the-levers}

Van het goedkoopste naar het ingrijpendste:

1. **Minder filterkolommen.** Elke kost 4 bytes per rij en een decodeerronde.
2. **Een stap.** Elke *N*-de rij.
3. **Geen tijdkolom.** Geen sortering, geen sorteergrens, geen 4-8 bytes per rij voor tijd en levensduur, en geen tijdlijn.
4. **De budgetten verhogen**, als je weet dat het geheugen er is.

Bij het tekenen worden grote datasets verwerkt met steekproeven en progressieve opbouw, niet door de data te verkleinen. Zie [Steekproeven en budgetten](sampling-and-budgets.md).

## Voor ontwikkelaars {#for-developers}

### Parserthreads {#parser-threads}

Een laadbeurt van meerdere bestanden verwerkt er tegelijk maximaal **Parserthreads**, elk in een parser-worker die de ingest-worker voor die laadbeurt start ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Bij 1, of bij één bestand, worden de bestanden na elkaar verwerkt in de ingest-worker zelf.

Meerdere tegelijk maakt de passingscontrole niet milder:

- **De bouwer telt eerst mee.** De samengevoegde kolommen worden voor de hele selectie gereserveerd voordat het eerste bestand gelezen wordt. De bestanden die lopen krijgen dus alleen wat het RAM-budget naast hen overlaat (`parseHeadroom`): positie, 64-bits tijd, kijkhoeken, persoon, 32-bits groep, sessie, filterkolommen en `Bronbestand`, per rij die geladen wordt. Dat is maal 2,6 wanneer het aantal rijen een CSV-schatting is, omdat een kolom die naar een grotere groeit meer nodig heeft.
- **Elk bestand reserveert zijn kosten voordat het start** (`fileParseBytes`): zijn rijen (uit de Parquet-footer, of bij een CSV het aandeel uit de schatting naar grootte) maal dezelfde kolommen, maal **8**. Dat is het blok zelf, de kopie ernaast terwijl rijen zonder positie worden weggelaten, en de werkset van de decoder. Die is voor tekstkolommen veel groter dan hun id's. Een stap verlaagt dit niet, omdat bestanden volledig gelezen worden en pas daarna worden uitgedund. De 8 is een marge uit metingen: bij 3 of bij 5 haalden dertig parserthreads op 86 miljoen rijen met persoons- en sessienamen een tabblad boven zijn limiet. Bij 8 gebeurde dat niet.
- **Een volgend bestand start alleen als zijn reservering past** in wat overblijft. Een bestand dat klaar is maar wacht tot een eerder bestand is samengevoegd, houdt zijn reservering tot het samengevoegd is.
- **Eén bestand loopt altijd.** Als er niets gereserveerd is, start het volgende bestand hoe duur het ook is. Dat is het laden één voor één dat de passingscontrole heeft toegelaten. Een krap budget valt dus terug op dat laden en weigert niet.

Het cijfer *piek tijdens het laden* is de piek van een laadbeurt één voor één. Die komt bij het sorteren, nadat elk bestand gelezen is. Bestanden die naast elkaar worden verwerkt, kunnen tijdens het lezen boven dat cijfer uitkomen. De reserveringen houden het binnen het RAM-budget, voor zover de schattingen hierboven kloppen.

De samenvoegvolgorde is de volgorde van de selectie, in welke volgorde de bestanden ook klaar zijn. Daardoor zijn de nummering van personen, groepen en sessies, de rijen en de waarden van `Bronbestand` gelijk aan een laadbeurt één voor één. Een bestand dat niet gelezen kan worden, wordt overgeslagen en net als voorheen opgesomd. Als een parser-worker wegvalt, stopt de hele laadbeurt, zoals het wegvallen van de ingest-worker altijd deed. Elke parser-worker wordt beëindigd zodra de laadbeurt eindigt, hoe die ook eindigt. Kunnen parser-workers helemaal niet starten, dan worden de bestanden in de ingest-worker verwerkt.

### Hoe de cijfers gedetecteerd worden {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) draait bij het opstarten, nog eens zodra de renderer bestaat, en bij **Opnieuw detecteren**.

**RAM, met de dev-server.** `start.bat` en `npm run dev` leveren de pagina via een proces dat het geheugen van de machine kan lezen, op `/__host/memory` (binnen 1,5 s beantwoord, anders genegeerd). De standaard is het kleinere van 60% van het geïnstalleerde RAM en 80% van het nu vrije RAM. Het plafond is 60% van het geïnstalleerde RAM. Als vrij geheugen de standaard naar beneden houdt, zegt het paneel dat en stelt voor programma's te sluiten en op **Opnieuw detecteren** te drukken.

**RAM, zonder dev-server** (een statische site): geen browser-API meldt vrij geheugen, en `navigator.deviceMemory` wordt naar beneden afgerond op een macht van twee en door Chrome en Edge begrensd op 8 GiB. De standaard is 60% van `deviceMemory`, verder begrensd op 4 × de vrije JS-heap van het tabblad, waar de browser die meldt, of op 4 GiB als er niets gemeld wordt. Als `deviceMemory` precies 8 is (de begrenzing), wordt het cijfer als *begrensd* gemarkeerd. Het plafond is dan 4 × de standaard, met een opmerking dat het getal boven de standaard jouw bewering is, geen meting.

**In beide gevallen** worden de RAM-standaard en het RAM-plafond begrensd op **12 GiB**. Dat is de meeste typed-array-geheugen die één Chrome-tabblad kan vasthouden, wat de machine ook heeft. (Een pagina kwam op 15,75 GB en mislukte. 12 laat ruimte voor al het andere.) De waarde gaat nooit onder 256 MiB.

**GPU-geheugen.** Geen webwerkende API meldt dat.

- Met de dev-server wordt het geheugen van de kaart gelezen door `nvidia-smi` (de grootste adapter), of op Windows uit de registerwaarde `HardwareInformation.qwMemorySize` van de displayadapter. De standaard is 70% daarvan, het plafond 90%.
- Zonder meting wordt het afgeleid: standaard 2 GiB. 4 GiB als de grootste textuur 16.384 px of meer is (een losse kaart), 1 GiB als hij kleiner is. Of 8 × de `maxBufferSize` van WebGPU, als dat groter is. Het plafond is dan 8 × het afgeleide cijfer, omdat de afleiding een geïntegreerd onderdeel van een losse kaart onderscheidt en niets fijners. Het paneel zegt dat het cijfer is afgeleid.
- Nooit onder 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 als er niets gemeld wordt).

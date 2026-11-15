---
title: "Tacview snimke (ACMI)"
parent: "Unos podataka"
nav_order: 7
lang: "hr"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview snimke (ACMI)

Tacview je program koji snima letove u simulatorima letenja; njegove datoteke završavaju na `.acmi`. 3DHeat ih otvara da vidiš gdje je svaki zrakoplov letio.

Tacviewove snimke letova učitavaju se kao svaka tablica: odaberi ili ispusti `.acmi` (tekst, `.txt.acmi`, ili zipirano, `.zip.acmi`) i pritisni **Učitaj**. Tada dobiješ toplinu svih letova, a na kartici **Meč** reprodukciju s figurama, tragovima i popisom događaja ([Reprodukcija utakmice](match-replay.md)). ACMI je javni format datoteke Tacviewa ([dokumentacija](https://www.tacview.net/documentation/acmi/)); DCS (preko Tacviewova izvoznika), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS i drugi ga pišu, pa ovo čita bilo koji od njih.

## U što se snimka pretvara {#what-a-recording-becomes}

Jedan redak svaki put kad se zapiše položaj objekta, jedan redak po događaju na mjestu objekta, i jedan redak kad objekt napusti scenu (`Removed`, gdje je bio zadnji put). Događaj o objektu koji još nije viđen - oznaka, poruka svima - je redak objekta `(recording)` u referentnoj točki. Snimka nosi vlastite upute za čitanje, pa se korak mapiranja sam popunjava. Čitač piše ove stupce: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, zatim sva ostala svojstva koja snimka ima. Njihove uloge:

| Stupac | Uloga | Značenje |
|---|---|---|
| Time | vrijeme | Sekunde nakon ReferenceTime snimke; Unix sekunde kad ga snimka ima, pa sat pokazuje stvarno vrijeme. |
| X, Y | položaj | Istok i sjever, metri, na ravnini koja dira zemlju u referentnoj točki snimke: udaljenosti i smjerovi su točni blizu nje, a odstupaju manje od promila na 100 km. Sjever postaje svjetskim -Z. |
| Altitude | položaj (gore) | Metri. |
| Object | osoba | Pilot i naziv objekta s njegovim id-om, npr. `Viper 1 (F-16C_50) #a01`; bespilotni objekt `(T-90A) #401`. |
| Coalition | tim | Strana (ili boja, kad nema koalicije). |
| Heading, Pitch | pogled | Stupnjevi; kurs 0 je sjever. |
| Recording | sesija | Naslov snimke ili naziv datoteke: više snimki se učitava jedna uz drugu bez spajanja njihovih tragova. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtri | Čuvaju se za filtriranje; Type i Name biraju [figuru](figures.md) svakog objekta, Event hrani popis događaja u analizi, Roll naginje zrakoplov. |
| U, V | | Metri ravnog svijeta same igre, kad svaki uzorak ima njih (DCS ih piše). |
| EventObjects | filtri | Svaki objekt koji događaj navodi (`Message|a01|b02|...`), po id-u. |
| RecordingInfo | | Vlastita svojstva snimke kakva su bila u tom trenutku - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - kao JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtri | Bilo koje drugo brojčano svojstvo koje snimka nosi. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtri | Bilo koje drugo tekstualno svojstvo koje snimka nosi; svojstvo s vrijednošću koja nije broj jest tekst. |

Čitaju se sva četiri oblika Tacviewova položaja (`lon|lat|alt`, s `u|v`, s `roll|pitch|yaw`, i sa svima njima i kursom); prazna polja zadržavaju zadnju vrijednost; `-id` uklanja objekt, a id koji se poslije ponovno upotrijebi je novi objekt. Zarezi sa escape znakom i nastavljeni redci su obrađeni.

Položaji se uvijek projiciraju iz zemljopisne širine i dužine, nikad se ne uzimaju iz U/V, pa snimke svih igara dijele jednu projekciju s pozadinom stvarnog svijeta.

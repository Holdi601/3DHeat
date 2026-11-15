---
title: "Snimci Tacview (ACMI)"
parent: "Unos podataka"
nav_order: 7
lang: "bs"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Snimci Tacview (ACMI)

Tacview je program koji bilježi letove u simulatorima leta; njegove datoteke završavaju na `.acmi`. 3DHeat ih otvara da vidite gdje je svaki avion letio.

Snimci letova iz Tacviewa se učitavaju kao svaka tabela: izaberite ili prevucite `.acmi` (tekst, `.txt.acmi`, ili zipovan, `.zip.acmi`) i pritisnite **Učitaj**. Zatim dobijate toplotu svih letova, a na kartici **Meč** replay sa figurama, tragovima i listom događaja ([Replay meča](match-replay.md)). ACMI je javni format datoteka Tacviewa ([dokumentacija](https://www.tacview.net/documentation/acmi/)). DCS (preko Tacviewovog izvoznika), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS i drugi ga pišu, pa ovo čita bilo koji od njih.

## Šta postaje od snimka {#what-a-recording-becomes}

Jedan red svaki put kad se upiše pozicija objekta, jedan red po događaju na mjestu objekta, i jedan red kad objekat napusti scenu (`Removed`, gdje je bio zadnji put). Događaj koji se odnosi na objekat koji još nije viđen, kao oznaka ili poruka svima, je red objekta `(recording)` u referentnoj tački. Snimak nosi sopstvena uputstva za čitanje, pa se korak mapiranja popunjava sam. Čitalac piše ove kolone: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, pa sva dodatna svojstva koja snimak ima. Njihove uloge:

| Kolona | Uloga | Značenje |
|---|---|---|
| Time | vrijeme | Sekunde nakon ReferenceTime snimka; Unix sekunde kad ga ima, pa sat pokazuje pravo vrijeme. |
| X, Y | pozicija | Istok i sjever, metri, na ravni koja dodiruje zemlju u referentnoj tački snimka: udaljenosti i smjerovi su tačni u blizini, a odstupaju manje od jednog dijela na hiljadu na 100 km. Sjever postaje svjetski -Z. |
| Altitude | pozicija (gore) | Metri. |
| Object | osoba | Pilot i ime objekta sa id-om, npr. `Viper 1 (F-16C_50) #a01`; objekat bez posade `(T-90A) #401`. |
| Coalition | tim | Strana (ili boja, kad nema koalicije). |
| Heading, Pitch | pogled | Stepeni; smjer 0 je sjever. |
| Recording | sesija | Naslov snimka ili ime datoteke: više snimaka se učitava jedno pored drugog bez spajanja njihovih tragova. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filteri | Sačuvane za filtriranje; Type i Name biraju [figuru](figures.md) svakog objekta, Event hrani listu događaja u debriefu, Roll naginje avion. |
| U, V | | Ravni metri svijeta igre, kad svaki uzorak ih ima (DCS ih piše). |
| EventObjects | filteri | Svaki objekat koji događaj navodi (`Message|a01|b02|...`), po id-u. |
| RecordingInfo | | Sopstvena svojstva snimka onakva kakva su bila u tom trenutku: DataSource, DataRecorder, Author, Category, Briefing, Comments, ... kao JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filteri | Svako drugo numeričko svojstvo koje snimak nosi. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filteri | Svako drugo tekstualno svojstvo koje snimak nosi; svojstvo čija vrijednost nije broj je tekst. |

Čitaju se sva četiri oblika Tacviewove pozicije (`lon|lat|alt`, sa `u|v`, sa `roll|pitch|yaw`, i sa svim tim plus smjerom), a prazna polja zadržavaju zadnju vrijednost; `-id` uklanja objekat, a id koji se ponovo upotrijebi poslije toga je novi objekat. Obrađuju se escape-ovani zarezi i nastavljeni redovi.

Pozicije se uvijek projektuju iz geografske širine i dužine, nikad se ne uzimaju iz U/V, pa snimci iz svih igara dijele jednu projekciju sa pozadinom pravog svijeta.

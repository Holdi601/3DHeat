---
title: "Reġistrazzjonijiet Tacview (ACMI)"
parent: "Kif tidħol id-data"
nav_order: 7
lang: "mt"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Reġistrazzjonijiet Tacview (ACMI)

Tacview huwa programm li jirreġistra titjiriet fis-simulaturi tat-titjir; il-fajls tiegħu jispiċċaw b'`.acmi`. 3DHeat jiftaħhom biex tara fejn tajjar kull ajruplan.

Ir-reġistrazzjonijiet tat-titjir ta' Tacview jitgħabbew bħal kull tabella: agħżel jew aqbad `.acmi` (test, `.txt.acmi`, jew miżmum f'zip, `.zip.acmi`) u agħfas **Għabbi**. Imbagħad ikollok is-sħana tat-titjiriet kollha, u fit-tab **Partita** replay b'figuri, traċċi u lista ta' avvenimenti ([Replay tal-partita](match-replay.md)). ACMI huwa l-format pubbliku tal-fajls ta' Tacview ([dokumentazzjoni](https://www.tacview.net/documentation/acmi/)); DCS (permezz tal-esportatur ta' Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS u oħrajn jikitbuh, għalhekk dan jaqra kwalunkwe wieħed minnhom.

## X'isir minn reġistrazzjoni {#what-a-recording-becomes}

Ringiela waħda kull darba li tinkiteb pożizzjoni ta' oġġett, ringiela waħda għal kull avveniment fil-post tal-oġġett, u ringiela waħda meta oġġett jitlaq (`Removed`, fejn kien l-aħħar). Avveniment dwar oġġett li għadu ma nrawx - bookmark, messaġġ għal kulħadd - huwa ringiela tal-oġġett `(recording)` fil-punt ta' referenza. Ir-reġistrazzjoni tgħorr l-istruzzjonijiet tagħha stess għall-qari, għalhekk il-pass tal-mapping jimla lilu nnifsu. Il-qarrej jikteb dawn il-kolonni: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, u wara dawn kull proprjetà oħra li tkun fir-reġistrazzjoni. Ir-rwoli tagħhom:

| Kolonna | Rwol | Tifsira |
|---|---|---|
| Time | ħin | Sekondi wara l-ReferenceTime tar-reġistrazzjoni; sekondi Unix meta jkollha waħda, għalhekk l-arloġġ juri l-ħin reali. |
| X, Y | pożizzjoni | Lvant u tramuntana, f'metri, fuq pjan li jmiss mal-art fil-punt ta' referenza tar-reġistrazzjoni: id-distanzi u id-direzzjonijiet huma eżatti ħdejh, u jiżvarjaw b'inqas minn parti f'elf f'100 km. It-tramuntana ssir -Z tad-dinja. |
| Altitude | pożizzjoni (fuq) | Metri. |
| Object | persuna | Il-pilota u l-isem tal-oġġett bl-ID tiegħu, pereżempju `Viper 1 (F-16C_50) #a01`; oġġett mingħajr pilota `(T-90A) #401`. |
| Coalition | tim | In-naħa (jew il-kulur, meta ma jkunx hemm coalition). |
| Heading, Pitch | ħarsa | Gradi; heading 0 hija t-tramuntana. |
| Recording | sessjoni | It-Title tar-reġistrazzjoni, jew l-isem tal-fajl: diversi reġistrazzjonijiet jitgħabbew flimkien mingħajr ma t-traċċi tagħhom jaqsmu. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtri | Miżmuma għall-filtrar; Type u Name jagħżlu l-[figura](figures.md) ta' kull oġġett, Event jimla l-lista ta' avvenimenti tad-debrief, Roll jmejjel l-ajruplan. |
| U, V | | Il-metri tad-dinja ċatta tal-logħba stess, meta kull kampjun ikollu dawn (DCS jiktibhom). |
| EventObjects | filtri | Kull oġġett li avveniment isemmi (`Message|a01|b02|...`), bl-ID. |
| RecordingInfo | | Il-proprjetajiet tar-reġistrazzjoni kif kienu f'dak il-mument - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - bħala JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtri | Kull proprjetà numerika oħra li tgħorr ir-reġistrazzjoni. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtri | Kull proprjetà testwali oħra li tgħorr ir-reġistrazzjoni; proprjetà b'valur li mhuwiex numru hija test. |

L-erba' forom tal-pożizzjoni ta' Tacview (`lon|lat|alt`, b'`u|v`, b'`roll|pitch|yaw`, u bihom kollha u heading) jinqraw kollha, bil-kaxxi vojta jżommu l-aħħar valur; `-id` jneħħi oġġett, u ID użat mill-ġdid wara dan huwa oġġett ġdid. Il-virgoli mhux maqfula u l-linji kontinwi jiġu ttrattati.

Il-pożizzjonijiet dejjem jiġu proġettati mill-latitudni u l-longitudni, qatt ma jittieħdu minn U/V, għalhekk ir-reġistrazzjonijiet minn kull logħba jaqsmu proġezzjoni waħda ma' sfond tad-dinja reali.

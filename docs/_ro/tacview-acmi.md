---
title: "Înregistrări Tacview (ACMI)"
parent: "Încărcarea datelor"
nav_order: 7
lang: "ro"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Înregistrări Tacview (ACMI)

Tacview este un program care înregistrează zborurile din simulatoarele de zbor; fișierele lui se termină în `.acmi`. 3DHeat le deschide ca să vezi unde a zburat fiecare aeronavă.

Înregistrările de zbor Tacview se încarcă ca orice tabel: alege sau trage un `.acmi` (text, `.txt.acmi`, sau arhivat, `.zip.acmi`) și apasă **Încarcă**. Primești apoi căldura tuturor zborurilor și, în fila **Meci**, o redare cu figuri, trasee și o listă de evenimente ([Redarea meciului](match-replay.md)). ACMI este formatul public de fișiere al Tacview ([documentație](https://www.tacview.net/documentation/acmi/)); DCS (prin exportatorul Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS și altele îl scriu, deci acesta citește oricare dintre ele.

## Ce devine o înregistrare {#what-a-recording-becomes}

Un rând de fiecare dată când se scrie poziția unui obiect, un rând pentru fiecare eveniment la locul obiectului și un rând când un obiect dispare (`Removed`, unde era ultima dată). Un eveniment despre un obiect încă nevăzut - un semn de carte, un mesaj către toți - este un rând al obiectului `(recording)` în punctul de referință. Înregistrarea își poartă propriile instrucțiuni de citire, deci pasul de mapare se completează singur. Cititorul scrie aceste coloane: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, apoi orice alte proprietăți pe care le are înregistrarea. Rolurile lor:

| Coloană | Rol | Înseamnă |
|---|---|---|
| Time | timp | Secunde după ReferenceTime al înregistrării; secunde Unix când are una, ca ceasul să arate ora reală. |
| X, Y | poziție | Est și nord, în metri, pe un plan atingând pământul în punctul de referință al înregistrării: distanțele și direcțiile sunt corecte în apropiere, derivând cu sub o parte la o mie la 100 km. Nordul devine -Z al lumii. |
| Altitude | poziție (sus) | Metri. |
| Object | persoană | Pilotul și numele obiectului cu id-ul lui, de exemplu `Viper 1 (F-16C_50) #a01`; un obiect fără pilot `(T-90A) #401`. |
| Coalition | echipă | Tabăra (sau culoarea, când nu există coaliție). |
| Heading, Pitch | privire | Grade; direcția 0 este nord. |
| Recording | sesiune | Titlul înregistrării sau numele fișierului: mai multe înregistrări se încarcă una lângă alta fără ca traseele lor să se unească. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtre | Păstrate pentru filtrare; Type și Name aleg [figura](figures.md) fiecărui obiect, Event alimentează lista de evenimente a debriefingului, Roll înclină aeronava. |
| U, V | | Metrii lumii plate proprii jocului, când fiecare eșantion le are (DCS le scrie). |
| EventObjects | filtre | Fiecare obiect pe care îl numește un eveniment (`Message|a01|b02|...`), după id. |
| RecordingInfo | | Proprietățile proprii ale înregistrării așa cum erau în acel moment - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - ca JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtre | Orice altă proprietate numerică pe care o are înregistrarea. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtre | Orice altă proprietate text pe care o are înregistrarea; o proprietate a cărei valoare nu este un număr este text. |

Toate cele patru forme ale poziției Tacview (`lon|lat|alt`, cu `u|v`, cu `roll|pitch|yaw`, și cu toate și cu o direcție) sunt citite; câmpurile goale păstrează ultima valoare; `-id` șterge un obiect, iar un id folosit din nou după aceea este un obiect nou. Virgulele escapate și liniile continuate sunt tratate.

Pozițiile sunt mereu proiectate din latitudine și longitudine, niciodată luate din U/V, așa că înregistrările din orice joc împart aceeași proiecție cu un fundal al lumii reale.

## Servere DCS: cine a câștigat și cum s-a încheiat fiecare ieșire {#dcs-servers-who-won-and-how-each-sortie-ended}

Un server DCS multiplayer își înregistrează misiunile cu Tacview zi și noapte. Un server PvP persistent ține o campanie peste multe dintre ele: o tabără câștigă când ia fiecare aerodrom, FARP și zonă a celeilalte, ceea ce durează zile și multe reporniri ale misiunii. Înregistrările conțin zborurile, nu campania: niciun mesaj nu spune cine ce a luat, aerodromurile sunt scrise o singură dată, la început, și nimic nu spune cine a câștigat. Convertorul Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) adaugă pe fiecare rând ce se poate ști și lasă gol ce nu se poate ști. Nu ghicește niciodată.

| Coloană | Înțeles |
|---|---|
| `server` | serverul sau campania, din antetul înregistrării (Title, Author și Comments ale ei numesc serverele publice cunoscute - Blue Flag, SPS Contention, Growling Sidewinder; altfel un Author care numește pe cineva); `--server Name` îl numește pentru un dosar întreg. O înregistrare al cărei antet nu numește niciun server - un Author precum `Admin`, un Title și Comments pe care nu le scrie niciun server cunoscut - rămâne neatribuită: `server` gol, chiar dacă a fost descărcată de pe pagina de înregistrări a unui server, fiindcă pagina poate conține și misiunile altor comunități |
| `mission` | Title-ul înregistrării fără versiunea sau luna campaniei: `Operation_Example_V7.7.99` devine `Operation Example` |
| `campaign` | runda de campanie căreia îi aparține înregistrarea, după server, hartă și număr: `Example Server North 3`. O înregistrare este o sesiune (de la o repornire la alta); o rundă se întinde pe multe sesiuni, zile sau săptămâni |
| `round` | numărul acelei runde: al serverului, dacă îl publică, altfel a n-a rundă văzută pe acel server și acea hartă; dintr-un fișier de runde (mai jos), gol fără unul |
| `session` | locul înregistrării printre sesiunile rundei, 1, 2, ...; `sessionStart` începutul ei real (secunde Unix) |
| `heldRed`, `heldBlue` | locurile disputate pe care le ținea fiecare tabără la începutul sesiunii, dintr-un fișier de runde înlănțuit (mai jos) |
| `won`, `matchWon` | 1 când tabăra rândului (Color-ul lui, Red sau Blue) a câștigat acea campanie, 0 când a pierdut-o; goale unde niciun fișier de runde nu numește un câștigător și pe rândurile neutre. O campanie este în același timp runda și meciul, deci ambele au aceeași valoare |
| `roundEndReason` | `capture` pentru o campanie câștigată prin luarea a tot |
| `won`, `matchWon` pe fiecare sesiune a unei runde | rezultatul rundei, scris pe fiecare înregistrare a ei de îndată ce sfârșitul ei e cunoscut |
| `sortie` | pe rândurile unui avion: zborul lui, 1, 2, ... de la o decolare la alta; timpul la sol dinaintea primei decolări și de după o aterizare ține de zborul căruia îi aparține |
| `sortieResult` | cum s-a încheiat acel zbor: `landed`, `landed damaged` (după o lovitură în aer), `ejected`, `shot down`, `destroyed` (la sol), `crashed`, `despawned` (dispărut în aer fără o cauză văzută - un jucător care a ieșit), `airborne at end`, `no takeoff` |
| `sortieKills` | doborârile atribuite avionului în acel zbor |

Pe un server persistent, ieșirea este unitatea care contează. Filtrați după `sortieResult` = `shot down` ca să vedeți unde s-au pierdut zboruri, sau împărțiți căldura după `sortieResult` sau `server` în [defalcare](breakdown.md). Decolările, aterizările, catapultările, doborârile și prăbușirile din care e făcută sunt evenimentele pe care convertorul le deduce din felul în care se mișcă avionul (mai sus).

Locurile luate între două sesiuni ale unei runde (cunoscute din fișierul de runde, mai jos) sunt evenimente `capture` la începutul înregistrării de mai târziu: `Object` `(campaign)`, în acel loc, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Un aerodrom sau un FARP care își schimbă tabăra acolo unde înregistrarea o arată (scris din nou în culoarea celeilalte tabere, sau șters și scris din nou în locul lui în culoarea celeilalte în cinci minute) devine un eveniment `capture` la acea platformă: `Event` = `capture`, `Airfield` numele ei, `Detail` `Red to Blue`, `Coalition` noua ei tabără. O platformă scrisă prima dată într-o culoare nu este o captură. Serverele cercetate până acum își scriu platformele o singură dată, deci înregistrările lor nu conțin capturi.

### Fișiere de runde {#rounds-files}

Un fișier de runde spune, pentru fiecare server, rundele lui de campanie, cine le-a câștigat și sesiunile fiecăreia. Vine din ce publică serverul sau din înregistrările însele (mai jos).

Cine a câștigat o campanie este ceea ce publică serverul (un jurnal de campanie pe pagina lui web), nu ceva din înregistrare. Un fișier de runde poartă această informație, iar convertorul îl citește cu `--rounds file.json` (se pot da mai multe):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

O înregistrare aparține rundelor din `server`-ul ei al căror `title` (o expresie regulată) se potrivește cu Title-ul ei. Fiecare rând aparține rundei în care cade timpul lui real: RecordingTime al înregistrării plus secundele rândului, nu data din joc a misiunii. Orele sunt în UTC. O rundă fără câștigător (rotită, încă în desfășurare) dă rândurilor ei numărul rundei și un rezultat gol.

Corespondentul documentului de meci, subsolul `acmi`, spune de unde vine rezultatul, cum face `result.source` al unui meci War Thunder: `outcome.result` este `{ winner, round, endReason, source }`, unde `source` este `source` din fișierul de runde, sau `null` când nimic nu a numit un câștigător. `outcome` mai listează rundele înregistrării, capturile ei și ieșirile ei după cum s-au încheiat:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Un rând al pilotului `Viper 1 (F-16C_50) #a01` din tabăra albastră în acea campanie arată atunci: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Runde din înregistrările însele {#rounds-from-the-recordings-themselves}

Un server persistent își păstrează campania de la o repornire la alta, iar fiecare înregistrare începe cu unitățile terestre și obiectele statice ale ambelor tabere acolo unde le-a lăsat campania. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` citește primele minute ale fiecărei înregistrări ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), pune înregistrările fiecărui server de pe o hartă în ordinea timpului și le înlănțuie:

- **Locuri**: terenul în celule de circa 2 km; o celulă este a unei tabere când trei sferturi din unitățile aflate acolo la începutul unei sesiuni sunt ale ei. Locurile *disputate* sunt cele văzute ținute de ambele tabere.
- **Capturări**: un loc ținut de cealaltă tabără la începutul sesiunii următoare - luat între misiuni sau în timpul celei de dinainte.
- **O rundă nouă**: o sesiune ale cărei locuri diferă de ale celei dinainte în mai mult de 60% din ele - așezarea de început a unei runde noi, nu un pas al celei vechi. O rundă se încheie și când serverul trece pe altă hartă (sesiunile lui încep după ultima și continuă).
- **Cine a câștigat**: dintr-o rundă încheiată, tabăra care ținea fiecare loc la începutul ultimei ei sesiuni (`capture`, încredere mare), altfel tabăra care ținea mai multe locuri disputate (medie la dublul celeilalte, altfel mică; mică dacă s-a încheiat cu o schimbare de hartă). O rundă deschisă nu are câștigător, dar fiecare sesiune spune câte locuri ținea fiecare tabără la începutul ei, așa că se vede cine era în frunte.
- Un server ale cărui sesiuni încep toate la fel nu păstrează nicio stare între ele: nu este înlănțuit.

Începutul ultimei sesiuni poate fi cu ore înainte de sfârșitul rundei, deci încrederea contează. Verificat pe un server care își publică câștigătorii: lanțul a găsit fiecare rundă nouă la sesiunea în care a început runda publicată, iar tabăra din frunte la ultimul început a fost câștigătorul publicat în fiecare dintre cele 9 runde pe care le-a putut verifica. `--official file.json` păstrează rundele publicate ale unui astfel de server și le adaugă sesiunile din lanț; câmpul `validation` din fișier spune cât de mult s-a potrivit lanțul. Într-o campanie inventată:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Vizionarea unei runde de campanie ca serie {#watching-a-campaign-round-as-a-series}

Încărcați împreună înregistrările unei runde (fișierele cu același `campaign`), iar vizualizatorul le redă ca o singură serie: sesiune după sesiune, în ordinea lor reală, cu orele sau zilele dintre două sesiuni tăiate la o pauză de un minut. Cronologia marchează începutul fiecărei sesiuni cu galben și pauzele ca benzi întunecate, iar ceasul spune ce sesiune rulează și data ei reală (`session 4/12 · 2026-11-02 12:38 UTC`). Căldura, reluarea, filtrele și Insights funcționează pe toată seria, ca pe orice date încărcate. Secțiunea **Rundă de campanie** din fila **Meci** listează sesiunile cu datele lor, câte locuri disputate ținea fiecare tabără la fiecare început (și ca grafic pe toată runda) și câte au fost luate înainte; un clic duce la începutul unei sesiuni. O înregistrare încărcată singură spune acolo ce rundă și ce sesiune este. Înregistrările din runde diferite încărcate împreună nu sunt o serie: fiecare începe de la zero, ca meciurile separate. Încărcătorul pentru multe meciuri (**Multe meciuri deodată**) redă și el o rundă ca serie, în flux și dimensionată după GPU, pentru runde de mulți gigaocteți.

Locurile care și-au schimbat stăpânul în timpul rundei sunt desenate pe hartă ca zone de captură, colorate după tabăra care ținea fiecare loc la începutul sesiunii care rulează, și se schimbă la granițele dintre sesiuni; fiecare schimbare este o captură în lista de evenimente a reluării. Sunt deduse din rândurile încărcate (unitățile terestre și obiectele statice ale fiecărei sesiuni în primele ei minute, în celule de circa 2 km, cum face lanțul), deci au nevoie de încărcătorul complet (încărcătorul pentru multe meciuri păstrează prea puțin din fiecare rând).

**Încărcarea întregii runde dintr-una dintre înregistrările ei.** Într-un browser obișnuit, vizualizatorul nu poate deschide fișiere pe care nu le-ați ales: încărcați împreună fișierele rundei. Servit de serverul local al vizualizatorului (`npm run dev` sau `npm run preview`), poate: dați fișierului `tools/local-data.json`, ignorat de git, o intrare `campaigns` care numește dosarul fișierelor de runde și dosarele înregistrărilor convertite. Atunci secțiunea Rundă de campanie a unei înregistrări singure oferă **Încarcă toată runda**: aduce sesiunile rundei găsite acolo și le încarcă cu încărcătorul pentru multe meciuri:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Sunt servite doar înregistrările pe care le numește un fișier de runde (`tools/campaign-files.mjs`); o sesiune care nu e găsită în acele dosare este numărată, nu încărcată.

Ce publică serverele cunoscute:

| Server | O rundă | Cum câștigă o tabără | Unde se poate citi câștigătorul |
|---|---|---|---|
| SPS Contention | o campanie pe o hartă și o epocă (zile), peste multe reporniri | fiecare aerodrom, FARP și fortăreață luate; o campanie încheiată fără câștigător a fost rotită | jurnalul public de campanii al serverului (câștigător, început, sfârșit pentru fiecare campanie) |
| Blue Flag | o rundă de campanie peste multe misiuni de 5 ore; `_YYYY_MM` din Title avansează cu o lună la fiecare repornire | fiecare poziție inamică luată; rundele mai vechi numeau tabăra care ținea mai mult după un timp fix | nepublicat într-o formă găsită până acum; lanțul înregistrărilor urmărește fiecare rundă și cine ține cât la fiecare început |
| Growling Sidewinder | o rulare (6 ore) a unei misiuni de conflict deschis | zone și aerodromuri luate | pagina lui de statistici arată piloți, nu rezultate; fiecare sesiune începe la fel, deci nicio rundă nu se întinde pe mai multe sesiuni: gol |
| Misiuni contra AI (misiuni de capturare a zonelor) | o rulare a misiunii | tabăra jucătorilor contra AI-ului misiunii: niciun rezultat PvP | gol |
| Neatribuite (antetul nu numește niciun server) | - | - | gol, `server` gol și el |

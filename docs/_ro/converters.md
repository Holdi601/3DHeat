---
title: "Convertoarele păstrează totul"
parent: "Încărcarea datelor"
nav_order: 8
lang: "ro"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Convertoarele păstrează totul

Nu ai nevoie de această pagină ca să deschizi o reluare. Ea este pentru oamenii care scriu unelte care transformă fișierele jocurilor în tabele 3DHeat și pentru oricine vrea să știe de ce aceste tabele țin atât de mult.

Fiecare unealtă care transformă o reluare, un demo, un jurnal sau o telemetrie live a unui joc într-un lucru pe care îl deschide vizualizatorul urmează o singură regulă:

> **Convertește tot ce conține sursa și poate fi citit acum, și păstrează întreg restul, ca să poată fi citit mai târziu fără fișierul original.**

O reluare dispare adesea după o actualizare a jocului, o reinstalare sau un disc plin, iar un flux live dispare în momentul în care a fost trimis. Ce lasă un convertor jos se pierde pentru totdeauna; ce păstrează întreg poate fi decodat în ziua în care cineva îl înțelege. Așa că un convertor nu decide niciodată ce va fi util: decodează ce poate, păstrează fiecare alt mesaj, pachet, eveniment, proprietate sau linie neschimbată lângă tabel și spune în propria lui ieșire cât din fiecare a citit și cât a păstrat doar.

Această pagină este convenția pe care o împart toate convertoarele: convertoarele de reluări War Thunder, World of Tanks, World of Warships și Squad, convertorul de demo-uri CS2, vizualizatorul de fundal (decodorul lui de reluări Dota și fiecare adaptor live), uneltele de citire a telemetriei din unealta de captură a jocului și importurile proprii ale vizualizatorului (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Cititoarele proprii ale vizualizatorului sunt descrise în [înregistrările Tacview](tacview-acmi.md) și [Încărcarea fișierelor](loading-files.md); forma dintr-un singur fișier este [Un fișier pentru fiecare meci](container.md). Un meci devine un tabel, un `match.json` și sidecar-uri, opțional împachetate într-un singur fișier `.3dheat`. Fiecare README al unei unelte are o secțiune **Completeness** care listează, pentru sursa respectivă, ce este citit, ce este păstrat brut și ce nu este disponibil, și de ce.

## Trei locuri pentru fiecare element {#three-homes-for-every-item}

Tot ce conține o sursă ajunge într-unul din cele trei locuri:

| Loc | Ce ajunge acolo |
|---|---|
| **Decodat** | Tabelul (un rând pentru fiecare eșantion sau eveniment, coloanele pe care le citește vizualizatorul, coloane suplimentare pentru fiecare altă valoare care aparține unui rând) și documentul meciului `<match>.match.json` (tot ce aparține meciului ca întreg: setările, listele de jucători, rezultatele, tablourile de scor, autoverificarea). |
| **Păstrat brut** | Un sidecar lângă tabel: fiecare element care nu este decodat sau este decodat doar parțial, întreg și neschimbat, cu tipul lui, ora și unitatea sau entitatea căreia îi aparține. |
| **Indisponibil** | Numit în secțiunea Completeness a README-ului, cu motivul: formatul nu îl conține (o reluare de client nu are intrările celorlalți jucători), sursa nu îl trimite niciodată sau citirea lui nu este permisă (un proces protejat, un bloc criptat a cărui cheie nu e a noastră de folosit). |

Un element **parțial** decodat este decodat *și* păstrat brut: tabelul primește ce este înțeles, sidecar-ul elementul întreg, astfel încât un decodor mai bun, mai târziu, nu are nevoie de fișierul original.

Nu există un al patrulea loc. A lăsa ceva jos pentru că părea inutil, pentru că era un duplicat „probabil” sau pentru că era mare este o eroare. Subțierea este permisă doar în tabel (o cameră la 2 Hz în loc de 60), niciodată în sidecar.

## Sidecar-uri {#sidecars}

Un sidecar este un fișier Parquet lângă tabel, numit după el:

```
<folder>/<match>.parquet              tabelul
<folder>/<match>.match.json           documentul meciului
<folder>/<match>.<what>.parquet       un sidecar
```

`<what>` este un singur cuvânt din această listă. Un convertor nou alege cuvântul care se potrivește sau adaugă unul nou aici **și** în `SIDECAR_PARQUET` din
[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts),
ca vizualizatorul să-l lase afară când este încărcat un dosar întreg.

| `<what>` | Conține | Folosit de |
|---|---|---|
| `messages` | pachete, apelurile de metode ale entităților și actualizările de proprietăți ale unui flux de rețea, întregi | War Thunder, World of Tanks, World of Warships |
| `flight` | intrările modelului de zbor al fiecărui avion, întregi | War Thunder |
| `packets` | cadre întregi și mesaje de rețea, sau bucăți de container, în afara fluxului de entități | CS2, Dota 2, Squad |
| `events` | evenimente de joc cu toate cheile lor, cum le dă parserul | CS2 |
| `entities` | actualizări de entități și de proprietăți, apeluri la distanță, canale deschise și închise, cu exporturile de care are nevoie un decodor | Squad, Dota 2 |
| `props` | fiecare proprietate de entitate citită de parser, de fiecare dată când s-a schimbat | CS2 |
| `units` | starea pe unitate în afara tabelului de poziții | Dota 2 |
| `combatlog` | un jurnal de luptă, fiecare intrare cu fiecare câmp | Dota 2 |
| `strings` | fiecare intrare din fiecare tabel de șiruri | CS2, Dota 2 |
| `objectives` | zone de capturare și obiective, fiecare schimbare cu ora ei | War Thunder |
| `raw` | un flux live: fiecare pachet, linie, document de API sau citire de memorie primită, întreg | sesiunile vizualizatorului (`heat.raw.parquet`), înregistratoarele de tururi ale uneltei de captură a jocului (`<stamp>_<game>.raw.parquet`), fișierele de reluare osu!, LoL și Valorant ale vizualizatorului |

Încărcarea dosarului de către vizualizator sare peste fiecare `*.<what>.parquet` din această listă și peste
fiecare `*.match.json`, `*.meta.json`, `*.summary.json` și celelalte sidecar-uri JSON; deschiderea uneia
dintre ele singură, prin alegere sau prin tragere doar a acelui fișier, o încarcă ca orice alt tabel (vezi [Încărcarea fișierelor](loading-files.md)).

Acestea sunt fișierele așa cum le scrie un convertor cu `--loose`. Implicit, convertoarele War Thunder, CS2 și Tacview împachetează tabelul, documentul și sidecar-urile unui meci într-un singur fișier, `<match>.3dheat`, cu aceleași nume (vezi [Un fișier pentru fiecare meci](container.md)); tot ce este aici se aplică fiecărui membru.

### Coloane {#columns}

Fiecare rând de sidecar este un element. Coloanele sunt, în această ordine, cele care se aplică:

| Coloană | Tip | Ce este |
|---|---|---|
| `time` | float64 | secunde pe același ceas ca `time` din tabel (sau `tick` acolo unde sursa numără tick-uri; atunci ambele) |
| `type` | șir (dicționar) | ce este elementul, în termenii sursei: un tip de pachet, un id de mesaj, un nume de eveniment, o cale de proprietate, un prefix de linie |
| `name` | șir (dicționar) | numele lui, unde se cunoaște (un nume din comunitate, un nume de clasă), altfel gol |
| `entity` / `unit` / `uid` / `player` | întreg sau șir | al cui este, cu aceleași id-uri ca în tabel, astfel încât un rând din sidecar poate fi unit cu un traseu |
| `decoded` | șir (JSON) | ce se înțelege din el, acolo unde se înțelege ceva; altfel gol |
| `payload` | binar | octeții elementului, întregi și neschimbați (surse binare) |
| `text` | șir | textul elementului, întreg și neschimbat (surse text: o linie de jurnal, un obiect JSON, un bloc cheie-valoare) |

Sunt permise și alte coloane (un deplasament de biți, o mărime, un canal). Șirurile care se repetă sunt codificate în dicționar, iar fișierul este scris cu zstd, astfel încât un sidecar rămâne o fracțiune din mărimea reluării însăși.

Un sidecar trebuie să fie suficient singur: un decodor scris mai târziu citește sidecar-ul, niciodată reluarea originală. Acolo unde un element nu poate fi înțeles fără context (clasa unei entități, un tabel de șiruri, o cheie la care se referă un mesaj), contextul intră și el în sidecar sau în documentul meciului.

### Surse live {#live-sources}

Adaptoarele live (telemetrie UDP, memorie partajată, jurnalul unui joc, un API local) nu au niciun fișier la care să se întoarcă. Ele înregistrează **fiecare câmp pe care îl trimite sursa**, chiar și pe cele pe care nimic nu le folosește încă:

- un flux de pachete: fiecare pachet întreg, `payload` octeții, `type` id-ul sau formatul pachetului, la rata la care sosește;
- memorie partajată sau un API interogat: fiecare câmp al fiecărei citiri, fie ca coloane cu nume, fie blocul întreg ca `payload`, la rata citită de adaptor;
- un jurnal: fiecare linie, `text` linia, `type` felul liniei, inclusiv liniile la care adaptorul nu reacționează.

Acestea merg în `<session>.raw.parquet` lângă tabelul sesiunii. Mărimea este prețul regulii; ea este ținută jos prin zstd și codificarea în dicționar, nu lăsând lucruri pe din afară.

## Autoverificarea {#the-self-check}

Fiecare convertor scrie, în documentul său de meci (sau în `meta.json` al sesiunii, ori într-un rezumat acolo unde nu are document de meci), un bloc `completeness` sub `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Câmp | Înseamnă |
|---|---|
| `seen` | câte elemente de acest tip are sursa |
| `decoded` | citite întregi în tabel sau în documentul meciului |
| `partial` | citite în parte în tabel sau în document, și păstrate întregi într-un sidecar |
| `raw` | păstrate întregi doar într-un sidecar, nedecodate |
| `lost` | `seen - decoded - partial - raw`: trebuie să fie 0 |

`lost` de la nivelul superior este suma. Testele unui convertor afirmă că este 0 pe probele lor sintetice, iar README-ul spune cât a fost pe cele reale. Un `lost` diferit de zero înseamnă că convertorul spune că a încălcat regula; numește tipul, astfel încât golul să poată fi găsit.

„Tipurile” sunt ale sursei: tipuri de pachete, id-uri de mesaje, nume de evenimente, grupuri de proprietăți, feluri de linii. Ele sunt numărate acolo unde le întâlnește convertorul, nu dintr-o listă a ceea ce se așteaptă, astfel încât un tip pe care nimeni nu-l cunoștea apare cu numărul lui în loc să dispară.

## Secțiunea Completeness din README {#the-readmes-completeness-section}

README-ul fiecărui convertor are o secțiune cu titlul **Completeness**, cu trei liste:

- **Read**: ce intră în tabel și în documentul meciului și cum a fost verificat fiecare câmp nou față de ceva independent (cifrele proprii ale jocului, o a doua sursă, o înregistrare făcută în acest scop).
- **Kept raw**: ce este în ce sidecar, sub ce `type`, și ce se știe despre el până acum.
- **Not available**: ce nu conține sursa sau ce nu are voie să fie citit, și de ce.

Trimite înapoi aici.

## Unde stă fiecare convertor {#where-each-converter-stands}

| Convertor | Sidecar-uri | Secțiunea lui Completeness |
|---|---|---|
| Reluări War Thunder | `messages`, `flight` | [README-ul 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (cifrele autoverificării sunt sub `counts`; blocul `completeness` urmează) |
| Reluări World of Tanks | `messages` | [README-ul 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Reluări World of Warships | `messages` | [README-ul 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demo-uri de server Squad | `entities`, `packets` | [README-ul 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Demo-uri CS2 | `events`, `props`, `strings`, `packets` | [README-ul 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Reluări Dota 2 (vizualizatorul de fundal) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Reluări Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Reluări osu!, LoL, Valorant (vizualizatorul de fundal) | `raw` | paginile lor din [documentația vizualizatorului de fundal](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Adaptoare live (vizualizatorul de fundal) | `raw` | pagina fiecărui joc din [documentația vizualizatorului de fundal](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), și [dezvoltarea](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) pentru `Session.raw` |
| Înregistratoare de tururi (unealta de captură a jocului) | `raw`, și octeții `unparsed` dintr-un fișier de tur Forza | [README-ul 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Importurile proprii ale vizualizatorului | niciunul: vezi mai jos | această pagină |

### Importurile proprii ale vizualizatorului {#the-viewers-own-imports}

Tacview ACMI, OCAP și formatele GPS sunt citite în browser din fișierul propriu al utilizatorului; vizualizatorul nu păstrează nimic din ele, deci fișierul însuși rămâne înregistrarea. Totuși, ele citesc cât pot:

- **Tacview ACMI** (`src/data/acmi.ts`): fiecare linie de obiect cu o poziție este un rând cu fiecare proprietate pe care o poartă înregistrarea, fiecare eveniment este un rând, fiecare eliminare este un rând, iar proprietățile înregistrării (cu FileType și FileVersion din antet) apar pe fiecare rând ca `RecordingInfo`; o linie de comentariu este un eveniment `Comment`, un obiect care nu primește niciodată o poziție devine un rând `Unplaced` în punctul de referință, iar U/V sunt coloane ori de câte ori vreun rând le are. O linie de proprietate fără poziție este citită parțial: valorile ei ajung la următorul rând al obiectului, nu la ora lor. `AcmiTable.completeness` numără liniile fișierului după fel.
- **OCAP** (`src/data/ocap.ts`): cadrele, trageriile, markerele fiecărei entități, fiecare fel de eveniment (felurile necunoscute ca rânduri de „Mission” cu textul lor) și câmpurile proprii ale documentului (`Info`). Nu sunt citite încă: câmpurile entităților și elementele de poziție de la coadă, altele decât cele listate în antetul său (adăugirile unui înregistrator mai nou), și cadrele repetate ale unei unități moarte după moartea ei (subțiate intenționat: nimic nu se schimbă în ele).
- **Formatele GPS** (`src/data/geoTracks.ts`): fixurile, ora lor, altitudinea, cursul și viteza, și ritmul cardiac, cadența, puterea, temperatura, sateliții, HDOP și altitudinea de presiune acolo unde fișierul le înregistrează. Nu sunt citite încă: alte extensii GPX și KML, propoziții NMEA altele decât cele de poziție, înregistrări IGC altele decât fixurile și extensiile lor, și mesaje FIT altele decât înregistrările (ture, sesiuni, informații despre dispozitiv).

Aceste lipsuri sunt listate ca să fie închise, nu ca să fie scuzate; exporturile vizualizatorului ale unei înregistrări încărcate (`src/data/exportRecording.ts`) scriu doar ce s-a citit.

## Adăugarea unui convertor {#adding-a-converter}

1. Listează ce conține formatul, din documentația lui, din structurile lui proprii sau numărând fiecare tip de mesaj din probe reale. Lista este `types` din autoverificare.
2. Decodează ce se poate verifica acum. Fiecare câmp nou este verificat față de ceva independent înainte să intre în tabel; un câmp care nu poate fi verificat încă rămâne brut.
3. Păstrează restul întreg într-un sidecar numit ca mai sus, cu coloanele de mai sus.
4. Scrie blocul `completeness` și un test care arată că `lost` este 0.
5. Scrie secțiunea Completeness a README-ului și trimite aici.
6. Dacă `<what>` al sidecar-ului este nou, adaugă-l în tabelul de mai sus și în `SIDECAR_PARQUET` din `src/data/filePick.ts`.

Convertoarele sunt clean-room: sunt scrise din formate, documentație și probe, niciodată din cod GPL sau AGPL. Probele de reluări reale rămân pe mașina care le-a făcut; testele folosesc fișiere sintetice.

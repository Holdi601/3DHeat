---
title: "Reluarea meciului"
nav_order: 9
has_children: true
lang: "ro"
source: "match-replay.md"
source_hash: "9d61f24a5a04"
translated: true
outdated: false
---

# Reluarea meciului

Reluarea este un film al meciului în care fiecare jucător este desenat ca lucrul pe care l-a condus. Folosește-o ca să urmărești din nou o luptă, să urmezi o unitate și să vezi cine l-a lovit pe cine.

Trageri, lovituri, incendii și epave sunt desenate pe unități și pe obiectivele din nivel. Camerele, etichetele și un afișaj tactic te ajută să citești lupta. Cunoști Tacview? [Paritatea cu Tacview](tacview-parity.md) arată unde se află fiecare dintre instrumentele lui.

![Reluare cu figuri a demonstrației cu tancuri: tancurile ca figuri proprii, cu etichete de nume, vehicul și viteză](../assets/img/en/replay-overview.webp)

## Pornește o reluare {#start-a-replay}

1. Încarcă o înregistrare cu **Sursă → Fișiere…** sau trăgând-o în panoul Sursă (orice tabel cu o coloană de **persoană** și una de **timp**, un fișier Tacview, o reluare convertită, un meci [`.3dheat`](container.md)). Vezi [Încărcarea datelor](getting-data-in.md).
2. Deschide fila **Meci** și alege **Reluare cu figuri**, sau alege **Figuri suprapuse** în bara de moduri a filei Hartă termică.
3. Sub **Meciuri din reluare** alege un meci, toate deodată, sau mai multe.
4. Apasă **Redare** pe cronologie (sau `K`). Trage cronologia ca să sari.

Figurile înlocuiesc cutiile pentru fiecare unitate al cărei nume sau tip este cunoscut (vezi [Figuri](figures.md)). Datele fără o coloană de nume sau de tip sunt desenate ca soldați.

![Fila Meci: selectorul de meciuri, secțiunea Figuri, vederile camerei, Redare și lista de evenimente](../assets/img/en/match-replay-tab.webp)

## Figuri {#figures}

![Un tanc în flăcări în camera de orbită, cu lovitura care l-a atins](../assets/img/en/replay-tanks.webp)

| Setare (secțiunea **Figuri**) | Implicit | Ce face |
|---|---|---|
| **Figuri în loc de cuburi** | pornit | Oprit desenează cutii simple. |
| **Mărimea figurilor** (de câte ori mărimea reală) | 1 | 1 este mărimea reală; de la 0,25 la 20 de ori (scară logaritmică). Mai mare ajută de departe. |
| **Cea mai mică figură pe ecran** | 36 px | Figurile îndepărtate cresc ca să rămână atât de mari, de la 0 la 200 px; 0 păstrează mărimea reală. |
| **La distanță**: Figură, Săgeată, Simbol | Figură | Ce devine o unitate îndepărtată. |
| **Simboluri** | NATO (APP-6) | NATO (APP-6), semne tactice rusești, pictograme **Hartă de joc** sau **Doar forme (pentru daltoniști)**. |
| **Mărimea simbolului**, **Partea mea**, **Ostil / Neutru**, **Liniuțe de direcție** | 28 px (12 la 64), automat, ostil, pornit | Cum arată simbolurile și care parte este prietenă. |
| **Linii verticale** | pornit | O linie de la fiecare unitate drept în jos până la sol, ca înălțimile să se citească în 3D. |
| **Verticale și etichete la arme** | oprit | Linii până la sol și etichete pe rachete și bombe. |
| **Incendii pe unități** | pornit | Flăcări din momentul în care o unitate ia foc până când este stinsă. |
| **Lovituri pe unități** | pornit | Marcaje unde au lovit gloanțele (mai jos). **Loviturile rămân**: 1 până la 300 de secunde, sau **Toată viața**. **Marcaje plutitoare**: marcaje desenate deasupra suprafeței. |
| **Linii de privire și de turelă** | oprit | Întrerupte: unde se uită jucătorul; continue: unde arată tunul. |
| **Clădiri** | pline | Clădiri pline sau transparente, când nivelul le desenează. |

### Simboluri la distanță {#symbols-at-a-distance}

Când o unitate ar fi mai mică decât **Cea mai mică figură pe ecran**, poate deveni un simbol care rămâne lizibil. Forma spune tipul (de exemplu o cutie rotunjită cu o urmă de șenile pentru blindate); culoarea spune partea. Deschide meniul **Simboluri** ca să schimbi stilul.

![Aceleași șase unități ca simboluri NATO, semne tactice rusești, pictograme de hartă de joc și doar forme](../assets/img/en/match-replay-symbols-styles.webp)

### Marcaje de lovituri, epave și incendii {#hit-marks-wrecks-and-fires}

- **Marcajele de lovituri** stau pe suprafața pe care a lovit glonțul, la scara figurii. Aspectul lor spune ce s-a întâmplat: o gaură (a trecut), o stropire strălucitoare (nu a trecut), o zgârietură (a alunecat), o stea de funingine (proiectil exploziv). Un inel colorat spune ce a făcut: lovitura fatală, modul distrus, critic, grav, avarie, fără avarie, lovitură. Treci cu cursorul peste un marcaj ca să vezi numele rundei.
- O unitate distrusă este desenată **carbonizată**, ca epavă, din momentul morții până când reapare sau este scoasă; simbolul ei este tăiat.
- **Incendiile** ard pe o unitate din momentul în care ia foc până când este stinsă.
- **Turelele** se rotesc spre locul unde spun datele că arată tunul (sau, fără acestea, spre unde se uită jucătorul).

### Arme, momeli și trasoare {#weapons-decoys-and-tracers}

Cu **Arme, trageri și lovituri** pornit (secțiunea Vizualizarea echipelor): rachetele, rachetele ghidate, bombele și torpilele zboară ca figuri proprii cu o dâră de fum; gloanțele și obuzele sunt trasoare; impacturile și exploziile sclipesc. Un trasor desenat **întrerupt** a fost stabilit dintr-o lovitură, pentru că datele nu aveau tragerea. Flare-urile și cioburile de radar sunt desenate ca momeli; sunt ascunse din lista unităților, dacă nu este bifat *Momeli și obuze*.

## Camere {#cameras}

Dă clic pe o unitate sau pe eticheta ei ca s-o **urmărești**; secțiunea **Reluare** oferă **Din spate**, **Orbită**, **Carlingă** (cu un afișaj tip head-up, `H`), **Fixă**, **Padlock**, **Țintă** și **Satelit**. `V` le parcurge, **Distanța camerei** stabilește cât de departe. Esc oprește.

- **Vedere cu două unități**: alege o **Țintă** (sau dă clic cu Ctrl/Alt pe o unitate) ca s-o privești din cea urmărită; **Schimbă** le inversează.
- **Măsurare**: Shift-clic pe două unități pentru relevmentul, distanța și diferența de înălțime dintre ele.
- **Hartă 2D** (`M`): vedere de colț sau completă, cu urme și nume.
- **Semne de carte** (`B`): salvează momentul și camera; apar și eliminările, morțile și marcajele proprii ale înregistrării.
- **Evenimente**: fiecare eveniment în ordinea timpului; un clic sare acolo. `Page Up` / `Page Down` sar între evenimente; **Pauză la eveniment** oprește la fiecare.

## Afișajul tactic {#tactical-display}

![Demonstrația aeriană cu aspectul afișajului tactic (T): teren în sârmă, panouri cu eliminări și evenimente](../assets/img/en/replay-air-tactical.webp)

Secțiunea **Afișaj tactic** desenează, pentru nicio unitate, pentru cele selectate, pentru toate sau pentru un tip (aeronave, sol, nave, arme): vectori de viteză și traseul înainte, linii de nas și de portanță, conuri radar, blocaje, legături de date, zone și linii de angajare, linii de vedere, unde se uită jucătorii (conuri de vedere), țintirea turelei și camera înregistrată.

### Stilul afișajului {#display-style}

`T` (sau comutatorul **Afișează ca afișaj tactic**) schimbă aspectul într-un stil de ecran radar: strălucire, contururi, curbe de nivel, o grilă de măsurare, linii de scanare, inele de distanță, scări de altitudine, panouri cu eliminări și evenimente și un **Regizor** care mută singur camera spre evenimente.

![Aceeași luptă aeriană în aspectul normal](../assets/img/en/replay-air.webp)

## Obiective {#objectives}

Când un meci vine cu obiectivele lui, secțiunea **Obiective** le desenează pe nivel: zone de captură (cu proprietarul și progresul capturii), spawnuri, aerodromuri, zone și ținte de bombardament, fiecare strat putând fi comutat, cu etichete. Se văd prin teren. Cu mai multe moduri de joc încărcate, **Mod** filtrează meciurile după mod. Obiectivele vin din fișierul de meci al unui convertor, aflat lângă înregistrare sau în interiorul unui container [`.3dheat`](container.md).

## Etichete și statistici {#labels-and-statistics}

- **Etichete**: reguli pe tip (**Selectată**, **Aeronave**, **Terestre**, **Nave**, **Arme**, **IA**): arătate sau nu, ce valori și o **Prioritate** pentru cine primește spațiul când etichetele se suprapun. **Ține etichetele separate** mută o etichetă lângă unitatea ei când ar acoperi alta și o omite acolo unde nu este loc. **Mărimea etichetelor** este între 60 și 250%. **Înapoi la nume, vehicul, altitudine și viteză** resetează regulile.
  - Unitățile terestre pornesc cu nume, vehicul și viteză.
  - Aeronavele pornesc cu nume, vehicul, altitudine și viteză.
  - Navele pornesc cu nume, vehicul, viteză și cap.
  - Treci cu cursorul peste o unitate ca să vezi toate valorile ei.
- **Statistici**: pe echipă și pe unitate: eliminări, morți, trageri, lovituri, raportul loviturilor, decolări, aterizări, timpul în aer, viteza maximă, altitudinea și G, distanța. Export CSV.
- **Grafice**: valorile unei unități în timp, două unități comparate, sau o valoare față de alta.

## Multe meciuri deodată {#many-matches-at-once}

Pentru a suprapune sute sau mii de meciuri, vezi [Multe meciuri deodată](many-matches.md). Detalii despre figuri (fum, incendiu, alte efecte cu durată): [Figuri în suprapunerea figurilor](figure-replay.md). Lista de funcții Tacview: [Paritatea cu Tacview](tacview-parity.md), o pagină copil a acesteia.

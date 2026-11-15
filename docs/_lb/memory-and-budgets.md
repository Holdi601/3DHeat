---
title: "Späicher a Budgeten"
parent: "Daten astellen"
nav_order: 6
lang: "lb"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Späicher, Budgeten an d'Passpréiwung

Äre Computer huet begrenzten Späicher. 3DHeat zielt zesummen, wat Är Dateien brauchen, an seet Iech, virun **Lueden**, ob se passen.

![D'Späicherschätzung „passt net", mat Lueden all [N] Zeilen virausgefëllt, an de Knäppchen Lueden weist Ze grouss - reduzéieren oder verdënnen](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Ze grouss fir dësen Computer? 3DHeat schléit vir, all N-te Zeil ze lueden.*

E Browser-Tab, deen mëtten beim Lueden kee Späicher méi hat, stierzt of a verléiert Minutte Aarbecht, an eng GPU, déi méi wëll wéi se huet, verléiert hire Kontext oder gëtt ganz lues. Dofir sot de Quell-Panel virun engem Lueden, wéi vill Späicher et brauch, vergläicht dat mat de Budgeten, déi fir dëse Rechner erkannt goufen, a wëigert sech - mat engem Wee eraus -, wann et net passt. D'Modell steet an [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## D'Späicherschätzung {#the-memory-estimate}

Gewisen iwwer dem Knäppchen **Lueden**, wann d'Zeilen gezielt sinn.

| Zeil | Bedeitung |
|---|---|
| **Späicherschätzung** - *passt* / *knapp* / *passt net* | D'Urteel, gréng, bernstengelb oder rout. |
| `N Zeilen · B B/Zeil` | Zeilen, déi geluede ginn (nom Schrëtt), an d'Bytes pro Zeil am Duerchschnëtt. |
| `RAM X dauerhaft, Y Spëtzt beim Lueden` | Späicher, dee nom Lueden gehal gëtt, an déi héchst Maß beim Lueden. |
| `GPU Z · geschat Lued T` | GPU-Späicher fir d'Zeilen, a eng geschätzte Dauer bei 1,2 Millioune Zeilen pro Sekonn. |
| GPU-Numm | De Numm vum Renderer, wann den Treiber en uginn. |
| Messagen | Firwat et net passt oder knapp ass, an wat ze maachen ass. |
| **Lued all [N] Zeilen** | De Verdënnungs-Schrëtt (kuckt hei drënner). |
| `Budget: X RAM, Y GPU. Upassen ënner Performance → Ressourcebudgeten.` | D'Budgeten, déi d'Kontroll benotzt huet. |

### Bytes pro Zeil {#bytes-per-row}

| Spalt | Dauerhaft (RAM) | Notizen |
|---|---|---|
| Positioun | 12 | Dräi 32-Bit-Kommazuelen, ëmmer (eng flach Achs ass awer nach ëmmer e Feld) |
| Zäit | 4 | Wann zougeuerdnet |
| Liewensdauer | 4 | Wann Zäit an Persoun zougeuerdnet sinn |
| Persoun | 4 | Wann zougeuerdnet |
| Grupp | 2 | Wann zougeuerdnet |
| Sessioun | 4 | Wann zougeuerdnet |
| `Quelldatei` | 4 | Wann méi wéi eng Datei geluede ass |
| All Filterspalt | 4 | Pro ugekräizten Spalt *Fir Filteren behalen* |

Den **Spëtzt** zielt dat derbäi, wat d'Lueden nëmmen kuerzzäiteg brauch - 8 Bytes 64-Bit-Zäit beim Zesummeféieren, 12 Bytes Sortéierschlësselen an Indexen, 4 Bytes Permutatioun-Schmier (all dräi, wann Zäit zougeuerdnet ass), an 4 Bytes, solang d'Gruppespalt nach 32-Bit ass - an multiplizéiert d'Summ mat **2,0**. Dësen Faktor ass gemooss (e richtegt Lueden vu méi Dateien ass op 1,9× vun den opgezielte Feldere gespëtzt, vum Aarbechtsbereich vum Parquet-Decodéierer, de Kopie, déi all Spalt op d'Längt kierzen, an Späicher, dee befreit, awer nach net zréckgeschéckt ass) an opgerënnt, well eng ze niddereg Schätzung e ofgestürzte Tab kascht, eng ze héich Schätzung nëmmen en onnéideg Schrëtt.

Op der **GPU** kascht all Zeil 8 Bytes (Positioun a Grupp, je 16 Bits), plus 4 Bytes (Zäit an Liewensdauer, je 16 Bits), wann souwuel Zäit wéi Persoun zougeuerdnet sinn. Kuckt [GPU-Späicher-Residenz](gpu-memory.md). Filtertexturen (4 Bytes pro Zeil pro aktivem Filter) an d'Segmentufänk vun der Linn-Heatmap (8 Bytes pro Zeil, solang den Linnemodus un ass) sinn net an dëser Schätzung dran.

## D'Passpréiwung {#the-fit-check}

Dräi Bedéngungen gi verglach ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- de Spëtzt-RAM géint den **RAM-Budget**,
- d'GPU-Bytes géint den **GPU-Budget**,
- d'Zuel vun den Zeilen géint d'**Sortéierobergrenz** vun 400.000.000 Zeilen, wann eng Zäitspalt zougeuerdnet ass.

Dat schlechtst vun den dräi Verhältnisser entscheet: bis 70 % *passt*, bis 100 % *knapp* (et sollt lueden, awer et wäert lues sinn), driwwer *passt net*. Wann et net passt, nennt de Panel déi bindend Bedéngung a schléit vir:

- all *N*-te Zeil ze lueden, mat *N* = ⌈Zeilen / Zeilen, déi passen⌉, am Schrëttfeld virausgefëllt;
- Filterspalten fale ze loossen, d'Zäitspalt ofzeverbannen (dat hëlt de Sortéierschrëtt an d'Grenz mat, op Käschte vun der Zäitlinn), oder de Budget ze erhéijen.

Wann de Budget selwer kee Fakt iwwer d'Hardware ass - de Browser huet d'RAM-Zuel gedeckt, de Standard gouf vun deem erofgedréckt, wat elo fräi ass, oder d'GPU-Zuel ass eng Schätzung - da seet d'Message dat, sou datt Dir net no engem Schrëtt gräift, deen Dir net braucht.

### Verdënnen {#decimation}

**Lued all [N] Zeilen** hält eng Zeil vun *N*, pro Datei gezielt. Heatmap ass en Duerchschnëtt, dofir ergëtt all *N*-te Zeil déiselwecht Verdeelung mat méi Rauschen - den selwechten Tausch, deen de Renderer all Bild schonn mécht. De Kaschte fänkt bei 1 un (*Zeil (all)*); wann d'Auswiel net passt, gëtt se mam virgeschloe Schrëtt virausgefëllt, ausser Dir hutt do geschriwwen. Den Knäppchen Lueden seet dann *Lued N Dateien (1 vun K)*, an den Numm vum Dataset hält `all K-te Zeil` fest.

### D'Sortéiergrenz {#the-sort-ceiling}

De Renderer brauch d'Zeilen an enger steigender Zäitreiefolleg, dofir heescht eng zougeuerdnet Zäitspalt, all Zeil ze sortéieren, mat engem Radix-Sortéieren iwwer 32-Bit-Schlësselen ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Iwwer **400 Millioune** Zeilen gëtt dat ofgelehnt, amplaz an engem Tab probéiert ze ginn. Dat gëtt virum Lueden gepréift, sou datt eng Auswiel iwwer der Grenz mat engem Schrëttvirschlag ofgewisen gëtt, anstatt ganz gelies ze ginn an op dem leschte Schrëtt ze scheitere. No bei der Grenz (*knapp*) warnt de Panel, datt d'Sortéierung e laangen Duerchgang ouni eege Fortschrëtt ass. Ouni Zäitspalt gëtt näischt sortéiert, an et gëlt keng Grenz.

## Ressourcebudgeten {#resource-budgets}

**Performance → Ressourcebudgeten** (eng zesummeklappbar Zeil ënnen am Performance-Panel, déi `Ressourcebudgeten - RAM, GPU, Kären` liest). D'Budgeten ginn erkannt; de erkannte Wäert ass de Standard; an d'Schieber ginn net méi héich wéi eng **Grenz**, déi de erkannte Wäert ass, ausser wann d'Erkennung bekannt ass, kee Miessen ze sinn.

| Steierung | Beräich | Bedeitung |
|---|---|---|
| **RAM fir Zeilendonnéeën** | 256 MiB bis zur RAM-Grenz, logarithmesch | De RAM-Budget fir d'Passpréiwung. Gemaach mat *(iwwer erkannt)* wann et iwwer dem erkannte Standard ass, *(max)* bei der Grenz. |
| **GPU fir Zeilendonnéeën** | 128 MiB bis zur GPU-Grenz, logarithmesch | De GPU-Budget fir d'Passpréiwung an fir d'Zeilen eropzelueden. Gemaach mat *(iwwer erkannt)* wann et iwwer dem erkannte Standard ass, *(max)* bei der Grenz. |
| **Parser-Threads** | 1 bis zur Zuel vun de logesche Kären | Wéivill Dateien e Lueden gläichzäiteg parséiert, all an engem eegene Worker. Standard Kären - 2 (Kären - 1 bei véier Kären oder manner). Kuckt [Parser-Threads](#parser-threads) (ënner Fir Entwéckler). |
| Quelle-Zeil | | Wou all Zuel hiren Ursprong hat (`RAM: …. GPU: …. CPU: ….`). |
| **Nei erkennen** | | Freet de Dev-Server no engem frëschen Späicher-Miessen a rechent all Budget nei. |
| GPU-Numm | | Den kuerzen Numm vum Adapter; de ganze Renderer-String steet am Tooltip. |

### D'GPU-Budget eropsetzen {#raising-the-gpu-budget}

En GPU-Budget iwwer der erkannter Zuel gëllt wéi agestallt: d'Passpréiwung an den Upload huelen dee selwechte Wäert aus enger Funktioun ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), déi en nëmmen op d'GPU-Grenz, wou de Schieber stoppt, begrenzt. Also gëtt en Lueden, dat d'Kontroll passéiert, komplett eropgelueden. Iwwer der erkannter Zuel weist de Schieber *(iwwer erkannt)*: d'Zuel ass dann Äre Gedanke iwwer d'Kaart, net e Miessen, a se méi héich ze setzen wéi d'Kaart huet, riskéiert e verluerene Kontext oder e lues Gang.

## Ganz grouss Datesätz: d'Hebelen {#huge-datasets-the-levers}

Vum billegsten bis zum radikalsten:

1. **Manner Filterspalten.** All kascht 4 Bytes pro Zeil an e Decodéierungsduerchgang.
2. **En Schrëtt.** All *N*-te Zeil.
3. **Keng Zäitspalt.** Kee Sortéieren, keng Sortéiergrenz, keng 4-8 Bytes pro Zeil fir Zäit a Liewensdauer - an och keng Zäitlinn.
4. **D'Budgeten eropsetzen**, wann Dir wësst, datt de Späicher do ass.

Beim Renderen ginn grouss Dateset mat Sampling an progressiver Akkumulatioun gehandhabt, net andeems d'Date reduzéiert ginn; kuckt [Sampling a Budgeten](sampling-and-budgets.md).

## Fir Entwéckler {#for-developers}

### Parser-Threads {#parser-threads}

E Lueden vu méi Dateien parséiert bis zu **Parser-Threads** dervu gläichzäiteg, all an engem Parser-Worker, deen de Veraarbechtungs-Worker fir dat Lueden startet ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Bei 1, oder bei enger eenzeger Datei, ginn d'Dateien nacheneen am Veraarbechtungs-Worker selwer parséiert.

Méi wéi eng gläichzäiteg lassen d'Passpréiwung net méi locker:

- **Den Opbauer zielt als éischt.** D'zesummegeleeëten Spalten ginn fir d'ganz Auswiel zougeuerdnet, ier déi éischt Datei gelies gëtt, sou datt d'Dateien, déi lafen, nëmmen dat kréien, wat den RAM-Budget nieft hinnen iwwereg léisst (`parseHeadroom`): Positioun, 64-Bit-Zäit, Blickwénkel, Persoun, 32-Bit-Grupp, Sessioun, Filterspalten an `Quelldatei`, pro Zeil, déi geluede gëtt - mal 2,6, wann d'Zuel vun den Zeilen eng CSV-Schätzung ass, fir eng Spalt, déi a eng méi grouss wiisst.
- **All Datei reservéiert hir Käschten, ier se ufänkt** (`fileParseBytes`): hir Zeilen (aus dem Parquet-Fouss; bei enger CSV hire Undeel vun der Schätzung no Gréisst) mal déiselwechte Spalten, mal **8** - de Block selwer, d'Kopie nieft him, wärend Zeilen ouni Positioun fale gelooss ginn, an den Aarbechtsbereich vum Decodéierer, deen bei Textspalten vill méi grouss ass wéi hir IDen. E Schrëtt reduzéiert dat net, well Dateien ganz gelies ginn a dono verdënnt. Den 8 ass eng Rëserv, déi gemooss gouf: bei 3 oder bei 5 huet dreesseg Parser-Threads e Tab iwwer säin Limit bei 86 Millioune Zeilen mat Persoun- an Sessiounsnimm bruecht; bei 8 hat et net.
- **Eng aner Datei fänkt nëmmen un, wann hir Reservatioun an dem Rescht passt.** Eng Datei, déi fäerdeg ass, awer op eng fréiere waart fir zesummegeféiert ze ginn, behält hir Reservatioun, bis se zesummegeféiert ass.
- **Eng Datei leeft ëmmer.** Wann näischt reservéiert ass, fänkt déi nächst Datei un, wat se kascht - dat ass d'Lueden eent nom anerem, dat d'Passpréiwung erlaabt huet, also fällt e knappen Budget dorop zréck, anstatt ofzeleenen.

D'Figur *Spëtzt beim Lueden* ass d'Spëtzt vun engem Lueden eent nom anerem, wat bei der Sortéierung kënnt, nodeems all Datei gelies ass. Dateien, déi nieft-enee parséiert ginn, kënnen beim Liesen iwwer dës Figur Späicher huelen; d'Reservatiounen halen et am RAM-Budget, sou wäit d'Schätzunge uewen riicht sinn.

D'Zesummeféiungs-Reiefolleg ass d'Reiefolleg vun der Auswiel, egal a wéi enger Reiefolleg d'Dateien fäerdeg ginn, sou datt d'Nummeréierung vun de Persounen, Gruppen a Sessiounen, d'Zeilen an d'Wäerter vun `Quelldatei` mat engem Lueden eent nom anerem identesch sinn. Eng Datei, déi net gelies ka ginn, gëtt iwwersprong an eleng gelëscht, wéi virdrun. E Parser-Worker, deen ofbriecht, beendegt dat ganze Lueden, wéi den Doud vum Veraarbechtungs-Worker dat ëmmer gemaach huet, an all Parser-Worker gëtt beendegt, wann d'Lueden ophält, egal wéi. Wann d'Parser-Worker guer net kënne gestart ginn, ginn d'Dateien am Veraarbechtungs-Worker parséiert.

### Wéi d'Wäerter erkannt ginn {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) leeft beim Start, nach eng Kéier, wann den Renderer do ass, an op **Nei erkennen**.

**RAM, mam Dev-Server.** `start.bat` an `npm run dev` servéieren d'Säit aus engem Prozess, deen de Späicher vum Rechner liese kann, ënner `/__host/memory` (der Äntwert bannent 1,5 s oder ignoréiert). De Standard ass déi kleng vun 60 % vum installéierten RAM an 80 % vum momentan fräie RAM; d'Grenz ass 60 % vum installéierte. Wann de fräie Späicher de Standard erofdréckt, seet de Panel dat a schléit vir, Programmer zouzemaachen an **Nei erkennen** ze drécken.

**RAM, ouni dat** (eng statesch Installatioun): kee Browser-API mellt de fräie Späicher, an `navigator.deviceMemory` gëtt op eng Zweierpotenz ofgerond a vu Chrome an Edge op 8 GiB begrenzt. De Standard ass 60 % vun `deviceMemory`, nach eng Kéier begrenzt op 4 × dee fräie JS-Heap vum Tab, wann den Browser een mellt, oder 4 GiB, wann näischt gemellt gëtt. Wann `deviceMemory` genau 8 liest (d'Grenz), gëtt de Wäert als *begrenzt* markéiert, an d'Grenz ass 4 × de Standard, mat engem Hiweis, datt iwwer dem Standard d'Zuel Är Behaaptung ass, net e Miessen.

**Op béide Weeër** sinn den RAM-Standard an d'Grenz op **12 GiB** begrenzt, dat Maximum un Typed-Array-Späicher, dat ee Chrome-Tab hale kann, egal wat de Rechner huet (eng Säit ass op ronn 15,75 GB komm an ofgestuerzt; 12 léisst Plaz fir alles anert), an ni ënner 256 MiB.

**GPU-Späicher.** Keng Web-API mellt en iwwerhaapt.

- Mam Dev-Server gëtt de Späicher vun der Kaart vum `nvidia-smi` gelies (den gréisste Adapter) oder, ënner Windows, vum Registerwäert `HardwareInformation.qwMemorySize` vum Display-Adapter. De Standard ass 70 % dovun, d'Grenz 90 %.
- Ouni Miessen gëtt en ofgeleet: standardméisseg 2 GiB; 4 GiB, wann déi gréisste Textur 16.384 px oder méi ass (eng getrennt Kaart), 1 GiB, wann se méi kleng ass; oder 8 × WebGPU sengem `maxBufferSize`, wann dat méi grouss ass. D'Grenz ass dann 8 × den ofgeleeten Wäert, well d'Ofleeung eng integréiert Komponent vun enger getrennter ënnerscheet an näischt Méi Feines. D'Panel seet, datt de Wäert ofgeleet ass.
- Ni ënner 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4, wann näischt gemellt gëtt).


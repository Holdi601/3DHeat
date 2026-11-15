---
title: "Panel výkonu a štatistiky"
parent: "Vnútorné časti renderovania"
nav_order: 7
lang: "sk"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---


# Panel výkonu a prehľad štatistík

Políčko vpravo hore v zobrazení ukazuje, ako tvrdo prehliadač pracuje: koľko snímok za sekundu, koľko bodov kreslí a či ešte spresňuje obraz. Panel **Výkon** vám umožňuje vymeniť kvalitu obrazu za rýchlosť.

## Prehľad štatistík {#the-stats-overlay}

Políčko vpravo hore v zobrazení na kartách Heatmapa a Zápas ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Pri každej animačnej snímke číta živý údaj enginu.

![Prehľad štatistík na scéne veľa zápasov, s očíslovanými popiskami: 1 Backend, 2 FPS, 3 Snímka, 4 Riadky v okne, 5 Sprity / snímka, 6 Rozpočet, 7 Rozlíšenie tepla, 8 Pokrytie](../assets/img/en/performance-stats-overlay.webp)

| Riadok | Význam |
|---|---|
| **Backend** | *WebGPU* alebo *WebGL2*. Nad ním podržte myš, aby ste videli dôvod, prečo sa WebGPU nepoužilo, ak sa nepoužilo. Pozri [Dva backendy](backends.md). |
| **FPS** | Snímky za sekundu, spriemerované aspoň za 0,4 s. |
| **Snímka** | Čas snímky v ms, vyhladený (90 % predchádzajúci, 10 % nový). Je to čas medzi snímkami, nie čas GPU - čas jednotlivých prechodov GPU sa nemeria. |
| **Riadky v okne** | Kandidátne riadky: riadky v aktuálnom časovom okne, pred filtrovaním po riadkoch v shaderi. |
| **Sprity / snímka** | Sprity, ktoré poslal plán poslednej snímky (na nečinných snímkach, ktoré nič nekreslia, sa drží plánovaná hodnota). |
| **Rozpočet** | Rozpočet spritov, s ktorým bola táto snímka naplánovaná - hodnota adaptívneho regulátora, zvýšená na všetky kandidáty pri kreslení každého riadka. |
| **Rozlíšenie tepla** | Rozlíšenie bufferu tepla ako podiel plátna: nastavenie *Rozlíšenie tepla* krát adaptívna mierka druhého stupňa. |
| **Pokrytie** | Ako ďaleko postupná akumulácia pokročila k použitiu každého riadka: percento počas zbiehania (jantárová), *presne*, keď je hotovo. Šumová snímka sa nikdy nepomýli s dokončeným obrazom. |
| **Kocky** | Krabice nakreslené v [replay krabíc](box-replay.md). |
| **Nie je v pamäti** | Zobrazí sa len vtedy, keď sa riadky nezmestili do rozpočtu GPU: koľko ich je. Pozri [Rezidencia pamäte GPU](gpu-memory.md). |

## Zobrazenie rýchlosti {#the-speed-display}

Vpravo dole v zobrazení, len v perspektíve: rýchlosť letu a čas, za ktorý preletíte údaje pri tejto rýchlosti. Potiahnutím ju zmeníte. Pozri [Kamera](camera.md#fly-speed).

## Ak je prehliadač pomalý {#if-the-viewer-is-slow}

Pozrite sa na prehľad štatistík a potom:

1. **Riadky v okne sú oveľa väčšie ako Sprity / snímka, Pokrytie pod 100 %** - snímka nevie nakresliť všetko; pri nehybnom pohľade sa zbieha v niekoľkých snímkach. Zúžte okno, filtrujte alebo orezávajte, aby sa znížili kandidáti; alebo prijmite vzorkovanie.
2. **Sprity / snímka sa rovnajú Riadkom v okne, snímka je stále pomalá** - cena je na sprite na obrazovke: znížte *Maximálny polomer v pixeloch* ([Tvar spritu](sprite-shape.md#pixel-clamps)) alebo *Rozlíšenie tepla*.
3. **Pomalé pri málo riadkoch** - pravdepodobne úroveň: veľa štruktúr s zapnutými hranami, pozemné trojuholníky, hĺbka ostrosti. Pozri [Vzhľad úrovne](level-appearance.md).
4. **Všetko pomalé a červený banner** - softvérové vykresľovanie ([Detekcia softvérového vykresľovania](software-rendering.md)).

## Panel Výkon {#the-performance-panel}

| Ovládač | Predvolene | Účinok |
|---|---|---|
| Nápoveda | | Každá snímka nastriekne stratifikovanú náhodnú podmnožinu viditeľných riadkov s váhou upravenou na kompenzáciu, takže očakávané teplo je presné pri ľubovoľnom rozpočte; keď držíte pohľad nehybne, zlučovanie snímok pokračuje, kým každý riadok neprispel. |
| **Kresliť každý riadok v každej snímke** | zapnuté | Každá snímka, ktorá začína nový odhad, nakreslí každý kandidátny riadok (až asi 268 M); rozpočet nižšie sa stane dolnou hranicou. [Vzorkovanie a rozpočty](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptívny rozpočet** | zapnuté | Ladí sprity na snímku, potom rozlíšenie tepla, aby držal cieľový počet snímok za sekundu - a prestane škrtať, keď škrtanie nepomáha. [Vzorkovanie a rozpočty](sampling-and-budgets.md#the-adaptive-budget) |
| **Cieľové FPS** | 60 | 20 - 240 (1000 s rukoväťou). Hodnoty pod 15 sa berú ako 15. |
| **Počiatočné sprity / snímka** / **Sprity / snímka** | 4.00M | 65 536 - 268 435 456, logaritmicky. Pomenované *Počiatočné*, keď je adaptívny režim zapnutý, lebo regulátor ju mení. |
| **Rozlíšenie tepla** | 100 % | 25 - 100 %. Cena fragmentov rastie s druhou mocninou: 50 % zníži prácu zmiešavania na štvrtinu a pole tepla je dosť hladké, takže to sotva vidno. |
| **Postupné spresňovanie** | zapnuté | Akumuluje cez snímky, kým pohľad stojí. Vypnuté zobrazuje odhad z jednej snímky na každej snímke. [Akumulácia](accumulation.md) |
| **Rozpočty zdrojov** | zistené | Rozpočty RAM, GPU a vlákna parsera. [Pamäť a rozpočty](memory-and-budgets.md#resource-budgets) |

Nič z toho sa neukladá; po znovunačítaní sa obnovia predvolené hodnoty.

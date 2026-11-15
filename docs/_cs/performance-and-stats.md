---
title: "Panel výkonu a statistiky"
parent: "Vnitřní fungování vykreslování"
nav_order: 7
lang: "cs"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Panel výkonu a statistiky

Okénko vpravo nahoře v zobrazení ukazuje, jak moc prohlížeč pracuje: kolik snímků za sekundu, kolik bodů kreslí a zda ještě zpřesňuje obraz. Panel **Výkon** vás nechá vyměnit kvalitu obrazu za rychlost.

## Přehled statistik {#the-stats-overlay}

Okénko vpravo nahoře v zobrazení na kartách Teplotní mapa a Zápas ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Každý snímek animace čte živé údaje enginu.

![Přehled statistik na scéně mnoha zápasů s očíslovanými popisky: 1 Backend, 2 FPS, 3 Snímek, 4 Řádky v okně, 5 Sprity / snímek, 6 Rozpočet, 7 Rozliš. tepla, 8 Pokrytí](../assets/img/en/performance-stats-overlay.webp)

| Řádek | Význam |
|---|---|
| **Backend** | *WebGPU* nebo *WebGL2*. Najetím zjistíte, proč WebGPU nebyl použit, pokud nebyl. Viz [Dva backendy](backends.md). |
| **FPS** | Snímky za sekundu, průměr alespoň za 0,4 s. |
| **Snímek** | Čas snímku v ms, vyhlazený (90 % předchozí hodnoty, 10 % nové). Je to čas mezi snímky, ne čas GPU; čas jednotlivých průchodů GPU se neměří. |
| **Řádky v okně** | Kandidátní řádky: řádky v aktuálním časovém okně, před filtrováním po řádcích v shaderu. |
| **Sprity / snímek** | Sprity, které poslal plán posledního snímku (na nečinných snímcích, které nic nekreslí, zůstává plánovaná hodnota). |
| **Rozpočet** | Rozpočet spritů, se kterým byl tento snímek naplánován: hodnota adaptivního regulátoru, zvednutá na všechny kandidáty, když se kreslí každý řádek. |
| **Rozliš. tepla** | Rozlišení bufferu tepla jako podíl plátna: nastavení *Rozlišení tepla* násobené adaptivním měřítkem druhého stupně. |
| **Pokrytí** | Jak daleko je progresivní akumulace k použití každého řádku: procento během sbíhání (jantarově), *přesné* po dokončení. Šumový snímek se nikdy neplete s hotovým obrazem. |
| **Krychle** | Krabice kreslené v [přehrávání krabic](box-replay.md). |
| **Není v paměti** | Ukáže se jen tehdy, když se řádky nevešly do rozpočtu GPU: kolik jich je. Viz [Rezidence paměti GPU](gpu-memory.md). |

## Ukazatel rychlosti {#the-speed-display}

Vpravo dole v zobrazení, jen v perspektivě: rychlost letu a čas, za který při této rychlosti přeletíte data. Přetažením ji změníte. Viz [Kamera](camera.md#fly-speed).

## Když je prohlížeč pomalý {#if-the-viewer-is-slow}

Podívejte se na přehled statistik a pak:

1. **Řádky v okně výrazně větší než Sprity / snímek, Pokrytí pod 100 %**: snímek nemůže nakreslit všechno; když stojíte, sbíhá během několika snímků. Zúžte okno, filtrujte, nebo ořezávejte, aby se snížil počet kandidátů; nebo přijměte vzorkování.
2. **Sprity / snímek rovné Řádkům v okně, snímek pořád pomalý**: náklad je na sprite na obrazovce. Snižte *Maximální poloměr v pixelech* ([Tvar spritu](sprite-shape.md#pixel-clamps)) nebo *Rozlišení tepla*.
3. **Pomalé při málo řádcích**: pravděpodobně úroveň: velké počty konstrukcí se zapnutými hranami, trojúhelníky terénu, hloubka ostrosti. Viz [Vzhled úrovně](level-appearance.md).
4. **Všechno pomalé a červený banner**: softwarové vykreslování ([Detekce softwarového vykreslování](software-rendering.md)).

## Panel Výkon {#the-performance-panel}

| Ovládání | Výchozí | Účinek |
|---|---|---|
| Nápověda | | Každý snímek nastříkne stratifikovanou náhodnou podmnožinu viditelných řádků s váhou upravenou tak, aby kompenzovala; očekávané teplo je tak přesné při jakémkoli rozpočtu. Když zobrazení stojí, slučují se snímky dál, dokud každý řádek nepřispěje. |
| **Kreslit každý řádek v každém snímku** | zapnuto | Každý snímek, který začíná nový odhad, nakreslí každý kandidátní řádek (až asi 268 mil.); rozpočet níže je pak jen dolní mez. [Vzorkování a rozpočty](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptivní rozpočet** | zapnuto | Ladí sprity za snímek, pak rozlišení tepla, aby udržel cílovou snímkovou frekvenci, a přestane snižovat, když snižování nepomáhá. [Vzorkování a rozpočty](sampling-and-budgets.md#the-adaptive-budget) |
| **Cílové FPS** | 60 | 20–240 (1000 s úchytem). Hodnoty pod 15 se berou jako 15. |
| **Počáteční sprity / snímek** / **Sprity / snímek** | 4,00 mil. | 65 536–268 435 456, logaritmicky. Při zapnutém adaptivním rozpočtu se jmenuje *Počáteční*, protože ho regulátor posouvá. |
| **Rozlišení tepla** | 100 % | 25–100 %. Náklad fragmentů roste s druhou mocninou: 50 % zčtvrtí práci míšení a pole tepla je tak hladké, že to skoro není vidět. |
| **Postupné zpřesňování** | zapnuto | Akumulovat přes snímky, dokud zobrazení stojí. Vypnuto ukazuje každý snímek jen jednosnímkový odhad. [Akumulace](accumulation.md) |
| **Rozpočty prostředků** | zjištěno | Rozpočty RAM, GPU a vláken parseru. [Paměť a rozpočty](memory-and-budgets.md#resource-budgets) |

Nic z toho se neukládá; po znovunačtení se vrátí výchozí hodnoty.

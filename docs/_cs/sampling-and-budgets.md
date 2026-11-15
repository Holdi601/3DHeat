---
title: "Vzorkování a rozpočty"
parent: "Vnitřní fungování vykreslování"
nav_order: 3
lang: "cs"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Vzorkování a rozpočty

Když je bodů na jeden snímek příliš mnoho, prohlížeč nakreslí rovnoměrný vzorek a každý bod se počítá víc, takže obraz zůstane správný. Regulátor upravuje, kolik bodů kreslí, aby prohlížeč udržel svou snímkovou frekvenci.

## Ovládací prvky panelu Výkon {#performance-panel-controls}

| Ovládací prvek | Výchozí | Rozsah (posun) |
|---|---|---|
| **Kreslit každý řádek v každém snímku** | zapnuto | |
| **Adaptivní rozpočet** | zapnuto | |
| **Cílové FPS** | 60 | 20–240 (1000) |
| **Počáteční sprity / snímek** (adaptivní) nebo **Sprity / snímek** | 4,00 M | 65 536–268 435 456, logaritmicky (268 435 456) |
| **Rozlišení tepla** | 100 % | 25–100 %, násobeno adaptivním měřítkem druhé fáze |
| **Postupné zpřesňování** | zapnuto | Vypnuto: každý snímek je čerstvý odhad z jednoho snímku (hodí se, když chcete vidět surový vzorek). |

Viz také [Panel výkonu a přehled statistik](performance-and-stats.md).

## Pro vývojáře {#for-developers}

### Kandidátní řádky {#candidate-rows}

Řádky jsou uložené ve vzestupném pořadí času. Okno časové osy [*lo*, *hi*] se změní na rozsah řádků dvěma binárními hledáními ve sloupci času ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); bez sloupce času je kandidátem každý řádek. Jsou to **Řádky v okně** v přehledu statistik. Testy na jednotlivé řádky – filtry, skupiny, rozdělení, ořezávání, řez, životnost – probíhají později v shaderu; řádek, který neprojde, stojí jedno vyvolání vertexu a žádné fragmenty.

### Plán vzorkování {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) rozdělí rozsah kandidátů na **bloky po 4 096 po sobě jdoucích řádcích** a z rozpočtu spritů snímku vybere, kolik jich nakreslit:

- Když rozpočet pokryje všechny bloky, nakreslí se všechny – snímek je přesný.
- Jinak se bloky berou v rovnoměrném kroku přes rozsah, posunuté o chvění, které se každý snímek posune o zlatý poměr, takže po sobě jdoucí snímky pokrývají jiné bloky a sjednocení se rovnoměrně vyplní. Je to **stratifikovaný** vzorek: každá část časového rozsahu je zastoupena v každém snímku.

Teplo každého nakresleného řádku se násobí **kandidáti / odeslané**, takže očekávané teplo snímku je přesné při jakémkoli rozpočtu; na rozpočtu závisí jen šum. Řádky žijí v blocích po 8 388 608 (viz [Správa paměti GPU](gpu-memory.md)); blok se rozdělí, kde přechází přes hranici bloku, a každý blok dostane seznam začátků bloků, které musí nakreslit.

Jeden plán může nést nejvýš 65 536 bloků – 268 435 456 spritů –, protože obě backendy drží pevně danou vyrovnávací paměť začátků bloků s 65 536 místy. Žádost o víc se tam omezí a rozdíl se projeví poctivě jako víc snímků ke konvergenci.

### Kreslit každý řádek v každém snímku {#draw-every-row-each-frame}

**Výkon → Kreslit každý řádek v každém snímku** (výchozí **zapnuto**): rozpočet se stane spodní hranicí, ne horní, a snímek, který začíná čerstvý odhad, nakreslí každý řádek, za který je zodpovědný (až do stropu 268 M).

Důvod: pohyb kamery zahodí akumulaci, takže pohybující se snímek je jediný odhad, jehož šum určuje, kolik dat nakreslil – s jednou čtvrtinou nakreslenou uvidíte čtvrtinu v jasných vážených tečkách, a přesně proto se pohybující se pohled třpytí. Nakreslení všeho dělá z každého snímku hotový obraz. Cena je, že čas snímku teď sleduje velikost dat v okně; páčky jsou užší časové okno, filtry nebo ořezání podle vzdálenosti, které sníží kandidáty, místo aby je řídce vzorkovaly.

Vypněte to na hardwaru, který si celé pole najednou nemůže dovolit: *Sprity / snímek* je pak skutečný limit a pohled konverguje během několika statických snímků.

Co plný plán stojí, změřeno na výkonné desktopové grafické kartě při plátně 4K s velkým levelem a sprity o poloměru 1 m (pixel nebo dva): zhruba 100 M spritů na snímek při 30 fps, 200 M při 15 fps a maximum 268 M při zhruba 12 fps. Se spritami tak malými je celý náklad ve fázi vertexů a rozlišení tepla nic nemění; u velkých spritů je cenou výplň: 8 M spritů o poloměru 100 m zabralo 2,5 s na snímek při plném rozlišení tepla a 170 ms při 25 %. **Kreslit každý řádek v každém snímku** proto začíná na 67 M a každý snímek roste o čtvrtinu, zatímco snímky trvají méně než 150 ms, a půlí se, když trvají přes 400 ms, aby těžký pohled nemohl dostat snímek přes to, co hlídací časovač GPU dovolí.

### Adaptivní rozpočet {#the-adaptive-budget}

**Výkon → Adaptivní rozpočet** (výchozí zapnuto) ladí rozpočet spritů tak, aby držel **Cílové FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). V přehrání krychlí a při vykreslování videa je nečinný.

Vstupem je čas snímku, vyhlazený (90 % předchozí + 10 % nový, s jednotlivými snímky omezenými na 2 s), proti cíli 1000 / max(15, cílové FPS) ms.

**Fáze první – sprity.** Každý snímek se rozpočet násobí `1 + (cíl / snímek - 1) × zesílení`, se zesílením 0,35, když je pomalu, a 0,08, když je rezerva; omezeno na činitel 0,5–1,25 za snímek a na 65 536–268 435 456 spritů.

**Fáze druhá – rozlišení.** Jen když je rozpočet už na spodní mezi a snímky jsou stále o víc než 10 % pomalé, rozlišení vyrovnávací paměti tepla klesne o 8 % za snímek, až na 25 % plátna; obnoví se o 4 % za snímek, když je 30% rezerva. Náklad fragmentů klesá s druhou mocninou rozlišení, což je pod hladkou škálou skoro neviditelné. (Měřeno na softwarovém vykreslování s 10 M řádky a přehnanými spritami: 141 ms → 17 ms na snímek.) Měřítko se zaokrouhluje na šestnáctiny; přehled ho ukazuje jako *Rozl. tepla*.

**Vzdání se.** Pomalý snímek vypadá stejně, ať ho způsobily sprity, nebo těžký level – neexistuje měření času po průchodech. Když je rozpočet na spodní mezi a snímky zůstávají pod 70 % cíle 30 snímků, sprity nebyly náklad: regulátor přepne na **šplhání**, které rozpočet každých 14 snímků násobí 1,5 a obnovuje rozlišení, dokud čas snímku zůstává v 1,5násobku toho, co byl na spodní mezi. Šplhání, které věci zhorší víc než to, se vrátí na 60 % a pokračuje normální regulace; dosažení cíle šplhání ukončí.

Když je adaptivní rozpočet vypnutý, je rozpočtem prostě **Sprity / snímek**.

Když je zapnuto *Kreslit každý řádek v každém snímku*, adaptivní rozpočet běží dál, ale přesné pravidlo zvedne rozpočet tak, aby pokryl všechny kandidátní řádky, takže v praxi řídí jen fázi rozlišení a snímky, které nezačínají čerstvý odhad.

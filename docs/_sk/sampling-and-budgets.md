---
title: "Vzorkovanie a rozpočty"
parent: "Vnútorné časti renderovania"
nav_order: 3
lang: "sk"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Vzorkovanie a rozpočty

Keď je bodov príliš veľa na to, aby sa nakreslili v jednej snímke, prehliadač nakreslí rovnomerný vzorok a každej bodke dá väčšiu váhu, takže obraz zostane správny. Regulátor upravuje, koľko ich kreslí, aby prehliadač udržal svoju snímkovú frekvenciu.

## Ovládacie prvky panela Výkon {#performance-panel-controls}

| Ovládací prvok | Predvolené | Rozsah (posuv) |
|---|---|---|
| **Kresliť každý riadok v každej snímke** | zapnuté | |
| **Adaptívny rozpočet** | zapnuté | |
| **Cieľové FPS** | 60 | 20-240 (1000) |
| **Počiatočné sprity / snímka** (adaptívne) alebo **Sprity / snímka** | 4,00M | 65 536-268 435 456, logaritmicky (268 435 456) |
| **Rozlíšenie tepla** | 100 % | 25-100 %, vynásobené mierkou adaptívnej druhej etapy |
| **Postupné spresňovanie** | zapnuté | Vypnuté: každá snímka je nový odhad z jednej snímky (užitočné na zobrazenie surového vzorku). |

Pozri aj [Panel výkonu a prekrytie štatistík](performance-and-stats.md).

## Pre vývojárov {#for-developers}

### Kandidátne riadky {#candidate-rows}

Riadky sú uložené vzostupne podľa času. Časové okno osi [*lo*, *hi*] sa stane rozsahom riadkov dvoma binárnymi vyhľadávaniami v stĺpci času ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); bez stĺpca času je každý riadok kandidát. Toto sú **Riadky v okne** v prekrytí štatistík. Testy jednotlivých riadkov – filtre, skupiny, rozdelenie, orezanie, rez, životnosť – prebiehajú neskôr v shaderi; riadok, ktorý neprejde, stojí jedno vyvolanie vertexu a žiadne fragmenty.

### Plán vzorkovania {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) rozdelí rozsah kandidátov na **bloky po 4 096 po sebe idúcich riadkoch** a z rozpočtu spritov snímky vyberie, koľko ich nakresliť:

- Ak rozpočet pokryje každý blok, nakreslia sa všetky – snímka je presná.
- Inak sa bloky berú v rovnomernom kroku cez rozsah, posunutom o chvenie, ktoré sa každú snímku posúva o zlatý rez, takže po sebe idúce snímky pokrývajú iné bloky a spojenie sa rovnomerne vypĺňa. Je to **stratifikovaný** vzorok: každá časť časového rozsahu je zastúpená v každej snímke.

Teplo každého nakresleného riadku sa vynásobí **kandidáti / odoslaní**, takže očakávané teplo snímky je presné pri akomkoľvek rozpočte; len šum závisí od rozpočtu. Riadky žijú v blokoch po 8 388 608 (pozri [Pamäť GPU](gpu-memory.md)); blok sa rozdelí tam, kde prechádza hranicou bloku, a každý blok dostane zoznam začiatkov blokov, ktoré musí nakresliť.

Jeden plán môže niesť najviac 65 536 blokov – 268 435 456 spritov – lebo obe backendy držia pevný buffer začiatkov blokov s 65 536 miestami. Žiadosť o viac sa tam obmedzí a nedostatok sa čestne prejaví ako ďalšie snímky, kým sa obraz zbehne.

### Kresliť každý riadok v každej snímke {#draw-every-row-each-frame}

**Výkon → Kresliť každý riadok v každej snímke** (predvolene **zapnuté**): rozpočet sa stane dolnou hranicou namiesto hornej, a snímka, ktorá začína nový odhad, nakreslí každý riadok, za ktorý zodpovedá (až po strop 268 M).

Dôvod: pohyb kamery zahodí nahromadenie, takže pohybujúca sa snímka je jediný odhad, ktorého šum určuje, koľko dát nakreslila – keď sa nakreslí štvrtina, uvidíte štvrtinu v jasných vážených bodkách, a práve to robí pohyblivý pohľad trblietavým. Nakreslenie všetkého spraví z každej snímky hotový obraz. Cena je, že čas snímky teraz závisí od veľkosti dát v okne; páky sú užšie časové okno, filtre alebo orezanie podľa vzdialenosti, ktoré znížia kandidátov namiesto toho, aby ich vzorkovali redšie.

Vypnite to na hardvéri, ktorý si celé pole naraz nemôže dovoliť: *Sprity / snímka* je potom skutočný limit a pohľad sa zbehne počas niekoľkých statických snímok.

Čo stojí úplný plán, merané na špičkovej stolnej grafike pri plátne 4K s veľkým levelom, sprity s polomerom 1 m (pixel alebo dva): zhruba 100 M spritov za snímku pri 30 fps, 200 M pri 15 fps a maximum 268 M pri asi 12 fps. S tak malými spritmi je celá cena vo fáze vertexov a rozlíšenie tepla nič nemení; pri veľkých spritoch je cenou výplň: 8 M spritov s polomerom 100 m trvalo 2,5 s na snímku pri plnom rozlíšení tepla a 170 ms pri 25 %. **Kresliť každý riadok v každej snímke** preto začne na 67 M a stúpa o štvrtinu každú snímku, kým snímky trvajú menej než 150 ms, a klesá na polovicu, keď trvajú viac než 400 ms, aby ťažký pohľad nemohol prekročiť, čo dovolí strážca časovača GPU.

### Adaptívny rozpočet {#the-adaptive-budget}

**Výkon → Adaptívny rozpočet** (predvolene zapnuté) ladí rozpočet spritov tak, aby držal **Cieľové FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). V prehrávaní kociek a počas renderovania videa je nečinný.

Vstupom je čas snímky, vyhladený (90 % predchádzajúca + 10 % nová, s jednotlivými snímkami orezanými na 2 s), voči cieľu 1000 / max(15, cieľové FPS) ms.

**Prvá etapa – sprity.** Každú snímku sa rozpočet vynásobí `1 + (cieľ / snímka - 1) × zosilnenie`, so zosilnením 0,35, keď je to príliš pomalé, a 0,08, keď je rezerva; orezané na činiteľ 0,5-1,25 na snímku a na 65 536-268 435 456 spritov.

**Druhá etapa – rozlíšenie.** Len keď je rozpočet už na dne a snímky sú stále viac než 10 % pomalšie, klesne rozlíšenie tepelného bufferu o 8 % na snímku, až na 25 % plátna; obnovuje sa o 4 % na snímku, keď je 30 % rezervy. Cena fragmentu klesá so štvorcom rozlíšenia, čo je pod hladkou škálou takmer neviditeľné. (Merané na softvérovom renderovaní s 10 M riadkami a preveľkými spritmi: 141 ms → 17 ms na snímku.) Mierka sa zaokrúhľuje na šestnástiny; *Rozl. tepla* v prekrytí ju ukazuje.

**Vzdanie sa.** Pomalá snímka vyzerá rovnako, či ju spôsobili sprity, alebo ťažký level – nie je tu časovanie na jednotlivé prechody. Ak rozpočet zostane na dne a snímky zostanú pod 70 % cieľa 30 snímok, sprity nie sú náklad: regulátor prejde do **stúpania**, vynásobí rozpočet 1,5-krát každých 14 snímok a obnoví rozlíšenie, dokiaľ čas snímky zostáva v rozsahu 1,5-násobku toho, čo bol na dne. Stúpanie, ktoré to zhorší viac, než toto, sa vráti na 60 % a pokračuje normálna regulácia; dosiahnutie cieľa stúpanie ukončí.

Keď je adaptívny rozpočet vypnutý, rozpočtom je jednoducho **Sprity / snímka**.

Keď je *Kresliť každý riadok v každej snímke* zapnuté, adaptívny rozpočet stále beží, ale presné pravidlo zvýši rozpočet tak, aby pokryl všetky kandidátske riadky, takže v praxi riadi len etapu rozlíšenia a snímky, ktoré nezačínajú nový odhad.

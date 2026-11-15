---
title: "Pamäť a rozpočty"
parent: "Ako dostať dáta dnu"
nav_order: 6
lang: "sk"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Pamäť, rozpočty a kontrola, či sa zmestí

Váš počítač má obmedzenú pamäť. 3DHeat spočíta, čo vaše súbory potrebujú, a ešte pred **Načítať** vám povie, či sa zmestia.

![Odhad pamäte s hláškou Nezmestí sa, s predvyplneným Načítať každý [N]. riadok a tlačidlom Načítať s textom Príliš veľké - zmenšite alebo preriedte](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Príliš veľké pre tento počítač? 3DHeat navrhne načítať každý N-tý riadok.*

Karta prehliadača, ktorej dôjde pamäť uprostred načítania, spadne a stratí minúty práce. Keď GPU dostane požiadavku na viac pamäte, než má, buď stratí kontext, alebo sa spomalí na plazenie. Preto pred začiatkom načítania panel Zdroj povie, koľko pamäte je treba, porovná to s rozpočtami zistenými pre tento počítač a keď sa to nezmestí, odmietne to a ponúkne riešenie. Model je v [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Odhad pamäte {#the-memory-estimate}

Zobrazí sa nad tlačidlom **Načítať**, keď sa riadky spočítajú.

| Riadok | Význam |
|---|---|
| **Odhad pamäte** - *zmestí sa* / *tesne* / *nezmestí sa* | Verdikt, zelený, žltý alebo červený. |
| `N riadkov · B B/riadok` | Riadky, ktoré sa načítajú (po kroku preriedenia), a stály počet bajtov na riadok. |
| `RAM X trvalo, Y špička pri načítavaní` | Pamäť držaná po načítaní a najvyššia hodnota počas načítavania. |
| `GPU Z · odhad. načítanie T` | Pamäť GPU pre riadky a odhadovaný čas pri 1,2 milióna riadkov za sekundu. |
| názov GPU | Názov renderera, ak ho ovládač uvedie. |
| Správy | Prečo sa to nezmestí alebo je to tesné a čo s tým robiť. |
| **Načítať každý [N]. riadok** | Krok preriedenia (pozri nižšie). |
| `Rozpočet: X RAM, Y GPU. Upravte v Výkon → Rozpočty zdrojov.` | Rozpočty, ktoré kontrola použila. |

### Bajty na riadok {#bytes-per-row}

| Stĺpec | Trvalo (RAM) | Poznámky |
|---|---|---|
| Pozícia | 12 | Tri 32-bitové čísla s plávajúcou desatinnou čiarkou, vždy (plochá os je stále pole) |
| Čas | 4 | Keď je namapovaný |
| Životnosť | 4 | Keď sú namapované čas a osoba |
| Osoba | 4 | Keď je namapovaná |
| Skupina | 2 | Keď je namapovaná |
| Relácia | 4 | Keď je namapovaná |
| `Zdrojový súbor` | 4 | Keď je načítaný viac ako jeden súbor |
| Každý stĺpec filtra | 4 | Za každý zaškrtnutý stĺpec *Ponechať na filtrovanie* |

**Špička** pridá to, čo načítanie potrebuje len dočasne - 8 bajtov 64-bitového času pri zlučovaní, 12 bajtov kľúčov a indexov na triedenie, 4 bajty pomocného poľa permutácie (všetky tri, keď je namapovaný čas) a 4 bajty, kým je stĺpec skupiny ešte 32-bitový - a súčet vynásobí **2,0**. Tento činiteľ bol zmeraný (skutočné načítanie viacerých súborov dosiahlo špičku 1,9-násobku spočítaných polí, z pracovnej pamäte dekodéra Parquet, kópií, ktoré každý stĺpec orežú na dĺžku, a pamäte uvoľnenej, ale ešte nevrátenej) a zaokrúhlený nahor, lebo podhodnotený odhad stojí zlyhanú kartu, kým nadhodnotený stojí len zbytočný krok preriedenia.

Na **GPU** každý riadok stojí 8 bajtov (pozícia a skupina, každá po 16 bitoch), plus 4 bajty (čas a životnosť, každý po 16 bitoch), keď sú namapované čas aj osoba. Pozri [Pamäť GPU](gpu-memory.md). Textúry filtrov (4 bajty na riadok na každý aktívny filter) a začiatky segmentov tepla čiar (8 bajtov na riadok, keď je zapnutý režim Čiary) do tohto odhadu nepatria.

## Kontrola, či sa zmestí {#the-fit-check}

Porovnávajú sa tri obmedzenia ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- špičková RAM oproti **rozpočtu RAM**,
- bajty GPU oproti **rozpočtu GPU**,
- počet riadkov oproti **stropu triedenia** 400 000 000 riadkov, keď je namapovaný stĺpec času.

Rozhoduje najhorší z troch pomerov: do 70 % *zmestí sa*, do 100 % *tesne* (malo by sa to načítať, ale očakávajte pomalosť), nad to *nezmestí sa*. Keď sa to nezmestí, panel pomenuje obmedzenie, ktoré to spôsobuje, a navrhne:

- načítať každý *N*-tý riadok, kde *N* = ⌈riadky / riadky, ktoré sa zmestia⌉, predvyplnené v poli kroku;
- vypnúť stĺpce filtrov, zrušiť mapovanie stĺpca času (čím sa odstráni triedenie aj jeho strop, za cenu časovej osi) alebo zvýšiť rozpočet.

Keď rozpočet sám nie je fakt o hardvéri - prehliadač obmedzil údaj o RAM, predvolená hodnota je znížená tým, čo je práve voľné, alebo údaj o GPU je odhad - správa to povie, aby ste nesiahali po krok, ktorý nepotrebujete.

### Preriedenie {#decimation}

**Načítať každý [N]. riadok** ponechá jeden riadok z *N*, počítané pre každý súbor zvlášť. Teplo je priemer, takže každý *N*-tý riadok dá rovnaké rozloženie s väčším šumom - rovnaký kompromis, aký renderer robí každý snímok. Pole začína na 1 (*riadok (všetky)*); keď výber sa nezmestí, je predvyplnené navrhnutým krokom, pokiaľ do neho nič nenapíšete. Tlačidlo Načítať potom zobrazuje *Načítať N súborov (1 z K)* a názov súboru dát zapíše `every Kth row`.

### Strop triedenia {#the-sort-ceiling}

Renderer potrebuje riadky vo vzostupnom poradí času, takže namapovaný stĺpec času znamená triediť každý riadok, a to rádixovým triedením nad 32-bitovými kľúčmi ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Nad **400 miliónov** riadkov sa to odmietne namiesto pokusu v karte. Kontroluje sa to pred načítaním, takže výber nad limit sa odmietne s návrhom kroku namiesto toho, aby sa celý prečítal a zlyhal na poslednom kroku. Blízko limitu (*tesne*) panel upozorní, že triedenie je dlhý prechod bez vlastného ukazovateľa priebehu. Bez stĺpca času sa netriedi a strop neplatí.

## Rozpočty zdrojov {#resource-budgets}

**Výkon → Rozpočty zdrojov** (zbaliteľný riadok dole na paneli Výkon, ktorý znie `Rozpočty zdrojov - RAM, GPU, jadrá`). Rozpočty sa zisťujú; zistená hodnota je predvolená; a posuvníky nejdú vyššie než **strop**, ktorým je zistená hodnota, okrem prípadov, keď je známe, že zistenie nie je meranie.

| Ovládací prvok | Rozsah | Význam |
|---|---|---|
| **RAM pre dáta riadkov** | 256 MiB až strop RAM, logaritmicky | Rozpočet RAM pre kontrolu, či sa zmestí. Označené *(nad zisteným)* za zistenou predvolenou hodnotou, *(max)* na strope. |
| **GPU pre dáta riadkov** | 128 MiB až strop GPU, logaritmicky | Rozpočet GPU pre kontrolu, či sa zmestí, a pre nahrávanie riadkov. Označené *(nad zisteným)* za zistenou predvolenou hodnotou, *(max)* na strope. |
| **Vlákna parsera** | 1 až počet logických jadier | Koľko súborov sa pri načítaní parsuje naraz, každý vo vlastnom pracovnom procese. Predvolene jadrá - 2 (jadrá - 1 pri štyroch alebo menej jadrách). Pozri [Vlákna parsera](#parser-threads) (v časti Pre vývojárov). |
| Riadok zdrojov | | Odkiaľ každý údaj pochádza (`RAM: …. GPU: …. CPU: ….`). |
| **Znova zistiť** | | Požiada vývojový server o nové čítanie pamäte a prepočíta každý rozpočet. |
| názov GPU | | Krátky názov adaptéra; úplný reťazec renderera je v bubline. |

### Zvýšenie rozpočtu GPU {#raising-the-gpu-budget}

Rozpočet GPU nad zisteným údajom platí tak, ako je nastavený: kontrola a nahrávanie berú rovnaký údaj z jednej funkcie ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), ktorá ho obmedzí len na strop GPU, na ktorom sa posuvník zastaví. Takže načítanie, ktoré kontrola prejde, sa nahrá celé. Nad zisteným údajom posuvník ukazuje *(nad zisteným)*: číslo je potom váš úsudok o karte, nie meranie, a nastaviť ho vyššie, než karta má, riskuje stratu kontextu alebo plazenie.

## Obrovské súbory dát: páky {#huge-datasets-the-levers}

Od najlacnejšej po najdrastickejšiu:

1. **Menej stĺpcov filtrov.** Každý stojí 4 bajty na riadok a jeden prechod dekódovaním.
2. **Krok.** Každý *N*-tý riadok.
3. **Žiadny stĺpec času.** Žiadne triedenie, žiadny strop triedenia, žiadnych 4 až 8 bajtov na riadok pre čas a životnosť - a žiadna časová os.
4. **Zvýšiť rozpočty**, keď viete, že pamäť tam je.

Pri vykresľovaní sa veľké súbory dát spracúvajú vzorkovaním a postupným akumulovaním, nie zmenšovaním dát; pozri [Vzorkovanie a rozpočty](sampling-and-budgets.md).

## Pre vývojárov {#for-developers}

### Vlákna parsera {#parser-threads}

Pri načítaní viacerých súborov sa naraz parsuje až **Vlákna parsera** z nich, každý v pracovnom procese parsera, ktorý spustí pracovný proces príjmu pre toto načítanie ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Pri 1 alebo pri jednom súbore sa súbory parsujú jeden za druhým priamo v pracovnom procese príjmu.

Spúšťanie viacerých naraz nezmierňuje kontrolu, či sa zmestí:

- **Zostavovač sa počíta ako prvý.** Zlúčené stĺpce sa alokujú pre celý výber ešte predtým, než sa prečíta prvý súbor, takže súbory v prebehu dostanú len to, čo rozpočet RAM ponechá vedľa nich (`parseHeadroom`): pozícia, 64-bitový čas, uhly pohľadu, osoba, 32-bitová skupina, relácia, stĺpce filtrov a `Zdrojový súbor`, na každý riadok, ktorý sa má načítať - krát 2,6, keď je počet riadkov odhad z CSV, lebo stĺpec rastie do väčšieho.
- **Každý súbor si pred štartom rezervuje svoju cenu** (`fileParseBytes`): jeho riadky (z pätičky Parquet; pri CSV podiel odhadu podľa veľkosti) krát rovnaké stĺpce, krát **8** - samotný blok, kópia vedľa neho, kým sa riadky bez pozície zahadzujú, a pracovná pamäť dekodéra, ktorá je pri textových stĺpcoch oveľa väčšia než ich identifikátory. Krok to nezmenší, lebo súbory sa čítajú celé a preriedia sa až potom. Číslo 8 je rezerva nastavená meraním: pri 3 alebo pri 5 tridsať vlákien parsera dostalo kartu nad jej limit pri 86 miliónoch riadkov s menami osôb a relácií; pri 8 nie.
- **Ďalší súbor sa spustí, len ak jeho rezervácia sa zmestí** do toho, čo zostáva. Súbor, ktorý je hotový, ale čaká, kým sa zlúči predchádzajúci, si rezerváciu drží, kým sa nezlúči.
- **Jeden súbor vždy beží.** Keď nič nie je rezervované, ďalší súbor sa spustí bez ohľadu na cenu - to je načítanie jeden po druhom, ktoré kontrola pripustila, takže pri tesnom rozpočte sa prepne na neho namiesto odmietnutia.

Údaj *špička pri načítavaní* je špička načítania jeden po druhom, ktorá nastane pri triedení, po prečítaní všetkých súborov. Súbory parsované vedľa seba môžu pri čítaní prekročiť tento údaj; rezervácie ho držia v rámci rozpočtu RAM, pokiaľ sú vyššie uvedené odhady správne.

Poradie zlučovania je poradie výberu, bez ohľadu na poradie, v akom súbory končia, takže číslovanie osôb, skupín a relácií, riadky a hodnoty `Zdrojový súbor` sú totožné s načítaním jeden po druhom. Súbor, ktorý sa nedá prečítať, sa preskočí a uvedie sa presne ako doteraz. Pracovný proces parsera, ktorý zlyhá, ukončí celé načítanie, rovnako ako vždy zlyhanie pracovného procesu príjmu, a každý pracovný proces parsera sa ukončí, keď načítanie skončí, nech skončí akokoľvek. Ak sa pracovné procesy parsera vôbec nedajú spustiť, súbory sa parsujú v pracovnom procese príjmu.

### Ako sa údaje zisťujú {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) sa spustí pri štarte, znova, keď renderer existuje, a pri **Znova zistiť**.

**RAM, s vývojovým serverom.** `start.bat` a `npm run dev` servírujú stránku z procesu, ktorý vie čítať pamäť počítača, na `/__host/memory` (odpovie do 1,5 s, inak sa ignoruje). Predvolená hodnota je menšia z 60 % nainštalovanej RAM a 80 % momentálne voľnej RAM; strop je 60 % nainštalovanej. Keď voľná pamäť tlačí predvolenú hodnotu nadol, panel to povie a navrhne zavrieť programy a stlačiť **Znova zistiť**.

**RAM bez neho** (statické nasadenie): žiadne API prehliadača nehlási voľnú pamäť a `navigator.deviceMemory` sa zaokrúhľuje nadol na mocninu dvoch a Chrome a Edge ho obmedzia na 8 GiB. Predvolená hodnota je 60 % `deviceMemory`, ďalej obmedzená na 4-násobok voľnej JS haldy karty, ak ju prehliadač hlási, alebo na 4 GiB, keď sa nehlási nič. Keď `deviceMemory` ukazuje presne 8 (strop), údaj sa označí ako *obmedzený* a strop je 4-násobok predvolenej hodnoty, s poznámkou, že nad predvolenou hodnotou je číslo vaše tvrdenie, nie meranie.

**V oboch prípadoch** sú predvolená hodnota a strop RAM obmedzené na **12 GiB**, čo je najviac pamäte typových polí, ktorú jedna karta Chrome udrží, nech má počítač čokoľvek (jedna stránka sa dostala na približne 15,75 GB a zlyhala; 12 necháva miesto pre všetko ostatné), a nikdy nie pod 256 MiB.

**Pamäť GPU.** Žiadne webové API ju vôbec nehlási.

- S vývojovým serverom pamäť karty číta `nvidia-smi` (najväčší adaptér) alebo, na Windows, z registrovej hodnoty adaptéra zobrazenia `HardwareInformation.qwMemorySize`. Predvolená hodnota je 70 % z nej, strop 90 %.
- Bez čítania sa odhaduje: predvolene 2 GiB; 4 GiB, keď je najväčšia textúra 16 384 px alebo viac (samostatná karta), 1 GiB, keď je menšia; alebo 8 × `maxBufferSize` WebGPU, keď je to viac. Strop je potom 8 × odhadnutý údaj, lebo odhad rozlišuje integrovaný čip od samostatnej karty a nič jemnejšie. Panel uvedie, že údaj je odhad.
- Nikdy menej ako 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4, keď sa nehlási).

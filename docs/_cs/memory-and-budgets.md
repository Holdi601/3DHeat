---
title: "Paměť a rozpočty"
parent: "Jak nahrát data"
nav_order: 6
lang: "cs"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Paměť, rozpočty a kontrola, zda se vejde

Váš počítač má omezenou paměť. 3DHeat sečte, co vaše soubory potřebují, a ještě před **Načíst** vám řekne, zda se vejdou.

![Odhad paměti s hláškou, že se to nevejde, s předvyplněným Načíst každý [N]. řádek a tlačítkem Načíst, které říká Příliš velké – zmenšete nebo prořeďte](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Pro tento počítač je to moc? 3DHeat místo toho navrhne načíst každý N-tý řádek.*

Karta prohlížeče, která při načítání v půlce dojde paměti, spadne a přijde o minuty práce. Grafická karta, které se žádá víc, než má, buď ztratí kontext, nebo se zpomalí na šnečí tempo. Proto panel Zdroj před začátkem načítání řekne, kolik paměti je potřeba, porovná to s rozpočty zjištěnými pro tento počítač a při nedostatku místa načtení odmítne – a nabídne cestu ven. Model je v [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Odhad paměti {#the-memory-estimate}

Zobrazí se nad tlačítkem **Načíst**, jakmile jsou řádky spočítány.

| Řádek | Význam |
|---|---|
| **Odhad paměti** – *vejde se* / *těsně* / *nevejde se* | Verdikt, zeleně, oranžově nebo červeně. |
| `N řádků · B B/řádek` | Řádky, které se načtou (po kroku prořídění), a trvalé bajty na řádek. |
| `RAM X trvale, Y špička při načítání` | Paměť držená po načtení a nejvyšší hodnota během načítání. |
| `GPU Z · odhad. načtení T` | Paměť GPU pro řádky a odhadovaná doba při 1,2 milionu řádků za sekundu. |
| název GPU | Jméno vykreslovače, když ho ovladač hlásí. |
| Zprávy | Proč se to nevejde nebo je to těsné, a co dělat. |
| **Načíst každý [N]. řádek** | Krok prořídění (viz níže). |
| `Rozpočet: X RAM, Y GPU. Upravte v Výkon → Rozpočty zdrojů.` | Rozpočty, které kontrola použila. |

### Bajty na řádek {#bytes-per-row}

| Sloupec | Trvale (RAM) | Poznámky |
|---|---|---|
| Poloha | 12 | Tři 32bitová čísla s plovoucí čárkou, vždy (i plochá osa je pole) |
| Čas | 4 | Když je namapován |
| Životnost | 4 | Když je namapován čas i osoba |
| Osoba | 4 | Když je namapována |
| Skupina | 2 | Když je namapována |
| Relace | 4 | Když je namapována |
| `Zdrojový soubor` | 4 | Když je načten víc než jeden soubor |
| Každý sloupec filtru | 4 | Na každý zaškrtnutý sloupec *Ponechat pro filtrování* |

**Špička** přidá to, co načítání potřebuje jen přechodně – 8 bajtů 64bitového času při slučování, 12 bajtů klíčů řazení a indexů, 4 bajty pomocného pole permutace (všechny tři, když je čas namapován), a 4 bajty, dokud je sloupec skupiny ještě 32bitový – a součet násobí **2,0**. Tento činitel byl naměřen (skutečné načtení více souborů dosáhlo 1,9násobku položkovaných polí, kvůli pracovní množině dekodéru Parquet, kopiím, které každý sloupec zkracují na délku, a paměti uvolněné, ale ještě nevrácené) a zaokrouhlen nahoru, protože podhodnocení stojí spadlou kartu, zatímco nadhodnocení stojí jen zbytečný krok prořídění.

Na **GPU** stojí každý řádek 8 bajtů (poloha a skupina, po 16 bitech), plus 4 bajty (čas a životnost, po 16 bitech), když jsou namapovány čas i osoba. Viz [Rezidence paměti GPU](gpu-memory.md). Textury filtrů (4 bajty na řádek na každý aktivní filtr) a začátky segmentů čáry teploty (8 bajtů na řádek, když je režim Čáry zapnutý) do tohoto odhadu nepatří.

## Kontrola, zda se to vejde {#the-fit-check}

Porovnávají se tři omezení ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- špičková RAM proti **rozpočtu RAM**,
- bajty GPU proti **rozpočtu GPU**,
- počet řádků proti **stropu řazení** 400 000 000 řádků, je-li namapován sloupec času.

Rozhoduje nejhorší ze tří poměrů: do 70 % *vejde se*, do 100 % *těsně* (mělo by se to načíst, ale bude to pomalé), nad to *nevejde se*. Když se to nevejde, panel pojmenuje vázající omezení a navrhne:

- načíst každý *N*-tý řádek, kde *N* = ⌈řádky / řádky, které se vejdou⌉, předvyplněné v políčku kroku;
- vypustit sloupce filtrů, zrušit mapování sloupce času (to odstraní řazení i jeho strop, na úkor časové osy), nebo zvýšit rozpočet.

Když samotný rozpočet není fakt o hardwaru – prohlížeč omezil údaj o RAM, výchozí hodnota byla stažena tím, co je právě volné, nebo údaj o GPU je odhad – zpráva to řekne, abyste nesahali po kroku, který nepotřebujete.

### Prořídění {#decimation}

**Načíst každý [N]. řádek** ponechá jeden řádek z *N*, počítáno na soubor. Teplota je průměr, takže každý *N*-tý řádek dá stejné rozložení s větším šumem – stejný kompromis, jaký renderer dělá už při každém snímku. Políčko začíná na 1 (*řádek (všechny)*); když výběr není vejde, předvyplní se navrhovaný krok, pokud jste do něj nic nenapsali. Tlačítko Načíst pak píše *Načíst N souborů (1 z K)* a název datové sady zapíše `every Kth row`.

### Strop řazení {#the-sort-ceiling}

Renderer potřebuje řádky ve vzestupném pořadí času, takže namapovaný sloupec času znamená seřadit každý řádek, radixovým řazením přes 32bitové klíče ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Nad **400 milionů** řádků se to odmítne, místo aby se to zkoušelo v kartě. Kontroluje se to před načtením, takže výběr nad limit je odmítnut s návrhem kroku, místo aby se celý načetl a spadl na posledním kroku. Blízko limitu (*těsně*) panel varuje, že řazení je dlouhý průchod bez vlastního ukazatele postupu. Bez sloupce času se neřadí a žádný strop se neuplatní.

## Rozpočty zdrojů {#resource-budgets}

**Výkon → Rozpočty zdrojů** (sbalitelný řádek dole v panelu Výkon, který zní `Rozpočty zdrojů - RAM, GPU, jádra`). Rozpočty se zjišťují; zjištěná hodnota je výchozí; a posuvníky nejdou výš než **strop**, který je zjištěná hodnota, kromě případů, kdy je známo, že zjištění není měření.

| Ovládání | Rozsah | Význam |
|---|---|---|
| **RAM pro data řádků** | 256 MiB až strop RAM, logaritmicky | Rozpočet RAM pro kontrolu, zda se vejde. Označeno *(nad zjištěnou)* za zjištěnou výchozí hodnotou, *(max)* na stropu. |
| **GPU pro data řádků** | 128 MiB až strop GPU, logaritmicky | Rozpočet GPU pro kontrolu a nahrávání řádků. Označeno *(nad zjištěnou)* za zjištěnou výchozí hodnotou, *(max)* na stropu. |
| **Vlákna parseru** | 1 až počet logických jader | Kolik souborů se načítá současně, každý ve vlastním workeru. Výchozí jádra - 2 (jádra - 1 u čtyř jader nebo méně). Viz [Vlákna parseru](#parser-threads) (v části Pro vývojáře). |
| řádek Zdroje | | Odkud pochází každý údaj (`RAM: …. GPU: …. CPU: ….`). |
| **Zjistit znovu** | | Požádá vývojový server o nové čtení paměti a přepočítá každý rozpočet. |
| název GPU | | Krátký název adaptéru; plný řetězec vykreslovače je v nápovědě. |

### Zvýšení rozpočtu GPU {#raising-the-gpu-budget}

Rozpočet GPU nad zjištěnou hodnotou platí tak, jak je nastaven: kontrola a nahrávání berou stejnou hodnotu z jedné funkce ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), která ji omezí jen stropem GPU, kde posuvník končí. Načtení, které kontrola projde, se tedy nahraje celé. Nad zjištěnou hodnotou posuvník ukazuje *(nad zjištěnou)*: číslo je pak váš úsudek o kartě, ne měření, a nastavit ho výš, než karta má, riskuje ztrátu kontextu nebo plazení.

## Obrovské datové sady: páky {#huge-datasets-the-levers}

Od nejlevnější po nejdrastičtější:

1. **Méně sloupců filtrů.** Každý stojí 4 bajty na řádek a jeden průchod dekódováním.
2. **Krok.** Každý *N*-tý řádek.
3. **Žádný sloupec času.** Žádné řazení, žádný strop řazení, žádných 4–8 bajtů na řádek času a životnosti – a žádná časová osa.
4. **Zvyšte rozpočty**, když víte, že paměť tam je.

Při vykreslování se velké datové sady zvládají vzorkováním a postupným nasčítáváním, ne zmenšením dat; viz [Vzorkování a rozpočty](sampling-and-budgets.md).

## Pro vývojáře {#for-developers}

### Vlákna parseru {#parser-threads}

Načtení několika souborů zpracuje naráz až **Vlákna parseru** z nich, každé v parserovém workeru, který pro toto načtení spustí ingest worker ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Při 1, nebo u jednoho souboru, se soubory zpracovávají jeden za druhým přímo v ingest workeru.

Běh několika najednou kontrolu, zda se vejde, neuvolňuje:

- **Stavitel se počítá první.** Sloučené sloupce se alokují pro celý výběr dřív, než se přečte první soubor, takže soubory v letu dostanou jen to, co rozpočet RAM nechá vedle nich (`parseHeadroom`): poloha, 64bitový čas, úhly pohledu, osoba, 32bitová skupina, relace, sloupce filtrů a `Zdrojový soubor`, na řádek, který se má načíst – krát 2,6, když je počet řádků odhad z CSV, protože sloupec roste do většího.
- **Každý soubor si před startem rezervuje svou cenu** (`fileParseBytes`): jeho řádky (z patičky Parquet; u CSV podíl odhadu podle velikosti) krát tytéž sloupce, krát **8** – samotný blok, kopie vedle něj, zatímco se řádky bez polohy zahazují, a pracovní množina dekodéru, která je u textových sloupců mnohem větší než jejich id. Krok to nesnižuje, protože soubory se čtou celé a prořídí se až potom. Osm je rezerva nastavená měřením: při 3, nebo 5, třicet vláken parseru dostalo kartu přes její limit na 86 milionech řádků s jmény osob a relací; při 8 ne.
- **Další soubor se spustí, jen když se jeho rezervace vejde** do toho, co zbývá. Soubor, který je hotový, ale čeká, až se sloučí dřívější, si rezervaci drží, dokud se nesloučí.
- **Jeden soubor vždy běží.** Když nic není rezervováno, další soubor se spustí bez ohledu na cenu – to je načítání po jednom, které kontrola připustila, takže těsný rozpočet se k němu vrátí místo odmítnutí.

Údaj *špička při načítání* je špička načítání po jednom, které přichází při řazení, až jsou přečteny všechny soubory. Soubory parsované vedle sebe mohou při čtení překročit tuto hodnotu; rezervace ji drží v rozpočtu RAM, pokud jsou výše uvedené odhady správné.

Pořadí sloučení je pořadí výběru, bez ohledu na to, v jakém pořadí soubory doběhnou, takže číslování osob, skupin a relací, řádky i hodnoty `Zdrojový soubor` jsou stejné jako u načítání po jednom. Soubor, který nejde přečíst, se přeskočí a vypíše přesně jako dřív. Parserový worker, který spadne, ukončí celé načtení, jak vždy ukončil pád ingest workeru, a každý parserový worker se ukončí na konci načtení, jakkoli skončí. Když parserové workery vůbec nejdou spustit, soubory se zpracují v ingest workeru.

### Jak se údaje zjišťují {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) běží při startu, znovu, jakmile existuje renderer, a při **Zjistit znovu**.

**RAM, s vývojovým serverem.** `start.bat` a `npm run dev` servírují stránku z procesu, který umí číst paměť počítače, na `/__host/memory` (odpoví do 1,5 s, jinak se ignoruje). Výchozí je menší z hodnot 60 % nainstalované RAM a 80 % právě volné RAM; strop je 60 % nainstalované. Když volná paměť drží výchozí hodnotu dolů, panel to řekne a navrhne zavřít programy a stisknout **Zjistit znovu**.

**RAM, bez něj** (statické nasazení): žádné API prohlížeče nehlásí volnou paměť a `navigator.deviceMemory` se zaokrouhluje dolů na mocninu dvou a Chrome a Edge ho omezují na 8 GiB. Výchozí je 60 % `deviceMemory`, dále omezené na 4násobek volné JS haldy karty, kde ji prohlížeč hlásí, nebo 4 GiB, když nic nehlásí. Když `deviceMemory` ukazuje přesně 8 (strop), údaj je označen jako *omezený* a strop je 4násobek výchozí hodnoty, s poznámkou, že nad výchozí hodnotou je číslo vaše tvrzení, ne měření.

**V obou případech** jsou výchozí hodnota a strop RAM omezeny na **12 GiB**, což je nejvíc paměti typových polí, kterou jedna karta Chrome udrží, ať má počítač cokoli (stránka se dostala na asi 15,75 GB a selhala; 12 nechá místo pro všechno ostatní), a nikdy nejdou pod 256 MiB.

**Paměť GPU.** Žádné webové API ji vůbec nehlásí.

- S vývojovým serverem čte paměť karty `nvidia-smi` (největší adaptér), nebo na Windows z registrové hodnoty adaptéru zobrazení `HardwareInformation.qwMemorySize`. Výchozí je 70 % z ní, strop 90 %.
- Bez čtení se odhaduje: 2 GiB ve výchozím stavu; 4 GiB, když největší textura má 16 384 px nebo víc (samostatná karta), 1 GiB, když menší; nebo 8 × `maxBufferSize` WebGPU, když je to víc. Strop je pak 8 × odhadnutá hodnota, protože odhad rozlišuje integrovaný čip od samostatného a nic jemnějšího. Panel napíše, že hodnota je odhad.
- Nikdy pod 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4, když se nehlásí).

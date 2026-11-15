---
title: "Rozdíl"
parent: "Režimy tepla"
nav_order: 5
lang: "cs"
source: "difference.md"
source_hash: "9db62413b59c"
translated: true
outdated: false
---

# Rozdíl

Červeně tam, kde byl tým A víc, zeleně a modře tam, kde byl tým B, nic tam, kde byli stejně.

**Rozdíl** (klávesa 2) je znaménkové teplo. Řádky jedné populace teplo přičítají; řádky jiné populace ho odečítají. Kde se obě překrývají rovnoměrně, je výsledek nulový a zcela průhledný; kde jedna převládá, ukáže se v barvách její strany – ve výchozím nastavení teple (průhledná → červená → žlutá → bílá) pro stranu **+** a chladně (průhledná → zelená → modrá → fialová) pro stranu **−**.

![Rozdílové teplo: červeně tam, kde byla víc strana +, zeleně a modře tam, kde byla víc strana −](../assets/img/cs/difference-split.webp)

## Jak se to používá {#how-to-use-it}

1. Stiskněte `2` (nebo vyberte **Rozdíl** v liště režimů).
2. Otevřete **Rozdílové rozdělení** v postranním panelu.
3. Zvolte, co **Rozdělit podle**: obvykle *Skupiny*.
4. Jednu skupinu (nebo hodnotu) dejte na **+** a jinou na **−**.
5. Čtěte barvy: teplé znamená stranu +, chladné stranu −. Panel varuje, když jedna strana nemá žádné řádky (viz [Zprávy, které můžete vidět](#messages-you-may-see)).

*Které* dvě populace jsou tou pravou otázkou, takže rozdělit lze podle libovolného zachovaného sloupce, ne jen podle skupin. Řádky, které spadnou na **žádnou** stranu, se **vynechají**, nepočítají se jako nula: díky tomu rozdělení přes dvě z mnoha hodnot porovnává přesně tyto dvě a skládá se s [filtry](filters.md) – vyfiltrujte na jednu mapu a pak to rozdělte podle verze.

Režim potřebuje dvě strany: sloupec skupiny s aspoň dvěma skupinami, nebo rozdělení podle sloupce zachovaného pro filtrování. U dat s méně než dvěma skupinami začne načtení rozdělením podle sloupce – nejdřív sloupec *Source file* u načtení více souborů, jinak první sloupec kategorie se dvěma hodnotami, jinak první číselný sloupec s rozpětím – takže *porovnání dvou načtení* funguje i u dat bez jakýchkoli skupin. Jen data bez obojího nechají režim nedostupný; stejně tak rozdělení sloupcem, které na jedné straně nic nemá.

## Panel Rozdílové rozdělení {#the-difference-split-panel}

Zobrazuje se v režimu Rozdíl, pod panely tepla.

**Rozdělit podle** nabízí:

| Volba | Zobrazeno jako | Pravidlo rozdělení |
|---|---|---|
| Skupiny | *Skupina (N)* (když je sloupec skupiny) | Každá skupina na +, − nebo žádné, nastaveno v [Seznamu týmů](teams-list.md) |
| Sloupec kategorie | *sloupec (N hodnot)* | Hodnoty na +, − nebo žádné |
| Číselný sloupec | *sloupec (číselný)* | Rozsah hodnot pro každou stranu |
| Soubor původu | *Source file – porovnání dvou načtení* (když bylo načteno více souborů) | Soubory na +, − nebo žádné |

Nabízejí se jen sloupce ponechané v *Zachovat pro filtrování* při načtení.

### Porovnávat podíly, ne počty {#compare-shares-not-counts}

**Porovnávat podíly, ne počty** (výchozí vypnuto) váží každou stranu jednou lomeno jejím vlastním počtem řádků, takže strana s pětkrát víc řádky nevyhraje jen čísly. Barva pak ukazuje, kde je každá strana úměrně častější než druhá. Použijte to, když mají obě strany velmi různé množství dat, například dvě relace různé délky.

### Zprávy, které můžete vidět {#messages-you-may-see}

Panel varuje, když obrázek není skutečný rozdíl:

| Zpráva | Význam |
|---|---|
| *N + / M −* (nebo *N + / M − / K nepoužito*) | Kolik hodnot je na každé straně (a na žádné). |
| Žádný řádek v okně není na straně **+** | Kreslí se jen strana **−**. Posuňte okno časové osy, nebo změňte rozdělení. |
| Žádný řádek v okně není na straně **−** | Kreslí se jen strana **+**. |
| Žádná hodnota není na žádné straně | Rozdíl nic nekreslí. Dejte aspoň jednu hodnotu na **+** nebo **−**. |
| *sloupec* nejde rozdělit tímto způsobem | Zvolený sloupec se do rozdělení nehodí. Zvolte sloupec znovu. |
| Sloupec rozdělení se nevešel do paměti GPU pro N z M částí | Ty řádky se nekreslí. Zvyšte rozpočet GPU v Výkon → Rozpočty zdrojů, nebo načtěte méně řádků. |

### Podle skupiny {#by-group}

Panel jen odkazuje na [Seznam týmů](teams-list.md), kde má každá skupina tlačítka **+** a **−**. Při každém načtení se první polovina skupin (zaokrouhleno nahoru) dá na +, zbytek na −; **Rozdělit rovnoměrně** v Seznamu týmů udělá totéž znovu. Skupina na žádné straně, nebo skrytá svým zaškrtávacím políčkem, nepřispívá nic.

### Podle hodnot kategorie {#by-category-values}

| Část | Význam |
|---|---|
| `a + / b − / c nepoužito` | Kolik hodnot je na každé straně a na žádné. |
| **Vymazat** | Dá každou hodnotu na žádnou stranu. |
| Seznam hodnot | Každá hodnota s tlačítkem **+** a **−** (kliknutím na aktivní ji odeberete z dané strany). Prázdná hodnota je uvedena jako *(chybí)*. |
| Poznámka o limitu | Vypisuje se jen prvních 200 hodnot: *Zobrazeno prvních 200 z N hodnot. Tak široký sloupec je lepší nejdřív zúžit filtrem, nebo rozdělit podle rozsahu, pokud jsou jeho hodnoty seřazené.* |

Výběr sloupce dá jeho první hodnotu na + a druhou na −. Když žádná strana nemá žádnou hodnotu, rozdělení se vrátí ke skupinám, místo aby ukázalo prázdný rámeček. *Source file* funguje stejně, jedna hodnota na soubor – tak se porovnávají dva exporty, dva testovací běhy nebo dvě verze.

### Podle rozsahu {#by-range}

| Část | Význam |
|---|---|
| Nápověda | Nejmenší a největší hodnota sloupce. |
| **Kladný rozsah (+)**, **od** / **do** | Řádky s hodnotou v tomto rozsahu, včetně obou konců, přičítají. |
| **Záporný rozsah (−)**, **od** / **do** | Řádky v tomto rozsahu odečítají. |
| **Rozdělit v polovině** | Nastaví + na [minimum, střed] a − na [střed, maximum] – to dělá i výběr sloupce. |

Hodnota v obou rozsazích se počítá jako +. Rozsahy nemusí pokrýt celý sloupec; hodnoty mimo oba se vynechají. *První dvě minuty proti posledním dvěma* je rozdělení podle rozsahu u sloupce podobného času.

## Podíl +: mapa podílu výher {#share-of--the-win-rate-map}

**Rozdíl** / **Podíl +** nahoře v panelu volí, co se kreslí. *Podíl +* obarví každé místo podle podílu strany + mezi řádky obou stran na tom místě, ve srovnání s tímto podílem za vše zobrazené: teplá nad ním, studená pod ním, nic tam, kde je stejný, a nic tam, kde má místo příliš málo řádků. S vyhranými koly na + a prohranými na − je to mapa podílu výher. **Podíl vyhraných kol** a **Podíl vyhraných zápasů** ji nastaví jedním stiskem, pokud data mají [sloupce výsledku](data-formats.md#outcome-columns). Viz [Podíl výher](win-rate.md).

## Barvy {#colours}

Sekce **Barvy tepla** ukazuje v tomto režimu dva editory škál: **Kladná (přičítající týmy)** a **Záporná (odečítající týmy)**, každý s vlastním tlačítkem resetu (*Resetovat na průhlednou → červenou → žlutou → bílou*, *Resetovat na průhlednou → zelenou → modrou → fialovou*). Složené zobrazení vezme absolutní hodnotu čistého tepla přes [bod nasycení a odezvu](colour-and-exposure.md), a tam, kde je čisté pod nulou, vybere záporné škály. Viz [Barva a expozice](colour-and-exposure.md#the-ramp-editor).

Použijte odezvu hustoty *Lineární*, když záleží na velikosti rozdílu: je to jediná odezva, kde stejná barva znamená stejný počet.

## Pro vývojáře {#for-developers}

Každý řádek dostane znaménko +1, −1 nebo 0 ve vertex shaderu ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); 0 odmítne řádek dřív, než se nakreslí jakýkoli fragment.

- Podle skupiny pochází znaménko z tabulky skupin se 4 096 položkami indexované id skupiny řádku (id skupiny jede ve čtvrtém kanálu pozičního texelu řádku).
- Podle kategorie pochází znaménko z druhé tabulky se 4 096 položkami, plněné pro každou hodnotu kategorie; hodnota řádku se čte z filtrační textury sloupce; hodnota za koncem tabulky se odmítne na obou backendech.
- Podle rozsahu se hodnota řádku porovná s oběma rozsahy.

Změna rozdělení restartuje akumulaci.

**Skryté skupiny zůstanou skryté při každém rozdělení.** Při rozdělení podle sloupce tabulka skupin už nenese znaménka; drží 1 pro zobrazenou skupinu a 0 pro skrytou ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), a obě tabulky se dostanou do shaderu společně – dva řádky jedné textury znamének na WebGL2, dvě poloviny jednoho storage bufferu na WebGPU. Řádek se kreslí jen tehdy, když je jeho skupina zobrazena *a* jeho hodnota sloupce je na některé straně. Skupina odškrtnutá v [Seznamu týmů](teams-list.md), nebo vynechaná zaměřením strany na záložce Zápas, tedy nepřispívá nic, ať se rozdíl rozděluje jakkoli.

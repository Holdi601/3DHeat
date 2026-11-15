---
title: "Statistiky trati"
parent: "Analýza závodu"
nav_order: 57
lang: "cs"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Statistiky trati

Nahrajete mnoho kol jedné trati a prohlížeč spočítá chyby: která zatáčka stojí nejvíc času, v kolika kolech se tam něco pokazilo a proč. Použijte to k nalezení zatáčky, které se vyplatí věnovat tréninku.

Vyzkoušejte to: **Ukázková kola** dají tři kola, dost na to, aby se tato sekce zobrazila.

![Statistiky trati s mapou chyb: trať obarvená podle toho, v kolika kolech se v každé zatáčce ztratil čas, a seznam zatáček](../assets/img/en/race-course-mistake-map.webp)

Nahrajte celou složku trati – desítky kol, více vozů, více výkonnostních tříd – a každé kolo se ohodnotí a pak spočítá. Tato stránka popisuje srovnání podle třídy, co se počítá jako chyba, sekci **Statistiky trati**, mapu chyb, export do teplotní mapy, tratě z více okruhů a výkonnostní limity při mnoha kolech.

## Proti nejlepšímu ze své vlastní třídy {#against-the-best-of-its-own-class}

Kolo se srovnává zatáčku po zatáčce s **nejrychlejším úplným kolem své vlastní výkonnostní třídy** (referencí, v třídě reference). Samo kolo se srovnává s tím, kdo ze své třídy projel danou zatáčku nejrychleji, nebo s každým kolem, když je ve třídě samo. Vozy se seskupují podle výkonnostní třídy hry (ve Forze D až X; C a S2 jsou dvě z nich). Bod brzdění vozu třídy C vedle vozu S2 o řízení nic neříká. Mapa času, rozdíly v seznamu kol a tabulka *Zatáčka po zatáčce* používají stejné srovnání (viz [s kterým kolem se každé kolo srovnává](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statistiky vycházejí z analýzy každého kola, ne vedle ní.

## Co se počítá jako chyba {#what-counts-as-a-mistake}

**Výskyt** je chyba jednoho kola v jedné zatáčce (úseku). Chyby kola v zatáčce jsou:

1. **Řidičská příčina**, kterou analýza tam pro jeho ztrátu našla. Nález je ztráta, přičtená řidiči (ne vozu nebo situaci), která stojí **0,05 s** nebo víc oproti jeho srovnávacímu kolu. Jeho cena je ztráta v zatáčce.
2. **Každá chyba ovládání vozu**, kterou tam kolo udělalo a druhé kolo ne (nesdílená), a která stojí **0,03 s** nebo víc: zablokování, protáčení, ujetí zádě, tlačení přídě, smyk. Její cena je cena události samotné.
3. **Každý náraz a každá nehoda**, sdílené nebo ne, ať stojí cokoli.

V jedné zatáčce jich může být více; každý druh se počítá **jednou na kolo a zatáčku**. Zisky, podíl vozu a pomalejší příjezd způsobený zatáčkou před ní chybami nejsou.

### Od nálezů k chybám {#from-findings-to-mistakes}

| Nález | Chyba |
|---|---|
| příliš rychle dovnitř, pomalu ven, s brzděním o několik metrů později než druhé kolo | Příliš pozdní brzdění |
| brzdilo brzy | Příliš brzké brzdění |
| brzdilo jemně | Příliš slabé brzdění |
| zablokování jako příčina | Zablokované kolo |
| jelo se bez pedálů | Jízda bez pedálů |
| přilnavost k dispozici, pomalejší k vrcholu, brzdilo tam, kde druhé jen ubralo | Příliš pomalu středem zatáčky |
| příliš těsná stopa | Příliš těsná stopa |
| tlačení ven | Tlačení přídě ven |
| vůz se natočil méně / příliš daleko | Špatně natočený vůz |
| na výkonu později, na plný plyn později, váhalo | Pozdě na plynu |
| pomalejší výjezd ze zatáčky | Pomalejší výjezd |
| protáčení kol | Protáčení kol |
| záď ujela, smykem středem zatáčky | Ujetá záď |
| jelo se příliš široko | Široko na výjezdu |
| ztrácená rychlost | Ztracená rychlost |
| ubrání plynu (na nájezdu, nebo na rovince) | Ubrání plynu |
| téměř zastavení, otočka, náraz nebo nehoda jako příčina | Hodiny / Náraz / Nehoda, když to řeknou události kola tam (nejdřív nehoda, pak otočka, pak náraz); jinak Téměř zastavení |
| delší let | Příliš dlouhý skok |

Oba vzory se počítají jako příčina, která je v nich obsažena, podle téže tabulky. *Na nájezdu se dalo víc, než výjezd vrátil* je chyba příčiny jejich nájezdu: brzké brzdění je *Příliš brzké brzdění*, zablokování *Zablokované kolo*, jízda bez pedálů *Jízda bez pedálů*, nevyužitá přilnavost *Příliš pomalu středem zatáčky*. *Příliš rychle dovnitř, pomalu ven* je *Příliš pozdní brzdění*, pokud kolo brzdilo později než druhé; jinak je to chyba příčiny jejich výjezdu – *Pozdě na plynu*, *Protáčení kol*, *Ujetá záď*, *Široko na výjezdu*, *Pomalejší výjezd*. Vzor, jehož příčina je na straně vozu, nebo pomalejší příjezd, se nepočítá.

Nepočítá se: pomalejší příjezd, start, každý nález o *voze* (tah, přilnavost, brzdy, pohon) a každý zisk nebo rovná zatáčka.

### Druhy, v jejich pořadí {#the-kinds-in-their-order}

Brzdění: *Příliš pozdní brzdění*, *Příliš brzké brzdění*, *Příliš slabé brzdění*, *Zablokované kolo*. Vjezd: *Jízda bez pedálů*, *Příliš pomalu středem zatáčky*, *Příliš těsná stopa*, *Tlačení přídě ven*, *Špatně natočený vůz*. Výjezd: *Pozdě na plynu*, *Pomalejší výjezd*, *Protáčení kol*, *Ujetá záď*, *Široko na výjezdu*, *Ztracená rychlost*. Rovinka: *Ubrání plynu*. Incidenty: *Hodiny*, *Náraz*, *Nehoda*, *Téměř zastavení*, *Příliš dlouhý skok*.

## Sekce Statistiky trati {#the-course-statistics-section}

Zobrazí se od **3** kol, mezi **Kola** a **Kde se zlepšit**.

- **Souhrn**: „40 kol ve 9 vozech, 3 třídy: každá zatáčka ohodnocena proti nejrychlejšímu kolu své třídy.“ (vozy se počítají podle čísla vozu, nebo podle jména).
- **Čipy tříd** (při více třídách): **Vše** a jeden čip na třídu, každý s počtem kol, v pořadí hry (D, C, B, A, S1, S2, R, X, pak ostatní). Kliknutím na třídu se ukážou jen její kola; **Shift+klik** přidá nebo ubere jednu. Vše níže – seznamy, mapa, export do teplotní mapy – se řídí vybranými třídami.
- **Co se nejčastěji nedaří**: každý druh chyby, nejdřív ten, u kterého je nejvíc kol (pak nejvíc výskytů, pak největší cena), nejvýš 8 (**Zobrazit všech N druhů** ukáže zbytek, **Méně** je zase skryje). Každý řádek: jeho název, „N z M kol“, pruh tohoto podílu a „K×, asi X s, nejvíc v T3 (5), T7 (4), T1 (2)“ – jak často se udělala (kolo podle zatáčky), kolik stála dohromady a tři zatáčky, kde ji udělalo nejvíc kol. **Kliknutí na řádek** ji ukáže na mapě chyb (a mapu zapne); dalším kliknutím se ukážou všechny chyby.
- **Zatáčka po zatáčce** (nebo *Zatáčka po zatáčce – <chyba>*, když je zvolena jedna): pro každý úsek „N z M ztratilo čas · X s“ – kola, která projela celou zatáčku, ta, která tam ztratila **0,05 s** nebo víc oproti nejlepšímu ve své třídě, a veškerý čas, který ztratila. Sbalená ukazuje své tři nejčastější chyby s počtem kol. **Kliknutí na zatáčku** ji otevře, zarámuje kamerou a přepne na mapu chyb: pro každou chybu (nebo jen pro vybranou) řádek typu „12 z 40 kol zde brzdilo příliš brzy. V 9 různých vozech – asi 0,21 s každé.“ a kola, která ji udělala, **nejhorší jako první**, každé s cenou – nejvýš 8, „+N dalších“ pro zbytek. **Kliknutí na kolo** ho zaostří a přehraje tu chybu (zarovnanou 40 m před ní).
- **Zobrazit v teplotní mapě**: viz níže. Během běhu se ukazuje „Vytváření teplotní mapy…“; když nejsou žádné chyby, je tlačítko nedostupné.

## Mapa chyb {#the-mistake-map}

**Pohled → Mapa chyb** vykreslí podél referenční dráhy, kolik z kol (vybraných tříd) udělalo chybu na každém metru – každého druhu, nebo té jedné vybrané ve statistikách. Každé kolo se počítá na metr jednou; rozsah každého výskytu (kde byla jeho příčina nebo událost) se rozšíří o 6 m na obě strany, aby se i krátký výskyt ukázal. Šířka a jas rostou tam, kde chybovalo víc kol: šířka `3 + 10 · (kola tady / nejvíc kol kdekoli)` metrů, barva od matného hnědé po jasně oranžovou; šedý pruh 2 m tam, kde nikdo nechyboval. Legenda: *málo kol ↔ nejvíc kol*.

Když jsou **Popisky** zapnuté, nese vrchol každé zatáčky svou nejčastější chybu: „T3 · 12/40 brzké brzdění“ (kola, která chybovala / kola, která zatáčku projela), „T3 · 12/40“ s jedním vybraným druhem, „T3 · bez chyby“, když žádný. Najetí myší na popisek vypíše ztráty zatáčky a jejích pět nejčastějších chyb; kliknutí na něj otevře nebo zavře tu zatáčku ve statistikách.

## Zobrazit v teplotní mapě {#show-in-the-heatmap}

**Zobrazit v teplotní mapě** předá totéž záložce teplotní mapy jako datovou sadu s názvem „Chyby na trati <trať>“ (nebo „Chyby na trati“), takže celá sada nástrojů teplotní mapy – druhy tepla, filtry, časová osa, řezy – funguje nad tím, kde kola chybují.

Je to CSV sestavené v paměti (`mistakeTable`), jeden řádek na každý bod mřížky (každé 2 m) každého výskytu, na **vlastní pozici kola** v tom místě:

| Sloupec | Obsah |
|---|---|
| `x`, `y`, `z` | pozice kola v tom metru (herní souřadnice) |
| `elapsed` | čas kola v tom místě, s |
| `lap` | označení kola |
| `car` | název vozu (nebo „car 1234“) |
| `mistake` | název chyby v aktuálním jazyce |
| `car_class` | třída, `-` když žádná |
| `corner` | označení zatáčky, `T3` |
| `cost` | cena výskytu, s |

Načte se přes vlastní načítač teplotní mapy s nápovědami k mapování: osa Y nahoru, bez převrácení os, měřítko 1; čas `elapsed` v sekundách; **osoba** = `car`, **skupina** = `mistake`, **relace** = `lap`; bez směru pohledu; `car_class`, `corner` a `cost` zůstanou jako filtrační sloupce. Záložka pak přepne na **Teplotní mapu** a zarámuje data. Exportují se jen třídy vybrané ve statistikách.

## Tratě z více okruhů {#courses-from-several-tracks}

Kola se analyzují **vždy po jedné trati**. Složka s koly z více tratí – celá knihovna kol – nabídne každou trať k načtení zvlášť (s počtem jejích kol, nejvíc napřed); kola z jízd, které nikdy nedojely (`unfinished/` z FH Companion), patří ke své trati a jsou označena *částečná*. Kola z více pojmenovaných tratí vybraných jako soubory se nabízejí stejně; kola bez názvu trati patří k té, která je vybrána. Načtení kol jiné pojmenované trati, než jaké jsou načtené, je nahradí. Podrobnosti: [Načítání kol](race-loading-laps.md#folders-and-courses).

## Výkon při mnoha kolech {#performance-with-many-laps}

Desítky kol se analyzují za sekundu nebo dvě (vždy všechna). Vykreslované věci jsou omezené, aby pohled držel snímkovou frekvenci:

| Limit | Hodnota | Účinek |
|---|---|---|
| kola vykreslená ve výchozím stavu | 8 (`SHOW_ALL_UP_TO`) | nad 8 načtených kol se nově přidaná kola skryjí, pokud nejsou referencí, zaostřeným kolem nebo nejlepším ve své třídě. **Zobrazit vše** vykreslí každé kolo; **Jen prohlížená** se vrátí zpět. Zaostření kola ho odkryje i s nejlepším kolem jeho třídy |
| prosté vozy a tenké čáry | přes 10 viditelných (`PLAIN_PAST`) | kola jiná než zaostřené, sledovaný vůz a reference: bod čáry každých 6 m (místo 1,5 m), vozy vykresleny prostě |
| kola v grafech | 8 (`CHART_LAPS`) | zaostřené, nejlepší ze třídy a reference jako první; „+N dalších vykresleno, bez grafu“ |
| karty HUD | 6 | prvních šest viditelných kol |
| statistiky | od 3 kol | sekce se pod tím skryje |
| vypsané nálezy | 12 řidičských, 8 vozových/kontextových, 10 zisků | na zaostřené kolo |
| zobrazené dvojice vozů | 3 | nad 3 dvojice jedna dvojice s výběrem |

Výskyty chyb se spočítají jednou na analýzu a uloží do mezipaměti; hustota mapy chyb se ukládá do mezipaměti podle výběru třídy a chyby.

## Pro vývojáře {#for-developers}

Kód: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` v [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).

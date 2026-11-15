---
title: "Načítání souborů"
parent: "Jak nahrát data"
nav_order: 1
lang: "cs"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Načítání souborů

Tato stránka ukazuje, jak dát 3DHeat své soubory a co s nimi dělá. Přetáhnete složku a ta vybere soubory, které obsahují pozice, a sloučí je do jednoho obrazu.

1. Otevřete **Zdroj** nahoře v postranním panelu Teplotní mapy.
2. Přetáhněte soubory nebo složku na přetahovací plochu, nebo stiskněte **Soubory…** nebo **Složka…**.
3. Přečtěte řádek výběru a **Odhad paměti** (viz obrázek níže).
4. Stiskněte **Načíst**.

![Panel Zdroj poté, co se přetáhla složka deseti zápasů: 1 řádek výběru, 2 Odhad paměti u „vejde se“, 3 Načíst 10 souborů](../assets/img/en/loading-files-source.webp)

*Po přetažení složky vám 3DHeat řekne, co našel a jestli se to vejde.*

Soubory se načítají v panelu **Zdroj** nahoře v postranním panelu záložky Teplotní mapa. Všechno vybrané najednou se stane **jednou** datovou sadou.

## Výběr souborů {#choosing-files}

| Ovládací prvek | Co dělá |
|---|---|
| **Přetáhněte sem soubory nebo složku** (přetahovací plocha) | Přetáhněte libovolnou směs souborů a složek. Složky se procházejí rekurzivně. Kliknutí na přetahovací plochu otevře stejný výběr jako **Soubory…**. |
| **Jeden soubor…** | Výběr souboru pro jeden soubor. |
| **Soubory…** | Výběr souborů, který přijme několik souborů. |
| **Složka…** | Výběr složky (výběr `webkitdirectory` v prohlížeči); nabídne se každý soubor ve stromu složky. |

Výběry přijmou typy souborů z [seznamu načitatelných souborů](data-formats.md#files). Stručně: `.parquet`/`.pq` se čtou jako Parquet, `.csv`/`.tsv`/`.txt` jako text s oddělovači, `.acmi` (Tacview), OCAP `.json`/`.json.gz` a formáty GPS (GPX, KML, KMZ, NMEA, IGC, FIT) jdou přes své vlastní čtečky, a kontejnery zápasů `.3dheat` se načtou jako tabulky, které obsahují ([Jeden soubor na zápas](container.md)). Kontejner, který nejde přečíst, se přeskočí jako *není soubor csv/parquet*.

Přetažené složky se procházejí do hloubky 12 úrovní a nejvýš 20 000 souborů, jako ochrana proti smyčkám symbolických odkazů a nekonečným stromům.

## Které soubory se ponechají {#which-files-are-kept}

Dřív než se cokoli čte, se výběr vyfiltruje ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Soubor s jinou příponou se přeskočí: *není soubor csv/parquet*.
- Soubor o velikosti 0 bajtů se přeskočí: *prázdný (0 bajtů)*.
- **Doprovodné soubory konvertorů** – surová data, která konvertor drží vedle tabulky zápasu, `<zápas>.messages.parquet`, `.events.parquet`, `.raw.parquet` a další vypsané v [Konvertory si nechávají všechno](converters.md) – se přeskočí: *doprovodný soubor konvertoru*. Chcete-li jeden otevřít, vyberte nebo přetáhněte jen ten (nebo jen doprovodné soubory): výběr sestávající pouze z doprovodných souborů je načte jako jakoukoli tabulku. JSON vedle tabulky (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` a `.hints.json`) se nikdy nenabídne jako pozice.
- **Pravidlo souborů pohybu.** Pokud má kterýkoli soubor ve výběru název `movement*.parquet`, `movement*.csv` (a další přípony) – `movement.parquet`, `movement_1.parquet` a tak dál – přeskočí se každý další datový soubor: *není soubor pohybu, a tato složka má soubory pohybu*. Exporty telemetrie často obsahují jednu tabulku pozic vedle desítek tabulek bez pozic a kreslit lze jen tu první. Složka bez jakéhokoli souboru pohybu načte všechny své datové soubory. Příklad: složka se soubory `movement_1.parquet`, `kills.parquet` a `shop.parquet` načte `movement_1.parquet`; ostatní dva jsou uvedeny jako přeskočené. Příklad: složka se soubory `movement_1.parquet`, `kills.parquet` a `shop.parquet` načte `movement_1.parquet`; ostatní dva jsou uvedeny jako přeskočené.
- Ponechané soubory se řadí podle své cesty uvnitř výběru, takže stejná složka vždy dá stejnou datovou sadu a stejné barvy.

Panel pak ukáže výběr (název jednoho souboru, nebo `složka (N souborů)` podle nejdelší společné složky), počet souborů, jejich celkovou velikost a celkový počet řádků – přesně, když jsou všechny soubory Parquet, označený `≈`, když je některý CSV. Přeskočené soubory jsou uvedeny s důvodem, prvních čtyři jmenovitě.

## Čtení schématu {#reading-the-schema}

**První** soubor výběru se otevře, aby se popsalo schéma („Čtení schématu“): jeho názvy sloupců, jeho prvních 50 datových řádků, které sloupce vypadají jako čísla, a u Parquetu logický typ každého sloupce a položka patičky `heat3d`. Složka exportů jedné tabulky sdílí jedno schéma, takže jeden soubor zastupuje všechny. Pak se změří každý soubor („Počítání řádků“): patička Parquetu dá přesný počet v jednom malém čtení; počet u CSV se odhadne z průměrné délky řádku v jeho prvním megabajtu.

Panel [Mapování sloupců](column-mapping.md) se otevře s automaticky navrženými odhady a [odhad paměti](memory-and-budgets.md) se objeví nad tlačítkem **Načíst**.

## Zprávy před načtením {#messages-before-loading}

Pod výběrem panel vypisuje z [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Chyby** (červeně) – načtení nemůže začít: méně než dvě osy pozice, stejný sloupec na dvou osách, namapovaný sloupec, který v souboru není, sloupec pozice, který nevypadá jako číslo, sloupec času, jehož vzorkované hodnoty jsou text, zatímco jednotka je číslo (každý řádek by se načetl jako NaN a skončil by v čase 0), sloupec času nastavený na ISO-8601, z jehož vzorkovaných hodnot se žádná nedá přečíst jako datum, a měřítko jednotek 0.
- **Varování** (oranžově) – načte se, ale pravděpodobně ne tak, jak bylo myšleno: sloupec skupiny, který na většině vzorkovaných řádků nabývá jiné hodnoty (je tedy id, ne skupina), sloupec času `DATE` (každý řádek dne sdílí jeden okamžik), směr pohledu nastavený bez svých sloupců.
- **Poznámky** – co z mapování vyplývá: kreslení v rovině, když je jedna osa nenamapovaná, žádná časová osa bez sloupce času, žádné stopy bez sloupce osoby, a bez sloupce skupiny jedna barva pro všechno a rozdíl, který se může dělit jen podle sloupce ponechaného pro filtrování.

## Načítání {#loading}

Tlačítko **Načíst** čte *Načíst soubor*, *Načíst N souborů*, nebo *Načíst N souborů (1 z K)*, když je nastaven [krok proředění](memory-and-budgets.md#decimation). Čte *Příliš velké – zmenšete nebo prořeďte* a je nedostupné, když kontrola [vejde se](memory-and-budgets.md#the-fit-check) říká, že se načtení nevejde; je také nedostupné, když mapování má chyby nebo běží jiné načítání.

Během načítání panel ukazuje aktuální krok (s `[soubor/soubory]` před ním, když je souborů víc), dosud přečtené řádky, ukazatel průběhu a **Zrušit**. Zrušit ukončí worker příjmu a s ním i všechny workery parseru, které spustil.

Stránka se během načítání dál vykresluje, protože práce běží na pozadí. Vidíte aktuální krok, přečtené řádky, ukazatel průběhu a **Zrušit**. Po posledním souboru panel ukáže kroky *Řazení řádků podle času*, *Přeuspořádání sloupců (n z m)*, *Měření rozsahu*, *Sestavování seznamu*, *Shrnutí relací* a *Výpočet životností* a pak *Nahrávání N řádků na GPU* po jeden snímek, aby se dlouhé nahrávání nikdy nepletlo se zamrznutím.

### Jak to funguje {#how-it-works}

Načítání běží ve Web Workeru ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Při několika souborech a více než jednom [vlákně parseru](memory-and-budgets.md#parser-threads) se až tolik souborů parsuje **současně**, každý ve svém vlastním workeru parseru ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), pokud to rozpočet paměti RAM dovolí; slučují se pak stále jeden po druhém v pořadí výběru, takže datová sada je stejná jako při načítání jeden po druhém. Zatímco jich běží několik, řádek průběhu jmenuje soubor, který naposledy ohlásil, a ukazatel i počet řádků sečtou každý soubor v běhu. S jedním vláknem, nebo u jediného souboru, se soubory parsují jeden za druhým přímo v samotném workeru příjmu. Čtou se jen sloupce, které mapování jmenuje: nenamapovaný sloupec souboru Parquet nic nestojí; CSV se prochází bajt po bajtu, ale dekódují se jen namapovaná pole.

## Několik souborů se stane jednou datovou sadou {#several-files-become-one-dataset}

Když se načte více než jeden soubor ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Jeden seznam.** Osoby, skupiny, relace a hodnoty kategorií jsou slovníky sdílené přes všechny soubory, takže týž hráč ve dvou exportech je jedna osoba s jednou stopou.
- **Jeden začátek času.** Časy se při slučování drží jako 64bitové sekundy a přepočtou se k nejdřívějšímu času *celého* výběru, pak se ukládají jako 32bitové sekundy od tohoto začátku. Čtyři exporty ze čtyř odpolední se seřadí do svého skutečného pořadí, ne se navrší jeden na druhý.
- **Jedno pořadí času.** Řádky ze všech souborů se seřadí podle času radixovým třízením (viz [limit třídění](memory-and-budgets.md#the-sort-ceiling)).
- **Sloupec `Source file`.** Každý řádek si pamatuje, ze kterého souboru pochází, jako sloupec kategorie s názvem `Source file`. Objeví se v [Filtrech](filters.md) a jako *Source file – porovnání dvou načtení* v [rozdílovém rozdělení](difference.md). Načtení jednoho souboru ho nedostane – konstantní sloupec by stál 4 bajty na řádek, aby neřekl nic.
- **Chybějící sloupce.** Soubor, kterému chybí jeden ze sloupců *filtru*, prostě nepřispěje hodnotami. Soubor, kterému chybí namapovaný sloupec *role* (X, čas, osoba, ...), selže s *soubor nemá sloupec „název“*; při načítání více souborů se tento soubor přeskočí, ostatní se načtou dál, a přeskočené soubory jsou uvedeny u datové sady. Načtení jednoho souboru, které selže, nahlásí chybu.
- **Varování o nedostatku.** Když je načteno méně než 95 % řádků, které se předtím spočítaly, datová sada nese varování s chybějícím podílem – z nečitelných souborů, nebo z řádků bez použitelné pozice, které se na vstupu zahodí.

## Po načtení {#after-loading}

Nová datová sada nahradí předchozí. Při každém načtení ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- všechny filtry a viditelnost skupin se vymažou;
- rozdílové rozdělení podle skupiny se resetuje: první polovina skupin (zaokrouhleno nahoru) kladná, zbytek záporný;
- poloměr spritu se nastaví na vodorovný rozsah / 120 a sytost na analytický odhad; velikost krychle, délka paprsku pohledu, rychlost letu a roviny near/far se nastaví podle rozsahu (viz [Relace, osoby a skupiny](sessions-persons-groups.md#entity-size));
- relace boxového přehrávání se nastaví na relaci s nejvíc řádky;
- trasy čárového tepla se znovu odhadnou ([Čárové teplo](line-heat.md));
- režim pohledu se vrátí na **Teplo**, pokud aktuální režim nová data nepodporují; časová osa se vrátí na **Vše**, když chybí sloupec času, a historie na **Kumulativně**, když chybí životnosti;
- hlava přehrávání se zastaví na začátku a přehrávání se zastaví;
- kamera zarámuje celou datovou sadu z výchozího směru (dívá se podél -Z, nakloněná asi o 36° dolů).

Panel **Datová sada** pak ukazuje název datové sady (výběr, počty řádků a souborů a krok, když se použil), `N týmů · N osob · Ns rozpětí` a každé varování, které načtení vyvolalo, oranžově, dokud je datová sada načtená. **Uvolnit** v tomto panelu datovou sadu odstraní.

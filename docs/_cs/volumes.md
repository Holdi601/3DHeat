---
title: "Objemy a porovnání"
parent: "Filtry a nástroje"
nav_order: 6
lang: "cs"
source: "volumes.md"
source_hash: "25cc132dbe25"
translated: true
outdated: false
---

# Objemy a porovnání

**Objem** je neviditelný kvádr (nebo válec, nebo koule), který nakreslíte kolem místa, abyste se zeptali: co se uvnitř stalo? Použijte ho k počítání zabití u mostu, k porovnání dvou kopců nebo k zobrazení jen aktivity v jedné oblasti.

```
 pohled shora             Nakreslíte tvar ->  prohlížeč spočítá
 +------------+           co je uvnitř:
 |   ( A )    |            řádky, hráči, zabití, čas ...
 |        [B] |           Porovnejte A s B, vedle sebe.
 +------------+
```

![Tři objemy v ukázkovém údolí: dva válce kolem kopců, kvádr kolem vesnice](../assets/img/en/volumes.webp)

Objemy měří, co se uvnitř nich děje, filtrují pohled na ně, exportují své řádky a dají se porovnat vedle sebe. Pojmy řádek, osoba a zápas jsou ve [slovníčku](glossary.md).

## Nakreslení objemu {#draw-a-volume}

1. V postranním panelu otevřete **Objemy**.
2. Vyberte nástroj a kreslete v 3D pohledu nebo na 2D mapě. Podlaha a strop začínají od dat pod nimi. Esc zruší.
3. Kliknutím na objem jej vyberete; objeví se jeho **Statistiky**.

| Nástroj | Jak kreslit |
|---|---|
| **Kvádr** | Přetáhněte obdélník (Shift: čtverec). Kliknutí umístí výchozí kvádr. |
| **n-úhelník** | Přetáhněte od středu (Shift ho udrží pravidelný). *Rohy* nastaví n od 3 do 64 (výchozí 8, takže tlačítko ukazuje **8-úhelník**). |
| **Mnohoúhelník** | Klikejte na rohy; uzavřete dvojklikem, Enterem nebo kliknutím na první roh. Backspace odstraní poslední roh. |
| **Válec** | Přetažením nastavíte poloměr. |
| **Koule** | Přetažením nastavíte poloměr; spočívá na zemi. |

## Úpravy {#edit}

- Kliknutím na objem jej vyberte. Tažením jeho těla jej přesunete, tažením rohů tvar změníte (Shift na rohu škáluje).
- **Žluté** úchyty nastavují podlahu a strop, **azurový** úchyt jej otáčí.
- Alt+tažení kopíruje, Del odstraní, Ctrl+Z / Ctrl+Y vrací zpět a znovu, Ctrl+D duplikuje. **Odebrat vše** smaže všechny objemy.
- Přesné hodnoty: Podlaha, Strop, Otočení / Sklon / Náklon (kvádry), Poloměr (koule, válce).

Každý řádek objemu má zaškrtávátko zobrazení, barvu, název, **zahrnout** nebo **vyloučit**, duplikovat a smazat. Objemy se ukládají v prohlížeči pro každou datovou sadu a **Uložit...** / **Načíst...** zapisují a čtou soubor `volumes.json`.

## Filtrování pohledu {#filter-the-view}

| Filtr | Účinek |
|---|---|
| **Zobrazit vše** (výchozí) | Objemy jen měří. |
| **Jen uvnitř** | Teplo, přehrání a [analýza zásahů](hit-analysis.md) kreslí jen to, co je uvnitř zahrnutých objemů a venku z vyloučených. |
| **Skrýt vnitřek** | Opak. |

Filtr GPU zvládne nejvýš 8 objemů s 64 body obrysu celkem; objem nad tuto mez je označen „!“. Statistiky a export jej stále počítají.

## Statistiky {#statistics}

Oblast **Statistiky** se řídí filtry, časovým oknem a skrytými skupinami. *Vybraný* ukazuje vybraný objem, *Porovnat vše* postaví všechny objemy vedle sebe. Ukazuje:

- **Řádky uvnitř (zobrazené)** a **Řádky uvnitř (všechna data)**, **Hráči**, **Týmy**, **Zápasy**, **Čas uvnitř**, **Vstupy / výstupy**, **Špičkové teplo**, **Střední teplo**, **Objem / půdorys** a histogram **Kdy**;
- u každého sloupce: kategorie s **Lift** (podíl uvnitř dělený podílem ve všech zobrazených datech), a čísla s rozsahem, mediánem a 5.-95. percentilem.

**Statistiky jako CSV / JSON** je uloží. **Exportovat data uvnitř** zapíše řádky uvnitř jako CSV nebo Parquet (ve výchozím nastavení *Jen zobrazené řádky* zapnuto), jeden objem nebo všechny se sloupcem, který říká, který objem drží který řádek.

## Porovnání objemů {#compare-volumes}

Se dvěma nebo více viditelnými objemy stiskněte **Porovnat...**.

1. Nakreslete tři objemy, například Západní kopec, Východní kopec a Vesnice.
2. Stiskněte **Porovnat...** pod Statistikami.
3. V **Tabulka** čtěte rozdíl každé hodnoty od prvního objemu.
4. Přepněte na **Sloupce**, abyste viděli podíly jako sloupce.

![Tabulka Porovnání objemů: řádky, čas uvnitř, hráči a další pro každý objem, s rozdílem od prvního](../assets/img/en/compare.webp)

| Pohled | Ukazuje |
|---|---|
| **Tabulka** | Řádky, čas uvnitř, hráči, zápasy, týmy, vstupy, výstupy, návštěvy, délku návštěvy, zabití, smrti, zabití na smrt, zabití za minutu, čas na hráče, hodnotové sloupce; seskupené podle událostí, třídy vozidla, hráče nebo AI, týmu a směru. Každá hodnota ukazuje svůj rozdíl od prvního objemu a velikost efektu (zanedbatelný, malý, střední, velký). Kliknutím na záhlaví objemu seřadíte podle vzdálenosti od prvního. |
| **Sloupce** | Počty nebo podíly podle události, třídy, aktéra, týmu nebo směru. Kliknutím na sloupec filtrujete pohled na něj. |
| **Během zápasu** | Jeden graf na objem přes minuty zápasu: přítomnost, řádky nebo zabití. Kliknutím tam přeskočíte. |
| **Návštěvy** | Krabicové a houslové grafy, jak dlouho návštěvy trvají (logaritmická stupnice). |
| **Tok** | Kam tratě směřují po opuštění každého objemu: matice přechodů nebo toky. |

![Pohled Sloupce: druhy událostí na objem jako podíly](../assets/img/en/compare-bars.webp)

## Tipy {#tips}

- Začněte od zjištění: v [Zjištěních](insights.md) přidá **Objem zde** válec kolem místa nálezu.
- **Rozpis...** otevře [Rozpis](breakdown.md) pro vybraný objem: kdo a co si uvnitř vede nejlépe.
- [Směrové teplo](directional-heat.md) umí vykreslit směry uvnitř vybraného objemu.
- [karta Vozidla](hit-analysis.md#restrict-to-an-area) používá tytéž objemy jako svůj filtr oblasti.

---
title: "Rezidence paměti GPU"
parent: "Vnitřní fungování vykreslování"
nav_order: 5
lang: "cs"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Rezidence paměti GPU

Grafická karta má jen určitou paměť. Když se vaše data nevejdou, prohlížeč ukáže, co se vejde, a řekne to: přehled statistik dostane jantarový řádek **Není v paměti** s počtem řádků, které se vynechaly. Zkrácená datová sada, která vypadala úplně, by byla nejhorší chyba, jakou může analytický nástroj udělat, takže tento řádek se nikdy neskrývá.

![Přehled statistik s jantarovým řádkem Není v paměti](../assets/img/en/gpu-memory-not-resident.webp)

Abyste se vešli víc, zvyšte rozpočet GPU v **Rozpočtech prostředků** a načtěte znovu ([Paměť a rozpočty](memory-and-budgets.md#raising-the-gpu-budget)), nejdřív data zúžte, nebo použijte kartu s větší pamětí.

## Pro vývojáře {#for-developers}

### Jak se řádky ukládají na GPU {#how-rows-are-stored-on-the-gpu}

Řádky se nahrají jednou, když přijde datová sada, v **blocích** po 8 388 608 řádcích (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Každý blok se kvantuje vůči vlastnímu ohraničujícímu obdélníku a časovému rozsahu:

| Data | Formát | Bajtů na řádek |
|---|---|---|
| Pozice X, Y, Z a id skupiny | čtyři 16bitová celá bez znaménka (RGBA16UI na WebGL2); X, Y, Z uvnitř ohraničujícího obdélníku bloku | 8 |
| Čas a životnost (když datová sada má čas i osobu) | dvě 16bitová celá bez znaménka (RG16UI): čas uvnitř časového rozsahu bloku; životnost, kde 65 535 znamená „žádný další vzorek“ | 4 |

Ohraničující obdélníky bloků jsou to, co dělá 16 bitů dostatečné: blok obvykle pokrývá zlomek mapy, takže krok kvantizace je na mapě široké kilometry hluboko pod centimetr, daleko pod šumem skutečné telemetrie. Id skupiny, které jede ve čtvrtém kanálu, je zadarmo, a proto může být skupin nejvýše 4 096 ([Skupiny](sessions-persons-groups.md#limits)).

Na WebGL2 je každý blok textura 8 192 texelů široká, doplněná na celé řádky textury; k řádkům se dostává z `gl_VertexID` přes texturu indexů bloků, která se mění každý snímek. Na WebGPU jsou to storage buffery.

Další paměť GPU na řádek, alokovaná podle potřeby:

- každý aktivní sloupcový [filtr](filters.md): 4 bajty na řádek (hodnoty 32bitových float nebo id kategorií), nahraná po blocích při prvním použití filtru;
- [čárové teplo](line-heat.md): 8 bajtů na řádek (začátek každého segmentu, kvantovaný uvnitř ohraničujícího obdélníku dat, a jeho příznaky), dokud je zapnut režim Čáry.

A k tomu cíle vykreslování: barva a hloubka scény, cíl tepla a jeho pomocný dvojník (čtyři kanály v [Týmovém teple](team-heat.md)), vrstvy odstraňování hloubky pro [zakrytí](depth-and-culling.md); a geometrie úrovně.

### Rozpočet se vynucuje při nahrávání {#the-budget-is-enforced-at-upload}

WebGL přijme alokace, které nemůže obsloužit, a pak buď ztratí kontext, nebo spadne na systémovou paměť za zničující cenu, takže se rozpočet GPU vynucuje, když se datová sada nahrává ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- bloky se nahrávají v pořadí (tedy v časovém pořadí), dokud se vejdou;
- první blok, který se nevejde, se nahraje **částečně**: tolik celých řádků textury, kolik se vejde do zbývajícího rozpočtu, místo aby se nenahrál vůbec. Rozpočet, který nepojme celý blok, tak ukáže co nejvíc, a protože řádky jsou seřazeny podle času, je ukázaná část souvislým úsekem času;
- všechno za tím je **není v paměti**.

Nedostatek se neskrývá: přehled statistik ukazuje řádek **Není v paměti** s počtem řádků, které se nevešly, jantarově, kdykoli je to větší než nula. Zkrácená datová sada, která vypadá úplně, je nejhorší chyba, jakou může analytický nástroj mít. [Kontrola, zda se data vejdou](memory-and-budgets.md#the-fit-check) před načtením má tomuto případu předejít.

Rozpočet, který renderer používá, je rozpočet GPU z **Rozpočtů prostředků**, stejná hodnota jako v kontrole, zda se data vejdou. Je i nad zjištěnou hodnotou, až do stropu posuvníku (viz [Zvýšení rozpočtu GPU](memory-and-budgets.md#raising-the-gpu-budget)). Použije se při nahrávání datové sady; změna po něm začne platit až při dalším načtení.

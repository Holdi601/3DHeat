---
title: "Rezidencia pamäte GPU"
parent: "Vnútorné časti renderovania"
nav_order: 5
lang: "sk"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---


# Rezidencia pamäte GPU

Grafická karta má len určitú pamäť. Ak sa vaše dáta nezmestia, prehliadač ukáže, čo sa zmestí, a povie to: prehľad štatistík dostane jantárový riadok **Nie je v pamäti** s počtom riadkov, ktoré vynechal. Skrátená množina dát, ktorá vyzerala úplná, by bola najhoršia chyba, akú môže analytický nástroj urobiť, preto sa tento riadok nikdy neskrýva.

![Prehľad štatistík s jantárovým riadkom Nie je v pamäti](../assets/img/en/gpu-memory-not-resident.webp)

Ak chcete zmestiť viac, zvýšte rozpočet GPU v **Rozpočty zdrojov** a načítajte znovu ([Pamäť a rozpočty](memory-and-budgets.md#raising-the-gpu-budget)), najprv údaje zúžte, alebo použite kartu s väčšou pamäťou.

## Pre vývojárov {#for-developers}

### Ako sa riadky ukladajú na GPU {#how-rows-are-stored-on-the-gpu}

Riadky sa nahrajú raz, keď dataset príde, v **blokoch** po 8 388 608 riadkoch (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Každý blok sa kvantuje voči vlastnému ohraničujúcemu obdĺžniku a časovému rozsahu:

| Údaje | Formát | Bajty na riadok |
|---|---|---|
| Pozícia X, Y, Z a id skupiny | štyri 16-bitové celé bez znamienka (RGBA16UI na WebGL2); X, Y, Z v ohraničujúcom obdĺžniku bloku | 8 |
| Čas a životnosť (keď dataset má čas aj osobu) | dve 16-bitové celé bez znamienka (RG16UI): čas v časovom rozsahu bloku; životnosť, pričom 65 535 znamená „žiadna ďalšia vzorka“ | 4 |

Ohraničujúce obdĺžniky pre každý blok sú to, čo robí 16 bitov dostatočných: blok zvyčajne pokrýva časť mapy, takže krok kvantizácie je výrazne pod centimetrom na mape širokej kilometre, ďaleko pod šumom skutočnej telemetrie. Id skupiny v štvrtom kanáli je zadarmo - a preto môže byť najviac 4 096 skupín ([Skupiny](sessions-persons-groups.md#limits)).

Na WebGL2 je každý blok textúra 8 192 texelov široká, doplnená na celé riadky textúry; k riadkom sa dostane z `gl_VertexID` cez textúru indexov blokov pre každú snímku. Na WebGPU sú to storage buffery.

Ďalšia pamäť GPU na riadok, pridelená pri použití:

- každý aktívny stĺpcový [filter](filters.md): 4 bajty na riadok (hodnoty ako 32-bitové float alebo id kategórií), nahrané po blokoch pri prvom použití filtra;
- [čiarové teplo](line-heat.md): 8 bajtov na riadok (začiatok každého segmentu, kvantovaný v ohraničujúcom obdĺžniku údajov, a jeho príznaky), kým je režim Čiary zapnutý.

Plus cieľe vykresľovania: farba a hĺbka scény, cieľ tepla a jeho pomocný dvojník (štyri kanály v [Teple tímov](team-heat.md)), vrstvy odlupovania hĺbky pre [zakrytie](depth-and-culling.md); a geometria úrovne.

### Rozpočet sa vynucuje pri nahrávaní {#the-budget-is-enforced-at-upload}

WebGL prijme alokácie, ktoré nevie obslúžiť, a potom buď stratí kontext, alebo spadne na systémovú pamäť za katastrofálnu cenu, preto sa rozpočet GPU vynucuje pri nahrávaní datasetu ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- bloky sa nahrávajú v poradí (teda v časovom poradí), kým sa zmestia;
- prvý blok, ktorý sa nezmestí, sa nahrá **čiastočne** - toľko celých riadkov textúry, koľko zostávajúci rozpočet pojme - namiesto toho, aby sa nenahral vôbec, takže rozpočet, ktorý nepojme celý blok, stále ukáže čo najviac; a keďže riadky sú zoradené podľa času, ukázaná časť je súvislý úsek času;
- všetko ďalej je **nie v pamäti**.

Nedostatok sa neskrýva: prehľad štatistík ukazuje riadok **Nie je v pamäti** s počtom riadkov, ktoré sa nezmestili, jantárovou farbou, kedykoľvek je nad nulou. Skrátený dataset, ktorý vyzerá úplný, je najhoršia chyba, akú môže mať analytický nástroj. [Kontrola zmestenia](memory-and-budgets.md#the-fit-check) pred načítaním má tomuto prípadu zabrániť.

Rozpočet, ktorý vykresľovač používa, je rozpočet GPU z **Rozpočty zdrojov**, rovnaké číslo, aké používa kontrola zmestenia - aj nad zistenou hodnotou, až po strop posuvníka (pozri [Zvýšenie rozpočtu GPU](memory-and-budgets.md#raising-the-gpu-budget)). Uplatní sa, keď sa dataset nahrá; ak sa zmení neskôr, prejaví sa až pri ďalšom načítaní.

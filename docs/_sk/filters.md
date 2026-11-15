---
title: "Filtre"
parent: "Filtre a nástroje"
nav_order: 1
lang: "sk"
source: "filters.md"
source_hash: "e957bf788bda"
translated: true
outdated: false
---

# Filtre

**Filtre** skryjú riadky, ktoré nechcete vidieť, napríklad jednu triedu vozidla alebo jeden druh udalosti, a obrázok sa hneď aktualizuje. Panel vypíše stĺpce ponechané pri načítaní pod *Ponechať na filtrovanie* ([Mapovanie stĺpcov](column-mapping.md)), plus *Zdrojový súbor*, keď bolo načítaných viac súborov.

## Vyskúšajte to {#try-it}

1. Načítajte dátovú sadu a na bočnom paneli otvorte **Filtre**.
2. Pod **Trieda vozidla** odškrtnite *Tank*. Obrázok sa hneď zmení.
3. Stlačením **Zrušiť všetky filtre** to vrátite.

![Panel Filtre: najprv stĺpce, ktoré pridáva prehliadač (Typ udalosti, Trieda vozidla), potom stĺpce z vášho súboru](../assets/img/en/filters.webp)

Prvé riadky sú vlastné stĺpce prehliadača (pozri nižšie). Riadky za nimi pochádzajú z vášho súboru.

## Stĺpce, ktoré pridáva prehliadač {#columns-the-viewer-adds}

Pri načítaní prehliadač zistí štyri vlastné stĺpce a vypíše ich **ako prvé**, s názvami a hodnotami vo vašom jazyku, takže rovnaký filter funguje pre každú hru a každý zdroj dát:

| Stĺpec | Hodnoty | Odvodené z |
|---|---|---|
| **Typ udalosti** | 23 druhov: Pozícia, Výstrel, Odpálenie (strela, raketa, bomba), Zásah, Minutie (zbraň skončila blízko žiadneho cieľa), Výbuch, Poškodenie, Zničenie cieľa, Smrť, Zničený, Havária, Katapultovanie, Objavenie, Zmiznutie, Vzlet, Pristátie, Dotyk so zemou, Zastavenie, Prezbrojenie / tankovanie, Obsadenie / cieľ, Návnada, Správa, Iné | stĺpec `event`, `events`, `event_type` alebo `event_name`; slová každej hry (`shot`, `burst`, `fired`, `struck`, `flare`, `plant` ...) sa mapujú na tieto druhy. Úplná tabuľka: [Typy a triedy udalostí](ref-event-types.md). |
| **Hráč alebo AI** | Hráč, AI | stĺpec `ai`, `is_ai`, `bot` alebo `actor`; inak `is_player` / `human`; inak id účtu (`user_id`, `steam_id`; prázdne alebo 0 je AI); pri nahrávkach Tacview, či má objekt pilota |
| **Trieda vozidla** | 17 tried: Stíhačka, Útočné lietadlo, Bombardér, Iné lietadlo, Vrtuľník, Tank, Obrnené vozidlo, Protivzdušná obrana, Delostrelectvo, Nákladné auto / auto, Loď, Ponorka, Pechota, Zbraň, Návnada, Stavba, Iné | názov vozidla alebo jednotky (porovnaný s [katalógom figúrok](figures.md)) a stĺpce typu |
| **Trieda cieľa** | rovnaké triedy | vozidlo druhej strany (`other_vehicle`, `target_vehicle`, `victim_type` ...) |

Vypísané sú len druhy, ktoré sa vyskytujú. Stĺpce hodnôt (`cost_*`, `earn_*`, `net_*` a *Zdroj ceny*, pozri [Váženie hodnôt](value-weighting.md)) sa dajú filtrovať ako ktorýkoľvek číselný stĺpec: napríklad odškrtnutím *odhad* pod *Zdroj ceny* ponecháte len ocenené riadky.

Kategóriový zoznam s viac ako 12 hodnotami dostane vyhľadávacie pole (*Hľadať n hodnôt*) a tlačidlo **Len tieto**, ktoré povolí presne zodpovedajúce hodnoty.

Ktoré stĺpce sa dajú filtrovať, sa rozhoduje pri načítaní, pretože sa musia vtedy prečítať. Ak nie je ponechaný žiadny stĺpec, panel to povie a odkáže na *Ponechať na filtrovanie*.

## Číselné stĺpce (rozsah) {#numeric-columns-range}

![Rozsahový filter (stratené peniaze) s oboma koncami posunutými](../assets/img/en/filters-numeric.webp)

| Časť | Význam |
|---|---|
| Názov a `min ... max` | Stĺpec a aktuálny rozsah (celý rozsah stĺpca, kým nie je nastavený filter). |
| Prvý riadok: políčko na číslo a posuvník | Dolná hranica. Ak posuvník ťaháte nad hornú hranicu, potiahne ju so sebou. |
| Druhý riadok: políčko na číslo a posuvník | Horná hranica. Ak ťaháte pod dolnú hranicu, potiahne aj tú. |
| **Obnoviť *stĺpec*** | Odstráni tento filter. |

Posuvníky pokrývajú minimum až maximum stĺpca v 1 000 krokoch; políčka na číslo prijmú ľubovoľnú hodnotu. Riadok prejde, keď jeho hodnota leží v rozsahu vrátane oboch koncov. Veľké hodnoty sa zobrazujú v exponenciálnom tvare (`1.23e6`).

## Kategóriové stĺpce {#category-columns}

| Časť | Význam |
|---|---|
| Názov a `povolené/celkom` | Stĺpec a koľko jeho hodnôt je povolených. |
| Zoznam hodnôt | Zaškrtávacie políčko pri každej hodnote; prázdna hodnota sa zobrazí ako *(prázdne)*. |
| **Všetko** / **Nič** | Povoliť každú hodnotu / žiadnu hodnotu. |

Povolenie každej hodnoty filter odstráni.

## Pravidlá {#rules}

- **Štyri filtre naraz.** Hlavička ukazuje `aktívne/4`. Piaty filter sa neuplatní a panel to povie. Výber v [Entitách](entities.md) (alebo zameranie hráča v karte Zápas) používa jeden zo štyroch. Filter, ktorý pokrýva celý stĺpec, nepoužíva žiadny.
- **Kategóriový stĺpec má najviac 4 096 hodnôt**; širší sa pri načítaní neponechá.
- **Filtre sa kombinujú pomocou A zároveň** a so zobrazením tímov, rozdelením rozdielu, časovým oknom, orezaním podľa vzdialenosti a [rezom](slice.md).
- **Zmena filtra reštartuje akumuláciu a o niekoľko snímok neskôr znovu zmeria expozíciu**, lebo filtrovanie môže hustotu výrazne zmeniť ([Farba a expozícia](colour-and-exposure.md#auto-exposure)).
- **Zrušiť všetky filtre** odstráni každý filter stĺpca. Zobrazenie tímov a výbery hráčov nastavené inde zostanú.
- Filtre stĺpcov menia režimy tepla. Nemenia figúrky [prehrávania figúrok](box-replay.md), ktoré sledujú zobrazenie tímov a výber v Entitách. Výber v Entitách mení oboje.
- V [teple čiar](line-heat.md) sa filter testuje na riadku, v ktorom segment *končí*.
- Pri každej novej dátovej sade sa všetky filtre vymažú.

## Pre vývojárov {#for-developers}

**Sloty.** Každý aktívny filter zaberá jeden zo štyroch slotov GPU ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), textúru s 4 bajtmi na riadok. Sloty sa pridelia filtrom v poradí, v akom sa naposledy menili ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), zdieľané shaderom aj oboma panelmi). Nad štyri sa zobrazí chyba *Použijú sa len prvé 4 filtre. Zrušte jeden - ostatné sa ignorujú, nie tiško skombinujú*, a názvy ďalších filtrov sa čítajú *stĺpec (neuplatnené)*. Filtre sa spúšťajú na riadok vo vertex shaderi, takže zmena prahu nevyžaduje nové parsovanie ani nové nahratie.

**Filtre, ktoré panel nezobrazuje.** V stave aplikácie existujú ešte dva druhy ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- filter **skupín**, nastavený kartou Zápas, keď zameria jednu stranu. Skryje ostatné skupiny vo všetkých režimoch, aj v [rozdelení rozdielu](difference.md) podľa stĺpca.
- filter **osôb**, nastavený panelom [Entity](entities.md) a kartou Zápas, keď zameria jedného hráča. Obmedzuje prehrávanie figúrok a režimy tepla. V teple je to kategóriový filter nad id osôb a zaberá jeden zo štyroch slotov. Jeho maska drží 65 536 id ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); osoba nad tento limit sa v teple pri aktívnom filtri nekreslí, aj keď je vybraná. Prehrávanie figúrok ju stále zobrazuje.

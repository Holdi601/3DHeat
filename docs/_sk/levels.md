---
title: "Levely a geometria pozadia"
nav_order: 16
has_children: true
lang: "sk"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Levely a geometria pozadia

Level je 3D miesto, kde sa hra odohrala - mapa, mesto, trať. Keď ho dáte za svoje dáta, vidíte, *kde* je teplo. Panel **Pozadie / level** (pozri [Slovník pojmov](glossary.md) pre „level“) dáva tri druhy kontextu:

- **obrázok mapy**, georeferencovaný dvoma kotvami - pozri [Obrázky máp](map-images.md);
- **3D level** - `.glb`, `.gltf`, `.obj`, `.stl` alebo `.ply` - rozdelený na zem, stavby a vodu a pri importe zjednodušený - pozri [3D levely](model-levels.md) a [Vzhľad levelu](level-appearance.md);
- **pozadie sveta** - pre záznam, ktorý hovorí, kde na zemi je (súbor Tacview ACMI), skutočný terén, cesty, vodu, letiská a budovy, stiahnuté z otvorených dát - pozri [Pozadie sveta](world-backdrop.md).

Keď nie je nič načítané, scéna je tmavá s mriežkou a farebnými osami (**Mriežka** a **Osi** v [Kamera a scéna](camera.md)) a panel hovorí: *Nič nie je načítané - scéna zobrazuje mriežku a osi. Pridajte obrázok mapy alebo sieť levelu, aby teplo dostalo kontext.*

Level zdieľajú všetky tri karty: trať načítaná na karte Analýza pretekov je ten istý level, aký zobrazuje heatmapa.

![Panel Pozadie / level s načítaným levelom: tlačidlá Obrázok mapy a 3D model, Bojisko, Nepriehľadnosť, Jas, Uložiť do knižnice a zoznam Knižnica](../assets/img/en/level-panel.webp)

## Položte level za svoje dáta {#put-a-level-behind-your-data}

1. Najprv načítajte dáta ([Ako dostať dáta dnu](getting-data-in.md)), aby sa level prispôsobil im.
2. Na bočnom paneli otvorte **Pozadie / level**.
3. Stlačte **Obrázok mapy…** pre obrázok alebo **3D model…** pre 3D level a vyberte súbor. Pri skutočnom zázname použite **Skutočný svet ako pozadie** alebo **Bojisko**.
4. Počkajte, kým sa dokončí riadok priebehu. Veľký model sa najprv zjednoduší (pozri **Cieľ zjednodušenia** nižšie).
5. Stlačte **F** v pohľade, aby sa všetko zarámovalo. Používajte **Nepriehľadnosť** a **Jas**, kým teplo nevyniká oproti levelu.
6. Stlačte **Uložiť do knižnice**, ak budete level používať znova ([Knižnica levelov](level-library.md)).

## Čo level robí pre teplo {#what-a-level-does-for-the-heat}

- **Zakrýva**: riadky za ním sa stmavia podľa povrchu a riadky za terénom sa skryjú ([Hĺbka a orezávanie](depth-and-culling.md)). Bez levelu zakrytie neexistuje.
- **Reže** ho [Rez](slice.md) a s *Rezať aj level* aj [orezanie podľa vzdialenosti](depth-and-culling.md#distance-culling), spolu s teplom.
- Je jediná vec, ktorú [hĺbka ostrosti](camera.md#depth-of-field) rozostrí, okrem mriežky a kvádrov.
- 3D level **rozšíri vzdialenú rovinu kamery**, keď je väčší než dáta: blízka a vzdialená rovina sa kalibrujú z dátovej sady, a exportovaná mapa široká niekoľko kilometrov by inak celá ležala za vzdialenou rovinou a nechala prázdny pohľad. Vzdialená rovina sa stane 3 × vodorovným rozsahom levelu, keď je ten väčší, blízka rovina sa posúva s ňou (aspoň vzdialená / 100 000), aby sa zachovala presnosť hĺbky, na ktorej závisí zakrytie, a rýchlosť letu sa zvýši aspoň na rozsah / 12. Rozšíri sa to len nikdy nezúži.

## Panel, zhora nadol {#the-panel-top-to-bottom}

| Časť | Podrobnosti |
|---|---|
| **Obrázok mapy…**, **3D model…** | Načíta jeden; nahradí aktuálny level. |
| **Skutočný svet ako pozadie**, **Zabudnúť dlaždice máp** | Len pre dátovú sadu s geografickým odkazom: postaví skutočné miesto pod ňou ako level, alebo zmaže stiahnuté dlaždice. [Pozadie sveta](world-backdrop.md) |
| **Cieľ zjednodušenia** | Rozpočet trojuholníkov pri ďalšom importe modelu: *Plný - bez zjednodušenia* (predvolené), *Vysoký - 8M*, *Stredný - 3M*, *Nízky - 800k*, *Silueta - 100k*. [3D levely](model-levels.md#simplification) |
| Priebeh a **Zrušiť** | Počas dekódovania alebo importu. |
| Poznámka k importu | Trojuholníky pred a po, rozdelenie na zem / stavby / vodu, použitá úroveň detailu. |
| Názov a veľkosť | `šírka×výška px · x × z m/px` pre obrázok, `N trojuholníkov (z M)` pre model. |
| **Nepriehľadnosť**, **Jas** | Oba druhy. |
| Ovládače obrázka | **Odfarbiť**, **Prevrátiť sever/juh**, **Umiestnenie** (dve kotvy), **Prispôsobiť hraniciam dát**, **Výška**. [Obrázky máp](map-images.md) |
| Ovládače modelu | Reliéf terénu, voda, trojuholníky terénu, drôtový model, textúra, zachytené farby, stavby, klasifikácia častí. [Vzhľad levelu](level-appearance.md) |
| **Uložiť do knižnice**, **Odstrániť** | [Knižnica levelov](level-library.md); Odstrániť uvoľní level. |
| **Knižnica** | Levely uložené v tomto prehliadači. [Knižnica levelov](level-library.md) |

## Stránky v tejto časti {#pages-in-this-section}

- [Obrázky máp](map-images.md)
- [3D levely](model-levels.md) - formáty, časti, klasifikácia, zjednodušenie, textúry
- [Vzhľad levelu](level-appearance.md) - každý ovládač pre 3D level
- [Knižnica levelov](level-library.md)
- [Pozadie sveta](world-backdrop.md) - skutočný svet pod záznamom, z otvorených dát

Ako dostať levely z hier a enginov, je úloha samostatných exportných nástrojov (pozri [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) repozitára); formát, do ktorého zapisujú, je zhrnutý v [3D levely](model-levels.md#the-exporter-contract).

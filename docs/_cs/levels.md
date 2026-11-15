---
title: "Levely a geometrie pozadí"
nav_order: 13
has_children: true
lang: "cs"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: true
---

# Levely a geometrie pozadí

Level je 3D místo, kde se hra odehrála – mapa, město, trať. Když ho dáte za svá data, uvidíte, *kde* je teplo. Panel **Pozadí / úroveň** (význam slova „level“ je ve [slovníčku](glossary.md)) nabízí tři druhy kontextu:

- **obrázek mapy**, georeferencovaný dvěma kotvami – viz [Obrázky map](map-images.md);
- **3D level** – `.glb`, `.gltf`, `.obj`, `.stl` nebo `.ply` – rozdělený na zem, stavby a vodu a při importu zjednodušený – viz [3D levely](model-levels.md) a [Vzhled levelu](level-appearance.md);
- **pozadí světa** – pro záznam, který říká, kde na Zemi je (soubor ACMI Tacview), skutečný terén, silnice, vodu, letiště a budovy, stažené z otevřených dat – viz [Pozadí světa](world-backdrop.md).

Když není nic načteno, scéna je tmavá s mřížkou a barevnými osami (**Mřížka** a **Osy** v [Kamera a scéna](camera.md)) a panel říká *Nic není načteno – scéna ukazuje mřížku a osy. Přidejte obrázek mapy nebo síť levelu, aby teplo mělo kontext.*

Level sdílejí všechny tři karty: trať načtená na kartě Analýza závodu je tentýž level, který ukazuje teplotní mapa.

![Panel Pozadí / úroveň s načteným levelem: tlačítka Obrázek mapy a 3D model, Bojiště, Krytí, Jas, Uložit do knihovny a seznam Knihovna](../assets/img/cs/level-panel.webp)

## Položte level za svá data {#put-a-level-behind-your-data}

1. Nejdřív načtěte data ([Jak nahrát data](getting-data-in.md)), aby se level k nim přizpůsobil.
2. V postranním panelu otevřete **Pozadí / úroveň**.
3. Stiskněte **Obrázek mapy…** pro obrázek nebo **3D model…** pro 3D level a vyberte soubor. Pro záznam ze skutečného světa použijte místo toho **Skutečný svět jako pozadí**, nebo **Bojiště**.
4. Počkejte, až řádek postupu doběhne. Velký model se nejdřív zjednodušší (viz **Cíl zjednodušení** níže).
5. Stiskněte **F** v pohledu, aby se zarámovalo všechno. Používejte **Krytí** a **Jas**, dokud teplo nevynikne proti levelu.
6. Stiskněte **Uložit do knihovny**, pokud budete level používat znovu ([Knihovna levelů](level-library.md)).

## Co level dělá s teplem {#what-a-level-does-for-the-heat}

- **Zakrývá**: datové body za ním jsou ztlumené podle plochy a datové body za terénem se skrývají ([Hloubka a vyřazování](depth-and-culling.md)). Bez levelu se nic nezakrývá.
- Je **řezán** [Řezem](slice.md) a, s *Řezat i úroveň*, [vyřazením podle vzdálenosti](depth-and-culling.md#distance-culling), spolu s teplem.
- Je jediná věc, kterou [hloubka ostrosti](camera.md#depth-of-field) rozmazává, kromě mřížky a krychlí.
- 3D level **rozšíří vzdálenou rovinu kamery**, když je větší než data: blízká a vzdálená rovina se kalibrují podle datové sady, a exportovaná mapa několik kilometrů široká by jinak celá ležela za vzdálenou rovinou a nechala prázdný pohled. Vzdálená rovina se stane 3 × vodorovným rozsahem levelu, je-li to větší, blízká rovina se posune s ní (aspoň vzdálená / 100 000), aby se udržela hloubková přesnost, na které závisí zakrývání, a rychlost letu se zvýší na aspoň rozsah / 12. Rozšiřuje se jen, nikdy se nezužuje.

## Panel shora dolů {#the-panel-top-to-bottom}

| Část | Podrobnosti |
|---|---|
| **Obrázek mapy…**, **3D model…** | Načte jeden; nahradí aktuální level. |
| **Skutečný svět jako pozadí**, **Zapomenout dlaždice map** | Jen pro datovou sadu se zeměpisnou referencí: postaví skutečné místo pod ní jako level, nebo smaže stažené dlaždice. [Pozadí světa](world-backdrop.md) |
| **Cíl zjednodušení** | Rozpočet trojúhelníků pro další import modelu: *Plný – bez zjednodušení* (výchozí), *Vysoký – 8M*, *Střední – 3M*, *Nízký – 800k*, *Silueta – 100k*. [3D levely](model-levels.md#simplification) |
| Postup a **Zrušit** | Během dekódování nebo importu. |
| Poznámka k importu | Trojúhelníky před a po, rozdělení na zem / stavby / vodu, použitá úroveň detailu. |
| Název a velikost | `šířka×výška px · x × z m/px` u obrázku, `N trojúhelníků (z M)` u modelu. |
| **Krytí**, **Jas** | Oba druhy. |
| Ovládání obrázku | **Odbarvení**, **Převrátit sever/jih**, **Umístění** (dvě kotvy), **Přizpůsobit rozsahu dat**, **Výška**. [Obrázky map](map-images.md) |
| Ovládání modelu | Reliéf země, voda, trojúhelníky země, drátový model, textura, zachycená barva, stavby, klasifikace částí. [Vzhled levelu](level-appearance.md) |
| **Uložit do knihovny**, **Odebrat** | [Knihovna levelů](level-library.md); Odebrat level vyjme. |
| **Knihovna** | Levely uložené v tomto prohlížeči. [Knihovna levelů](level-library.md) |

## Stránky v této části {#pages-in-this-section}

- [Obrázky map](map-images.md)
- [3D levely](model-levels.md) – formáty, části, klasifikace, zjednodušení, textury
- [Vzhled levelu](level-appearance.md) – každé ovládání pro 3D level
- [Knihovna levelů](level-library.md)
- [Pozadí světa](world-backdrop.md) – skutečný svět pod záznamem, z otevřených dat

Jak dostat levely z her a enginů, je úkol samostatných nástrojů exportu (viz [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) repozitáře); smlouva, do které zapisují, je shrnuta v [3D levely](model-levels.md#the-exporter-contract).

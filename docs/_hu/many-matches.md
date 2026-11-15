---
title: "Sok meccs egyszerre"
parent: "Visszajátszás"
nav_order: 2
lang: "hu"
source: "many-matches.md"
source_hash: "a37a7b4cf8c2"
translated: true
outdated: false
---

# Sok meccs egyszerre

A **Sok meccs egyszerre** sok meccset játszik le egymásra helyezve, így látod, hol járnak általában minden meccs játékosai. Használd, hogy több száz vagy több ezer meccset hasonlíts össze egyetlen képen.

Minden meccs a saját kezdetéről indul, és az egységei figuraként mozognak. A fájlok közvetlenül a grafikus kártyára kerülnek, és nem épül fel teljes táblázat, így simán játszik le ott, ahol egy normál betöltés kifogyna a memóriából.

![Tíz tankmeccs egymásra fektetve, meccsenként egy szín](../assets/img/hu/many-matches.webp)

## Használata {#how-to-use-it}

1. Nyisd meg a **Sok meccs egyszerre** részt a Hőtérkép oldalsávján.
2. Nyomd meg a **Fájlok…** gombot (válassz sok fájlt), a **Mappa…** gombot (egy mappát és almappáit), vagy a **Mappa hozzáadása…** gombot (hozzáadás a betöltöttekhez).
3. A nézegető a figura-rétegre vált, és a kezdetnél indul. Nyomd meg a **Lejátszás** gombot.

Minden fájl egy meccs (vagy több meccset tartalmaz). A Parquet-fájlok és a [`.3dheat`](container.md) tárolók működnek. Egy fájlnak kell pozíció-, idő- és egységoszlop; a név-, típus- és oldaloszlopok megmaradnak. A többi fájlt, és a konverterek kiegészítő fájljait (repülés, üzenetek, események, csevegés, célok) kihagyjuk. Egy normál táblázathoz lásd: [Adatok betöltése](getting-data-in.md).

## Beállítások {#settings}

| Beállítás | Mit csinál |
|---|---|
| **Csapat szerint** / **Meccs szerint** | Oldal szerint színezi, vagy meccsenként egy színt ad. |
| **Jelölje, hol haltak meg az egységek** | Egy jelet tesz oda, ahol az egység meghalt, 10 s, 30 s, 120 s vagy az eddigi összes ideig. |

A panel megmutatja, hány meccset, egységet, sort és pozíciót olvastunk be, a felhasznált memóriát és a betöltési időt. A *Hely még ennyire* azt jelenti, hány további pozíciót bírna még el a grafikus kártya. A *Figurák innen* az a képernyőn látható méret, amely alatt az egységet kis nyílként rajzoljuk a figurája helyett.

A figurák megjelenése ugyanazokat a vezérlőket használja, mint a [meccs-visszajátszás](match-replay.md#figures): **Figuraméret**, **Legkisebb figura a képernyőn** és **Távolról**.

## Tippek {#tips}

- Ha minden nem férne el a memóriában, a pozíciókat ritkítjuk (csak néhány méterenként egy pozíciót tartunk meg), és a panel ezt megmondja.
- A hőmódok a rétegen lévő adatokon is működnek.
- Ezreknyi meccs statisztikájához rajzolás nélkül lásd: [Tömeges elemzés](mass-analysis.md).

---
title: "Szintetikus generátor"
parent: "Adatok betöltése"
nav_order: 5
lang: "hu"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Szintetikus generátor

Nincs saját adatod? Nyomj meg egy gombot, és a 3DHeat kitalál neked egy képzelt csatát, akkorát vagy kicsit, amekkorát szeretnél.

1. Nyisd meg az **Adatkészlet** panelt a Hőtérkép oldalsávján (a **Forrás** alatt).
2. Görgess a **Szintetikus generátor** részhez.
3. Állítsd be a **Sorok (millió)** értéket. Először próbáld az 1-et: a 8 millió alapérték túl nehéz egy első próbához.
4. Nyomd meg a **Generálás** gombot.

![1 millió sor, 8 csapat, a Csapat hő módban rajzolva](../assets/img/en/synthetic-generator-team-heat.webp)

Az **Adatkészlet** panel adatkészletet is tud generálni a betöltés helyett. Két dologra való: a nézegető kipróbálására saját adat nélkül, és annak ellenőrzésére, hogy egy adott számú sor, sugár és keret használható képkockasebességet tart-e egy gépen, *mielőtt* egy nagy valódi betöltést vállalnál. A mozgása egy battle royale-meccs alakját követi - a csapatok szétszórtan indulnak, majd összeszorulnak -, mert az egyenletes zaj bármilyen kerettel jól néz ki, és pont azokat az artefaktumokat rejti el, amelyeket érdemes elkapni.

## Vezérlők {#controls}

| Vezérlő | Alapérték | Jelentés |
|---|---|---|
| **Sorok (millió)** | 8 | Generálandó sorok. Minden játékosnál egész számú ütemre lefelé kerekítve. |
| **Csapatok** | 8 | A csoportok száma (legalább 1). |
| **Csapatonként** | 12 | Játékosok csoportonként (legalább 1). |
| **Térkép fél kiterjedése (m)** | 4000 | A játszható terület szélességének fele X és Z irányban. |
| Becslési sor | | „≈ X GB RAM, Y GB a GPU-n a kvantálás után.” (soronként kb. 26 bájt RAM és 8 bájt a GPU-n). |
| **Generálás** | | A betöltő munkafolyamatban generál, folyamatjelzővel, és lecseréli a betöltött adathalmazt. |

A generálás a háttér-munkafolyamatban fut, így a tízmillió sor sem fagyasztja le az oldalt.

## Mit generál {#what-it-generates}

A [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts) fájlból:

- **Oszlopok:** pozíció, idő, személy (`P000`, `P001`, ...), csoport (`Team 1`, `Team 2`, ...), elfordulás és dőlés, és élettartamok. Nincs munkamenet-oszlop és nincsenek szűrőoszlopok.
- **Idő:** játékosonként egy minta 0,25 másodpercenként, 0-tól kezdve (relatív idő, nincs falióra).
- **Mozgás:** minden csapat a saját szektorában indul egy gyűrűn, a fél kiterjedés 55-95%-án. A közép közelében lévő biztonságos kör (véletlenszerűen legfeljebb a fél kiterjedés negyedével eltolva) hat fázisban, szakaszos megállásokkal, a fél kiterjedés 8%-ára zsugorodik; minden játékos egy kóborló pont felé kormányoz benne, csillapítással és zajjal. A magasság 0 és 220 m között hullámzik.
- **Nézési irány:** az elfordulás a mozgás irányát követi, a dőlés a függőleges sebességből jön.
- **Megismételhető:** a véletlenszám-mag rögzített (1337), így ugyanazok a beállítások mindig ugyanazokat az adatokat adják.

Minden hőmód, a box-visszajátszás és a vonalhő (teljes nyomvonalak, mert nincs eseményoszlop) működik rajta. A élettartam-előzmények is működnek.

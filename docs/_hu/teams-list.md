---
title: "Csapatlista"
parent: "Szűrők és eszközök"
nav_order: 2
lang: "hu"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Csapatok listája

A **Csapatok** panelen elrejthetsz egy csapatot, vagy egy összehasonlítás egyik oldalára teheted. Használd, ha csak a Kéket akarod nézni, vagy azt kérdezni: „hová megy a Kék, ahová a Piros nem?”.

A *csoport* egy csapat vagy oldal, például a Kék és a Piros ([Csoportok](sessions-persons-groups.md#group)). A panel akkor látszik, ha az adathalmaznak van csoportoszlopa; a csoportok száma a fejlécében van. A Csapat hő módban az oldalsávon van egy **Csapatnéző** nevű rész saját beállításokkal; ez az oldal a **Csapatok** listáról szól.

## Csapat elrejtése {#hide-a-team}

1. Nyisd meg a **Csapatok** részt az oldalsávon.
2. Vedd ki a pipát a *Látható* jelölőnégyzetből az elrejtendő csapatnál. A kép azonnal frissül.
3. Nyomd meg az **Összes megjelenítése** gombot, hogy minden csapat újra látszódjon.

![A Csapatok lista: Kék 5p, Piros 5p, az Összes megjelenítése gombbal](../assets/img/en/teams-list.webp)

## Minden sor {#each-row}

| Rész | Jelentés |
|---|---|
| Jelölőnégyzet (*Látható*) | A csoport megjelenítése vagy elrejtése. |
| Színminta | A csoport színe: Csapat hő módban a [csapathő](team-heat.md) színe, a többi módban az alapszíne. |
| Név | A csoport felirata (a teljes felirat egérrel fölé húzva). |
| **+** / **-** (Különbség mód) | A csoportot a [különbség](difference.md) pozitív vagy negatív oldalára teszi; az aktív gombra újra kattintva egyik oldalra sem kerül. |
| `Np` (többi mód) | Azon személyek száma, akiknek az első sora ebben a csoportban van. |

![Különbség mód: a Kék a + oldalon, a Piros a - oldalon](../assets/img/en/teams-list-difference.webp)

## Gombok {#buttons}

| Gomb | Hatás |
|---|---|
| **Összes megjelenítése** | Minden csoportot újra láthatóvá tesz. |
| **Egyenletes felosztás** (Különbség mód) | A csoportok első fele (felfelé kerekítve) a +, a többi a - oldalon; minden betöltésnél ugyanez a felosztás a kiindulópont. |

## Mit csinál a csoport elrejtése {#what-hiding-a-group-does}

- A **Hő**, a **Csapathő** és a **Vonalak** módban a csoport sorai semmit nem adnak hozzá.
- A **Különbség** módban az elrejtett csoport semmit nem ad hozzá, bármelyik oldalon is van, egy másik oszlop szerinti bontás esetén is (lásd: [Különbség](difference.md#for-developers)).
- A **figura-rétegen** azok a személyek nem rajzolódnak ki, akiknek az első sora ebben a csoportban van.
- A **Csapathő** módban a többi csoport megtartja a színét: az árnyalatokat az összes csoport száma alapján osztjuk ki, nem a látható csoportok alapján, így két kép összehasonlítható marad.

A láthatóság változtatása újraindítja az akkumulációt. Minden új adathalmaznál minden csoport újra látható.

A panel súgója a módtól függően változik: a Különbség módban elmagyarázza a + és a - jelentését; a Csapathő módban azt, hogy a színminták az egyes csoportok színei.

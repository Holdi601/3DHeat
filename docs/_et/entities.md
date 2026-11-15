---
title: "Üksused"
parent: "Filtrid ja tööriistad"
nav_order: 3
lang: "et"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Olemid

**Olemid** lubab valida ühe mängija (või mõned), et näha ainult seda, kuhu see mängija läks. Kasuta seda, et jälgida oma liikumist või ühte vastast.

Paneel kuvatakse, kui andmestikus on isikuveerg. Päis näitab isikute arvu või `valitud kokku`, kui valik on aktiivne (*isik* on üks mängija või tehisintellekt, vt [sõnastikku](glossary.md)).

## Vali mängija {#pick-a-player}

1. Ava külgribal **Olemid**.
2. Kirjuta nime osa otsingukasti.
3. Märgi mängija. Päis näitab näiteks `2 of 10`, ja kõik muu kaob.
4. **Tühjenda** näitab kõiki uuesti.

![Olemid, kus on valitud kaks kümnest mängijast](../assets/img/en/entities-selected.webp)

Valik näitab soojusrežiimides (punktid, jooned, erinevus, võistkondade soojus) ainult valitud isikuid, samuti [kujukordus](box-replay.md) jälgedes, kujudes ja radades. Jäta tühjaks, et näidata kõiki; kõigi valimine on sama mis mitte kedagi valida.

## Paneel {#the-panel}

| Osa | Tähendus |
|---|---|
| Otsingukast | *Otsi N olemit...* filtreerib loendit nime tõstutundliku alamstringi järgi. Näitab `N vastet` või `N vastet, näitan esimesi 200`; *Vastet ei ole "..."*, kui otsing ei leia midagi. |
| Loend | Kuni 200 isikut (esimesed 200 vastet), igaühel linnukast, isiku värvi tükk ja nimi (*(nimetu)*, kui nimi on tühi). |
| Mängus olevate vihje | Kui aeg mängib, sisaldab loend neid, kes on *mängus taasesituspea juures*; otsing leiab kõik. |
| **AI (n)** | Kokkuklapitav grupp tehisintellektiga juhitud üksustega, eraldi mängijatest. |
| **Lisa näidatud** | Lisab valikule kõik praegu loendis olevad. |
| **Ainult näidatud** | Teeb valiku täpselt loendis olevateks. |
| **Tühjenda** | Tühjendab valiku. |

## Piirangud {#limits}

Soojuses on valik filter ja kasutab ühte neljast [filtri pesast](filters.md#rules). Kui teised filtrid kasutavad juba kõiki nelja, ütleb paneel: *Soojusele ei rakendu: kõik filtri pesad on hõivatud. Kujukordus näitab ikka ainult neid olemeid. Vabasta pesa, tühjendades filtri jaotises Filtrid.* Tühjenda filter, et pesa vabaneks.

Valik tühjendatakse igal uuel andmestikul. Vahekaart Matš seab sama valiku, kui ta fokusseerib ühe mängija.

## Arendajatele {#for-developers}

Valik salvestatakse filtrina *persons* ([Filtrid](filters.md#for-developers)). Shaderi mask hoiab 65 536 isiku ID-d; isik, mis on sellest suurem, ei joonistu soojusesse, kui valik on aktiivne.

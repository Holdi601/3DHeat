---
title: "Võistkondade loend"
parent: "Filtrid ja tööriistad"
nav_order: 2
lang: "et"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Võistkondade loend

Paneel **Meeskonnad** lubab peita meeskonna või panna selle võrdluses ühele poolele. Kasuta seda, et vaadata ainult Sinist või küsida "kuhu Sinine läheb, kuhu Punane ei lähe?".

*Grupp* on meeskond või pool, näiteks Sinine ja Punane ([Grupid](sessions-persons-groups.md#group)). Paneel kuvatakse, kui andmestikus on grupiveerg; gruppide arv on päises. Režiimis Võistkondade soojus on külgribal lisaks jaotis **Võistkonnavaatur** oma seadetega; see leht käsitleb loendit **Meeskonnad**.

## Peida meeskond {#hide-a-team}

1. Ava külgribal **Meeskonnad**.
2. Eemalda linnuke (*Nähtav*) meeskonnalt, mida peita. Pilt uueneb kohe.
3. Vajuta **Näita kõiki**, et kõik meeskonnad tagasi tuua.

![Meeskondade loend: Blue 5p, Red 5p, nupuga Näita kõiki](../assets/img/en/teams-list.webp)

## Iga rida {#each-row}

| Osa | Tähendus |
|---|---|
| Linnukast (*Nähtav*) | Näitab või peidab grupi. |
| Värvitükk | Grupi värv: tema [võistkondade soojuse](team-heat.md) värv režiimis Võistkondade soojus, tema põhivärv teistes režiimides. |
| Nimi | Grupi silt (täisnimi, kui hiirega peale viia). |
| **+** / **-** (režiim Erinevus) | Paneb grupi [erinevuse](difference.md) positiivsele või negatiivsele poolele; aktiivse nupu uuesti klõpsamine paneb grupi kummalegi poolele mitte. |
| `Np` (muud režiimid) | Isikute arv, kelle esimene rida on selles grupis. |

![Režiim Erinevus: Sinine + poolel, Punane - poolel](../assets/img/en/teams-list-difference.webp)

## Nupud {#buttons}

| Nupp | Mõju |
|---|---|
| **Näita kõiki** | Muudab kõik grupid taas nähtavaks. |
| **Jaota võrdselt** (režiim Erinevus) | Gruppide esimene pool (ülespoole ümardatud) läheb +-poolele, ülejäänud -, sama jaotus algab igal laadimisel. |

## Mida grupi peitmine teeb {#what-hiding-a-group-does}

- Režiimides **Soojus**, **Võistkondade soojus** ja **Jooned** ei panusta peidetud grupi read mitte millegagi.
- Režiimis **Erinevus** ei panusta peidetud grupp mitte midagi, kumbal poolel ta ka ei ole, ka siis, kui jagatakse mõne teise veeru järgi (vt [Erinevus](difference.md#for-developers)).
- **Kujude ülekattes** ei joonistata isikuid, kelle esimene rida on selles grupis.
- Režiimis **Võistkondade soojus** säilitavad teised grupid oma värvid: toonid määratakse grupi koguarvust, mitte nähtavast, nii et kaks pilti jäävad võrreldavaks.

Nähtavuse muutmine taaskäivitab akumulatsiooni. Igal uuel andmestikul on kõik grupid taas nähtavad.

Paneeli vihje muutub vastavalt režiimile: režiimis Erinevus selgitab see + ja -, režiimis Võistkondade soojus seda, et värvitükid on iga grupi joonistatavad värvid.

---
title: "Soojusrežiimid"
nav_order: 4
has_children: true
lang: "et"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Soojusrežiimid

Iga punkt lisab väikese hõõguva ala, hõõgud kuhjuvad ja kuhjumist värvitakse. Režiimid on viis viisi seda värvida ning igaüks vastab ühele küsimusele.

Soojuskaardi vahekaardi külgriba ülaosas olev režiimiriba valib, kuidas [andmestikku](glossary.md) joonistatakse. Klahvid 1-4 valivad Soojuse, Erinevuse, Võistkondade soojuse ja Joonte. Kujude ülekattel klahvi ei ole.

![Režiimiriba: Soojus, Erinevus, Võistkondade soojus, Kujude ülekate ja Jooned](../assets/img/en/heat-modes-bar.webp)

| Režiim | Küsimus, millele ta vastab |
|---|---|
| **Soojus** | Kus see juhtus ja kui palju? |
| **Erinevus** | Kumb pool tegi seda rohkem? |
| **Võistkondade soojus** | Kelle oma see oli? |
| **Jooned** | Mis suunas inimesed liikusid? |
| **Kujude ülekate** | Kes oli kus ja millal? |

![Sama andmestik nelja režiimiga: Soojus, Erinevus, Võistkondade soojus ja Jooned](../assets/img/en/heat-modes-grid.webp)

| Režiim (riba silt) | Klahv | Mida ta joonistab | Vajab |
|---|---|---|---|
| **Soojus** | 1 | Liituv tihedus: iga nähtav rida lisab kaamera poole suunatud radiaalse spraidi. [Soojus](heat.md) | andmestiku |
| **Erinevus** | 2 | Märgiga tihedus: üks populatsioon liidab, teine lahutab. [Erinevus](difference.md) | kaks poolt: vähemalt kaks rühma või jaotus alles hoitud veeru järgi |
| **Võistkondade soojus** | 3 | Rühmade kaupa värvitud tihedus: rühmal oma toon, kattumiskohtades segatud. [Võistkondade soojus](team-heat.md) | rühmaveeru |
| **Kujude ülekate** | - | Kuju (või kast) iga isiku kohta, liikumas mööda ajajoont: kordus. [Kujude ülekate](box-replay.md), [Matši kordus](match-replay.md) | isikuveeru |
| **Jooned** | 4 | Joonsoojus: joon iga isiku proovist tema järgmiseni, soojus hajub külgedele. [Joonsoojus](line-heat.md) | isiku- ja ajaveeru |

Režiim, mida andmed ei toeta, on hallina ja tema vihjest selgub põhjus, näiteks *Pole saadaval - Erinevuse režiim vajab kahte rühma või jaotamiseks alles hoitud veergu; neis andmetes on üks rühm.* Kui uus andmestik ei toeta praegust režiimi, läheb vaade üle režiimile **Soojus**.

Klahvid 1-4 kontrollitakse andmete järgi samamoodi: hallina oleva režiimi klahv ei tee midagi.

## Millised paneelid iga režiim näitab {#which-panels-each-mode-shows}

| Paneel | Soojus | Erinevus | Võistkondade soojus | Kujude ülekate | Jooned |
|---|---|---|---|---|---|
| Teed ([joonsoojus](line-heat.md)) | | | | | jah |
| Soojuse kuju (koos **Järgi vaadet** ja **Sama tihedus igal suumil**), Soojuse värvid, Spraidi pikslipiirid, Sügavus, Kauguse eemaldamine | jah | jah | jah | | jah |
| Suund ([suunatud soojus](directional-heat.md)), Väärtus ([väärtuskaalumine](value-weighting.md)) | jah | jah | jah | | jah |
| Võistkonnavaatur ([kujude ülekate](box-replay.md)) | | | | jah | |
| Erinevuse jaotus ([erinevus](difference.md)) | | jah | | | |
| [Võistkonnad](teams-list.md), [Üksused](entities.md), [Filtrid](filters.md), Taust / tase, [Lõik](slice.md), [Mõõtmine](measure.md), Kaamera teekond ja renderdamine, Jõudlus, Kaamera ja stseen | jah | jah | jah | jah | jah |

## Mida kõik soojusrežiimid jagavad {#what-every-heat-mode-shares}

Kõik neli soojusrežiimi (kõik peale kujude ülekatte) on sama masin erinevate sisenditega ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Millised read.** [Ajajoone](timeline.md) aken valib aja järgi sorditud ridade järjestikuse vahemiku; [filtrid](filters.md), rühmade nähtavus, erinevuse jaotus, [kauguse eemaldamine](depth-and-culling.md#distance-culling) ja [lõik](slice.md) otsustavad igal real tippude varjutajas, kas ja kui tugevasti ta panustab.
2. **Splattimine.** Iga panustav rida joonistatakse spraidina (või Joonte režiimis lõiguna) ujukomapunkti **soojussihtmärki**, lisades oma skaalaväärtuse. Kui ridu on rohkem, kui kaader jõuab, joonistatakse neist kihistatud valim, kaalutuna kompenseerimiseks. Vaata [Valimi võtmine ja eelarved](sampling-and-budgets.md).
3. **Akumulatsioon.** Kui midagi ei muutu, ühendatakse kaadreid, kuni iga rida on panustanud täpselt ühe korra. Vaata [Akumulatsioon](accumulation.md).
4. **Kompositsioon.** Iga piksli akumuleeritud väärtus jagatakse **küllastuspunktiga**, kujundatakse **tiheduse vastuse** järgi, tõstetakse **minimaalse soojusega** ja vaadatakse üles **värviskaalast**, mille läbipaistvus segab selle üle stseeni. Vaata [Värv ja säritus](colour-and-exposure.md).

Kõik samm 4 juures rakendatakse kompositsiooni ajal, nii et nende juhtnuppude lohistamine ei alusta akumulatsiooni uuesti; samme 1-2 puudutav muutus alustab.

## Selle jaotise lehed {#pages-in-this-section}

- [Soojus](heat.md) - tavaline soojusrežiim ja ülevaade selle paneelidest
  - [Kujundi kuju](sprite-shape.md) - raadius, intensiivsused, sumbumine, kõvera redigeerija, pikslipiirid, tasandamine
  - [Värv ja säritus](colour-and-exposure.md) - skaalaredigeerija, küllastuspunkt, automaatne säritus, minimaalne soojus, tiheduse vastus
  - [Sügavus ja eemaldamine](depth-and-culling.md) - taseme poolt varjamine, taha peitmine maastiku, kauguse eemaldamine
- [Erinevus](difference.md) - erinevuse jaotus
- [Võistkondade soojus](team-heat.md)
- [Joonsoojus](line-heat.md) - teed
- [Kujude ülekate](box-replay.md) - kordusrežiim (fail nimega box replay)
- [Suunatud soojus](directional-heat.md)
- [Väärtuskaalumine](value-weighting.md)

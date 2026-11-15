---
title: "Soojus"
parent: "Soojusrežiimid"
nav_order: 1
lang: "et"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Soojus

Soojus värvib kohad, kus juhtus palju asju: punane, kus juhtus veidi, valgeks kuumenenud, kus juhtus väga palju. Ta vastab küsimusele "kus see juhtub ja kui palju".

**Soojus** (klahv 1) on vaikerežiim. Iga nähtav [rida](glossary.md) lisab kaamera poole suunatud ümmarguse [spraidi](glossary.md); kattuvad spraidid liituvad ujukomapunktilises puhvris; summa vastendatakse värviskaalaga - vaikimisi läbipaistvast punaseks, kollaseks ja valgeks - ning joonistatakse stseeni peale.

![Soojus 3D-tasemel: kuumad kohad hoonete sees ja peal](../assets/img/en/shooter-heat.webp)

Pilt näitab shooteri vooru soojust tasemel, kus on hooned: kuumad kohad on ruumides ja trepil, mitte ainult maapinnal.

## Kuidas seda kasutada {#how-to-use-it}

1. Laadi andmed ja vajuta `1` (või vali režiimiribal **Soojus**).
2. Kui kõik on valge või tühi, vajuta jaotises **Soojuse kuju** nuppu **Automaatne säritus välja põhjal**.
3. Muuda **Spraidi raadiust**, kuni läheduses olevad punktid sulavad ribadeks: väiksem näitab üksikuid laike, suurem alasid.
4. Ava **Soojuse värvid**, et värve muuta, või **Sügavus**, et künkad ja seinad peidaksid soojuse enda taha.

![Külgriba jaotised Soojuse kuju ja Soojuse värvid, mõlemad avatud](../assets/img/en/heat-panel.webp)

Samad paneelid kujundavad ka [Erinevust](difference.md), [Võistkondade soojust](team-heat.md) ja [Joonsoojust](line-heat.md); nad erinevad selle poolest, mida lisatakse (märgiga, värvitult või mööda jooni), mitte selle poolest, kuidas.

## Paneelid ja nende vaikeväärtused {#the-panels-and-their-defaults}

Iga allpool olev juhtnupp vastab varjutaja parameetrile, nii et selle muutmine ei maksa midagi peale uue joonistuse. Liuguritel on kõrval kirjutatav väli ja lohistuspide (väike käepide paremal: lohista üles või alla, kaugemale on kiiremini, Shift peenhäälestuseks); kui liuguri rada lõpeb enne tegelikku piiri, võib käepide minna üle selle kuni siin antud *jog-laeni*. Väärtused märgitud *laadimisel* arvutatakse iga uue andmestiku jaoks uuesti.

### Soojuse kuju (avatud) {#heat-shape-open}

| Juhtnupp | Vaikimisi | Vahemik (jog-lagi) | Üksikasjad |
|---|---|---|---|
| **Spraidi raadius** | 6 m; laadimisel ulatus / 120 | 0,05-2000 m, logaritmiline (50 000) | [Kujundi kuju](sprite-shape.md#sprite-radius) |
| **Keskme intensiivsus** | 1 | 0-10 (1000) | [Kujundi kuju](sprite-shape.md#centre-and-edge-intensity) |
| **Serva intensiivsus** | 0 | -2-10 (1000) | [Kujundi kuju](sprite-shape.md#centre-and-edge-intensity) |
| **Skaala kuju** | *Sumbumine* | *Sumbumine* / *Kõver* | [Kujundi kuju](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Sumbumine** (ainult sumbumisel) | 1,6 | 0,1-8 (64) | [Kujundi kuju](sprite-shape.md#falloff) |
| **Sujuv skaala** (ainult sumbumisel) | sees | | [Kujundi kuju](sprite-shape.md#falloff) |
| Kõvera redigeerija (ainult kõveral) | eelseade *Sujuv* | | [Kujundi kuju](sprite-shape.md#the-curve-editor) |
| **Küllastuspunkt** | 24; laadimisel hinnang, seejärel mõõdetud | 0,1-4000, logaritmiline (10 000 000) | [Värv ja säritus](colour-and-exposure.md#saturation-point) |
| **Minimaalne soojus** | väljas (0) | 0-100% | [Värv ja säritus](colour-and-exposure.md#minimum-heat) |
| **Tiheduse vastus** | *Küllastav* | *Küllastav* / *Lineaarne* / *Logaritmiline* | [Värv ja säritus](colour-and-exposure.md#density-response) |
| **Automaatne säritus välja põhjal** | | nupp | [Värv ja säritus](colour-and-exposure.md#auto-exposure) |
| **Järgi vaadet** | sees | | Mõõdab säritust uuesti iga kord, kui kaamera seisma jääb, nii et piirkond, kuhu lendad, kasutab kogu värviskaalat. Väikesed muutused ignoreeritakse ja skaala libiseb sujuvalt. Eemalda linnuke või lohista **Küllastuspunkti**, et skaala lukustada ja võrrelda kohti ühel skaalal. [Värv ja säritus](colour-and-exposure.md#follow-the-view) |
| **Sama tihedus igal suumil** | sees | | Värv tähendab sama arvu ridu maa-alaühiku kohta, olenemata sellest, kui lähedal oled. Spraid, mida pikslipiirid suurendavad (kaugelt) või vähendavad (lähedalt), säilitab soojuse, mille ta oma tegelikus suuruses lisaks; nii ei tuhmu kaugelt eksponeeritud pilt, kui sinna lendad. Väljas lisab piiratud spraid oma täiskaalu piiratud suuruses. [Kujundi kuju](sprite-shape.md#pixel-clamps) |
| **Lamenda maapinna tasandile** | väljas | | [Kujundi kuju](sprite-shape.md#flatten-onto-ground-plane) |

### Soojuse värvid (suletud) {#heat-colours-closed}

| Juhtnupp | Vaikimisi | Üksikasjad |
|---|---|---|
| Rühmade värvitükid ja **Värvide eraldus** (ainult Võistkondade soojus) | 1,4 | [Võistkondade soojus](team-heat.md) |
| **Soojusskaala** redigeerija (*Positiivne (liitvad võistkonnad)* Erinevuses, *Läbipaistmatuse skaala* Võistkondade soojuses) | läbipaistev → punane → kollane → valge | [Värv ja säritus](colour-and-exposure.md#the-ramp-editor) |
| **Lähtesta: läbipaistev → punane → kollane → valge** | | |
| **Negatiivne (lahutavad võistkonnad)** skaala (ainult Erinevuses) | läbipaistev → roheline → sinine → lilla | [Erinevus](difference.md#colours) |

### Spraidi pikslipiirid (suletud) {#sprite-pixel-clamps-closed}

| Juhtnupp | Vaikimisi | Vahemik (jog-lagi) | Üksikasjad |
|---|---|---|---|
| **Min raadius pikslites** | 1 px | 0-16 (512) | [Kujundi kuju](sprite-shape.md#pixel-clamps) |
| **Max raadius pikslites** | 96 px | 2-1024, logaritmiline (8192) | [Kujundi kuju](sprite-shape.md#pixel-clamps) |

### Sügavus (avatud) {#depth-open}

| Juhtnupp | Vaikimisi | Üksikasjad |
|---|---|---|
| **Peida maastiku taha** | sees | [Sügavus ja eemaldamine](depth-and-culling.md#hide-behind-terrain) |
| **Geomeetria taha peidetud** | 0,8 (*80% tumedam*) | [Sügavus ja eemaldamine](depth-and-culling.md#hidden-behind-geometry) |

### Kauguse eemaldamine (suletud) {#distance-culling-closed}

| Juhtnupp | Vaikimisi | Vahemik (jog-lagi) | Üksikasjad |
|---|---|---|---|
| **Lähedal** | väljas (0) | 0,5-5000 m, logaritmiline, raja alumine ots = väljas (200 000) | [Sügavus ja eemaldamine](depth-and-culling.md#distance-culling) |
| **Kaugel** | väljas (0) | 1-200 000 m, logaritmiline, alumine ots = väljas (10 000 000) | [Sügavus ja eemaldamine](depth-and-culling.md#distance-culling) |
| **Lõika tasandiga** | sees | | [Sügavus ja eemaldamine](depth-and-culling.md#distance-culling) |
| **Lõika ka taset** | sees | | [Sügavus ja eemaldamine](depth-and-culling.md#distance-culling) |

Klahvid `[` ja `]` lükkavad kaugust piiri sissepoole ja väljapoole, `\` lülitab selle sisse ja välja ([Sügavus ja eemaldamine](depth-and-culling.md#keyboard)).

### Suund ja Väärtus {#direction-and-value}

Soojuse kuju all on veel kaks jaotist. **Suund** joonistab iga rea kiiluna ja lisab nooli: vaata [Suunatud soojus](directional-heat.md). **Väärtus** kaalub soojust selle järgi, mis iga rida maksis või teenis: vaata [Väärtuskaalumine](value-weighting.md).

## Mis salvestatakse {#what-is-saved}

Ülal kirjeldatud soojusseaded ei salvestu seansside vahel: lehe laadimine taastab vaikeväärtused. Brauseris on kaks asja alles: viimane esitluskiirus (`heat3d.speed`, vaata [Ajajoon](timeline.md)) ja kujude ülekatte kaugemate kujude seaded (tähiste stiil, suurus, tabamusmärgid jne). Samuti jäävad alles keel, [pööratud maailmatelgede](camera.md#invert-world-axis) valik, võidusõidu vahekaardi meeldejäetud autonimed ja [tasemete raamatukogu](level-library.md). Täielik loend on lehel [Salvestatud seaded](ref-settings-storage.md).

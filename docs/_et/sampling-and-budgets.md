---
title: "Valimi võtmine ja eelarved"
parent: "Renderdamise sisemine tööpõhimõte"
nav_order: 3
lang: "et"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Valimi ja eelarved

Kui ühes kaadris on liiga palju punkte joonistamiseks, joonistab vaataja ühtlase valimi ja teeb iga punkti rohkem loetavaks, nii et pilt jääb õigeks. Kontroller reguleerib, kui palju neid joonistatakse, et vaataja kaadrisagedus püsiks.

## Jõudluspaneeli juhtnupud {#performance-panel-controls}

| Juhtnupp | Vaikimisi | Vahemik (hüppamisega) |
|---|---|---|
| **Joonista igas kaadris kõik read** | sees | |
| **Kohanduv eelarve** | sees | |
| **Siht-FPS** | 60 | 20-240 (1000) |
| **Algne spraitide arv / kaader** (kohanduv) või **Spraite / kaader** | 4,00 M | 65 536-268 435 456, logaritmiline (268 435 456) |
| **Soojuse lahutusvõime** | 100% | 25-100%, korrutatuna kohandava teise astme skaalaga |
| **Järkjärguline täpsustamine** | sees | Väljas: iga kaader on uus ühe kaadri hinnang (kasulik, et näha toorvalimit). |

Vaata ka [Jõudluspaneel ja statistika kattekiht](performance-and-stats.md).

## Arendajatele {#for-developers}

### Kandidaatread {#candidate-rows}

Read on salvestatud ajalises kasvavas järjekorras. Ajajoone aken [*lo*, *hi*] muutub reavahemikuks kahe binaarse otsinguga aja veeru järgi ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); ilma aja veeruta on iga rida kandidaat. Need on statistika kattekihi **Ridu aknas**. Iga rea kontrollid - filtrid, rühmad, jaotus, kärpimine, lõige, eluiga - toimuvad hiljem, varjundis; rida, mis ei läbi, maksab ühe tipuvarjundi käivituse ega ühtegi fragmenti.

### Valimiplaan {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) jagab kandidaatvahemiku **4096 järjestikuse rea plokkideks** ja valib kaadri spraitieelarvest, mitu neist joonistada:

- Kui eelarve katab kõik plokid, joonistatakse kõik - kaader on täpne.
- Muidu võetakse plokid ühtlise sammuga üle vahemiku, nihkega, mis liigub igal kaadril kuldlõike võrra, nii et järjestikused kaadrid katavad erinevaid plokke ja kokkuvõte täitub ühtlaselt. See on **kihiline** valim: ajavahemiku iga osa on igal kaadril esindatud.

Iga joonistatud rea soojust korrutatakse **kandidaadid / esitatud** väärtusega, seega on kaadri oodatav soojus iga eelarve puhul täpne; müra sõltub ainult eelarvest. Read asuvad tükkides suurusega 8 388 608 (vt [GPU mälu residentsus](gpu-memory.md)); plokk jagatakse seal, kus see tükki ületab, ja iga tükk saab nimekirja plokialgustest, mida ta peab joonistama.

Üks plaan võib kanda kuni 65 536 plokki - 268 435 456 spraiti, sest mõlemad taustaprogrammid hoiavad fikseeritud 65 536-pesalist plokialguste puhvrit. Rohkem nõudmine piiratakse sinna ja puudujääk näitab ausalt, et koondumiseks on vaja rohkem kaadreid.

### Joonista igas kaadris kõik read {#draw-every-row-each-frame}

**Jõudlus → Joonista igas kaadris kõik read** (vaikimisi **sees**): eelarve muutub põrandaks, mitte laeks, ja kaader, mis alustab uut hinnangut, joonistab kõik read, mille eest ta vastutab (kuni 268 M piiranguni).

Põhjus: kaamera liigutamine viskab akumulatsiooni minema, seega on liikuv kaader üks hinnang, mille müra sõltub sellest, kui suure osa andmetest ta joonistas. Kui joonistatakse neljandik, näed ainult neljandikku heledates kaalutud punktides, ja just see teebki liikuva vaate sädelevaks. Kõige joonistamine teeb iga kaadri valmis pildiks. Hind on see, et kaadri aeg järgib nüüd akna andmete suurust; hoovad on kitsam ajaaken, filtrid või kauguse järgi kärpimine, mis vähendavad kandidaate, mitte ei hõreda neid.

Lülita see välja riistvaral, mis ei jõua kogu välja korraga: *Spraite / kaader* on siis päris piirang ja vaade koondub mõne paigalseisva kaadriga.

Täisplaani maksumus, mõõdetuna tipptaseme lauaarvuti GPU-l 4K lõuendil suure tasemega, spraitidel raadiusega 1 m (üks-kaks pikslit): umbes 100 M spraiti kaadri kohta 30 fps juures, 200 M 15 fps juures ja 268 M maksimum umbes 12 fps juures. Nii väikeste spraitidega on kogu kulu tipuetapis ja soojuse lahutusvõime ei muuda midagi; suurte spraitidega on kulu täitmises: 8 M spraiti raadiusega 100 m võttis täielikul soojuse lahutusvõimel 2,5 s kaadri kohta ja 25% juures 170 ms. **Joonista igas kaadris kõik read** alustab seetõttu 67 M-ga ja tõuseb kaadri kohta veerandi võrra, kui kaadrid on alla 150 ms, ning langeb poole võrra, kui need on üle 400 ms, nii et raske vaade ei aja kaadrit üle sellest, mida GPU valvur lubab.

### Kohanduv eelarve {#the-adaptive-budget}

**Jõudlus → Kohanduv eelarve** (vaikimisi sees) reguleerib spraitieelarvet, et hoida **Siht-FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). See on tühikäigul kasti esituses ja videote renderdamise ajal.

Sisendiks on kaadriaeg, silutud (90% eelmine + 10% uus, üksikud kaadrid kuni 2 s), sihtväärtusega 1000 / max(15, siht-FPS) ms.

**Esimene etapp - spraidid.** Igal kaadril korrutatakse eelarve väärtusega `1 + (target / frame - 1) × gain`, võimendusega 0,35, kui on liiga aeglane, ja 0,08, kui on varu; piiratud kaadri kohta teguriga 0,5-1,25 ja 65 536-268 435 456 spraidini.

**Teine etapp - lahutusvõime.** Alles siis, kui eelarve on juba oma põhjas ja kaadrid on ikka üle 10% liiga aeglased, langeb soojuspuhvri lahutusvõime kaadri kohta 8% võrra, kuni 25% kanvasest; see taastub 4% kaadri kohta, kui on 30% varu. Fragmendi kulu langeb lahutusvõime ruudus, mis on sujuva skaala all peaaegu nähtamatu. (Mõõdetud tarkvararenderdusel 10 M reaga ja liiga suurte spraitidega: 141 ms → 17 ms kaadri kohta.) Skaala ümardatakse kuueteistkümnendikeni; kattekihi *Lahutusvõime* näitab seda.

**Loobumine.** Aeglane kaader näeb välja samasugune, olgu selle põhjustasid spraidid või raske tase - eraldi ajastust kihtide kaupa pole. Kui eelarve on põhjas ja kaadrid jäävad alla 70% sihtväärtusest 30 kaadri jooksul, ei olnud spraidid kulu põhjus: kontroller lülitub **ronimisele**, korrutades eelarve 1,5 võrra iga 14 kaadri järel ja taastades lahutusvõime, niikaua kui kaadriaeg jääb 1,5 korda selle piiri, mis see oli põhjas. Ronimine, mis läheb sellest halvemaks, taandub 60%-le ja jätkab tavalist juhtimist; sihtväärtuse saavutamine lõpetab ronimise.

Kui kohanduv eelarve on välja lülitatud, on eelarveks lihtsalt **Spraite / kaader**.

Kui *Joonista igas kaadris kõik read* on sees, töötab kohanduv eelarve edasi, kuid täpne reegel tõstab eelarve nii, et see katab kõik kandidaatread; praktikas juhib see ainult lahutusvõime etappi ja kaadreid, mis ei alusta uut hinnangut.

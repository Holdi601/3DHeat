---
title: "Tasemed ja taustgeomeetria"
nav_order: 13
has_children: true
lang: "et"
source: "levels.md"
source_hash: "1283adc1548a"
translated: true
outdated: false
---

# Tasemed ja taustageomeetria

Tase on 3D-koht, kus mäng toimus - kaart, linn, rada. Pane see oma andmete taha ja näed, *kus* soojus asub. Jaotis **Taust / tase** (vt sõnastikust "tase") annab kolme liiki konteksti:

- **kaardipilt**, mis on geograafiliselt paigutatud kahe ankruga - vt [Kaardipildid](map-images.md);
- **3D-tase** - `.glb`, `.gltf`, `.obj`, `.stl` või `.ply` - jagatud maapinnaks, ehitisteks ja veeks ning lihtsustatud importimisel - vt [3D-tasemed](model-levels.md) ja [Taseme välimus](level-appearance.md);
- **päris maailm taustaks** - salvestisele, mis ütleb, kus maakeral see asub (Tacview ACMI fail): päris maastik, teed, vesi, lennuväljad ja hooned, mis laetakse avatud andmetest alla - vt [Maailma taust](world-backdrop.md).

Kui midagi pole laetud, on stseen tume, ruudustiku ja värviliste telgedega (**Ruudustik** ja **Teljed** jaotises [Kaamera ja stseen](camera.md)), ja paneel ütleb *Nothing loaded - the scene shows a grid and axes. Add a map image or a level mesh to give the heat context.* (Midagi pole laetud - stseen näitab ruudustikku ja telgi. Lisa kaardipilt või taseme võrk, et soojusele kontekst anda.)

Tase on jagatud kõigi kolme sakiga: raja analüüsi sakis laaditud rada on sama tase, mida soojuskaart näitab.

![Taust / tase paneel laetud tasemega: nupud Kaardipilt ja 3D-mudel, Sõjatander, Läbipaistmatus, Heledus, Salvesta teeki ja Teek loend](../assets/img/et/level-panel.webp)

## Pane tase oma andmete taha {#put-a-level-behind-your-data}

1. Laadi kõigepealt oma andmed ([Andmete sisestamine](getting-data-in.md)), et tase sobitataks nendega.
2. Ava külgribal **Taust / tase**.
3. Vajuta pildi jaoks **Kaardipilt…** või 3D-taseme jaoks **3D-mudel…** ja vali fail. Päris maailma salvestise jaoks kasuta selle asemel **Päris maailm taustaks** või **Sõjatander**.
4. Oota, kuni edenemisrida lõpeb. Suur mudel lihtsustatakse esmalt (vt allpool **Lihtsustamise siht**).
5. Vajuta vaates **F**, et kõik raamida. Kasuta **Läbipaistmatust** ja **Heledust**, kuni soojus paistab tasemest esile.
6. Vajuta **Salvesta teeki**, kui kasutad taset uuesti ([Taseme raamatukogu](level-library.md)).

## Mida tase soojuse jaoks teeb {#what-a-level-does-for-the-heat}

- See **katab**: selle taha jäävad andmepunktid tuhmistuvad pinna kaupa ja maastiku taha jäävad andmepunktid peidetakse ([Sügavus ja kärpimine](depth-and-culling.md)). Ilma tasemeta katmist ei toimu.
- Seda **lõikab** [Lõige](slice.md) ja, kui *Lõika ka taset* on sees, [kauguse järgi kärpimine](depth-and-culling.md#distance-culling) koos soojusega.
- See on ainus asi, mida [väljaulatuvus](camera.md#depth-of-field) hägustab, peale ruudustiku ja kastide.
- 3D-tase **laiendab kaamera kaugtasandit**, kui see on suurem kui andmed: lähi- ja kaugtasand kalibreeritakse andmekogumist, ja eksporditud kaart mitme kilomeetri laiune jääks muidu täielikult kaugtasandi taha ja jätaks tühja vaate. Kaugtasand muutub 3 × taseme horisontaalsest ulatusest, kui see on suurem, lähitasand liigub sellega kaasa (vähemalt kaugus / 100 000), et säilitada sügavuse täpsus, millest katmine sõltub, ja lennukiirus tõstetakse vähemalt ulatuseni / 12. Seda ainult laiendatakse, mitte kunagi kitsendatakse.

## Paneel ülevalt alla {#the-panel-top-to-bottom}

| Osa | Üksikasjad |
|---|---|
| **Kaardipilt…**, **3D-mudel…** | Laadi üks; see asendab praeguse taseme. |
| **Päris maailm taustaks**, **Unusta kaardipaanid** | Ainult andmekogumile, millel on geograafiline viide: ehitab selle alla päris koha tasemena või kustutab allalaaditud paanid. [Maailma taust](world-backdrop.md) |
| **Lihtsustamise siht** | Kolmnurkade eelarve järgmiseks mudeli importimiseks: *Täis - lihtsustamata* (vaikimisi), *Kõrge - 8M*, *Keskmine - 3M*, *Madal - 800k*, *Siluett - 100k*. [3D-tasemed](model-levels.md#simplification) |
| Edenemine ja **Tühista** | Dekodeerimise või importimise ajal. |
| Importimise märkus | Kolmnurgad enne ja pärast, maapinna / ehitiste / vee jaotus, kasutatud detailsuse tase. |
| Nimi ja suurus | `laius×kõrgus px · x × z m/px` pildi jaoks, `N kolmnurka (M-st)` mudeli jaoks. |
| **Läbipaistmatus**, **Heledus** | Mõlemat liiki. |
| Pildi juhtnupud | **Vähenda küllastust**, **Pööra põhi/lõuna**, **Paigutus** (kaks ankrut), **Sobita andmete piiridega**, **Kõrgus**. [Kaardipildid](map-images.md) |
| Mudeli juhtnupud | Maapinna reljeef, vesi, maapinna kolmnurgad, traatmudel, tekstuur, jäädvustatud värv, ehitised, osade klassifikatsioon. [Taseme välimus](level-appearance.md) |
| **Salvesta teeki**, **Eemalda** | [Taseme raamatukogu](level-library.md); Eemalda laadib taseme lahti. |
| **Teek** | Selles brauseris salvestatud tasemed. [Taseme raamatukogu](level-library.md) |

## Selle osa lehed {#pages-in-this-section}

- [Kaardipildid](map-images.md)
- [3D-tasemed](model-levels.md) - vormingud, osad, klassifikatsioon, lihtsustamine, tekstuurid
- [Taseme välimus](level-appearance.md) - iga juhtnupp 3D-taseme jaoks
- [Taseme raamatukogu](level-library.md)
- [Maailma taust](world-backdrop.md) - päris maailm salvestise all avatud andmete põhjal

Kuidas tasemeid mängudest ja mootoritest välja saada, on eraldi eksportijatööriistade asi (vt hoidla [README](https://github.com/Holdi601/3DHeat/blob/main/README.md)); leping, millesse need kirjutavad, on kokku võetud jaotises [3D-tasemed](model-levels.md#the-exporter-contract).

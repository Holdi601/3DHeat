---
title: "Kaardipildid"
parent: "Tasemed ja taustgeomeetria"
nav_order: 1
lang: "et"
source: "map-images.md"
source_hash: "f0bbaa4b019e"
translated: true
outdated: false
---

# Kaardipildid

Kaardipilt on tasane pilt - miniaatkaart, satelliidifoto, põrandaplaan -, mis asetatakse andmete alla, et näha, kus soojus asub. Ütled vaatajale, kuhu pilt kuulub, kinnitades pildil kaks punkti kahe kohaga maailmas (need on "ankrud").

## Laadi ja aseta kaardipilt {#load-and-place-a-map-image}

1. Laadi kõigepealt oma andmed ([Andmete sisestamine](getting-data-in.md)).
2. Jaotises **Taust / tase** vajuta **Kaardipilt…** ja vali pilt. See venitatakse andmete ala peale.
3. Vajuta **Sobita andmete piiridega**, kui pilt on nihkunud. Ankur 1 läheb pildi vasakule ülanurgale, ankur 2 paremale alanurgale, andmete servades.
4. Kui soojus ei joondu pildiga, vali kaks orientiiri, mis on üksteisest kaugel (näiteks hoone kaks vastasnurka või kaks ristmikku). Loe iga orientiiri pikslikoordinaat pildil ja selle maailma asukoht (hoia [mõõdikut](measure.md) kohal, et lugeda **X** ja **Z**).
5. Sisesta need jaotisesse **Paigutus**: **Ankur 1** jaoks orientiiri **px**, **py**, **maailma X**, **maailma Z**; sama **Ankur 2** jaoks.
6. Kontrolli: rada või kuumkoht, mis asub teadaolevalt teel, peaks nüüd asuma sellel teel. Muuda numbreid, kuni see nii on.

![Paigutuse jaotis kahe ankruga ja kaardipildile joonistatud soojus](../assets/img/en/map-images-placement.webp)

Kaks orientiiri peavad erinema nii pikslite veergudes kui ka ridades, muidu ütleb paneel *The two anchors share a pixel row or column* (kaks ankrut jagavad pikslirida või -veergu).

## Laadimine {#loading}

Mis tahes pildivorming, mida brauser suudab dekodeerida. Pilt, mille pikem serv on üle **8192 px**, vähendatakse 8192-ni (suurim serv, mida GPU peab hoidma), ja paneel ütleb *Downscaled from W×H to w×h* (vähendatud mõõtmetelt W×H mõõtmeteni w×h).

Laadimisel venitatakse pilt andmekogumi X-Z piiride peale (või ±1000 ühikut ilma andmekogumita), põhi üleval, andmekogumi madalaimal Y-l. Vaikeväärtused on **Läbipaistmatus** 100%, **Heledus** 0,7, **Vähenda küllastust** 100%, **Pööra põhi/lõuna** sees: hallitatud ja hämardatud, sest tausta ülesanne on aidata kuumkohta leida, mitte sellega võistelda.

## Juhtnupud {#controls}

| Juhtnupp | Vaikimisi | Vahemik | Tähendus |
|---|---|---|---|
| **Läbipaistmatus** | 100% | 0-100% | |
| **Heledus** | 0,7 | 0-2 (hüppamisega 64) | |
| **Vähenda küllastust** | 100% | 0-100% | Hall taust, küllastunud soojus. Kaardi värv võistleks andmete värviga. |
| **Pööra põhi/lõuna** | sees | | Milline pildirida on maailma maksimaalne Z. Selle lülitamine andmekogumi laadimisel joondab ankrud uuesti andmete piiridega. |
| **Paigutus**: Ankur 1, Ankur 2 | pildi nurgad andmete piiridel | | Iga ankur on pildi pikselipunkt - **px** (vasakult, 0 kuni laius) ja **py** (ülevalt, 0 kuni kõrgus) - ning maailmakoordinaat, kus ta asub, **maailma X** ja **maailma Z**. Mastaap ja nihe tulenevad paarist. |
| **Sobita andmete piiridega** | | | Paneb ankur 1 pildi vasakule ülanurgale ja ankur 2 paremale alanurgale, andmete X-Z piiridel. Täpse paigutuse lähtepunkt. Vajab andmekogumit. |
| **Kõrgus** | andmete madalaim Y | andmete min Y - 500 kuni max Y + 500 (hüppamisega max Y + 100 000) | Kaardi tasandi kõrgus. Pane see andmetest veidi allapoole, et miski ei jääks selle taha. |

Nimerida näitab `laius×kõrgus px · x × z m/px`, ehk ühe piksli maailmasuurust igas teljes.

## Stseenis {#in-the-scene}

Pilt on üks tekstuuriga nelinurk kõrgusel. Täieliku läbipaistmatuse korral kirjutab see sügavust ja osaleb [katmises](depth-and-culling.md) maapinnana; alla 100% läbipaistmatuse korral segatakse see ja sügavust ei kirjutata, seega ta ei kata midagi. [Mõõdik](measure.md) mõõdab selle tasandil. [Taseme raamatukogu](level-library.md) salvestab pildi taseme koos ankrutega.

## Dota 2 kaart {#dota-2-map}

**Dota 2 kaart** kõrval **Kaardipilt…**-ile toob joonise praegusest Dota 2 kaardist, mida [OpenDota](https://www.opendota.com) oma mängulehtedel näitab, ja asetab selle tabelite alla, mida [Watcher](https://github.com/Holdi601/3DHeat-Watcher) kirjutab Dota 2 salvestistest ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Pilt tuuakse opendota.com-ist alles siis, kui nuppu vajutatakse, ja see ei ole 3DHeati osa; uusima versiooni joonis võetakse OpenDota enda loendist ja 7.40 joonis siis, kui loendit ei saa lugeda.

| | |
|---|---|
| Allikas | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Paigutus | OpenDota kalibreerimine: pilt katab Dota maailmaühikuid -8192 kuni 8064 mõlemas teljes (128-ühikulised ruudud 64 kuni 191), põhi üleval. Tabeli telgedega (Z üleval, Y pööratud) on see maailma X -8192 kuni 8064 ja maailma Z -8064 kuni 8192. Umbes 18 ühikut piksli kohta. |
| Kõrgus | 0. Kangelased seisavad 0 kuni umbes 600. |
| Välimus | Heledus 0,8, küllastuse vähendus 50%. |

Kontrollitud avaliku mängu salvestisel versioonist 7.40: iga kangelase rada järgib joonistatud radu ja torned, kasarmud ning vanad, mida salvestis paigutatakse, langevad joonistatud baasidele. Vaade **Ülevalt** näitab kaarti, põhi ekraani all, nagu see näitab mis tahes Z-üles tabelit, kus Y on pööratud.

Joonis on OpenDota oma, Valve'i kaardist; Valve ei toeta 3DHeatit.

### 3D-kaart {#the-3d-map}

Kui Dota 2 on paigaldatud, teeb eraldi tööriist [3DHeat Dota](https://holdi601.github.io/3DHeat-Ext-Dota/) (`heat3d-dota-maps level -o dota.glb`; Watcheri käsk [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) käivitab selle samuti) kaardi 3D-s mängu enda failidest: pinnas, kaljud, vesi, puud ja hooned, korduste tabelite ühikutes ja telgedes. Laadi fail üks kord nupuga **3D-mudel…**: vaatur tunneb selle ära osade järgi (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` failis `dotaMap.ts`), paneb selle kohe [tasemete raamatukogusse](level-library.md), asendades vanema, ja ütleb seda. Edaspidi laadib **Dota 2 kaart** selle 3D-kaardi raamatukogust, selle asemel et joonist laadida; kui raamatukogus seda pole, laadib see joonise ja ütleb, kuidas 3D-kaarti teha. Fail tuleb sinu enda paigaldusest ja jääb sinu arvutisse.

## Arendajatele {#for-developers}

### Kuidas ankrud joonist paigutavad {#how-the-anchors-place-the-image}

[`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts) järgi, ankrutega *a* ja *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Kaks ankrut määravad mõlemal teljel sõltumatult nii mastaabi kui nihke, nii et kaarti saab X ja Z suunas erinevalt venitada, kuid mitte pöörata. Ankrud peavad erinema **mõlemas** pikslikoordinaadis; kui nad jagavad rida või veergu, ei saa mastaapi tuletada, kaarti ei joonistata ja paneel ütleb *The two anchors share a pixel row or column*.

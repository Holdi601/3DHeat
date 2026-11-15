---
title: "3D tasemed"
parent: "Tasemed ja taustgeomeetria"
nav_order: 2
lang: "et"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# 3D tasemed

3D-tase on koha mudel – mäed, tänavad, hooned –, kus sinu andmed asuvad. See lubab näha, millisel korrusel, mäel või katusel soojus on. Vaataja jagab selle maismaaks (tahke), ehitisteks (läbipaistev, et saaksid sisse vaadata) ja veeks.

## Lae 3D-tase {#load-a-3d-level}

1. Lae kõigepealt oma andmed ([Andmete sisestamine](getting-data-in.md)). Mudel peab kasutama sama maailmaruumi ja ühikut kui andmed, Y üleval.
2. Jaotises **Taust / tase** vali **Lihtsustamise siht**. Jäta see väärtusele *Täis – ilma lihtsustamata*, kui mudel just ei ole väga suur.
3. Vajuta **3D-mudel…** ja vali `.glb`, `.gltf`, `.obj`, `.stl` või `.ply` fail.
4. Oota edenemisrida. **Tühista** peatab laadimise.
5. Vajuta vaates **F**. Maismaa on tahke, ehitised on läbipaistvad kestad, vesi on lame.
6. Häälesta välimust jaotises [Taseme välimus](level-appearance.md). Tulemuse säilitamiseks vajuta **Salvesta teeki** ([Taseme raamatukogu](level-library.md)).

![3D-tase laetud: läbipaistmatu maismaa koos kontuurjoontega, läbipaistvad hooned, lame vesi](../assets/img/en/model-levels-loaded.webp)

**3D-mudel…** laeb taseme võrgustiku. Seda parsitakse, klassifitseeritakse ja lihtsustatakse taustatöötajas ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)), edenemisrea ja **Tühista** nupuga: *Mudeli lugemine*, *Faili parsimine*, *N tekstuuri pakkimine*, *N osa klassifitseerimine*, *Maismaa lihtsustamine (N kolm.)*, *Ehituste lihtsustamine (N kolm.)*, *Traatmudeli ehitamine*.

## Vormingud {#formats}

| Vorming | Mis loetakse | Piirangud |
|---|---|---|
| `.glb` | Iga võrgu primitiiv režiimiga `mode` 4 (kolmnurgad) või ilma režiimita, iga sõlme maailmateisendusega; `POSITION`; `COLOR_0` (vec3 või vec4) tippude värvina; materjali `baseColorTexture` ja selle `TEXCOORD_n` tekstuurina; sõlmede ja võrkude nimed osade nimedena. | Jooned ja punktid jäetakse vahele. |
| `.gltf` | Sama. | Ainult manustatud puhvritega: glTF, mis viitab välisele `.bin` failile, lükatakse tagasi teatega *Ekspordi ühe .glb failina, et geomeetria oleks manustatud.* |
| `.obj` | Tahud, `o` ja `g` plokid osadena. | Ainult geomeetria (materjale pole). |
| `.stl` | Binaarne ja ASCII (`solid …`). | Üks osa. |
| `.ply` | Ainult ASCII. | Binaarne PLY lükatakse tagasi teatega *Teisenda .glb või binaarseks .stl-iks.* |

Ainult geomeetria: asukohad, normaalid ja kolmnurgad ühendatud üheks puhvriks, lisaks värvid ja tekstuuri koordinaadid, kui need on olemas ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Mudel ilma kolmnurkadeta lükatakse tagasi. Mudel peab olema samas maailmaruumis ja ühikus kui andmed (Y üleval): midagi ei teisendata sobitamiseks.

## Maismaa, ehitised ja vesi {#ground-structures-and-water}

Tase jaotatakse importimisel kolme klassi, sest need vajavad vastupidist käsitlust ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Maismaa** – joonistatakse läbipaistmatuna ja varjutatud reljeefivihjetega (kalle, kontuurid, kõrgusgradient), et asukohta saaks sellega võrrelda.
- **Ehitised** – hooned ja rekvisiit seisavad kaamera ja nende sees oleva soojuse vahel, seega joonistatakse need **läbipaistva kestana** (kahvatud tahud heleda servaga ja dubleerimata servad) – või tekstuuriga juhul tahkena oma tekstuuridega.
- **Vesi** – lame, ilma maastikuvihjeteta: kontuurjoon üle järve on mõttetu.

Iga osa (glTF sõlm, OBJ objekt või rühm) klassifitseeritakse eraldi esimese kohaldatava reegli järgi:

1. **Eksportija silt.** Nimi, mis algab `ground:`, `structure:` või `water:` (või `|` asemel `:`), võetakse sõna-sõnalt. Projekti enda eksportijad märgistavad iga osa nii.
2. **Veenimed.** `water` eraldi sõnana (mitte *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Maismaa nimed.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Ehituste nimed.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geomeetria.** Osa, mis katab rohkem kui 25% kaardi X-Z pindalast ja mille kolmnurkade pindalast üle 60% on ülespoole, on maismaa. Osa, mille ülespoole suunatud osa on alla 45% või mis on kõrgem kui 15% taseme kõrgusest ja katab alla 10% pindalast, on ehitis. Ülespoole suunatud osa kaalutakse pindala järgi, nii et maja ei nimetata lameks sellepärast, et tal on katus.
6. **Muidu maismaa** – ebaselge osa vaikimisi maismaa, sest peaaegu nähtamatu kesta vaikeväärtus teeks taseme välja nagu renderdamise vea.

Mudel, mis on üks osa, mis klassifitseeriti ehitiseks, muudetakse selle asemel maismaaks (*single unnamed mesh - treated as ground*).

### Navigeerimisvõrgud {#navigation-meshes}

Osa nimega `nav:…` (taseme eksportija `nav:walkable`) on navigeerimisvõrk: kohad, kuhu sõdur saab seista. See on loetletud maismaana (*navigation mesh - not drawn, as it lies on the ground; clicks still find it*), aga **ei joonistata**. See on asetatud maapinna peale, millest see genereeriti, sentimeetrite täpsusega samal tasapinnal, ja kui joonistataks maismaana, siis kaks pinda võitleksid iga piksli pärast: taseme puhul, millel on küpsetatud maapinna tekstuur, kuvati kogu mängitav ala kõvade servadega hallide ja beežide laikudena, üks iga navi kolmnurga kohta. See säilitatakse lihtsustamata, et [klõpsuga valimine](camera.md#click-to-pick) saaks öelda, kas koht on läbitav. Raamatukogu kirjed seda ei säilita.

**Näita osade klassifikatsiooni (N)** paneelil (kuvatakse mudelite puhul, millel on rohkem kui üks osa) on nimekiri iga osast koos klassi ja põhjusega – *eksportija märgistatud*, *nimi sobib mustriga*, *katab X% kaardist, Y% ülespoole*, *Y% ülespoole, Z% taseme kõrgusest*, *ebaselge – vaikimisi maismaa*. Selle muutmiseks nimeta osa algmudelis ümber ja impordi uuesti; jaotus on küpsetatud indeksipuhvritesse.

## Lihtsustamine {#simplification}

**Lihtsustamise siht** seab kolmnurkade eelarve järgmisele impordile ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Seade | Kolmnurgad |
|---|---|
| *Täis – ilma lihtsustamata* (vaikimisi) | kõik |
| *Kõrge – 8M kolmnurka* | 8 000 000 |
| *Keskmine – 3M kolmnurka* | 3 000 000 |
| *Madal – 800k kolmnurka* | 800 000 |
| *Siluett – 100k kolmnurka* | 100 000 |

Eelarve jaguneb **60% ehitistele ja 40% maismaale**, lihtsustatakse eraldi – ehitised kaotavad kuju kõige kiiremini vähendamisel. Vett ei lihtsustata. Lihtsustamine on servade kokkutõmbamine kvadriliste veavormidega ([meshoptimizer](https://github.com/zeux/meshoptimizer), WebAssemblyga) pärast kattuvate tippude ühendamist, nii et siluetid ja kõvad servad säilivad. Importimise märkus näitab `allikas → nüüd kolmnurki, kõrvalekalle X%`, maismaa / ehituste / vee jaotust osade lõikes ning – kui kasutati *Täis* mudelil, mis ületab 8M kolmnurka – soovitab *Kõrge* (kuni 30M) või *Keskmine* (üle selle). Ilma WebAssemblyta on lihtsustaja kättesaamatu ja import ütleb seda.

Projekti enda eksportijate tasemetel on eelarve juba määratud; siht on olemas toorele kunstile, millel pole taga eelarvet.

## Tekstuurid {#textures}

`.glb`, mille osadel on baasvärvi tekstuurid, joonistatakse nendega – näiteks võidusõidu raja eksport sisaldab ühte tekstuuri iga maastikuruudu kohta ja ühte iga paigutatud mudeli kohta.

Maismaa tekstuur kuvatakse vaikimisi, kui see on olemas; tekstuuridega ehitised algavad **tahkena oma tekstuuridega** (äärekivid, kaitseraiud, rehvidest seinad ja märgid on tee servad, mitte hooned, mida sisse vaadata), kus traatmudel on väljas ja tasane varjutus väljas. Vt [Taseme välimus](level-appearance.md).

## Suured tasemed {#large-levels}

- Üle **300 000** ehituse kolmnurga lülitub ehituse servad vaikimisi välja ja tahkude läbipaistmatus 35%: kui iga piksli kohta on serv, paistab piirkond lamedana valgena.
- Kaamera kaugusetasand laieneb taseme mahutamiseks ([Tasemed](levels.md#what-a-level-does-for-the-heat)).

## Arendajatele {#for-developers}

### Tekstuuriatlas {#texture-atlas}

Iga tekstuur pakitakse **üheks atlaseks** importimise töötajas ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), nii et tase jääb mõlema tagaosa puhul üheks joonistuseks, üheks proovivõtjaks ja üheks tekstuuri koordinaadi atribuudiks:

- pakitud riiulitesse iga pildi enda suuruses, kahandatud ainult siis, kui komplekt ei mahuks **8192 px** kummalegi poole (WebGPU vaikimisi tekstuuri suuruse piir);
- **16-pikslane vahe** iga pildi ümber ja ainult need 5 mip-taset, mida see vahe kaitseb, nii et kaugel olev silt ei proovi kunagi naabri tekstuuri;
- **kordavad tekstuurid** jäävad kordavaks. Pilt, mille glTF proovivõtja kordab (glTF vaikimisi) ja mille tekstuuri koordinaadid jäävad väljapoole 0..1 – tellisseina UV kulgeb mööda seda 0-st 40-ni – muutub *plaadiks*: selle tipud säilitavad oma koordinaadid ja 16-bitise plaadi numbri, ning varjundid mähivad koordinaadi plaadi ristkülikusse piksli kaupa, võttes mip-taseme mähkimata koordinaadist, et sõlmed ei paistaks. Plaadi vahe hoiab oma vastasserva. Telg, mille proovivõtja kinnitab, on kinnitatud; pilt, mille koordinaadid jäävad 0..1 vahele, joonistatakse nagu varem. Tasemel, millel on plaate, on tipu kohta 4 baiti rohkem.

### Eksportija leping {#the-exporter-contract}

Mida vaataja tasemelt vajab, olenemata sellest, kes selle tegi:

- üks iseseisev `.glb`;
- float32 `POSITION`, kolmnurkade primitiivid;
- sõlmede nimed `ground:*`, `structure:*` ja `water:*` (kõik muu klassifitseeritakse ülaltoodud reeglite järgi) ning `nav:*` navigeerimisvõrgu jaoks, mis säilitatakse, aga ei joonistata;
- maailmaruumi koordinaadid, **Y üleval**, samas ühikus kui telemeetria, nii et andmed asuvad tasemel ilma paigutamise sammuta.

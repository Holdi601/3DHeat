---
title: "GPU mälu residentsus"
parent: "Renderdamise sisemine tööpõhimõte"
nav_order: 5
lang: "et"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# GPU mälu residentsus

Graafikakaardil on ainult teatud hulk mälu. Kui sinu andmed ei mahu, näitab vaataja, mis mahub, ja ütleb seda: statistikakattele ilmub merevaigukarva rida **Pole mälus** koos arvuga ridadest, mis jäeti välja. Lühendatud andmestik, mis paistab täielik, on kõige halvem viga, mida analüüsitööriist teha saab, seega seda rida ei peideta kunagi.

![Statistikakate merevaigukarva reaga Pole mälus](../assets/img/en/gpu-memory-not-resident.webp)

Et mahutada rohkem, tõsta GPU eelarvet jaotises **Ressursieelarved** ja laadi uuesti ([Mälu ja eelarved](memory-and-budgets.md#raising-the-gpu-budget)), kitsenda kõigepealt andmeid või kasuta kaarti, millel on rohkem mälu.

## Arendajatele {#for-developers}

### Kuidas read GPU-l salvestatakse {#how-rows-are-stored-on-the-gpu}

Read laaditakse üles korra, kui andmestik saabub, **tükkidena** kaupa 8 388 608 rida (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Iga tükk kvantiseeritakse oma piirkasti ja ajavahemiku järgi:

| Andmed | Formaat | Baiti rea kohta |
|---|---|---|
| Asukoht X, Y, Z ja grupi ID | neli 16-bitist märgita täisarvu (RGBA16UI WebGL2-l); X, Y, Z tüki piirkastis | 8 |
| Aeg ja eluiga (kui andmestikus on nii aeg kui isik) | kaks 16-bitist märgita täisarvu (RG16UI): aeg tüki ajavahemikus; eluiga, kus 65 535 tähendab "järgmist proovi ei ole" | 4 |

Tüki kaupa piirkastid on need, mis teevad 16 bitist piisavalt: tükk katab tavaliselt osa kaardist, nii et kvantiseerimise samm jääb kilomeetrite laiuse kaardi puhul alla sentimeetri, mis on palju väiksem kui päris telemeetria müra. Neljandas kanalis olev grupi ID on tasuta, ja just sellepärast saab gruppe olla kõige rohkem 4 096 ([Grupid](sessions-persons-groups.md#limits)).

WebGL2-l on iga tükk tekstuur, mis on 8 192 texelit lai ja täidetud täisridadeni; ridadele pääseb `gl_VertexID` kaudu kaadripõhise plokiindeksi tekstuuri abil. WebGPU-l on need storage-puhvrid.

Muu rea-kohane GPU mälu, mida eraldatakse kasutamisel:

- iga aktiivne veerufilter ([Filtrid](filters.md)): 4 baiti rea kohta (32-bitised ujukomaväärtused või kategooriate ID-d), üles laaditud tüki kaupa esimesel kasutamisel;
- [joonesoojus](line-heat.md): 8 baiti rea kohta (iga lõigu algus, kvantiseeritud andmete piirkastis, ja selle lipud), kui joonerežiim on sees.

Lisaks renderdussihtmärgid: stseeni värv ja sügavus, soojussihtmärk ja selle abipuhver (neli kanalit lehel [Võistkondade soojus](team-heat.md)), ning sügavuse koorimise kihid [varjamiseks](depth-and-culling.md); ja taseme geomeetria.

### Eelarve jõustatakse üleslaadimisel {#the-budget-is-enforced-at-upload}

WebGL aktsepteerib eraldusi, mida ei suuda teenindada, ja siis kas kaotab konteksti või langeb süsteemimälule tohutu kuluga. Seega jõustatakse GPU eelarve andmestiku üleslaadimisel ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- tükid laaditakse järjekorras (see tähendab ajajärjekorras), kuni nad mahuvad;
- esimene tükk, mis ei mahu, laaditakse **osaliselt**: nii palju täisi tekstuuriride, kui järelejäänud eelarvesse mahub, mitte ei jäeta seda üldse laadimata. Nii näitab eelarve, mis ei mahuta kogu tükki, siiski nii palju kui suudab; ja kuna read on ajajärjestuses, on nähtav osa ajas järjepidev lõik;
- kõik pärast seda on **pole mälus**.

Puudujääki ei peideta: statistikakate näitab merevaigukarva rida **Pole mälus** koos ridade arvuga, mis ei mahtunud, alati kui see on suurem kui null. Kärbitud andmestik, mis paistab täielik, on kõige halvem viga, mida analüüsitööriistal võib olla. Laadimise eel tehtav [mahtuvuskontroll](memory-and-budgets.md#the-fit-check) on mõeldud selle juhtumi ennetamiseks.

Renderdaja kasutab GPU eelarvet jaotisest **Ressursieelarved**, sama arvu, mida kasutab mahtuvuskontroll. See on ka tuvastatud arvust suurem, kuni liugur lubab ([Eelarve tõstmine](memory-and-budgets.md#raising-the-gpu-budget)). See rakendatakse andmestiku üleslaadimisel; selle hiljem muutmine mõjub järgmisel laadimisel.

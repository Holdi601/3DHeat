---
title: "3D lygiai"
parent: "Lygiai ir fono geometrija"
nav_order: 2
lang: "lt"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# 3D lygiai

3D lygis yra vietos modelis - kalvos, gatvės, pastatai - kuriame guli jūsų duomenys. Jis leidžia matyti, ant kurio aukšto, kalvos ar stogo yra šiluma. Žiūryklė jį skaido į žemę (kieta), statinius (permatomi, kad galėtumėte pažiūrėti į vidų) ir vandenį.

## Įkelkite 3D lygį {#load-a-3d-level}

1. Pirmiausia įkelkite savo duomenis ([Duomenų įkėlimas](getting-data-in.md)). Modelis turi naudoti tą patį pasaulio erdvę ir vienetą kaip duomenys, Y aukštyn.
2. Skiltyje **Fonas / lygis** pasirinkite **Supaprastinimo tikslas**. Palikite *Full - no simplification* (Pilnas - be supaprastinimo), nebent modelis labai didelis.
3. Paspauskite **3D modelis…** ir pasirinkite `.glb`, `.gltf`, `.obj`, `.stl` ar `.ply` failą.
4. Palaukite progreso eilutės. **Atšaukti** sustabdo.
5. Vaizde paspauskite **F**. Žemė yra kieta, statiniai - permatomi apvalkalai, vanduo - plokščias.
6. Sureguliuokite išvaizdą [Lygio išvaizda](level-appearance.md) skyriuje. Paspauskite **Įrašyti į biblioteką**, kad išsaugotumėte rezultatą ([Lygių biblioteka](level-library.md)).

![Įkeltas 3D lygis: nepermatoma žemė su kontūrinėmis linijomis, permatomi pastatai, plokščias vanduo](../assets/img/en/model-levels-loaded.webp)

**3D modelis…** įkelia lygio tinklelį. Jis analizuojamas, klasifikuojamas ir supaprastinamas fono darbininke ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) su progreso eilute ir **Atšaukti**: *Reading model* (Skaitomas modelis), *Parsing file* (Analizuojamas failas), *Packing N textures* (Pakuojama N tekstūrų), *Classifying N parts* (Klasifikuojama N dalių), *Simplifying ground (N tris)* (Supaprastinama žemė (N trik.)), *Simplifying structures (N tris)* (Supaprastinami statiniai (N trik.)), *Building wireframe* (Kuriamas karkasas).

## Formatai {#formats}

| Formatas | Ką skaito | Apribojimai |
|---|---|---|
| `.glb` | Kiekvieną tinklelio primityvą su `mode` 4 (trikampiai) arba be režimo, taikant kiekvieno mazgo pasaulio transformaciją; `POSITION`; `COLOR_0` (vec3 arba vec4) kaip viršūnės spalvą; medžiagos `baseColorTexture` ir jos `TEXCOORD_n` kaip tekstūrą; mazgų ir tinklelių pavadinimus kaip dalių pavadinimus. | Linijos ir taškai praleidžiami. |
| `.gltf` | Tas pats. | Tik su įterptais buferiais: glTF, kuris nurodo išorinį `.bin`, atmetamas su *Export as a single .glb so the geometry is embedded.* (Eksportuokite kaip vieną .glb, kad geometrija būtų įterpta.) |
| `.obj` | Paviršiai, su `o` ir `g` blokais kaip dalimis. | Tik geometrija (be medžiagų). |
| `.stl` | Dvejetainis ir ASCII (`solid …`). | Viena dalis. |
| `.ply` | Tik ASCII. | Dvejetainis PLY atmetamas su *Convert to .glb or binary .stl.* (Konvertuokite į .glb arba dvejetainį .stl.) |

Tik geometrija: padėtys, normalės ir trikampiai, sujungti į vieną buferį, kartu su spalvomis ir tekstūros koordinatėmis, kur jos yra ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Modelis be trikampių atmetamas. Modelis turi būti tame pačiame pasaulio erdvėje ir vienete kaip duomenys (Y aukštyn): niekas nepakeičiama, kad tiktų.

## Žemė, statiniai ir vanduo {#ground-structures-and-water}

Lygis importavimo metu skaidomas į tris klases, nes jos nori priešingo apdorojimo ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Žemė** - piešiama nepermatoma ir šešėliuojama su reljefo ženklais (nuolydis, kontūrai, aukščio perėjimas), kad padėtį galima būtų skaityti jos atžvilgiu.
- **Statiniai** - pastatai ir objektai stovi tarp kameros ir šilumos, esančios jų viduje, todėl jie piešiami kaip **permatomas apvalkalas** (blyškūs paviršiai su ryškiu kraštu ir be pasikartojančių briaunų) - arba, kai turi tekstūras, kietai su savo tekstūromis.
- **Vanduo** - plokščias, be reljefo ženklų: kontūro linija per ežerą būtų nesąmonė.

Kiekviena dalis (glTF mazgas, OBJ objektas ar grupė) klasifikuojama atskirai pagal pirmą taikomą taisyklę:

1. **Eksportuotojo žymė.** Pavadinimas, prasidedantis `ground:`, `structure:` ar `water:` (arba su `|` vietoj `:`), priimamas kaip yra. Projekto eksportuotojai visas dalis žymi taip.
2. **Vandens pavadinimai.** `water` kaip žodis (ne *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Žemės pavadinimai.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Statinių pavadinimai.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometrija.** Dalis, uždengianti daugiau nei 25% žemėlapio X-Z ploto, su daugiau nei 60% savo trikampių ploto, nukreipto aukštyn, yra žemė. Dalis, kurios mažiau nei 45% nukreipta aukštyn, arba aukštesnė nei 15% lygio aukščio, uždengianti mažiau nei 10% ploto, yra statinys. Aukštyn nukreiptas dalis svertinis pagal plotą, todėl namas nelaikomas plokščiu dėl to, kad turi stogą.
6. **Kitu atveju žemė** - dviprasmiška dalis numatytai yra žemė, nes numatytas beveik nematomas apvalkalas padarytų lygį panašų į atvaizdavimo klaidą.

Modelis, kuris yra viena dalis, klasifikuota kaip statinys, vietoj to paverčiamas žeme (*single unnamed mesh - treated as ground*) (vienas nepavadintas tinklelis - traktuojamas kaip žemė).

### Navigacijos tinklai {#navigation-meshes}

Dalis, pavadinta `nav:…` (lygio eksportuotojo `nav:walkable`), yra navigacijos tinklas: vieta, kur kareivis gali stovėti. Ji įrašoma kaip žemė (*navigation mesh - not drawn, as it lies on the ground; clicks still find it*) (navigacijos tinklas - nepiešiamas, nes guli ant žemės; spustelėjimai vis tiek ją randa), bet **nepiešiama**. Ji uždengiama ant žemės, iš kurios buvo sugeneruota, sutampanti su ja iki centimetrų, ir jei būtų piešiama kaip žemė, du paviršiai kovotų dėl kiekvieno pikselio: lygyje su įkepta žemės tekstūra visa žaidžiama zona atrodė kaip aštriais kraštais riboti pilki ir smėlio spalvos plotai, po vieną kiekvienam nav trikampiui. Ji išsaugoma nesupaprastinta, kad [spustelėjimo pasirinkimas](camera.md#click-to-pick) galėtų pasakyti, ar vieta yra pėsčiųjų pasiekiama. Bibliotekos įrašai jos neišsaugo.

**Rodyti dalių klasifikaciją (N)** skydelyje (rodoma modeliams, turintiems daugiau nei vieną dalį) išvardija kiekvieną dalį su jos klase ir priežastimi - *labelled by the exporter* (pažymėta eksportuotojo), *name matches pattern* (pavadinimas atitinka šabloną), *covers X% of the map, Y% up-facing* (uždengia X% žemėlapio, Y% nukreipta aukštyn), *Y% up-facing, Z% of level height* (Y% nukreipta aukštyn, Z% lygio aukščio), *ambiguous - defaulted to ground* (dviprasmiška - numatytai žemė). Norint pakeisti vieną, pervadinkite dalį pradiniame modelyje ir importuokite iš naujo; skirstymas įkepamas į indeksų buferius.

## Supaprastinimas {#simplification}

**Supaprastinimo tikslas** nustato trikampių biudžetą kitam importui ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Nustatymas | Trikampiai |
|---|---|
| *Full - no simplification* (Pilnas - be supaprastinimo) (numatyta) | visi |
| *High - 8M triangles* (Aukštas - 8 mln. trikampių) | 8 000 000 |
| *Medium - 3M triangles* (Vidutinis - 3 mln. trikampių) | 3 000 000 |
| *Low - 800k triangles* (Žemas - 800 tūkst. trikampių) | 800 000 |
| *Silhouette - 100k triangles* (Siluetas - 100 tūkst. trikampių) | 100 000 |

Biudžetas padalijamas **60% statiniams ir 40% žemei**, supaprastinamas atskirai - statiniai greičiausiai praranda formą retinant. Vanduo nesupaprastinamas. Supaprastinimas yra briaunų sujungimas su kvadratinių klaidų metrikomis ([meshoptimizer](https://github.com/zeux/meshoptimizer), per WebAssembly), po sutampančių viršūnių sujungimo, todėl siluetai ir aštrios briaunos išlieka. Importo pastaboje rašoma `šaltinis → dabar trikampių, nukrypimas X%`, žemės / statinių / vandens paskirstymas tarp dalių ir - kai buvo naudotas *Full* modelyje, didesniame nei 8 mln. trikampių - siūloma *High* (iki 30 mln.) arba *Medium* (daugiau). Be WebAssembly supaprastintojas neprieinamas, ir importas tai pasako.

Lygiai iš projekto eksportuotojų jau turi biudžetą; tikslas skirtas neapdorotam menui, kuris neturi jokio biudžeto.

## Tekstūros {#textures}

`.glb`, kurio dalys turi bazinės spalvos tekstūras, piešiamas su jomis - pavyzdžiui, lenktynių trasos eksportas turi po vieną kiekvienai reljefo plytelei ir po vieną kiekvienam įdėtam modeliui.

Žemės tekstūra rodoma pagal numatymą, kai ji yra; statiniai, turintys tekstūras, pradeda **kieti, su savo tekstūromis** (bordiūrai, apsauginiai atitvarai, padangų sienos ir ženklai yra kelio kraštai, o ne pastatai, į kuriuos reikia žiūrėti vidų), su karkasu išjungtu ir plokščiu šešėliavimu išjungtu. Žr. [Lygio išvaizda](level-appearance.md).

## Dideli lygiai {#large-levels}

- Viršijus **300 000** statinių trikampių, statinių briaunos pradeda išjungtos, o paviršių permatomumas yra 35%: kai briauna yra kiekviename piksely, rajonas atrodo kaip plokščiai baltas.
- Kameros tolimoji plokštuma išplatėja, kad tilptų lygis ([Lygiai](levels.md#what-a-level-does-for-the-heat)).

## Kūrėjams {#for-developers}

### Tekstūrų atlasas {#texture-atlas}

Kiekviena tekstūra supakuojama į **vieną atlasą** importo darbininke ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), todėl lygis lieka vienu piešimu, vienu semplerių ir viena tekstūros koordinačių savybe abiejuose varikliuose:

- supakuojama lentynomis kiekvieno vaizdo dydžiu, sumažinama tik tada, kai rinkinys netilptų **8192 px** bet kuria kryptimi (WebGPU numatytoji tekstūros dydžio riba);
- **16 pikselių tarpas** aplink kiekvieną vaizdą ir tik tie 5 mip lygiai, kuriuos tas tarpas apsaugo, todėl tolimas ženklas niekada nemėginė kaimyno tekstūros;
- **kartojamos tekstūros** lieka kartojamos. Vaizdas, kurio glTF semplerius kartoja (glTF numatytasis), o tekstūros koordinatės išeina už 0..1 - pvz., plytų siena, kurios UV eina nuo 0 iki 40 - tampa *plytele*: jos viršūnės išlaiko savo koordinates ir 16 bitų plytelės numerį, o šešėliuotojai koordinatę kiekviename piksely įveda į plytelės stačiakampį, mip lygį imdami iš neįvestos koordinatės, kad siūlės nesimatytų. Plytelės tarpas laiko savo priešingą kraštą. Ašis, kurios semplerius spaudžia, yra suspaudžiama; vaizdas, kurio koordinatės lieka 0..1 ribose, piešiamas kaip anksčiau. Lygis su plytelėmis kainuoja 4 baitus daugiau viršūnei.

### Eksportuotojo sutartis {#the-exporter-contract}

Ko žiūryklei reikia iš lygio, kad ir kas jį sukūrė:

- vienas savarankiškas `.glb`;
- float32 `POSITION`, trikampių primityvai;
- mazgų pavadinimai `ground:*`, `structure:*` ir `water:*` (bet kas kita klasifikuojama pagal aukščiau nurodytas taisykles), ir `nav:*` navigacijos tinklui, kuris išsaugomas, bet nepiešiamas;
- pasaulio erdvės koordinatės, **Y aukštyn**, tame pačiame vienete kaip telemetrija, todėl duomenys guli ant lygio be jokio išdėstymo žingsnio.

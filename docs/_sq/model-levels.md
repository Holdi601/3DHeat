---
title: "Nivelet 3D"
parent: "Nivelet dhe gjeometria e sfondit"
nav_order: 2
lang: "sq"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# Nivelet 3D

Një nivel 3D është një model i vendit - kodra, rrugë, ndërtesa - brenda të cilit ndodhen të dhënat tuaja. Ai të lejon të shohësh në cilin kat, kodër ose çati është nxehtësia. Shikuesi e ndan atë në tokë (e ngurtë), struktura (transparente, që të shikosh brenda) dhe ujë.

## Ngarkoni një nivel 3D {#load-a-3d-level}

1. Ngarkoni së pari të dhënat tuaja ([Si të futni të dhënat](getting-data-in.md)). Modeli duhet të përdorë të njëjtën hapësirë botërore dhe njësi si të dhënat, me Y lart.
2. Te **Sfondi / niveli**, zgjidhni një **Objektiv i thjeshtimit**. Lëreni te *I plotë - pa thjeshtim* përveç nëse modeli është shumë i madh.
3. Shtypni **Model 3D…** dhe zgjidhni një skedar `.glb`, `.gltf`, `.obj`, `.stl` ose `.ply`.
4. Prisni rreshtin e progresit. **Anulo** e ndalon.
5. Shtypni **F** në pamje. Toka është e ngurtë, strukturat janë guaska transparente, uji është i sheshtë.
6. Rregulloni pamjen te [Pamja e nivelit](level-appearance.md). Shtypni **Ruaj në bibliotekë** për ta mbajtur rezultatin ([Biblioteka e niveleve](level-library.md)).

![Një nivel 3D i ngarkuar: tokë e errët me vija konturi, ndërtesa transparente, ujë i sheshtë](../assets/img/en/model-levels-loaded.webp)

**Model 3D…** ngarkon rrjetën e nivelit. Ajo analizohet, klasifikohet dhe thjeshtohet në një punëtor në sfond ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) me një rresht progresi dhe **Anulo**: *Duke lexuar modelin*, *Duke analizuar skedarin*, *Duke paketuar N tekstura*, *Duke klasifikuar N pjesë*, *Duke thjeshtuar tokën (N trek.)*, *Duke thjeshtuar strukturat (N trek.)*, *Duke ndërtuar telin*.

## Formatet {#formats}

| Formati | Çfarë lexohet | Kufizimet |
|---|---|---|
| `.glb` | Çdo primitiv rrjete me `mode` 4 (trekëndësha) ose pa mode, me transformimin botëror të çdo nyje të zbatuar; `POSITION`; `COLOR_0` (vec3 ose vec4) si ngjyrë kulmi; `baseColorTexture` e materialit dhe `TEXCOORD_n` e tij si tekstura; emrat e nyjeve dhe rrjetave si emra pjesësh. | Vijat dhe pikat kapërcehen. |
| `.gltf` | E njëjta gjë. | Vetëm me buffer të integruara: një glTF që i referohet një `.bin` të jashtme refuzohet me *Eksportoje si një skedar të vetëm .glb, që gjeometria të jetë e integruar.* |
| `.obj` | Faqe, me blloqet `o` dhe `g` si pjesë. | Vetëm gjeometri (pa materiale). |
| `.stl` | Binar dhe ASCII (`solid …`). | Një pjesë. |
| `.ply` | Vetëm ASCII. | PLY binar refuzohet me *Konverto në .glb ose .stl binar.* |

Vetëm gjeometri: pozicionet, normalet dhe trekëndëshat e bashkuar në një buffer të vetëm, plus ngjyrat dhe koordinatat e teksturës aty ku ka ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Një model pa trekëndësha refuzohet. Modeli duhet të jetë në të njëjtën hapësirë botërore dhe njësi si të dhënat (Y lart): asgjë nuk transformohet për t'u përshtatur.

## Toka, strukturat dhe uji {#ground-structures-and-water}

Një nivel ndahet në tri klasa gjatë importit, sepse kërkojnë trajtime të kundërta ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Toka** - vizatohet e errët dhe e hijezuar me shenja relievi (pjerrësi, konturi, një rampë lartësie) që pozicioni të lexohet kundrejt saj.
- **Strukturat** - ndërtesat dhe rekuizitat qëndrojnë midis kamerës dhe nxehtësisë brenda tyre, kështu që vizatohen si një **guaskë transparente** (faqe të zbehta me një buzë të ndritshme, plus skajet e pa përsëritur) - ose, kur kanë tekstura, të ngurta me teksturat e tyre.
- **Uji** - i sheshtë, pa shenja terreni: një vijë konture përgjatë një liqeni është e pakuptimtë.

Çdo pjesë (nyje glTF, objekt OBJ ose grup) klasifikohet më vete, nga rregulli i parë që zbatohet:

1. **Etiketa e eksportuesit.** Një emër që fillon me `ground:`, `structure:` ose `water:` (ose me `|` në vend të `:`) merret për të mirëqenë. Eksportuesit e vetë projektit i etiketojnë kështu çdo pjesë.
2. **Emrat e ujit.** `water` si fjalë (jo *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Emrat e tokës.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Emrat e strukturave.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Gjeometria.** Një pjesë që mbulon më shumë se 25% të sipërfaqes X-Z të hartës, me më shumë se 60% të sipërfaqes së trekëndëshave të kthyer lart, është tokë. Një pjesë me më pak se 45% të kthyer lart, ose më e lartë se 15% e lartësisë së nivelit ndërkohë që mbulon më pak se 10% të sipërfaqes së tij, është strukturë. Pjesa e kthyer lart peshohet sipas sipërfaqes, kështu që një shtëpi nuk quhet e sheshtë për shkak të çatisë.
6. **Përndryshe tokë** - një pjesë e paqartë parazgjedhet si tokë, sepse një guaskë parazgjedhur pothuajse e padukshme do ta bënte nivelin të dukej si dështim vizatimi.

Një model që është një pjesë e vetme e klasifikuar si strukturë bëhet tokë (*rrjetë e vetme pa emër - trajtohet si tokë*).

### Rrjetat e navigimit {#navigation-meshes}

Një pjesë me emrin `nav:…` (një `nav:walkable` i eksportuesit të nivelit) është një rrjetë navigimi: aty ku mund të qëndrojë një ushtar. Listohet si tokë (*rrjetë navigimi - nuk vizatohet, sepse shtrihet mbi tokë; klikimet e gjejnë gjithsesi*), por **nuk vizatohet**. Shtrihet mbi tokën nga e cila u gjenerua, bashkë-planare me të brenda centimetrave, dhe kur vizatohej si tokë dy sipërfaqet luftonin për çdo piksel: në një nivel me teksturë tokësore të pjekur e tërë zona e luajtshme shfaqej si pllaka të mprehta gri dhe bezhë, një për çdo trekëndësh navigimi. Mbahet, pa u thjeshtuar, që [klikimi për zgjedhje](camera.md#click-to-pick) të thotë nëse një vend është i ecshëm. Hyrjet e bibliotekës nuk e mbajnë.

**Shfaq klasifikimin e pjesëve (N)** te paneli (shfaqet për modele me më shumë se një pjesë) liston çdo pjesë me klasën e saj dhe arsyen - *etiketuar nga eksportuesi*, *emri përputhet me shabllonin*, *mbulon X% të hartës, Y% të kthyer lart*, *Y% të kthyer lart, Z% e lartësisë së nivelit*, *e paqartë - parazgjedhur tokë*. Për ta ndryshuar një, riemërtoni pjesën te modeli burimor dhe importojeni sërish; ndarja është e pjekur në buffer-at e indekseve.

## Thjeshtimi {#simplification}

**Objektivi i thjeshtimit** cakton buxhetin e trekëndëshave për importin e radhës ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Cilësimi | Trekëndësha |
|---|---|
| *I plotë - pa thjeshtim* (parazgjedhje) | të gjitha |
| *I lartë - 8M trekëndësha* | 8.000.000 |
| *Mesatar - 3M trekëndësha* | 3.000.000 |
| *I ulët - 800k trekëndësha* | 800.000 |
| *Siluetë - 100k trekëndësha* | 100.000 |

Buxheti ndahet **60% për strukturat dhe 40% për tokën**, dhe thjeshtohen veças - strukturat e humbasin formën më shpejt nën pakësim. Uji nuk thjeshtohet. Thjeshtimi është shkurtim skaji me metrikat e gabimit kuadratik ([meshoptimizer](https://github.com/zeux/meshoptimizer), përmes WebAssembly), pasi kulmet që përputhen janë bashkuar, kështu që siluetat dhe skajet e mprehta mbijetojnë. Shënimi i importit raporton `burimi → tani trekëndësha, devijim X%`, ndarjen toka / strukturat / uji nëpër pjesë, dhe - kur u përdor *I plotë* për një model mbi 8M trekëndësha - sugjeron *I lartë* (deri 30M) ose *Mesatar* (mbi këtë). Pa WebAssembly thjeshtuesi nuk është i disponueshëm dhe importi e thotë këtë.

Nivelet nga eksportuesit e vetë projektit kanë buxhetin e tyre të caktuar tashmë; objektivi ekziston për artin e papërpunuar pa asnjë buxhet pas.

## Teksturat {#textures}

Një `.glb` pjesët e të cilit mbartin tekstura ngjyre bazë vizatohet me to - një eksport i një pisti gare, për shembull, mban nga një për çdo pllakë terreni dhe nga një për çdo model të vendosur.

Tekstura e tokës shfaqet si parazgjedhje kur është e pranishme; strukturat që mbartin tekstura fillojnë **të ngurta, me teksturat e tyre** (bordurat, parmakët, muret me goma dhe tabelat janë skajet e një rruge, jo ndërtesa për t'i parë brenda), me telin të fikur dhe hijezimin e sheshtë të fikur. Shih [Pamja e nivelit](level-appearance.md).

## Nivelet e mëdha {#large-levels}

- Mbi **300.000** trekëndësha strukture, skajet e strukturave fillojnë të fikura dhe opaciteti i faqeve në 35%: me një skaj në çdo piksel, lagjja duket e bardhë e sheshtë.
- Plani i largët i kamerës zgjerohet për t'u përshtatur me nivelin ([Nivelet](levels.md#what-a-level-does-for-the-heat)).

## Për zhvilluesit {#for-developers}

### Atlasi i teksturave {#texture-atlas}

Çdo tekstura paketohet në **një atlas** te punëtori i importit ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), që niveli të mbetet një vizatim, një mostrues dhe një atribut koordinate teksture në të dy prapavijat:

- paketohet në raftë me madhësinë e vetë çdo imazhi, i zvogëluar vetëm nëse grupi nuk do të përshtatej në **8192 px** në asnjë drejtim (kufiri parazgjedhur i madhësisë së teksturës së WebGPU);
- një **hendek 16-piksel** rreth çdo imazhi, dhe vetëm 5 nivelet mip që mbron ai hendek, kështu që një tabelë e largët kurrë nuk mostron teksturën e fqinjit të vet;
- **teksturat përsëritëse mbeten përsëritëse.** Një imazh me mostrues glTF që përsëritet (parazgjedhja glTF) dhe me koordinata teksture që dalin nga 0..1 - një mur me tulla, UV i të cilit shkon 0 deri 40 përgjatë tij - bëhet një *pllakë*: kulmet mbajnë koordinatat e tyre dhe një numër pllake 16-bit, dhe hijuesit e mbështjellin koordinatën në drejtkëndëshin e pllakës për çdo piksel, duke marrë nivelin mip nga koordinata e pambështjellë, që të mos duken thyerjet. Hendeku i një pllake mban skajin e vet të kundërt. Një bosht me mostrues që shtrydh shtrydhet; një imazh, koordinatat e të cilit qëndrojnë brenda 0..1 vizatohet si më parë. Një nivel me pllaka kushton 4 bajt më shumë për kulm.

### Kontrata e eksportuesit {#the-exporter-contract}

Ajo që i duhet shikuesit nga një nivel, kushdo që e ka bërë:

- një `.glb` i vetë-mbajtur;
- `POSITION` float32, primitiv trekëndëshash;
- emrat e nyjeve `ground:*`, `structure:*` dhe `water:*` (çdo tjetër klasifikohet nga rregullat më sipër), dhe `nav:*` për një rrjetë navigimi, që mbahet por nuk vizatohet;
- koordinata në hapësirën botërore, **Y lart**, në të njëjtën njësi me telemetrinë, që të dhënat të ulen mbi nivel pa asnjë hap vendosjeje.

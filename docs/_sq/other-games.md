---
title: "Lojëra të tjera garash"
parent: "Analiza e garës"
nav_order: 59
lang: "sq"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Lojëra të tjera garash në shikues

Shikuesi lexon xhiro nga shumë lojëra garash, jo vetëm nga një. Kjo faqe i liston ato dhe thotë si merret një xhiro nga secila.

## Lojërat {#the-games}

| Lojë | Regjistruesi | Rrëshqitja në skedar? | Bota e pasqyruar? | Shënime |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out mbi UDP), ose skedarët e xhirove të FH Companion plus `.tele.gz` e tyre | po, për çdo rrotë (normalizuar) | po (bota me dorën e majtë) | `.tele.gz` pranë çdo xhiroje të FH Companion jep rrëshqitjen e çdo rrote; vetëm skedari i xhiros nuk e jep |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (memorie e përbashkët) | po, për çdo rrotë | matet nga xhirot | gjithashtu ABS dhe kontrolli i tërheqjes në veprim, ngarkesat e rrotave, temperaturat |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | jo, llogaritet nga shpejtësitë e rrotave | matet nga xhirot | rally: toka e lirë dhe kërcimet vlerësohen ndryshe |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | jo | matet nga xhirot | pa shpejtësi rrotash |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (një mod) | jo, llogaritet nga shpejtësitë e rrotave | matet nga xhirot | |
| Trackmania | plugin-i Openplanet, `telemetry --game trackmania --install` | një koeficient rrëshqitjeje për çdo rrotë | matet nga xhirot | fizikë arkade: rrëshqitjet vlerësohen ndryshe |
| iRacing | asnjë: skedari i vet `.ibt` | jo (nuk regjistrohet); llogaritet nga rrotullimi (yaw) | jo (bazuar në GPS) | ndize regjistrimin në makinë me Alt+L |

## Si regjistrohet një xhiro {#how-to-record-a-lap}

1. Zgjidh lojën tënde në tabelë dhe vendose si e thotë faqja e regjistruesit për atë lojë (një cilësim në lojë, një mod, ose asgjë fare për iRacing). Hapat ndryshojnë për çdo lojë, prandaj janë në dokumentet e regjistruesve: [GameCapture: lojërat](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Nis regjistruesin, pastaj gjej. Ai shkruan një skedar për çdo xhiro.
3. Në skedën **Analiza e garës** shtyp **Ngarko skedarë xhirosh…** dhe zgjidh dy ose më shumë xhiro të së njëjtës pistë (shih [Ngarkimi i xhirove](race-loading-laps.md)).

Për lojërat rally, regjistruesi jep një skedar për çdo përsëritje etape, dhe për Forza mënyra më e lehtë për të filluar është biblioteka e FH Companion me skedarët `.tele.gz` pranë skedarëve të xhiros.

## Çfarë dokumentojnë regjistruesit {#what-the-recorders-document}

Si regjistrohet çdo lojë, çfarë dërgon, burimet e paraqitjeve të saj dhe cilat pista mund të eksportohen nga skedarët e saj, është detyrë e regjistruesve ta dokumentojnë: [GameCapture: lojërat](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (publik, në [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)), dhe skedari i xhiros që shkruan çdo regjistrues është [GameCapture: formati i xhiros](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Çfarë bën shikuesi me to {#what-the-viewer-does-with-them}

Çdo lojë përfundon si skedarë `heat3d-lap` (ose si një CSV xhiro, ose lexohet direkt, siç lexohet `.ibt` i iRacing), me emrat kanonikë të kanaleve nga `src/race/schema.ts` dhe një bllok `meta` që thotë çfarë do të thonë numrat e tij: si është shkallëzuar rrëshqitja, pistë, rally ose arkadë, sipërfaqja kur njihet. Kështu skeda **Analiza e garës** i trajton të gjitha njësoj. Kur nuk është ngarkuar model pistë, skeda **Analiza e garës** vizaton një rrugë nga shtrirja e vetë xhirove, kështu që çdo lojë është e përdorshme pa model.

Ajo që nuk e dërgon asnjë lojë rally, rrëshqitjen e gomave, shikuesi e llogarit vetë: nga pika e kontaktit ose shpejtësia e sipërfaqes e çdo rrote krahasuar me shpejtësinë e makinës, aty ku një lojë dërgon një të tillë (`(rrota - makina) / makina`), dhe nga rrotullimi i saj me një rreze rrotulluese të matur në vetë xhiron, aty ku lojë dërgon vetëm rrotullimin. Këndi i zvarritjes vjen nga shpejtësia e vetë makinës (Forza, lojërat AC, Trackmania, RBR), ose nga shpejtësia botërore e projektuar mbi boshtet e makinës (EA WRC, DiRT, BeamNG), ose nga drejtimi krahasuar me rrugën. Nëse makina është në ajër, kjo del nga kontakti, ngarkesat ose pezullimi i rrotave. Shih `src/race/derive.ts`.

Kur bota e një loje është me dorën e majtë, si ajo e Forza, pista del e pasqyruar në shikues. Drejtimi dhe pezullimi i xhirove e tregojnë këtë, dhe skeda **Analiza e garës** ofron të kthejë një bosht. Lojërat me dorëzim të pa-dokumentuar (RBR, BeamNG, Trackmania) trajtohen po ashtu: matet, nuk supozohet.

Përveç kanaleve të drejtimit, regjistruesit ruajnë atë që shton çdo lojë: ABS dhe kontrolli i tërheqjes të lojërave AC në veprim, shpërndarja e frenimit, DRS, kufizuesi i boxit, boost dhe jetëgjatësia e pllakave dhe diskave të frenave; te iRacing cilësimet e ndihmës, shpërndarja e frenimit, karburanti, temperaturat e vajit dhe të ujit, dhe çdo kanal tjetër që regjistron me emrin e vet. Shikuesi i vizaton nga tabela e kanaleve të tij (llamba, nivele, glifa, grafikë), kështu që regjistrimi i më shumë nuk kërkon ndryshim në shikues.

---
title: "Rruga e kamerës dhe videoja"
nav_order: 15
lang: "sq"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---


# Shtegu i kamerës dhe videoja

Bëj një film nga të dhënat e tua: vendos kamerën në disa vende dhe shikuesi fluturon midis tyre dhe ruan një video. Çdo kuadër është shumë i pastër, pa kokrriza. Kamera dhe treguesi i luajtjes lëvizin së bashku, kështu që i njëjti panel bën edhe një timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Bëj një fluturim {#make-a-flythrough}

1. Fluturo deri ku fillon filmi dhe shtyp **Shto kuadër kyç këtu** te **Shtegu i kamerës & renderimi**.
2. Fluturo te vendi tjetër dhe shtyp përsëri. Përsërit për çdo ndalesë.
3. Shëno **Paraparje përgjatë shtegut** dhe tërhiq **Pozicioni përgjatë shtegut** për të kontrolluar lëvizjen.
4. Cakto **Kohëzgjatjen** (sa zgjat videoja). Një lëvizje që është e saktë por shumë e shpejtë kërkon vetëm një kohëzgjatje më të gjatë.
5. Shtyp **Rendero videon**. Prit rreshtin e progresit; skedari shkarkohet kur mbaron.

![Paneli Shtegu i kamerës & renderimi me tre kuadra kyç, ndërfutje të butë, 12 s, 30 fps dhe 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Kuadrat kyç {#keyframes}

| Kontrolli | Efekti |
|---|---|
| **Shto kuadër kyç këtu** | Shton pozicionin, drejtimin, pjerrësinë dhe fushën e shikimit të kamerës si një kuadër kyç. |
| **Pastro** | Heq të gjithë kuadrat kyç. |
| Lista e kuadrave kyç | Një rresht për çdo kyç: numri i tij (klikoje për ta çuar kamerën atje, duke vendosur edhe fushën e shikimit), pozicioni, `drejtimi° / pjerrësia°`, dhe **×** për ta hequr. |

Kyçet vendosen **njëtrajtësisht** përgjatë një boshti normalizuar të shtegut nga 0 në 1 sa herë shtohet ose hiqet një. Kohëzgjatja e daljes e shtrin pastaj gjithë lëvizjen, kështu që një plan që është i saktë por shumë i shpejtë kërkon vetëm një kohëzgjatje më të gjatë. Drejtimi zhbëhet mes kyçeve, që kamera të kthehet rrugën më të shkurtër.

Pa kuadra kyç, një renderim e mban kamerën aktuale të palëvizur gjatë gjithë klipit — një timelapse krejt i mirë.

## Cilësimet e shtegut {#path-settings}

| Kontrolli | Parazgjedhja | Diapazoni (rrëshqitja) | Kuptimi |
|---|---|---|---|
| **Interpolimi** (2+ kyçe) | *Të butë* | *Të butë* / *Drejt* | *Të butë*: një kurbë kubike Hermite përmes kyçeve me tangjente nga kyçet fqinjë, kështu që shpejtësia përputhet në çdo kyç dhe nuk ka tronditje ku bashkohen segmentet. *Drejt*: vija të drejta midis kyçeve, të parashikueshme, me një cep të dukshëm në çdo kyç. Fusha e shikimit interpolohet gjithmonë në mënyrë lineare. |
| Vija e udhëtimit (2+ kyçe) | | | `N njësi udhëtimi - M për sekondë me këtë kohëzgjatje`, ose një shënim që kyçet janë të gjitha në një vend. |
| **Paraparje përgjatë shtegut** (1+ kyçe) | i fikur | | Drejton kamerën e pamjes nga shtegu, dhe lëviz treguesin e luajtjes me të ashtu si e bën renderimi, që lëvizja të mund të gjykohet para renderimit. |
| **Pozicioni përgjatë shtegut** (gjatë paraparjes) | 0% | 0-100% | Ku në shteg të shfaqet paraparja. |
| **Kohëzgjatja** | 12 s | 1-120 s (3600) | Gjatësia e videos. |
| **Shpejtësia e kuadrove** | 30 fps | 6-60 (240) | |
| **Bitrate** | 16 Mbps | 1-60 Mbps, logaritmik (400) | Gradientët e nxehtësisë shfaqin brezat të këqija me bitrate të ulët: ka pak detaje që një kodek mund të fshehë gabimin pas tyre. |
| **Kufiri i pritjes për konvergjencë** | 240 kuadra | 2-600 (10 000) | Koha më e gjatë që një kuadër dalës mund të presë për të u bërë i saktë. Kuadrat që e arrijnë kufirin shkruhen prapëseprapë, dhe numërohen. |
| Përmbledhja | | | `N kuadra · dritarja: kumulative/e fiksuar/jetëgjatësi`, dhe kur vija kohore është në modalitetin Të gjitha: *(renderimi e kalon Të gjitha në Luaj, që treguesi të ketë kuptim)*. |
| **Rendero videon** / **Anulo** | | | Nis renderimin; ndërsa vepron, shfaq `kuadri i / n · pritur w · X MB` dhe sa kuadra nuk ishin të sakta. Kërkon një grup të dhënash. |

## Këshilla {#tips}

- Madhësia e daljes është madhësia e kanavacës në piksele pajisjeje (raporti i pikselëve të ekranit, i kufizuar në 2). Ndrysho madhësinë e dritares së shfletuesit për ta ndryshuar.
- Një histori kumulative e ndërton nxehtësinë gjatë klipit; një histori me dritare ose jetëgjatësi shfaq një copë të lëvizshme kohe.
- Pozicionet e kyçeve janë koordinata ekrani: me një [bosht botëror të përmbysur](camera.md#invert-world-axis), kyçet e bëra përpara ndërrimit tregojnë diku tjetër pas tij.

## Për zhvilluesit {#for-developers}

### Çfarë bën një renderim {#what-a-render-does}

1. Bën një kapje provë të kuadrit për të mësuar madhësinë e saktë të daljes në piksele pajisjeje.
2. Zgjedh një kodek përmes WebCodecs: **VP9** (`vp09.00.10.08`), përndryshe **VP8**, me bitrate-in dhe shpejtësinë e kuadrove të zgjedhura. Pa `VideoEncoder` ndalon me *Ky shfletues nuk ka VideoEncoder - WebCodecs kërkohet për të shkruar një video*; me asnjërin kodek, *Nuk ka kodek video të mbështetur (u provuan VP9, VP8)*.
3. Merr përsipër cilësimet që i duhen një renderimi: ndalon luajtjen, **fik buxhetin adaptiv**, **ndez përmirësimin progresiv** dhe vendos buxhetin e sprite-ve në 64M për kuadër (buxheti adaptiv e mbron shpejtësinë e kuadrove, që këtu është qëllim i gabuar: do ta lexonte çdo kuadër të ngadaltë që konvergjon si arsye për të vizatuar më pak rreshta, gjë që kërkon më shumë kuadra për t'u konverguar), dhe e kalon timeline-in nga **Të gjitha** në **Luaj**. Cilësimi i historisë (kumulative, dritare, jetëgjatësi) lihet ashtu si është: një renderim synon të jetë ajo që po shikoje, e luajtur deri në fund dhe e shkruar.
4. Për çdo kuadër dalës *f* nga *n*, me *u* = f / (n - 1):
   - e vendos kamerën te pozita e shtegut në *u* (nëse ka kyçe);
   - e çon treguesin e luajtjes te i njëjti pjesë *u* e intervalit të timeline-it (intervali i seancës së zgjedhur në riluajtjen e kutive);
   - detyron një vlerësim të ri, edhe kur kamera nuk u lëviz — trashëgimia e grumbullimit të kuadrit të mëparshëm do të linte një fantazmë të dritares së mëparshme;
   - pret, kuadër për kuadër, derisa imazhi të jetë i saktë (të gjithë rreshtat kandidatë të vizatuar në një kuadër, ose grumbullimi i plotë), deri në kufirin e pritjes;
   - kap kuadrin e përbërë dhe e kodon, me një kuadër kyç çdo 2 sekonda dalëse, që skedari të jetë i kërkueshëm.
5. Bashkon kuadrat në një skedar WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) me vula kohore të zgjedhura nga shpejtësia e kuadrove — koha e murit që zgjati çdo kuadër nuk ka rëndësi.
6. Rikthen buxhetin, fushën e shikimit, modalitetin e timeline-it, treguesin e luajtjes dhe nëse po luhej.
7. Shkarkon videon si `3dheat-<width>x<height>-<frames>f.webm` dhe raporton `N kuadra në W×H, X MB - çdo kuadër i saktë`, ose sa kuadra e arritën kufirin e pritjes.

**Anulo** ndalon pas kuadrit aktual (*Renderimi u anulua.*) dhe rikthen cilësimet.

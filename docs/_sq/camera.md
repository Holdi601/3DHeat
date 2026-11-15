---
title: "Kamera dhe kontrollet"
nav_order: 14
has_children: true
lang: "sq"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera dhe kontrollet

Fluturoni nëpër skenë si një zog: **W A S D** për të lëvizur, tërhiqni miun për të parë. Përdoreni këtë faqe për të fluturuar, për të kaluar te një pamje nga lart ose anash, dhe për të lexuar saktësisht ku është kamera.

## Fluturoni në 4 hapa {#fly-in-4-steps}

1. Klikoni një herë mbi pamjen, që të marrë tastierën.
2. Mbani **W** për të fluturuar përpara, **S** prapa, **A** dhe **D** anash, **Hapësirë** lart, **Q** poshtë.
3. Mbani butonin e majtë ose të djathtë të miut dhe tërhiqeni për të parë përreth.
4. Shtypni **F** për t'i përshtatur përsëri të gjitha të dhënat në kuadër.

Kamera është një kamerë e lirë fluturimi me projeksion perspektive dhe paralel, pamje të caktuara paraprakisht, një pozë të shkruar dhe thellësi fushe. Cilësimet e saj janë te paneli **Kamera & skena** në fund të shiritit anësor (shfaqet edhe te skedat Analiza e garës dhe Ndeshja). Zbatimi është [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Fluturimi {#flying}

| Hyrja | Efekti |
|---|---|
| `W` `A` `S` `D` ose tastet me shigjeta | Përpara (sipas pamjes, duke përfshirë pjerrësinë e saj), majtas, prapa, djathtas |
| `Hapësirë` ose `E` | Lart (lart në botë) |
| `Q` ose `Ctrl` i majtë | Poshtë |
| `Shift` (i mbajtur) | 6 herë më shpejt |
| `Alt` i majtë (i mbajtur) | 15% e shpejtësisë |
| Tërheqje me butonin e majtë ose të djathtë të miut | Shikoni përreth. Treguesi kyçet gjatë tërheqjes. |
| Rrota e miut | Shpejtësia e fluturimit ×1,5 për çdo hap (perspektivë); zmadhim (paralel) |
| `F` | Përshtat të dhënat në kuadër |
| Klikim (pa tërheqje) | Shfaq çfarë është nën tregues ([Inspektimi i pamjes](#inspecting-the-view)) |
| `C` | Kopjon pozicionin e kamerës, drejtimin dhe pjerrësinë |
| `G` | Shko te një pikë e shkruar |
| `Esc` | Mbyll kartelën e zgjedhjes (dhe ndal ndjekjen e një njësie) |

### Ndërsa ndiqet një njësi {#while-following-a-unit}

Kur kamera ndjek një njësi në një riluajtje ([Riluajtja e ndeshjes](match-replay.md)), tastet e fluturimit bëjnë diçka tjetër:

| Hyrja | Efekti |
|---|---|
| Rrota, `W` / `S` | Më afër njësisë / më larg (më lart / më ulët në pamjen satelitore) |
| `A` / `D`, `Q` / `E` | Orbitë rreth njësisë (pamjet ndjekje dhe orbitë) |
| Tërheqje | Shikoni përreth njësisë (kabina: shikoni brenda) |
| `V` / `Shift+V` | Pamja e kamerës pasuese / e mëparshme |
| `Esc` | Ndal së parë shikimin e njësisë së dytë, pastaj ndal ndjekjen |

Tastet e lëvizjes shtohen me një [kontrollues](gamepad.md); shih [referencën e tastierës](keyboard-reference.md) për gjithçka tjetër. Tastet injorohen kur një kuti teksti ose një listë me rënie është e fokusuar. Pjerrësia kufizohet pak para drejtimit të plotë lart dhe poshtë.

## Paneli Kamera & skena {#camera--scene-panel}

![Paneli Kamera & skena: Projeksioni, Pamjet e caktuara paraprakisht, butonat e Fushës së pamjes, Shpejtësia e fluturimit dhe Poza](../assets/img/en/camera-panel.webp)

### Projeksioni {#projection}

**Projeksioni**: *Perspektivë* (parazgjedhje) ose *Paralel*.

*Paralel* (ortografik) heq shkurtimin perspektivik, kështu që dy pika të nxehta me dendësi të barabartë duken me të njëjtën madhësi kudo në kuadër - krahasimi që ekziston për të mbështetur harta e nxehtësisë - dhe kjo e bën pamjen izometrike. Në mënyrën paralele rrota e miut zmadhon (nuk ka lëvizje përpara që ndryshon shkallën) dhe [shfaqja e shpejtësisë](#fly-speed) fshihet.

**Ndërrimi e mban objektin me të njëjtën madhësi.** Një projeksion paralel nuk ka fushë pamjeje, kështu që lartësia e tij nuk lidhet me largësinë e kamerës; kalimi i thjeshtë ose zmadhon çmendurisht ose nuk tregon asgjë. Kalimi në paralel e cakton lartësinë e saj në atë që mbulon kamera perspektivë në largësinë e fokusit (2 × largësia × tan(fov / 2), ku largësia e fokusit është largësia e përshtatjes së fundit). Kthimi rikthen pozën perspektivë që lanë, në të njëjtën madhësi të dukshme, në vend se kudo ku kishte shkuar pamja paralele.

### Pamjet e caktuara paraprakisht {#preset-views}

| Grupi | Butonat | Orientimi |
|---|---|---|
| **Izometrike** | **VL**, **VP**, **JL**, **JP** | Paralel, pjerrësia -35,264° (= atan(1/√2), këndi ku të tre boshtet projektohen në të njëjtën gjatësi), drejtimi -45°, 45°, -135°, 135°. Katër qoshe, sepse një e vetme gjithmonë fsheh gjysmën e hartës pas asaj që është më afër. |
| **Pamjet anësore** | **Sipër**, **Poshtë**, **Para**, **Prapa**, **Majtas**, **Djathtas** | Paralel. Sipër shikon drejt poshtë (pjerrësia -89,9°), Poshtë drejt lart, Para përgjatë -Z (drejtimi 0°), Prapa përgjatë +Z (180°), Majtas përgjatë -X (-90°), Djathtas përgjatë +X (90°). |
| | **Kthehu te perspektiva** | Kthehet te poza perspektivë që lanë. I çaktivizuar në perspektivë. |
| | **Pamje tre-çerekëshe** | Perspektivë, drejtimi -35°, pjerrësia -28°. |

Çdo pamje e caktuar paraprakisht ndërron vetë projeksionin - sipas perspektivës një "pamje nga lart" ende drejtohet drejt një pike zhdukjeje, dhe sipërfaqet e barabarta nuk duken më të barabarta - dhe i përshtat të dhënat në kuadër nga ai drejtim.

### Fusha e pamjes {#field-of-view}

**Fusha e pamjes** - këndi vertikal. Parazgjedhja 65°, 10-140° në shirit (179° me dorezën), me butonat **Të sheshtë 20°**, **E gjatë 35°**, **Normale 50°**, **E gjerë 65°**, **Shumë e gjerë 90°**. E ngushtë e sheshton perspektivën dhe duket më shumë si projeksion paralel; e gjerë e ekzagjeron thellësinë dhe e bën të vështirë vlerësimin e largësive. Mbetet aktive në mënyrën paralele, ku cakton shkallën që ndërrimi kthehet ta zgjidhë dhe largësinë që përdor **Përshtat në kuadër**.

### Shpejtësia e fluturimit {#fly-speed}

**Shpejtësia e fluturimit** - njësi botërore (metra) për sekondë me gaz të plotë. Parazgjedhja 120; në çdo ngarkim, shtrirja horizontale e të dhënave / 12. Logaritmike, 0,02-20.000 (200.000 me dorezën; dorezë ndryshon atë sipas raporteve, jo sasive). Rrota e miut e shumëzon ose e pjesëton me 1,5 për çdo hap, brenda 0,02-200.000.

I njëjti vlerë shfaqet në këndin e poshtëm djathtas të pamjes (vetëm në perspektivë): shpejtësia në m/s ose km/s dhe koha që duhet për të kaluar të dhënat (ose nivelin, kur është ngarkuar një nivel 3D) me atë shpejtësi. Tërhiqeni lart ose poshtë për ta ndryshuar shpejtësinë.

### Afër dhe larg {#near-and-far}

Largësitë e prerjes **Afër** (parazgjedhje 0,5) dhe **Larg** (parazgjedhje 40.000). Të dyjat rillogariten nga të dhënat në çdo ngarkim (afër = max(0,05, shtrirja / 20.000), larg = shtrirja × 12) dhe zgjerohen, kurrë nuk ngushtohen, nga një nivel 3D më i madh ([Nivelet](levels.md#what-a-level-does-for-the-heat)). Raporti i tyre cakton saktësinë e thellësisë të cilës i mbështetet fshehja; kështu një afër shumë e vogël me një larg shumë të madh e dobëson [fshehjen](depth-and-culling.md). Të parë nga jashtë skenës ose lart mbi tokën e saj, plani afër që përdoret në të vërtetë zhvendoset në 2% të asaj largësie, kështu që një hartë e parë nga lart mban mjaft saktësi thellësie që uji dhe bregu të mos dridhen; kutia ende tregon vlerën e vendosur.

### Kontrolle të tjera {#other-controls}

| Kontrolli | Parazgjedhja | Kuptimi |
|---|---|---|
| **Përmbys Y** | joaktiv | Përmbys shikimin e miut lart/poshtë. |
| **Thellësia e fushës** | joaktive | Shih më poshtë. |
| **Kontrolluesi** | aktiv | Shih [Kontrolluesi dhe HOTAS](gamepad.md). |
| **Poza** | | Shih më poshtë. |
| **Inspektim** | | Leximi i kamerës, zgjedhja me klikim, konventa e drejtimit dhe *Shko te një pikë*; shih [Inspektimi i pamjes](#inspecting-the-view). |
| **Përshtat të dhënat në kuadër (F)** | | I përshtat të dhënat (te skeda Analiza e garës: xhirot) pamjes, duke mbajtur drejtimin aktual. Kamera vendoset në r / tan(fov / 2) nga qendra, ku r është gjysma e diagonales së kufijve të të dhënave. |
| **Rrjeta**, **Boshtet** | po, po | Një rrjetë në tokë me hapësirë 1/2/5 × 10ⁿ rreth 1/40 e shtrirjes së të dhënave (duke u shtrirë deri 1,5 × të dhënat, midis 8 dhe 120 hapash rrjete), dhe boshte me ngjyra. |
| **Përmbys boshtin e botës** X, Y, Z | joaktiv | Shih më poshtë. |

### Poza {#pose}

Pesë kutiza numrash - **X**, **Y**, **Z** dhe **drejtimi °**, **pjerrësia °** - që ndjekin kamerën kur asnjëra nuk është e fokusuar. Shkruani një vlerë dhe shtypni `Enter` (ose largohuni nga kutia) për ta lëvizur kamerën atje. **kopjo** vendos në kujtesë `pos X Y Z · drejtimi A · pjerrësia B` (me `(drejtimi i lojës)` pas saj kur zgjidhet ajo konventë). Fluturimi është mënyra për të eksploruar; koordinatat janë mënyra për të riprodhuar një pamje. Ato janë të njëjtat numra si [leximi i kamerës](#camera-readout): koordinatat e vetë të dhënave, edhe kur një bosht është përmbysur, dhe drejtimi sipas [konventës](#yaw-conventions) së zgjedhur.

### Përmbys boshtin e botës {#invert-world-axis}

**Përmbys boshtin e botës X / Y / Z** vizaton botën me atë bosht të kthyer. Një lojë që mban një botë të dorës së majtë del e pasqyruar në këtë shikues të dorës së djathtë - kthesat e dorës së djathtë vizatohen si të dorës së majtë - dhe përmbysja e X ose Z e kthen në rregull. **Ndryshon vetëm vizatimi**: të dhënat, analiza dhe çdo koordinatë që tregojnë veglat (poza, vizorja, prerja) mbeten të vetat të lojës. Pamja kthehet në vend, duke ju mbajtur të shikoni të njëjtin vend. Ky cilësim mbahet mend në shfletues (çelësi `localStorage` `heat3d.mirror`); krahasoni [kthesat](axes-units-and-time.md#flips) e ngarkimit, që ndryshojnë të dhënat.

## Inspektimi i pamjes {#inspecting-the-view}

Ku është kamera, çfarë është nën tregues dhe shkuarja te një pikë - blloku **Inspektim** i panelit Kamera & skena, dhe dy shtresat lart majtas të pamjes. Kodi është te [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) dhe [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Kontrolli | Parazgjedhja | Kuptimi |
|---|---|---|
| **Pozicioni i kamerës mbi pamje** | po | Leximi i kamerës, më poshtë. Mbyllet edhe me **×**. |
| **Klikimi tregon çfarë ka aty** | po | Zgjedhja me klikim, më poshtë. |
| **Konventa e drejtimit** | Shikuesi | Cili drejtim e tregojnë dhe e lexojnë leximi, kutitë e pozës dhe kutia e kërcimit. |

Këto tre mbahen mend në shfletues (çelësi `localStorage` `heat3d.inspect`).

### Leximi i kamerës {#camera-readout}

Lart majtas të pamjes: **x**, **y**, **z**, **drejtimi** dhe **pjerrësia** e kamerës, të gjalla, me një etiketë që emërton konventën e drejtimit. Shfaq të njëjtat numra si kutitë e [Pozës](#pose) dhe nuk kushton asgjë gjatë fluturimit (shkruhet në faqe me orën e kornizave, pa rivizatuar panelet).

- **kopjo** (ose `C` kudo jashtë një kutie teksti) vendos në kujtesë `x X y Y z Z drejtimi A pjerrësia B (drejtimi i shikuesit)`, me pikë dhjetore `.` çfarëdo që të jetë gjuha - një rresht që kutia e kërcimit, dhe çdo skriptë, e lexon përsëri.
- **shko te** (ose `G`) hap një kuti nën të: ngjitni një pikë dhe shtypni `Enter` për ta parë, ose ngjitni një pozë të tërë të kopjuar për t'u vendosur në atë pamje. `Esc` mbyll kutinë.

### Koordinatat: kuadri i vetë të dhënave {#coordinates-the-datas-own-frame}

Çdo koordinatë që veglat e inspektimit tregojnë ose pranojnë është në **kuadrin e vetë të dhënave të ngarkuara**: [pasqyrimi i boshteve](axes-units-and-time.md) i ngarkimit (boshti lart, kthesat, shkalla) zhbëhet. Një pozicion i lexuar nga pamja është numri që mban tabela burimore, dhe një numër nga tabela i shkruar në kutinë e kërcimit e çon në atë vend. Kur pasqyrimi nuk ndryshon asgjë (një ngarkim me Y lart dhe pa shkallë - që janë ato që shkruajnë veglat e regjistrimit dhe eksportuesit e niveleve) kjo është thjesht bota; përndryshe leximi mban një etiketë **kuadri të të dhënave**. Pa grup të dhënash, koordinatat janë koordinata botërore. Drejtimi dhe pjerrësia janë gjithmonë rreth botës së shikuesit, me Y lart.

### Konventat e drejtimit {#yaw-conventions}

| Konventa | Drejtimi 0° shikon përgjatë | Rritet drejt | Përdoret nga |
|---|---|---|---|
| **Shikuesi** | -Z | -X | kamera e lirë e fluturimit, [pamjet e caktuara](#preset-views) |
| **Loja / mjetet e regjistrimit** | +X | -Z | kolonat `yaw` dhe pozat e mjeteve të regjistrimit; te një nivel i eksportuar në kuadrin e shikuesit, drejtimi i vetë lojës |

Pjerrësia është e njëjtë në të dyja: lart nga horizontalja. Të dyjat ndryshojnë me një çerek kthese dhe asgjë tjetër:

> drejtimi i shikuesit = drejtimi i lojës - 90°

Një drejtim `d` është `(cos p · cos y, sin p, -cos p · sin y)` në konventën e lojës dhe `(-sin y · cos p, sin p, -cos y · cos p)` në atë të shikuesit. Zgjidhni **Loja / mjetet e regjistrimit** për të shkruar një drejtim direkt nga një tabelë regjistrimi, ose për të krahasuar leximin me një të tillë.

### Shkuarja te një pikë {#going-to-a-point}

**Shko te një pikë**, në blloqin Inspektim (dhe kutia **shko te** e leximit):

- kutia e tekstit pranon `x, y, z` ose `x y z` (ose `x; y; z`), me pikë dhjetore ose presje dhjetore - `-321.6, 137.8, -59.9` dhe `-321,6 137,8 -59,9` janë e njëjta pikë. Pesë numra shtojnë një drejtim dhe pjerrësi, dhe një pozë e kopjuar nga leximi ose kutitë e pozës lexohet e tërë, me etiketat dhe konventën;
- **drejtimi °** dhe **pjerrësia °** (opsionale) e kthejnë kamerën, në konventën e zgjedhur;
- **Shiko** e mban drejtimin (përkulet për të parë poshtë të paktën 20° nëse shihte drejt) dhe tërhiqet përgjatë tij deri në largësinë aktuale, e mbajtur midis 0,3% dhe 3% të gjerësisë së skenës - 6 deri 60 m në një nivel dy kilometrash. Largësia e fokusit, lartësia e pamjes paralele dhe shpejtësia e fluturimit ndjekin, që pamja të jetë e përdorshme sapo të arrijë;
- **Qëndro këtu** e vendos kamerën në pikë, të kthyer në drejtimin dhe pjerrësinë e dhënë, ose siç ishte.

Një pozë e ngjitur me drejtimin dhe pjerrësinë e vet gjithmonë vendoset në atë pamje.

### Zgjedhja me klikim {#click-to-pick}

Një klikim mbi pamje - shtypni dhe lëshoni pa tërhequr më shumë se 4 piksele; një tërheqje ende shikon përreth - shfaq një kartelë lart majtas me atë që është nën tregues. Ndërsa [vizorja](measure.md) është e ndezur, klikimet shkojnë te vizorja.

**Një pikë e vizatuar e të dhënave fiton.** Mostra më e afërt brenda 8 pikselave nga klikimi, nga ato që vizatohen vërtet: rreshtat në dritaren kohore dhe jetëgjatësinë, që kalojnë [filtrat](filters.md), grupet e shfaqura dhe ndarjen e diferencës, brenda prerjes së largësisë dhe një prerje që pret nxehtësinë. Në riluajtjen e kutisë, një kuti nën tregues (kudo mbi të). Kartela liston çdo kolonë që ka rreshti, me emrat e vetë kolonave të burimit - koha (ora e murit, ose sekondat e vetë skedarit me `m:ss.ss`), personi, grupi, seanca, çdo kolonë e mbajtur, pozicioni dhe drejtimi i shikimit - dhe largësinë nga kamera. Në kujtesë janë vetëm kolonat që ngarkimi i mbajti: një kolonë që nuk u zgjodh si [kolonë filtrimi](column-mapping.md) nuk shfaqet.

**Përndryshe sipërfaqja e nivelit**: pika ku rrezja e klikimit takon trekëndëshat e vërtetë të nivelit (jo planin e referencës së vizores), me **pjesën** ku bën pjesë (emri i eksportuesit, `structure:props`, `ground:terrain …`), **llojin** e saj (tokë, strukturë, ujë, imazh harte), koordinatat dhe largësinë. Gjeometria e fshehur nga një prerje ose nga prerja e largësisë kalon. Aty ku niveli ka një [rrjetë navigimi](model-levels.md#navigation-meshes), një rresht e emërton dhe thotë nëse vendi shtrihet mbi të (✓). Një emër pjese me parashtesë `≈` u hamendësua nga kutitë kufizuese të pjesëve, sepse ajo pjesë e nivelit u thjeshtua në ngarkim.

Kartela qëndron derisa të mbyllet (**×**, `Esc`), një klikim tjetër përgjigjet për diçka tjetër, ose një klikim në hapësirë boshe. Një kryq cian vizatohet në pikë në skenë dhe një unazë mbi të në ekran. Butonat e saj: **kopjo** (çdo vlerë, dhe koordinatat si `x, y, z`), **Shiko** dhe **Qëndro këtu** (te një pikë e të dhënave, duke parë ashtu si e shikonte rreshti kur ka drejtim shikimi; te një sipërfaqe, 1,7 m mbi të).

Niveli indeksohet për zgjedhje në klikimin e parë që e kërkon: një rrjetë kolonash mbi gjurmën e tij, e ndërtuar disa milisekonda çdo herë mes kornizave, që pamja të mos ndalet kurrë (rreth një sekondë punë për një nivel me disa milionë trekëndësha), dhe mbahet derisa të ndryshojë niveli. Deri atëherë kartela thotë *Duke e përgatitur nivelin për zgjedhje* me një përqindje, dhe i përgjigjet klikimit kur të jetë gati. Një kërkim i pikës së të dhënave mbi më shumë se katër milionë rreshta të vizatuar shpërndahet mbi korniza në të njëjtën mënyrë.

## Thellësia e fushës {#depth-of-field}

Një seksion i palosshëm te Kamera & skena, me titullin *Thellësia e fushës - aktive* kur është e ndezur. Joaktive si parazgjedhje: është një efekt paraqitjeje, dhe pamja parazgjedhje duhet të tregojë të dhënat, jo një interpretim të tyre.

| Kontrolli | Parazgjedhja | Shtrirja (rrotullimi) | Kuptimi |
|---|---|---|---|
| **Aktive** | joaktive | | |
| **Fokusi te ajo që u përshtat në pamje** | po | | Fokus në largësinë që përdori përshtatja e fundit (*Fokusuar në N m.*). |
| **Largësia e fokusit** | 1000 | 1-200.000, logaritmike (10.000.000) | Shfaqet kur fokusi është manual. |
| **Hapja** | ±35% | ±2% deri ±200%, logaritmike (±3200%) | Thellësia që mbahet e mprehtë, si thyesë e largësisë së fokusit - relative, jo një numër f, sepse skenat shtrihen nga një dhomë deri te një hartë tetë kilometrash. |
| **Turbullimi maksimal** | 12 px | 1-48 (256) | Rrezja më e madhe e turbullimit; kostoja rritet me të. |

Turbullon **nivelin, rrjetën dhe kutitë** - *jo nxehtësinë*. Nxehtësia në një piksel është shuma e sprite-ve në shumë thellësi, kështu që nuk ka një thellësi të vetme ku të jetë jashtë fokusi; turbullimi i saj me çfarëdo gjeometrie që ndodhet prapa do të ishte i gabuar kudo ku noton përpara. Të dhënat e mprehta mbi kontekst të butësuar janë gjithashtu më të dobishme nga të dyja. Turbullimi është një mbledhje 24-prekjesh me kënd të artë në kalimin e përbërjes, e peshuar që një plan i parë i mprehtë të mos shpërndahet nga fundi i turbullt prapa tij. Ndryshimi i tij riviz pa rifilluar mbledhjen e nxehtësisë.

## Rezolucioni i kanavacës {#canvas-resolution}

Kanavaca vizatohet me raportin e pikselave të ekranit, i kufizuar në 2. Buferi i nxehtësisë mund të vizatohet në një rezolucion më të ulët se ai ([Rezolucioni i nxehtësisë](performance-and-stats.md)).

## Faqet në këtë seksion {#pages-in-this-section}

- [Kontrolluesi dhe HOTAS](gamepad.md)
- [Tastiera dhe miu - referenca](keyboard-reference.md)

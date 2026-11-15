---
title: "Përcaktimi i kolonave"
parent: "Si të futni të dhënat"
nav_order: 2
lang: "sq"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Përcaktimi i kolonave

Një skedar është një tabelë, dhe 3DHeat duhet të dijë cila kolonë mban pozicionin lindje-perëndim, cila kohën, cila emrin e lojtarit, e kështu me radhë. Ky panel është ku thuhet çfarë hamendësoi, dhe ku e rregulloni një hamendje të gabuar.

![Paneli Përcaktimi i kolonave pasi u ngarkua një skedar Parquet: çdo kutizë e plotësuar - 1 X, 2 Y, 3 Z, 4 Koha, 5 ID e personit, 6 Seanca / ndeshja, 7 Ekipi / grupi](../assets/img/en/column-mapping-panel.webp)

*Skedari i emëroi vetë kolonat e veta, kështu që çdo kutizë është tashmë e plotësuar.*

Për shembull, një CSV me titullin `x,y,z,t,player,team` përcaktohet vetë: x, y dhe z bëhen pozicioni, `t` koha, `player` [personi](glossary.md) dhe `team` [grupi](glossary.md).

Pasi zgjidhen skedarët, paneli **Përcaktimi i kolonave** hapet poshtë panelit Burimi. Ai thotë cila kolonë luan cilin rol. Plotësohet automatikisht dhe çdo fushë mund të ndryshohet para se të shtypet **Ngarko**; përcaktimi lexohet në kohën e ngarkimit, kështu që ndryshimi pas kësaj kërkon ngarkim të ri.

## Fushat {#the-fields}

Të gjitha menutë e kolonave listojnë çdo kolonë të skedarit të parë, plus *- asnjë -*.

| Fusha | Roli | Shënime |
|---|---|---|
| **Ndarësi** | Vetëm CSV: ndarësi i fushave. | Menu: *Presje ,*, *Pikëpresje ;*, *Tab*, *Pipe \|*, *Hapësirë*; ose shkruani çdo karakter të vetëm te *ose shkruani një karakter*. Zbulohet automatikisht (shih më poshtë). Ndryshimi e ribën përcaktimin automatik, kështu që ndryshimet e bëra më parë humbasin. |
| **X**, **Y**, **Z** | Pozicioni. | Kërkohen të paktën dy; një bosht i tretë i pahartëzuar është 0 (të dhënat shtrihen në një plan). E njëjta kolonë në dy boshte është gabim. |
| **Boshti lart në burim** | Cili bosht burimi tregon lart. | *Z është lart (shumica e motorëve të lojërave)* ose *Y është lart (konvencion grafik)*. Shih [Boshtet, njësitë dhe koha](axes-units-and-time.md). |
| **Shkalla e njësive** | Shumëzon çdo pozicion. | Butonat *1 (m)* dhe *0.01 (cm→m)*, ose shkruani një vlerë. |
| **Kthe X / Kthe Y / Kthe Z** | Negon një bosht burimi. | Zbatohet te pozicionet dhe te vektorët e drejtimit të shikimit. |
| **Koha** | Boshti kohor. | Opsionale. Pa të nuk ka kohëvizatë. |
| **Njësia e kohës** | Si lexohet kolona e kohës. | Shtatë njësi; shih [Boshtet, njësitë dhe koha](axes-units-and-time.md#time). Injorohet për kolonat Parquet `TIMESTAMP`/`DATE`, siç thotë paneli. |
| **ID e personit** | Kush ose çfarë i përket një rreshti. | Opsionale. Bën të mundura gjurmët, jetëgjatësitë, riluajtjen e kutisë dhe nxehtësinë e vijave. |
| **Seanca / ndeshja** | Cila ndeshje, raid, raund, garë ose xhiro i përket një rreshti. | Opsionale. Pozicionet nuk ndërmjetësohen, nuk shoqërohen me gjurmë dhe nuk bashkohen në një rrugë mbi një ndërrim seance. Shih [Seancat, personat dhe grupet](sessions-persons-groups.md). |
| **Ekipi / grupi** | Çdo kolonë me pak vlera të ndryshme. | Opsionale. Drejton ngjyrat e grupeve, nxehtësinë e ekipeve dhe ndarjen e diferencës sipas grupit. |
| **Drejtimi i shikimit** | *Asnjë*, *Kolona e drejtimit / pjerrësisë* ose *Kolona e vektorit të drejtimit*. | Me drejtim/pjerrësi: **Drejtimi**, **Pjerrësia** dhe **Njësia e këndit** (*Gradë* / *Radianë*). Me vektor: **Dir X**, **Dir Y**, **Dir Z**. Përdoret për rrezet e shikimit të [kutisë së riluajtjes](box-replay.md). |
| **Mbaj për filtrim** | Kolona shtesë të mbajtura në memorie. | Një kuti për çdo kolonë, dhe për secilën të zgjedhur *diapazon* (numerik) ose *kategori*. Çdo një kushton 4 bajt për rresht dhe një kalim dekodimi gjatë ngarkimit. Vetëm kolonat e mbajtura mund të [filtrohen](filters.md), të përdoren për një [ndarje diference](difference.md) ose si kolonë ngjarjesh e [nxehtësisë së vijave](line-heat.md). |
| **Shfaq rreshta shembull** | Një tabelë me 12 rreshtat e parë të mostruar, të gjitha kolonat. | Për të kontrolluar hamendjet. |

Një kolonë filtri e zgjedhur që nuk është caktuar shprehimisht lexohet si *diapazon*; një kolonë id që duket numerike është shpesh më e dobishme si *kategori*. Vetëm 4 filtra mund të jenë aktivë njëherësh ([Filtrat](filters.md)).

## Si hamendëson përcaktimi automatik {#how-the-auto-mapping-guesses}

Hamendësimi është në [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Shikon emrat e kolonave, cilat kolona janë numerike në rreshtat e mostruar (më shumë se 90% e vlerave jo-boshe lexohen si numra), sa vlera të ndryshme ka çdo kolonë në mostër, dhe llojet logjike Parquet. Modelet e emrave provohen me radhë, pa dallim shkronjash, dhe modeli i parë që përputhet me ndonjë kolonë ende të lirë fiton.

### Pozicioni {#position}

| Boshti | Modelet e emrave, me radhë (vetëm kolona numerike) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Nëse një bosht është ende bosh, kolonat e para numerike të lira (duke injoruar `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) e mbushin atë me radhë. Një hamendje e gabuar duket qartë në ekran; një e zbrazët do të linte një pamje bosh.

### Koha {#time}

- **Kolonat e timestamp-it Parquet së pari.** Mes kolonave, lloji logjik i të cilave është `TIMESTAMP` ose `DATE`, më e mira zgjidhet sipas pikëve: +10,000 nëse emri përputhet me një model kohe, -5,000 për një `DATE` të thjeshtë, plus numrin e vlerave të ndryshme në mostër. Një datë e gjithë-ditore dhe një fillim seance konstant marrin pothuajse asnjë vlerë të ndryshme, kështu që çasti i ngjarjes fiton. Njësia bëhet pastaj *Timestamp Unix (ms)*.
- **Përndryshe sipas emrit:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, pastaj emrat e kohës së kaluar (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Njësia hamendësohet pastaj nga vlerat: ISO-8601 kur një vlerë duket si `YYYY-MM-DDT…` ose `YYYY-MM-DD …`; përndryshe sipas madhësisë më të madhe: mbi 10^17 nanosekonda, mbi 10^14 mikrosekonda, mbi 10^11 milisekonda Unix, mbi 10^8 sekonda Unix, mbi 10^6 milisekonda, përndryshe sekonda.

Kur zgjidhet një kolonë kohe e kaluar, paneli shënon që çdo seancë rreshtohet atëherë me fillimin e vet - e mirë për mbivendosjen e ndeshjeve, jo për t'i parë në radhën e vërtetë.

### Seanca, personi, grupi {#session-person-group}

Seanca merret **pas** boshtit kohor dhe **para** personit dhe grupit, sepse një kolonë seance shpesh është një timestamp (çasti i fillimit të ndeshjes në çdo rresht të ndeshjes).

| Roli | Modelet e emrave, me radhë |
|---|---|
| Seanca | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (secili saktësisht, opsionalisht me `_id`) |
| Personi | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, pastaj `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (të dhëna garash: makina është ajo që lëviz) |
| Grupi | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grupi, rezervë | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Një kandidat grupi që merr një vlerë të ndryshme te shumica e rreshtave të mostruar (më shumë se max(48, 60% e mostrës)) është një id, jo grup: bëhet kolona e personit nëse s'u gjet asnjë, dhe nuk përdoret si grup. Nëse s'u gjet asnjë kolonë grupi, përdoret kolona jo-numerike me numrin më të vogël vlerash të ndryshme midis 2 dhe 12.

### Drejtimi i shikimit {#look-direction}

Një kolonë numerike me emrin `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` ose `rot_z` / `rotation_z` e kalon drejtimin e shikimit në drejtim/pjerrësi; pjerrësia kërkohet si `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Supozohen gradët kur ndonjë drejtim i mostruar kalon 7 në madhësi, përndryshe radianë. Një vektor drejtimi nuk hamendësohet kurrë; vjen nga sugjerimet më poshtë ose nga ju.

### Kolonat e filtrit {#filter-columns}

Të shumtën **6** kolona mbahen automatikisht, sipas radhës:

1. `region`, `sessionMode`, `actor` - kolona që ekzistojnë për t'u filtruar (pikë 1200);
2. kolona kategorie që ndryshojnë në mostër, me më pak vlera të ndryshme së pari (1000 minus numri);
3. një kolonë konstante në mostër, por vetëm kur ngarkohen disa skedarë - mund të ndryshojë midis skedarëve, si një rajon ose një id provë-garë (600);
4. kolona numerike (500).

Kolonat që luajnë tashmë një rol, emrat e zhurmës së përmendur më lart, kolonat konstante në një ngarkim me një skedar, dhe kolonat me tekst të lirë (më shumë se max(16, gjysma e mostrës) vlera të ndryshme) nuk ofrohen automatikisht. Çdo kolonë mund të zgjidhet ende me dorë.

### Boshti lart {#up-axis}

Kur të tre boshtet janë hartëzuar, boshti me shpërndarjen më të vogël të Y dhe Z në mostër merret si lart (një hartë është shumë më e gjerë sesa e lartë); përndryshe supozohet Z lart.

## Sugjerimet `heat3d` në një footer Parquet {#the-heat3d-hints-in-a-parquet-footer}

Një skedar Parquet mund të thotë si duhet të lexohet. Nëse meta-të dhënat çift çelës/vlerë të footer-it të skedarit kanë një hyrje me çelësin **`heat3d`**, vlera e saj analizohet si JSON dhe vendoset mbi hamendjet ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Konvertuesi i demove CS2 shkruan një hyrje të tillë, kështu që tabelat e tij hapen me lojtarin si person, palën si grup, çdo raund si seancë, drejtimin e shikimit të ndezur dhe botën në drejtimin e duhur.

Vetëm skedari **i parë** i një zgjedhjeje lexohet për sugjerime. Çdo hyrje është opsionale, dhe çdo vlerë e sugjeruar shfaqet prapë në panel dhe mund të ndryshohet. Një përshkrim i plotë i skemës, me shembull dhe si shkruhet, është te [referenca e formateve të të dhënave](data-formats.md#the-heat3d-hints).

Rregullat, shkurtimisht:

- Një kolonë e emëruar nga një sugjerim zbatohet vetëm kur skedari e ka atë kolonë.
- `lookMode: "vector"` hyn në fuqi vetëm kur `dirX`, `dirY` dhe `dirZ` janë të gjitha të vendosura; `"yawPitch"` vetëm kur `yaw` është vendosur.
- `extra`, kur është i pranishëm, zëvendëson listën automatike të filtrave (emrat e panjohur dhe kolonat që luajnë tashmë një rol hiqen); lloji diapazon/kategori i secilës ndjek nëse dukej numerike. Kur mungon, lista automatike mbahet pa asnjë kolonë që një sugjerim i ka dhënë rol.
- `axes.up` duhet të jetë `"y"` ose `"z"`, kthesat duhet të jenë booleanë, `scale` duhet të jetë pozitiv.
- `entity.size`, kur është pozitiv, është madhësia e një objekti të ndjekur në njësitë e skedarit ([madhësia e entitetit](sessions-persons-groups.md#entity-size)); është i vetmi mënyrë për ta vendosur.

## Problem i njohur: mbishkrimi i ndarësit CSV {#known-issue-overriding-the-csv-separator}

Kur ndryshoni ndarësin në një tjetër nga ai i zbuluar, lista e kolonave dhe rreshtat e mostrës nuk ndryshojnë (pamja paraprake ndan ende me ndarësin e zbuluar). Ndarësi i zgjedhur përdoret prapë për vetë ngarkimin. Nëse ndarësi i zbuluar është i gabuar:

1. Hapni skedarin në një redaktues teksti.
2. Zëvendësoni ndarësin me presje kudo (dhe presjet dhjetore me pika).
3. Ruajeni, pastaj ngarkojeni skedarin përsëri.

Shkaku është te [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).

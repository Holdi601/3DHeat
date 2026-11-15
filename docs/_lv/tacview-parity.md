---
title: "Tacview paritāte"
parent: "Spēles atkārtojums"
grand_parent: "Atskaņojums"
nav_order: 1
lang: "lv"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Tacview paritāte

Tacview ir populāra programma lidojumu ierakstu skatīšanai. Ja to pazīstat, šī lapa parāda, kur katrs tās rīks atrodas 3DHeat.

Tā uzskaita katru Tacview 1.9 funkciju (tās rokasgrāmatu, lietotāja saskarnes teksta tabulu un ACMI 2.2 failu formātu) un to, kur [mača atskaņojums](match-replay.md) šobrīd atrodas salīdzinājumā ar to. Mērķis: ko Tacview var darīt ar atskaņojumu un tā datiem, to var darīt arī 3DHeat.

**Statuss:**
- **done**: jau ir 3DHeat.
- **new**: izveidots, lai atbilstu Tacview funkcijai.
- **not yet**: attiecas, bet nav izveidots.
- **n/a**: šeit neattiecas, iemesls ir norādīts.

Kur atrast funkcijas: cilne **Mačs**, **Figūru atskaņojums** (vai **Figūru pārklājums** cilnē Siltumkarte), sānjoslas sadaļās **Atskaņojums**, **Vienības**, **Notikumi**, **Grāmatzīmes**, **Taktiskais attēlojums**, **Statistika**, **Laika nobīde un apgriešana**, **Karte un pozīcija**, **Audio un video** un **Etiķetes**. Skat. [Mača atskaņojums](match-replay.md).

## Kameras {#cameras}

| Tacview | 3DHeat | Status |
|---|---|---|
| Kabīnes skats (F5), horizonts griežas kopā ar lidmašīnu | **Kabīne**: no vienības ārpus tās, pēc tās stāvokļa, kā to paredz kustības modelis. Vienības pašas figūra tiek nogriezta. Velciet, lai skatītos apkārt; **Atkal skatīties uz priekšu** atiestata. | new |
| HUD kabīnes skatā (IAS/CAS/TAS izvēle) | **Displejs acu līmenī** (H): horizonts un tangāžas skala faktiskajā skatā, lidojuma trajektorijas marķieris, kursa lenta, IAS, augstums, TAS, Mahs, G, uzbrukuma leņķis, vertikālais ātrums, AGL | new |
| 3D kabīnes instrumenti, pilota galvas izsekošana (PilotHead*), TrackIR | Nav kabīnes modeļu; galvas leņķi tiek rādīti vienības kartītes **Neapstrādāts** skatā | n/a (nav kabīnes modeļu; galvas izsekošanas aparatūra ir domāta tiešraidei) |
| Ārējais skats (F6): riņķot ap primāro objektu | **Vajāšana** (griežas kopā ar vienību) un **Orbīta** (saglabā savu virzienu) | done |
| Cīņas kamera, "Skatīties uz mērķi" (padlock) | **Padlock**: no kabīnes, turēts uz mērķa | new |
| Cīņas kamera, "Centrēts" / "Skatīties uz priekšu" | **Mērķis**: aiz vienības uz līnijas no mērķa, skatoties garām tam uz mērķi. **Fiksēta** azimutā 0 skatās uz priekšu no priekšpuses. | new |
| Mainīt primāro un sekundāro | **Mainīt vietām** blakus mērķim | new |
| Satelīta skats (F7), ortogonāls skats no augšas | **Pavadonis**: tieši uz leju uz vienību, ziemeļi augšā; velciet, lai pagrieztu. 2D karte ir ortogonālais plāns. | new |
| Brīvā kamera (F8), W/A/S/D, E/C | Brīvās lidošanas kamera (W/A/S/D, Space/Q, Shift/Alt) | done |
| Papildinājuma Head-On kamera; ārējā kamera, piestiprināta objektam | **Fiksēta**: vieta ap vienību, kas griežas un ripo kopā ar to; velciet, lai to pārvietotu (aizmugurē, spārna galā, pa priekšu) | new |
| Papildinājuma Lock kamera (iesaldēt pozīciju) | Pārtraukt sekot (Esc): kamera paliek, kur bija | done |
| Stratēģiskais skats (tālummaiņa uz visu Zemi) | [Pasaules fons](world-backdrop.md) un 2D kartes visa ieraksta rāmis | done |
| Redzes lauka iestatījums | **Kamera un aina** FOV | done |
| Skatu pārslēgšana ar taustiņiem | **V** nākamais skats, **Shift+V** atpakaļ | new |

## 3D skats un attēlošanas iespējas {#d-view-and-display-options}

| Tacview | 3DHeat | Status |
|---|---|---|
| Lentes takas, garuma slīdnis | Takas (sekundes) Komandas skatītājā | done |
| Priekšlaicīga taka (ceļš uz priekšu) | **Ceļš uz priekšu**: kur vienība patiesi dosies nākamajās sekundēs | new |
| Objekta augstuma līnijas / sienas | **Vertikālās līnijas** | done (līnijas; sienas nav izveidotas) |
| Izvēlētā objekta vektori: virziens (punktēts), kurss (nepārtraukts), cēlējspēks | **Ātruma vektori** (kurss un ātrums tik sekundēm, ar padomu) un **Deguna un cēlējspēka līnijas** (deguns punktēts, cēlējspēks īss un tumšs) | new |
| Pilota redzes līnija | **Pilota skata līnija**: punktēta ciāna līnija gar PilotHeadYaw/PilotHeadPitch (vai kolonnu HeadYaw, ViewYaw vai LookYaw) pret vienības asīm | new |
| SAM/AAA letālās diapazona kupoli (EngagementRange, VerticalEngagementRange, EngagementMode, "2" dvīņi) | **Iesaistes zonas**: kupoli, ovoīds, kur vertikālais diapazons atšķiras; izslēgti, kamēr EngagementMode ir 0 | new |
| Radara notveršanas (LockedTarget..9) ar etiķetēm | **Notveršanas**: sarkanas līnijas uz katru notvertu objektu; punktēta dzeltenbrūna uz FocusedTarget; gar LockedTargetAzimuth/Elevation/Range, kur objekts nav nosaukts. **Notveršanas etiķetes**: mērķa nosaukums un attālums katrā notveršanas līnijā | new |
| Radara konuss (RadarMode, Azimuth, Elevation, Roll, Range, staru platumi) un diapazona vārti | **Radaru konusi**: staru malas un vidējais gredzens, pagriezti pēc azimuta, elevācijas un ripas pret vienību; diapazona vārti kā divas dzeltenas malas. Bez staru platumiem - tikai stara ass. | new |
| Līnija starp diviem izvēlētiem objektiem (zaļa / sarkana punktēta, kad reljefs bloķē) | Izmērītā pāra līnija kļūst sarkana un punktēta, kad līmenis ir starp tiem | new |
| Automātiski palielināt tālus objektus | Mazākā figūra ekrānā (pikseļi) | done |
| Platuma/garuma režģis | **Karte un pozīcija → Režģis**: platuma un garuma līnijas uz zemes zem kameras, noapaļotā soļā atkarībā no augstuma (līdz 10° līdz 1'), ar uzrakstiem; vai **MGRS** kilometru režģis UTM zonai, ar rādītu zonu un 100 km kvadrātu. 2D kartes pašas režģis kā agrāk | new |
| Bullseye gredzeni | Gredzeni ap katras komandas bullseye 2D kartē | new (tikai 2D) |
| Glisādes pārklājums | **Glisādes**: 3° trajektorijas ar ±0,7° pilnas skalas malām abos katras skrejceļa galos ierakstam tuvumā, no OurAirports izmērītajiem slieksniem un augstumiem (lejupielādēti vienreiz, glabāti bezsaistē), atzīme katrā jūras jūdzē, nosaukta pēc lidostas un skrejceļa | new |
| Augstuma ierobežojumi (griestu/grīdas signāls) | **Augstuma ierobežojums**: grīda un griesti; to ārpus esošo vienību etiķetes kļūst sarkanas, un katra šķērsošana (zem grīdas, virs griestiem, atpakaļ iekšā) tiek uzskaitīta - klikšķis aizved uz turieni un seko vienībai | new |
| Iznīcinātie objekti pelēki, pēc 15 min noņemti | Dzīvības beidzas kopā ar savu trasi; mirusī vienība vienību sarakstā tiek nopelēkota | done |
| Redzams / Atspējots īpašības | Rādītas **Neapstrādāts**; ar tām nekas netiek paslēpts | not yet |
| Stick/throttle/pedāļu pozīciju attēlošana | Gāzes un motora vērtības laukos; vadības ievades **Neapstrādāts** | done (kā vērtības) |
| Komentāri kā subtitri | **Ziņojumi kā subtitri** (Etiķetes): ACMI Message un Comment notikumi, un tērzēšana no jebkuras spēles (Chat, Say vai Radio notikumi, vai tērzēšanas kolonna), skatījuma apakšā ar to, kurš teica, sešas sekundes | new |
| Datuma un UTC laika attēlošana | Laika skalas pulkstenis ar UTC, kur ierakstam ir atsauces laiks | done |
| Peles pozīcija platums/garums, MGRS, bullseye | Izvēles kartīte (noklikšķiniet uz punkta) dod platumu/garumu grādos, minūtēs un sekundēs un MGRS blakus pasaules metriem; bullseye katrai vienībai (lauks) | new |
| Pielāgots logotips | Nav izveidots | n/a (zīmols) |
| 3D modeļi, tuvākais, ja nav zināms | Pašu figūru katalogs, tuvākais analogs, īstais izmērs | done |
| Vairākas iesaistes (līnijas starp visiem pāriem) | **Kaujas līnijas**: no katras vienības aptvērumā uz katru pretinieku iestatītajā attālumā (1-200 km), katra ar savu attālumu, tuvākie 60 pāri; izmērītais pāris kā agrāk | new |

## Etiķetes {#labels}

| Tacview | 3DHeat | Status |
|---|---|---|
| Etiķetes ieslēgtas/izslēgtas, atsevišķi izvēlētajiem un neizvēlētajiem objektiem | **Etiķetes** ar noteikumiem **Izvēlētās**, **Gaisa kuģi**, **Zeme**, **Kuģi**, **Ieroči** un **MI**: rādītas vai nē, savas vērtības, prioritāte | new |
| Etiķešu lauki: nosaukums, izsaukuma zīme, pilots, ātrumi (TAS/CAS/IAS/Mahs/GS), augstumi (ASL/AGL), VS, AOA, AOS, G (vertikālais, sānu, garenvirziena), pagrieziena ātrums un rādiuss, enerģija, degvielas svars/tilpums/plūsma, virziens/trase, ripa/tangāža, sirdsdarbība | Katra `fields.ts` vērtība: tas pats saraksts, aprēķināts, kur nav ierakstīts (aptuvenās vērtības atzīmētas ar ~). Ripas ātrums un SpO2 tikai caur Raw. | done |
| Bullseye pozīcija etiķetēs | Lauks **Bullseye (azimuts / attālums)** | new |
| ILS novirzes, nolidotais attālums | Neapstrādātās vērtības; nolidotais attālums statistikā | done (daļēji) |
| Nerādīt nevajadzīgu telemetriju neizvēlētajiem objektiem | **Turēt etiķetes atsevišķi**, sakārtotas pēc katra noteikuma prioritātes | done / new |
| Etiķēt visus zemes objektus / tikai draudus | Noteikumi Zeme un MI | new |
| Etiķešu mērogs | **Etiķešu izmērs** (60-250 %) | new |
| Metriskās / angļu mērvienības | Metriskās / angļu | done (divas iestatījumu kopas, nevis astoņas) |

## Objekta informācija un telemetrija {#object-info-and-telemetry}

| Tacview | 3DHeat | Status |
|---|---|---|
| Primārā un sekundārā izvēle | Klikšķis seko un izvēlas; shift-klikšķis uz diviem mēra; izvēle **Mērķis** | done / new |
| Diapazons / pelengs / aspekts / tuvošanās starp diviem objektiem | BRAA līnija izmērītajam pārim; lauki Range, Bearing, Aspect un Closure no sekotās vienības | done |
| Relatīvais pelengs, LOS ātrums | Lauki **Relatīvais pelengs** (no sekotās vienības deguna, L/R) un **Redzes līnijas leņķiskais ātrums** (°/s) | new |
| Telemetrijas logi | Vienības kartīte un uzmešanas kartīte | done |
| Neapstrādāta telemetrija (katra ierakstītā īpašība, arī nezināmās) | **Neapstrādāts** vienības kartītē: katra kolonna vienības rindā, kā ierakstīta | new |
| Aktīvo objektu saraksts | **Vienības**: spēlētāji, MI, lidojumā esošie ieroči; dzīvie spilgti | done |
| Ieraksta īpašību logs (nosaukums, autors, brīfings...) | Glabāts kā RecordingInfo kolonna; rādīts Neapstrādāts | done (nav loga) |
| Pozīciju formāti DMS/MGRS, magnētiskais ziemeļi | **Pozīcija (platums / garums)** DMS un **MGRS** laukos; lauks **Magnētiskais kurss**; **Magnētiskie kursi** raksta kursu, virzienu un pelengu magnētiskajos (°M) un rāda kompasu ar abiem ziemeļiem un variāciju - Pasaules magnētiskais modelis 2025 (publiskā domēna koeficienti), aprēķināts šeit pēc vienības vietas un datuma | new |

## Diagrammas {#charts}

| Tacview | 3DHeat | Status |
|---|---|---|
| Viena objekta diagramma, līdz 4 vērtībām | **Laika gaitā** (un diagramma zem Atskaņojuma) | done |
| Līdz 4 objektiem vienlaikus | **Salīdzināt**: viena vērtība līdz 8 vienībām vienā skalā | new |
| Vērtība pret vērtību (enerģijas-manevrētspējas stilā) | **Vērtība pret vērtību**: pagriešanās ātrums pret ātrumu vai jebkuru pāri, katra vienība ir līnija, tās pašreizējais punkts atzīmēts | new |
| X ass pēc laika; tālummaiņa; laika ritināšana no diagrammas | Ritenītis tālina laikā, dubultklikšķis atiestata, klikšķis ved uz brīdi | new |
| X ass pēc gaisa vai zemes attāluma | **Laiks / Gaisa attālums / Zemes attālums** laika un salīdzināšanas diagrammās; tālummaiņa un klikšķis-lai-ietu darbojas tāpat | new |
| Iepriekš definētas diagrammas (enerģija, paātrinājums...) | Var izvēlēties jebkuru vērtību (enerģijas augstums un tā ātrums ir vērtības) | done |

## Statistika, lidojuma žurnāls, notikumi {#statistics-flight-log-events}

| Tacview | 3DHeat | Status |
|---|---|---|
| Lidojuma žurnāls: pacēlās, nolaidās, šāva, trāpīja, nogalināja, atstāja zonu | **Statistika** katrai vienībai: dzīvības, nogalinājumi, nāves, šāvieni, trāpījumi, trāpījumu koeficients, pacelšanās, nolaišanās, laiks gaisā, maks. G (un min.), maks. ātrums, augstums un Mahs, attālums. Pacelšanās nāk no TakenOff/Landed notikumiem, OnGround, AGL vai aprēķina, atzīmēta ar ~. | new |
| Rezultātu tabulas un misijas pārskata papildinājumi | Komandas kopsavilkums un visvairāk nogalinājumu; mača kopsavilkuma pašu rezultātu tabula | new / done |
| Lidojuma žurnāla eksports XML/CSV | **Eksportēt CSV** statistikai un notikumiem, kā tie uzskaitīti | new (tikai CSV) |
| Telemetrijas eksports CSV noteiktā ātrumā | **Izvēlētās vienības telemetrija**: katra vērtība, 1-20 sekundē | new |
| Notikumu žurnāls, dubultklikšķis, lai ietu un izvēlētos | Saraksts **Notikumi**, filtrēts pēc veida un vienības; klikšķis aizlido uz vietu | done |
| Iepriekšējais / nākamais notikums (Ctrl+←/→) | **Page Up / Page Down** | new |
| Pauze notikumā | **Pauze notikumā** | new |
| Laika skalas marķieri (atbrīvošana, trāpījumi, iznīcināšana; izvēlētā objekta zilā, grāmatzīmes sarkanas) | Nogalinājumi un nāves kā blīvuma josla, sekotās vienības zilā, grāmatzīmes sarkanas; klikšķis, lai ietu | new |
| Notikuma noņemšana, nogalinājumu noņemšana | Nav izveidots | n/a (notikumi pieder ierakstam; filtri tos paslēpj) |

## Grāmatzīmes {#bookmarks}

| Tacview | 3DHeat | Status |
|---|---|---|
| Ievietot grāmatzīmi ar izvēli un skata punktu | **Pievienot grāmatzīmi** (B): brīdis, brīvā kamera vai sekotā vienība ar savu skatu, attālumu un mērķi; nosaukta; glabāta šajā pārlūkprogrammā katram ierakstam | new |
| Noņemt grāmatzīmi | × sarakstā | new |
| Grāmatzīmes laika skalā un žurnālos | Sarkanas atzīmes; saraksts | new |
| Event=Bookmark ACMI | Uzskaitīts zem ieraksta atzīmēm kopā ar nogalinājumiem, nāvēm un ziņojumiem | new |
| Kopēšanas/ielīmēšanas saīsne (dalīties ar skatu) | **Eksportēt / Importēt** grāmatzīmes kā failu; C kopē kameras pozu | new |

## Atskaņošana {#playback}

| Tacview | 3DHeat | Status |
|---|---|---|
| Atskaņot/pauzēt, uz sākumu, ātrums, laika skalas ritināšana | Laika skala | done |
| Kadrs pa kadram | **,** un **.** sekundi atpakaļ un uz priekšu (Shift: desmit) | new |
| Atskaņošana atpakaļ | **◀** laika skalā, **J** (**L** uz priekšu; tas pats taustiņš vēlreiz pauzē): atskaņo no beigām uz sākumu izvēlētajā ātrumā, cikliski vai apstājoties sākumā | new |
| Laika pārlēkšanas dialogs | Laika skala un notikumu saraksts | done |
| Laika nobīde vienam objektam (spoks) | **Laika nobīde un apgriešana**: pārvietot vienas vienības lidojumu vai visu ierakstu par tik sekundēm; **Salāgot ierakstus** pārvieto vairākus ierakstus, lai tie sāktos kopā, un atskaņo tos uzreiz (divi lidojumi dažādās dienās blakus). Ieraksts tiek pārbūvēts, tātad trases, notikumi, diagrammas un statistika seko | new |
| Apgriešana pirms/pēc | **No tagad / Līdz tagad / Apgriezt līdz šim posmam** (atsaukšana saglabā nobīdes), tad **Eksportēt CSV** (ielādējas atpakaļ 3DHeat) vai **Eksportēt ACMI** (Tacview 2.2 teksts, ierakstam, kas novietots uz zemes) | new |

## Reljefs un karte {#terrain-and-map}

| Tacview | 3DHeat | Status |
|---|---|---|
| Īsts reljefs, pielāgots augstums un tekstūras | Līmeņi (spēles pašas karte kā 3D modelis), pasaules fona plāksnītes | done |
| Plakans / tukšs / augsta kontrasta reljefa režīmi | [Līmeņa izskats](level-appearance.md): zemes reljefs, virsma un būves rādītas vai nē | done (ne tie paši režīmi) |
| 2D taktiskā karte (Tacview nav; ir satelīta skats) | **2D karte**: stūra vai visa skats, simboli pēc veida un komandas (aizpildīti spēlētāji, kontūrēti MI) pagriezti pret savu virzienu, takas, nosaukumi, mēroga josla, attāluma gredzeni ap sekoto vienību, bullseye gredzeni, 3D kameras vieta, nesenās nāves; vilkt, ritenītis, klikšķis, lai sekotu (M) | new |
| Statiskie objekti (lidostas, skrejceļi, orientieri, zonas, KML) | Izmērīti skrejceļi (OurAirports) pasaules fonā un to glisādes; GPX orientieri un KML atzīmes ielādējas kā stāvoši objekti; [Taktikas dēlis](tactics-board.md) zīmē zonas un maršrutus | new |

## Imports, eksports, ierakstīšana {#import-export-recording}

| Tacview | 3DHeat | Status |
|---|---|---|
| ACMI teksts un zip | [Tacview ACMI](tacview-acmi.md) | done |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (trases, maršruti, orientieri; Garmin sirdsdarbība, kadence, jauda, temperatūra), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC un GGA jebkura runātāja, kontrolsummas pārbaudītas, pāri pusnaktij), **IGC** (B ieraksti, datums, pilots un planieris), **FIT** (record ziņojumi, saspiesti laikspiedoli) - katrs novietots pēc platuma un garuma plaknē trašu vidū, tātad pasaules fons sakrīt; virziens, tangāža un ātrums no faila vai no punkta līdz punktam. CSV un Parquet kā agrāk | new (DIS n/a: tiešraides tīkla protokols) |
| Dzimtie ierakstītāji (DCS, BMS, IL-2, MSFS...) | 3DHeat paši konvertētāji (War Thunder, CS2, Squad, Arma un citi) | done (paši) |
| Reāllaika telemetrija pa TCP, ADS-B | Nav izveidots | n/a (atskaņojumi pēc mača) |
| Sinhronizēts audio/video | **Audio un video**: vietējais fails atskaņojas, pauzējas, pārtinas un maina ātrumu kopā ar laika skalu no uzstādīta sākuma (**Sākas tagad**, ±0,1 s); video izmērojamā panelī pāri skatam vai attēls attēlā. Fails paliek pārlūkprogrammā | new |
| Video eksports | [Kameras ceļš un video](camera-path-and-video.md) | done |

## Citi {#other}

| Tacview | 3DHeat | Status |
|---|---|---|
| Lua papildinājumi | Nav izveidots | n/a (atvērtais kods: mainiet pašu skatītāju) |
| Tiešsaistes izvērtēšana (kopīga sesija) | Nav izveidots | n/a (Tacview tā ir mitināta sesija, kas visus tur uz vienas atskaņošanas galvas. 3DHeat nav servera, un ieraksti paliek skatītāja datorā; pat tiešs savienojums starp ierīcēm prasa signalizācijas serveri. Izvērtēšana tiek kopīgota kā faili: apgrieztais ieraksts (Export ACMI vai CSV) un grāmatzīmju fails, kas atveras tajos pašos brīžos un skatos) |
| Instruktora attālā vadība | Nav izveidots | n/a (vada darbojošos simulatoru) |
| Objektu rediģēšana (pievienot, rediģēt, noņemt objektus) | [Taktikas dēlis](tactics-board.md) plānotiem objektiem; ieraksti ir tikai lasāmi | n/a |
| Valodas | 40 valodas | done |
| Ierakstu autentifikācija | Nav izveidots | n/a |

## Izstrādātājiem: ACMI 2.2 īpašības {#for-developers-acmi-22-properties}

Lasa `data/acmi.ts`; skaitliskās īpašības kļūst par skaitļu kolonnām, teksta - par kategoriju kolonnām. Visas tās tiek rādītas zem **Neapstrādāts** vienības kartītē. Tās tiek lasītas nolūkā:

| Īpašības | Lietojums |
|---|---|
| T (visas četras formas), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Pozīcija, stāvoklis, figūra, vienības nosaukums, komanda |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Lauki, diagrammas, HUD, pacelšanās un nolaišanās noteikšana |
| VerticalGForce, LongitudinalGForce, LateralGForce | G lauki |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Lauki |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Degvielas lauki, summēti pa tvertnēm |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radaru konusi un diapazona vārti |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Notveršanas līnijas |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Iesaistes kupoli |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Lauki |
| Health | Lauks |
| Notikumi: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Notikumu saraksts, statistika (nāves, pacelšanās, nolaišanās), grāmatzīmes; Message un Comment kā subtitri |
| PilotHeadYaw, PilotHeadPitch | Pilota skata līnija |
| Tipa tags Bullseye (Navaid+Static+Bullseye) | Bullseye lauks un kartes gredzeni |
| Viss pārējais (PilotHeadRoll, vadība, virsmas, ILS novirzes, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, izmēri...) | Rādīts kā ierakstīts zem **Neapstrādāts** |

Radara un notveršanas leņķi tiek ņemti pret vienības pašas asīm: azimuts pa labi, elevācija uz augšu, ripa - labais spārns uz leju. ACMI specifikācija saka, ka tie ir attiecībā pret lidmašīnu, bet nesaka, kurā virzienā ir pozitīvi; šī lasīšana seko tās transformācijai (yaw pulksteņa rādītāja virzienā, pitch uz augšu, roll labais spārns uz leju).

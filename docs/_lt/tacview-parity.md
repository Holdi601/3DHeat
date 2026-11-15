---
title: "Tacview paritetas"
parent: "Rungtynių pakartojimas"
grand_parent: "Pakartojimas"
nav_order: 1
lang: "lt"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Tacview paritetas

Tacview yra populiari programa skrydžio įrašams žiūrėti. Jei ją pažįstate, šis puslapis parodo, kur 3DHeat yra kiekviena jos priemonė.

Čia išvardytos visos Tacview 1.9 funkcijos (jos vadovas, jos sąsajos tekstų lentelė ir ACMI 2.2 failo formatas) ir tai, kaip [rungtynių pakartojimas](match-replay.md) 3DHeat atitinka jas. Tikslas: ką Tacview gali padaryti pakartojimui ir jo duomenims, tai 3DHeat taip pat gali padaryti.

**Būsena:**
- **done**: jau yra 3DHeat.
- **new**: sukurta atitikti Tacview funkciją.
- **not yet**: taikoma, bet dar nesukurta.
- **n/a**: čia netaikoma, su priežastimi.

Kur rasti funkcijas: skirtukas **Match** (Rungtynės), **Figure replay** (Figūrų pakartojimas) arba **Figure overlay** (Figūrų sutapdinimas) Heatmap skirtuke, šoninės juostos skyriai **Replay** (Pakartojimas), **Units** (Vienetai), **Events** (Įvykiai), **Bookmarks** (Žymės), **Tactical display** (Taktinis rodymas), **Statistics** (Statistika), **Time shift and trim** (Laiko poslinkis ir apkarpymas), **Map and position** (Žemėlapis ir padėtis), **Audio and video** (Garsas ir vaizdo įrašas) ir **Labels** (Žymos). Žr. [Rungtynių pakartojimas](match-replay.md).

## Kameros {#cameras}

| Tacview | 3DHeat | Būsena |
|---|---|---|
| Kabinos vaizdas (F5), horizontas sukasi kartu su orlaiviu | **Cockpit** (Kabina): iš vieneto į išorę pagal jo padėtį, kaip rodo judesio modelis. Paties vieneto figūra nukirpta. Vilkite, kad žiūrėtumėte aplinkui; **Look ahead again** (Vėl žiūrėti pirmyn) atstato. | new |
| HUD kabinos vaizde (IAS/CAS/TAS pasirinkimas) | **Head-up display** (H) (Galvos aukščio ekranas): faktinio vaizdo horizontas ir pakreipimo skalė, skrydžio trajektorijos žymeklis, krypties juosta, IAS, aukštis, TAS, Macho skaičius, G, puolimo kampas, vertikalus greitis, AGL | new |
| 3D kabinos prietaisai, piloto galvos sekimas (PilotHead*), TrackIR | Kabinos modelių nėra; galvos kampai rodomi vieneto kortelės skyriuje **Raw** (Neapdoroti) | n/a (nėra kabinos modelių; galvos sekimo įranga skirta gyvam skraidymui) |
| Išorinis vaizdas (F6): sukasi aplink pagrindinį objektą | **Chase** (Persekiojimas; sukasi kartu su vienetu) ir **Orbit** (Orbita; išlaiko savo kryptį) | done |
| Dogfight kamera, "Look at target" (padlock) | **Padlock** (Padlock): iš kabinos, nuolat laikomas ties taikiniu | new |
| Dogfight kamera, "Centered" / "Look forward" | **Target** (Taikinys): už vieneto, ant linijos nuo taikinio, žiūrint pro jį į taikinį. **Fixed** (Fiksuota) azimute 0 žiūri į priekį iš priekio. | new |
| Pakeisti pagrindinį ir antrinį | **Swap** (Sukeisti) šalia taikinio | new |
| Palydovinis vaizdas (F7), ortografinis vaizdas iš viršaus | **Satellite** (Palydovas): tiesiai žemyn į vienetą, šiaurė viršuje; vilkite, kad pasuktumėte. 2D žemėlapis yra ortografinis planas. | new |
| Laisva kamera (F8), W/A/S/D, E/C | Laisvo skrydžio kamera (W/A/S/D, Space/Q, Shift/Alt) | done |
| Papildinys Head-On kamera; išorinė kamera, pririšta prie objekto | **Fixed** (Fiksuota): vieta aplink vienetą, kuri sukasi ir rieda kartu su juo; vilkite, kad perkeltumėte (už nugaros, sparno galo, iš priekio) | new |
| Papildinys Lock Camera (sustabdyti poziciją) | Nebesekti (Esc): kamera lieka, kur buvo | done |
| Strateginis vaizdas (atitolinimas iki viso Žemės) | [Pasaulio fonas](world-backdrop.md) ir 2D žemėlapio viso įrašo rėmas | done |
| Vaizdo lauko nustatymas | **Camera & scene** (Kamera ir scena) FOV | done |
| Vaizdų kaitaliojimas klavišais | **V** kitas vaizdas, **Shift+V** atgal | new |

## 3D vaizdas ir rodymo parinktys {#d-view-and-display-options}

| Tacview | 3DHeat | Būsena |
|---|---|---|
| Juostiniai pėdsakai, ilgio slankiklis | Pėdsakai (sekundės) Team viewer (Komandų žiūryklė) | done |
| Numatomas pėdsakas (kelias pirmyn) | **Path ahead** (Kelias pirmyn): kur vienetas iš tikrųjų važiuos per kelias sekundes | new |
| Objekto aukščio linijos / sienos | **Drop lines** (Vertikalios linijos) | done (linijos; sienos nesukurtos) |
| Pasirinkto objekto vektoriai: kryptis (punktyras), kursas (ištisinė), kėlimas | **Velocity vectors** (Greičio vektoriai) (kursas ir greitis tiek sekundžių, su patarimu) ir **Nose and lift lines** (Nosies ir keliamosios jėgos linijos) (nosis punktyru, kėlimas trumpas ir tamsus) | new |
| Piloto žvilgsnio linija | **Pilot line of sight** (Piloto žvilgsnio linija): brūkšninė žydra linija pagal PilotHeadYaw/PilotHeadPitch (arba HeadYaw, ViewYaw ar LookYaw stulpelį) lyginant su vieneto ašimis | new |
| SAM/AAA mirtino nuotolio kupolai (EngagementRange, VerticalEngagementRange, EngagementMode, "2" dvyniai) | **Engagement zones** (Pasiekiamumo zonos): kupolai, ovalūs, kai vertikalus nuotolis kitoks; išjungti, kai EngagementMode yra 0 | new |
| Radaro užrakinimai (LockedTarget..9) su etiketėmis | **Locks** (Užrakinimai): raudonos linijos iki kiekvieno užrakinto objekto; brūkšninės gintarinės iki FocusedTarget; pagal LockedTargetAzimuth/Elevation/Range, kai objektas nenurodytas. **Lock labels** (Užrakinimų etiketės): taikinio pavadinimas ir nuotolis ant kiekvienos užrakinimo linijos | new |
| Radaro kūgis (RadarMode, Azimuth, Elevation, Roll, Range, pluošto pločiai) ir nuotolio vartai | **Radar cones** (Radaro kūgiai): pluošto kraštas ir vidurinis žiedas, pasukti pagal azimutą, kampą ir posūkį prieš vienetą; nuotolio vartai kaip du geltoni kraštai. Be pluošto pločių - tik pluošto ašis. | new |
| Linija tarp dviejų pasirinktų objektų (žalia / raudona punktyrinė, kai reljefas blokuoja) | Išmatuotos poros linija tampa raudona ir brūkšnine, kai lygis yra tarp jų | new |
| Automatiškai didinti tolimus objektus | Mažiausia figūra ekrane (taškai) | done |
| Platumos / ilgumos tinklelis | **Map and position → Grid** (Žemėlapis ir padėtis → Tinklelis): platumos ir ilgumos linijos ant žemės po kamera, apvaliu žingsniu pagal aukštį (nuo 10° iki 1'), pažymėtos; arba **MGRS** kilometrų tinklelis UTM zonoje su zona ir 100 km kvadratu. 2D žemėlapio tinklelis kaip anksčiau | new |
| Bullseye žiedai | Žiedai aplink kiekvienos komandos bullseye 2D žemėlapyje | new (tik 2D) |
| Nusileidimo kelio perdanga | **Glideslopes** (Glisados): 3° keliai su ±0,7° visos skalės kraštais į abu kiekvienos netoliese įrašo esančios kilimo takų galus, pagal OurAirports išmatuotas ribas ir aukščius (parsisiųsta kartą, laikoma neprisijungus); žymė kas jūrmylę, pavadinta oro uosto ir kilimo tako pagal | new |
| Aukščio apribojimai (viršutinės / apatinės ribos signalas) | **Altitude restriction** (Aukščio apribojimas): apatinė ir viršutinė riba; už ribų esančių vienetų etiketės tampa raudonos, o kiekvienas kirtimas (žemiau apatinės, virš viršutinės, grįžimas vidun) surašomas - paspaudimas nuvažiuoja ten ir seka vienetą | new |
| Sunaikinti objektai pilki, pašalinami po 15 min. | Gyvybės baigiasi su savo trajektorija; žuvęs vienetas vienetų sąraše nublankęs | done |
| Visible / Disabled savybės | Rodoma **Raw** (Neapdoroti); jomis niekas nepaslepiama | not yet |
| Rodyti vairalazdžio / droselio / pedalų padėtis | Droselio ir variklio reikšmės laukeliuose; valdymo įvestys **Raw** (Neapdoroti) | done (kaip reikšmės) |
| Komentarai kaip subtitrai | **Messages as subtitles** (Pranešimai kaip subtitrai) (Labels): ACMI Message ir Comment įvykiai bei pokalbiai iš bet kurio žaidimo (Chat, Say ar Radio įvykiai arba pokalbių stulpelis), vaizdo apačioje su tuo, kas pasakė, šešias sekundes | new |
| Datos ir UTC laiko rodymas | Laiko juostos laikrodis su UTC, kai įraše yra atskaitos laikas | done |
| Pelės padėtis platuma/ilguma, MGRS, bullseye | Pasirinkimo kortelė (spustelėkite tašką) pateikia platumą/ilgumą laipsniais, minutėmis ir sekundėmis bei MGRS šalia pasaulio metrų; bullseye kiekvienam vienetui (laukas) | new |
| Pasirinktinis logotipas | Nesukurta | n/a (prekinis ženklas) |
| 3D modeliai, artimiausias, kai nežinomas | Savas figūrų katalogas, artimiausias atitikmuo, tikras dydis | done |
| Keli susidūrimai (linijos tarp visų porų) | **Engagement lines** (Kovos linijos): nuo kiekvieno vieneto, patenkančio į apimtį, iki kiekvieno priešininko nustatytame nuotolyje (1-200 km), kiekviena su savo nuotoliu, artimiausios 60 porų; išmatuota pora kaip anksčiau | new |

## Žymos {#labels}

| Tacview | 3DHeat | Būsena |
|---|---|---|
| Žymos įjungtos / išjungtos atskirai pasirinktiems ir nepasirinktiems objektams | **Labels** (Žymos) su taisyklėmis **Selected** (Pasirinkti), **Aircraft** (Orlaiviai), **Ground** (Antžeminiai), **Ships** (Laivai), **Weapons** (Ginklai) ir **AI** (DI): rodoma ar ne, savos reikšmės, prioritetas | new |
| Žymų laukai: pavadinimas, kvietimo ženklas, pilotas, greičiai (TAS/CAS/IAS/Mach/GS), aukščiai (ASL/AGL), VS, AOA, AOS, G (vertikalus, šoninis, išilginis), posūkio greitis ir spindulys, energija, kuro svoris/tūris/srautas, kursas/trajektorija, posūkis/polinkis, širdies ritmas | Visos `fields.ts` reikšmės: tas pats sąrašas, apskaičiuotos ten, kur neįrašytos (įvertinimai pažymėti ~). Posūkio greitis ir SpO2 tik per Raw. | done |
| Pelengas bullseye žymose | Laukas **Bullseye (azimutas / atstumas)** | new |
| ILS nukrypimai, nuskristas atstumas | Raw reikšmės; nuskristas atstumas statistikoje | done (iš dalies) |
| Nepasirinktos telemetrijos sumažinimas | **Keep labels apart** (Laikyti etiketes atskirai), surikiuota pagal kiekvienos taisyklės prioritetą | done / new |
| Pažymėti visus antžeminius objektus / tik grėsmes | Taisyklės Ground ir AI | new |
| Žymų mastelis | **Label size** (Etikečių dydis) (60-250 %) | new |
| Metriniai / imperiniai vienetai | Metriniai / imperiniai | done (du nustatymai, ne aštuoni) |

## Objekto informacija ir telemetrija {#object-info-and-telemetry}

| Tacview | 3DHeat | Būsena |
|---|---|---|
| Pirminis ir antrinis pasirinkimas | Paspaudimas seka ir pasirenka; shift-paspaudimas du, kad išmatuotumėte; **Target** (Taikinys) rinkiklis | done / new |
| Nuotolis / pelengas / aspektas / artėjimas tarp dviejų objektų | BRAA linija išmatuotai porai; Range, Bearing, Aspect ir Closure laukai iš sekamo vieneto | done |
| Santykinis pelengas, LOS greitis | Laukai **Relative bearing** (Santykinis pelengas) (nuo sekamo vieneto nosies, K/D) ir **Line-of-sight rate** (Matymo linijos kampinis greitis) (°/s) | new |
| Telemetrijos langai | Vieneto kortelė ir užvedimo kortelė | done |
| Neapdorota telemetrija (kiekviena įrašyta savybė, įskaitant nežinomas) | **Raw** (Neapdoroti) vieneto kortelėje: kiekvienas stulpelis vieneto eilutėje, kaip įrašyta | new |
| Aktyvių objektų sąrašas | **Units** (Vienetai): žaidėjai, DI, skrendantys ginklai; gyvi ryškūs | done |
| Įrašo savybių langas (pavadinimas, autorius, instruktažas...) | Saugoma kaip RecordingInfo stulpelis; rodoma Raw | done (be lango) |
| Padėties formatai DMS/MGRS, magnetinis šiaurės | Laukai **Position (lat / long)** (Padėtis (platuma / ilguma)) DMS ir **MGRS**; laukas **Magnetic heading** (Magnetinis kursas); **Magnetic headings** (Magnetiniai kursai) rašo kryptį, kursą ir pelengą magnetiniais laipsniais (°M) ir rodo kompasą su abiem šiaurėmis bei nuokrypiu - Pasaulio magnetinis modelis 2025 (viešo domeno koeficientai), skaičiuojamas čia pagal vieneto vietą ir datą | new |

## Diagramos {#charts}

| Tacview | 3DHeat | Būsena |
|---|---|---|
| Vieno objekto diagrama, iki 4 reikšmių | **Over time** (Laikui bėgant) (ir diagrama skyriuje Replay) | done |
| Iki 4 objektų vienu metu | **Compare** (Palyginti): viena reikšmė iki 8 vienetų vienoje skalėje | new |
| Reikšmė prieš reikšmę (energijos ir manevringumo stilius) | **Value vs value** (Reikšmė pagal reikšmę): posūkio greitis prieš greitį ar bet kurią porą, kiekvienas vienetas - linija, jo dabartinis taškas pažymėtas | new |
| X ašis pagal laiką; mastelis; laiko slinkimas iš diagramos | Ratukas priartina laike, dvigubas paspaudimas atstato, paspaudimas nueina į momentą | new |
| X ašis pagal oro ar žemės atstumą | **Time / Air distance / Ground distance** (Laikas / Oro atstumas / Žemės atstumas) laiko ir palyginimo diagramose; mastelis ir paspaudimas nueiti veikia taip pat | new |
| Iš anksto nustatytos diagramos (energija, pagreitis...) | Bet kurią reikšmę galima pasirinkti (energijos aukštis ir jo kitimo greitis yra reikšmės) | done |

## Statistika, skrydžio žurnalas, įvykiai {#statistics-flight-log-events}

| Tacview | 3DHeat | Būsena |
|---|---|---|
| Skrydžio žurnalas: pakilo, nusileido, šaudė, pataikė į, sunaikino, išskrido iš zonos | **Statistics** (Statistika) kiekvienam vienetui: gyvybės, nukovimai, mirtys, šūviai, pataikymai, pataikymų santykis, pakilimai, nusileidimai, laikas ore, didžiausias G (ir mažiausias), didžiausias greitis, aukštis ir Macho skaičius, atstumas. Pakilimai imami iš TakenOff/Landed įvykių, OnGround, AGL, arba įvertinami (pažymėta ~). | new |
| Taškų lentelės ir misijos ataskaitos papildiniai | Komandos santrauka ir daugiausia nukovimų; rungtynių santraukos pačios taškų lentelės | new / done |
| Skrydžio žurnalo eksportas XML/CSV | **Export CSV** (Eksportuoti CSV) statistikos ir įvykių sąrašo | new (tik CSV) |
| Telemetrijos CSV eksportas nustatytu dažniu | **Telemetry of the selected unit** (Pasirinkto vieneto telemetrija): kiekviena reikšmė, 1-20 per sekundę | new |
| Įvykių žurnalas, dvigubas paspaudimas nueiti ir pasirinkti | **Events** (Įvykiai) sąrašas, filtruojamas pagal rūšį ir vienetą; paspaudimas nuskrenda ten | done |
| Ankstesnis / kitas įvykis (Ctrl+←/→) | **Page Up / Page Down** | new |
| Pauzė įvykio metu | **Pause on event** (Pauzė įvykio metu) | new |
| Laiko juostos žymės (paleidimai, pataikymai, sunaikinimai; pasirinkto objekto mėlynos, žymės raudonos) | Nukovimai ir mirtys kaip tankio juosta, sekamo vieneto mėlyna, žymės raudonos; paspaudimas nueina | new |
| Įvykio pašalinimas, nukovimo pašalinimas | Nesukurta | n/a (įvykiai yra įrašo; filtrai juos paslepia) |

## Žymės {#bookmarks}

| Tacview | 3DHeat | Būsena |
|---|---|---|
| Įterpti žymę su pasirinkimu ir žvilgsniu | **Add bookmark** (Pridėti žymę) (B): momentas, laisva kamera arba sekamas vienetas su savo vaizdu, atstumu ir taikiniu; pavadinta; išsaugoma šioje naršyklėje pagal įrašą | new |
| Pašalinti žymę | × sąraše | new |
| Žymės laiko juostoje ir žurnaluose | Raudonos žymos; sąrašas | new |
| Event=Bookmark ACMI faile | Surašoma po įrašo žymomis kartu su nukovimais, mirtimis ir pranešimais | new |
| Kopijavimo / įklijavimo spartusis klavišas (vaizdo bendrinimas) | **Export / Import** (Eksportuoti / Importuoti) žymas kaip failą; C nukopijuoja kameros padėtį | new |

## Atkūrimas {#playback}

| Tacview | 3DHeat | Būsena |
|---|---|---|
| Paleisti / pauzė, į pradžią, greitis, laiko juostos slinkimas | Laiko juosta | done |
| Kadras po kadro | **,** ir **.** sekundę atgal ir pirmyn (Shift: dešimt) | new |
| Atvirkštinis atkūrimas | **◀** laiko juostoje, **J** (**L** pirmyn; tas pats klavišas dar kartą sustabdo): groja nuo pabaigos link pradžios pasirinktu greičiu, kartojant arba sustojant pradžioje | new |
| Laiko šuolio langas | Laiko juosta ir įvykių sąrašas | done |
| Vieno objekto laiko poslinkis (šešėlis) | **Time shift and trim** (Laiko poslinkis ir apkarpymas): perkelti vieneto skrydį arba visą įrašą per tiek sekundžių; **Line the recordings up** (Sulygiuoti įrašus) perkelia kelis įrašus, kad prasidėtų kartu, ir paleidžia juos vienu metu (du skrydžiai skirtingomis dienomis šalia); įrašas perstatomas, todėl pėdsakai, įvykiai, diagramos ir statistika seka | new |
| Apkarpymas prieš / po | **From now / To now / Cut to this span** (Nuo dabar / Iki dabar / Apkarpyti iki šio ruožo) (atšaukimas išlaiko poslinkius), tada **Export CSV** (įkeliamas atgal į 3DHeat) arba **Export ACMI** (Tacview 2.2 tekstas, įrašui, įdėtam ant Žemės) | new |

## Reljefas ir žemėlapis {#terrain-and-map}

| Tacview | 3DHeat | Būsena |
|---|---|---|
| Tikras reljefas, pasirinktinis aukštis ir tekstūros | Lygiai (paties žaidimo žemėlapis kaip 3D modelis), pasaulio fono plytelės | done |
| Plokščias / tuščias / didelio kontrasto reljefo režimai | [Lygio išvaizda](level-appearance.md): žemės reljefas, paviršius ir statiniai rodomi arba ne | done (ne tie patys režimai) |
| 2D taktinis žemėlapis (Tacview jo neturi: palydovinis vaizdas) | **2D map** (2D žemėlapis): kampas arba visas vaizdas, simboliai pagal rūšį ir komandą (užpildyti žaidėjai, kontūruoti DI), pasukti pagal kryptį, pėdsakai, pavadinimai, mastelio juosta, nuotolio žiedai aplink sekamą vienetą, bullseye žiedai, 3D kameros vieta, neseniai žuvę; tempkite, ratukas, paspaudimas sekti (M) | new |
| Statiniai objektai (oro uostai, kilimo takai, taškai, zonos, KML) | Išmatuoti kilimo takai (OurAirports) pasaulio fone ir jų glisados; GPX taškai ir KML žymos įkeliami kaip stovintys objektai; [Taktikos lenta](tactics-board.md) piešia zonas ir maršrutus | new |

## Importas, eksportas, įrašymas {#import-export-recording}

| Tacview | 3DHeat | Būsena |
|---|---|---|
| ACMI tekstas ir zip | [Tacview ACMI](tacview-acmi.md) | done |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (takai, maršrutai, taškai; Garmin širdies ritmas, kadencija, galia, temperatūra), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC ir GGA bet kurio siuntėjo, kontrolinės sumos tikrinamos, per vidurnaktį), **IGC** (B įrašai, data, pilotas ir planeris), **FIT** (record pranešimai, suspaustos laiko žymos) - kiekvienas pagal platumą ir ilgumą plokštumoje takų viduryje, kad pasaulio fonas sutaptų; kryptis, polinkis ir greitis iš failo arba iš taško į tašką. CSV ir Parquet kaip anksčiau | new (DIS n/a: tiesioginis tinklo protokolas) |
| Gimtieji įrašymo įrankiai (DCS, BMS, IL-2, MSFS...) | Paties 3DHeat konverteriai (War Thunder, CS2, Squad, Arma ir kiti) | done (savi) |
| Realaus laiko telemetrija per TCP, ADS-B | Nesukurta | n/a (pakartojimai po rungtynių) |
| Sinchronizuotas garsas / vaizdo įrašas | **Audio and video** (Garsas ir vaizdo įrašas): vietinis failas groja, pauzė, peršoka ir keičia greitį kartu su laiko juosta nuo nustatytos pradžios (**Starts now** (Prasideda dabar), ±0,1 s); vaizdo įrašas keičiamo dydžio skydelyje virš vaizdo arba paveikslėlis paveikslėlyje. Failas lieka naršyklėje | new |
| Vaizdo įrašo eksportas | [Kameros kelias ir vaizdo įrašas](camera-path-and-video.md) | done |

## Kita {#other}

| Tacview | 3DHeat | Būsena |
|---|---|---|
| Lua papildiniai | Nesukurta | n/a (atvirasis kodas: keiskite pačią žiūryklę) |
| Internetinis apibendrinimas (bendra sesija) | Nesukurta | n/a (Tacview siūlo talpinamą sesiją, kurioje visi seka vieną grojimo galvutę. 3DHeat neturi serverio ir įrašus laiko žiūryklės kompiuteryje, o net tiesioginis ryšys tarp kompiuterių reikalauja signalų serverio. Apibendrinimas dalijamas failais: apkarpytu įrašu (Export ACMI arba CSV) ir žymų failu, kurie atsidaro tais pačiais momentais ir vaizdais) |
| Instruktoriaus nuotolinis valdymas | Nesukurta | n/a (valdo veikiantį simuliatorių) |
| Objektų redagavimas (pridėti, keisti, pašalinti) | [Taktikos lenta](tactics-board.md) planuojamiems objektams; įrašai tik skaitomi | n/a |
| Kalbos | 40 kalbų | done |
| Įrašų autentiškumas | Nesukurta | n/a |

## Kūrėjams: ACMI 2.2 savybės {#for-developers-acmi-22-properties}

Skaito `data/acmi.ts`; skaitinės savybės tampa skaitiniais stulpeliais, tekstinės - kategorijų stulpeliais. Visos rodomos po **Raw** vieneto kortelėje. Šios skaitomos tam tikram tikslui:

| Savybės | Naudojimas |
|---|---|
| T (visos keturios formos), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Padėtis, orientacija, figūra, vieneto pavadinimas, komanda |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Laukai, diagramos, HUD, pakilimo ir nusileidimo aptikimas |
| VerticalGForce, LongitudinalGForce, LateralGForce | G laukai |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Laukai |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Kuro laukai, sumuoti per bakus |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radaro kūgiai ir nuotolio vartai |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Užrakinimo linijos |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Pasiekiamumo kupolai |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Laukai |
| Health | Laukas |
| Įvykiai: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Įvykių sąrašas, statistika (mirtys, pakilimai, nusileidimai), žymės; Message ir Comment kaip subtitrai |
| PilotHeadYaw, PilotHeadPitch | Piloto žvilgsnio linija |
| Tipo žymė Bullseye (Navaid+Static+Bullseye) | Bullseye laukas ir žiedai žemėlapyje |
| Viskas kita (PilotHeadRoll, valdymas, paviršiai, ILS nukrypimai, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, dydžiai...) | Rodoma kaip įrašyta po **Raw** |

Radaro ir užrakinimo kampai skaičiuojami nuo vieneto paties ašių: azimutas į dešinę, kampas aukštyn, posūkis - dešinysis sparnas žemyn. ACMI specifikacijoje sakoma, kad jie santykiniai orlaivio atžvilgiu, bet nenurodyta, kuria kryptimi teigiama; šis skaitymas seka jos transformaciją (posūkis pagal laikrodžio rodyklę, polinkis aukštyn, posūkis dešiniuoju sparnu).

---
title: "Barazia me Tacview"
parent: "Riluajtja e ndeshjes"
grand_parent: "Riluajtja"
nav_order: 1
lang: "sq"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Barazia me Tacview

Tacview është një program i njohur për shikimin e regjistrimeve të fluturimit. Nëse e njihni, kjo faqe tregon ku është çdo mjet i tij në 3DHeat.

Ajo liston çdo veçori të Tacview 1.9 (manualin e tij, tabelën e tekstit të ndërfaqes dhe formatin e skedarit ACMI 2.2) dhe ku qëndron [riluajtja e ndeshjes](match-replay.md) e 3DHeat me të. Qëllimi: ajo që mund të bëjë Tacview për një riluajtje dhe të dhënat e saj, 3DHeat mund ta bëjë edhe ajo.

**Gjendja:**
- **e bërë**: tashmë është në 3DHeat.
- **e re**: e ndërtuar për t'u përshtatur me një veçori të Tacview.
- **jo ende**: zbatohet, por nuk është ndërtuar.
- **nuk zbatohet**: nuk zbatohet këtu, me arsyen.

Ku gjenden veçoritë: skeda **Ndeshja**, **Riluajtja me figura** (ose **Mbivendosja figurash** te skeda Heatmap), te seksionet e shiritit anësor **Riluajtja**, **Njësi**, **Ngjarje**, **Shënuesit**, **Pamja taktike**, **Statistikat**, **Zhvendosje kohe dhe shkurtim**, **Harta dhe pozicioni**, **Audio dhe video** dhe **Etiketat**. Shih [Riluajtja e ndeshjes](match-replay.md).

## Kamerat {#cameras}

| Tacview | 3DHeat | Gjendja |
|---|---|---|
| Pamja nga kabina (F5), horizonti që lëviz me avionin | **Kabina**: nga njësia përtej qiellit të saj, sipas qëndrimit të saj, siç e ka modeli i lëvizjes. Figura e vetë njësisë priten jashtë. Tërhiq për të parë përreth; **Shiko sërish përpara** rivendos. | e re |
| HUD në pamjen e kabinës (zgjedhja IAS/CAS/TAS) | **Ekrani head-up** (H): horizonti dhe shkalla e pjerrësisë së pamjes aktuale, shenja e rrugës së fluturimit, shiriti i drejtimit, IAS, lartësia, TAS, Mach, G, këndi i sulmit, shpejtësia vertikale, AGL | e re |
| Instrumentet 3D të kabinës, ndjekja e kokës së pilotit (PilotHead*), TrackIR | Nuk ka modele kabine; këndet e kokës shfaqen te pamja **Bruto** e kartelës së njësisë | nuk zbatohet (nuk ka modele kabine; ndjekja e kokës është për fluturim të drejtpërdrejtë) |
| Pamja e jashtme (F6): rrotullo rreth objektit kryesor | **Ndjekje** (kthehet me njësinë) dhe **Orbitë** (mban drejtimin e vet) | e bërë |
| Kamera e luftës ajrore, "Shiko objektivin" (padlock) | **Padlock**: nga kabina, i mbajtur mbi objektivin | e re |
| Kamera e luftës ajrore, "Në qendër" / "Shiko përpara" | **Objektivi**: prapa njësisë, në vijën nga objektivi, duke parë kalimthi objektivin. **E fiksuar** me azimut 0 shikon përpara nga përpara. | e re |
| Ndërro primarin dhe sekondarin | **Këmbe** pranë objektivit | e re |
| Pamja satelitore (F7), nga lart, ortografike | **Satelit**: drejt poshtë mbi njësinë, veriu lart; tërhiq për ta kthyer. Harta 2D është plani ortografik. | e re |
| Kamera e lirë (F8), W/A/S/D, E/C | Kamera e lirë e fluturimit (W/A/S/D, Space/Q, Shift/Alt) | e bërë |
| Kamera shtesë Head-On; kamera e jashtme e fiksuar te objekti | **E fiksuar**: një vend rreth njësisë që kthehet dhe rrotullohet me të; tërhiq për ta lëvizur (prapa, te një skaj krahu, përballë) | e re |
| Kamera shtesë Lock (ngrin pozicionin) | Ndalo ndjekjen (Esc): kamera mbetet aty ku ishte | e bërë |
| Pamja strategjike (zmadhim për tërë Tokën) | [Sfondi botëror](world-backdrop.md) dhe korniza e tërë regjistrimit të hartës 2D | e bërë |
| Cilësimi i fushës së pamjes | FOV te **Kamera dhe skena** | e bërë |
| Ndërro pamjet me tasta | **V** pamja tjetër, **Shift+V** prapa | e re |

## Opsionet e pamjes 3D dhe të ekranit {#d-view-and-display-options}

| Tacview | 3DHeat | Gjendja |
|---|---|---|
| Gjurmët e shiritit, rrëshqitësi i gjatësisë | Gjurmët (sekonda) te Shikuesi i ekipit | e bërë |
| Gjurma parashikuese (rruga përpara) | **Rruga përpara**: ku shkon vërtet njësia në sekondat e ardhshme | e re |
| Vijat e lartësisë së objektit / muret | **Vijat vertikale** | e bërë (vija; muret nuk janë ndërtuar) |
| Vektorët e objektit të zgjedhur: drejtimi (me pika), rruga (e plotë), ngritja | **Vektorët e shpejtësisë** (rruga dhe shpejtësia për aq sekonda, me një këshillë) dhe **Vijat e hundës dhe ngritjes** (hunda me vija, ngritja e shkurtër dhe e errët) | e re |
| Vija e shikimit të pilotit | **Vija e shikimit të pilotit**: një vijë cian me viza përgjatë PilotHeadYaw/PilotHeadPitch (ose një kolonë HeadYaw, ViewYaw ose LookYaw) kundrejt boshteve të njësisë | e re |
| Kupolat e rrezes vdekjeprurëse SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, "2" binjakët) | **Zonat e angazhimit**: kupola, ovale aty ku rrezja vertikale ndryshon, të fikura kur EngagementMode është 0 | e re |
| Kyçjet e radarit (LockedTarget..9) me etiketa | **Mbylljet**: vija të kuqe për çdo objekt të kyçur; me vija të ndërprera me ngjyrë qelibari për FocusedTarget; përgjatë LockedTargetAzimuth/Elevation/Range aty ku nuk emërtohet asnjë objekt. **Etiketat e mbylljes**: emri i objektivit dhe distanca në çdo vijë kyçjeje | e re |
| Kon i radarit (RadarMode, Azimuth, Elevation, Roll, Range, gjerësitë e rrezes) dhe porta e distancës | **Konet e radarit**: buza dhe unaza mesatare e rrezes, e kthyer sipas azimutit, lartësisë dhe rrotullimit kundrejt njësisë; porta e distancës si dy buza të verdha. Pa gjerësi rrezeje, vetëm boshti i rrezes. | e re |
| Vija e shikimit mes dy objekteve të zgjedhur (jeshile / e kuqe me pika kur terreni bllokon) | Vija e çiftit të matur kthehet e kuqe dhe me viza kur niveli është mes tyre | e re |
| Zmadhim automatik i objekteve të largëta | Figura më e vogël në ekran (piksele) | e bërë |
| Rrjeti i gjerësisë/gjatësisë | **Harta dhe pozicioni → Rrjeti**: vija gjerësie dhe gjatësie mbi tokën nën kamerë, me hapësirë të rrumbullakët sipas lartësisë (10° deri 1'), të etiketuara; ose rrjeti kilometrik **MGRS** i zonës UTM, me zonën dhe katrorin 100 km të treguar. Rrjeti i vetë hartës 2D si më parë | e re |
| Unazat e Bullseye | Unaza rreth bullseye të çdo ekipi në hartën 2D | e re (vetëm 2D) |
| Mbivendosja e pjerrësisë së zbritjes | **Pjerrësitë e zbritjes**: shtigje 3° me skajet e shkallës së plotë ±0,7° në të dyja anët e çdo pisti afër regjistrimit, nga pragjet dhe lartësitë e matura të OurAirports (shkarkohen një herë, mbahen pa internet), një shenjë në çdo milje detare, e emërtuar sipas aeroportit dhe pistës | e re |
| Kufizimet e lartësisë (alarmi i tavanit/dyshemesë) | **Kufizim lartësie**: një dysheme dhe një tavan; etiketat e njësive jashtë kthehen të kuqe, dhe çdo kalim (poshtë dyshemesë, mbi tavan, kthim brenda) listohet - një klik shkon atje dhe ndjek njësinë | e re |
| Objektet e shkatërruara bëhen gri, hiqen pas 15 min | Jetët mbarojnë me gjurmën e tyre; një njësi e vdekur zbehet në listën e njësive | e bërë |
| Vetitë e dukshme / të çaktivizuara | Shfaqen te **Bruto**; asgjë nuk fshihet prej tyre | jo ende |
| Shfaq pozicionet e shkopit/gazit/pedaleve | Gazi dhe vlerat e motorit në fusha; hyrjet e kontrollit te **Bruto** | e bërë (si vlera) |
| Komentet si titra | **Mesazhet si titra** (Etiketat): ngjarjet ACMI Message dhe Comment, dhe biseda nga çdo lojë (ngjarje Chat, Say ose Radio, ose një kolonë bisede), në fund të pamjes me kë e tha, për gjashtë sekonda | e re |
| Shfaqja e datës dhe e orës UTC | Ora e linjës kohore me UTC aty ku regjistrimi ka një kohë reference | e bërë |
| Pozicioni i miut gjerësi/gjatësi, MGRS, bullseye | Kartela e zgjedhjes (klik në një pikë) jep gjerësinë/gjatësinë në gradë, minuta dhe sekonda dhe MGRS pranë metrave botërorë; bullseye për njësi (fushë) | e re |
| Stema e personalizuar | Nuk është ndërtuar | nuk zbatohet (markë) |
| Modelet 3D, më të afërmit kur nuk njihen | Katalogu i figurave të veta, homologu më i afërt, madhësi reale | e bërë |
| Angazhime të shumëfishta (vija mes të gjitha çifteve) | **Vijat e angazhimit**: nga çdo njësi në fushëveprim te çdo kundërshtar brenda distancës së caktuar (1-200 km), secila me distancën e vet, 60 çiftet më të afërta; çifti i matur si më parë | e re |

## Etiketat {#labels}

| Tacview | 3DHeat | Gjendja |
|---|---|---|
| Etiketat çaktivizuar/aktivizuar, veças për objektet e zgjedhura dhe të pazgjedhura | **Etiketat** me rregulla për **Të zgjedhura**, **Avionë**, **Toka**, **Anije**, **Armë** dhe **IA**: shfaqen ose jo, vlerat e veta, prioriteti | e re |
| Fushat e etiketës: emri, thirrja, pilot, shpejtësitë (TAS/CAS/IAS/Mach/GS), lartësitë (ASL/AGL), VS, AOA, AOS, G (vertikal, anësor, gjatësor), shpejtësia e kthesës dhe rrezja, energjia, pesha/vëllimi/rrjedha e karburantit, drejtimi/rruga, rrotullimi/pjerrësia, rrahja e zemrës | Çdo vlerë e `fields.ts`: e njëjta listë, e llogaritur aty ku nuk regjistrohet (vlerësimet e shënuara ~). Shpejtësia e rrotullimit dhe SpO2 vetëm përmes Bruto. | e bërë |
| Pozicioni i bullseye te etiketat | Fusha **Bullseye (azimuti / distanca)** | e re |
| Devijimet ILS, distanca e fluturuar | Vlera të Bruto; distanca e fluturuar në statistikat | e bërë (pjesërisht) |
| Pastrimi i telemetrisë së pazgjedhur | **Mbaji etiketat larg njëra-tjetrës**, e renditur sipas prioritetit të çdo rregulli | e bërë / e re |
| Etiketo të gjitha objektet e tokës / vetëm kërcënimet | Rregullat Toka dhe IA | e re |
| Madhësia e etiketave | **Madhësia e etiketave** (60-250 %) | e re |
| Njësitë metrike / imperiale | Metrike / imperiale | e bërë (dy të gatshme, jo tetë) |

## Objekti dhe telemetria {#object-info-and-telemetry}

| Tacview | 3DHeat | Gjendja |
|---|---|---|
| Zgjedhja parësore dhe dytësore | Klikimi ndjek dhe zgjedh; shift-klik dy të matin; zgjedhësi **Objektivi** | e bërë / e re |
| Distanca / azimuti / aspekti / afrimi mes dy objekteve | Vija BRAA e çiftit të matur; fushat Range, Bearing, Aspect dhe Closure nga njësia e ndjekur | e bërë |
| Azimuti relativ, shpejtësia e vijës së shikimit (LOS) | Fushat **Azimut relativ** (nga hunda e njësisë së ndjekur, M/D) dhe **Shpejtësia këndore e vijës së shikimit** (°/s) | e re |
| Dritaret e telemetrisë | Kartela e njësisë dhe kartela e kalimit me miun | e bërë |
| Telemetria e papërpunuar (çdo veti e regjistruar, edhe ato të panjohura) | **Bruto** te kartela e njësisë: çdo kolonë në rreshtin e njësisë siç është shkruar | e re |
| Lista e objekteve aktive | **Njësitë**: lojtarët, IA, armët në fluturim; ato të gjalla të ndritura | e bërë |
| Dritarja e vetive të regjistrimit (titulli, autori, përmbledhja...) | Mbahet si kolona RecordingInfo; shfaqet te Bruto | e bërë (pa dritare) |
| Formatet e pozicionit DMS/MGRS, veriu magnetik | **Pozicioni (gjerësi / gjatësi)** në DMS dhe fusha **MGRS**; një fushë **Drejtimi magnetik**; **Drejtime magnetike** shkruan drejtimin, rrugën dhe azimutin magnetik (°M) dhe shfaq një busull me të dy veriet dhe devijimin - Modeli Magnetik Botëror 2025 (koeficientë me domen publik), i llogaritur këtu në vendin dhe datën e njësisë | e re |

## Grafikët {#charts}

| Tacview | 3DHeat | Gjendja |
|---|---|---|
| Grafik i një objekti, deri në 4 vlera | **Në kohë** (dhe grafiku nën Riluajtja) | e bërë |
| Vizato deri në 4 objekte njëkohësisht | **Krahaso**: një vlerë për deri në 8 njësi në një shkallë | e re |
| Vlera kundrejt vlerës (stil energji-manovrueshmërie) | **Vlerë kundrejt vlere**: shpejtësia e kthesës kundrejt shpejtësisë ose çdo çifti tjetër, çdo njësi një vijë, pika aktuale e shënuar | e re |
| Boshti X sipas kohës; zmadhim; lëviz kohën nga grafiku | Rrota zmadhon në kohë, klikimi i dyfishtë rivendos, klikimi shkon te momenti | e re |
| Boshti X sipas distancës në ajër ose në tokë | **Koha / Distanca ajrore / Distanca tokësore** te grafikët e kohës dhe të krahasimit; zmadhimi dhe klikimi për të shkuar funksionojnë njësoj | e re |
| Grafikët e caktuar paraprakisht (energjia, nxitimi...) | Çdo vlerë mund të zgjidhet (lartësia e energjisë dhe shpejtësia e saj janë vlera) | e bërë |

## Statistikat, regjistri i fluturimit, ngjarjet {#statistics-flight-log-events}

| Tacview | 3DHeat | Gjendja |
|---|---|---|
| Regjistri i fluturimit: u ngrit, u ul, qëlloi, u godit nga, u shkatërrua nga, la zonën | **Statistikat** për njësi: jetët, vrasjet, vdekjet, gjuajtjet, goditjet, raporti i goditjeve, ngritjet, uljet, koha në ajër, G maksimal (dhe minimal), shpejtësia maksimale, lartësia dhe Mach, distanca. Ngritjet vijnë nga ngjarjet TakenOff/Landed, OnGround, AGL, ose një vlerësim i shënuar ~. | e re |
| Shtesat e tabelës së rezultateve dhe raportit të misionit | Përmbledhja për ekip dhe vrasësi më i mirë; tabela e rezultateve e vet e përmbledhjes së ndeshjes | e re / e bërë |
| Eksporto regjistrin e fluturimit XML/CSV | **Eksporto CSV** i statistikave dhe i ngjarjeve ashtu si listohen | e re (vetëm CSV) |
| Eksporto telemetrinë CSV me shpejtësi | **Telemetria e njësisë së zgjedhur**: çdo vlerë, 1-20 në sekondë | e re |
| Regjistri i ngjarjeve, klik i dyfishtë për të shkuar atje dhe zgjedhur | Lista **Ngjarje**, e filtruar sipas llojit dhe njësisë; një klik fluturon atje | e bërë |
| Ngjarja e mëparshme / tjetër (Ctrl+←/→) | **Page Up / Page Down** | e re |
| Pauzë në ngjarje | **Pauzë në ngjarje** | e re |
| Shenjat e linjës kohore (lëshimet, goditjet, shkatërrimet; ajo e njësisë së zgjedhur në blu; shënuesit e kuq) | Vrasjet dhe vdekjet si shirit dendësie, ai i njësisë së ndjekur në blu, shënuesit e kuq; klik për të shkuar | e re |
| Hiq një ngjarje, hiqje me vrasje | Nuk është ndërtuar | nuk zbatohet (ngjarjet janë të regjistrimit; filtrat i fshehin) |

## Shënuesit {#bookmarks}

| Tacview | 3DHeat | Gjendja |
|---|---|---|
| Fut shënues me zgjedhjen dhe pikëvështrimin | **Shto shënues** (B): momenti, kamera e lirë ose njësia e ndjekur me pamjen, distancën dhe objektivin e vet; i emërtuar; mbahet në këtë shfletues për çdo regjistrim | e re |
| Hiq shënuesin | × në listë | e re |
| Shënuesit në linjën kohore dhe në regjistra | Shenja të kuqe; lista | e re |
| Event=Bookmark në ACMI | Listohet nën shenjat e regjistrimit, me vrasjet, vdekjet dhe mesazhet | e re |
| Shkurtorja kopjo/ngjit (për të ndarë një pamje) | **Eksporto / Importo** shënuesit si skedar; C kopjon pozën e kamerës | e re |

## Luajtja {#playback}

| Tacview | 3DHeat | Gjendja |
|---|---|---|
| Luaj/pauzë, në fillim, shpejtësia, lëvizja në linjën kohore | Linja kohore | e bërë |
| Kornizë për kornizë | **,** dhe **.** një sekondë mbrapa dhe përpara (Shift: dhjetë) | e re |
| Luajtje mbrapsht | **◀** te linja kohore, **J** (**L** përpara; i njëjti tast përsëri pauzon): luan nga fundi drejt fillimit me shpejtësinë e zgjedhur, duke përsëritur ose duke u ndalur në fillim | e re |
| Dialogu i kërcimit në kohë | Linja kohore dhe lista e ngjarjeve | e bërë |
| Zhvendos kohën e një objekti (fantazmë) | **Zhvendosje kohe dhe shkurtim**: zhvendos fluturimin e një njësie, ose një regjistrimi të tërë, për aq sekonda; **Rreshto regjistrimet** i zhvendos disa regjistrime që të fillojnë bashkë dhe i luan njëkohësisht (dy fluturime në ditë të ndryshme njëra pranë tjetrës). Regjistrimi rindërtohet, kështu që gjurmët, ngjarjet, grafikët dhe statistikat ndjekin | e re |
| Shkurtim para/pas | **Nga tani / Deri tani / Pritu në këtë interval** (zhbërja mban zhvendosjet), pastaj **Eksporto CSV** (ngarkohet përsëri në 3DHeat) ose **Eksporto ACMI** (tekst Tacview 2.2, për një regjistrim të vendosur mbi Tokë) | e re |

## Terreni dhe harta {#terrain-and-map}

| Tacview | 3DHeat | Gjendja |
|---|---|---|
| Terren real, lartësi dhe tekstura të personalizuara | Nivelet (harta e vetë lojës si model 3D), pllakat e sfondit botëror | e bërë |
| Mënyrat e terrenit të sheshtë / bosh / kontrast i lartë | [Pamja e nivelit](level-appearance.md): relievi i tokës, sipërfaqja dhe strukturat të shfaqura ose jo | e bërë (jo të njëjtat mënyra) |
| Harta taktike 2D (Tacview nuk ka; ka pamjen satelitore) | **Harta 2D**: pamja e qoshes ose e tërë, simbole sipas llojit dhe ekipit (lojtarët të mbushur, IA me kontur) të kthyera nga drejtimi i tyre, gjurmë, emra, shkallë, unaza distance rreth njësisë së ndjekur, unaza bullseye, vendi i kamerës 3D, vdekjet e fundit; tërhiq, rrotullo, kliko për të ndjekur (M) | e re |
| Objekte statike (aeroporte, pista, pika rrugëtimi, zona, KML) | Pistat e matura (OurAirports) në sfondin botëror dhe pjerrësitë e tyre; pikat GPX dhe shenjat KML ngarkohen si objekte të qëndrueshme; [Dërrasa taktike](tactics-board.md) vizaton zona dhe rrugë | e re |

## Importimi, eksportimi, regjistrimi {#import-export-recording}

| Tacview | 3DHeat | Gjendja |
|---|---|---|
| Teksti dhe zip ACMI | [Tacview ACMI](tacview-acmi.md) | e bërë |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (gjurmë, rrugë, pika rrugëtimi; rrahja e zemrës, kadenca, fuqia, temperatura të Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC dhe GGA të çdo folësi, shuma kontrolluese të kontrolluara, kalimi i mesnatës), **IGC** (regjistrime B, data, pilotit dhe planorit), **FIT** (mesazhe regjistrimi, vula kohore të ngjeshura) - secili i vendosur sipas gjerësisë dhe gjatësisë në plan në mesin e gjurmëve, që sfondi botëror të përputhet; drejtimi, pjerrësia dhe shpejtësia nga skedari ose nga një pikë në tjetrën. CSV dhe Parquet si më parë | e re (DIS nuk zbatohet: është protokoll rrjeti i drejtpërdrejtë) |
| Regjistruesit e vetë lojërave (DCS, BMS, IL-2, MSFS...) | Konvertuesit e vet të 3DHeat (War Thunder, CS2, Squad dhe të tjerë) | e bërë (e vetja) |
| Telemetria në kohë reale mbi TCP, ADS-B | Nuk është ndërtuar | nuk zbatohet (riluajtje pas ndeshjes) |
| Audio/video të sinkronizuara | **Audio dhe video**: një skedar lokal luan, pauzohet, kërkohet dhe ndryshon shpejtësinë me linjën kohore nga një fillim i caktuar (**Fillon tani**, ±0,1 s); një video në një panel të ndryshueshëm mbi pamjen, ose imazh-në-imazh. Skedari mbetet në shfletues | e re |
| Eksporti i videos | [Rruga e kamerës dhe videoja](camera-path-and-video.md) | e bërë |

## Të tjera {#other}

| Tacview | 3DHeat | Gjendja |
|---|---|---|
| Shtesat Lua | Nuk janë ndërtuar | nuk zbatohet (me burim të hapur: ndrysho vetë shikuesin) |
| Debriefing online (sesion i përbashkët) | Nuk është ndërtuar | nuk zbatohet (Tacview-ja e tij është një sesion i strehuar që i mban të gjithë në një kokë luajtjeje. 3DHeat nuk ka server dhe i mban regjistrimet në kompjuterin e shikuesit, dhe edhe një lidhje peer-to-peer ka nevojë për server sinjalizimi. Një debriefing ndahet si skedarë: regjistrimi i prerë (Eksporto ACMI ose CSV) dhe skedari i shënuesve, që hapen në të njëjtat momente dhe pamje) |
| Kontrolli i instruktorit nga largësia | Nuk është ndërtuar | nuk zbatohet (kontrollon një simulator që po funksionon) |
| Redaktimi i objekteve (shto, ndrysho, hiq objekte) | [Dërrasa taktike](tactics-board.md) për objektet e planifikuara; regjistrimet janë vetëm për lexim | nuk zbatohet |
| Gjuhët | 40 gjuhë | e bërë |
| Autentikimi i regjistrimeve | Nuk është ndërtuar | nuk zbatohet |

## Për zhvilluesit: vetitë ACMI 2.2 {#for-developers-acmi-22-properties}

Lexohen nga `data/acmi.ts`; vetitë numerike bëhen kolona numerike, ato me tekst kolona kategorie. Të gjitha shfaqen te **Bruto** në kartelën e njësisë. Lexohen për një qëllim:

| Vetitë | Përdorimi |
|---|---|
| T (të katër format), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Pozicioni, qëndrimi, figura, emri i njësisë, ekipi |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Fushat, grafikët, HUD, zbulimi i ngritjes dhe uljes |
| VerticalGForce, LongitudinalGForce, LateralGForce | Fushat G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Fushat |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Fushat e karburantit, të mbledhura mbi depozitat |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Konet e radarit dhe porta e distancës |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Vijat e kyçjes |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Kupolat e angazhimit |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Fushat |
| Health | Fusha |
| Ngjarjet: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Lista e ngjarjeve, statistikat (vdekjet, ngritjet, uljet), shënuesit; Message dhe Comment si titra |
| PilotHeadYaw, PilotHeadPitch | Vija e shikimit të pilotit |
| Etiketa e tipit Bullseye (Navaid+Static+Bullseye) | Fusha Bullseye dhe unazat e hartës |
| Gjithçka tjetër (PilotHeadRoll, kontrollet, sipërfaqet, devijimet ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, madhësitë...) | Shfaqen siç janë shkruar te **Bruto** |

Këndet e radarit dhe të kyçjes merren kundrejt boshteve të vetë njësisë: azimuti djathtas, lartësia lart, rrotullimi krahu djathtas poshtë. Specifikimi ACMI thotë se janë relativë ndaj avionit, por jo se cila anë është pozitive; ky leximi ndjek transformimin e tij (yaw në orën e akrepave, pitch lart, roll krahu djathtas poshtë).

---
title: "Paritatea cu Tacview"
parent: "Reluarea meciului"
grand_parent: "Reluare"
nav_order: 1
lang: "ro"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Paritatea cu Tacview

Tacview este un program popular pentru urmărirea înregistrărilor de zbor. Dacă îl cunoști, această pagină arată unde se află fiecare dintre uneltele lui în 3DHeat.

Ea listează fiecare funcție din Tacview 1.9 (manualul lui, tabelul de șiruri al interfeței și formatul de fișier ACMI 2.2) și locul în care [reluarea meciului](match-replay.md) din 3DHeat stă față de ea. Scopul: ce poate face Tacview pentru o reluare și datele ei, poate face și 3DHeat.

**Stare:**
- **gata**: există deja în 3DHeat.
- **nou**: construit ca să corespundă unei funcții din Tacview.
- **încă nu**: se aplică, dar nu este construit.
- **nu se aplică**: nu se potrivește aici, cu motivul.

Unde găsești funcțiile: fila **Meci**, **Reluare cu figuri** (sau **Figuri suprapuse** din fila Căldură), în secțiunile barei laterale **Reluare**, **Unități**, **Evenimente**, **Semne de carte**, **Afișaj tactic**, **Statistici**, **Decalare în timp și tăiere**, **Hartă și poziție**, **Audio și video** și **Etichete**. Vezi [Reluarea meciului](match-replay.md).

## Camere {#cameras}

| Tacview | 3DHeat | Stare |
|---|---|---|
| Vedere din carlingă (F5), orizontul basculând odată cu aeronava | **Carlingă**: din unitate, pe direcția ei, așa cum o are modelul de mișcare. Figura unității însăși este tăiată din vedere. Trage ca să privești în jur; **Privește din nou înainte** resetează. | nou |
| HUD în vederea din carlingă (alegerea IAS/CAS/TAS) | **Afișaj head-up** (H): orizontul și scara de tangaj ale vederii reale, marcajul traiectoriei de zbor, banda de cap, IAS, înălțime, TAS, Mach, G, unghiul de atac, viteza verticală, AGL | nou |
| Instrumente 3D de carlingă, urmărirea capului pilotului (PilotHead*), TrackIR | Fără modele de carlingă; unghiurile capului apar în vederea **Brut** a cardului unității | nu se aplică (fără modele de carlingă; urmărirea capului ține de zborul live) |
| Vedere externă (F6): orbitează obiectul principal | **Din spate** (se întoarce odată cu unitatea) și **Orbită** (își păstrează direcția proprie) | gata |
| Camera de luptă aeriană, „Privește ținta” (padlock) | **Padlock**: din carlingă, ținută pe țintă | nou |
| Camera de luptă aeriană, „Centrat” / „Privește înainte” | **Țintă**: în spatele unității, pe linia de la țintă, privind dincolo de ea spre țintă. **Fixă** la azimut 0 privește înainte din față. | nou |
| Schimbă principalul cu secundarul | **Schimbă** lângă țintă | nou |
| Vedere din satelit (F7), de sus, ortografică | **Satelit**: drept în jos pe unitate, nordul sus; trage ca să întorci. Harta 2D este planul ortografic. | nou |
| Cameră liberă (F8), W/A/S/D, E/C | Camera liberă de zbor (W/A/S/D, Space/Q, Shift/Alt) | gata |
| Cameră suplimentară Head-On; cameră externă fixată de obiect | **Fixă**: un loc în jurul unității care se întoarce și se rotește odată cu ea; trage ca să-l muți (în spate, la vârful aripii, din față) | nou |
| Cameră suplimentară Lock (înghețarea poziției) | Oprește urmărirea (Esc): camera rămâne unde era | gata |
| Vedere strategică (zoom afară, până la toată Pământul) | [Fundalul lumii](world-backdrop.md) și cadrul întregii înregistrări al hărții 2D | gata |
| Setarea câmpului vizual | **Cameră și scenă**, câmp vizual (FOV) | gata |
| Schimbarea vederilor cu taste | **V** vederea următoare, **Shift+V** înapoi | nou |

## Vederea 3D și opțiunile de afișare {#d-view-and-display-options}

| Tacview | 3DHeat | Stare |
|---|---|---|
| Urme în panglică, cursor pentru lungime | Urme (secunde) în vizualizatorul de echipă | gata |
| Urma anticipativă (traseul din față) | **Traseul din față**: unde merge efectiv unitatea în următoarele secunde | nou |
| Linii de înălțime ale obiectului / pereți | **Linii verticale** | gata (linii; pereții nu sunt construiți) |
| Vectorii obiectului selectat: cap (punctat), curs (plin), portanță | **Vectori de viteză** (cursul și viteza pentru atâtea secunde, cu un sfat) și **Linii de bot și portanță** (botul punctat, portanța scurtă și întunecată) | nou |
| Linia privirii pilotului | **Linia privirii pilotului**: o linie cyan punctată de-a lungul PilotHeadYaw/PilotHeadPitch (sau a unei coloane HeadYaw, ViewYaw sau LookYaw) față de axele unității | nou |
| Cupole de raza letală SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, perechile „2”) | **Zone de angajare**: cupole, ovoide acolo unde raza verticală diferă, oprite cât timp EngagementMode este 0 | nou |
| Blocările radar (LockedTarget..9) cu etichete | **Blocări**: linii roșii către fiecare obiect blocat; liniuță chihlimbarie către FocusedTarget; de-a lungul LockedTargetAzimuth/Elevation/Range acolo unde nu este numit niciun obiect. **Etichete de blocare**: numele țintei și distanța pe fiecare linie de blocare | nou |
| Conul radar (RadarMode, Azimuth, Elevation, Roll, Range, lățimi de fascicul) și poarta de distanță | **Conuri radar**: marginea și inelul de mijloc ale fasciculului, rotite după azimut, elevație și rulare față de unitate; poarta de distanță ca două margini galbene. Fără lățimi de fascicul, doar axa fasciculului. | nou |
| Linia de vedere între cele două obiecte selectate (verde / roșu punctat când terenul blochează) | Linia perechii măsurate devine roșie și punctată când nivelul se află între ele | nou |
| Mărirea automată a obiectelor îndepărtate | Cea mai mică figură pe ecran (pixeli) | gata |
| Grila de latitudine/longitudine | **Hartă și poziție → Grilă**: liniile de latitudine și longitudine pe sol sub cameră, la un pas rotund după înălțime (de la 10° până la 1'), cu etichete; sau grila kilometrică **MGRS** a zonei UTM, cu zona și pătratul de 100 km arătate. Grila proprie a hărții 2D ca înainte | nou |
| Inelele Bullseye | Inele în jurul bullseye-ului fiecărei echipe pe harta 2D | nou (doar 2D) |
| Suprapunerea pantei de planare | **Pante de planare**: traiectorii de 3° cu marginile de scară completă ±0,7° pe ambele capete ale fiecărei piste din apropierea înregistrării, din pragurile și altitudinile măsurate ale OurAirports (descărcate o dată, păstrate offline), un reper la fiecare milă nautică, numite după aeroport și pistă | nou |
| Restricțiile de altitudine (alarma de plafon/podea) | **Restricție de altitudine**: o podea și un plafon; etichetele unităților de afară devin roșii, iar fiecare trecere (sub podea, peste plafon, înapoi înăuntru) este listată – un clic duce acolo și urmărește unitatea | nou |
| Obiectele distruse devin gri, scoase după 15 min | Viețile se termină odată cu traseul lor; o unitate moartă este estompată în lista de unități | gata |
| Proprietățile Visible / Disabled | Arătate în **Brut**; nimic nu este ascuns de ele | încă nu |
| Afișarea pozițiilor manșei/accelerației/pedalelor | Valorile accelerației și motorului în câmpuri; comenzile în **Brut** | gata (ca valori) |
| Comentariile ca subtitrări | **Mesaje ca subtitrări** (Etichete): evenimentele ACMI Message și Comment, și mesajele din orice joc (evenimente Chat, Say sau Radio, sau o coloană de chat), jos în vedere, cu cine le-a spus, timp de șase secunde | nou |
| Afișarea datei și a orei UTC | Ceasul de pe cronologie cu UTC acolo unde înregistrarea are un timp de referință | gata |
| Poziția mouse-ului în lat/long, MGRS, bullseye | Cardul de selecție (clic pe un punct) dă latitudinea/longitudinea în grade, minute și secunde și MGRS lângă metrii lumii; bullseye pe unitate (câmp) | nou |
| Logo personalizat | Nu este construit | nu se aplică (branding) |
| Modele 3D, cel mai apropiat când nu se cunoaște | Catalogul propriu de figuri, cel mai apropiat echivalent, mărime reală | gata |
| Angajări multiple (linii între toate perechile) | **Linii de angajare**: de la fiecare unitate din domeniu la fiecare adversar aflat în distanța aleasă (1–200 km), fiecare cu distanța sa, cele mai apropiate 60 de perechi; perechea măsurată ca înainte | nou |

## Etichete {#labels}

| Tacview | 3DHeat | Stare |
|---|---|---|
| Etichete pornite/oprite, separat pentru obiectele selectate și neselectate | **Etichete** cu reguli pentru **Selectate**, **Aeronave**, **Terestre**, **Nave**, **Arme** și **IA**: arătate sau nu, valori proprii, prioritate | nou |
| Câmpurile etichetei: nume, indicativ, pilot, viteze (TAS/CAS/IAS/Mach/GS), înălțimi (ASL/AGL), VS, AOA, AOS, G (vertical, lateral, longitudinal), rata de viraj și raza, energia, combustibil greutate/volum/debit, cap/traiectorie, rulare/tangaj, ritm cardiac | Fiecare valoare din `fields.ts`: aceeași listă, calculată acolo unde nu este înregistrată (estimările marcate cu ~). Rata de rulare și SpO2 doar prin Brut. | gata |
| Poziția țintei pe bullseye în etichete | Câmpul **Bullseye (relevment / distanță)** | nou |
| Abaterile ILS, distanța parcursă | Valori brute; distanța parcursă în statistici | gata (parțial) |
| Telemetria neselectată, fără aglomerare | **Ține etichetele separate**, ordonate după prioritatea fiecărei reguli | gata / nou |
| Eticheta tuturor obiectelor terestre / doar amenințările | Regulile Terestre și IA | nou |
| Scara etichetelor | **Mărimea etichetelor** (60–250 %) | nou |
| Unități metrice / imperiale | Metric / imperial | gata (două presetări, nu opt) |

## Informațiile obiectului și telemetria {#object-info-and-telemetry}

| Tacview | 3DHeat | Stare |
|---|---|---|
| Selecția principală și cea secundară | Clicul urmărește și selectează; shift-clic pe două ca să măsori; alegătorul **Țintă** | gata / nou |
| Distanța / relevmentul / aspectul / apropierea între două obiecte | Linia BRAA a perechii măsurate; câmpurile Range, Bearing, Aspect și Closure de la unitatea urmărită | gata |
| Relevmentul relativ, viteza liniei de vizare | Câmpurile **Relevment relativ** (de la botul unității urmărite, S/D) și **Viteza unghiulară a liniei de vizare** (°/s) | nou |
| Ferestrele de telemetrie | Cardul unității și cardul de la trecerea cu mouse-ul | gata |
| Telemetria brută (fiecare proprietate înregistrată, și cele necunoscute) | **Brut** în cardul unității: fiecare coloană de la rândul unității, cum este scrisă | nou |
| Lista obiectelor active | **Unități**: jucători, IA, arme în zbor; cele vii luminoase | gata |
| Fereastra proprietăților înregistrării (titlu, autor, briefing...) | Păstrată ca avea coloana RecordingInfo; arătată în Brut | gata (fără fereastră) |
| Formate de poziție DMS/MGRS, nordul magnetic | **Poziție (latitudine / longitudine)** în DMS și câmpurile **MGRS**; un câmp **Cap magnetic**; **Capuri magnetice** scrie capul, cursul și relevmentul magnetic (°M) și arată o busolă cu ambele norduri și variația – modelul magnetic mondial 2025 (coeficienți de domeniu public), calculat aici la locul și data unității | nou |

## Grafice {#charts}

| Tacview | 3DHeat | Stare |
|---|---|---|
| Grafic al unui obiect, până la 4 valori | **În timp** (și graficul de sub Reluare) | gata |
| Trasarea până la 4 obiecte deodată | **Compară**: o valoare a până la 8 unități pe aceeași scară | nou |
| Valoare față de valoare (stil energie-manevrabilitate) | **Valoare vs valoare**: rata de viraj față de viteză sau orice pereche, fiecare unitate o linie, punctul ei curent marcat | nou |
| Axa X după timp; zoom; mutarea timpului din grafic | Roata mărește în timp, dublu clic resetează, clicul merge la momentul respectiv | nou |
| Axa X după distanța în aer sau la sol | **Timp / Distanță în aer / Distanță la sol** pe graficele de timp și de comparație; zoom-ul și clicul-pentru-a-merge funcționează la fel | nou |
| Grafice predefinite (energie, accelerație...) | Orice valoare poate fi aleasă (înălțimea energiei și rata ei sunt valori) | gata |

## Statistici, jurnalul de zbor, evenimente {#statistics-flight-log-events}

| Tacview | 3DHeat | Stare |
|---|---|---|
| Jurnalul de zbor: decolat, aterizat, tras, lovit de, distrus de, a părăsit zona | **Statistici** pe unitate: vieți, doborâri, morți, trageri, lovituri, raportul de lovituri, decolări, aterizări, timpul în aer, G maxim (și minim), viteza maximă, înălțimea și Mach, distanța. Decolările vin din evenimentele TakenOff/Landed, OnGround, AGL sau dintr-o estimare marcată cu ~. | nou |
| Tabela de scor și suplimentele de raport de misiune | Rezumat pe echipă și cei mai mulți doborâri; tabela de scor a rezumatului meciului | nou / gata |
| Exportul jurnalului de zbor în XML/CSV | **Exportă CSV** al statisticilor și al evenimentelor așa cum sunt listate | nou (doar CSV) |
| Exportul telemetriei în CSV la o rată | **Telemetria unității selectate**: fiecare valoare, de la 1 la 20 pe secundă | nou |
| Jurnalul de evenimente, dublu clic ca să mergi acolo și să selectezi | Lista **Evenimente**, filtrată după fel și unitate; un clic zboară până acolo | gata |
| Evenimentul anterior / următor (Ctrl+←/→) | **Page Up / Page Down** | nou |
| Pauză la eveniment | **Pauză la eveniment** | nou |
| Marcajele de pe cronologie (eliberări, lovituri, distrugeri; cele ale obiectului selectat în albastru; semnele de carte roșii) | Doborârile și morțile ca bară de densitate, cele ale unității urmărite în albastru, semnele de carte roșii; clic ca să mergi | nou |
| Ștergerea unui eveniment, ștergerea prin ucidere | Nu este construit | nu se aplică (evenimentele aparțin înregistrării; filtrele le ascund) |

## Semne de carte {#bookmarks}

| Tacview | 3DHeat | Stare |
|---|---|---|
| Inserarea unui semn de carte cu selecția și punctul de vedere | **Adaugă semn de carte** (B): momentul, camera liberă sau unitatea urmărită cu vederea ei, distanța și ținta; cu nume; păstrat în acest browser pentru fiecare înregistrare | nou |
| Ștergerea unui semn de carte | × în listă | nou |
| Semnele de carte pe cronologie și în jurnale | Semne roșii; lista | nou |
| Event=Bookmark în ACMI | Listat sub semnele înregistrării, împreună cu doborârile, morțile și mesajele | nou |
| Scurtătură de copiere/lipire (împărtășirea unei vederi) | **Exportă / Importă** semnele de carte ca fișier; C copiază poziția camerei | nou |

## Redare {#playback}

| Tacview | 3DHeat | Stare |
|---|---|---|
| Redare/pauză, la început, viteză, mutarea pe cronologie | Cronologia | gata |
| Cadru cu cadru | **,** și **.** cu o secundă înapoi și înainte (Shift: zece) | nou |
| Redare înapoi | **◀** pe cronologie, **J** (**L** înainte; aceeași tastă din nou pune pauză): redă de la sfârșit spre început la viteza aleasă, în buclă sau oprindu-se la început | nou |
| Caseta de salt în timp | Cronologia și lista de evenimente | gata |
| Decalarea în timp a unui obiect (fantomă) | **Decalare în timp și tăiere**: mută zborul unei unități sau a unei înregistrări întregi cu atâtea secunde; **Aliniază înregistrările** mută mai multe înregistrări ca să pornească împreună și le redă deodată (două ieșiri din zile diferite una lângă alta). Înregistrarea este refăcută, deci urmele, evenimentele, graficele și statisticile urmează | nou |
| Tăierea înainte/după | **Din acum / Până acum / Taie la acest interval** (anularea păstrează decalările), apoi **Exportă CSV** (se încarcă înapoi în 3DHeat) sau **Exportă ACMI** (text Tacview 2.2, pentru o înregistrare așezată pe Pământ) | nou |

## Teren și hartă {#terrain-and-map}

| Tacview | 3DHeat | Stare |
|---|---|---|
| Teren real, altitudine și texturi personalizate | Nivelurile (harta jocului ca model 3D), plăcile fundalului lumii | gata |
| Moduri de teren plat / gol / cu contrast ridicat | [Aspectul nivelului](level-appearance.md): relieful terenului, suprafața și structurile arătate sau nu | gata (nu aceleași moduri) |
| Harta tactică 2D (Tacview nu are; are vederea din satelit) | **Harta 2D**: colțul sau vederea întreagă, simboluri după fel și echipă (jucători plini, IA contur), întoarse spre cap, urme, nume, bară de scară, inele de distanță în jurul unității urmărite, inelele bullseye, locul camerei 3D, morții recente; trage, derulează, clic ca să urmărești (M) | nou |
| Obiecte statice (aeroporturi, piste, puncte de reper, zone, KML) | Piste măsurate (OurAirports) în fundalul lumii și pantele lor; punctele GPX și marcajele KML se încarcă ca obiecte fixe; [Tabla tactică](tactics-board.md) desenează zone și rute | nou |

## Import, export, înregistrare {#import-export-recording}

| Tacview | 3DHeat | Stare |
|---|---|---|
| Text și zip ACMI | [Tacview ACMI](tacview-acmi.md) | gata |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (trasee, rute, puncte de reper; ritm cardiac, cadență, putere, temperatură Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC și GGA de orice emițător, sume de control verificate, peste miezul nopții), **IGC** (înregistrări B, data, pilotul și planorul), **FIT** (mesaje de înregistrare, marcaje de timp comprimate) – fiecare așezat după latitudine și longitudine în planul din mijlocul traseelor, ca fundalul lumii să se potrivească; cap, tangaj și viteză din fișier sau de la un punct la altul. CSV și Parquet ca înainte | nou (DIS nu se aplică: este un protocol de rețea live) |
| Înregistratoare native (DCS, BMS, IL-2, MSFS...) | Convertoarele proprii 3DHeat (War Thunder, CS2, Squad, Arma și altele) | gata (propriile) |
| Telemetrie în timp real prin TCP, ADS-B | Nu este construit | nu se aplică (redări după meci) |
| Audio și video sincronizate | **Audio și video**: un fișier local se redă, se pune pe pauză, se derulează și își schimbă viteza cu cronologia dintr-un început ales (**Începe acum**, ±0,1 s); un video într-un panou redimensionabil peste vedere, sau imagine în imagine. Fișierul rămâne în browser | nou |
| Exportul video | [Traseul camerei și videoclipul](camera-path-and-video.md) | gata |

## Altele {#other}

| Tacview | 3DHeat | Stare |
|---|---|---|
| Suplimente Lua | Nu este construit | nu se aplică (deschis: schimbi vizualizatorul însuși) |
| Debriefing online (sesiune comună) | Nu este construit | nu se aplică (al Tacview este o sesiune găzduită care ține pe toți pe același cap de redare. 3DHeat nu are server și își ține înregistrările pe calculatorul vizualizatorului, iar chiar și o legătură peer-to-peer are nevoie de un server de semnalizare. Un debriefing se împărtășește ca fișiere: înregistrarea tăiată (Exportă ACMI sau CSV) și fișierul cu semnele de carte, care se deschid în aceleași momente și vederi) |
| Controlul la distanță de către instructor | Nu este construit | nu se aplică (controlează un simulator care rulează) |
| Editarea obiectelor (adăugare, editare, ștergere) | [Tabla tactică](tactics-board.md) pentru obiectele planificate; înregistrările sunt doar pentru citire | nu se aplică |
| Limbi | 40 de limbi | gata |
| Autentificarea înregistrărilor | Nu este construit | nu se aplică |

## Pentru dezvoltatori: proprietățile ACMI 2.2 {#for-developers-acmi-22-properties}

Citite de `data/acmi.ts`; proprietățile numerice devin coloane numerice, cele text devin coloane de categorie. Toate apar sub **Brut** în cardul unității. Acestea sunt citite cu un scop:

| Proprietăți | Folosire |
|---|---|
| T (toate cele patru forme), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Poziție, atitudine, figură, numele unității, echipa |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Câmpuri, grafice, HUD, detectarea decolării și aterizării |
| VerticalGForce, LongitudinalGForce, LateralGForce | Câmpuri G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Câmpuri |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Câmpuri de combustibil, însumate pe rezervoare |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Conuri radar și poarta de distanță |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Liniile de blocare |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Cupolele de angajare |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Câmpuri |
| Health | Câmp |
| Evenimente: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Lista de evenimente, statistici (morți, decolări, aterizări), semne de carte; Message și Comment ca subtitrări |
| PilotHeadYaw, PilotHeadPitch | Linia privirii pilotului |
| Eticheta de tip Bullseye (Navaid+Static+Bullseye) | Câmpul bullseye și inelele de pe hartă |
| Orice altceva (PilotHeadRoll, comenzi, suprafețe, abateri ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, mărimi...) | Arătate cum sunt scrise, sub **Brut** |

Unghiurile radarului și ale blocărilor se iau față de axele proprii ale unității: azimutul spre dreapta, elevația în sus, rularea cu aripa dreaptă în jos. Specificația ACMI spune că sunt relative la aeronavă, dar nu spune care sens este pozitiv; această citire urmează transformarea ei (girație în sensul acelor de ceas, tangaj în sus, rulare cu dreapta).

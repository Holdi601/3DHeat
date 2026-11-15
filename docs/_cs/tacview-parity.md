---
title: "Parita s Tacview"
parent: "Přehrání zápasu"
grand_parent: "Přehrání"
nav_order: 1
lang: "cs"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Parita s Tacview

Tacview je oblíbený program pro sledování záznamů letů. Pokud ho znáte, tato stránka ukazuje, kde je každý jeho nástroj v 3DHeat.

Vypisuje každou funkci Tacview 1.9 (jeho příručku, tabulku textů rozhraní a formát souboru ACMI 2.2) a říká, jak si s ní [přehrání zápasu](match-replay.md) v 3DHeat stojí. Cíl je tento: co umí Tacview pro přehrání a jeho data, to umí i 3DHeat.

**Stav:**
- **hotovo**: už je v 3DHeat.
- **nová**: vytvořeno tak, aby odpovídalo funkci Tacview.
- **zatím ne**: platí, ale ještě není vytvořeno.
- **neplatí**: tady se nehodí, důvod je uveden.

Kde najít funkce: karta **Zápas**, **Přehrávání figur** (nebo **Překryv figur** na kartě Teplotní mapa), v bočních sekcích **Přehrání**, **Jednotky**, **Události**, **Záložky**, **Taktický displej**, **Statistiky**, **Časový posun a oříznutí**, **Mapa a poloha**, **Zvuk a video** a **Popisky**. Viz [Přehrání zápasu](match-replay.md).

## Kamery {#cameras}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Pohled z kokpitu (F5), horizont se natáčí s letadlem | **Kokpit**: z jednotky ven podle jejího postoje, jak ho má model pohybu. Vlastní figura jednotky se ořízne. Tažením se rozhlédnete; **Znovu dopředu** resetuje. | nová |
| HUD v pohledu z kokpitu (volba IAS/CAS/TAS) | **Průhledový displej** (H): horizont a žebřík sklonu skutečného pohledu, značka dráhy letu, páska kurzu, IAS, výška, TAS, Mach, G, úhel náběhu, vertikální rychlost, AGL | nová |
| 3D přístrojová deska v kokpitu, sledování hlavy pilota (PilotHead*), TrackIR | Žádné modely kokpitu; úhly hlavy se ukazují v pohledu **Surová** na kartě jednotky | neplatí (žádné modely kokpitu; sledování hlavy je hardware pro živé létání) |
| Vnější pohled (F6): obíhání hlavního objektu | **Zezadu** (otáčí se s jednotkou) a **Orbita** (drží svůj vlastní směr) | hotovo |
| Kamera pro souboj, „Dívat se na cíl“ (zámek) | **Zámek**: z kokpitu, držený na cíli | nová |
| Kamera pro souboj, „Na střed“ / „Dívat se dopředu“ | **Cíl**: za jednotkou na přímce od cíle, dívá se přes ni na cíl. **Pevná** na azimutu 0 se dívá dopředu zpředu. | nová |
| Prohodit hlavní a vedlejší objekt | **Prohodit** vedle cíle | nová |
| Satelitní pohled (F7), ortografický pohled shora | **Satelit**: přímo dolů na jednotku, sever nahoře; tažením se otáčí. 2D mapa je ortografický půdorys. | nová |
| Volná kamera (F8), W/A/S/D, E/C | Volná letová kamera (W/A/S/D, Space/Q, Shift/Alt) | hotovo |
| Doplněk Head-On camera; vnější kamera připevněná k objektu | **Pevná**: místo kolem jednotky, které se s ní otáčí a naklání; tažením se přesouvá (vzadu, na konci křídla, zepředu) | nová |
| Doplněk Lock Camera (zmrazí polohu) | Přestat sledovat (Esc): kamera zůstane, kde byla | hotovo |
| Strategický pohled (oddálení na celou Zemi) | [Pozadí světa](world-backdrop.md) a rámec celého záznamu na 2D mapě | hotovo |
| Nastavení zorného pole | **Kamera a scéna**: FOV | hotovo |
| Přepínání pohledů klávesami | **V** další pohled, **Shift+V** zpět | nová |

## Nastavení 3D pohledu a zobrazení {#d-view-and-display-options}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Stopy (ribbon trails), posuvník délky | Stopy (sekundy) v Prohlížeči týmu | hotovo |
| Předvídavá stopa (dráha vpředu) | **Dráha vpředu**: kam jednotka skutečně pojede v dalších sekundách | nová |
| Výškové čáry objektu / stěny | **Svislé čáry** | hotovo (čáry; stěny nejsou vytvořeny) |
| Vektory vybraného objektu: směr (tečkovaně), kurz (plně), zdvih | **Vektory rychlosti** (kurz a rychlost na tolik sekund, s tipem) a **Čáry nosu a vztlaku** (nos čárkovaně, vztlak krátký a tmavý) | nová |
| Směr pohledu pilota | **Směr pohledu pilota**: čárkovaná azurová čára podle PilotHeadYaw/PilotHeadPitch (nebo sloupce HeadYaw, ViewYaw nebo LookYaw) vůči osám jednotky | nová |
| Kupole smrtícího dosahu SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, dvojčata „2“) | **Zóny zásahu**: kupole, vejčité tam, kde se vertikální dosah liší, vypnuté, dokud je EngagementMode 0 | nová |
| Radarová zamčení (LockedTarget..9) s popisky | **Zamčení**: červené čáry ke každému zamčenému objektu; čárkovaně oranžově k FocusedTarget; podle LockedTargetAzimuth/Elevation/Range tam, kde není objekt pojmenován. **Popisky zamčení**: jméno cíle a vzdálenost na každé čáře zamčení | nová |
| Radarový kužel (RadarMode, Azimuth, Elevation, Roll, Range, šířky svazku) a radarová brána | **Radarové kužely**: obrys a střední kruh svazku natočeného podle azimutu, elevace a náklonu vůči jednotce; radarová brána jako dva žluté okraje. Bez šířek svazku jen osa svazku. | nová |
| Čára dohledu mezi dvěma vybranými objekty (zeleně / červeně tečkovaně, když terén brání) | Čára změřené dvojice zčervená a čárkuje se, když je mezi nimi terén | nová |
| Automatické zvětšení vzdálených objektů | Nejmenší figura na obrazovce (pixely) | hotovo |
| Mřížka zeměpisné šířky a délky | **Mapa a poloha → Mřížka**: čáry šířky a délky na zemi pod kamerou, v kulatém rozestupu podle výšky (10° až 1'), popsané; nebo kilometrová mřížka **MGRS** pásma UTM, s pásmem a čtvercem 100 km. Vlastní mřížka 2D mapy zůstává. | nová |
| Kruhy bullseye | Kruhy kolem bullseye každého týmu na 2D mapě | nová (jen 2D) |
| Překryv sestupové roviny (glideslope) | **Sestupové roviny**: dráhy 3° s okraji plné výchylky ±0,7° na obou koncích každé dráhy poblíž záznamu, z zaměřených prahů a výšek OurAirports (stažené jednou, uložené offline), značka na každé námořní míli, pojmenované podle letiště a dráhy | nová |
| Výškové omezení (alarm stropu/podlahy) | **Výškové omezení**: podlaha a strop; popisky jednotek mimo něj zčervenají a každé překročení (pod podlahou, nad stropem, zpět uvnitř) je v seznamu – kliknutí tam přeskočí a jednotku sleduje | nová |
| Zničené objekty šedě, po 15 min odstraněny | Životy končí se svou stopou; mrtvá jednotka je v seznamu jednotek ztlumená | hotovo |
| Vlastnosti Visible / Disabled | Zobrazí se v **Surová**; nic jimi neschováváme | zatím ne |
| Zobrazení pozice páky, plynu a pedálů | Plyn a hodnoty motoru v polích; ovládací vstupy v **Surová** | hotovo (jako hodnoty) |
| Komentáře jako titulky | **Zprávy jako titulky** (Popisky): události ACMI Message a Comment a chat z libovolné hry (události Chat, Say nebo Radio, nebo sloupec chatu), dole ve výhledu s tím, kdo řekl, po dobu šesti sekund | nová |
| Zobrazení data a času UTC | Hodiny na časové ose s UTC, kde záznam má referenční čas | hotovo |
| Zeměpisná šířka a délka kurzoru, MGRS, bullseye | Karta bodu (kliknutí na bod) dává zeměpisnou šířku a délku ve stupních, minutách a sekundách a MGRS vedle světových metrů; bullseye na jednotku (pole) | nová |
| Vlastní logo | Není vytvořeno | neplatí (značka) |
| 3D modely, nejbližší, když není známo | Vlastní katalog figur, nejbližší protějšek, skutečná velikost | hotovo |
| Více zásahů (čáry mezi všemi dvojicemi) | **Čáry střetnutí**: od každé jednotky v rozsahu ke každému protivníkovi v nastavené vzdálenosti (1 až 200 km), každá se svým dosahem, nejbližších 60 dvojic; změřená dvojice jako dosud | nová |

## Popisky {#labels}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Popisky zap/vyp, zvlášť pro vybrané a nevybrané objekty | **Popisky** s pravidly pro **Vybrané**, **Letadla**, **Pozemní**, **Lodě**, **Zbraně** a **AI**: zobrazit nebo ne, vlastní hodnoty, priorita | nová |
| Pole popisků: jméno, volací znak, pilot, rychlosti (TAS/CAS/IAS/Mach/GS), výšky (ASL/AGL), VS, AOA, AOS, G (vertikální, boční, podélné), rychlost a poloměr zatáčky, energie, palivo (hmotnost/objem/průtok), kurz/dráha, náklon/sklon, tepová frekvence | Každá hodnota z `fields.ts`: stejný seznam, dopočítaný tam, kde se nezaznamenal (odhady označeny ~). Rychlost náklonu a SpO2 jen přes **Surová**. | hotovo |
| Pozice bullseye v popiscích | Pole **Bullseye (azimut / vzdálenost)** | nová |
| Odchylky ILS, ulétnutá vzdálenost | Surové hodnoty; ulétnutá vzdálenost ve statistikách | hotovo (částečně) |
| Odlehčení nevybrané telemetrie | **Nepřekrývat popisky**, řazeno podle priority každého pravidla | hotovo / nová |
| Popisky všech pozemních objektů / jen hrozeb | Pravidla Pozemní a AI | nová |
| Měřítko popisků | **Velikost popisků** (60 až 250 %) | nová |
| Metrické / imperiální jednotky | Metrické / imperiální | hotovo (dvě předvolby, ne osm) |

## Informace o objektu a telemetrie {#object-info-and-telemetry}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Primární a sekundární výběr | Klik sleduje a vybírá; shift-klik dvou měří; výběr **Cíl** | hotovo / nová |
| Vzdálenost / azimut / aspekt / přibližování mezi dvěma objekty | Čára BRAA změřené dvojice; pole Vzdálenost, Azimut, Aspekt a Přibližování ze sledované jednotky | hotovo |
| Relativní azimut, rychlost záměrné přímky | Pole **Relativní azimut** (od nosu sledované jednotky, L/P) a **Úhlová rychlost záměrné přímky** (°/s) | nová |
| Okna telemetrie | Karta jednotky a karta při najetí myší | hotovo |
| Surová telemetrie (každá zaznamenaná vlastnost, i neznámé) | **Surová** na kartě jednotky: každý sloupec na řádku jednotky, jak je zapsán | nová |
| Seznam aktivních objektů | **Jednotky**: hráči, AI, zbraně v letu, živé jsou zvýrazněny | hotovo |
| Okno vlastností záznamu (název, autor, briefing...) | Uloženo jako sloupec RecordingInfo; zobrazeno v Surová | hotovo (bez okna) |
| Formáty pozice DMS/MGRS, magnetický sever | **Poloha (šířka / délka)** ve formátu DMS a pole **MGRS**; pole **Magnetický kurz**; **Magnetické kurzy** zapíše magnetický kurz, dráhu a zaměření (°M) a ukáže kompas s oběma severy a odchylkou – World Magnetic Model 2025 (koeficienty s volným užitím), počítaný zde pro místo a datum jednotky | nová |

## Grafy {#charts}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Graf jednoho objektu, až 4 hodnoty | **V čase** (a graf pod Přehráním) | hotovo |
| Vykreslit až 4 objekty najednou | **Porovnání**: jedna hodnota až u 8 jednotek na jedné stupnici | nová |
| Hodnota proti hodnotě (styl energie a manévrovatelnosti) | **Hodnota proti hodnotě**: rychlost otáčení proti rychlosti nebo jakémukoli páru, každá jednotka jako čára, její aktuální bod označen | nová |
| Osa X podle času; přiblížení; posun času z grafu | Kolečko přibližuje v čase, dvojklik resetuje, klik jde na okamžik | nová |
| Osa X podle vzdálenosti ve vzduchu nebo na zemi | **Čas / Vzdálenost ve vzduchu / Vzdálenost na zemi** u grafů času a porovnání; přiblížení a přechod kliknutím fungují stejně | nová |
| Předdefinované grafy (energie, zrychlení...) | Lze vybrat libovolnou hodnotu (výška energie a její rychlost jsou hodnoty) | hotovo |

## Statistiky, záznam letu, události {#statistics-flight-log-events}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Záznam letu: vzlet, přistání, výstřel, zásah od, zničen od, opuštěná oblast | **Statistiky** na jednotku: životy, sestřely, smrti, výstřely, zásahy, poměr zásahů, vzlety, přistání, čas ve vzduchu, největší G (a nejmenší), nejvyšší rychlost, výška a Mach, vzdálenost. Vzlety se berou z událostí TakenOff/Landed, OnGround, AGL, nebo jsou odhad označený ~. | nová |
| Doplňky skóre a hlášení z mise | Souhrn za tým a nejvíc sestřelů; vlastní skóre souhrnu zápasu | nová / hotovo |
| Export záznamu letu XML/CSV | **Exportovat CSV** statistik a událostí tak, jak jsou vypsány | nová (jen CSV) |
| Export telemetrie CSV v zadané frekvenci | **Telemetrie vybrané jednotky**: každá hodnota, 1 až 20 za sekundu | nová |
| Záznam událostí, dvojklik tam přeskočí a vybere | Seznam **Události**, filtrovaný podle druhu a jednotky; klik tam odletí | hotovo |
| Předchozí / další událost (Ctrl+←/→) | **Page Up / Page Down** | nová |
| Pauza při události | **Pauza při události** | nová |
| Značky na časové ose (vypuštění, zásahy, zničení; u vybraného objektu modře; záložky červeně) | Sestřely a smrti jako hustotní pruh, u sledované jednotky modře, záložky červeně; klik přeskočí | nová |
| Odstranit událost, odstranit zabití | Není vytvořeno | neplatí (události patří záznamu; filtry je skryjí) |

## Záložky {#bookmarks}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Vložit záložku s výběrem a bodem pohledu | **Přidat záložku** (B): okamžik, volná kamera nebo sledovaná jednotka s jejím pohledem, vzdáleností a cílem; pojmenovaná; uložená v tomto prohlížeči pro každý záznam | nová |
| Odstranit záložku | × v seznamu | nová |
| Záložky na časové ose a v záznamech | Červené značky; seznam | nová |
| Event=Bookmark v ACMI | Vypsáno mezi značkami záznamu, se sestřely, smrtmi a zprávami | nová |
| Zkratka kopírovat/vložit (sdílení pohledu) | **Export / Import** záložek jako soubor; C zkopíruje pozici kamery | nová |

## Přehrávání {#playback}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Přehrát/pozastavit, na začátek, rychlost, posun na časové ose | Časová osa | hotovo |
| Snímek po snímku | **,** a **.** o sekundu zpět a dopředu (Shift: deset) | nová |
| Přehrávání pozpátku | **◀** na časové ose, **J** (**L** dopředu; stejná klávesa znovu pozastaví): přehraje od konce k začátku zvolenou rychlostí, ve smyčce nebo se zastaví na začátku | nová |
| Dialog skoku v čase | Časová osa a seznam událostí | hotovo |
| Posun času jedné jednotky (duch) | **Časový posun a oříznutí**: posunout let jedné jednotky nebo celého záznamu o tolik sekund; **Srovnat záznamy** přesune několik záznamů, aby začaly společně, a přehraje je naráz (dva výlety z různých dnů vedle sebe). Záznam se přepočítá, takže stopy, události, grafy a statistiky následují. | nová |
| Oříznutí před/po | **Od teď / Do teď / Oříznout na tento úsek** (zrušení vrací posuny), pak **Exportovat CSV** (načte se zpět do 3DHeat) nebo **Exportovat ACMI** (text Tacview 2.2, pro záznam umístěný na Zemi) | nová |

## Terén a mapa {#terrain-and-map}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Skutečný terén, vlastní výšky a textury | Úrovně (vlastní mapa hry jako 3D model), dlaždice pozadí světa | hotovo |
| Režimy terénu: plochý / prázdný / vysoký kontrast | [Vzhled úrovně](level-appearance.md): reliéf terénu, povrch a stavby zobrazené nebo ne | hotovo (ne stejné režimy) |
| 2D taktická mapa (Tacview žádnou nemá: satelitní pohled) | **2D mapa**: roh nebo celý pohled, symboly podle druhu a týmu (plné figury hráčů, obrysy AI) natočené ke svému kurzu, stopy, jména, měřítko, kruhy dosahu kolem sledované jednotky, kruhy bullseye, místo 3D kamery, nedávné smrti; tažení, kolečko, klik pro sledování (M) | nová |
| Statické objekty (letiště, dráhy, body, oblasti, KML) | Zaměřené dráhy (OurAirports) v pozadí světa a jejich sestupové roviny; body GPX a značky KML se načtou jako stojící objekty; [Tactics board](tactics-board.md) kreslí oblasti a trasy | nová |

## Import, export, záznam {#import-export-recording}

| Tacview | 3DHeat | Stav |
|---|---|---|
| ACMI text a zip | [Tacview ACMI](tacview-acmi.md) | hotovo |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (trasy, cesty, body; tepová frekvence Garmin, kadence, výkon, teplota), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC a GGA od libovolného vysílače, kontrolní součty ověřeny, přes půlnoc), **IGC** (záznamy B, datum, pilot a kluzák), **FIT** (zprávy record, komprimované časové značky), každý umístěn podle zeměpisné šířky a délky do roviny uprostřed stop, aby pozadí světa sedělo; kurz, sklon a rychlost ze souboru nebo z bodu k bodu. CSV a Parquet jako dosud. | nová (DIS neplatí: živý síťový protokol) |
| Nativní záznamníky (DCS, BMS, IL-2, MSFS...) | Vlastní konvertory 3DHeat (War Thunder, CS2, Squad, Arma a další) | hotovo (vlastní) |
| Telemetrie v reálném čase přes TCP, ADS-B | Není vytvořeno | neplatí (přehrávání až po zápasu) |
| Synchronizované zvuk/video | **Zvuk a video**: místní soubor se přehrává, pozastavuje, přetáčí a mění rychlost podle časové osy od zadaného začátku (**Začíná teď**, ±0,1 s); video v panelu, který lze měnit, nad pohledem, nebo obraz v obraze. Soubor zůstává v prohlížeči. | nová |
| Export videa | [Cesta kamery a video](camera-path-and-video.md) | hotovo |

## Ostatní {#other}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Doplňky v Lua | Není vytvořeno | neplatí (otevřený zdroj: změňte samotný prohlížeč) |
| Online debriefing (sdílená relace) | Není vytvořeno | neplatí (Tacview má hostovanou relaci, která drží všechny na jedné pozici přehrávání. 3DHeat nemá server a záznamy drží na počítači prohlížeče, a i přímé spojení mezi účastníky potřebuje signalizační server. Debriefing se sdílí jako soubory: oříznutý záznam (Exportovat ACMI nebo CSV) a soubor záložek, které se otevřou ve stejných okamžicích a pohledech) |
| Vzdálené ovládání instruktorem | Není vytvořeno | neplatí (ovládá běžící simulátor) |
| Úprava objektů (přidání, úprava, odstranění) | [Tactics board](tactics-board.md) pro plánované objekty; záznamy jsou jen pro čtení | neplatí |
| Jazyky | 40 jazyků | hotovo |
| Ověření záznamů | Není vytvořeno | neplatí |

## Pro vývojáře: vlastnosti ACMI 2.2 {#for-developers-acmi-22-properties}

Čte je `data/acmi.ts`. Číselné vlastnosti se stanou číselnými sloupci, textové kategoriálními sloupci. Všechny se ukazují v **Surová** na kartě jednotky. Čtou se pro určitý účel:

| Vlastnosti | Použití |
|---|---|
| T (všechny čtyři tvary), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Pozice, postoj, figura, jméno jednotky, tým |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Pole, grafy, HUD, zjištění vzletu a přistání |
| VerticalGForce, LongitudinalGForce, LateralGForce | Pole G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Pole |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Pole paliva, sečteno přes nádrže |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarové kužely a radarová brána |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Čáry zamčení |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Kupole zásahu |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Pole |
| Health | Pole |
| Události: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Seznam událostí, statistiky (smrti, vzlety, přistání), záložky; Message a Comment jako titulky |
| PilotHeadYaw, PilotHeadPitch | Směr pohledu pilota |
| Značka typu Bullseye (Navaid+Static+Bullseye) | Pole bullseye a kruhy na mapě |
| Vše ostatní (PilotHeadRoll, ovládání, povrchy, odchylky ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, velikosti...) | Zobrazeno tak, jak je zapsáno, v **Surová** |

Úhly radaru a zamčení se berou vůči vlastním osám jednotky: azimut vpravo, elevace nahoru, náklon pravé křídlo dolů. Specifikace ACMI říká, že jsou vztaženy k letadlu, ale neříká, kterým směrem je kladný směr. Tento výklad se řídí její transformací (zatáčení po směru hodinových ručiček, sklon nahoru, náklon vpravo).

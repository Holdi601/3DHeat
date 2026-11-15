---
title: "Pakartojimas ir 3D scena"
parent: "Lenktynių analizė"
nav_order: 52
lang: "lt"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Pakartojimas ir 3D scena

Pavažiuokite savo ratus kartu, kaip lenktynes, ir stebėkite, kur vienas automobilis pralenkia kitą. Čia aprašyta viskas, ką matote **Lenktynių analizė** skirtuko 3D vaizde: nuvažiuotos trajektorijos, spalvos ant trasos, automobiliai ir žymos.

![Priežasčių žemėlapis su automobiliais sulygiuotais 40 m prieš posūkį: nuspalvinta trasa, du automobiliai ir vėliavos stulpas](../assets/img/en/race-replay-lined-up.webp)

## Pakartojimo laikrodis {#the-replay-clock}

Vienas laikrodis valdo visus ratus: sekundes **etalono** ratu. Variklis jį pastumia kiekvieną kadrą grojant (kadro trukmė × pakartojimo greitis); pabaigoje, kai įjungtas **Kartoti**, jis grįžta į 0, kitaip sustoja. Laikrodis tyčia nėra saugyklos dalis, kad šoninė juosta nebūtų perpiešiama kiekvieną kadrą; HUD ir grafikai jį stebi ir atsinaujina ne dažniau kaip kartą per kadrą.

**Pakartojimo trukmė** yra ilgiausias laikas, kurį bet koks ratas trunka laikrodyje: kiekvieno rato laikas (atėmus jo poslinkį *Sulygiuoti*) arba etalono laikas *Greta*.

## Perjungimo juosta {#the-transport-bar}

Po vaizdu, iš kairės į dešinę:

| Valdiklis | Ką daro |
|---|---|
| ⏮ | grįžta į pradžią (taip pat **Home**) |
| ▶ / ❚❚ | groti / pauzė (taip pat **K**) |
| greitis | 0,25×, 0,5×, 1×, 2×, 4× |
| slankiklis | nustato laikrodį tiesiogiai, 0,01 s žingsniais |
| laikrodis | `laikas / ilgis · metrai`: laikrodis kaip rato laikas, pakartojimo ilgis ir kiek toli nuvažiavo etalono automobilis |
| *Nuo starto linijos* / *Sulygiuoti* / *Greta* | pakartojimo režimas (žemiau) |
| **Sulygiuoti čia** | padeda kiekvieną automobilį ten, kur dabar yra etalonas, ir tęsia nuo ten |
| **Kartoti** | pradeda iš naujo pabaigoje (pagal numatymą įjungta) |
| **Slėpti grafikus** / **Rodyti grafikus** | atstumo grafikai po juosta |

Mygtukai neaktyvūs, kol neįkelti ratai (vieno rato pakanka pakartoti; palyginimams reikia dviejų).

## Pakartojimo režimai {#replay-modes}

Kaip kiekvieno rato laikas seka laikrodį:

| Režimas | Kiekvieno rato laikas | Ką rodo |
|---|---|---|
| **Nuo starto linijos** (`start`) | pats laikrodis | kiekvienas ratas nuo savo starto: lenktynės tarp jų, tarpas auga taip, kaip augo trasoje |
| **Sulygiuoti** (`anchor`) | laikrodis plius rato poslinkis | kiekvienas automobilis tame pačiame taške tuo pačiu metu, tada paleidžiamas – kas vyksta nuo to taško, o ne nuo rato pradžios |
| **Greta** (`locked`) | laikas, kada ratas pasiekė dabartinį etalono atstumą | kiekvienas automobilis laikomas etalono atstume visą ratą: greičiai ir veiksmai lyginami metras po metro |

Naudokite, kai:

- **Nuo starto linijos**: norite pamatyti, kas pirmauja ir kaip auga tarpas.
- **Sulygiuoti**: norite žinoti, kas vyksta viename posūkyje ar vienoje tiesiojoje, kai visi ten pradeda lygiai.
- **Greta**: norite palyginti, ką vairuotojai daro su pedalais ir vairu toje pačioje trasos vietoje.

**Poslinkiai *Sulygiuoti* režime:** inkarui, esančiam `s` metrų palei etaloną, kiekvieno rato poslinkis yra jo paties laikas taške `s` minus etalono laikas taške `s`; abu nuskaitomi iš suderintų ratų (žr. [vienas atstumo ašis](race-corner-analysis.md#one-distance-axis)). Ratas, kuris neapima `s`, lieka su poslinkiu 0. Pasirinkus *Sulygiuoti* iš režimų mygtukų, inkaras nustatomas į dabartinį etalono atstumą.

Baltas stulpas su vėliava (14 m aukščio) žymi inkarą *Sulygiuoti* režime.

### Sulygiavimas {#lining-up}

| Veiksmas | Inkaras | Laikrodis |
|---|---|---|
| **Sulygiuoti čia** | kur dabar yra etalonas | nepakeistas |
| Shift+spragtelėjimas grafikuose | paspaustas metras | 1,5 s prieš tai, kai etalonas jį pasiekia |
| radinys *Ką tobulinti*, numeruotas ženklelis trasoje, *Posūkis po posūkio* eilutė su radiniu | 40 m prieš tai, kur prasideda radinio priežastis | 1,5 s prieš tą tašką; tada groja |
| automobilio valdymo įvykis, smūgio žymė | 40 m prieš įvykį | 1,5 s prieš; tada groja |
| ratas kurso statistikoje | kaip jo radinys ar įvykis | kaip aukščiau, su tuo ratu fokusuotu |

Žiūrint radinį, kamera jį taip pat įrėmina – rutulys apie radinio intervalo vidurį, kurio spindulys – didesnis iš 40 m ir pusės jo ilgio plius 30 m (60 m įvykiui) – nebent kamera seka automobilį.

### Vijimosi kamera {#chase-camera}

⌖ ratų sąraše padaro, kad kamera seka tą automobilį: 2,5 + 4 × automobilio dydis metrų už jo ir 0,9 + 1,1 × automobilio dydis metrų virš jo, žiūrint kryptimi, kuria jis važiuoja, pasviręs žemyn į automobilį, sušvelnintas (20 % kelio kiekvieną kadrą), kad nedrebėtų su kiekvienu mikčiojimu. ⌖ dar kartą paleidžia. Sekamas automobilis piešiamas šiek tiek šviesesnis, su baltu žiedu ant žemės, o jo kortelė paryškinama.

## Vaizdo skiltis {#the-view-section}

| Valdiklis | Pagal numatymą | Ką daro |
|---|---|---|
| **Linijos** / **Laiko žemėlapis** / **Priežasčių žemėlapis** / **Klaidų žemėlapis** | Laiko žemėlapis | kas nudažoma palei trasą (žemiau); *Linijos* nieko nedažo |
| legenda | - | *laimi ↔ praranda* laiko žemėlapiui, priežasčių spalvos priežasčių žemėlapiui, *mažai ratų ↔ daugiausia ratų* klaidų žemėlapiui |
| **Nuvažiuotos trajektorijos** | įjungta | kiekvieno matomo rato linija jo spalva |
| **Automobiliai** | įjungta | automobiliai ir HUD kortelių šaltiniai |
| **Padangos ir pakaba** | įjungta | padangos temperatūra, slydimo žiedai, pakabos stūmokliai ir kiti kiekvieno rato ženklai bei stogo žibintai ant automobilių |
| **Žymos** | įjungta | posūkių pavadinimai, numeruoti ženklai, smūgių žymos, klaidų žemėlapio posūkių žymos |
| **Trasa iš ratų** | įjungta | kelio danga kursui be išgauto modelio (paslepiama, kai įkeltas kurso modelis) |
| **Visos reikšmės kortelėse** | išjungta | kiekvienas kanalas, išvardytas kiekvienoje HUD kortelėje |
| **Tikrosios automobilių formos** | įjungta | kiekvienas automobilis jo atitikmens pavidalu (žr. [Automobiliai](#the-cars)); išjungta: atvira vienvietė, kuri nieko iš telemetrijos nepaslepia |
| **Automobilio dydis** | 1× | nuo 1× iki 10× žingsniais po 0,5; 1× yra tikrasis automobilio dydis, toks ilgas ir platus, koks jis žaidime. Nieko kito nekeičia, tik šis slankiklis |

## Nuvažiuotos trajektorijos {#driven-lines}

Kiekvieno matomo rato kelias per jo paties mėginius, jo spalva, piešiamas 0,12 m žemiau įrašytos padėties (automobilio įrašyta padėtis yra jo atskaitos taškas, 0,28–0,47 m virš kelio išgautuose Forza kursuose). Taškas išsaugomas kas 1,5 m; kai matoma daugiau nei 10 ratų, ratai, į kuriuos nežiūrima, išsaugo po tašką kas 6 m (kiekviena viršūnė kiekvieną kadrą patenka į GPU).

## Žemėlapiai {#the-maps}

Visi trys yra juostos palei **etalono** kelią, 0,2 m žemiau įrašytų padėčių, po vieną keturkampį kiekvienam 2 m tinklelio žingsniui.

### Laiko žemėlapis (`where`) {#time-map-where}

Fokusuotam ratui: sekundės, prarastos ar laimėtos per metrą, palyginus su ratu, su kuriuo lyginama tame taške (geriausiu jo klasėje, o etalonui – greičiausiu kitu ratu per kiekvieną atkarpą), pagal suderintos delta pokytį per tinklelio žingsnį, sušvelnintą ±10 m ribose. Raudona, kur prarandama laiko, žalia, kur laimima, pilka tarp jų; spalvų skalė – absoliučių reikšmių 95-asis procentilis, todėl smailės apkarpomos ir didžioji rato dalis telpa skalėje. 6 m pločio.

### Priežasčių žemėlapis (`why`) {#cause-map-why}

Fokusuotam ratui: kiekvienas nuostolis nudažomas per intervalą, kuriame yra jo **priežastis** (ne ten, kur matosi laikas), spalva pagal priežasties grupę, o kai du sutampa – brangiausias radinys laimi. Plotis `3 + 9·√(kaina / didžiausia kaina)` metrų; kur nieko neprarasta – pilka 2 m juostelė. Radinys, pasirinktas *Ką tobulinti*, nudažomas baltai.

| Grupė | Spalva | Radiniai |
|---|---|---|
| stabdymas | oranžinė | vairuotojo nuostoliai stabdymo fazėje |
| įvažiavimas | purpurinė | vairuotojo nuostoliai įvažiuojant ir per vidurį |
| išvažiavimas | mėlyna | vairuotojo nuostoliai išvažiuojant |
| tiesioji | geltona | vairuotojo nuostoliai tiesiojoje |
| automobilis | pilka | ką paaiškina automobilis |
| kontekstas | tamsiai pilka | situacija (lenktynių startas prieš skrydžio ratą) |

### Klaidų žemėlapis {#mistake-map}

Kiek iš visų ratų (kurso statistikoje pasirinktų klasių) padarė klaidą kiekviename metre – bet kokios rūšies arba tik tos, kuri pasirinkta statistikoje. Kiekvienas ratas skaičiuojamas vieną kartą kiekviename metre; kiekvienos klaidos intervalas išplečiamas 6 m į abi puses, kad trumpa klaida būtų matoma. Plotis `3 + 10·(ratai / daugiausia ratų)` metrų, spalva nuo prislopintos rudos iki ryškiai oranžinės; pilka 2 m juostelė, kur nė vienas ratas klaidos nepadarė. Žr. [Kurso statistika](race-course-statistics.md#the-mistake-map).

## Trasa iš ratų {#track-from-the-laps}

Žaidimui, kurio kursas neišgautas, po linijomis nubrėžiamas kelias: toks platus, kaip ratai išsibarstę palei etaloną (skaičiuojami skersiniai poslinkiai iki 25 m), plius 2 m į abi puses, bent 4 m į abi puses nuo etalono linijos, sušvelnintas ±8 tinklelio taškų (±16 m) ribose, asfalto pilkos spalvos su šviesiomis kraštinių linijomis, 0,3 m žemiau įrašytų padėčių. Paslepiamas, kai **Level** įkeltas kurso modelis.

## Smūgiai ir avarijos trasoje {#hits-and-crashes-on-the-track}

Kiekvieno matomo rato smūgiai ir avarijos (žr. [Automobilio valdymo įvykiai](race-control-events.md#hits-and-crashes)) pažymimi ten, kur jie įvyko, kai tik piešiamos linijos ar automobiliai: smailuota žvaigždė – raudona avarijai, gintarinė smūgiui – stovi ant stulpo, su žiedu rato spalva jo papėdėje, dydžio pagal automobilio dydį (avarijos didesnės). Kai automobilis praeina smūgio momentą, iš jo 0,8 s sklinda smūgio žiedas.

## Pagalbos režimas {#help-mode}

**?** šalia kalbos pasirinkiklio arba **?** ar **F1** klavišas įjungia kiekvienos ekrane esančios spalvos raktą visuose trijuose skirtukuose ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx), [`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Pasirinkimas lieka šioje naršyklėje.

- **Raktas** vaizdo kampe išvardija spalvas skirtukui ir naudojamam režimui. Kiekviena skalė paimama iš to, iš kur vaizdas ją gauna, todėl redaguota šilumos skalė rodoma kaip redaguota. Lenktynių skirtuke išvardijama tik tai, ką turi įkelti ratai.
- **Kiekvienos automobilio kortelė** gauna lentelę, kas piešiama ant jo ratų, pagal pavadinimą, su kiekvieno rato reikšme spalva, kuria ji piešiama.
- **Fokusuotas automobilis** gauna žymą prie kiekvieno rato, sakančią tą patį, išdėstytą prie kampų. Paslepiama, kai automobilis ekrane per mažas, kad jos tilptų.

## Automobiliai {#the-cars}

**Kiekvienas automobilis savo formos**, jo rato spalva ir tikru dydžiu. Formos paimamos iš automobilių failo, sukurto vieną kartą mašinoje, kurioje yra žaidimas:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Be jo, kiekvienas automobilis piešiamas kaip **peržiūros programos paties automobilis** jo rūšies ir laikotarpio: sedanas, kupė, hečbekas, universalas, sportinis automobilis, superautomobilis, muskulinis automobilis, visureigis, pikapas, furgonas ar mikroautomobilis, kiekvienas kaip klasikinis (iki 1980 m.), 8-ojo ar 9-ojo dešimtmečio arba modernus ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Jie kuriami čia iš bendrų proporcijų: be logotipų, be modelių pavadinimų ir nieko iš bet kurio žaidimo failų, todėl pateikiami kartu su peržiūros programa. Rūšis paimama iš automobilio pavadinimo, laikotarpis – iš jame esančių metų; automobilis, kuriame nei vieno, imamas pagal savo klasę. Apie šimtą tikrų kartų žinomi pagal jų paskelbtą ilgį, plotį, aukštį ir ratų bazę ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); po eilutę kiekvienam, suapvalintą), todėl 1990 m. 3 serija gauna to automobilio dydį ir stovėseną, vis dar kaip paprasta forma be ženklelio ar grotelių.

Automobilio failas sukuriamas jūsų pačių mašinoje iš jūsų pačių žaidimo kopijos. Jame yra kiekvieno automobilio mažo detalumo modelis, apie 900 trikampių, su jo ratų padėtimis (žr. [ekstraktoriaus `cars` komandą](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Įkelti automobilių failą...** peržiūros nustatymuose arba numetus failą ant lenktynių skirtuko jį įkelia; jis lieka šioje naršyklėje. Jame yra žaidimo formos, todėl jo nereikia perduoti, o peržiūros programa jokio nesiūlo.

Kuris automobilis pakeičia rato automobilį, apskaičiuojama kiekvieną kartą iš to, kas įkelta, ir niekada neišsaugoma; todėl automobilis, kuris šiandien neturi atitikmens, gauna savąjį, kai naujesnis failas jį turi ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Rato automobilis | Piešiamas kaip |
|---|---|
| jo numeris yra faile tam pačiam žaidimui | tas pats automobilis |
| ta pati markė ir modelio žodis pavadinime | tas modelis, artimiausias pagal metus |
| ta pati markė, ta pati karta | tos markės automobilis, artimiausias pagal metus |
| kas kita, su automobilio failu | tos pačios markės artimiausias, jei yra, kitaip tos pačios rūšies kėbulas, artimiausias pagal metus |
| atviras ratų automobilis pagal pavadinimą | žemiau aprašyta vienvietė |
| nė vienas iš pirmų dviejų, o peržiūros programa automobilį pažįsta pagal dydį | peržiūros programos automobilis tikru to automobilio dydžiu, su failu ar be jo |
| kas kita be failo | peržiūros programos automobilis tos rūšies ir laikotarpio |

Taigi kito žaidimo 1990 m. BMW 3 serijos ratas rodo to meto BMW, o automobilis, naujesnis už failą, rodo artimiausią giminaitį, kol failas bus sukurtas iš naujo. Rato patarimas ir eilutė po automobilio dydžiu fokusuotam ratui nurodo, kaip jis piešiamas ir kaip artimas tas pavidalas.

Peržiūros programos automobiliai turi tamsius langus. Automobilio failo modeliai visi yra vienos spalvos, nes faile nėra dažų ar stiklo, pagal ką spręsti. Ratai, galiniai žibintai, lempos ir toliau aprašyti telemetrijos ženklai piešiami kaip ant vienvietės: stūmoklis eina išorine rato puse, kur jį matyti, o valdymo svirtys praleidžiamos.

**Vienvietė** yra atviras ratų automobilis lenktynių rato spalva, todėl priekis matyti iš bet kurio kampo ir niekas nedengia ratų: monokokas, variklio dangtis, šoniniai sparneliai, kabina su šalmu, halo apsauga, dugnas, priekinis ir galinis sparnai; keturi apvalūs ratai, priekiniai sukami vairu (iki 0,5 rad pilnai pasukus), kiekvienas ant dviejų valdymo svirtų su stovu, skersine vairo trauka (priekyje) arba pavaros velenu (gale), ir stūmoklis. Modelis nuleidžiamas 0,3 m nuo įrašytos padėties, kad ratai stovėtų ant kelio, o mastelį keičia **Automobilio dydis**.

**Kėbulas juda ant spyruoklių**: kai ratas turi visas keturias pakabos eiges, kiekvienas kampas nusileidžia pagal savo eigą (sustiprinta iki 0,12 m nuo pilno išsitiesimo iki pilno suspaudimo, kad matytųsi iš vijimosi kameros), o kėbulas grimzta, linguoja ir rieda plokštumoje per visus keturis.

**Kas piešiama iš telemetrijos** (kai įjungta *Padangos ir pakaba*) seka [kanalų lentelę](race-charts-and-hud.md#the-channel-table):

| Ženklas | Iš | Piešinys |
|---|---|---|
| padangos spalva | `tireTemp` | pati padanga: mėlyna šalta → ciano → žalia darbinė → geltona → raudona karšta, nuo 40–130 °C |
| slydimo žiedas | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (didžiausias) | žiedas ant žemės po ratu: žalias, kai yra sukibimo rezervas, gintarinis ties 0,66, raudonas ties 1 (sukibimo riba, kaip ją praneša žaidimas); blankus žemiau 0,3 |
| pakabos juosta | `suspension` (0..1) | stūmoklis, nudažytas pagal eigą: mėlynas išsitiesęs, baltas viduryje, raudonas suspaustas |
| stabdžių švytėjimas | `brakeTemp` (100–900 °C) | diskas ant išorinio rato paviršiaus, nuo tamsaus iki oranžinio |
| dėvėjimosi juosta | `tireWear` (0..1) | juosta aplink protektoriaus kraštą, nuo baltos (nauja) iki raudonos (nudėvėta) |
| apkrovos juosta | `wheelLoad` (0–12 000 N) | stulpas šalia rato, toks aukštas, kokia apkrova |

Stabdžių žibintai (lietaus žibintas ir sparnų galiniai) šviečia su stabdžių pedalu. Kiekvienas `lamp` kanalas, kuris įjungtas (virš pusės savo diapazono), uždega lempą virš oro įleidimo dėžės jos spalva: veikia ABS, veikia traukos kontrolė, DRS, boksų ribotuvas, rankinis stabdys, automobilis ore.

**Minioje** (daugiau nei 10 matomų) automobiliai, į kuriuos nežiūrima, piešiami paprastai: tik kėbulas, sparnai, ratai ir stabdžių žibintas.

## Žymos {#labels}

Prisegtos prie trasos ir kiekvieną kadrą išdėstomos pagal kameros projekciją (už ekrano ar už kameros – paslepiamos). Kai **Žymos** įjungtos:

| Žyma | Kur | Spustelėjimas |
|---|---|---|
| posūkių pavadinimai (`T1`, `T2` …) | virš kiekvieno posūkio viršūnės etalone | - |
| numeruoti ženkleliai 1–5 | penki didžiausi fokusuoto rato vairuotojo nuostoliai, vidury kiekvienos priežasties intervalo, apvedimas priežasties spalva; užvedus – pavadinimas ir kaina | sulygiuoti ir pakartoti tą radinį |
| smūgio / avarijos žymos | virš kiekvieno **fokusuoto** rato proveržio: „Avarija −45 km/h“ / „Smūgis −12 km/h“; užvedus – pilnas aprašymas ir patarimas | sulygiuoti ir pakartoti smūgį |
| klaidų žemėlapio posūkių žymos (vietoj posūkių pavadinimų ir ženklelių, kai žemėlapis yra klaidų) | kiekvieno posūkio viršūnė: „T3 · 5/40 ankstyvas stabdymas“ (dažniausia klaida; ratai, kurie ją padarė / ratai, kurie tą posūkį įveikė), „T3 · 5/40“, kai pasirinkta viena rūšis, „T3 · be klaidų“, kai nė vienos; užvedus – posūkio nuostoliai ir penkios dažniausios klaidos | atidaryti ar uždaryti tą posūkį kurso statistikoje |

## Veidrodiniai pasauliai {#mirrored-worlds}

Peržiūros programos pasaulis yra dešiniarankis, su Y aukštyn: žiūrint iš viršaus, automobilis, kurio judėjimo kryptis `atan2(dx, dz)` didėja, sukasi į kairę. Žaidimas su kairiarankiu pasauliu – tarp jų Forza – atvaizduojamas veidrodiškai: kiekvienas dešiniojo lenkimo posūkis nupiešiamas kaip kairysis, tiek kursas, tiek ratai.

Patys ratai tai sako ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): einant kiekvieną ratą po kelis metrus (3 m), jo kelio posukis lyginamas su išorinės pusės pakabos suspaudimu (`suspension.FR` minus `suspension.FL`) ir, be pakabos, su vairu (teigiamas dešinėn visuose adapteriuose). Ratas, kuris iš viso pasisuka mažiau nei π, nieko nesako; įrodymas skaičiuojamas, kai jis viršija 2 % posūkio. Ratai balsuoja; lygiųjų atveju – „negalima nustatyti“.

Kai ratų sprendimas nesutampa su dabartiniu ašių apvertimu (nelyginis apverstų ašių skaičius **Camera & scene → Invert world axis**), skyrius **Ratai** tai nurodo sąrašo apačioje:

- žaidimas veidrodinis ir nieko neapversta: „Šie ratai vairuoja į dešinę, kur kursas nubrėžtas lenkiantis į kairę …“ su **Apversti X**;
- ašys apverstos, bet ratai nėra veidrodiniai: „Apverstos ašys piešia šiuos ratus veidrodiškai …“ su **Atkurti ašis**.

Keičiamas tik piešimas – atspindys įdėtas į vaizdo matricą; duomenys, analizė ir kiekviena koordinatė, kurią rodo įrankiai, lieka žaidimo paties. Apvertimas saugomas naršyklėje. Analizė pavadina posūkius kairiaisiais ar dešiniaisiais tuo pačiu matavimu (nežinomas pasaulis laikomas veidrodiniu, kaip Forza).

## Kūrėjams {#for-developers}

Kodas: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts), [`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts), [`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts), [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`), [`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Kas automobilis tam tikru momentu {#what-a-car-is-at-a-moment}

`stateAt` interpoliuoja kiekvieną kanalą tarp dviejų mėginių aplink rato laiką. Kanalai, kurie šoktelėja (pavara, vėliavos), ima artimiausią mėginį. Baigęs ratą automobilis stovi ant linijos.

**Kryptis.** Judėjimo kryptis gaunama iš padėčių, nutolusių per kelis metrus (bent 2 m į abi puses, kad mikčiojimas nepasuktų automobilio). Kėbulo kryptis iš žaidimo yaw paimama tik tada, kai ji pritaikyta judėjimo krypčiai – ženklas ir poslinkis, apskaičiuoti apskritiminiu vidurkiu per mėginius, greitesnius nei 10 m/s (bent 20) – ir tik jei tada sutampa su ja (apskritiminė dispersija mažesnė nei 0,05, apie 18° sklaida); kitaip kėbulas nukreipiamas išilgai judėjimo krypties. Taip išlieka matomas slydimas (kėbulas ir judėjimas skiriasi), nepasitikint žaidimo kampų konvencija.

**Vairavimas ir pusės.** Kuria kryptimi teigiamas vairo posūkis pasuka automobilį ir kuriai pusei priklauso žaidimo dešiniųjų ratų pusė, matuojama iš rato: vairas lyginamas su kelio posūkiu, o kurios pusės pakabos suspaudžiamos posūkių išorėje (be pakabos duomenų Forza žaidimai laikomi veidrodiniais).

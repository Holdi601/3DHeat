---
title: "Automobilio valdymo įvykiai"
parent: "Lenktynių analizė"
nav_order: 54
lang: "lt"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Automobilio valdymo įvykiai

Peržiūros programa seka, kaip buvo įveiktas kiekvienas ratas, ir pažymi vietas, kur vairuotojas privertė automobilį slysti, sukiotis, į ką nors trenktis ar švaistė sukibimą. Tai naudinga, nes klaida, kuri kainavo laiko, yra greičiausiai ištaisoma.

![Automobilio valdymo skyrius: kaip dažnai kiekvienas ratas užsiblokavo, sukosi ar nuslydo į išorę, ir klaidų sąrašas su vienu atidarytu](../assets/img/en/race-control-table.webp)

## Paprastais žodžiais {#in-plain-words}

- **Užsiblokavimas**: stabdote taip stipriai, kad ratas nustoja suktis ir slysta. Automobilis stabdo prasčiau ir nebevaldomas vairu.
- **Buksavimas**: spaudžiate akceleratorių taip stipriai, kad varomieji ratai sukasi greičiau, nei važiuoja automobilis. Prarandate traukos jėgą.
- **Perteklinis pasukamumas**: automobilio galas plačiai išslysta. Jei jis apsisuka visą ratą, tai **apsisukimas**.
- **Nepakankamas pasukamumas**: automobilio priekis plačiai slysta į išorę ("stumia"); sukant vairą labiau nepadeda.
- **Smūgis** ir **avarija**: automobilis į ką nors atsitrenkė (smūgis - trenkimas ar įbrėžimas, avarija - stiprus smūgis).
- **ABS**, **TC**: automobilio pagalbinės sistemos, kovojančios su užsiblokavimu ir buksavimu. Tai nėra klaidos.

## Automobilio valdymo skyrius (ką matote) {#the-car-control-section-what-you-see}

Pasirinktam ratui, kad ir kokie duomenys yra rate, be padangų slydimo ir be dreifo kampo, rodoma, kas vis dar randama, o ne nieko (žemiau).

**Lentelė**: viena eilutė kiekvienai rūšiai, kurią rodo bet kuris iš dviejų ratų - Užsiblokavę ratai, Buksavimas, Galas išslysta (perteklinis pasukamumas ir apsisukimai), Priekis slysta į išorę, Avarijos, Smūgiai, ABS veikia, Traukos kontrolė veikia, Rankinis stabdys, Ore. Kiekviename langelyje rodoma "kiekis · sekundės" pasirinktam ratui ir ratui, su kuriuo jis lyginamas. Ir *Didžiausias dreifo kampas*, kai yra dreifo kampas (didžiausias ant žemės).

**Sąrašas**: jo nebendros klaidos (tos, kurių nedaro abu ratai), kainuojančios bent 0,02 s, brangiausios pirmos, ne daugiau kaip 12. Kiekviena su pavadinimu ir kaina (ir su savo rūšies žyme). Spustelėkite vieną, kad perskaitytumėte patarimą, sulygiuotumėte automobilius 40 m prieš ją ir pakartotumėte. **Taip pat ką abu ratai ten darė** prideda visas klaidas, įskaitant bendras (žymė "abu taip darė", kaina "—", jei mažiau nei 0,01 s). Jei klaidų nėra: "Niekas, ką X darė su padangomis ir ko nedarė Y, nekainavo laiko."

**Užuomina po ja** sako, kuo aptikimas galėjo remtis - "Iš kiekvieno rato slydimo ir slydimo kampo bei automobilio dreifo kampo." (arba slydimo ir slydimo kampo, slydimo ir dreifo kampo, tik slydimo) - dangą, kuriai buvo matuotos ribos (asfaltas, biri, mišri: daugiau nei 80% birių mėginių reiškia biri danga, mažiau nei 20% - asfaltas), kuris ratas buvo naudojamas įvykiams palyginti ir kaip skaičiuojama kaina.

Su **nėra padangų slydimo ir nėra dreifo kampo** (FH Companion rato failas be telemetrijos) lentelė ir sąrašas vis tiek rodomi, o užuomina sako, kas vis dar randama iš to, ką turi ratai: "Šiuose ratuose nėra padangų slydimo ir dreifo kampo, todėl užsiblokavimų ir buksavimo nustatyti negalima. Vis dar randama: stumimai, iš vairo ir kelio kreivės; smūgiai ir avarijos, iš greičio ir pagreičio." - slydimai iš sukimosi greičio taip pat įvardijami, kur ratuose jis yra, o stumimai tik ten, kur yra vairo duomenys. Sakinys apie slydimo ir dreifo ribas praleidžiamas, o antra užuomina sako: "Forza Horizon atveju pasirinkite ir šalia kiekvieno FH Companion rato esantį `.tele.gz` failą: tai visa telemetrija, kiekvieno rato slydimas 64 kartus per sekundę."

Viso rato valdymo **kaina** (naudojama santraukose) suskaičiuojama taip, kad persidengiančios klaidos - užsiblokavimas ir slydimas, prasidedantis per 40 m - skaičiuojamos vieną kartą, brangiausioje grupės vietoje.

## Kaip tai aptinkama {#how-it-is-detected}

Likusi šio puslapio dalis yra taisyklių knyga: kiekviena rūšis, kiekviena riba.

Kodas: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Samprotavimai ir literatūra yra [metode](race-analytics.md).

## Rūšys {#the-kinds}

| Rūšis | Lentelės eilutė | Klaida? | Trumpiausias, kuris skaičiuojamas |
|---|---|---|---|
| `lock` | Užsiblokavę ratai | taip | 0,1 s |
| `wheelspin` | Buksavimas | taip | 0,15 s |
| `oversteer` | Galas išslysta | taip | 0,2 s |
| `spin` | (skaičiuojama kartu su Galas išslysta) | taip | 0,1 s |
| `understeer` | Priekis slysta į išorę | taip | 0,25 s |
| `crash` | Avarijos | taip | - |
| `hit` | Smūgiai | taip | - |
| `abs` | ABS veikia | ne | 0,2 s |
| `tc` | Traukos kontrolė veikia | ne | 0,2 s |
| `handbrake` | Rankinis stabdys | ne | 0,1 s |
| `airborne` | Ore | ne | 0,15 s |

Trumpesni ruožai yra triukšmas (bordiūras, duobė, vienas mėginys). Gretimi tinklelio taškai (kas 2 m), atitinkantys testą, jungiami per tarpus iki 2 taškų. Tik **klaidos** gali būti klaidos ir turi kainą. Kiti yra tai, ką padarė automobilis ir vairuotojas.

## Ko reikalauja kiekvienas testas {#what-every-test-needs}

### Išvestiniai kanalai {#derived-channels}

Prieš vertinimą kiekvienas ratas gauna tai, ko jo žaidimas neatsiunčia, bendrais pavadinimais (paties žaidimo reikšmė visada laimi):

| Kanalas | Iš |
|---|---|
| `bodySlip` (dreifo kampas) | automobilio kėbulo koordinatėse esantis greitis, `atan2(latVel, abs(longVel))`, kai žaidimas jį siunčia (0 žemiau 3 m/s); kitu atveju kryptis (žaidimo `yaw`, pritaikytas prie judėjimo krypties ženklu ir poslinkiu per mėginius greitesnius nei 10 m/s, pasitikima tik tada, kai apskritiminė dispersija mažesnė nei 0,05), lyginant su judėjimo kryptimi (pozicijos bent 2 m atstumu), kai greitis didesnis nei 3 m/s |
| `yawRate` | `yaw` pokytis laike, kai yra kryptis, bet nėra greičio |
| `airborne` | visų ratų kontaktas su žeme nutrūkęs (≤ 0,5); kitu atveju visų ratų apkrova mažesnė nei 5% jų medianos; kitu atveju kiekvienos pakabos poslinkis lygus ar mažesnis nei 0,02 (visiškai išsitiesusi). Vienas atsitiktinis mėginys nėra skrydis |
| `slipRatio.<W>` | `(rato paviršiaus greitis - automobilio greitis) / automobilio greitis` virš 3 m/s, kai žaidimas siunčia rato paviršiaus greičius; arba iš rato sukimosi × riedėjimo spindulys, išmatuotas tame rate - `greičio / sukimosi` mediana, kai važiuojama tiesiai be variklio stabdymo (greitis > 10 m/s, akceleratorius < 0,3, stabdys < 0,05, abs(išilginis pagreitis) < 3 m/s², ne ore); kai mažiau nei 20 mėginių, visi virš 10 m/s. Priimama tarp 0,1 ir 1 m. Pažymėta `physical` |
| `loose` | Forza paviršiaus dundėjimas bent 2 ratuose (> 0,001) bent 0,33 s (bordiūras trumpesnis); tarpai trumpesni nei 1 s užpildomi |

### Ant žemės ir stabilu {#on-the-ground-and-settled}

Niekas neteisiama ore ar **0,3 s po nusileidimo** - pakaba visiškai susispaudžia ir pagreičiai smarkiai šoka, o tai nėra sukibimas, stabdymas ar varymas. Mėginys taip pat turi **judėti**: greičiau nei 5 m/s.

### Danga {#the-ground}

Mėginio danga yra **biri**, kai rato `loose` kanalas taip sako (Forza paviršiaus dundėjimas, Trackmania ratų medžiagos), kitu atveju - rato paviršius (žr. [disciplina ir paviršius](race-loading-laps.md#discipline-and-surface)): asfaltas arba, visiems kitiems, biri. Kreivės, dreifo įpročiai ir ribos laikomi atskirai asfaltui ir birioms dangoms.

### Slydimas kaip padangos nominalaus piko kartotinis {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Žaidimai slydimą skaičiuoja skirtingai; `meta.slip` nurodo, kaip, ir kiekvienas slydimas dalijamas iš mastelio, kad apie 1 būtų padangos nominalus pikas:

| `meta.slip` | Reikšmė | Dalijama iš |
|---|---|---|
| `peak` | žaidimo normalizuota: viršijus 1, sukibimas prarandamas (Forza Data Out) | 1 |
| `scaled` | fizinis slydimas dalijamas iš asfalto piko (Kunos įrašytuvas) | paviršiaus nominalus pikas, padalytas iš asfalto piko |
| `index` | 0..1 slydimo matas (Trackmania SlipCoef) | 0,5 |
| `physical` (arba nežinoma) | slydimo santykis kaip dalis, slydimo kampas radianais | paviršiaus nominalus pikas |

Nominalūs pikai, kai nieko geresnio nežinoma:

| Paviršius | Slydimo santykis | Slydimo kampas |
|---|---|---|
| asfaltas | 0,12 | 8° |
| mišri | 0,18 | 12° |
| biri (žvyras) | 0,25 | 15° |
| sniegas | 0,25 | 15° |
| ledas | 0,10 | 6° |

### Kur baigiasi sukibimas: kiekvieno automobilio padangų kreivės {#where-grip-ends-each-cars-tyre-curves}

Kur padanga nebeduoda daugiau, matuojama **kiekvienam automobiliui** pagal kiekvieną apkrautą jo ratą (`measureTyres`), atskirai asfaltui ir birioms dangoms:

| Kreivė | Mėginiai (greitis > 10 m/s, stabilūs, pagreičiai mažesni nei 45 m/s²) | Slydimas (x) | Jėga (y) |
|---|---|---|---|
| stabdymas | stabdys > 0,3, rankinis ≤ 0,2, važiuojama tiesiai (šoninis mažesnis nei 30% kietiausio) | abs(vidutinis keturių ratų slydimo santykis) | lėtėjimas |
| trauka | akceleratorius > 0,8, stabdys ≤ 0,05, tiesiai, visa automobilio akceleratoriaus trauka tuo greičiu > 0,5 m/s² | didžiausias varomojo rato slydimo santykis | pagreitis kaip tos visos traukos dalis |
| priekis | šoninis didesnis nei 30% kietiausio, automobilio sukibimas tuo greičiu > 1 m/s² | didesnis priekinių ratų slydimo kampas | šoninis pagreitis kaip to sukibimo dalis |
| galas | tas pats | didesnis galinių ratų slydimo kampas | tas pats |

„Kietiausias" yra rato abs(šoninio pagreičio) 99-asis procentilis tame paviršiuje (visas paviršius, kai jo mažiau nei 50 mėginių). Pavarų perdavimas nusprendžia, kurie ratai varomi (priekiniai - FWD, galiniai - RWD, visi - AWD; nežinoma: visi).

Nuo bent **150 mėginių** slydimas suskirstomas į 6–14 lygių pagal mėginių skaičių intervalų (vienas kas 40 mėginių). Kiekvieno intervalo jėga yra jo viršutinis kvartilis (ką padanga davė, kai vairuotojas to prašė), išlyginta su kaimyniniais intervalais. **Geriausias** yra intervalas su didžiausia jėga; **riba** yra pirmas intervalas, už kurio jėga nukrito **8%**. Kreivė, kuri duomenyse niekada nenukrenta, neturi ribos (begalinė) - viršyti „piką" tame žaidime nieko nekainuoja, o vien slydimas ten nieko nepažymi (Forza Horizon posūkio ir traukos kreivės tokios). Kai vieno paviršiaus mėginių per mažai, naudojami kito paviršiaus; kai per mažai iš viso, naudojama **nominali** riba: 1,5 karto nominalus pikas.

Kiekvienas automobilis taip pat gauna:

- savo **dreifo įprotį**: jo dreifo kampo viršutinį kvartilį visur, kur jis posūkiuoja bent 60% savo kietiausio greičio ar daugiau (reikia 100 mėginių);
- savo **vairavimą pagal kreivumą** (`steerGain`), kiekvienai 5 m/s greičio juostai: abs(vairas) / kelio kreivumo medianą, kai stipriai posūkiuojama, bet gerokai viduje ribos (30–60% kietiausio, kreivumas griežtesnis nei 400 m spindulys, vairas didesnis nei 0,02; 25 mėginiai juostai). Kelio kreivumas yra posūkio greitis, padalytas iš greičio, kai žaidimas siunčia posūkio greitį; kitu atveju - iš pozicijų ±5 m.

## Aptikimas pagal rūšis {#detection-kind-by-kind}

| Rūšis | Testas (stabiliems judantiems mėginiams) | `peak` ir `limit` |
|---|---|---|
| **lock** | stabdys > 0,05, rankinis ne virš 0,2, o bet kurio rato slydimo santykis žemesnis nei minus stabdymo riba | didžiausias neigiamas slydimas (nominalaus piko kartotiniais); riba kaip neigiama |
| **wheelspin** | akceleratorius > 0,2 (arba nėra akceleratoriaus kanalo), o varomojo rato slydimo santykis viršija traukos ribą | didžiausias varomasis slydimas; riba |
| **oversteer** (dreifo kampas) | dreifo kampas viršija didesnį iš paviršiaus minimumo ir 1,5 × automobilio dreifo įpročio tame paviršiuje | didžiausias dreifo kampas, radianais |
| **oversteer** (slydimo kampai, be dreifo kampo) | didesnis galinio rato slydimo kampas viršija galinę ribą ir yra daugiau nei 0,25 didesnis nei didesnis priekinis | galinio rato slydimo kampas (nominalaus piko kartotiniais) |
| **oversteer** (be dreifo kampo, bet su posūkio greičiu ir šoniniu pagreičiu) | „posūkio greitis" - abs(posūkio greitis) minus abs(šoninis pagreitis) / greitis, virš 8 m/s - viršija 0,2 rad/s, o vairas nukreiptas prieš posūkį | rad/s; riba 0,2 |
| **spin** | oversteer ruožas, kurio dreifo kampas pasiekė daugiau nei **60°** | kaip oversteer |
| **understeer** (slydimo kampai) | neslysta, didesnis priekinio rato slydimo kampas viršija priekinę ribą ir yra daugiau nei 0,3 didesnis nei galinis | priekinio rato slydimo kampas; riba |
| **understeer** (be slydimo kampų) | greičiau nei 12 m/s, neslysta, nekontrarūsuoja, šoninis pagreitis viršija pusę rato kietiausio (99-asis procentilis), kelio kreivė griežtesnė nei 300 m spindulys, o vairas daugiau nei **1,6 karto** už tai, ką automobilio paties vairavimas pagal kreivumą sako, kad kelias reikalavo | kiek kartų daugiau vairo nei reikėjo; riba 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` virš 0,5 | - |
| **handbrake** | `handbrake` virš 0,2 | - |
| **airborne** | `airborne` virš 0,5 | - |
| **hit**, **crash** | žr. [Smūgiai ir avarijos](#hits-and-crashes) | greitis, kurį smūgis atėmė |

Dreifo kampo minimumai pagal paviršių: asfaltas **7°**, mišri **10°**, biri ir sniegas **15°**, ledas **10°**. Automobilis, kuris paprastai slysta labiau - arkadinis padangos modelis, žvyro specialistas - turi savo, aukštesnę ribą pagal savo ratus (1,5 × jo įprotis).

**Kuria kryptimi automobilis sukasi** (dėl „prieš posūkį"): kelio, kuriuo ratas važiavo, krypties pokytis per ±6 m (bent 2 tinklelio taškai); griežčiau nei 600 m spindulys laikoma posūkiu; dešinė ar kairė priklauso nuo to, ar pasaulis veidrodinis. Vairas yra **prieš** posūkį, kai abs(vairas) > 0,05 ir jo ženklas priešingas posūkiui - slydimas **sugaunamas** priešingu vairu.

**Pedalai pradžioje** (`pedal`): *stabdymas*, kai stabdys virš 0,1; *akceleratorius* virš 0,3; *atleista*, kai akceleratorius buvo virš 0,5 per 8 tinklelio taškus (16 m) prieš tai; kitu atveju *ritinys* (arba nėra akceleratoriaus kanalo).

## Palyginta su kitu ratu {#laid-against-the-other-lap}

Kiekvienas įvykis vertinamas pagal ratą, su kuriuo lyginamas pasirinktas ratas tame ruože (geriausias jo klasėje; pačiam tam ratui - tos klasės ratas, kuris ruože buvo greičiausias):

1. **Kiek toli nuvažiavo kitas ratas** tais pačiais metrais, ±8 m: kito rato savi tos pačios šeimos įvykiai (apsisukimas skaičiuojamas kaip perteklinis pasukamumas, avarija kaip smūgis), išmatuoti tais pačiais vienetais, be ribų, naudojant kito automobilio padangų kreives.
2. **Bendras**, kai kitas ratas nuvažiavo **80%** ar daugiau: tai tiesiog taip įveikiamas posūkis, o ne klaida. Ne klaidų rūšys visada yra „bendros".
3. **Kaina** nebendrai klaidai, kuri kainuoja bent **0,02 s**: laikas, kurį šis ratas prarado prieš kitą nuo 5 m prieš įvykį iki **40 m po jo** (smūgiui ar avarijai - kol automobilis atgauna greitį: metrai, kuriuos reikia nuvažiuoti, kad atgautų jį pagal savo traukos jėgą, 40–400 m; be išmatuotos traukos - 5 m/s²). Niekada neigiama.
4. **Greitis, atiduotas automobilio ribai**: užsiblokavimui - lėtėjimas, kurį automobilis gali padaryti tuo greičiu, minus tai, ką jis padarė, sumuota per įvykį; buksavimui - visa jo akceleratoriaus trauka minus tai, ką jis padarė; smūgiui - greitis, kurį smūgis atėmė. Nurodoma, kai viršija 0,5 m/s (1,8 km/h).

Nebendra klaida, kuri kainuoja bent **0,02 s**, įtraukiama į sąrašą ([kurso statistika](race-course-statistics.md) skaičiuoja tik klaidas, kurios kainuoja **0,03 s** ar daugiau, kad klaida, suskaičiuota daugelyje ratų, būtų aiški), ir gali tapti posūkio praradimo priežastimi (žr. [Posūkis po posūkio analizė](race-corner-analysis.md#car-control-faults-and-impacts)).

## Smūgiai ir avarijos {#hits-and-crashes}

`impacts.ts` nuskaito smūgius iš paties rato **mėginių**, prieš juos perskaičiuojant - smūgis baigiasi per šimtąsias sekundės. Padangos negali sukurti smūgio jėgų, todėl smūgis matuojamas pagal paties rato automobilį:

- **Jo sukibimas `G`**: horizontalaus pagreičio `√(lat² + long²)` 99-asis procentilis per visą ratą, ant žemės ir greičiau nei 5 m/s. Be pagreičio kanalų (arba žemiau 3 m/s²) - 15 m/s², kelinio automobilio sukibimas.
- **Riba**: `max(1.8 G, G + 18, 30)` m/s².
- **Smūgio mėginys**: horizontalus pagreitis virš ribos *ir* šokteli daugiau nei pusę `G` nuo ankstesnio mėginio; **arba** greitis per 0,1 s krenta daugiau, nei riba reikštų per 0,1 s plius 1,5 m/s. Tik ant žemės ir stabiliai, ir tik kai automobilis važiavo greičiau nei 5 m/s.
- Smūgio mėginiai per **0,4 s** yra vienas smūgis.
- **Prieš / po**: didžiausias greitis 0,15 s prieš; mažiausias iki 0,3 s po paskutinio smūgio mėginio.
- **Ne smūgis**: greitis dingo be jėgos - didžiausias horizontalus pagreitis per 0,1 s žemiau didesnio iš `G` ir 25 m/s² yra žaidimo atsukimas ar automobilio atstatymas.
- **Avarija**, kai automobilis prarado **30 km/h** ar daugiau arba prarado daugiau nei pusę greičio; kitu atveju **smūgis** - trenkimas, įbrėžimas palei sieną.
- **Kryptis**: išilginis pagreitis didesnis už šoninį ir neigiamas: *priekiu*; teigiamas: *iš galo*; šoninis didesnis: *palei šoną*. Be pagreičių - priekiu.

Tai, ką automobilis gali, matuojama be visų smūgių, nuo 0,1 s prieš jį iki 1 s po jo (`struckMask`).

## Tekstai {#the-texts}

Kiekvienas įvykis aprašomas paminint abu ratus, nurodant, kur (metrais nuo nuorodos), greitį, kuriuo prasidėjo, kiek viršyta riba, palyginti su kitu ratu, ir patarimą. Patarimas priklauso nuo rūšies ir to, kas išmatuota:

| Įvykis | Patarimas |
|---|---|
| užsiblokavimas, tik priekiai | užblokuoti priekiniai ratai nevairuoja: mažiau slėgio zonos pradžioje, nuleiskite jį į posūkį |
| užsiblokavimas, tik galai | užblokuotas galas leidžia automobiliui pasisukti: tiesiai stabdykite daugiau, įsukdami atleiskite; perkelkite balansą į priekį, jei kartojasi |
| užsiblokavimas, biri danga | užblokuotas ratas aria toliau: spauskite iki pat užsiblokavimo |
| užsiblokavimas, kitaip | per daug pedalo tokiam sukibimui: spauskite laipsniškiau |
| buksavimas | pridėkite akceleratorių, kai vairas atsisuka atgal; trumpai perjunkite pavaras, kai trauka ribota (birioje dangoje aukštesnė pavara suminkština sukimo momentą) |
| apsisukimas / perteklinis pasukamumas | pagal pedalą: po stabdymo (per stiprus stabdymas posūkyje, per ankstyvas žeminimas), atleista (atleidimo perteklinis pasukamumas: laikykite pastovų akceleratorių), ant akceleratoriaus (per daug, kol dar pasukta), joks (įsukta per greitai); „sugauta priešingu vairu", kai pasukta priešinga kryptimi; biri danga ar ralis: „tam tikras kampas yra greitas kelias - kito važiavimo buvo pakankamai" |
| nepakankamas pasukamumas | daugiau vairo nieko nepadeda, kai priekis jau paslydo: atvažiuokite lėčiau, šiek tiek stabdykite, kad apkrautumėte priekį, atsukite; biri danga - pasukite automobilį su atleidimu ar lengvu kairės kojos prisilietimu |
| smūgis / avarija | palei šoną: metras tarpo kainuoja mažiau nei įbrėžimas; iš galo: kitas automobilis ar slydimas atgal; avarija priekiu: stabdykite anksčiau; smūgis priekyje: kažko palietėte. „X ten taip pat trenkėsi.", kai bendras |

Trackmania atveju slydimas dar sako: žemiau maždaug **400 km/h** (**300** birioje dangoje: purvas, žolė, plastikas) slydimas duoda mažiau traukos nei sukibimas; virš to greičio slydimas tinkamu kampu duoda pelno, o šis kainavo laiko, todėl jo kampas buvo netinkamas.

## Ką leidžia kiekvienas šaltinis {#what-each-source-allows}

| Ratai turi | Užsiblokavimas / buksavimas | Perteklinis pasukamumas / apsisukimas | Nepakankamas pasukamumas |
|---|---|---|---|
| kiekvieno rato slydimo santykį ir slydimo kampą, automobilio greitį (Forza Data Out, AC žaidimai) | iš slydimo | iš dreifo kampo arba galinio rato slydimo kampo | iš slydimo kampų |
| ratų greičius, pasaulio greitį (ralio žaidimai, BeamNG) | iš išvestinio slydimo | iš išvesto dreifo kampo | iš vairo pagal kreivumą |
| `yaw` ir posūkio greitį, be slydimo (iRacing) | - | iš dreifo kampo (pritaikytas `yaw` prieš judėjimo kryptį); iš posūkio greičio su priešingu vairu tik tada, kai `yaw` negalima pasitikėti | iš vairo pagal kreivumą |
| tik kryptį | - | iš krypties ir judėjimo | iš vairo pagal kreivumą |
| vien FH Companion rato failą (be `yaw`, be slydimo) | - | - | iš vairo pagal kreivumą (yra vairas ir pagreičiai) |

Smūgiams ir avarijoms reikia tik greičio (geriau su pagreičiais), todėl kiekvienas šaltinis jų turi. Skyrius **Automobilio valdymas** rodo, ką leidžia kiekvienas šaltinis: su vien FH Companion rato failu - jo stumimus iš vairo ir smūgius, ir užuominą įkelti `.tele.gz` likusiam.

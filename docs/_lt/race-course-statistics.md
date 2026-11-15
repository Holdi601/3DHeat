---
title: "Trasos statistika"
parent: "Lenktynių analizė"
nav_order: 57
lang: "lt"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Trasos statistika

Įkėlus daug vienos trasos ratų, peržiūra suskaičiuoja klaidas: kuris posūkis
atima daugiausia laiko, kiek ratų ten nepavyko ir kodėl. Naudokite ją, kad
rastumėte posūkį, kurį verta treniruoti.

Išbandykite: **Demonstraciniai ratai** duoda tris ratus - to pakanka, kad
šis skyrius pasirodytų.

![Trasos statistika su klaidų žemėlapiu: trasa nudažyta pagal tai, kiek ratų kiekviename posūkyje prarado laiko, ir posūkių sąrašas](../assets/img/en/race-course-mistake-map.webp)

Įkelkite visą trasos aplanką - dešimtis ratų, kelis automobilius, kelias
našumo klases - ir kiekvienas ratas įvertinamas, tada suskaičiuojamas. Šis
puslapis aprėpia palyginimą pagal klasę, ką laikome klaida, skyrių **Trasos
statistika**, klaidų žemėlapį, šilumos žemėlapio eksportą, trasas iš kelių
trasų ir našumo ribas, kai ratų daug.

## Lyginama su geriausiu savos klasės ratu {#against-the-best-of-its-own-class}

Ratas lyginamas posūkis po posūkio su **greičiausiu pilnu savo našumo klasės
ratu** (etalonu, etalono klasėje); tas pats ratas lyginamas su tuo, kas jo
klasėje per kiekvieną posūkį buvo greičiausias, o jei jis vienas savo klasėje -
su visais ratais. Automobiliai grupuojami pagal žaidimo našumo klasę (Forza
atveju nuo D iki X; C ir S2 yra du iš jų). C klasės automobilio stabdymo taškas,
lyginamas su S2 automobilio, nieko nesako apie vairavimą. Laiko žemėlapis,
spragos ratų sąraše ir lentelė *Posūkis po posūkio* seka tą patį palyginimą
(žr. [su kuo lyginamas kiekvienas ratas](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statistika sudaroma remiantis kiekvieno rato analize, o ne šalia jos.

## Kas laikoma klaida {#what-counts-as-a-mistake}

**Atvejis** - vieno rato klaida viename posūkyje (segmente). Rato klaidos
posūkyje yra:

1. **Vairavimo priežastis**, kurią analizė rado jo nuostoliui ten - radinys,
   kuris yra nuostolis ir priskiriamas vairuotojui (ne automobiliui ar aplinkybei),
   kainuojantis **0,05 s** ar daugiau, palyginus su jo lyginamuoju ratu. Jos kaina -
   posūkio nuostolis.
2. **Kiekviena automobilio valdymo klaida**, kurią jis ten padarė, o kito rato
   nepadarė (nesidalinama), kainuojanti **0,03 s** ar daugiau - užblokavimas,
   ratų slydimas, galinio galo išslydimas, stūmimas, sukimasis. Jos kaina - paties
   įvykio.
3. **Kiekvienas smūgis ir avarija**, bendras ar ne, kad ir kiek kainuotų.

Viename posūkyje jų gali būti keli; kiekviena rūšis suskaičiuojama **vieną kartą
kiekvienam ratui ir posūkiui**. Pelnas, automobilio dalis ir lėtesnis atvykimas,
lemtas ankstesniame posūkyje, klaidomis nelaikomi.

### Nuo radinių iki klaidų {#from-findings-to-mistakes}

| Radinys | Klaida |
|---|---|
| per greitai įvažiuota, lėtai išvažiuota, nes stabdyta keliais metrais vėliau nei kito | Stabdyta per vėlai |
| stabdyta anksti | Stabdyta per anksti |
| stabdyta švelniai | Stabdyta per švelniai |
| priežastimi - ratas užblokuotas | Užblokavo ratą |
| riedėta | Riedėta |
| yra rezervo sukibimui, lėčiau iki viršūnės, stabdyta ten, kur kitas tik atleido gazą | Per lėtai per vidurį |
| per siaura linija | Per siaura linija |
| nustumta į plotį | Nustumtas į plotį |
| automobilis pasuktas mažiau / per daug | Pasuktas automobilis netinkamai |
| dujos įjungtos vėliau, pilnas gazas vėliau, dvejota | Dujos įjungtos vėlai |
| išvažiuota lėčiau | Lėčiau išvažiuota |
| ratų slydimas | Ratų slydimas |
| galas išslydo, per vidurį šonu | Galas išslydo |
| nuvažiavo į plotį | Nuvažiavo į plotį |
| nuslopinta greitis | Nuslopintas greitis |
| atleista (įvažiuojant ar tiesiojoje) | Atleista |
| priežastimi - beveik sustojimas, sukimasis, smūgis ar avarija | Pasisuko / Atsitrenkė į ką nors / Avarija, kai ratas tai parodo (pirmiausia avarija, tada sukimasis, tada smūgis); kitu atveju - Beveik sustojo |
| ilgesnis skrydis | Nuskrido per toli |

Abu modeliai skaičiuojami pagal jų viduje rastą priežastį, pagal tą pačią
lentelę. *Įvažiuojant atiduota daugiau, nei išvažiuojant atgauta* - tai jo
įrašo priežasties klaida: anksti stabdyta yra *Stabdyta per anksti*, užblokavimas
*Užblokavo ratą*, riedėjimas *Riedėta*, nepanaudotas sukibimas *Per lėtai per
vidurį*. *Per greitai įvažiuota, lėtai išvažiuota* yra *Stabdyta per vėlai*,
jei ratas stabdė vėliau nei kitas; kitu atveju - jo išvažiavimo priežasties
klaida: *Dujos įjungtos vėlai*, *Ratų slydimas*, *Galas išslydo*, *Nuvažiavo į
plotį*, *Lėčiau išvažiuota*. Modelis, kurio priežastis - automobilio, arba
lėtesnis atvykimas, neskaičiuojamas.

Neskaičiuojama: lėtesnis atvykimas, startas, kiekvienas *automobilio* radinys
(trauka, sukibimas, stabdžiai, varymas) ir kiekvienas pelnas ar lygio posūkis.

### Rūšys ir jų tvarka {#the-kinds-in-their-order}

Stabdymas: *Stabdyta per vėlai*, *Stabdyta per anksti*, *Stabdyta per švelniai*,
*Užblokavo ratą*. Įvažiavimas: *Riedėta*, *Per lėtai per vidurį*, *Per siaura
linija*, *Nustumtas į plotį*, *Pasuktas automobilis netinkamai*. Išvažiavimas:
*Dujos įjungtos vėlai*, *Lėčiau išvažiuota*, *Ratų slydimas*, *Galas išslydo*,
*Nuvažiavo į plotį*, *Nuslopintas greitis*. Tiesioji: *Atleista*. Incidentai:
*Pasisuko*, *Atsitrenkė į ką nors*, *Avarija*, *Beveik sustojo*, *Nuskrido per toli*.

## Skyrius Trasos statistika {#the-course-statistics-section}

Rodoma nuo **3** ratų, tarp **Ratai** ir **Kur tobulėti**.

- **Santrauka**: „40 ratų 9 automobiliais, 3 klasės: kiekvienas posūkis įvertintas
  lyginant su greičiausiu savos klasės ratu." (automobiliai suskaičiuojami pagal
  numerį ar pavadinimą).
- **Klasių žymės** (kelioms klasėms): **Viskas** ir po žymę kiekvienai klasei,
  kiekviena su savo ratų skaičiumi, žaidimo tvarka (D, C, B, A, S1, S2, R, X, tada
  kitos). Spustelėkite klasę - matysite tik jos ratus; **Shift+spustelėjimas**
  prideda arba pašalina vieną. Viskas žemiau - sąrašai, žemėlapis, šilumos žemėlapio
  eksportas - seka pasirinktas klases.
- **Kas dažniausiai nepavyksta**: kiekviena klaidos rūšis, pirma ratai su daugiausia
  atvejų (tada daugiausia kartų, tada didžiausia kaina), ne daugiau kaip 8 (**Visi N
  tipų** parodo likusias, **Mažiau** jas vėl paslepia). Kiekvienoje eilutėje: pavadinimas,
  „N iš M ratų", tos dalies juosta ir „K kartų · apie X s · dažniausiai T3 (5), T7 (4),
  T1 (2)" - kiek kartų ji padaryta (ratas pagal posūkį), kiek viso kainavo ir trys
  posūkiai, kuriuose ją padarė daugiausia ratų. **Spustelėkite eilutę**, kad ji būtų
  rodoma klaidų žemėlapyje (ir žemėlapis įjungiamas); dar kartą spustelėkite - visos
  klaidos.
- **Posūkis po posūkio** (arba *Posūkis po posūkio - <klaida>*, kai pasirinkta viena):
  kiekvienam segmentui „N iš M prarado laiko · X s" - ratai, kurie įveikė visą posūkį,
  tie, kurie ten prarado **0,05 s** ar daugiau, palyginus su savo klasės geriausiu, ir
  visas jų prarastas laikas. Sulankstytas jis rodo tris dažniausias klaidas su ratų
  skaičiumi. **Spustelėkite posūkį**, kad jį atidarytumėte, įrėmintumėte kamera ir
  perjungtumėte į klaidų žemėlapį: kiekvienai klaidai (ar tik pasirinktai) eilutė, pvz.
  „12 iš 40 ratų čia stabdė per anksti. 9 skirtingais automobiliais - apie 0,21 s
  kiekvienas." ir ratai, kurie ją padarė, **blogiausi pirmi**, kiekvienas su savo kaina -
  ne daugiau kaip 8, likusiems „+N daugiau". **Spustelėkite ratą**, kad jį fokusuotumėte
  ir atkurtumėte tą klaidą (sulygiuota 40 m prieš ją).
- **Rodyti šilumos žemėlapyje**: žr. žemiau. „Kuriamas šilumos žemėlapis…", kol vyksta;
  išjungtas, kai klaidų nėra.


## Klaidų žemėlapis {#the-mistake-map}

**Rodymas → Klaidų žemėlapis** išilgai etaloninio kelio nudažo, kiek ratų (pasirinktų
klasių) padarė klaidą kiekviename metre - visų rūšių arba statistikoje pasirinktą vieną.
Kiekvienas ratas skaičiuojamas vieną kartą metre; kiekvieno atvejio ruožas (kur buvo jo
priežastis ar įvykis) praplatinamas po 6 m abiejose pusėse, kad trumpas atvejis matytųsi.
Plačiau ir ryškiau ten, kur daugiau ratų: plotis
`3 + 10 · (ratai čia / daugiausia ratų bet kur)` metrų, spalva nuo blankiai rudos iki
ryškiai oranžinės; kur klaidų nebuvo - pilka 2 m juostelė. Legenda: *mažai ratų ↔ daugiausia
ratų*.

Įjungus **Žymos**, kiekvienos posūkio viršūnė turi dažniausią savo klaidą:
„T3 · 12/40 stabdymas per anksti" (ratai, kurie ją padarė / ratai, kurie įveikė posūkį),
„T3 · 12/40", kai pasirinkta viena rūšis, „T3 · be klaidų", kai nepasirinkta nė viena.
Užvedus pelę ant žymos, išvardijami posūkio nuostoliai ir penkios dažniausios klaidos;
spustelėjus ją, posūkis statistikoje atidaromas arba uždaromas.

## Rodyti šilumos žemėlapyje {#show-in-the-heatmap}

**Rodyti šilumos žemėlapyje** perduoda tą patį šilumos žemėlapio skirtukui kaip duomenų
rinkinį pavadinimu „Klaidos trasoje <trasa>" (arba „Klaidos trasoje"), todėl visas šilumos
žemėlapio įrankių rinkinys - šilumos režimai, filtrai, laiko juosta, pjūviai - veikia su tuo,
kur ratai klysta.

Tai CSV, sukurtas atmintyje (`mistakeTable`), po vieną eilutę kiekvienam tinklelio taškui
(kas 2 m) kiekvieno atvejo metu, **to rato pačios pozicijos** tame taške:

| Stulpelis | Turinys |
|---|---|
| `x`, `y`, `z` | rato pozicija tame metre (žaidimo koordinatės) |
| `elapsed` | rato laikas ten, s |
| `lap` | rato žymė |
| `car` | automobilio pavadinimas (arba „car 1234") |
| `mistake` | klaidos pavadinimas dabartine kalba |
| `car_class` | klasė, `-`, kai jos nėra |
| `corner` | posūkio žymė, `T3` |
| `cost` | atvejo kaina, s |

Jis įkeliamas per pačios šilumos žemėlapio įkėlėją su susiejimo užuominomis: Y aukštyn, be
ašių apvertimų, mastelis 1; laikas `elapsed` sekundėmis; **asmuo** = `car`, **grupė** =
`mistake`, **sesija** = `lap`; be žiūros krypties; `car_class`, `corner` ir `cost` paliekami
kaip filtrų stulpeliai. Tada skirtukas perjungiamas į **Šilumos žemėlapis** ir įrėmina duomenis.
Eksportuojamos tik statistikoje pasirinktos klasės.

## Trasos iš kelių trasų {#courses-from-several-tracks}

Ratai analizuojami **po vieną trasą**. Aplankas su kelių trasų ratais - visa ratų biblioteka -
siūlo kiekvieną trasą įkelti atskirai (su jos ratų skaičiumi, daugiausia pirmiau); bėgimų,
kurie niekada nesibaigė (FH Companion `unfinished/`), ratai eina su savo trasa ir pažymimi
*dalinis*. Kelių pavadintų trasų ratai, pasirinkti kaip failai, siūlomi taip pat, o ratai be
trasos pavadinimo eina su tuo, kuris pasirinktas. Įkėlus kitos pavadintos trasos ratus nei
įkelti, jie pakeičiami. Išsamiau:
[Ratų įkėlimas](race-loading-laps.md#folders-and-courses).

## Našumas su daugybe ratų {#performance-with-many-laps}

Dešimtys ratų analizuojami per sekundę ar dvi (visi, visada). Piešiama ribojama, kad vaizdas
išliktų kadrų dažnio ribose:

| Riba | Reikšmė | Poveikis |
|---|---|---|
| pagal nutylėjimą piešiamų ratų | 8 (`SHOW_ALL_UP_TO`) | virš 8 įkeltų ratų naujai pridėti ratai paslepiami, nebent jie yra etalonas, fokusuotas ratas ar geriausias savo klasėje. **Rodyti visas** nubrėžia visus ratus; **Tik nagrinėjami** grąžina atgal. Fokusavus ratą, jis ir jo klasės geriausias vėl rodomi |
| paprasti automobiliai ir plonos linijos | daugiau nei 10 matomų (`PLAIN_PAST`) | ratai, išskyrus fokusuotą, vejamą automobilį ir etaloną: linijos taškas kas 6 m (vietoj 1,5 m), automobiliai piešiami paprastai |
| ratai diagramose | 8 (`CHART_LAPS`) | pirmiausia fokusuotas, jo klasės geriausias ir etalonas; „+N daugiau nubrėžta, diagramoje nerodoma" |
| HUD kortelės | 6 | pirmi šeši matomi ratai |
| statistika | nuo 3 ratų | skyrius paslepiamas žemiau šios ribos |
| išvardijami radiniai | 12 vairuotojo, 8 automobilio/konteksto, 10 pelnų | kiekvienam fokusuotam ratui |
| rodomos automobilių poros | 3 | daugiau nei 3 poros - viena pora su rinkikliu |

Klaidų atvejai apskaičiuojami vieną kartą kiekvienai analizei ir talpinami talpykloje; klaidų
žemėlapio tankis talpinamas talpykloje pagal klasių pasirinkimą ir klaidą.

## Kūrėjams {#for-developers}

Kodas: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` faile [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).


---
title: "Manevrai"
parent: "Įžvalgos"
nav_order: 4
lang: "lt"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manevrai: kaip grupės juda

**Įžvalgos → Manevrai** seka, kaip kiekvienos pusės vienetai juda *kaip grupės*,
ir pavadina manevrus, kuriuos jos atlieka: flangas, kleštys, proveržis,
pasala, pasitraukimas, raketų gynyba, „T" kirtimas. Prie kiekvieno nurodomas,
kiek tikras radinys, skaičiai, kuriais jis remiasi, ar jis pasiteisino, ir jo
atitikmenys doktrinoje bei istorijoje. **Masinė analizė → Manevrai** juos suskaičiuoja
per tūkstančius rungtynių: kaip dažnai kiekvienas manevras atliekamas pagal
žemėlapį, režimą ir pusę, ir kaip dažnai jis pasiteisina.

Viskas apskaičiuojama jūsų naršyklėje, savo darbiniame procese
(`src/insights/maneuver`); rungtynės su keliais šimtais vienetų trunka
10-500 ms, dviejų valandų oro karas su tūkstančiais objektų - apie sekundę.

## Naudojimas {#using-it}

- Atidarykite **Įžvalgos**, skirtuką **Manevrai**. Pirmą kartą atidarius jis
  suskaičiuoja; pakeitus filtrus spauskite **Ieškoti iš naujo**.
- **Tikras / Tikėtina / Galimas** nustato nurodomą patikimumą (pagal nutylėjimą - Tikėtina).
- **Laiko juosta** turi eilutę kiekvienai pusei ir juostelę kiekvienam manevrui;
  žemiau esantis **sąrašas** rodo tą patį pagal laiką. Spustelėjus perjungiama į
  pakartojimą jo pradžioje, kamera nuskrenda ten ir jį nubrėžia 3D: kiekvienos
  grupės kelias - rodykle (kleštių dvi rankos - jos lankais), grupių kontūrai
  svarbiausiu momentu (priešo - jo pusės spalva), priešo priekinė linija - balta linija.
  **Nubrėžti visus 3D** prideda kitus to paties mačo manevrus, blyškiai. Linijos
  grafikos kortai perduodamos vieną kartą, kai pasirinkimas pasikeičia, o ne kiekvieną
  kadrą: su 480 manevrų, nubrėžtų atkuriant, kadrų trukmė tikroje vaizdo plokštėje
  (WebGL2 ir WebGPU, p99 18,0-18,5 ms, didžiausia 19,5-20,8 ms) sutampa su kadrų
  trukme be jų.
- Atidarytas manevras rodo savo rezultatą (jį atlikusių vienetų nužudymus ir
  nuostolius, kol jis vyko ir tuoj po to, palyginti su pusės mainais per visas
  rungtynes), savo įrodymus ir žinių bazės įrašus apie jį - doktriną ir istorines
  paralelės (Kanai - kleštims, Sedanas 1940 - proveržiui, Cušima - „T" kirtimui,
  Operacija Bolo - klaidinamajam manevrui...).
- Mažoji lentelė gale: kiekvienam tipui ir pusei - atlikta ir pasiteisinusi.

![Kleštys sintetinėse demonstracinėse rungtynėse: abiejų rankų rodyklės, priešo kūnas ir jo priekinė linija](../assets/img/en/maneuvers.webp)

## Kaip randamos grupės {#how-groups-are-found}

Kiekvienas vienetas dedamas į bendrą laiko juostą (žingsnis - 1 s pėsčiomis, 2 s
kitaip, ilgesnis labai dideliems failams), sustabdomas virš mirties, kad atgimimas
nebrėžtų linijos per žemėlapį. Kiekviename žingsnyje vienetai vienos pusės ir vieno
tipo (lėktuvai, transporto priemonės, laivai, pėstininkai) susiejami, kai yra arti -
pėsčiomis 18 m, transporto priemonėms 170 m, laivams 3 km, lėktuvams 5 km - ir juda
panašiai (greičiai ne didesni nei pusė greitesniojo greičio, arba abu stovi). Klasteris
išlaiko tos grupės id, kurioje buvo dauguma jo narių. Vienetas be klasės priskiriamas
pėstininkams, transporto priemonei ar orui pagal greitį.

Grupės **forma** skaitoma pagal kryptį: kolona ar linija - pagal išsklaidymą išilgai
ir skersai, pleištas - kai vidurys veda, ešelonas - kai nariai atsitraukia į vieną pusę,
dėžė - kai jie laiko kampus.

Viskas įvertinama pagal rungtynių mastelį: **kovos nuotolis** `R` yra 75-asis procentilis
atstumo tarp naikintojo ir jo aukos (apribotas srities prasme), o manevro laikai skaliuojami
pagal vieneto tipą (pėstininkai - trečdalis žemės).

## Ką randa {#what-it-finds}

| Manevras | Randamas, kai |
|---|---|
| Formacija | grupė išlaiko vieną formą 60% judėjimo žingsnių per 30 s |
| Frontalinis puolimas | grupė artėja iš už nuotolio iki kontakto, ¾ R ar daugiau, iš 35° kampo į priešo kryptį |
| Flango ataka | tas pats iš 50-130° (užpakalyje - toliau); tikras tik su draugiška *fiksavimo jėga*, kuri ten kovoja su priešu (naikina abiem pusėm) |
| Kleštys | dvi vienos pusės flango atakos į tą patį priešo kūną iš priešingų pusių (100° ar daugiau tarp jų), per 90 s; tikras, kai rankos kovoja |
| Apsupimas | kompaktiška priešo grupė, kurią aplinkui yra bent tiek kitos pusės, per 1,5 R, iš dviejų ar daugiau grupių, be tarpo didesnio nei 100°, minutę, atkirsta nuo savo pusės; tikras, kai žiedas susispaudė iki ½ R ir kovojo su kišene |
| Prasiveržimas | grupė pereina laikomą liniją (priešai stovi 30 s ir kairėje, ir dešinėje nuo jos, jų pusės centras - už jų); tikras, kai ji įveikia ½ R, išbūna 20 s ir ten kovoja; proveržis - dar R toliau |
| Stebėjimo dengimas | mažoje grupėje dalis juda, o likusi stovi, vaidmenims keičiantis keturis kartus ar daugiau, su dengiančia ugnimi iš stovinčios dalies |
| Koncentracija / išsklaidymas | pusės dalis arti jos tankiausio taško kyla nuo 35% iki 60% (vienetai ateina 1,5 R ar daugiau, tada kontaktas) - arba krenta, kai pusė išsisklaido |
| Klaidinamasis manevras | mažas elementas kontakte traukia du ar daugiau priešų iš kitur; didesnė grupė tada smogia ketvirtį nuotolio toliau, kur priešo mažiau |
| Pasitraukimas / persekiojimas | grupė kontakte apsisuka ir atsitraukia R nuo vietos, kur kovojo; tikras, kai ten buvęs priešas ką tik nužudė vieną iš jos ir grupė atsitraukė 2 R nuo to naikintojo (pėsčiomis - niekada: žr. žemiau); priešai, judantys ta pačia kryptimi ir neatsiliekantys, persekioja |
| Gynyba gylyje | stovintys vienetai dviejose ar daugiau linijų per priešo ašį, R gylyje, priešui artėjant, ugnis iš linijų |
| Atvirkštinis šlaitas | trys ar daugiau nužudymų iš arti stovinčių vienetų, kurių aukos atėjo per kalvagūbrį |
| Pasala | judanti grupė susitinka su priešais, kurie stovėjo 45 s; jie šaudo pirmi ir judantieji praranda du ar pusę grupės |
| Ekranas | vienas ar du vienetai juda priekyje prieš tris ar daugiau vienetų kūną ir pirmi susitinka su priešu |
| Vidinės linijos | vienos pusės grupės arti viena kitos, tarp kitos pusės, jos vienetams perkeliantis tarp jų |
| Tempas | pusė atsako į kontaktą (posūkis, greičio pokytis, pirmas šūvis) 1,5 karto greičiau, Mann-Whitney p mažesnis nei 0,05 |
| Kreivas, įpjova, vilkimas, siurbimas | raketos paleidimo taikinys pasuka šaulį 35-70°, 75-105°, daugiau nei 140°, arba vilkia ir pasisuka atgal |
| Oro kleštys, siena, pirmasis-paskutinysis, malūnas | pora, besiskirianti į vieną priešą; trys greta prieš priešą; elementas 5-20 km už kito; du skrieja aplink vieną tašką per atstumą |
| Kovinis oro patrulis | skrieja aplink stotį tris minutes |
| Energijos / kampų kova | artimoje kovoje - kursai 30° skirtingi, kiekvienas iš eilės laiko kitą savo nosyje, arba tarp jų nužudymas - panaudojamas aukštis ir kylama, arba lygiai ir stipriai sukama lėtėjant; tikras, kai vienas nužudė kitą |
| Smūgio paketas, SEAD | oro grupė su mišriais vaidmenimis, dalis jų smogia žemei; oro gynybos nužudymai - prieš daugumą kitų žemės nužudymų |
| Mūšio linija, „T" kirtimas | trys laivai kolonoje; kolona stačiu kampu per priešo kolonos galvą |

Kiekvienas manevras nurodo, kuriuos žinių bazės **modelius** jis rodo
(`patterns-maneuver.ts`: formacija, frontalinis puolimas, dvigubas apsupimas,
apsupimas, prasiveržimas, ugnis ir manevras, klaidinamasis manevras, pasitraukimas,
persekiojimas, gynyba gylyje, ekranavimas, išsklaidymas, raketų gynyba, kampų kova,
kovinis oro patrulis, smūgio paketas, mūšio linija, „T" kirtimas) ir įrašus, kuriuos
reikia perskaityti pirmiausia; senesni įrašai naujus modelius perneša per
`knowledge/maneuver-tags.ts`. Žr. [Žinių lęšis](knowledge.md).

**Pasiteisino** palygina vienetų mainus, kol manevras vyko (ir minutę po to), su pusės
mainais per visas rungtynes: pasitraukimas pasiteisina, jei po posūkio prarasta mažiau
vienetų nei prieš jį; raketų gynyba - jei orlaivis išgyvena minutę; apsupimas - jei
kišenė praranda pusę.


## Per daugelį rungtynių {#over-many-matches}

Kiekvienų rungtynių santrauka (`src/mass/summarize.ts`, žr. [Masinė analizė](mass-analysis.md))
turi nedidelį `maneuvers` skyrių: kiekvienam tipui ir pusei - atlikta (ne mažiau kaip
Tikėtina), pasiteisinusi, nepasiteisinusi, nužudymai ir nuostoliai. **Masinė analizė → Manevrai**
jas sudeda per rungtynes, kurias palieka filtras, - pagal žemėlapį ir režimą arba visas
kartu - su pasiteisinusių dalies Wilsono intervalu; eilutė įkelia rungtynes, kuriose jis
buvo atliktas. Santraukos, parašytos prieš atsirandant šiam skyriui, jo neturi: paleiskite
`node tools/3dheat-summarize.mjs <aplankas> --force`, kad jį pridėtumėte.

## Kiek tai patikima {#how-sure-it-is}

Sintetinės rungtynės su įdėtais manevrais (`synth.ts`, paleidžia `maneuver.test.ts`): visi
28 įdėti tipai randami ne mažiau kaip Tikėtina; iš 50 praneštų manevrų 31 yra įdėto tipo, o
kiti 19 tikrai yra (judančios grupės formacija, prasiveržiančios kolonos frontalinis
artėjimas); nė vienas nėra klaidingas. Ant 30 nulinių rungtynių - atsitiktiniai pasivaikščiojimai
atskirai ir kartu, vienetai stovi atsitiktinai, orlaiviai skrenda tiesiomis atkarpomis, minia
klaidžioja - nieko nepranešama Tikėtina ar aukštesniu lygiu.

Realiuose duomenyse (dešimtys sausumos mūšių, keletas ilgų oro karo misijų, keliolika šaulio
rungtynių): frontaliniai puolimai, flangai, prasiveržimai ir apsupimai tankų mūšiuose; formacijos
ir arti kovos oro mūšiuose; raketų gynybos, kovinio oro patrulio orbitos ir pirmojo-paskutiniojo
poros oro karo misijose; frontalinės egzekucijos, kolonos ir keletas pasalų bei judančių porų
šaulio rungtynėse. Ribos - doktrinos formos žaidimo mastelyje; vieną radinį skaitykite su jo
įrodymais, o masinės lentelės rodiklius - su jų intervalais.

### Prieš nulinius modelius tose pačiose rungtynėse {#against-null-models-of-the-same-matches}

Detektorių gali apgauti žemė ir minia: mėsmalėje kiekviena grupė turi priešų visur aplinkui. Todėl
kiekvienas tipas paleidžiamas ir ant **nulinių modelių**, sudarytų iš tų pačių rungtynių (`nulls.ts`),
kur pusės jau nebesusitinka taip, kaip tikrai: vienos pusės laiko juosta pasukama trečdaliu ar dviem
trečdaliais rungtynių (*poslinkis*), arba jos trajektorijos pasukamos apie žemėlapio centrą
(*pasukimas*); ir komandų etiketės sumaišomos (*komandos*, kas pagal konstrukciją išlaiko apie pusę
tikrųjų kovų). Kovos skaičiuojamos tik kaip nužudymai, susieti su savo mirtimis - naikintojas
per 2 R ir auka vietoje; nulinis modelis tai sugriauna. Randa rungtynes Tikėtina ar aukštesniu lygiu,
tikras prieš nulinius modelius (30 tankų mūšių; 12 šaulio rungtynių):

| Tipas | Tankų mūšiai: tikras / poslinkis / pasukimas | Šaulys: tikras / poslinkis / pasukimas |
|---|---|---|
| Apsupimas | 0 / 0 / 0 (buvo 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Prasiveržimas | 0,03 / 0,02 / 0,05 (buvo 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flangas | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontalinis puolimas | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Pasitraukimas | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (todėl pėsčiomis niekada tikras) |
| Pasala | - | 0,17 / 0,04 / 0,04 |
| Energijos kova | 1,2 / 0,1 / 0,85 | - |
| Kampų kova | 0,6 / 0,07 / 0,3 | - |

Arti oro kovos virš mūšio lauko centro išlieka po posūkio apie tą centrą, todėl pasukimo stulpelis
jai mažiau palankus nei sausumos tipams. Tipai vienos pusės viduje - formacija, kovinis oro patrulis,
malūnas, smūgio paketas, SEAD, judėjimo dengimas, ekranas - nuo kitos pusės nepriklauso ir šiuo būdu
nėra tikrinami. `maneuver.test.ts` patikrina, kad nuliniai modeliai pašalina įdėtus flangą, kleštį,
apsupimą, prasiveržimą, pasalą ir pasitraukimą iš sintetinių rungtynių.

## Apribojimai {#limits}

- Grupėms reikia pozicijų laike; failas su vien įvykiais jų neturi.
- Kryptis iš duomenų nenuskaitoma: priešo priekinė linija yra ten, kur fiksavimo jėga su juo kovoja,
  kitaip - kur jis juda, kitaip - kur atėjo puolėjas.
- Reljefas skaitomas iš vienetų pačių aukščių (atvirkštinis šlaitas); regėjimo linijos tikrinimo nėra.
- Labai dideli failai imami su ilgesniais žingsniais; trumpi oro manevrai juose vis tiek skaitomi iš
  2-4 s žingsnių.


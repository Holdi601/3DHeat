---
title: "Artimas kontaktas ir raundai"
parent: "Įžvalgos"
nav_order: 2
lang: "lt"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Artima kova ir raundai

Šaudyklėms, žaidžiamoms raundais (pirmiausia Counter-Strike, bet kokiems duomenims su raundais, pusėmis ir nužudymais), Įžvalgos matuoja, kaip kovos buvo laimėtos: kas laimėjo pirmuosius dvikovius ir kiek jie vertėjo, ar mirtys buvo sukeistos, ar žaidėjas, įėjęs į kampą, nugalėjo tą, kuris jį laikė, ar kryžminė ugnis ir blyksniai atsipirko, kaip raundo šansai kito su kiekvienu nužudymu ir kuriose duryse buvo nužudyti į jas įeinantys žaidėjai. Naudokite ją, kad matytumėte, *kodėl* raundai laimėti, o ne tik kas paėmė nužudymus.

Matai kyla iš kambarių valymo ir miesto doktrinos (mirtinos piltuvėlio, dominavimo taškų, kryžminės ugnies) ir iš esporto bei sporto analitikos (laimėjimo tikimybės, veiksmų vertės, koreguoto pliuso-minuso). Kiekvienas skaitomas per [žinių lęšį](knowledge.md) ir cituojamas.

## Išbandykite {#try-it}

1. Įkelkite vienas ar daugiau rungtynių su raundais (CS2 konvertavimas turi visa, ko reikia).
2. Atidarykite **Įžvalgos** ir spauskite **Rasti įžvalgų**.
3. Pagal **Lęšio rodikliai** perskaitykite eilutes nuo *Raundo laimėjimo tikimybė* iki *Žaidėjo įtaka*; kiekviena turi savo skaičius, 95% intervalą, q reikšmę ir šaltinius, kuriais remiasi.
4. Pasirinkite lęšį **E. sportas** arba **Miesto kova**, kad perskaitytumėte jas per tą literatūrą; **Rašyti su DI** siunčia jas kartu su ataskaita.

## Ką matuoja {#what-it-measures}

| Matas | Ką sako | Kaip |
|---|---|---|
| Raundo laimėjimo tikimybė | Kiek tikėtina, kad kiekviena pusė laimės raundą kiekvienu momentu | Logistinė regresija pagal kiekvienos pusės gyvus žaidėjus, bombą ar tikslą ir jo laiką, raundo laikrodį ir pirkimą, pritaikyta prie įkeltų duomenų; kalibravimas tikrintas už rinkinio ribų pagal raundą (Brier balas ir įgūdis, log nuostolis, kalibravimo paklaida dešimtyje intervalų, perkalibravimo nuolydis, AUC) |
| Veiksmų vertė | Kiek nužudymas, pirmasis nužudymas, sukeitimas, nužudymas už blyksnio, įdėjimas ar blyksnis pakeitė pusės galimybę laimėti | Laimėjimo tikimybė po minus prieš; sukeitimai, pirmieji ir apakinti nužudymai tikrinami prieš kitus nužudymus permutacijos būdu |
| Pirmieji dvikoviai | Kuri pusė laimi pirmą dvikovį, kaip dažnai tai laimi raundą ir kur viena pusė laimi pradžias gerokai virš savo vidurkio | Wilsono intervalai; vietos pagal tikslų binominį testą prieš pusės dalį, q pagal vietas |
| Sukeitimai | Mirtys, į kurias atsakoma bendražaidžio nužudymu žudiko per 5 s, laikas, per kurį tai įvyko, ir laimėti raundai, kai pirmoji mirtis buvo sukeista | Fišerio tikslus testas, Newcombe'o intervalas |
| Lindintis prieš laikantį | Dvikoviai, kuriuose vienas žaidėjas įžengė į kovą (1,5 m/s ar daugiau per paskutinę sekundę), o kitas stovėjo (0,75 m/s ar mažiau): lindinčiojo dalis | Tikslus binominis testas prieš pusę |
| Taikymas prieš dvikovį | Kiekvieno žaidėjo žvilgsnis prieš kampą į kitą 0,75 s prieš nužudymą; kas taikė geriau ir kaip dažnai tas žaidėjas laimėjo; laikantys savo kampe (15° ribose) prieš nesančius jame; nužudymų nuotoliai | Tikslus binominis testas; Fišeris |
| Kryžminė ugnis | Laikantys su stovinčiu bendražaidžiu 25 m spinduliu nuo lindinčiojo, kurio linija į jį yra 35° ar daugiau nuo jų pačių, palyginti su vieni laikantys | Fišeris, Newcombe |
| Priemonės į įėjimus | Lindintys už savo pusės blyksnio (per 3 s ir 15 m) ar dūmų (per 18 s) prieš sausus lindimus; pirmi dvikoviai su blyksniu tik vienoje pusėje; apakinti aukai | Fišeris, binominis |
| Žmonių persvara | Kiekvienai gyvų žaidėjų būsenai (5 prieš 4, 4 prieš 5, 2 prieš 1...), pirmą kartą pasiektai raunde, - raundų dalis, laimėta iš jos | Wilsono intervalai |
| Clutch'ai | Raundai, kai pusė nusileido iki paskutinio žaidėjo: laimėjimai, palyginti su modelio numatytais laimėjimais, pagal priešininkų skaičių | Normalusis testas stebimo prieš numatomą |
| Kaupimai, rotacijos, slapstymasis | Didžiausia grupė 10 m spinduliu pirmo dvikovio metu (3 ar daugiau: sukrauta); žaidėjai toliau nei 30 m nuo pirmos kovos ar įdėtojo tikslo ir kaip greitai jie priartėja iki 12 m; laikas ir nužudymų ir mirčių šansai toliau nei 30 m nuo kiekvieno bendražaidžio | Fišeris; šansų santykis su Woolf'o intervalu |
| Po įdėjimo ir atkovojimas | Raundai, laimėti įdėjusios pusės, pagal skaičius įdėjimo metu, ir jos dalis dvikovių po įdėjimo | Wilsono intervalai |
| Mirtinos piltuvėliai | Įėjimai į kiekvieną vietą (vietos stulpelio pakeitimas, o jei jo nėra - 8 m langelio) ir mirtys per 2,5 s nuo įėjimo, palyginti su žemėlapio dažniu | Tikslus binominis testas, q pagal vietas; santykis sumažinamas su 20 įėjimų žemėlapio dažniu |
| Žaidėjo įtaka | Laimėjimo tikimybė, pridėta kiekvienam žaidėjui per raundą (nužudymai, mirtys, įdėjimai), sumažinta empiriniu Bayes'u; koreguotas pliusas-minusas pagal grubių raundų rezultatus prieš modelio pradžią; nužudymo vertė pagal vietą ir ginklą, sumažinta | Bauda parinkta penkių dalių kryžminiu patikrinimu |

Visi vienos analizės testai dalijasi vieną klaidingų atradimų dažnį (Benjamini-Hochberg), įskaitant visas išbandytas vietas, ne tik rodomas; rodomas q yra pagal visas jas. Modelis ir jo kalibravimas pritaikomi prie įkeltų duomenų, todėl apibūdina tą populiaciją: profesionalus modelis klysta atsitiktiniame žaidime, ir atvirkščiai.

Patikrinta sintetiniais raundais su įdėtais poveikiais (lindinčiojo pranašumas, kryžminė ugnis, blyksniai, viena mirtina piltuvėlis, geresnis taikymas laimi), ir 100 duomenų rinkinių su tais pačiais raundais be jų, kuriuose klaidingų atradimų dažnis įdėto poveikio testams turi likti nominalūs 5% (tam tikrame intervale) (`src/insights/cqb/cqb.test.ts`); apie tūkstantį tikrų raundų modelis gavo Brier balą 0,14 prieš 0,25 bazinio dažnio, kalibravimo paklaidą 0,03 ir perkalibravimo nuolydį 1,0.

## Reikalingi duomenys {#data-it-needs}

- **laiko**, **žaidėjo**, **pusės** ir **raundo** (sesija) stulpeliai, o įvykių stulpelyje - nužudymai ir mirtys; raundai, kuriuose niekas nemiršta du kartus, laikomi pašalinimo raundais (žmonių persvarai, clutch'ams ir modeliui jų reikia);
- **kitos šalies** stulpelis (`other`, `victim`, `killer`, `attacker`), nurodantis auką nužudymo metu ir žudiką mirties metu (be jo nužudymai ir mirtys tuo pačiu momentu sujungiami poromis);
- **žiūros kryptis** taikymo matams;
- neapdorotas `event` stulpelis, nurodantis `flash`, `smoke`, `he`, `molotov`, `plant` ir `defuse` priemonėms ir įdėjimams;
- `won` (eilutės pusė laimėjo raundą), `place` (pavadinimai), `weapon`, `buy` ir `state_flashed`, kai duomenys jų turi.

Pozicijos turėtų būti imamos kelis kartus per sekundę; greičiai, taikymas ir kryžminė ugnis skaito paskutines dvi sekundes prieš kiekvieną mirtį.

## Suskaidyme {#in-the-breakdown}

[Suskaidymas](breakdown.md) keturias situacijas matuoja kaip veiksnius, su ir be: *apakintas*, *mirtis sukeista*, *pirmasis dvikovis* ir skaičiai (*persvara*, *lygūs skaičiai*, *trūksta*), kiekvienas pagal K/D, laimėtus raundus, išgyvenimą ir nužudymus per minutę.

## Daug rungtynių {#many-matches}

Kiekviena rungtynių santrauka iš [daugelio rungtynių analizės](mass-analysis.md) duomenų su raundo stulpeliu turi tuos pačius matus kaip skaičius (`cqb` santraukoje): pirmieji dvikoviai, sukeitimai, lindimai, kryžminė ugnis, įėjimai su blyksniais, taikymas, žmonių persvara, įdėjimai ir 40 dažniausiai įeinamų vietų su jų įėjimais ir mirtimis. Skaičiai sudedami per rungtynes, todėl tūkstantis rungtynių duoda tas pačias dalis, kaip viena didelė analizė. Skydelio skirtukas **Artima kova** rodo jas kaip dalis su intervalais, per visus žemėlapius arba pagal žemėlapį; spustelėjus eilutę įkeliamos rungtynės, iš kurių ji atėjo.

## Kūrėjams {#for-developers}

`src/insights/cqb/`: `walk.ts` (vienas perėjimas per eilutes laiko tvarka, raundai laikomi atskirai, dvikoviai įrašomi su savo būsena), `finish.ts` (matai ir kiekvienų rungtynių skaičiai), `model.ts` (logistinė regresija per IRLS, kalibravimas, kalnagrąžos (ridge) regresija per jungtinių gradientų metodą, empirinis Bayes'as, Fišeris, Newcombe, permutacijų testai), `run.ts` ir `worker.ts` (peržiūra: savas darbuotojas, šalia įžvalgų perėjimo), `summary.ts` (daugelio rungtynių santraukos kolektorius), `factors.ts` (suskaidymo situacijos), `shows.ts` (ką skaito lęšis), `synth.ts` (testiniai raundai). Žinių įrašai yra `src/insights/knowledge/cqb.ts`, šablonai - `patterns-cqb.ts`. Rezultatai ataskaitoje įrašomi kaip `lens.cqb`.


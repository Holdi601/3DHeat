---
title: "Failų įkėlimas"
parent: "Duomenų įkėlimas"
nav_order: 1
lang: "lt"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Failų įkėlimas

Šiame puslapyje parodoma, kaip 3DHeat perduoti savo failus ir ką su jais daro. Nutempkite aplanką - ir
jis parenka failus, kuriuose yra pozicijos, ir sujungia juos į vieną vaizdą.

1. Atidarykite **Šaltinis** viršuje, šilumos žemėlapio šoninėje juostoje.
2. Nutempkite failus ar aplanką į nutempimo sritį arba spauskite **Failai…** ar **Aplankas…**.
3. Perskaitykite pasirinkimo eilutę ir **Atminties įvertį** (žr. paveikslėlį žemiau).
4. Spauskite **Įkelti**.

![Šaltinio skydelis nutempus dešimties rungtynių aplanką: 1 pasirinkimo eilutė, 2 Atminties įvertis - telpa, ir 3 Įkelti 10 failų](../assets/img/en/loading-files-source.webp)

*Nutempus aplanką, 3DHeat praneša, ką rado ir ar tai telpa.*

Failai įkeliami **Šaltinis** skydelyje šilumos žemėlapio skirtuko šoninės juostos viršuje. Viskas, pasirinkta
vienu metu, tampa **vienu** duomenų rinkiniu.

## Failų pasirinkimas {#choosing-files}

| Valdiklis | Ką daro |
|---|---|
| **Nutempkite čia failus arba aplanką** (nutempimo sritis) | Nutempkite bet kokį failų ir aplankų mišinį. Aplankai peržiūrimi rekursyviai. Spustelėjus nutempimo sritį atsidaro tas pats rinkiklis kaip **Failai…**. |
| **Vienas failas…** | Failo rinkiklis vienam failui. |
| **Failai…** | Failo rinkiklis, priimantis kelis failus. |
| **Aplankas…** | Aplanko rinkiklis (naršyklės `webkitdirectory` rinkiklis); siūlomas kiekvienas failas aplanko medyje. |

Rinkikliai priima failų tipus iš [įkeliamų failų sąrašo](data-formats.md#files). Trumpai: `.parquet`/`.pq`
skaitomi kaip Parquet, `.csv`/`.tsv`/`.txt` - kaip skirtukais atskirtas tekstas, `.acmi` (Tacview), OCAP
`.json`/`.json.gz` ir GPS formatai (GPX, KML, KMZ, NMEA, IGC, FIT) eina per savo skaitytuvus, o `.3dheat` rungtynių
konteineriai įkeliami kaip juose esančios lentelės ([Vienas failas - viena rungtynės](container.md)). Konteineris,
kurio nepavyksta perskaityti, praleidžiamas kaip *ne csv/parquet failas*.

Nutemptus aplankus peržiūrima iki 12 lygių gylio ir ne daugiau kaip 20 000 failų, kad būtų apsaugota nuo
simbolinių nuorodų ciklų ir begalinių medžių.

## Kurie failai paliekami {#which-files-are-kept}

Prieš skaitant ką nors, pasirinkimas filtruojamas ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Failas su kitu plėtiniu praleidžiamas: *ne csv/parquet failas*.
- Failas, kurio dydis 0 baitų, praleidžiamas: *tuščias (0 baitų)*.
- **Konverterių palydovai** - neapdoroti duomenys, kuriuos konverteris laiko šalia rungtynių lentelės,
  `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` ir kiti, išvardyti [Konverteriai saugo viską](converters.md),
  - praleidžiami: *konverterio palydovas*. Norint jį atidaryti, pasirinkite arba nutempkite jį atskirai (arba tik palydovus):
  pasirinkimas, kurį sudaro vien palydovai, įkeliamas kaip bet kuri lentelė. JSON šalia lentelės (`.match.json`,
  `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` ir `.hints.json`) niekada nesiūlomas kaip
  pozicijos.
- **Judėjimo failo taisyklė.** Jei bet kuris pasirinkto failo pavadinimas yra `movement*.parquet`, `movement*.csv` (ir kiti
  plėtiniai) - `movement.parquet`, `movement_1.parquet` ir t. t. - tai kiekvienas kitas duomenų failas praleidžiamas:
  *ne judėjimo failas, o šiame aplanke yra judėjimo failų*. Telemetrijos eksportai dažnai turi vieną pozicijų lentelę
  šalia dešimčių lentelių be pozicijų, ir tik pirmąją galima nubrėžti. Aplankas be jokio judėjimo failo įkelia visus savo
  duomenų failus. Pavyzdys: aplankas su `movement_1.parquet`, `kills.parquet` ir `shop.parquet` įkelia `movement_1.parquet`;
  kiti du išvardijami kaip praleisti. Pavyzdys: aplankas su `movement_1.parquet`, `kills.parquet` ir `shop.parquet` įkelia
  `movement_1.parquet`; kiti du išvardijami kaip praleisti.
- Likę failai surikiuojami pagal jų kelią pasirinkime, todėl tas pats aplankas visada duoda tą patį duomenų rinkinį ir tas
  pačias spalvas.

Tada skydelyje rodomas pasirinkimas (vieno failo pavadinimas arba `aplankas (N failų)` pagal ilgiausią bendrą aplanką),
failų skaičius, jų bendras dydis ir bendras eilučių skaičius - tikslus, kai visi failai yra Parquet, pažymėtas `≈`, kai
yra bent vienas CSV. Praleisti failai išvardijami su priežastimi, pirmi keturi - pagal pavadinimą.

## Schemos skaitymas {#reading-the-schema}

**Pirmasis** pasirinkimo failas atidaromas, kad būtų aprašyta schema („Skaitoma schema"): jo stulpelių pavadinimai, pirmosios
50 duomenų eilučių, kurie stulpeliai atrodo skaitiniai ir, Parquet atveju, kiekvieno stulpelio loginis tipas bei `heat3d`
poraštės įrašas. Vienos lentelės eksportų aplankas turi vieną schemą, todėl vienas failas atstovauja visiems. Tada išmatuojamas
kiekvienas failas („Skaičiuojamos eilutės"): Parquet poraštė duoda tikslų skaičių vienu mažu skaitymu; CSV skaičius įvertinamas
pagal vidutinį pirmo megabaito eilutės ilgį.

[Stulpelių susiejimo](column-mapping.md) skydelis atsidaro su automatiškai nustatytais spėjimais, o virš mygtuko **Įkelti**
pasirodo [atminties įvertis](memory-and-budgets.md).

## Pranešimai prieš įkeliant {#messages-before-loading}

Po pasirinkimu skydelis išvardija, pagal [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Klaidos** (raudonai) - įkėlimo negalima pradėti: mažiau nei dvi padėties ašys, ta pati kolona dviem ašims, susietas
  stulpelis, kurio nėra faile, padėties stulpelis, kuris neatrodo skaitinis, laiko stulpelis, kurio mėginių reikšmės yra tekstas,
  kai vienetas yra skaičius (kiekviena eilutė būtų skaitoma kaip NaN ir patektų į laiką 0), laiko stulpelis nustatytas į ISO-8601,
  bet nė viena jo mėginio reikšmė nesusiskaido kaip data, vieneto mastelis 0.
- **Įspėjimai** (gintaro spalva) - įkels, bet tikriausiai ne taip, kaip norėta: grupės stulpelis, kuris įgyja skirtingą reikšmę
  daugumoje mėginių eilučių (taigi tai id, o ne grupė), `DATE` laiko stulpelis (kiekviena dienos eilutė turi tą patį momentą),
  žiūros kryptis nustatyta be savo stulpelių.
- **Pastabos** - ką reiškia susiejimas: piešimas plokštumoje, kai viena ašis nesusieta, laiko juostos nėra be laiko stulpelio,
  takelių nėra be asmens stulpelio, o be grupės stulpelio - viena spalva viskam ir skirtumas, kuris gali skilti tik pagal
  stulpelį, paliktą filtravimui.

## Įkėlimas {#loading}

Mygtukas **Įkelti** rodo *Įkelti failą*, *Įkelti N failų* arba *Įkelti N failų (1 iš K)*, kai nustatytas [decimavimo žingsnis](memory-and-budgets.md#decimation).
Jis rodo *Per didelis - sumažinkite arba decimuokite* ir yra išjungtas, kai [talpos patikrinimas](memory-and-budgets.md#the-fit-check)
sako, kad įkėlimas netelps; jis taip pat išjungtas, kai susiejimas turi klaidų arba vyksta kitas įkėlimas.

Kraunant skydelyje rodomas dabartinis žingsnis (prieš jį `[failas/failai]`, kai failų keli), jau nuskaitytos eilutės, progreso
juosta ir **Atšaukti**. Atšaukimas nutraukia įvedimo darbuotoją, o kartu - visus analizatorių darbuotojus, kuriuos jis paleido.

Puslapis ir toliau piešia kraunant, nes darbas vyksta fone. Matote dabartinį žingsnį, nuskaitytas eilutes, progreso juostą ir
**Atšaukti**. Po paskutinio failo skydelis rodo žingsnius *Dedamos eilutės laiko tvarka*, *Perrikiuojami stulpeliai (n iš m)*,
*Matuojamas plotis*, *Kuriamas sąrašas*, *Apibendrinamos sesijos* ir *Skaičiuojamos gyvavimo trukmės*, tada *Keliamos N eilučių į GPU*
vienam kadrui, kad ilgas įkėlimas niekada nebūtų painiojamas su įstrigimu.

### Kaip tai veikia {#how-it-works}

Įkėlimas vyksta Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)) viduje.
Su keliais failais ir daugiau nei viena [analizavimo gija](memory-and-budgets.md#parser-threads), iki tiek failų analizuojama
**vienu metu**, kiekvienas savo analizavimo darbuotojuje ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)),
kiek leidžia RAM biudžetas; jie vis tiek sujungiami po vieną pasirinkimo tvarka, todėl duomenų rinkinys toks pat, kaip įkeliant
po vieną. Kol vyksta keli, progreso eilutėje nurodomas failas, kuris paskutinis pranešė, o juosta ir eilučių skaičius sudeda visus
vykstančius failus. Su viena gija arba vienu failu failai analizuojami vienas po kito pačiame įvedimo darbuotojuje. Skaitomi tik
susiejimo nurodyti stulpeliai: nesusietas Parquet failo stulpelis nekainuoja nieko; CSV nuskaitomas baitas po baito, bet
dekoduojami tik susieti laukai.

## Keli failai tampa vienu duomenų rinkiniu {#several-files-become-one-dataset}

Įkėlus daugiau nei vieną failą ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts),
[`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Vienas sąrašas.** Asmenys, grupės, sesijos ir kategorijų reikšmės yra žodynai, bendri visiems failams, todėl tas pats žaidėjas
  dviejuose eksportuose yra vienas asmuo su vienu takeliu.
- **Vienas laiko pradžios taškas.** Laikai sujungiant laikomi kaip 64 bitų sekundės ir perskaičiuojami pagal ankstyviausią *visos*
  pasirinkties laiką, tada saugomi kaip 32 bitų sekundės nuo to taško. Keturi eksportai iš keturių popiečių sudėliojami realia
  tvarka, o ne vienas ant kito.
- **Vienas laiko tvarka.** Visų failų eilutės surikiuojamos pagal laiką radikso rikiavimu (žr. [rikiavimo riba](memory-and-budgets.md#the-sort-ceiling)).
- **`Source file` stulpelis.** Kiekviena eilutė prisimena, iš kurio failo ji atėjo, kaip kategorijų stulpelis pavadinimu `Source file`.
  Jis atsiranda [Filtruose](filters.md) ir kaip *Source file - palyginti du įkėlimus* [skirtumo padalijime](difference.md). Vieno failo
  įkėlimas jo negauna - pastovus stulpelis kainuotų 4 baitus eilutei ir nieko nepasakytų.
- **Trūkstami stulpeliai.** Failas, kuriam trūksta vieno iš *filtro* stulpelių, tiesiog neprisideda reikšmių jam. Failas, kuriam trūksta
  susieto *vaidmens* stulpelio (X, laikas, asmuo, ...), nepavyksta su *failas neturi stulpelio „pavadinimas"*; kelių failų įkėlime
  tas failas praleidžiamas, o kiti vis tiek įkeliami, ir praleisti failai išvardijami duomenų rinkinyje. Vieno failo įkėlimas, kuris
  nepavyko, praneša klaidą.
- **Trūkumo įspėjimas.** Kai įkeltų eilučių yra mažiau nei 95% iš anksto suskaičiuotų eilučių, duomenų rinkinys turi įspėjimą su
  trūkstama dalimi - dėl neskaitomų failų arba dėl eilučių be tinkamos pozicijos, kurios atmetamos jau įvedimo metu.

## Po įkėlimo {#after-loading}

Naujas duomenų rinkinys pakeičia bet kurį ankstesnį. Kiekvieno įkėlimo metu ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- išvalomi visi filtrai ir grupių matomumas;
- skirtumo padalijimas pagal grupę atstatomas: pirmoji grupių pusė (suapvalinta aukštyn) teigiama, likusios - neigiamos;
- taškų spindulys nustatomas horizontaliam plotui / 120, o sodrumas - analitiniam įvertinimui; kubo dydis, žiūros spindulio ilgis,
  skrydžio greitis ir artimoji/tolimoji plokštumos nustatomos pagal plotį (žr. [Sesijos, asmenys ir grupės](sessions-persons-groups.md#entity-size));
- dėžės atkūrimo sesija nustatoma į sesiją su daugiausia eilučių;
- linijų šilumos keliai spėjami iš naujo ([Linijų šiluma](line-heat.md));
- rodinio režimas grįžta į **Šiluma**, jei dabartinis režimas nepalaikomas naujais duomenimis; laiko juosta grįžta į **Viskas**, jei nėra laiko stulpelio,
  o istorija - į **Kaupiamasis**, jei nėra gyvavimo trukmių;
- atkūrimo žymeklis pastatomas į pradžią, o atkūrimas sustabdomas;
- kamera įrėmina visą duomenų rinkinį iš numatytosios krypties (žiūrint išilgai -Z, pasvirus žemyn apie 36°).

Tada skydelyje **Duomenų rinkinys** rodomas duomenų rinkinio pavadinimas (pasirinkimas, eilučių ir failų skaičius bei žingsnis, jei jis buvo
naudotas), `N komandų · N asmenų · Ns trukmė`, ir visi įkėlimo sukelti įspėjimai gintaro spalva, tol kol duomenų rinkinys įkeltas.
**Iškelti** tame skydelyje pašalina duomenų rinkinį.


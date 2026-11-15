---
title: "Automobilių profiliai ir palyginimas"
parent: "Lenktynių analizė"
nav_order: 56
lang: "lt"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Automobilių profiliai ir palyginimas

Automobilis gali stabdyti, sukti ir greitėti tik tiek. Žiūryklė matuoja, kiek tiksliai, pagal jūsų paties ratus, todėl niekada nepasakys daryti to, ko jūsų automobilis negali. Tai taip pat parodo, kiek prarasto sekundės kaltas automobilis, o ne jūs.

![Palyginti automobiliai: du automobiliai šalia, su jų sukibimu, stabdymu ir trauka](../assets/img/en/race-cars-compared.webp)

Analizė liepia ratui stabdyti stipriau, išlaikyti daugiau greičio ar greičiau greitėti tik ten, kur jo automobilis tai parodė, ir iš nuostolio pašalina tai, ką paties automobiliai paaiškina. Todėl kiekvieno automobilio ribos (jo *apvalkalas*, žemiau) ir būdas (jo *profilis*) matuojami pagal kiekvieną jo įkeltą ratą. Šis puslapis aprašo apvalkalą, profilį, skyrių **Automobiliai palyginti** ir tai, ką automobiliai nulemia kiekviename posūkyje.

**Vienas automobilis** = ratai su tuo pačiu automobilio numeriu (arba pavadinimu, be numerio) ir tuo pačiu našumo indeksu: kitas nustatymas yra kitas automobilis.

## Apvalkalas: ką automobilis gali kiekvienu greičiu {#the-envelope-what-the-car-can-do-at-each-speed}

Kiekvienam automobiliui, per visus jo įkeltus ratus, **5 m/s greičio juostomis** (24 juostos, iki 120 m/s). Mėginiai ore, nusileidimo po 0,3 s stabilizavimasis ir viskas nuo 0,1 s prieš kiekvieną smūgį iki 1 s po jo yra išbraukiami, o pagreičiai 80 m/s² ar daugiau ignoruojami (viršija tai, ką išlaiko bet koks automobilis su prispaudimo jėga).

| Apvalkalas | Mėginiai | Reikšmė kiekvienoje juostoje | Reikia |
|---|---|---|---|
| **šoninis sukibimas** | šoninis pagreitis **išlaikytas pusę sekundės** (absoliučiosios reikšmės vidurkis per centruotą 0,5 s langą), tik kur automobilis posūkiavo: bent trečdalis viso jo 99-ojo procentilio | 95-asis procentilis | 6 mėginiai |
| **stabdymas** | stabdys > 0,3; išilginis pagreitis kaip kiekvieno mėginio ir jo dviejų kaimynų mediana | 95-asis lėtėjimo procentilis | 4 mėginiai |
| **traukos visu greičiu** | akceleratorius > 0,95, stabdys mažesnis nei 0,05; ta pati trijų medianos taisyklė | 90-asis procentilis | 4 mėginiai |

Kodėl išlaikytas pusę sekundės: bordiūras, slydimas, staigiai grįžtantis atgal, ar automobilis, kurį pagauna, akimirką išbaido šoninį pagreitį, o automobilis, kuris tai daro dažnai, atrodo sukimbesnis, nei yra. Kodėl trijų medianos: penkių metrų žingsniu vienas mėginys yra toli, o vieno mėginio šuolis yra bordiūras, duobė ar siena.

Skaitant apvalkalą tam tikru greičiu, reikšmės interpoliuojamos tarp juostų centrų, o tuščioje juostoje imama artimiausia juosta su duomenimis.

**Dviejų rūšių danga.** Kai automobilio ratai važiavo bent penktadalį savo mėginių kiekvienoje - asfalte ir biri dangoje, laikomas atskiras apvalkalas kiekvienai, o kiekvienas posūkis vertinamas pagal dangą po automobiliu jo lėčiausiame taške.

**Persidengimas.** Greitis, nuo kurio traukos jėga krinta kaip `1/v` (ribota galia), o ne išlieka plokščia (ribota sukibimo): pirmoji juosta, kurios `a·v` yra 15% ribose nuo didžiausio pastebėto `a·v`.

## Profilis: koks tai automobilis {#the-profile-what-kind-of-car-it-is}

`profile`, iš tų pačių ratų (mėginiai ant žemės, nesmogti, greičiau nei 8 m/s):

| Matas | Kaip |
|---|---|
| **išlaikomas sukibimas** (m/s²) | pusės sekundės išlaikyto šoninio pagreičio 95-asis procentilis |
| **trauka** iki 50 km/h, 50-120, 120-200, virš 200 (m/s²) | traukos visu greičiu apvalkalo vidurkis 3-14, 14-33, 33-56 ir 56-90 m/s, greičiais, kuriuos automobilis pasiekė (iki jo greičiausio + 2 m/s), iš bent trijų 1 m/s žingsnių; ir didžiausia pastebėta, ir kur |
| **stabdymas** (m/s²) | apvalkalo stabdymas, vidutiniškai nuo 60 iki 160 km/h (16,7-44,4 m/s), juosta, kurią įvardija palyginimas |
| **greičiausias** | didžiausias greitis, kurį pasiekė |
| **baigėsi ties** | kur jis nustojo įgauti greičio, visu greičiu tiesiojoje (žemiau) |
| **vis dar traukia greičiausiai** | apvalkalo trauka jo greičiausiu greičiu: kiek jam dar buvo likę |
| **galas paleistas, vienam ratui** | kiek kartų per ratą jis slydo ir reikėjo jį pagauti (žemiau) |
| **dalis ant akceleratoriaus** | iš jų - dalis, prasidėjusi su akceleratoriumi > 0,5 ir be stabdžio |
| **atleidžia ties** | išlaikyto šoninio pagreičio mediana 0,15 s prieš kiekvieną slydimo pradžią, kaip sukibimo dalis |
| **daugiau nei 10° dreifo, kai stipriai posūkiuoja** | iš mėginių, kurie posūkiuoja ties 60% ar daugiau savo sukibimo, dalis, kurioje slysta (10° asfalte, 20° biri dangoje); reikia 30 mėginių |
| **dreifo mediana** | tuose pačiuose mėginiuose |
| **balansas** | priekinio minus galinio rato slydimo kampas (nominalaus piko kartotiniais), kai stipriai posūkiuoja ir neslysta, vidurkis iš bent 30 mėginių: + stumia į išorę |
| **paviršius** | virš 80% birių mėginių: biri; žemiau 20%: asfaltas; kitu atveju mišri |

**Pasiekimas viršaus.** Mėginys skaičiuojamas, kai visa sekundė aplink jį (±0,5 s, bent 0,9 s duomenų) buvo visu akceleratoriumi (> 0,95, be stabdžio), ant žemės, važiuojant **tiesiai** (|šoninis| mažesnis nei didesnis iš 4 m/s² ir ketvirtadalio jo sukibimo), įgaunant mažiau nei **0,35 m/s²**, greičiau nei 25 m/s ir per 90% ratų greičiausio - pilnas akceleratorius į kalną ar per ilgą posūkį taip pat nustoja įgauti greičio, gerokai žemiau automobilio maksimalaus greičio. Su bent **viena sekunde** tokio plokščio ruožo visuose ratuose, tų greičių mediana yra vieta, kur jis pasiekia viršų. Kitu atveju maksimalaus greičio nėra: kur nebuvo pakankamai ilgos tiesiosios, *vis dar traukia greičiausiai* parodo, kiek trūko. Jokių spėlionių, be to, ką rodo ratai - pavaros santykis ir ribotuvas nutraukia automobilio traukos jėgą gerokai anksčiau, nei jį sustabdo oro pasipriešinimas.

**Galo praradimas.** Skaičiuojamas ten, kur vairuotojas turėjo jį pagauti: posūkiuojant ties 60% ar daugiau savo sukibimo, slystant (dreifas virš 10° asfalte, 20° biri dangoje), o vairas (virš 0,06) pasuktas **prieš** posūkį. Kuris vairo ženklas sutampa su kuriuo posūkio jėgos ženklu, matuojama kiekvienam ratui (mėginiai, sukantys be slydimo). Slydimas skaičiuojamas vieną kartą, kol automobilis nustoja slysti. Automobilis, kuris tyčia šiek tiek važiuoja šonu, nieko nepraranda; tas, kuriam reikia priešingo vairo, - praranda. Skaičiuojama vienodai kiekvienam automobiliui, todėl du automobiliai gali būti palyginti. Reikia vairo ir dreifo kampo.

## Automobiliai palyginti {#cars-compared}

Šoninės juostos skyrius yra **Automobilis**, kai vienas automobilis, ir **Automobiliai palyginti**, kai keli.

**Lentelė**: stulpelis kiekvienam automobiliui, eilutė kiekvienam matui, kuriam bet kuris automobilis turi reikšmę: Išlaikomas sukibimas; Trauka iki 50 km/h, 50-120, 120-200, virš 200; Stabdymas; Greičiausias; Baigėsi ties ("vis dar traukia", kur niekada nebaigėsi); Vis dar traukia greičiausiai; Galas paleistas, vienam ratui; Daugiau nei 10° dreifo, kai stipriai posūkiuoja. Kur automobiliai skiriasi daugiau nei 3%, geresnė reikšmė pažymima (sukibimui, traukai, stabdymui, greičiams - aukštesnė; galo slydimams - žemesnė).

**Vienas automobilis**: sakiniai apie tai, kas jis, pagal ratus - sukibimas, kurį jis išlaiko (m/s² ir g), jo trauka kiekvienoje juostoje, kur jis nustojo įgauti greičio ilguose tiesiuose (arba kad jis niekada nepasiekė viršaus, ir kiek dar traukė greičiausiai), kaip dažnai jo galą reikėjo pagauti ("beveik niekada", kai rečiau nei kartą per ratą; "daugiausia ant akceleratoriaus", kai 60% ar daugiau prasidėjo ten).

**Du automobiliai**: kiekvienai poros daliai po sakinį apie tai, kuo automobilis yra prieš kitą ("X greičiau įsibėgėja, bet negali suktis taip stipriai, reikia ilgiau sustoti ir lengviau praranda galą"), lentelė, kiekvienas aiškus skirtumas, didžiausias pirmas, tada **Kaip vairuoti kiekvieną**. Kai yra daugiau nei **3** poros, rodoma viena pora: fokusuoto rato automobilis prieš automobilį, pasirinktą iš išskleidžiamojo sąrašo (pagal numatymą - automobilis, kurio klasės geriausias ratas, kitaip - nuorodos, kitaip - pirmasis kitas).

Skirtumas sakomas tik tada, kai ratai jį aiškiai rodo:

| Skirtumas | Sakoma nuo | Sakinys |
|---|---|---|
| sukibimas | **4%** | "X išlaiko N% daugiau sukibimo posūkiuose … tai M% daugiau greičio per kiekvieno posūkio vidurį" (greitis = √ sukibimo santykio) |
| trauka | **5%**, pirmoje juostoje, kurią abu automobiliai turi iš 120-200, 50-120, virš 200 km/h | "X greitėja N% stipriau nuo 120 iki 200 km/h"; ir nuo starto, arba "nors Y nuo starto išlekia stipriau", kai startas skiriasi 8% |
| maksimalus greitis | **4 km/h** | "X pasiekia aukštesnį: jis nustojo įgauti greičio ties …" |
| maksimalus greitis, tik vienas | vienas automobilis pasiekė viršų, kitas ne | "Y baigė traukos ties …; X dar įgavo greičio, kai stabdė" |
| maksimalus greitis, nė vienas | nė vienas nepasiekė viršaus | ką kiekvienas dar įgavo greičiausiu greičiu |
| stabdymas | **5%** | "X stabdo N% stipriau … Y turi stabdyti anksčiau" |
| galo praradimas | bent vienu kartu per ratą daugiau **ir** pusantro karto dažniau | "X lengviau praranda galą: jis nuslydo pakankamai, kad prireikė priešingo vairo N kartų per ratą, o M …" - daugiausia ant akceleratoriaus (60%+) arba daugiausia įsukant ir atleidus (30% ar mažiau), nuo maždaug P% jo sukibimo; biri dangoje "dalis to yra tai, kaip automobilis pasukamas; pagavimas - ne" |
| šonu | **12 procentinių punktų** stipraus posūkio, viršijant dreifo ribą | "X labiau važiuoja šonu ribinėje ribojimo vietoje" |
| priekinis balansas | **0,3** nominalaus piko | "X labiau stumia priekiu … jis nori būti sulėtintas ir pasuktas prieš viršūnę" |

Savybės santraukoje: *išlaiko daugiau sukibimo* / *negali suktis taip stipriai*, *greitėja geriau* / *traukia mažiau*, *pasiekia aukštesnį viršų* / *pasiekia žemesnį viršų*, *dar traukia tiesiųjų pabaigoje* / *baigia traukos*, *stabdo stipriau* / *reikia ilgiau sustoti*, *stabilesnis* / *lengviau praranda galą* (*daug labiau slidus …* dvigubai dažniau pliusas vienas; *reikia gaudyti dažniau* biri dangoje), *stumia priekiu*. "Mažai ką skiria nuo Y šiuose ratuose", kai nėra skirtumo.

**Kaip vairuoti kiekvieną:**

- vienas automobilis turi daugiau sukibimo, kitas daugiau traukia: išlaikykite greitį per vidurį plačia, apvalia linija ("U") sukibimo turinčiu; stabdykite tiesiai, pasukite trumpame ir siaurame viduryje ir ištieskite išvažiavimą ("V") stipriame;
- vienas automobilis atsilieka abiem atžvilgiais: jo geriausias ratas yra švariausias - stabdykite tiesiai, plačiausias spindulys, pilnas akceleratorius kuo anksčiau, kiek jis išlaiko;
- automobilis, kuris lengviau praranda galą: įleiskite akceleratorių tik tada, kai vairas atsisuka atgal, ir trumpai perjunkite pavaras (slydimai ant akceleratoriaus), arba švelniai atleiskite stabdį ir išlaikykite pastovų akceleratorių per vidurį (slydimai įvažiavime).

Po skyriumi esanti užuomina kartoja, kaip kiekvienas matuojamas.

## Ką automobiliai nulemia posūkyje {#what-the-cars-decide-in-a-corner}

Kai ratai yra skirtinguose automobiliuose, kiekvieno prarasto posūkio išvada baigiasi **Automobiliai:** - ta jos dalis, kurią nulemia automobiliai, ir kaip iš šio geriausiai pasinaudoti (`carNote`):

- **Per vidurį**, kai šis automobilis turi mažiau nei 96% kito sukibimo, kitas buvo daugiau nei 0,5 m/s greitesnis lėčiausiame taške, o šis ratas nebuvo toli nuo to, ką paaiškina jo sukibimas (daugiau nei 70% jo): kito automobilio linija šio automobilio sukibimas leidžia `v_other · √(grip_mine / grip_other)`. Jei ratas tai išlaikė (1 m/s tikslumu), skirtumą lemia automobilis ir joks stabdymo taškas jo nepakeičia; jei mažiau, parodoma, kiek dar galima laimėti. Tada - kur laiką dar galima laimėti: į tiesiąją, tarp dviejų, arba automobiliu, kuris traukia 5% stipriau - po viršūnės (stabdykite tiesiai, posūkį pradėkite vėliau, anksti nukreipkite į išvažiavimą); kitu atveju - plačiausias spindulys, kurį leidžia kelias;
- **Galas, kuris čia paleido** (neįskaitomas slydimas ar sukimasis, arba dreifas virš slydimo ribos įvažiuojant), automobiliu, kuris jį praranda bent vieną kartą per ratą daugiau ir pusantro karto dažniau: ką daryti šiuo automobiliu - akceleratorių įleisti tik tada, kai vairas atsisuka atgal (jo slydimai prasideda su galia 60% ar daugiau laiko), arba stabdį švelniai atleisti be nuleidimo;
- **Tiesioji po to**: kai automobilių trauka paaiškino 0,03 s ar daugiau, stipresnė kito automobilio trauka tuo pačiu greičiu, abiejų automobilių traukos nuo 120 iki 200 km/h;
- **Maksimalus greitis**: kai šis ratas pasiekė 98% vietos, kur jo automobilis pasiekia viršų ilgesnėje nei 150 m tiesiojoje, o kitas nuvažiavo 1,5 m/s greičiau: tai automobilio maksimalus greitis, ir kiekvienas papildomas km/h iš posūkio vis dar padeda, kol jį pasiekia;
- **Stabdymas**: kai kitas automobilis stabdo 5% stipriau, o šis ratas stabdė daugiau nei 5 m anksčiau, dalis ankstesnio stabdymo yra automobilio.

Automobilio dalis atimama ir iš paties laiko - žr. [automobilio dalis](race-corner-analysis.md#the-cars-share) - o posūkis, kuriame automobilis paaiškina 60% ar daugiau, priskiriamas automobiliui.

## Kūrėjams {#for-developers}

Kodas: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` faile [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` faile [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).

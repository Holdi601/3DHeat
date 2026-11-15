---
title: "Analizė posūkis po posūkio"
parent: "Lenktynių analizė"
nav_order: 55
lang: "lt"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analizė posūkis po posūkio

Du to paties kurso ratai lyginami posūkis po posūkio. Kiekvienam posūkiui peržiūros programa parodo, kas buvo greitesnis, kiek laiko tai vertė ir kodėl – per anksti stabdė, per vėlai įjungė galią, pasirinko platesnę trajektoriją – kad žinotumėte, ką treniruoti pirmiausia.

![Radinys, atidarytas skyriuje Ką tobulinti, šalia lentelės Posūkis po posūkio](../assets/img/en/race-corner-finding.webp)

Darbo pavyzdys: 3 posūkyje Driver A stabdo 20 m anksčiau nei Driver B ir ten nuvažiuodamas prarado 0,15 s, bet anksčiau įjungia dujas ir išvažiuodamas laimi 0,15 s. Iš viso 0,00 s: posūkis lygus, ir niekam nesakoma stabdyti vėliau.

## Ką matote {#what-you-see}

### Ką tobulinti {#where-to-improve}

Šoninės juostos skyrius fokusuotam ratui („Įkelkite bent du to paties kurso ratus.“, kol jų nėra).

**Antraštė:** „<lap> <time> prieš <reference> <time>“ ir ratų laiko skirtumas – arba etalonui „prieš greičiausią kitą ratą per kiekvieną posūkį (…)“ ir visas prarastas laikas. Šalia – nuostolis, suskirstytas į *vairavimą* ir *automobilį / aplinkybes*.

**Laiko nuostolių juosta:** laikas, prarastas pagal priežasties grupę (stabdymas, įvažiavimas, išvažiavimas, tiesioji, automobilis, kontekstas), priežasčių spalvomis, su legenda.

**Radiniai** – trys sąrašai:

1. Vairuotojo nuostoliai, brangiausi pirmi, daugiausia **12** – arba „Niekur, kur kitaip vairuojant būtų galima laimėti laiko, neišsiskiria.“
2. **Rodyti, kiek kainavo automobilis ar situacija (X s)** – automobilio ir konteksto nuostoliai, daugiausia 8 (pagal numatymą įjungta).
3. **Kur <lap> greitesnis arba kitaip lygus (N)** – laimėjimai ir lygūs posūkiai, daugiausia 10 (pagal numatymą įjungta).

Kiekvienas radinys rodo savo eilės numerį, pavadinimą (posūkį ir kas įvyko, su kaina nuostoliui), sprendimo eilutę, kainą (laimėjimai su minuso ženklu) su juosta ir žymę: *stabdymas*, *įvažiavimas*, *išvažiavimas*, *tiesioji* (vairuotojo nuostoliai, su „· automobilis X“, kai automobilis paaiškina 0,02 s ar daugiau), *automobilis*, *kontekstas*, *greitesnis*, *lygu*. **Spragtelėkite vieną**, kad automobiliai sulygiuotų 40 m prieš jį, jį įrėmintų ir pakartotų, ir atidarykite jo matavimus:

- **Stabdymas:** kur kiekvienas stabdė (ar atleido dujas) ir nuo kokio greičio, ir kiek metrų anksčiau ar vėliau (nuo 5 m);
- **Lėčiausias:** kiekvieno rato mažiausias greitis ir kur;
- **Pilnos dujos:** kur kiekvienas buvo su pilnomis dujomis ir kiek anksčiau ar vėliau;
- **Linija:** įsukimo skirtumas, siauriausi spinduliai, kiek vidun ar išorėn, ir kiekvieno rato linijos forma bei viršūnė;
- **Tiesioji iki kito posūkio:** jos ilgis, abu greičiai, kur abu buvo su pilnomis dujomis, ką prarado ar laimėjo ir dėl ko – pradinis greitis, kito stipresnė trauka, dujų atleidimas, nuslopintas greitis, kaip ji vairuota (dalys nuo 0,02 s);
- **Automobilis:** kiek nuostolio tenka automobiliui ir dėl ko (trauka, sukibimas, stabdžiai; kai 0,02 s ar daugiau);

tada patarimas, **Automobiliai:** (skirtinguose automobiliuose, žr. [Automobilių profiliai](race-car-profiles.md#what-the-cars-decide-in-a-corner)) ir linijos patarimas.

### Posūkis po posūkio {#corner-by-corner}

Lentelė (su dviem ar daugiau ratų), viena eilutė kiekvienai atkarpai, fokusuoto rato klasės, kai yra kelios klasės:

| Stulpelis | Rodo |
|---|---|
| Posūkis | `T3`, `T11-T12` |
| Greičiausias | ratas, greičiausiai nuvažiavęs pro jį (jo paties laikas nuo atkarpos pradžios iki pabaigos) |
| Persvara | jo persvara prieš antrąjį greičiausią, s |
| linija | greičiausio rato forma ir viršūnė („V · vėlai“, „U/V · viduryje“); užvedus – jo siauriausias, įėjimo ir išėjimo spindulys; „abiem būdais“ mišriam kompleksui |
| (fokusuotas ratas) | kiek atsilieka nuo greičiausio arba ✓, kai buvo greičiausias |

Spragtelėjus eilutę, atsidaro fokusuoto rato radinys (arba sulygiuojami automobiliai 40 m prieš atkarpą). Po lentele, kai kiekvienas posūkis turi laiką: „Greičiausias per visus posūkius, sudėjus: <time> (± nuo etalono / nuo geriausio klasės X)“ – geriausios atkarpos ir greičiausias bėgimas iki pirmojo posūkio, kai tai savas ruožas.

## Kaip tai skaičiuojama {#how-it-is-worked-out}

Vyraujanti taisyklė: **posūkis vertinamas visas**, nuo jo stabdymo zonos iki kito posūkio stabdymo zonos. Ratas, kuris stabdo anksčiau, kad automobilį greičiau pasuktų ir anksčiau įjungtų galią, įskaitomas su išvažiavimu, kurį jis nupirko, o ne liepiama stabdyti vėliau.

## Viena atstumo ašis {#one-distance-axis}

Ratai lyginami pagal atstumą, ne pagal laiką – sekundę atsilikęs, du ratai yra skirtinguose posūkiuose. Ir ne pagal kiekvieno rato paties odometrą (siauresnė linija nuvažiuoja mažiau metrų). **Etalono** rato nuvažiuotas kelias yra ašis:

- Kiekvieno kito rato mėginiai **projektuojami** ant etalono kelio: kiekvienas mėginys gauna `s` – kiek toli palei etaloną jis yra – ir `d` – kiek toli į kairę (teigiama) ar į dešinę. Paieška eina į priekį nuo ankstesnio sutapimo (8 kelio atkarpos atgal iki 40 į priekį), todėl ratas, kuris kerta save ar pats su savimi susikerta, niekada nepersokuoja į kitą sankryžą. Pirmasis mėginys ieškomas pirmajame kelio ketvirtyje (trasoje start ir finišas sutampa); kai nieko nėra 30 m atstume, imamas artimiausias taškas bet kur, ne už paskutinio sutapimo (po sukimosi ar nuklydimo). `s` niekada nemažėja: mėginys, projektuojamas už ankstesniojo, sulaikomas.
- Kiekvienas kanalas **perskaičiuojamas** į vieną tinklelį, **kas 2 m**, tiesiškai; keičiami kanalai (pavara, vėliavos) imami iš artimiausio mėginio. Už paties rato ribų reikšmių nėra.
- Pirmasis ir paskutinis rato mėginiai projektuojasi šiek tiek vidun nuo etalono galų, todėl kiekvienas ratas **nešamas iki 15 m** už savo galų greičiu, kuriuo jis ten buvo (laikas auga pagal atstumą, padalytą iš greičio; likusi dalis lieka), kad jo delta linijoje būtų rato laiko skirtumas.
- `delta` = rato laikas kiekviename tinklelio taške minus etalono: tarpas. `lateral` = `d` tinklelyje.

Laikas, kurio vienas ratas užtruko daugiau nei kitas tarp dviejų tinklelio taškų, yra jų deltų skirtumas: `rel(s)`. Viskas žemiau remiasi juo.

## Posūkiai {#corners}

Randami ant **etalono** (`findCorners`), jo greitis sušvelnintas ±6 m, o kreivumas (krypties pokytis per ±5 mėginius, sušvelnintas ±10 m):

1. **Greičio minimumai su išsiskyrimu.** Taškas, kuris yra žemiausias ±40 m ribose, kurio nuokrytis nuo aukščiausio greičio kiekvienoje pusėje (prieš žemesnį minimumą) yra bent `max(2,5 m/s, 6 % greičio)`.
2. **Lūžiai.** Lokalus kreivumo maksimumas, siauresnis nei **300 m** spindulys, be greičio minimumo per 80 m: pilnomis dujomis įveikiamas lūžis vis tiek yra posūkis, kurį reikia vairuoti.
3. **Fazės.** Nuo kiekvienos viršūnės atgal, kol etalonas stabdo (> 0,1) ar nėra su pilnomis dujomis (< 0,95): įėjimas; pirmyn, kol nėra pilnų dujų: išėjimas. Lūžis, įveiktas pilnomis dujomis, gauna ±30 m. Persidengiantys posūkiai laikomi atskirai, bet išdėstomi taip, kad išklotų ratą.
4. Numeruojami T1, T2 … rato tvarka; **kairėn ar dešinėn** pagal kreivumo ženklą ir ar pasaulis veidrodinis (nežinomas laikomas veidrodiniu).

**Posūkio langas** (kur etalonas sukasi): nuo siauriausio taško ±40 m ribose nuo viršūnės, kol kreivumas išlieka aukščiau šeštadalio savo maksimumo, plius 10 m į abi puses. Jo pusė nurodo „vidinį“ ženklą.

## Atkarpos: nuo stabdymo zonos iki stabdymo zonos {#segments-braking-zone-to-braking-zone}

Kiekvienas posūkis valdo kelią iki pusės kelio iki abiejų pusių viršūnių. Jame:

- **Kiekvieno rato lėčiausias taškas** – tikras jo greičio įdubimas: nėra lėtesnio per 6 m (3 tinklelio taškus) į abi puses, žvelgiant už atkarpos galų, kad ankstesnio posūkio išvažiavimas, dar greitėjantis į jį, niekada nebūtų supainiotas su juo – ieškoma nuo 15 m prieš posūkio langą iki 10 m po jo. Ratas, kuris ten niekada nelėtėjo, dedamas viršūnėje.
- **Kur ratas pradėjo lėtėti** (`entryOf`): atgal nuo lėčiausio taško per stabdymą ar dujų atleidimą, per trumpus pilnų dujų šuolius, kol jis turėjo koją ant pedalo (dujos ≥ 0,95, stabdis ≤ 0,1) **10 m**; dujos, vėl paspaustos per paskutinius **30 m** iki lėčiausio taško, vis dar priklauso posūkiui; visiškai pilnomis dujomis – pats lėčiausias taškas. Ratas be dujų kanalo arba kuris nuo ankstesnio posūkio neturėjo kojos ant pedalo, prasideda greičiausiame tarpiniame taške.
- **Atkarpa prasideda** nuo pirmojo iš visų ratų, pradėjusių lėtėti (4 m anksčiau), ir tęsiasi iki kito posūkio pradžios, todėl visi stabdymai yra jos viduje ir atkarpos išklodžia ratą.

**Kompleksai.** Greta einantys posūkiai, tarp kurių etalonas niekada nevažiuoja pilnomis dujomis – mažiau nei **40 m** pilnų dujų – yra viena atkarpa, „T11-T12“, vairuojama kaip viena; komplekse yra daugiausia **trys** lenkimai (vingiuotas ruožas, vairuojamas niekada nebuvus su pilnomis dujomis, pradeda naują). Kompleksas, kuris sukasi abiem kryptimis, yra *mišrus*: jam nematuojama viena linijos forma.

**Ant trasos** (etalonas baigiasi per 50 m nuo starto) paskutinės atkarpos tiesioji tęsiasi per liniją iki pirmojo stabdymo taško: skrydžio ratas nuo linijos skaičiuojamas kartu su paskutiniu posūkiu. Ratas, kuris pradėjo iš stovėjimo ar lenktynių starto (žr. [Startas](#the-start)), šį bėgimą laiko atskirai.

### Kur posūkis veda {#what-a-corner-leads-onto}

Matuojama ant etalono: metrai su pilnomis dujomis po posūkio (nuo jo pilnų dujų iki atkarpos pabaigos, plius bėgimas per liniją) ir prieš jį (ankstesnės atkarpos „po“, arba nuo starto).

| Tipas | Taisyklė |
|---|---|
| **tarp dviejų tiesiųjų** (`both`) | 200 m ar daugiau prieš **ir** 120 m ar daugiau po |
| **į tiesiąją** | 200 m ar daugiau po, arba 120 m ar daugiau po ir bent tiek pat, kiek prieš |
| **po tiesiosios** | 200 m ar daugiau prieš |
| **jungtis** | kas kita |

## Ką kiekvienas ratas padarė posūkyje {#what-each-lap-did-in-a-corner}

`cornerMetrics`, kiekvienam ratui ir atkarpai, tinklelyje (2 m žingsnis). Pedalai: stabdis skaičiuojamas virš 0,1, pilnos dujos – 0,95 ir daugiau.

| Matas | Taisyklė |
|---|---|
| **stabdymo taškas** | pirmas stabdymas, po kurio dujos buvo nuimtos (žemiau 0,5), arba kuris tęsėsi **15 m** – lengvas kojos prisilietimas, kai galia įjungta, nėra ten, kur stabdymas prasidėjo; jei yra tik prisilietimai, pirmas prisilietimas |
| **atleistos dujos** | be stabdymo, pirmas taškas, kuriame dujos nukrito žemiau 0,8 |
| (be pedalų) | taškas, kuriame ratas pradėjo lėtėti (aukščiau) |
| **stabdymo atleidimas** | paskutinis stabdymas iki 30 m po lėčiausio taško |
| **greitis stabdymo taške**, **stabdymo metrai** | iki lėčiausio taško |
| **didžiausias stabdymas**, **didžiausias lėtėjimas** | stabdymo zonoje (pagreičiai virš 45 m/s² ignoruojami) |
| **stabdymas posūkyje** | metrai, kuriuose stabdis > 0,05 ir |vairas| > 0,1 |
| **blokavimo slydimas** | neigiamiausias rato slydimo santykis zonoje (kai ratas turi slydimo duomenis) |
| **lėčiausias taškas**, **mažiausias greitis** | kaip aukščiau |
| **dujos įjungtos** | po atleidimo (ar lėčiausio taško) pirmas dujų > 0,15 be stabdžio |
| **pilnos dujos** | pirmas taškas po to, kai 10 m laikomasi ≥ 0,95 |
| **riedėjimas** | metrai nuo atleidimo iki dujų įjungimo, kai stabdis ir dujos abu žemiau 0,05 |
| **dujų nukritimai** | kartai, kai dujos nukrito daugiau nei 0,25 žemiau savo aukščiausio taško tarp dujų įjungimo ir pilnų dujų |
| **didžiausias šoninis** | didžiausias šoninis pagreitis nuo 20 m prieš atleidimą iki vėlesnio iš pilnų dujų ir 20 m po lėčiausio taško |
| **pavara viršūnėje** | lėčiausiame taške |
| **sukimosi slydimas** | didžiausias varomojo rato slydimo santykis tarp dujų įjungimo ir pilnų dujų |
| **balansas** | priekinio minus galinio slydimo kampas per vidurį (+ nepakankamas vairavimas) |
| **tiesioji pilnomis dujomis** | atkarpos dalis po pilnų dujų (ir bėgimas per liniją) su ≥ 0,95; ilgiausias jos atleidimas |
| **nuslopintas greitis** | didžiausias greičio nuostolis nuo aukšto taško su dujomis ≥ 0,9, be stabdžio, ant žemės |
| **įėjimo dreifas** | didžiausias dreifo kampas nuo stabdymo taško iki 5 m po lėčiausio taško, ant žemės |
| **rankinis stabdys** | kur jis įsijungė (> 0,2), iki 10 m po lėčiausio taško |
| **ore** | sekundės ore per atkarpą ir ilgiausias skrydis |

## Su kuo lyginamas kiekvienas ratas {#who-each-lap-is-compared-with}

- Ratas lyginamas su **greičiausiu baigtu savo našumo klasės ratu** (etalonas – etalono klasėje).
- Tas klasės geriausias ratas pats (ir etalonas) lyginamas atkarpa po atkarpos su **tuo kitu klasės ratu, kuris buvo greičiausias** – arba su visais ratais, jei jis vienas savo klasėje.

Laiko žemėlapis, tarpai ratų sąraše, automobilio valdymo įvykiai ir posūkių lentelė seka tą patį palyginimą.

## Posūkio laiko apskaita {#the-time-account-of-a-corner}

`compareCorner`, vienam ratui prieš kitą per atkarpą:

- **grynasis** = `rel(end) - rel(start)` (plius bėgimas per liniją skrydžio rate): sprendimas. Arčiau nei **0,03 s** – **lygu**.
- **Pasidalijimas** – kur posūkio viduje pirmavo pirmasis: ruože nuo pirmojo stabdymo taško ar lėčiausio taško bet kurio rato iki vėlesnio iš jų pilnų dujų ir lėčiausių taškų, didžiausias svyravimas, kurį ratas tada atidavė ar atgavo, kai svyravimas viršija **0,04 s**; kitaip – vėlesnis iš dviejų lėčiausių taškų.
- **Iki viršūnės** = `rel(split) - rel(start)`; **po jos** = grynasis minus tai. Kai abu yra bent 0,04 s ir priešingų ženklų, ratas **keitė** vieną kitu.
- **Po to** dar dalijasi ten, kur abu važiuoja pilnomis dujomis: **išvažiavimas** (nuo pasidalijimo iki vėlesnių pilnų dujų) ir **tiesioji** (nuo ten iki pabaigos).
- **Tiesioji** dalijasi trijų būdų:
  - *išvažiavimo greitis* (`byExit`) – išmatuotas, ne modeliuotas: lėtesnis automobilis tiesiosios pradžioje kažkur pralenkia greitesnio automobilio pradinį greitį, ir nuo ten jo paties pėdsakas yra tai, ką jis būtų padaręs nuo to greičio, su savo pavarų dėže, pasipriešinimu ir nuolydžiu. Perkeltas atgal į tą tašką (ir nuvestas toliau savo galinio greičio metrais, kuriuos jis įgauna) tai yra jo laikas nuo greitesnio starto; skirtumas yra išvažiavimo greičio kaina. Kai lėtesnis automobilis niekada nepasiekia to greičio (arba tik paskutiniuose 2 mėginiuose), jo paties pagreitis ruože grąžinamas kaip galia (`a·v` išlaikoma), niekada ne stipriau nei jo kreivė rodo tuo greičiu (du kartus išmatuotas pagreitis be kreivės).
  - *automobilių trauka* (`byPower`) – tik skirtinguose automobiliuose: abu automobiliai nuo to paties greičio per tuos pačius metrus, pilnomis dujomis, integruojant kiekvieno pilnų dujų pagreitį kiekvienu greičiu.
  - *kaip vairuota* (`driven`) – likusi dalis: atleidimas, nuslopintas greitis pilnomis dujomis.

  Išvažiavimo greitis niekada nepaaiškina daugiau nei tiesiosios kaina (ir niekada priešingu ženklu), nebent atleidimas ar nuslopintas greitis dalį atėmė atgal. Ratas **atleido dujas** tiesiojoje, kai jo dalis pilnomis dujomis yra mažesnė nei ir 0,9, ir kito dalis minus 0,05. Nuslopintas greitis skaičiuojamas, kai abu skiriasi daugiau nei 1 m/s. Nesutarimas, mažesnis nei 0,02 s, ženklu nustatomas į 0.

Kiekvienos atkarpos grynasis sudedamas į rato laiko skirtumą, o kiekvieno posūkio iki viršūnės ir po jos sudedami į jo grynąjį (testai tikrina abu).

### Automobilio dalis {#the-cars-share}

Tik kai ratai yra **skirtinguose automobiliuose** ir ratas prarado laiko (`carShare`):

- **trauka**: automobilių trauka tiesiojoje (aukščiau), iki nuostolio;
- **sukibimas**: kai ratas buvo ties savo automobilio riba (šoninis pagreitis viduryje bent **90 %** to, ką jo automobilis laiko tuo greičiu) ir kitas automobilis laiko daugiau nei **5 %** daugiau: iš žemesnio mažiausio greičio, nepaaiškinto siauresniu spinduliu, dalis `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)` likusio nuostolio;
- **stabdžiai**: kai ratas stabdė (ne atleido), kitas automobilis stabdo daugiau nei **5 %** stipriau, o ratas *vidutinis* lėtėjimas zonoje buvo bent **80 %** to, ką jo automobilis gali: nuo `u` iki `v` su `a1` prieš `a2`, baigiant tame pačiame taške, `(1/a1 - 1/a2)(u - v)² / 2u`, iki to, kas lieka.

Automobilio kaina yra suma, daugiausia lygi nuostoliui.

## Sprendimas ir radinys {#the-verdict-and-the-finding}

`cornerFinding` užrašo daugiausia vieną radinį vienam ratui ir posūkiui, bandydamas šia tvarka:

| Atvejis | Radinys | Rezultatas |
|---|---|---|
| grynasis ±0,03 s ribose, keitimas, mažesnė pusė ≥ **0,1 s** | **lygu, dviem būdais** – kas buvo lėtas įėjime ir greitas išėjime, ir kas atvirkščiai; kai po jo yra tiesioji (į tiesiąją ar tarp dviejų), būdas „lėtai įėjus, greitai išėjus“ yra tas, į kurį reikia remtis: išlaikykite ankstyvas dujas, įėjimo laiką atgaukite stabdydami stipriau, o ne vėliau | lygu |
| kitaip grynasis ±0,03 s ribose | nieko nesakoma | - |
| laimėta, keitimas, prarasta iki viršūnės | **lėtai įėjus, greitai išėjus atsipirko**: palikite, čia išvažiavimas vertingesnis | laimėjimas |
| laimėta, keitimas, laimėta iki viršūnės | **greitesnis įėjime**: įėjimas teisingas, ankstesnės pilnos dujos išsaugotų daugiau | laimėjimas |
| laimėta, o kitas ratas čia turi nuostolį | **greitesnis – dėl to, ką padarė kitas**; jo priežastis ir patarimas sako „Kitam ratui: …“ | laimėjimas |
| kitaip laimėta | **greitesnis įėjime / išėjime**, pagal tai, kuri pusė laimėjo daugiau (stabdant vėliau, daugiau greičio per vidurį; arba anksčiau pilnomis dujomis, stipresne trauka) | laimėjimas |
| prarasta, o **smūgio ar avarijos** kaina bent `max(0,05 s, 40 % nuostolio)` | smūgis yra posūkio istorija, prieš automobilius | nuostolis |
| prarasta, o **automobilio dalis** 60 % ar daugiau | **automobilis**: jo trauka tiesiojoje, sukibimas per vidurį ar stabdžiai – didžiausia dalis; su vairuotojo dalimi (≥ 0,03 s) sakoma „Kita X s: …“ | nuostolis |
| prarasta, o vienas nepasidalijęs **automobilio valdymo klaida** kainavo bent `max(0,05 s, 40 %)` | ta klaida (žemiau), su tuo, kaip laikas kito aplink ją | nuostolis |
| prarasta, o **ilgesnis skrydis** kainavo bent `max(0,05 s, 40 %)` | skrydis | nuostolis |
| prarasta, keitimas, laimėta iki viršūnės | **per greitai įėjus, lėtai išėjus**: išvažiavimo priežastis; atsisakykite dalies įėjimo, kad greičiau pasisuktumėte ir anksčiau tiesiai, su kito rato stabdymo ir pilnų dujų taškais. Jo šaknis (`cause`, ką skaičiuoja [statistika](race-course-statistics.md)): stabdymas vėliau, kai stabdė keliais metrais vėliau nei kitas; kitaip – išvažiavimo priežastis | nuostolis |
| prarasta, keitimas, prarasta iki viršūnės | **įėjime atidavė daugiau, nei išvažiavimas atgavo**: įėjimo priežastis, kuri taip pat yra jos šaknis (`cause`); išlaikykite išvažiavimą, įėjime prarasite mažiau | nuostolis |
| prarasta, pakeltos dujos tiesiojoje, o vairuota dalis viršija pusę nuostolio | **ne pilnomis dujomis tiesiojoje**: jos dalis pilnomis dujomis, palyginti su kito, kur ir kiek ilgai dujos atleistos | nuostolis |
| prarasta, automobilių trauka viršija 60 % nuostolio, o tiesioji – pusę | **automobilio trauka tiesiojoje** (abiejų automobilių trauka 160 km/h) | nuostolis |
| kitaip prarasta | pusės, kuri prarado daugiau, priežastis (iki viršūnės ≥ po jos: įėjimo; kitaip – išėjimo). Lėčiau išvažiuoti tik todėl, kad lėčiau per vidurį (daugiau nei 1 m/s): vietoj to – vidurio priežastis | nuostolis |

Radinys dėl nuostolio taip pat gali baigtis **Taip pat:** – nuslopintu greičiu pilnomis dujomis arba dujų atleidimu tiesiojoje – kai vairuota tiesiosios dalis kainavo daugiau nei 0,04 s ir tai dar nebuvo priežastis.

Radiniai rūšiuojami: pirma nuostoliai, brangiausi pirmi; paskui laimėjimai ir lygūs posūkiai.

### Priežastys įėjime {#causes-on-the-way-in}

`entryCause`, pirmoji, kuri tinka (mažiausio greičio skirtumai m/s; „5 m“ yra riba, kada ankstesnis ar vėlesnis taškas skaičiuojamas):

| Nr. | Priežastis (klaida) | Taisyklė |
|---|---|---|
| 1 | smūgis ar avarija įėjime | nepasidalijęs smūgis, prasidedantis per 10 m po lėčiausio taško |
| 2 | **beveik sustojo** (incidentas) | lėčiausias greitis žemiau **60 %** to, ką leidžia šio automobilio sukibimas, kur kitas nuvažiavo (`v_other · √(grip_mine / grip_other)`, kai kitas automobilis sukimba daugiau, kitaip – kito greitis), kito rato greitis virš 8 m/s – sukimasis, kontaktas ar praleistas posūkis |
| 3 | automobilio valdymo klaida įėjime | nepasidalijęs užblokavimas, stūmimas, sukimasis ar slydimas be dujų, prasidedantis per 10 m po lėčiausio taško, kainuojantis ≥ 0,02 s |
| 4 | ilgesnis skrydis prieš lėčiausią tašką | žr. [ralis](#rally-rotation-and-flights) |
| 5 | **atleido dujas**, kai kitas liko su pilnomis arba atleido 5 m ar vėliau | šis ratas tik atleido dujas |
| 6 | **stabdė, kai kitas tik atleido** arba liko su pilnomis | ir buvo lėtesnis per vidurį daugiau nei 0,5 m/s |
| 7 | **stabdė švelniai** | stabdė (ne atleido), turėjo vietos stabdyti stipriau – su padangų duomenimis, jo blokavimo slydimas žemiau **60 %** slydimo, kur šio automobilio stabdžiai veikia geriausiai; be jų – didžiausias lėtėjimas žemiau **85 %** to, ką jis rodo tuo greičiu – pedalas žemiau 0,95, o kito rato didžiausias lėtėjimas daugiau nei **15 %** didesnis |
| 8 | **stabdė anksti** – arba **automobilio stabdžiai** | stabdė daugiau nei 5 m prieš kitą. Kitame automobilyje, kurio stabdžiai stipresni nei 5 %, ir su ne daugiau nei 10 m atsargos prieš atstumą, kurio šis automobilis reikalauja pagal savo lėtėjimą: automobilio stabdžiai. Kitaip – stabdė anksti, su „Stabdykite vėliau – apie N m“ (kitame automobilyje – metrai, kurie viršija jo poreikį) |
| 9 | **riedėjo** | daugiau nei 10 m be nė vieno pedalo ir 5 m daugiau nei kitas |
| 10 | **lėčiau per vidurį** | daugiau nei 0,5 m/s lėčiau lėčiausiame taške; padalinta pagal `v² = a·R` (žemiau) |
| 11 | **įvažiavo lėčiau** | daugiau nei 1 m/s lėčiau stabdymo taške, nestabdė anksti: nuspręsta anksčiau – prieš posūkį ir automobilio trauką arba skrydžio ankstesniame posūkyje, kuris buvo 0,2 s ilgesnis. Automobilio, kai automobiliai skiriasi |
| 12 | lėčiau iki viršūnės | kitu atveju: atleiskite stabdį švelniau ir įriedėkite daugiau greičio į vidurį |

**Lėčiau per vidurį** (`middleSplit`): kiekvieno rato spindulys lėčiausiame taške matuojamas iš jo paties kelio (±8 m), jo šoninis pagreitis – kaip `v²/R`, ir

`ln(v_other / v_mine) = ½ ln(a_other / a_mine) + ½ ln(R_other / R_mine)`.

- Spindulys paaiškina **pusę ar daugiau**: **per siaura linija** – „naudokite daugiau kelio“, su abiem spinduliais ir dalimi.
- Ties automobilio riba (slysta daugiau nei 10° dreifo asfalte / 20° biriame, arba šoninis pagreitis bent 90 % to, ką laiko tuo greičiu) ir kitas automobilis sukimba daugiau nei 5 %: **automobilio sukibimas**; vietoj to saugokite išvažiavimą.
- Slystant per jį (dreifas daugiau nei 10° / 20°), o kitas ratas nesliuodo (jo įėjimo dreifas bent 4° mažesnis): **šonu** – už savo sukibimo, ne trūkstant jo; įvažiuokite šiek tiek lėčiau. Sakoma kaip automobilio, kai šis automobilis pagauna galą bent kartą per ratą daugiau nei kitas.
- Kitame automobilyje, kuris laiko mažiau nei **96 %** kito sukibimo, o ratas išlaikė per 1 m/s `v_other · √(grip_mine / grip_other)`: **automobilio sukibimas** – „stabdant vėliau to neįveiksite“.
- Kitaip – **sukibimo atsarga**: šoninis pagreitis, palyginus su kito panašiame spindulyje, ir ką laiko šis automobilis; daugiau greičio viršūnėn. Kur šio automobilio galas paleidžia prieš tai, kai sukibimas išnaudotas (jo slydimai prasideda žemiau 85 % sukibimo, o ratas buvo 80 % to), likusį rasti mažais žingsneliais.

### Priežastys išvažiavime {#causes-on-the-way-out}

`exitCause`, pirmoji, kuri tinka:

| Nr. | Priežastis (klaida) | Taisyklė |
|---|---|---|
| 1 | automobilio valdymo klaida išvažiavime | nepasidalijęs sukimasis ratu, sukimasis, slydimas ar smūgis, kuris baigiasi ar vyksta ne anksčiau kaip 10 m prieš lėčiausią tašką |
| 2 | **nuslopintas greitis** | daugiau nei 1 m/s greičio prarasta su pilnomis dujomis nei kito; virš **7 m/s (25 km/h)** – „labiau panašu į kontaktą ar sukimąsi nei į slydimą“ |
| 3 | **pasuko automobilį ne taip** (purvinas kelias) | žr. [ralis](#rally-rotation-and-flights) |
| 4 | **dujos įjungtos vėliau** | dujų įjungimas daugiau nei 5 m vėliau, skaičiuojant ir nuo kiekvieno rato savo lėčiausio taško (ratas, kurio lėčiausias taškas vėlesnis, nekaltinamas dėl vėlesnių dujų) |
| 5 | **dvejojo su dujomis** | daugiau dujų nukritimų nei kito |
| 6 | **nuvažiavo plačiai ir laukė** | daugiau nei 1,5 m lauke kito, kai abu buvo be dujų, ir pilnos dujos vėliau nei 5 m nuo savo lėčiausio taško |
| 7 | **pilnos dujos vėliau** | pilnos dujos vėliau nei 5 m, taip pat nuo savo lėčiausio taško; su to automobilio pagreičiu ten |
| 8 | **automobilio varymas** | kitame automobilyje, kuris traukia mažiau nei 95 % kito tuo greičiu, ir trauka paaiškino dalį tiesiosios |
| 9 | **lėčiau išvažiavo iš posūkio** | kitu atveju: vėlesnė viršūnė, todėl automobilis anksčiau tiesiai |

Kai abu ratai skirtingose pavarose lėčiausiame taške, patarimas baigiasi „Pavara N viršūnėje; kitas naudojo M.“

### Automobilio valdymo klaidos ir smūgiai {#car-control-faults-and-impacts}

[Automobilio valdymo įvykių](race-control-events.md) klaida kaip priežastis: užblokavimas yra *stabdymo* priežastis, sukimasis ar slydimas su dujomis – *išvažiavimo* priežastis, kiti – *įėjimo*; smūgis po lėčiausio taško yra *išvažiavimo*, prieš jį – *įėjimo*. Patarimas yra paties įvykio, tada „Tai kainavo apie X s iki 40 m po jo“ (arba „iki tol, kai automobilis atgavo greitį“ smūgiui). Užblokavimas, kai stabdymo taškas bent 5 m anksčiau nei kito, prideda, kad ratas taip pat stabdė anksti – su besisukančiais ratais jam to nereikėjo.

### Ralis: sukimas ir skrydžiai {#rally-rotation-and-flights}

**Purvinoje dangoje**, su dreifo kampais abiejuose ratuose, ir šis ratas su dujomis (ar be jų) vėliau nei 5 m:

- **Pasuko automobilį mažiau**: kitas buvo pasukęs automobilį **12°** ar daugiau iki lėčiausio taško ir bent **8°** daugiau nei šis ratas. Patarimas: dujų atleidimas ar kairės kojos stabdžio prisilietimas įsukant, su kito rato rankinio stabdžio tašku, kai tik jis naudojo, arba rankinis stabdys posūkyje, lėtesniame nei 15 m/s (54 km/h).
- **Pasuko per daug**: šis ratas jį pasuko 12° ar daugiau ir bent **12°** daugiau nei kitas: reikėjo ištiesinti, kol galima nuleisti galią.

**Ilgesnis skrydis**: ore 0,2 s ar daugiau ilgiau nei kitas, kainavo bent 0,03 s nuo 10 m prieš pakilimą iki 40 m po nusileidimo (ar atkarpos galo). Prieš lėčiausią tašką tai yra įėjimo priežastis; tampa posūkio istorija, kai paaiškina 40 % ar daugiau. Patarimas: pakilimo metu palaikykite dujas, kalvagūbrį įveikite šiek tiek lėčiau arba su stabdžio prisilietimu.

### Startas {#the-start}

Prieš pirmąjį posūkį, sprinte ar kai bet kuris ratas pradėjo iš stovėjimo (mažiau nei 5 m/s, kai abu pirmi ašyje) arba lenktynių starto (mažiau nei 60 % kito greičio), bėgimas iki pirmojo stabdymo taško yra jo paties radinys (posūkis 0), kai skiriasi daugiau nei 0,03 s: *Startas*, *Lenktynių startas* arba *Iki pirmojo posūkio*. Ten nuostolis priskiriamas situacijai (*kontekstas*), kai vienas ratas pradėjo lenktynių startu, o kitas – greičiu; automobiliui, kai ratai skirtinguose automobiliuose; ir vairuotojui kitu atveju. Patarimai: kitame automobilyje iš stovėjimo – „daugiausia automobilis“; stovinti pradžia tame pačiame automobilyje – startuokite su mažesniu sukimusi ir perjunkite galios juostos viršuje; lenktynių startas – palyginkite su kitu pirmuoju ratu; skrydžio startas – geresnis paskutinio posūkio išvažiavimas perkeliamas per liniją.

## Vairuojama linija {#the-driven-line}

`lineMetrics`, kiekvienam ratui ir atkarpai (ne mišriems kompleksams), vien iš padėčių (sušvelninta ±2 mėginiai) per posūkio langą:

| Matas | Taisyklė |
|---|---|
| kreivumas | krypties pokytis per ±8 m paties rato kelio |
| **siauriausias spindulys** | 1 / didžiausias kreivumas |
| **įsukimas** / **išsukimas** | kur kreivumas pirmą / paskutinį kartą viršija penktadalį savo maksimumo |
| **vidurys** | kur ratas buvo pasisukęs per pusę savo krypties pokyčio |
| spindulys įėjime / išėjime | metrai, nuvažiuoti per pusę krypties pokyčio, prieš / po vidurio |
| **forma** | siauriausias spindulys, padalytas iš vidutinio spindulio sukantis: žemiau **0,55** – **V**, virš **0,75** – **U**, tarp – „U/V“ |
| **viršūnė** | spindulys išėjime, padalytas iš spindulio įėjime: virš **1,25** – vėlai, žemiau **0,8** – anksti, kitaip – viduryje |
| **greičio viršūnė** | lėčiausias taškas daugiau nei **15 m** prieš vidurį: lėtai įėjus, greitai išėjus; daugiau nei 15 m po vidurio: dar lėtėja prie vidurio |

Palyginus su kitu ratu: kiek vidun (+) ar išorėn jis važiavo įsukant, per siauriausią dalį ir kur abu buvo su pilnomis dujomis (sakoma nuo 1 m); kur kiekvienas įsuko (sakoma nuo 8 m).

### Kokia linija tinka šiam automobiliui čia {#which-line-suits-this-car-here}

`lineFor`, iš to, į ką posūkis veda, ir iš šio automobilio charakterio šiame posūkyje:

- **galia prieš sukibimą** = automobilio pilnų dujų pagreitis išvažiavimo greičiu, padalytas iš jo sukibimo mažiausiame greityje (iš jo kreivės). **Taikyk ir spausk** nuo **0,45** ir daugiau; **impulsas** – **0,25** ar mažiau.
- **prispaudimas**: sukibimas 151–252 km/h, padalytas iš sukibimo 54–108 km/h, **1,15** ar daugiau, posūkiui, įveiktam **144 km/h** (40 m/s) ar greičiau – tada tai impulso posūkis, nepriklausomai nuo galios. Purvinoje dangoje nevertinama.

| Posūkio tipas | Automobilis | Linija |
|---|---|---|
| po tiesiosios | taikyk ir spausk / kitas | V / U, viršūnė viduryje: „stabdymo zona yra prizas“ |
| tarp dviejų tiesiųjų | impulsas / kitas | U / V, vėlyva viršūnė |
| jungtis | impulsas / kitas | U / V, viršūnė viduryje: „važiuokite jį kito išvažiavimui“ |
| į tiesiąją | impulsas (ar greitas prispaudimo posūkis) | plati apvali U, šiek tiek vėlyva viršūnė |
| į tiesiąją | taikyk ir spausk | V: stabdykite tiesiai, įsukite vėlai, pasukite trumpame, siaurame viduryje, anksti ištiesinkite |
| į tiesiąją | tarpinis | U su vėlyva viršūne: lėtai įėjus, greitai išėjus |

Kur išvažiavimas svarbus (į tiesiąją, tarp dviejų), varymo sistema prideda sakinį: **FWD** – pasukite stabdžiais, galią pridėkite tik tada, kai ratas atsisuka; **RWD** su galia prieš sukibimą 0,35 ar daugiau – ištiesinkite prieš pilnas dujas; **AWD** – galią gali imti dar sukdamasis. Purvinoje dangoje kiekviena linija prideda: įėjime pasukite automobilį.

Sakinys tada sako, ką ratas nuvažiavo ir ar tai tinka: *lėčiausia vėlai sukelia išvažiavimo problemas* arba *ankstyva viršūnė sukelia išvažiavimo problemas*, kai reikėjo vėlyvos viršūnės, o ratas nei vėlai viršijo, nei buvo lėčiausias anksti; *apvalesnė, nei šis automobilis nori*, kai reikėjo V; *kampuotesnė, nei šis automobilis nori*, kai reikėjo U; kitaip – *tinka*.

## Kūrėjams {#for-developers}

Kodas: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts), [`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts), [`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts), [`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts), [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx). Samprotavimai ir jų šaltiniai: [metodas](race-analytics.md).

---
title: "Lygio išvaizda"
parent: "Lygiai ir fono geometrija"
nav_order: 3
lang: "lt"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Lygio išvaizda

Šie valdikliai keičia, kaip atrodo 3D lygis, kad šiluma išsiskirtų iš jo ir vis dar galėtumėte skaityti vietą. Nieko čia nekeičia duomenų.

## Greita pradžia {#quick-start}

1. Įkelkite 3D lygį ([3D lygiai](model-levels.md)).
2. Skiltyje **Fonas / lygis** sumažinkite **Šviesumas**, kol šiluma taps ryškiausia ekrano dalis.
3. Atidarykite **Žemės reljefas** ir padidinkite **Šlaitų šešėliavimas** arba **Horizontalių ryškumas**, kol galėsite atskirti kalvą nuo lygumos.
4. Atidarykite **Statiniai**. Sumažinkite **Sienelių nepermatomumą**, kad matytumėte pastatų vidų, arba įjunkite **Statinių tekstūrą**, kad jie atrodytų kieti.
5. Jei ant žemės nupieštas paveikslėlis, išjunkite ir įjunkite **Žemės tekstūrą**.

![Atidaryti skyriai Žemės reljefas ir Statiniai, lygis rodomas su reljefo užuominomis](../assets/img/en/level-appearance-sections.webp)

Įkėlus [3D lygį](model-levels.md), skydelis Fonas / lygis rodo šiuos valdiklius. Numatytosios reikšmės yra tos, kurias gauna naujai importuotas lygis ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Jų keitimas tik perpiešia sceną; šilumos kaupimas išlieka.

## Visas lygis {#the-whole-level}

| Valdiklis | Numatytoji | Intervalas | Reikšmė |
|---|---|---|---|
| **Nepermatomumas** | 100 % | 0–100 % | Žemiau 100 % lygis susimaišo ir nerašo gylio, todėl nebeužstoja šilumos ([užslepia](depth-and-culling.md)). |
| **Šviesumas** | 0,9 | 0–2 (vilkimas 64) | |

Lygis piešiamas nusodintas – pilka žemė, nuspalvintas apvalkalas – todėl šiluma yra vienintelis sodrus daiktas ekrane. Skirtingai nuo [žemėlapio vaizdo](map-images.md), 3D lygis neturi slankiklio Nublukinti.

## Žemės reljefas {#ground-relief}

Iš toli kalva ir lyguma atrodo vienodai pilkos, todėl peržiūra prideda tris užuominas. Kiekviena sprendžia kitokią problemą:

| Valdiklis | Numatytoji | Reikšmė |
|---|---|---|
| **Atstumas tarp horizontalių** | pagal žemės aukščių intervalą | Aukščio žingsnis tarp horizontalių linijų, logaritminis nuo 1/4000 iki 1/2 lygio aukščių intervalo; takelio apačia yra *išjungta*. Numatytoji reikšmė yra 1/40 žemės aukščių intervalo, suapvalinta iki 1/2/5 žingsnio – 10 m linijos tinka šlaitui ir nenaudingos karjero dugnui. Kas penkta linija piešiama ryškesnė. Horizontalės piešiamos ekrano erdvėje, todėl jos visada lieka vieno pikselio pločio, bet kokiu mastu, ir yra vienintelė užuomina, išliekanti tuomet, kai žemė per lėkšta, kad būtų šešėliuojama. |
| **Horizontalių ryškumas** | 35 % | 0–100 % |
| **Šlaitų šešėliavimas** | 55 % | Patamsina pagal statumą, todėl šlaitai ir uolos matomi iš bet kurio kameros kampo – skirtingai nuo šviesos, kuri nulygina, kai į ją žiūrite. |
| **Aukščio skalė** | 50 % | Žema žemė tamsesnė, aukšta – šviesesnė, per visą žemės aukščių intervalą: didelio masto forma. |

Skyriaus antraštė rodo horizontalių būseną: *kas N m*, horizontalių atstumą, arba *be horizontalių*, kai atstumas išjungtas.

## Žemės paviršius {#ground-surface}

| Valdiklis | Numatytoji | Rodoma, kai | Reikšmė |
|---|---|---|---|
| **Vanduo** | įjungta | lygis turi vandens | Ežerai, upės ir jūra, nupiešti plokščiai pilkšvai mėlynai: nė viena reljefo užuomina netaikoma paviršiui, kuris pagal apibrėžimą yra lygus. |
| **Vandens nepermatomumas** | 60 % | Vanduo įjungtas | Pakrantės linija ir žemė po seklumomis matosi per permatomą vandenį. |
| **Žemės trikampiai** | 30 % (0 lygiui su tekstūra) | visada | Paties reljefo kraštinės, nupieštos ant pašešėliuoto paviršiaus, blunka tarp 6 % ir 25 % lygio pločio nuo kameros. Parodo, kaip šiurkščiai žemė buvo išmatuota, ir suteikia šlaitui ką įvertinti atstumui. Sukuriama pirmą kartą naudojant, didelio lygio atveju tai užtrunka akimirką. |
| **Žemė tik kaip vielinis karkasas** | išjungta | visada | Pakeičia reljefo paviršių jo kraštinėmis. Visiškai schematiška – taip pat atsisako šešėliavimo, horizontalių ir užslėpimo, todėl *Žemės trikampiai* paprastai yra geresnis pasirinkimas. |
| **Žemės tekstūra** | įjungta | lygis turi tekstūras | Nupiešia žemę failo tekstūromis (asfaltas, pakraštys, žolė). Tinklelio apšvietimas švelniai uždedamas virš, nes tekstūra jau turi savo smulkų reljefą. **Šviesumas** yra būdas ją nuraminti po šiluma; Nublukinti priklauso žemėlapio vaizdams. |
| **Užfiksuota spalva** | išjungta | lygis turi viršūnių spalvas | Nušviečia žemę skenavimo fiksuota spalva, o ne pilkai – kitaip rekonstruotas kelias nesiskirtų nuo pakraščio. Variklių eksportai jų neturi; jei jų nėra, skydelis rodo *Šis lygis neturi spalvos.* |

## Statiniai {#structures}

Antraštė **Statiniai** rodo statinių trikampių skaičių; žemiau esantis patarimas nurodo, kaip jie piešiami (*piešiami kieti savo tekstūrose* arba *piešiami kaip permatomas apvalkalas, kad matytumėte šilumą viduje*) ir kiek dalių yra statiniai.

| Valdiklis | Numatytoji | Reikšmė |
|---|---|---|
| **Statinių tekstūra** | įjungta, kai statiniai turi tekstūras | Piešti statinius kietus, jų pačių tekstūrose. Įjungus sienelių nepermatomumas nustatomas į 100 % ir kraštinės išjungiamos; išjungus grįžtama prie atspalvinto permatomo apvalkalo, 25 %. Statinys su tekstūra apšviečiamas iš tos pusės, kurią mato kamera, nes ženklas yra dvi nugarom į nugarą sukeistos sienelės, o tai, kuri laimi gylio testą, priklauso nuo apvalinimo. |
| **Karkaso briaunos** | įjungta; išjungta, kai statinių trikampių daugiau nei 300 000 arba kai yra tekstūra | Pasikartojančių statinių kraštinių pašalinimas; viena linija vienai kraštinei. |
| **Briaunų nepermatomumas** | 50 % | |
| **Apvalkalo sienelės** | įjungta | Silpnas paviršius su ryškiu Fresnelio kraštu, todėl pastatas atrodo kaip tūris, o ne kaip narvas ar rūko banga. |
| **Sienelių nepermatomumas** | 25 % (35 % esant daugiau nei 300 000 statinių trikampių, 100 % su tekstūra) | 0–60 % takelyje, iki 100 % su rankenėle. Laikykite žemą: kietos konstrukcijos slepia duomenis viduje. |
| **Aštrios briaunos** | įjungta (išjungta su tekstūra) | Kiekvieną trikampį nušviečia pagal jo paties normalę, apskaičiuotą fragmento šešėliuotojuje iš ekrano erdvės išvestinių. Eksportuoti lygiai yra suvirinti ir turi vidutines normales, kurios suapvalina kiekvieną dėžės kampą į „išsilydžiusią foliją“; padalyti kiekvieną viršūnę, kad tai ištaisytumėte, padaugintų viršūnių buferį. Išjunkite lygiui, kuriam kreivieji paviršiai svarbesni nei kampai. |
| **Statinių atspalvis** | Žydra | Spalvų parinkiklis ir išankstiniai nustatymai **Žydra**, **Gintarinė**, **Violetinė**, **Balta**. |
| **Rodyti dalių klasifikaciją (N)** | | Kiekviena dalis, jos klasė ir priežastis; žr. [3D lygiai](model-levels.md#ground-structures-and-water). |

## Lygio pjovimas {#cutting-the-level}

[Pjūvis](slice.md) ir, su *Pjauti ir lygį*, [atrinkimas pagal atstumą](depth-and-culling.md#distance-culling) pjauna žemę, statinius ir vandenį tose pačiose plokštumose kaip ir šiluma.

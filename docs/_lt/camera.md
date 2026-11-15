---
title: "Kamera ir valdymas"
nav_order: 14
has_children: true
lang: "lt"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera ir valdymas

Scena lekiate kaip paukštis: **W A S D** judėti, vilkite pelę, kad žiūrėtumėte. Šis puslapis skirtas skraidymui, šuoliui į viršutinį ar šoninį vaizdą ir tiksliam kameros padėties nuskaitymui.

## Skraidykite per 4 žingsnius {#fly-in-4-steps}

1. Vieną kartą spustelėkite vaizdą, kad jis gautų klaviatūrą.
2. Laikykite **W**, kad skristumėte pirmyn, **S** - atgal, **A** ir **D** - į šonus, **Space** - aukštyn, **Q** - žemyn.
3. Laikykite kairįjį ar dešinįjį pelės mygtuką ir vilkite, kad žiūrėtumėte aplink.
4. Paspauskite **F**, kad vėl apimtumėte visus duomenis.

Kamera yra laisvo skrydžio kamera su perspektyviniu ir lygiagrečiu projekcijos režimais, iš anksto nustatytais vaizdais, įvestina poza ir lauko gyliu. Jos nustatymai yra skydelyje **Kamera ir scena** šoninės juostos apačioje (taip pat rodomi skirtukuose Race analysis ir Match). Įgyvendinimas: [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Skraidymas {#flying}

| Įvestis | Poveikis |
|---|---|
| `W` `A` `S` `D` arba rodyklių klavišai | Pirmyn (pagal vaizdą, įskaitant jo polinkį), kairėn, atgal, dešinėn |
| `Space` arba `E` | Aukštyn (pasaulio aukštis) |
| `Q` arba kairysis `Ctrl` | Žemyn |
| `Shift` (laikant) | 6 kartus greičiau |
| kairysis `Alt` (laikant) | 15% greičio |
| Vilkimas kairiuoju ar dešiniuoju pelės mygtuku | Žiūrėti aplink. Rodyklė užrakinama vilkimo metu. |
| Pelės ratukas | Skrydžio greitis ×1,5 kiekvienam žingsniui (perspektyva); priartinimas (lygiagrečiai) |
| `F` | Apimti duomenis |
| Spustelėjimas (be vilkimo) | Parodyti, kas yra po rodykle ([Vaizdo apžiūra](#inspecting-the-view)) |
| `C` | Nukopijuoti kameros padėtį, posūkį ir polinkį |
| `G` | Eiti į įvestą tašką |
| `Esc` | Uždaryti pasirinkimo kortelę (ir nustoti sekti vienetą) |

### Sekant vienetą {#while-following-a-unit}

Kai kamera seka vienetą pakartojime ([Rungtynių pakartojimas](match-replay.md)), skraidymo klavišai atlieka kitą funkciją:

| Įvestis | Poveikis |
|---|---|
| Ratukas, `W` / `S` | Arčiau vieneto / toliau nuo jo (aukščiau / žemiau palydovinio vaizdo rodinyje) |
| `A` / `D`, `Q` / `E` | Sukiotis aplink vienetą (persekiojimo ir orbitos vaizdai) |
| Vilkimas | Žiūrėti aplink vienetą (kabina: žiūrėti kabinos viduje) |
| `V` / `Shift+V` | Kitas / ankstesnis kameros vaizdas |
| `Esc` | Pirmiausia nustoti žiūrėti į antrąjį vienetą, po to nustoti sekti |

Judėjimo klavišai sumuojami su [žaidimų pultu](gamepad.md); visa kita - [klaviatūros žinynas](keyboard-reference.md). Klavišai ignoruojami, kai aktyvus teksto laukas ar išskleidžiamasis sąrašas. Polinkis apribotas tik kiek trūksta iki tiesiai aukštyn ir žemyn.

## Kamera ir scena (skydelis) {#camera--scene-panel}

![Skydelis Kamera ir scena: Projekcija, Iš anksto nustatyti vaizdai, Matymo lauko mygtukai, Skrydžio greitis ir Poza](../assets/img/en/camera-panel.webp)

### Projekcija {#projection}

**Projekcija**: *Perspektyva* (numatyta) arba *Lygiagreti*.

*Lygiagreti* (ortografinė) pašalina perspektyvinį sutrumpėjimą, todėl du vienodo tankio karštieji taškai atrodo vienodo dydžio bet kur kadre - palyginimą, kam skirtas žemėlapio šilumos žemėlapis - ir būtent dėl jos izometrinis vaizdas yra izometrinis. Lygiagrečiame režime pelės ratukas priartina (nėra judėjimo pirmyn, keičiančio mastelį), o [greičio rodinys](#fly-speed) paslėptas.

**Perjungimas palieka objektą tokio paties dydžio.** Lygiagrečiai projekcijai nėra matymo lauko, todėl jos rėmo aukštis nesusijęs su kameros atstumu; paprastas perjungimas arba labai priartina, arba nieko nerodo. Pereinant į lygiagrečią, rėmo aukštis nustatomas pagal tai, ką perspektyvinė kamera apima fokuso atstumu (2 × atstumas × tan(fov / 2); fokuso atstumas yra paskutinio kadravimo atstumas). Grįžtant atkuriama perspektyvos poza, kurią palikote, tokiu pačiu matomu masteliu, o ne ten, kur nuklydo lygiagretus vaizdas.

### Iš anksto nustatyti vaizdai {#preset-views}

| Grupė | Mygtukai | Orientacija |
|---|---|---|
| **Izometrinis** | **ŠR**, **ŠV**, **PR**, **PV** | Lygiagretus, polinkis -35,264° (= atan(1/√2), kampas, kuriuo visos trys ašys projektuojamos į tokį patį ilgį), posūkis -45°, 45°, -135°, 135°. Keturi kampai, nes vienas visada slepia pusę žemėlapio už arčiau esančio. |
| **Šoniniai vaizdai** | **Viršus**, **Apačia**, **Priekis**, **Galas**, **Kairė**, **Dešinė** | Lygiagretus. Viršus žiūri tiesiai žemyn (polinkis -89,9°), Apačia - tiesiai aukštyn, Priekis - išilgai -Z (posūkis 0°), Galas - išilgai +Z (180°), Kairė - išilgai -X (-90°), Dešinė - išilgai +X (90°). |
| | **Atgal į perspektyvą** | Grįžti į perspektyvos pozą, kurią palikote. Perspektyvoje išjungta. |
| | **Trijų ketvirčių vaizdas** | Perspektyvinis, posūkis -35°, polinkis -28°. |

Kiekvienas iš anksto nustatytas vaizdas perjungia pačią projekciją - perspektyvoje „viršutinis vaizdas" vis tiek konverguoja į dingimo tašką, o lygūs plotai nebeatrodo lygūs - ir apima duomenis iš tos krypties.

### Matymo laukas {#field-of-view}

**Matymo laukas** - vertikalus kampas. Numatyta 65°, 10-140° juostoje (179° su rankena), su mygtukais **Plokščias 20°**, **Ilgas 35°**, **Įprastas 50°**, **Platus 65°**, **Labai platus 90°**. Siauras išlygina perspektyvą ir primena lygiagrečią projekciją; platus perdeda gylį ir apsunkina atstumų įvertinimą. Jis lieka aktyvus lygiagrečiame režime, kur nustato mastelį, kurį perjungimas atgal apskaičiuoja, ir atstumą, kurį naudoja **Kadras**.

### Skrydžio greitis {#fly-speed}

**Skrydžio greitis** - pasaulio vienetai (metrai) per sekundę visu greičiu. Numatyta 120; kiekvieną kartą įkeliant - duomenų horizontalus išmatavimas / 12. Logaritminė, 0,02-20 000 (200 000 su rankena; rankena keičia santykiais, ne kiekiais). Pelės ratukas dauginamas arba dalinamas iš 1,5 kiekvienam žingsniui, 0,02-200 000 ribose.

Ta pati reikšmė rodoma vaizdo apačios dešinėje (tik perspektyvoje): greitis m/s arba km/s ir laikas, per kurį pereinamas duomenų plotas (arba lygis, kai įkeltas 3D lygis) tuo greičiu. Tempkite aukštyn ar žemyn, kad pakeistumėte greitį.

### Artima ir tolima {#near-and-far}

**Artima** (numatyta 0,5) ir **Tolima** (numatyta 40 000) iškirpimo atstumai. Abu perskaičiuojami iš duomenų kiekvieną kartą įkeliant (artima = max(0,05; išmatavimas / 20 000), tolima = išmatavimas × 12) ir plečiami, niekada nesiaurinami, 3D lygio, kuris yra didesnis ([Lygiai](levels.md#what-a-level-does-for-the-heat)). Jų santykis nusako gylio tikslumą, kuriuo remiasi uždengimas, todėl labai maža artima su didele tolima silpnina [uždengimą](depth-and-culling.md). Žiūrint iš scenos išorės ar aukštai virš jos žemės, naudojama artima plokštuma pasistumia iki 2% to atstumo, todėl žemėlapis, matomas iš toli iš viršaus, išlaiko pakankamą gylio tikslumą, kad vanduo ir krantas nemirgėtų; langelis vis tiek rodo nustatytą reikšmę.

### Kiti valdikliai {#other-controls}

| Valdiklis | Numatyta | Reikšmė |
|---|---|---|
| **Apversti Y** | išjungta | Apverčia pelės žvilgsnį aukštyn/žemyn. |
| **Lauko gylis** | išjungta | Žr. žemiau. |
| **Žaidimų pultelis** | įjungta | Žr. [Žaidimų pultelis ir HOTAS](gamepad.md). |
| **Poza** | | Žr. žemiau. |
| **Apžiūra** | | Kameros nuskaitymas, spustelėjimo pasirinkimas, posūkio konvencija ir *Eiti į tašką*; žr. [Vaizdo apžiūra](#inspecting-the-view). |
| **Kadruoti duomenis (F)** | | Pritaiko duomenis (skirtuke Race analysis: ratus) prie vaizdo, išlaikant dabartinę kryptį. Kamera statoma r / tan(fov / 2) atstumu nuo centro, r yra duomenų ribų įstrižainės pusė. |
| **Tinklelis**, **Ašys** | įjungta, įjungta | Žemės tinklelis su 1/2/5 × 10ⁿ žingsniu, apie 1/40 duomenų apimties (tęsiasi iki 1,5 × duomenų, nuo 8 iki 120 tinklelio žingsnių), ir spalvotos ašys. |
| **Apversti pasaulio ašį** X, Y, Z | išjungta | Žr. žemiau. |

### Poza {#pose}

Penki skaičių langeliai - **X**, **Y**, **Z** ir **posūkis °**, **polinkis °** - seka kamerą, kol nė vienas iš jų nėra aktyvus. Įveskite reikšmę ir paspauskite `Enter` (arba palikite langelį), kad kamera perkeltų ten. **kopijuoti** įdeda `pos X Y Z · posūkis A · polinkis B` į iškarpinę (su `(game yaw)` po to, kai pasirinkta ta konvencija). Skraidymas - tai, kaip tyrinėjate; koordinatės - tai, kaip atkuriate vaizdą. Tai tie patys skaičiai kaip [kameros nuskaitymas](#camera-readout): paties duomenų koordinatės, įskaitant tuos atvejus, kai ašis apversta, ir posūkis pasirinkta [konvencija](#yaw-conventions).

### Apversti pasaulio ašį {#invert-world-axis}

**Apversti pasaulio ašį X / Y / Z** piešia pasaulį su ta ašimi atvirkščiai. Žaidimas, laikantis kairiarankio pasaulio, šiame dešiniarankiame žiūryklėje atrodo veidrodiškai - dešiniojo posūkiai piešiami kaip kairiojo - ir apvertus X ar Z viskas grįžta į vietą. **Keičiasi tik piešimas**: duomenys, analizė ir kiekviena koordinatė, kurią rodo įrankiai (poza, liniuotė, pjūvis), lieka paties žaidimo. Vaizdas apsiverčia vietoje, todėl lieka žiūrima į tą pačią vietą. Šis nustatymas įsimenamas naršyklėje (`localStorage` raktas `heat3d.mirror`); palyginkite su įkėlimo metu atliekamais [apvertimais](axes-units-and-time.md#flips), kurie keičia duomenis.

## Vaizdo apžiūra {#inspecting-the-view}

Kur yra kamera, kas yra po rodykle ir kaip eiti į tašką - skydelio Kamera ir scena bloke **Apžiūra** bei du perdangos langai vaizdo viršutiniame kairiajame kampe. Kodas: [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) ir [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Valdiklis | Numatyta | Reikšmė |
|---|---|---|
| **Kameros padėtis virš vaizdo** | įjungta | Kameros nuskaitymas, žemiau. Taip pat uždaromas su savo **×**. |
| **Spustelėjus parodoma, kas ten yra** | įjungta | Spustelėjimo pasirinkimas, žemiau. |
| **Posūkio konvencija** | Žiūryklė | Kokį posūkį rodo ir skaito nuskaitymas, pozos langeliai ir šuolio langelis. |

Šie trys nustatymai įsimenami naršyklėje (`localStorage` raktas `heat3d.inspect`).

### Kameros nuskaitymas {#camera-readout}

Vaizdo viršutiniame kairiajame kampe: kameros **x**, **y**, **z**, **posūkis** ir **polinkis**, gyvai, su žyma, kuri nurodo posūkio konvenciją. Rodomos tos pačios reikšmės kaip [Pozos](#pose) langeliuose ir jis nieko nekainuoja skraidant (rašoma į puslapį kadro laikrodžiu, be skydelių perpiešimo).

- **kopijuoti** (arba `C` bet kur, išskyrus teksto langelį) įdeda `x X y Y z Z posūkis A polinkis B (viewer yaw)` į iškarpinę, su `.` dešimtainiais skaičiais, kad ir kokia būtų kalba - eilutę, kurią šuolio langelis ir bet koks scenarijus nuskaito atgal.
- **eiti į** (arba `G`) atidaro langelį po juo: įklijuokite tašką ir paspauskite `Enter`, kad į jį pažiūrėtumėte, arba įklijuokite visą nukopijuotą pozą, kad atsidurtumėte tame vaizde. `Esc` uždaro langelį.

### Koordinatės: paties duomenų koordinačių sistema {#coordinates-the-datas-own-frame}

Visos koordinatės, kurias rodo ar priima apžiūros įrankiai, yra **įkeltų duomenų pačių koordinačių sistemoje**: panaikinamas įkėlimo [ašių atvaizdavimas](axes-units-and-time.md) (aukščio ašis, apvertimai, mastelis). Padėtis, nuskaityta iš vaizdo, yra tas skaičius, kurį laiko lentelė, o skaičius iš lentelės, įvestas šuolio langelyje, nuveda į tą vietą. Kai atvaizdavimas nieko nekeičia (Y aukštyn, be mastelio įkėlimas - toks, kokius rašo užfiksavimo įrankiai ir lygių eksportuotojai), tai tiesiog pasaulis; kitu atveju nuskaitymas turi žymą **duomenų koordinačių sistema**. Be duomenų rinkinio koordinatės yra pasaulio koordinatės. Posūkis ir polinkis visada susiję su žiūryklės pasauliu, Y aukštyn.

### Posūkio konvencijos {#yaw-conventions}

| Konvencija | Posūkis 0° žiūri išilgai | Didėja link | Naudoja |
|---|---|---|---|
| **Žiūryklė** | -Z | -X | laisvo skrydžio kamera, [iš anksto nustatyti vaizdai](#preset-views) |
| **Žaidimas / įrašymo įrankiai** | +X | -Z | užfiksavimo įrankių `yaw` stulpeliai ir pozos; lygyje, eksportuotame žiūryklės koordinačių sistemoje, paties žaidimo posūkis |

Polinkis abiem atvejais tas pats: aukštyn nuo horizontalės. Abi skiriasi tik ketvirčiu apsisukimo ir nieko daugiau:

> žiūryklės posūkis = žaidimo posūkis - 90°

Kryptis `d` yra `(cos p · cos y, sin p, -cos p · sin y)` žaidimo konvencijoje ir `(-sin y · cos p, sin p, -cos y · cos p)` žiūryklės. Pasirinkite **Žaidimas / įrašymo įrankiai**, kad įvestumėte posūkį tiesiai iš užfiksavimo lentelės arba palygintumėte nuskaitymą su vienu iš jų.

### Eiti į tašką {#going-to-a-point}

**Eiti į tašką** Apžiūros bloke (ir nuskaitymo **eiti į** langelyje):

- tekstiniame langelyje tinka `x, y, z` arba `x y z` (ar `x; y; z`), su dešimtainiu tašku arba dešimtainiu kableliu - `-321.6, 137.8, -59.9` ir `-321,6 137,8 -59,9` yra tas pats taškas. Penki skaičiai prideda posūkį ir polinkį, o pozą, nukopijuotą iš nuskaitymo ar pozos langelių, nuskaito visą, su žymomis ir konvencija;
- **posūkis °** ir **polinkis °** (neprivalomi) pasuka kamerą pasirinkta konvencija;
- **Žiūrėti** išlaiko kryptį (pakreipiama, kad žiūrėtų žemyn bent 20°, jei žiūrėjo horizontaliai) ir atsitraukia išilgai jos iki dabartinio atstumo, laikomo tarp 0,3% ir 3% scenos pločio - 6-60 m dviejų kilometrų lygyje. Fokuso atstumas, lygiagretaus vaizdo aukštis ir skrydžio greitis seka paskui, todėl vaizdas atvyksta tinkamas naudoti;
- **Stovėti čia** pastato kamerą į tašką, pasuktą nurodytu posūkiu ir polinkiu, arba tokią, kokia buvo.

Įklijuota poza su savo posūkiu ir polinkiu visada atsiduria tame vaizde.

### Spustelėjimo pasirinkimas {#click-to-pick}

Spustelėjimas vaizde - paspausti ir atleisti, nevilkiant daugiau nei 4 pikseliai; vilkimas vis tiek žiūri aplink - parodo kortelę viršutiniame kairiajame kampe su tuo, kas yra po rodykle. Kol įjungta [liniuotė](measure.md), spustelėjimai eina į liniuotę.

**Nubraižytas duomenų taškas laimi.** Artimiausias mėginys 8 pikselių spindulyje nuo spustelėjimo, iš tų, kurie iš tiesų nubraižyti: eilutės laiko lange ir gyvavimo trukmėje, praeinančios [filtrus](filters.md), rodomas grupes ir skaidymą, esančios atstumo atmetime ir pjūvyje, kuris kerpa šilumą. Rungtynių dėžės pakartojime - dėžė po rodykle (bet kur joje). Kortelėje išvardijamas kiekvienas stulpelis, kurį eilutė turi, šaltinio paties stulpelių pavadinimais - laikas (sienos laikrodžio, arba failo sekundės su `m:ss.ss`), asmuo, grupė, sesija, kiekvienas išsaugotas stulpelis, padėtis ir žiūrėjimo kryptis - ir atstumas nuo kameros. Atmintyje yra tik stulpeliai, kuriuos įkėlimas išsaugojo: stulpelis, nepasirinktas kaip [filtro stulpelis](column-mapping.md), nerodomas.

**Kitu atveju - lygio paviršius**: taškas, kuriame spindulys susitinka su lygio tikrais trikampiais (ne liniuotės atskaitos plokštuma), su **dalimi**, kuriai jis priklauso (eksportuotojo pavadinimas, `structure:props`, `ground:terrain …`), jo **rūšimi** (ground, structure, water, map image), koordinatėmis ir atstumu. Geometrija, paslėpta pjūvio ar atstumo atmetimo, praleidžiama. Kur lygis turi [navigacijos tinklą](model-levels.md#navigation-meshes), eilutė jį įvardija ir pasako, ar vieta yra ant jo (✓). Dalies pavadinimas su priedu `≈` atspėtas iš dalių ribojančių dėžučių, nes ta lygio dalis buvo supaprastinta įkeliant.

Kortelė lieka, kol ji uždaroma (**×**, `Esc`), kitas spustelėjimas atsako į ką nors kita arba spustelėta tuščioje vietoje. Scenoje taške nubraižomas žydras kryžius, o ekrane virš jo - žiedas. Jos mygtukai: **kopijuoti** (visos reikšmės ir koordinatės kaip `x, y, z`), **Žiūrėti** ir **Stovėti čia** (duomenų taške - žiūrint taip, kaip žiūrėjo eilutė, jei ji turi žiūrėjimo kryptį; paviršiuje - 1,7 m virš jo).

Lygis indeksuojamas pasirinkimui pirmu spustelėjimu, kuriam to reikia: stulpelių tinklelis virš jo pėdsako, statomas po kelis milisekundes tarp kadrų, kad vaizdas niekada nesustotų (apie sekundę darbo lygiui su keliais milijonais trikampių), ir laikomas, kol lygis pasikeičia. Iki tol kortelėje rašoma *Ruošiamas lygis pasirinkimui* su procentu, o į spustelėjimą atsakoma, kai jis paruoštas. Duomenų taško paieška per daugiau nei keturis milijonus nubraižytų eilučių taip pat paskirstoma per kadrus.

## Lauko gylis {#depth-of-field}

Sulankstomas skyrius Kamera ir scena, antraštė *Lauko gylis - įjungta*, kai įjungta. Pagal numatymą išjungta: tai pristatymo efektas, o numatytasis vaizdas turėtų rodyti duomenis, o ne jų interpretaciją.

| Valdiklis | Numatyta | Ribos (ratukas) | Reikšmė |
|---|---|---|---|
| **Įjungta** | išjungta | | |
| **Fokusuoti į tai, kas sukadruota** | įjungta | | Fokusas nustatomas tuo atstumu, kuris buvo naudotas paskutiniame kadravime (*Sufokusuota į N m.*). |
| **Fokuso atstumas** | 1000 | 1-200 000, logaritminė (10 000 000) | Rodoma, kai fokusas rankinis. |
| **Diafragma** | ±35% | ±2% iki ±200%, logaritminė (±3200%) | Gylis, išlaikomas aštrus, kaip fokuso atstumo dalis - santykinis, o ne f-skaičius, nes scenos svyruoja nuo kambario iki aštuonių kilometrų žemėlapio. |
| **Didžiausias suliejimas** | 12 px | 1-48 (256) | Didžiausias suliejimo spindulys; kaina auga kartu su juo. |

Jis sulieja **lygį, tinklelį ir dėžes** - *ne šilumą*. Šilumos taškas yra daugelio gylių sprite'ų suma, todėl jis neturi vieno gylio, kuriame būtų nefokusuotas; jį suliejus tuo, kas stovi už jo, būtų klaidinga, kur jis plaukia priešais. Aštrūs duomenys minkštame kontekste taip pat naudingesni. Suliejimas yra 24 krypčių auksinio kampo surinkimas kompozicijos etape, sveriamas taip, kad ryški priekinė dalis nebūtų išsitepusi į išorę dėl už jos esančio suliejimo. Pakeitus jį, perpiešiama be šilumos kaupimo perkrovimo.

## Drobės skiriamoji geba {#canvas-resolution}

Drobė piešiama ekrano pikselių santykiu, apribotu iki 2. Šilumos buferis gali būti piešiamas mažesne skiriamąja geba nei tai ([Šilumos skiriamoji geba](performance-and-stats.md)).

## Šio skyriaus puslapiai {#pages-in-this-section}

- [Žaidimų pultelis ir HOTAS](gamepad.md)
- [Klaviatūros ir pelės žinynas](keyboard-reference.md)

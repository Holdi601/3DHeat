---
title: "Šiluma"
parent: "Šilumos režimai"
nav_order: 1
lang: "lt"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Šiluma

Šiluma nudažo vietas, kur įvyko daug dalykų: raudona, kur įvyko šiek tiek, baltai karšta, kur įvyko daug. Ji atsako į klausimą „kur tai vyksta ir kiek“.

**Šiluma** (klavišas 1) yra numatytasis režimas. Kiekviena matoma [eilutė](glossary.md) prideda į kamerą nukreiptą apvalų [spraitą](glossary.md); persidengiantys spraitai susideda į slankiojo kablelio buferį; suma perleidžiama per spalvų skalę – pagal numatymą skaidri → raudona → geltona → balta – ir nupiešiama virš scenos.

![Šiluma 3D lygyje: karštos vietos pastatų viduje ir ant jų](../assets/img/en/shooter-heat.webp)

Paveikslėlyje – šaulio raundo šiluma lygyje su pastatais: karštos vietos yra kambariuose ir laiptuose, o ne tik ant žemės.

## Kaip naudoti {#how-to-use-it}

1. Įkelkite duomenis ir paspauskite `1` (arba pasirinkite **Šiluma** režimų juostoje).
2. Jei viskas balta arba tuščia, skiltyje **Šilumos forma** paspauskite **Automatinė ekspozicija pagal lauką**.
3. Keiskite **Spraito spindulys**, kol gretimi taškai susilies į juostas: mažesnis rodo atskiras dėmes, didesnis – plotus.
4. Atidarykite **Šilumos spalvos**, kad pakeistumėte spalvas, arba **Gylis**, kad kalvos ir sienos slėptų šilumą už savęs.

![Šoninės juostos skiltys Šilumos forma ir Šilumos spalvos, abi atidarytos](../assets/img/en/heat-panel.webp)

Tos pačios skiltys formuoja [Skirtumą](difference.md), [Komandų šilumą](team-heat.md) ir [Linijų šilumą](line-heat.md); jos skiriasi tuo, kas pridedama (su ženklu, nudažyta arba išilgai linijų), o ne kaip tai daroma.

## Skiltys ir jų numatytosios reikšmės {#the-panels-and-their-defaults}

Kiekvienas žemiau esantis valdiklis atitinka šešėliuotuvo parametrą, todėl jo keitimas kainuoja tik perpiešimą. Slankikliai turi šalia įvedimo langelį ir tempimo rankenėlę (mažą apvalią dalį dešinėje: tempkite aukštyn arba žemyn, toliau – greičiau, Shift – smulkiai); kai slankiklio juosta baigiasi anksčiau nei tikra riba, rankenėlė gali pastumti ją iki čia nurodytos *jog ribos*. Reikšmės, pažymėtos *įkeliant*, perskaičiuojamos kiekvienam naujam duomenų rinkiniui.

### Šilumos forma (atidaryta) {#heat-shape-open}

| Valdiklis | Numatytoji | Ribos (jog riba) | Išsamiau |
|---|---|---|---|
| **Spraito spindulys** | 6 m; įkeliant apimtis / 120 | 0,05–2000 m, logaritminė (50 000) | [Spraito forma](sprite-shape.md#sprite-radius) |
| **Intensyvumas centre** | 1 | 0–10 (1000) | [Spraito forma](sprite-shape.md#centre-and-edge-intensity) |
| **Intensyvumas krašte** | 0 | -2–10 (1000) | [Spraito forma](sprite-shape.md#centre-and-edge-intensity) |
| **Perėjimo forma** | *Slopimas* | *Slopimas* / *Kreivė* | [Spraito forma](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Slopimas** (tik Slopimo režime) | 1,6 | 0,1–8 (64) | [Spraito forma](sprite-shape.md#falloff) |
| **Glotnus perėjimas** (tik Slopimo režime) | įjungta | | [Spraito forma](sprite-shape.md#falloff) |
| Kreivės redaktorius (tik Kreivės režime) | *Glotni* išankstinis nustatymas | | [Spraito forma](sprite-shape.md#the-curve-editor) |
| **Įsotinimo taškas** | 24; įkeliant – įvertinimas, vėliau išmatuojamas | 0,1–4000, logaritminė (10 000 000) | [Spalva ir ekspozicija](colour-and-exposure.md#saturation-point) |
| **Mažiausia šiluma** | išjungta (0) | 0–100 % | [Spalva ir ekspozicija](colour-and-exposure.md#minimum-heat) |
| **Tankio atsakas** | *Įsotinantis* | *Įsotinantis* / *Tiesinis* / *Logaritminis* | [Spalva ir ekspozicija](colour-and-exposure.md#density-response) |
| **Automatinė ekspozicija pagal lauką** | | mygtukas | [Spalva ir ekspozicija](colour-and-exposure.md#auto-exposure) |
| **Sekti vaizdą** | įjungta | | Kaskart, kai kamera nurimsta, ekspozicija išmatuojama iš naujo, todėl sritis, į kurią įskrendate, naudoja visą spalvų skalę. Nedideli pokyčiai ignoruojami, o mastelis slysta sklandžiai. Išjunkite arba tempkite **Įsotinimo tašką**, kad užfiksuotumėte mastelį ir palygintumėte vietas viename mastelyje. [Spalva ir ekspozicija](colour-and-exposure.md#follow-the-view) |
| **Vienodas tankis bet kokiu mastu** | įjungta | | Spalva reiškia tą patį eilučių skaičių ploto vienete, nepriklausomai nuo to, kaip arti esate. Spraitas, kurį pikselių ribos padidina (toli) arba sumažina (arti), prideda tiek šilumos, kiek pridėtų jo tikras dydis, todėl vaizdas, eksponuotas iš toli, neišnyksta, kai skrendate į jį. Išjungus, apribotas spraitas prideda visą savo svorį su apribotu dydžiu. [Spraito forma](sprite-shape.md#pixel-clamps) |
| **Suplokti į žemės plokštumą** | išjungta | | [Spraito forma](sprite-shape.md#flatten-onto-ground-plane) |

### Šilumos spalvos (uždaryta) {#heat-colours-closed}

| Valdiklis | Numatytoji | Išsamiau |
|---|---|---|
| Grupių pavyzdėliai ir **Spalvų atskyrimas** (tik Komandų šilumoje) | 1,4 | [Komandų šiluma](team-heat.md) |
| **Šilumos skalė** redaktorius (*Teigiama (pridedančios komandos)* Skirtume, *Nepermatomumo skalė* Komandų šiluma) | skaidri → raudona → geltona → balta | [Spalva ir ekspozicija](colour-and-exposure.md#the-ramp-editor) |
| **Atkurti: skaidri → raudona → geltona → balta** | | |
| **Neigiama (atimančios komandos)** skalė (tik Skirtume) | skaidri → žalia → mėlyna → violetinė | [Skirtumas](difference.md#colours) |

### Spraito pikselių ribos (uždaryta) {#sprite-pixel-clamps-closed}

| Valdiklis | Numatytoji | Ribos (jog riba) | Išsamiau |
|---|---|---|---|
| **Mažiausias spindulys pikseliais** | 1 px | 0–16 (512) | [Spraito forma](sprite-shape.md#pixel-clamps) |
| **Didžiausias spindulys pikseliais** | 96 px | 2–1024, logaritminė (8192) | [Spraito forma](sprite-shape.md#pixel-clamps) |

### Gylis (atidaryta) {#depth-open}

| Valdiklis | Numatytoji | Išsamiau |
|---|---|---|
| **Slėpti už reljefo** | įjungta | [Gylis ir atrinkimas](depth-and-culling.md#hide-behind-terrain) |
| **Paslėpta už geometrijos** | 0,8 (*80 % tamsesnė*) | [Gylis ir atrinkimas](depth-and-culling.md#hidden-behind-geometry) |

### Atstumo atrinkimas (uždaryta) {#distance-culling-closed}

| Valdiklis | Numatytoji | Ribos (jog riba) | Išsamiau |
|---|---|---|---|
| **Artima** | išjungta (0) | 0,5–5000 m, logaritminė, takelio apačia = išjungta (200 000) | [Gylis ir atrinkimas](depth-and-culling.md#distance-culling) |
| **Tolima** | išjungta (0) | 1–200 000 m, logaritminė, apačia = išjungta (10 000 000) | [Gylis ir atrinkimas](depth-and-culling.md#distance-culling) |
| **Pjauti plokštuma** | įjungta | | [Gylis ir atrinkimas](depth-and-culling.md#distance-culling) |
| **Pjauti ir lygį** | įjungta | | [Gylis ir atrinkimas](depth-and-culling.md#distance-culling) |

Klavišai: `[` ir `]` stumia tolimąją ribą į vidų ir į išorę, `\` ją perjungia ([Gylis ir atrinkimas](depth-and-culling.md#keyboard)).

### Kryptis ir Vertė {#direction-and-value}

Dvi dar skiltys yra žemiau Šilumos formos. **Kryptis** kiekvieną eilutę piešia kaip sektorių ir prideda rodykles: žr. [Krypties šiluma](directional-heat.md). **Vertė** sveria šilumą pagal tai, kiek kiekviena eilutė kainavo arba uždirbo: žr. [Vertės svorinimas](value-weighting.md).

## Kas išsaugoma {#what-is-saved}

Aukščiau nurodyti šilumos nustatymai tarp sesijų neišsaugomi: perkrovus puslapį grįžtama prie numatytųjų. Naršyklėje išsaugoma du dalykai: paskutinis atkūrimo greitis (`heat3d.speed`, žr. [Laiko juosta](timeline.md)) ir toli esančių figūrų nustatymai [figūrų sutapdinime](box-replay.md) (simbolių stilius, dydis, pataikymų žymės ir pan.). Taip pat išsaugoma kalba, [apverstos pasaulio ašys](camera.md#invert-world-axis), lenktynių skirtuko prisimintų automobilių pavadinimai ir [lygių biblioteka](level-library.md). Pilnas sąrašas – [Išsaugoti nustatymai](ref-settings-storage.md).

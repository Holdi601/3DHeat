---
title: "Lygiai ir fono geometrija"
nav_order: 16
has_children: true
lang: "lt"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Lygiai ir fono geometrija

Lygis yra 3D vieta, kurioje vyko žaidimas – žemėlapis, miestas, trasa. Padėkite jį už savo duomenų, ir galėsite matyti, *kur* yra šiluma. Skiltis **Fonas / lygis** (žodį „lygis“ rasite [žodynėlyje](glossary.md)) suteikia tris konteksto rūšis:

- **žemėlapio vaizdą**, pagal dvi inkarines vietas susietą su geografine padėtimi – žr. [Žemėlapio vaizdai](map-images.md);
- **3D lygį** – `.glb`, `.gltf`, `.obj`, `.stl` arba `.ply` – padalytą į žemę, statinius ir vandenį bei supaprastintą importuojant – žr. [3D lygiai](model-levels.md) ir [Lygio išvaizda](level-appearance.md);
- **pasaulio foną** – įrašui, kuris nurodo, kur Žemėje jis vyko (Tacview ACMI failui), tikrą reljefą, kelius, vandenį, aerodromus ir pastatus, parsisiųstus iš atvirų duomenų – žr. [Pasaulio fonas](world-backdrop.md).

Nieko neįkėlus, scena tamsi, su tinkleliu ir spalvotomis ašimis (**Tinklelis** ir **Ašys** skiltyje [Kamera ir scena](camera.md)), o skiltis sako: *Nieko neįkelta – scenoje rodomas tinklelis ir ašys. Pridėkite žemėlapio vaizdą arba lygio tinklą, kad šiluma turėtų kontekstą.*

Lygis bendras visiems trims skirtukams: trasa, įkelta Lenktynių analizės skirtuke, yra tas pats lygis, kurį rodo šilumos žemėlapis.

![Skiltis Fonas / lygis su įkeltu lygiu: mygtukai Žemėlapio vaizdas ir 3D modelis, Teatras, Nepermatomumas, Šviesumas, Įrašyti į biblioteką ir bibliotekos sąrašas](../assets/img/en/level-panel.webp)

## Padėkite lygį už savo duomenų {#put-a-level-behind-your-data}

1. Pirmiausia įkelkite savo duomenis ([Duomenų įkėlimas](getting-data-in.md)), kad lygis būtų pritaikytas prie jų.
2. Šoninėje juostoje atidarykite **Fonas / lygis**.
3. Paspauskite **Žemėlapio vaizdas…** paveikslėliui arba **3D modelis…** 3D lygiui ir pasirinkite failą. Realaus pasaulio įrašui naudokite **Tikrasis pasaulis kaip fonas** arba **Karo veiksmų teatras**.
4. Palaukite, kol baigsis eigos eilutė. Didelis modelis pirma supaprastinamas (žr. žemiau **Supaprastinimo tikslas**).
5. Paspauskite **F** vaizde, kad įrėmintumėte viską. Naudokite **Nepermatomumas** ir **Šviesumas**, kol šiluma išsiskirs nuo lygio.
6. Paspauskite **Įrašyti į biblioteką**, jei lygį naudosite dar kartą ([Lygių biblioteka](level-library.md)).

## Ką lygis daro šilumai {#what-a-level-does-for-the-heat}

- Jis **uždengia**: duomenų taškai už jo nuspalvinami tamsiau pagal paviršių, o duomenų taškai už reljefo paslepiami ([Gylis ir atrinkimas](depth-and-culling.md)). Be lygio uždengimo nėra.
- [Pjūvis](slice.md) jį **iškerpa**, o su *Pjauti ir lygį* – ir [atstumo atrinkimas](depth-and-culling.md#distance-culling) kartu su šiluma.
- Tai vienintelis dalykas, kurį [lauko gylis](camera.md#depth-of-field) susilieja, be tinklelio ir dėžių.
- 3D lygis **išplečia kameros tolimąją plokštumą**, kai jis didesnis už duomenis: artimoji ir tolimoji plokštumos kalibruojamos pagal duomenų rinkinį, o eksportuotas žemėlapis, kelių kilometrų pločio, kitaip būtų visiškai už tolimosios plokštumos ir palikęs tuščią vaizdą. Tolimoji plokštuma tampa 3 × lygio horizontalaus ištęsimo, kai tai didesnė, artimoji plokštuma juda kartu (bent tolima / 100 000), kad išliktų gylio tikslumas, nuo kurio priklauso uždengimas, o skraidymo greitis pakeliamas bent iki ištęsimo / 12. Ji tik plečiama, niekada nesiaurinama.

## Skydelis iš viršaus žemyn {#the-panel-top-to-bottom}

| Dalis | Išsamiau |
|---|---|
| **Žemėlapio vaizdas…**, **3D modelis…** | Įkelia vieną; jis pakeičia dabartinį lygį. |
| **Tikrasis pasaulis kaip fonas**, **Pamiršti žemėlapio plyteles** | Tik duomenims su geografine nuoroda: sukuria po juo tikrą vietovę kaip lygį arba ištrina parsisiųstas plyteles. [Pasaulio fonas](world-backdrop.md) |
| **Supaprastinimo tikslas** | Trikampių biudžetas kitam modelio importui: *Pilnas – be supaprastinimo* (numatytasis), *Aukštas – 8M*, *Vidutinis – 3M*, *Žemas – 800k*, *Siluetas – 100k*. [3D lygiai](model-levels.md#simplification) |
| Eiga ir **Atšaukti** | Kol dekoduojama arba importuojama. |
| Importo pastaba | Trikampiai prieš ir po, žemės / statinių / vandens padalijimas, naudojamas detalumo lygis. |
| Pavadinimas ir dydis | `plotis×aukštis px · x × z m/px` paveikslėliui, `N trikampių (iš M)` modeliui. |
| **Nepermatomumas**, **Šviesumas** | Abiejų rūšių. |
| Paveikslėlio valdikliai | **Nubluktinti**, **Apversti šiaurę / pietus**, **Išdėstymas** (dvi inkarinės vietos), **Pritaikyti prie duomenų ribų**, **Aukštis**. [Žemėlapio vaizdai](map-images.md) |
| Modelio valdikliai | Žemės reljefas, vanduo, žemės trikampiai, vielinis rėmas, tekstūra, užfiksuota spalva, statiniai, dalių klasifikavimas. [Lygio išvaizda](level-appearance.md) |
| **Įrašyti į biblioteką**, **Pašalinti** | [Lygių biblioteka](level-library.md); Pašalinti iškelia lygį. |
| **Biblioteka** | Šioje naršyklėje saugomi lygiai. [Lygių biblioteka](level-library.md) |

## Šio skyriaus puslapiai {#pages-in-this-section}

- [Žemėlapio vaizdai](map-images.md)
- [3D lygiai](model-levels.md) – formatai, dalys, klasifikavimas, supaprastinimas, tekstūros
- [Lygio išvaizda](level-appearance.md) – kiekvienas 3D lygio valdiklis
- [Lygių biblioteka](level-library.md)
- [Pasaulio fonas](world-backdrop.md) – tikras pasaulis po įrašu, iš atvirų duomenų

Kaip gauti lygius iš žaidimų ir variklių, rūpinasi atskiri eksportavimo įrankiai (žr. saugyklos [README](https://github.com/Holdi601/3DHeat/blob/main/README.md)); sutartis, į kurią jie rašo, apibendrinta [3D lygiuose](model-levels.md#the-exporter-contract).

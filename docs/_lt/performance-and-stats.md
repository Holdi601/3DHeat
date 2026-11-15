---
title: "Našumo skydelis ir statistika"
parent: "Atvaizdavimo vidus"
nav_order: 7
lang: "lt"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Našumo skydelis ir statistikos perdanga

Langelis viršuje dešinėje vaizde rodo, kiek peržiūros programa dirba: kiek kadrų per sekundę, kiek taškų piešia ir ar vis dar tikslina vaizdą. Skydelis **Našumas** leidžia keisti vaizdo kokybę į greitį.

## Statistikos perdanga {#the-stats-overlay}

Langelis viršuje dešinėje vaizde skirtukuose Šilumos žemėlapis ir Rungtynės ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Jis nuskaito variklio tiesioginius rodmenis kiekviename animacijos kadre.

![Statistikos perdanga daug rungtynių scenoje, su numeruotais pažymėjimais: 1 Sąsaja, 2 FPS, 3 Kadras, 4 Eilutės lange, 5 Spraitai / kadrą, 6 Biudžetas, 7 Šilumos raiška, 8 Padengimas](../assets/img/en/performance-stats-overlay.webp)

| Eilutė | Reikšmė |
|---|---|
| **Sąsaja** | *WebGPU* arba *WebGL2*. Užvedus pelę matyti, kodėl WebGPU nebuvo naudojama, jei ji nebuvo. Žr. [Abu varikliai](backends.md). |
| **FPS** | Kadrai per sekundę, vidurkis per bent 0,4 s. |
| **Kadras** | Kadro trukmė ms, sulyginta (90 % ankstesnė, 10 % nauja). Tai laikas tarp kadrų, o ne GPU laikas – GPU laikas pagal kiekvieną etapą nematuojamas. |
| **Eilutės lange** | Kandidatės eilutės: dabartinio laiko lango eilutės, prieš kiekvienos eilutės filtravimą šešėliavime. |
| **Spraitai / kadrą** | Spraitai, kuriuos paskutinio kadro planas pateikė (neveiklių kadrų metu paliekamas planuotas skaičius, nes jie nieko nepiešia). |
| **Biudžetas** | Spraitų biudžetas, pagal kurį šis kadras suplanuotas – prisitaikančio valdiklio reikšmė, padidinta iki visų kandidačių, kai piešiama kiekviena eilutė. |
| **Šilumos raiška** | Šilumos buferio raiška kaip drobės dalis: nustatymas *Šilumos raiška* padaugintas iš prisitaikančio antrosios pakopos mastelio. |
| **Padengimas** | Kiek laipsniškas kaupimas pasiekė panaudodamas visas eilutes: procentas, kol konverguoja (gintaro spalva), *tiksliai*, kai baigta. Triukšmingas kadras niekada nepainiojamas su baigtu vaizdu. |
| **Kubai** | Dėžės, nupieštos [dėžių pakartojime](box-replay.md). |
| **Neįkelta į atmintį** | Rodoma tik tada, kai eilutės netilpo į GPU biudžetą: kiek jų. Žr. [GPU atminties laikymas](gpu-memory.md). |

## Greičio rodmuo {#the-speed-display}

Apatiniame dešiniajame vaizdo kampe, tik perspektyvoje: skridimo greitis ir laikas, per kurį tuo greičiu pereinami duomenys. Vilkite jį, kad pakeistumėte greitį. Žr. [Kamera](camera.md#fly-speed).

## Jei peržiūra lėta {#if-the-viewer-is-slow}

Pažiūrėkite į statistikos perdangą, tada:

1. **Eilutės lange gerokai daugiau nei Spraitai / kadrą, Padengimas žemiau 100 %** – kadras negali nupiešti visko; kai stovite vietoje, jis konverguoja per kelis kadrus. Susiaurinkite langą, filtruokite arba atrinkite, kad sumažėtų kandidatės; arba sutikite su imties ėmimu.
2. **Spraitai / kadrą lygu Eilutės lange, kadras vis tiek lėtas** – kaina tenka kiekvienam spraitui ekrane: sumažinkite *Didžiausią taškų spindulį* ([Spraito forma](sprite-shape.md#pixel-clamps)) arba *Šilumos raišką*.
3. **Lėta su mažai eilučių** – greičiausiai lygis: daug konstrukcijų su kraštais, žemės trikampiai, lauko gylis. Žr. [Lygio išvaizda](level-appearance.md).
4. **Viskas lėta ir raudonas baneris** – programinis atvaizdavimas ([Programinio atvaizdavimo aptikimas](software-rendering.md)).

## Našumo skydelis {#the-performance-panel}

| Valdiklis | Numatytoji reikšmė | Poveikis |
|---|---|---|
| Užuomina | | Kiekvienas kadras išsklaido stratifikuotą atsitiktinį matomų eilučių pogrupį, kurio svoriai padidinti kompensacijai, todėl tikėtina šiluma tiksli bet kokiam biudžetui; kol vaizdas stovi, kadrai toliau sujungiami, kol kiekviena eilutė prisidėjo. |
| **Piešti kiekvieną eilutę kiekviename kadre** | įjungta | Kiekvienas kadras, kuris pradeda naują įvertinimą, piešia kiekvieną kandidatę eilutę (iki maždaug 268 mln.); žemiau esantis biudžetas tampa apatine riba. [Imtis ir biudžetai](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Prisitaikantis biudžetas** | įjungta | Derina spraitus kadre, paskui šilumos raišką, kad išlaikytų tikslinį kadrų dažnį – ir nustoja mažinti, kai mažinimas nepadeda. [Imtis ir biudžetai](sampling-and-budgets.md#the-adaptive-budget) |
| **Tikslinis FPS** | 60 | 20–240 (1000 su rankena). Reikšmės žemiau 15 traktuojamos kaip 15. |
| **Pradiniai spraitai / kadrą** / **Spraitai / kadrą** | 4,00 mln. | 65 536–268 435 456, logaritminė skalė. Vadinama *Pradiniai*, kai įjungtas prisitaikantis biudžetas, nes valdiklis ją keičia. |
| **Šilumos raiška** | 100 % | 25–100 %. Fragmento kaina auga kvadratu: 50 % sumažina maišymo darbą keturis kartus, o šilumos laukas yra toks glotnus, kad tai beveik nesimato. |
| **Laipsniškas tikslinimas** | įjungta | Kaupti kadrus, kol vaizdas stovi. Išjungus, kiekvieną kadrą rodomas vieno kadro įvertinimas. [Kaupimas](accumulation.md) |
| **Išteklių biudžetai** | aptikti | RAM, GPU ir analizatoriaus gijų biudžetai. [Atmintis ir biudžetai](memory-and-budgets.md#resource-budgets) |

Nė vienas iš jų neišsaugomas; perkrovus puslapį grįžtama prie numatytųjų reikšmių.

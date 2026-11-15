---
title: "Klaviatūros ir pelės nuoroda"
parent: "Kamera ir valdymas"
nav_order: 2
lang: "lt"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Klaviatūros ir pelės nuoroda

Visi klavišai ir pelės veiksmai vienoje vietoje, kad rastumėte reikalingą. Pirmiausia spustelėkite vaizdą, kad jis gautų klaviatūros fokusą. Klavišai ignoruojami, kol fokusas yra teksto laukelyje ar išskleidžiamajame sąraše. Trumpa versija taip pat rodoma vaizdo apačios kairėje.

Greita paieška:

| Noriu ... | Paspauskite |
|---|---|
| skristi | `W A S D`, vilkite, kad žiūrėtumėte |
| pamatyti viską | `F` |
| leisti arba pristabdyti | `K` |
| leisti atgal | `J` (dar kartą paspauskite, kad pristabdytumėte), pirmyn `L` |
| pamatyti, ką reiškia spalvos | `?` arba `F1` |
| anuliuoti Taktikos skirtuke | `Ctrl+Z` |

## Kamera {#camera}

Iš [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Įvestis | Poveikis |
|---|---|
| `W` / `↑` | Pirmyn žiūrėjimo kryptimi |
| `S` / `↓` | Atgal |
| `A` / `←` | Slinkti į kairę |
| `D` / `→` | Slinkti į dešinę |
| `Space` / `E` | Aukštyn |
| `Q` / kairysis `Ctrl` | Žemyn |
| `Shift` (bet kuris) | Laikyti: 6× greitis |
| kairysis `Alt` | Laikyti: 15 % greičio |
| Kairysis ar dešinysis vilkimas vaizde | Žiūrėti (žymeklis užfiksuotas, kol laikomas mygtukas) |
| Ratukas (perspektyva) | Skridimo greitis ×1,5 vienam spragtelėjimui (daugiausia 4 spragtelėjimai vienam ratuko įvykiui) |
| Ratukas (lygiagretus) | Mastelis |
| Dešinysis spragtelėjimas | Vaizde neatveria kontekstinio meniu |

## Visuotiniai {#global}

Iš [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Klavišas | Poveikis |
|---|---|
| `K` | Leisti / pristabdyti [laiko juostą](timeline.md) |
| `F` | Pritaikyti duomenis rodymui |
| `C` | Nukopijuoti kameros padėtį, posūkį ir polinkį ([kameros rodmuo](camera.md#camera-readout)) |
| `G` | Eiti į įvestą tašką: atsidaro dėžutė po kameros rodmeniu |
| `Esc` | Uždaryti pasirinkimo kortelę; tada nebežiūrėti į antrąjį vienetą; tada nebesekti vieneto |
| `T` | Taktinio rodymo vaizdas įjungtas arba išjungtas ([Rungtynių pakartojimas](match-replay.md#display-style)) |
| `?` / `F1` | Pagalbos režimas: ką reiškia spalvos ([Nustatymai, vienetai ir klavišai](settings.md#help-mode)) |
| `1` | [Šiluma](heat.md) |
| `2` | [Skirtumas](difference.md) |
| `3` | [Komandų šiluma](team-heat.md) |
| `4` | [Linijos](line-heat.md) |
| `]` | Tolimoji atmetimo riba išstumiama ×1,12 (`Shift`: ×1,35) |
| `[` | Tolimoji atmetimo riba įtraukiama ÷1,12 (`Shift`: ÷1,35) |
| `\` | Tolimoji atmetimo riba išjungiama / vėl įjungiama ten, kur buvo ([Gylis ir atrinkimas](depth-and-culling.md#keyboard)) |

Režimas **Figūrų sutapdinimas** neturi skaitmeninio klavišo; pasirinkite jį režimų juostoje arba atidarykite skirtuką Rungtynės. Skaitmeniniai klavišai eina per tą patį patikrinimą kaip ir režimų juosta: klavišas režimui, kurį juosta rodo kaip neprieinamą įkeltiems duomenims, nieko nedaro.

## Rungtynių pakartojimas {#match-replay}

Režime Figūrų sutapdinimas, kurį naudoja skirtukas Rungtynės ([Rungtynių pakartojimas](match-replay.md)). Jie veikia, kai vienetas sekamas arba ne, išskyrus atvejus, kai nurodyta kitaip:

| Klavišas | Poveikis |
|---|---|
| `B` | Pridėti žymę: momentą ir kamerą |
| `M` | 2D žemėlapis: kampe, visame vaizde, išjungtas |
| `V` / `Shift+V` | Kitas / ankstesnis kameros vaizdas sekamam vienetui |
| `H` | Galvos ekranas kabinoje ir padlock vaizduose |
| `Page Down` / `Page Up` | Kitas / ankstesnis įvykis tų rūšių, kurias rodo įvykių sąrašas |
| `J` | Leisti atgal; dar kartą – pristabdyti |
| `L` | Leisti pirmyn; dar kartą – pristabdyti |
| `.` / `,` | Viena sekundė pirmyn / atgal, pristabdyta (`Shift`: dešimt sekundžių) |
| `Esc` | Pirmiausia nebežiūrėti į taikinį, tada nebesekti |
| `Ctrl`+spustelėjimas arba `Alt`+spustelėjimas ant vieneto (vaize ar vienetų sąraše) | Žiūrėti į jį iš sekamo vieneto (dviejų vienetų vaizdas); dar kartą spustelėkite, kad atleistumėte |
| `Shift`+spustelėjimas ant dviejų vienetų | Matuoti tarp jų: kryptį, nuotolį, aukščių skirtumą |

`V` reikia sekamo vieneto. Čia `M` yra 2D žemėlapis, o skirtuke Taktika – „perkelti“.

## Sekamas vienetas {#following-a-unit}

Kol kamera seka vienetą, ratukas ir skridimo klavišai sukasi aplink vienetą, o ne skrenda laisvai ([Kamera](camera.md#while-following-a-unit)):

| Įvestis | Poveikis |
|---|---|
| Ratukas, `W` / `S` | Arčiau / toliau (aukščiau / žemiau palydovo vaizde). Ne kabinos ir padlock vaizduose. |
| `A` / `D`, `Q` / `E` | Skrieti orbita aplink vienetą (persekiojimo ir orbitos vaizdai) |
| Vilkimas | Žiūrėti aplink vienetą; kabinoje – žiūrėti vidumi |
| `V` / `Shift+V` | Kitas / ankstesnis kameros vaizdas |
| `H` | Galvos ekranas (kabinos ir padlock vaizdai) |
| `Esc` | Nebežiūrėti į antrąjį vienetą, tada nebesekti |

## Taktikos lenta {#tactics-board}

Skirtuke Taktika ([Taktikos lenta](tactics-board.md)). `F`, `C`, `G` ir `T` veikia kaip aukščiau; skaitmeniniai klavišai nieko nedaro.

| Klavišas | Poveikis |
|---|---|
| `Ctrl+Z` | Anuliuoti |
| `Ctrl+Y` arba `Ctrl+Shift+Z` | Atkurti |
| `Enter` | Baigti piešiamą rodyklę (tą patį daro dvigubas spustelėjimas arba dešinysis spustelėjimas) |
| `Esc` | Atšaukti vilkimą; kitaip – nuimti rodyklę arba vykstantį perkėlimą; kitaip – panaikinti pasirinkimą |
| `Delete` arba `Backspace` | Ištrinti pasirinkimą |
| `W` / `E` / `R` | Perkėlimo / sukimo / keitimo įrankis pasirinkimui (klavišų schema **W / E / R**) |
| `G` / `R` / `S` | Perkėlimo / sukimo / keitimo įrankis pasirinkimui (klavišų schema **G / R / S**) |
| `R` | Nieko nepasirinkus: kitą figūrą, kurią dėsite, pasukti 15°. `Shift+R` grąžina atgal. |
| `M` | Pasirinkus figūrą: perkelti ją į kitą spustelėjimą |
| `K` | Leisti arba pristabdyti planą |
| Shift+spustelėjimas | Pridėti prie pasirinkimo arba pašalinti iš jo |
| Shift+vilkimas | Nubrėžti stačiakampį, apimantį tai, ką pasirinkti |
| `Ctrl` vilkiant rankenėlę | Prisitraukti prie tinklelio arba kampo žingsnio |

Keitimo įrankio klavišai veikia tik kai kažkas pasirinkta; jei nieko nepasirinkta, `W A S D` skrieja kamera įprastai.

## Spustelėjimas, kad pasirinktumėte {#click-to-pick}

Kai įjungta **Spustelėjus parodoma, kas ten yra** ir išjungta liniuotė ([Spustelėjimas, kad pasirinktumėte](camera.md#click-to-pick)):

| Įvestis | Poveikis |
|---|---|
| Kairysis spustelėjimas (be vilkimo daugiau nei 4 px) | Parodo duomenų tašką arba, jei jo nėra, vietą lygyje po žymekliu |

## Matavimas {#measure}

Kai įjungta **Liniuotė įjungta** ([Matavimas](measure.md)):

| Įvestis | Poveikis |
|---|---|
| Kairysis spustelėjimas (be vilkimo daugiau nei 4 px) | Įdeda tašką |
| Dešinysis spustelėjimas | Pašalina paskutinį tašką |

## Kitur {#elsewhere}

| Kur | Įvestis | Poveikis |
|---|---|---|
| Bet kurio slankiklio rankenėlė (šalia skaičiaus) | Vilkti aukštyn / žemyn | Keisti reikšmę sklandžiai, tuo greičiau, kuo toliau vilkate; laikykite `Shift`, kad reguliuotumėte smulkiai. Atleiskite, kad sustotumėte. |
| Skridimo greičio rodmuo virš vaizdo | Vilkti aukštyn / žemyn | Keisti skridimo greitį tuo pačiu būdu. |
| Padėties langeliai | `Enter` | Pritaikyti įvestą padėtį ar orientaciją. |
| Kreivės redaktorius | Dvigubas spustelėjimas / Alt-spustelėjimas / dešinysis spustelėjimas | Pridėti tašką / pašalinti tašką ([Spraito forma](sprite-shape.md#the-curve-editor)). |

## Lenktynių analizės skirtukas {#race-analysis-tab}

Skirtuke Lenktynių analizė `K` leidžia ir pristabdo lenktynių pakartojimą, `Home` jį grąžina atgal, o skaitmeniniai klavišai nieko nedaro. Žr. [Lenktynių analizė](race-analysis.md).

## Klavišai, kuriuos peržiūra palieka naršyklei {#keys-the-viewer-keeps-from-the-browser}

Kai kurie naršyklės spartieji klavišai uždarytų ar perkrautų puslapį ir prarastų įkeltą sesiją; peržiūra juos palieka sau. Sąrašas sugeneruojamas iš kodo: [Naršyklės klavišai](ref-browser-keys.md).

## Žaidimų pultas {#gamepad}

Žr. [Žaidimų pultas ir HOTAS](gamepad.md).

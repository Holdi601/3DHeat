---
title: "Referenca e tastierës dhe miut"
parent: "Kamera dhe kontrollet"
nav_order: 2
lang: "sq"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---


# Referenca e tastierës dhe miut

Çdo veprim me tastierë dhe mi në një vend, që ta gjesh atë që të duhet. Kliko së pari mbi pamjen, që të ketë tastierën. Tastet shpërfillen kur një kuti teksti ose një listë me zgjedhje ka fokusin. Versioni i shkurtër shtypet edhe në fund majtas të pamjes.

Gjetësi i shpejtë:

| Dua të ... | Shtyp |
|---|---|
| fluturoj | `W A S D`, tërhiq për të shikuar |
| shoh gjithçka | `F` |
| luaj ose pauzo | `K` |
| luaj prapa | `J` (shtyp përsëri për pauzë), përpara `L` |
| shoh çfarë do të thotë çdo ngjyrë | `?` ose `F1` |
| zhbëj te skeda Taktikat | `Ctrl+Z` |

## Kamera {#camera}

Nga [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Hyrja | Efekti |
|---|---|
| `W` / `↑` | Përpara sipas drejtimit të shikimit |
| `S` / `↓` | Prapa |
| `A` / `←` | Lëviz majtas anash |
| `D` / `→` | Lëviz djathtas anash |
| `Space` / `E` | Lart |
| `Q` / `Ctrl` i majtë | Poshtë |
| `Shift` (njëri prej tyre) | Mbaje: 6× shpejtësi |
| `Alt` i majtë | Mbaje: 15% shpejtësi |
| Tërheqje me butonin e majtë ose të djathtë mbi pamje | Shikim (treguesi kyçet ndërsa mbahet butoni) |
| Rrota (perspektivë) | Shpejtësia e fluturimit ×1,5 për hap (më së shumti 4 hapa për një ngjarje të rrotës) |
| Rrota (paralele) | Zmadhim |
| Klik i djathtë | Nuk hapet menu kontekstuale mbi pamje |

## Të përgjithshme {#global}

Nga [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tasti | Efekti |
|---|---|
| `K` | Luaj / pauzo [kronologjinë](timeline.md) |
| `F` | Përshtat të dhënat në kuadër |
| `C` | Kopjo pozicionin e kamerës, drejtimin dhe pjerrësinë ([leximi i kamerës](camera.md#camera-readout)) |
| `G` | Shko te një pikë e shkruar: hap kutinë nën leximin e kamerës |
| `Esc` | Mbyll kartelën e zgjedhjes; pastaj ndal shikimin e njësisë së dytë; pastaj ndal ndjekjen e një njësie |
| `T` | Pamja taktike e ndezur ose e fikur ([Riluajtja e ndeshjes](match-replay.md#display-style)) |
| `?` / `F1` | Modaliteti i ndihmës: çfarë do të thotë çdo ngjyrë ([Cilësimet, njësitë dhe tastet](settings.md#help-mode)) |
| `1` | [Nxehtësi](heat.md) |
| `2` | [Diferencë](difference.md) |
| `3` | [Nxehtësi ekipi](team-heat.md) |
| `4` | [Vija](line-heat.md) |
| `]` | Kufiri i largët i prerjes del jashtë ×1,12 (`Shift`: ×1,35) |
| `[` | Kufiri i largët i prerjes hyn brenda ÷1,12 (`Shift`: ÷1,35) |
| `\` | Kufiri i largët fiket / ndizet përsëri aty ku ishte ([Thellësia dhe heqja e pjesëve të padukshme](depth-and-culling.md#keyboard)) |

Modaliteti **Mbivendosje figurash** nuk ka tast numri; zgjidhe te shiriti i modaliteteve ose hap skedën Ndeshja. Tastet numra kalojnë të njëjtën kontroll si shiriti i modaliteteve: një tast për një modalitet që shiriti e shfaq si të padisponueshëm për të dhënat e ngarkuara nuk bën asgjë.

## Riluajtja e ndeshjes {#match-replay}

Në modalitetin Mbivendosje figurash, që përdor skeda Ndeshja ([Riluajtja e ndeshjes](match-replay.md)). Punojnë kur një njësi ndiqet ose jo, përveç rasteve të shënuara:

| Tasti | Efekti |
|---|---|
| `B` | Shto një shënues: momentin dhe kamerën |
| `M` | Harta 2D: në qoshe, pamja e plotë, fikur |
| `V` / `Shift+V` | Pamja e radhës / e mëparshme e kamerës për njësinë e ndjekur |
| `H` | Ekrani përpara te kabina dhe pamjet padlock |
| `Page Down` / `Page Up` | Ngjarja e radhës / e mëparshme e llojeve që shfaq lista e ngjarjeve |
| `J` | Luaj prapa; përsëri, për pauzë |
| `L` | Luaj përpara; përsëri, për pauzë |
| `.` / `,` | Një sekondë përpara / prapa, në pauzë (`Shift`: dhjetë sekonda) |
| `Esc` | Ndal shikimin e objektivit së pari, pastaj ndal ndjekjen |
| `Ctrl`+klik ose `Alt`+klik mbi një njësi (te pamja ose te lista e njësive) | Shiko nga njësia e ndjekur (pamja me dy njësi); kliko përsëri për ta hequr |
| `Shift`+klik mbi dy njësi | Matja midis tyre: drejtimi, distanca, ndryshimi i lartësisë |

`V` kërkon një njësi të ndjekur. `M` është harta 2D këtu, dhe "lëviz" te skeda Taktikat.

## Ndjekja e një njësie {#following-a-unit}

Kur kamera ndjek një njësi, rrota dhe tastet e fluturimit e drejtojnë rreth njësisë, në vend që të fluturojnë të lira ([Kamera](camera.md#while-following-a-unit)):

| Hyrja | Efekti |
|---|---|
| Rrota, `W` / `S` | Më afër / më larg (më lart / më ulët te pamja satelitore). Jo te pamjet e kabinës dhe padlock. |
| `A` / `D`, `Q` / `E` | Orbitë rreth njësisë (pamjet ndjekje dhe orbitë) |
| Tërheqje | Shiko rreth njësisë; te kabina, shiko brenda saj |
| `V` / `Shift+V` | Pamja e radhës / e mëparshme e kamerës |
| `H` | Ekrani përpara (pamjet e kabinës dhe padlock) |
| `Esc` | Ndal shikimin e njësisë së dytë, pastaj ndal ndjekjen |

## Tabela e taktikave {#tactics-board}

Te skeda Taktikat ([Tabela e taktikave](tactics-board.md)). `F`, `C`, `G` dhe `T` punojnë si më sipër; tastet numra nuk bëjnë asgjë.

| Tasti | Efekti |
|---|---|
| `Ctrl+Z` | Zhbën |
| `Ctrl+Y` ose `Ctrl+Shift+Z` | Ribën |
| `Enter` | Mbyll shigjetën që po vizatohet (klik i dyfishtë ose klik i djathtë bën të njëjtën gjë) |
| `Esc` | Anulon një tërheqje; ndryshe heq shigjetën ose lëvizjen në vazhdim; ndryshe heq zgjedhjen |
| `Delete` ose `Backspace` | Fshin zgjedhjen |
| `W` / `E` / `R` | Veglë lëvizjeje / rrotullimi / përmasash për zgjedhjen (skema e tasteve **W / E / R**) |
| `G` / `R` / `S` | Veglë lëvizjeje / rrotullimi / përmasash për zgjedhjen (skema e tasteve **G / R / S**) |
| `R` | Pa asgjë të zgjedhur: rrotull figurën e radhës për ta vendosur me 15°. `Shift+R` e kthen mbrapsht. |
| `M` | Me një figurë të zgjedhur: e zhvendos te klikimi i radhës |
| `K` | Luaj ose pauzo planin |
| Shift+klik | Shto ose hiq nga zgjedhja |
| Shift+tërheqje | Vizato një kuti rreth asaj që do të zgjidhet |
| `Ctrl` gjatë tërheqjes së një doreze | Kapet në rrjetën ose në hapin e këndit |

Tastet e veglës punojnë vetëm kur diçka është zgjedhur; kur nuk është zgjedhur asgjë, `W A S D` fluturojnë kamerën si zakonisht.

## Klik-për-zgjedhje {#click-to-pick}

Me **Klikimi tregon çfarë ka aty** të ndezur dhe vizoren të fikur ([Klik-për-zgjedhje](camera.md#click-to-pick)):

| Hyrja | Efekti |
|---|---|
| Klik i majtë (pa tërhequr më shumë se 4 px) | Tregon pikën e të dhënave, ose ndryshe vendin mbi nivel, nën tregues |

## Matja {#measure}

Me **Vizorja aktive** ([Matja](measure.md)):

| Hyrja | Efekti |
|---|---|
| Klik i majtë (pa tërhequr më shumë se 4 px) | Vendos një pikë |
| Klik i djathtë | Heq pikën e fundit |

## Gjetkë {#elsewhere}

| Ku | Hyrja | Efekti |
|---|---|---|
| Doreza e çdo rrëshqitësi (dorezë pranë numrit) | Tërhiq lart / poshtë | Ndryshon vlerën pa ndërprerje, më shpejt sa më larg të tërheqësh; mbaje `Shift` për rregullim të imët. Lësho për të ndaluar. |
| Shfaqja e shpejtësisë mbi pamje | Tërhiq lart / poshtë | Ndryshon shpejtësinë e fluturimit në të njëjtën mënyrë. |
| Kutitë e pozës | `Enter` | Aplikon pozicionin ose orientimin e shkruar. |
| Redaktori i kurbës | Klik i dyfishtë / Alt-klik / klik i djathtë | Shton një pikë / heq një pikë ([Forma e sprite-it](sprite-shape.md#the-curve-editor)). |

## Skeda Analiza e garës {#race-analysis-tab}

Te skeda Analiza e garës, `K` luan dhe pauzon riluajtjen e garës, `Home` e kthen prapa, dhe tastet numra nuk bëjnë asgjë. Shih [Analiza e garës](race-analysis.md).

## Tastet që shfletuesi i lë shikuesit {#keys-the-viewer-keeps-from-the-browser}

Disa shkurtore të shfletuesit do ta mbyllnin ose rifreskonin faqen dhe do të humbnin një seancë të ngarkuar; shikuesi i mban ato për vete. Lista gjenerohet nga kodi: [Tastet e shfletuesit](ref-browser-keys.md).

## Gamepad {#gamepad}

Shih [Gamepad dhe HOTAS](gamepad.md).

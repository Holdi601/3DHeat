---
title: "Tastatūras un peles uzziņa"
parent: "Kamera un vadība"
nav_order: 2
lang: "lv"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Tastatūras un peles uzziņa

Visi taustiņi un peles darbības vienuviet, lai atrastu vajadzīgo. Vispirms noklikšķini uz skata, lai tam būtu tastatūra. Taustiņi tiek ignorēti, kamēr fokusā ir teksta lodziņš vai nolaižamais saraksts. Īsā versija tiek rādīta arī skata apakšējā kreisajā stūrī.

Ātrais meklētājs:

| Es gribu ... | Nospied |
|---|---|
| lidot | `W A S D`, velc, lai skatītos |
| redzēt visu | `F` |
| atskaņot vai pauzēt | `K` |
| atskaņot atpakaļ | `J` (nospied vēlreiz, lai pauzētu), uz priekšu `L` |
| redzēt, ko krāsas nozīmē | `?` vai `F1` |
| atsaukt Taktikas cilnē | `Ctrl+Z` |

## Kamera {#camera}

No [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Ievade | Efekts |
|---|---|
| `W` / `↑` | Uz priekšu pa skata virzienu |
| `S` / `↓` | Atpakaļ |
| `A` / `←` | Pabīdīties pa kreisi |
| `D` / `→` | Pabīdīties pa labi |
| `Space` / `E` | Uz augšu |
| `Q` / kreisais `Ctrl` | Uz leju |
| `Shift` (jebkurš) | Turi: 6× ātrums |
| kreisais `Alt` | Turi: 15% ātrums |
| Kreisā vai labā poga, velkot skatā | Skatīties (rādītājs ir fiksēts, kamēr poga ir nospiesta) |
| Ritenītis (perspektīva) | Lidošanas ātrums ×1,5 par katru pakāpi (ne vairāk kā 4 pakāpes vienam ritenīša notikumam) |
| Ritenītis (paralēle) | Tālummaiņa |
| Labais klikšķis | Virs skata neatveras konteksta izvēlne |

## Globāli {#global}

No [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Taustiņš | Efekts |
|---|---|
| `K` | Atskaņot vai pauzēt [laika skalu](timeline.md) |
| `F` | Ietvert datus kadrā |
| `C` | Kopēt kameras pozīciju, virzienu (yaw) un slīpumu (pitch) ([kameras rādījums](camera.md#camera-readout)) |
| `G` | Doties uz ievadītu punktu: atver lodziņu zem kameras rādījuma |
| `Esc` | Aizvērt izvēlētās vietas kartīti; tad pārtraukt skatīties uz otru vienību; tad pārtraukt sekot vienībai |
| `T` | Taktiskā attēlojuma skats ieslēgts vai izslēgts ([Spēles atkārtojums](match-replay.md#display-style)) |
| `?` / `F1` | Palīdzības režīms: ko nozīmē krāsas ([Iestatījumi, mērvienības un taustiņi](settings.md#help-mode)) |
| `1` | [Siltums](heat.md) |
| `2` | [Starpība](difference.md) |
| `3` | [Komandu siltums](team-heat.md) |
| `4` | [Līniju siltums](line-heat.md) |
| `]` | Tālo robežu uz āru ×1,12 (`Shift`: ×1,35) |
| `[` | Tālo robežu uz iekšu ÷1,12 (`Shift`: ÷1,35) |
| `\` | Tālo robežu izslēgt vai ieslēgt atpakaļ tur, kur tā tika atstāta ([Dziļums un nogriešana](depth-and-culling.md#keyboard)) |

Režīmam **Figūru pārklājums** nav cipara taustiņa. Izvēlies to režīmu joslā vai atver cilni Mačs. Cipara taustiņi iet caur to pašu pārbaudi, ko režīmu josla: taustiņš režīmam, ko josla rāda kā nepieejamu ielādētajiem datiem, nedara neko.

## Spēles atkārtojums {#match-replay}

Figūru pārklājuma režīmā, ko izmanto cilne Mačs ([Spēles atkārtojums](match-replay.md)). Tie darbojas neatkarīgi no tā, vai vienība tiek sekota vai nē, izņemot vietas, kur tas ir atzīmēts:

| Taustiņš | Efekts |
|---|---|
| `B` | Pievienot grāmatzīmi: brīdi un kameru |
| `M` | 2D karte: stūrī, visā skatā, izslēgta |
| `V` / `Shift+V` | Nākamais / iepriekšējais kameras skats sekotajai vienībai |
| `H` | Galvas displejs kabīnes un padlock skatos |
| `Page Down` / `Page Up` | Nākamais / iepriekšējais notikums tajos veidos, ko rāda notikumu saraksts |
| `J` | Atskaņot atpakaļ; vēlreiz, lai pauzētu |
| `L` | Atskaņot uz priekšu; vēlreiz, lai pauzētu |
| `.` / `,` | Sekunde uz priekšu / atpakaļ, pauzēts (`Shift`: desmit sekundes) |
| `Esc` | Vispirms pārtraukt skatīties uz mērķi, tad pārtraukt sekot |
| `Ctrl`+klikšķis vai `Alt`+klikšķis uz vienības (skatā vai vienību sarakstā) | Skatīties uz to no sekotās vienības (divu vienību skats); klikšķini vēlreiz, lai to noņemtu |
| `Shift`+klikšķis uz divām vienībām | Izmērīt starp tām: virzienu, attālumu, augstuma starpību |

`V` prasa sekotu vienību. `M` šeit ir 2D karte, un "pārvietot" ir Taktikas cilnē.

## Sekojot vienībai {#following-a-unit}

Kamēr kamera seko vienībai, ritenītis un lidošanas taustiņi manevrē ap vienību, nevis lido brīvi ([Kamera un vadība](camera.md#while-following-a-unit)):

| Ievade | Efekts |
|---|---|
| Ritenītis, `W` / `S` | Tuvāk / tālāk (augstāk / zemāk satelīta skatā). Nav kabīnes un padlock skatos. |
| `A` / `D`, `Q` / `E` | Orbīta ap vienību (dzīšanas un orbītas skatos) |
| Velkot | Skatīties apkārt vienībai; kabīnē skatīties iekšā |
| `V` / `Shift+V` | Nākamais / iepriekšējais kameras skats |
| `H` | Galvas displejs (kabīnes un padlock skati) |
| `Esc` | Pārtraukt skatīties uz otru vienību, tad pārtraukt sekot |

## Taktikas tāfele {#tactics-board}

Cilnē Taktika ([Taktikas tāfele](tactics-board.md)). `F`, `C`, `G` un `T` darbojas kā iepriekš; cipara taustiņi nedara neko.

| Taustiņš | Efekts |
|---|---|
| `Ctrl+Z` | Atsaukt |
| `Ctrl+Y` vai `Ctrl+Shift+Z` | Atkārtot |
| `Enter` | Pabeigt zīmējamo bultiņu (divkāršs klikšķis vai labais klikšķis dara to pašu) |
| `Esc` | Atcelt vilkšanu; citādi nomest bultiņu vai notiekošo pārvietošanu; citādi noņemt atlasi |
| `Delete` vai `Backspace` | Dzēst atlasi |
| `W` / `E` / `R` | Pārvietošanas / Pagriešanas / Mērogošanas rīks atlasei (shēma **W / E / R**) |
| `G` / `R` / `S` | Pārvietošanas / Pagriešanas / Mērogošanas rīks atlasei (shēma **G / R / S**) |
| `R` | Kad nekas nav atlasīts: pagriezt nākamo novietojamo figūru par 15°. `Shift+R` to pagriež atpakaļ. |
| `M` | Kad figūra ir atlasīta: pārvietot to uz nākamo klikšķi |
| `K` | Atskaņot vai pauzēt plānu |
| Shift+klikšķis | Pievienot atlasei vai noņemt no tās |
| Shift+velkot | Zīmēt kasti ap to, ko atlasīt |
| `Ctrl`, velkot rokturi | Piesaistīt režģim vai leņķa solim |

Rīka taustiņi darbojas tikai tad, kad kaut kas ir atlasīts. Ja nekas nav atlasīts, `W A S D` lido kameru kā parasti.

## Klikšķis, lai izvēlētos {#click-to-pick}

Kad **Klikšķis parāda, kas tur ir** ir ieslēgts un lineāls ir izslēgts ([Kamera un vadība](camera.md#click-to-pick)):

| Ievade | Efekts |
|---|---|
| Kreisais klikšķis (bez vilkšanas vairāk par 4 px) | Parādīt datu punktu vai, ja tāda nav, vietu līmenī zem rādītāja |

## Mērīšana {#measure}

Kad **Lineāls aktīvs** ([Mērīšana](measure.md)):

| Ievade | Efekts |
|---|---|
| Kreisais klikšķis (bez vilkšanas vairāk par 4 px) | Nomest punktu |
| Labais klikšķis | Noņemt pēdējo punktu |

## Citur {#elsewhere}

| Kur | Ievade | Efekts |
|---|---|---|
| Jebkura slīdņa rokturis (blakus skaitlim) | Velc uz augšu / leju | Mainīt vērtību nepārtraukti, jo tālāk velc, jo ātrāk. Turi `Shift` smalkai regulēšanai. Atlaid, lai apturētu. |
| Ātruma rādījums virs skata | Velc uz augšu / leju | Mainīt lidošanas ātrumu tāpat. |
| Pozas lodziņi | `Enter` | Pielietot ievadīto pozīciju vai orientāciju. |
| Līknes redaktors | Dubultklikšķis / Alt-klikšķis / labais klikšķis | Pievienot punktu / noņemt punktu ([Sprite forma](sprite-shape.md#the-curve-editor)). |

## Sacīkšu analīzes cilne {#race-analysis-tab}

Cilnē Sacīkšu analīze `K` atskaņo un pauzē sacīkšu atkārtojumu, `Home` to attin atpakaļ, un cipara taustiņi nedara neko. Skat. [Sacīkšu analīze](race-analysis.md).

## Taustiņi, ko skatītājs patur no pārlūka {#keys-the-viewer-keeps-from-the-browser}

Daži pārlūka saīsnes aizvērtu vai pārlādētu lapu un zaudētu ielādēto sesiju. Skatītājs tos patur sev. Saraksts tiek ģenerēts no koda: [Pārlūka taustiņi](ref-browser-keys.md).

## Spēļu pults {#gamepad}

Skat. [Spēļu pults un HOTAS](gamepad.md).

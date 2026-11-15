---
title: "Kamera un vadība"
nav_order: 14
has_children: true
lang: "lv"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera un vadība

Jūs lidojat pa ainu kā putns: **W A S D**, lai pārvietotos, velciet peli, lai skatītos apkārt. Izmantojiet šo lapu, lai lidotu, pārietu uz augšējo vai sānu skatu un precīzi izlasītu, kur atrodas kamera.

## Lidojums 4 soļos {#fly-in-4-steps}

1. Vienu reizi noklikšķiniet uz skata, lai tas saņemtu tastatūru.
2. Turiet **W**, lai lidotu uz priekšu, **S** - atpakaļ, **A** un **D** - sāniski, **Atstarpe** - uz augšu, **Q** - uz leju.
3. Turiet kreiso vai labo peles pogu un velciet, lai skatītos apkārt.
4. Nospiediet **F**, lai atkal ietvertu visus datus.

Kamera ir brīvās lidošanas kamera ar perspektīvu un paralēlo projekciju, iepriekš iestatītiem skatiem, ierakstītu pozu un asuma dziļumu. Tās iestatījumi ir panelī **Kamera un aina** sānjoslas apakšā (rāda arī cilnēs Sacīkšu analīze un Mačs). Ieviešana ir [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Lidošana {#flying}

| Ievade | Efekts |
|---|---|
| `W` `A` `S` `D` vai bultiņu taustiņi | Uz priekšu (pa skatu, ieskaitot tā slīpumu), pa kreisi, atpakaļ, pa labi |
| `Space` vai `E` | Uz augšu (pasaules augšup) |
| `Q` vai kreisais `Ctrl` | Uz leju |
| `Shift` (turēts) | 6 reizes ātrāk |
| kreisais `Alt` (turēts) | 15% ātruma |
| Vilkšana ar kreiso vai labo peles pogu | Skatīties apkārt. Rādītājs velkot ir bloķēts. |
| Peles ritenītis | Lidošanas ātrums ×1,5 par katru soli (perspektīva); tālummaiņa (paralēli) |
| `F` | Ietvert datus |
| Klikšķis (bez vilkšanas) | Parādīt, kas atrodas zem rādītāja ([Skata pārbaude](#inspecting-the-view)) |
| `C` | Kopēt kameras pozīciju, pagriezienu un slīpumu |
| `G` | Doties uz ierakstītu punktu |
| `Esc` | Aizvērt izvēles kartīti (un pārtraukt sekot vienībai) |

### Kamēr seko vienībai {#while-following-a-unit}

Kad kamera seko vienībai atskaņojumā ([Mača atskaņojums](match-replay.md)), lidošanas taustiņi dara ko citu:

| Ievade | Efekts |
|---|---|
| Ritenītis, `W` / `S` | Tuvāk vienībai / tālāk no tās (augstāk / zemāk satelīta skatā) |
| `A` / `D`, `Q` / `E` | Riņķot ap vienību (vajāšanas un orbītas skatos) |
| Vilkšana | Skatīties apkārt vienībai (kabīne: skatīties apkārt iekšpusē) |
| `V` / `Shift+V` | Nākamais / iepriekšējais kameras skats |
| `Esc` | Vispirms pārtraukt skatīties uz otru vienību, tad pārtraukt sekot |

Kustības taustiņi saskaitās kopā ar [spēļu pulti](gamepad.md); visu pārējo skatiet [taustiņu atsaucē](keyboard-reference.md). Taustiņi tiek ignorēti, kamēr fokusā ir teksta lauks vai nolaižamais saraksts. Slīpums ir ierobežots tieši pirms tiešas uz augšu un uz leju.

## Panelis Kamera un aina {#camera--scene-panel}

![Panelis Kamera un aina: Projekcija, Iepriekš iestatīti skati, Redzes lauka pogas, Lidošanas ātrums un Poza](../assets/img/en/camera-panel.webp)

### Projekcija {#projection}

**Projekcija**: *Perspektīva* (noklusējums) vai *Paralēla*.

*Paralēla* (ortogonāla) noņem saīsinājumu, tāpēc divi karstie punkti ar vienādu blīvumu izskatās vienāda izmēra jebkurā kadra vietā - salīdzinājums, kam kartes siltumkarte ir paredzēta - un tieši tas padara izometrisko skatu izometrisku. Paralēlajā režīmā peles ritenītis tālina (nav kustības uz priekšu, kas maina mērogu), un [ātruma rādījums](#fly-speed) ir paslēpts.

**Pārslēgšana saglabā objektu tādā pašā izmērā.** Paralēlai projekcijai nav redzes lauka, tāpēc tās skata piramīdas augstums nav saistīts ar kameras attālumu; vienkārša pārslēgšana vai stipri tālina, vai neko nerāda. Pārejot uz paralēlo, skata piramīdas augstums tiek uzstādīts uz to, ko perspektīvas kamera aptver fokusa attālumā (2 × attālums × tan(fov / 2); fokusa attālums ir pēdējās ietvēršanas attālums). Atgriežoties, tiek atjaunota perspektīvas poza, ko atstājāt, tajā pašā redzamajā mērogā, nevis tur, kur paralēlais skats bija aizklaiņojis.

### Iepriekš iestatīti skati {#preset-views}

| Grupa | Pogas | Orientācija |
|---|---|---|
| **Izometrija** | **NE**, **NW**, **SE**, **SW** | Paralēla, slīpums -35,264° (= atan(1/√2), leņķis, kurā visas trīs asis projicējas vienādā garumā), pagrieziens -45°, 45°, -135°, 135°. Četri stūri, jo viens vienmēr paslēpj pusi kartes aiz tā, kas ir tuvāk. |
| **Fasādes** | **Augša**, **Apakša**, **Priekša**, **Aizmugure**, **Kreisā**, **Labā** | Paralēla. Augša skatās tieši uz leju (slīpums -89,9°), Apakša - tieši uz augšu, Priekša - pa -Z (pagrieziens 0°), Aizmugure - pa +Z (180°), Kreisā - pa -X (-90°), Labā - pa +X (90°). |
| | **Atpakaļ uz perspektīvu** | Atgriezties perspektīvas pozā, ko atstājāt. Perspektīvā nav pieejama. |
| | **Trīs ceturkšņu skats** | Perspektīva, pagrieziens -35°, slīpums -28°. |

Katrs iepriekš iestatītais skats pārslēdz pašu projekciju - perspektīvā "augšējais skats" joprojām konverģē uz nekurieni, un vienādas platības pārstāj izskatīties vienādas - un ietver datus no šī virziena.

### Redzes lauks {#field-of-view}

**Redzes lauks** - vertikālais leņķis. Noklusējums 65°, 10-140° uz joslas (179° ar rokturi), ar pogām **Plakans 20°**, **Garš 35°**, **Normāls 50°**, **Plats 65°**, **Ļoti plats 90°**. Šaurs izlīdzina perspektīvu un vairāk atgādina paralēlu projekciju; plats pārspīlē dziļumu un apgrūtina attālumu novērtēšanu. Tas paliek aktīvs paralēlajā režīmā, kur tas uzstāda mērogu, uz kuru atgriešanās pārslēgšana atrisina, un attālumu, ko izmanto **Kadrs**.

### Lidošanas ātrums {#fly-speed}

**Lidošanas ātrums** - pasaules vienības (metri) sekundē pilnā gāzē. Noklusējums 120; katrā ielādē datu horizontālais izmērs / 12. Logaritmisks, 0,02-20 000 (200 000 ar rokturi; rokturis to maina ar attiecībām, nevis ar summām). Peles ritenītis to reizina vai dala ar 1,5 par katru soli, robežās 0,02-200 000.

Tā pati vērtība tiek rādīta skata apakšējā labajā stūrī (tikai perspektīvā): ātrums m/s vai km/s un laiks, cik ilgi aizlidot pāri datiem (vai līmenim, ja ielādēts 3D līmenis) ar šādu ātrumu. Velciet to augšup vai lejup, lai mainītu ātrumu.

### Tuvā un tālā {#near-and-far}

**Tuvā** (noklusējums 0,5) un **Tālā** (noklusējums 40 000) griezuma attālumi. Abus katrā ielādē pārrēķina no datiem (tuvā = max(0,05, izmērs / 20 000), tālā = izmērs × 12) un paplašina, nekad nesašaurina, ja 3D līmenis ir lielāks ([Līmeņi](levels.md#what-a-level-does-for-the-heat)). To attiecība nosaka dziļuma precizitāti, uz ko balstās aizsegšana, tāpēc ļoti maza tuvā vērtība kopā ar milzīgu tālo vērtību vājina [aizsegšanu](depth-and-culling.md). Skatoties no ārpuses vai augstu virs ainas zemes, faktiski izmantotā tuvā plakne pārvietojas uz 2% no šā attāluma, tāpēc karte, ko redz no tālienes, saglabā pietiekamu dziļuma precizitāti, lai ūdens un krasts nemirgotu; lodziņā joprojām tiek rādīta iestatītā vērtība.

### Citas vadības {#other-controls}

| Vadība | Noklusējums | Nozīme |
|---|---|---|
| **Apgriezt Y** | izslēgts | Apgriež peles skatīšanos uz augšu/uz leju. |
| **Asuma dziļums** | izslēgts | Skat. zemāk. |
| **Spēļu pults** | ieslēgts | Skat. [Spēļu pults un HOTAS](gamepad.md). |
| **Poza** | | Skat. zemāk. |
| **Pārbaude** | | Kameras rādījums, klikšķis-lai-izvēlētos, pagrieziena konvencija un *Doties uz punktu*; skat. [Skata pārbaude](#inspecting-the-view). |
| **Ietvert datu kopu (F)** | | Pielāgo datus (sacīkšu analīzes cilnē: aplus) skatam, saglabājot pašreizējo virzienu. Kamera tiek novietota r / tan(fov / 2) attālumā no centra, r ir pusdiagonāle datu robežām. |
| **Režģis**, **Asis** | ieslēgts, ieslēgts | Zemes režģis ar 1/2/5 × 10ⁿ soli apmēram 1/40 no datu apjoma (stiepjas līdz 1,5 × datiem, starp 8 un 120 režģa soļiem), un krāsainas asis. |
| **Apgriezt pasaules asi** X, Y, Z | izslēgts | Skat. zemāk. |

### Poza {#pose}

Pieci skaitļu lodziņi - **X**, **Y**, **Z** un **pagrieziens °**, **slīpums °** - kas seko kamerai, kamēr nevienam no tiem nav fokusa. Ierakstiet vērtību un nospiediet `Enter` (vai atstājiet lodziņu), lai pārvietotu kameru uz turieni. **kopēt** ieliek `pos X Y Z · yaw A · pitch B` starpliktuvē (ar `(game yaw)` aiz tā, ja izvēlēta šī konvencija). Lidošana ir veids, kā izpētīt; koordinātas ir veids, kā atkārtot skatu. Tie ir tie paši skaitļi, kas [kameras rādījumā](#camera-readout): datu pašu koordinātas, arī tad, kad ass ir apgriezta, un pagrieziens izvēlētajā [konvencijā](#yaw-conventions).

### Apgriezt pasaules asi {#invert-world-axis}

**Apgriezt pasaules asi X / Y / Z** zīmē pasauli ar šo asi apgrieztu. Spēle, kas patur kreisās rokas pasauli, šajā labās rokas skatītājā parādās spoguļattēlā - labās rokas līkumi tiek zīmēti kā kreisās rokas - un X vai Z apgriešana to atjauno. **Mainās tikai zīmējums**: dati, analīze un katra koordināta, ko rāda rīki (poza, lineāls, griezums), paliek spēles pašas. Skats apgriežas savā vietā, saglabājot jūs skatoties uz to pašu vietu. Šis iestatījums tiek atcerēts pārlūkprogrammā (`localStorage` atslēga `heat3d.mirror`); salīdziniet ar ielādes laika [apgriezienām](axes-units-and-time.md#flips), kas maina datus.

## Skata pārbaude {#inspecting-the-view}

Kur atrodas kamera, kas atrodas zem rādītāja, un došanās uz punktu - bloks **Pārbaude** panelī Kamera un aina, un divi pārklājumi skata augšējā kreisajā stūrī. Kods ir [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) un [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Vadība | Noklusējums | Nozīme |
|---|---|---|
| **Kameras pozīcija virs skata** | ieslēgts | Kameras rādījums, zemāk. Aizver arī ar savu **×**. |
| **Klikšķis parāda, kas tur ir** | ieslēgts | Klikšķis-lai-izvēlētos, zemāk. |
| **Pagrieziena konvencija** | Skatītājs | Kuru pagriezienu rāda un nolasa rādījums, pozas lodziņi un lēciena lodziņš. |

Šie trīs tiek atcerēti pārlūkprogrammā (`localStorage` atslēga `heat3d.inspect`).

### Kameras rādījums {#camera-readout}

Skata augšējā kreisajā stūrī: kameras **x**, **y**, **z**, **pagrieziens** un **slīpums** dzīvi, ar birku, kas nosauc pagrieziena konvenciju. Tie rāda tos pašus skaitļus kā [Poza](#pose) lodziņi un lidošanas laikā neprasa nekādus resursus (tas tiek rakstīts lapā kadru pulksteņa laikā, bez panelu atkārtotas renderēšanas).

- **kopēt** (vai `C` jebkur ārpus teksta lodziņa) ieliek `x X y Y z Z yaw A pitch B (viewer yaw)` starpliktuvē, ar `.` decimāldaļām neatkarīgi no valodas - rindu, ko lēciena lodziņš un jebkurš skripts var nolasīt atpakaļ.
- **doties uz** (vai `G`) atver lodziņu zem tā: ielīmējiet punktu un nospiediet `Enter`, lai to aplūkotu, vai ielīmējiet visu nokopēto pozu, lai nostātos tajā pašā skatā. `Esc` aizver lodziņu.

### Koordinātas: datu pašu sistēma {#coordinates-the-datas-own-frame}

Katra koordināta, ko pārbaudes rīki rāda vai pieņem, ir **ielādēto datu pašā sistēmā**: [asu kartējums](axes-units-and-time.md) ielādes laikā (augšējā ass, apgriezieni, mērogs) tiek atsaukts. Pozīcija, kas nolasīta no skata, ir tas skaitlis, ko satur avota tabula, un skaitlis no tabulas, ierakstīts lēciena lodziņā, nonāk tieši šajā vietā. Kad kartējums nemaina neko (Y augšup, nemērogota ielāde - tieši tā, ko raksta ierakstīšanas rīki un līmeņu eksportētāji), tā ir vienkārši pasaule; citādi rādījumā ir birka **datu sistēma**. Bez datu kopas koordinātas ir pasaules koordinātas. Pagrieziens un slīpums vienmēr attiecas uz skatītāja pasauli, Y augšup.

### Pagrieziena konvencijas {#yaw-conventions}

| Konvencija | Pagrieziens 0° skatās pa | Aug uz | Izmanto |
|---|---|---|---|
| **Skatītājs** | -Z | -X | brīvās lidošanas kamera, [iepriekš iestatīti skati](#preset-views) |
| **Spēle / ierakstīšanas rīki** | +X | -Z | ierakstīšanas rīku `yaw` kolonnas un pozas; līmenī, kas eksportēts skatītāja sistēmā, - spēles pašas pagrieziens |

Slīpums abās ir vienāds: uz augšu no horizontāles. Abi atšķiras par ceturtdaļu apgriezienu un nekas vairāk:

> skatītāja pagrieziens = spēles pagrieziens - 90°

Virziens `d` ir `(cos p · cos y, sin p, -cos p · sin y)` spēles konvencijā un `(-sin y · cos p, sin p, -cos y · cos p)` skatītāja. Izvēlieties **Spēle / ierakstīšanas rīki**, lai ierakstītu pagriezienu tieši no ierakstīšanas tabulas vai salīdzinātu rādījumu ar vienu no tām.

### Doties uz punktu {#going-to-a-point}

**Doties uz punktu**, bloka Pārbaude sadaļā (un rādījuma lodziņā **doties uz**):

- teksta lodziņš pieņem `x, y, z` vai `x y z` (vai `x; y; z`), ar punktu vai komatu decimāldaļai - `-321.6, 137.8, -59.9` un `-321,6 137,8 -59,9` ir tas pats punkts. Pieci skaitļi pievieno pagriezienu un slīpumu, un poza, nokopēta no rādījuma vai pozas lodziņiem, tiek nolasīta vesela, ieskaitot birkas un konvenciju;
- **pagrieziens °** un **slīpums °** (neobligāti) pagriež kameru izvēlētajā konvencijā;
- **Skatīties** saglabā virzienu (noliekts, lai skatītos uz leju vismaz 20°, ja tas skatījās horizontāli) un atkāpjas pa to līdz pašreizējam attālumam, turot starp 0,3% un 3% no ainas platuma - 6 līdz 60 m uz divu kilometru līmeņa. Fokusa attālums, paralēlā skata augstums un lidošanas ātrums seko, tātad skats ierodas lietojams;
- **Stāvēt šeit** novieto kameru uz punkta, pagriezta uz dotajiem pagriezienu un slīpumu, vai kā tā bija.

Ielīmēta poza ar savu pagriezienu un slīpumu vienmēr nostājas tajā skatā.

### Klikšķis-lai-izvēlētos {#click-to-pick}

Klikšķis uz skata - nospiest un atlaist, nevelkot vairāk par 4 pikseļiem; vilkšana joprojām skatās apkārt - parāda kartīti augšējā kreisajā stūrī ar to, kas atrodas zem rādītāja. Kamēr ir ieslēgts [lineāls](measure.md), klikšķi iet uz lineālu.

**Zīmēts datu punkts uzvar.** Tuvākais paraugs 8 pikseļu robežās no klikšķa, no tiem, kas faktiski ir uzzīmēti: rindas laika logā un dzīves ilgumā, kas iztur [filtrus](filters.md), rādītās grupas un starpības sadalījumu, attāluma atcelšanas robežās un griezumā, kas apgriež siltumu. Atskaņojumā ar kastēm - kaste zem rādītāja (jebkurā tās daļā). Kartīte uzskaita katru kolonnu, ko rinda satur, ar avota pašiem kolonnu nosaukumiem - laiks (sienas pulksteņa vai faila pašas sekundes ar `m:ss.ss`), persona, grupa, sesija, katra saglabātā kolonna, pozīcija un skatīšanās virziens - un attālumu no kameras. Atmiņā ir tikai kolonnas, ko ielāde paturēja: kolonna, kas nav izvēlēta kā [filtra kolonna](column-mapping.md), netiek rādīta.

**Citādi - līmeņa virsma**: punkts, kur klikšķa stars sastopas ar līmeņa īstajiem trijstūriem (nevis lineāla atsauces plakni), ar **daļu**, kurai tas pieder (eksportētāja nosaukums, `structure:props`, `ground:terrain …`), tā **veidu** (zeme, būve, ūdens, kartes attēls), koordinātām un attālumu. Ģeometrija, kas paslēpta ar griezumu vai attāluma atcelšanu, tiek izlaista. Kur līmenim ir [navigācijas tīkls](model-levels.md#navigation-meshes), rindā ir nosaukts tas un teikts, vai vieta atrodas uz tā (✓). Daļas nosaukums ar priekšā `≈` tika uzminēts no daļu ierobežojošajām kastēm, jo šī līmeņa daļa tika vienkāršota ielādes laikā.

Kartīte paliek, līdz to aizver (**×**, `Esc`), cits klikšķis atbild uz ko citu vai klikšķis uz tukšas vietas. Ainā punktā tiek zīmēts ciāna krusts un ekrānā pāri tam - gredzens. Tās pogas: **kopēt** (katra vērtība un koordinātas kā `x, y, z`), **Skatīties** un **Stāvēt šeit** (uz datu punkta, skatoties tā virzienā, kādā rinda skatījās, ja tai ir skatīšanās virziens; uz virsmas 1,7 m virs tās).

Līmenis tiek indeksēts izvēlei pie pirmā klikšķa, kam tas vajadzīgs: kolonnu režģis pār tā pamatni, būvēts dažu milisekunžu daļās starp kadriem, lai skats nekad nepārstātu darboties (apmēram sekunde darba līmenim ar vairākiem miljoniem trijstūru), un saglabāts, līdz līmenis mainās. Līdz tam kartīte rāda *Sagatavo līmeni izvēlei* ar procentiem un atbild uz klikšķi, kad tas ir gatavs. Datu punkta meklēšana pāri vairāk nekā četriem miljoniem uzzīmētu rindu tiek izkliedēta pa kadriem tādā pašā veidā.

## Asuma dziļums {#depth-of-field}

Sakļaujama sadaļa panelī Kamera un aina, ar nosaukumu *Asuma dziļums - ieslēgts*, kamēr tas ir ieslēgts. Noklusējumā izslēgts: tas ir prezentācijas efekts, un noklusējuma skatam jārāda dati, nevis to interpretācija.

| Vadība | Noklusējums | Diapazons (ritenis) | Nozīme |
|---|---|---|---|
| **Ieslēgts** | izslēgts | | |
| **Fokusēt uz ietverto** | ieslēgts | | Fokuss pie attāluma, ko izmantoja pēdējā ietvēršana (*Fokusēts uz N m.*). |
| **Fokusa attālums** | 1000 | 1-200 000, logaritmisks (10 000 000) | Rādīts, kad fokuss ir manuāls. |
| **Diafragma** | ±35% | ±2% līdz ±200%, logaritmisks (±3200%) | Dziļums, kas paliek ass, kā daļa no fokusa attāluma - relatīvs, nevis f-numurs, jo ainas svārstās no istabas līdz astoņu kilometru kartei. |
| **Maksimālā izpludināšana** | 12 px | 1-48 (256) | Lielākais izpludināšanas rādiuss; izmaksas aug kopā ar to. |

Tas izplūdina **līmeni, režģi un kastes** - *ne siltumu*. Siltums pikselī ir daudzu dziļumu sprite summa, tāpēc tam nav viena dziļuma, kurā būt nefokusētam; to izplūdināt ar to, kas atrodas aiz tā, būtu nepareizi, kur vien tas peld priekšā. Asi dati mīkstināta konteksta fonā arī ir noderīgāki no abiem. Izplūdināšana ir 24 paraugu zelta leņķa savākšana kompozīcijas posmā, svērta tā, lai asa priekšplāna nebūtu izplūdusi uz āru ar aiz tā esošo izplūdušo fonu. Mainot to, zīmē atkārtoti, neatsākot siltuma uzkrāšanu.

## Audekla izšķirtspēja {#canvas-resolution}

Audekls tiek renderēts ar displeja pikseļu attiecību, ierobežotu ar 2. Siltuma bufers var tikt renderēts zemākā izšķirtspējā nekā tas ([Siltuma izšķirtspēja](performance-and-stats.md)).

## Šīs sadaļas lapas {#pages-in-this-section}

- [Spēļu pults un HOTAS](gamepad.md)
- [Taustiņu un peles atsauce](keyboard-reference.md)

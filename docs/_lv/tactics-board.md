---
title: "Taktikas tāfele"
nav_order: 15
has_children: true
lang: "lv"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Taktikas tāfele

Cilne **Taktika** ir zīmēšanas tāfele komandas plānam: uz kartes novietojat mazas figūras, zīmējat bultas, kur tās dosies, un nospiežat atskaņot, lai to redzētu notiekam. Izmantojiet to, lai plānotu raundu vai uzbrukumu pirms spēles. Tā dala audeklu, kameru un [līmeni](levels.md) ar citām cilnēm un nekā citu; plāns nav dati un nezīmē siltumu.

## Jūsu pirmais plāns {#your-first-plan}

1. Atveriet cilni **Taktika**. Izvēlieties **Spēle** (piemēram, Counter-Strike 2) un Valorant gadījumā nospiediet **Ielādēt Valorant kartes** un izvēlieties **Karte**. Vai vispirms ielādējiet [līmeni](levels.md).
2. Izvēlieties **Puse** (tā iestata krāsu) un nospiediet **Skats no augšas**.
3. Izvēlieties **Vieta**, izvēlieties figūru sadaļā **Figūras** (izmantojiet **Meklēt figūras**, lai atrastu) un noklikšķiniet uz kartes. Novietojiet divas vai trīs.
4. Izvēlieties **Bulta**, noklikšķiniet uz figūras, noklikšķiniet pa ceļu, pa kuru tai jāiet, un nospiediet **Enter**, lai pabeigtu bultu.
5. Nospiediet **+** zem skata, lai pievienotu 2. soli. Katra figūra sākas tur, kur beidzās tās bulta. Zīmējiet tur vēl bultas.
6. Nospiediet **▶** (vai `K`), lai atskaņotu plānu no rādītā soļa līdz beigām.
7. Nosauciet plānu sadaļā **Plāna nosaukums** un nospiediet **Saglabāt**.

![Taktikas cilne skatā no augšas: spēle, puses un rīki kreisajā pusē, trīs figūras ar Pārvietot bultām, dūmu Metiena loku, Apgabals un soļi apakšā](../assets/img/en/tactics.webp)

## Plāna sākums {#starting-a-plan}

| Vadība | Ko tā dara |
|---|---|
| **Spēle** | Izvēlas puses un figūras, ko piedāvā palete: Counter-Strike 2 (T, CT; spēlētāji un palīgierīces), Valorant (Uzbrukums, Aizsardzība; spēlētāji un vispārīgas spējas), Battlefield, Squad, Arma (kājnieki, sauszemes transportlīdzekļi, lidmašīnas, laivas), DCS / War Thunder / IL-2 (reaktīvās lidmašīnas, propelleru lidmašīnas, helikopteri, pretgaisa aizsardzība, sauszeme, kuģi, ieroči) un Cits. Plāns, kam jau ir figūras, paturē savas puses, mainoties spēlei. |
| **Plāna nosaukums** | Nosaukums, ar kuru plāns tiek saglabāts. |
| **Karte**, **Ielādēt Valorant kartes** | Ja izvēlēta Valorant: **Ielādēt Valorant kartes** iegūst karšu sarakstu no [valorant-api.com](https://valorant-api.com); **Karte** tad noliek izvēlētās kartes minikarti kā līmeni, ietverta no augšas. Attēls tiek ielādēts, kad izvēlēts, un nekad nav iekļauts paketē. Riot paziņojums tiek rādīts, kamēr tas ir ekrānā (skatiet zemāk). |
| **Puse** | Puse, kurai pieder nākamā figūra, bulta vai apgabals; tā iegūst puses krāsu. |

Bez līmeņa tāfele ir plakana zemes plakne. Ielādējiet līmeni sadaļā **Līmenis**, lai plānotu uz reālas kartes: CS2 karti, ko eksportējis CS2 rīks, līmeni no bibliotēkas vai kartes attēlu.

## Rīki {#tools}

| Rīks | Klikšķis | Piezīmes |
|---|---|---|
| **Atlasīt** | Figūra, ceļa punkts, bulta, apgabals vai piezīme to atlasa. | Shift+klikšķis pievieno vai noņem; Shift+velkot zīmē kasti ap to, ko pievienot. Atlasītajam ir pārveidošanas gizmo (skatiet zemāk); `Delete` vai `Backspace` noņem to. `M` pārvieto atlasīto figūru uz nākamo klikšķi. |
| **Vieta** | Noliek izvēlēto figūru. | Figūra tiek izvēlēta paletē **Figūras** (ar **Meklēt figūras**). Ja nekas nav atlasīts, `R` pagriež nākamo figūru par 15° pirms novietošanas (`Shift+R` pretējā virzienā). |
| **Bulta** | Katrs klikšķis pievieno punktu; Enter, dubultklikšķis vai labais klikšķis to beidz, Esc to atmet. | **Pārvietot**, **Uzbrukums** (platāka galva) vai **Novērošana** (plāna līnija acu augstumā). Bulta, kas sākas uz figūras, ir šīs figūras maršruts šajā solī: atskaņojot, figūra to iet, un nākamais solis sākas tur, kur tas beidzās. |
| **Metiens** | Metējs, tad kur tas nolaižas. | Punktēts loks no viena līdz otram, un izvēlētā palīgierīce (dūmi, zibspuldze, molotovs, ...) parādās tur, kur nolaižas, un paliek no šī soļa uz priekšu. |
| **Apgabals** | Centrs, tad mala. | Disks puses krāsā. |
| **Piezīme** | Kur piezīme iet; jautā tās tekstu. | Rāda kā smeili, un tā teksts virs tā. |
| **Dzēst** | Figūru, bultu, apgabalu vai piezīmi. | Noņem to no šā soļa uz priekšu; pirmajā solī - noņem pilnīgi. |

**Atsaukt** un **Atcelt atsaukšanu** (`Ctrl+Z`; `Ctrl+Y` vai `Ctrl+Shift+Z`) soļo caur katru izmaiņu. Līnija zem plāna rāda, cik figūru, bultu un soļu tam ir. **Skats no augšas** skatās taisni uz leju (ortogrāfiski), **3D skats** atgriež perspektīvu, **Kadrs** ietver plānu, vai līmeni, ja plāns ir tukšs.

**Figūru izmērs** mērogo katru figūru tāfelē; 1× ir patiesais izmērs, kas no augšas ir daži pikseļi cilvēkam.

## Pārvietošana, pagriešana un mērogošana {#moving-turning-and-scaling}

Visu tāfelē var pārvietot kā 3D redaktorā: figūras, palīgierīces, marķierus, atsevišķus ceļa punktus un veselas bultas, apgabalus un piezīmes. Atlasītajam viduvē ir gizmo:

| Režīms | Taustiņi | Rokturi |
|---|---|---|
| **Pārvietot** | W (vai G) | Bulta katrai asij (X sarkana, Y zaļa un uz augšu, Z zila) pārvieto pa to; kvadrāts pārvieto pa savu plakni; centrs pārvieto pa līmeni zem rādītāja. |
| **Pagriezt** | E (vai R) | Gredzens katrai asij griež ap to. Vienas figūras gredzeni ir tās pašas dzinums, slīpums un ripojums; grupa griežas ap pasaules asīm ap savu centru. |
| **Mērogot** | R (vai S) | Izplesch vai savelk atlasīto no tā centra pa asi vai visos virzienos; apgabala rādiuss aug kopā ar to. |

**Taustiņi** pārslēdz starp W / E / R (Unity, Unreal) un G / R / S (Blender); taustiņi izvēlas režīmu tikai tad, kad kaut kas ir atlasīts, citādi lido ar kameru. Tātad `R` nozīmē **Mērogot** ar taustiņiem W / E / R un **Pagriezt** ar taustiņiem G / R / S, kad kaut kas ir atlasīts, un pagriež nākamo novietojamo figūru, kad nekas nav. Visi tāfeles taustiņi ir uzskaitīti [taustiņu uzziņā](keyboard-reference.md#tactics-board). Turiet **Ctrl** velkot, lai piesaistītu pārvietošanu pie **Režģa** (metri) vai pagriešanu pie **Leņķa soļa**. **Piesaistīt zemei** (pēc noklusējuma ieslēgts) novieto pārvietotos cilvēkus, transportlīdzekļus, marķierus, ceļa punktus un apgabalus uz līmeņa virsmas; lidmašīnas un helikopteri patur savu augstumu, un velkot pa Y bultu nekad nepiesaista. Velkot rokturi, kamera nekad nepārvietojas. **Esc** atceļ velkšanu, un katra izmaiņa ir viens solis Atsaukt.

Ceļa punkti tiek rādīti kā punkti uz parādītā soļa bultām: noklikšķiniet uz viena, lai to atlasītu, velciet, lai pārvietotu, Delete, lai izņemtu. Sadaļa **Izvēlētās** rāda atlasītā vietu metros, figūras dzinumu, slīpumu un ripojumu grādos un apgabala rādiusu, katru ierakstāmu.

## Hronometrāža {#timing}

Figūras maršruts ir laikots: katrs segments aizņem savu garumu pa līmeni - paraugots uz virsmas ik pēc pāris metriem, tāpēc kalns vai kāpnes starp diviem punktiem skaitās - ar ātrumu tās figūras kustības **režīmā** šajā spēlē, plus jebkāds **gaidīšanas** laiks ceļa punktā. Kājnieki rāpo, pietupjas, iet (klusi), skrien vai sprintē; transportlīdzekļi un laivas rāpo, brauc piesardzīgi, normāli vai steidzas; lidmašīnas un helikopteri lido lēni, kreisēšanas ātrumā, kaujas ātrumā vai maksimālajā. Režīms, kāda spēlei nav (CS2 nav sprinta), tiek aizstāts ar tuvāko, kas tai ir. Kā nogāze palēnina, atkarīgs no spēles: CS2 un Valorant skaita tikai horizontālo attālumu, kā spēlēs; mil-sim spēles palēnina kājniekus kalnup (Tobler pārgājiena funkcija) un transportlīdzekļus pēc slīpuma.

Ātrumi nāk no spēļu tabulām ar to avotiem (skatiet [Kustības ātrumi](tactics-speeds.md)): CS2 pēc turētā ieroča, no spēles ieroču definīcijām; Valorant pēc ieroča; Battlefield, Squad, Arma un gaisa spēles pēc transportlīdzekļa tipa un klases. **Pārvietojas kā** izvēlas figūras profilu (ieroci, transportlīdzekļa tipu); **Savs (m/s)** pārraksta jebkuru režīmu šai figūrai. Režīmi ir nosaukti tā, kā tos rāda tāfele: *Rāpot*, *Pietupties*, *Iet (klusi)*, *Skriet*, *Sprintēt*; *Piesardzīgi*, *Normāli*, *Steigties*; *Lēni*, *Kreisēšana*, *Kauja*, *Maksimāli*.

Katrs ceļa punkts rāda laiku kopš iepriekšējā un laiku kopš plāna sākuma ("+3,9 s · 0:12"). Atlasītās figūras maršruts uzskaita katru segmentu ar tā režīmu, garumu un laiku, gaidīšanu un ierašanos. **Ierašanās** sadaļā **Hronometrāža** novieto katru figūru ar maršrutu uz vienas laika līnijas, pirmā ierašanās augšā. Ar **Atskaņot reāllaikā** (pēc noklusējuma ieslēgts) solis ilgst, līdz ierodas lēnākais maršruts, un katra figūra kustas ar savu ātrumu; **Sekundes** tad ir soļa mazākais garums. **Līmeņa vienības uz metru** saka, kas līmenis ir: 39,37 CS2 kartēm (spēles vienības), 1 metru kartēm.

## Salīdzināt ar mača datiem {#compare-with-match-data}

**Ielādēt mača failus…** nolasa kartes CS2 mača tabulas (CS2 rīka Parquet faili, cik vajag; tikai nepieciešamās kolonnas, fonā); **Izmantot ielādētos datus** paņem skatītājā ielādētos datus. Tad:

- **Agrākā ierašanās kartē** krāso karti pēc laika kopš raunda sākuma, kad spēlētājs pirmo reizi sasniedza katru vietu - poga **Ātrākais** parāda ātrāko visos raundos, **Tipisks (mediāna)** vidējo raundu - no zaļa agri līdz sarkanam vēlu, vienai pusei vai abām. Tā parāda, kas ir iespējams un kad.
- Izvēlētais maršruts tiek salīdzināts ar to, ko spēlētāji sasniedza no tā sākuma (vai no raunda sākuma) līdz tā beigām, katrs gals ir disks ar iestatīto rādiusu: "Ātrākais novērotais 14,2 s, p10 15,0 s, mediāna 18,3 s no 41 braucieniem; jūsu plāns 15,1 s".
- Ātrumi, ar kādiem spēlētāji patiesi kustējās - skriešana, staigāšana, pietupšanās, no tabulu ejas un pietupšanās kolonnām - m/s.

## Soļi {#steps}

Josla zem skata satur soļus. Plāns sākas ar vienu; **+** pievieno vienu, un katra figūra sākas tur, kur tās maršruts pēdējā solī beidzās; **−** noņem parādīto. **Sekundes** ir, cik ilgs parādītais solis ir, atskaņojot. **▶** (K) atskaņo no parādītā soļa līdz beigām: figūras ar maršrutu iet pa to, figūras, kas nākamajā solī pārvietotas uz jaunu vietu, slīd tur, pārējās stāv. Kamēr solis ir parādīts, katras figūras vieta nākamajā solī tiek zīmēta kā bāla ēna, un pēdējā soļa bultas vāji zem šī soļa.

## Saglabāšana {#saving}

Sadaļā **Fails** ir **Saglabāt**, **Pirm.** un **Notīrīt**. **Saglabāt** raksta plānu kā `<nosaukums>.h3dplan.json` (vienkāršs JSON: puses, soļi, figūras ar vietu katrā solī, bultas, apgabali, piezīmes); **Pirm.** to nolasa atpakaļ. Cita versijas fails vai fails, kas nav plāns, tiek noraidīts ar iemeslu. **Notīrīt** iztukšo plānu; Atsaukt to atgriež.

## Figūras {#figures}

Katru figūru veido pats skatītājs: vienkāršas formas publicētā tipa izmērā, ar iezīmēm, kas to atšķir no kaimiņiem - tanka ceļa riteņi un tornis, ieroči, raķetes un radari pretgaisa transportlīdzeklī, lidmašīnas spārna plāns, aste un dzinēji, helikoptera rotori un īsie spārni. Nekas nav ņemts no spēles. Dizains, ko izdomājusi spēle, tiek rādīts kā tā klases vispārīgā figūra. Skatiet [Figūras](figures.md#which-figure-a-unit-gets), kā dati atrod savu figūru.

## Riot paziņojums {#riots-notice}

Valorant kartes tiek rādītas saskaņā ar Riot Games politiku "Legal Jibber Jabber", kas ļauj bezmaksas kopienas projektiem tās izmantot un prasa šo paziņojumu, kur tās parādās: *3DHeat tika izveidots saskaņā ar Riot Games politiku "Legal Jibber Jabber", izmantojot Riot Games īpašumā esošus materiālus. Riot Games neatbalsta un nesponsorē šo projektu.* Tāfeles spējas ir vispārīgas formas, nevis Riot māksla.

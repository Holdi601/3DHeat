---
title: "Spēles atkārtojums"
nav_order: 9
has_children: true
lang: "lv"
source: "match-replay.md"
source_hash: "9d61f24a5a04"
translated: true
outdated: false
---

# Spēles atkārtojums

Atkārtojums ir spēles filma, kurā katrs spēlētājs ir attēlots kā tas, ko viņš vadīja. Lietojiet to, lai vēlreiz noskatītos cīņu, sekotu vienai vienībai un redzētu, kas kuru trāpīja.

Šāvieni, trāpījumi, ugunsgrēki un sagrautas vienības tiek zīmēti uz vienībām un mērķiem līmenī. Kameras, etiķetes un taktiskais attēlojums palīdz lasīt cīņu. Vai jūs pazīstat Tacview? [Tacview paritāte](tacview-parity.md) parāda, kur atrodas katrs tā rīks.

![Figūru atkārtojums tanku demonstrācijā: tanki kā savas figūras, ar vārda, transportlīdzekļa un ātruma etiķetēm](../assets/img/en/replay-overview.webp)

## Sāciet atkārtojumu {#start-a-replay}

1. Ielādējiet ierakstu ar **Avots → Faili…** vai ievelkot to Avota panelī (jebkura tabula ar **personas** un **laika** kolonnu, Tacview fails, konvertēts atkārtojums, [`.3dheat`](container.md) spēle). Skatiet [Datu ievade](getting-data-in.md).
2. Atveriet cilni **Mačs** un izvēlieties **Figūru atskaņojums**, vai Siltumkartes cilnes režīmu joslā izvēlieties **Figūru pārklājums**.
3. Sadaļā **Mači atskaņojumā** izvēlieties vienu spēli, visas uzreiz vai vairākas.
4. Laika skalā nospiediet **Atskaņot** (vai `K`). Velciet laika skalu, lai pārietu.

Figūras aizstāj kastes katrai vienībai, kuras nosaukums vai tips ir zināms (skatiet [Figūras](figures.md)). Dati bez nosaukuma vai tipa kolonnas tiek zīmēti kā karavīri.

![Cilne Mačs: spēļu izvēle, sadaļa Figūras, kameru skati, Atskaņot un notikumu saraksts](../assets/img/en/match-replay-tab.webp)

## Figūras {#figures}

![Degošs tanks orbītas kamerā, ar šāvienu, kas to trāpīja](../assets/img/en/replay-tanks.webp)

| Iestatījums (sadaļa **Figūras**) | Noklusējums | Ko tas dara |
|---|---|---|
| **Figūras kastīšu vietā** | ieslēgts | Izslēgts zīmē vienkāršas kastes. |
| **Figūru izmērs** (reizes pret patieso izmēru) | 1 | 1 ir īstais izmērs; no 0,25 līdz 20 reizēm (logaritmiska skala). Lielāks palīdz no tāluma. |
| **Mazākā figūra ekrānā** | 36 px | Tālas figūras pieaug, lai paliktu tik lielas, no 0 līdz 200 px; 0 saglabā īsto izmēru. |
| **No attāluma**: Figūra, Bulta, Simbols | Figūra | Par ko kļūst tālā vienība. |
| **Simboli** | NATO (APP-6) | NATO (APP-6), Krievijas taktiskās zīmes, **Spēles karte** ikonas vai **Tikai formas (krāsu akliem)**. |
| **Simbola izmērs**, **Mana puse**, **Ienaidnieks / Neitrāls**, **Kursa svītras** | 28 px (12 līdz 64), automātiski, ienaidnieks, ieslēgts | Kā izskatās simboli un kura puse ir draudzīga. |
| **Vertikālās līnijas** | ieslēgts | Līnija no katras vienības taisni uz leju līdz zemei, lai augstumi nolasāmi 3D. |
| **Vertikāles un nosaukumi ieročiem** | izslēgts | Līnijas līdz zemei un etiķetes uz raķetēm un bumbām. |
| **Ugunsgrēki vienībās** | ieslēgts | Liesmas no brīža, kad vienība aizdegas, līdz tā tiek nodzēsta. |
| **Trāpījumi vienībām** | ieslēgts | Atzīmes, kur trāpīja šāvieni (zemāk). **Trāpījumi paliek**: no 1 līdz 300 sekundēm vai **Visa dzīve**. **Peldošas atzīmes**: atzīmes, kas zīmētas virs virsmas. |
| **Skata un torņa līnijas** | izslēgts | Punktēta: kur spēlētājs skatās; nepārtraukta: kurp vērsts ierocis. |
| **Ēkas** | cieta | Cietas vai caurspīdīgas ēkas, kad līmenis tās zīmē. |

### Simboli no tāluma {#symbols-at-a-distance}

Kad vienība būtu mazāka par **Mazākā figūra ekrānā**, tā var kļūt par simbolu, kas paliek salasāms. Forma norāda veidu (piemēram, noapaļota kaste ar sliežu zīmi bruņutehnikai); krāsa norāda pusi. Atveriet izvēlni **Simboli**, lai mainītu stilu.

![Tās pašas sešas vienības kā NATO simboli, Krievijas taktiskās zīmes, spēles kartes ikonas un tikai formas](../assets/img/en/match-replay-symbols-styles.webp)

### Trāpījumu atzīmes, sagrautās vienības un ugunsgrēki {#hit-marks-wrecks-and-fires}

- **Trāpījumu atzīmes** atrodas uz virsmas, kur šāviens sastapa, figūras mērogā. To izskats parāda, kas notika: caurums (izgāja cauri), spilgts šķēlums (necaurcaurs), grāvis (noslīdēja), kvēpu zvaigzne (sprādzienbriesmu šāviens). Krāsains gredzens norāda, ko tas izdarīja: nogalinošs šāviens, modulis iznīcināts, kritisks, smags, bojājums, bez bojājuma, trāpījums. Uzvediet virsū atzīmei, lai redzētu šāviena nosaukumu.
- Iznīcināta vienība tiek zīmēta **apogļota** kā vraks no nāves brīža līdz atdzimšanai vai noņemšanai; tās simbols ir svītrots.
- **Ugunsgrēki** deg uz vienības no brīža, kad tā aizdegas, līdz tā tiek nodzēsta.
- **Torņi** pagriežas tur, kur dati saka, ka vērsts ierocis (vai, ja tādu nav, kur spēlētājs skatās).

### Ieroči, mērķi un trasieri {#weapons-decoys-and-tracers}

Ar ieslēgtu **Ieroči, šāvieni un trāpījumi** (sadaļa Komandas skats): raķetes, rokas raķetes, bumbas un torpēdas lido kā savas figūras ar dūmu takām; lodes un čaulas ir trasieri; trāpījumi un sprādzieni uzzibsnī. Trasieris, kas zīmēts **punktēts**, tika aprēķināts no trāpījuma, jo datos nebija šāviena. Uguns ķērāji un plēves tiek zīmēti kā mērķi; tie ir paslēpti no vienību saraksta, ja vien *Mērķi un čaulas* nav atzīmēts.

## Kameras {#cameras}

Noklikšķiniet uz vienības vai tās etiķetes, lai **sekotu** tai; sadaļa **Atskaņojums** piedāvā **Vajāšana**, **Orbīta**, **Kabīne** (ar displeju priekšā, `H`), **Fiksēta**, **Padlock**, **Mērķis** un **Pavadonis**. `V` pārslēdz tās, **Kameras attālums** iestata, cik tālu. Esc aptur.

- **Divu vienību skats**: izvēlieties **Mērķis** (vai Ctrl/Alt-klikšķis uz vienības), lai to skatītu no sekotās; **Mainīt vietām** tās apmaina.
- **Mērs**: Shift-klikšķis uz divām vienībām, lai redzētu virzienu, attālumu un augstuma starpību starp tām.
- **2D karte** (`M`): stūra vai pilnais skats ar takām un vārdiem.
- **Grāmatzīmes** (`B`): saglabā mirkli un kameru; ieraksta paša nogalinājumi, nāves un atzīmes arī tiek uzskaitītas.
- **Notikumi**: visi notikumi laika secībā; klikšķis pārlec tur. `Page Up` / `Page Down` pārlec starp notikumiem; **Pauze notikumā** apstājas pie katra.

## Taktiskais attēlojums {#tactical-display}

![Gaisa demonstrācija ar taktiskā attēlojuma izskatu (T): stieples formas reljefs, nogalinājumu un notikumu paneļi](../assets/img/en/replay-air-tactical.webp)

Sadaļa **Taktiskais attēlojums** nevienai vienībai nezīmē neko, izvēlētajām, visām vai vienam veidam (gaisa kuģi, zeme, kuģi, ieroči): ātruma vektorus un ceļu uz priekšu, deguna un pacelšanas līnijas, radaru konusus, bloķējumus, datu saites, iesaistīšanās zonas un līnijas, redzamības līnijas, kur spēlētāji skatās (skata konusi), torņa mērķi un ierakstīto kameru.

### Attēlojuma stils {#display-style}

`T` (vai slēdzis **Rādīt kā taktisko displeju**) pārslēdz izskatu uz radara ekrāna stilu: spīdums, kontūras, horizontāles, mērījumu režģis, skenēšanas līnijas, diapazona gredzeni, augstuma kāpnes, paneļi ar nogalinājumiem un notikumiem, un **Režisors**, kas pats pārvieto kameru uz notikumiem.

![Tā pati gaisa cīņa normālā izskatā](../assets/img/en/replay-air.webp)

## Mērķi {#objectives}

Kad spēle nāk ar saviem mērķiem, sadaļa **Mērķi** tos zīmē līmenī: pārņemšanas zonas (ar īpašnieku un pārņemšanas progresu), spawni, lidlauki, apgabali un bombardēšanas mērķi, katrs slānis pārslēdzams, ar etiķetēm. Tie redzami caur zemi. Ja ielādēti vairāki spēles režīmi, **Režīms** filtrē spēles pēc režīma. Mērķi nāk no konvertētāja spēles faila blakus ierakstam vai no [`.3dheat`](container.md) konteinera.

## Etiķetes un statistika {#labels-and-statistics}

- **Etiķetes**: noteikumi katram veidam (**Izvēlētās**, **Gaisa kuģi**, **Zeme**, **Kuģi**, **Ieroči**, **MI**): rādīts vai nē, kuras vērtības, un **Prioritāte** tam, kas saņem vietu, kad etiķetes pārklājas. **Turēt etiķetes atsevišķi** pārvieto etiķeti blakus tās vienībai, kad tā aizsegtu citu, un atstāj ārpusē, kur vietas nav. **Etiķešu izmērs** ir no 60 līdz 250 %. **Atpakaļ uz vārdu, transportlīdzekli, augstumu un ātrumu** atiestata noteikumus.
  - Sauszemes vienības sākas ar vārdu, transportlīdzekli un ātrumu.
  - Gaisa kuģi sākas ar vārdu, transportlīdzekli, augstumu un ātrumu.
  - Kuģi sākas ar vārdu, transportlīdzekli, ātrumu un kursu.
  - Uzvediet virsū vienībai, lai redzētu visas tās vērtības.
- **Statistika**: pa komandām un vienībām: nogalinājumi, nāves, šāvieni, trāpījumi, trāpījumu koeficients, pacelšanās, nolaišanās, laiks gaisā, maksimālais ātrums, augstums un G, attālums. CSV eksports.
- **Diagrammas**: vienības vērtības laikā, divas vienības salīdzinātas vai viena vērtība pret citu.

## Daudzas spēles vienlaikus {#many-matches-at-once}

Lai uzliktu simtus vai tūkstošus spēļu vienu uz otras, skatiet [Daudzas spēles vienlaikus](many-matches.md). Figūru detaļas (dūmi, uguns, citi laikotie efekti): [Figūras figūru pārklājumā](figure-replay.md). Tacview funkciju saraksts: [Tacview paritāte](tacview-parity.md), šīs lapas apakšlapa.

---
title: "Pasaules fons"
parent: "Līmeņi un fona ģeometrija"
nav_order: 5
has_children: true
lang: "lv"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Pasaules fons

Pasaules fons liek reālu zemi zem lidojuma ieraksta: kalnus, ceļus, upes, lidlaukus un ēkas, lejupielādētas no brīvi pieejamiem atvērtiem kartes datiem. Izmantojiet to, kad Tacview ieraksts citādi peldētu pāri tukšam režģim. Tas ir [līmenis](glossary.md), tāpēc siltums un figūras atrodas uz tā.

## Izveidot to {#build-one}

1. Ielādējiet lidojuma ierakstu, kurā teikts, kur uz zemes tas atrodas (Tacview `.acmi` fails), vai neielādējiet neko un 3. solī izvēlieties kara darbības teātri. Skatiet [Datu ievade](getting-data-in.md).
2. Atveriet **Fons / līmenis** sānjoslā.
3. Nospiediet **Reālā pasaule kā fons**, lai izveidotu zemi zem saviem datiem. Vai izvēlieties spēles karti laukā **Kara darbības teātris** un nospiediet **Būvēt kara darbības teātra fonu** (vai **Straumēt kara darbības teātri**).
4. Pagaidiet. Panelis rāda gaitu (*Augstuma flīzes*, *Kartes flīzes*, *Fona būvēšana*); **Atcelt** aptur procesu.
5. Lidojiet apkārt. Kartes datu kredīta rinda ir rakstīta skata apakšējā labajā stūrī.

Pirmā būvēšana lejupielādē dažus desmitus megabaitu. Pārlūks tos glabā, tāpēc otrā tās pašas teritorijas būvēšana nelejupielādē neko. **Aizmirst kartes flīzes** tos dzēš. Poga **Reālā pasaule kā fons** tiek rādīta tikai tad, ja ielādētajiem datiem ir ģeogrāfiska atsauce (zemāk).

Viss tiek būvēts fona darbiniekā ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Rezultāts aizstāj pašreizējo līmeni un uzvedas kā jebkurš [3D līmenis](model-levels.md): tas slēpj siltumu aiz sevis, to griež griezums, tam ir [izskata vadība](level-appearance.md) un to var saglabāt [bibliotēkā](level-library.md).

## Kur ir dati: ģeogrāfiskā atsauce {#where-the-data-is-the-geographic-reference}

Datu kopa iegūst ģeogrāfisku atsauci tikai no avota, kas to norāda:

- **ACMI ieraksts**: tā galvenes `ReferenceLatitude` un `ReferenceLongitude`, un pozīcijas, ko lasītājs projicē uz plakni, kas pieskaras WGS84 elipsoīdam tajā vietā (X uz austrumiem, Y uz ziemeļiem, metros; augstumi ir ieraksta augstums virs jūras līmeņa). Atsauce tiek paturēta, kad kartējums ņem **X** un **Y** kā zemes asis — tā dara ieraksta paša norādes — un tiek atmesta, kad zeme nāk no citas kolonnas, piemēram, spēles pašas plakanās pasaules **U** un **V**.
- **Parquet tabula, kuras `heat3d` norādēs ir ieraksts `geo`** — [Watcher](https://github.com/Holdi601/3DHeat-Watcher) DCS, MSFS, X-Plane un IL-2 (Tacview) tabulas. Ieraksts ir aprakstīts sadaļā [Izstrādātājiem](#for-developers).

Vairāku failu ielāde paturi atsauci tikai tad, ja visiem ir viena un tā pati. Katrs cits ielādētājs nav ietekmēts un nenes nevienu.

Fons tiek projicēts tādā pašā veidā un pēc tam izmantots ielādes asu kartējumā, tāpēc tas nonāk zem datiem neatkarīgi no tā, kādu apgriešanu vai mērogu kartējums piemēro.

## Teātri {#theatres}

Laukā **Kara darbības teātris** ir uzskaitītas DCS World reālās pasaules kartes (Kaukāzs, Nevada, Normandija 2, Lamanšs, Sīrija, Persijas līcis, Marianas, Marianas Otrā pasaules kara laikā, Dienvidatlantijs, Sinaja, Afganistāna, Kola, Vācija aukstā kara laikā, Irāka) un IL-2 Great Battles (Staļingrada, Maskava, Kubaņa, Reinzeme, Normandija, Prohorovka, Velikije Luki, Arrasa, Odesa, Somu līcis / Ļeņingrada, Koreja), katra ar savu kasti uz zemes ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). DCS kastes ir redaktoru izmēri, aprēķināti no publicētajām projekcijām; IL-2 kastes un tās DCS, kas tā atzīmētas, ir aplēses no karšu publicētajiem izmēriem un pilsētām to malās — panelis saka, kuras.

**Būvēt kara darbības teātra fonu** veido divas detalizācijas pakāpes vienā tīklā:

| Līmenis | Teritorija | Reljefs | Karte |
|---|---|---|---|
| Teātris | visa kaste | dziļākais tuvinājums līdz 10, kam vajadzīgas ne vairāk kā 64 augstuma flīzes (apmēram 3 km uz virsotni pāri Kaukāzam, 1 km pāri Normandijai) | jūra, ezeri, zemes segums un automaaģistrāles no ne vairāk kā 64 vektoru flīzēm tuvinājumos no 4 līdz 9 |
| Detalizētā teritorija | **Zem datiem**, **Ap punktu** (platums, garums, 12 līdz 400 km) vai nekas | līdz tuvinājumam 12 ne vairāk kā 100 flīzēs, ne vairāk kā 500 000 virsotnēm | viss iepriekš minētais, no ne vairāk kā 1 500 vektoru flīzēm dziļākajā tuvinājumā līdz 14, kas iederas |

Detalizētā teritorija izgriež caurumu teātra režģī, paplašinātu līdz veseliem šūnu laukumiem, lai abi režģi dalītu savas malu līnijas, un plāna siena aizver šuvi, kur tie paraugo augstumus citādi.

Ja dati ir ielādēti, teātris tiek būvēts uz datu plaknes, tāpēc tas nonāk zem tiem tieši tā, kā tika uzbūvēts. Bez datiem tas tiek būvēts ap teātra pašu atsauces punktu (veseli grādi blakus tā detalizētajai teritorijai). Dati, kas ielādēti vēlāk ar citu atsauci — ACMI fails nosauc savu — pārvieto fonu zem sevis: precīzā pārvietošana starp abām projekcijām tiek aprēķināta 256 × 256 režģī pāri fonam un nolasīta starp mezgliem, ar precizitāti vienu vai divus metrus visā teātrī ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Fons, kas saglabāts bibliotēkā, paturi savu vietu un tiek pārvietots tāpat, kad to ielādē zem citiem datiem.

### Teātra straumēšana {#streaming-a-theatre}

**Straumēt kara darbības teātri** parāda teātri tā, kā to dara lidojumu simulatora kartes skatītājs: zeme nāk kā daudzas mazas flīzes ap kameru, ielādētas, kamēr lido, un nomestas, kad tās paliek ārpus sasniedzamības ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Web Mercator flīžu kvadrātkoks.** Saknes tuvinājumā 5 aptver 1 500 km ap kameru, tāpēc zeme sniedzas pāri teātra kastei līdz horizontam. Flīze tiek sadalīta savos četros bērnos, kamēr kamera ir tuvāk par 1,4 reizēm tās platumu, līdz tuvinājumam 15 (apmēram 1 km flīzei, 15 m starp reljefa virsotnēm): detaļas samazinās ar attālumu, kā tās samazinās uz ekrāna.
- **Katra flīze ir sava siets**, būvēts darbiniekā ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): 65 × 65 reljefa režģis ar malu apkārt tā malai (lai kaimiņi ar atšķirīgu detalizāciju nekad nerādītu plaisu), uz tā uzgleznots zemes segums un jūra, pāri ceļi, dzelzceļi, ezeri, upes, lidlauki, izmērītas skrejceļi un ēkas, un pēc izvēles tās kvadrāta satelītattēls. Renderētājs zīmē flīzes ar līmeņa izskatu un dziļuma noteikumiem, tāpēc tās slēpj siltumu aiz sevis kā jebkurš līmenis.
- **Vispirms rupji.** Flīzes tiek pieprasītas rupji un tuvu vispirms, četras lejupielādes vienlaikus katram avotam; kamēr flīzes bērni ielādējas, flīze aizvieto tos, tāpēc skats uzreiz aizpildās un pēc tam asinās.
- **Atmiņa**: uzbūvētās flīzes tiek paturētas līdz 600 MB, vispirms tiek nomestas tās, kas visilgāk nav zīmētas. **Lejupielādes** paliek flīžu kešatmiņā, kas turēta 2 GB budžetā, vispirms laižot ārā vecākās: atgriežoties pāri apgabalam, nemaksā neko, un nav nekāda limita uz vienu būvēšanu.
- **Saglabāts bibliotēkā** kā tas, ko straumē — teātris, tā opcijas un tā vieta uz zemes —, nevis kā flīzes: ielādējot to, straumēšana sākas no jauna, no flīžu kešatmiņas, kur flīzes joprojām ir. Klikšķi un inspektors trāpa flīzēm kā jebkurā līmenī.
- Abi renderētāji zīmē flīzes: pārbaudīts blakus uz īstas GPU (WebGPU un WebGL2 uz tās pašas kartes), arī slēptam siltumam aiz grēdas.
- Ja dati ir ielādēti, flīzes tiek būvētas uz datu plaknes; dati, kas ielādēti vēlāk citā plaknē, pārbūvē tās tur (no kešatmiņas).
- Mērīts sintētiskos lidojumos pāri trim vietām (Normandija, Nevada, Sīrija): apmēram 63, 45 un 24 MB pirmajā apmeklējumā ar attēlu; otrais apmeklējums nelejupielādē neko.


## Kas tiek būvēts {#what-is-built}

| Daļa | Avots | Kā |
|---|---|---|
| Attēli (straumētiem teātriem, pēc izvēles) | EOX Sentinel-2 cloudless 2016 | **Satelītattēls** uzklāj bezmākoņu 2016. gada mozaīku (apmēram 10 m uz pikseli, tuvinājums 14, dziļākas flīzes to palielina) pāri zemei zemes segā uzgleznotās vietā; ceļi, skrejceļi, ēkas un nosaukumi paliek virspusē. |
| Smalkāki attēli (ASV, Francija) | USGS National Map ortofoto; IGN BD ORTHO | Ar ieslēgtu **Satelītattēls** kartes flīze no tuvinājuma 13, kas pilnībā atrodas blakus esošajās Savienotajās Valstīs vai Francijas kontinentālajā daļā, tā vietā ņem nacionālo ortofoto, divus tuvinājumus dziļāk nekā flīze (sešpadsmit tās flīzes salikti vienā attēlā, apmēram 1-2 m uz pikseli tuvumā). Visur citur — EOX. |
| Reljefs (straumētiem teātriem) | Mapterhorn | Copernicus GLO-30 visur (apmēram 19 m uz pikseli tuvinājumā 12), metru mērogā, kur ir valsts pašas uzmērījums (Francija, ASV un citas); lasīts divus tuvinājumus rupjāk nekā katra flīze. AWS Terrain Tiles, ja Mapterhorn nav sasniedzams. |
| Reljefs | AWS Terrain Tiles (Terrarium PNG) | Augstuma režģis pār kasti: tuvinājums ir dziļākais līdz 12 (apmēram 28 m uz pikseli 43° N), kam vajadzīgas ne vairāk kā 36 flīzes, un režģis tiek retināts līdz ne vairāk kā 400 000 virsotnēm. Zīmēts kā zeme ar parastajām reljefa norādēm. |
| Ceļi, dzelzceļi | OpenFreeMap vektoru flīzes, `transportation` slānis | Plakanas lentes, uzliktas pāri reljefam, blīvētas līdz reljefa atstarpei un paceltas dažus procentus no tās, lai necīnītos ar to. Platumi pēc klases, no 16 m (automaaģistrāle) līdz 3 m (taka, dzelzceļš); nekad šaurāki par kastes diagonāli / 5000. Takas, prāmji un tuneļi nav iekļauti. |
| Lidlauki | `aeroway` slānis | Skrejceļu, rulēšanas ceļu, perona un nolaišanās laukumu poligoni uzlikti kā zeme; skrejceļu un rulēšanas ceļu līnijas kā 45 m un 18 m lentes. |
| Ūdens | `water` slānis | Jūra plakana 0 m, ezeri un dīķi plakani savā zemākajā krastā, upes uzliktas pāri reljefam. Zīmēts kā ūdens: plakana ēnojuma, bez kontūrām. |
| Zemes segums | `landcover` un `landuse` slāņi | Uzgleznots uz pašiem reljefa virsotņu punktiem, bez papildu trijstūriem: meži, zāle un parki zaļi, lauksaimniecības zeme salmu krāsā, purvi, smiltis, klintis, ledus; dzīvojamās, rūpnieciskās, komercteritorijas, militārās un karjeru zonas mierīgās toņās. Ūdens tiek uzgleznots arī zem ūdens virsmas, lai krasts būtu redzams no jebkura augstuma. Kails zemes gabals saņem klusu augstuma toni (zemienes pelēkzaļš, augstienes brūns, sniegs virs 3 000 m). Lasāms reljefa izšķirtspējā: apmēram 30-45 m detalizētajā teritorijā, kilometri teātrī. |
| Vietvārdi | `place` un `aerodrome_label` slāņi | Pilsētas, mazpilsētas un ciemi, un lidlauki ar savu ICAO kodu, uzrakstīti pāri skatam; cik tālu katrs veids rādās, aug līdz ar kameras augstumu, ne vairāk kā 70 vienlaikus. |
| Izmērītie skrejceļi | [OurAirports](https://ourairports.com/data/) `runways.csv` (publiskais domēns) | Pēc izvēles (**Skrejceļi no OurAirports**, pēc noklusējuma ieslēgts): katrs atvērtais skrejceļš, kam abi gali ir sarakstā, no sliekšņa līdz slieksnim sava norādītā platuma, ar sānu svītrām, punktētu centra līniju un sliekšņu joslām. Viens 4 MB saraksts, lejupielādēts vienreiz un paturēts kešatmiņā. |
| Ēkas | `building` slānis | Pamatnes izvilktas no `render_min_height` līdz `render_height` (6 m, ja trūkst) virs zemākās zemes zem tām; `hide_3d` daļas izlaistas. Zīmētas kā konstrukcijas. |

Vektoru flīzes tiek lasītas tuvinājumā 14 (vienīgais tuvinājums ar ēkām), ja kastei vajadzīgas ne vairāk kā 300 no tām; citādi dziļākajā tuvinājumā, kas to iekļauj, līdz 8. Lielāka teritorija saņem tikai reljefu.

### Izskats {#look}

Fons sākas ar ieslēgtu **Rādīt uzņemto krāsu** — krāsa ir tas, kas parāda gaišu ceļu uz pelēkās zemes, uz kuras tas guļ, tumšu skrejceļu no tā perona —, ar izslēgtām zemes trijstūru malām, jo regulārs režģis neko nenozīmē, vāju kontūru, necaurspīdīgu jūru (grīda zem tās cīnītos ar virsmu par dziļumu tālu), un ēkām gaiši pelēkām un gandrīz cietām, kā tās zīmē karte. Atklātā jūra nesaņem nekādus zemes trijstūrus. Viss pārējais ir modeļa līmeņa noklusējuma izskats.

## Kredīti uz audekla {#credits-on-the-canvas}

Kamēr fons ir līmenis, tā avotu kredīts tiek rakstīts skata apakšējā labajā stūrī, bez vajadzības klikšķināt, lai ekrānšāviņi un atveidotie video to saturētu:

> OpenFreeMap © OpenMapTiles · Dati © OpenStreetMap contributors · Augstums: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Katra daļa saista uz sava avota atribūcijas lapu (openstreetmap.org/copyright un Terrain Tiles [atribūcijas saraksts](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). Fons, kas saglabāts bibliotēkā, paturi savus kredītus un tos parāda atkal, kad to ielādē. Teksts ir tulkots kopā ar skatītāju; nosaukumi nav.

## Avoti un to noteikumi {#sources-and-their-terms}

Katrs avots, tā licence un kā fons paliek noteikumu ietvaros: [Pasaules fons: avoti un noteikumi](world-backdrop-sources.md).

## Flīžu kešatmiņa {#the-tile-cache}

Katra flīze un vektoru flīžu TileJSON tiek glabāta pārlūka Cache API zem `3dheat-world-tiles-v1`, pēc URL. Otrā tās pašas teritorijas būvēšana nedara nevienu pieprasījumu un darbojas bezsaistē: TileJSON tiek vispirms pieprasīts, un, ja tas neizdodas, tā kešatmiņas kopija nosauc flīzes, kas jau ir glabātas. Flīzes, kuras serveris nesaturē (atklāta jūra, 404), tiek atceripas kā arī neesošas.

Vektoru flīžu URL satur kartes būves datumu, tāpēc pēc tam, kad OpenFreeMap publicē jaunu būvi, nākamais pasaules fons lejupielādē jaunas flīzes, un vecās paliek, līdz tās tiek notīrītas. Kešatmiņa ir turēta līdz 2 GB: pārsniedzot to, vispirms tiek dzēstas flīzes, kas uzglabātas visilgāk. **Aizmirst kartes flīzes** dzēš visu kešatmiņu. Kešatmiņai vajadzīgs drošs avots (`https://` vai `localhost`); citur katra būvēšana lejupielādē no jauna.

## Salīdzinājums ar Tacview {#compared-with-tacview}

Pārbaudīts ar aci vienā vietā katram teātrim, ar sintētiskiem ierakstiem: pacelšanās rites atrodas uz zīmēto skrejceļu centra līnijām, piekrastes šķērsojumi krīt uz krasta. Tacview puse ir no tā dokumentācijas un publicētajiem ekrānšāviņiem (tacview.net, tā Steam lapa), nevis no tā palaišanas šeit.

| | Tacview 1.9 | Šis fons, straumēts |
|---|---|---|
| Apjoms | visa pasaules lode | 1 500 km ap kameru, kur tā arī būtu |
| Reljefs | ETOPO1 (apmēram 1,25 km) iebūvēts; SRTM 25-75 m, ja lietotājs instalē failus; DCS reljefs eksportēts no DCS | Copernicus GLO-30 (Mapterhorn), metru mērogā Francijā un ASV |
| Attēli | nav iebūvēti; lietotājs lejupielādē tekstūras (Mapview, SAS Planet, papildinājumi, piemēram, Kaukāza VFR karte) | EOX Sentinel-2 cloudless 2016, apmēram 10 m, straumēts |
| Zemes segums | nav, ja vien tekstūrā | no OpenStreetMap, uzgleznots uz reljefa (bez attēliem) |
| Ceļi, dzelzceļi | nav, ja vien tekstūrā | katra klase tuvu kamerai, lielie ceļi tālu |
| Ēkas | nav | izvilktas pamatnes tuvu kamerai |
| Lidlauki | iezīmes un skrejceļi kā plakani kvadrāti, bez marķējuma | skrejceļi no izmērītiem galiem ar sānu svītrām, centra līniju un sliekšņu joslām; rulēšanas ceļi, perons; nosaukumi ar ICAO kodiem |
| Vietvārdi | daži ciemu un pilsētu uzraksti | pilsētas, mazpilsētas, ciemi, lidlauki, pēc attāluma un augstuma |

Kur tas joprojām atpaliek:

- **Attēlu izšķirtspēja**: ārpus ASV un Francijas 10 m satelītmozaīka ir mīksta zem apmēram 2 km; Tacview ar lietotāja instalētu zoom-17 tekstūru tur ir asāks.
- **Reljefs DCS pašā formā**: Tacview var rādīt reljefu, ko pats DCS eksportē; šeit tā ir reālā zeme, kas atšķiras no DCS reljefa, kur kartes modelētāji to ir mainījuši.
- **Izliekums**: zeme ir plakana plakne, tāpēc horizonts nav izliektas zemes horizonts; Tacview zīmē sfēru.
- **Ātrums**: pirmais apmeklējums vietai lejupielādē dažus desmitus megabaitu, pirms tā kļūst ass; programmatūras renderēta pārlūka vidē (ekrānšāviņi) tas zīmē dažus kadrus sekundē ar vairākiem simtiem flīzes.

## Ierobežojumi un kas nāks vēlāk {#limits-and-what-comes-later}

- **Reljefa izšķirtspēja**: apmēram 30 m labākajā gadījumā, un rupjāk lielās teritorijās. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFF failos AWS, bez atslēgas, fiksēts kredīta teksts) ir labāks avots: 30 m visur, GLO-90 tur, kur GLO-30 ir caurumi (Armēnija un Azerbaidžāna, ko DCS Caucasus aptver). Tam vajadzīgs GeoTIFF lasītājs, un tas vēl nav izmantots.
- **Labāks reljefs**: Copernicus GLO-30 AWS nesūta CORS galvenes, tāpēc pārlūks to nevar nolasīt; OpenTopography spoguļkopiju var nolasīt (CORS un diapazoni), bet tās noteikumi publiskas lietotnes izpildes lietošanai nav zināmi — jāprasa pirms jebkādas lietošanas. Mapterhorn jau satur GLO-30.
- **Izliekums**: zeme ir plakana plakne, un augstumi netiek nolaisti zemes izliekuma dēļ, atbilstoši tam, kā ieraksti ir novietoti (augstums kā augstums); tālu no atsauces abi dreifē kopā, par mazāk nekā tūkstošdaļu pie 100 km. Liekt tikai flīzes nozīmētu atdalīt tās no datiem tālu, tāpēc tas netiek piedāvāts. Izliekts horizonts prasa to pašu nolaišanu — attālumu no kameras kvadrātā dalītu ar divkāršu zemes rādiusu — katrā gājienā, kas zīmē pozīciju (līmenis, flīzes, siltums, līnijas, kastes, uzraksti, izvēle), kā vienu kopīgu uniformu; īsta globusa režīmam vajadzīgas arī datu pozīcijas ap zemes centru un renderēšana attiecībā pret kameru. Abi ir plānoti kopā ar globusa režīmu.
- **Tikai tagadējā pasaule**: DCS un IL-2 vēsturiskās kartes (Normandija 2, Lamanšs, Vācija aukstā kara laikā, katra IL-2 karte) tiek zīmētas ar šodienas pilsētām, ceļiem un krasta darbiem; panelis to saka. Laikmeta lidlauki netiek zīmēti.
- **Nav globusa režīma**: fons ir plakana lokāla plakne. Visas zemes skats ir plānots.
- Ceļi lielās teritorijās tiek paplašināti, lai paliktu redzami; tuvumā tie ir platāki nekā dzīvē.
- DCS teātru nosaukumi Watcher tabulās tiek saskaņoti tā, kā DCS tos dod `mission.theatre`; nosaukums, kas nav sarakstā, atkrīt uz pirmo fiksāciju, noapaļotu līdz veseliem grādiem, un tikai uz platumu un garumu.

## Vēsturiskās kartes (vēl nav būvētas) {#historical-maps-not-built-yet}

Laikmeta kartes vēlāk varētu uzklāt uz vēsturiskajiem teātriem. ASV Armijas kartogrāfijas dienesta (AMS) sērijas ir ASV federālās valdības darbi, parasti uzskatīti par publisko domēnu (pārbaudiet katras skenējuma ierakstu; daudzas ir British GSGS vai vācu oriģinālu pārizdevumi, kuriem Karalistes autortiesības vai anonīmā darba termiņš arī ir beidzies):

| Teātris | Sērija | Kur skenēts |
|---|---|---|
| IL-2 Staļingrada, Maskava, Kubaņa, Velikije Luki, Prohorovka, Ļeņingrada | AMS **N501**, Austrumeiropa 1:250 000 (sastādīta 1950. gados no padomju un vācu kartēm) | UT Austin PCL; daži lapas georeferencētas UT GeoData |
| IL-2 Normandija, DCS Normandija 2 un Lamanšs | AMS **M661** / GSGS 4250, Francija 1:50 000 | UT Austin PCL, Prinstona |
| IL-2 Reinzeme | AMS **M501** 1:250 000 un **M841** 1:25 000 (Vācija) | UT Austin PCL |
| IL-2 Koreja | AMS **L751** 1:50 000 (1951. gada izdevumi) un **L552** 1:250 000 | ANU Open Research (L751 lapas, "copyright expired"), UT Austin PCL, Jēlas |
| IL-2 Arras (Flying Circus) | Britu Pirmā pasaules kara tranšeju kartes (ne AMS) | McMaster universitāte; Skotijas Nacionālā bibliotēka (nekomerciāli noteikumi) |

AMS lapām ir platuma un garuma atzīmes stūros, tāpēc katra tiktu novietota ar četru stūru pielāgošanu un uzklāta uz reljefa kā tekstūra, būvēta un glabāta lokāli kā flīzes.

## Izstrādātājiem {#for-developers}

### `geo` ieraksts Parquet tabulā {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` un `up` nosauc kolonnas, kas satur austrumu un ziemeļu metrus uz tās pašas tangenciālās plaknes pie (`lat0`, `lon0`) un augstumu. Ielāde paturi atsauci, kad tās kartējums ņem tieši šīs kolonnas (austrumi kā X, ziemeļi un augstums kā Y un Z jebkurā secībā). Pēc izvēles `dcs` ieraksts nosauc DCS tabulas pašas metrus (x ziemeļi, y augšup, z austrumi) un tās teātri: ielāde, kas kartē šīs kolonnas, tiek novietota caur teātra Transversālo Merkatora projekciju ([DCS koordinātes](#dcs-coordinates)). Tabula bez `geo` tiek lasīta kā agrāk.

### DCS koordinātes {#dcs-coordinates}

Katrs DCS teātris ir Transversālā Merkatora projekcija (WGS84, mērogs 0,9996) ar savu centrālo meridiānu un nepatieso sākumpunktu; DCS x ir ziemeļu koordināte, z — austrumu. Konstantes ir tās, ko publicē pydcs projekts; matemātika ir Krīgera rindas līdz sestajai kārtai (Karney 2011), pārnesta uz [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Fons DCS metriem tiek būvēts tieši tajās, tāpēc Watcher DCS tabula, kas kartēta ar `dcs_x`/`dcs_y`/`dcs_z`, līmenis, ko DCS reljefa konvertētājs uzrakstījis, un fons visi dala vienu rāmi. Irākas konstantes nav publicētas; tās ir piemērotas publicētiem atsauces punktiem (4 cm vidējā kvadrātiskā kļūda).

Watcher DCS tabulas atrodas uz tangenciālas plaknes teātra fiksētajā atsauces punktā (tas pats punkts, ko izmanto teātra izvēlne, zemāk), tāpēc vairākas misijas uz viena teātra apvienojas ar savu atsauci neskartu un sakrīt ar teātra fonu, neizkustinot to.

### Vienkāršošana un budžets {#simplification-and-budget}

- Ēkas, kas mazākas par 20 m², tiek izmestas; 60 m², kad kaste ir vairāk nekā 30 km šķērsām, 150 m² pāri 80 km. Pārējās tiek pievienotas no lielākās uz mazāko, līdz ēkas sasniedz 1,5M trijstūru.
- Mazie ceļi, apkalpošanas ceļi un takas tiek izmesti pāri 60 km šķērsām; pāri 150 km paliek tikai automaaģistrāles, galvenie, primārie un sekundārie ceļi.
- Viss fons paliek zem aptuveni 3M trijstūru. Importa piezīmē ir norādīts, cik ēku ir izlaists.

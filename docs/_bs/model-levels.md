---
title: "3D nivoi"
parent: "Nivoi i geometrija pozadine"
nav_order: 2
lang: "bs"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# 3D nivoi

3D nivo je model mjesta - brda, ulica, zgrada - u kojem se nalaze vaši podaci. Omogućava vam da vidite na kojem spratu, brdu ili krovu je toplota. Pregledač ga dijeli na kopno (čvrsto), strukture (prozirne, pa možete da gledate unutra) i vodu.

## Učitajte 3D nivo {#load-a-3d-level}

1. Prvo učitajte svoje podatke ([Unos podataka](getting-data-in.md)). Model mora koristiti isti prostor svijeta i jedinicu kao podaci, Y gore.
2. U **Pozadina / nivo** izaberite **Cilj pojednostavljivanja**. Ostavite na *Puno - bez pojednostavljivanja* osim ako je model ogroman.
3. Pritisnite **3D model…** i izaberite datoteku `.glb`, `.gltf`, `.obj`, `.stl` ili `.ply`.
4. Sačekajte red napretka. **Otkaži** ga zaustavlja.
5. Pritisnite **F** na prikazu. Kopno je čvrsto, strukture su prozirne ljuske, voda je ravna.
6. Podesite izgled u [Izgled nivoa](level-appearance.md). Pritisnite **Spremi u biblioteku** da zadržite rezultat ([Biblioteka nivoa](level-library.md)).

![Učitan 3D nivo: neprozirno kopno s konturnim linijama, prozirne zgrade, ravna voda](../assets/img/en/model-levels-loaded.webp)

**3D model…** učitava mrežu nivoa. Ona se raščlanjuje, klasifikuje i pojednostavljuje u pozadinskom radniku ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) uz red napretka i **Otkaži**: *Čitanje modela*, *Raščlanjivanje datoteke*, *Pakovanje N tekstura*, *Klasifikovanje N dijelova*, *Pojednostavljivanje kopna (N trouglova)*, *Pojednostavljivanje struktura (N trouglova)*, *Gradnja žičanog modela*.

## Formati {#formats}

| Format | Šta se čita | Ograničenja |
|---|---|---|
| `.glb` | Svaki primitiv mreže s `mode` 4 (trouglovi) ili bez moda, s primijenjenom svjetskom transformacijom svakog čvora; `POSITION`; `COLOR_0` (vec3 ili vec4) kao boja vrha; `baseColorTexture` materijala i njegov `TEXCOORD_n` kao tekstura; imena čvorova i mreža kao imena dijelova. | Linije i tačke se preskaču. |
| `.gltf` | Isto. | Samo s ugrađenim baferima: glTF koji upućuje na spoljni `.bin` se odbija porukom *Izvezite kao jedan .glb da geometrija bude ugrađena.* |
| `.obj` | Površi, s blokovima `o` i `g` kao dijelovi. | Samo geometrija (bez materijala). |
| `.stl` | Binarni i ASCII (`solid …`). | Jedan dio. |
| `.ply` | Samo ASCII. | Binarni PLY se odbija porukom *Pretvorite u .glb ili binarni .stl.* |

Samo geometrija: položaji, normale i trouglovi spojeni u jedan bafer, plus boje i koordinate teksture gdje postoje ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Model bez trouglova se odbija. Model mora biti u istom prostoru svijeta i jedinici kao podaci (Y gore): ništa se ne transformiše da bi stalo.

## Kopno, strukture i voda {#ground-structures-and-water}

Nivo se pri uvozu dijeli na tri klase, jer traže suprotan tretman ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Kopno** - crta se neprozirno i osjenčeno znakovima reljefa (nagib, konture, rampa visine) da se položaj može očitati u odnosu na njega.
- **Strukture** - zgrade i rekviziti stoje između kamere i toplote unutar njih, pa se crtaju kao **prozirna ljuska** (slabe strane s svijetlim obodom, plus jedinstvene ivice) - ili, kad imaju teksture, čvrste u svojim teksturama.
- **Voda** - ravna, bez znakova terena: kontura preko jezera je besmislena.

Svaki dio (čvor glTF-a, objekat ili grupa OBJ-a) klasifikuje se sam, prvim pravilom koje važi:

1. **Oznaka izvoznika.** Ime koje počinje sa `ground:`, `structure:` ili `water:` (ili sa `|` umjesto `:`) uzima se doslovno. Izvoznici projekta svaki dio označavaju na ovaj način.
2. **Imena vode.** `water` kao riječ (ne *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Imena kopna.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Imena struktura.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometrija.** Dio koji pokriva više od 25% površine X-Z mape, s više od 60% površine trouglova okrenute nagore, je kopno. Dio s manje od 45% okrenuto nagore, ili viši od 15% visine nivoa dok pokriva manje od 10% njegove površine, je struktura. Udio okrenut nagore je ponderisan površinom, pa kuća nije proglašena ravnom zbog krova.
6. **Inače kopno** - nejasan dio se podrazumijevano svrstava u kopno, jer bi podrazumijevana ljuska gotovo nevidljiva učinila da nivo izgleda kao greška u prikazivanju.

Model koji je jedan dio klasifikovan kao struktura pretvara se u kopno (*jedna neimenovana mreža - tretira se kao kopno*).

### Mreže za navigaciju {#navigation-meshes}

Dio imenovan `nav:…` (`nav:walkable` izvoznika nivoa) je mreža za navigaciju: mjesto gdje vojnik može stati. Navodi se kao kopno (*mreža za navigaciju - nije nacrtana, jer leži na tlu; klikovi je i dalje nalaze*), ali **se ne crta**. Prekrivena je preko kopna iz kojeg je generisana, koplanarno s njim do centimetara, i kad bi se crtala kao kopno, dvije površine bi se borile za svaki piksel: na nivou s pečenom teksturom tla cijelo igrivo područje se prikazivalo kao oštro ograničene mrlje sive i bež boje, po jedna za svaki trougao navigacije. Zadržava se, nepojednostavljena, da bi [izbor klikom](camera.md#click-to-pick) mogao reći da li je mjesto prohodno. Unosi u biblioteci je ne zadržavaju.

**Prikaži klasifikaciju dijelova (N)** na panelu (prikazano za modele s više od jednog dijela) navodi svaki dio s njegovom klasom i razlogom - *označeno od izvoznika*, *ime odgovara obrascu*, *pokriva X% mape, Y% okrenuto nagore*, *Y% okrenuto nagore, Z% visine nivoa*, *nejasno - podrazumijevano kao kopno*. Da promijenite jedan, preimenujte dio u izvornom modelu i ponovo uvezite; podjela je ugrađena u bafere indeksa.

## Pojednostavljivanje {#simplification}

**Cilj pojednostavljivanja** postavlja budžet trouglova za sljedeći uvoz ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Postavka | Trouglovi |
|---|---|
| *Puno - bez pojednostavljivanja* (podrazumijevano) | svi |
| *Visoko - 8M trouglova* | 8.000.000 |
| *Srednje - 3M trouglova* | 3.000.000 |
| *Nisko - 800k trouglova* | 800.000 |
| *Silueta - 100k trouglova* | 100.000 |

Budžet se dijeli **60% na strukture i 40% na kopno**, pojednostavljeni odvojeno - strukture najbrže gube oblik pod proređivanjem. Voda se ne pojednostavljuje. Pojednostavljivanje je sažimanje ivica s kvadratnim metrikama greške ([meshoptimizer](https://github.com/zeux/meshoptimizer), preko WebAssemblyja), poslije spajanja poklapajućih vrhova, pa siluete i oštre ivice opstaju. Napomena o uvozu prijavljuje `izvor → sada trouglova, odstupanje X%`, podjelu kopno / strukture / voda po dijelovima, i - kad je korišteno *Puno* za model iznad 8M trouglova - predlaže *Visoko* (do 30M) ili *Srednje* (iznad toga). Bez WebAssemblyja pojednostavljivač nije dostupan, a uvoz to kaže.

Nivoi izvoznika projekta već imaju budžet; cilj postoji za sirovu umjetnost bez budžeta iza sebe.

## Teksture {#textures}

`.glb` čiji dijelovi nose teksture boje osnove crta se u njima - izvoz trkaće staze, na primjer, nosi po jednu za svaku teren-pločicu i po jednu za svaki postavljeni model.

Tekstura tla se podrazumijevano prikazuje kad postoji; strukture koje nose teksture počinju **čvrste, u vlastitim teksturama** (ivičnjaci, ograde, zidovi od guma i znakovi su ivice puta, a ne zgrade u koje treba gledati), s isključenom žičanom mrežom i isključenim ravnim osjenčavanjem. Vidi [Izgled nivoa](level-appearance.md).

## Veliki nivoi {#large-levels}

- Iznad **300.000** trouglova struktura, ivice strukture se počinju isključene, a neprozirnost površina 35%: s jednom ivicom u svakom pikselu četvrt izgleda kao ravno bijela.
- Daleka ravan kamere se širi da stane nivo ([Nivoi](levels.md#what-a-level-does-for-the-heat)).

## Za programere {#for-developers}

### Atlas tekstura {#texture-atlas}

Svaka tekstura se pakuje u **jedan atlas** u radniku uvoza ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), pa nivo ostaje jedno crtanje, jedan uzorkivač i jedan atribut koordinata teksture na oba pozadinska sistema:

- pakuje se u police na vlastitoj veličini svake slike, smanjuje se samo ako se skup ne bi stao u **8192 px** ni u jednom smjeru (podrazumijevana granica veličine teksture WebGPU-a);
- **granica od 16 piksela** oko svake slike, i samo 5 nivoa mip-a koje ta granica štiti, pa daleki znak nikad ne uzorkuje teksturu susjeda;
- **ponavljajuće teksture** ostaju ponavljajuće. Slika čiji glTF uzorkivač ponavlja (podrazumijevano za glTF) i čije koordinate teksture izlaze iz 0..1 - zid od cigle čiji UV ide od 0 do 40 duž njega - postaje *pločica*: njeni vrhovi zadržavaju svoje koordinate i 16-bitni broj pločice, a sjenčari prelamaju koordinatu u pravougaonik pločice po pikselu, uzimajući nivo mip-a iz neprelomljene koordinate da šavovi ne bi bili vidljivi. Granica pločice drži vlastitu suprotnu ivicu. Osa čiji uzorkivač steže se steže; slika čije koordinate ostaju unutar 0..1 crta se kao i prije. Nivo s pločicama košta 4 bajta više po vrhu.

### Ugovor izvoznika {#the-exporter-contract}

Šta pregledaču treba od nivoa, bez obzira ko ga je napravio:

- jedan samostalni `.glb`;
- `POSITION` float32, primitivi trouglova;
- imena čvorova `ground:*`, `structure:*` i `water:*` (sve ostalo se klasifikuje prema gornjim pravilima), i `nav:*` za mrežu za navigaciju, koja se zadržava ali se ne crta;
- koordinate u prostoru svijeta, **Y gore**, u istoj jedinici kao telemetrija, pa podaci sjede na nivou bez ikakvog koraka postavljanja.

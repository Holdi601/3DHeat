---
title: "3D līmeņi"
parent: "Līmeņi un fona ģeometrija"
nav_order: 2
lang: "lv"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# 3D līmeņi

3D līmenis ir vietas modelis - kalni, ielas, ēkas -, kurā atrodas jūsu dati. Tas ļauj redzēt, uz kura stāva, kalna vai jumta atrodas siltums. Skatītājs to sadala zemē (cieta), būvēs (caurspīdīgas, lai varētu skatīties iekšā) un ūdenī.

## Ielādēt 3D līmeni {#load-a-3d-level}

1. Vispirms ielādējiet savus datus ([Datu ievade](getting-data-in.md)). Modelim jābūt tajā pašā pasaules telpā un mērvienībā kā datiem, Y augšup.
2. Sadaļā **Fons / līmenis** izvēlieties **Vienkāršošanas mērķis**. Atstājiet *Pilns - bez vienkāršošanas*, ja vien modelis nav milzīgs.
3. Nospiediet **3D modelis…** un izvēlieties `.glb`, `.gltf`, `.obj`, `.stl` vai `.ply` failu.
4. Pagaidiet progresa rindu. **Atcelt** to aptur.
5. Nospiediet **F** skatā. Zeme ir cieta, būves ir caurspīdīgi apvalki, ūdens ir plakans.
6. Noregulējiet izskatu lapā [Līmeņa izskats](level-appearance.md). Nospiediet **Saglabāt bibliotēkā**, lai paturētu rezultātu ([Līmeņu bibliotēka](level-library.md)).

![Ielādēts 3D līmenis: necaurspīdīga zeme ar kontūrlīnijām, caurspīdīgas ēkas, plakans ūdens](../assets/img/en/model-levels-loaded.webp)

**3D modelis…** ielādē līmeņa tīklu. To parsē, klasificē un vienkāršo fona darbinieks ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) ar progresa rindu un **Atcelt**: *Nolasa modeli*, *Parsē failu*, *Iepako N tekstūras*, *Klasificē N daļas*, *Vienkāršo zemi (N trijst.)*, *Vienkāršo būves (N trijst.)*, *Veido vadu rāmi*.

## Formāti {#formats}

| Formāts | Ko nolasa | Ierobežojumi |
|---|---|---|
| `.glb` | Katru tīkla primitīvu ar `mode` 4 (trijstūri) vai bez režīma, ar katra mezgla pasaules transformāciju; `POSITION`; `COLOR_0` (vec3 vai vec4) kā virsotnes krāsa; materiāla `baseColorTexture` un tā `TEXCOORD_n` kā tekstūra; mezglu un tīklu nosaukumi kā daļu nosaukumi. | Līnijas un punkti tiek izlaisti. |
| `.gltf` | Tas pats. | Tikai ar iekļautiem buferiem: glTF, kas atsaucas uz ārēju `.bin`, tiek noraidīts ar *Eksportējiet kā vienu .glb, lai ģeometrija būtu iekļauta.* |
| `.obj` | Sejas, ar `o` un `g` blokiem kā daļām. | Tikai ģeometrija (bez materiāliem). |
| `.stl` | Bināri un ASCII (`solid …`). | Viena daļa. |
| `.ply` | Tikai ASCII. | Binārais PLY tiek noraidīts ar *Pārveidojiet uz .glb vai bināro .stl.* |

Tikai ģeometrija: pozīcijas, normāles un trijstūri, savienoti vienā buferī, kā arī krāsas un tekstūras koordinātas, kur tādas ir ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Modelis bez trijstūriem tiek noraidīts. Modelim jābūt tajā pašā pasaules telpā un mērvienībā kā datiem (Y augšup): nekas netiek pārveidots, lai ietilptu.

## Zeme, būves un ūdens {#ground-structures-and-water}

Līmenis importējot tiek sadalīts trīs klasēs, jo tām vajag pretējus apstrādes veidus ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Zeme** - zīmēta necaurspīdīga un ēnota ar reljefa norādēm (nogāze, kontūras, augstuma gradients), lai pozīciju varētu nolasīt pret to.
- **Būves** - ēkas un priekšmeti stāv starp kameru un siltumu iekšā, tāpēc tie tiek zīmēti kā **caurspīdīgs apvalks** (vāja sejas ar spilgtu malu, plus dublikātu malas) - vai, ja ir tekstūras, kā cietas savās tekstūrās.
- **Ūdens** - plakans, bez reljefa norādēm: kontūrlīnija pāri ezeram ir nesaprātīga.

Katra daļa (glTF mezgls, OBJ objekts vai grupa) tiek klasificēta atsevišķi pēc pirmā noteikuma, kas attiecas:

1. **Eksportētāja etiķete.** Nosaukums, kas sākas ar `ground:`, `structure:` vai `water:` (vai ar `|` `:` vietā), tiek ņemts vārda pēc. Projekta paši eksportētāji katru daļu marķē šādi.
2. **Ūdens nosaukumi.** `water` kā vārds (nevis *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Zemes nosaukumi.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Būvju nosaukumi.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Ģeometrija.** Daļa, kas aizņem vairāk nekā 25% no kartes X-Z laukuma un kuras trijstūru laukuma vairāk nekā 60% vērsti uz augšu, ir zeme. Daļa, kurai mazāk nekā 45% vērsti uz augšu, vai kas ir augstāka par 15% no līmeņa augstuma, aizņemot mazāk nekā 10% no tā laukuma, ir būve. Uz augšu vērstā daļa tiek svērta pēc laukuma, tāpēc māja netiek saukta par plakanu tāpēc, ka tai ir jumts.
6. **Citādi zeme** - neviennozīmīga daļa pēc noklusējuma ir zeme, jo gandrīz neredzams apvalks kā noklusējums liktu līmenim izskatīties pēc renderēšanas kļūmes.

Modelis, kas ir viena daļa, klasificēta kā būve, tiek padarīts par zemi (*viens nenosaukts tīkls - traktēts kā zeme*).

### Navigācijas tīkli {#navigation-meshes}

Daļa ar nosaukumu `nav:…` (līmeņa eksportētāja `nav:walkable`) ir navigācijas tīkls: vieta, kur var stāvēt karavīrs. Tas tiek uzskaitīts kā zeme (*navigācijas tīkls - nav zīmēts, jo atrodas uz zemes; klikšķi to tomēr atrod*), bet **netiek zīmēts**. Tas ir uzklāts uz zemes, no kuras tas ģenerēts, un atrodas ar to vienā plaknē centimetru precizitātē; zīmējot to kā zemi, abas virsmas cīnījās par katru pikseli: līmenī ar iepriekš apstrādātu zemes tekstūru visa spēlējamā zona izskatījās kā ass malu plankumi pelēkā un bēšā krāsā, pa vienam uz katru navigācijas trijstūri. Tas tiek paturēts, nevienkāršots, lai [klikšķis-lai-izvēlētos](camera.md#click-to-pick) varētu pateikt, vai vieta ir staigājama. Bibliotēkas ieraksti to nepatur.

**Rādīt daļu klasifikāciju (N)** panelī (rāda modeļiem ar vairāk nekā vienu daļu) uzskaita katru daļu ar tās klasi un iemeslu - *marķēta ar eksportētāju*, *nosaukums atbilst šablonam*, *aizņem X% no kartes, Y% vērsti uz augšu*, *Y% vērsti uz augšu, Z% no līmeņa augstuma*, *neviennozīmīga - pēc noklusējuma zeme*. Lai to mainītu, pārdēvējiet daļu avota modelī un importējiet vēlreiz; sadalījums ir iekļauts indeksu buferos.

## Vienkāršošana {#simplification}

**Vienkāršošanas mērķis** nosaka trijstūru budžetu nākamajam importam ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Iestatījums | Trijstūri |
|---|---|
| *Pilns - bez vienkāršošanas* (noklusējums) | visi |
| *Augsts - 8M trijstūri* | 8 000 000 |
| *Vidējs - 3M trijstūri* | 3 000 000 |
| *Zems - 800k trijstūri* | 800 000 |
| *Silueta - 100k trijstūri* | 100 000 |

Budžets tiek sadalīts **60% būvēm un 40% zemei**, vienkāršots atsevišķi - būves zaudē formu visātrāk, kad samazina. Ūdens netiek vienkāršots. Vienkāršošana ir malu sabrukums ar kvadrātiskām kļūdu metrikām ([meshoptimizer](https://github.com/zeux/meshoptimizer), caur WebAssembly), pēc tam, kad sakrītošās virsotnes ir savienotas, tāpēc siluetas un asās malas saglabājas. Importa piezīme ziņo `avots → tagad trijstūri, novirze X%`, zemes / būvju / ūdens sadalījumu pa daļām un - ja tika izmantots *Pilns* modelim virs 8M trijstūriem - iesaka *Augsts* (līdz 30M) vai *Vidējs* (virs tā). Bez WebAssembly vienkāršotājs nav pieejams, un imports to saka.

Līmeņi no projekta paša eksportētājiem jau ir ar budžetu; mērķis pastāv neapstrādātam materiālam bez budžeta aiz tā.

## Tekstūras {#textures}

`.glb`, kura daļām ir bāzes krāsas tekstūras, tiek zīmēts ar tām - piemēram, sacīkšu trases eksports satur vienu katram zemes laukumam un vienu katram novietotajam modelim.

Zemes tekstūra tiek rādīta pēc noklusējuma, kad tā ir; būves, kam ir tekstūras, sākas **cietas, savās tekstūrās** (apmales, drošības barjeras, riepu sienas un zīmes ir ceļa malas, nevis ēkas, kurās skatīties iekšā), ar izslēgtu vadu rāmi un izslēgtu plakano ēnojumu. Skat. [Līmeņa izskats](level-appearance.md).

## Lieli līmeņi {#large-levels}

- Virs **300 000** būvju trijstūriem būvju malas sākotnēji ir izslēgtas un sejas necaurspīdīgums ir 35%: ar malu katrā pikselī rajons izskatās kā plakans balts.
- Kameras tālā plakne paplašinās, lai ietilptu līmenī ([Līmeņi](levels.md#what-a-level-does-for-the-heat)).

## Izstrādātājiem {#for-developers}

### Tekstūru atlants {#texture-atlas}

Katra tekstūra tiek iepakota **vienā atlantā** importa darbiniekā ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), tāpēc līmenis paliek viens zīmējums, viens paraugu ņēmējs un viens tekstūras koordinātu atribūts abās aizmugurēs:

- iepakots plauktos katra attēla pašā izmērā, samazināts tikai tad, ja komplekts nederētu **8192 px** katrā virzienā (WebGPU noklusējuma tekstūras izmēra ierobežojums);
- **16 pikseļu josla** ap katru attēlu un tikai tos 5 mip līmeņus, ko šī josla aizsargā, tāpēc tālu zīme nekad nepaņem kaimiņa tekstūru;
- **atkārtotas tekstūras paliek atkārtotas.** Attēls, kura glTF paraugu ņēmējs atkārto (glTF noklusējums) un kura tekstūras koordinātas iziet ārpus 0..1 - ķieģeļu siena, kuras UV iet no 0 līdz 40 gar to -, kļūst par *kafeli*: tās virsotnes paturēt savas koordinātas un 16 bitu kafeles numuru, un ēnotāji koordinātu ietin kafeles taisnstūrī katrā pikselī, mip līmeni ņemot no neietītās koordinātas, lai šuves nerādītos. Kafeles josla satur tās pašas pretējo malu. Ass, kuras paraugu ņēmējs piespiež, tiek piespiesta; attēls, kura koordinātas paliek 0..1 robežās, tiek zīmēts kā agrāk. Līmenis ar kafelēm maksā 4 baitus vairāk uz virsotni.

### Eksportētāja līgums {#the-exporter-contract}

Ko skatītājs no līmeņa prasa, neatkarīgi no tā, kas to izveidoja:

- viens pašpietiekams `.glb`;
- float32 `POSITION`, trijstūru primitīvi;
- mezglu nosaukumi `ground:*`, `structure:*` un `water:*` (viss cits tiek klasificēts pēc iepriekš minētajiem noteikumiem), un `nav:*` navigācijas tīklam, kas tiek paturēts, bet netiek zīmēts;
- pasaules telpas koordinātas, **Y augšup**, tajā pašā mērvienībā kā telemetrija, tāpēc dati atrodas uz līmeņa bez novietošanas soļa.

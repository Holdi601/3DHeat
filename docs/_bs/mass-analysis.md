---
title: "Masovna analiza"
nav_order: 8
lang: "bs"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Masovna analiza: hiljade mečeva odjednom

**Masovna analiza** pokazuje šta cijeli folder mečeva zbraja: koje vozilo najviše pobjeđuje, koja strana je u prednosti, gdje je borba. Koristite je kad imate mnogo više mečeva nego što biste mogli da pogledate.

Radi iz malog sažetka svakog meča, pa se hiljadu ili deset hiljada mečeva otvori brzo. Puni redovi se učitavaju samo za mečeve koje kliknete.

## Probajte {#try-it}

1. Otvorite **Masovna analiza** na bočnoj traci Toplotne mape.
2. Pritisnite **Mapa…** (ili **Datoteke…**) i izaberite svoje `.3dheat` mečeve.
3. Sačekajte dok panel čita sažetke („Sažeci… n od N").
4. Pritisnite **Otvori analizu**. Otvara se prozor s karticama.
5. Podesite filtere (Igra, Mapa, Režim, Iz, U), zatim pročitajte karticu, na primjer Balans.
6. Kliknite red, ćeliju ili uvid: njegovi mečevi se učitavaju u 3D prikaz, s kamerom na mjestu.

![Kartica Balans: stopa pobjeda i ubistva po smrti za svako vozilo](../assets/img/en/mass-balance.webp)

```
folder .3dheat -> sažeci -> prozor (kartice) -> klik na red -> mečevi se otvaraju u 3D
```

Datoteka `.3dheat` je jedan meč ([Jedna datoteka po meču](container.md)). *Toplotna mapa* i *red* objašnjeni su u [rječniku](glossary.md).

## Dobijanje sažetaka {#getting-the-summaries}

Većini ljudi ništa ne treba: panel sam računa sažetke koji nedostaju. Da biste jednom pripremili veliki folder, koristite alat van mreže ispod.

Svaki meč `.3dheat` dobija sažetak (`src/mass/summarize.ts`), koji se čuva
u kontejneru kao član `<match>.summary.json` (uloga `summary`, vidi
[Jedna datoteka po meču](container.md)). Alat van mreže piše njih i
indeks po folderu. To je alat za programere; pokrenite ga nad velikim folderom da biste uštedjeli panelu posao:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Meč koji je već sažet (ista verzija formata) samo se čita; `--force`
  ga računa ponovo. `--no-write` ostavlja kontejnere netaknutim.
- Datoteka promijenjena u posljednjih `--settle` minuta (10) se izostavlja: konverter
  je možda još piše.
- `<folder>/3dheat-index.jsonl.gz`: jedan red po meču - njegova putanja, veličina, vrijeme
  i sažetak bez mreže. `<folder>/3dheat-index.grids.jsonl.gz`: jedan red po meču
  s njegovom mrežom.
- Pokrenite ga na mašini na kojoj su datoteke, s niskim prioritetom (na primjer `nice -n 19 ionice -c3` na Linuxu).

Panel za svaki meč uzima prvo od: reda indeksa foldera (ista
putanja i veličina), keša pregledača (IndexedDB, po imenu, veličini i vremenu),
člana `summary` kontejnera ili sažetka izračunatog u skupu radnika i
keširanog. Zato folder bez indeksa također radi - prvi put brzinom čitanja tabela, a poslije iz keša.

## Panel {#the-panel}

Izaberite folder (ili datoteke; **Dodaj folder…** dodaje još jedan). Prozor ima filtere **Igra**, **Mapa**, **Režim**, **Iz** i **U**, izbor **Podijeli po**, **Najmanje života** i **Samo igrači**, te ove kartice. Svaki broj dolazi iz sažetaka, a klik na red, ćeliju ili uvid učitava njegove mečeve u prikaz kao preklapanje za mnogo mečeva, s filterima koji ih prikazuju (vozilo, klasa, oružje, tim, igrač) i kamerom na mjestu:

| Kartica | Šta |
|---|---|
| Pregled | mečevi, sati, igrači, životi, redovi, datumi; mečevi po danu; po igri, mapi, režimu; zbirovi događaja; ekonomija po valuti; kada u meču se šta dešava |
| Balans | po vozilu, klasi, oružju ili timu, podijeljeno po mapi, režimu, nivou ili igri: K/D sa svojim ~95% intervalom, stopa pobjeda (Wilson), preživljavanje, ubistva i pogoci u minuti, zarada u minuti, i q - Benjamini-Hochberg stopa lažnih otkrića za K/D i pobjedu u odnosu na ostatak podjele. **Najmanje života** skriva redove s premalo života da bi im se vjerovalo; **Samo igrači** izostavlja ono što je vozio AI misije |
| Trendovi | udio (učešće), K/D ili stopa pobjeda najboljih vozila ili klasa po danu, sedmici ili mjesecu |
| Igrači | različiti igrači, mečevi po igraču, igrači po meču, najčešći igrači |
| Strane | svaka strana svake mape: mečevi pobijeđeni naspram ravnomjerne podjele |
| Bliska borba | podaci o rundama: otvarajući dvoboji po strani i njihova konverzija, razmjene, onaj koji viri naspram onoga koji drži, unakrsne vatre, ulasci zaslijepljenih, nišanjenje, postavljanja, prednost u broju igrača i, **Po mapi**, mjesta koja ubijaju igrače koji ulaze u njih - svaki kao udio sa svojim Wilson intervalom, iz brojeva `cqb` sažetaka ([Bliska borba i runde](close-quarters.md)) |
| R6 površine | tragovi Rainbow Six Siege na nivou (rupe od metaka i slično) po površini nivoa: tragovi, po rundi mape, prostorija, udio tragova s utvrđenim strijelcem; klik otvara vrste tragova, operatere i klase oružja strijelaca te gdje su na površini tragovi (mala toplotna mapa od ćelija od četvrt metra); površina zadržava svoj id kroz mečeve jedne verzije mape. Iz brojeva `marks` sažetaka |
| Mapa | zbrojena mreža mape: prisustvo, ubistva, smrti, K/D, bilo koji događaj, tok i **vruće u koliko mečeva** (stabilnost); po timu, na 1, 2, 4 ili 8 puta veću ćeliju |
| Mjesta | mjesta koja se ističu u brojevima, ali ne i u toplotnoj mapi (velika oblast koja je zauzeta kao cjelina, koridori, pojasevi visine) i mjesta čiji držaoci dobijaju više ili manje svojih rundi; **Pronađi mjesta** |
| Niše | grupe koje rade znatno bolje ili gore od ostalih (vozilo na jednoj mapi, sektor na jednoj visini) i grupe rundi dobijenih iznad onoga što je njihova strana dobila u istim mečevima; **Pronađi niše** |
| Uvidi | masovni detektori i detektori mape (ispod); **Kopiraj izvještaj (JSON)** daje JSON koji čita jezički model |

## Uvidi preko mnogo mečeva {#insights-over-many-matches}

Kartica **Mjesta** pronalazi mjesta koja se ističu u brojevima, ali ne i u toplotnoj mapi - veliku oblast koja je zauzeta kao cjelina, koridor, pojas visine, mjesto zauzeto samo u jednom dijelu meča - označava one koje obična toplotna mapa ne pokazuje kao **skrivene**, i ocrtava ih u 3D prikazu; **Učitaj** leti tamo s mečevima koje je držao. Kartica **Niše** pronalazi grupe (vozilo na jednoj mapi i strani, sektor na jednoj visini) koje rade znatno bolje ili gore od ostalih; kliknite jednu da vidite njena preciziranja.

### Ko je pobijedio {#who-won}

Gdje mečevi kažu ko je dobio svaku rundu ([kolona ishoda](data-formats.md#outcome-columns) `won`), rezultat je zaseban cilj:

- **Mjesta: procenat pobjeda.** Za svaku stranu udio njenih rundi na mjestu koje je dobila, naspram udjela koji je dobila bilo gdje u istom meču - tako je osnova balans mape, strane i samog meča, a ističu se samo mjesta čiji držaoci dobijaju više (ili manje) svojih rundi. Izmišljeni primjer: *„Dust: strana T dobija više svojih rundi kad je ovdje: dobijeno 61% od 412, naspram 49% očekivanih prema vlastitoj stopi u istim mečevima (izgledi 1,6×; držano u 31/48 mečeva).”* Ista stopa lažnih otkrića i provjere stabilnosti kao za svako mjesto; **Učitaj** učitava mečeve u kojima je važilo i prikazuje pozicije te strane.
- **Niše: pobjeda u rundi.** Tabela **Runde** sadrži rundu svakog života: mapu, stranu, dio meča (runde 1-4, 5-8, ...), vozilo (operatera, agenta), oružje koje je najviše koristio, mjesto koje je najduže držao, kupovinu (eco, force, full) i da li je njegova strana ostvarila prvo ubistvo. Grupa se ocjenjuje naspram onoga što je njena strana dobila u istim mečevima, pa je *T na Dust s AWP* niša samo kada su te runde dobijene češće od ostalih rundi strane T u tim mečevima. Izmišljeni primjer: *„m1 · T · AWP: dobija 80% od 320 rundi, naspram 62% očekivanih od istih strana u istim mečevima (izgledi 2,3×; 40 mečeva).”* Rangirano po porastu puta podrška; **Učitaj** učitava mečeve čije runde to najviše pokazuju.

Oboje treba sažetke verzije 2 (vidi [Dobijanje sažetaka](#getting-the-summaries)): stariji se ponovo izračunavaju.

Kartica **Uvidi** pronalazi, preko svih mečeva, vozila koja trguju ili pobjeđuju bolje ili gore od ostalih, mjesta vruća u stabilnom udjelu mečeva, strane koje pobjeđuju više od ravnomjerne podjele, vozila čija se upotreba mijenja kroz datume, i dijelove meča koji drže više ubistava nego ravnomjerna raspodjela. Svaki nalaz nosi svoje brojeve, efekat, interval i stopu lažnih otkrića (držana na 5%), a klik učitava njegove mečeve. Detalji: [Za programere](#for-developers).

## Razmjera {#scale}

Možete sami ponoviti malu verziju ovoga: `node tools/demo-data.mjs` piše 150 sintetičkih tenkovskih mečeva u `tools/.shots/demo/mass` (oko 1.000 redova svaki). Izmjereno na tih 150 sintetičkih demo mečeva iz `tools/demo-data.mjs` na desktop računaru (pravi meč je mnogo veći):

- `tools/3dheat-summarize.mjs` sa 4 radnika: 2,6 do 4,8 s za svih 150, 8 do 21 ms po meču u radniku; drugi prolaz koji samo čita sažetke traje oko 2 s.
- Otvaranje foldera u panelu, uz prisutan indeks, dok prozor ne prikaže: 0,9 do 1,6 s (dio radnika, čitanje 150 redova indeksa, traje 20 do 40 ms).
- Prelazak na karticu, dok se njena tabela ne iscrta: Pregled 10 do 30 ms, Balans 30 do 70 ms, Trendovi 30 do 45 ms, Igrači 15 do 35 ms, Strane 15 do 20 ms, Mapa 55 do 130 ms.
- Skladište drži 150 mečeva na oko 0,5 MB.

Otvaranje prozora traje jedan kratak kadar: izabrane datoteke idu radniku po 16 odjednom, a polja datuma i prva kartica dolaze kadar poslije prozora.

Skladište čuva oko 15 KB po meču, pa 10.000 mečeva zauzima ~150 MB u
radniku; mreže se nikad ne drže duže nego što mapa traži.

## Za programere {#for-developers}

### Uvidi preko mnogo mečeva {#insights-over-many-matches}

`src/mass/detect.ts` - svaki nalaz sa svojim brojevima, efektom i intervalom,
p i q (Benjamini-Hochberg preko svega što je detektor pokušao, držano na 5%),
detaljan pregled koji učitava njegove mečeve i ključ rečenice s vrijednostima;
izvještaj (`heat3d.mass/1`) je ono što `massReportForModel` predaje naratoru,
u istom obliku kao izvještaj jednog meča (`insights/seam.ts`).

| Detektor | Nalazi |
|---|---|
| `balance` | vozilo igrača koje trguje ili pobjeđuje bolje ili gore od ostalih na mapi ili u režimu |
| `hotspot` | mjesta vruća u stabilnom udjelu mečeva koji su do njega došli (vruće mečeve / viđeni mečevi, naspram ostalih ćelija mape) - ne samo vruća u zbiru |
| `side` | strana mape koja pobjeđuje više od ravnomjerne podjele |
| `meta` | udio vozila u životima igrača ili njegovo K/D koje se pomjera između ranije i kasnije polovine datuma, po mapi - dovoljno veliko da se računa, u trendu kroz kvartale, isto na većini mapa (dolje) |
| `phase` | dio dužine meča koji drži više ubistava, pogodaka, lansiranja... nego ravnomjerna raspodjela |
| `place` | mjesta koja se ističu preko mnogo mečeva (Faza B, dolje): stopa regiona ili udio ubistava naspram onoga svakog meča, krugovi, koridori, uvećane zone, pojasevi visine, faze; skriveno kad ih obična toplotna mapa ne pokazuje |
| `niche` | grupe koje rade znatno bolje ili gore (Faza B, dolje) |
| `grid.*` | detektori jednog skupa podataka (pozicije snage, vruće i tihe zone, mjesta klasa) na zbirnim mrežama svake mape: `GridMerge.toInsightJob` puni mreže prolaza uvida iz sažetaka; detektori kojima trebaju putanje preskaču |

### Sažetak {#the-summary}

Obični JSON (`src/mass/types.ts`), oko 5-30 KB sažet po meču:

- meč: igra, mapa, režim, misija, početak, dužina, redovi, životi, igrači,
  AI, timovi (životi, igrači, prisustvo, ubistva, smrti, pobjeda, novac), pobjednik;
- po vozilu i timu: klasa, nivo, životi, životi igrača, prisustvo, događaji
  po kanonskoj vrsti, ubistva po klasi mete, pobjede, novac;
- po igraču (po korisničkom ID-u, inače po imenu): tim, životi, prisustvo, ubistva, smrti,
  pogoci, lansiranja, pobjeda, vozila; po oružju: događaji po vrsti;
- s kolonom ishoda (verzija 2): dobijene i odigrane runde po timu, vozilu
  (`rw`, svaki život i runda), igraču i oružju (runde u kojima ga je strana
  koristila); runda svakog života (`outcome.u`: runda, strana, vozilo,
  najviše korišteno oružje, najduže držano mjesto, kupovina, pobjeda) te broj,
  pobjednik i strana prvog ubistva svake runde (`outcome.r`);
- kolone ekonomije (`cost_*`, `earn_*`) i njihovi zbirovi;
- faze: događaji po vrsti u 20 pregrada dužine meča i po minuti;
- ponašanje: mjere kolektivnog ponašanja meča (poravnanje, navođenje rutom, trake, gužva, vođe, zaostali, tačka loma, rizik poslije gubitaka, nizovi, dogovor o kupovini, potiskivanje), svaka sa svojim nultim modelom,
  p i q - vidi [Kolektivno ponašanje](collective-behaviour.md);
- mreža (dolje).

Broji se onako kako pregledač broji: kolone pronađene kako ih učitavač za mnogo mečeva nalazi
(`leanSpec`), događaji po `data/canonical.ts`; ubistvo oružja Tacview ide
u brojač strijelca; smrt rečena dva puta istovremeno (`dead`, `death`)
broji se jednom.

#### Mreža: na čemu gradi Faza B {#the-grid-what-stage-b-builds-on}

Prostorni dio je napravljen za statistiku skeniranja nad regionima bilo koje
veličine i oblika, a ne samo za slike toplotne mape:

- **Piramida.** Ćelije su poravnate stepeni dvojke u jedinicama svijeta (x, z kako ih pregledač postavlja). Nivo `k` su ćelije zbrojene s `ix >> k, iz >> k` -
  tačno, unutar jednog meča i preko mečeva drugih veličina ćelija - i svaki
  region (kutija, koridor duž linije, prsten) je zbir ćelija. Najfiniji nivo staje
  u robusni opseg meča (ćelije koje drže 99% prisustva) u 128 ćelija; odlutali izvan njega se čuvaju.
- **Izloženost uz svaki brojač.** Sekunde prisustva po ćeliji, po timu
  (`pt`), po klasi vozila (`pc`) i po pojasu visine (`ph`), pa se stopa, očekivanje i
  odnos regiona računaju za bilo koju podgrupu.
- **Visina.** Pojasevi iznad poda meča (1. percentil visine): ispod 3 m, 3-10,
  10-30, 30-100, 100-300, 300-1000, 1000-3000, iznad; datoteka sa kolonom
  `floor`/`storey`/`deck` ide po spratovima. `y` je srednja visina svake ćelije, `y0` njena najniža (njen sprat, za visinu iznad nje).
- **Događaji** kao torke `[cell, kind, team, class, band, count]`.
- **Runde po ishodu** (verzija 2, s kolonom ishoda i najmanje dvije runde):
  `pw` kao `[cell, team, rounds won, rounds lost]` - runde u kojima je svaka
  strana provela sekundu ili više u ćeliji, prema njenom ishodu u rundi.
- **Vremenski isječci** na grubom nivou (8 ćelija sa strane), po minuti od
  početka meča: `[cx, cz, minute, kind, value]`, sekunde prisustva kao vrsta
  `GRID_KINDS.length`; faze meča su minute preko dužine.
- Rijetko, brojači cijeli, sekunde na desetinku: ograničeno onim što se desilo.

### Faza B: mjesta i niše {#stage-b-places-and-niches}

Faza B traži ono što se ističe u brojevima, a ne upada u oči: velika oblast
zauzeta kao cjelina bez vruće ćelije u njoj, neobičan odnos ubistava i smrti na malo
događaja, koridor, pojas visine, nakupina koja je tu samo u jednom dijelu meča - i grupe (vozilo na jednoj mapi s jedne strane, sektor na jednoj visini) koje rade znatno bolje ili gore od ostalih. Jedno
**Pronađi mjesta** / **Pronađi niše** / **Pronađi uvide** pokreće sve detektore;
tri kartice dijele izvještaj.

#### Mjesta (`src/mass/scan.ts`) {#places-srcmassscants}

Mečevi svake mape se čitaju dvaput, po jedan meč; memorija drži zbirove na
rasteru od najviše 64 ćelije sa strane (16 za prostor-vremensko skeniranje), nikad mečeve.

- **Mjere.** Stopa događaja po sekundi prisustva - ubistva, smrti,
  pogoci, lansiranja, zarobljavanja, za sve jedinice, po klasi (4 sa najviše
  događaja), po pojasu visine - i udio ubistava u ubistvima i smrtima (sve, po strani, po pojasu) te **procenat pobjeda** svake strane: njene runde u ćeliji dobijene naspram izgubljenih (`pw`), gdje se pri 8 ili više mečeva mape runde broje po ishodu. Koje klase i strane dolaze iz glava (`planOf`).
- **Očekivanje po meču.** Svaka stopa meča raspoređena na vlastito prisustvo
  u ćeliji daje očekivanje ćelije (Kulldorffovo skeniranje prilagođeno kovarijatama, stratifikovano po meču): nekoliko krvavih mečeva ili jedan zauzet server ne prave mjesto. Za procenat pobjeda očekivanje je vlastiti udio dobijenih rundi strane u tom meču, pa balans mape i strane nikada nije mjesto. Runda u više ćelija oblasti broji se u svakoj; to nosi rasturanje izmjereno na veličini oblasti.
- **Rasturanje.** Mečevi se razilaze daleko izvan Poissona. Ostaci svakog
  meča zbrajaju se u blokovima od 1, 2, 4, 8, 16 ćelija; rasturanje svake veličine bloka
  (kvadrirani ostaci podijeljeni s nultom varijansom, sjedinjeni, najgorih 5% blokova izostavljeno) skalira svaki test regiona te veličine: odnos kvazi-vjerodostojnosti, Poisson za stope, binomni za udjele.
- **Regioni.** Krugovi od 0,75 do 18 ćelija; elipse pod šest uglova, 3 i 6
  puta duže nego široko, 3 do 18 ćelija (koridori; osa je `place.path` uvida); zone rasle ćeliju po ćeliju iz najjačih lokalnih Getis-Ord Gi* ćelija dok z regiona raste (nepravilni oblici) - rasle na jednoj polovini mečeva i testirane na drugoj, tako da sloboda rasta ne košta lažna mjesta; svaki pojas visine naspram ostalih pojaseva meča preko cijele mape (otporno na klastere); cilindri prostor-vrijeme: krug u jednoj ili dvije petine dužine meča, naspram vlastitog rasporeda događaja meča po mjestu i vremenu (skeniranje permutacijom prostor-vrijeme).
- **Testiranje.** p iz kvazi-vjerodostojnosti; Benjamini-Hochberg preko svakog regiona isprobanog na svakoj mapi (700.000 na tri mape je uobičajeno) na 5%. Ono što prođe se orezuje (region koji je uglavnom unutar jačeg od svoje mjere govori isto), ponovo se čita zbog svoje **stabilnosti** - mečevi koji su ga vidjeli, mečevi u kojima je držao, njegov smjer u pet preklapanja mečeva - i testira se još jednom pri varijansi koju sami mečevi pokazuju (otporno na klastere, mečevi kao klasteri, nikad pod Poissonom), BH opet. Tihа mjesta na bazi (2% ili više pojavljivanja, uzletanja i sletanja na mapi) se izostavljaju.
- **Efekat.** Odnos stopa (ili izgleda), smanjen empirijskim Bayesom (gama prior postavljen na 2x2 blokove mape), sa ~95% intervalom pri rasturanju; Gi* na 1, 2 i 4 ćelije i lokalni Moran u centru.
- **Vizuelna očiglednost.** Koliko region već pokazuje u običnoj toplotnoj mapi svog događaja (logaritamska skala do najsvjetlije ćelije, kako ga prikazi crtaju): njegov kontrast s prstenom oko sebe (desetina palete je teško vidljiva, dvije petine obično) i svijetli vrh koji nosi višak; odnos toplotna mapa nikad ne crta, pa se udio računa za pola. Ispod 35% je **skriveno**. Rang: jačina (efekat koji se zasićuje na 4 puta, tiha mjesta na 0,7) puta `1 - 0,7 x očiglednost` puta slaganje preklapanja.

Kartica **Mjesta** ih navodi (skrivena samo podrazumijevano; po mapi, obliku, smjeru), klik ocrtava mjesta mape u 3D prikazu (`placeLines.ts`: gornje linije mašine, izgrađene jednom - magenta skrivena, jantarna obična, cijan tiha, izabrana puna; pojas kao kutija od poda do plafona) i na platnu kartice Mapa; **Učitaj** leti tamo i učitava 60 mečeva u kojima je držao najviše, filtrirano na njegov događaj (i klasu).

#### Niše (`src/mass/niche.ts`) {#niches-srcmassnichets}

Pretraga snopom (širina 24, dubina 3) nad tri tabele: **životi** (životi igrača:
igra, mapa, režim, klasa, vozilo, strana, nivo, kvartal datuma, trećina dužina meča; K/D, pobjeda, smrt jednog života, ubistva u satu, zarada u minuti), **mjesta** (ubistva i smrti po mapi, režimu, datumima, sektoru mape 4 x 4, klasi, strani, pojasu) i **faze** (sektor i petina meča: K/D, smrti u satu prisustva). Grupa se testira naspram cjeline s mečevima kao klasterima (sendvič varijansa njenih ostataka po meču), njen efekat je odnos izgleda ili stopa smanjen prethodnom vrijednošću od 20 ishoda; treba 30 ishoda u 8 mečeva, rafinman mora biti 10% jači od svog roditelja, grupe gdje je ishod nikakav ili svaki (nije zabilježen za njih) se izostavljaju. Zadržava se: BH ispod 5% preko svake ocijenjene grupe, smanjen odnos od najmanje 1,25 (ili 1/1,25), četiri od pet preklapanja se slažu, nije rafinman koji samo ponavlja svog roditelja. Kartica **Niše** ih navodi; klik prikazuje svaki rafinman grupe s jednim uslovom (istraživač), **Učitaj** učitava njene mečeve. Oprema se još ne nalazi u sažecima.

Četvrta tabela, **runde** (`roundsTable`), ima za cilj ishod runde: jedan red je runda jednog života - mapa, strana, dio meča (runde 1-4, 5-8, ...), vozilo, najviše korišteno oružje, najduže držano mjesto, kupovina, prvo ubistvo ili prva smrt - ocijenjena naspram procenta pobjeda vlastite strane u vlastitom meču (stratifikovano očekivanje Mantel-Haenszel: ostatak je `won - e`, `e` udio strane u meču), pa niša nikada nije balans mape ili strane. Mečevi ostaju klasteri. Njen z je kalibrisan: ista pretraga snopom pokreće se osam puta na ishodima izmiješanim među rundama svake strane svakog meča (udio strane u svakom meču ostaje), a rasturanje tih nultih z iznad standardne normalne raspodjele - po broju uslova, iz sredine (medijana / 0,674) i iz repa (99. percentil / 2,576), veće od njih, nikada ispod 1 - dijeli stvarne z prije njihovog p i stope lažnih otkrića (empirijska nulta hipoteza, Efron 2004). Dublje grupe dobijaju veće mjerilo: snop zadržava rafinmane grupa izabranih zbog velikog z. Osnova niše je njeno vlastito očekivanje, njen porast su bodovi iznad njega, a rangira se po porastu puta kvadratni korijen broja njenih rundi, uz ispunjene dokaze i preklapanja (`wracc` je podrška puta porast). Nosi mečeve u kojima se najviše pokazala (`matchIds`) i nekoliko njihovih rundi (`rounds`, `[match, round]`) za detaljan pregled.

#### Pomaci mete s praktičnom značajnošću {#meta-shifts-with-practical-significance}

Na mješovitim datumima binomni test nad životima označavao je gotovo svaku promjenu kao značajnu. `meta` sada testira otporno na klastere (životi svakog meča kao klaster), zadržava pomak upotrebe samo od 2 poena i najmanje 25%, pomak K/D od 1,3 puta, kvartali datuma koji trendiraju isto (Kendallov tau najmanje 0,5) i, za vozilo na nekoliko mapa, isti smjer na većini njih. Ostaje samo nekoliko pomaka na skupu za testiranje na kojem je običan test označio gotovo sve.

#### Za model {#for-a-model}

`massReportForModel` daje svakom mjestu njegov `region` (oblik, skriveno, očiglednost, visine, faza), a svakoj niši njene `conditions`, plus koliko je regiona i grupa isprobano. Narator znanja može čitati mjesta kao zone ubistava i pravce napada: njihove vrste su `place.*` i `niche.*`.

#### Provjere {#checks}

`scan.test.ts` ugrađuje rasutu oblast (1,6 puta stopa smrti preko kruga od 22 ćelije, slaba u svakoj ćeliji), koridor, pojas visine i nakupinu samo u jednoj fazi u 240 sintetičkih mečeva s prekomjernim rasturanjem - sve nađeno, rasuta skrivena - i pokreće osam nultih skupova od 60 mečeva: nema mjesta. `niche.test.ts` nalazi ugrađenu grupu vozilo x mapa x strana i ništa u pet nultih tabela. `outcome.test.ts` provjerava sažetak verzije 2 (dobijene runde po strani, jedinici, igraču i oružju, `pw`, runde jedinica); ugrađuje traku čija strana dobija 70% svojih rundi naspram 35% (svaki meč sa svojim balansom) - nađena - i pokreće 20 nultih skupova od 50 mečeva u kojima trake ništa ne govore: nema mjesta procenta pobjeda; ugrađuje AWP na jednoj mapi koji dobija runde svoje strane 30 bodova više - nađen, s njegovim mečevima i rundama - i pokreće 30 nultih skupova od 80 mečeva u kojima svaki meč ima svoj balans, a jedna strana je jača na jednoj mapi: nema niše.

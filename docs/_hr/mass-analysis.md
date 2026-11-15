---
title: "Masovna analiza"
nav_order: 8
lang: "hr"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Masovna analiza: tisuće utakmica odjednom

**Masovna analiza** pokazuje što cijela mapa utakmica zbroji: koje vozilo najčešće pobjeđuje, koja je strana favorizirana, gdje je akcija. Koristite je kad imate mnogo više utakmica nego što biste ih mogli gledati.

Radi iz malog sažetka svake utakmice, pa se tisuću ili deset tisuća utakmica otvara brzo. Pune retke učitava samo za utakmice na koje kliknete.

## Isprobajte {#try-it}

1. Otvorite **Masovna analiza** na bočnoj traci Toplinske karte.
2. Pritisnite **Mapa...** (ili **Datoteke...**) i odaberite svoje `.3dheat` utakmice.
3. Pričekajte dok panel čita sažetke ("Sažeci... n od N").
4. Pritisnite **Otvori analizu**. Otvara se prozor s karticama.
5. Postavite filtere (Igra, Karta, Način, Iz, U), zatim pročitajte karticu, na primjer Ravnoteža.
6. Kliknite redak, ćeliju ili uvid: njegove utakmice se učitavaju u 3D prikaz, s kamerom na mjestu.

![Kartica Ravnoteža: postotak pobjeda i ubojstva po smrti, po vozilu](../assets/img/en/mass-balance.webp)

```
mapa .3dheat -> sažeci -> prozor (kartice) -> klik na redak -> utakmice se otvaraju u 3D
```

Datoteka `.3dheat` je jedna utakmica ([Jedna datoteka po utakmici](container.md)). Što su *toplinska karta* i *redak* objašnjeno je u [rječniku](glossary.md).

## Dobivanje sažetaka {#getting-the-summaries}

Većina ljudi ne mora ništa učiniti: panel sam računa sažetke koji nedostaju. Da velika mapa bude spremna jednom, koristite alat izvan mreže u nastavku.

Svaka `.3dheat` utakmica dobiva sažetak (`src/mass/summarize.ts`), čuva se u spremniku kao član `<match>.summary.json` (uloga `summary`, vidi [Jedna datoteka po utakmici](container.md)). Alat izvan mreže ih zapisuje, kao i indeks po mapi. To je alat za razvojne programere; pokrenite ga nad velikom mapom da biste panelu uštedjeli posao:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Utakmica koja je već sažeta (ista verzija formata) samo se čita; `--force` je ponovno izračunava. `--no-write` ostavlja spremnike netaknutima.
- Datoteka promijenjena u zadnjih `--settle` minuta (10) se preskače, jer pretvarač je možda još piše.
- `<folder>/3dheat-index.jsonl.gz`: jedan redak po utakmici, s njezinom putanjom, veličinom, vremenom i sažetkom bez mreže. `<folder>/3dheat-index.grids.jsonl.gz`: jedan redak po utakmici s njezinom mrežom.
- Pokrenite ga na računalu koje drži datoteke, s niskim prioritetom (na primjer `nice -n 19 ionice -c3` na Linuxu).

Panel za svaku utakmicu uzima prvo od: redak indeksa mape (ista putanja i veličina), predmemoriju preglednika (IndexedDB, po imenu, veličini i vremenu), član `summary` spremnika, ili sažetak izračunat u skupini radnika i spremljen u predmemoriju. Tako mapa bez indeksa također radi: prvi put brzinom čitanja tablica, a poslije iz predmemorije.

## Panel {#the-panel}

Odaberite mapu (ili datoteke; **Dodaj mapu...** dodaje još jednu). Prozor ima filtere **Igra**, **Karta**, **Način**, **Iz** i **U**, izbor **Podijeli po**, **Najmanje života** i **Samo igrači**, te ove kartice. Svaki broj dolazi iz sažetaka. Klik na redak, ćeliju ili uvid učitava njegove utakmice u prikaz kao preklapanje mnogo utakmica, s filterima koji ih prikazuju (vozilo, klasa, oružje, tim, igrač) i kamerom na mjestu:

| Kartica | Što |
|---|---|
| Pregled | utakmice, sati, igrači, životi, retci, datumi; utakmice po danu; po igri, karti i načinu; zbroji događaja; ekonomija po valuti; kad se u utakmici što događa |
| Ravnoteža | po vozilu, klasi, oružju ili timu, podijeljeno po karti, načinu, razredu ili igri: K/D s njegovim ~95% intervalom, postotak pobjeda (Wilson), preživljavanje, ubojstva i pogoci u minuti, zarada u minuti, i q, Benjamini-Hochbergova stopa lažnih otkrića za K/D i pobjedu naspram ostatka podjele. **Najmanje života** skriva retke s premalo života za povjerenje; **Samo igrači** izostavlja ono što je vozio AI misije |
| Trendovi | udio (udio prisutnosti), K/D ili postotak pobjeda najboljih vozila ili klasa po danu, tjednu ili mjesecu |
| Igrači | različiti igrači, utakmice po igraču, igrači po utakmici, najčešći igrači |
| Strane | svaka strana svake karte: utakmice koje je dobila naspram ravne podjele |
| Borba iz blizine | podaci o rundama: otvarajući dvoboji po strani i njihova pretvorba, razmjene, onaj koji viri naspram onoga koji drži, unakrsna vatra, ulasci pod bljeskom, nišanjenje, postavljanja, prednost u broju igrača i, **Po karti**, mjesta koja ubijaju igrače koji ulaze u njih. Svako je udio s Wilsonovim intervalom, iz brojeva `cqb` sažetaka ([Borba iz blizine i runde](close-quarters.md)) |
| R6 površine | tragovi Rainbow Six Siege na razini (rupe od metaka i slično) po površini razine: tragovi, po rundi karte, prostorija, udio tragova s utvrđenim strijelcem; klik otvara vrste tragova, operatere i klase oružja strijelaca te gdje su na površini tragovi (mala toplinska karta od ćelija od četvrt metra); površina zadržava svoj id kroz utakmice jedne verzije karte. Iz brojeva `marks` sažetaka |
| Karta | zbrojena mreža karte: prisutnost, ubojstva, smrti, K/D, bilo koji događaj, tok, i **vruće u koliko utakmica** (stabilnost); po timu, pri 1, 2, 4 ili 8 puta većoj ćeliji |
| Mjesta | mjesta koja se ističu u brojevima, ali ne i u toplinskoj karti (velika površina zauzeta kao cjelina, koridori, pojasevi visine) i mjesta čiji držatelji dobivaju više ili manje svojih rundi; **Pronađi mjesta** |
| Niše | skupine koje rade znatno bolje ili lošije od ostalih (vozilo na jednoj karti, sektor na jednoj visini) i skupine rundi dobivenih iznad onoga što je njihova strana dobila u istim utakmicama; **Pronađi niše** |
| Uvidi | detektori mase i detektori karte (dolje); **Kopiraj izvješće (JSON)** daje JSON koji jezični model čita |

## Uvidi nad mnogo utakmica {#insights-over-many-matches}

Kartica **Mjesta** pronalazi mjesta koja se ističu u brojevima, ali ne i u toplinskoj karti: veliku površinu zauzetu kao cjelinu, koridor, pojas visine, mjesto zauzeto samo u jednom dijelu utakmice. Ona označava one koje obična toplinska karta ne pokazuje kao **skrivena**, i ocrtava ih u 3D prikazu. **Učitaj** leti tamo s utakmicama koje je držalo. Kartica **Niše** pronalazi skupine (vozilo na jednoj karti i strani, sektor na jednoj visini) koje rade znatno bolje ili lošije od ostalih. Kliknite jednu da vidite njezina preciziranja.

### Tko je pobijedio {#who-won}

Gdje utakmice kažu tko je dobio svaku rundu ([stupac ishoda](data-formats.md#outcome-columns) `won`), rezultat je zaseban cilj:

- **Mjesta: postotak pobjeda.** Za svaku stranu udio njezinih rundi na mjestu koje je dobila, naspram udjela koji je dobila bilo gdje u istoj utakmici - tako je osnova ravnoteža karte, strane i same utakmice, a ističu se samo mjesta čiji držatelji dobivaju više (ili manje) svojih rundi. Izmišljeni primjer: *„Dust: strana T dobiva više svojih rundi kad je ovdje: dobiveno 61% od 412, naspram 49% očekivanih prema vlastitoj stopi u istim utakmicama (izgledi 1,6×; držano u 31/48 utakmica).”* Ista stopa lažnih otkrića i provjere stabilnosti kao za svako mjesto; **Učitaj** učitava utakmice u kojima je vrijedilo i prikazuje položaje te strane.
- **Niše: pobjeda u rundi.** Tablica **Runde** sadrži rundu svakog života: kartu, stranu, dio utakmice (runde 1-4, 5-8, ...), vozilo (operatera, agenta), oružje koje je najviše koristio, mjesto koje je najdulje držao, kupnju (eco, force, full) i je li njegova strana ostvarila prvo ubojstvo. Skupina se ocjenjuje naspram onoga što je njezina strana dobila u istim utakmicama, pa je *T na Dust s AWP* niša samo kad su te runde dobivene češće od ostalih rundi strane T u tim utakmicama. Izmišljeni primjer: *„m1 · T · AWP: dobiva 80% od 320 rundi, naspram 62% očekivanih od istih strana u istim utakmicama (izgledi 2,3×; 40 utakmica).”* Rangirano po porastu puta potpora; **Učitaj** učitava utakmice čije runde to najviše pokazuju.

Oboje treba sažetke verzije 2 (vidi [Dobivanje sažetaka](#getting-the-summaries)): stariji se ponovno izračunavaju.

Kartica **Uvidi** pronalazi, nad svim utakmicama, vozila koja razmjenjuju ili pobjeđuju bolje ili lošije od ostalih, mjesta koja su vruća u stalnom udjelu utakmica, strane koje pobjeđuju više od ravne podjele, vozila čija se uporaba mijenja tijekom datuma, i dijelove utakmice koji sadrže više ubojstava nego ravnomjerna raspodjela. Svaki nalaz nosi svoje brojeve, učinak, interval i stopu lažnih otkrića (održanu na 5%), a klik učitava njegove utakmice. Pojedinosti: [Za razvojne programere](#for-developers).

## Razmjera {#scale}

Manju verziju ovoga možete ponoviti sami: `node tools/demo-data.mjs` zapisuje 150 sintetičkih utakmica tenkova u `tools/.shots/demo/mass` (oko 1.000 redaka svaka). Izmjereno na tih 150 sintetičkih demo utakmica iz `tools/demo-data.mjs` na desktop računalu (prava utakmica je puno veća):

- `tools/3dheat-summarize.mjs` s 4 radnika: 2,6 do 4,8 s za svih 150, 8 do 21 ms po utakmici u radniku; drugo pokretanje koje samo čita sažetke traje oko 2 s.
- Otvaranje mape u panelu, uz prisutan indeks, dok prozor ne prikaže: 0,9 do 1,6 s (dio radnika, čitanje 150 redaka indeksa, traje 20 do 40 ms).
- Prebacivanje na karticu, dok se njezina tablica ne nacrta: Pregled 10 do 30 ms, Ravnoteža 30 do 70 ms, Trendovi 30 do 45 ms, Igrači 15 do 35 ms, Strane 15 do 20 ms, Karta 55 do 130 ms.
- Spremište drži 150 utakmica u oko 0,5 MB.

Otvaranje prozora traje jedan kratki okvir: odabrane datoteke idu radniku po 16 odjednom, a polja datuma i prva kartica dolaze okvir nakon prozora.

Spremište čuva oko 15 KB po utakmici, pa 10.000 utakmica zauzima oko 150 MB u radniku. Mreže se nikad ne drže dulje nego što ih karta traži.

## Za razvojne programere {#for-developers}

### Uvidi nad mnogo utakmica {#insights-over-many-matches}

`src/mass/detect.ts`: svaki nalaz s njegovim brojevima, učinkom i intervalom, p i q (Benjamini-Hochberg nad svime što je detektor pokušao, održano na 5%), dubinski pregled koji učitava njegove utakmice i ključ rečenice s njezinim vrijednostima. Izvješće (`heat3d.mass/1`) je ono što `massReportForModel` predaje pripovjedaču, u istom obliku kao izvješće jedne utakmice (`insights/seam.ts`).

| Detektor | Pronalazi |
|---|---|
| `balance` | vozilo igrača koje razmjenjuje ili pobjeđuje bolje ili lošije od ostalih na karti ili u načinu |
| `hotspot` | mjesta vruća u stalnom udjelu utakmica koje su stigle (vruće utakmice / viđene utakmice, naspram ostalih ćelija karte), a ne samo vruća u zbroju |
| `side` | strana karte koja pobjeđuje više od ravne podjele |
| `meta` | udio vozila u životima igrača ili njegov K/D koji se mijenja između ranije i kasnije polovice datuma, po karti: dovoljno velik da bude važan, trend kroz kvartale, isto na većini karata (dolje) |
| `phase` | dio duljine utakmice koji sadrži više ubojstava, pogodaka, lansiranja... nego ravnomjerna raspodjela |
| `place` | mjesta koja se ističu kroz mnogo utakmica (Faza B, dolje): stopa regije ili udio ubojstava naspram one svake utakmice, krugovi, koridori, narasle zone, pojasevi visine, faze; skriveno kad ih obična toplinska karta ne pokazuje |
| `niche` | skupine koje rade znatno bolje ili lošije (Faza B, dolje) |
| `grid.*` | detektori jednog skupa podataka (pozicije snage, vruće i tihe zone, mjesta klasa) na zbrojenim mrežama svake karte: `GridMerge.toInsightJob` puni mreže prolaza uvida iz sažetaka; detektori kojima trebaju putanje preskaču se |

### Sažetak {#the-summary}

Običan JSON (`src/mass/types.ts`), oko 5 do 30 KB komprimiran po utakmici:

- utakmica: igra, karta, način, misija, početak, duljina, retci, životi, igrači,
  AI, timovi (životi, igrači, prisutnost, ubojstva, smrti, pobjeda, novac), pobjednik;
- po vozilu i timu: klasa, razred, životi, životi igrača, prisutnost, događaji
  po kanonskoj vrsti, ubojstva po klasi cilja, pobjede, novac;
- po igraču (po korisničkom ID-u, inače po imenu): tim, životi, prisutnost, ubojstva, smrti,
  pogodci, lansiranja, pobjede, vozila; po oružju: događaji po vrsti;
- sa stupcem ishoda (verzija 2): dobivene i odigrane runde po timu, vozilu
  (`rw`, svaki život i runda), igraču i oružju (runde u kojima ga je strana
  koristila); runda svakog života (`outcome.u`: runda, strana, vozilo,
  najviše korišteno oružje, najdulje držano mjesto, kupnja, pobjeda) te broj,
  pobjednik i strana prvog ubojstva svake runde (`outcome.r`);
- stupci ekonomije (`cost_*`, `earn_*`) i njihovi zbrojevi;
- faze: događaji po vrsti u 20 razreda duljine utakmice i po minuti;
- ponašanje: mjere kolektivnog ponašanja utakmice (poravnanje, stado po putanji, trake, gužva, vođe, zaostali, točka loma, rizik nakon gubitaka, nizovi, dogovor o kupnji, potiskivanje), svaka sa svojim nultim modelom, p i q (vidi [Kolektivno ponašanje](collective-behaviour.md));
- mreža (dolje).

Broji se kao što gledatelj broji: stupci nađeni kako ih učitavač mnogo utakmica nalazi (`leanSpec`), događaji po `data/canonical.ts`. Ubojstvo koje Tacview oružje postigne broji se za svog strijelca. Smrt izrečena dvaput istovremeno (`dead`, `death`) broji se jednom.

#### Mreža: na čemu gradi faza B {#the-grid-what-stage-b-builds-on}

Prostorni dio napravljen je za statističko skeniranje regija bilo koje veličine i oblika, a ne samo za toplinske slike:

- **Piramida.** Ćelije su poravnate potencije dva u svjetskim jedinicama (x, z kako ih gledatelj postavlja). Razina `k` su ćelije zbrojene s `ix >> k, iz >> k`: točno, unutar utakmice i među utakmicama drugih veličina ćelija, a svaka regija (kvadrat, koridor duž linije, prsten) je zbroj ćelija. Najfinija razina stane u 128 ćelija za robusni opseg utakmice (ćelije koje drže 99% prisutnosti); lutalice izvan nje se čuvaju.
- **Izloženost uz svaki broj.** Sekunde prisutnosti po ćeliji, po timu (`pt`), po klasi vozila (`pc`) i po pojasu visine (`ph`), pa se stopa, očekivanje i omjer regije računaju za bilo koju podskupinu.
- **Visina.** Pojasevi iznad poda utakmice (1. percentil visine): ispod 3 m, 3–10, 10–30, 30–100, 100–300, 300–1000, 1000–3000, iznad; datoteka sa stupcem `floor`/`storey`/`deck` razvrstava po katovima. `y` je srednja visina svake ćelije, `y0` njezina najniža (njezin pod, za visinu iznad njega).
- **Događaji** kao trojke `[cell, kind, team, class, band, count]`.
- **Runde po ishodu** (verzija 2, sa stupcem ishoda i najmanje dvije runde): `pw` kao `[cell, team, rounds won, rounds lost]` - runde u kojima je svaka strana provela sekundu ili više u ćeliji, prema njezinom ishodu u rundi.
- **Vremenski isječci** na grubloj razini (8 ćelija po strani), po minuti od početka utakmice: `[cx, cz, minute, kind, value]`, sekunde prisutnosti kao vrsta `GRID_KINDS.length`; faze utakmice su minute kroz duljinu.
- Rijetko, brojevi su cijeli, sekunde na desetinu: ograničeno onim što se dogodilo.

### Faza B: mjesta i niše {#stage-b-places-and-niches}

Faza B traži ono što se ističe u brojevima, a ne upada u oči: veliku površinu zauzetu kao cjelinu bez vruće ćelije u njoj, neobičan omjer ubojstava i smrti na malo događaja, koridor, pojas visine, nakupinu koja je tu samo u jednom dijelu utakmice, i skupine (vozilo na jednoj karti na jednoj strani, sektor na jednoj visini) koje rade znatno bolje ili lošije od ostalih. Jedno **Pronađi mjesta** / **Pronađi niše** / **Pronađi uvide** pokreće sve detektore. Tri kartice dijele isto izvješće.

#### Mjesta (`src/mass/scan.ts`) {#places-srcmassscants}

Utakmice svake karte čitaju se dvaput, po jedna utakmica u isto vrijeme. Memorija drži zbrojeve na rasteru od najviše 64 ćelije po strani (16 za skeniranje prostor-vrijeme), nikad same utakmice.

- **Mjere.** Stopa događaja po sekundi prisutnosti (ubojstva, smrti, pogodci, lansiranja, zauzimanja, za sve jedinice, po klasi (4 s najviše događaja), po pojasu visine) i udio ubojstava u ubojstvima i smrtima (sve, po strani, po pojasu) te **postotak pobjeda** svake strane: njezine runde u ćeliji dobivene naspram izgubljenih (`pw`), gdje se pri 8 ili više utakmica karte runde broje po ishodu. Koje klase i strane dolaze iz zaglavlja (`planOf`).
- **Očekivanje po utakmici.** Vlastita stopa svake utakmice, raspoređena po vlastitoj prisutnosti u ćeliji, daje očekivanje ćelije (Kulldorffovo skeniranje prilagođeno kovarijatima, stratificirano po utakmici). Nekoliko krvavih utakmica ili jedan zauzet poslužitelj ne čine mjesto. Za postotak pobjeda očekivanje je vlastiti udio dobivenih rundi strane u toj utakmici, pa ravnoteža karte i strane nikad nije mjesto. Runda u više ćelija regije broji se u svakoj; to nosi raspršenje izmjereno pri veličini regije.
- **Raspršenje.** Utakmice se ne slažu daleko iznad Poissona. Ostaci svake utakmice zbrajaju se u blokovima od 1, 2, 4, 8, 16 ćelija. Raspršenje svake veličine bloka (kvadrirani ostaci naspram varijance nulte hipoteze, objedinjeno, najgorih 5% blokova izostavljeno) skalira svaki test regije te veličine: kvazi-vjerojatnosni omjer, Poisson za stope, binomna za udjele.
- **Regije.** Krugovi od 0,75 do 18 ćelija; elipse pod šest kutova, 3 i 6 puta duže nego široke, 3 do 18 ćelija (koridori; os je `place.path` uvida); zone narasle ćeliju po ćeliju iz najjačih lokalnih Getis-Ord Gi* ćelija dok z regije raste (nepravilni oblici), narasle na jednoj polovici utakmica i testirane na drugoj, tako da sloboda rasta ne košta lažna mjesta; svaki pojas visine naspram ostalih pojaseva karte u cjelini (robustno na klastere); cilindri prostor-vrijeme: krug u jednoj ili dvije petine duljine utakmice, naspram vlastitog raspršenja događaja utakmice po mjestu i vremenu (skeniranje permutacije prostor-vrijeme).
- **Testiranje.** p iz kvazi-vjerojatnosti; Benjamini-Hochberg nad svakom regijom isprobanom na svakoj karti (700.000 na tri karte je uobičajeno) na 5%. Ono što prođe se podrezuje (regija koja je uglavnom unutar jače regije iste mjere kaže isto), zatim se ponovno čita za svoju **stabilnost**: utakmice koje su je vidjele, utakmice u kojima je držala, njezin smjer u pet preklopa utakmica. Zatim se testira još jednom pri varijanci koju same utakmice pokazuju (robustno na klastere, utakmice kao klasteri, nikad pod Poissonom), BH opet. Tiha mjesta na osnovici (2% ili više spawnova, polijetanja i slijetanja karte) se izostavljaju.
- **Učinak.** Omjer stope (ili izgleda), skupljen empirijskim Bayesom (gama prior prilagođen 2x2 blokovima karte), s ~95% intervalom pri raspršenju; Gi* na 1, 2 i 4 ćelije i lokalni Moran u središtu.
- **Vizualna očitost.** Koliko regija već pokazuje u običnoj toplinskoj karti svog događaja (logaritamska skala do najsvjetlije ćelije, kako je prikazuju prikazi): njezin kontrast s prstenom oko nje (desetina palete teško se vidi, dvije petine obično) i svijetli vrh koji nosi višak. Omjer toplinska karta nikad ne crta, pa se udio broji pola. Ispod 35% je **skriveno**. Rang: snaga (učinak zasićen na 4 puta, tiha mjesta na 0,7) puta `1 - 0,7 x očitost` puta slaganje preklopa.

Kartica **Mjesta** ih navodi (samo skrivena po zadanom; po karti, obliku, smjeru). Klik ocrtava mjesta karte u 3D prikazu (`placeLines.ts`: vrhovne linije motora, izrađene jednom: magenta za skrivena, jantarna za obična, cijan za tiha, odabrano puno; pojas kao kutija od poda do stropa) i na platnu kartice Karta. **Učitaj** leti tamo i učitava 60 utakmica koje je držalo najviše, filtrirane na njegov događaj (i klasu).

#### Niše (`src/mass/niche.ts`) {#niches-srcmassnichets}

Pretraga snopom (širina 24, dubina 3) nad tri tablice: **životi** (životi igrača: igra, karta, način, klasa, vozilo, strana, razred, kvartal datuma, trećina duljina utakmice; K/D, pobjeda, smrt jednog života, ubojstva u satu, zarada u minuti), **mjesta** (ubojstva i smrti po karti, načinu, datumima, sektoru karte 4 x 4, klasi, strani, pojasu) i **faze** (sektor i petina utakmice: K/D, smrti na sat prisutnosti). Skupina se testira naspram cjeline s utakmicama kao klasterima (sendvič varijanca njezinih ostataka po utakmici). Njezin učinak je omjer izgleda ili stope, skupljen prethodnikom od 20 ishoda. Treba 30 ishoda u 8 utakmica, preciziranje mora biti 10% jače od svog roditelja, a skupine u kojima je ishod ništa ili sve (nije zabilježen za njih) se izostavljaju. Zadržava se: BH ispod 5% nad svim ocijenjenim skupinama, skupljeni omjer od najmanje 1,25 (ili 1/1,25), četiri od pet preklopa se slažu, i ne preciziranje koje samo ponavlja svog roditelja. Kartica **Niše** ih navodi. Klik pokazuje svako preciziranje jednog uvjeta skupine (istraživač), a **Učitaj** učitava njezine utakmice. Opremanja još nisu u sažecima.

Četvrta tablica, **runde** (`roundsTable`), ima za cilj ishod runde: jedan redak je runda jednog života - karta, strana, dio utakmice (runde 1-4, 5-8, ...), vozilo, najviše korišteno oružje, najdulje držano mjesto, kupnja, prvo ubojstvo ili prva smrt - ocijenjena naspram postotka pobjeda vlastite strane u vlastitoj utakmici (stratificirano očekivanje Mantel-Haenszel: ostatak je `won - e`, `e` udio strane u utakmici), pa niša nikad nije ravnoteža karte ili strane. Utakmice ostaju klasteri. Njezin z je kalibriran: ista pretraga snopom pokreće se osam puta na ishodima izmiješanima među rundama svake strane svake utakmice (udio strane u svakoj utakmici ostaje), a raspršenje tih nultih z iznad standardne normalne razdiobe - po broju uvjeta, iz sredine (medijan / 0,674) i iz repa (99. percentil / 2,576), veće od njih, nikad ispod 1 - dijeli stvarne z prije njihovog p i stope lažnih otkrića (empirijska nulta hipoteza, Efron 2004). Dublje skupine dobivaju veće mjerilo: snop zadržava preciziranja skupina odabranih zbog velikog z. Osnova niše je njezino vlastito očekivanje, njezin porast su bodovi iznad njega, a rangira se po porastu puta drugi korijen broja njezinih rundi, uz ispunjene dokaze i preklope (`wracc` je potpora puta porast). Nosi utakmice u kojima se najviše pokazala (`matchIds`) i nekoliko njihovih rundi (`rounds`, `[match, round]`) za detaljan pregled.

#### Pomaci mete sa praktičnom značajnošću {#meta-shifts-with-practical-significance}

Na mješovitim datumima binomna na životima označavala je gotovo svaku promjenu kao značajnu. `meta` sada testira robustno na klastere (životi svake utakmice su klaster), zadržava pomak uporabe samo od 2 boda i najmanje 25%, pomak K/D od 1,3 puta, kvartali datuma koji trendaju isto (Kendallov tau najmanje 0,5) i, za vozilo na više karata, isti smjer na većini njih. To ostavlja samo nekoliko pomaka na testnom skupu na kojem je obični test označio gotovo sve.

#### Za model {#for-a-model}

`massReportForModel` daje svakom mjestu njegovu `region` (oblik, skriveno, očitost, visine, faza), a svakoj niši njezine `conditions`, plus koliko je regija i skupina isprobano. Leća znanja može čitati mjesta kao zone ubojstava i pravce prilaza: njihove vrste su `place.*` i `niche.*`.

#### Provjere {#checks}

`scan.test.ts` ugrađuje raspršeno područje (1,6 puta stopa smrti preko kruga od 22 ćelije, slabo u svakoj ćeliji), koridor, pojas visine i nakupinu samo u jednoj fazi u 240 sintetičkih, prekomjerno raspršenih utakmica: sve su pronađene, raspršeno je skriveno. Pokreće osam skupova nulte hipoteze od 60 utakmica: nema mjesta. `niche.test.ts` pronalazi ugrađenu skupinu vozilo x karta x strana i ništa u pet tablica nulte hipoteze. `outcome.test.ts` provjerava sažetak verzije 2 (dobivene runde po strani, jedinici, igraču i oružju, `pw`, runde jedinica); ugrađuje traku čija strana dobiva 70% svojih rundi naspram 35% (svaka utakmica sa svojom ravnotežom) - pronađena - i pokreće 20 skupova nulte hipoteze od 50 utakmica u kojima trake ništa ne govore: nema mjesta postotka pobjeda; ugrađuje AWP na jednoj karti koji dobiva runde svoje strane 30 bodova više - pronađen, s njegovim utakmicama i rundama - i pokreće 30 skupova nulte hipoteze od 80 utakmica u kojima svaka utakmica ima svoju ravnotežu, a jedna strana je jača na jednoj karti: nema niše.

---
title: "Analiza utrke"
nav_order: 11
has_children: true
lang: "bs"
source: "race-analysis.md"
source_hash: "ab0531fa7bbd"
translated: true
outdated: false
---

# Analiza utrke

Vozili ste istu stazu dvaput. Kartica **Analiza utrke** pušta obje vožnje zajedno u 3D, pokazuje gdje je jedan krug bio sporiji i kaže vam zašto. Još nema krugova? Pritisnite **Demo krugovi**.

![Kartica Analiza utrke s demo krugovima: bočna traka s Krugovi i Gdje se poboljšati, automobili na stazi, grafikoni ispod prikaza](../assets/img/bs/race-analysis-overview.webp)

Kartica poredi dva ili više krugova jedne staze. Dijeli platno, kameru i učitani model staze (**Pozadina / nivo**) s toplotnom mapom; sve ostalo je njeno: vlastita bočna traka i vlastita traka ispod prikaza. Riječi kao *krug*, *referenca* i *tjeme* su u [rječniku](glossary.md).

Ova stranica je karta kartice. Svaki dio ima svoju stranicu:

| Stranica | Šta pokriva |
|---|---|
| [Učitavanje krugova](race-loading-laps.md) | svaki format datoteke, mape i staze, nazivi automobila, demo krugovi, spisak krugova, referenca i fokus |
| [Reprodukcija i 3D scena](race-replay-and-scene.md) | traka za reprodukciju, tri načina reprodukcije, poravnavanje automobila, kamera koja prati, linije, mape, automobili, oznake, ogledalski svjetovi |
| [Grafikoni i HUD](race-charts-and-hud.md) | grafikoni po udaljenosti, birač grafova, prelazak mišem i zum, kartice automobila, tabela kanala |
| [Događaji upravljanja automobilom](race-control-events.md) | blokade točkova, proklizavanje, preupravljanje, izleti, potupravljanje, udarci, sudari, ABS/TC, ručna kočnica, vazduh - kako se svaki otkriva, sa svakim pragom |
| [Analiza krivina](race-corner-analysis.md) | poravnanje po udaljenosti, krivine i segmenti, vremenski račun krivine, svaki uzrok i redoslijed u kojem se isprobavaju, oblik linije i savjet |
| [Profili automobila i poređenje](race-car-profiles.md) | šta svaki automobil može, izmjereno iz njegovih krugova; *Poređenje automobila*; šta automobil odlučuje u svakoj krivini |
| [Statistika staze](race-course-statistics.md) | mnogo krugova jedne staze: greške po krivini i po vrsti, mapa grešaka, izvoz toplotne mape, ograničenja performansi |
| [Analitika utrka: metoda](race-analytics.md) | istraživanje iza pravila, s izvorima |
| [Ostale trkaće igre](other-games.md) | šta pregledač radi s krugovima iz svake igre: klizanje i drift izračunati tamo gdje igra ih ne šalje, ogledalski svjetovi, dodatni kanali |

## Ekran {#the-screen}

**Bočna traka**, od vrha do dna (odjeljci se mogu sklopiti):

1. **Krugovi** - učitavanje, spisak, prikaži/sakrij, referenca, fokus, gonjenje.
   Vidi [Učitavanje krugova](race-loading-laps.md).
2. **Statistika staze** - tek od tri učitana kruga.
   Vidi [Statistika staze](race-course-statistics.md).
3. **Gdje se poboljšati** - nalazi fokusiranog kruga, krivina po krivini.
   Vidi [Analiza krivina](race-corner-analysis.md).
4. **Krivina po krivini** (ili *Krivina po krivini - klasa X* uz više klasa) -
   najbrži krug kroz svaku krivinu i njegova linija. Prikazuje se uz dva ili više
   krugova.
5. **Kontrola automobila** - blokade, klizanja, guranja i udarci fokusiranog kruga.
   Vidi [Događaji upravljanja automobilom](race-control-events.md).
6. **Poređenje automobila** (ili **Automobil** uz jedan automobil) - vidi
   [Profili automobila i poređenje](race-car-profiles.md).
7. **Prikaz** - koja mapa je naslikana na stazi i šta se crta.
   Vidi [Reprodukcija i 3D scena](race-replay-and-scene.md).
8. Zajednički paneli **Nivo** i **Kamera i scena** (model staze, obrtanje osa,
   kamera) - dokumentovani uz toplotnu mapu i [Kameru](camera.md).

**Prikaz** pokazuje stazu, odvožene linije, mapu, automobile, oznake pričvršćene
za stazu, i do šest kartica automobila gore lijevo (vidi
[Grafikoni i HUD](race-charts-and-hud.md)). Bez učitanih krugova piše "Nema
učitanih krugova - prevucite ovdje dvije ili više datoteka krugova, ili učitajte
demo krugove iz bočne trake."

**Traka ispod prikaza** sadrži transportnu traku reprodukcije i, ako nije
sakrivena, grafikone po udaljenosti.

## Brzi početak {#quick-start}

1. Otvorite karticu **Analiza utrke** (pored **Toplotne mape** na vrhu bočne
   trake).
2. Unesite krugove. Pritisnite **Demo krugovi** da vidite šta kartica radi s
   tri izmišljena kruga. Za vlastite krugove, prvo ih snimite
   ([formati datoteka i snimači](race-loading-laps.md#file-formats)), zatim
   pritisnite **Učitaj datoteke krugova…** ili **Mapa…**, ili prevucite datoteke
   ili mape na prikaz.
3. Najbrži kompletan krug postaje referenca; najsporiji ostali krug je fokusiran.
   Kliknite bilo koji krug u spisku da ga fokusirate; ★ krug pretvara u referencu.
4. Pročitajte **Gdje se poboljšati**. Kliknite nalaz: automobili se poravnaju 40 m
   prije njega, kamera ga uokviruje, reprodukcija prolazi kroz njega, a mjerenja se
   otvaraju.
5. Pređite mišem preko grafikona da pomjerite svaki automobil na taj metar;
   Shift+klik da ih tamo poravnate.

## Tastatura {#keyboard}

Dok je kartica Utrka otvorena:

| Taster | Radi |
|---|---|
| **K** | reprodukcija / pauza |
| **Home** | nazad na početak reprodukcije |
| tipke s brojevima | ništa (u toplotnoj mapi mijenjaju načine) |

Tastere otkucane u tekstualnom polju ili padajućem meniju pregledač ignoriše. Tipke
kamere rade kao u toplotnoj mapi (**W A S D**, **Razmak** gore, **Q** dolje,
**Shift** brže, **Alt** sporije, miš za gledanje; sve u [Kamera](camera.md)); **F**
uokviruje učitane krugove (kao što to radi učitavanje krugova).

## Mnogo krugova {#many-laps}

- Svi učitani krugovi se analiziraju i broje; desetine traju sekundu ili dvije.
- Poslije **8** krugova (`SHOW_ALL_UP_TO`), dodani krugovi se crtaju samo kada su
  referenca, fokusirani krug, ili najbolji krug klase fokusiranog kruga.
  *Prikaži sve* / *Samo posmatrani* to mijenjaju.
- Poslije **10** vidljivih automobila (`PLAIN_PAST`), krugovi koji se ne posmatraju
  (nisu fokus, gonjeni automobil ni referenca) crtaju se linijama proredenim na
  tačku svakih 6 m umjesto 1,5 m, i s običnim automobilima.
- Grafikoni crtaju najviše **8** krugova; HUD prikazuje najviše **6** kartica.
- Statistika staze se pojavljuje od **3** kruga.

Detalji: [Statistika staze](race-course-statistics.md#performance-with-many-laps).

## Podrazumijevane postavke prikaza {#default-view-settings}

| Postavka | Podrazumijevano |
|---|---|
| Mapa | Vremenska mapa |
| Odvožene linije, Automobili, Gume i ovjes, Oznake, Staza iz krugova | uključeno |
| Vrijednosti na svim karticama | isključeno |
| Veličina automobila | 1× |
| Grafikoni | prikazani |
| Način reprodukcije | Od linije |
| Brzina reprodukcije | 1× |
| Petlja | uključeno |

Ništa od ovoga se ne čuva; ponovno učitavanje kreće od podrazumijevanih vrijednosti.
Ono što se pamti u pregledaču: jezik, i nazivi automobila naučeni iz datoteka krugova
(vidi [Učitavanje krugova](race-loading-laps.md#car-names)).

## Za programere {#for-developers}

### Šta se dešava kada se krugovi učitaju {#what-happens-when-laps-are-loaded}

Svaki put kada se promijene skup krugova, referenca ili jezik, cijela analiza se
radi ponovo (`analyse` u
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Izvedeni kanali se dodaju svakom krugu tamo gdje igra ih ne šalje: ugao
   klizanja, klizanje točkova iz brzina točkova, u vazduhu, rastresito tlo, brzina
   zakretanja ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Bira se referenca i svaki krug se projektuje na njenu putanju i ponovo uzorkuje
   svakih 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Iz krugova se računa da li je svijet igre ogledalski
   ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Krivine se nalaze na referenci i grupišu u segmente od jedne zone kočenja do
   sljedeće ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Po automobilu: njegova ovojnica (prianjanje, kočenje, vuča po brzini), njegov
   profil, njegove krive guma ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Po krugu i segmentu: šta je uradio (tačka kočenja, najsporija tačka, pun gas, ...)
   i linija kojom je vozio ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Po krugu: njegovi događaji upravljanja automobilom, svaki postavljen uz krug s
   kojim se tamo poredi.
8. Po krugu i segmentu: vremenski račun u odnosu na krug za poređenje i nalaz izražen
   riječima.
9. Vremenska mapa i mapa uzroka po krugu.

Tekstovi se proizvode na trenutnom jeziku; promjena jezika ponovo pokreće analizu
(i preimenuje demo krugove). Greška u analizi prikazuje se ispod dugmadi **Krugovi**
kao greška, a krugovi ostaju učitani.

### Izvorne datoteke {#source-files}

| Datoteka | Uloga |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | čitanje datoteka krugova |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | tip kruga, imenovanje, demo krugovi |
| `src/race/derive.ts`, `handedness.ts` | izvedeni kanali, ogledalski svjetovi |
| `src/race/align.ts`, `segments.ts`, `line.ts` | osa udaljenosti, krivine, linije |
| `src/race/analysis.ts` | poređene krivine, uzroci, nalazi |
| `src/race/envelope.ts`, `profile.ts` | šta automobil može |
| `src/race/control.ts`, `impacts.ts` | upravljanje automobilom, udarci i sudari |
| `src/race/stats.ts` | mnogo krugova |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | reprodukcija i crtanje |
| `src/race/schema.ts`, `graphs.ts` | tabela kanala, redovi grafikona |
| `src/ui/race/*` | bočna traka, grafikoni, HUD, oznake |
| `src/state/raceStore.ts` | stanje kartice i sat reprodukcije |

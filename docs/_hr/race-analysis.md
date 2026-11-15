---
title: "Analiza utrke"
nav_order: 14
has_children: true
lang: "hr"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Analiza utrke

Vozili ste istu stazu dvaput. Kartica **Analiza utrke** pušta obje vožnje zajedno u 3D, pokazuje gdje je jedan krug bio sporiji i kaže vam zašto. Još nemate krugove? Pritisnite **Demo krugovi**.

![Kartica Analiza utrke s demo krugovima: bočna traka s Krugovima i Gdje napredovati, automobili na stazi, grafikoni ispod prikaza](../assets/img/hr/race-analysis-overview.webp)

Kartica uspoređuje dva ili više krugova jedne staze. Dijeli platno, kameru i učitani model staze (**Pozadina / razina**) s toplinskom kartom; sve ostalo je vlastito: vlastita bočna traka i vlastita traka ispod prikaza. Riječi poput *krug*, *referenca* i *vrh zavoja* nalaze se u [pojmovniku](glossary.md).

Ova stranica je karta kartice. Svaki dio ima vlastitu stranicu:

| Stranica | Što pokriva |
|---|---|
| [Učitavanje krugova](race-loading-laps.md) | svaki format datoteke, mape i staze, imena automobila, demo krugovi, popis krugova, referenca i fokus |
| [Reprodukcija i 3D scena](race-replay-and-scene.md) | traka za upravljanje, tri načina reprodukcije, poravnavanje automobila, kamera praćenja, linije, karte, automobili, oznake, zrcaljeni svjetovi |
| [Grafikoni i HUD](race-charts-and-hud.md) | grafikoni udaljenosti, birač grafikona, lebdenje i zumiranje, kartice automobila, tablica kanala |
| [Događaji upravljanja automobilom](race-control-events.md) | blokade kotača, proklizavanje kotača, preupravljanje, okretanja, podupravljanje, udarci, sudari, ABS/TC, ručna kočnica, zrak - kako se svaki otkriva, sa svakim pragom |
| [Analiza zavoj po zavoj](race-corner-analysis.md) | poravnanje po udaljenosti, zavoji i segmenti, obračun vremena zavoja, svaki uzrok i redoslijed u kojem se provjeravaju, oblik linije i savjet |
| [Profili vozila i usporedba](race-car-profiles.md) | što svaki automobil može, mjereno iz njegovih krugova; *Usporedba automobila*; što automobil odlučuje u svakom zavoju |
| [Statistika staze](race-course-statistics.md) | mnogo krugova jedne staze: greške po zavoju i po vrsti, karta grešaka, izvoz toplinske karte, granice performansi |
| [Analitika utrka: metoda](race-analytics.md) | istraživanje iza pravila, s izvorima |
| [Ostale utrkaške igre](other-games.md) | što preglednik radi s krugovima iz svake igre: klizanje i drift izračunati tamo gdje ga igra ne šalje, zrcaljeni svjetovi, dodatni kanali |

## Ekran {#the-screen}

**Bočna traka**, odozgo prema dolje (odjeljci se mogu sklopiti):

1. **Krugovi** - učitavanje, popis, prikaz/skrivanje, referenca, fokus, praćenje.
   Vidi [Učitavanje krugova](race-loading-laps.md).
2. **Statistika staze** - pojavljuje se tek od tri učitana kruga.
   Vidi [Statistika staze](race-course-statistics.md).
3. **Gdje napredovati** - nalazi fokusiranog kruga, zavoj po zavoj.
   Vidi [Analiza zavoj po zavoj](race-corner-analysis.md).
4. **Zavoj po zavoj** (ili *Zavoj po zavoj - klasa X* uz nekoliko klasa) - najbrži krug kroz svaki zavoj i njegova linija. Prikazuje se uz dva ili više krugova.
5. **Kontrola automobila** - blokade, klizanja, guranja i udarci fokusiranog kruga.
   Vidi [Događaji upravljanja automobilom](race-control-events.md).
6. **Usporedba automobila** (ili **Automobil** uz jedan automobil) - vidi
   [Profili vozila i usporedba](race-car-profiles.md).
7. **Prikaz** - koja karta je naslikana na stazi i što se crta.
   Vidi [Reprodukcija i 3D scena](race-replay-and-scene.md).
8. Zajednički paneli **Razina** i **Kamera i scena** (model staze, obrtanje osi, kamera) - dokumentirani uz toplinsku kartu i [Kameru](camera.md).

**Prikaz** pokazuje stazu, odvožene linije, kartu, automobile, oznake pričvršćene na stazu i do šest kartica automobila gore lijevo (vidi [Grafikoni i HUD](race-charts-and-hud.md)). Bez učitanih krugova piše „Nema učitanih krugova - Ovdje spustite dvije ili više datoteka krugova ili učitajte demo krugove iz bočne trake.”

**Traka ispod prikaza** sadrži upravljanje reprodukcijom i, ako nije skrivena, grafikone udaljenosti.

## Brzi početak {#quick-start}

1. Otvorite karticu **Analiza utrke** (pored **Toplinske karte** na vrhu bočne trake).
2. Unesite krugove. Pritisnite **Demo krugovi** da vidite što kartica radi s tri izmišljena kruga. Za vlastite krugove prvo ih snimite ([formati datoteka i snimači](race-loading-laps.md#file-formats)), zatim pritisnite **Učitaj datoteke krugova…** ili **Mapa…**, ili spustite datoteke ili mape na prikaz.
3. Najbrži cjeloviti krug postaje referenca; najsporiji od ostalih krugova je fokusiran. Kliknite bilo koji krug na popisu da ga fokusirate; ★ čini krug referencom.
4. Pročitajte **Gdje napredovati**. Kliknite nalaz: automobili se poravnaju 40 m prije njega, kamera ga uokviri, reprodukcija prolazi kroz njega i otvaraju se mjere.
5. Zadržite pokazivač na grafikonima da pomaknete svaki automobil na taj metar; Shift+klik da ih poravnate tamo.

## Tipkovnica {#keyboard}

Dok je kartica Analiza utrke otvorena:

| Tipka | Radi |
|---|---|
| **K** | pusti / pauziraj reprodukciju |
| **Home** | natrag na početak reprodukcije |
| tipke s brojevima | ništa (na toplinskoj karti mijenjaju načine) |

Tipke upisane u tekstno polje ili padajući izbornik se ignoriraju. Tipke kamere rade kao na toplinskoj karti (**W A S D**, **Space** gore, **Q** dolje, **Shift** brže, **Alt** sporije, miš za gledanje; sve u [Kameri](camera.md)); **F** uokviruje učitane krugove (kao što to radi učitavanje krugova).

## Mnogo krugova {#many-laps}

- Svi učitani krugovi se analiziraju i broje; desetak traje sekundu ili dvije.
- Iza **8** krugova (`SHOW_ALL_UP_TO`), dodani krugovi se crtaju samo kad su referenca, fokusirani krug ili najbolji krug klase fokusiranog kruga. Gumbi *Prikaži sve* / *Samo oni koje gledate* to mijenjaju.
- Iza **10** vidljivih automobila (`PLAIN_PAST`), krugovi koje ne gledate (nisu fokus, praćeni automobil ni referenca) crtaju se s linijama prorijeđenim na točku svakih 6 m umjesto 1,5 m, i kao obični automobili.
- Grafikoni crtaju najviše **8** krugova; prikaz najviše **6** kartica.
- Statistika staze pojavljuje se od **3** kruga.

Pojedinosti: [Statistika staze](race-course-statistics.md#performance-with-many-laps).

## Zadane postavke prikaza {#default-view-settings}

| Postavka | Zadano |
|---|---|
| Karta | Vremenska karta |
| Odvožene linije, Automobili, Gume i ovjes, Oznake, Staza iz krugova | uključeno |
| Sve vrijednosti na karticama | isključeno |
| Veličina automobila | 1× |
| Grafikoni | prikazani |
| Način reprodukcije | Od linije |
| Brzina reprodukcije | 1× |
| Ponavljanje | uključeno |

Ništa od ovoga se ne sprema; ponovno učitavanje kreće od zadanih vrijednosti. Što se pamti u pregledniku: jezik i imena automobila naučena iz datoteka krugova (vidi [Učitavanje krugova](race-loading-laps.md#car-names)).

## Za programere {#for-developers}

### Što se događa kad se učitaju krugovi {#what-happens-when-laps-are-loaded}

Svaki put kad se promijeni skup krugova, referenca ili jezik, cijela analiza ponovno se izvodi (`analyse` u [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Izvedeni kanali dodaju se svakom krugu tamo gdje ih igra ne šalje: kut drifta, proklizavanje kotača iz brzina kotača, u zraku, rahlo tlo, brzina zakretanja ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Bira se referenca, i svaki krug se projicira na njezinu putanju i ponovno uzorkuje svaka 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Iz krugova se računa je li svijet igre zrcaljen ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Zavoji se nalaze na referenci i grupiraju u segmente od jedne zone kočenja do sljedeće ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Po automobilu: njegova ovojnica (prianjanje, kočenje, potisak po brzini), njegov profil i krivulje njegovih guma ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Po krugu i segmentu: što je učinio (točka kočenja, najsporija točka, puni gas, ...) i linija kojom je vozio ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Po krugu: njegovi događaji upravljanja automobilom, svaki postavljen uz krug s kojim se tamo uspoređuje.
8. Po krugu i segmentu: obračun vremena naspram kruga za usporedbu i nalaz riječima.
9. Karta vremena i karta uzroka po krugu.

Tekstovi se pišu na trenutnom jeziku; promjena jezika ponovno pokreće analizu (i preimenuje demo krugove). Greška u analizi prikazuje se ispod gumba **Krugovi** kao pogreška, a krugovi ostaju učitani.

### Izvorne datoteke {#source-files}

| Datoteka | Uloga |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | čitanje datoteka krugova |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | tip kruga, imenovanje, demo krugovi |
| `src/race/derive.ts`, `handedness.ts` | izvedeni kanali, zrcaljeni svjetovi |
| `src/race/align.ts`, `segments.ts`, `line.ts` | osi udaljenosti, zavoji, linije |
| `src/race/analysis.ts` | usporedba zavoja, uzroci, nalazi |
| `src/race/envelope.ts`, `profile.ts` | što automobil može |
| `src/race/control.ts`, `impacts.ts` | upravljanje automobilom, udarci i sudari |
| `src/race/stats.ts` | mnogo krugova |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | reprodukcija i crtanje |
| `src/race/schema.ts`, `graphs.ts` | tablica kanala, retci grafikona |
| `src/ui/race/*` | bočna traka, grafikoni, HUD, oznake |
| `src/state/raceStore.ts` | stanje kartice i sat reprodukcije |

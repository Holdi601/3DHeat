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

![Kartica Analiza utrke s demo krugovima: bočna traka s Krugovima i Gdje napredovati, automobili na stazi, grafikoni ispod prikaza](../assets/img/en/race-analysis-overview.webp)

Kartica uspoređuje dva ili više krugova jedne staze. Dijeli platno, kameru i učitani model staze (**Pozadina / razina**) s toplinskom kartom; sve ostalo je vlastito: vlastita bočna traka i vlastita traka ispod prikaza. Riječi poput *krug*, *referenca* i *vrh zavoja* nalaze se u [pojmovniku](glossary.md).

Ova stranica je karta kartice. Svaki dio ima vlastitu stranicu:

| Stranica | Što pokriva |
|---|---|
| [Učitavanje krugova](race-loading-laps.md) | svaki format datoteke, mape i staze, imena automobila, demo krugovi, popis krugova, referenca i fokus |
| [Reprodukcija i 3D scena](race-replay-and-scene.md) | traka za upravljanje, tri načina reprodukcije, poravnavanje automobila, kamera praćenja, linije, karte, automobili, oznake, zrcaljeni svjetovi |
| [Grafikoni i HUD](race-charts-and-hud.md) | grafikoni udaljenosti, birač grafikona, lebdenje i zumiranje, kartice automobila, tablica kanala |
| [Događaji upravljanja automobilom](race-control-events.md) | blokade kotača, proklizavanje kotača, podupravljanje, okretanja, podupravljanje, udarci, sudari, ABS/TC, ručna kočnica, zrak - kako se svaki otkriva, sa svakim pragom |
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

## For developers {#for-developers}

### What happens when laps are loaded {#what-happens-when-laps-are-loaded}

Every time the set of laps, the reference or the language changes, the whole
analysis is redone (`analyse` in
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Derived channels are added to each lap where the game does not send them:
   drift angle, wheel slip from wheel speeds, in the air, loose ground, yaw
   rate ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. The reference is chosen and every lap is projected onto its path and
   resampled every 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Whether the game's world is mirrored is worked out from the laps
   ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Corners are found on the reference, and grouped into segments from one
   braking zone to the next ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Per car: its envelope (grip, braking, pull per speed), its profile, its
   tyre curves ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Per lap and segment: what it did (brake point, slowest point, full
   throttle, ...) and the line it drove ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Per lap: its car-control events, each laid against the lap it is compared
   with there.
8. Per lap and segment: the time account against its comparison lap and the
   finding in words.
9. The time map and the cause map per lap.

The texts are produced in the current language; switching language runs the
analysis again (and renames the demo laps). A failure in the analysis is
shown under the **Laps** buttons as an error and the laps stay loaded.

### Source files {#source-files}

| File | Role |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | reading lap files |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | the lap type, naming, demo laps |
| `src/race/derive.ts`, `handedness.ts` | derived channels, mirrored worlds |
| `src/race/align.ts`, `segments.ts`, `line.ts` | distance axis, corners, lines |
| `src/race/analysis.ts` | corners compared, causes, findings |
| `src/race/envelope.ts`, `profile.ts` | what a car can do |
| `src/race/control.ts`, `impacts.ts` | car control, hits and crashes |
| `src/race/stats.ts` | many laps |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | replay and drawing |
| `src/race/schema.ts`, `graphs.ts` | the channel table, the charts' rows |
| `src/ui/race/*` | the sidebar, the charts, the HUD, the labels |
| `src/state/raceStore.ts` | the tab's state and the replay clock |

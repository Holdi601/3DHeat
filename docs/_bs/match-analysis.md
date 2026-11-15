---
title: "Analiza meča (CS2)"
nav_order: 10
lang: "bs"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# Analiza meča (Counter-Strike 2)

Kartica **Meč** pušta snimak nazad kao figure, a za meč Counter-Strike 2 prikazuje i tablu rezultata: ko je pobijedio u kojoj rundi, kako, i ko je dobio ubistva. Koristite je da pregledate meč rundu po rundu, zatim skočite na isti trenutak na toplotnoj mapi.

Kartica Meč pušta svaki snimak kao figure: snimak War Thundera ili Tacviewa, ili demo CS2, navedeni pod **Mečevi u snimku** ([Reprodukcija meča](match-replay.md)). Datoteka CS2 `.match.json` dodaje tablu rezultata opisanu na ovoj stranici.

## Pregledajte meč CS2 {#review-a-cs2-match}

1. Pretvorite demo ([dolje](#where-the-data-comes-from)) u datoteku `.parquet` i `.match.json`.
2. Na kartici **Toplotna mapa** učitajte datoteku `.parquet` pod **Izvor**.
3. Otvorite karticu **Meč** i kliknite **Učitaj datoteke mečeva…**, ili prevucite datoteku `.match.json` na prikaz.
4. Kliknite meč u **Sažeci mečeva**, zatim ćeliju trake rundi da otvorite tu rundu.
5. Kliknite **Prikaži rundu** da vidite tu rundu na toplotnoj mapi, ili **Reprodukcija runde** da je gledate kao figure.

![Kartica Meč: traka rundi s otvorenom rundom, tok ubistava i Tabla rezultata](../assets/img/en/match-analysis-round.webp)

Riječi kao KAST, ADR, eco, force buy i trade su u [rječniku](glossary.md#counter-strike-words).

## Odakle dolaze podaci {#where-the-data-comes-from}

Konverter demoa iz [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)
pretvara demoe u dvije datoteke po meču, u folderu po mapi:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Datoteka | Učitava se u | Sadrži |
|---|---|---|
| `<match>.parquet` | kartica **Toplotna mapa** (panel Izvor, kao svaki Parquet - jedna datoteka, više njih, ili cijeli folder) | položaj svakog igrača osam puta u sekundi, i svaki događaj gdje se desio: ubistvo, smrt, povreda, pucanj, bacanje, dim, flash, HE, molotov, mamac, zaslijepljenje, postavljanje, deaktiviranje, eksplozija; s `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, smjerom gledanja, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | kartica **Meč** | timovi, rezultat, svaka runda (pobjednik, kako, ekonomija, postavljanje, svako ubistvo redom, clutch-evi, preživjeli), linija table rezultata svakog igrača |

Podnožje Parquet datoteke nosi uputstva za čitanje (ključ `heat3d`), pa se
otvara bez ikakvog podešavanja: igrač kao osoba, strana kao grupa,
svaka runda (`roundId`, „<match> #NN") kao sesija, smjer gledanja uključen,
a svijet ispravno okrenut (CS2 svijet je desno-orijentisan s Z gore; čitan kao podrazumijevano
preslikavanje Z-gore, ispao bi zrcaljen). Vidi [Mapiranje kolona](column-mapping.md) i [Učitavanje datoteka](loading-files.md).
`python -m heat3d_cs2 map <map>` izvozi geometriju mape u istom sistemu, učitava se u **Nivo**.

Konvencije iza brojeva su konverterove (navedene u njegovom
README-u i unesene u svaki sažetak): smrt je **tradean** kad ubicu ubije jedan od saigrača žrtve za **5 s**; **KAST** je udio rundi s ubistvom, asistencijom (računa se i asistencija flash-om), preživljavanjem ili tradean smrću; **šteta** je stvarno izgubljeno zdravlje, samo neprijatelji; **clutch** je biti posljednji živ na strani dok neprijatelji stoje, dobijen kad strana pobijedi; **kupovina** po strani iz prosječne vrijednosti opreme na kraju vremena zamrzavanja - prva runda svake regularne polovine je runda s pištoljem (nijedna u produžetku), zatim ispod 1.500 $ eco, ispod 4.000 $ force buy, sve više puno kupovanje.

## Kartica {#the-tab}

Bočna traka kartice Meč na vrhu ima prekidač režima toplotne mape i izbor sesije, zatim odjeljke meča ispod, pa paneli toplotne mape **Filteri**, **Nivo** i **Kamera** - prikaz je toplotna mapa bilo kojeg Parqueta učitanog na kartici Toplotna mapa.

### Sažeci mečeva {#match-summaries}

| Kontrola | Radi |
|---|---|
| **Učitaj datoteke mečeva…** | bira `.json` datoteke (više odjednom): sažetke `.match.json` |
| prevucite na prikaz | JSON datoteke prevučene na prikaz dok je kartica Meč otvorena učitavaju se na isti način (ostale datoteke se ignorišu) |
| **Očisti** | uklanja svaki meč |
| **Svi mečevi** (uz dva ili više) | „N mečeva, M rundi": statistika preko svih njih |
| red meča | „TeamA 13 : TeamB 9", mapa · N rundi: otvara taj meč |

Datoteka se prihvata kad je JSON s `"format": "heat3d-cs2-match"` i nizovima `rounds`, `players` i `teams`. Greške se navode ispod dugmadi:
„<file>: not JSON", „<file>: not a CS2 match summary (heat3d-cs2-match)",
„<file>: rounds, players or teams missing" (prevedene). Meč učitan ponovo (isto ime `match`) zamjenjuje raniji. Mečevi su sortirani po mapi, pa po imenu. Kad je učitan tačno jedan meč, on se otvara; inače izbor ostaje (podrazumijevano svi mečevi).

Kad ništa nije učitano, odjeljak objašnjava: pretvorite s `python -m heat3d_cs2
demos`, ovdje učitajte datoteke `.match.json`, a datoteke `.parquet` na kartici Toplotna mapa.

### Meč (jedan meč otvoren) {#match-one-match-open}

**Zaglavlje:** oba tima sa svojim rezultatom, mapa, polovine -
„polovine 7-5, 6-6": runde 1-12 i 13-24 (premijerna i takmičarska igra MR12;
dužina polovine iz samog sažetka kad je navedena, pa 1-15 i 16-30 za MR15) -
zatim, kad je meč otišao u produžetak, njegov rezultat posebno: „produžetak 4-2",
runde poslije obje polovine. Neriješena runda se ne računa ni jednom timu. I „N
rundi odsječeno u demou" kad sažetak navodi nepotpune runde.

**Traka rundi:** ćelija po rundi, obojena bojom strane koja je pobijedila, s
njenim brojem i oznakom kako je završila. Neriješena runda (bez pobjednika) je neutralna siva
ćelija označena `=`, nikad boja strane; njen opis kaže „Runda 30: neriješeno - nijedna strana je nije dobila".

| Oznaka | Završila je |
|---|---|
| B | bomba eksplodirala |
| D | bomba deaktivirana |
| K | eliminisani |
| T | isteklo vrijeme |
| S | predaja |
| = | neriješeno |
| ? | ostalo |

Razdjelnik označava početak druge polovine (runda 13, ili runda poslije
dužine polovine iz sažetka) i svake trominutne polovine produžetka (runde 25,
28, 31, …). Pređite mišem preko ćelije: „Runda 7: TeamA (T) - bomba eksplodirala, postavljena A"
(„…, postavljena, mjesto nepoznato" kad sažetak nema mjesto) i kupovina i vrijednost opreme obje strane. Kliknite da otvorite rundu; kliknite ponovo da je zatvorite („Kliknite rundu za njena ubistva, ekonomiju i reprodukciju.").

**Runda:**

- „Runda 7: <tim> pobijedio - <kako>" („Runda 30: neriješeno - nijedna strana je nije dobila"
  za neriješenu) i koliko je runda trajala (kraj zamrzavanja do odluke, m:ss);
- ekonomija: tim svake strane, kupovina (pištolj, eco, force buy, puno kupovanje) i vrijednost opreme („4.350 $");
- postavljanje: mjesto, igrač i vrijeme u rundi (iz bilo koje verzije sažetka); „Postavio <player> u 1:05, mjesto nepoznato" kad mjesto nije poznato;
- **tok ubistava**, redom: vrijeme u rundi, napadač (bojom strane; „world" za nema napadača), oružje, i oznake - **HS** pogodak u glavu, **WB** kroz zid, **SM** kroz dim; **otvaranje** prvo ubistvo runde, **trade** (osvetio saigrača unutar 5 s), **tradean** (ubica je ubijen unutar 5 s), **tim** ubistvo saigrača (samoubistvo nije). Ubistva poslije odluke runde su zatamnjena;
- clutch-evi: „<player> (T) sam protiv 3: dobio clutch" / „izgubio";
- ko je bio živ na kraju, po strani („nijedan");
- **Prikaži rundu**: sve u ovoj rundi, na toplotnoj mapi;
- **Reprodukcija runde**: pušta rundu nazad kao kutije, od njenog početka (dolje).

Dugmad **Prikaži na toplotnoj mapi** ([dolje](#show-in-the-heatmap)) za ovaj meč, ili za otvorenu rundu.

### Tabla rezultata {#scoreboard}

Tabela po timu, red po igraču:

| Kolona | Je |
|---|---|
| K, D | ubistva, smrti |
| A | asistencije, uključujući asistencije flash-om |
| ± | ubistva minus smrti (zeleno iznad 0, crveno ispod) |
| ADR | šteta po rundi, stvarno izgubljeno zdravlje |
| KAST | % rundi s ubistvom, asistencijom, preživljavanjem ili tradean smrću |
| HS | % ubistava u glavu |
| Otvaranje | pobijeđeni-izgubljeni otvarajući dueli |
| Cl | clutch-evi pobijeđeni/odigrani |

Pređite mišem preko igrača: ubistva trade, puta tradean, asistencije flash-om, neprijatelji zaslijepljeni, šteta korisnim oružjem, i runde s više ubistava („2×3k"). **Kliknite igrača** za njegova ubistva i smrti na toplotnoj mapi (ovaj meč).

### Preko mečeva (Svi mečevi) {#across-matches-all-matches}

Preko svakog učitanog meča:

- „N mečeva · M rundi · <mape>", i „N rundi neriješeno, nijedna strana ih nije dobila" kad je bilo neriješenih;
- **Dobijene runde** po strani: ukupno, u rundama s **pištoljem** (pištolj runde iz sažetka), i u kupovinama **eco**, **force** i **puno** (svaka kao procenat s odigranim rundama; pređite mišem za „dobijeno od odigranih"). Neriješena runda je odigrana od obje strane i ničija;
- **Bomba**: postavljanja po mjestu, i koliko često je T strana nastavila da pobjeđuje te runde („12 postavljanja na A (T pobijedio 67%)"), postavljanja čije mjesto sažetak sam po sebi ne poznaje („2 postavljanja na nepoznato mjesto (T pobijedio 50%)"), ili „nikad nije postavljena"; kako su runde završavale, najčešće prvo;
- „Strana koja je uzela prvo ubistvo pobijedila je N% tih rundi." (samoubistvo nije prvo ubistvo; neriješena runda ne pretvara otvaranje);
- **Otvarajući dueli, gdje**: deset mjesta s najviše prvih ubistava (po mjestu žrtve; imena mjesta iz igre učinjena čitljivim, „TopofMid" → „Top of Mid"), dueli i udio koji je T strana dobila;
- **Igrači**: petnaest najboljih po ubistvima minus smrti, zbrojeno preko svih njihovih mečeva (upareno po Steam ID-u): mečevi, K-D, ADR i KAST ponderisani odigranim rundama, HS% ponderisan ubistvima, otvarajući dueli. **Kliknite igrača** za njegova ubistva i smrti preko svih mečeva na toplotnoj mapi.

Dugmad Prikaži na toplotnoj mapi za sve učitane mečeve su ispod toga.

## Prikaži na toplotnoj mapi {#show-in-the-heatmap}

Svaka veza postavlja vlastite **filtere** toplotne mape, pa ono što se prikazuje ostaje vidljivo i izmjenjivo na panelu Filteri, a **Prikaži sve** ih briše.
Rade nad tabelom toplotne mape učitanom na kartici Toplotna mapa; kartica Meč je nikad sama ne učitava.

| Dugme | Prikazani događaji |
|---|---|
| **Pozicije** | `position` - gdje su igrači bili, osam puta u sekundi |
| **Ubistva** | `kill` - gdje je ubica stajao |
| **Smrti** | `death` - gdje je žrtva pala |
| **Otvaranja** | `kill` i `death` s `opening` = 1 - prvo ubistvo svake runde, gdje su oba stajala (nudi se samo kad tabela ima kolonu `opening`) |
| **Dimovi** | `smoke` - gdje su dimovi pali |
| **Flashevi** | `flash` - gdje su flashevi eksplodirali |
| **Molotovi** | `molotov` - gdje su molotovi i zapaljive bombe gorjele |
| **HE** | `he` - gdje su HE granate eksplodirale |
| **Postavljanja** | `plant` - gdje je bomba postavljena |
| **Pucnji** | `shot` - odakle su pucnji ispaljeni |

Obim je određen mjestom na kojem su dugmad: svi učitani mečevi, ovaj meč, ili ova runda („Prikaži na toplotnoj mapi - runda 7").

Ono što se ne može primijeniti navodi se ispod dugmadi, umjesto da se tiho filtrira na ništa: „no match column retained - match not applied" (nema zadržane kolone meča - meč nije primijenjen), „match: X not in the loaded data" (meč X nije u učitanim podacima), isto za rundu i događaje, „player X not in the loaded data", „side X not in the loaded data", „no heatmap data loaded: load the matches' .parquet files in the Heatmap tab" (nema učitanih podataka toplotne mape: učitajte `.parquet` datoteke mečeva na kartici Toplotna mapa). Bez učitanih podataka veze također kažu „Učitajte `.parquet` datoteke mečeva na kartici Toplotna mapa da ih vidite na mapi."

**Reprodukcija runde** dodatno prebacuje toplotnu mapu na **Reprodukciju kutije**, vremensku liniju u režim *pusti* s prozorom postavljenim na *životni vijek*, traži na početak sesije runde i pušta. Kad runda nije sesija učitanih podataka: „this round is not a session of the loaded data: nothing to replay" (ova runda nije sesija učitanih podataka: nema šta da se reprodukuje).

## Za programere {#for-developers}

Kod: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Verzije sažetka {#summary-versions}

Kartica čita sažetke verzije 1 i verzije 2 (`"version"` u datoteci) jedan pored drugog, i tretira ih isto:

| | Verzija 2 | Verzija 1 |
|---|---|---|
| vrijeme postavljanja | sekunde u rundi, kao ubistva | sekunde meča; kartica oduzima početak runde |
| mjesto postavljanja | `A` ili `B`; prazno kad demo to ne kaže | `A`, `B`, ili broj entiteta - čita se kao nepoznato mjesto |
| dužina polovine | `halfLength`, od mjesta gdje strane prvi put mijenjaju; 12 kad je null | 12 (MR12) |
| runde s pištoljem | `pistolRounds` (runda 1 i prva runda poslije polovine) | runde čija je kupovina `pistol` |
| neriješena runda | `winner` i `winnerTeam` prazni | - |
| samoubistvo | `suicide` na ubistvu, nikad tim ubistvo | prepoznaje se po tome što su napadač i žrtva isti igrač |

`noscope` i `attackerBlind` ubistva (verzija 2) se ne prikazuju na kartici Meč, koja takođe ne prikazuje nijedno mjesto iz tabele toplotne mape, pa prazan `place` reda granate tu ništa ne mijenja.

Kako fokus postaje filteri (`focusFilters`):

- **meč** → filter kategorije na koloni `match`;
- **runda** → filter opsega `round` = N na numeričkoj koloni `round` (filter kategorije na kategoričkoj), a sesija runde (`<match> #NN`) se bira na biraču sesija;
- **događaji** → filter kategorije na koloni `event`;
- **igrač** → filter osobe na tom igraču;
- **strana** → filter grupe.

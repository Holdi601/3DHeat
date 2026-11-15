---
title: "Analiza utakmice (CS2)"
nav_order: 10
lang: "hr"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# Analiza utakmice (Counter-Strike 2)

Kartica **Meč** prikazuje snimku kao figure, a za utakmicu Counter-Strike 2 prikazuje i tablicu rezultata: tko je dobio koju rundu, kako, i tko je dobio ubojstva. Koristite je da pregledate utakmicu rundu po rundu, a zatim skočite na isti trenutak na toplinskoj karti.

Kartica Meč reproducira bilo koju snimku kao figure: snimku War Thundera ili Tacviewa, ili demo CS2, navedene pod **Mečevi u snimci** ([Reprodukcija utakmice](match-replay.md)). Datoteka CS2 `.match.json` dodaje tablicu rezultata opisanu na ovoj stranici.

## Pregled utakmice CS2 {#review-a-cs2-match}

1. Pretvorite demo ([dolje](#where-the-data-comes-from)) u datoteku `.parquet` i datoteku `.match.json`.
2. Na kartici **Toplinska karta** učitajte datoteku `.parquet` pod **Izvor**.
3. Otvorite karticu **Meč** i kliknite **Učitaj datoteke mečeva…**, ili ispustite datoteku `.match.json` na prikaz.
4. Kliknite utakmicu u **Sažeci mečeva**, zatim ćeliju trake rundi da otvorite tu rundu.
5. Kliknite **Prikaži rundu** da vidite tu rundu na toplinskoj karti, ili **Reproduciraj rundu** da je gledate kao figure.

![Kartica Meč: traka rundi s otvorenom rundom, tok ubojstava i tablica rezultata](../assets/img/en/match-analysis-round.webp)

Riječi kao KAST, ADR, eco, force buy i trade objašnjene su u [rječniku](glossary.md#counter-strike-words).

## Odakle dolaze podaci {#where-the-data-comes-from}

Pretvarač demo-snimki [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) pretvara demo-snimke u dvije datoteke po utakmici, u mapi po karti:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Datoteka | Učitava se u | Sadrži |
|---|---|---|
| `<match>.parquet` | karticu **Toplinska karta** (okno Izvor, kao i svaki Parquet: jedna datoteka, više njih ili cijela mapa) | položaj svakog igrača osam puta u sekundi i svaki događaj na kojem se dogodio: ubojstvo, smrt, ozljeda, pucanj, bacanje, dim, bljesak, HE, molotov, mamac, zasljepljivanje, postavljanje, deaktiviranje, eksplozija; sa `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, smjerom pogleda, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | karticu **Meč** | timovi, rezultat, svaka runda (pobjednik, kako, ekonomija, postavljanje, svako ubojstvo redom, clutchevi, preživjeli), svaki redak tablice rezultata svakog igrača |

Podnožje Parquet datoteke nosi upute za čitanje (ključ `heat3d`), pa se otvara bez ičega za postavljanje: igrač kao osoba, strana kao grupa, svaka runda (`roundId`, "<match> #NN") kao sesija, smjer pogleda uključen, a svijet ispravno okrenut (svijet CS2 je desnoruk s Z prema gore; čitan kao zadano preslikavanje s Z prema gore, bio bi zrcaljen). Vidi [Mapiranje stupaca](column-mapping.md) i [Učitavanje datoteka](loading-files.md). `python -m heat3d_cs2 map <map>` izvozi geometriju karte u istom okviru, učitanu u **Razina**.

Konvencije iza brojeva su konvencije pretvarača (navedene u njegovu README-u i nosi ih svaki sažetak). Smrt je **osvećena** kad ubojicu ubije jedan od suigrača žrtve unutar **5 s**. **KAST** je udio rundi s ubojstvom, asistencijom (asistencija bljeskom se računa), preživljavanjem ili osvećenom smrću. **Šteta** je stvarno izgubljeno zdravlje, samo neprijatelji. **Clutch** je biti posljednji živ na strani dok neprijatelji stoje, a osvaja se kad strana pobijedi. **Kupnja** po strani računa se iz prosječne vrijednosti opreme na kraju vremena zamrzavanja: prva runda svake regularne polovice je runda s pištoljem (u produžetku nijedna), zatim ispod 1.500 $ eco, ispod 4.000 $ force buy, a sve preko toga puno kupovanje.

## Kartica {#the-tab}

Bočna traka kartice Meč drži prekidač načina toplinske karte i birač sesija na vrhu, zatim odjeljke utakmice ispod, zatim ploče toplinske karte **Filtri**, **Razina** i **Kamera**. Prikaz je toplinska karta bilo kojeg Parquet-a učitanog na kartici Toplinska karta.

### Sažeci mečeva {#match-summaries}

| Kontrola | Radi |
|---|---|
| **Učitaj datoteke mečeva…** | bira `.json` datoteke (više odjednom): sažetke `.match.json` |
| ispuštanje na prikaz | JSON datoteke ispuštene na prikaz dok je kartica Meč otvorena učitavaju se na isti način (ostale datoteke se ignoriraju) |
| **Očisti** | uklanja svaku utakmicu |
| **Svi mečevi** (uz dvije ili više) | "N mečeva, M rundi": statistika nad svima njima |
| redak utakmice | "TeamA 13 protiv TeamB 9", karta · N rundi: otvara tu utakmicu |

Datoteka se prihvaća kad je JSON s `"format": "heat3d-cs2-match"` i nizovima `rounds`, `players` i `teams`. Greške se navode ispod gumba: "<file>: nije JSON", "<file>: nije sažetak CS2 utakmice (heat3d-cs2-match)", "<file>: nedostaje rounds, players ili teams". Utakmica učitana ponovno (isti naziv `match`) zamjenjuje raniju. Utakmice se razvrstavaju po karti, zatim po imenu. Kad je učitana točno jedna utakmica, ona se otvara. Inače izbor ostaje (zadano sve utakmice).

Kad ništa nije učitano, odjeljak objašnjava: pretvorite s `python -m heat3d_cs2 demos`, ovdje učitajte datoteke `.match.json`, a datoteke `.parquet` na kartici Toplinska karta.

### Meč (jedna utakmica otvorena) {#match-one-match-open}

**Zaglavlje:** oba tima s rezultatom, karta, polovice: "polovice 7-5, 6-6", runde 1–12 i 13–24 (premier i kompetitivna igra MR12; trajanje polovice iz sažetka kad ga navodi, pa 1–15 i 16–30 za MR15). Zatim, kad je utakmica otišla u produžetak, njezin rezultat zasebno: "produžetak 4-2", runde nakon obje polovice. Izjednačena runda ne broji se ni za jedan tim. Tu je i "N rundi prekinuto u demu" kad sažetak navodi nepotpune runde.

**Traka rundi:** ćelija po rundi, obojena bojom strane koja je pobijedila, s brojem i oznakom kako je završila. Izjednačena runda (bez pobjednika) je neutralna siva ćelija s oznakom `=`, nikad boja strane. Njezin savjet kaže "Runda 30: neriješeno, nijedna strana je nije dobila".

| Oznaka | Završila je |
|---|---|
| B | bomba eksplodirala |
| D | bomba deaktivirana |
| K | eliminirani |
| T | isteklo vrijeme |
| S | predaja |
| = | neriješeno |
| ? | drugo |

Razdjelnik označava početak druge polovice (runda 13, ili runda nakon trajanja polovice iz sažetka) i svake trominutne polovice produžetka (runde 25, 28, 31, …). Pokažite na ćeliju: "Runda 7: TeamA (T) - bomba eksplodirala, postavljena A" ("…, postavljena, mjesto nepoznato" kad sažetak nema mjesto), i kupnju i vrijednost opreme obiju strana. Kliknite da otvorite rundu; ponovo kliknite da je zatvorite ("Kliknite rundu za njezina ubojstva, ekonomiju i reprodukciju.").

**Runda:**

- "Runda 7: <team> pobijedio - <how>" ("Runda 30: neriješeno, nijedna strana je nije dobila" za neriješenu) i koliko je runda trajala (kraj zamrzavanja do odluke, m:ss);
- ekonomija: tim svake strane, kupnja (pištolj, eco, force buy, puno kupovanje) i vrijednost opreme ("4.350 $");
- postavljanje: mjesto, igrač i vrijeme od početka runde (iz bilo koje verzije sažetka); "Postavio <player> u 1:05, mjesto nepoznato" kad mjesto nije poznato;
- **tok ubojstava**, redom: vrijeme od početka runde, napadač (u boji strane; "world" za nijednog napadača), oružje i oznake: **HS** pogodak u glavu, **WB** kroz zid, **SM** kroz dim; **open** prvo ubojstvo runde, **trade** (osvetio suigrača unutar 5 s), **traded** (ubojica je ubijen unutar 5 s), **team** ubojstvo suigrača (samoubojstvo nije). Ubojstva nakon što je runda odlučena su prigušena;
- clutchevi: "<player> (T) sam protiv 3: osvojio clutch" / "izgubio ga";
- tko je bio živ na kraju, po strani ("nitko");
- **Prikaži rundu**: sve u ovoj rundi, na toplinskoj karti;
- **Reproduciraj rundu**: reproducira rundu kao kutije, od početka (dolje).

Gumbi **Prikaži na toplinskoj karti** (vidi [dolje](#show-in-the-heatmap)) za ovu utakmicu ili za otvorenu rundu.

### Tablica rezultata {#scoreboard}

Tablica po timu, redak po igraču:

| Stupac | Je |
|---|---|
| K, D | ubojstva, smrti |
| A | asistencije, uključujući asistencije bljeskom |
| ± | ubojstva minus smrti (zeleno iznad 0, crveno ispod) |
| ADR | šteta po rundi, stvarno izgubljeno zdravlje |
| KAST | % rundi s ubojstvom, asistencijom, preživljavanjem ili osvećenom smrću |
| HS | % ubojstava u glavu |
| Open | dvoboji otvaranja dobiveni-izgubljeni |
| Cl | clutchevi osvojeni/odigrani |

Pokažite na igrača: ubojstva trade, puta traded (osvećen), asistencije bljeskom, neprijatelji bljeskani, šteta korisnim predmetima i runde s više ubojstava ("2×3k"). **Kliknite igrača** za njegova ubojstva i smrti na toplinskoj karti (ova utakmica).

### Kroz utakmice (Svi mečevi) {#across-matches-all-matches}

Nad svakom učitanom utakmicom:

- "N mečeva · M rundi · <maps>", i "N rundi neriješeno, nijedna strana nije dobila" kad je bilo neriješenih;
- **Dobivene runde** po strani: ukupno, u rundama s **pištoljem** (pištoljske runde sažetka), te u kupnjama **eco**, **force** i **puno** (svaka kao postotak s odigranim rundama; pokažite za "dobiveno od odigranih"). Izjednačena runda odigrana je za obje strane, a ne dobiva je nijedna;
- **Bomba**: postavljanja po mjestu, i koliko su često T strana dobila te runde ("12 postavljanja na A (T dobio 67%)"), postavljanja čije mjesto sažetak sam po sebi ne poznaje ("2 postavljanja na nepoznatom mjestu (T dobio 50%)"), ili "nikad nije postavljena". Kako su runde završile, najčešće prvo;
- "Strana koja je uzela prvo ubojstvo dobila je N% tih rundi." (samoubojstvo nije prvo ubojstvo; izjednačena runda ne pretvara otvaranje);
- **Prvi dueli, gdje**: deset mjesta s najviše prvih ubojstava (prema tome gdje je žrtva bila; imena mjesta iz igre učinjena čitljivima, "TopofMid" → "Top of Mid"), dueli i udio koji je T strana dobila;
- **Igrači**: petnaest najboljih po ubojstvima minus smrtima, zbrojeno kroz sve njihove utakmice (uparivanje po Steam ID-u): utakmice, K-D, ADR i KAST ponderirani odigranim rundama, HS% ponderiran ubojstvima, dueli otvaranja. **Kliknite igrača** za njegova ubojstva i smrti kroz sve utakmice na toplinskoj karti.

Gumbi Prikaži na toplinskoj karti za sve učitane utakmice nalaze se ispod.

## Prikaži na toplinskoj karti {#show-in-the-heatmap}

Svaka poveznica postavlja vlastite **filtere** toplinske karte, pa ono što se prikazuje ostaje vidljivo i uredivo na ploči Filtri. **Prikaži sve** ih briše. Rade na tablici toplinske karte učitanoj na kartici Toplinska karta. Kartica Meč je nikad sama ne učitava.

| Gumb | Prikazani događaji |
|---|---|
| **Položaji** | `position`: gdje su igrači bili, osam puta u sekundi |
| **Ubojstva** | `kill`: gdje je ubojica stajao |
| **Smrti** | `death`: gdje je žrtva pala |
| **Otvaranja** | `kill` i `death` s `opening` = 1: prvo ubojstvo svake runde, gdje su oboje stajali (nudi se samo kad tablica ima stupac `opening`) |
| **Dimne** | `smoke`: gdje su dimovi pali |
| **Flash bombe** | `flash`: gdje su bljeskalice puknule |
| **Molotovi** | `molotov`: gdje su molotovi i zapaljive bombe gorjele |
| **HE** | `he`: gdje su HE granate eksplodirale |
| **Postavljanja** | `plant`: gdje je bomba postavljena |
| **Pucnji** | `shot`: odakle su ispaljeni pucnji |

Obuhvat ovisi o tome gdje se gumbi nalaze: sve učitane utakmice, ova utakmica, ili ova runda ("Prikaži na toplinskoj karti - runda 7").

Što se ne može primijeniti navodi se ispod gumba, a ne tiho filtrira na ništa: "nije zadržan stupac utakmice - utakmica nije primijenjena", "utakmica: X nije u učitanim podacima", isto za rundu i događaje, "igrač X nije u učitanim podacima", "strana X nije u učitanim podacima", "nema učitanih podataka toplinske karte: učitajte .parquet datoteke mečeva na kartici Toplinska karta". Bez učitanih podataka poveznice također kažu "Učitajte .parquet datoteke mečeva na kartici Toplinska karta da ih vidite na karti."

**Reproduciraj rundu** dodatno prebacuje toplinsku kartu na **Reprodukcija kutija**, a vremensku traku u način reprodukcije s prozorom postavljenim na *životni vijek*. Zatim traži početak sesije runde i reproducira. Kad runda nije sesija učitanih podataka: "ova runda nije sesija učitanih podataka: nema što reproducirati".

## Za razvojne programere {#for-developers}

Kod: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Verzije sažetka {#summary-versions}

Kartica čita sažetke verzije 1 i verzije 2 (`"version"` u datoteci) jedan pored drugoga i tretira ih jednako:

| | Verzija 2 | Verzija 1 |
|---|---|---|
| vrijeme postavljanja | sekunde od početka runde, kao i ubojstva | sekunde utakmice; kartica oduzima početak runde |
| mjesto postavljanja | `A` ili `B`; prazno kad demo ne kaže | `A`, `B`, ili broj entiteta: čita se kao nepoznato mjesto |
| trajanje polovice | `halfLength`, od mjesta gdje se strane prvi put zamijene; 12 kad je null | 12 (MR12) |
| runde s pištoljem | `pistolRounds` (runda 1 i prva runda nakon polovice) | runde čija je kupnja `pistol` |
| izjednačena runda | `winner` i `winnerTeam` prazni | - |
| samoubojstvo | `suicide` na ubojstvu, nikad ubojstvo suigrača | prepoznato po tome što su napadač i žrtva isti igrač |

Ubojstva s `noscope` i `attackerBlind` (verzija 2) ne prikazuju se na kartici Meč. Ona također ne prikazuje nijedno mjesto iz tablice toplinske karte, pa prazan `place` retka granate tu ništa ne mijenja.

Kako fokus postaje filtri (`focusFilters`):

- **match** → filter kategorije na stupcu `match`;
- **round** → filter raspona `round` = N na brojčanom stupcu `round` (filter kategorije na kategoričkom), a sesija runde (`<match> #NN`) odabire se u biraču sesija;
- **events** → filter kategorije na stupcu `event`;
- **player** → filter osobe za tog igrača;
- **side** → filter grupe.

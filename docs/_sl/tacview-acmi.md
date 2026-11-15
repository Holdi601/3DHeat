---
title: "Posnetki Tacview (ACMI)"
parent: "Uvoz podatkov"
nav_order: 7
lang: "sl"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Posnetki Tacview (ACMI)

Tacview je program, ki beleži lete v letalskih simulatorjih; njegove datoteke se končajo z `.acmi`. 3DHeat jih odpre, da lahko vidite, kam je letel vsak letalnik.

Posnetki letov Tacview se naložijo kot vsaka tabela: izberite ali spustite `.acmi` (besedilo, `.txt.acmi`, ali stisnjeno, `.zip.acmi`) in pritisnite **Naloži**. Nato dobite toploto vseh letov, na zavihku **Tekma** pa predvajanje s figurami, sledmi in seznamom dogodkov ([Predvajanje tekme](match-replay.md)). ACMI je javni datotečni format Tacview ([dokumentacija](https://www.tacview.net/documentation/acmi/)); DCS (prek izvoznika Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS in drugi ga pišejo, zato to bere katerega koli od njih.

## Kaj postane iz posnetka {#what-a-recording-becomes}

Ena vrstica vsakič, ko se zapiše položaj predmeta, ena vrstica na dogodek na mestu predmeta, in ena vrstica, ko predmet izgine (`Removed`, kjer je bil nazadnje). Dogodek o predmetu, ki ga še nismo videli – zaznamek, sporočilo za vse – je vrstica predmeta `(recording)` na referenčni točki. Posnetek nosi svoja navodila za branje, zato se korak preslikave izpolni sam. Bralnik zapiše te stolpce: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, nato vse dodatne lastnosti, ki jih ima posnetek. Njihove vloge:

| Stolpec | Vloga | Pomen |
|---|---|---|
| Time | čas | Sekunde po ReferenceTime posnetka; Unix sekunde, kadar jo ima, zato ura kaže pravi čas. |
| X, Y | položaj | Vzhod in sever, v metrih, na ravnini, ki se dotika Zemlje v referenčni točki posnetka: razdalje in smeri so blizu nje resnične, z odklonom pod tisočinko na 100 km. Sever postane svetovni -Z. |
| Altitude | položaj (navzgor) | Metri. |
| Object | oseba | Pilot in ime predmeta z njegovim id-jem, npr. `Viper 1 (F-16C_50) #a01`; brezpilotni predmet `(T-90A) #401`. |
| Coalition | ekipa | Stran (ali barva, kadar koalicije ni). |
| Heading, Pitch | pogled | Stopinje; smer 0 je sever. |
| Recording | seja | Naslov (Title) posnetka ali ime datoteke: več posnetkov se naloži drug ob drugem, ne da bi se njihove sledi združile. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtri | Ohranjeno za filtriranje; Type in Name izbereta [figuro](figures.md) vsakega predmeta, Event napaja seznam dogodkov pri pregledu, Roll nagne letalo. |
| U, V | | Lastni ravninski metri igre, kadar jih ima vsak vzorec (DCS jih zapiše). |
| EventObjects | filtri | Vsak predmet, ki ga dogodek imenuje (`Message|a01|b02|...`), po id-ju. |
| RecordingInfo | | Lastnosti posnetka, kakršne so bile ob tistem trenutku – DataSource, DataRecorder, Author, Category, Briefing, Comments, ... – kot JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtri | Vsaka druga številska lastnost, ki jo ima posnetek. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtri | Vsaka druga besedilna lastnost, ki jo ima posnetek; lastnost z vrednostjo, ki ni število, je besedilo. |

Berejo se vse štiri oblike položaja Tacview (`lon|lat|alt`, z `u|v`, z `roll|pitch|yaw`, in z vsemi temi in smerjo), prazna polja pa ohranijo zadnjo vrednost; `-id` odstrani predmet, id, ki se pozneje ponovno uporabi, pa je nov predmet. Obravnavajo se pobegnjene vejice in nadaljevane vrstice.

Položaji se vedno projicirajo iz zemljepisne širine in dolžine, nikoli se ne vzamejo iz U/V, zato posnetki iz vseh iger delijo isto projekcijo z ozadjem pravega sveta.

## Strežniki DCS: kdo je zmagal in kako se je končal vsak bojni let {#dcs-servers-who-won-and-how-each-sortie-ended}

Strežnik DCS za več igralcev svoje misije s Tacview snema neprestano, trajni PvP strežnik pa prek mnogih od njih vodi kampanjo: stran zmaga, ko zavzame vsako letališče, FARP in cono druge strani, kar traja dneve in veliko ponovnih zagonov misije. Posnetki vsebujejo lete, ne kampanje: nobeno sporočilo ne pove, kdo je kaj zavzel, letališča so zapisana enkrat na začetku in nič ne pove, kdo je zmagal. Pretvornik Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) vsaki vrstici doda, kar je mogoče vedeti, in pusti prazno, česar ni mogoče - nikoli ne ugiba.

| Stolpec | Pomen |
|---|---|
| `server` | strežnik ali kampanja, iz glave posnetka (njegovi Title, Author in Comments imenujejo znane javne strežnike - Blue Flag, SPS Contention, Growling Sidewinder; sicer Author, ki nekoga imenuje); `--server Name` ga poimenuje za celo mapo. Posnetek, katerega glava ne imenuje nobenega strežnika - Author, kot je `Admin`, Title in Comments, kakršnih ne piše noben znan strežnik - ostane nepripisan: `server` je prazen, tudi ko je bil prenesen s strani s posnetki nekega strežnika, saj ima ta stran lahko tudi misije drugih skupnosti |
| `mission` | Title posnetka brez različice in meseca kampanje: `Operation_Example_V7.7.99` postane `Operation Example` |
| `campaign` | krog kampanje, ki mu posnetek pripada, po strežniku, zemljevidu in številki: `Example Server North 3`. En posnetek je ena seja (od ponovnega zagona do ponovnega zagona); krog traja prek mnogih sej, dni ali tednov |
| `round` | številka tega kroga: strežnikova lastna, kjer jo objavi, sicer n-ti krog, viden na tem strežniku in zemljevidu; iz datoteke krogov (spodaj), brez nje prazno |
| `session` | mesto posnetka med sejami kroga, 1, 2, ...; `sessionStart` njegov dejanski začetek (sekunde Unix) |
| `heldRed`, `heldBlue` | sporna mesta, ki jih je vsaka stran držala ob začetku seje, iz verižene datoteke krogov (spodaj) |
| `won`, `matchWon` | 1, ko je stran vrstice (njen Color, Red ali Blue) to kampanjo dobila, 0, ko jo je izgubila; prazno, kjer nobena datoteka krogov ne imenuje zmagovalca, in v nevtralnih vrsticah. Kampanja je hkrati krog in tekma, zato oba vsebujeta isto |
| `roundEndReason` | `capture` za kampanjo, dobljeno z zavzetjem vsega |
| `won`, `matchWon` v vsaki seji kroga | izid kroga, zapisan v vsak njegov posnetek, ko je znan njegov konec |
| `sortie` | v vrsticah letala: njegov let, 1, 2, ... od vzleta do vzleta; čas na tleh pred prvim vzletom in po pristanku šteje k letu, ki mu pripada |
| `sortieResult` | kako se je ta let končal: `landed`, `landed damaged` (po zadetku v zraku), `ejected`, `shot down`, `destroyed` (na tleh), `crashed`, `despawned` (izginilo v zraku brez vidnega vzroka - igralec je odšel), `airborne at end`, `no takeoff` |
| `sortieKills` | uničenja, pripisana letalu v tem letu |

Na trajnem strežniku je bojni let enota, ki nekaj pomeni: filtrirajte po `sortieResult` = `shot down`, da vidite, kje so bili leti izgubljeni, ali razčlenite toploto po `sortieResult` ali `server` v [razčlenitvi](breakdown.md). Vzleti, pristanki, katapultiranja, uničenja in strmoglavljenja, iz katerih je sestavljen, so dogodki, ki jih pretvornik izpelje iz gibanja letala (zgoraj).

Mesta, zavzeta med dvema sejama kroga - znana iz datoteke krogov, spodaj - so dogodki `capture` na začetku poznejšega posnetka: `Object` `(campaign)`, na tem mestu, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Letališče ali FARP, ki zamenja stran tam, kjer to posnetek pokaže - znova zapisan v drugi barvi ali odstranjen in v petih minutah znova zapisan na svojem mestu v drugi barvi - postane dogodek `capture` na ploščadi: `Event` = `capture`, `Airfield` njeno ime, `Detail` `Red to Blue`, `Coalition` njena nova stran. Ploščad, ki je prvič zapisana v neki barvi, ni zavzetje. Strežniki, ki smo jih doslej pregledali, svoje ploščadi zapišejo enkrat, zato njihovi posnetki ne vsebujejo zavzetij.

### Datoteke krogov {#rounds-files}

Datoteka krogov za vsak strežnik pove njegove kroge kampanje, kdo jih je dobil in seje vsakega od njih. Izhaja iz tega, kar strežnik objavi, ali iz samih posnetkov (spodaj).

Kdo je dobil kampanjo, objavi strežnik - dnevnik kampanje na svoji spletni strani -, v posnetku tega ni. To nosi datoteka krogov, pretvornik pa jo bere z `--rounds file.json` (podati jih je mogoče več):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Posnetek pripada krogom svojega `server`, katerih `title` (regularni izraz) se ujema z njegovim Title; vsaka vrstica pa krogu, v katerega pade njen dejanski čas - RecordingTime posnetka plus sekunde vrstice, ne datum misije v igri. Časi so v UTC. Krog brez zmagovalca (zamenjan, še teče) svojim vrsticam da številko kroga in prazen izid.

Dvojnik dokumenta tekme, noga `acmi`, pove, od kod izvira izid, tako kot `result.source` tekme War Thunder: `outcome.result` je `{ winner, round, endReason, source }`, `source` je `source` datoteke krogov, ali `null`, ko nič ni imenovalo zmagovalca. `outcome` navaja tudi kroge posnetka, njegova zavzetja in njegove bojne lete po tem, kako so se končali:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Vrstica pilota `Viper 1 (F-16C_50) #a01` na modri strani v tej kampanji se nato glasi: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Krogi iz samih posnetkov {#rounds-from-the-recordings-themselves}

Trajni strežnik ohrani svojo kampanjo prek ponovnih zagonov in vsak posnetek se začne s kopenskimi enotami in statičnimi objekti obeh strani tam, kjer jih je kampanja pustila. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` prebere prve minute vsakega posnetka ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), posnetke vsakega strežnika na enem zemljevidu uredi po času in jih poveže v verigo:

- **Mesta**: tla v celicah velikosti približno 2 km; celica pripada strani, ko so tri četrtine enot, ki so tam ob začetku seje, njene. *Sporna* mesta so tista, ki so jih videli v rokah obeh strani.
- **Zavzetja**: mesto, ki ga ob začetku naslednje seje drži druga stran - zavzeto med misijama ali med prejšnjo.
- **Nov krog**: seja, katere mesta se od mest prejšnje razlikujejo v več kot 60 % - začetna postavitev novega kroga, ne korak starega. Krog se konča tudi, ko strežnik preide na drug zemljevid (njegove seje se začnejo po zadnji in se nadaljujejo).
- **Kdo je zmagal**: pri krogu, ki se je končal, stran, ki je ob začetku njegove zadnje seje držala vsako mesto (`capture`, zanesljivost visoka), sicer stran, ki je držala več spornih mest (srednja pri dvakratniku druge strani, sicer nizka; nizka, ko se je končal z menjavo zemljevida). Odprt krog nima zmagovalca, a vsaka seja pove, koliko mest je vsaka stran držala ob njenem začetku, zato se vidi, kdo je bil v prednosti.
- Strežnik, katerega seje se vse začnejo enako, med njimi ne hrani stanja: ni povezan v verigo.

Začetek zadnje seje je lahko ure pred koncem kroga, zato je zanesljivost pomembna. Preverjeno na strežniku, ki objavlja svoje zmagovalce: veriga je vsak nov krog našla v seji, v kateri se je začel objavljeni krog, in stran v prednosti ob zadnjem začetku je bila objavljeni zmagovalec v vseh 9 krogih, ki jih je lahko preverila. `--official file.json` ohrani objavljene kroge takega strežnika in jim doda seje iz verige; `validation` v datoteki pove, kako zelo se je veriga ujemala. V izmišljeni kampanji:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Ogled kroga kampanje kot serije {#watching-a-campaign-round-as-a-series}

Naložite posnetke enega kroga skupaj - datoteke z istim `campaign` - in pregledovalnik jih predvaja kot eno serijo: sejo za sejo v njihovem dejanskem vrstnem redu, ure ali dneve med dvema pa skrajša na enominutni premor. Časovnica začetek vsake seje označi z rumeno, premore pa kot temne pasove, ura pa pove, katera seja se predvaja, in njen dejanski datum (`session 4/12 · 2026-11-02 12:38 UTC`). Toplota, predvajanje, filtri in Ugotovitve delujejo na celi seriji kot na vseh naloženih podatkih. Razdelek **Krog kampanje** na zavihku Tekma navaja seje z njihovimi datumi, koliko spornih mest je vsaka stran držala ob vsakem začetku - tudi kot graf čez krog - in koliko jih je bilo zavzetih pred njim; klik skoči na začetek seje. Posnetek, naložen sam, tam pove, kateri krog in katera seja je. Posnetki različnih krogov, naloženi skupaj, niso serija: vsak se začne pri nič, kot ločene tekme. Nalagalnik mnogih tekem (**Veliko tekem hkrati**) krog prav tako predvaja kot serijo, pretočno in prilagojeno grafični kartici, za kroge velikosti mnogih gigabajtov.

Mesta, ki so med krogom zamenjala lastnika, so na zemljevidu narisana kot cone zavzetja, obarvana po strani, ki je vsako držala ob začetku seje, ki se predvaja, in se preklopijo na mejah sej; vsaka sprememba je zavzetje na seznamu dogodkov predvajanja. Izpeljana so iz naloženih vrstic - kopenskih enot in statičnih objektov vsake seje v njenih prvih minutah, v celicah velikosti približno 2 km, kot to počne veriga -, zato potrebujejo polni nalagalnik (nalagalnik mnogih tekem od vsake vrstice obdrži premalo).

**Nalaganje celega kroga iz enega od njegovih posnetkov.** V navadnem brskalniku pregledovalnik ne more odpreti datotek, ki jih niste izbrali: naložite datoteke kroga skupaj. Ko ga streže lokalni strežnik pregledovalnika (`npm run dev` ali `npm run preview`), lahko: datoteki `tools/local-data.json`, ki jo git prezre, dodajte vnos `campaigns`, ki imenuje mapo z datotekami krogov in mape s pretvorjenimi posnetki, in razdelek Krog kampanje posameznega posnetka ponudi **Naloži cel krog**, prenese seje kroga, ki jih tam najde, in jih naloži z nalagalnikom mnogih tekem:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Streženi so le posnetki, ki jih imenuje datoteka krogov (`tools/campaign-files.mjs`); seja, ki je v teh mapah ni, je prešteta, ne naložena.

Kaj objavljajo znani strežniki:

| Strežnik | Krog | Kako stran zmaga | Kje je mogoče prebrati zmagovalca |
|---|---|---|---|
| SPS Contention | kampanja na enem zemljevidu in v enem obdobju (dnevi), prek mnogih ponovnih zagonov | zavzeto vsako letališče, FARP in utrdba; kampanja, končana brez zmagovalca, je bila zamenjana | javni dnevnik kampanj strežnika (zmagovalec, začetek in konec vsake kampanje) |
| Blue Flag | krog kampanje prek mnogih 5-urnih misij; `_YYYY_MM` v Title se ob vsakem ponovnem zagonu premakne za en mesec | zavzet vsak sovražnikov položaj; starejši krogi so razglasili stran, ki je po določenem času držala več | doslej ni bilo najdeno v objavljeni obliki; veriga posnetkov sledi vsakemu krogu in kdo koliko drži ob vsakem začetku |
| Growling Sidewinder | izvedba misije (6 ur) misije z odprtim spopadom | zavzete cone in letališča | njegova stran s statistiko prikazuje pilote, ne izidov; vsaka seja se začne enako, zato noben krog ne sega čez več sej: prazno |
| Misije proti UI (misije z zavzemanjem con) | izvedba misije | stran igralcev proti UI misije: brez izida PvP | prazno |
| Nepripisano (glava ne imenuje nobenega strežnika) | - | - | prazno, tudi `server` je prazen |

---
title: "Tacview snimke (ACMI)"
parent: "Unos podataka"
nav_order: 7
lang: "hr"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview snimke (ACMI)

Tacview je program koji snima letove u simulatorima letenja; njegove datoteke završavaju na `.acmi`. 3DHeat ih otvara da vidiš gdje je svaki zrakoplov letio.

Tacviewove snimke letova učitavaju se kao svaka tablica: odaberi ili ispusti `.acmi` (tekst, `.txt.acmi`, ili zipirano, `.zip.acmi`) i pritisni **Učitaj**. Tada dobiješ toplinu svih letova, a na kartici **Meč** reprodukciju s figurama, tragovima i popisom događaja ([Reprodukcija utakmice](match-replay.md)). ACMI je javni format datoteke Tacviewa ([dokumentacija](https://www.tacview.net/documentation/acmi/)); DCS (preko Tacviewova izvoznika), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS i drugi ga pišu, pa ovo čita bilo koji od njih.

## U što se snimka pretvara {#what-a-recording-becomes}

Jedan redak svaki put kad se zapiše položaj objekta, jedan redak po događaju na mjestu objekta, i jedan redak kad objekt napusti scenu (`Removed`, gdje je bio zadnji put). Događaj o objektu koji još nije viđen - oznaka, poruka svima - je redak objekta `(recording)` u referentnoj točki. Snimka nosi vlastite upute za čitanje, pa se korak mapiranja sam popunjava. Čitač piše ove stupce: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, zatim sva ostala svojstva koja snimka ima. Njihove uloge:

| Stupac | Uloga | Značenje |
|---|---|---|
| Time | vrijeme | Sekunde nakon ReferenceTime snimke; Unix sekunde kad ga snimka ima, pa sat pokazuje stvarno vrijeme. |
| X, Y | položaj | Istok i sjever, metri, na ravnini koja dira zemlju u referentnoj točki snimke: udaljenosti i smjerovi su točni blizu nje, a odstupaju manje od promila na 100 km. Sjever postaje svjetskim -Z. |
| Altitude | položaj (gore) | Metri. |
| Object | osoba | Pilot i naziv objekta s njegovim id-om, npr. `Viper 1 (F-16C_50) #a01`; bespilotni objekt `(T-90A) #401`. |
| Coalition | tim | Strana (ili boja, kad nema koalicije). |
| Heading, Pitch | pogled | Stupnjevi; kurs 0 je sjever. |
| Recording | sesija | Naslov snimke ili naziv datoteke: više snimki se učitava jedna uz drugu bez spajanja njihovih tragova. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtri | Čuvaju se za filtriranje; Type i Name biraju [figuru](figures.md) svakog objekta, Event hrani popis događaja u analizi, Roll naginje zrakoplov. |
| U, V | | Metri ravnog svijeta same igre, kad svaki uzorak ima njih (DCS ih piše). |
| EventObjects | filtri | Svaki objekt koji događaj navodi (`Message|a01|b02|...`), po id-u. |
| RecordingInfo | | Vlastita svojstva snimke kakva su bila u tom trenutku - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - kao JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtri | Bilo koje drugo brojčano svojstvo koje snimka nosi. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtri | Bilo koje drugo tekstualno svojstvo koje snimka nosi; svojstvo s vrijednošću koja nije broj jest tekst. |

Čitaju se sva četiri oblika Tacviewova položaja (`lon|lat|alt`, s `u|v`, s `roll|pitch|yaw`, i sa svima njima i kursom); prazna polja zadržavaju zadnju vrijednost; `-id` uklanja objekt, a id koji se poslije ponovno upotrijebi je novi objekt. Zarezi sa escape znakom i nastavljeni redci su obrađeni.

Položaji se uvijek projiciraju iz zemljopisne širine i dužine, nikad se ne uzimaju iz U/V, pa snimke svih igara dijele jednu projekciju s pozadinom stvarnog svijeta.

## DCS poslužitelji: tko je pobijedio i kako je završio svaki borbeni let {#dcs-servers-who-won-and-how-each-sortie-ended}

DCS poslužitelj za više igrača snima svoje misije Tacviewom danonoćno, a trajni PvP poslužitelj kroz mnoge od njih vodi kampanju: strana pobjeđuje kad zauzme svako uzletište, FARP i zonu druge strane, a to traje danima i kroz mnogo ponovnih pokretanja misije. Snimke sadrže letove, ne kampanju: nijedna poruka ne kaže tko je što zauzeo, uzletišta se zapišu jednom na početku i ništa ne kaže tko je pobijedio. Pretvarač za Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) svakom retku dodaje ono što se može znati, a ono što se ne može ostavlja prazno - nikad ne nagađa.

| Stupac | Značenje |
|---|---|
| `server` | poslužitelj ili kampanja, iz zaglavlja snimke (njezini Title, Author i Comments imenuju poznate javne poslužitelje - Blue Flag, SPS Contention, Growling Sidewinder; inače Author koji nekoga imenuje); `--server Name` ga imenuje za cijelu mapu. Snimka čije zaglavlje ne imenuje nijedan poslužitelj - Author poput `Admin`, Title i Comments kakve ne piše nijedan poznati poslužitelj - ostaje nepripisana: `server` je prazan, čak i kad je preuzeta sa stranice sa snimkama nekog poslužitelja, jer ta stranica može sadržavati i misije drugih zajednica |
| `mission` | Title snimke bez verzije i mjeseca kampanje: `Operation_Example_V7.7.99` postaje `Operation Example` |
| `campaign` | krug kampanje kojem snimka pripada, po poslužitelju, karti i broju: `Example Server North 3`. Jedna snimka je jedna sesija (od ponovnog pokretanja do ponovnog pokretanja); krug traje kroz mnogo sesija, danima ili tjednima |
| `round` | broj tog kruga: vlastiti broj poslužitelja gdje ga objavljuje, inače n-ti krug viđen na tom poslužitelju i karti; iz datoteke krugova (dolje), bez nje prazno |
| `session` | mjesto snimke među sesijama kruga, 1, 2, ...; `sessionStart` njezin stvarni početak (Unix sekunde) |
| `heldRed`, `heldBlue` | sporna mjesta koja je svaka strana držala na početku sesije, iz ulančane datoteke krugova (dolje) |
| `won`, `matchWon` | 1 kad je strana retka (njegov Color, Red ili Blue) dobila tu kampanju, 0 kad ju je izgubila; prazno gdje nijedna datoteka krugova ne imenuje pobjednika, i u neutralnim recima. Kampanja je istodobno krug i meč, pa oba sadrže isto |
| `roundEndReason` | `capture` za kampanju dobivenu zauzimanjem svega |
| `won`, `matchWon` u svakoj sesiji kruga | rezultat kruga, zapisan u svaku njegovu snimku čim je poznat njegov kraj |
| `sortie` | u recima zrakoplova: njegov let, 1, 2, ... od polijetanja do polijetanja; vrijeme na tlu prije prvog polijetanja i nakon slijetanja računa se u let kojem pripada |
| `sortieResult` | kako je taj let završio: `landed`, `landed damaged` (nakon pogotka u zraku), `ejected`, `shot down`, `destroyed` (na tlu), `crashed`, `despawned` (nestao u zraku bez vidljivog uzroka - igrač je otišao), `airborne at end`, `no takeoff` |
| `sortieKills` | obaranja pripisana zrakoplovu u tom letu |

Na trajnom poslužitelju borbeni let je jedinica koja nešto znači: filtriraj po `sortieResult` = `shot down` da vidiš gdje su letovi izgubljeni, ili raščlani toplinu po `sortieResult` ili `server` u [raščlambi](breakdown.md). Polijetanja, slijetanja, katapultiranja, obaranja i padovi od kojih se sastoji događaji su koje pretvarač izvodi iz kretanja zrakoplova (gore).

Mjesta zauzeta između dviju sesija kruga - poznata iz datoteke krugova, dolje - događaji su `capture` na početku kasnije snimke: `Object` `(campaign)`, na tom mjestu, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Uzletište ili FARP koji promijeni stranu tamo gdje to snimka pokazuje - ponovno zapisan u drugoj boji, ili uklonjen i unutar pet minuta ponovno zapisan na svom mjestu u drugoj boji - postaje događaj `capture` na pisti: `Event` = `capture`, `Airfield` njezino ime, `Detail` `Red to Blue`, `Coalition` njezina nova strana. Pista prvi put zapisana u nekoj boji nije zauzimanje. Poslužitelji koje smo dosad pogledali zapisuju svoje piste jednom, pa njihove snimke ne sadrže zauzimanja.

### Datoteke krugova {#rounds-files}

Datoteka krugova za svaki poslužitelj kaže njegove krugove kampanje, tko ih je dobio i sesije svakog od njih. Dolazi iz onoga što poslužitelj objavljuje, ili iz samih snimki (dolje).

Tko je dobio kampanju objavljuje poslužitelj - dnevnik kampanje na svojoj web-stranici -, to nije u snimci. To nosi datoteka krugova, a pretvarač je čita s `--rounds file.json` (može ih se zadati više):

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

Snimka pripada krugovima svojeg `server` čiji se `title` (regularni izraz) poklapa s njezinim Title; svaki redak krugu u koji pada njegovo stvarno vrijeme - RecordingTime snimke plus sekunde retka, ne datum misije u igri. Vremena su u UTC-u. Krug bez pobjednika (zamijenjen, još traje) svojim recima daje broj kruga i prazan rezultat.

Pandan dokumenta meča, podnožje `acmi`, kaže odakle dolazi rezultat, kao što to čini `result.source` meča u War Thunderu: `outcome.result` je `{ winner, round, endReason, source }`, `source` je `source` datoteke krugova, ili `null` kad ništa nije imenovalo pobjednika. `outcome` navodi i krugove snimke, njezina zauzimanja i njezine borbene letove po tome kako su završili:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Redak pilota `Viper 1 (F-16C_50) #a01` na plavoj strani u toj kampanji tada glasi: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Krugovi iz samih snimki {#rounds-from-the-recordings-themselves}

Trajni poslužitelj čuva svoju kampanju kroz ponovna pokretanja, i svaka snimka počinje s kopnenim jedinicama i statičnim objektima obiju strana ondje gdje ih je kampanja ostavila. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` čita prve minute svake snimke ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), slaže snimke svakog poslužitelja s jedne karte vremenskim redom i ulančava ih:

- **Mjesta**: tlo u ćelijama od oko 2 km; ćelija pripada strani kad su tri četvrtine jedinica koje su ondje na početku sesije njezine. *Sporna* mjesta su ona koja su viđena u rukama obiju strana.
- **Zauzimanja**: mjesto koje na početku sljedeće sesije drži druga strana - zauzeto između misija ili tijekom one ranije.
- **Novi krug**: sesija čija se mjesta od mjesta prethodne razlikuju u više od 60 % - početni raspored novog kruga, ne korak staroga. Krug završava i kad poslužitelj prijeđe na drugu kartu (njezine sesije počinju nakon posljednje i nastavljaju se).
- **Tko je pobijedio**: kod kruga koji je završio, strana koja je držala svako mjesto na početku njegove posljednje sesije (`capture`, pouzdanost visoka), inače strana koja je držala više spornih mjesta (srednja kad ih ima dvostruko više od druge strane, inače niska; niska kad je završio promjenom karte). Otvoreni krug nema pobjednika, ali svaka sesija kaže koliko je mjesta svaka strana držala na njezinu početku, pa se vidi tko je bio u vodstvu.
- Poslužitelj čije sve sesije počinju jednako ne čuva stanje između njih: ne ulančava se.

Početak posljednje sesije može biti satima prije kraja kruga, pa je pouzdanost važna. Provjereno na poslužitelju koji objavljuje svoje pobjednike: lanac je pronašao svaki novi krug u sesiji u kojoj je počeo objavljeni krug, a strana u vodstvu na posljednjem početku bila je objavljeni pobjednik u svakom od 9 krugova koje je mogao provjeriti. `--official file.json` zadržava objavljene krugove takvog poslužitelja i dodaje im sesije iz lanca; `validation` u datoteci kaže koliko se lanac slagao. U izmišljenoj kampanji:

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

### Gledanje kruga kampanje kao serije {#watching-a-campaign-round-as-a-series}

Učitaj snimke jednog kruga zajedno - datoteke s istim `campaign` - i preglednik ih reproducira kao jednu seriju: sesiju za sesijom njihovim stvarnim redom, a sate ili dane između dviju skraćuje na stanku od jedne minute. Vremenska crta označava početak svake sesije žutom bojom, a stanke kao tamne trake, a sat kaže koja se sesija reproducira i njezin stvarni datum (`session 4/12 · 2026-11-02 12:38 UTC`). Toplina, reprodukcija, filtri i Uvidi rade na cijeloj seriji kao na svim učitanim podacima. Odjeljak **Krug kampanje** na kartici Meč navodi sesije s njihovim datumima, koliko je spornih mjesta svaka strana držala na svakom početku - i kao grafikon kroz krug - i koliko ih je zauzeto prije njega; klik vodi na početak sesije. Snimka učitana sama ondje kaže koji je to krug i koja sesija. Snimke različitih krugova učitane zajedno nisu serija: svaka počinje od nule, kao zasebni mečevi. Učitavač mnogo mečeva (**Mnogo utakmica odjednom**) također reproducira krug kao seriju, strujanjem i prilagođeno GPU-u, za krugove od mnogo gigabajta.

Mjesta koja su tijekom kruga promijenila vlasnika crtaju se na karti kao zone zauzimanja, obojene prema strani koja je svako držala na početku sesije koja se reproducira, i mijenjaju se na granicama sesija; svaka promjena je zauzimanje na popisu događaja reprodukcije. Izvode se iz učitanih redaka - kopnenih jedinica i statičnih objekata svake sesije u njezinim prvim minutama, u ćelijama od oko 2 km, kao što to radi lanac -, pa im treba puni učitavač (učitavač mnogo mečeva zadržava premalo od svakog retka).

**Učitavanje cijelog kruga iz jedne od njegovih snimki.** U običnom web-pregledniku preglednik ne može otvoriti datoteke koje nisi odabrao: učitaj datoteke kruga zajedno. Kad ga poslužuje lokalni poslužitelj preglednika (`npm run dev` ili `npm run preview`), može: datoteci `tools/local-data.json`, koju git zanemaruje, dodaj unos `campaigns` koji imenuje mapu s datotekama krugova i mape s pretvorenim snimkama, i odjeljak Krug kampanje pojedine snimke nudi **Učitaj cijeli krug**, preuzima sesije kruga koje ondje pronađe i učitava ih učitavačem mnogo mečeva:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Poslužuju se samo snimke koje imenuje datoteka krugova (`tools/campaign-files.mjs`); sesija koja nije pronađena u tim mapama se broji, ne učitava.

Što objavljuju poznati poslužitelji:

| Poslužitelj | Krug | Kako strana pobjeđuje | Gdje se može pročitati pobjednik |
|---|---|---|---|
| SPS Contention | kampanja na jednoj karti i u jednom razdoblju (danima), kroz mnogo ponovnih pokretanja | zauzeto svako uzletište, FARP i uporište; kampanja završena bez pobjednika bila je zamijenjena | javni dnevnik kampanja poslužitelja (pobjednik, početak i kraj svake kampanje) |
| Blue Flag | krug kampanje kroz mnogo misija od 5 sati; `_YYYY_MM` u Title napreduje za jedan mjesec pri svakom ponovnom pokretanju | zauzet svaki neprijateljski položaj; stariji krugovi proglašavali su stranu koja je nakon zadanog vremena držala više | dosad nije pronađeno u objavljenom obliku; lanac snimki prati svaki krug i tko koliko drži na svakom početku |
| Growling Sidewinder | izvođenje misije (6 sati) misije otvorenog sukoba | zauzete zone i uzletišta | njegova stranica sa statistikom prikazuje pilote, ne rezultate; svaka sesija počinje jednako, pa nijedan krug ne obuhvaća više sesija: prazno |
| Misije protiv UI-ja (misije zauzimanja zona) | izvođenje misije | strana igrača protiv UI-ja misije: nema PvP rezultata | prazno |
| Nepripisano (zaglavlje ne imenuje nijedan poslužitelj) | - | - | prazno, i `server` je prazan |

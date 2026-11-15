---
title: "Snimci Tacview (ACMI)"
parent: "Unos podataka"
nav_order: 7
lang: "bs"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Snimci Tacview (ACMI)

Tacview je program koji bilježi letove u simulatorima leta; njegove datoteke završavaju na `.acmi`. 3DHeat ih otvara da vidite gdje je svaki avion letio.

Snimci letova iz Tacviewa se učitavaju kao svaka tabela: izaberite ili prevucite `.acmi` (tekst, `.txt.acmi`, ili zipovan, `.zip.acmi`) i pritisnite **Učitaj**. Zatim dobijate toplotu svih letova, a na kartici **Meč** replay sa figurama, tragovima i listom događaja ([Replay meča](match-replay.md)). ACMI je javni format datoteka Tacviewa ([dokumentacija](https://www.tacview.net/documentation/acmi/)). DCS (preko Tacviewovog izvoznika), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS i drugi ga pišu, pa ovo čita bilo koji od njih.

## Šta postaje od snimka {#what-a-recording-becomes}

Jedan red svaki put kad se upiše pozicija objekta, jedan red po događaju na mjestu objekta, i jedan red kad objekat napusti scenu (`Removed`, gdje je bio zadnji put). Događaj koji se odnosi na objekat koji još nije viđen, kao oznaka ili poruka svima, je red objekta `(recording)` u referentnoj tački. Snimak nosi sopstvena uputstva za čitanje, pa se korak mapiranja popunjava sam. Čitalac piše ove kolone: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, pa sva dodatna svojstva koja snimak ima. Njihove uloge:

| Kolona | Uloga | Značenje |
|---|---|---|
| Time | vrijeme | Sekunde nakon ReferenceTime snimka; Unix sekunde kad ga ima, pa sat pokazuje pravo vrijeme. |
| X, Y | pozicija | Istok i sjever, metri, na ravni koja dodiruje zemlju u referentnoj tački snimka: udaljenosti i smjerovi su tačni u blizini, a odstupaju manje od jednog dijela na hiljadu na 100 km. Sjever postaje svjetski -Z. |
| Altitude | pozicija (gore) | Metri. |
| Object | osoba | Pilot i ime objekta sa id-om, npr. `Viper 1 (F-16C_50) #a01`; objekat bez posade `(T-90A) #401`. |
| Coalition | tim | Strana (ili boja, kad nema koalicije). |
| Heading, Pitch | pogled | Stepeni; smjer 0 je sjever. |
| Recording | sesija | Naslov snimka ili ime datoteke: više snimaka se učitava jedno pored drugog bez spajanja njihovih tragova. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filteri | Sačuvane za filtriranje; Type i Name biraju [figuru](figures.md) svakog objekta, Event hrani listu događaja u debriefu, Roll naginje avion. |
| U, V | | Ravni metri svijeta igre, kad svaki uzorak ih ima (DCS ih piše). |
| EventObjects | filteri | Svaki objekat koji događaj navodi (`Message|a01|b02|...`), po id-u. |
| RecordingInfo | | Sopstvena svojstva snimka onakva kakva su bila u tom trenutku: DataSource, DataRecorder, Author, Category, Briefing, Comments, ... kao JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filteri | Svako drugo numeričko svojstvo koje snimak nosi. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filteri | Svako drugo tekstualno svojstvo koje snimak nosi; svojstvo čija vrijednost nije broj je tekst. |

Čitaju se sva četiri oblika Tacviewove pozicije (`lon|lat|alt`, sa `u|v`, sa `roll|pitch|yaw`, i sa svim tim plus smjerom), a prazna polja zadržavaju zadnju vrijednost; `-id` uklanja objekat, a id koji se ponovo upotrijebi poslije toga je novi objekat. Obrađuju se escape-ovani zarezi i nastavljeni redovi.

Pozicije se uvijek projektuju iz geografske širine i dužine, nikad se ne uzimaju iz U/V, pa snimci iz svih igara dijele jednu projekciju sa pozadinom pravog svijeta.

## DCS serveri: ko je pobijedio i kako je završio svaki borbeni let {#dcs-servers-who-won-and-how-each-sortie-ended}

DCS server za više igrača snima svoje misije Tacviewom danonoćno, a trajni PvP server kroz mnoge od njih vodi kampanju: strana pobjeđuje kada zauzme svaki aerodrom, FARP i zonu druge strane, a to traje danima i kroz mnogo ponovnih pokretanja misije. Snimci sadrže letove, ne kampanju: nijedna poruka ne kaže ko je šta zauzeo, aerodromi se upišu jednom na početku i ništa ne kaže ko je pobijedio. Konverter za Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) svakom redu dodaje ono što se može znati, a ono što se ne može ostavlja prazno - nikad ne nagađa.

| Kolona | Značenje |
|---|---|
| `server` | server ili kampanja, iz zaglavlja snimka (njegovi Title, Author i Comments imenuju poznate javne servere - Blue Flag, SPS Contention, Growling Sidewinder; inače Author koji nekoga imenuje); `--server Name` ga imenuje za cijeli folder. Snimak čije zaglavlje ne imenuje nijedan server - Author kao `Admin`, Title i Comments kakve ne piše nijedan poznati server - ostaje nepripisan: `server` je prazan, čak i kada je preuzet sa stranice sa snimcima nekog servera, jer ta stranica može sadržavati i misije drugih zajednica |
| `mission` | Title snimka bez verzije i mjeseca kampanje: `Operation_Example_V7.7.99` postaje `Operation Example` |
| `campaign` | krug kampanje kojem snimak pripada, po serveru, mapi i broju: `Example Server North 3`. Jedan snimak je jedna sesija (od ponovnog pokretanja do ponovnog pokretanja); krug traje kroz mnogo sesija, danima ili sedmicama |
| `round` | broj tog kruga: broj samog servera gdje ga objavljuje, inače n-ti krug viđen na tom serveru i mapi; iz datoteke krugova (dolje), bez nje prazno |
| `session` | mjesto snimka među sesijama kruga, 1, 2, ...; `sessionStart` njegov stvarni početak (Unix sekunde) |
| `heldRed`, `heldBlue` | sporna mjesta koja je svaka strana držala na početku sesije, iz ulančane datoteke krugova (dolje) |
| `won`, `matchWon` | 1 kada je strana reda (njegov Color, Red ili Blue) dobila tu kampanju, 0 kada ju je izgubila; prazno gdje nijedna datoteka krugova ne imenuje pobjednika, i u neutralnim redovima. Kampanja je istovremeno krug i meč, pa oba sadrže isto |
| `roundEndReason` | `capture` za kampanju dobijenu zauzimanjem svega |
| `won`, `matchWon` u svakoj sesiji kruga | rezultat kruga, upisan u svaki njegov snimak čim je poznat njegov kraj |
| `sortie` | u redovima aviona: njegov let, 1, 2, ... od polijetanja do polijetanja; vrijeme na tlu prije prvog polijetanja i nakon slijetanja računa se u let kojem pripada |
| `sortieResult` | kako je taj let završio: `landed`, `landed damaged` (nakon pogotka u zraku), `ejected`, `shot down`, `destroyed` (na tlu), `crashed`, `despawned` (nestao u zraku bez vidljivog uzroka - igrač je otišao), `airborne at end`, `no takeoff` |
| `sortieKills` | obaranja pripisana avionu u tom letu |

Na trajnom serveru borbeni let je jedinica koja nešto znači: filtrirajte po `sortieResult` = `shot down` da vidite gdje su letovi izgubljeni, ili raščlanite toplotu po `sortieResult` ili `server` u [raščlambi](breakdown.md). Polijetanja, slijetanja, katapultiranja, obaranja i padovi od kojih se sastoji su događaji koje konverter izvodi iz kretanja aviona (gore).

Mjesta zauzeta između dvije sesije kruga - poznata iz datoteke krugova, dolje - su događaji `capture` na početku kasnijeg snimka: `Object` `(campaign)`, na tom mjestu, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Aerodrom ili FARP koji promijeni stranu tamo gdje to snimak pokazuje - ponovo upisan u drugoj boji, ili uklonjen i u roku od pet minuta ponovo upisan na svom mjestu u drugoj boji - postaje događaj `capture` na pisti: `Event` = `capture`, `Airfield` njeno ime, `Detail` `Red to Blue`, `Coalition` njena nova strana. Pista prvi put upisana u nekoj boji nije zauzimanje. Serveri koje smo dosad pogledali upisuju svoje piste jednom, pa njihovi snimci ne sadrže zauzimanja.

### Datoteke krugova {#rounds-files}

Datoteka krugova za svaki server kaže njegove krugove kampanje, ko ih je dobio i sesije svakog od njih. Dolazi iz onoga što server objavljuje, ili iz samih snimaka (dolje).

Ko je dobio kampanju objavljuje server - dnevnik kampanje na svojoj web stranici -, to nije u snimku. To nosi datoteka krugova, a konverter je čita sa `--rounds file.json` (može ih se zadati više):

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

Snimak pripada krugovima svog `server` čiji se `title` (regularni izraz) poklapa s njegovim Title; svaki red krugu u koji pada njegovo stvarno vrijeme - RecordingTime snimka plus sekunde reda, ne datum misije u igri. Vremena su u UTC-u. Krug bez pobjednika (zamijenjen, još traje) svojim redovima daje broj kruga i prazan rezultat.

Pandan dokumenta meča, podnožje `acmi`, kaže odakle dolazi rezultat, kao što to radi `result.source` meča u War Thunderu: `outcome.result` je `{ winner, round, endReason, source }`, `source` je `source` datoteke krugova, ili `null` kada ništa nije imenovalo pobjednika. `outcome` navodi i krugove snimka, njegova zauzimanja i njegove borbene letove po tome kako su završili:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Red pilota `Viper 1 (F-16C_50) #a01` na plavoj strani u toj kampanji tada glasi: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Krugovi iz samih snimaka {#rounds-from-the-recordings-themselves}

Trajni server čuva svoju kampanju kroz ponovna pokretanja, i svaki snimak počinje s kopnenim jedinicama i statičnim objektima obje strane tamo gdje ih je kampanja ostavila. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` čita prve minute svakog snimka ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), slaže snimke svakog servera s jedne mape vremenskim redom i ulančava ih:

- **Mjesta**: tlo u ćelijama od oko 2 km; ćelija pripada strani kada su tri četvrtine jedinica koje su tamo na početku sesije njene. *Sporna* mjesta su ona koja su viđena u rukama obje strane.
- **Zauzimanja**: mjesto koje na početku sljedeće sesije drži druga strana - zauzeto između misija ili tokom one ranije.
- **Novi krug**: sesija čija se mjesta od mjesta prethodne razlikuju u više od 60 % - početni raspored novog kruga, ne korak starog. Krug završava i kada server pređe na drugu mapu (njene sesije počinju nakon posljednje i nastavljaju se).
- **Ko je pobijedio**: kod kruga koji je završio, strana koja je držala svako mjesto na početku njegove posljednje sesije (`capture`, pouzdanost visoka), inače strana koja je držala više spornih mjesta (srednja kada ih ima dvostruko više od druge strane, inače niska; niska kada je završio promjenom mape). Otvoreni krug nema pobjednika, ali svaka sesija kaže koliko je mjesta svaka strana držala na njenom početku, pa se vidi ko je bio u vodstvu.
- Server čije sve sesije počinju jednako ne čuva stanje između njih: ne ulančava se.

Početak posljednje sesije može biti satima prije kraja kruga, pa je pouzdanost važna. Provjereno na serveru koji objavljuje svoje pobjednike: lanac je pronašao svaki novi krug u sesiji u kojoj je počeo objavljeni krug, a strana u vodstvu na posljednjem početku bila je objavljeni pobjednik u svakom od 9 krugova koje je mogao provjeriti. `--official file.json` zadržava objavljene krugove takvog servera i dodaje im sesije iz lanca; `validation` u datoteci kaže koliko se lanac slagao. U izmišljenoj kampanji:

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

Učitajte snimke jednog kruga zajedno - datoteke s istim `campaign` - i prikazivač ih reproducira kao jednu seriju: sesiju za sesijom njihovim stvarnim redom, a sate ili dane između dvije skraćuje na pauzu od jedne minute. Vremenska linija označava početak svake sesije žutom bojom, a pauze kao tamne trake, a sat kaže koja se sesija reproducira i njen stvarni datum (`session 4/12 · 2026-11-02 12:38 UTC`). Toplota, replay, filteri i Uvidi rade na cijeloj seriji kao na svim učitanim podacima. Odjeljak **Krug kampanje** na kartici Meč navodi sesije s njihovim datumima, koliko je spornih mjesta svaka strana držala na svakom početku - i kao grafikon kroz krug - i koliko ih je zauzeto prije njega; klik vodi na početak sesije. Snimak učitan sam tamo kaže koji je to krug i koja sesija. Snimci različitih krugova učitani zajedno nisu serija: svaki počinje od nule, kao zasebni mečevi. Učitavač mnogo mečeva (**Mnogo mečeva odjednom**) također reproducira krug kao seriju, strimovano i prilagođeno GPU-u, za krugove od mnogo gigabajta.

Mjesta koja su tokom kruga promijenila vlasnika crtaju se na mapi kao zone zauzimanja, obojene prema strani koja je svako držala na početku sesije koja se reproducira, i mijenjaju se na granicama sesija; svaka promjena je zauzimanje na listi događaja replaya. Izvode se iz učitanih redova - kopnenih jedinica i statičnih objekata svake sesije u njenim prvim minutama, u ćelijama od oko 2 km, kao što to radi lanac -, pa im treba puni učitavač (učitavač mnogo mečeva zadržava premalo od svakog reda).

**Učitavanje cijelog kruga iz jednog od njegovih snimaka.** U običnom web pregledniku prikazivač ne može otvoriti datoteke koje niste izabrali: učitajte datoteke kruga zajedno. Kada ga poslužuje lokalni server prikazivača (`npm run dev` ili `npm run preview`), može: datoteci `tools/local-data.json`, koju git ignoriše, dodajte unos `campaigns` koji imenuje folder s datotekama krugova i foldere s konvertovanim snimcima, i odjeljak Krug kampanje pojedinačnog snimka nudi **Učitaj cijeli krug**, preuzima sesije kruga koje tamo pronađe i učitava ih učitavačem mnogo mečeva:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Poslužuju se samo snimci koje imenuje datoteka krugova (`tools/campaign-files.mjs`); sesija koja nije pronađena u tim folderima se broji, ne učitava.

Šta objavljuju poznati serveri:

| Server | Krug | Kako strana pobjeđuje | Gdje se može pročitati pobjednik |
|---|---|---|---|
| SPS Contention | kampanja na jednoj mapi i u jednom razdoblju (danima), kroz mnogo ponovnih pokretanja | zauzet svaki aerodrom, FARP i uporište; kampanja završena bez pobjednika bila je zamijenjena | javni dnevnik kampanja servera (pobjednik, početak i kraj svake kampanje) |
| Blue Flag | krug kampanje kroz mnogo misija od 5 sati; `_YYYY_MM` u Title napreduje za jedan mjesec pri svakom ponovnom pokretanju | zauzet svaki neprijateljski položaj; stariji krugovi proglašavali su stranu koja je nakon zadanog vremena držala više | dosad nije pronađeno u objavljenom obliku; lanac snimaka prati svaki krug i ko koliko drži na svakom početku |
| Growling Sidewinder | izvođenje misije (6 sati) misije otvorenog sukoba | zauzete zone i aerodromi | njegova stranica sa statistikom prikazuje pilote, ne rezultate; svaka sesija počinje jednako, pa nijedan krug ne obuhvata više sesija: prazno |
| Misije protiv AI-ja (misije zauzimanja zona) | izvođenje misije | strana igrača protiv AI-ja misije: nema PvP rezultata | prazno |
| Nepripisano (zaglavlje ne imenuje nijedan server) | - | - | prazno, i `server` je prazan |

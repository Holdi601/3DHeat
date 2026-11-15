---
title: "Tacview salvestised (ACMI)"
parent: "Andmete sisselugemine"
nav_order: 7
lang: "et"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview salvestised (ACMI)

Tacview on programm, mis salvestab lende lennusimulaatorites. Selle failid lõpevad `.acmi`-ga. 3DHeat avab need, et sa näeksid, kus iga lennuk lendas.

Tacview lennusalvestised laaditakse nagu iga tabel: vali või lohista `.acmi` (tekst, `.txt.acmi` või zipitud, `.zip.acmi`) ja vajuta **Laadi**. Saad siis kõigi lendude soojuse ning vahekaardil **Matš** kordusvaate koos kujude, radade ja sündmuste loendiga ([Matši kordus](match-replay.md)). ACMI on Tacview avalik failivorming ([dokumentatsioon](https://www.tacview.net/documentation/acmi/)). DCS (Tacview eksportija kaudu), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS ja teised kirjutavad seda, seega loetakse neist igaüht.

## Mis saab salvestisest {#what-a-recording-becomes}

Üks rida iga kord, kui objekti asukoht kirjutatakse. Üks rida iga sündmuse kohta objekti asukohas. Üks rida, kui objekt lahkub (`Removed`, kus ta viimati oli). Sündmus objektist, mida pole veel nähtud, näiteks järjehoidja või sõnum kõigile, on rida objektiga `(recording)` vastuspunktis. Salvestisel on oma lugemisjuhised, nii et kaardistamise samm täidab end ise. Lugeja kirjutab need veerud: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, ning seejärel kõik muud salvestise omadused. Nende rollid:

| Veerg | Roll | Tähendus |
|---|---|---|
| Time | aeg | Sekundid pärast salvestise ReferenceTime'i; Unixi sekundid, kui see on olemas, nii et kell näitab päris aega. |
| X, Y | asukoht | Ida ja põhi meetrites tasapinnal, mis puudutab maakera salvestise vastuspunktis: kaugused ja suunad on selle lähedal õiged, kuid 100 km juures triivivad alla tuhandiku. Põhi muutub maailma -Z-ks. |
| Altitude | asukoht (üles) | Meetrites. |
| Object | isik | Piloot ja objekti nimi koos ID-ga, näiteks `Viper 1 (F-16C_50) #a01`; juhita objekt `(T-90A) #401`. |
| Coalition | meeskond | Pool (või värv, kui koalitsiooni pole). |
| Heading, Pitch | vaade | Kraadides; suund 0 on põhi. |
| Recording | seanss | Salvestise Title või failinimi: mitu salvestist laaditakse kõrvuti, ilma et nende rajad ühineksid. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtrid | Alles hoitud filtreerimiseks. Type ja Name valivad iga objekti [kuju](figures.md), Event toidab ülevaate sündmuste loendit ja Roll kallutab lennuki. |
| U, V | | Mängu enda tasase maailma meetrid, kui igal proovil need on (DCS kirjutab need). |
| EventObjects | filtrid | Iga objekt, mida sündmus nimetab (`Message|a01|b02|...`), ID järgi. |
| RecordingInfo | | Salvestise enda omadused sellel hetkel, nagu need olid (DataSource, DataRecorder, Author, Category, Briefing, Comments, ...), JSON-ina. |
| IAS, Mach, AOA, FuelWeight, ... | filtrid | Mis tahes muu arvuline omadus, mida salvestis kannab. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtrid | Mis tahes muu tekstiline omadus, mida salvestis kannab. Omadus, mille väärtus pole arv, on tekst. |

Tacview asukoha kõik neli vormi (`lon|lat|alt`, `u|v`-ga, `roll|pitch|yaw`-ga ja kõigi nendega koos suunaga) loetakse. Tühjad väljad jätavad viimase väärtuse. `-id` eemaldab objekti, ja ID, mida kasutatakse pärast seda uuesti, on uus objekt. Märgitud komad ja jätkuvad read on käsitletud.

Asukohad projitseeritakse alati laiuskraadist ja pikkuskraadist, mitte U/V-st. Nii jagavad kõigi mängude salvestised ühte projektsiooni koos päris maailma taustaga.

## DCS-serverid: kes võitis ja kuidas iga lend lõppes {#dcs-servers-who-won-and-how-each-sortie-ended}

DCS-i mitmikmänguserver salvestab oma missioone Tacview'ga ööpäev läbi ja püsiv PvP-server peab kampaaniat paljude missioonide jooksul: pool võidab, kui vallutab teise poole kõik lennuväljad, FARP-id ja tsoonid, mis võtab päevi ja palju missiooni taaskäivitusi. Salvestistes on lennud, mitte kampaania: ükski sõnum ei ütle, kes mida vallutas, lennuväljad kirjutatakse alguses üks kord ja miski ei ütle, kes võitis. Tacview konverter (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) lisab igale reale selle, mida saab teada, ja jätab tühjaks selle, mida ei saa - see ei arva kunagi.

| Veerg | Tähendus |
|---|---|
| `server` | server või kampaania salvestise päisest (selle Title, Author ja Comments nimetavad teadaolevaid avalikke servereid - Blue Flag, SPS Contention, Growling Sidewinder; muidu Author, mis nimetab kedagi); `--server Name` annab nime tervele kaustale. Salvestis, mille päis ei nimeta ühtki serverit - Author nagu `Admin`, Title ja Comments, mida ükski teadaolev server ei kirjuta - jääb omistamata: `server` on tühi ka siis, kui see laaditi alla serveri salvestiste lehelt, sest lehel võib olla ka teiste kogukondade missioone |
| `mission` | salvestise Title ilma versiooni ja kampaania kuuta: `Operation_Example_V7.7.99` muutub kujule `Operation Example` |
| `campaign` | kampaaniavoor, kuhu salvestis kuulub, serveri, kaardi ja numbri järgi: `Example Server North 3`. Üks salvestis on üks seanss (taaskäivitusest taaskäivituseni); voor kestab palju seansse, päevi või nädalaid |
| `round` | vooru number: serveri enda oma, kui see seda avaldab, muidu sellel serveril ja kaardil nähtud n-is voor; voorude failist (allpool), ilma selleta tühi |
| `session` | salvestise koht vooru seansside seas, 1, 2, ...; `sessionStart` selle tegelik algus (Unixi sekundites) |
| `heldRed`, `heldBlue` | vaidlusalused kohad, mida kumbki pool seansi alguses hoidis, aheldatud voorude failist (allpool) |
| `won`, `matchWon` | 1, kui rea pool (selle Color, Red või Blue) võitis kampaania, 0, kui kaotas; tühi, kui ükski voorude fail võitjat ei nimeta, ja neutraalsetel ridadel. Kampaania on korraga nii voor kui ka matš, nii et mõlemal on sama väärtus |
| `roundEndReason` | `capture` kampaania puhul, mis võideti kõige vallutamisega |
| `won`, `matchWon` vooru igal seansil | vooru tulemus, kirjutatud selle igale salvestisele, kui selle lõpp on teada |
| `sortie` | lennuki ridadel: selle lend, 1, 2, ... õhkutõusust õhkutõusuni; maa peal veedetud aeg enne esimest õhkutõusu ja pärast maandumist arvestatakse lennu juurde, kuhu see kuulub |
| `sortieResult` | kuidas lend lõppes: `landed`, `landed damaged` (pärast tabamust õhus), `ejected`, `shot down`, `destroyed` (maa peal), `crashed`, `despawned` (kadus õhus nähtava põhjuseta - mängija lahkus), `airborne at end`, `no takeoff` |
| `sortieKills` | lennukile selles lennus arvestatud hävitamised |

Püsival serveril on lend see üksus, millel on tähendus: filtreeri `sortieResult` = `shot down`, et näha, kus lende kaotati, või jaota soojus `sortieResult`'i või `server`'i järgi [jaotuses](breakdown.md). Õhkutõusud, maandumised, katapulteerumised, hävitamised ja allakukkumised, millest see koosneb, on sündmused, mille konverter tuletab lennukite liikumisest (eespool).

Kohad, mis vallutati vooru kahe seansi vahel - teada voorude failist, allpool -, on `capture`-sündmused hilisema salvestise alguses: `Object` `(campaign)`, koha juures, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Lennuväli või FARP, mis vahetab poolt seal, kus salvestis seda näitab - kirjutatakse uuesti teise värviga või eemaldatakse ja kirjutatakse viie minuti jooksul samasse kohta uuesti teise värviga -, muutub platsi juures `capture`-sündmuseks: `Event` = `capture`, `Airfield` selle nimi, `Detail` `Red to Blue`, `Coalition` selle uus pool. Plats, mis kirjutatakse esimest korda mingis värvis, ei ole vallutus. Seni vaadatud serverid kirjutavad oma platsid üks kord, nii et nende salvestistes vallutusi pole.

### Voorude failid {#rounds-files}

Voorude fail ütleb iga serveri kohta selle kampaaniavoorud, kes need võitis ja iga vooru seansid. See pärineb sellest, mida server avaldab, või salvestistest endist (allpool).

Kes kampaania võitis, on see, mida server avaldab - kampaanialogi oma veebilehel -, mitte miski salvestises. Voorude fail kannab seda ja konverter loeb selle võtmega `--rounds file.json` (neid võib anda mitu):

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

Salvestis kuulub oma `server`'i nende voorude juurde, mille `title` (regulaaravaldis) sobib selle Title'iga; iga rida kuulub vooru, millesse selle tegelik aeg langeb - salvestise RecordingTime pluss rea sekundid, mitte missiooni mängusisene kuupäev. Ajad on UTC-s. Võitjata voor (vahetatud, alles käib) annab oma ridadele vooru numbri ja tühja tulemuse.

Matšidokumendi vaste, `acmi` jalus, ütleb, kust tulemus pärineb, nagu War Thunderi matši `result.source`: `outcome.result` on `{ winner, round, endReason, source }`, `source` on voorude faili `source` või `null`, kui miski võitjat ei nimetanud. `outcome` loetleb ka salvestise voorud, selle vallutused ja selle lennud selle järgi, kuidas need lõppesid:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Piloodi `Viper 1 (F-16C_50) #a01` rida Blue poolel selles kampaanias on siis: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Voorud salvestistest endist {#rounds-from-the-recordings-themselves}

Püsiv server hoiab oma kampaaniat taaskäivituste üle ja iga salvestis algab mõlema poole maaüksuste ja staatiliste objektidega seal, kuhu kampaania need jättis. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` loeb iga salvestise esimesed minutid ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), paneb iga serveri ühe kaardi salvestised ajajärjekorda ja aheldab need:

- **Kohad**: maapind umbes 2 km lahtrites; lahter kuulub poolele, kui kolm neljandikku seal seansi alguses olevatest üksustest on selle omad. *Vaidlusalused* kohad on need, mida on nähtud mõlema poole käes.
- **Vallutused**: koht, mida teine pool hoiab järgmise seansi alguses - vallutatud missioonide vahel või varasema ajal.
- **Uus voor**: seanss, mille kohad erinevad eelmise omadest rohkem kui 60 %-s - uue vooru algseis, mitte vana vooru samm. Voor lõpeb ka siis, kui server läheb üle teisele kaardile (selle seansid algavad pärast viimast ja jätkuvad).
- **Kes võitis**: lõppenud voorus pool, kes hoidis selle viimase seansi alguses kõiki kohti (`capture`, kõrge kindlus), muidu pool, kes hoidis rohkem vaidlusaluseid kohti (keskmine, kui teise poole omast kaks korda rohkem, muidu madal; madal, kui voor lõppes kaardivahetusega). Avatud vooril võitjat pole, kuid iga seanss ütleb, mitu kohta kumbki pool selle alguses hoidis, nii et on näha, kes oli ees.
- Server, mille seansid algavad kõik ühtmoodi, ei hoia nende vahel olekut: seda ei aheldata.

Viimase seansi algus võib olla tunde enne vooru lõppu, nii et kindlus on oluline. Kontrollitud serveri vastu, mis avaldab oma võitjad: ahel leidis iga uue vooru sellest seansist, kus avaldatud voor algas, ja viimases alguses ees olnud pool oli avaldatud võitja kõigis 9 voorus, mida see sai kontrollida. `--official file.json` jätab sellise serveri avaldatud voorud alles ja lisab neile ahela seansid; faili `validation` ütleb, kui kaugele ahel nõustus. Väljamõeldud kampaanias:

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

### Kampaaniavooru vaatamine seeriana {#watching-a-campaign-round-as-a-series}

Laadi ühe vooru salvestised koos - failid, mille `campaign` on sama - ja vaataja esitab need ühe seeriana: seanss seansi järel nende tegelikus järjekorras, kahe vahele jäävad tunnid või päevad lühendatud üheminutiliseks pausiks. Ajaskaala märgib iga seansi alguse kollasega ja pausid tumedate ribadena ning kell ütleb, millist seanssi esitatakse, ja selle tegeliku kuupäeva (`session 4/12 · 2026-11-02 12:38 UTC`). Soojus, taasesitus, filtrid ja Tähelepanekud töötavad kogu seerial nagu mis tahes laaditud andmetel. Vahekaardi Matš jaotis **Kampaaniavoor** loetleb seansid koos kuupäevadega, mitu vaidlusalust kohta kumbki pool iga alguse ajal hoidis - ka diagrammina üle vooru - ja mitu vallutati enne seda; klõps viib seansi algusse. Üksi laaditud salvestis ütleb seal, mis voor ja seanss see on. Eri voorude salvestised, mis on koos laaditud, ei ole seeria: igaüks algab nullist, nagu eraldi matšid. Paljude mängude laadija (**Palju mänge korraga**) esitab vooru samuti seeriana, voogesitatuna ja GPU järgi mõõdetuna, mitme gigabaidi suuruste voorude jaoks.

Kohad, mis vooru jooksul omanikku vahetasid, joonistatakse kaardile vallutustsoonidena, värvitud selle poole järgi, kes hoidis igaüht esitatava seansi alguses, ja need vahetuvad seansside piiridel; iga vahetus on vallutus taasesituse sündmuste loendis. Need tuletatakse laaditud ridadest - iga seansi maaüksustest ja staatilistest objektidest selle esimestel minutitel, umbes 2 km lahtrites, nagu ahel teeb -, nii et need vajavad täislaadijat (paljude mängude laadija hoiab igast reast liiga vähe).

**Kogu vooru laadimine ühest selle salvestisest.** Tavalises brauseris ei saa vaataja avada faile, mida sa ei valinud: laadi vooru failid koos. Kui seda serveerib kohalik vaataja server (`npm run dev` või `npm run preview`), saab: lisa git'i eiratud `tools/local-data.json`-ile `campaigns`-kirje, mis nimetab voorude failide kausta ja teisendatud salvestiste kaustad, ning ühe salvestise jaotis Kampaaniavoor pakub nuppu **Laadi kogu voor**, toob sealt leitud vooru seansid ja laadib need paljude mängude laadijaga:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Serveeritakse ainult salvestisi, mida voorude fail nimetab (`tools/campaign-files.mjs`); seanss, mida nendest kaustadest ei leita, loendatakse, kuid ei laadita.

Mida teadaolevad serverid avaldavad:

| Server | Voor | Kuidas pool võidab | Kust võitja leida |
|---|---|---|---|
| SPS Contention | kampaania ühel kaardil ja ühes ajastus (päevi), paljude taaskäivituste jooksul | kõik lennuväljad, FARP-id ja tugipunktid vallutatud; võitjata lõppenud kampaania vahetati välja | serveri avalik kampaanialogi (võitja, algus ja lõpp iga kampaania kohta) |
| Blue Flag | kampaaniavoor paljude 5-tunniste missioonide jooksul; Title'i `_YYYY_MM` liigub iga taaskäivitusega kuu võrra edasi | kõik vaenlase positsioonid vallutatud; vanemates voorudes nimetati võitjaks pool, kes hoidis kindla aja möödudes rohkem | pole seni leitud kujul avaldatud; salvestiste ahel jälgib iga vooru ja seda, kes hoiab iga alguse ajal kui palju |
| Growling Sidewinder | avatud konflikti missiooni käik (6 tundi) | tsoonid ja lennuväljad vallutatud | selle statistikaleht näitab piloote, mitte tulemusi; iga seanss algab ühtmoodi, nii et ükski voor ei ulatu üle mitme seansi: tühi |
| Missioonid tehisintellekti vastu (tsoonide vallutamise missioonid) | missiooni käik | mängijate pool missiooni tehisintellekti vastu: PvP tulemust pole | tühi |
| Omistamata (päis ei nimeta serverit) | - | - | tühi, ka `server` tühi |

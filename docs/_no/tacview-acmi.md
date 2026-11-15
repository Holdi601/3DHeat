---
title: "Tacview-opptak (ACMI)"
parent: "Få inn data"
nav_order: 7
lang: "no"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview-opptak (ACMI)

Tacview er et program som tar opp flyvninger i flysimulatorer; filene slutter på `.acmi`. 3DHeat åpner dem slik at du kan se hvor hvert fly fløy.

Tacviews flyopptak lastes som en hvilken som helst tabell: velg eller slipp en `.acmi` (tekst, `.txt.acmi`, eller zippet, `.zip.acmi`) og trykk **Last inn**. Du får da varmen fra alle flyvningene, og i fanen **Kamp** en avspilling med figurer, spor og en hendelsesliste ([Kampreplay](match-replay.md)). ACMI er Tacviews offentlige filformat ([dokumentasjon](https://www.tacview.net/documentation/acmi/)). DCS (gjennom Tacviews eksportør), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS og andre skriver det, så dette leser alle dem.

## Hva et opptak blir {#what-a-recording-becomes}

Én rad hver gang et objekts posisjon skrives, én rad per hendelse på objektets sted, og én rad når et objekt forlater (`Removed`, der det sist var). En hendelse om et objekt som ikke er sett ennå (en bokmerke, en melding til alle) er en rad for objektet `(recording)` i referansepunktet. Opptaket bærer sine egne leseinstruksjoner, så kartleggingstrinnet fylles ut selv. Leseren skriver disse kolonnene: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, og deretter alle andre egenskaper opptaket har. Deres roller:

| Kolonne | Rolle | Betydning |
|---|---|---|
| Time | tid | Sekunder etter opptakets ReferenceTime; Unix-sekunder når det har en, så klokken viser riktig tid. |
| X, Y | posisjon | Øst og nord, meter, på et plan som tangerer jorden i opptakets referansepunkt: avstander og peilinger er riktige nær det, og driver under én tusendel ved 100 km. Nord blir verdens -Z. |
| Altitude | posisjon (opp) | Meter. |
| Object | person | Piloten og objektets navn med id, f.eks. `Viper 1 (F-16C_50) #a01`; et ubemannet objekt `(T-90A) #401`. |
| Coalition | lag | Siden (eller fargen, når det ikke finnes noen koalisjon). |
| Heading, Pitch | blikk | Grader; kurs 0 er nord. |
| Recording | økt | Opptakets Title, eller filnavnet: flere opptak lastes side om side uten at sporene går sammen. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtre | Beholdt for filtrering; Type og Name velger hvert objekts [figur](figures.md), Event mater hendelseslisten i etterbehandlingen, Roll krenger flyet. |
| U, V | | Spillets egne flate verdensmeter, når alle prøver har dem (DCS skriver dem). |
| EventObjects | filtre | Alle objekter en hendelse nevner (`Message|a01|b02|...`), etter id. |
| RecordingInfo | | Opptakets egne egenskaper slik de sto på det øyeblikket - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - som JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtre | Enhver annen numerisk egenskap opptaket har. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtre | Enhver annen tekstegenskap opptaket har; en egenskap med en verdi som ikke er et tall, er tekst. |

Alle fire formene for Tacviews posisjon (`lon|lat|alt`, med `u|v`, med `roll|pitch|yaw`, og med alle disse og en kurs) leses, og tomme felt beholder den siste verdien. `-id` fjerner et objekt, og en id som brukes igjen etter det, er et nytt objekt. Escapede komma og fortsatte linjer håndteres.

Posisjonene projiseres alltid fra breddegrad og lengdegrad, aldri hentet fra U/V. Dermed deler opptak fra alle spill én projeksjon, med en bakgrunn av den virkelige verden.

## DCS-servere: hvem som vant, og hvordan hver flyging endte {#dcs-servers-who-won-and-how-each-sortie-ended}

En DCS-flerspillerserver tar opp oppdragene sine med Tacview døgnet rundt, og en vedvarende PvP-server kjører en kampanje over mange av dem: en side vinner ved å ta alle flyplassene, FARP-ene og sonene til den andre siden, noe som tar dager og mange omstarter av oppdraget. Opptakene inneholder flygingene, ikke kampanjen: ingen melding sier hvem som tok hva, flyplassene skrives én gang ved starten, og ingenting sier hvem som vant. Tacview-konverteren (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) legger til det som kan vites på hver rad, og lar det som ikke kan vites stå tomt - den gjetter aldri.

| Kolonne | Betydning |
|---|---|
| `server` | serveren eller kampanjen, fra opptakets header (dens Title, Author og Comments nevner de kjente offentlige serverne - Blue Flag, SPS Contention, Growling Sidewinder; ellers en Author som nevner noen); `--server Name` gir den et navn for en hel mappe. Et opptak der headeren ikke nevner noen server - en Author som `Admin`, en Title og Comments som ingen kjent server skriver - forblir uten tilknytning: `server` tom, også når det ble lastet ned fra en servers opptaksside, siden siden også kan inneholde andre fellesskaps oppdrag |
| `mission` | opptakets Title uten versjon eller kampanjemåned: `Operation_Example_V7.7.99` blir `Operation Example` |
| `campaign` | kampanjerunden opptaket hører til, etter server, kart og nummer: `Example Server North 3`. Ett opptak er én økt (fra omstart til omstart); en runde går over mange økter, dager eller uker |
| `round` | rundens nummer: serverens eget der den publiserer et, ellers den n-te runden sett fra den serveren og det kartet; fra en rundefil (nedenfor), tom uten en |
| `session` | opptakets plass blant rundens økter, 1, 2, ...; `sessionStart` dens virkelige start (Unix-sekunder) |
| `heldRed`, `heldBlue` | de omstridte stedene hver side holdt ved øktens start, fra en kjedet rundefil (nedenfor) |
| `won`, `matchWon` | 1 når radens side (dens Color, Red eller Blue) vant kampanjen, 0 når den tapte; tom der ingen rundefil nevner en vinner, og på nøytrale rader. En kampanje er både runden og kampen, så begge har samme verdi |
| `roundEndReason` | `capture` for en kampanje som ble vunnet ved å ta alt |
| `won`, `matchWon` på hver økt i en runde | rundens resultat, skrevet på hvert opptak av den når slutten er kjent |
| `sortie` | på et flys rader: flygingen, 1, 2, ... fra avgang til avgang; tiden på bakken før første avgang og etter en landing teller med til flygingen den hører til |
| `sortieResult` | hvordan flygingen endte: `landed`, `landed damaged` (etter et treff i lufta), `ejected`, `shot down`, `destroyed` (på bakken), `crashed`, `despawned` (borte i lufta uten synlig årsak - en spiller som forlater), `airborne at end`, `no takeoff` |
| `sortieKills` | nedskytingene flyet ble kreditert for i den flygingen |

På en vedvarende server er flygingen enheten som betyr noe: filtrer på `sortieResult` = `shot down` for å se hvor flyginger gikk tapt, eller del opp varmen etter `sortieResult` eller `server` i [oppdelingen](breakdown.md). Avgangene, landingene, utskytingene, nedskytingene og styrtene den består av, er hendelsene konverteren regner ut fra hvordan flyene beveger seg (over).

Steder som ble tatt mellom to økter i en runde - kjent fra rundefilen, nedenfor - er `capture`-hendelser ved starten av det senere opptaket: `Object` `(campaign)`, ved stedet, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

En flyplass eller FARP som bytter side der opptaket viser det - skrevet på nytt i den andre fargen, eller fjernet og skrevet på nytt på sin plass i den andre innen fem minutter - blir en `capture`-hendelse ved plassen: `Event` = `capture`, `Airfield` navnet, `Detail` `Red to Blue`, `Coalition` den nye siden. En plass som først skrives i en farge, er ingen erobring. Serverne som er undersøkt så langt, skriver plassene sine én gang, så opptakene deres inneholder ingen erobringer.

### Rundefiler {#rounds-files}

En rundefil sier for hver server hvilke kampanjerunder den har, hvem som vant dem og hver rundes økter. Den kommer fra det serveren publiserer, eller fra selve opptakene (nedenfor).

Hvem som vant en kampanje, er det serveren publiserer - en kampanjelogg på nettsiden dens - ikke noe i opptaket. En rundefil bærer det, og konverteren leser den med `--rounds file.json` (flere kan oppgis):

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

Et opptak hører til rundene under dens `server` der `title` (et regulært uttrykk) passer med opptakets Title; hver rad til runden dens virkelige tid faller i - opptakets RecordingTime pluss radens sekunder, ikke oppdragets dato i spillet. Tider er i UTC. En runde uten vinner (rotert, kjører fortsatt) gir radene sine rundenummeret og et tomt resultat.

Kampdokumentets motstykke, `acmi`-bunnteksten, sier hvor resultatet kom fra, slik en War Thunder-kamps `result.source` gjør: `outcome.result` er `{ winner, round, endReason, source }`, `source` rundefilens `source`, eller `null` når ingenting nevnte en vinner. `outcome` viser også opptakets runder, erobringene og flygingene etter hvordan de endte:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

En rad for en pilot `Viper 1 (F-16C_50) #a01` på Blue-siden i den kampanjen lyder da: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Runder fra selve opptakene {#rounds-from-the-recordings-themselves}

En vedvarende server beholder kampanjen sin på tvers av omstarter, og hvert opptak begynner med begge siders bakkeenheter og statiske objekter der kampanjen etterlot dem. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` leser de første minuttene av hvert opptak ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), setter hver servers opptak av ett kart i tidsrekkefølge og kjeder dem sammen:

- **Steder**: bakken i celler på omtrent 2 km; en celle tilhører en side når tre fjerdedeler av enhetene der ved starten av en økt er dens. *Omstridte* steder er de som er sett holdt av begge sider.
- **Erobringer**: et sted som den andre siden holder ved starten av neste økt - tatt mellom oppdragene eller under det forrige.
- **En ny runde**: en økt der stedene skiller seg fra den forriges i mer enn 60 % av dem - startoppstillingen for en ny runde, ikke et steg i den gamle. En runde slutter også når serveren går over til et annet kart (øktene der begynner etter den siste og fortsetter).
- **Hvem som vant**: i en runde som sluttet, siden som holdt alle steder ved starten av den siste økten (`capture`, høy sikkerhet), ellers siden som holdt flest av de omstridte stedene (middels ved dobbelt så mange som den andre, ellers lav; lav når den sluttet med et kartbytte). En åpen runde har ingen vinner, men hver økt sier hvor mange steder hver side holdt ved starten, så det vises hvem som lå foran.
- En server der alle økter begynner likt, beholder ingen tilstand mellom dem: den kjedes ikke.

Starten på den siste økten kan ligge timer før rundens slutt, så sikkerheten betyr noe. Kontrollert mot en server som publiserer vinnerne sine: kjeden fant hver ny runde ved økten der den publiserte runden begynte, og siden som lå foran ved den siste starten, var den publiserte vinneren i hver av de 9 rundene den kunne kontrollere. `--official file.json` beholder en slik servers publiserte runder og legger kjedens økter til dem; filens `validation` sier hvor langt kjeden var enig. I en oppdiktet kampanje:

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

### Se en kampanjerunde som en serie {#watching-a-campaign-round-as-a-series}

Last inn opptakene fra én runde sammen - filene med samme `campaign` - så spiller visningsprogrammet dem av som én serie: økt etter økt i den virkelige rekkefølgen, med timene eller dagene mellom to kuttet ned til en pause på ett minutt. Tidslinjen markerer starten på hver økt i gult og pausene som mørke bånd, og klokka sier hvilken økt som spilles og dens virkelige dato (`session 4/12 · 2026-11-02 12:38 UTC`). Varme, avspillingen, filtre og Innsikter virker på hele serien som på alle innlastede data. Delen **Kampanjerunde** i fanen Kamp viser øktene med datoene deres, hvor mange omstridte steder hver side holdt ved hver start - også som et diagram over runden - og hvor mange som ble tatt før den; et klikk går til starten på en økt. Et opptak som lastes inn alene, sier der hvilken runde og økt det er. Opptak fra ulike runder som lastes inn sammen, er ingen serie: hvert starter på null, slik separate kamper gjør. Innlasteren for mange kamper (**Mange kamper samtidig**) spiller også av en runde som en serie, strømmet og tilpasset GPU-en, for runder på mange gigabyte.

Stedene som skiftet eier i løpet av runden, tegnes på kartet som erobringssoner, farget etter siden som holdt hvert av dem ved starten av økten som spilles, og de bytter ved øktgrensene; hvert bytte er en erobring i avspillingens hendelsesliste. De regnes ut fra de innlastede radene - hver økts bakkeenheter og statiske objekter i de første minuttene, i celler på omtrent 2 km, slik kjeden gjør - så de trenger den fulle innlasteren (innlasteren for mange kamper beholder for lite av hver rad).

**Laste inn hele runden fra ett av opptakene.** I en vanlig nettleser kan visningsprogrammet ikke åpne filer du ikke har valgt: last inn rundens filer sammen. Når det kjøres fra den lokale visningsserveren (`npm run dev` eller `npm run preview`), kan det: gi den git-ignorerte `tools/local-data.json` en `campaigns`-oppføring som nevner mappen med rundefiler og mappene med konverterte opptak, så tilbyr delen Kampanjerunde for et enkelt opptak **Last inn hele runden**, henter de av rundens økter som finnes der, og laster dem inn med innlasteren for mange kamper:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Bare opptakene en rundefil nevner, blir levert (`tools/campaign-files.mjs`); en økt som ikke finnes under de mappene, telles, men lastes ikke inn.

Hva de kjente serverne publiserer:

| Server | En runde | Hvordan en side vinner | Hvor vinneren kan leses |
|---|---|---|---|
| SPS Contention | en kampanje på ett kart og én æra (dager), over mange omstarter | alle flyplasser, FARP-er og støttepunkter tatt; en kampanje som sluttet uten vinner, ble rotert | serverens offentlige kampanjelogg (vinner, start, slutt for hver kampanje) |
| Blue Flag | en kampanjerunde over mange oppdrag på 5 timer; `_YYYY_MM` i Title går fram én måned per omstart | alle fiendtlige posisjoner tatt; eldre runder utpekte siden som holdt mest etter en fast tid | ikke publisert i en form som er funnet så langt; kjeden av opptakene følger hver runde og hvem som holder hvor mye ved hver start |
| Growling Sidewinder | en kjøring (6 timer) av et oppdrag med åpen konflikt | soner og flyplasser tatt | statistikksiden viser piloter, ikke resultater; hver økt begynner likt, så ingen runde går over flere økter: tom |
| Oppdrag mot AI-en (oppdrag der soner skal erobres) | en kjøring av et oppdrag | spillernes side mot oppdragets AI: ikke noe PvP-resultat | tom |
| Uten tilknytning (headeren nevner ingen server) | - | - | tom, `server` også tom |

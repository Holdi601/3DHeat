---
title: "Tacview-optagelser (ACMI)"
parent: "Indlæs data"
nav_order: 7
lang: "da"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview-optagelser (ACMI)

Tacview er et program, der optager flyvninger i flysimulatorer. Dets filer ender på `.acmi`. 3DHeat åbner dem, så du kan se, hvor hvert fly fløj.

Tacviews flyvningsoptagelser indlæses som enhver anden tabel. Vælg eller træk en `.acmi` (tekst, `.txt.acmi`, eller zippet, `.zip.acmi`), og tryk på **Indlæs**. Du får så varmen fra alle flyvninger, og i fanen **Kamp** et replay med figurer, spor og en hændelsesliste ([Kamp-replay](match-replay.md)). ACMI er Tacviews offentlige filformat ([dokumentation](https://www.tacview.net/documentation/acmi/)). DCS (gennem Tacviews eksportør), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS og andre skriver det, så det læser alle disse.

## Hvad en optagelse bliver til {#what-a-recording-becomes}

Der er en række, hver gang et objekts position skrives, en række pr. hændelse ved objektets sted og en række, når et objekt forlades (`Removed`, hvor det sidst var). En hændelse om et objekt, der endnu ikke er set (et bogmærke, en besked til alle), er en række for objektet `(recording)` i referencepunktet. Optagelsen bærer sin egen læsevejledning, så kortlægningstrinnet udfylder sig selv. Læseren skriver disse kolonner: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo` og derefter alle andre egenskaber, optagelsen har. Deres roller:

| Kolonne | Rolle | Betydning |
|---|---|---|
| Time | tid | Sekunder efter optagelsens ReferenceTime. Unix-sekunder, når den har en, så uret viser den rigtige tid. |
| X, Y | position | Øst og nord, i meter, på et plan, der rører jorden i optagelsens referencepunkt. Afstande og pejlinger er rigtige i nærheden og driver under en tusindedel ved 100 km. Nord bliver verdens -Z. |
| Altitude | position (op) | Meter. |
| Object | person | Piloten og objektets navn med dets id, fx `Viper 1 (F-16C_50) #a01`. Et ubemandet objekt får fx `(T-90A) #401`. |
| Coalition | hold | Siden (eller farven, når der ikke er nogen koalition). |
| Heading, Pitch | blik | Grader. Kurs 0 er nord. |
| Recording | session | Optagelsens Title, eller filnavnet. Flere optagelser indlæses side om side, uden at deres spor hænger sammen. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtre | Gemmes til filtrering. Type og Name vælger hvert objekts [figur](figures.md). Event går til debriefens hændelsesliste, og Roll hælder flyet. |
| U, V | | Spillets egne flade verdensmeter, når alle prøver har dem (DCS skriver dem). |
| EventObjects | filtre | Hvert objekt en hændelse nævner (`Message|a01|b02|...`), efter id. |
| RecordingInfo | | Optagelsens egne egenskaber, som de var på det tidspunkt: DataSource, DataRecorder, Author, Category, Briefing, Comments og så videre, som JSON. |
| IAS, Mach, AOA, FuelWeight og så videre | filtre | Enhver anden numerisk egenskab, optagelsen har. |
| Parent, CallSign, LockedTarget, Label, Shape og så videre | filtre | Enhver anden tekstegenskab, optagelsen har. En egenskab med en værdi, der ikke er et tal, er tekst. |

Alle fire former for Tacviews position (`lon|lat|alt`, med `u|v`, med `roll|pitch|yaw`, og med alle disse og en kurs) læses. Tomme felter beholder den sidste værdi. `-id` fjerner et objekt, og et id, der bruges igen efter det, er et nyt objekt. Escapede kommaer og fortsatte linjer håndteres.

Positionerne projiceres altid ud fra breddegrad og længdegrad og aldrig fra U/V. Optagelser fra alle spil deler derfor én projektion med en baggrund af den rigtige verden.

## DCS-servere: hvem der vandt, og hvordan hver flyvning endte {#dcs-servers-who-won-and-how-each-sortie-ended}

En DCS-multiplayerserver optager sine missioner med Tacview døgnet rundt, og en vedvarende PvP-server kører en kampagne hen over mange af dem: en side vinder ved at tage alle den anden sides flyvepladser, FARP'er og zoner, og det tager dage og mange genstarter af missionen. Optagelserne indeholder flyvningerne, ikke kampagnen: ingen besked siger, hvem der tog hvad, flyvepladserne skrives én gang ved starten, og ingen siger, hvem der vandt. Tacview-konverteren (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) tilføjer det, der kan vides, til hver række og lader det stå tomt, som ikke kan vides - den gætter aldrig.

| Kolonne | Betydning |
|---|---|
| `server` | serveren eller kampagnen, fra optagelsens header (dens Title, Author og Comments nævner de kendte offentlige servere - Blue Flag, SPS Contention, Growling Sidewinder; ellers en Author, der nævner nogen); `--server Name` navngiver den for en hel mappe. En optagelse, hvis header ikke nævner nogen server - en Author som `Admin`, en Title og Comments, som ingen kendt server skriver - forbliver uden tilknytning: `server` er tom, også når den blev hentet fra en servers optagelsesside, for siden kan også indeholde andre fællesskabers missioner |
| `mission` | optagelsens Title uden version eller kampagnemåned: `Operation_Example_V7.7.99` bliver til `Operation Example` |
| `campaign` | den kampagnerunde, optagelsen hører til, efter server, kort og nummer: `Example Server North 3`. Én optagelse er én session (fra genstart til genstart); en runde løber over mange sessioner, dage eller uger |
| `round` | rundens nummer: serverens eget, hvor den offentliggør et, ellers den n'te runde set fra den server og det kort; fra en rundefil (nedenfor), tom uden en |
| `session` | optagelsens plads blandt rundens sessioner, 1, 2, ...; `sessionStart` dens virkelige start (Unix-sekunder) |
| `heldRed`, `heldBlue` | de omstridte steder, hver side holdt ved sessionens start, fra en kædet rundefil (nedenfor) |
| `won`, `matchWon` | 1, når rækkens side (dens Color, Red eller Blue) vandt kampagnen, 0, når den tabte; tom, hvor ingen rundefil nævner en vinder, og på neutrale rækker. En kampagne er både runden og kampen, så begge har samme værdi |
| `roundEndReason` | `capture` for en kampagne, der blev vundet ved at tage alt |
| `won`, `matchWon` på hver session i en runde | rundens resultat, skrevet på hver optagelse af den, når dens afslutning kendes |
| `sortie` | på et flys rækker: dets flyvning, 1, 2, ... fra start til start; tiden på jorden før den første start og efter en landing tæller med til den flyvning, den hører til |
| `sortieResult` | hvordan flyvningen endte: `landed`, `landed damaged` (efter et træf i luften), `ejected`, `shot down`, `destroyed` (på jorden), `crashed`, `despawned` (væk i luften uden synlig årsag - en spiller, der forlader spillet), `airborne at end`, `no takeoff` |
| `sortieKills` | de nedskydninger, flyet blev krediteret for i den flyvning |

På en vedvarende server er flyvningen den enhed, der betyder noget: filtrer på `sortieResult` = `shot down` for at se, hvor flyvninger gik tabt, eller del varmen op efter `sortieResult` eller `server` i [opdelingen](breakdown.md). Starterne, landingerne, katapultudspringene, nedskydningerne og styrtene, den består af, er de hændelser, konverteren udleder af, hvordan flyene bevæger sig (ovenfor).

Steder, der blev taget mellem to sessioner i en runde - kendt fra rundefilen, nedenfor - er `capture`-hændelser ved starten af den senere optagelse: `Object` `(campaign)`, ved stedet, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

En flyveplads eller FARP, der skifter side, hvor optagelsen viser det - skrevet igen i den anden farve, eller fjernet og skrevet igen på sin plads i den anden inden for fem minutter - bliver en `capture`-hændelse ved pladsen: `Event` = `capture`, `Airfield` dens navn, `Detail` `Red to Blue`, `Coalition` dens nye side. En plads, der først skrives i en farve, er ingen erobring. De servere, der er set på indtil nu, skriver deres pladser én gang, så deres optagelser indeholder ingen erobringer.

### Rundefiler {#rounds-files}

En rundefil angiver for hver server dens kampagnerunder, hvem der vandt dem, og hver rundes sessioner. Den kommer fra det, serveren offentliggør, eller fra selve optagelserne (nedenfor).

Hvem der vandt en kampagne, er det, serveren offentliggør - en kampagnelog på dens webside - ikke noget i optagelsen. En rundefil bærer det, og konverteren læser den med `--rounds file.json` (der kan angives flere):

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

En optagelse hører til de runder under dens `server`, hvis `title` (et regulært udtryk) matcher dens Title; hver række til den runde, dens virkelige tid falder i - optagelsens RecordingTime plus rækkens sekunder, ikke missionens dato i spillet. Tider er i UTC. En runde uden vinder (roteret, kører stadig) giver sine rækker rundenummeret og et tomt resultat.

Kampdokumentets modstykke, `acmi`-sidefoden, siger, hvor resultatet kom fra, ligesom en War Thunder-kamps `result.source` gør: `outcome.result` er `{ winner, round, endReason, source }`, `source` rundefilens `source`, eller `null`, når intet nævnte en vinder. `outcome` viser også optagelsens runder, dens erobringer og dens flyvninger efter, hvordan de endte:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

En række for en pilot `Viper 1 (F-16C_50) #a01` på Blue-siden i den kampagne lyder så: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Runder ud fra selve optagelserne {#rounds-from-the-recordings-themselves}

En vedvarende server beholder sin kampagne hen over genstarter, og hver optagelse begynder med begge siders jordenheder og statiske objekter, der hvor kampagnen efterlod dem. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` læser de første minutter af hver optagelse ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), sætter hver servers optagelser af ét kort i tidsrækkefølge og kæder dem sammen:

- **Steder**: jorden i celler på omkring 2 km; en celle tilhører en side, når tre fjerdedele af enhederne der ved en sessions start er dens. *Omstridte* steder er dem, der er set holdt af begge sider.
- **Erobringer**: et sted, som den anden side holder ved den næste sessions start - taget mellem missionerne eller under den tidligere.
- **En ny runde**: en session, hvis steder adskiller sig fra den sidstes i mere end 60 % af dem - startopstillingen for en ny runde, ikke et skridt i den gamle. En runde slutter også, når serveren skifter til et andet kort (dens sessioner begynder efter den sidste og fortsætter).
- **Hvem der vandt**: i en runde, der sluttede, den side, der holdt alle steder ved starten af dens sidste session (`capture`, høj sikkerhed), ellers den side, der holdt flest af de omstridte steder (middel ved dobbelt så mange som den anden, ellers lav; lav, når den sluttede med et kortskift). En åben runde har ingen vinder, men hver session siger, hvor mange steder hver side holdt ved dens start, så man kan se, hvem der var foran.
- En server, hvis sessioner alle begynder ens, gemmer ingen tilstand mellem dem: den kædes ikke.

Den sidste sessions start kan ligge timer før rundens afslutning, så sikkerheden betyder noget. Kontrolleret mod en server, der offentliggør sine vindere: kæden fandt hver ny runde ved den session, hvor den offentliggjorte runde begyndte, og den side, der var foran ved den sidste start, var den offentliggjorte vinder i hver af de 9 runder, den kunne kontrollere. `--official file.json` beholder en sådan servers offentliggjorte runder og tilføjer kædens sessioner til dem; filens `validation` siger, hvor langt kæden var enig. I en opdigtet kampagne:

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

### Se en kampagnerunde som en serie {#watching-a-campaign-round-as-a-series}

Indlæs optagelserne fra én runde sammen - filerne med samme `campaign` - og vieweren afspiller dem som én serie: session efter session i deres virkelige rækkefølge, med timerne eller dagene mellem to skåret ned til en pause på ét minut. Tidslinjen markerer hver sessions start med gult og pauserne som mørke bånd, og uret siger, hvilken session der afspilles, og dens virkelige dato (`session 4/12 · 2026-11-02 12:38 UTC`). Varme, afspilningen, filtre og Indsigter virker på hele serien som på alle indlæste data. Afsnittet **Kampagnerunde** i fanen Kamp viser sessionerne med deres datoer, hvor mange omstridte steder hver side holdt ved hver start - også som et diagram over runden - og hvor mange der blev taget før den; et klik går til en sessions start. En optagelse, der indlæses alene, siger der, hvilken runde og session den er. Optagelser fra forskellige runder, der indlæses sammen, er ingen serie: hver starter ved nul, som separate kampe gør. Indlæseren til mange kampe (**Mange kampe på én gang**) afspiller også en runde som en serie, streamet og tilpasset GPU'en, til runder på mange gigabyte.

De steder, der skiftede hænder i løbet af runden, tegnes på kortet som erobringszoner, farvet efter den side, der holdt hvert af dem ved starten af den session, der afspilles, og de skifter ved sessionsgrænserne; hvert skift er en erobring i afspilningens hændelsesliste. De udledes af de indlæste rækker - hver sessions jordenheder og statiske objekter i dens første minutter, i celler på omkring 2 km, som kæden gør - så de kræver den fulde indlæser (indlæseren til mange kampe beholder for lidt af hver række).

**Indlæs hele runden fra en af dens optagelser.** I en almindelig browser kan vieweren ikke åbne filer, du ikke har valgt: indlæs rundens filer sammen. Når den køres fra den lokale viewer-server (`npm run dev` eller `npm run preview`), kan den: giv den git-ignorerede `tools/local-data.json` en `campaigns`-post, der nævner mappen med rundefiler og mapperne med konverterede optagelser, og afsnittet Kampagnerunde for en enkelt optagelse tilbyder **Indlæs hele runden**, henter de af rundens sessioner, der findes der, og indlæser dem med indlæseren til mange kampe:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Kun de optagelser, en rundefil nævner, leveres (`tools/campaign-files.mjs`); en session, der ikke findes under de mapper, tælles med, men indlæses ikke.

Hvad de kendte servere offentliggør:

| Server | En runde | Hvordan en side vinder | Hvor vinderen kan læses |
|---|---|---|---|
| SPS Contention | en kampagne på ét kort og én æra (dage), over mange genstarter | alle flyvepladser, FARP'er og støttepunkter taget; en kampagne, der sluttede uden vinder, blev roteret | serverens offentlige kampagnelog (vinder, start, slut for hver kampagne) |
| Blue Flag | en kampagnerunde over mange missioner på 5 timer; `_YYYY_MM` i Title rykker én måned frem pr. genstart | alle fjendtlige positioner taget; ældre runder udnævnte den side, der holdt mest efter en fast tid | ikke offentliggjort i en form, der er fundet indtil nu; kæden af optagelserne følger hver runde, og hvem der holder hvor meget ved hver start |
| Growling Sidewinder | en kørsel (6 timer) af en mission med åben konflikt | zoner og flyvepladser taget | dens statistikside viser piloter, ikke resultater; hver session begynder ens, så ingen runde strækker sig over flere sessioner: tom |
| Missioner mod AI'en (missioner, hvor zoner skal erobres) | en kørsel af en mission | spillernes side mod missionens AI: intet PvP-resultat | tom |
| Uden tilknytning (headeren nævner ingen server) | - | - | tom, `server` også tom |

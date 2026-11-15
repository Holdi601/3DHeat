---
title: "Tacview įrašai (ACMI)"
parent: "Duomenų įkėlimas"
nav_order: 7
lang: "lt"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview įrašai (ACMI)

Tacview yra programa, kuri įrašo skrydžius skrydžio simuliatoriuose; jos failai baigiasi `.acmi`. 3DHeat juos atveria, kad galėtumėte pamatyti, kur skrido kiekvienas orlaivis.

Tacview skrydžių įrašai įkeliami kaip bet kokia lentelė: pasirinkite arba įmeskite `.acmi` (tekstinį, `.txt.acmi`, arba suspaustą, `.zip.acmi`) ir spauskite **Įkelti**. Tada gausite visų skrydžių šilumą, o skirtuke **Rungtynės** – pakartojimą su figūromis, trajektorijomis ir įvykių sąrašu ([Rungtynių pakartojimas](match-replay.md)). ACMI yra viešas Tacview failų formatas ([dokumentacija](https://www.tacview.net/documentation/acmi/)); DCS (per Tacview eksportuotoją), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS ir kiti jį rašo, todėl peržiūros programa skaito bet kurį iš jų.

## Ką tampa įrašas {#what-a-recording-becomes}

Viena eilutė kiekvieną kartą, kai įrašoma objekto padėtis, viena eilutė kiekvienam įvykiui objekto vietoje ir viena eilutė, kai objektas išeina (`Removed`, kur jis buvo paskutinį kartą). Įvykis apie dar nematytą objektą – žymė, pranešimas visiems – yra objekto `(recording)` eilutė atskaitos taške. Įraše yra savi skaitymo nurodymai, todėl susiejimo žingsnis užsipildo pats. Skaitytuvas rašo šiuos stulpelius: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, o paskui visas kitas įrašo savybes. Jų vaidmenys:

| Stulpelis | Vaidmuo | Reikšmė |
|---|---|---|
| Time | laikas | Sekundės po įrašo ReferenceTime; Unix sekundės, kai jis yra, todėl laikrodis rodo tikrą laiką. |
| X, Y | padėtis | Rytai ir šiaurė, metrais, plokštumoje, liečiančioje Žemę įrašo atskaitos taške: atstumai ir kryptys šalia jo tikslūs, o ties 100 km nukrypsta mažiau nei tūkstantine dalimi. Šiaurė tampa pasaulio -Z. |
| Altitude | padėtis (aukštyn) | Metrais. |
| Object | asmuo | Pilotas ir objekto pavadinimas su id, pvz., `Viper 1 (F-16C_50) #a01`; bepilotis objektas `(T-90A) #401`. |
| Coalition | komanda | Pusė (arba spalva, kai koalicijos nėra). |
| Heading, Pitch | žvilgsnis | Laipsniais; kryptis 0 yra šiaurė. |
| Recording | sesija | Įrašo Title arba failo vardas: keli įrašai įkeliami greta, nesujungiant jų trajektorijų. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtrai | Saugomi filtravimui; Type ir Name parenka kiekvieno objekto [figūrą](figures.md), Event maitina įvykių sąrašą atsiskaitymo metu, Roll pasuka orlaivį. |
| U, V | | Žaidimo paties plokščio pasaulio metrai, kai kiekviena mėginys juos turi (DCS juos rašo). |
| EventObjects | filtrai | Kiekvienas objektas, kurį įvykis nurodo (`Message|a01|b02|...`), pagal id. |
| RecordingInfo | | Įrašo savybės, kokios buvo tuo momentu – DataSource, DataRecorder, Author, Category, Briefing, Comments, ... – JSON formatu. |
| IAS, Mach, AOA, FuelWeight, ... | filtrai | Bet kokia kita skaitinė įrašo savybė. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtrai | Bet kokia kita teksto savybė, kurią turi įrašas; savybė, kurios reikšmė nėra skaičius, yra tekstas. |

Skaitomos visos keturios Tacview padėties formos (`lon|lat|alt`, su `u|v`, su `roll|pitch|yaw` ir su visais kartu bei kryptimi); tušti laukai palieka paskutinę reikšmę; `-id` pašalina objektą, o id, panaudotas vėl po to, yra naujas objektas. Apdorojami ekranuoti kableliai ir tęsiamos eilutės.

Padėtys visada apskaičiuojamos iš platumos ir ilgumos, niekada nepaimamos iš U/V, todėl įrašai iš visų žaidimų naudoja vieną projekciją su tikro pasaulio fonu.

## DCS serveriai: kas laimėjo ir kaip baigėsi kiekvienas skrydis {#dcs-servers-who-won-and-how-each-sortie-ended}

DCS kelių žaidėjų serveris visą parą įrašo savo misijas su Tacview, o nuolatinis PvP serveris veda kampaniją per daugelį jų: pusė laimi užėmusi visus kitos pusės aerodromus, FARP ir zonas, o tai užtrunka kelias dienas ir daug misijos paleidimų iš naujo. Įrašuose yra skrydžiai, o ne kampanija: joks pranešimas nesako, kas ką užėmė, aerodromai įrašomi vieną kartą pradžioje, ir niekas nesako, kas laimėjo. Tacview konverteris (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) prie kiekvienos eilutės prideda tai, ką galima žinoti, o tai, ko negalima, palieka tuščia - jis niekada nespėlioja.

| Stulpelis | Reikšmė |
|---|---|
| `server` | serveris arba kampanija iš įrašo antraštės (jos Title, Author ir Comments įvardija žinomus viešus serverius - Blue Flag, SPS Contention, Growling Sidewinder; kitaip Author, kuris ką nors įvardija); `--server Name` suteikia pavadinimą visam aplankui. Įrašas, kurio antraštė neįvardija jokio serverio - Author, pvz., `Admin`, Title ir Comments, kurių nerašo joks žinomas serveris, - lieka nepriskirtas: `server` tuščias, net jei jis atsisiųstas iš serverio įrašų puslapio, nes tame puslapyje gali būti ir kitų bendruomenių misijų |
| `mission` | įrašo Title be versijos ar kampanijos mėnesio: `Operation_Example_V7.7.99` tampa `Operation Example` |
| `campaign` | kampanijos raundas, kuriam priklauso įrašas, pagal serverį, žemėlapį ir numerį: `Example Server North 3`. Vienas įrašas yra viena sesija (nuo paleidimo iš naujo iki kito); raundas trunka daug sesijų, dienų ar savaičių |
| `round` | to raundo numeris: paties serverio, jei jis jį skelbia, kitaip n-asis raundas, matytas tame serveryje ir žemėlapyje; iš raundų failo (žemiau), be jo tuščias |
| `session` | įrašo vieta tarp raundo sesijų, 1, 2, ...; `sessionStart` tikroji jos pradžia (Unix sekundėmis) |
| `heldRed`, `heldBlue` | ginčijamos vietos, kurias kiekviena pusė laikė sesijos pradžioje, iš sujungto į grandinę raundų failo (žemiau) |
| `won`, `matchWon` | 1, kai eilutės pusė (jos Color, Red arba Blue) laimėjo tą kampaniją, 0, kai pralaimėjo; tuščia, kai joks raundų failas neįvardija nugalėtojo, ir neutraliose eilutėse. Kampanija yra ir raundas, ir rungtynės vienu metu, todėl abiejuose ta pati reikšmė |
| `roundEndReason` | `capture` kampanijai, laimėtai užėmus viską |
| `won`, `matchWon` kiekvienoje raundo sesijoje | raundo rezultatas, įrašytas į kiekvieną jo įrašą, kai žinoma jo pabaiga |
| `sortie` | orlaivio eilutėse: jo skrydis, 1, 2, ... nuo kilimo iki kilimo; laikas ant žemės prieš pirmą kilimą ir po nusileidimo priskiriamas skrydžiui, kuriam jis priklauso |
| `sortieResult` | kaip tas skrydis baigėsi: `landed`, `landed damaged` (po pataikymo ore), `ejected`, `shot down`, `destroyed` (ant žemės), `crashed`, `despawned` (dingo ore be matomos priežasties - žaidėjas išėjo), `airborne at end`, `no takeoff` |
| `sortieKills` | orlaiviui tame skrydyje įskaityti sunaikinimai |

Nuolatiniame serveryje prasmingas vienetas yra skrydis: filtruokite pagal `sortieResult` = `shot down`, kad pamatytumėte, kur skrydžiai buvo prarasti, arba suskirstykite karštį pagal `sortieResult` ar `server` [suskirstyme](breakdown.md). Kilimai, nusileidimai, katapultavimaisi, sunaikinimai ir sudužimai, iš kurių jis susideda, yra įvykiai, kuriuos konverteris nustato iš to, kaip juda orlaiviai (aukščiau).

Vietos, užimtos tarp dviejų raundo sesijų - žinomos iš raundų failo, žemiau, - yra `capture` įvykiai vėlesnio įrašo pradžioje: `Object` `(campaign)`, toje vietoje, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Aerodromas ar FARP, kuris pakeičia pusę ten, kur tai rodo įrašas - įrašomas iš naujo kita spalva arba pašalinamas ir per penkias minutes vėl įrašomas savo vietoje kita spalva, - tampa `capture` įvykiu prie aikštelės: `Event` = `capture`, `Airfield` jos pavadinimas, `Detail` `Red to Blue`, `Coalition` jos nauja pusė. Aikštelė, pirmą kartą įrašyta kuria nors spalva, nėra užėmimas. Iki šiol peržiūrėti serveriai savo aikšteles įrašo vieną kartą, todėl jų įrašuose užėmimų nėra.

### Raundų failai {#rounds-files}

Raundų failas kiekvienam serveriui nurodo jo kampanijos raundus, kas juos laimėjo, ir kiekvieno raundo sesijas. Jis gaunamas iš to, ką skelbia serveris, arba iš pačių įrašų (žemiau).

Kas laimėjo kampaniją, yra tai, ką skelbia serveris - kampanijos žurnalas jo tinklalapyje, - o ne kas nors įraše. Raundų failas tai perneša, o konverteris jį nuskaito su `--rounds file.json` (galima nurodyti daugiau nei vieną):

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

Įrašas priklauso tiems savo `server` raundams, kurių `title` (reguliarioji išraiška) atitinka jo Title; kiekviena eilutė - raundui, į kurį patenka jos tikrasis laikas - įrašo RecordingTime plius eilutės sekundės, o ne misijos data žaidime. Laikas nurodomas UTC. Raundas be nugalėtojo (pakeistas, dar vyksta) savo eilutėms suteikia raundo numerį ir tuščią rezultatą.

Rungtynių dokumento atitikmuo, `acmi` poraštė, nurodo, iš kur gautas rezultatas, kaip tai daro War Thunder rungtynių `result.source`: `outcome.result` yra `{ winner, round, endReason, source }`, `source` - raundų failo `source` arba `null`, kai niekas neįvardijo nugalėtojo. `outcome` taip pat išvardija įrašo raundus, jo užėmimus ir jo skrydžius pagal tai, kaip jie baigėsi:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Piloto `Viper 1 (F-16C_50) #a01` eilutė Blue pusėje toje kampanijoje tada yra: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Raundai iš pačių įrašų {#rounds-from-the-recordings-themselves}

Nuolatinis serveris išlaiko savo kampaniją per paleidimus iš naujo, ir kiekvienas įrašas prasideda abiejų pusių sausumos vienetais ir statiniais objektais ten, kur juos paliko kampanija. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` nuskaito pirmąsias kiekvieno įrašo minutes ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), sudeda kiekvieno serverio vieno žemėlapio įrašus laiko tvarka ir sujungia juos į grandinę:

- **Vietos**: žemė maždaug 2 km langeliais; langelis priklauso pusei, kai trys ketvirtadaliai ten esančių vienetų sesijos pradžioje yra jos. *Ginčijamos* vietos - tos, kurios matytos abiejų pusių rankose.
- **Užėmimai**: vieta, kurią kitos sesijos pradžioje laiko kita pusė - užimta tarp misijų arba ankstesnės misijos metu.
- **Naujas raundas**: sesija, kurios vietos skiriasi nuo ankstesnės daugiau nei 60 % jų - naujo raundo pradinė išdėstymo tvarka, o ne seno raundo žingsnis. Raundas taip pat baigiasi, kai serveris pereina į kitą žemėlapį (jo sesijos prasideda po paskutinės ir tęsiasi).
- **Kas laimėjo**: pasibaigusiame raunde - pusė, kuri jo paskutinės sesijos pradžioje laikė visas vietas (`capture`, didelis patikimumas), kitaip pusė, kuri laikė daugiau ginčijamų vietų (vidutinis, kai dvigubai daugiau nei kita, kitaip mažas; mažas, kai raundas baigėsi žemėlapio pakeitimu). Atviras raundas neturi nugalėtojo, bet kiekviena sesija nurodo, kiek vietų kiekviena pusė laikė jos pradžioje, todėl matyti, kas pirmavo.
- Serveris, kurio visos sesijos prasideda vienodai, tarp jų nesaugo būsenos: jis nejungiamas į grandinę.

Paskutinės sesijos pradžia gali būti kelios valandos iki raundo pabaigos, todėl patikimumas svarbus. Patikrinta pagal serverį, kuris skelbia savo nugalėtojus: grandinė rado kiekvieną naują raundą toje sesijoje, kurioje prasidėjo paskelbtas raundas, o pusė, pirmavusi paskutinės pradžios metu, buvo paskelbtas nugalėtojas kiekviename iš 9 raundų, kuriuos ji galėjo patikrinti. `--official file.json` išlaiko tokio serverio paskelbtus raundus ir prie jų prideda grandinės sesijas; failo `validation` nurodo, kiek grandinė sutapo. Išgalvotoje kampanijoje:

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

### Kampanijos raundo žiūrėjimas kaip serijos {#watching-a-campaign-round-as-a-series}

Įkelkite vieno raundo įrašus kartu - failus, kurių `campaign` tas pats, - ir peržiūros programa juos paleis kaip vieną seriją: sesiją po sesijos tikrąja tvarka, o valandos ar dienos tarp dviejų sutrumpinamos iki vienos minutės pertraukos. Laiko juosta kiekvienos sesijos pradžią žymi geltonai, o pertraukas - tamsiomis juostomis, ir laikrodis rodo, kuri sesija leidžiama, ir jos tikrąją datą (`session 4/12 · 2026-11-02 12:38 UTC`). Karštis, atkūrimas, filtrai ir Įžvalgos veikia visoje serijoje kaip su bet kokiais įkeltais duomenimis. Skirtuko Rungtynės skiltis **Kampanijos raundas** išvardija sesijas su jų datomis, kiek ginčijamų vietų kiekviena pusė laikė kiekvienos pradžios metu - taip pat kaip diagramą per visą raundą - ir kiek jų buvo užimta prieš tai; spustelėjimas nukelia į sesijos pradžią. Vienas įkeltas įrašas ten nurodo, koks tai raundas ir sesija. Skirtingų raundų įrašai, įkelti kartu, nėra serija: kiekvienas prasideda nuo nulio, kaip ir atskiros rungtynės. Daugelio rungtynių įkėlimo įrankis (**Daug rungtynių vienu metu**) taip pat paleidžia raundą kaip seriją, srautu ir pritaikytą GPU, daug gigabaitų užimantiems raundams.

Vietos, kurios raundo metu perėjo į kitas rankas, žemėlapyje piešiamos kaip užėmimo zonos, nuspalvintos pagal pusę, kuri kiekvieną laikė leidžiamos sesijos pradžioje, ir keičiasi ties sesijų ribomis; kiekvienas pasikeitimas yra užėmimas atkūrimo įvykių sąraše. Jos nustatomos iš įkeltų eilučių - kiekvienos sesijos sausumos vienetų ir statinių objektų per pirmąsias jos minutes, maždaug 2 km langeliais, kaip tai daro grandinė, - todėl joms reikia pilno įkėlimo įrankio (daugelio rungtynių įkėlimo įrankis iš kiekvienos eilutės pasilieka per mažai).

**Viso raundo įkėlimas iš vieno jo įrašo.** Įprastoje naršyklėje peržiūros programa negali atidaryti failų, kurių nepasirinkote: įkelkite raundo failus kartu. Kai ją teikia vietinis peržiūros programos serveris (`npm run dev` arba `npm run preview`), ji gali: git ignoruojamam `tools/local-data.json` pridėkite `campaigns` įrašą, nurodantį raundų failų aplanką ir konvertuotų įrašų aplankus, tada vieno įrašo skiltis Kampanijos raundas siūlo **Įkelti visą raundą**, parsiunčia ten rastas raundo sesijas ir įkelia jas daugelio rungtynių įkėlimo įrankiu:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Teikiami tik tie įrašai, kuriuos nurodo raundų failas (`tools/campaign-files.mjs`); sesija, nerasta tuose aplankuose, suskaičiuojama, bet neįkeliama.

Ką skelbia žinomi serveriai:

| Serveris | Raundas | Kaip pusė laimi | Kur galima perskaityti nugalėtoją |
|---|---|---|---|
| SPS Contention | kampanija viename žemėlapyje ir epochoje (kelios dienos), per daug paleidimų iš naujo | užimti visi aerodromai, FARP ir tvirtovės; kampanija, pasibaigusi be nugalėtojo, buvo pakeista | viešas serverio kampanijų žurnalas (nugalėtojas, pradžia, pabaiga kiekvienai kampanijai) |
| Blue Flag | kampanijos raundas per daug 5 valandų misijų; `_YYYY_MM` Title lauke kiekvieno paleidimo iš naujo metu pasislenka vienu mėnesiu | užimtos visos priešo pozicijos; senesniuose raunduose nugalėtoja būdavo pusė, po nustatyto laiko laikiusi daugiau | iki šiol nerasta paskelbta jokia forma; įrašų grandinė seka kiekvieną raundą ir tai, kas kiek vietų laiko kiekvienos pradžios metu |
| Growling Sidewinder | atviro konflikto misijos paleidimas (6 valandos) | užimtos zonos ir aerodromai | jo statistikos puslapis rodo pilotus, o ne rezultatus; kiekviena sesija prasideda vienodai, todėl joks raundas neapima kelių sesijų: tuščia |
| Misijos prieš DI (zonų užėmimo misijos) | misijos paleidimas | žaidėjų pusė prieš misijos DI: jokio PvP rezultato | tuščia |
| Nepriskirtas (antraštė neįvardija serverio) | - | - | tuščia, `server` taip pat tuščias |

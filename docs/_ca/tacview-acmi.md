---
title: "Gravacions de Tacview (ACMI)"
parent: "Carregar dades"
nav_order: 7
lang: "ca"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Gravacions de Tacview (ACMI)

Tacview és un programa que grava vols en simuladors de vol; els seus fitxers acaben en `.acmi`. 3DHeat els obre perquè puguis veure on ha volat cada avió.

Les gravacions de vol de Tacview es carreguen com qualsevol taula: tria o arrossega un `.acmi` (text, `.txt.acmi`, o comprimit, `.zip.acmi`) i prem **Carrega**. Aleshores obtens la calor de tots els vols, i a la pestanya **Partida** una repetició amb figures, traces i una llista d'esdeveniments ([Repetició de partida](match-replay.md)). ACMI és el format públic de fitxers de Tacview ([documentació](https://www.tacview.net/documentation/acmi/)); DCS (a través de l'exportador de Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS i altres el escriuen, així que això llegeix qualsevol d'ells.

## Què es converteix una gravació {#what-a-recording-becomes}

Una fila cada vegada que s'escriu la posició d'un objecte, una fila per esdeveniment a la posició de l'objecte, i una fila quan un objecte surt (`Removed`, on era per última vegada). Un esdeveniment sobre cap objecte encara no vist —un marcador, un missatge a tots— és una fila de l'objecte `(recording)` al punt de referència. La gravació porta les seves pròpies instruccions de lectura, així que el pas d'assignació s'omple sol. El lector escriu aquestes columnes: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, i després qualsevol altra propietat que tingui la gravació. Els seus papers:

| Columna | Paper | Significat |
|---|---|---|
| Time | temps | Segons després del ReferenceTime de la gravació; segons Unix quan en té un, de manera que el rellotge mostra l'hora real. |
| X, Y | posició | Est i nord, en metres, sobre un pla que toca la terra al punt de referència de la gravació: les distàncies i els rumbs són veritables a prop, i s'desvien menys d'una part per mil a 100 km. El nord esdevé el -Z del món. |
| Altitude | posició (amunt) | Metres. |
| Object | persona | El pilot i el nom de l'objecte amb el seu id, p. ex. `Viper 1 (F-16C_50) #a01`; un objecte sense tripulació `(T-90A) #401`. |
| Coalition | equip | El bàndol (o el color, quan no hi ha coalició). |
| Heading, Pitch | mirada | Graus; el rumb 0 és el nord. |
| Recording | sessió | El Title de la gravació, o el nom del fitxer: diverses gravacions es carreguen una al costat de l'altra sense que se'n barregin les traces. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtres | Es guarden per filtrar; Type i Name trien la [figura](figures.md) de cada objecte, Event alimenta la llista d'esdeveniments del resum, Roll inclina l'avió. |
| U, V | | Els metres plans propis del joc, quan totes les mostres els tenen (DCS els escriu). |
| EventObjects | filtres | Cada objecte que nomena un esdeveniment (`Message|a01|b02|...`), per id. |
| RecordingInfo | | Les propietats pròpies de la gravació tal com estaven en aquell moment —DataSource, DataRecorder, Author, Category, Briefing, Comments, ...— en JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtres | Qualsevol altra propietat numèrica que porti la gravació. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtres | Qualsevol altra propietat de text que porti la gravació; una propietat amb un valor que no és un número és text. |

Es llegeixen totes les quatre formes de posició de Tacview (`lon|lat|alt`, amb `u|v`, amb `roll|pitch|yaw`, i amb totes elles més un rumb), i els camps buits mantenen l'últim valor; `-id` treu un objecte, i un id usat de nou després d'això és un objecte nou. Es tracten les comes escapades i les línies continuades.

Les posicions sempre es projecten des de la latitud i la longitud, mai no es prenen de U/V, de manera que les gravacions de tots els jocs comparteixen una mateixa projecció amb un fons del món real.

## Servidors de DCS: qui va guanyar i com va acabar cada sortida {#dcs-servers-who-won-and-how-each-sortie-ended}

Un servidor multijugador de DCS grava les seves missions amb Tacview les vint-i-quatre hores, i un servidor PvP persistent hi fa córrer una campanya al llarg de moltes d'elles: un bàndol guanya quan pren tots els aeròdroms, FARP i zones de l'altre, cosa que porta dies i molts reinicis de missió. Les gravacions contenen els vols, no la campanya: cap missatge diu qui va prendre què, els aeròdroms s'escriuen un sol cop al començament i cap no diu qui va guanyar. El convertidor de Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) afegeix a cada fila el que es pot saber i deixa buit el que no —mai no endevina.

| Columna | Significat |
|---|---|
| `server` | el servidor o la campanya, de la capçalera de la gravació (el seu Title, Author i Comments anomenen els servidors públics coneguts —Blue Flag, SPS Contention, Growling Sidewinder—; si no, un Author que anomena algú); `--server Name` l'anomena per a tota una carpeta. Una gravació la capçalera de la qual no anomena cap servidor —un Author com `Admin`, un Title i uns Comments que cap servidor conegut no escriu— queda sense atribuir: `server` buit, fins i tot quan es va baixar de la pàgina de gravacions d'un servidor, ja que la pàgina pot contenir també missions d'altres comunitats |
| `mission` | el Title de la gravació sense la versió ni el mes de campanya: `Operation_Example_V7.7.99` esdevé `Operation Example` |
| `campaign` | la ronda de campanya a què pertany la gravació, per servidor, mapa i número: `Example Server North 3`. Una gravació és una sessió (de reinici a reinici); una ronda dura moltes sessions, dies o setmanes |
| `round` | el número d'aquesta ronda: el del mateix servidor quan en publica un; si no, la n-ena ronda vista d'aquest servidor i mapa; d'un fitxer de rondes (més avall), buit sense |
| `session` | el lloc de la gravació entre les sessions de la ronda, 1, 2, ...; `sessionStart` el seu inici real (segons Unix) |
| `heldRed`, `heldBlue` | els llocs disputats que tenia cada bàndol a l'inici de la sessió, d'un fitxer de rondes encadenat (més avall) |
| `won`, `matchWon` | 1 quan el bàndol de la fila (el seu Color, Red o Blue) va guanyar aquella campanya, 0 quan va perdre; buit on cap fitxer de rondes no anomena un guanyador, i a les files neutrals. Una campanya és alhora la ronda i la partida, així que totes dues contenen el mateix |
| `roundEndReason` | `capture` per a una campanya guanyada prenent-ho tot |
| `won`, `matchWon` a cada sessió d'una ronda | el resultat de la ronda, escrit a cada gravació seva un cop se'n coneix el final |
| `sortie` | a les files d'un avió: el seu vol, 1, 2, ... d'enlairament a enlairament; el temps a terra abans del primer enlairament i després d'un aterratge compta per al vol a què pertany |
| `sortieResult` | com va acabar aquell vol: `landed`, `landed damaged` (després d'un impacte a l'aire), `ejected`, `shot down`, `destroyed` (a terra), `crashed`, `despawned` (desaparegut a l'aire sense cap causa vista —un jugador que surt), `airborne at end`, `no takeoff` |
| `sortieKills` | les baixes atribuïdes a l'avió en aquell vol |

En un servidor persistent, la sortida és la unitat que té sentit: filtra per `sortieResult` = `shot down` per veure on es van perdre vols, o desglossa la calor per `sortieResult` o `server` al [desglossament](breakdown.md). Els enlairaments, aterratges, ejeccions, baixes i estavellaments que la formen són els esdeveniments que el convertidor dedueix de com es mouen els avions (més amunt).

Els llocs presos entre dues sessions d'una ronda —coneguts pel fitxer de rondes, més avall— són esdeveniments `capture` a l'inici de la gravació posterior: `Object` `(campaign)`, al lloc, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Un aeròdrom o FARP que canvia de bàndol on la gravació ho mostra —escrit de nou amb l'altre color, o eliminat i escrit de nou al seu lloc amb l'altre en menys de cinc minuts— esdevé un esdeveniment `capture` a la plataforma: `Event` = `capture`, `Airfield` el seu nom, `Detail` `Red to Blue`, `Coalition` el seu nou bàndol. Una plataforma escrita per primer cop amb un color no és cap captura. Els servidors examinats fins ara escriuen les seves plataformes un sol cop, així que les seves gravacions no contenen captures.

### Fitxers de rondes {#rounds-files}

Un fitxer de rondes diu, per servidor, les seves rondes de campanya, qui les va guanyar i les sessions de cadascuna. Prové del que publica el servidor, o de les mateixes gravacions (més avall).

Qui va guanyar una campanya és el que publica el servidor —un registre de campanya a la seva pàgina web—, no una cosa que hi hagi a la gravació. Un fitxer de rondes ho porta, i el convertidor el llegeix amb `--rounds file.json` (se'n pot donar més d'un):

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

Una gravació pertany a les rondes del seu `server` el `title` de les quals (una expressió regular) coincideix amb el seu Title; cada fila, a la ronda on cau el seu temps real —el RecordingTime de la gravació més els segons de la fila, no la data de la missió dins el joc. Les hores són UTC. Una ronda sense guanyador (rotada, encara en curs) dona a les seves files el número de ronda i un resultat buit.

L'equivalent del document de la partida, el peu `acmi`, diu d'on va sortir el resultat, com ho fa `result.source` d'una partida de War Thunder: `outcome.result` és `{ winner, round, endReason, source }`, `source` la `source` del fitxer de rondes, o `null` quan res no va anomenar cap guanyador. `outcome` també llista les rondes de la gravació, les seves captures i les seves sortides segons com van acabar:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Una fila d'un pilot `Viper 1 (F-16C_50) #a01` del bàndol Blue en aquella campanya diu llavors: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Rondes a partir de les mateixes gravacions {#rounds-from-the-recordings-themselves}

Un servidor persistent conserva la seva campanya entre reinicis, i cada gravació comença amb les unitats terrestres i els estàtics de tots dos bàndols allà on els va deixar la campanya. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` llegeix els primers minuts de cada gravació ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), posa en ordre cronològic les gravacions de cada servidor en un mateix mapa i les encadena:

- **Llocs**: el terreny en cel·les d'uns 2 km; una cel·la és d'un bàndol quan tres quartes parts de les unitats que hi ha a l'inici d'una sessió són seves. Els llocs *disputats* són els que s'han vist en mans de tots dos bàndols.
- **Captures**: un lloc en mans de l'altre bàndol a l'inici de la sessió següent —pres entre les missions, o durant l'anterior.
- **Una ronda nova**: una sessió els llocs de la qual difereixen dels de l'última en més del 60% —la disposició inicial d'una ronda nova, no un pas de la vella. Una ronda també acaba quan el servidor passa a un altre mapa (les seves sessions comencen després de l'última i continuen).
- **Qui va guanyar**: d'una ronda acabada, el bàndol que tenia tots els llocs a l'inici de la seva última sessió (`capture`, confiança alta); si no, el bàndol que tenia més llocs disputats (mitjana amb el doble que l'altre; si no, baixa; baixa quan va acabar amb un canvi de mapa). Una ronda oberta no té guanyador, però cada sessió diu quants llocs tenia cada bàndol al seu inici, així que es veu qui anava al davant.
- Un servidor les sessions del qual comencen totes igual no conserva cap estat entre elles: no s'encadena.

L'inici de l'última sessió pot ser hores abans del final de la ronda, així que la confiança importa. Comprovat amb un servidor que publica els seus guanyadors: la cadena va trobar cada ronda nova a la sessió en què va començar la ronda publicada, i el bàndol que anava al davant a l'últim inici va ser el guanyador publicat en cadascuna de les 9 rondes que va poder comprovar. `--official file.json` conserva les rondes publicades d'un servidor així i hi afegeix les sessions de la cadena; la `validation` del fitxer diu fins a quin punt la cadena hi coincidia. En una campanya inventada:

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

### Veure una ronda de campanya com una sèrie {#watching-a-campaign-round-as-a-series}

Carrega juntes les gravacions d'una ronda —els fitxers amb la mateixa `campaign`— i el visor les reprodueix com una sola sèrie: sessió rere sessió en el seu ordre real, amb les hores o els dies entre dues retallats a una pausa d'un minut. La línia de temps marca l'inici de cada sessió en groc i les pauses com a franges fosques, i el rellotge diu quina sessió s'està reproduint i la seva data real (`session 4/12 · 2026-11-02 12:38 UTC`). La calor, la repetició, els filtres i **Troballes** funcionen sobre tota la sèrie com sobre qualsevol dada carregada. La secció **Ronda de campanya** de la pestanya **Partida** llista les sessions amb les seves dates, quants llocs disputats tenia cada bàndol a cada inici —també com a gràfic al llarg de la ronda— i quants se'n van prendre abans; un clic porta a l'inici d'una sessió. Una gravació carregada sola hi diu quina ronda i sessió és. Les gravacions de rondes diferents carregades juntes no són una sèrie: cadascuna comença a zero, com fan les partides separades. El carregador de moltes partides (**Moltes partides alhora**) també reprodueix una ronda com una sèrie, en streaming i ajustada a la GPU, per a rondes de molts gigabytes.

Els llocs que van canviar de mans durant la ronda es dibuixen al mapa com a zones de captura, acolorides pel bàndol que tenia cadascun a l'inici de la sessió que s'està reproduint, i canvien als límits entre sessions; cada canvi és una captura a la llista d'esdeveniments de la repetició. Es dedueixen de les files carregades —les unitats terrestres i els estàtics de cada sessió en els seus primers minuts, en cel·les d'uns 2 km, com fa la cadena—, així que necessiten el carregador complet (el carregador de moltes partides conserva massa poc de cada fila).

**Carregar tota la ronda des d'una de les seves gravacions.** En un navegador normal, el visor no pot obrir fitxers que no hagis triat: carrega junts els fitxers de la ronda. Servit pel servidor local del visor (`npm run dev` o `npm run preview`), sí que pot: dona al `tools/local-data.json` ignorat per git una entrada `campaigns` que anomeni la carpeta dels fitxers de rondes i les carpetes de les gravacions convertides, i la secció Ronda de campanya d'una gravació sola ofereix **Carrega tota la ronda**, obté les sessions de la ronda que hi troba i les carrega amb el carregador de moltes partides:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Només se serveixen les gravacions que anomena un fitxer de rondes (`tools/campaign-files.mjs`); una sessió que no es troba en aquestes carpetes es compta, no es carrega.

Què publiquen els servidors coneguts:

| Servidor | Una ronda | Com guanya un bàndol | On es pot llegir el guanyador |
|---|---|---|---|
| SPS Contention | una campanya en un mapa i una època (dies), al llarg de molts reinicis | tots els aeròdroms, FARP i fortaleses presos; una campanya acabada sense guanyador es va rotar | el registre públic de campanyes del servidor (guanyador, inici, final per campanya) |
| Blue Flag | una ronda de campanya al llarg de moltes missions de 5 hores; el `_YYYY_MM` del Title avança un mes per reinici | totes les posicions enemigues preses; les rondes més antigues anomenaven el bàndol que en tenia més després d'un temps fix | no publicat en cap forma trobada fins ara; la cadena de les gravacions segueix cada ronda i qui té quant a cada inici |
| Growling Sidewinder | una execució de missió (6 hores) d'una missió de conflicte obert | zones i aeròdroms presos | la seva pàgina d'estadístiques mostra pilots, no resultats; cada sessió comença igual, així que cap ronda no abasta diverses sessions: buit |
| Missions contra la IA (missions de capturar zones) | una execució de missió | el bàndol dels jugadors contra la IA de la missió: cap resultat PvP | buit |
| Sense atribuir (la capçalera no anomena cap servidor) | - | - | buit, `server` també buit |

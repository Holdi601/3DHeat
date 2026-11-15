---
title: "Carregar voltes"
parent: "Anàlisi de curses"
nav_order: 51
lang: "ca"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Carregar voltes

Un fitxer de volta és un registre d'una conducció: on era el cotxe i què ha fet el pilot, moltes vegades per segon. Carrega dues voltes o més del mateix circuit i la pestanya **Anàlisi de curses** les podrà comparar.

![La secció Voltes de la pestanya Anàlisi de curses amb tres voltes de demostració carregades: llista de voltes, estrella de referència, enfocament](../assets/img/en/race-loading-laps-list.webp)

## Les primeres voltes {#your-first-laps}

1. Obre la pestanya **Anàlisi de curses**.
2. Només vols mirar? Prem **Voltes de demostració** (vegeu [Voltes de demostració](#demo-laps)).
3. Les teves pròpies voltes: grava-les al joc amb un enregistrador (vegeu [Formats de fitxer](#file-formats)). L'enregistrador escriu un fitxer per volta.
4. Prem **Carrega fitxers de volta…** i tria dos fitxers o més del mateix circuit, o prem **Carpeta…** i tria la carpeta que els conté. També pots deixar anar fitxers o carpetes sobre la vista 3D.
5. Fes clic en una volta de la llista per veure on perd temps.

**Atenció: les voltes es comparen d'un circuit en un circuit.** Carregar una volta d'un altre circuit amb nom esborra les voltes que ja hi ha carregades.

## Els botons {#the-buttons}

| Control | Fa |
|---|---|
| **Carrega fitxers de volta…** | un selector de fitxers per a `.json`, `.csv`, `.txt`, `.ibt`, `.gz` i `.h3dcars`, diversos a la vegada (`.h3dcars` és un fitxer de cotxe, vegeu [Cotxes](race-replay-and-scene.md#the-cars)) |
| **Carpeta…** | un selector de carpetes: cada fitxer de volta de la carpeta i de les subcarpetes |
| **Voltes de demostració** | tres voltes inventades d'un circuit inventat (vegeu [Voltes de demostració](#demo-laps)) |
| **Esborra** | treu totes les voltes (es mostra quan hi ha voltes carregades) |
| deixar anar a la vista | els fitxers i les carpetes deixats anar sobre la vista 3D es carreguen de la mateixa manera |

Les voltes s'**afegeixen** a les que ja estan carregades, **tret que siguin d'un altre circuit amb nom: aleshores, les voltes carregades s'esborren primer** (les voltes es comparen d'un circuit en un circuit). Els fitxers que no es poden llegir es llisten sota els botons, una línia cadascun; la resta es carrega igualment.

## Formats de fitxer {#file-formats}

El format es reconeix pel contingut, no pel nom del fitxer. En termes senzills:

- **heat3d-lap** és el fitxer que escriu l'enregistrador de 3DHeat per a la majoria de jocs.
- **FH Companion** és una eina gratuïta que registra voltes de Forza Horizon. Escriu un fitxer de volta i, al seu costat, un fitxer `.json.tele.gz` (la mateixa volta amb les dades de cada pneumàtic, comprimides amb gzip). Tria els dos junts.
- **iRacing `.ibt`** és el fitxer de telemetria propi d'iRacing; activa el registre al cotxe amb Alt+L i carrega el fitxer tal com és.
- Un **CSV de voltes** és una taula senzilla, una fila per cada instant.

| Format | Origen habitual | Llegit per |
|---|---|---|
| JSON `heat3d-lap` | `heat3d_capture telemetry --game ...` (Forza Horizon i Motorsport per Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| `.json` de volta de FH Companion | la biblioteca de voltes de FH Companion | `fromFhCompanion` |
| telemetria `.json.tele.gz` de FH Companion | al costat de cada fitxer de volta de FH Companion | `readForzaTelemetry` |
| `.ibt` d'iRacing | els fitxers de telemetria propis d'iRacing (registre activat amb Alt+L al cotxe) | `readIbt` |
| CSV de voltes | `heat3d_capture laps`, el connector de Trackmania, o qualsevol CSV amb `x`, `z`, una columna de temps i, opcionalment, una columna `lap` | `fromCsv` |

Com es grava cada joc i què envia, ho documenten els enregistradors:
[GameCapture: jocs](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
i [GameCapture: el format de volta](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Vegeu també [Altres jocs de curses](other-games.md).

## Carpetes i circuits {#folders-and-courses}

**Carpeta…**, o una carpeta deixada anar, porta tots els fitxers que hi ha a sota. Dins d'una carpeta només es consideren els fitxers acabats en `.json`, `.csv`, `.txt`, `.ibt` o `.tele.gz`, i un `.json` que no és una volta (el fitxer propi d'un circuit, el seu mapa) se salta sense error.

**Diversos circuits en una sola tria.** La biblioteca de voltes de FH Companion guarda cada circuit en una carpeta anomenada `<nom del circuit> (course_<x>_<z>_to_<x>_<z>)` (o un simple `course_...` per a un circuit sense nom). Quan els fitxers triats estan en més d'una d'aquestes carpetes de circuit, no es carrega res; en lloc d'això, la secció **Voltes** diu "Són voltes de N circuits, i les voltes es comparen d'un circuit en un circuit. Tria'n un:" i llista cada circuit amb el seu nombre de voltes (fitxers acabats en `.json`, `.csv` o `.ibt`, sense comptar `course.json`), les que en tenen més primer. En fer clic en un, es carreguen els fitxers d'aquell circuit.

Un circuit es identifica pel seu nom i pel seu punt de **inici**, no pel final: les curses que mai no han acabat són guardades per FH Companion amb el mateix nom i inici (dins de `unfinished/`), amb on s'han aturat com a final, i van amb el seu circuit, marcades com a **parcials** a la llista.

**Diverses pistes entre els fitxers triats.** Quan els fitxers triats directament (no des de carpetes de circuits) són voltes de més d'una pista amb nom, s'ofereix la mateixa tria per pista; les voltes que no tenen cap nom de pista s'afegeixen a la pista que s'hagi triat.

## Noms de cotxe {#car-names}

Una volta es crida pel nom complet del seu cotxe, tal com el dona el joc. Quan el fitxer de volta no diu el nom del cotxe:

1. **La carpeta.** La biblioteca de FH Companion guarda les voltes a
   `<circuit>/<classe>/<nom del cotxe> '<yy> (car<número>)/<posada a punt>/<etiqueta>/<volta>.json`.
   La carpeta més interna que coincideix amb `<nom> (car<número>)` dona el nom i el número; una que coincideix amb `car<número>`, només el número. Només les tries de carpetes i les carpetes deixades anar porten aquest camí.
2. **Una altra volta del mateix cotxe.** Quan una volta ja diu el nom d'un cotxe, cada volta amb el mateix joc i el mateix número de cotxe rep aquell nom: les voltes carregades juntes, i les carregades després en aquest navegador; els noms es guarden a `localStorage` sota `heat3d.carNames` (indexat com `<joc>:<número de cotxe>`). En una finestra privada duren només mentre durin les voltes.
3. Si no, "car 1234" pel seu número, o "car".

**Etiquetes.** A la llista de voltes, una volta mostra el nom del seu cotxe; diverses voltes del mateix cotxe es numeren "Nom #1", "Nom #2". Les frases de l'anàlisi fan servir les mateixes etiquetes quan són úniques; si no, el nom del cotxe amb el temps de volta, "Nom (1:29.616)" (temps d'exemple), i si encara no és únic, es numera més.

**Agrupació.** Les voltes pertanyen al mateix cotxe (per a envolupants, perfils i comparacions) quan el seu número de cotxe (o el nom, si no n'hi ha número) i el seu índex de rendiment són iguals (`carKey`): el mateix model amb una posada a punt diferent és un cotxe diferent.

**Classes.** La classe de rendiment d'una volta és la del joc (Forza D..X, el nom curt de classe de cotxe d'iRacing); les estadístiques les ordenen D, C, B, A, S1, S2, R, X i després les altres per ordre alfabètic.

## Voltes de demostració {#demo-laps}

**Voltes de demostració** carrega tres voltes d'un circuit inventat (quatre rectes i quatre revoltes a la dreta), fetes amb un model senzill de vehicle
([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)):
la velocitat de cada revolta limitada per l'adherència, una passada d'acceleració cap endavant i una passada de frenada cap enrere, com ho fa un simulador de voltes.

| Volta | Cotxe | Errors |
|---|---|---|
| neta | Cotxe d'adherència | cap |
| amb errors | Cotxe d'adherència | frena 35 m abans cap a T2, torna a l'accelerador 30 m tard a la sortida de T3, pren T4 a 0,88 de la seva velocitat, condueix 1,2 m cap a un costat |
| altre cotxe | Cotxe de potència | cap; condueix 1,2 m cap a l'altre costat |

| Cotxe (número) | Adherència | Frenada | Tracció | Potència/massa | Arrossegament |
|---|---|---|---|---|---|
| Cotxe d'adherència (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Cotxe de potència (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

La volta amb errors és l'enfocada. El circuit està dibuixat com Forza manté el seu món (de mà esquerra), de manera que, exactament com una volta real de Forza, surt emmirallat, i la pestanya ofereix **Inverteix X**. Les tres voltes porten dades per roda, de manera que totes les parts de la pestanya tenen alguna cosa per mostrar.

## La llista de voltes {#the-lap-list}

Cada fila, d'esquerra a dreta:

| Element | Fa |
|---|---|
| ● / ○ | mostra / amaga la volta (línies, cotxe, fitxa, gràfics); les voltes amagades igualment s'analitzen |
| traç de color | el color de la volta |
| nom i etiquetes | fes clic per **enfocar** la volta; en passar-hi el ratolí, el seu fitxer d'origen i el cotxe (nom · classe PI · tracció) |
| ⌖ | segueix aquest cotxe amb la càmera (fes clic de nou per parar) |
| ★ | compara-ho tot amb aquesta volta (la fa la referència); desactivat a la referència |
| × | treu la volta |

**Etiquetes:** *referència*; *la millor de X* (o *la millor de la seva classe*) a la volta més ràpida d'una classe quan n'hi ha diverses; *parcial* en una conducció que no ha arribat a la meta.

**La segona línia:** la classe (només amb diverses classes), el temps de volta (`1:29.616`), la diferència respecte a la volta amb què es compara (la millor de la seva classe, o la referència) com `+0.512` (exemple), i *comença tard* quan la volta comença més de 10 m després de l'inici de la referència.

Amb més de 8 voltes apareix una línia "N de M dibuixades" que ofereix **Mostra-ho tot** (dibuixa totes les voltes: més lent, i un embull) i **Només les que mires** (la referència, la volta enfocada i la millor de la seva classe; les estadístiques compten totes les voltes de totes maneres).

Sota la llista: la indicació d'emmirallat quan les voltes diuen que el dibuix està emmirallat (vegeu [mons emmirallats](race-replay-and-scene.md#mirrored-worlds)), i amb dues voltes o més la indicació "Fes clic en una volta per veure on perd temps …", i, amb diverses classes, que cada volta es compara amb la més ràpida de la seva pròpia classe.

### Referència i enfocament {#reference-and-focus}

- **Referència:** la volta a la qual s'alinea totes les altres i, per defecte, amb la qual es comparen. La volta **completa** més ràpida, tret que ★ n'hagi triat una altra (la primera volta carregada quan cap no és completa). Treure la volta de referència torna a l'elecció automàtica.
- **Enfocament:** la volta les troballes, el control del cotxe i els mapes de la qual es mostren. Es queda on l'ha posat l'usuari; si no, és la **més lenta** que no és la referència ("la que més cal aprendre"). Enfocar una volta també la fa visible i la millor volta de la seva classe. Enfocar la referència la compara amb l'altra volta que ha estat més ràpida en cada revolta.
- **Classes:** amb voltes de diverses classes de rendiment, cada volta es compara amb la volta completa més ràpida de la seva pròpia classe (la referència, a la classe de la referència). Vegeu [Estadístiques del circuit](race-course-statistics.md).

### Colors {#colours}

Cada volta té el seu propi color, segons la seva posició en l'ordre de càrrega, de manera que una volta conserva el seu color quan altres estan amagades. Els tons estan repartits per la roda de colors com ho fa el mode d'equip del mapa de calor amb els seus grups; per a cada posició, la lluminositat (de 0,52 a 0,66 en OKLCH) i la croma (de 0,12 a 0,18) s'escullen perquè quedin el més lluny possible de les posicions veïnes (i l'última de la primera) sota visió normal, protanòpica i deuteranòpica, cadascuna amb almenys 3:1 contra la superfície fosca del gràfic.

## Per a desenvolupadors {#for-developers}

Codi: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Com es llegeix cada format {#how-each-format-is-read}

Cada format acaba en un sol `LapTrace`: canals amb noms canònics (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ...; vegeu la [taula de canals](race-charts-and-hud.md#the-channel-table)), el cotxe, el temps de volta, si és una volta completa, i un bloc `meta`. Per a cada format, `time` i `distance` es desplacen perquè comencin a 0, i quan una font no té `speed` es calcula com la distància dividida pel temps a partir de les mostres veïnes.

#### JSON heat3d-lap {#heat3d-lap-json}

Un objecte JSON amb `"format": "heat3d-lap"`. Camps que es llegeixen:

| Camp | Ús |
|---|---|
| `channels` | un objecte de vectors, un per canal, pel nom canònic; els canals per roda com `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` i `z` són obligatoris |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | el cotxe: identificador, nom, índex de classe de Forza (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), índex de rendiment, codi de tracció (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | el temps de volta; l'últim valor de `time` quan no hi és |
| `lap.complete` | `false` marca una conducció parcial; qualsevol altra cosa és completa |
| `game`, `track` | noms; `game` decideix la disciplina (vegeu més avall) |
| `units.slipRatio` / `units.slipAngle` | com s'escala el lliscament: una unitat que conté `raw` vol dir `scaled`, `normalised` vol dir `peak`, qualsevol altra cosa `physical` |
| `meta` | `slip`, `surface`, `discipline` tal com s'hi donen, sobreescriuen el que s'ha dit més amunt |

Sense un canal `distance`, la distància se suma a partir de les posicions 3D.

#### Fitxers de volta de FH Companion {#fh-companion-lap-files}

Un objecte JSON amb un objecte `Lap` que conté un vector `samples` (una mostra cada 5 m aproximadament). Camps assignats:

| FH Companion | Canal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (desplaçat perquè la volta comenci a 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | els mateixos, en minúscules |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², malgrat el nom) |
| `Puddle` | `puddle` |

El cotxe surt de `Lap.carOrdinal`, `Lap.carName` (només fitxers nous), `Class` (o `Lap.carClass` com a índex de classe de Forza), `Lap.performanceIndex`, `Lap.drivetrain` i `Lap.peakKilowatts`; el temps, de `Lap.lapSeconds`; una conducció amb `EndedAtFinish: false` és parcial. El joc és `forza-horizon`.

Aquests fitxers no porten dades de pneumàtics ni rumb, de manera que els bloquejos, el patinatge i les relliscades no es poden jutjar només amb ells; les empenyes (a partir del volant contra la traçada) i els impactes i accidents sí. Agafa també el `.tele.gz` que hi ha al costat de cada un per a la resta.

#### Telemetria de FH Companion (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON comprimit amb gzip `{ version, columns, data }`: tot el Data Out de Forza per una volta, una fila per paquet, amb els noms de camp del mateix joc. Les columnes es busquen pel nom, mai per posició. El format 2 guarda cada paquet (uns 110 per segon, davant dels 64 tics del joc); una fila igual a l'anterior en tot excepte el rellotge propi de l'enregistrador (`t`, `metres`) es descarta, de manera que una volta es llegeix als 64 files per segon del joc. (La descripció del botó de càrrega ho diu: "per al lliscament de cada pneumàtic a 64 Hz".)

| Camp de Data Out | Canal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (marc del cotxe: x a la dreta, y amunt, z endavant) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, escalats de 0..255 a 0..1 |
| `Steer` | `steer`, escalat de -127..127 a -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, convertit de Fahrenheit a °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` per roda |

`<Wheel>` és `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. El lliscament es marca `peak` (el lliscament normalitzat de Forza: per sobre d'1 el pneumàtic ha perdut adherència).

**Aparellament.** Un fitxer de volta `<volta>.json` i un `<volta>.json.tele.gz` triats o deixats anar junts (mateix camí excepte per `.tele.gz`) esdevenen **una** sola volta: els canals de la telemetria, amb el cotxe, la classe, el temps, la pista i la marca de parcial del fitxer de volta. El nom de cotxe del fitxer de telemetria guanya quan en té un. Un `.tele.gz` sol també es carrega: els fitxers del format 2 porten `car` (`ordinal`, `name`, `class`, `pi`), `track` i `lapSeconds`; sense això, el temps de volta és la durada de la pròpia telemetria i el cotxe és desconegut.

#### iRacing `.ibt` {#iracing-ibt}

El fitxer de telemetria d'iRacing es llegeix directament (al navegador, sense conversió): la capçalera de 112 bytes, la subcapçalera de disc de 32 bytes, la taula de variables (144 bytes per canal) i el YAML de la sessió.

- **Canals obligatoris:** `SessionTime`, `Lap`, `Lat`, `Lon`. Sense ells: "… no té els canals SessionTime, Lap, Lat i Lon: és un fitxer de telemetria d'iRacing?"
- **Posicions:** la latitud i la longitud es desplegen en metres sobre un pla tangent al primer punt GPS no nul (radi de la Terra 6 371 008,8 m): x cap a l'est, z cap al sud, y l'altitud (`Alt`); així, amb la càmera per defecte al nord, és amunt a la pantalla. No és el marc propi del circuit: un model extret del circuit no quadraria.
- **Voltes:** la sessió es parteix quan canvia `Lap`; una volta es manté quan té més de 60 mostres, comença per sota del 5 % de `LapDistPct` i acaba per sobre del 95 %. Les voltes parcials es descarten. Si no en queda cap: "… no té cap volta completa del circuit de N km" (la longitud del circuit surt del YAML) o "… no té cap volta completa".
- **Distància:** `LapDist` des de l'inici de la volta; si no hi és, sumada a partir de les posicions.
- **Cotxe:** de `DriverInfo`: el `CarScreenName` del jugador, el `CarID` (com a número de cotxe) i el `CarClassShortName` (com a classe). Pista: `TrackDisplayName`, o si no `TrackName`.

Canals assignats:

| iRacing | Canal | Conversió |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | els mateixos noms | - |
| `Clutch` | `clutch` | `1 - v` (iRacing compta l'embragatge; el nostre és el pedal) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radians en sentit antihorari a -1..1 dreta positiva; màxim com a mínim 0,1, π si no hi és) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | els mateixos, en minúscules | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | dividit entre 100 quan és superior a 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | temperatura del nucli central de la carcassa |
| `LFshockDefl` ... | `suspensionM.FL` ... | deformació de l'amortidor, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa a psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Prefixos de roda: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Qualsevol altre** canal amb un valor per mostra (no del tipus de camp de bits) es passa tal qual amb el seu propi nom: per roda quan comença amb un prefix de roda (`RRspeed` esdevé `speed.RR`), de manera que els gràfics i les llistes de valors de les fitxes ofereixen tots. iRacing no registra lliscament de pneumàtics: el control del cotxe es jutja per l'angle de deriva (`Yaw`, ajustat a la direcció de marxa, contra on va el cotxe) i pel volant contra la traçada. La velocitat de guinyada contra l'acceleració lateral només s'usa quan no es pot ajustar el rumb, de manera que no hi ha angle de deriva (vegeu [Esdeveniments de control del cotxe](race-control-events.md)).

Errors: "… és massa curt per ser un fitxer .ibt", "… no té una capçalera de telemetria d'iRacing", "… no té cap posició registrada".

#### CSV de voltes {#lap-csv}

Una fila per mostra; diverses voltes en un sol fitxer es distingeixen per una columna `lap`. El separador es detecta a partir de les cinc primeres línies. Una primera línia opcional `# { ...json... }` descriu la conducció: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Columna (sense distingir majúscules) | Canal |
|---|---|
| `x`, `y`, `z` | posició (`x` i `z` obligatòries) |
| `elapsed` o `time` | `time` (obligatori per volta) |
| `metres` o `distance` | `distance` (si no, sumada a partir de les posicions) |
| `speed_ms` o `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | els mateixos |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| qualsevol nom de canal canònic, p. ex. `latVel`, `slipIndex.FL` | ell mateix |
| `lap` | a quina volta pertany una fila |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | temps de volta, número de cotxe, classe, PI, circuit (de la primera fila de cada volta) |

Sense descripció, el joc es pren com a `forza-horizon` i cada volta com a completa. El origen d'una volta es mostra com `<fitxer> · <volta>` quan el fitxer en conté diverses. Errors: "… no té files", "… no té columnes x i z", "… no té voltes amb una columna de temps".

#### Disciplina i superfície {#discipline-and-surface}

Què assumeix l'anàlisi d'una volta quan la volta no ho diu (`lap.ts`):

- **Disciplina:** `meta.discipline`; si no, un nom de joc que coincideix amb `rally|wrc|dirt|rbr` és **ral·li**, `trackmania` és **arcade**, qualsevol altra cosa **circuit**.
- **Superfície:** `meta.surface`; si no, pel nom de la pista i la font: un ral·li amb nom `monte` és **mixt**; `snow|ice|winter|arctic|sweden` és **neu**; els ral·lis d'asfalt (Espanya/España/Catalunya/Costa Daurada, Croàcia/Hrvatska, Europa Central, Alemanya/Deutschland, Japó, Còrsega/Corse, Ypres, o les paraules tarmac/asphalt) són **asfalt**; qualsevol nom amb `scramble|trail|cross country|dirt|gravel` és **terreny solt**; una altra etapa de ral·li es jutja per com s'ha conduït el cotxe: sobre les mostres més ràpides de 12 m/s i a terra (almenys 200 d'elles), un percentil 95 d'acceleració lateral de 10 m/s² o més juntament amb una deriva mediana per sota de 6° (agafada on el cotxe girava al 70 % d'això o més, almenys 30 mostres) és asfalt; qualsevol altra cosa, o massa poca informació per decidir-ho, és solt. Un nom que no és de ral·li però que porta `rally` és solt; tota la resta, asfalt.
- Per mostra, un canal `loose` (la vibració del terreny de Forza, els materials de Trackmania; vegeu [Esdeveniments de control del cotxe](race-control-events.md#the-ground)) substitueix la superfície de la volta.

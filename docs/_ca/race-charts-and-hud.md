---
title: "Gràfics i HUD"
parent: "Anàlisi de curses"
nav_order: 53
lang: "ca"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Gràfics i HUD

Els gràfics alineen les voltes metre a metre, perquè vegeu on un pilot va frenar més tard o va aixecar el peu abans. Les targetes de dalt a l'esquerra de la vista mostren què fa ara mateix cada cotxe i pilot.

![Gràfics sota la vista: files de desfasament, velocitat, accelerador, fre i direcció per a dues voltes, les tires de temps i causa a dalt, i el cursor amb les targetes](../assets/img/en/race-charts-rows.webp)

## Els gràfics {#the-charts}

Cada volta en un mateix eix de distància -metres al llarg de la referència (vegeu
[un eix de distància](race-corner-analysis.md#one-distance-axis))- de manera que la
mateixa x és el mateix lloc de la pista per a cada volta. Una volta es grafica sola
(i es reprodueix); una segona del mateix recorregut es grafica contra ella. Sense
voltes carregades (o quan l'anàlisi ha fallat) l'àrea diu "Els gràfics apareixen quan
es carrega una volta; carregueu-ne una altra del mateix recorregut per comparar les
dues."

### Què hi ha en ells {#what-is-on-them}

- **La llegenda**: el color i l'etiqueta de cada volta graficada, la referència marcada
  "(referència)"; "+N més dibuixades, no en gràfic" quan hi ha més voltes visibles que
  les graficades; **Gràfics (N) ▾**; **Volta sencera** quan hi ha zoom; una línia
  d'ajuda.
- **Dues tires** a dalt, per a la volta enfocada:
  - *temps*: el [mapa de temps](race-replay-and-scene.md#time-map-where) com a tira,
    vermell quan perd temps, verd quan en guanya;
  - *causa*: cada una de les seves pèrdues com una barra sobre on és la seva causa, en
    el color de la causa; passeu el ratolí per una barra per veure el seu títol i cost.
- **Franges de revolt**: una franja ombrejada des de l'entrada fins a la sortida de cada
  revolt (tal com es troba a la referència) i el seu nom (`T1` …) sota l'eix, al vèrtex.
- **La troballa seleccionada**: una franja del color de la seva causa sobre el seu rang.
- **Les files** (gràfics), una per canal triat, cadascuna amb el seu nom i la part de
  dalt i de baix del seu rang a l'esquerra, i una línia de zero on el rang creua el zero.
  Cada volta és una línia del seu color: la volta enfocada de 2 px d'amplada i opaca, la
  referència opaca, les altres d'1,5 px al 75 %. La fila del desfasament deixa fora la
  referència (és zero respecte a si mateixa).
- **El cursor**: una línia vertical on és el cotxe de referència (o on és el punter), i
  un punt per cotxe a cada fila excepte la del desfasament -amb el cursor, cada cotxe és
  al mateix metre; en cas contrari, la distància pròpia de cada cotxe al rellotge de la
  repetició.

Com a màxim es graficuen **8** voltes: primer la volta enfocada, la millor de la seva
classe i la referència, i després les altres en l'ordre de càrrega.

### Files i les seves alçades {#rows-and-their-heights}

Les files comparteixen l'alçada del gràfic segons el seu pes, cap de menys de 16 px:

| Fila | Pes |
|---|---|
| Desfasament (respecte a la referència, segons, amb signe) | 1,7 |
| Velocitat (km/h) | 1,7 |
| un pedal (accelerador, fre, embragatge) | 1 |
| direcció | 1,1 |
| marxa | 0,8 |
| un llum (fre de mà, ABS …) | 0,55 |
| qualsevol altra cosa | 1 |

Un canal amb un rang de visualització fix a la taula (pedals 0-100 %) l'usa; els altres
s'ajusten a la part visible de les voltes. Un nom de fila massa llarg per a l'espai (una
paraula llarga en un altre idioma) baixa el valor de dalt una línia on la fila és prou
alta, i es talla amb punts suspensius on no ho és; el nom complet és la informació
emergent.

### Els gràfics per defecte {#the-default-graphs}

Fins que no se'n trien: el **desfasament**, i després tots els canals que la taula marca
com a `graph` i que les voltes tenen -accelerador, fre, embragatge, fre de mà, direcció,
marxa, velocitat- excepte que un canal de pedal o de llum s'omet tret que alguna volta
el mogui per sobre de 0,02 (un embragatge que mai no es prem no és un gràfic). L'ordre és
el de la taula.

### El selector de gràfics {#the-graph-picker}

**Gràfics (N) ▾** obre un panell sobre el botó:

- una caixa de filtre (coincideix amb el nom o l'identificador d'un canal);
- **Per defecte** (torna al conjunt per defecte; la seva informació emergent diu quants
  n'hi ha) i **Tanca**;
- *Desfasament respecte a la referència*, i després cada canal que porten les voltes
  graficades, agrupat (moviment, comandaments, motor, ajudes, pneumàtics, frens,
  suspensió, rodes, altres, temps, posició), amb una casella cadascun; un canal per roda
  és una línia amb una pastilla per roda (FL, FR, RL, RR).

Marcar una casella manté l'ordre de la taula, sigui quin sigui l'ordre de marcat. La
tria es manté fins a **Per defecte** o fins a recarregar. Els canals que la taula no
coneix s'ofereixen sota *altres*, amb el nom del seu propi identificador ("brakeLinePress"
→ "Brake line press").

### Ratolí, roda, zoom, clic {#hover-wheel-zoom-click}

| Entrada | Fa |
|---|---|
| passar el ratolí | cada cotxe, la seva targeta i els seus comandaments es mouen a aquell metre; un poste el marca a la pista; una taula llista el valor de cada volta graficada en cada fila allà (el desfasament mostrat com "ref" per a la referència); sobre les targetes, "a N m - el cursor dels gràfics". En sortir del gràfic es torna a la repetició |
| roda | avança la repetició al llarg de la volta 1/200 del tram visible per cada gir (Majúscules: 5×), aturant la repetició; quan hi ha zoom, la vista segueix el cursor |
| Ctrl+roda (Cmd+roda) | fa zoom sobre l'eix de distància al voltant del punter, 1,25× enfora / 0,8× endins per cada gir, mai més estret de 40 m; allunyar-se fins a la volta sencera acaba el zoom |
| roda lateral | desplaça quan hi ha zoom (10 % del tram per cada 100 unitats de desplaçament) |
| doble clic, **Volta sencera** | allunya el zoom |
| clic | salta la repetició a on la referència arriba a aquell metre |
| Majúscules+clic | alinea els cotxes allà (vegeu [alinear](race-replay-and-scene.md#lining-up)) |

Els gràfics es tornen a dibuixar en l'idioma actual quan canvia.

La línia d'ajuda de la llegenda diu el mateix en curt: "Passar el ratolí: tots els cotxes
allà · roda: avança per la volta · Ctrl+roda: zoom · clic: salta · Majúscules+clic:
alinea".

## Les targetes dels cotxes (HUD) {#the-car-cards-hud}

A dalt a l'esquerra de la vista, una targeta per volta visible -com a màxim **6**, les
sis primeres voltes visibles en ordre de càrrega- per al moment en què està la repetició
(o el cursor dels gràfics).

**Capçalera:** el color i l'etiqueta de la volta; el desfasament en directe -el temps
d'aquesta volta per arribar a la seva distància actual menys el temps de la referència
per arribar a la mateixa distància, "+0,48 s"- o "referència"; **⋯** per mostrar o
amagar tots els altres valors (el mateix que *Tots els valors a les targetes*). La
targeta del cotxe perseguit es ressalta.

**El cotxe vist des de dalt:** el contorn de la carrosseria en el color de la volta amb
una fletxa al davant, quatre pneumàtics (els de davant girats fins a 28° amb la direcció),
cadascun acolorit segons la seva temperatura, amb els mateixos símbols que el cotxe 3D
dibuixat pla: anell de lliscament, barra de suspensió, brillantor del fre, banda de
desgast, barra de càrrega.

**Lectures:** la velocitat en km/h, el temps propi de la volta, la seva distància al llarg
de la referència.

**Comandaments:**

- un volant girat pel comandament de direcció (el gir complet es dibuixa com a 180°) amb
  el percentatge sota seu;
- una barra per pedal, d'esquerra a dreta com en una caixa de pedals -embragatge, fre,
  accelerador- cadascuna amb el seu percentatge i el nom curt, en el seu color (només els
  pedals que porta la volta);
- la marxa (R per a marxa enrere, N per a punt mort);
- un llum petit per cada canal de connectat/desconnectat que porta la volta -fre de mà,
  ABS, TC, DRS, limitador de box, a l'aire- encès en el seu color mentre està activat
  (per sobre de la meitat del seu rang);
- una lectura per cada canal de nivell: repartiment de frenada, ajustos d'ABS i TC,
  impuls, combustible.

**La traça dels comandaments:** els últims **6 segons** de cada pedal (un carril, cadascun
en el seu color) i la direcció (el seu propi carril, centrat), acabant en aquest moment
-què va fer el pilot en el camí cap a ell. Fins a 160 punts.

**Tots els valors** (⋯ o *Tots els valors a les targetes*): cada altre escalar que porta la
volta en aquest moment, i després cada canal per roda com a quatre valors (FL FR RL RR),
amb el nom de la taula de canals o del propi nom del canal, ordenats per grup.

## Per als desenvolupadors {#for-developers}

Codi: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### La taula de canals {#the-channel-table}

`CHANNELS` a [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts)
és l'únic lloc on es descriu un canal: la seva unitat, si és un valor per mostra o un per
roda (guardat com `name.FL` …), el seu grup, un rang de visualització, com es dibuixa al
cotxe (`glyph`), com apareix a la targeta (`input`: `pedal`, `steering`, `gear`, `lamp`,
`level`), si és un gràfic per defecte, si salta en lloc de barrejar-se (marxa, indicadors),
i com es mostra (escala, unitat, dígits). Les etiquetes i els noms curts són missatges en
cada idioma (`race.channel.<nom>.label` / `.short`).

Canals amb un dibuix o un gràfic per defecte:

| Canal | Unitat | Dibuixat com | Gràfic per defecte |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedal (verd, vermell, …), mostrat en % | sí |
| `handbrake` | 0..1 | llum | sí |
| `steer` | -1..1, positiu a la dreta | volant | sí |
| `gear` | - | marxa | sí |
| `speed` | m/s, mostrat km/h | - | sí |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | llum | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | lectura de nivell | - |
| `tireTemp` (per roda) | °C, visualització 40-130 | color del pneumàtic | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (per roda) | com l'escala el joc, visualització ±1,5 | anell de lliscament | - |
| `combinedSlip`, `slipIndex` (per roda) | visualització 0-1,5, 0-1 | anell de lliscament | - |
| `suspension` (per roda) | 0..1 | barra de suspensió | - |
| `brakeTemp` (per roda) | °C, visualització 100-900 | brillantor del fre | - |
| `tireWear` (per roda) | 0..1 | banda de desgast | - |
| `wheelLoad` (per roda) | N, visualització 0-12 000 | barra de càrrega | - |

Altres de la taula (graficats i llistats, no dibuixats): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (angle de derrapada), `loose`, `lateral` (desplaçament
respecte a la referència), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, més `time`, `distance`, `x`, `y`, `z`.

**Un canal que no és a la taula** encara es llegeix, es grafica (sota *altres*) i es llista
a les targetes, amb l'etiqueta del seu propi nom. **Per donar-li un nom, unitat i dibuix
com cal**, afegiu una entrada a la taula (i el seu missatge d'etiqueta a cada
`src/i18n/locales/<idioma>/race-channels.json`). Un *tipus* nou de dibuix de roda és una
entrada a `WHEEL_GLYPHS` (glyph.ts) i la seva bessona plana `CARD_GLYPHS` (RaceHud.tsx);
les dues estan tipades pel tipus, així que la compilació falla fins que n'existeixin
totes dues. `src/race/extensible.test.ts` comprova que els canals desconeguts arriben als
gràfics, que cada símbol de la taula es pot dibuixar i que els llums s'encenen.

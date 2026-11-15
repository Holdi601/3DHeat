---
title: "Repetició i l'escena 3D"
parent: "Anàlisi de curses"
nav_order: 52
lang: "ca"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Repetició i l'escena 3D

Reprodueix les voltes juntes, com una cursa, i mira on un cotxe es posa per davant de l'altre. Aquí es descriu tot el que es veu a la vista 3D de la pestanya **Anàlisi de curses**: les traçades recorregudes, els colors pintats a la pista, els cotxes i les etiquetes.

![Mapa de causes amb els cotxes alineats 40 m abans d'una revolta: pista de colors, dos cotxes i el pal de la bandera](../assets/img/en/race-replay-lined-up.webp)

## El rellotge de la repetició {#the-replay-clock}

Un sol rellotge mou totes les voltes: segons de la volta de **referència**. El motor l'avança a cada fotograma mentre es reprodueix (pel temps del fotograma × la velocitat de la repetició); al final torna a 0 quan **Bucle** està activat, si no, s'atura. El rellotge no forma part del magatzem a propòsit, perquè la barra lateral no es torni a dibuixar a cada fotograma; l'HUD i els gràfics se subscriuen a ell i s'actualitzen com a màxim un cop per fotograma.

**La durada de la repetició** és el temps més llarg que cap volta arriba al rellotge: el temps de cada volta (menys el seu desplaçament a *Alineats*), o el temps de la referència a *Colze a colze*.

## La barra de transport {#the-transport-bar}

Sota la vista, d'esquerra a dreta:

| Control | Fa |
|---|---|
| ⏮ | torna a l'inici (també **Inici**) |
| ▶ / ❚❚ | reprodueix / pausa (també **K**) |
| velocitat | 0,25×, 0,5×, 1×, 2×, 4× |
| control lliscant de posició | fixa el rellotge directament, en passos de 0,01 s |
| rellotge | `temps / durada · metres`: el rellotge com a temps de volta, la durada de la repetició, i quant avança per la referència el cotxe de referència |
| *Des de la línia* / *Alineats* / *Colze a colze* | el mode de repetició (més avall) |
| **Alinea aquí** | posa cada cotxe on és ara la referència, i continua des d'allà |
| **Bucle** | torna a començar al final (activat per defecte) |
| **Amaga els gràfics** / **Mostra els gràfics** | els gràfics de distància sota la barra |

Els botons estan desactivats fins que hi ha voltes carregades (una volta n'hi ha prou per repetir-la; les comparacions en necessiten dues).

## Modes de repetició {#replay-modes}

Com el temps de cada volta segueix el rellotge:

| Mode | Temps de cada volta | Què mostra |
|---|---|---|
| **Des de la línia** (`start`) | el mateix rellotge | cada volta des del seu propi inici: una cursa entre elles, amb la diferència creixent com ho feia a la pista |
| **Alineats** (`anchor`) | el rellotge més el desplaçament de la volta | cada cotxe al mateix punt en el mateix moment, i després es deixa anar: què passa a partir d'aquell punt, no des de l'inici de la volta |
| **Colze a colze** (`locked`) | el moment en què la volta ha arribat a la distància actual de la referència | cada cotxe mantingut a la distància de la referència tota la volta: velocitats i accions comparades metre a metre |

Fes-ho servir quan:

- **Des de la línia**: vols veure qui va per davant i com creix la diferència.
- **Alineats**: vols saber què passa en una revolta o en una recta, amb tothom començant a la mateixa altura.
- **Colze a colze**: vols comparar què fan els pilots amb els pedals i el volant en el mateix lloc del circuit.

**Desplaçaments en *Alineats*:** per a un punt d'ancoratge a `s` metres al llarg de la referència, el desplaçament de cada volta és el seu propi temps a `s` menys el temps de la referència a `s`, tots dos llegits de les voltes alineades (vegeu [un eix de distància](race-corner-analysis.md#one-distance-axis)). Una volta que no arriba a `s` es queda amb desplaçament 0. En triar *Alineats* als botons de mode, l'ancoratge es fixa a la distància actual de la referència.

Un pal blanc amb una bandera (14 m d'alt) marca el punt d'ancoratge en el mode *Alineats*.

### Alinear {#lining-up}

| Acció | Punt d'ancoratge | Rellotge |
|---|---|---|
| **Alinea aquí** | on és ara la referència | sense canvis |
| Majúscules+clic sobre els gràfics | el metre on s'ha fet clic | 1,5 s abans que la referència hi arribi |
| una troballa a *On millorar*, una insígnia numerada a la pista, una fila de *Revolta a revolta* amb una troballa | 40 m abans d'on comença la causa de la troballa | 1,5 s abans d'aquell punt; després es reprodueix |
| un esdeveniment de control del cotxe, l'etiqueta d'un impacte | 40 m abans de l'esdeveniment | 1,5 s abans; després es reprodueix |
| una volta de les estadístiques del circuit | com la seva troballa o esdeveniment | com més amunt, amb aquella volta enfocada |

Mirar una troballa també l'enquadra amb la càmera: una esfera al voltant del mig del rang de la troballa, amb un radi que és el més gran entre 40 m i la meitat de la seva longitud més 30 m (60 m per a un esdeveniment), tret que la càmera estigui seguint un cotxe.

### Càmera de persecució {#chase-camera}

⌖ a la llista de voltes fa que la càmera segueixi aquell cotxe: 2,5 + 4 × la mida del cotxe metres darrere seu i 0,9 + 1,1 × la mida del cotxe metres per sobre, mirant en la direcció de la seva marxa, inclinada cap avall cap al cotxe, suavitzada (un 20 % del camí a cada fotograma) perquè no tremoli amb cada oscil·lació. ⌖ de nou l'allibera. El cotxe perseguit es dibuixa una mica més clar, amb un anell blanc a terra, i la seva fitxa es ressalta.

## La secció Vista {#the-view-section}

| Control | Per defecte | Fa |
|---|---|---|
| **Línies** / **Mapa de temps** / **Mapa de causes** / **Mapa d'errors** | Mapa de temps | què es pinta al llarg de la pista (més avall); *Línies* no pinta res |
| llegenda | - | *guanya ↔ perd* per al mapa de temps, els colors de causa per al mapa de causes, *poques voltes ↔ la majoria de voltes* per al mapa d'errors |
| **Traçades recorregudes** | activat | la traça de cada volta visible en el seu color |
| **Cotxes** | activat | els cotxes, i les fonts de les fitxes de l'HUD |
| **Pneumàtics i suspensió** | activat | temperatura del pneumàtic, anells de lliscament, barres de suspensió i altres símbols per roda, i els fanals del sostre dels cotxes |
| **Etiquetes** | activat | noms de revoltes, insígnies numerades, etiquetes d'impacte, les etiquetes de revolta del mapa d'errors |
| **Pista a partir de les voltes** | activat | una superfície de carretera per a un circuit sense model extret (amagada mentre hi ha un model de circuit carregat) |
| **Tots els valors a les fitxes** | desactivat | cada canal llistat a cada fitxa de l'HUD |
| **Formes reals dels cotxes** | activat | cada cotxe amb la forma del seu equivalent (vegeu [Els cotxes](#the-cars)); desactivat: el monoplaça obert, que no amaga res de la telemetria |
| **Mida del cotxe** | 1× | d'1× a 10× en passos de 0,5; 1× és la mida real del cotxe, tan llarg i ample com al joc. Res més que aquest control lliscant la canvia |

## Traçades recorregudes {#driven-lines}

La traça de cada volta visible a través de les seves pròpies mostres, en el seu color, dibuixada 0,12 m per sota de la posició registrada (la posició registrada d'un cotxe és el seu punt de referència, de 0,28 a 0,47 m per sobre de la carretera en circuits extrets de Forza). Es guarda un punt cada 1,5 m; amb més de 10 voltes visibles, les voltes que no s'estan mirant en guarden un cada 6 m (cada vèrtex va a la GPU a cada fotograma).

## Els mapes {#the-maps}

Els tres són cintes sobre la traçada de la **referència**, 0,2 m per sota de les posicions registrades, un quadrilàter per cada pas de 2 m de la graella.

### Mapa de temps (`where`) {#time-map-where}

Per a la volta enfocada: segons guanyats o perduts per metre contra la volta amb què es compara en aquell punt (la millor de la seva classe, o, per a la referència, la volta més ràpida per cada segment), a partir del canvi del delta alineat per pas de graella, suavitzat ±10 m. Vermell on perd temps, verd on guanya, gris entremig; l'escala de colors és el percentil 95 dels valors absoluts, de manera que els pics s'escapcen i la major part de la volta és dins del rang. 6 m d'amplada.

### Mapa de causes (`why`) {#cause-map-why}

Per a la volta enfocada: cada pèrdua pintada sobre el rang on hi ha la seva **causa** (no on es veu el temps), de color segons el grup de la causa, guanyant la troballa més cara on se solapen dues. Amplada `3 + 9·√(cost / cost més gran)` metres; on no s'ha perdut res, una franja grisa de 2 m. La troballa seleccionada a *On millorar* es pinta de blanc.

| Grup | Color | Troballes |
|---|---|---|
| frenada | taronja | pèrdues de conducció en la fase de frenada |
| entrada | magenta | pèrdues de conducció en entrar i pel centre |
| sortida | blau | pèrdues de conducció en sortir |
| recta | groc | pèrdues de conducció a la recta |
| cotxe | gris | el que explica el cotxe |
| context | gris fosc | la situació (una sortida de cursa contra una volta llançada) |

### Mapa d'errors {#mistake-map}

Quantes de totes les voltes (de les classes triades a les estadístiques del circuit) han fet un error a cada metre: de qualsevol tipus, o només el triat a les estadístiques. Cada volta compta una vegada per metre; el rang de cada error s'amplia 6 m a cada costat perquè un de curt es vegi. Amplada `3 + 10·(voltes / la majoria de voltes)` metres i un color que va del marró apagat al taronja brillant; gris de 2 m on cap volta n'ha fet cap. Vegeu [Estadístiques del circuit](race-course-statistics.md#the-mistake-map).

## Pista a partir de les voltes {#track-from-the-laps}

Per a un joc el circuit del qual no s'ha extret, es dibuixa una carretera sota les línies: tan ampla com s'escampen les voltes sobre la referència (compten els desplaçaments laterals dins de 25 m), més 2 m a cada costat, almenys 4 m a cada costat de la línia de referència, suavitzada ±8 punts de graella (±16 m), en gris asfalt amb línies de vora clares, 0,3 m per sota de les posicions registrades. Amagada mentre hi ha un model de circuit carregat a **Nivell**.

## Xocs i accidents a la pista {#hits-and-crashes-on-the-track}

Els impactes i accidents de cada volta visible (vegeu [Esdeveniments de control del cotxe](race-control-events.md#hits-and-crashes)) es marquen on han passat, sempre que es dibuixen línies o cotxes: una estrella puntiaguda, vermella per a un accident i ambra per a un impacte, sobre un pal, amb un anell del color de la volta a la base, de la mida del cotxe (els accidents més grans). Quan un cotxe passa pel moment d'un impacte, un anell de xoc s'estén des d'allà durant 0,8 s.

## Mode d'ajuda {#help-mode}

**?** al costat del selector d'idioma, o la tecla **?** o **F1**, activa una clau de cada color de la pantalla, a les tres pestanyes ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). L'elecció es queda en aquest navegador.

- **La clau** al cantó de la vista llista els colors de la pestanya i del mode en ús. Cada gradient surt d'on el treu la vista, de manera que un gradient de calor que hagis editat es mostra com a editat. A la pestanya de curses, només es llisten les coses que porten les voltes carregades.
- **La fitxa de cada cotxe** guanya una taula amb el que es dibuixa a les seves rodes, pel nom, amb el valor de cada roda en el color en què es dibuixa.
- **El cotxe enfocat** rep una etiqueta a cada roda que diu el mateix, col·locada cap enfora, a les cantonades. S'amaga quan el cotxe és massa petit a la pantalla perquè hi càpiguen.

## Els cotxes {#the-cars}

**Cada cotxe amb la seva pròpia forma**, en el color de la seva volta i a la seva mida real. Les formes surten d'un fitxer de cotxe, fet una vegada a la màquina on hi ha el joc:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Sense un, cada cotxe es dibuixa com **el cotxe propi del visualitzador** del seu tipus i època: berlina, coupé, hatchback, familiar, esportiu, superesportiu, muscle car, tot terreny, pickup, furgoneta o microcotxe, cadascun com a clàssic (abans de 1980), dels anys 80 i 90, o modern ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Aquests es construeixen aquí a partir de proporcions generals: sense logotips, sense noms de model i res dels fitxers de cap joc, de manera que s'envien amb el visualitzador. El tipus surt del nom del cotxe, l'època de l'any que hi ha al nom; un cotxe sense cap dels dos es pren de la seva classe. Unes cent generacions reals són conegudes pel seu llarg, ample, alçada i batalla publicats ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); una línia cadascuna, arrodonida), de manera que un Sèrie 3 dels anys 90 té la mida i la postura d'aquell cotxe, encara com una forma simple, sense distintiu ni reixeta.

El fitxer de cotxe es fa a la teva pròpia màquina, a partir de la teva pròpia còpia del joc. Conté un model de baix detall de cada cotxe, d'uns 900 triangles, amb les seves posicions de roda (vegeu [l'ordre `cars` de l'extractor](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Carrega el fitxer de cotxes...** a la configuració de la vista, o deixar anar el fitxer a la pestanya de curses, el carrega; es queda en aquest navegador. Conté les formes del joc, de manera que no és una cosa per passar a algú, i el visualitzador no n'envia cap.

Quin cotxe fa de substitut de la volta es calcula a partir del que hi ha carregat cada vegada i mai no s'emmagatzema, de manera que un cotxe sense equivalent avui rep el seu propi tan bon punt un fitxer més nou el té ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Cotxe de la volta | Es dibuixa com |
|---|---|
| el seu número és al fitxer del mateix joc | aquell cotxe exacte |
| mateixa marca, i una paraula del model al nom | aquell model, el més proper en anys |
| mateixa marca, mateixa generació | el cotxe d'aquella marca més proper en anys |
| qualsevol altre, amb un fitxer de cotxes | el de la mateixa marca més proper si n'hi ha, si no, el mateix tipus de carrosseria, el més proper en anys |
| un monoplaça, pel seu nom | el monoplaça de més avall |
| cap dels dos primers, i el visualitzador coneix el cotxe per la seva mida | el cotxe propi del visualitzador a la mida real d'aquell cotxe, amb o sense fitxer |
| qualsevol altre sense fitxer | el cotxe propi del visualitzador d'aquell tipus i època |

Així, una volta d'un BMW Sèrie 3 de 1990 d'un altre joc es mostra com un BMW d'aproximadament aquell any, i un cotxe més nou que el fitxer mostra el seu parent més proper fins que es torni a fer el fitxer. La indicació d'una volta, i la línia sota la mida del cotxe per a la volta enfocada, diuen com es dibuixa i com de proper és.

Les finestres dels cotxes propis del visualitzador són fosques. Els models d'un fitxer de cotxes són d'un sol color per tot arreu, perquè el fitxer no té pintura ni vidres en què basar-se. Les rodes, els llums posteriors, els fanals i els símbols de telemetria que hi ha a continuació es dibuixen com al monoplaça; la barra de suspensió puja per l'exterior de la roda, on es veu, i els triangles de suspensió es deixen fora.

**El monoplaça** és un monoplaça obert del color de la volta, de manera que el davant es veu des de qualsevol angle i res no amaga les rodes: monocasc, cobertura del motor, pontons, cabina amb casc, halo, pla, aleró davanter i posterior; quatre rodes rodones, les davanteres giradores pel volant (fins a 0,5 rad a plena volta), cadascuna sobre dos triangles amb fusell, biela de direcció (davant) o eix de transmissió (darrere), i una barra de suspensió. El model es baixa 0,3 m de la posició registrada perquè les seves rodes quedin a la carretera, i s'escala amb **Mida del cotxe**.

**El cos es mou sobre les seves molles**: quan la volta porta els quatre recorreguts de suspensió, cada cantonada baixa pel seu recorregut (exagerat fins a 0,12 m des de la màxima extensió fins a la màxima compressió perquè es vegi des d'una càmera de persecució), i el cos s'enfonsa, cabussa i balanceja sobre el pla que formen els quatre.

**Què es dibuixa de la telemetria** (amb *Pneumàtics i suspensió* activat) segueix la [taula de canals](race-charts-and-hud.md#the-channel-table):

| Símbol | De | Dibuix |
|---|---|---|
| color del pneumàtic | `tireTemp` | el pneumàtic mateix, blau fred → cian → verd en funcionament → groc → vermell calent, de 40 a 130 °C |
| anell de lliscament | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (el més gran) | un anell a terra sota la roda, verd amb adherència disponible, ambra a 0,66, vermell a 1 (la vora de l'adherència tal com la informa el joc); feble per sota de 0,3 |
| barra de suspensió | `suspension` (0..1) | la barra de suspensió coloreada pel recorregut: blau estès, blanc al mig, vermell comprimit |
| brillantor del fre | `brakeTemp` (100-900 °C) | un disc a la cara exterior de la roda, de fosc a taronja |
| banda de desgast | `tireWear` (0..1) | una banda al voltant de la vora de la banda de rodament, blanc nou → vermell gastat |
| barra de càrrega | `wheelLoad` (0-12 000 N) | un pal al costat de la roda tan alt com la càrrega |

Els llums de fre (el llum de pluja i els extrems de l'aleró) s'encenen amb el pedal de fre. Cada canal `lamp` que està activat (per sobre de la meitat del seu rang) encén un llum sobre la caixa d'aire del seu color: ABS en acció, control de tracció en acció, DRS, limitador de pit, fre de mà, a l'aire.

**Entre molta gent** (més de 10 visibles), els cotxes que no s'estan mirant es dibuixen simples: carrosseria, aleró, rodes i llum de fre només.

## Etiquetes {#labels}

Enganxades a la pista i col·locades a cada fotograma segons la projecció de la càmera (fora de pantalla o darrere de la càmera, amagades). Amb **Etiquetes** activat:

| Etiqueta | On | Clic |
|---|---|---|
| noms de revoltes (`T1`, `T2` …) | sobre el vèrtex de cada revolta a la referència | - |
| insígnies numerades 1-5 | les cinc pèrdues de conducció més grans de la volta enfocada, al mig del rang de cada causa, amb vora del color de la causa; en passar-hi el ratolí, títol i cost | aliena i repeteix aquella troballa |
| etiquetes d'impacte / accident | sobre cada ràfega de la volta **enfocada**: "Accident −45 km/h" / "Impacte −12 km/h"; en passar-hi el ratolí, la descripció completa i el consell | alinea i repeteix l'impacte |
| etiquetes de revolta del mapa d'errors (en lloc dels noms de revolta i les insígnies, quan el mapa és el d'errors) | el vèrtex de cada revolta: "T3 · 5/40 frenada d'hora" (l'error més comú, voltes que l'han fet / voltes que han conduït la revolta), "T3 · 5/40" quan s'ha triat un tipus, "T3 · net" quan no n'hi ha cap; en passar-hi el ratolí, les pèrdues de la revolta i els seus cinc errors més comuns | obre o tanca aquella revolta a les estadístiques del circuit |

## Mons emmirallats {#mirrored-worlds}

El món del visualitzador és de mà dreta amb Y cap amunt: vist des de dalt, un cotxe la direcció de marxa del qual `atan2(dx, dz)` creix està girant a l'esquerra. Un joc amb un món de mà esquerra (Forza entre ells) surt emmirallat: cada corba cap a la dreta es dibuixa com una cap a l'esquerra, tant el circuit com les voltes.

Les mateixes voltes ho diuen ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): caminant per cada volta uns pocs metres (3 m) cada vegada, el gir de la seva traçada es compara amb la compressió de la suspensió exterior (`suspension.FR` menys `suspension.FL`) i, sense suspensió, amb el volant (positiu cap a la dreta en cada adaptador). Una volta que gira menys de π en total no diu res; l'evidència compta quan supera el 2 % del gir. Les voltes voten; un empat és "no es pot dir".

Quan el veredicte de les voltes no coincideix amb la inversió d'eixos actual (un nombre senar d'eixos invertits a **Càmera i escena → Inverteix un eix del món**), la secció **Voltes** ho diu sota la llista:

- el joc està emmirallat i no s'ha invertit res: "Aquestes voltes giren a la dreta on el circuit es dibuixa girant a l'esquerra …" amb **Inverteix X**;
- els eixos estan invertits però les voltes no estan emmirallades: "Els eixos invertits dibuixen aquestes voltes emmirallades …" amb **Restableix els eixos**.

Només canvia el dibuix: una reflexió plegada a la matriu de vista; les dades, l'anàlisi i cada coordenada que mostren les eines segueixen sent les del joc. La inversió es guarda al navegador. L'anàlisi anomena les corbes a l'esquerra o a la dreta amb la mateixa mesura (un món desconegut es pren com a emmirallat, com ho és el de Forza).

## Per a desenvolupadors {#for-developers}

Codi: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Com és un cotxe en un moment {#what-a-car-is-at-a-moment}

`stateAt` interpola cada canal entre les dues mostres que envolten el temps de la volta. Els canals que avancen per salts (marxa, indicadors) prenen la mostra més propera. Una volta que ha acabat s'aparca a la línia.

**Rumb.** La direcció de marxa surt de posicions separades uns quants metres (almenys 2 m a cada costat, perquè una oscil·lació no giri el cotxe). El rumb de la carrosseria surt de la guinyada del joc només quan està ajustada a la direcció de marxa (signe i desplaçament, per mitjana circular sobre les mostres més ràpides de 10 m/s, almenys 20) i només si després hi està d'acord (variància circular per sota de 0,05, uns 18° de dispersió); si no, la carrosseria apunta en la direcció de marxa. Així es manté visible una relliscada (carrosseria i marxa separades) sense confiar en la convenció d'angles d'un joc.

**Volant i costats.** Cap a quin costat gira el cotxe un gir positiu del volant, i a quin costat pertanyen les rodes de la dreta del joc, es mesuren a partir de la volta: el volant contra el gir de la traçada, i quina suspensió es comprimeix a l'exterior de les corbes (sense dades de suspensió, els jocs de Forza es prenen com a emmirallats).

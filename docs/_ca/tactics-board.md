---
title: "Pissarra tàctica"
nav_order: 15
has_children: true
lang: "ca"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Pissarra tàctica

La pestanya **Tàctica** és una pissarra de dibuix per a un pla d'equip: poses figuretes sobre un mapa, dibuixes fletxes per on han d'anar, i prems reproduir per veure-ho passar. Serveix per planificar una ronda o un atac abans de jugar. Comparteix el llenç, la càmera i el [nivell](levels.md) amb les altres pestanyes i res més; un pla no són dades i no dibuixa cap calor.

## El primer pla {#your-first-plan}

1. Obre la pestanya **Tàctica**. Tria el **Joc** (per exemple Counter-Strike 2) i, per a Valorant, prem **Carrega els mapes de Valorant** i tria un **Mapa**. O carrega abans un [nivell](levels.md).
2. Tria un **Bàndol** (fixa el color) i prem **Vista zenital**.
3. Tria **Lloc**, escull una figura a **Figures** (usa **Cerca figures** per trobar-ne una) i fes clic al mapa. Col·loca-ne dues o tres.
4. Tria **Fletxa**, fes clic a una figura, fes clic al llarg del camí que ha de seguir, i prem **Intro** per acabar la fletxa.
5. Prem **+** sota la vista per afegir el pas 2. Cada figura comença on ha acabat la seva fletxa. Dibuixa més fletxes allà.
6. Prem **▶** (o `K`) per reproduir el pla des del pas mostrat fins al final.
7. Posa nom al pla a **Nom del pla** i prem **Desa**.

![La pestanya Tàctica en vista zenital: joc, bàndols i eines a l'esquerra, tres figures amb fletxes de Mou, un arc de fum de Llançament, una Àrea i els passos a la part inferior](../assets/img/en/tactics.webp)

## Començar un pla {#starting-a-plan}

| Control | Què fa |
|---|---|
| **Joc** | Tria els bàndols i les figures que ofereix la paleta: Counter-Strike 2 (T, CT; jugadors i utilitats), Valorant (Atac, Defensa; jugadors i habilitats genèriques), Battlefield, Squad, Arma (infanteria, vehicles terrestres, aeronaus, barques), DCS / War Thunder / IL-2 (avions de reacció, avions d'hèlix, helicòpters, defensa antiaèria, terra, vaixells, armes), i Altres. Un pla que ja té figures manté els seus bàndols quan canvia el joc. |
| **Nom del pla** | El nom amb què es desa el pla. |
| **Mapa**, **Carrega els mapes de Valorant** | Amb Valorant triat: **Carrega els mapes de Valorant** obté la llista de mapes de [valorant-api.com](https://valorant-api.com); **Mapa** aleshores posa el minimapa del mapa triat com a nivell, enquadrat des de dalt. La imatge es baixa quan es tria i mai no s'envia amb el visor. Es mostra l'avís de Riot mentre és a la pantalla (vegeu més avall). |
| **Bàndol** | El bàndol al qual pertany la següent figura, fletxa o àrea; pren el color del bàndol. |

Sense nivell, la pissarra és el pla del terra. Carrega un nivell sota **Nivell** per planificar sobre un mapa real: un mapa de CS2 exportat amb l'eina de CS2, un nivell de la biblioteca, o una imatge de mapa.

## Eines {#tools}

| Eina | Clic | Notes |
|---|---|---|
| **Selecciona** | Una figura, un punt de ruta, una fletxa, una àrea o una nota la selecciona. | Majúscules+clic afegeix o treu; Majúscules+arrossegar dibuixa una caixa al voltant del que cal afegir. La selecció rep un giny de transformació (vegeu més avall); `Delete` o `Retrocés` la treu. `M` mou la figura seleccionada fins al següent clic. |
| **Lloc** | Col·loca la figura triada. | Una figura es tria a la paleta **Figures** (amb **Cerca figures**). Sense res seleccionat, `R` gira la següent figura 15° abans de col·locar-la (`Majúscules+R` en sentit contrari). |
| **Fletxa** | Cada clic afegeix un punt; Intro, un doble clic o un clic dret l'acaben, Esc la descarta. | **Mou**, **Atac** (cap més ample) o **Vigilar** (una línia fina a l'altura dels ulls). Una fletxa començada sobre una figura és la ruta d'aquella figura en aquest pas: quan es reprodueix, la figura la recorre, i el següent pas comença on ha acabat. |
| **Llançament** | El llançador, i després on cau. | Un arc de traç a trossos entre l'un i l'altre, i la utilitat triada (fum, flaix, molotov, ...) apareix on cau i es queda des d'aquest pas en endavant. |
| **Àrea** | El centre, i després la vora. | Un disc del color del bàndol. |
| **Nota** | On va la nota; demana el seu text. | Es mostra com una xinxeta, i el seu text a sobre. |
| **Esborra** | Una figura, fletxa, àrea o nota. | La treu des d'aquest pas en endavant; en el seu primer pas, la treu del tot. |

**Desfés** i **Refés** (`Ctrl+Z`; `Ctrl+Y` o `Ctrl+Majúscules+Z`) recorren cada canvi. Una línia sota el pla indica quantes figures, fletxes i passos té. **Vista zenital** mira directament avall (ortogràfica), **Vista 3D** torna a la perspectiva, **Fotograma** ajusta el pla, o el nivell quan el pla és buit.

**Mida de les figures** escala cada figura de la pissarra; 1× és la mida real, que des de molt amunt són uns quants píxels per a una persona.

## Moure, girar i escalar {#moving-turning-and-scaling}

Tot el que hi ha a la pissarra es pot moure com en un editor 3D: figures, utilitats, marcadors, punts de ruta individuals i fletxes senceres, àrees i notes. El que està seleccionat rep un giny al seu centre:

| Mode | Tecles | Nanses |
|---|---|---|
| **Mou** | W (o G) | Una fletxa per eix (X vermell, Y verd i amunt, Z blau) es mou al llarg seu; un quadrat es mou pel seu pla; el centre es mou sobre el nivell sota el punter. |
| **Gira** | E (o R) | Un anell per eix gira al voltant seu. Els anells d'una figura sola són el seu propi guinyada, capcineig i balanceig; un grup gira al voltant dels eixos del món pel seu centre. |
| **Escala** | R (o S) | Estén o recull la selecció des del seu centre al llarg d'un eix o per tots els costats; el radi d'una àrea creix amb ella. |

**Tecles** canvia entre W / E / R (Unity, Unreal) i G / R / S (Blender); les tecles trien el mode només quan hi ha alguna cosa seleccionada, i en cas contrari fan volar la càmera. Així, `R` vol dir **Escala** amb les tecles W / E / R i **Gira** amb les tecles G / R / S quan hi ha alguna cosa seleccionada, i gira la següent figura a col·locar quan no n'hi ha. Totes les tecles de la pissarra són a la [referència de teclat](keyboard-reference.md#tactics-board). Mantén **Ctrl** mentre arrossegues per ajustar un moviment a la **Quadrícula** (metres) o un gir al **Pas d'angle**. **Ajustar al terra** (activat per defecte) posa les persones, vehicles, marcadors, punts de ruta i àrees mogudes a la superfície del nivell; les aeronaus i els helicòpters mantenen la seva alçada, i arrossegar al llarg de la fletxa Y mai no ajusta. Arrossegar una nansa mai no mou la càmera. **Esc** cancel·la un arrossegament, i cada canvi és un pas de Desfés.

Els punts de ruta es mostren com a punts a les fletxes del pas mostrat: fes clic en un per seleccionar-lo, arrossega'l per moure'l, Delete per treure'l. La secció **Seleccionades** mostra la posició de la selecció en metres, el guinyada, el capcineig i el balanceig d'una figura en graus, i el radi d'una àrea, cadascun editable escrivint-hi.

## Temps {#timing}

La ruta d'una figura té temps: cada segment triga la seva longitud sobre el nivell -mostrejada a la superfície cada dos metres, de manera que un turó o una escala entre dos punts compta- a la velocitat del seu **mode** de moviment per a aquella figura en aquell joc, més qualsevol **espera** a un punt de ruta. La infanteria arrossega, s'ajup, camina (en silenci), corre o sprinta; els vehicles i les barques avancen amb precaució, normalment o a tota velocitat; les aeronaus i els helicòpters volen lents, de creuer, a velocitat de combat o al màxim. Un mode que el joc no té (CS2 no té sprint) pren el més proper que té. Com una pendent alenteix depèn del joc: a CS2 i Valorant només compta la distància horitzontal, com als jocs; els simuladors militars alenteixen la infanteria cap amunt (la funció d'excursionisme de Tobler) i els vehicles segons el pendent.

Les velocitats surten de taules per joc amb les seves fonts (vegeu [Velocitats de moviment](tactics-speeds.md)): CS2 segons l'arma que porta, a partir de les definicions d'armes del joc; Valorant per arma; Battlefield, Squad, Arma i els jocs aeris per tipus i classe de vehicle. **Es mou com** tria el perfil d'una figura (una arma, un tipus de vehicle); **Pròpia (m/s)** substitueix qualsevol mode per a aquella figura. Els modes tenen els noms que els mostra la pissarra: *Arrossega*, *Ajupit*, *Camina (en silenci)*, *Corre*, *Sprinta*; *Amb precaució*, *Normal*, *A tota velocitat*; *Lent*, *Creuer*, *Combat*, *Màxim*.

Cada punt de ruta mostra el temps des de l'anterior i el temps des de l'inici del pla («+3,9 s · 0:12»). La ruta de la figura seleccionada llista cada segment amb el seu mode, longitud i temps, l'espera i l'arribada. **Arribades** sota **Temps** posa cada figura amb ruta en una mateixa línia de temps, la primera arribada a dalt. Amb **Reprodueix en temps real** (activat per defecte) un pas dura fins que arriba la ruta més lenta i cada figura es mou a la seva pròpia velocitat; **Segons** és aleshores la longitud mínima del pas. **Unitats del nivell per metre** indica en quines unitats és el nivell: 39,37 per als mapes de CS2 (unitats del joc), 1 per als mapes en metres.

## Comparar amb dades de partides {#compare-with-match-data}

**Carrega fitxers de partida…** llegeix les taules de partides de CS2 del mapa (els fitxers Parquet de l'eina de CS2, tants com es vulgui; només les columnes necessàries, en segon pla); **Usa les dades carregades** pren les dades carregades al visor. Després:

- **Arribada més primerenca al mapa** acoloreix el mapa segons el temps des de l'inici de la ronda en què un jugador va arribar primer a cada lloc -el botó **Més ràpid** mostra el més ràpid de totes les rondes, **Típic (mediana)** la ronda del mig- de verd primerenc a vermell tardà, per a un bàndol o per als dos. Mostra què és possible i quan.
- La ruta seleccionada es compara amb el que han aconseguit els jugadors des del seu inici (o des de l'inici de la ronda) fins al seu final, cada final un disc del radi fixat: «Més ràpid observat 14,2 s, p10 15,0 s, mediana 18,3 s en 41 intents; el teu pla 15,1 s».
- Les velocitats que els jugadors han fet de debò -corrent, caminant, ajupits, a partir de les columnes de caminar i d'ajupir de les taules- en m/s.

## Passos {#steps}

La barra sota la vista conté els passos. Un pla comença amb un; **+** n'afegeix un, i cada figura el comença on ha acabat la seva ruta en l'últim pas; **−** treu el mostrat. **Segons** és quant triga el pas mostrat quan es reprodueix. **▶** (K) reprodueix des del pas mostrat fins al final: les figures amb ruta la recorren, les figures mogudes a un lloc nou en el següent pas hi llisquen, i la resta està quieta. Mentre es mostra un pas, el lloc de cada figura en el següent pas es dibuixa com un fantasma pàl·lid, i les fletxes de l'últim pas es veuen febles sota les d'aquest.

## Desa {#saving}

La secció **Fitxer** conté **Desa**, **Obre** i **Esborra**. **Desa** escriu el pla com a `<nom>.h3dplan.json` (JSON pla: bàndols, passos, figures amb un lloc per pas, fletxes, àrees, notes); **Obre** el torna a llegir. Un fitxer d'una altra versió, o que no és un pla, es rebutja amb el motiu. **Esborra** buida el pla; Desfés el recupera.

## Figures {#figures}

Cada figura la construeix el mateix visor: formes simples a la mida publicada d'un tipus, amb les característiques que la distingeixen de les veïnes -les rodes de carretera i la torreta d'un tanc, els canons, els míssils i els radars d'un vehicle de defensa antiaèria, la planta de les ales, la cua i els motors d'una aeronau, els rotors i les ales curtes d'un helicòpter. No es pren res de cap joc. Un disseny que un joc ha inventat es mostra com la figura genèrica de la seva classe. Vegeu [Figures](figures.md#which-figure-a-unit-gets) per saber com les dades troben la seva figura.

## Avís de Riot {#riots-notice}

Els mapes de Valorant es mostren sota la política «Legal Jibber Jabber» de Riot Games, que permet que els projectes comunitaris gratuïts els usin i demana aquest avís on apareguin: *3DHeat es va crear sota la política «Legal Jibber Jabber» de Riot Games fent servir recursos propietat de Riot Games. Riot Games no avala ni patrocina aquest projecte.* Les habilitats de la pissarra són formes genèriques, no l'art de Riot.

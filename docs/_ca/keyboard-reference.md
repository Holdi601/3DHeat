---
title: "Referència de teclat i ratolí"
parent: "Càmera i controls"
nav_order: 2
lang: "ca"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Teclat i ratolí

Totes les accions de teclat i de ratolí en un sol lloc, perquè trobis la que necessites. Fes clic primer a la vista perquè tingui el teclat. Les tecles s'ignoren mentre una caixa de text o una llista desplegable tingui el focus. La versió curta també s'imprimeix a baix a l'esquerra de la vista.

Cercador ràpid:

| Vull ... | Prem |
|---|---|
| volar | `W A S D`, arrossega per mirar |
| veure-ho tot | `F` |
| reproduir o aturar | `K` |
| reproduir cap enrere | `J` (torna a prémer per aturar), cap endavant `L` |
| veure què signifiquen els colors | `?` o `F1` |
| desfer a la pestanya Tàctica | `Ctrl+Z` |

## Càmera {#camera}

De [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Entrada | Efecte |
|---|---|
| `W` / `↑` | Endavant seguint la direcció de la vista |
| `S` / `↓` | Enrere |
| `A` / `←` | Desplaçament lateral a l'esquerra |
| `D` / `→` | Desplaçament lateral a la dreta |
| `Espai` / `E` | Amunt |
| `Q` / `Ctrl` esquerre | Avall |
| `Shift` (qualsevol) | Mantén-lo premut: 6× la velocitat |
| `Alt` esquerre | Mantén-lo premut: 15% de la velocitat |
| Arrossegar amb el botó esquerre o dret sobre la vista | Mirar (el punter queda bloquejat mentre el botó és premut) |
| Roda (perspectiva) | Velocitat de vol ×1,5 per cada clic de la roda (com a màxim 4 clics per esdeveniment de roda) |
| Roda (paral·lela) | Zoom |
| Clic dret | No obre cap menú contextual sobre la vista |

## Global {#global}

De [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tecla | Efecte |
|---|---|
| `K` | Reprodueix / atura la [línia de temps](timeline.md) |
| `F` | Ajusta la vista a les dades |
| `C` | Copia la posició, la guinyada i el capcineig de la càmera ([lectura de la càmera](camera.md#camera-readout)) |
| `G` | Va a un punt escrit: obre la caixa sota la lectura de la càmera |
| `Esc` | Tanca la targeta de selecció; després deixa de mirar la segona unitat; després deixa de seguir una unitat |
| `T` | Activa o desactiva la mirada de pantalla tàctica ([Repetició de partida](match-replay.md#display-style)) |
| `?` / `F1` | Mode d'ajuda: què signifiquen els colors ([Configuració, unitats i tecles](settings.md#help-mode)) |
| `1` | [Calor](heat.md) |
| `2` | [Diferència](difference.md) |
| `3` | [Calor per equips](team-heat.md) |
| `4` | [Línies](line-heat.md) |
| `]` | Empeny el límit de tall llunyà cap a fora ×1,12 (`Shift`: ×1,35) |
| `[` | Estreny el límit de tall llunyà ÷1,12 (`Shift`: ÷1,35) |
| `\` | Desactiva el límit de tall llunyà / torna a activar-lo on era ([Profunditat i retall](depth-and-culling.md#keyboard)) |

El mode **Figures superposades** no té tecla numèrica; tria'l a la barra de modes o obre la pestanya Partida. Les tecles numèriques passen per la mateixa comprovació que la barra de modes: una tecla per a un mode que la barra mostra com a no disponible per a les dades carregades no fa res.

## Repetició de partida {#match-replay}

En el mode Figures superposades, que fa servir la pestanya Partida ([Repetició de partida](match-replay.md)). Funcionen tant si una unitat està seguida com si no, excepte on s'indica:

| Tecla | Efecte |
|---|---|
| `B` | Afegeix un marcador: el moment i la càmera |
| `M` | Mapa 2D: racó, vista completa, apagat |
| `V` / `Shift+V` | Vista de càmera següent / anterior de la unitat seguida |
| `H` | Pantalla de cap alt a la cabina i a les vistes de fixació |
| `Av Pàg` / `Re Pàg` | Esdeveniment següent / anterior dels tipus que mostra la llista d'esdeveniments |
| `J` | Reprodueix cap enrere; de nou, per aturar |
| `L` | Reprodueix cap endavant; de nou, per aturar |
| `.` / `,` | Un segon endavant / enrere, en pausa (`Shift`: deu segons) |
| `Esc` | Deixa primer de mirar l'objectiu, després deixa de seguir |
| `Ctrl`+clic o `Alt`+clic en una unitat (a la vista o a la llista d'unitats) | La mira des de la unitat seguida (la vista de dues unitats); torna a fer clic per treure-la |
| `Shift`+clic a dues unitats | Mesura entre elles: rumb, distància, diferència d'altura |

`V` necessita una unitat seguida. `M` és el mapa 2D aquí, i "moure" a la pestanya Tàctica.

## Seguir una unitat {#following-a-unit}

Mentre la càmera segueix una unitat, la roda i les tecles de vol la fan girar al voltant de la unitat en lloc de volar lliurement ([Càmera](camera.md#while-following-a-unit)):

| Entrada | Efecte |
|---|---|
| Roda, `W` / `S` | Més a prop / més lluny (més amunt / més avall a la vista de satèl·lit). No a les vistes de cabina i de fixació. |
| `A` / `D`, `Q` / `E` | Òrbita al voltant de la unitat (vistes de persecució i d'òrbita) |
| Arrossegar | Mira al voltant de la unitat; a la cabina, mira al voltant de l'interior |
| `V` / `Shift+V` | Vista de càmera següent / anterior |
| `H` | Pantalla de cap alt (vistes de cabina i de fixació) |
| `Esc` | Deixa de mirar la segona unitat, després deixa de seguir |

## Pestanya Tàctica {#tactics-board}

A la pestanya Tàctica ([Pissarra tàctica](tactics-board.md)). `F`, `C`, `G` i `T` funcionen com més amunt; les tecles numèriques no fan res.

| Tecla | Efecte |
|---|---|
| `Ctrl+Z` | Desfer |
| `Ctrl+Y` o `Ctrl+Shift+Z` | Refer |
| `Enter` | Acaba la fletxa que s'està dibuixant (un doble clic o un clic dret fa el mateix) |
| `Esc` | Cancel·la un arrossegament; si no, elimina la fletxa o el moviment en curs; si no, desselecciona |
| `Delete` o `Backspace` | Esborra la selecció |
| `W` / `E` / `R` | Giny de moure / girar / escalar per a la selecció (esquema de tecles **W / E / R**) |
| `G` / `R` / `S` | Giny de moure / girar / escalar per a la selecció (esquema de tecles **G / R / S**) |
| `R` | Sense res seleccionat: gira 15° la següent figura a col·locar. `Shift+R` la torna enrere. |
| `M` | Amb una figura seleccionada: la mou fins al següent clic |
| `K` | Reprodueix o atura el pla |
| Shift+clic | Afegeix o treu de la selecció |
| Shift+arrossegar | Dibuixa un rectangle per seleccionar el que hi ha dins |
| `Ctrl` mentre arrossegues un mànec | S'ajusta a la quadrícula o al pas d'angle |

Les tecles del giny només funcionen mentre hi ha alguna cosa seleccionada; sense selecció, `W A S D` volen la càmera com sempre.

## Clic per triar {#click-to-pick}

Amb **Un clic mostra què hi ha** activat i la regle apagada ([Clic per triar](camera.md#click-to-pick)):

| Entrada | Efecte |
|---|---|
| Clic esquerre (sense arrossegar més de 4 px) | Mostra el punt de dades, o si no el punt del nivell, sota el punter |

## Mesura {#measure}

Amb **Regle actiu** ([Mesura](measure.md)):

| Entrada | Efecte |
|---|---|
| Clic esquerre (sense arrossegar més de 4 px) | Col·loca un punt |
| Clic dret | Elimina l'últim punt |

## Altres llocs {#elsewhere}

| On | Entrada | Efecte |
|---|---|---|
| El mànec de qualsevol control lliscant (la nansa al costat del número) | Arrossegar amunt / avall | Canvia el valor de manera contínua, més ràpid com més arrossegues; mantén `Shift` per a un control fi. Deixa anar per aturar. |
| La pantalla de velocitat sobre la vista | Arrossegar amunt / avall | Canvia la velocitat de vol de la mateixa manera. |
| Caixes de posició | `Enter` | Aplica la posició o l'orientació escrita. |
| Editor de corbes | Doble clic / Alt-clic / clic dret | Afegeix un punt / elimina un punt ([Forma de l'sprite](sprite-shape.md#the-curve-editor)). |

## Pestanya Anàlisi de carrera {#race-analysis-tab}

A la pestanya Anàlisi de carrera, `K` reprodueix i atura la repetició de la carrera, `Inici` la rebobina, i les tecles numèriques no fan res. Mira [Anàlisi de carrera](race-analysis.md).

## Tecles que el visor es reserva del navegador {#keys-the-viewer-keeps-from-the-browser}

Algunes dreceres del navegador tancarien o recarregarien la pàgina i perdrien una sessió carregada; el visor se les reserva. La llista es genera a partir del codi: [Tecles del navegador](ref-browser-keys.md).

## Gamepad {#gamepad}

Mira [Gamepad i HOTAS](gamepad.md).

---
title: "Glossari"
nav_order: 21
lang: "ca"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---


# Glossari

Significats breus de les paraules que usa aquest lloc, en llenguatge senzill. Cada entrada enllaça a la pàgina que la explica completa.

## Dades {#data}

**Fila.** Una línia de les teves dades: una cosa que ha passat en un lloc i un temps, per exemple "el jugador 7 era aquí al segon 12". El visor dibuixa cada fila. [Formats de dades](data-formats.md)

**Columna.** Un tipus de valor de les files, com x, y, z, temps o equip. El visor endevina quina columna és quina, i tu pots canviar l'endevinació. [Correspondència de columnes](column-mapping.md)

**CSV.** Una taula de text pla: una fila per línia, valors separats per comes. Gairebé qualsevol programa en pot escriure una. [Càrrega de fitxers](loading-files.md)

**Parquet.** Un fitxer de taula compacte que es llegeix ràpid, fins i tot amb milions de files. És el millor format per donar al visor. [Càrrega de fitxers](loading-files.md)

**Esdeveniment.** Alguna cosa que ha passat, com un tret, un impacte, una mort o un enlairament. Una fila pot ser un esdeveniment, o només "era aquí". [Filtres](filters.md)

**Persona.** Qui ha fet les files: un jugador, un pilot, un cotxe o un tanc. Una persona és una línia de posicions al llarg del temps. [Sessions, persones i grups](sessions-persons-groups.md)

**Grup (equip).** Un conjunt de persones que es mostren en el mateix color, per exemple Blau i Vermell. [Sessions, persones i grups](sessions-persons-groups.md)

**Sessió (partida, ronda).** Una partida del joc. Una partida o una ronda és una sessió. El visor pot mostrar una sessió o superposar-ne moltes. [Sessions, persones i grups](sessions-persons-groups.md)

**Nivell.** El mapa 3D on van passar les dades: terreny, edificis, murs. Les files apareixen on van passar al nivell. [Nivells i geometria de fons](levels.md)

## Mirar les dades {#looking-at-the-data}

**Mapa de calor.** Una imatge on els llocs que toquen moltes files brillen més. Els llocs freds són tranquils, els calents són atrafegats. [Calor](heat.md)

**Calor.** Quant ha passat en un punt. El visor suma el brillant de cada fila en cada lloc; la suma és la calor. [Calor](heat.md)

**Sprite.** La petita taca brillant que el visor dibuixa per a una fila. Molts sprites superposats se sumen fins a donar calor. [Forma de l'sprite](sprite-shape.md)

**Exposició.** Com de brillant és la imatge. Com una càmera, massa exposició ho torna tot blanc i massa poca amaga el detall. [Color i exposició](colour-and-exposure.md)

**Saturació.** La quantitat de calor que compta com a "tan calent com arriben els colors". Baixa-la perquè es vegin els llocs tranquils; puja-la per veure només els més calents. [Color i exposició](colour-and-exposure.md)

**Volum.** Una caixa o forma que col·loques a la vista 3D. El visor compta el que hi ha dins i pot comparar volums entre ells. [Volums i comparació](volumes.md)

**Filtre.** Una regla que amaga les files que no vols, per exemple "només morts" o "només equip Vermell". [Filtres](filters.md)

## Repetició {#replay}

**Figura.** Un petit model d'un tanc, avió, cotxe o soldat que es mou on diuen les dades que era. [Figures](figures.md)

**LOD (nivell de detall).** Cada figura té una versió detallada, una de més simple i una de molt simple. Les properes usen la detallada i les llunyanes la simple, de manera que se'n poden dibuixar milers alhora. [Figures](figures.md)

## Curses {#racing}

**Volta.** Un recorregut pel circuit, des de la línia fins a la línia. [Càrrega de voltes](race-loading-laps.md)

**Volta de referència.** La volta amb la qual es comparen totes les altres. Les diferències es mostren com a "més ràpid" o "més lent" que ella. [Càrrega de voltes](race-loading-laps.md)

**Vèrtex.** El punt d'una corba on el cotxe és més a prop de la vora interior. [Anàlisi corba per corba](race-corner-analysis.md)

**Lliscament.** Quant llisca un pneumàtic. Una mica de lliscament dona el màxim agafament; massa, i el cotxe derrapa. [Analítica de curses: el mètode](race-analytics.md)

**Envolupant.** Què pot fer un cotxe a cada velocitat: amb quina força pot girar, frenar i accelerar abans de lliscar. [Analítica de curses: el mètode](race-analytics.md)

## Números d'aeronaus {#aircraft-numbers}

**ALT.** Altitud: l'altura sobre el terra o sobre el nivell del mar. [Repetició de partida](match-replay.md#labels-and-statistics)

**TAS.** Velocitat real de l'aire: com de ràpid es mou un avió per l'aire. [Repetició de partida](match-replay.md#labels-and-statistics)

## Ordinador {#computer}

**GPU.** La targeta o xip gràfic. Dibuixa la imatge i és molt més ràpida que el processador principal per dibuixar milions de taques. [Els dos backends](backends.md)

**WebGPU / WebGL2.** Les dues maneres en què un navegador deixa que una pàgina usi la GPU. WebGPU és més nova. El visor en pot usar qualsevol de les dues i tria la millor que tingui el teu navegador. [Els dos backends](backends.md)

## Paraules de Counter-Strike {#counter-strike-words}

**Ronda.** Un combat curt dins d'una partida. Un bàndol el guanya, i el marcador puja en un.

**Eco, compra forçada, compra completa.** Quants diners gasta un bàndol en armes a l'inici d'una ronda. Un eco estalvia diners i gairebé no compra res (menys de 1.500 $ per jugador de mitjana). Una compra forçada gasta el que té (menys de 4.000 $). Una compra completa compra tot el que pot. [Anàlisi de partida](match-analysis.md)

**Intercanvi.** Una mort que es paga amb una altra mort: et disparen, i un company dispara el teu assassí en 5 segons. [Anàlisi de partida](match-analysis.md)

**KAST.** La proporció de rondes en què un jugador va fer una mort, una assistència, va sobreviure, o va ser intercanviat. Un número més alt vol dir que el jugador va ajudar en més rondes. [Anàlisi de partida](match-analysis.md)

**ADR.** Dany mitjà per ronda: quanta vida va treure un jugador als enemics a cada ronda. [Anàlisi de partida](match-analysis.md)

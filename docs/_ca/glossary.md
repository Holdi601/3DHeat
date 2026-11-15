---
title: "Glossari"
nav_order: 24
lang: "ca"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: false
---

# Glossari

Significats breus de les paraules que fa servir aquest lloc, en llenguatge simple. Cada entrada enllaça a la pàgina que l'explica del tot.

## Dades {#data}

**Fila.** Una línia de les teves dades: una cosa que ha passat en un lloc i un moment, per exemple «el jugador 7 era aquí al segon 12». El visor dibuixa cada fila. [Formats de dades](data-formats.md)

**Columna.** Un tipus de valor de les files, com x, y, z, temps o equip. El visor endevina quina columna és quina, i tu pots canviar l'endevinalla. [Assignació de columnes](column-mapping.md)

**CSV.** Una taula de text pla: una fila per línia, valors separats per comes. Gairebé qualsevol programa en pot escriure una. [Carregar fitxers](loading-files.md)

**Parquet.** Un fitxer de taula compacte que es llegeix ràpid, fins i tot amb milions de files. És el millor format per donar al visor. [Carregar fitxers](loading-files.md)

**Esdeveniment.** Alguna cosa que ha passat, com un tret, un impacte, una mort causada o un enlairament. Una fila pot ser un esdeveniment, o només «era aquí». [Filtres](filters.md)

**Persona.** Qui ha fet les files: un jugador, un pilot, un cotxe o un tanc. Una persona és una successió de posicions al llarg del temps. [Sessions, persones i grups](sessions-persons-groups.md)

**Grup (equip).** Un conjunt de persones mostrades amb el mateix color, per exemple Blue i Red. [Sessions, persones i grups](sessions-persons-groups.md)

**Sessió (partida, ronda).** Una execució del joc. Una partida o una ronda és una sessió. El visor pot mostrar una sessió o superposar-ne moltes. [Sessions, persones i grups](sessions-persons-groups.md)

**Nivell.** El mapa 3D on van passar les dades: terreny, edificis, murs. Les files apareixen allà on van passar al nivell. [Nivells i geometria de fons](levels.md)

## Mirar les dades {#looking-at-the-data}

**Mapa de calor.** Una imatge on els llocs que tocaven moltes files brillen més. Els llocs freds estan tranquils, els calents estan ocupats. [Calor](heat.md)

**Calor.** Quant ha passat en un punt. El visor suma la brillantor de cada fila a cada lloc; la suma és la calor. [Calor](heat.md)

**Sprite.** La petita taca lluminosa que el visor dibuixa per a una fila. Molts sprites solapats sumen calor. [Forma de l'sprite](sprite-shape.md)

**Exposició.** Com de brillant és la imatge. Com una càmera, massa exposició ho torna tot blanc i massa poca amaga el detall. [Color i exposició](colour-and-exposure.md)

**Saturació.** La quantitat de calor que compta com a «tan calent com arriben els colors». Abaixa-la per fer visibles els llocs tranquils; apuja-la per veure només els més calents. [Color i exposició](colour-and-exposure.md)

**Volum.** Una caixa o una forma que col·loques a la vista 3D. El visor compta el que hi ha dins i pot comparar volums entre ells. [Volums i comparació](volumes.md)

**Filtre.** Una regla que amaga les files que no vols, per exemple «només morts» o «només l'equip Red». [Filtres](filters.md)

## Repetició {#replay}

**Figura.** Un petit model d'un tanc, avió, cotxe o soldat que es mou on diuen les dades que era. [Figures](figures.md)

**LOD (nivell de detall).** Cada figura té una versió detallada, una de més simple i una de molt simple. Les properes usen la detallada i les llunyanes la simple, així que se'n poden dibuixar milers alhora. [Figures](figures.md)

## Curses {#racing}

**Volta.** Un recorregut complet del circuit, des de la línia fins a la línia. [Carregar voltes](race-loading-laps.md)

**Volta de referència.** La volta amb què es comparen totes les altres. Les diferències es mostren com a «més ràpid» o «més lent» que ella. [Carregar voltes](race-loading-laps.md)

**Vèrtex (de revolta).** El punt d'una revolta on el cotxe és més a prop de la vora interior. [Anàlisi revolta a revolta](race-corner-analysis.md)

**Lliscament.** Quant llisca un pneumàtic. Una mica de lliscament dona més adherència; massa, i el cotxe derrapa. [Analítica de curses: el mètode](race-analytics.md)

**Envolupant.** Què pot fer un cotxe a cada velocitat: amb quina força pot girar, frenar i accelerar abans de lliscar. [Analítica de curses: el mètode](race-analytics.md)

## Números d'aeronaus {#aircraft-numbers}

**ALT.** Altitud: l'alçada sobre el terra o el nivell del mar. [Repetició de partida](match-replay.md#labels-and-statistics)

**TAS.** Velocitat real de vol: com de ràpid es mou un avió per l'aire. [Repetició de partida](match-replay.md#labels-and-statistics)

## Ordinador {#computer}

**GPU.** La targeta o el xip gràfic. Dibuixa la imatge i és molt més ràpid que el processador principal per dibuixar milions de taques. [Els dos motors](backends.md)

**WebGPU / WebGL2.** Les dues maneres com un navegador deixa una pàgina usar la GPU. WebGPU és més nova. El visor en pot usar qualsevol de les dues i tria la millor que tingui el teu navegador. [Els dos motors](backends.md)

## Paraules de Counter-Strike {#counter-strike-words}

**Ronda.** Un combat curt dins d'una partida. Un bàndol el guanya, i la puntuació puja en un.

**Eco, compra forçada, compra completa.** Quants diners gasta un bàndol en armes a l'inici d'una ronda. Un eco estalvia diners i gairebé no compra res (menys de 1.500 $ per jugador de mitjana). Una compra forçada gasta el que té (menys de 4.000 $). Una compra completa compra tot el que pot. [Anàlisi de partides](match-analysis.md)

**Represàlia (trade).** Una mort que paga una altra mort: et disparen, i un company dispara al teu assassí en menys de 5 segons. [Anàlisi de partides](match-analysis.md)

**KAST.** La part de rondes en què un jugador ha fet una mort, una assistència, ha sobreviscut, o ha tingut una represàlia. Un número més alt vol dir que el jugador ha ajudat en més rondes. [Anàlisi de partides](match-analysis.md)

**ADR.** Dany mitjà per ronda: quanta vida ha tret un jugador als enemics a cada ronda. [Anàlisi de partides](match-analysis.md)

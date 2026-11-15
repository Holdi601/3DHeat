---
title: "Figures"
parent: "Repetició"
nav_order: 3
has_children: true
lang: "ca"
source: "figures.md"
source_hash: "7040eba3b7ac"
translated: true
outdated: false
---

# Figures

Una **figura** és un petit model 3D de què és realment una unitat: un tanc, un reactor, un vaixell, un soldat. La [repetició](match-replay.md) dibuixa cada unitat com la seva figura a la mida real, en lloc d'una caixa simple.

Hi ha unes 2.000 vehicles, avions, vaixells, armes i soldats amb nom, tots construïts pel mateix visor.

![Tancs de la demo dibuixats com les seves pròpies figures](../assets/img/ca/replay-tanks.webp)

## Què hi ha al catàleg {#what-is-in-the-catalogue}

| Àmbit | Exemples |
|---|---|
| Persones | soldat de peu, ajagut, a terra; franctirador, antitanc, metge, tripulació |
| Terra | tancs, vehicles de combat d'infanteria, defensa antiaèria, artilleria, camions i cotxes, trens i tramvies |
| Aire | caces, avions d'atac, bombarders, transports, helicòpters, des de biplans fins a reactors moderns |
| Mar | vaixells de guerra per classe, portaavions, submarins, embarcacions, mercants |
| Armes | míssils, coets, bombes, torpedes, bengales i xafarranyes |
| Marcadors | fum, flaix i granades d'incendi, bombes col·locades, banderes, punts d'aparició, punts de pas |
| Combat a curta distància | soldats amb armilla portaplaques i fusell d'assalt, SMG, escopeta, DMR, LMG, pistola o escut; drons, càmeres, filferro d'espines, escuts, reforç de parets, barricades, càrregues de bretxa, trampes, finestres, granades, el desactivador |

## Com es fan les figures {#how-the-figures-are-made}

- **Construïdes a partir de dimensions publicades.** La majoria de figures les fa el propi constructor de figures del visor amb xifres públiques: longitud, amplada, alçada, rodes, torre i canó, ales i cua. Després la seva forma s'ajusta amb fotografies públiques, dibuixos i dimensions publicades. No s'usa cap model de cap joc.
- **Models lliures.** Algunes figures usen models 3D lliures (CC0 o CC BY) quan són més fidels, de vegades combinats amb el casc construït. Els autors de les obres CC BY es citen a [Crèdits de les figures](figure-credits.md); les obres CC0 no necessiten crèdit i no s'hi llisten.
- Cada figura té una versió completa, una de simplificada i una de llunyana (nivells de detall, LOD), de manera que se'n poden dibuixar milers alhora.

## Quina figura té cada unitat {#which-figure-a-unit-gets}

El visor mira les pròpies columnes de les dades:

1. **Noms**: les columnes que es diuen *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* o *Figure* es comparen amb el catàleg: exactament, a través d'uns 4.000 àlies (identificadors d'unitat de diversos jocs), pel començament conegut més llarg (`F-16C_50` és el F-16C), o pel nom de figura més curt que comença amb ell.
2. Un nom la figura del qual no encaixa amb el **tipus** de la unitat no s'usa (un camió que es diu *Typhoon* no és el caça).
3. **Tipus**: les columnes que es diuen *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* o *Domain* donen una figura de classe: etiquetes de Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), icones de mapa, o paraules simples (tank, helicopter, infantry).
4. Les dades sense cap de les dues són dades de persones: tothom és un soldat.

Així que la manera més fàcil d'obtenir les figures correctes és una columna `vehicle` amb els noms reals, o una columna `type` amb etiquetes de Tacview.

**La meva unitat es veu com una caixa o com un soldat.** Afegeix una columna `vehicle` amb el nom real, o una columna `type` amb una etiqueta de Tacview. Passa el ratolí per la unitat per veure quin nom s'ha trobat. Les dades que tenen aquestes columnes però no diuen res d'una unitat deixen aquesta com a caixa; les dades sense cap de les dues es dibuixen com a soldats.

## Figures de combat a curta distància (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Les taules escrites com les del lector de repeticions de Rainbow Six Siege (columnes `operator`, `pawn`, `primaryClass`, `side`) tenen figures pròpies:

- **Els jugadors** són el seu operador: cadascun dels 78 operadors té una figura pròpia, d'uns 1,8 m d'alçada, amb la seva pròpia roba (dos o tres colors per a la jaqueta, els pantalons i l'equip segons el seu aspecte públic habitual: negre, oliva, marró clar, gris urbà, blanc, blau marí, amb equip vermell, taronja o verd blavós) i amb les seves pròpies formes, un terç més grans que a la realitat on s'han de veure des de dalt: el que porten al cap (cascos, una visera o un casc pesant, gorres, gorros, boines, un barret boonie ample o de pell, caputxes, bufandes, cabells), la cara (ulleres protectores, una màscara de gas, ulleres, una màscara, una barba, ulleres de tres lents), una complexió lleugera, mitjana o pesant (les pesants, amples, amb grans plaques a les espatlles i un coll), un abric llarg o un vestit, un ghillie, el que porten a l'esquena (un martell, càrregues, drons, bidons, un dipòsit de combustible, un tub llançador, una ballesta, panells, un inhibidor, un escut) o al braç (un llançador, un braç de metall), el seu propi escut (un d'alt, un escut antiavalots, un amb llums) i un color d'accent a les espatlles. Porten la classe de la seva arma principal. Un operador que el visor no coneix és un soldat senzill amb armilla portaplaques del color de l'equip.
- **El bàndol** es veu a part de la roba: un anell a terra sota cada operador, **ambre per a l'atac, cian pàl·lid per a la defensa**, amb el color de l'equip a dins, i bandes al braç i al cap del mateix color. Una columna `stance` (stand, crouch, prone) els posa en postura; sense aquesta columna, estan drets.
- **Es distingeixen a distància de repetició:** dibuixats a 48 píxels d'alçada des de dalt i en tres quarts, cada parell d'operadors d'un bàndol es diferencia per una diferència clara de color o per una forma diferent (ho comproven les proves del visor).
- **Les etiquetes** diuen el nom del jugador i l'operador que porta en aquell moment, amb el rol de l'operador com a símbol: ✸ obridor dur, ⚒ obridor tou, ➤ entrada, ✦ fragger, ✚ suport, ⬟ escut, ◉ informació, ◇ flexible, ↺ vigilància del flanc, ⚓ àncora, ✕ paranyer, ⇄ itinerant, ↯ antiginys, ▣ antibretxa.
- **Els drons** són un dron llançable de dues rodes, d'uns 30 cm d'ample, cadascun amb una traça pròpia que porta el nom del seu propietari («Ash · drone 2»).
- **Els ginys col·locats** són on es van posar, des d'aleshores fins al final de la ronda, cadascun com la figura del que fa: una càmera, filferro d'espines, un escut desplegable, una càrrega de bretxa, una càrrega de bretxa dura, una petita càrrega adhesiva, una trampa de terra, una claymore amb el seu làser activador, una finestra unidireccional, un panell de blindatge, una granada, un bidó de gas, un inhibidor, un sensor, una porta làser, una caixa de subministraments. Una sola figura serveix per a tots els ginys que fan la mateixa feina. Un giny del qual les dades no diuen el tipus és un aparell petit amb un llum.
- **El desactivador** és on es va plantar durant els seus 45 segons.

Cada dron i cada giny es converteix en una traça pròpia quan es carrega el fitxer, de manera que la figura del jugador es queda al seu cos. Els operadors són formes simplificades segons les seves descripcions i imatges públiques (el que porten, l'aparell que és la seva habilitat), i els ginys tenen la forma del que fan. Tot això són dissenys propis del visor a la mida real de l'objecte (una claymore d'uns 22 cm d'ample, un panell de la mida d'una porta d'1 m per 2,1 m), no models del joc.

## Ajustos {#settings}

La secció **Figures** de la barra lateral de la repetició fixa la mida, la mida mínima a la pantalla, en què es converteixen les unitats llunyanes (figura, fletxa, símbol), i els efectes que es dibuixen a sobre. Vegeu [Repetició de partida](match-replay.md#figures). Fum, foc i altres efectes temporitzats: [Figures a la superposició de figures](figure-replay.md).

## Un paquet local de figures opcional {#an-optional-local-figure-pack}

Pots guardar un paquet opcional de figures propi a la teva màquina. Les seves figures ocupen el lloc de les figures del catàleg amb els mateixos noms. Mai no forma part del repositori ni d'una versió publicada; sense cap, res no canvia.

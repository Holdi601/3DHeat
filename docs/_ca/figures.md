---
title: "Figures"
nav_order: 11
has_children: true
lang: "ca"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figures

Una **figura** és un petit model 3D del que és realment una unitat: un tanc, un avió de reacció, un vaixell, un soldat. La [repetició](match-replay.md) dibuixa cada unitat com la seva figura a mida real, en lloc d'una caixa simple.

Hi ha uns 2.000 vehicles, aeronaus, vaixells, armes i soldats amb nom, tots construïts pel mateix visor.

![Tancs de la demostració dibuixats com a figures pròpies](../assets/img/en/replay-tanks.webp)

## Què hi ha al catàleg {#what-is-in-the-catalogue}

| Àmbit | Exemples |
|---|---|
| Persones | soldat de peu, ajagut, a terra; franctirador, antitanc, metge, tripulació |
| Terra | tancs, vehicles de combat d'infanteria, defensa antiaèria, artilleria, camions i cotxes, trens i tramvies |
| Aire | caces, avions d'atac, bombarders, transports, helicòpters, des de biplans fins a avions de reacció moderns |
| Mar | vaixells de guerra per classe, portaavions, submarins, barques, mercants |
| Armes | míssils, coets, bombes, torpedes, bengales i xaff |
| Marcadors | granades de fum, de flaix i de foc, bombes col·locades, banderes, spawns, punts de ruta |

## Com es fan les figures {#how-the-figures-are-made}

- **Construïdes a partir de dimensions publicades.** La majoria de figures les fa el constructor de figures del mateix visor a partir de xifres públiques: longitud, amplada, alçada, rodes de carretera, torreta i canó, ales i cua. La seva forma després s'ajusta amb fotografies, plànols i dimensions publicades. No s'usa cap model de cap joc.
- **Models lliures.** Unes poques figures usen models 3D lliures (CC0 o CC BY) quan són més fidels, de vegades combinats amb el casc construït. Els autors d'obres CC BY surten als [Crèdits de les figures](figure-credits.md); les obres CC0 no necessiten crèdit i no hi són llistades.
- Cada figura té una versió completa, una de simplificada i una de llunyana (nivells de detall, LOD), així que se'n poden dibuixar milers alhora.

## Quina figura rep cada unitat {#which-figure-a-unit-gets}

El visor mira les columnes pròpies de les dades:

1. **Noms** -columnes que es diuen *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* o *Figure*- es comparen amb el catàleg: exactament, mitjançant uns 4.000 àlies (identificadors d'unitat de diversos jocs), pel començament conegut més llarg (`F-16C_50` és el F-16C), o pel nom de figura més curt que hi comença.
2. Un nom la figura del qual no encaixa amb el **tipus** de la unitat no s'usa (un camió que es diu *Typhoon* no és el caça).
3. **Tipus** -columnes que es diuen *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* o *Domain*- donen una figura de classe: etiquetes de Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), icones de mapa, o paraules simples (tank, helicopter, infantry).
4. Les dades sense cap de les dues coses són dades de persones: tothom és un soldat.

Així, la manera més fàcil d'obtenir les figures correctes és una columna `vehicle` amb els noms reals, o una columna `type` amb etiquetes de Tacview.

**La meva unitat es veu com una caixa o com un soldat.** Afegeix una columna `vehicle` amb el nom real, o una columna `type` amb una etiqueta de Tacview. Posa el ratolí sobre la unitat per veure quin nom s'ha trobat. Les dades que tenen aquestes columnes però no diuen res d'una unitat deixen la unitat com una caixa; les dades sense cap de les dues es dibuixen com a soldats.

## Configuració {#settings}

La secció **Figures** de la barra lateral de la repetició fixa la mida, la mida mínima a la pantalla, en què es converteixen les unitats llunyanes (figura, fletxa, símbol) i els efectes que es dibuixen sobre elles. Vegeu [Repetició de partida](match-replay.md#figures). Fum, foc i altres efectes amb temps: [Figures a la superposició de figures](figure-replay.md).

## Un paquet local de figures opcional {#an-optional-local-figure-pack}

Pots tenir un paquet opcional de figures pròpies a la teva màquina. Les seves figures ocupen el lloc de les del catàleg amb els mateixos noms. Mai no forma part del repositori ni d'una versió publicada; sense cap paquet, res no canvia.

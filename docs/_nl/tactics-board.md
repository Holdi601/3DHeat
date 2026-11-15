---
title: "Tactiekbord"
nav_order: 12
has_children: true
lang: "nl"
source: "tactics-board.md"
source_hash: "e89ef050b0f2"
translated: true
outdated: false
---

# Tactiekbord

Het tabblad **Tactiek** is een tekenbord voor een teamplan: je zet kleine figuren op een kaart, tekent pijlen voor waar ze heen gaan, en drukt op afspelen om te zien wat er gebeurt. Gebruik het om een ronde of een aanval te plannen voordat je speelt. Het deelt het canvas, de camera en het [level](levels.md) met de andere tabbladen en verder niets; een plan is geen data en tekent geen warmte.

## Je eerste plan {#your-first-plan}

1. Open het tabblad **Tactiek**. Kies het **Spel** (bijvoorbeeld Counter-Strike 2) en, voor Valorant, druk op **Valorant-kaarten laden** en kies een **Kaart**. Of laad eerst een [level](levels.md).
2. Kies een **Kant** (die bepaalt de kleur) en druk op **Bovenaanzicht**.
3. Kies **Plek**, kies een figuur in **Figuren** (gebruik **Figuren zoeken** om er één te vinden) en klik op de kaart. Plaats er twee of drie.
4. Kies **Pijl**, klik op een figuur, klik langs de weg die hij moet afleggen, en druk op **Enter** om de pijl af te maken.
5. Druk op **+** onder het beeld om stap 2 toe te voegen. Elke figuur begint waar zijn pijl eindigde. Teken daar meer pijlen.
6. Druk op **▶** (of `K`) om het plan vanaf de getoonde stap tot het einde af te spelen.
7. Geef het plan een naam in **Naam van het plan** en druk op **Opslaan**.

![Het tabblad Tactiek in bovenaanzicht: spel, kanten en gereedschappen links, drie figuren met Verschuiven-pijlen, een rookworp-boog, een Gebied en de stappen onderaan](../assets/img/nl/tactics.webp)

## Een plan beginnen {#starting-a-plan}

| Bediening | Wat het doet |
|---|---|
| **Spel** | Kiest de kanten en de figuren die het palet aanbiedt: Counter-Strike 2 (T, CT; spelers en hulpmiddelen), Valorant (Aanval, Verdediging; spelers en generieke vaardigheden), Battlefield, Squad, Arma (infanterie, voertuigen op de grond, luchtvaartuigen, boten), DCS / War Thunder / IL-2 (straaljagers, propellervliegtuigen, helikopters, luchtverdediging, grond, schepen, wapens), en Overig. Een plan dat al figuren heeft, behoudt zijn kanten als het spel wijzigt. |
| **Naam van het plan** | De naam waaronder het plan opgeslagen wordt. |
| **Kaart**, **Valorant-kaarten laden** | Met Valorant gekozen: **Valorant-kaarten laden** haalt de lijst met kaarten van [valorant-api.com](https://valorant-api.com); **Kaart** legt dan de minimap van de gekozen kaart neer als level, van boven ingekaderd. De afbeelding wordt opgehaald als hij gekozen wordt en nooit meegeleverd. Riots mededeling wordt getoond zolang hij op het scherm staat (zie hieronder). |
| **Kant** | De kant waartoe de volgende figuur, pijl of het volgende gebied hoort; hij krijgt de kleur van de kant. |

Zonder level is het bord het platte grondvlak. Laad een level onder **Level** om op een echte kaart te plannen: een CS2-kaart geëxporteerd met de CS2-tool, een level uit de bibliotheek, of een kaartafbeelding.

## Gereedschappen {#tools}

| Gereedschap | Klik | Opmerkingen |
|---|---|---|
| **Selecteren** | Een figuur, een tussenpunt, een pijl, een gebied of een notitie selecteert het. | Shift+klik voegt toe of haalt weg; Shift+slepen tekent een vak om wat toegevoegd moet worden. De selectie krijgt een transformatiegreep (zie hieronder); `Delete` of `Backspace` verwijdert hem. `M` verplaatst de geselecteerde figuur naar de volgende klik. |
| **Plek** | Zet de gekozen figuur neer. | Een figuur wordt gekozen in het palet **Figuren** (met **Figuren zoeken**). Zonder selectie draait `R` de volgende figuur 15° voordat hij geplaatst wordt (`Shift+R` de andere kant op). |
| **Pijl** | Elke klik voegt een punt toe; Enter, een dubbelklik of een rechterklik maakt hem af, Esc gooit hem weg. | **Verschuiven**, **Aanval** (bredere kop) of **Bewaken** (een dunne lijn op ooghoogte). Een pijl die op een figuur begint, is de route van die figuur in deze stap: bij afspelen loopt de figuur hem, en de volgende stap begint waar hij eindigde. |
| **Worp** | De werper, dan waar het neerkomt. | Een gestreepte boog van de ene naar de andere, en het gekozen hulpmiddel (rook, flits, molotov, ...) verschijnt waar het neerkomt en blijft vanaf deze stap. |
| **Gebied** | Het midden, dan de rand. | Een schijf in de kleur van de kant. |
| **Notitie** | Waar de notitie komt; vraagt om de tekst. | Getoond als een speld, met de tekst erboven. |
| **Wissen** | Een figuur, pijl, gebied of notitie. | Verwijdert hem vanaf deze stap; op zijn eerste stap verwijdert het hem helemaal. |

**Ongedaan maken** en **Opnieuw** (`Ctrl+Z`; `Ctrl+Y` of `Ctrl+Shift+Z`) lopen door elke wijziging. Een regel onder het plan toont hoeveel figuren, pijlen en stappen het heeft. **Bovenaanzicht** kijkt recht naar beneden (orthografisch), **3D-weergave** keert terug naar perspectief, **Frame** past het plan in beeld, of het level als het plan leeg is.

**Figuurgrootte** schaalt elke figuur op het bord; 1× is ware grootte, wat van ver boven een paar pixels is voor een persoon.

## Verplaatsen, draaien en schalen {#moving-turning-and-scaling}

Alles op het bord kan verplaatst worden zoals in een 3D-editor: figuren, hulpmiddelen, markers, losse tussenpunten en hele pijlen, gebieden en notities. Wat geselecteerd is, krijgt een greep in het midden:

| Modus | Toetsen | Handgrepen |
|---|---|---|
| **Verschuiven** | W (of G) | Een pijl per as (X rood, Y groen en omhoog, Z blauw) verschuift erlangs; een vierkant verschuift in zijn vlak; het midden verschuift over het level onder de aanwijzer. |
| **Draaien** | E (of R) | Een ring per as draait eromheen. De ringen van één figuur zijn zijn eigen gier, stamp en rol; een groep draait om de assen van de wereld rond zijn midden. |
| **Schalen** | R (of S) | Spreidt of verzamelt de selectie vanuit het midden langs een as of op alle manieren; de straal van een gebied groeit mee. |

**Sleutels** wisselt tussen W / E / R (Unity, Unreal) en G / R / S (Blender); de toetsen kiezen de modus alleen als er iets geselecteerd is, en vliegen de camera anders. Dus `R` betekent **Schalen** met de toetsen W / E / R en **Draaien** met de toetsen G / R / S terwijl er iets geselecteerd is, en draait de volgende figuur om te plaatsen als er niets geselecteerd is. Alle toetsen van het bord staan in de [referentie toetsenbord en muis](keyboard-reference.md#tactics-board). Houd **Ctrl** ingedrukt tijdens het slepen om een verplaatsing naar het **Raster** (meters) of een draai naar de **Hoekstap** te laten klikken. **Aan de grond vastklikken** (standaard aan) zet verplaatste mensen, voertuigen, markers, tussenpunten en gebieden op het oppervlak van het level; luchtvaartuigen en helikopters houden hun hoogte, en een sleep langs de Y-pijl klikt nooit vast. Een handgreep slepen verplaatst nooit de camera. **Esc** breekt een sleep af, en elke wijziging is één stap Ongedaan maken.

Tussenpunten verschijnen als stippen op de pijlen van de getoonde stap: klik op één om hem te selecteren, sleep hem om hem te verplaatsen, Delete om hem te verwijderen. Het deel **Geselecteerd** toont de plek van de selectie in meters, de gier, stamp en rol van een figuur in graden, en de straal van een gebied, elk in te typen.

## Tijdmeting {#timing}

De route van een figuur heeft een tijd: elk segment kost zijn lengte over het level - op het oppervlak bemonsterd elke paar meter, zodat een heuvel of een trap tussen twee punten meetelt - tegen de snelheid van de **modus** van die figuur in dat spel, plus elke **wacht** bij een tussenpunt. Infanterie kruipt, hurkt, loopt (stil), rent of sprint; voertuigen en boten kruipen, gaan voorzichtig, normaal of haasten zich; luchtvaartuigen en helikopters vliegen langzaam, op kruissnelheid, in gevechtssnelheid of maximaal. Een modus die het spel niet heeft (CS2 heeft geen sprint) neemt de dichtstbijzijnde die het wel heeft. Hoe een helling vertraagt hangt af van het spel: in CS2 en Valorant telt alleen de horizontale afstand, zoals in de spellen; mil-sims vertragen infanterie bergop (de wandelfunctie van Tobler) en voertuigen naar gelang de helling.

De snelheden komen uit tabellen per spel met hun bronnen (zie [Bewegingssnelheden](tactics-speeds.md)): CS2 per gedragen wapen, uit de wapendefinities van het spel; Valorant per wapen; Battlefield, Squad, Arma en de luchtspellen per voertuigtype en klasse. **Beweegt als** kiest het profiel van een figuur (een wapen, een voertuigtype); **Eigen (m/s)** overschrijft elke modus voor die figuur. Modi heten zoals het bord ze toont: *Kruipen*, *Hurken*, *Lopen (stil)*, *Rennen*, *Sprinten*; *Voorzichtig*, *Normaal*, *Haasten*; *Langzaam*, *Kruissnelheid*, *Gevecht*, *Maximaal*.

Elk tussenpunt toont de tijd sinds het vorige en de tijd sinds het begin van het plan ("+3,9 s · 0:12"). De route van de geselecteerde figuur somt elk segment op met zijn modus, lengte en tijd, de wacht en de aankomst. **Aankomsten** onder **Tijdmeting** zet elke geroute figuur op één tijdlijn, eerste aankomst bovenaan. Met **Afspelen in echte tijd** (standaard aan) duurt een stap tot de traagste route aankomt, en beweegt elke figuur met zijn eigen snelheid; **Seconden** is dan de kortste lengte van de stap. **Level-eenheden per meter** zegt waar het level in is: 39,37 voor CS2-kaarten (spel-eenheden), 1 voor kaarten in meters.

## Vergelijken met matchdata {#compare-with-match-data}

**Matchbestanden laden…** leest CS2-matchtabellen van de kaart (de Parquet-bestanden van de CS2-tool, zoveel als je wilt; alleen de nodige kolommen, op de achtergrond); **Geladen data gebruiken** neemt de data die in de viewer geladen is. Daarna:

- **Vroegste aankomst op de kaart** kleurt de kaart naar de tijd sinds het begin van de ronde waarop een speler elke plek voor het eerst bereikte - de knop **Snelste** toont de snelste over alle rondes, **Typisch (mediaan)** de middelste ronde - groen vroeg tot rood laat, voor één kant of voor beide. Het toont wat mogelijk is, en wanneer.
- De geselecteerde route wordt vergeleken met wat spelers bereikten van het begin (of het begin van de ronde) tot het einde, elk einde een schijf met de ingestelde straal: "Snelste waargenomen 14,2 s, p10 15,0 s, mediaan 18,3 s over 41 runs; jouw plan 15,1 s".
- De snelheden waarmee spelers echt bewogen - rennen, lopen, hurken, uit de loop- en hurkkolommen van de tabellen - in m/s.

## Stappen {#steps}

De balk onder het beeld bevat de stappen. Een plan begint met één; **+** voegt er een toe, en elke figuur begint er waar zijn route in de laatste stap eindigde; **−** verwijdert de getoonde. **Seconden** is hoe lang de getoonde stap duurt als hij wordt afgespeeld. **▶** (K) speelt vanaf de getoonde stap tot het einde: figuren met een route lopen hem, figuren die in de volgende stap naar een nieuwe plek verplaatst zijn glijden daarheen, de rest staat stil. Terwijl een stap getoond wordt, wordt de plek van elke figuur in de volgende stap als een flauw spook getekend, en de pijlen van de laatste stap zwak onder die van deze stap.

## Opslaan {#saving}

Het deel **Bestand** bevat **Opslaan**, **Open** en **Wissen**. **Opslaan** schrijft het plan als `<naam>.h3dplan.json` (gewone JSON: kanten, stappen, figuren met een plek per stap, pijlen, gebieden, notities); **Open** leest er één terug. Een bestand van een andere versie, of een dat geen plan is, wordt geweigerd met de reden. **Wissen** leegt het plan; Ongedaan maken haalt het terug.

## Figuren {#figures}

Elke figuur wordt door de viewer zelf gebouwd: eenvoudige vormen op de gepubliceerde grootte van een type, met de kenmerken die hem van zijn buren onderscheiden - de wegwielen en de toren van een tank, de kanonnen, raketten en radars van een luchtverdedigingsvoertuig, de vleugelvorm, staart en motoren van een vliegtuig, de rotors en stompe vleugels van een helikopter. Niets is uit een spel overgenomen. Een ontwerp dat een spel bedacht heeft, wordt getoond als de generieke figuur van zijn klasse. Zie [Figuren](figures.md#which-figure-a-unit-gets) voor hoe data zijn figuur vindt.

## Riots mededeling {#riots-notice}

Valorant-kaarten worden getoond onder het beleid "Legal Jibber Jabber" van Riot Games, dat gratis gemeenschapsprojecten toestaat ze te gebruiken en vraagt om deze mededeling waar ze verschijnen: *3DHeat was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.* De vaardigheden op het bord zijn generieke vormen, niet Riots kunst.

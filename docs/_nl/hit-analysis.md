---
title: "Trefferanalyse (tabblad Voertuigen)"
parent: "Replay"
nav_order: 4
lang: "nl"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Trefferanalyse (tabblad Voertuigen)

Het tabblad **Voertuigen** laat zien waar één tank, schip of soldaat is geraakt, en door wie. Gebruik het om te zien welke kant van een tank wordt beschoten, of welke vijand de schade aanricht.

## Probeer het {#try-it}

1. Laad een match met treffers (zie de tabel hieronder voor welke spellen treffers geven).
2. Open bovenaan het tabblad **Voertuigen**.
3. Kies onder **Voertuig** een eenheid, bijvoorbeeld een tanktype. Het getal tussen haakjes is hoeveel treffers ze kreeg.
4. Lees de figuur: elke markering is een treffer, geplaatst waar hij insloeg.
5. Open **Wie raakte** om de schutters, wapens of voertuigen van de schutters te zien, met treffers, schade, kills en afstand.

![Het tabblad Voertuigen: een demotank met treffermarkeringen, en Wie raakte open](../assets/img/en/hit-analysis-tank.webp)

Als er niets is geladen, of de data geen treffers op voertuigen bevat, dan zegt het tabblad wat er ontbreekt en welke converter je moet gebruiken.

```
        schutter ----> o  treffermarkering op de figuur
        schutter ----> o
  [ tankfiguur ]
```

De figuur toont de treffers waar de data een punt of een lichaamsdeel geeft. De uitsplitsing (wie raakte, met wat, hoe hard, van hoe ver) werkt voor elke bron.

## Wat elke bron geeft {#what-each-source-gives}

| Bron | Punt op de eenheid | Schutter | Wapen | Schade / uitkomst |
|---|---|---|---|---|
| War Thunder | ja, in het kader van de eenheid, met de richting van het schot | ja | het voertuig van de schutter | kritiek, zwaar, modules vernietigd, dodelijk schot |
| CS2 | lichaamsdeel (hitgroup) | ja | ja | schade, pantser, resterende gezondheid |
| World of Tanks | ja (componentvak, ingang en uitgang) | ja | - | schade of geen (weerkaatsing, geen doordringing) |
| World of Warships | ja, in het kader van het schip | ja | treffertype | - |
| Squad | voertuigen: ja - de inslag geplaatst in het kader van het voertuig, vanaf zijn eigen positie en koers | nee (de data noemt er geen) | het schadetype | de daling van de gezondheid van het voertuig op dat moment, vernietigd |
| Squad-soldaten | nee: de trefferresultaten (bot en inslagpunt) worden door de converter ruw bewaard; rijen `impact` met `hitBone` worden gelezen zodra hij ze schrijft | | | alleen verwondingen en doden |
| Arma (OCAP, de opnemer van Arma 3) | nee: OCAP legt vast wie wie heeft geraakt of gedood, met wat, van hoe ver, niet waar | ja | ja | treffer of kill, afstand |
| Tacview ACMI | ja waar een wapenobject binnen 30 m van een eenheid eindigt (niet de werper): zijn laatste plek in het kader van de eenheid (koers, stamp, rol), komend de weg die hij vloog | de `Parent` van het wapen | de naam van het wapen, of het AmmoType van een Timeout | Outcome van de Timeout, dalingen van `Health`, `Destroyed`; zonder wapen een kill of schade zonder punt |
| IL-2-telemetrie (Watcher) | ja: `hit`- / `damage`-gebeurtenissen dragen het punt in het kader van het eigen vliegtuig van de speler (gelezen als x vooruit, y omhoog, z rechts) | nee | nee | de kracht |
| Dota 2 | nee: het gevechtslog heeft geen plaats op een held | de aanvallende eenheid | de vaardigheid of het voorwerp (geen: een aanval) | schade, de dood van de held |
| Battlefield 6 (GameCapture) | nee: de opname leest de killfeed (kills, doden, headshotvlag), geen treffers | | | |
| DCS / andere live bronnen van Watcher | geen treffergebeurtenissen buiten wat hun Tacview-opnamen bevatten | | | |

Waar geen treffer van de eenheid een punt heeft, toont de figuur geen markeringen en gaat de uitsplitsing **Wie raakte** vanzelf open: op schutter, wapen of het voertuig van de schutter, elk met zijn treffers, schade en kills, en de mediane en verste afstand.

## Beperken tot een gebied {#restrict-to-an-area}

Het gedeelte **Gebied** beperkt de analyse tot treffers die op een plek op de kaart zijn gebeurd.

1. Druk op **Rechthoek tekenen** of **Veelhoek tekenen**, en teken op het 3D-terrein of de tactische kaart.
2. Kies **Slachtoffer erin** (een treffer tellen als de geraakte eenheid in het gebied was) of **Schutter erin** (als degene die schoot erin was).
3. Druk op **Als filter gebruiken**. De chips tonen "{n} van {totaal} treffers in het gebied".
4. **Gebied wissen** verwijdert alle gebieden.

Elk gebied is een [volume](volumes.md), dus dezelfde vormen filteren ook de warmtekaart en de replay. Een gebied kan insluiten of uitsluiten (een uitsluitend gebied laat zijn treffers weg, getoond als "{n} van {totaal} treffers buiten het gebied"). Elk gebied verschijnt als een chip met hoeveel treffers van de eenheid erin zaten; de × op een chip verwijdert hem. De aantallen, de figuur, de uitsplitsing en de filterlijsten volgen allemaal.

De plaatsen van een treffer: de rij waaruit hij komt, bevat de plek van één partij (die van het slachtoffer bij een getroffen of geraakt; die van de schutter bij een schot); de plek van de ander is het eigen monster van die eenheid dat het dichtst in de tijd ligt (binnen 5 s). Een treffer waarvan de plek van de partij niet bekend is, wordt weggelaten terwijl een gebied filtert, en het paneel zegt hoeveel ("Weggelaten, geen bekende plek").

## Voor ontwikkelaars {#for-developers}

Elke converter kan treffers toevoegen: een rij van het slachtoffer (`hit`, `impact`, `hurt`, `wounded`) met `hitBone` (een skeletbot, een Arma-selectie, een Reforger-trefferzone - toegewezen aan hoofd, borst, buik, armen en benen) of `hitLocalX/Y/Z` (meters, x vooruit, y omhoog, z rechts), met `other` de schutter en `damage`.

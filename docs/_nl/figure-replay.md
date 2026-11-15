---
title: "Figuren in de figurenoverlay"
parent: "Figuren"
grand_parent: "Replay"
nav_order: 2
lang: "nl"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figuren in de figurenoverlay

Deze pagina gaat over het omzetten van de dozen in kleine 3D-figuren van wat elke eenheid echt was, en over de rook en het vuur die figuren achterlaten. De bediening van de replay zelf staat op [Wedstrijdreplay](match-replay.md).

In de [dozenreplay](box-replay.md) en de figurenreplay van het tabblad Match tekent **Figuren in plaats van blokken** (standaard aan) elke levende persoon als de figuur van wat die is: een soldaat te voet, de tank die iemand bestuurt, het vliegtuig dat een Tacview-spoor is. De figuur heeft de kleur, plaats en koers van de doos. Voor vliegtuigen en raketten heeft hij ook de neiging en, waar de data een kolom Roll heeft, de helling. **Figuurgrootte** schaalt ze; 1 keer is ware grootte. Klikken op een figuur geeft hetzelfde antwoord als klikken op zijn doos deed.

## Welke figuur {#which-figure}

De eigen naam- en typekolommen van de data beslissen. De volledige regels, met de kolomnamen, staan op [Figuren](figures.md#which-figure-a-unit-gets). Data met geen van beide soorten kolommen is data van mensen: iedereen is een soldaat.

De koppeling wordt per label onthouden, zodat een frame alleen het plaatsen kost. Een dataeenheid is een meter, tenzij de data zegt hoe groot één gevolgd ding is (de CS2-export zegt dat een speler 32 eenheden breed is); figuren worden daarop geschaald.

Een optioneel pakket met eigen figuren kan op je computer catalogusfiguren vervangen; zie [Figuren](figures.md#an-optional-local-figure-pack).

## Effecten {#effects}

Gebeurtenisrijen die iets een tijdje achterlaten, worden getekend waar het gebeurde, zolang het duurt, in de kleur van degene die het veroorzaakte: een rookwolk (ongeveer 18 s), een molotov of brandbom (7 s), een flits (ongeveer een seconde) en een HE-uitbarsting (minder dan een seconde), een decoy (15 s), een geplaatste bom (40 s). Ze komen uit een gebeurteniskolom (Event, Events) waarvan het label `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` of `plant` is - de CS2-export schrijft ze op het moment van de ontploffing.

## Wedstrijdreplay: de hulpmiddelen van Tacview {#match-replay-tacviews-tools}

Camera's, bladwijzers, de tactische weergave, statistieken, labels, **Loodlijnen**, de gebeurtenissenlijst en het grafiekvenster worden beschreven op [Wedstrijdreplay](match-replay.md). [Tacview-gelijkwaardigheid](tacview-parity.md) somt elke Tacview-functie op en waar die staat.

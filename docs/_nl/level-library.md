---
title: "Niveaubibliotheek"
parent: "Niveaus en achtergrondgeometrie"
nav_order: 4
lang: "nl"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Niveaubibliotheek

De bibliotheek bewaart je niveaus in deze browser, zodat je ze niet opnieuw hoeft te laden en te vereenvoudigen. **Het wissen van de gegevens van de site in de browser verwijdert de bibliotheek, en er is geen export.** Bewaar je oorspronkelijke bestanden.

Een niveau verwerken - ontleden, classificeren, lassen, decimeren, texturen inpakken - is traag, en het resultaat is elke keer hetzelfde. De **Bibliotheek** onderaan het paneel Achtergrond / level bewaart verwerkte niveaus in deze browser, zodat een gedecimeerd mesh nooit twee keer wordt opgebouwd ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Een niveau bewaren en opnieuw laden {#save-and-reload-a-level}

1. Laad een kaartafbeelding of een 3D-model en controleer of het er goed uitziet.
2. Druk op **Opslaan in bibliotheek**. Het paneel zegt *Opgeslagen. Het laadt de volgende keer meteen.*
3. De volgende keer open je de lijst **Bibliotheek** en druk je op ▸ bij het niveau.
4. Druk op ✕ om een item te verwijderen dat je niet meer nodig hebt.

## Het gebruik {#using-it}

| Bediening | Effect |
|---|---|
| **Opslaan in bibliotheek** | Slaat het huidige niveau op. Een kaartafbeelding wordt opgeslagen als PNG met zijn twee ankers; een model als zijn verwerkte buffers. Het paneel zegt *Opgeslagen. Het laadt de volgende keer meteen.* |
| Bibliotheeklijst | Eén rij per opgeslagen niveau: naam (met de opgeslagen grootte bij aanwijzen), driehoeken voor een model of breedte in pixels voor een afbeelding. |
| ▸ (*Laden*) | Laadt het item als huidig niveau. |
| ✕ (*Verwijderen*) | Verwijdert het item. |
| Gebruiksregel | `Gebruikt X van Y.` - de schatting van de browser voor de opslag van deze site. |

Als er niets is opgeslagen, zegt de lijst *Leeg. Laad een kaart of model, en kies daarna "Opslaan in bibliotheek".*

## Wat wordt opgeslagen {#what-is-stored}

| Soort | Opgeslagen | Niet opgeslagen |
|---|---|---|
| Kaartafbeelding | De afbeelding (PNG), de grootte, de ankers | Hoogte, spiegeling, dekking, helderheid, ontkleuring - teruggezet op de standaardwaarden (hoogte = de laagste Y van de huidige dataset, spiegeling aan) |
| 3D-niveau | Hoekpunten, hoekpuntkleuren, texturcoördinaten, hun tegels en de textuuratlas, grond-, structuur- en watertriangels, randen van structuren, aantallen triangels | Onderdeelnamen en de redenen van de classificatie, en elke weergave-instelling - teruggezet op de standaardwaarden van een nieuwe import |

Een model dat uit de bibliotheek is geladen, heeft geen onderdelenlijst, en zijn grenzen en de hoogteband van de grond worden opnieuw berekend uit zijn hoekpunten.

## Waar het staat {#where-it-lives}

In de IndexedDB van de browser, database `3dheat`, objectopslag `levels`, voor de oorsprong van de pagina (het adres in de adresbalk van de browser). Het is lokaal voor dat browserprofiel: een andere browser, een ander profiel of een ander adres (bijvoorbeeld `localhost` in plaats van `127.0.0.1`) ziet een andere, lege bibliotheek. Het wissen van de gegevens van de site in de browser verwijdert hem. Items die door oudere versies zonder structuren, kleuren of water zijn opgeslagen, laden nog steeds.

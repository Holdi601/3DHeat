---
title: "De documentatie onderhouden"
nav_order: 23
lang: "nl"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# De documentatie onderhouden

Deze pagina is voor wie de viewer en deze site onderhoudt. Ze somt de stappen op om de pagina's, de afbeeldingen en de vertalingen na een wijziging correct te houden.

Deze site wordt opnieuw gecontroleerd bij **elke release** en wanneer iets veel verandert: sneltoetsen, de weg door de gebruikersinterface, instellingen, bestandsformaten. De checklist:

1. **Genereer de referentiepagina's opnieuw**: `node tools/docs-refs.mjs` (en `--lang <taal>` voor elke taal). `node tools/docs-refs.mjs --check` faalt wanneer een pagina verouderd is.
2. **Genereer de schermafbeeldingen opnieuw** op basis van de [demodata](demo-data.md). Gebruik een computer of container waarvan de regio en-US is, zodat getallen als `0.35` worden gelezen en niet als `0,35` (de getalvakken volgen de regio van de browser totdat die wordt gewijzigd). Maak de demodata met `node tools/demo-data.mjs`, start een ontwikkelserver op poort 5321 **zonder** een lokaal figurenpakket, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, en draai daarna `node tools/docs-shots.mjs --lang <taal>`. Bekijk elke afbeelding: alleen demonamen (*Demo Valley*, *Blue 1*, *Red 3* ...), geen echte kaarten, spelers of opnamen.
3. **Maak een lijst van wat er is veranderd** sinds de laatste releasetag: `git log --oneline <laatste tag>..HEAD`, en de sectie **Docs** van `CHANGELOG.md`, die elke functie aan zijn pagina koppelt. Elke nieuwe functie heeft een pagina of een sectie nodig, met een afbeelding waar hij op het scherm te zien is.
4. **Onafhankelijke beoordeling** van de Engelse pagina's door iemand die ze niet heeft geschreven, voor drie lezers: een beginner, een achtjarige, een expert. Zijn de stappen compleet en in de juiste volgorde, zijn de woorden die van de gebruikersinterface, kloppen de afbeeldingen, kloppen de labels van de diagrammen?
5. **Los op wat de beoordeling vond.**
6. **Vertaal de gewijzigde pagina's opnieuw** op hun brontegel, en draai daarna de beoordeling per taal. Zie `tools/docs-translate.md`.
7. **Scan de gewijzigde bestanden op vertrouwelijke termen**, en controleer dat geen afbeelding iets anders dan demodata toont.
8. **Publiceer** pas wanneer de release is goedgekeurd.

Dezelfde controle geldt voor de documentatiesites van de verwante repositories (zie de pagina [Startpagina](index.md#related-repositories)).

## De hulpmiddelen onder exporters/ {#the-tools-under-exporters}

De hulpmiddelen rond de viewer zijn aparte openbare projecten, elk met een eigen MIT-licentie, releases, wiki en updatecontrole, en in deze repository vastgezet als git-submodules:

| Map | Repository |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - banen en niveaus uit de eigen archieven van spellen |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - opnemers van rondetelemetrie; niveaus uit gameplayvideo |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - plug-in voor de Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2-demo's en kaarten |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - neemt spel op de achtergrond op |

**Vastgezet** betekent dat deze repository één exacte commit van elk hulpmiddel vastlegt. Een kopie van de viewer krijgt die commits:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# of, na een gewone kloon:
git submodule update --init
```

Beide updatemanieren hierboven draaien `git submodule update --init` na het ophalen, zodat de hulpmiddelen de viewer volgen naar de commits die zijn nieuwste versie vastzet - niet de nieuwste commits van de hulpmiddelen zelf. Een nieuwere release van een hulpmiddel bereikt de viewer wanneer de vastzetting hier wordt verplaatst: wijzigingen aan een hulpmiddel worden eerst in zijn eigen map (zijn eigen repository) vastgelegd en gepusht, daarna wordt de nieuwe vastzetting hier vastgelegd. Elk hulpmiddel controleert ook op zijn eigen nieuwere releases; dat staat beschreven in zijn eigen repository.

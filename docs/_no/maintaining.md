---
title: "Vedlikehold av dokumentasjonen"
nav_order: 23
lang: "no"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Vedlikehold av dokumentasjonen

Denne siden er for den som tar vare på visningsprogrammet og dette nettstedet. Den lister opp stegene for å holde sidene, bildene og oversettelsene riktige etter en endring.

Nettstedet kontrolleres på nytt med **hver utgivelse** og hver gang noe endrer seg mye: hurtigtaster, veien gjennom brukergrensesnittet, innstillinger, filformater. Sjekklisten:

1. **Generer referansesidene på nytt**: `node tools/docs-refs.mjs` (og `--lang <språk>` for hvert språk). `node tools/docs-refs.mjs --check` feiler når en side er utdatert.
2. **Generer skjermbildene på nytt** fra [demodataene](demo-data.md). Bruk en datamaskin eller container med region en-US, slik at tall leses `0.35` og ikke `0,35` (tallboksene følger nettleserens region til de endres). Lag demodataene med `node tools/demo-data.mjs`, start en utviklingsserver på port 5321 **uten** en lokal figurpakke, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, og kjør deretter `node tools/docs-shots.mjs --lang <språk>`. Se på hvert bilde: bare demonavn (*Demo Valley*, *Blue 1*, *Red 3* ...), ingen ekte kart, spillere eller opptak.
3. **List opp det som er endret** siden forrige utgivelsestagg: `git log --oneline <siste tagg>..HEAD`, og delen **Docs** i `CHANGELOG.md`, som kobler hver funksjon til sin side. Hver ny funksjon trenger en side eller en del, med et bilde der den vises på skjermen.
4. **Uavhengig gjennomgang** av de engelske sidene av noen som ikke skrev dem, for tre lesere: en nybegynner, en åtteåring, en ekspert. Er stegene komplette og i riktig rekkefølge, er ordene de i brukergrensesnittet, er bildene oppdaterte, og stemmer diagrammenes etiketter?
5. **Rett det gjennomgangen fant.**
6. **Oversett de endrede sidene på nytt** etter deres kildehash, og kjør gjennomgangen per språk. Se `tools/docs-translate.md`.
7. **Skann etter konfidensielle termer** i de endrede filene, og sjekk at intet bilde viser noe annet enn demodata.
8. **Publiser** bare når utgivelsen er godkjent.

Den samme kontrollen dekker dokumentasjonsnettstedene til de beslektede depotene (se [Hjem](index.md#related-repositories)-siden).

## Verktøyene under exporters/ {#the-tools-under-exporters}

Verktøyene rundt visningsprogrammet er egne offentlige prosjekter, hvert med sin egen MIT-lisens, utgivelser, wiki og oppdateringssjekk, festet i dette depotet som git-undermoduler:

| Mappe | Depot |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - baner og nivåer ut av spillenes egne arkiver |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - opptakere av rundetelemetri; nivåer fra spillvideo |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - tillegg for Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2-demoer og kart |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - tar opp spill i bakgrunnen |

**Festet** betyr at dette depotet registrerer nøyaktig én commit av hvert verktøy. En utsjekking av visningsprogrammet får disse commitene:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# eller, etter en vanlig klone:
git submodule update --init
```

Begge oppdateringsveiene over kjører `git submodule update --init` etter å ha hentet, så verktøyene følger visningsprogrammet til commitene dets nyeste versjon fester - ikke verktøyenes egne nyeste commiter. En nyere utgivelse av et verktøy når visningsprogrammet når festet her flyttes: endringer i et verktøy committes og pushes først i sin egen mappe (sitt eget depot), og deretter committes det nye festet her. Hvert verktøy sjekker også selv etter sine nyere utgivelser; det er dokumentert i sitt eget depot.

---
title: "Vedligeholdelse af dokumentationen"
nav_order: 23
lang: "da"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Vedligeholdelse af dokumentationen

Denne side er til den, der passer fremviseren og dette site. Den viser trinene til at holde siderne, billederne og oversættelserne korrekte efter en ændring.

Siden gennemgås igen med **hver udgivelse** og hver gang, noget ændrer sig meget: tastaturgenveje, vejen gennem brugerfladen, indstillinger, filformater. Tjeklisten:

1. **Generér referencesiderne igen**: `node tools/docs-refs.mjs` (og `--lang <lang>` for hvert sprog). `node tools/docs-refs.mjs --check` fejler, når en side er forældet.
2. **Generér skærmbillederne igen** ud fra [demodataene](demo-data.md). Brug en computer eller container, hvis region er en-US, så tal læses `0.35` og ikke `0,35` (talboksene følger browserens region, indtil de ændres). Lav demodataene med `node tools/demo-data.mjs`. Start en udviklingsserver på port 5321 **uden** en lokal figurpakke: `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`. Kør derefter `node tools/docs-shots.mjs --lang <lang>`. Kig på hvert billede: kun demonavne (*Demo Valley*, *Blue 1*, *Red 3* ...), ingen rigtige kort, spillere eller optagelser.
3. **List, hvad der er ændret** siden den seneste udgivelsestag: `git log --oneline <last tag>..HEAD` og afsnittet **Docs** i `CHANGELOG.md`, der kobler hver funktion til sin side. Hver ny funktion behøver en side eller et afsnit, med et billede, hvor den vises på skærmen.
4. **Uafhængig gennemgang** af de engelske sider af en, der ikke skrev dem, for tre læsere: en begynder, en otteårig og en ekspert. Er trinene komplette og i den rigtige rækkefølge? Er ordene de samme som i brugerfladen, billederne aktuelle, og diagrammernes etiketter rigtige?
5. **Ret det, gennemgangen fandt.**
6. **Oversæt de ændrede sider igen** efter deres kildehash, og kør derefter gennemgangen pr. sprog. Se `tools/docs-translate.md`.
7. **Scan de ændrede filer for fortrolige termer**, og kontrollér, at intet billede viser andet end demodata.
8. **Udgiv** først, når udgivelsen er godkendt.

Den samme kontrol dækker dokumentationssitene i de beslægtede repositories (se siden [Start](index.md#related-repositories)).

## Værktøjerne under exporters/ {#the-tools-under-exporters}

Værktøjerne omkring fremviseren er separate offentlige projekter. Hvert har sin egen MIT-licens, sine egne udgivelser, wiki og opdateringstjek. De er fastgjort i dette repository som git-submoduler:

| Mappe | Repository |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - baner og niveauer ud fra spillenes egne arkiver |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - optagere af omgangstelemetri; niveauer ud fra gameplay-video |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - plugin til Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2-demoer og kort |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - optager spil i baggrunden |

**Fastgjort** betyder, at dette repository registrerer én præcis commit af hvert værktøj. En kopi af fremviseren får netop disse commits:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# eller, efter en almindelig kloning:
git submodule update --init
```

Begge opdateringsveje ovenfor kører `git submodule update --init` efter hentning. Værktøjerne følger derfor fremviseren til de commits, dens nyeste version fastgør, og ikke til værktøjernes egne nyeste commits. En nyere udgivelse af et værktøj når fremviseren, når fastgørelsen her flyttes. Ændringer i et værktøj committes og pushes først i dets egen mappe (dets eget repository). Derefter committes den nye fastgørelse her. Hvert værktøj tjekker også selv for nyere udgivelser. Det er dokumenteret i dets eget repository.

---
title: "Underhålla dokumentationen"
nav_order: 23
lang: "sv"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Underhålla dokumentationen

Den här sidan är för den som sköter visaren och den här webbplatsen. Den listar stegen för att hålla sidorna, bilderna och översättningarna korrekta efter en ändring.

Den här webbplatsen kontrolleras igen vid **varje version** och när något ändras mycket: tangentbindningar, vägen genom gränssnittet, inställningar och filformat. Checklistan:

1. **Generera referenssidorna igen**: `node tools/docs-refs.mjs` (och `--lang <lang>` för varje språk). `node tools/docs-refs.mjs --check` misslyckas när en sida är inaktuell.
2. **Generera skärmbilderna igen** från [demodatan](demo-data.md). Använd en dator eller container vars region är en-US, så att siffror blir `0.35` och inte `0,35` (sifferrutorna följer webbläsarens region tills de ändras). Skapa demodatan med `node tools/demo-data.mjs`, starta en utvecklingsserver på port 5321 **utan** ett lokalt figurpaket, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, och kör sedan `node tools/docs-shots.mjs --lang <lang>`. Titta på varje bild: bara demonamn (*Demo Valley*, *Blue 1*, *Red 3* ...), inga riktiga kartor, spelare eller inspelningar.
3. **Lista vad som ändrats** sedan den senaste versionsetiketten: `git log --oneline <last tag>..HEAD`, och avsnittet **Docs** i `CHANGELOG.md`, som kopplar varje funktion till sin sida. Varje ny funktion behöver en sida eller ett avsnitt, med en bild där den syns på skärmen.
4. **Oberoende granskning** av de engelska sidorna av någon som inte skrev dem, för tre läsare: en nybörjare, en åttaåring och en expert. Är stegen kompletta och i rätt ordning? Är orden de som gränssnittet använder? Är bilderna aktuella? Är diagrammens etiketter rätt?
5. **Åtgärda det granskningen hittade.**
6. **Översätt de ändrade sidorna igen** efter deras källhash, och kör sedan granskningen per språk. Se `tools/docs-translate.md`.
7. **Sök igenom de ändrade filerna** efter konfidentiella termer, och kontrollera att ingen bild visar något annat än demodata.
8. **Publicera** först när versionen är godkänd.

Samma kontroll omfattar dokumentationswebbplatserna för de närliggande förvaren (se startsidan under [Relaterade förvar](index.md#related-repositories)).

## Verktygen under exporters/ {#the-tools-under-exporters}

Verktygen runt visaren är separata öppna projekt. Vart och ett har sin egen MIT-licens, sina egna versioner, sin egen wiki och sin egen uppdateringskontroll. De är fästa i det här förvaret som git-submoduler:

| Mapp | Förvar |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - banor och nivåer ur spelens egna arkiv |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - inspelare av varvtelemetri; nivåer från spelvideo |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - insticksprogram för Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2-demon och kartor |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - spelar in spel i bakgrunden |

**Fästa** betyder att det här förvaret registrerar en exakt incheckning av varje verktyg. En utcheckning av visaren får de incheckningarna:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# or, after a plain clone:
git submodule update --init
```

Båda uppdateringsvägarna ovan kör `git submodule update --init` efter att ha hämtat. Verktygen följer därför visaren till de incheckningar som dess nyaste version fäster, inte till verktygens egna nyaste incheckningar. Ett verktygs nyare version når visaren när fästningen här flyttas. Ändringar i ett verktyg checkas först in och skickas i dess egen mapp (dess eget förvar), och sedan checkas den nya fästningen in här. Varje verktyg kontrollerar också efter sina egna nyare versioner. Det beskrivs i dess eget förvar.

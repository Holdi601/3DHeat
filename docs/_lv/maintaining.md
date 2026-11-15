---
title: "Dokumentācijas uzturēšana"
nav_order: 23
lang: "lv"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Dokumentācijas uzturēšana

Šī lapa ir paredzēta tam, kas uztur skatītāju un šo vietni. Tā uzskaita soļus, lai lapas, attēli un tulkojumi paliktu pareizi pēc izmaiņas.

Šī vietne tiek pārbaudīta atkal ar **katru laidienu** un ikreiz, kad kaut kas stipri mainās: taustiņu piesaistes, ceļš cauri lietotāja saskarnei, iestatījumi, failu formāti. Kontrolsaraksts:

1. **Atjaunojiet atsauces lapas**: `node tools/docs-refs.mjs` (un `--lang <lang>` katrai valodai). `node tools/docs-refs.mjs --check` neizdodas, kad lapa ir novecojusi.
2. **Atjaunojiet ekrānuzņēmumus** no [demonstrācijas datiem](demo-data.md). Izmantojiet datoru vai konteineru ar reģionu en-US, lai skaitļi tiktu rādīti kā `0.35`, nevis `0,35` (skaitļu lodziņi seko pārlūka reģionam, kamēr tas nav mainīts). Izveidojiet demonstrācijas datus ar `node tools/demo-data.mjs`, palaidiet izstrādes serveri portā 5321 **bez** vietējā figūru paka, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, tad palaidiet `node tools/docs-shots.mjs --lang <lang>`. Apskatiet katru attēlu: tajos drīkst būt tikai demonstrācijas nosaukumi (*Demo Valley*, *Blue 1*, *Red 3* ...), nevis reālas kartes, spēlētāji vai ieraksti.
3. **Uzskaitiet, kas ir mainījies** kopš pēdējā laidiena tagu: `git log --oneline <last tag>..HEAD` un sadaļu **Docs** failā `CHANGELOG.md`, kas katru funkciju saista ar lapu. Katrai jaunai funkcijai vajag lapu vai sadaļu, ar attēlu, kur tā parādās ekrānā.
4. **Neatkarīga angļu lapu pārskatīšana** no kāda, kas tās nav rakstījis, trim lasītājiem: iesācējam, astoņgadniekam un ekspertam. Vai soļi ir pilni un pareizā secībā? Vai vārdi ir lietotāja saskarnes vārdi? Vai attēli ir aktuāli un diagrammu uzraksti pareizi?
5. **Izlabojiet to, ko atrada pārskatīšana.**
6. **Pārtulkojiet mainītās lapas** pēc to avota jaucējkoda, tad veiciet pārskatīšanu katrai valodai. Skatiet `tools/docs-translate.md`.
7. **Pārbaudiet konfidenciālos terminus** mainītajos failos un pārliecinieties, ka neviens attēls neparāda neko citu kā demonstrācijas datus.
8. **Publicējiet** tikai tad, kad laidiens ir apstiprināts.

Tā pati pārbaude attiecas uz saistīto repozitoriju dokumentācijas vietnēm (skatiet lapu [Sākums](index.md#related-repositories)).

## Rīki zem exporters/ {#the-tools-under-exporters}

Rīki ap skatītāju ir atsevišķi publiski projekti. Katram ir sava MIT licence, laidieni, wiki un atjauninājumu pārbaude. Tie ir piesprausti šajā repozitorijā kā git submoduļi:

| Mape | Repozitorijs |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - kursi un līmeņi no spēļu pašu arhīviem |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - apļu telemetrijas ierakstītāji; līmeņi no spēles video |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - Unreal Editor spraudnis |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2 demo un kartes |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - ieraksta spēli fonā |

**Piesprausts** nozīmē, ka šis repozitorijs ieraksta katra rīka vienu konkrētu commit. Skatītāja kopija saņem tieši šos commit:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# or, after a plain clone:
git submodule update --init
```

Abi iepriekš minētie atjaunināšanas ceļi pēc pievilkšanas palaiž `git submodule update --init`. Tāpēc rīki seko skatītājam līdz tiem commit, kurus piespraud tā jaunākā versija, nevis līdz pašu rīku jaunākajiem commit. Rīka jaunāks laidiens sasniedz skatītāju, kad šeit tiek pārvietots piespraudums. Izmaiņas rīkā vispirms tiek commit un push tā mapē (tā repozitorijā), tad jaunais piespraudums tiek commit šeit. Katrs rīks arī pārbauda savus jaunākos laidienus; to dokumentē pašā repozitorijā.

---
title: "Iż-żamma tad-dokumentazzjoni"
nav_order: 23
lang: "mt"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Iż-żamma tad-dokumentazzjoni

Din il-paġna hija għal min jieħu ħsieb il-viewer u dan is-sit. Telenka l-passi biex il-paġni, l-istampi u t-traduzzjonijiet jibqgħu korretti wara bidla.

Dan is-sit jiġi eżaminat mill-ġdid **f'kull rilaxx** u kull meta xi ħaġa tinbidel ħafna: ċwievet, il-mod kif tiġi UI, is-settings, il-formati tal-fajls. Il-lista ta' kontroll:

1. **Ġenera mill-ġdid il-paġni tar-referenza**: `node tools/docs-refs.mjs` (u `--lang <lang>` għal kull lingwa). `node tools/docs-refs.mjs --check` jfalli meta paġna tkun skaduta.
2. **Ġenera mill-ġdid l-istampi** mid-[dejta tad-demo](demo-data.md). Uża kompjuter jew container li r-reġjun tiegħu huwa en-US, sabiex in-numri jinqraw `0.35` u mhux `0,35` (il-kaxxi tan-numri jsegwu r-reġjun tal-browser sakemm ma jinbidlux). Ħejji d-dejta tad-demo b'`node tools/demo-data.mjs`, ibda server tal-iżvilupp fuq il-port 5321 **mingħajr** pakkett lokali ta' figuri, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, imbagħad ħaddem `node tools/docs-shots.mjs --lang <lang>`. Ħares lejn kull stampa: isimijiet tad-demo biss (*Demo Valley*, *Blue 1*, *Red 3* ...), l-ebda mappa vera, plejers jew reġistrazzjonijiet.
3. **Elenka dak li nbidel** mill-aħħar tag tar-rilaxx: `git log --oneline <last tag>..HEAD`, u t-taqsima **Docs** ta' `CHANGELOG.md`, li tgħaqqad kull feature mal-paġna tagħha. Kull feature ġdida teħtieġ paġna jew taqsima, b'stampa fejn turi fuq l-iskrin.
4. **Reviżjoni indipendenti** tal-paġni bl-Ingliż minn xi ħadd li ma kitibhomx, għal tliet qarrejja: bidu, tifel ta' tmien snin, espert. Il-passi kompluti u f'ordni t-tajba, il-kliem dak tal-UI, l-istampi aġġornati, it-tikketti tad-diagrammi tajbin?
5. **Ikkoreġi dak li sab ir-reviżjoni.**
6. **Erġa' tittraduċi l-paġni mibdula** skont il-hash tas-sors tagħhom, imbagħad mexxi r-reviżjoni għal kull lingwa. Ara `tools/docs-translate.md`.
7. **Ħares għal termini kunfidenzjali** fuq il-fajls mibdula, u iċċekkja li l-ebda stampa ma turi xi ħaġa għajr dejta tad-demo.
8. **Ippubblika** biss meta r-rilaxx ikun approvat.

L-istess kontroll jkopri s-siti tad-dokumentazzjoni tar-repożitorji relatati (ara l-paġna [Id-Dar](index.md#related-repositories)).

## L-għodod taħt exporters/ {#the-tools-under-exporters}

L-għodod ta' madwar il-viewer huma proġetti pubbliċi separati, kull wieħed bil-liċenzja MIT tiegħu, bir-rilaxxi, bil-wiki u bil-kontroll tal-aġġornamenti tiegħu, imwaħħla ma' dan ir-repożitorju bħala git submodules:

| Folder | Repożitorju |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - korsi u livelli miġjuba mill-arkivji tal-logħob stess |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - registraturi tat-telemetrija tad-dawriet; livelli minn video ta' logħba |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - plugin tal-Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - demos u mappi tal-CS2 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - jirreġistra l-logħba fil-background |

**Ippinnjat** ifisser li dan ir-repożitorju jirreġistra commit eżatt ta' kull għodda. Checkout tal-viewer jiksbu dawk il-commits:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# or, after a plain clone:
git submodule update --init
```

It-tnejn il-mogħdijiet tal-aġġornament hawn fuq jaħdmu `git submodule update --init` wara l-pull, għalhekk l-għodod isegwu lill-viewer sal-commits li jippinnja l-aħħar verżjoni tiegħu - mhux l-aħħar commits tal-għodod nfushom. Rilaxx aktar ġdid ta' għodda jasal lill-viewer meta jitħaraq il-pin hawn: bidliet għal għodda jiġu commitati u ppubblikati fil-folder tagħha (fir-repożitorju tagħha) l-ewwel, imbagħad il-pin il-ġdid jiġi commitat hawn. Kull għodda tfittex ukoll rilaxxi aktar ġodda tagħha; dan huwa ddokumentat fir-repożitorju tagħha stess.

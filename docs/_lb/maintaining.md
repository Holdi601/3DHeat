---
title: "D'Dokumentatioun pflegen"
nav_order: 23
lang: "lb"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---


# D'Dokumentatioun pflegen

Dës Säit ass fir déi, déi d'Visualisatioun an dës Säit betreien. Si lëscht d'Schrëtt op, fir d'Säiten, d'Biller an d'Iwwersetzungen no enger Ännerung richteg ze halen.

Dës Säit gëtt bei **all Verëffentlechung** nei gepréift a ëmmer wann eppes vill ännert: Tastekierzelen, de Wee duerch d'Ouverfläch, Astellungen, Dateiformater. D'Checklëscht:

1. **D'Referenzsäiten neu erzeegen**: `node tools/docs-refs.mjs` (a `--lang <lang>` fir all Sprooch). `node tools/docs-refs.mjs --check` schléit fehl, wann eng Säit net méi aktuell ass.
2. **D'Screenshots neu maachen** mat den [Demo-Daten](demo-data.md). Benotzt e Computer oder e Container mat der Regioun en-US, sou datt d'Zuelen `0.35` weisen an net `0,35` (d'Zuelefelder follegen der Regioun vum Browser, bis se geännert ginn). D'Demo-Daten mécht Dir mat `node tools/demo-data.mjs`, startet en Dev-Server op Port 5321 **ouni** lokalen Figurenpak, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, an dann `node tools/docs-shots.mjs --lang <lang>`. Kuckt jiddert Bild un: nëmmen Demo-Nimm (*Demo Valley*, *Blue 1*, *Red 3* ...), keng echte Kaarten, Spiller oder Opnamen.
3. **Opschreiwen, wat sech zënter dem leschte Versiounsmarker geännert huet**: `git log --oneline <leschte Marker>..HEAD`, an d'Sektioun **Docs** vun `CHANGELOG.md`, déi all Funktioun op hir Säit verbënnt. All nei Funktioun brauch eng Säit oder eng Sektioun, mat engem Bild, wou se um Bildschierm ze gesi ass.
4. **Eng onofhängeg Kontroll** vun den englesche Säiten vun engem, deen se net geschriwwe huet, fir dräi Lieser: en Ufänger, en Achtjäregen, en Experten. Sinn d'Schrëtt vollstänneg an an der richteger Reiefolleg, d'Wieder d'Wieder vun der Ouverfläch, d'Biller aktuell, d'Beschrëftungen vun de Schema richteg?
5. **Dat fixéieren, wat d'Kontroll fonnt huet.**
6. **D'geännert Säiten nei iwwersetzen** no hirem Quellhash, dann d'Kontroll pro Sprooch lafen loossen. Kuckt `tools/docs-translate.md`.
7. **Déi geännert Dateien no vertrauleche Begrëffer scannen**, an iwwerprüfen, datt keen Bild anescht wéi Demo-Daten weist.
8. **Nëmmen publizéieren**, wann d'Verëffentlechung ugeholl ass.

Dee selwechte Check deckt d'Dokumentatiouns-Säiten vun den zougehéierende Repositories of (kuckt d'[Startsäit](index.md#related-repositories)).

## D'Tools ënner exporters/ {#the-tools-under-exporters}

D'Tools ronderëm d'Visualisatioun si getrennt ëffentlech Projeten, all mat hirer eegener MIT-Lizenz, eegene Verëffentlechungen, Wiki an Updatekontroll, an dësem Repository als Git-Submodule festgemaach:

| Ordner | Repository |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - Parcoursen an Levelen aus den eegene Archiven vun de Spiller |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - Opnamegeräter fir Rondentelemetrie; Levelen aus Spillvideoen |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - Plugin fir den Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2-Demoen an Kaarten |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - nimmt d'Spill am Hannergrond op |

**Festgemaach** heescht: dëst Repository hält genau ee Commit vun all Tool fest. E Checkout vun der Visualisatioun kritt dës Commiten:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# oder, nom normale Klonen:
git submodule update --init
```

Béid Aktualiséierungswee uewen féieren nom Pull `git submodule update --init` aus, sou datt d'Tools der Visualisatioun bis zu den Commiten folgen, déi hir neiste Versioun festmécht - net de neisten Commiten vun den Tools selwer. Eng nei Verëffentlechung vun engem Tool kënnt bei der Visualisatioun un, wann de Pin hei geréckelt gëtt: Ännerunge vun engem Tool ginn éischt a sengem eegene Ordner (sengem eegene Repository) committet a gepusht, an dann gëtt den neie Pin hei committet. All Tool kontrolléiert och selwer no neien Verëffentlechungen; dat steet a sengem eegene Repository.

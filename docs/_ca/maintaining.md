---
title: "Manteniment de la documentació"
nav_order: 23
lang: "ca"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Manteniment de la documentació

Aquesta pàgina és per a qui cuida el visor i aquest lloc. Enumera els passos per mantenir correctes les pàgines, les imatges i les traduccions després d'un canvi.

Aquest lloc es revisa de nou amb **cada versió** i sempre que canvia molt alguna cosa: tecles, el camí per la interfície, els ajustos, els formats de fitxer. La llista de comprovació:

1. **Regenera les pàgines de referència**: `node tools/docs-refs.mjs` (i `--lang <lang>` per a cada idioma). `node tools/docs-refs.mjs --check` falla quan una pàgina està desfasada.
2. **Regenera les captures de pantalla** a partir de les [dades de demostració](demo-data.md). Usa un ordinador o contenidor amb la regió en-US, perquè els números es llegeixin `0.35` i no `0,35` (les caselles de números segueixen la regió del navegador fins que es canvien). Fes les dades de demostració amb `node tools/demo-data.mjs`, arrenca un servidor de desenvolupament al port 5321 **sense** un paquet local de figures, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, i després executa `node tools/docs-shots.mjs --lang <lang>`. Mira cada imatge: només noms de demostració (*Demo Valley*, *Blue 1*, *Red 3* ...), cap mapa real, jugador o gravació.
3. **Llista què ha canviat** des de l'última etiqueta de versió: `git log --oneline <última etiqueta>..HEAD`, i la secció **Docs** de `CHANGELOG.md`, que relaciona cada funció amb la seva pàgina. Cada funció nova necessita una pàgina o una secció, amb una imatge on es vegi a la pantalla.
4. **Revisió independent** de les pàgines en anglès per algú que no les va escriure, per a tres lectors: un principiant, un nen de vuit anys, un expert. Els passos són complets i en l'ordre correcte, les paraules són les de la interfície, les imatges són actuals, les etiquetes dels diagrames són correctes?
5. **Corregeix el que ha trobat la revisió.**
6. **Torna a traduir les pàgines canviades** pel seu hash de font, i després fes la revisió per idioma. Vegeu `tools/docs-translate.md`.
7. **Cerca termes confidencials** als fitxers canviats, i comprova que cap imatge mostri res que no siguin dades de demostració.
8. **Publica** només quan la versió estigui aprovada.

La mateixa comprovació cobreix els llocs de documentació dels repositoris relacionats (vegeu la pàgina d'[Inici](index.md#related-repositories)).

## Les eines de exporters/ {#the-tools-under-exporters}

Les eines que envolten el visor són projectes públics separats, cadascun amb la seva pròpia llicència MIT, versions, wiki i comprovació d'actualitzacions, fixats en aquest repositori com a submòduls de git:

| Carpeta | Repositori |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - cursos i nivells dels propis arxius dels jocs |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - gravadors de telemetria de voltes; nivells a partir de vídeos de partida |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - connector per a l'Editor d'Unreal |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - demos i mapes de CS2 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - grava la partida en segon pla |

**Fixat** vol dir que aquest repositori registra un commit exacte de cada eina. Una còpia del visor obté aquests commits:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# o, després d'un clonatge simple:
git submodule update --init
```

Les dues vies d'actualització de dalt executen `git submodule update --init` després de fer pull, de manera que
les eines segueixen el visor fins als commits que fixa la seva versió més nova, no els
commits més nous de les pròpies eines. La versió nova d'una eina arriba al visor
quan es mou el fixat d'aquí: els canvis a una eina es confirmen i es pugen primer
a la seva carpeta (el seu propi repositori), i després es confirma aquí el nou fixat. Cada eina també
comprova si hi ha versions noves seves; això està documentat al seu propi repositori.

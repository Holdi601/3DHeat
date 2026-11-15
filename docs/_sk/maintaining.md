---
title: "Údržba dokumentácie"
nav_order: 23
lang: "sk"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---


# Údržba dokumentácie

Táto stránka je pre toho, kto sa stará o prehliadač a túto stránku. Vypisuje kroky, ktoré po zmene udržia stránky, obrázky a preklady správne.

Táto stránka sa znovu kontroluje pri **každom vydaní** a vždy, keď sa niečo veľmi zmení: klávesové skratky, cesta cez rozhranie, nastavenia, formáty súborov. Kontrolný zoznam:

1. **Znovu vygenerujte referenčné stránky**: `node tools/docs-refs.mjs` (a `--lang <lang>` pre každý jazyk). `node tools/docs-refs.mjs --check` zlyhá, keď je stránka zastaraná.
2. **Znovu vygenerujte obrázky** z [demo dát](demo-data.md). Použite počítač alebo kontajner s regiónom en-US, aby sa čísla čítali `0.35` a nie `0,35` (číselné políčka nasledujú región prehliadača, kým sa nezmenia). Vytvorte demo dáta príkazom `node tools/demo-data.mjs`, spustite vývojový server na porte 5321 **bez** lokálneho balíka figúrok, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, a potom spustite `node tools/docs-shots.mjs --lang <lang>`. Pozrite si každý obrázok: len názvy z ukážky (*Demo Valley*, *Blue 1*, *Red 3* ...), žiadne skutočné mapy, hráči ani nahrávky.
3. **Vypíšte, čo sa zmenilo** od posledného vydania: `git log --oneline <posledný tag>..HEAD` a sekciu **Docs** v `CHANGELOG.md`, ktorá každú funkciu prepája s jej stránkou. Každá nová funkcia potrebuje stránku alebo sekciu, s obrázkom tam, kde sa ukazuje na obrazovke.
4. **Nezávislá kontrola** anglických stránok niekým, kto ich nenapísal, pre tri čitateľov: začiatočník, osemročné dieťa, expert. Sú kroky úplné a v správnom poradí, slová sú slová rozhrania, obrázky sú aktuálne a popisky v diagramoch správne?
5. **Opravte, čo kontrola našla.**
6. **Znovu preložte zmenené stránky** podľa ich zdrojového hash a potom spustite kontrolu pre každý jazyk. Pozri `tools/docs-translate.md`.
7. **Prehľadajte zmenené súbory na dôverné výrazy** a skontrolujte, že na žiadnom obrázku nie je nič iné ako demo dáta.
8. **Zverejnite** len vtedy, keď je vydanie schválené.

Tá istá kontrola pokrýva dokumentačné stránky súvisiacich repozitárov (pozri stránku [Domov](index.md#related-repositories)).

## Nástroje pod exporters/ {#the-tools-under-exporters}

Nástroje okolo prehliadača sú samostatné verejné projekty, každý s vlastnou licenciou MIT, vydaniami, wiki a kontrolou aktualizácií, pripnuté v tomto repozitári ako git submoduly:

| Priečinok | Repozitár |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - trate a úrovne z vlastných archívov hier |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - nahrávače telemetrie kôl; úrovne z videa hry |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - zásuvný modul pre Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - dema a mapy CS2 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - nahráva hru na pozadí |

**Pripnuté** znamená, že tento repozitár zaznamenáva presne jeden commit každého nástroja. Kópia prehliadača tie commity dostane:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# alebo po obyčajnom klonovaní:
git submodule update --init
```

Obe cesty aktualizácie vyššie spúšťajú `git submodule update --init` po stiahnutí, takže
nástroje nasledujú prehliadač k commitom, ktoré jeho najnovšia verzia pripína - nie k
najnovším commitom samotných nástrojov. Novšie vydanie nástroja sa dostane do prehliadača,
keď sa tu posunie pripnutie: zmeny nástroja sa najprv commitnú a pushnú v jeho
vlastnom priečinku (vo vlastnom repozitári), až potom sa tu commitne nové pripnutie. Každý nástroj
tiež kontroluje vlastné novšie vydania; je to zdokumentované vo
vlastnom repozitári.

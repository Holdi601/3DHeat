---
title: "Údržba dokumentace"
nav_order: 23
lang: "cs"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Údržba dokumentace

Tato stránka je pro toho, kdo se stará o prohlížeč a tento web. Vypisuje kroky, jak po změně udržet stránky, obrázky a překlady správné.

Tento web se znovu kontroluje při **každém vydání** a kdykoli se něco hodně změní: klávesové zkratky, cesta rozhraním, nastavení, formáty souborů. Kontrolní seznam:

1. **Přegenerujte referenční stránky**: `node tools/docs-refs.mjs` (a `--lang <lang>` pro každý jazyk). `node tools/docs-refs.mjs --check` selže, když je stránka zastaralá.
2. **Přegenerujte snímky obrazovky** z [ukázkových dat](demo-data.md). Použijte počítač nebo kontejner s oblastí en-US, aby se čísla četla `0.35`, a ne `0,35` (číselná pole se řídí oblastí prohlížeče, dokud se nezmění). Vytvořte ukázková data příkazem `node tools/demo-data.mjs`, spusťte vývojový server na portu 5321 **bez** místního balíku figur, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, a pak spusťte `node tools/docs-shots.mjs --lang <lang>`. Prohlédněte si každý obrázek: smí tam být jen názvy z ukázky (*Demo Valley*, *Blue 1*, *Red 3* ...), žádné skutečné mapy, hráči nebo záznamy.
3. **Vypište, co se změnilo** od posledního vydaného tagu: `git log --oneline <poslední tag>..HEAD` a sekci **Docs** v `CHANGELOG.md`, která každou funkci přiřazuje k její stránce. Každá nová funkce potřebuje stránku nebo sekci, s obrázkem tam, kde se ukazuje na obrazovce.
4. **Nezávislá kontrola** anglických stránek někým, kdo je nepsal, pro tři čtenáře: začátečníka, osmiletého dítě, odborníka. Jsou kroky úplné a ve správném pořadí, jsou slova ta, která používá rozhraní, jsou obrázky aktuální a jsou popisky diagramů správné?
5. **Opravte, co kontrola našla.**
6. **Přeložte znovu změněné stránky** podle jejich zdrojového hashe, pak spusťte kontrolu pro každý jazyk. Viz `tools/docs-translate.md`.
7. **Prohledejte změněné soubory** na důvěrné výrazy a zkontrolujte, že žádný obrázek neukazuje nic jiného než ukázková data.
8. **Zveřejněte** jen tehdy, když je vydání schváleno.

Stejnou kontrolu prochází i dokumentační weby příbuzných repozitářů (viz stránka [Domů](index.md#related-repositories)).

## Nástroje pod exporters/ {#the-tools-under-exporters}

Nástroje kolem prohlížeče jsou samostatné veřejné projekty, každý s vlastní licencí MIT, vydáními, wiki a kontrolou aktualizací, a v tomto repozitáři jsou připnuté jako git submoduly:

| Složka | Repozitář |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) – tratě a úrovně z vlastních archivů her |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) – nahrávače telemetrie kol; úrovně z videa hraní |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) – plugin pro Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) – dema a mapy CS2 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) – zaznamenává hru na pozadí |

**Připnuto** znamená, že tento repozitář eviduje přesně jeden commit každého nástroje. Kopie prohlížeče dostane právě tyto commity:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# nebo, po prostém klonu:
git submodule update --init
```

Obě cesty aktualizace výše spustí po stažení `git submodule update --init`, takže
nástroje následují prohlížeč k commitům, které jeho nejnovější verze připíná – ne
k nejnovějším commitům samotných nástrojů. Novější vydání nástroje se dostane do
prohlížeče, až se přesune připnutí zde: změny nástroje se nejdřív commitnou a
odešlou ve vlastní složce (vlastním repozitáři), pak se sem commitne nové připnutí.
Každý nástroj také kontroluje své novější vydání; je to zdokumentováno v jeho
vlastním repozitáři.

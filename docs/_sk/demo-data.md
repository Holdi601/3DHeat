---
title: "Ukážkové dáta"
nav_order: 2
lang: "sk"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Ukážkové dáta: vyskúšajte prehliadač za päť minút

![Teplo z desiatich zápasov tankov v ukážkovej doline: čo ukazuje krok 4](../assets/img/en/heat-hero.webp)

Zatiaľ nemáte vlastné dáta? Repozitár nejaké vytvorí. Všetko v ňom je vymyslené: dolina, dvor a zápasy troch zmyslených herných štýlov s hráčmi, ktorí sa volajú *Blue 1* alebo *Red 3*. Všetky obrázky na tejto stránke boli urobené s nimi.

## Vytvorte ich {#make-it}

```bash
node tools/demo-data.mjs
```

Zapíše do `tools/.shots/demo/`:

| Súbor | Čo je |
|---|---|
| `demo-valley.glb` | 12 km dlhá dolina s dvoma kopcami a dedinou ako 3D level |
| `demo-yard.glb` | 160 m dlhý obohnaný dvor s budovami ako 3D level |
| `tanks.parquet` | 10 zápasov tankov, 8 proti 8: pohyb, výstrely, zásahy s miestom na trupe, požiare, zostrely, trosky, namierenie veže, víťazi |
| `tanks/match-NN.parquet` | tie isté zápasy, každý v jednom súbore, pre [veľa zápasov naraz](many-matches.md) |
| `air.parquet` | vzdušný súboj 4 proti 4 s raketami, pascami, zostrelmi a netrafeniami |
| `shooter.parquet` | 12 kôl 5 proti 5 pešo: výstrely, zostrely, položenie bomby, zarobené a minuté kredity, prilby a pomôcky |
| `mass/` | priečinok malých zápasov `.3dheat`, pre [hromadnú analýzu](mass-analysis.md) |
| súbor kôl pretekov | dve kolá jedného auta na zmyslenej trati, pre [Analýzu pretekov](race-analysis.md) |

Každá tabuľka má názvy svojich stĺpcov v pätičke, takže sa načíta bez akéhokoľvek mapovania.

## Vyskúšajte to {#try-it}

1. Spustite prehliadač (na Windows `start.bat`, alebo na ľubovoľnom systéme raz `npm install` a potom `npm run dev`) a otvorte `http://127.0.0.1:5273/`.
2. **Pozadie / level → 3D model…** a vyberte `demo-valley.glb`.
3. **Zdroj → Súbory…** a vyberte `tanks.parquet`.
4. Stlačte `F`, aby sa dáta vošli do záberu. Vidíte [teplo](heat.md) desiatich zápasov.
5. Vyskúšajte lištu režimov: **Rozdiel** (Blue proti Red), **Teplo tímov**, **Čiary**.
6. Otvorte **Zistenia** (na bočnom paneli Heatmapy): nájde miesta, kde sa vystrelilo, zasiahlo a zničilo oveľa viac než inde - okolo oboch kopcov.
7. Otvorte kartu **Zápas**; pod **Zápasy v zázname** vyberte *Match 01* a stlačte **Prehrať** na časovej osi: [prehrávanie](match-replay.md).

![Prehrávanie zápasu Match 01 s tankami ako figúrkami](../assets/img/en/replay-overview.webp)

Pre streľbu načítajte `demo-yard.glb` a `shooter.parquet`; pre vzdušný súboj `air.parquet` (figúrky sa lepšie vidia pri **Veľkosti figúrok** 4, posuvník v paneli **Zobrazenie tímov** na bočnom paneli Heatmapy).

## Snímky obrazovky {#the-screenshots}

Obrázky stránky robí z týchto dát skript v ktoromkoľvek jazyku prehliadača:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Server na snímky beží bez lokálneho balíka figúrok, takže sa zobrazí iba verejný katalóg figúrok. Obrázky idú do `docs/assets/img/<lang>/`. Pozri [Údržba dokumentácie](maintaining.md).

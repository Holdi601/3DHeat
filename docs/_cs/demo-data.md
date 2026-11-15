---
title: "Ukázková data"
nav_order: 2
lang: "cs"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Ukázková data: vyzkoušejte prohlížeč za pět minut

![Teplo deseti zápasů s tanky v ukázkovém údolí: co ukazuje krok 4](../assets/img/en/heat-hero.webp)

Zatím nemáte vlastní data? Repozitář si je vyrobí. Všechno v něm je vymyšlené: údolí, dvůr a zápasy tří smyšlených herních stylů s hráči jménem *Blue 1* nebo *Red 3*. Obrázky na těchto stránkách byly všechny pořízeny s nimi.

## Vytvoření {#make-it}

```bash
node tools/demo-data.mjs
```

Zapíše do `tools/.shots/demo/`:

| Soubor | Co je |
|---|---|
| `demo-valley.glb` | údolí dlouhé 12 km se dvěma kopci a vesnicí, jako 3D level |
| `demo-yard.glb` | dvůr 160 m obehnaný zdí s budovami, jako 3D level |
| `tanks.parquet` | 10 zápasů tanků, 8 proti 8: pohyb, výstřely, zásahy s místem na trupu, požáry, zabití, vraky, míření věží, vítězové |
| `tanks/match-NN.parquet` | tytéž zápasy, každý v jednom souboru, pro [mnoho zápasů najednou](many-matches.md) |
| `air.parquet` | letecký souboj 4 proti 4 s raketami, světlicemi, zabitími a minutími |
| `shooter.parquet` | 12 kol 5 proti 5 pěšky: výstřely, zabití, položení nálože, získané a utracené kredity, helmy a pomůcky |
| `mass/` | složka malých zápasů `.3dheat`, pro [hromadnou analýzu](mass-analysis.md) |
| sada kol závodu | dvě kola jednoho auta na vymyšlené trati, pro [Analýzu závodu](race-analysis.md) |

Každá tabulka pojmenovává své sloupce v zápatí, takže se načte bez jakéhokoli mapování.

## Vyzkoušení {#try-it}

1. Spusťte prohlížeč (`start.bat` ve Windows, nebo jednou `npm install` a pak `npm run dev` na jakémkoli systému) a otevřete `http://127.0.0.1:5273/`.
2. **Pozadí / úroveň → 3D model…** a vyberte `demo-valley.glb`.
3. **Zdroj → Soubory…** a vyberte `tanks.parquet`.
4. Stiskněte `F`, aby se data vešla do záběru. Uvidíte [teplo](heat.md) deseti zápasů.
5. Vyzkoušejte lištu režimů: **Rozdíl** (Blue proti Red), **Týmové teplo**, **Čáry**.
6. Otevřete **Zjištění** (v postranním panelu Teplotní mapy): najde místa, kde se vystřelilo, zasáhlo a zničilo mnohem víc než jinde - kolem obou kopců.
7. Otevřete kartu **Zápas**; pod **Zápasy v záznamu** vyberte *Match 01* a stiskněte **Přehrát** na časové ose: [přehrání](match-replay.md).

![Přehrání Match 01 s tanky jako figurami](../assets/img/en/replay-overview.webp)

Pro střelce načtěte `demo-yard.glb` a `shooter.parquet`; pro letecký souboj `air.parquet` (figury jsou lépe vidět při **Velikosti figur** 4, což je posuvník v panelu **Týmové zobrazení** v postranním panelu Teplotní mapy).

## Snímky obrazovky {#the-screenshots}

Obrázky na webu vytváří z těchto dat skript, v kterémkoli jazyce prohlížeče:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Server pro snímky běží bez místního balíku figur, takže se ukazuje jen veřejný katalog figur. Obrázky jdou do `docs/assets/img/<lang>/`. Viz [Údržba dokumentace](maintaining.md).

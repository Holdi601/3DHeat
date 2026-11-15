---
title: "Mnoho zápasů najednou"
parent: "Přehrání"
nav_order: 2
lang: "cs"
source: "many-matches.md"
source_hash: "a37a7b4cf8c2"
translated: true
outdated: false
---

# Mnoho zápasů najednou

**Mnoho zápasů najednou** přehraje spoustu zápasů přes sebe, takže vidíte, kam hráči každého zápasu obvykle chodí. Slouží k porovnání stovek nebo tisíců zápasů v jednom obrázku.

Každý zápas začíná na svém vlastním začátku a jeho jednotky se pohybují jako figury. Soubory jdou přímo do grafické karty a nevytváří se žádná úplná tabulka, takže to běží plynule tam, kde by běžné načtení došlo paměť.

![Deset zápasů tanků přes sebe, jedna barva na zápas](../assets/img/cs/many-matches.webp)

## Jak to použít {#how-to-use-it}

1. Otevřete **Mnoho zápasů najednou** v postranním panelu Teplotní mapy.
2. Stiskněte **Soubory…** (vyberte mnoho souborů), **Složka…** (složka a její podsložky) nebo **Přidat složku…** (přidat k tomu, co je načteno).
3. Prohlížeč přepne na překryv figur a začne na začátku. Stiskněte **Přehrát**.

Každý soubor je jeden zápas (nebo jich obsahuje několik). Fungují soubory Parquet a kontejnery [`.3dheat`](container.md). Soubor potřebuje sloupec pozice, času a jednotky; sloupce názvu, typu a strany se ponechají. Ostatní soubory a vedlejší soubory převodníků (let, zprávy, události, chat, cíle) se přeskočí. Pro běžnou tabulku viz [Získávání dat](getting-data-in.md).

## Nastavení {#settings}

| Nastavení | Co dělá |
|---|---|
| **Podle týmu** / **Podle zápasu** | Barva podle strany, nebo barva pro každý zápas. |
| **Označit, kde jednotky zemřely** | Značka tam, kde každá jednotka zemřela, po 10 s, 30 s, 120 s, nebo všechny dosud. |

Panel ukazuje, kolik zápasů, jednotek, řádků a pozic bylo přečteno, kolik paměti se použilo a jak dlouho načítání trvalo. *Místo pro* je, kolik dalších pozic by grafická karta ještě unesla. *Figury od* je velikost na obrazovce, pod kterou se jednotka kreslí jako malý šíp místo své figury.

Vzhled figur používá stejná ovládání jako [přehrávání zápasu](match-replay.md#figures): **Velikost figur**, **Nejmenší figura na obrazovce** a **Na dálku**.

## Tipy {#tips}

- Když se všechno nevejde do paměti, pozice se proříděj (drží se jen pozice každých několik metrů) a panel to řekne.
- Režimy tepla fungují i na datech překryvu.
- Statistiky nad tisíci zápasy bez jejich kreslení najdete v [Hromadné analýze](mass-analysis.md).

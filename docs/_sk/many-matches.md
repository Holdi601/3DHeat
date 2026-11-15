---
title: "Veľa zápasov naraz"
parent: "Prehrávanie"
nav_order: 2
lang: "sk"
source: "many-matches.md"
source_hash: "a37a7b4cf8c2"
translated: true
outdated: false
---


# Veľa zápasov naraz

**Veľa zápasov naraz** prehráva mnohé zápasy na sebe, takže vidíte, kam bežne chodia hráči každého zápasu. Použite ho na porovnanie stoviek alebo tisícov zápasov v jednom obraze.

Každý zápas začína na svojom vlastnom začiatku a jeho jednotky sa hýbu ako figúrky. Súbory idú priamo na grafickú kartu a nevytvára sa žiadna úplná tabuľka, takže to beží plynulo tam, kde by bežné načítanie minulo pamäť.

![Desať tankových zápasov položených na seba, jedna farba na zápas](../assets/img/sk/many-matches.webp)

## Ako to použiť {#how-to-use-it}

1. Otvorte **Veľa zápasov naraz** na bočnom paneli Heatmapa.
2. Stlačte **Súbory…** (vyberte veľa súborov), **Priečinok…** (priečinok a jeho podpriečinky) alebo **Pridať priečinok…** (pridá k tomu, čo je načítané).
3. Prehliadač prepne na prekrytie figúrok a začne na začiatku. Stlačte **Prehrať**.

Každý súbor je jeden zápas (alebo obsahuje viac). Fungujú súbory Parquet a kontajnery [`.3dheat`](container.md). Súbor potrebuje stĺpec pozície, času a jednotky; stĺpce mena, typu a strany sa zachovajú. Ostatné súbory a bočné súbory prevodníkov (let, správy, udalosti, chat, ciele) sa preskočia. Pre bežnú tabuľku pozri [Získanie dát](getting-data-in.md).

## Nastavenia {#settings}

| Nastavenie | Čo robí |
|---|---|
| **Podľa tímu** / **Podľa zápasu** | Farba podľa strany, alebo farba na každý zápas. |
| **Označiť, kde jednotky zomreli** | Značka, kde každá jednotka zomrela, na 10 s, 30 s, 120 s, alebo všetky doteraz. |

Panel ukazuje, koľko zápasov, jednotiek, riadkov a pozícií sa prečítalo, použitú pamäť a čas načítania. *Miesto pre* je, koľko ďalších pozícií by grafická karta ešte zvládla. *Figúrky od* je veľkosť na obrazovke, pod ktorou sa jednotka kreslí ako malý šíp namiesto svojej figúrky.

Vzhľad figúrok používa tie isté ovládače ako [prehrávanie zápasu](match-replay.md#figures): **Veľkosť figúrok**, **Najmenšia figúra na obrazovke** a **Na diaľku**.

## Tipy {#tips}

- Keď by všetko nevošlo do pamäte, pozície sa redukujú (zachová sa len pozícia každých niekoľko metrov) a panel to povie.
- Režimy tepla fungujú aj na dátach prekrytia.
- Štatistiky cez tisíce zápasov bez ich kreslenia nájdete v [Hromadnej analýze](mass-analysis.md).

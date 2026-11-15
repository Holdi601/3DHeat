---
title: "Multe meciuri deodată"
nav_order: 10
lang: "ro"
source: "many-matches.md"
source_hash: "f2239cef5e91"
translated: true
outdated: false
---

# Multe meciuri deodată

**Multe meciuri deodată** redă multe meciuri unul peste altul, astfel că vezi unde merg de obicei jucătorii fiecărui meci. Folosește-l ca să compari sute sau mii de meciuri într-o singură imagine.

Fiecare meci începe de la propriul început, iar unitățile lui se mișcă ca figuri. Fișierele merg direct în placa grafică și nu se construiește niciun tabel complet, deci rulează fluid acolo unde o încărcare obișnuită ar rămâne fără memorie.

![Zece meciuri cu tancuri suprapuse, o culoare pentru fiecare meci](../assets/img/en/many-matches.webp)

## Cum se folosește {#how-to-use-it}

1. Deschide **Multe meciuri deodată** în bara laterală a Hărții termice.
2. Apasă **Fișiere…** (alege multe fișiere), **Dosar…** (un dosar și subdosarele lui) sau **Adaugă dosar…** (adaugă la ce este încărcat).
3. Vizualizatorul trece la suprapunerea figurilor și pornește de la început. Apasă **Redare**.

Fiecare fișier este un meci (sau conține mai multe). Fișierele Parquet și containerele [`.3dheat`](container.md) funcționează. Un fișier are nevoie de o coloană de poziție, una de timp și una de unitate; coloanele de nume, tip și parte se păstrează. Celelalte fișiere și fișierele-anexă ale convertoarelor (zbor, mesaje, evenimente, chat, obiective) se sar. Pentru un tabel obișnuit, vezi [Încărcarea datelor](getting-data-in.md).

## Setări {#settings}

| Setare | Ce face |
|---|---|
| **După echipă** / **După meci** | Colorează după parte, sau o culoare pentru fiecare meci. |
| **Marchează unde au murit unitățile** | Un marcaj acolo unde a murit fiecare unitate, timp de 10 s, 30 s, 120 s sau toate până acum. |

Panoul arată câte meciuri, unități, rânduri și poziții au fost citite, memoria folosită și timpul de încărcare. *Loc pentru* este câte poziții în plus ar mai putea primi placa grafică. *Figuri de la* este mărimea pe ecran sub care o unitate este desenată ca o mică săgeată în loc de figura ei.

Aspectul figurilor folosește aceleași comenzi ca [reluarea meciului](match-replay.md#figures): **Mărimea figurii**, **Cea mai mică figură pe ecran** și **La distanță**.

## Sfaturi {#tips}

- Când totul nu ar încăpea în memorie, pozițiile sunt rărite (se păstrează doar o poziție la câțiva metri) și panoul o spune.
- Modurile de căldură funcționează și pe datele suprapunerii.
- Pentru statistici peste mii de meciuri, fără a le desena, vezi [Analiza de masă](mass-analysis.md).

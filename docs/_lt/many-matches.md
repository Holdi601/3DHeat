---
title: "Daug rungtynių vienu metu"
parent: "Pakartojimas"
nav_order: 2
lang: "lt"
source: "many-matches.md"
source_hash: "a37a7b4cf8c2"
translated: true
outdated: false
---

# Daug rungtynių vienu metu

**Daug rungtynių vienu metu** leidžia groti daugybę rungtynių viena ant kitos, todėl matote, kur paprastai eina kiekvienų rungtynių žaidėjai. Naudokite, kad palygintumėte šimtus ar tūkstančius rungtynių viename paveikslėlyje.

Kiekvienos rungtynės prasideda nuo savo pradžios, o jų vienetai juda kaip figūros. Failai eina tiesiai į grafikos kortelę ir nėra sukuriama pilna lentelė, todėl jis veikia sklandžiai ten, kur įprastas įkėlimas baigtųsi atmintimi.

![Dešimt tankų rungtynių, sudėtų viena ant kitos, po vieną spalvą kiekvienoms rungtynėms](../assets/img/lt/many-matches.webp)

## Kaip naudoti {#how-to-use-it}

1. Šiluminio žemėlapio šoninėje juostoje atidarykite **Daug rungtynių vienu metu**.
2. Spauskite **Failai…** (pasirinkite daug failų), **Aplankas…** (aplankas ir jo poaplankiai) arba **Pridėti aplanką…** (pridėti prie to, kas įkelta).
3. Peržiūros programa persijungia į figūrų perdangą ir pradeda nuo pradžios. Spauskite **Groti**.

Kiekvienas failas yra viena rungtynės (arba jų kelios). Veikia Parquet failai ir [`.3dheat`](container.md) konteineriai. Failui reikia padėties, laiko ir vieneto stulpelio; pavadinimo, tipo ir pusės stulpeliai išsaugomi. Kiti failai ir konverterių papildomi failai (skrydis, pranešimai, įvykiai, pokalbis, tikslai) praleidžiami. Įprastai lentelei žr. [Duomenų įkėlimas](getting-data-in.md).

## Nustatymai {#settings}

| Nustatymas | Ką daro |
|---|---|
| **Pagal komandą** / **Pagal rungtynes** | Spalva pagal pusę arba spalva kiekvienoms rungtynėms. |
| **Pažymėti, kur žuvo vienetai** | Žymė, kur žuvo kiekvienas vienetas, 10 s, 30 s, 120 s arba visi iki šiol. |

Skydelyje rodoma, kiek rungtynių, vienetų, eilučių ir padėčių buvo nuskaityta, sunaudota atmintis ir įkėlimo laikas. *Telpa dar* – kiek dar padėčių grafikos kortelė galėtų priimti. *Figūros nuo* – dydis ekrane, žemiau kurio vienetas piešiamas kaip mažas strėlytės formos ženklas, o ne jo figūra.

Figūrų išvaizdai taikomi tie patys valdikliai kaip [rungtynių pakartojime](match-replay.md#figures): **Figūrų dydis**, **Mažiausia figūra ekrane** ir **Iš toli**.

## Patarimai {#tips}

- Kai viskas netilptų atmintyje, padėtys retinamos (išsaugoma tik kas kelis metrus viena padėtis), ir skydelis apie tai praneša.
- Šilumos režimai veikia ir su perdangos duomenimis.
- Statistikai per tūkstančius rungtynių, jos nepiešiant, žr. [Masinė analizė](mass-analysis.md).

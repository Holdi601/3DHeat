---
title: "Demo podaci"
nav_order: 2
lang: "hr"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Demo podaci: isprobajte preglednik za pet minuta

![Toplina deset utakmica tenkova u demo dolini: ono što prikazuje korak 4](../assets/img/en/heat-hero.webp)

Još nemate vlastite podatke? Repozitorij ih napravi. Sve u njemu je izmišljeno: dolina, dvorište i utakmice triju izmišljenih stilova igre s igračima koji se zovu *Blue 1* ili *Red 3*. Sve slike na ovoj stranici snimljene su s njima.

## Napravite ih {#make-it}

```bash
node tools/demo-data.mjs
```

Ovo piše u `tools/.shots/demo/`:

| Datoteka | Što je |
|---|---|
| `demo-valley.glb` | dolina od 12 km s dva brda i selom, kao 3D razina |
| `demo-yard.glb` | dvorište od 160 m sa zidom i zgradama, kao 3D razina |
| `tanks.parquet` | 10 utakmica tenkova, 8 protiv 8: kretanje, pucnji, pogodci s mjestom na trupu, požari, ubojstva, olupine, nišanjenje kupole, pobjednici |
| `tanks/match-NN.parquet` | iste utakmice, jedna datoteka po utakmici, za [mnogo utakmica odjednom](many-matches.md) |
| `air.parquet` | zračna borba 4 protiv 4 s projektilima, mamcima, ubojstvima i promašajima |
| `shooter.parquet` | 12 rundi 5 protiv 5 pješice: pucnji, ubojstva, postavljanje, zarađeni i potrošeni krediti, kacige i pomoćna oprema |
| `mass/` | mapa malih `.3dheat` utakmica, za [masovnu analizu](mass-analysis.md) |
| skup krugova utrke | dva kruga jednog automobila na izmišljenoj stazi, za [Analizu utrke](race-analysis.md) |

Svaka tablica navodi svoje stupce u podnožju, pa se učitava bez ikakvog mapiranja.

## Isprobajte {#try-it}

1. Pokrenite preglednik (`start.bat` na Windowsu, ili jednom `npm install`, pa `npm run dev` na bilo kojem sustavu) i otvorite `http://127.0.0.1:5273/`.
2. **Pozadina / razina → 3D model…** i odaberite `demo-valley.glb`.
3. **Izvor → Datoteke…** i odaberite `tanks.parquet`.
4. Pritisnite `F` za uokvirivanje podataka. Vidite [toplinu](heat.md) deset utakmica.
5. Isprobajte traku načina: **Razlika** (Blue naspram Red), **Toplina timova**, **Crte**.
6. Otvorite **Uvide** (u bočnoj traci Toplinske karte): pronalazi mjesta gdje je znatno više pucano, pogođeno i uništeno nego drugdje - oko dva brda.
7. Otvorite karticu **Meč**; pod **Mečevi u snimci** odaberite *Match 01*; pritisnite **Reprodukcija** na vremenskoj traci: [reprodukcija](match-replay.md).

![Reprodukcija Match 01 s tenkovima kao figurama](../assets/img/en/replay-overview.webp)

Za strelca učitajte `demo-yard.glb` i `shooter.parquet`; za zračnu borbu `air.parquet` (figure se lakše vide pri **Veličina figura** 4, klizaču u panelu **Prikaz timova** u bočnoj traci Toplinske karte).

## Snimke zaslona {#the-screenshots}

Slike stranice nastaju iz ovih podataka skriptom, na bilo kojem od jezika preglednika:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Poslužitelj za snimke zaslona radi bez lokalnog paketa figura, pa se prikazuje samo javni katalog figura. Slike idu u `docs/assets/img/<lang>/`. Vidi [Održavanje dokumentacije](maintaining.md).

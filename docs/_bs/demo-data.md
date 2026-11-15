---
title: "Demo podaci"
nav_order: 2
lang: "bs"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Demo podaci: isprobajte prikazivač za pet minuta

![Toplota deset mečeva tenkova u demo dolini: šta prikazuje korak 4](../assets/img/en/heat-hero.webp)

Još nemate svoje podatke? Repozitorijum ih pravi. Sve u njemu je izmišljeno: dolina, dvorište i mečevi triju izmišljenih stilova igre, s igračima zvanim *Blue 1* ili *Red 3*. Sve slike na ovom sajtu snimljene su pomoću njih.

## Napravite ih {#make-it}

```bash
node tools/demo-data.mjs
```

Ovo piše u `tools/.shots/demo/`:

| Datoteka | Šta je |
|---|---|
| `demo-valley.glb` | dolina od 12 km s dva brda i selom, kao 3D nivo |
| `demo-yard.glb` | zidano dvorište od 160 m sa zgradama, kao 3D nivo |
| `tanks.parquet` | 10 mečeva tenkova, 8 protiv 8: kretanje, pucnji, pogoci s mjestom na trupu, požari, ubistva, olupine, nišanjenje tornjeva, pobjednici |
| `tanks/match-NN.parquet` | isti mečevi, po jedna datoteka za svaki, za [mnogo mečeva odjednom](many-matches.md) |
| `air.parquet` | zračna borba 4 protiv 4 s raketama, mamcima, ubistvima i promašajima |
| `shooter.parquet` | 12 rundi po 5 protiv 5 pješice: pucnji, ubistva, postavljanje eksploziva, zarađeni i potrošeni krediti, kacige i pomoćna oprema |
| `mass/` | fascikla malih `.3dheat` mečeva, za [masovnu analizu](mass-analysis.md) |
| skup krugova trke | dva kruga jednog automobila na izmišljenoj stazi, za [Analizu utrke](race-analysis.md) |

Svaka tabela navodi svoje kolone u podnožju, pa se učitava bez ikakvog mapiranja.

## Isprobajte {#try-it}

1. Pokrenite prikazivač (`start.bat` na Windowsu, ili jednom `npm install` pa `npm run dev` na bilo kojem sistemu) i otvorite `http://127.0.0.1:5273/`.
2. **Pozadina / nivo → 3D model…** i izaberite `demo-valley.glb`.
3. **Izvor → Datoteke…** i izaberite `tanks.parquet`.
4. Pritisnite `F` da uokvirite podatke. Vidite [toplotu](heat.md) deset mečeva.
5. Isprobajte traku načina: **Razlika** (Blue naspram Red), **Toplota timova**, **Linije**.
6. Otvorite **Uvidi** (u bočnoj traci Toplotne mape): pronalazi mjesta gdje je daleko više pucano, pogođeno i uništeno nego drugdje - oko dva brda.
7. Otvorite karticu **Meč**; pod **Mečevi u snimku** izaberite *Match 01*, pa pritisnite **Reproduciraj** na vremenskoj liniji: [reprodukcija](match-replay.md).

![Reprodukcija Match 01 s tenkovima kao figurama](../assets/img/en/replay-overview.webp)

Za shooter, učitajte `demo-yard.glb` i `shooter.parquet`; za zračnu borbu, `air.parquet` (figure se lakše vide pri **Veličina figura** 4, kliznik u panelu **Prikaz tima** u bočnoj traci Toplotne mape).

## Slike {#the-screenshots}

Slike sajta pravi ovim podacima skripta, na bilo kojem od jezika prikazivača:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Server za snimanje ekrana radi bez lokalnog paketa figura, pa se prikazuje samo javni katalog figura. Slike idu u `docs/assets/img/<lang>/`. Vidi [Održavanje dokumentacije](maintaining.md).

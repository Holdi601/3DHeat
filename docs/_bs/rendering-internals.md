---
title: "Interno renderovanje"
nav_order: 22
has_children: true
lang: "bs"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Interno renderovanje

Preglednik crta milione tačaka kao svjetleće mrlje i zbraja ih. Ovaj odjeljak objašnjava trikove koji to drže brzim i šta znače brojevi u prikazu statistike. Pročitajte ga ako vam se čini da je preglednik spor ili ako želite raditi na rendereru.

```
podaci -> vremenski prozor -> GPU filteri -> plan uzorkovanja -> splat -> akumulacija -> boja -> ekran
```

Da vidite kako radi vaš računar, pogledajte okvir sa statistikom u gornjem desnom uglu pogleda: [Panel performansi i prikaz statistike](performance-and-stats.md). Nove riječi (GPU, red, sprajt, mapa toplote) objašnjene su u [rječniku](glossary.md).

## Osnovni problem {#the-core-problem}

Zbir preklapajućih radijalnih rampi košta *N* × π*r*² miješanih fragmenata po sličici. Sa 100 miliona sprajtova poluprečnika 8 px to je 2 × 10¹⁰ fragmenata, otprilike sekunda rada na vrhunskom GPU-u. Ne može se svake sličice nasilno izračunavati, pa preglednik kombinuje:

- **redove sortirane po vremenu**: vremenski prozor su dva binarna pretraživanja, a trošak reprodukcije prati redove u prozoru, ne cijeli skup podataka;
- **nula posla po redu na CPU-u po sličici**: redovi žive u GPU memoriji, kvantizovani; filteri, predznaci grupa, test životnog vijeka, prozor, odsijecanje i presjek se računaju u vertex shaderu;
- **stratifikovano uzorkovanje** sa kompenzacijskim težinama kad sličica ne može nacrtati svaki red, i **progresivnu akumulaciju** koja konvergira ka tačnom odgovoru za sve redove dok pogled miruje ([Uzorkovanje i budžeti](sampling-and-budgets.md), [Akumulacija](accumulation.md));
- **dvostepeno prigušivanje** koje mijenja sprajtove po sličici, pa rezoluciju toplote, za brzinu sličica ([Uzorkovanje i budžeti](sampling-and-budgets.md#the-adaptive-budget));
- **nametnute budžete memorije**, pa skup podataka koji ne staje biva vidljivo skraćen umjesto da sruši program ([Rezidentnost u GPU memoriji](gpu-memory.md)).

## Jedna sličica {#one-frame}

Petlja sličice je [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Sve što se mijenja na brzini sličica (kamera, pozicija reprodukcije, budžet) živi u motoru, a ne u stanju aplikacije, pa sličica ne košta nikakav React rad. Stanje se čita jednom po sličici, a upisuje nazad samo za očitavanja male učestalosti.

1. **Novi podaci?** Novi skup podataka se najavi (*Uploading N rows to the GPU*) na jednoj sličici, a učitava na sljedećoj, pa se poruka iscrta prije nego rad blokira nit. Novi nivo se predaje rendereru; rute toplote linije se prave ili oslobađaju.
2. **Pozicija reprodukcije** napreduje (najviše 0,1 s stvarnog vremena po sličici), vraća se na početak ili staje.
3. **Kamera** čita tastaturu, miš i gamepad; zrcaljenje osa se ugrađuje u matricu pogleda; na WebGPU-u matrica preslikavanja dubine pretvara opseg dubine OpenGL stila iz three.js-a u WebGPU-ov.
4. **Šta je vidljivo**: vremenski opseg sa vremenske trake i istorije; tabela predznaka grupa (vidljivost samo pod podjelom po koloni); do četiri filtera: filteri kolona i izbor Entiteta; podjela razlike.
5. **Tabele boja i krivulja** se ponovo grade ako su se njihove postavke promijenile.
6. **Budžet**: adaptivni kontroler postavlja budžet sprajtova i rezoluciju toplote za ovu sličicu; uz *Crtaj svaki red u svakoj sličici* budžet se podiže da pokrije svaki kandidat red.
7. **Potpisi** odlučuju šta bafer akumulacije još znači: promjena bilo čega što mijenja koji redovi doprinose ili kako (*geometrija*), promjena vremenskog prozora, ili samo promjena načina bojenja rezultata (*kompozit*). Vidi [Akumulacija](accumulation.md#what-restarts-it).
8. **Plan uzorkovanja**: koji blokovi redova se crtaju ([Uzorkovanje i budžeti](sampling-and-budgets.md)).
9. **Režim akumulacije**: reset, proširenje, pokretni prosjek, tekući prosjek ili miruje.
10. **Geometrija replay kutija** (kocke, tragovi) na CPU-u, samo u tom režimu i samo kad ne miruje.
11. **Render**: backend crta scenu (nivo, mreža, ose, kutije, tragovi, lenjir), rasipa toplotu u cilj toplote, spaja je u akumulator i kompozituje toplotu preko scene na platno.
12. **Automatska ekspozicija** se aktivira kad odbrojavanje dođe do nule; sonda toplote lenjira čita najviše jedan piksel na svakih 120 ms; očitavanja se objavljuju.

Prazna sličica, konvergirana i bez promjena, preskače scenu i rasipanje, ali i dalje **ponovo kompozituje**: WebGL platno napravljeno bez `preserveDrawingBuffer` ima nedefinisan sadržaj nakon kompozicije, pa se ne smije vjerovati da će zadržati prikaz zadnje sličice. Ciljevi scene i toplote su sopstveni framebuffer-i pregledača i zadržavaju sadržaj, pa prazna sličica košta jedan prolaz preko cijelog ekrana.

## Stranice u ovom odjeljku {#pages-in-this-section}

- [Dva backenda](backends.md): WebGPU i WebGL2, kako se bira jedan, prekidači u URL-u
- [Akumulacija](accumulation.md): reset, proširenje, pokretni prosjek, tekući prosjek
- [Uzorkovanje i budžeti](sampling-and-budgets.md): stratifikovani uzorkivač, tačan režim, prilagodljivi budžet
- [Half-float akumulacija](half-float-accumulation.md): opseg i preciznost na 16-bitnim ciljevima
- [Rezidentnost u GPU memoriji](gpu-memory.md): kvantizovano smještanje redova i nametnuti GPU budžet
- [Otkrivanje softverskog renderovanja](software-rendering.md)
- [Panel performansi i prikaz statistike](performance-and-stats.md)

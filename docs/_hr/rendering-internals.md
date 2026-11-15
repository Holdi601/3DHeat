---
title: "Unutarnji dijelovi iscrtavanja"
nav_order: 22
has_children: true
lang: "hr"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Unutarnji dijelovi iscrtavanja

Preglednik crta milijune točkica kao sjajne mrlje i zbraja ih. Ovaj odjeljak objašnjava trikove koji to održavaju brzim i što znače brojevi u prikazu statistike. Pročitaj ga ako preglednik djeluje sporo ili ako želiš raditi na iscrtavaču.

```
podaci -> vremenski prozor -> GPU filtri -> plan uzorkovanja -> raspršivanje -> akumulacija -> boja -> ekran
```

Da vidiš kako radi tvoje računalo, pogledaj okvir statistike gore desno u pogledu: [Ploča performansi i statistika](performance-and-stats.md). Nove riječi (GPU, redak, sprite, toplinska karta) su u [pojmovniku](glossary.md).

## Osnovni problem {#the-core-problem}

Zbroj preklapajućih se kružnih rampi košta *N* × π*r*² miješanih fragmenata po kadru. Pri 100 milijuna spriteova polumjera 8 px to je 2 × 10¹⁰ fragmenata - otprilike sekunda posla na vrhunskom GPU-u. Ne može se svaki kadar grubo izračunati, pa preglednik kombinira:

- **retci sortirani po vremenu** - prozor vremenske crte su dva binarna pretraživanja, a trošak reprodukcije prati retke u prozoru, a ne cijeli skup podataka;
- **ništa po retku na CPU-u po kadru** - retci žive u memoriji GPU-a, kvantizirani; filtri, oznake grupa, test trajanja, prozor, odbacivanje i presjek računaju se u vertex shaderu;
- **slojevito uzorkovanje** s kompenzacijskim težinama kad kadar ne može nacrtati svaki redak, i **progresivna akumulacija** koja se, dok je pogled miran, približava točnom rezultatu za sve retke ([Uzorkovanje i proračuni](sampling-and-budgets.md), [Akumulacija](accumulation.md));
- **dvostupanjsko ograničavanje** koje za broj kadrova mijenja najprije spriteove po kadru, pa zatim rezoluciju topline ([Uzorkovanje i proračuni](sampling-and-budgets.md#the-adaptive-budget));
- **provedeni proračuni memorije**, pa se skup podataka koji ne stane vidljivo skrati umjesto da se program sruši ([Boravak u memoriji GPU-a](gpu-memory.md)).

## Jedan kadar {#one-frame}

Petlja kadra je [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Sve što se mijenja pri broju kadrova - kamera, glava reprodukcije, proračun - živi u motoru, a ne u stanju aplikacije, pa kadar ne troši nikakav React rad; stanje se čita jednom po kadru i upisuje natrag samo za rijetka očitanja.

1. **Novi podaci?** Novi skup podataka najavi se u jednom kadru (*Učitavanje N redaka na GPU*) i učita u sljedećem, pa se poruka iscrta prije nego rad blokira nit. Nova razina predaje se iscrtavaču; putovi linijske topline se grade ili oslobađaju.
2. **Glava reprodukcije** napreduje (ograničeno na 0,1 s stvarnog vremena po kadru), ponavlja se ili staje.
3. **Kamera** čita tipke, miš i gamepad; zrcaljenje osi ulazi u matricu pogleda; na WebGPU-u matrica remapiranja dubine pretvara raspon dubine three.js-a u OpenGL stilu u WebGPU-ov.
4. **Što je vidljivo**: vremenski raspon iz vremenske crte i povijesti; tablica oznaka grupa (vidljivost samo pod podjelom po stupcu); do četiri filtra - filtri stupaca i odabir Entiteta; podjela razlike.
5. **Tablice boja i krivulja** grade se ponovno ako su se njihove postavke promijenile.
6. **Proračun**: prilagodljivi upravljač postavlja proračun spriteova i rezoluciju topline za ovaj kadar; uz *Crtaj svaki redak u svakom kadru* proračun se podiže da pokrije svaki kandidatski redak.
7. **Potpisi** određuju što međuspremnik akumulacije još znači: promjena bilo čega što mijenja koji retci doprinose ili kako (*geometrija*), promjena vremenskog prozora ili samo promjena načina bojanja rezultata (*kompozit*). Vidi [Akumulacija](accumulation.md#what-restarts-it).
8. **Plan uzorkovanja**: koje blokove redaka crtati ([Uzorkovanje i proračuni](sampling-and-budgets.md)).
9. **Način akumulacije**: resetiranje, proširenje, pomični prosjek, tekuća sredina ili mirovanje.
10. **Geometrija preklapanja figura** (kocke, tragovi) na CPU-u, samo u tom načinu i samo kad nije u mirovanju.
11. **Iscrtavanje**: pozadinski sustav crta scenu (razinu, mrežu, osi, kutije, tragove, ravnalo), nanosi toplinu u cilj topline, spaja je u akumulator i kompozira toplinu preko scene na platno.
12. **Automatska ekspozicija** se aktivira kad odbrojavanje dođe do nule; sonda topline na ravnalu čita najviše jedan piksel svakih 120 ms; očitanja se objavljuju.

Kadar u mirovanju - konvergirao je i ništa se nije promijenilo - preskače scenu i nanošenje, ali i dalje **ponovno komponira**: WebGL platno stvoreno bez `preserveDrawingBuffer` nakon komponiranja ima nedefinirani sadržaj, pa mu se ne smije vjerovati da će zadržati zadnju sliku. Scena i ciljevi topline su vlastiti framebuffer preglednika i zadržavaju sadržaj, pa kadar u mirovanju košta jedan prolaz preko cijelog ekrana.

## Stranice u ovom odjeljku {#pages-in-this-section}

- [Dva pozadinska sustava](backends.md) - WebGPU i WebGL2, kako se bira jedan, prekidači u URL-u
- [Akumulacija](accumulation.md) - resetiranje, proširenje, pomični prosjek, tekuća sredina
- [Uzorkovanje i proračuni](sampling-and-budgets.md) - slojeviti uzorkovatelj, točan način, prilagodljivi proračun
- [Akumulacija u polupreciznom formatu](half-float-accumulation.md) - raspon i preciznost na 16-bitnim ciljevima
- [Boravak u memoriji GPU-a](gpu-memory.md) - kvantizirana pohrana redaka i provedeni proračun GPU-a
- [Otkrivanje softverskog iscrtavanja](software-rendering.md)
- [Ploča performansi i statistika](performance-and-stats.md)

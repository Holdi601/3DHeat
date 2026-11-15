---
title: "Gjeneratori sintetik"
parent: "Si të futni të dhënat"
nav_order: 5
lang: "sq"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Gjeneratori sintetik

Nuk ke të dhëna të tuat? Shtyp një buton dhe 3DHeat shpik për ty një betejë të rrejshme, aq e vogël apo aq e madhe sa do.

1. Hap panelin **Grupi i të dhënave** në shiritin anësor të Heatmap (poshtë **Burimi**).
2. Lëviz te **Gjeneratori sintetik**.
3. Vendos **Rreshta (miliona)**. Provo fillimisht 1: parazgjedhja 8 milionë është e rëndë për një provë të parë.
4. Shtyp **Gjenero**.

![1 milion rreshta, 8 ekipe, të vizatuara te Nxehtësia e ekipit](../assets/img/en/synthetic-generator-team-heat.webp)

Paneli **Grupi i të dhënave** mund të gjenerojë një grup të dhënash në vend që ta ngarkojë. Është për dy gjëra: të provosh shikuesin pa të dhëna të tuat, dhe të kontrollosh nëse një numër i caktuar rreshtash, rrezja e sprite-it dhe buxheti mbajnë një shkallë kornizash të përdorshme në një makinë *përpara* se t'i japësh një ngarkim të madh real. Lëvizja e tij është formuar si një ndeshje battle royale - ekipet fillojnë larg njëri-tjetrit, pastaj shtrydhen së bashku - sepse zhurma uniforme duket mirë me çdo buxhet dhe fsheh pikërisht artefaktet që vlen të kapen.

## Kontrollet {#controls}

| Kontrolli | Parazgjedhja | Kuptimi |
|---|---|---|
| **Rreshta (miliona)** | 8 | Rreshtat për të gjeneruar. Rrumbullosen poshtë në një numër të plotë tikesh për çdo lojtar. |
| **Skuadra** | 8 | Numri i grupeve (të paktën 1). |
| **Për ekip** | 12 | Lojtarë për grup (të paktën 1). |
| **Gjysmëgjerësia e hartës (m)** | 4000 | Gjysma e gjerësisë së zonës së luajtshme në X dhe Z. |
| Rreshti i vlerësimit | | "≈ X GB RAM, Y GB në GPU pas kuantizimit." (rreth 26 bajtë RAM dhe 8 bajtë në GPU për rresht). |
| **Gjenero** | | Gjeneron në punëtorin e pranimit, me përparim, dhe zëvendëson çdo grup të ngarkuar të dhënash. |

Gjenerimi zhvillohet në punëtorin e sfondit, kështu që dhjetëra milionë rreshta nuk e ngrijnë faqen.

## Çfarë gjeneron {#what-it-generates}

Nga [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Kolonat:** pozicioni, koha, personi (`P000`, `P001`, ...), grupi (`Team 1`, `Team 2`, ...), rrotullimi (yaw) dhe lartësia (pitch), dhe jetëgjatësitë. Asnjë kolonë seance dhe asnjë kolonë filtri.
- **Koha:** një mostër për lojtar çdo 0,25 s, duke filluar nga 0 (kohë relative, pa orë reale).
- **Lëvizja:** çdo ekip fillon në sektorin e vet të një unaze me 55-95% të gjysmëgjerësisë. Një rreth i sigurt i qendërzuar afër mesit (i zhvendosur rastësisht deri në një të katërtën e gjysmëgjerësisë) tkurret në 8% të gjysmëgjerësisë në gjashtë faza me pllaja; çdo lojtar drejtohet drejt një pike që endet brenda tij, me amortizim dhe zhurmë. Lartësia lëkundet midis 0 dhe 220 m.
- **Drejtimi i shikimit:** rrotullimi sipas drejtimit të lëvizjes, lartësia nga shpejtësia vertikale.
- **E përsëritshme:** farën e rastësisë e kemi fikse (1337), kështu që të njëjtat cilësime japin gjithmonë të njëjtat të dhëna.

Çdo modalitet nxehtësie, riprodhimi i kutisë dhe nxehtësia e vijave (gjurmët e plota, sepse nuk ka kolonë ngjarjesh) funksionojnë mbi të. Historia e Jetëgjatësisë funksionon gjithashtu.

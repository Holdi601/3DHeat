---
title: "Entitetet"
parent: "Filtrat dhe mjetet"
nav_order: 3
lang: "sq"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entitetet

**Entitetet** të lejon të zgjedhësh një lojtar (ose disa) për të parë vetëm ku shkoi ai lojtar. Përdore për të ndjekur lëvizjen tënde ose një kundërshtar.

Paneli shfaqet kur grupi i të dhënave ka një kolonë personi. Titulli i tij tregon numrin e personave, ose `selected of total` ndërsa një zgjedhje është aktive (një *person* është një lojtar ose AI, shih [fjalorthin](glossary.md)).

## Zgjidh një lojtar {#pick-a-player}

1. Hap **Entitetet** në shiritin anësor.
2. Shkruaj një pjesë të emrit në kutinë e kërkimit.
3. Shëno lojtarin. Titulli lexon, për shembull, `2 of 10`, dhe çdo gjë tjetër zhduket.
4. **Pastro** i shfaq përsëri të gjithë.

![Entitetet me dy nga dhjetë lojtarë të zgjedhur](../assets/img/en/entities-selected.webp)

Zgjedhja shfaq vetëm personat e zgjedhur, në modalitetet e nxehtësisë (pika, vija, diferenca, nxehtësia e ekipit) si dhe në gjurmët, figurat dhe shtegjet e [riprodhimit të figurave](box-replay.md). Lëre bosh për t'i shfaqur të gjithë; zgjedhja e të gjithëve është e njëjtë me zgjedhjen e askujt.

## Paneli {#the-panel}

| Pjesa | Kuptimi |
|---|---|
| Kutia e kërkimit | *Search N entities...* - filtron listën sipas një nënvargu pa dallim shkronjash të emrit. Shfaq `N matches`, ose `N matches, showing the first 200`; *Nothing matches "..."* kur kërkimi nuk gjen asgjë. |
| Lista | Deri në 200 persona (200-at e parë që përputhen), secili me një kuadrat zgjedhjeje, një mostër të ngjyrës së personit, dhe emrin (*(unnamed)* për emër bosh). |
| Shenja "në lojë" | Kur koha luhet, lista mban ata *në lojë te koka e luajtjes*; një kërkim gjen të gjithë. |
| **AI (n)** | Një grup i palosshëm që mban njësitë e kontrolluara nga AI, veçmas nga lojtarët. |
| **Shto të shfaqurat** | Shton te zgjedhja të gjithë ata që janë listuar tani. |
| **Vetëm të shfaqurat** | E bën zgjedhjen saktësisht ata që janë listuar. |
| **Pastro** | Zbraz zgjedhjen. |

## Kufizimet {#limits}

Në nxehtësi zgjedhja është një filtër dhe përdor një nga katër [vendet e filtrave](filters.md#rules). Kur filtrat e tjerë përdorin tashmë të katër, paneli thotë *Not applied to the heat: all filter slots are taken. The figure replay still shows only these entities. Clear a filter under Filters to free one.* Pastro një filtër për të liruar një vend.

Zgjedhja pastrohet në çdo grup të ri të dhënash. Skeda Match cakton të njëjtën zgjedhje kur përqendrohet te një lojtar.

## Për zhvilluesit {#for-developers}

Zgjedhja ruhet si një filtër *persons* ([Filtrat](filters.md#for-developers)). Maska e hijuesit mban 65.536 ID-të e personave; një person mbi atë numër nuk vizatohet në nxehtësi ndërsa një zgjedhje është aktive.

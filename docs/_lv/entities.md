---
title: "Objekti"
parent: "Filtri un rīki"
nav_order: 3
lang: "lv"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Objekti

**Objekti** ļauj izvēlēties vienu spēlētāju (vai dažus), lai redzētu tikai, kur šis spēlētājs ir bijis. Izmantojiet to, lai sekotu savai kustībai vai vienam pretiniekam.

Panelis tiek rādīts, kad datu kopai ir personu kolonna. Tā galvene rāda personu skaitu vai `selected of total`, kamēr ir aktīva atlase (*persona* ir viens spēlētājs vai MI, skatiet [glosāriju](glossary.md)).

## Izvēlieties spēlētāju {#pick-a-player}

1. Atveriet **Objekti** sānjoslā.
2. Meklēšanas lodziņā ierakstiet daļu no vārda.
3. Atzīmējiet spēlētāju. Galvenē rakstīts, piemēram, `2 of 10`, un viss pārējais pazūd.
4. **Notīrīt** parāda visus atkal.

![Vienības ar diviem no desmit izvēlētiem spēlētājiem](../assets/img/en/entities-selected.webp)

Atlase rāda tikai izvēlētās personas siltuma režīmos (punkti, līnijas, starpība, komandu siltums), kā arī trajektorijās, figūrās un pēdās [figūru atkārtojumā](box-replay.md). Atstājiet tukšu, lai rādītu visus. Visu izvēlēšanās ir tas pats, kas neizvēlēties nevienu.

## Panelis {#the-panel}

| Daļa | Nozīme |
|---|---|
| Meklēšanas lodziņš | *Meklēt N vienības...* — filtrē sarakstu pēc nosaukuma apakšvirknes, neatkarīgi no reģistra. Rāda `N atbilstības` vai `N atbilstības, rāda pirmās 200`; *Nekas neatbilst "..."*, kad meklēšana neatrod nevienu. |
| Saraksts | Līdz 200 personām (pirmās 200 atbilstošās), katrai ar izvēles rūtiņu, personas krāsas paraugu un nosaukumu (*(bez nosaukuma)*, ja nosaukums ir tukšs). |
| Norāde par spēli | Kad laiks tiek atskaņots, saraksts satur tās, kas *ir spēlē atskaņošanas galvā*; meklēšana atrod visas. |
| **AI (n)** | Sakļaujama grupa ar MI vadītajām vienībām, atsevišķi no spēlētājiem. |
| **Pievienot redzamos** | Pievieno visus pašlaik sarakstā esošos atlasei. |
| **Tikai redzamos** | Padara atlasi tieši tādu, kāda ir sarakstā. |
| **Notīrīt** | Iztukšo atlasi. |

## Ierobežojumi {#limits}

Siltumā atlase ir filtrs un izmanto vienu no četrām [filtra vietām](filters.md#rules). Kad citi filtri jau izmanto visas četras, panelis rāda *Siltumam nav piemērots: visas filtra vietas ir aizņemtas. Figūru atkārtojums joprojām rāda tikai šīs vienības. Notīriet filtru sadaļā Filtri, lai atbrīvotu vienu.* Notīriet filtru, lai atbrīvotu vietu.

Atlase tiek notīrīta katrā jaunā datu kopā. Cilne Mačs iestata to pašu atlasi, kad tā fokusē vienu spēlētāju.

## Izstrādātājiem {#for-developers}

Atlase tiek glabāta kā *persons* filtrs ([Filtri](filters.md#for-developers)). Shaderu maska satur 65 536 personu id. Persona aiz tā netiek zīmēta siltumā, kamēr ir aktīva atlase.

---
title: "Filtrid ja tööriistad"
nav_order: 6
has_children: true
lang: "et"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtrid ja tööriistad

Need paneelid lasevad valida, *milliseid* andmeid vaatad, ja mõõta, mida näed. Kasuta neid, kui pilt on liiga tihe: näita ühte meeskonda, ühte mängijat, ühte kohta või ühte hoone korrust.

Iga paneel kitsendab andmeid ja need töötavad koos: rida joonistatakse ainult siis, kui ta läbib **kõik** neist (JA).

```
kõik read -> Filtrid -> Võistkonnad -> Üksused -> Lõik -> pilt
              JA         JA           JA          JA
```

Näide: eemalda Filtrites linnuke *Tank*, peida Punane võistkond jaotises Võistkonnad ja vali üks mängija jaotises Üksused. Näed ainult selle mängija liikumisi, millel pole tanki.

| Paneel | Mida ta teeb | Soojusrežiimid | Kujude ülekate |
|---|---|---|---|
| [Filtrid](filters.md) | Vahemiku ja kategooria filtrid mis tahes veerus, mis laadimisel alles hoiti. | Jah | Ei (ainult veerufiltrid) |
| [Erinevuse jaotus](difference.md#the-difference-split-panel) | Millised read liidavad ja millised lahutavad, erinevuse režiimis. | Ainult erinevus | Ei |
| [Võistkonnad](teams-list.md) | Näita või peida iga võistkond; pane võistkonnad poolele + või -. | Jah | Jah |
| [Üksused](entities.md) | Vali üksikud mängijad. | Jah | Jah |
| [Lõik](slice.md) | Lõika tase ja soojus kihina lahti, et näha hoonete sisse. | Jah, ja tase | Ei |
| [Mõõtmine](measure.md) | Joonlaud ja kursori all olev soojuse väärtus. | Jah | Jah |
| [Mahud ja võrdlus](volumes.md) | Joonista 3D-kujundeid ja küsi, mis seal sees juhtus. Võib ka filtreerida. | Jah | Jah |
| [Jaotus](breakdown.md) | Milline sõiduk, mängija või relv teeb kohas kõige paremini. | pole kohaldatav | pole kohaldatav |

Tabamuste analüüsil on oma alafilter vahekaardil **Sõidukid**: vt [Tabamuste analüüs](hit-analysis.md).

Mõisted nagu soojuskaart, rida, isik ja rühm on selgitatud [sõnastikus](glossary.md).

## Kus paneelid asuvad {#where-the-panels-are}

Soojuskaardi vahekaardi külgriba ülevalt alla:

1. Režiimiriba ja seansi valija
2. Allikas, Veergude vastendus, Andmestik
3. Teed (režiim Jooned)
4. Soojuse paneelid või Võistkonnavaatur
5. Erinevuse jaotus
6. Võistkonnad
7. Üksused
8. Filtrid
9. Taust / tase
10. Lõik
11. Mõõtmine
12. Kaamera teekond ja renderdamine
13. Jõudlus
14. Kaamera ja stseen

Matši vahekaart näitab režiimiriba, seansi valijat, oma paneeli, Filtreid, Tausta / taset ning Kaamerat ja stseeni.

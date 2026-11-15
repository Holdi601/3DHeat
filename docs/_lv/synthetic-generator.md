---
title: "Sintētisko datu ģenerators"
parent: "Datu ievade"
nav_order: 5
lang: "lv"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Sintētisko datu ģenerators

Nav savu datu? Nospiediet vienu pogu, un 3DHeat izdomā jums izdomātu kauju, cik mazu vai lielu vien vēlaties.

1. Atveriet **Datu kopa** paneli siltumkartes sānjoslā (zem **Avots**).
2. Ritiniet līdz **Sintētisko datu ģenerators**.
3. Iestatiet **Rindas (miljonos)**. Pirmo reizi izmēģiniet 1: noklusējums 8 miljoni ir par smagu pirmajam mēģinājumam.
4. Nospiediet **Ģenerēt**.

![1 miljons rindu, 8 komandas, zīmētas cilnē Komandu siltums](../assets/img/en/synthetic-generator-team-heat.webp)

Panelis **Datu kopa** var ģenerēt datu kopu, nevis to ielādēt. Tas domāts divām lietām: skatītāja izmēģināšanai bez saviem datiem un tam, lai pārbaudītu, vai dotais rindu skaits, spraita rādiuss un budžets dod lietojamu kadru ātrumu datorā, *pirms* lielas reālas ielādes veikšanas. Tā kustība ir veidota kā kauja "battle royale" stilā: komandas sākumā ir atdalītas, tad saspiestas kopā. Vienmērīgs troksnis izskatās labi jebkurā budžetā un slēpj tieši tos artefaktus, kurus vērts pamanīt.

## Vadība {#controls}

| Vadība | Noklusējums | Nozīme |
|---|---|---|
| **Rindas (miljonos)** | 8 | Rindas, ko ģenerēt. Noapaļots uz leju līdz veselam skaitam taktu katram spēlētājam. |
| **Komandas** | 8 | Grupu skaits (vismaz 1). |
| **Komandā** | 12 | Spēlētāji katrā grupā (vismaz 1). |
| **Kartes pusizmērs (m)** | 4000 | Puse no spēlējamās zonas platuma pa X un Z. |
| Aplēses rinda | | "≈ X GB RAM, Y GB GPU pēc kvantēšanas." (aptuveni 26 baiti RAM un 8 baiti GPU katrā rindā). |
| **Ģenerēt** | | Ģenerē ielādes darbiniekā, ar norisi, un aizstāj jebkuru ielādēto datu kopu. |

Ģenerēšana notiek fona darbiniekā, tāpēc desmitiem miljonu rindu neiesaldē lapu.

## Ko tas ģenerē {#what-it-generates}

No [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Kolonnas:** pozīcija, laiks, persona (`P000`, `P001`, ...), grupa (`Team 1`, `Team 2`, ...), yaw un pitch, un dzīvilgumi. Nav sesijas kolonnas un nav filtru kolonnu.
- **Laiks:** viens paraugs katram spēlētājam ik pēc 0,25 s, sākot no 0 (relatīvs laiks, bez pulksteņa).
- **Kustība:** katra komanda sākas savā sektorā gredzenā, 55–95% no pusizmēra. Drošs aplis, kas centrēts tuvu vidum (nobīdīts nejauši līdz ceturtdaļai no pusizmēra), sarūk līdz 8% no pusizmēra sešās fāzēs ar plato. Katrs spēlētājs virzās uz klejojošu punktu tā iekšienē, ar slāpēšanu un troksni. Augstums svārstās no 0 līdz 220 m.
- **Skata virziens:** yaw pa kustības virzienu, pitch no vertikālā ātruma.
- **Atkārtojams:** nejaušības sēkla ir fiksēta (1337), tāpēc vienmēr tie paši iestatījumi dod tos pašus datus.

Katrs siltuma režīms, figūru pārklājums un līniju siltums (veseli trases, jo nav notikumu kolonnas) strādā ar tiem. Strādā arī Dzīvilguma vēsture.

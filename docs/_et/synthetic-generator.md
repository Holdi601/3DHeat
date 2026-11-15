---
title: "Sünteetiline generaator"
parent: "Andmete sisselugemine"
nav_order: 5
lang: "et"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Sünteetiline generaator

Pole oma andmeid? Vajuta ühte nuppu ja 3DHeat leiutab sulle väljamõeldud lahingu, nii väikese või suure, kui soovid.

1. Ava soojuse külgribal paneel **Andmestik** (allpool **Allikas**).
2. Keri jaotiseni **Sünteetiline generaator**.
3. Määra **Ridu (miljonites)**. Proovi esmalt 1: vaikimisi 8 miljonit on esimese katse jaoks raske.
4. Vajuta **Genereeri**.

![1 miljon rida, 8 võistkonda, joonistatud jaotises Võistkondade soojus](../assets/img/en/synthetic-generator-team-heat.webp)

Paneel **Andmestik** saab genereerida andmestiku selle laadimise asemel. See on mõeldud kahel otstarbel: vaatajat proovida ilma oma andmeteta ja kontrollida, kas antud arv ridu, spraidi raadius ja eelarve annavad masinal kasutatava kaadrisageduse, *enne* kui sinna suure päris andmestiku laadid. Selle liikumine on kujundatud nagu battle royale'i mäng: võistkonnad alustavad eraldi ja surutakse siis kokku. Ühtlane müra näeb iga eelarve juures hea välja ja peidab täpselt need artefaktid, mida oleks väärt märgata.

## Juhtnupud {#controls}

| Juhtelement | Vaikimisi | Tähendus |
|---|---|---|
| **Ridu (miljonites)** | 8 | Genereeritavad read. Ümardatakse iga mängija jaoks täisarvuliseks hulgaks takte alla. |
| **Võistkonnad** | 8 | Gruppide arv (vähemalt 1). |
| **Võistkonna kohta** | 12 | Mängijaid grupis (vähemalt 1). |
| **Kaardi poolulatus (m)** | 4000 | Poole mängitava ala laiusest X ja Z teljel. |
| Hinnanguline rida | | "≈ X GB RAM-i, Y GB GPU-l pärast kvantiseerimist." (umbes 26 baiti RAM-i ja 8 baiti GPU-l rea kohta). |
| **Genereeri** | | Genereerib sisseimporditöötlejas, edenemisnäiduga, ja asendab laaditud andmestiku. |

Genereerimine käib taustatöötlejas, nii et kümned miljonid read ei jäädvusta lehte.

## Mida see genereerib {#what-it-generates}

Failist [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Veerud:** asukoht, aeg, isik (`P000`, `P001`, ...), grupp (`Team 1`, `Team 2`, ...), yaw ja pitch ning eluead. Seansiveergu ja filtriveerge ei ole.
- **Aeg:** üks proov mängija kohta iga 0,25 s järel, algusega 0 (suhteline aeg, mitte seinakell).
- **Liikumine:** iga võistkond alustab oma sektoris rõnga ümber, mis asub 55–95% poolulatusest. Turvaline ring keskel lähedal (juhuslikult nihutatud kuni veerandi poolulatusest) kahaneb kuue faasiga 8%-ni poolulatusest, faasid on tasandikega. Iga mängija suundub ringi sees hulkuva punkti poole, koos summutuse ja müraga. Kõrgus võngub 0 ja 220 m vahel.
- **Vaatesuund:** yaw liikumissuunas, pitch vertikaalkiirusest.
- **Korratav:** juhuslik seeme on fikseeritud (1337), nii et samad seaded annavad alati samad andmed.

Iga soojusrežiim, kastide kordus ja joonesoojus (terved rajad, sest seansiveergu ei ole) töötavad sellega. Töötab ka eluea ajalugu.

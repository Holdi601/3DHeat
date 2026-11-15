---
title: "Imtis ir biudžetai"
parent: "Atvaizdavimo vidus"
nav_order: 3
lang: "lt"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Imtis ir biudžetai

Kai taškų per daug, kad juos būtų galima nupiešti viename kadre, peržiūra piešia tolygią imtį ir kiekvienas taškas skaičiuojasi daugiau, todėl vaizdas išlieka teisingas. Valdiklis koreguoja, kiek jų piešti, kad peržiūra išlaikytų savo kadrų dažnį.

## Našumo skydelio valdikliai {#performance-panel-controls}

| Valdiklis | Numatytoji | Intervalas (vilkimas) |
|---|---|---|
| **Piešti kiekvieną eilutę kiekviename kadre** | įjungta | |
| **Prisitaikantis biudžetas** | įjungta | |
| **Tikslinis FPS** | 60 | 20–240 (1000) |
| **Pradiniai spraitai / kadrą** (prisitaikant) arba **Spraitai / kadrą** | 4,00M | 65 536–268 435 456, logaritminis (268 435 456) |
| **Šilumos raiška** | 100 % | 25–100 %, dauginama iš prisitaikančio antrojo etapo mastelio |
| **Laipsniškas tikslinimas** | įjungta | Išjungta: kiekvienas kadras yra naujas vieno kadro įvertinimas (naudinga matyti neapdorotą imtį). |

Taip pat žr. [Našumo skydelis ir statistikos perdanga](performance-and-stats.md).

## Kūrėjams {#for-developers}

### Kandidatinės eilutės {#candidate-rows}

Eilutės saugomos didėjančia laiko tvarka. Laiko juostos langas [*lo*, *hi*] tampa eilučių intervalu dviem dvejetainėmis paieškomis laiko stulpelyje ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); be laiko stulpelio kiekviena eilutė yra kandidatė. Tai yra **Eilutės lange** statistikos perdangoje. Kiekvienos eilutės testai – filtrai, grupės, skaidymas, atrinkimas, pjūvis, gyvavimo trukmė – vykdomi vėliau, šešėliuotojuje; eilutė, kuri nepraeina, kainuoja vieną viršūnės iškvietimą ir jokių fragmentų.

### Imties planas {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) padalija kandidatų intervalą į **4 096 iš eilės einančių eilučių blokus** ir pasirenka, kiek jų piešti, pagal kadro spraitų biudžetą:

- Jei biudžetas apima visus blokus, piešiami visi – kadras tikslus.
- Priešingu atveju blokai imami tolygiu žingsniu per intervalą, su poslinkiu, kuris kiekvieną kadrą pasislenka pagal auksinį pjūvį, todėl gretimi kadrai apima skirtingus blokus ir visuma tolygiai užpildoma. Tai yra **stratifikuota** imtis: kiekvienoje kadro dalyje atstovaujama visa laiko intervalo dalis.

Kiekvienos piešiamos eilutės šiluma padauginama iš **kandidatai / pateikti**, todėl laukiama kadro šiluma yra tiksli bet kokiam biudžetui; priklauso nuo biudžeto tik triukšmas. Eilutės gyvena gabaluose po 8 388 608 (žr. [GPU atminties laikymas](gpu-memory.md)); blokas dalijamas ten, kur jis kerta gabalą, o kiekvienas gabalas gauna blokų pradžių sąrašą, kurį turi nupiešti.

Vienas planas gali turėti daugiausia 65 536 blokus – 268 435 456 spraitus – nes abi pusės laiko fiksuoto dydžio 65 536 vietų blokų pradžių buferį. Didesnis prašymas tuo apribojamas, o trūkumas sąžiningai rodomas kaip daugiau kadrų konvergencijai.

### Piešti kiekvieną eilutę kiekviename kadre {#draw-every-row-each-frame}

**Našumas → Piešti kiekvieną eilutę kiekviename kadre** (numatyta **įjungta**): biudžetas tampa grindimis, o ne lubomis, ir kadras, kuris pradeda naują įvertinimą, piešia kiekvieną eilutę, už kurią atsako (iki 268M ribos).

Priežastis: kameros judėjimas atmeta kaupimą, todėl judantis kadras yra vienas įvertinimas, kurio triukšmą lemia tai, kiek duomenų jis nupiešė – kai nupiešta ketvirtis, matote ketvirtį ryškiais svertiniais taškais, būtent tai ir daro judantį vaizdą blizgantį. Piešiant viską kiekvienas kadras tampa baigtu vaizdu. Kaina ta, kad kadro laikas dabar seka duomenų dydį lange; svertai yra siauresnis laiko langas, filtrai ar atrinkimas pagal atstumą, kurie mažina kandidatus, o ne retina imtį.

Išjunkite įrangoje, kuri negali sau leisti viso lauko iš karto: tada *Spraitai / kadrą* yra tikra riba, o vaizdas konverguoja per kelis nejudančius kadrus.

Pilno plano kaina, išmatuota aukščiausios klasės stalinio GPU esant 4K drobei ir dideliam lygiui, spraitai 1 m spindulio (vienas ar du pikseliai): maždaug 100M spraitų kadrui esant 30 fps, 200M esant 15 fps, o 268M maksimumas – maždaug esant 12 fps. Su tokiais mažais spraitais visą kainą sudaro viršūnių etapas, o šilumos raiška nieko nekeičia; su dideliais spraitais kainą lemia užpildymas: 8M 100 m spindulio spraitų kadrui užtruko 2,5 s esant visai šilumos raiškai ir 170 ms esant 25 %. **Piešti kiekvieną eilutę kiekviename kadre** todėl pradeda nuo 67M ir kiekvieną kadrą kyla ketvirtadaliu, kol kadrai trunka mažiau nei 150 ms, ir perpus mažėja, kai trunka daugiau nei 400 ms, kad sunkus vaizdas nevarytų kadro už tai, ką leidžia GPU sargas.

### Prisitaikantis biudžetas {#the-adaptive-budget}

**Našumas → Prisitaikantis biudžetas** (numatyta įjungta) koreguoja spraitų biudžetą, kad būtų palaikomas **Tikslinis FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Dėžutės pakartojime ir atvaizduojant video jis neveikia.

Įvestis yra kadro laikas, išlygintas (90 % ankstesnio + 10 % naujo, atskiri kadrai ribojami iki 2 s), palyginus su tikslu 1000 / max(15, tikslinis FPS) ms.

**Pirmasis etapas – spraitai.** Kiekvieną kadrą biudžetas dauginamas iš `1 + (tikslas / kadras - 1) × stiprumas`, kai stiprumas 0,35, kai per lėta, ir 0,08, kai yra atsargos; apribota koeficientu 0,5–1,25 kadrui ir 65 536–268 435 456 spraitų ribomis.

**Antrasis etapas – raiška.** Tik tada, kai biudžetas jau pasiekęs apačią, o kadrai vis dar daugiau nei 10 % per lėti, šilumos buferio raiška krenta 8 % kadrui, iki 25 % drobės; ji atsigauna 4 % kadrui, kai yra 30 % atsargos. Fragmentų kaina krenta su raiškos kvadratu, o tai beveik nematoma po švelnia skale. (Matuota programiniu atvaizdavimu su 10M eilučių ir per didelių spraitų: 141 ms → 17 ms kadrui.) Mastelis suapvalinamas iki šešioliktųjų; perdangos *Šilumos raiška* jį rodo.

**Atsisakymas.** Lėtas kadras atrodo vienodai, ar jį sukėlė spraitai, ar sunkus lygis – laiko matavimo pagal etapus nėra. Jei biudžetas stovi ties apačia, o kadrai lieka žemiau 70 % tikslo 30 kadrų, spraitai nebuvo kaltininkai: valdiklis perjungiamas į **kopimą**, dauginant biudžetą iš 1,5 kas 14 kadrų ir atkuriant raišką, kol kadro laikas išlieka 1,5 karto ribose nuo to, koks buvo apačioje. Kopimas, kuris padaro dar blogiau, grįžta atgal iki 60 % ir atnaujina įprastą valdymą; pasiekus tikslą kopimas baigiamas.

Išjungus prisitaikantį biudžetą, biudžetas tiesiog yra **Spraitai / kadrą**.

Su įjungtu *Piešti kiekvieną eilutę kiekviename kadre* prisitaikantis biudžetas vis tiek veikia, bet tikslioji taisyklė pakelia biudžetą, kad apimtų visas kandidatines eilutes, todėl praktiškai jis valdo tik raiškos etapą ir kadrus, kurie nepradeda naujo įvertinimo.

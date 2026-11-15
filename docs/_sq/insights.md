---
title: "Vëzhgime"
nav_order: 7
has_children: true
lang: "sq"
source: "insights.md"
source_hash: "8232fe145807"
translated: true
outdated: true
---

# Vëzhgime

**Vëzhgimet** kërkojnë në të dhënat e ngarkuara çfarë del në pah - pozicione të forta, tokë vdekjeprurëse, kurthe lindjeje, pika grykëzimi, lojtarë shumë mbi bashkëlojtarët e tyre - dhe të tregon, më të fortën e para, me provat. Përdore për të mësuar në një minutë ku u fitua ose u humb një ndeshje. Mund pastaj të shkruajë një përmbledhje, dhe në një riluajtje të vetme mund të veprojë si komentues që kërcen te momentet e mëdha.

Gjithçka numërohet në shfletuesin tënd. Asgjë nuk del nga kompjuteri yt, përveç nëse ndez një IA të jashtme (shih [IA e jashtme](#external-ai)).

![Vëzhgimet mbi demo-n e tankeve: 14 gjetje, më e fortja e para](../assets/img/sq/insights.webp)

Seksioni **Vëzhgime** ndodhet në shiritin anësor të skedave Harta e nxehtësisë dhe Ndeshja. Ka tre skeda: **Gjetjet**, **Përmbledhja** dhe **Komentuesi**.

## Gjetjet {#findings}

1. Ngarko të dhënat dhe hap **Vëzhgime**. Shtyp **Gjej vëzhgime** ("Po numërohet… n%" tregon progresin).
2. Lexo listën. Çdo gjetje ka një shirit force, një fjali, sa e fortë është provë (*Provë e fortë*, *Provë e mirë* ose *Pak provë*), cili detektor e gjeti, dhe klasën e mjetit ku ka rëndësi.
3. **Kliko një gjetje**: shikuesi aplikon filtrat e saj, fluturon kamerën te vendi dhe kërcen te koha, dhe hap detajet: efektin me intervalin 95%, vlerat p dhe q, provat e numëruara, dhe **Vëllim këtu**, që vizaton një [vëllim](volumes.md) rreth vendit.
4. **Rikthe filtrat** i kthen filtrat e tua. **Kopjo JSON** kopjon gjithë raportin.

Numërimi përdor filtrat aktualë, grupet e fshehura dhe ndeshjen e zgjedhur për gjithë intervalin kohor. Kur ndryshon filtrat më pas, një shënim e thotë këtë; shtyp **Numëro përsëri**.

Rreshtat në krye të listës (për shembull totalet e parasë) përmbledhin gjithë të dhënat përpara gjetjeve.

![Një gjetje e hapur: zona e nxehtë e të shtënave, numrat e saj, dhe një pasazh përkatës nga literatura](../assets/img/sq/insights-finding.webp)

### Detektorët {#the-detectors}

| Detektori | Çfarë gjen | Nevojitet në të dhëna |
|---|---|---|
| **Pozicione force** | Vende me shanse shumë më të mira vrasje-për-vdekje sesa pjesa tjetër e hartës, dhe *tokë e sigurt* ku vdesin pak njerëz për kohën e kaluar | ngjarje vrasjeje dhe vdekjeje |
| **Zona të nxehta dhe të ftohta** | Vende ku një lloj ngjarjeje (të shtëna, goditje, kapje ...) ndodh shumë më shpesh ose më rrallë se sa parashikon koha e kaluar atje | një kolonë ngjarjesh |
| **Terren i hapur dhe mbulesë** | Vdekje në terren të hapur kundrejt gjeometrisë së nivelit pranë, dhe ngadalë kundrejt lëvizjes së shpejtë | vdekje; një nivel 3D për pjesën e gjeometrisë |
| **Spawn-et** | Spawn-e të forta, kurthe spawn-i, spawn-e të sigurta, koha deri në kontaktin e parë | kohë dhe persona |
| **Klasa sipas vendit** | Një klasë mjeti, ose lojtarët kundrejt IA-së, që bëjnë shumë më mirë ose më keq në një zonë | vrasje plus një kolonë klase mjeti ose lojtar/IA |
| **Lojtarët** | Lojtarë që vrasin ose vdesin shumë më tepër ose më pak se të tjerët në të njëjtën klasë | persona dhe vrasje |
| **Grykat dhe krahët** | Pika grykëzimi (shumë më tepër kalime sesa toka përreth) dhe rrugë krahu (përdoren rrallë, por çojnë në vrasje) | persona |
| **Vlera** | *Tokë e kushtueshme* dhe *Tokë fituese* | [kolonat e vlerave](value-weighting.md) |

Detektorët që nuk mund të punojnë mbi të dhënat listohen në fund, me arsyen.

### Si renditen gjetjet {#how-findings-are-ranked}

Çdo vend ose grup testohet kundrejt pjesës tjetër të hartës (teste binomiale ose normash të sakta). Shkalla e zbulimit të rremë mbahet në 5% (Benjamini-Hochberg). Rastësia mund të duket si model; kjo i mban alarmet e rreme të ulëta: mes gjetjeve të shfaqura, pritet të jetë rastësi më së shumti rreth një në njëzet. Efektet nga pak ngjarje tërhiqen drejt "pa efekt" para renditjes. Listohen më së shumti 60 gjetje, dhe çdo detektor merr disa vende afër majës.

## Përmbledhja {#debrief}

Skeda **Përmbledhja** i shkruan gjetjet në një tekst të shkurtër: një hyrje, gjetja më e qartë, një për taktikat, një për balancimin, pjesa tjetër e grupuar sipas detektorit, dhe sa prej tyre mbështeten në prova më të dobëta. Çdo paragraf ka butona të numëruar që shfaqin gjetjet e tij. **Kopjo tekstin** e kopjon.

![Përmbledhja e shkruar nga narratori i integruar](../assets/img/sq/debrief.webp)

Narratori i integruar punon pa internet, në gjuhën tënde. Përzgjedhësi **Lente** mbi të (shih [Lente e njohurive](knowledge.md)) përcakton cilën literaturë citojnë paragrafët.

### IA e jashtme {#external-ai}

**Cilësimet e IA-së** lejon një model IA sipas zgjedhjes sate të shkruajë përmbledhjen në vend të tij:

| Cilësimi | Kuptimi |
|---|---|
| **Ofruesi** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (lokal), LM Studio (lokal), server llama.cpp (lokal), ose çdo pikë përfundimi e pajtueshme me OpenAI |
| **URL bazë**, **Modeli** | Plotësohen nga ofruesi; **Listo modelet** i kërkon serverit |
| **Çelësi API** | Dërgohet vetëm te URL-ja bazë. Kurrë nuk regjistrohet, kurrë nuk ruhet në pamje, eksportime apo skedarë `.3dheat`. Shumica e serverëve lokalë nuk kanë nevojë për të. |
| **Mbaje mend çelësin në këtë shfletues** | Joaktiv si parazgjedhje: çelësi harrohet kur mbyllet faqja |
| **Përdor një IA të jashtme** | Joaktiv si parazgjedhje |
| **Dërgo emrat e lojtarëve** | Joaktiv si parazgjedhje: lojtarët dërgohen si P1, P2 ... |

Pastaj shkruaj një pyetje opsionale dhe shtyp **Shkruaj me IA**. Dërgohen vetëm gjetjet dhe numrat e tyre - kurrë rreshtat e të dhënave të tua. Përgjigja rrjedh gradualisht, dhe gjetjet e cituara bëhen butona.

## Komentuesi {#caster}

Për **një ndeshje** (zgjidh një nëse janë ngarkuar disa), **Komentuesi** gjen momentet që vlen të shihen: gjakun e parë, shumëvrasjet, shkëmbimet, kthimet në fund, luhatjet e objektivave, rikthimet, lojtarët që dallohen, të shtënat nga larg.

![Momentet e komentuesit për një raund të demos shooter](../assets/img/sq/caster.webp)

- Kliko një moment: pamja kalon te riluajtja, kërcen pak përpara tij, fluturon atje dhe ndjek lojtarin.
- **Luaj çastet** e luan çdo moment deri në fund dhe kalon më tej; **Para** / **Pas** lëviz mes tyre.
- Me një IA të jashtme aktive, **Komentim nga IA** shkruan një koment nga lista e momenteve (llojet, kohët, emrat ose pseudonimet, ekipet, klasat, distancat).

Kërkon persona dhe ngjarje vrasje/vdekje (ose kapje); një kolonë `other`/`victim` e bën të mundur shkëmbimet dhe të shtënat nga larg.

## Lente e njohurive {#knowledge-lens}

Një gjetje mund të lexohet përmes një **lente** njohurish të vendosura: doktrinë ushtarake, luftim ajror dhe detar, operacione urbane, dizajn lojërash dhe esports (ose *Auto*, e zgjedhur nga njësitë në të dhëna). Një gjetje e hapur atëherë shfaq hyrjen më të afërt të **doktrinës dhe literaturës** dhe një **paralele historike**, me referenca, dhe **Matjet e lentes** llogarit masa nga ajo literaturë mbi të dhënat (përshtatje Lanchester, raporte shkëmbimi, raporte forcash, fusha zjarri, terren kyç, shkëmbime, iniciativë). Përmbledhja dhe kërkesa për IA-në i përfshijnë ato. Gjithçka për të: [Lente e njohurive](knowledge.md).

Matjet e lentes masin edhe si sillen lojtarët si turmë dhe si grup - rreshtimi dhe rrotullimi, drejtimi i rrugëve, korsitë dhe gjurmët, mbushja, udhëheqësit dhe ndjekësit, të vonuarit, pika e thyerjes nën humbje, rreziku pas një jete të humbur, seritë, marrëveshja e blerjeve dhe përgjigja ndaj zjarrit hyrës - secila kundrejt modelit të vet të zerosë: [Sjellja kolektive](collective-behaviour.md).

## Të dhënat që bëjnë vëzhgimet të punojnë {#data-that-makes-insights-work}

- pozicione me **kohë**, një kolonë **personi** dhe një kolonë **ekipi**;
- një kolonë **ngjarjesh** me vrasje dhe vdekje (`kill`, `death`), dhe të tjera (`hit`, `fire`, `capture` ...);
- një kolonë **palës tjetër** (`other`, `victim`) për shkëmbime dhe drejtime;
- një kolonë **mjeti** ose **tipi** për klasat; një kolonë `ai` për lojtarët kundrejt IA-së;
- një kolonë **seance** / **ndeshjeje** / **raundi** kur ka disa ndeshje.

[Të dhënat demo](demo-data.md) i kanë të gjitha.

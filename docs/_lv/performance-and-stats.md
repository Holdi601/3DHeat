---
title: "Veiktspējas panelis un statistika"
parent: "Renderēšanas iekšējā uzbūve"
nav_order: 7
lang: "lv"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Veiktspējas panelis un statistika

Lodziņš skata augšējā labajā stūrī parāda, cik smagi strādā skatītājs: cik kadru sekundē, cik punktu tas zīmē un vai tas vēl precizē attēlu. Panelis **Veiktspēja** ļauj samainīt attēla kvalitāti pret ātrumu.

## Statistikas pārklājums {#the-stats-overlay}

Lodziņš skata augšējā labajā stūrī cilnēs Siltumkarte un Mačs ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Tas katrā animācijas kadrā nolasa dzinēja tiešo rādījumu.

![Statistikas pārklājums daudzu spēļu ainā ar numurētiem norādījumiem: 1 Renderētājs, 2 FPS, 3 Kadrs, 4 Rindas logā, 5 Spraiti / kadrs, 6 Budžets, 7 Siltuma izšķ., 8 Pārklājums](../assets/img/en/performance-stats-overlay.webp)

| Rinda | Nozīme |
|---|---|
| **Renderētājs** | *WebGPU* vai *WebGL2*. Uzvediet virsū, lai redzētu iemeslu, kāpēc WebGPU netika izmantots, ja tas netika. Skatiet [Abas renderēšanas metodes](backends.md). |
| **FPS** | Kadri sekundē, vidēji vismaz 0,4 s. |
| **Kadrs** | Kadra laiks ms, izlīdzināts (90% iepriekšējais, 10% jaunais). Tas ir laiks starp kadriem, nevis GPU laiks: nekāda GPU laika mērīšana pa katru piespēli netiek veikta. |
| **Rindas logā** | Kandidātu rindas: rindas pašreizējā laika logā, pirms katras rindas filtrēšanas shaderī. |
| **Spraiti / kadrs** | Spraiti, ko pēdējā kadra plāns iesniedza (saglabāti plānotajā skaitlī dīkstāves kadros, kas neko nezīmē). |
| **Budžets** | Spraitu budžets, ar kādu šis kadrs tika plānots: adaptīvā kontroliera vērtība, paaugstināta līdz visiem kandidātiem, zīmējot katru rindu. |
| **Siltuma izšķ.** | Siltuma bufera izšķirtspēja kā daļa no audekla: iestatījums *Siltuma izšķirtspēja* reizināts ar adaptīvā otrās pakāpes mērogu. |
| **Pārklājums** | Cik tālu progresīvā uzkrāšana ir tikusi līdz visu rindu izmantošanai: procentos, kamēr konverģē (dzeltenā krāsā), un *precīzs*, kad pabeigts. Trokšņains kadrs nekad netiek sajaukts ar pabeigtu attēlu. |
| **Kubi** | Kastes, kas zīmētas [figūru pārklājumā](box-replay.md). |
| **Nav atmiņā** | Rāda tikai tad, ja rindas neietilpst GPU budžetā: cik rindu. Skatiet [GPU atmiņas saturs](gpu-memory.md). |

## Ātruma rādījums {#the-speed-display}

Skata apakšējā labajā stūrī, tikai perspektīvā: lidojuma ātrums un laiks, kāds nepieciešams, lai šķērsotu datus šajā ātrumā. Velciet, lai mainītu ātrumu. Skatiet [Kamera](camera.md#fly-speed).

## Ja skatītājs ir lēns {#if-the-viewer-is-slow}

Paskatieties uz statistikas pārklājumu un tad:

1. **Rindas logā ir daudz lielāks nekā Spraiti / kadrs, Pārklājums zem 100%**: kadrs nevar zīmēt visu; tas konverģē vairākos kadros, kad skats ir nekustīgs. Sašauriniet logu, filtrējiet vai nogriezt, lai samazinātu kandidātus, vai pieņemiet paraugu ņemšanu.
2. **Spraiti / kadrs vienāds ar Rindas logā, kadrs joprojām lēns**: izmaksas ir par katru ekrānā esošu spraitu. Samaziniet *Maksimālo pikseļu rādiusu* ([Sprite forma](sprite-shape.md#pixel-clamps)) vai *Siltuma izšķirtspēju*.
3. **Lēns ar maz rindām**: visticamāk līmenis, lieli struktūru skaiti ar malām ieslēgtām, zemes trīsstūri, lauka dziļums. Skatiet [Līmeņa izskats](level-appearance.md).
4. **Viss lēns un sarkans baneris**: programmatūras renderēšana ([Programmatūras renderēšanas noteikšana](software-rendering.md)).

## Veiktspējas panelis {#the-performance-panel}

| Vadība | Noklusējums | Iedarbība |
|---|---|---|
| Padoms | | Katrs kadrs izzīmē stratificētu nejaušu redzamo rindu apakškopu ar svaru, kas mērogots kompensēšanai, tāpēc paredzamais siltums ir precīzs jebkurā budžetā. Turot skatu nekustīgu, kadri turpina sapludināšanu, līdz katra rinda ir ieguldījusi. |
| **Zīmēt katru rindu katrā kadrā** | ieslēgts | Katrs kadrs, kas sāk jaunu aplēsi, zīmē katru kandidātu rindu (līdz aptuveni 268M). Zemāk esošais budžets kļūst par minimumu. [Paraugu ņemšana un budžeti](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptīvs budžets** | ieslēgts | Pielāgo spraitus kadrā, tad siltuma izšķirtspēju, lai saglabātu mērķa kadru ātrumu, un apstājas, kad samazināšana nepalīdz. [Paraugu ņemšana un budžeti](sampling-and-budgets.md#the-adaptive-budget) |
| **Mērķa FPS** | 60 | 20–240 (1000 ar rokturi). Vērtības zem 15 tiek uzskatītas par 15. |
| **Sākotnējie spraiti / kadrs** / **Spraiti / kadrs** | 4.00M | 65 536–268 435 456, logaritmiski. Nosaukts par *Sākotnējie*, kamēr adaptīvais ir ieslēgts, jo kontrolieris to pārvieto. |
| **Siltuma izšķirtspēja** | 100% | 25–100%. Fragmentu izmaksas mērogojas ar kvadrātu: 50% sadala sajaukšanas darbu uz ceturtdaļu, un siltuma lauks ir pietiekami gluds, lai to gandrīz nemanītu. |
| **Progresīva precizēšana** | ieslēgts | Uzkrāt pāri kadriem, kamēr skats ir nekustīgs. Izslēgts rāda vienkadra aplēsi katrā kadrā. [Uzkrāšana](accumulation.md) |
| **Resursu budžeti** | noteikts | RAM, GPU un parsēšanas pavedienu budžeti. [Atmiņa un budžeti](memory-and-budgets.md#resource-budgets) |

Neviens no šiem iestatījumiem netiek saglabāts; pārlādējot lapu, atjaunojas noklusējumi.

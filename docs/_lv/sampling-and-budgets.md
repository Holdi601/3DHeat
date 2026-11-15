---
title: "Paraugu ņemšana un budžeti"
parent: "Renderēšanas iekšējā uzbūve"
nav_order: 3
lang: "lv"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Paraugu ņemšana un budžeti

Kad ir par daudz punktu, lai tos zīmētu vienā kadrā, skatītājs zīmē vienmērīgu paraugu un padara katru punktu svarīgāku, lai attēls paliktu pareizs. Kontrolieris pielāgo, cik daudz tos zīmē, lai skatītājs uzturētu savu kadru ātrumu.

## Veiktspējas paneļa vadības {#performance-panel-controls}

| Vadība | Noklusējums | Diapazons (kustināšana) |
|---|---|---|
| **Zīmēt katru rindu katrā kadrā** | ieslēgts | |
| **Adaptīvs budžets** | ieslēgts | |
| **Mērķa FPS** | 60 | 20–240 (1000) |
| **Sākotnējie spraiti / kadrs** (adaptīvs) vai **Spraiti / kadrs** | 4,00M | 65 536–268 435 456, logaritmiski (268 435 456) |
| **Siltuma izšķirtspēja** | 100% | 25–100%, reizināts ar adaptīvā otrā posma mērogu |
| **Progresīva precizēšana** | ieslēgts | Izslēgts: katrs kadrs ir jauna viena kadra aplēse (noderīgi, lai redzētu neapstrādātu paraugu). |

Skat. arī [Veiktspējas panelis un statistikas pārklājums](performance-and-stats.md).

## Izstrādātājiem {#for-developers}

### Kandidātu rindas {#candidate-rows}

Rindas tiek glabātas augošā laika secībā. Laika logs [*lo*, *hi*] kļūst par rindu diapazonu ar divām bināras meklēšanas operācijām pa laika kolonnu ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Bez laika kolonnas katra rinda ir kandidāts. Tās ir **Rindas logā** statistikas pārklājumā. Katras rindas pārbaudes — filtri, grupas, sadalījums, atmešana, griezums, dzīvildze — notiek vēlāk, šeiderī. Rinda, kas neizturas, maksā vienu virsotnes izsaukumu un nevienu fragmentu.

### Paraugu ņemšanas plāns {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) sadala kandidātu diapazonu **blokos pa 4096 pēc kārtas esošām rindām** un izvēlas, cik no tiem zīmēt, pēc kadra spraitu budžeta:

- Ja budžets sedz katru bloku, visi tiek zīmēti — kadrs ir precīzs.
- Citādi bloki tiek ņemti ar vienmērīgu soli pa diapazonu, nobīdīti ar drebēšanu, kas katrā kadrā virzās par zelta griezumu. Tāpēc secīgi kadri aptver dažādus blokus, un to kopums aizpilda vienmērīgi. Šis ir **stratificēts** paraugs: katra laika diapazona daļa ir pārstāvēta katrā kadrā.

Katras zīmētās rindas siltums tiek reizināts ar **kandidāti / iesniegti**, tāpēc kadra sagaidāmais siltums ir precīzs jebkurā budžetā. Tikai troksnis ir atkarīgs no budžeta. Rindas dzīvo gabalos pa 8 388 608 (skat. [GPU atmiņas rezidence](gpu-memory.md)). Bloks tiek sadalīts, kur tas šķērso gabalu, un katrs gabals saņem bloku sākumu sarakstu, kas tam jāzīmē.

Viens plāns var nest ne vairāk kā 65 536 blokus — 268 435 456 spraitus —, jo abi aizmugures sistēmas tur fiksēta izmēra 65 536 vietu bloku sākumu buferi. Pieprasījums pēc vairāk tiek tur apgriezts, un trūkums parādās godīgi kā vairāk kadru, lai konverģētu.

### Zīmēt katru rindu katrā kadrā {#draw-every-row-each-frame}

**Veiktspēja → Zīmēt katru rindu katrā kadrā** (noklusējums **ieslēgts**): budžets kļūst par apakšējo robežu, nevis augšējo, un kadrs, kas sāk jaunu aplēsi, zīmē katru rindu, par kuru tas ir atbildīgs (līdz 268M ierobežojumam).

Iemesls: kameras kustība atmet uzkrāšanu, tāpēc kustīgs kadrs ir viena aplēse, kuras troksni nosaka tas, cik daudz datu tas zīmēja. Ar ceturtdaļu no tiem zīmētu redzi ceturtdaļu spilgtos svērtos punktos, un tieši tas liek kustīgam skatam mirdzēt. Visa zīmēšana padara katru kadru gatavu attēlu. Cena ir tāda, ka kadra laiks tagad seko datu izmēram logā. Svira ir šaurāks laika logs, filtri vai atmešana pēc attāluma, kas samazina kandidātus, nevis retina tos.

Izslēdz to aparatūrai, kas nevar atļauties visu lauku uzreiz: tad *Spraiti / kadrs* ir reāls ierobežojums, un skats konverģē dažos nekustīgos kadros.

Pilna plāna izmaksas, izmērītas augstas klases galda GPU ar 4K audeklu un lielu līmeni, spraitiem ar 1 m rādiusu (viens vai divi pikseļi): aptuveni 100M spraitu kadrā pie 30 fps, 200M pie 15 fps un 268M maksimums aptuveni pie 12 fps. Ar tik maziem spraitiem visu izmaksā virsotņu posms, un siltuma izšķirtspēja neko nemaina. Ar lieliem spraitiem aizpildīšana ir: 8M spraitu ar 100 m rādiusu prasīja 2,5 s kadrā pie pilnas siltuma izšķirtspējas un 170 ms pie 25%. **Zīmēt katru rindu katrā kadrā** tāpēc sākas ar 67M un katrā kadrā pieaug par ceturtdaļu, kamēr kadri aizņem mazāk par 150 ms, un samazinās uz pusi, kad aizņem vairāk par 400 ms. Tā smaga skata kadru nevar pārvilkt pāri tam, ko GPU sargsuns atļauj.

### Adaptīvais budžets {#the-adaptive-budget}

**Veiktspēja → Adaptīvs budžets** (noklusējums ieslēgts) pielāgo spraitu budžetu, lai turētu **Mērķa FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Atkārtojumā ar kastēm un video renderēšanas laikā tas ir dīkstāvē.

Ievade ir kadra laiks, izlīdzināts (90% iepriekšējais + 10% jaunais, ar atsevišķiem kadriem, kas ierobežoti līdz 2 s), salīdzinot ar mērķi 1000 / max(15, mērķa FPS) ms.

**Pirmais posms — spraiti.** Katrā kadrā budžets tiek reizināts ar `1 + (mērķis / kadrs - 1) × pastiprinājums`. Pastiprinājums ir 0,35, kad ir par lēni, un 0,08, kad ir rezerve. Tas ierobežots līdz koeficientam 0,5–1,25 katrā kadrā un līdz 65 536–268 435 456 spraitiem.

**Otrais posms — izšķirtspēja.** Tikai tad, kad budžets jau ir zemākajā robežā un kadri joprojām ir vairāk nekā 10% par lēniem, siltuma bufera izšķirtspēja krīt par 8% katrā kadrā, līdz 25% no audekla. Tā atgūstas par 4% katrā kadrā, kamēr ir 30% rezerves. Fragmenta izmaksas krīt ar izšķirtspējas kvadrātu, kas zem gluda gradienta ir gandrīz neredzams. (Izmērīts programmatūras renderēšanā ar 10M rindām un pārmērīgiem spraitiem: 141 ms → 17 ms kadrā.) Mērogs ir noapaļots līdz sešpadsmitdaļām; pārklājuma *Siltuma izš.* to rāda.

**Padošanās.** Lēns kadrs izskatās vienādi neatkarīgi no tā, vai to izraisīja spraiti vai smags līmenis — par katru zīmēšanas posmu laika nav. Ja budžets atrodas zemākajā robežā un kadri 30 kadru garumā paliek zem 70% no mērķa, spraiti nebija izmaksa: kontrolieris pāriet uz **kāpšanu**. Tas reizina budžetu ar 1,5 ik pēc 14 kadriem un atjauno izšķirtspēju, kamēr kadra laiks paliek 1,5 reizes robežās no tā, kāds tas bija zemākajā robežā. Kāpiens, kas padara lietas sliktākas par to, atgriežas uz 60% un atsāk parasto vadību. Mērķa sasniegšana beidz kāpienu.

Ar izslēgtu adaptīvo budžetu budžets ir vienkārši **Spraiti / kadrs**.

Ar ieslēgtu *Zīmēt katru rindu katrā kadrā* adaptīvais budžets joprojām darbojas, bet precīzais noteikums paaugstina budžetu, lai sedz visas kandidātu rindas. Tāpēc praksē tas vada tikai izšķirtspējas posmu un kadrus, kas nesāk jaunu aplēsi.

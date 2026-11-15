---
title: "GPU atmiņas saturs"
parent: "Renderēšanas iekšējā uzbūve"
nav_order: 5
lang: "lv"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# GPU atmiņas saturs

Grafikas kartei ir ierobežota atmiņa. Ja jūsu dati neietilpst, skatītājs parāda to, kas ietilpst, un to pasaka: statistikas pārklājumā parādās dzeltena rinda **Nav atmiņā** ar to rindu skaitu, kas izlaista. Analīzes rīks nekad nedrīkst parādīt saīsinātu datu kopu kā pilnīgu, tāpēc šī rinda nekad netiek paslēpta.

![Statistikas pārklājums ar dzeltenu rindu Nav atmiņā](../assets/img/en/gpu-memory-not-resident.webp)

Lai ietilpinātu vairāk, palieliniet GPU budžetu sadaļā **Resursu budžeti** un ielādējiet vēlreiz ([Atmiņa un budžeti](memory-and-budgets.md#raising-the-gpu-budget)), vispirms sašaurinot datus, vai izmantojiet karti ar vairāk atmiņas.

## Izstrādātājiem {#for-developers}

### Kā rindas tiek glabātas GPU {#how-rows-are-stored-on-the-gpu}

Rindas tiek augšupielādētas vienreiz, kad ierodas datu kopa, **gabalos** pa 8 388 608 rindām (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Katrs gabals tiek kvantēts pret savu ierobežojošo kasti un laika posmu:

| Dati | Formāts | Baiti katrā rindā |
|---|---|---|
| Pozīcija X, Y, Z un grupas id | četri 16 bitu veseli skaitļi bez zīmes (RGBA16UI uz WebGL2); X, Y, Z gabala ierobežojošajā kastē | 8 |
| Laiks un dzīvilgums (kad datu kopai ir gan laiks, gan persona) | divi 16 bitu veseli skaitļi bez zīmes (RG16UI): laiks gabala laika posmā; dzīvilgums, kur 65 535 nozīmē "nav nākamā paraugs" | 4 |

Gabalu ierobežojošās kastes ir tas, kas padara 16 bitus pietiekamus. Gabals parasti aptver daļu no kartes, tāpēc kvantēšanas solis ir krietni mazāks par centimetru kartē, kas ir kilometrus plata, — daudz zem reālās telemetrijas trokšņa. Grupas id, kas atrodas ceturtajā kanālā, nemaksā neko, un tāpēc var būt ne vairāk kā 4096 grupas ([Grupas](sessions-persons-groups.md#limits)).

Uz WebGL2 katrs gabals ir tekstūra 8192 texeļu platumā, izlīdzināta līdz veseliem tekstūras rindām. Rindas sasniedz no `gl_VertexID` caur katra kadra bloku indeksa tekstūru. Uz WebGPU tās ir krātuves buferi.

Papildu katras rindas GPU atmiņa, kas tiek piešķirta lietojot:

- katrs aktīvs kolonnas [filtrs](filters.md): 4 baiti katrā rindā (32 bitu peldošā komata vērtības vai kategoriju id), augšupielādēts katram gabalam, kad filtrs pirmo reizi tiek izmantots;
- [līniju siltums](line-heat.md): 8 baiti katrā rindā (katra segmenta sākums, kvantēts datu ierobežojošajā kastē, un tā karogi), kamēr ieslēgts līniju režīms.

Kā arī renderēšanas mērķi: ainas krāsa un dziļums, siltuma mērķis un tā palīgdvīnis (četri kanāli [Komandu siltumā](team-heat.md)), un dziļuma noņemšanas slāņi [aizsegšanai](depth-and-culling.md); kā arī līmeņa ģeometrija.

### Budžets tiek ieviests augšupielādē {#the-budget-is-enforced-at-upload}

WebGL pieņem piešķīrumus, ko tas nevar apkalpot. Pēc tam tas vai nu zaudē kontekstu, vai pāriet uz sistēmas atmiņu par postošām izmaksām. Tāpēc GPU budžets tiek ieviests, kad datu kopa tiek augšupielādēta ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- gabali tiek augšupielādēti secīgi (tas ir, laika secībā), kamēr tie ietilpst;
- pirmais gabals, kas neietilpst, tiek augšupielādēts **daļēji**, cik daudz veselu tekstūras rindu ietilpst atlikušajā budžetā, nevis neiet vispār. Tātad budžets, kas nevar aptvert veselu gabalu, joprojām parāda tik, cik var. Tā kā rindas ir laika kārtotas, redzamā daļa ir saskaņots laika posms;
- viss pēc tam ir **nav atmiņā**.

Trūkums netiek slēpts: statistikas pārklājums rāda dzeltenu rindu **Nav atmiņā** ar to rindu skaitu, kas neietilpa, ja vien tas ir lielāks par nulli. Saīsināta datu kopa, kas izskatās pilnīga, ir vissliktākā kļūme, ko analīzes rīks var radīt. [Ietilpības pārbaude](memory-and-budgets.md#the-fit-check) pirms ielādes ir paredzēta, lai novērstu šo gadījumu.

Budžets, ko izmanto renderētājs, ir GPU budžets no **Resursu budžeti**, tas pats skaitlis, ko izmanto ietilpības pārbaude. Tas ir arī virs noteiktā skaitļa, līdz slīdņa augšējai robežai (skatiet [Palielinot GPU budžetu](memory-and-budgets.md#raising-the-gpu-budget)). Tas tiek piemērots, kad datu kopa tiek augšupielādēta. Ja to mainīt pēc tam, izmaiņa stāsies spēkā nākamajā ielādē.

---
title: "Starpība"
parent: "Siltuma režīmi"
nav_order: 5
lang: "lv"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: true
---

# Starpība

Sarkans, kur komanda A bija vairāk, zilganzaļš, kur bija vairāk komandai B, nekas tur, kur abas bija vienādi.

**Starpība** (taustiņš 2) ir parakstīts siltums. Vienas populācijas rindas pieskaita siltumu; citas populācijas rindas to atņem. Kur abas pārklājas vienmērīgi, rezultāts ir nulle un pilnīgi caurspīdīgs; kur viena dominē, tas parādās tās puses krāsās - pēc noklusējuma silti (caurspīdīgs → sarkans → dzeltens → balts) **+** pusei un vēsi (caurspīdīgs → zaļš → zils → violets) **−** pusei.

![Starpības siltums: sarkans, kur + puse bija vairāk, zaļš un zils, kur - puse bija vairāk](../assets/img/lv/difference-split.webp)

## Kā to lietot {#how-to-use-it}

1. Nospiediet `2` (vai izvēlieties **Starpība** režīmu joslā).
2. Sānjoslā atveriet **Starpības sadalījums**.
3. Izvēlieties, ko **Sadalīt pēc**: parasti *Grupas*.
4. Vienu grupu (vai vērtību) ieliekiet **+**, citu - **−**.
5. Nolasiet krāsas: silts nozīmē + pusi, vēss - − pusi. Panelis brīdina, ja vienai pusei nav rindu (skatiet [Ziņojumi, ko var redzēt](#messages-you-may-see)).

*Kuras* divas populācijas ir viss jautājums, tāpēc sadalījums var būt jebkura saglabāta kolonna, ne tikai grupas. Rindas, kas nonāk **nevienā** no pusēm, tiek **atstātas ārpusē**, nevis skaitītas kā nulle: tieši tāpēc sadalījums pār divām no daudzām vērtībām salīdzina tieši šīs divas, un tas sadarbojas ar [filtriem](filters.md) - filtrējiet līdz vienai kartei, tad sadaliet to pēc versijas.

Režīmam vajag divas puses: grupu kolonnu ar vismaz divām grupām vai sadalījumu pa kolonnu, kas saglabāta filtrēšanai. Datos ar mazāk nekā divām grupām ielāde sāk ar kolonnas sadalījumu - vispirms *Avota fails* kolonnu no vairāku failu ielādes, citādi pirmo kategoriju kolonnu ar divām vērtībām, citādi pirmo skaitlisko kolonnu ar diapazonu - tāpēc *salīdzināt divas ielādes* strādā arī datos bez grupām. Režīms paliek nepieejams tikai datiem, kuros nav nevienas no šīm iespējām; tāpat tad, ja kolonnas sadalījumā vienai pusei nav nekā.

## Panelis Starpības sadalījums {#the-difference-split-panel}

Rādīts starpības režīmā, zem siltuma paneļiem.

**Sadalīt pēc** piedāvā:

| Iespēja | Rādīts kā | Sadalīšanas noteikums |
|---|---|---|
| Grupas | *Grupa (N)* (ja ir grupu kolonna) | Katra grupa +, − vai nevienā, iestatīts [Komandu sarakstā](teams-list.md) |
| Kategoriju kolonna | *kolonna (N vērtības)* | Vērtības +, − vai nevienā |
| Skaitliska kolonna | *kolonna (skaitliska)* | Vērtību diapazons katrai pusei |
| Avota fails | *Avota fails - salīdzināt divas ielādes* (ja ielādēti vairāki faili) | Faili +, − vai nevienā |

Piedāvātas tikai kolonnas, kas ielādes laikā saglabātas sadaļā *Saglabāt filtrēšanai*.

### Salīdzināt daļas, nevis skaitu {#compare-shares-not-counts}

**Salīdzināt daļas, nevis skaitu** (noklusējums izslēgts) katru pusi sver ar vienu, dalītu ar tās pašas rindu skaitu, tāpēc puse ar piecreiz vairāk rindām neuzvar tikai ar skaitu. Krāsa tad rāda, kur katra puse ir proporcionāli biežāka nekā otra. Lietojiet to, ja abām pusēm ir ļoti atšķirīgs datu apjoms, piemēram, divas sesijas ar atšķirīgu garumu.

### Ziņojumi, ko var redzēt {#messages-you-may-see}

Panelis brīdina, ja attēls nav īsta starpība:

| Ziņojums | Nozīme |
|---|---|
| *N + / M −* (vai *N + / M − / K nelietotas*) | Cik vērtību ir katrā pusē (un nevienā). |
| Logā nav neviena rinda + pusē | Tiek zīmēta tikai − puse. Pārvietojiet laika skalas logu vai mainiet sadalījumu. |
| Logā nav neviena rinda − pusē | Tiek zīmēta tikai + puse. |
| Neviena vērtība nav nevienā pusē | Starpība nezīmē neko. Ieliekiet vismaz vienu vērtību **+** vai **−**. |
| *kolonna* nevar tikt sadalīta šādi | Izvēlētā kolonna neatbilst sadalījumam. Izvēlieties kolonnu vēlreiz. |
| Sadalījuma kolonna neietilpa GPU atmiņā N no M daļām | Šīs rindas netiek zīmētas. Palieliniet GPU budžetu sadaļā Veiktspēja → Resursu budžeti vai ielādējiet mazāk rindu. |

### Pēc grupas {#by-group}

Panelis tikai norāda uz [Komandu sarakstu](teams-list.md), kur katrai grupai ir poga **+** un **−**. Katrā ielādē pirmā grupu puse (noapaļota uz augšu) tiek ieliekta +, pārējās - −; **Sadalīt vienmērīgi** Komandu sarakstā dara to pašu vēlreiz. Grupa, kas nav nevienā pusē, vai kas paslēpta ar savu izvēles rūtiņu, nedod nekā.

### Pēc kategoriju vērtībām {#by-category-values}

| Daļa | Nozīme |
|---|---|
| `a + / b − / c nelietotas` | Cik vērtību ir katrā pusē un nevienā. |
| **Notīrīt** | Ieliek katru vērtību nevienā pusē. |
| Vērtību saraksts | Katra vērtība ar pogu **+** un **−** (aktīvo pogu vēlreiz nospiežot, to noņem no puses). Tukša vērtība tiek uzskaitīta kā *(trūkst)*. |
| Ierobežojuma piezīme | Uzskaitītas tikai pirmās 200 vērtības: *Rāda pirmās 200 no N vērtībām. Tik platu kolonnu labāk vispirms sašaurināt ar filtru vai sadalīt pēc diapazona, ja tās vērtības ir sakārtotas.* |

Izvēloties kolonnu, tās pirmā vērtība tiek ieliekta +, otrā - −. Ja nevienai pusei nav nevienas vērtības, sadalījums atgriežas pie grupām, nevis rāda tukšu kadru. *Avota fails* darbojas tāpat, pa vienai vērtībai failam - tā salīdzina divus eksportus, divus testu braucienus vai divas versijas.

### Pēc diapazona {#by-range}

| Daļa | Nozīme |
|---|---|
| Norāde | Kolonnas minimums un maksimums. |
| **Pozitīvais diapazons (+)**, **no** / **līdz** | Rindas ar vērtību šajā diapazonā, ieskaitot abas galapunktus, pieskaita. |
| **Negatīvais diapazons (−)**, **no** / **līdz** | Rindas šajā diapazonā atņem. |
| **Sadalīt viduspunktā** | Iestata + uz [minimums, vidus] un − uz [vidus, maksimums] - tāpat dara arī kolonnas izvēle. |

Vērtība abos diapazonos tiek skaitīta kā +. Diapazoniem nav jāaptver visa kolonna; vērtības ārpus abiem paliek ārpusē. *Pirmās divas minūtes pret pēdējām divām* ir diapazona sadalījums pa laikam līdzīgu kolonnu.

## Krāsas {#colours}

Sadaļa **Siltuma krāsas** šajā režīmā rāda divus skalu redaktorus: **Pozitīvā (pieskaitošās komandas)** un **Negatīvā (atņemošās komandas)**, katram sava atiestatīšanas poga (*Atiestatīt uz caurspīdīgs → sarkans → dzeltens → balts*, *Atiestatīt uz caurspīdīgs → zaļš → zils → violets*). Kompozīcija ņem neto siltuma absolūto vērtību caur [piesātinājuma punktu un reakciju](colour-and-exposure.md) un izvēlas negatīvo skalu tur, kur neto vērtība ir zem nulles. Skatiet [Krāsa un ekspozīcija](colour-and-exposure.md#the-ramp-editor).

Lietojiet *Lineāro* reakciju uz blīvumu, kad svarīgs ir starpības lielums: tā ir vienīgā reakcija, kur vienāda krāsa nozīmē vienādu skaitu.

## Kā tas darbojas {#how-it-works}

Katrai rindai virsotņu ēnotājā tiek piešķirta zīme +1, -1 vai 0 ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); 0 noraida rindu, pirms tiek zīmēts kaut viens fragments.

- Pēc grupas zīme nāk no 4096 ierakstu grupu tabulas, indeksēta pēc rindas grupas id (grupas id atrodas pozīcijas tekseļa ceturtajā kanālā).
- Pēc kategorijas zīme nāk no otras 4096 ierakstu tabulas, kas aizpildīta katrai kategorijas vērtībai, un rindas vērtība tiek nolasīta no kolonnas filtra tekseļa; vērtība aiz tabulas beigām tiek noraidīta abos backend.
- Pēc diapazona rindas vērtība tiek salīdzināta ar abiem diapazoniem.

Sadalījuma maiņa restartē uzkrāšanu.

**Paslēptās grupas paliek paslēptas pie katra sadalījuma.** Sadalījumā pēc kolonnas grupu tabulā vairs nav zīmju; tajā ir 1 redzamai grupai un 0 paslēptai ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), un abas tabulas shader nonāk kopā - divas rindas vienā zīmju tekselī WebGL2 un divas puses vienā glabāšanas buferī WebGPU. Rinda tiek zīmēta tikai tad, ja tās grupa ir redzama *un* tās kolonnas vērtība atrodas kādā pusē. Tātad grupa, kas noņemta atzīmi [Komandu sarakstā](teams-list.md) vai izslēgta ar Mača cilnes puses fokusu, nedod nekā neatkarīgi no tā, kā starpība ir sadalīta.

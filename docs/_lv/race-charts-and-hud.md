---
title: "Diagrammas un HUD"
parent: "Sacīkšu analīze"
nav_order: 53
lang: "lv"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Diagrammas un HUD

Diagrammas izlīdzina jūsu apļus metru pa metram, lai jūs varētu redzēt, kur kāds vadītājs bremzēja vēlāk vai atlaida gāzi agrāk. Kartīnes skata augšējā kreisajā stūrī rāda, ko katrs auto un vadītājs dara tieši tagad.

![Diagrammas zem skata: divu apļu rindas ar atstatumu, ātrumu, gāzi, bremzi un stūri, laika un cēloņu joslas augšā un kursors ar kartītēm](../assets/img/en/race-charts-rows.webp)

## Diagrammas {#the-charts}

Katrs aplis ir vienā attāluma asī — metri pa atsauces trajektoriju (skatīt [vienu attāluma asi](race-corner-analysis.md#one-distance-axis)). Tādēļ tas pats x ir tā pati vieta trasē katram aplim. Viens aplis tiek rādīts atsevišķi (un tiek atskaņots); otrs apļis tajā pašā trasē tiek rādīts salīdzinājumā ar to. Ja nav ielādēts neviens aplis (vai analīze neizdevās), apgabalā rakstīts: "Diagrammas parādās, kad ir ielādēts aplis; ielādējiet citu tās pašas trases apli, lai salīdzinātu abus."

### Kas tajās ir {#what-is-on-them}

- **Leģenda**: katra attēlotā apļa krāsa un nosaukums, atsauce atzīmēta kā "(atsauce)"; "+N vēl rādīts, nav diagrammā", ja redzami vairāk apļu, nekā diagrammā; **Grafiki (N) ▾**; **Viss aplis**, kad tuvināts; viena rindiņa ar padomu.
- **Divas joslas** augšā fokusētajam aplim:
  - *laiks*: [laika karte](race-replay-and-scene.md#time-map-where) kā josla, sarkana — zaudē, zaļa — iegūst;
  - *cēlonis*: katrs tā zaudējums kā stienis virs vietas, kur ir tā cēlonis, cēloņa krāsā; uzvedot stieni, redzams tā nosaukums un izmaksas.
- **Līkumu joslas**: ēnota josla no katra līkuma ieejas līdz izejai (kā atrasts atsaucē) un tā nosaukums (`T1` …) zem ass virsotnes vietā.
- **Izvēlētais atradums**: josla tā cēloņa krāsā pāri tā diapazonam.
- **Rindas** (grafiki), pa vienai katram izvēlētajam kanālam, katrai ar nosaukumu un diapazona augšu un apakšu pa kreisi; nulles līnija, kur diapazons šķērso nulli. Katrs aplis ir līnija savā krāsā: fokusētais aplis 2 px platumā un necaurspīdīgs, atsauce — necaurspīdīga, pārējie — 1,5 px pie 75%. Atstatuma rindā atsauce nav iekļauta (tai atstatums pret sevi ir nulle).
- **Kursors**: vertikāla līnija tur, kur ir atsauces auto (vai kur ir rādītājs), un punkts katram auto katrā rindā, izņemot atstatumu — pie kursora visi auto ir vienā metrā; citādi katra auto pašreizējais attālums atskaņošanas pulksnī.

Ne vairāk kā **8** apļi tiek attēloti: fokusētais aplis, tā klases labākais un atsauce pirmie, tad pārējie ielādes secībā.

### Rindas un to augstums {#rows-and-their-heights}

Rindas dala diagrammas augstumu pēc svara, neviena nav zemāka par 16 px:

| Rinda | Svars |
|---|---|
| Atstatums (līdz atsaucei, sekundes, ar zīmi) | 1,7 |
| Ātrums (km/h) | 1,7 |
| pedālis (gāze, bremze, sajūgs) | 1 |
| stūre | 1,1 |
| pārnesums | 0,8 |
| lampiņa (rokas bremze, ABS …) | 0,55 |
| viss pārējais | 1 |

Kanālam ar fiksētu attēlošanas diapazonu tabulā (pedāļi 0–100%) izmanto to; citiem diapazonu pielāgo redzamajam apļu posmam. Ja rindas nosaukums neietilpst vietā (garš vārds citā valodā), augšējā vērtība pārvietojas uz leju par vienu rindu, kur rinda ir pietiekami augsta, un citādi nosaukums tiek apgriezts ar daudzpunktēm; pilnais nosaukums ir rīka padoms.

### Noklusējuma grafiki {#the-default-graphs}

Kamēr grafiki nav izvēlēti, rāda **atstatumu**, tad katru kanālu, ko tabulā atzīmēts `graph` un ko apļi satur: gāze, bremze, sajūgs, rokas bremze, stūre, pārnesums, ātrums. Pedāļa vai lampiņas kanālu izlaiž, ja neviens aplis to nepārvieto par 0,02 (sajūgs, kas nekad netiek nospiests, nav grafiks). Secība ir tabulas secība.

### Grafiku izvēlnis {#the-graph-picker}

**Grafiki (N) ▾** atver paneli virs pogas:

- filtra lodziņš (atbilst kanāla nosaukumam vai id);
- **Noklusējumi** (atgriež noklusējuma kopu; rīka padoms rāda, cik to ir) un **Aizvērt**;
- *Atstatums līdz atsaucei*, tad katrs kanāls, ko attēlotie apļi satur, grupēts (kustība, vadība, motors, palīglīdzekļi, riepas, bremzes, balstiekārta, riteņi, cits, laiks, pozīcija), katrs ar izvēles rūtiņu; kanāls katram riteņam ir viena rinda ar mikroshēmu katram riteni (FL, FR, RL, RR).

Atzīmējot, saglabājas tabulas secība neatkarīgi no tā, kādā secībā atzīmējat. Izvēle paliek spēkā, līdz nospiež **Noklusējumi** vai pārlādē lapu. Kanāli, kurus tabula nepazīst, tiek piedāvāti grupā *cits*, un to nosaukums tiek veidots no to pašu id ("brakeLinePress" → "Brake line press").

### Uzvedne, ritenītis, tuvināšana, klikšķis {#hover-wheel-zoom-click}

| Ievade | Dara |
|---|---|
| uzvedot | katrs auto, tā kartīte un tā ievades pārvietojas uz šo metru; stabiņš atzīmē to trasē; tabulā ir katra attēlotā apļa vērtība katrā rindā tajā vietā (atstatums atsaucei rādīts kā "ref"); virs kartītēm — "pie N m — diagrammu kursors". Ja pārvieto ārpus diagrammas laukuma, atkal rāda atskaņošanu |
| ritenītis | pārvieto atskaņošanu pa apli par 1/200 no redzamā posma vienā soļā (Shift: 5×), apturot atskaņošanu; tuvinātā skatā skats seko kursoram |
| Ctrl+ritenītis (Cmd+ritenītis) | tuvina attāluma asi ap rādītāju, 1,25× uz āru / 0,8× uz iekšu vienā soļā, nekad šaurāk par 40 m; tuvināšana līdz visam aplim beidz tuvinājumu |
| sānu ritenītis | pārvieto skatu, kad tuvināts (10% no posma uz 100 vienībām ritināšanas) |
| divkāršs klikšķis, **Viss aplis** | tālina |
| klikšķis | pārlec atskaņošanā uz vietu, kur atsauces auto sasniedz šo metru |
| Shift+klikšķis | tajā vietā izlīdzina auto (skatīt [izlīdzināšanu](race-replay-and-scene.md#lining-up)) |

Diagrammas pārzīmējas tekošajā valodā, kad tā mainās.

Padomu rindiņa leģendā saka to pašu īsi: "Uzvedne: visi auto tur · ritenītis: soļi pa apli · Ctrl+ritenītis: tuvināt · klikšķis: pārlēkt · Shift+klikšķis: izlīdzināt".

## Auto kartītes (HUD) {#the-car-cards-hud}

Skata augšējā kreisajā stūrī — kartīte katram redzamajam aplim, ne vairāk kā **6**, pirmie sešie redzamie apļi ielādes secībā, tam brīdim, uz kuru pašlaik norādīta atskatīšana (vai diagrammu kursors).

**Galvene:** apļa krāsa un nosaukums; tiešraides atstatums — šā apļa laiks, lai sasniegtu tā pašreizējo attālumu, mīnus atsauces laiks, lai sasniegtu to pašu attālumu, "+0,48 s" — vai "atsauce"; **⋯**, lai parādītu vai paslēptu visas pārējās vērtības (tas pats, kas *Visas vērtības kartītēs*). Vijā auto kartīte ir izcelta.

**Auto no augšas:** virsbūves kontūra apļa krāsā ar bultiņu priekšā, četras riepas (priekšējās pagrieztas līdz 28° ar stūri), katra krāsota pēc temperatūras, ar tiem pašiem simboliem, kas 3D auto zīmēti plakani: slīdes gredzens, balstiekārtas josla, bremžu kvēle, nodiluma josla, slodzes josla.

**Rādījumi:** ātrums km/h, paša apļa laiks, tā attālums pa atsauci.

**Vadība:**

- stūre, ko pagriež stūres ievade (pilns pagrieziens attēlots kā 180°), ar procentiem zem tās;
- josla katram pedālim, no kreisās uz labo kā pedāļu blokā — sajūgs, bremze, gāze — katra ar procentiem un īso nosaukumu savā krāsā (tikai tie pedāļi, ko aplis satur);
- pārnesums (R — atpakaļgaita, N — neitrāle);
- neliela lampiņa katram ieslēgtā/izslēgtā kanālam, ko aplis satur — rokas bremze, ABS, TC, DRS, boksa ierobežotājs, gaisā — iedegas savā krāsā, kamēr ir ieslēgta (virs puse no diapazona);
- rādījums katram līmeņa kanālam: bremžu sadalījums, ABS un TC iestatījumi, pūtējs, degviela.

**Vadības līnija:** pēdējās **6 sekundes** no katra pedāļa (viena josla, katrs savā krāsā) un stūres (sava josla, centrēta), beidzoties šajā brīdī — ko vadītājs darīja, ieejot tajā. Līdz 160 punktiem.

**Visas vērtības** (⋯ vai *Visas vērtības kartītēs*): katrs cits skalārs lielums, ko aplis satur šajā brīdī, tad katrs riteņa kanāls kā četras vērtības (FL FR RL RR), nosaukti pēc kanālu tabulas vai paša kanāla nosaukuma, sakārtoti pēc grupas.

## Izstrādātājiem {#for-developers}

Kods: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Kanālu tabula {#the-channel-table}

`CHANNELS` in [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) ir vienīgā vieta, kur kanāls tiek aprakstīts: tā mērvienība; vai tas ir viena vērtība katrā paraugā vai viena katram riteni (saglabāts kā `name.FL` …); tā grupa; attēlošanas diapazons; kā tas zīmēts uz auto (`glyph`); kā tas parādās kartītē (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`); vai tas ir noklusējuma grafiks; vai tas soļo, nevis saplūst (pārnesums, karodziņi); un kā tas tiek rādīts (mērogs, vienība, cipari). Nosaukumi un īsie nosaukumi ir ziņojumi katrā valodā (`race.channel.<name>.label` / `.short`).

Kanāli ar zīmējumu vai noklusējuma grafiku:

| Kanāls | Mērvienība | Zīmēts kā | Noklusējuma grafiks |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedālis (zaļš, sarkans, …), rādīts %. | jā |
| `handbrake` | 0..1 | lampiņa | jā |
| `steer` | -1..1, pozitīvs pa labi | stūres rats | jā |
| `gear` | - | pārnesums | jā |
| `speed` | m/s, rādīts km/h | - | jā |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lampiņa | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | līmeņa rādījums | - |
| `tireTemp` (katram riteni) | °C, rādīts 40–130 | riepas krāsa | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (katram riteni) | kā to mērogo spēle, rādīts ±1,5 | slīdes gredzens | - |
| `combinedSlip`, `slipIndex` (katram riteni) | rādīts 0–1,5, 0–1 | slīdes gredzens | - |
| `suspension` (katram riteni) | 0..1 | balstiekārtas josla | - |
| `brakeTemp` (katram riteni) | °C, rādīts 100–900 | bremžu kvēle | - |
| `tireWear` (katram riteni) | 0..1 | nodiluma josla | - |
| `wheelLoad` (katram riteni) | N, rādīts 0–12 000 | slodzes josla | - |

Citi tabulas kanāli (zīmēti grafikā un uzskaitīti, bet ne zīmēti uz auto): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (slīdes leņķis), `loose`, `lateral` (novirze no atsauces), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, kā arī `time`, `distance`, `x`, `y`, `z`.

**Kanāls, kas nav tabulā,** tiek tik un tā nolasīts, attēlots grafikā (grupā *cits*) un uzskaitīts kartītēs, un tā nosaukums nāk no paša id. **Lai tam piešķirtu pareizu nosaukumu, mērvienību un zīmējumu,** pievienojiet vienu ierakstu tabulā (un tā nosaukuma ziņojumu katrā `src/i18n/locales/<valoda>/race-channels.json`). Jauns riteņa zīmējuma *veids* ir viens ieraksts `WHEEL_GLYPHS` (glyph.ts) un tā plakanais dublikāts `CARD_GLYPHS` (RaceHud.tsx); abi ir tipizēti pēc veida, tāpēc būve neizdosies, kamēr abi nepastāv. `src/race/extensible.test.ts` pārbauda, ka nezināmi kanāli nonāk grafikos, ka katru tabulas simbolu var uzzīmēt un ka lampiņas iedegas.

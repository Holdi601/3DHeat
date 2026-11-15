---
title: "Sacīkšu analīze"
nav_order: 11
has_children: true
lang: "lv"
source: "race-analysis.md"
source_hash: "ab0531fa7bbd"
translated: true
outdated: false
---

# Sacīkšu analīze

Jūs braucāt pa to pašu trasi divreiz. Cilne **Sacīkšu analīze** atskaņo abus braucienus kopā 3D, rāda, kur viens aplis bija lēnāks, un pasaka, kāpēc. Vēl nav apļu? Nospiediet **Demo apļi**.

![Sacīkšu analīzes cilne ar demo apļiem: sānjosla ar Apļi un Kur uzlaboties, auto trasē, diagrammas zem skata](../assets/img/lv/race-analysis-overview.webp)

Cilne salīdzina divus vai vairākus vienas trases apļus. Tā dala audekls, kamera un ielādētais trases modelis (**Fons / līmenis**) ar siltumkarti; viss pārējais ir savs: sava sānjosla un sava josla zem skata. Vārdi *aplis*, *atsauce* un *virsotne* ir [glosārijā](glossary.md).

Šī lapa ir cilnes karte. Katrai daļai ir sava lapa:

| Lapa | Ko tā aptver |
|---|---|
| [Apļu ielāde](race-loading-laps.md) | visi failu formāti, mapes un trases, auto nosaukumi, demo apļi, apļu saraksts, atsauce un fokuss |
| [Atkārtojums un 3D aina](race-replay-and-scene.md) | transporta josla, trīs atkārtojuma režīmi, auto izlīdzināšana, sekošanas kamera, līnijas, kartes, auto, etiķetes, spoguļtrases |
| [Diagrammas un HUD](race-charts-and-hud.md) | attāluma diagrammas, grafiku izvēlnis, uzvedne un tuvināšana, auto kartītes, kanālu tabula |
| [Automašīnas vadības notikumi](race-control-events.md) | bloķēšanās, riteņu slīdēšana, pārmērīga griešanās, apgāšanās, nepietiekama griešanās, trāpījumi, avārijas, ABS/TC, rokas bremze, gaiss — kā katrs tiek atpazīts, ar katru slieksni |
| [Līkumu pa līkumam analīze](race-corner-analysis.md) | saskaņošana pēc attāluma, līkumi un segmenti, laika uzskaite katram līkumam, katrs cēlonis un secība, kādā tie tiek pārbaudīti, līnijas forma un padoms |
| [Automašīnu profili un salīdzinājums](race-car-profiles.md) | ko katra auto spēj, izmērīts no tā apļiem; *Auto salīdzinājums*; ko auto izlemj katrā līkumā |
| [Trases statistika](race-course-statistics.md) | daudzi vienas trases apļi: kļūdas pa līkumiem un pa veidiem, kļūdu karte, siltumkartes eksports, veiktspējas ierobežojumi |
| [Sacīkšu analītika: metode](race-analytics.md) | pētījums aiz noteikumiem, ar avotiem |
| [Citas sacīkšu spēles](other-games.md) | ko skatītājs dara ar apļiem no katras spēles: slīdes un drifts, kas aprēķināti tur, kur spēle tos nenosūta, spoguļtrases, papildu kanāli |

## Ekrāns {#the-screen}

**Sānjosla**, no augšas uz leju (sadaļas var salocīt):

1. **Apļi** — ielāde, saraksts, rādīt/paslēpt, atsauce, fokuss, sekošana.
   Skatiet [Apļu ielāde](race-loading-laps.md).
2. **Trases statistika** — tikai no trim ielādētiem apļiem.
   Skatiet [Trases statistika](race-course-statistics.md).
3. **Kur uzlaboties** — fokusētā apļa atradumi, līkums pa līkumam.
   Skatiet [Līkumu pa līkumam analīze](race-corner-analysis.md).
4. **Līkums pa līkumam** (vai *Līkums pa līkumam - klase X* ar vairākām klasēm) — ātrākais aplis katrā līkumā un tā līnija. Rāda ar diviem vai vairākiem apļiem.
5. **Auto vadība** — fokusētā apļa bloķēšanās, slīdes, spiešana un trāpījumi.
   Skatiet [Automašīnas vadības notikumi](race-control-events.md).
6. **Auto salīdzinājums** (vai **Auto** ar vienu auto) — skatiet [Automašīnu profili un salīdzinājums](race-car-profiles.md).
7. **Skats** — kura karte tiek uzkrāsota uz trases un kas tiek zīmēts.
   Skatiet [Atkārtojums un 3D aina](race-replay-and-scene.md).
8. Kopīgie paneļi **Līmenis** un **Kamera un aina** (trases modelis, ass apgriešana, kamera) — dokumentēti kopā ar siltumkarti un [Kamera](camera.md).

**Skats** rāda trasi, braukto līniju, karti, auto, etiķetes, kas piespraustas trasei, un ne vairāk kā sešas auto kartītes augšējā kreisajā stūrī (skatiet [Diagrammas un HUD](race-charts-and-hud.md)). Ja nav ielādētu apļu, tur rakstīts: "Nav ielādētu apļu — ievelciet šeit divus vai vairākus apļu failus vai ielādējiet demo apļus no sānjoslas."

**Josla zem skata** satur atkārtojuma transportu un, ja nav paslēpta, attāluma diagrammas.

## Ātrs sākums {#quick-start}

1. Atveriet cilni **Sacīkšu analīze** (blakus **Siltumkarte** sānjoslas augšdaļā).
2. Ievelciet apļus. Nospiediet **Demo apļi**, lai redzētu, ko cilne dara ar trim izdomātiem apļiem. Saviem apļiem vispirms tos ierakstiet ([failu formāti un ieraksturi](race-loading-laps.md#file-formats)), tad nospiediet **Ielādēt apļu failus…** vai **Mape…**, vai ievelciet failus vai mapes uz skata.
3. Ātrākais pilnais aplis kļūst par atsauci; lēnākais cits aplis tiek fokusēts. Noklikšķiniet uz jebkura apļa sarakstā, lai to fokusētu; ★ padara apli par atsauci.
4. Izlasiet **Kur uzlaboties**. Noklikšķiniet uz atradumu: auto tiek izlīdzināti 40 m pirms tā, kamera to ietver, atkārtojums iet cauri tam un atveras mērījumi.
5. Uzvediet virs diagrammām, lai pārvietotu katru auto uz to metru; Shift+klikšķis, lai tos tur izlīdzinātu.

## Taustiņi {#keyboard}

Kamēr cilne Sacīkšu analīze ir atvērta:

| Taustiņš | Dara |
|---|---|
| **K** | atskaņot / pauzēt atkārtojumu |
| **Home** | atpakaļ uz atkārtojuma sākumu |
| ciparu taustiņi | nekas (siltumkartē tie pārslēdz režīmus) |

Taustiņi, kas ierakstīti teksta laukā vai nolaižamajā sarakstā, tiek ignorēti. Kameras taustiņi darbojas kā siltumkartē (**W A S D**, **Atstarpe** — augšup, **Q** — lejup, **Shift** — ātrāk, **Alt** — lēnāk, pele — skatīšanai; viss [Kamerā](camera.md)); **F** ietver ielādētos apļus kadrā (tāpat kā ielādējot apļus).

## Daudzi apļi {#many-laps}

- Visi ielādētie apļi tiek analizēti un saskaitīti; desmiti aizņem sekundi vai divas.
- Pēc **8** apļiem (`SHOW_ALL_UP_TO`) pievienotie apļi tiek zīmēti tikai tad, ja tie ir atsauce, fokusētais aplis vai labākais aplis fokusētā apļa klasē. *Rādīt visus* / *Tikai aplūkotos* pārslēdz.
- Pēc **10** redzamiem auto (`PLAIN_PAST`) apļi, kurus neaplūko (ne fokuss, ne vajātais auto, ne atsauce), tiek zīmēti ar līnijām, kas retinātas līdz punktam ik 6 m, nevis ik 1,5 m, un auto — vienkārši.
- Diagrammās zīmē ne vairāk kā **8** apļus; HUD rāda ne vairāk kā **6** kartītes.
- Trases statistika parādās no **3** apļiem.

Sīkāk: [Trases statistika](race-course-statistics.md#performance-with-many-laps).

## Noklusējuma skata iestatījumi {#default-view-settings}

| Iestatījums | Noklusējums |
|---|---|
| Karte | Laika karte |
| Braukšanas līnijas, Auto, Riepas un balstiekārta, Etiķetes, Trase no apļiem | ieslēgts |
| Visas vērtības kartītēs | izslēgts |
| Auto izmērs | 1× |
| Diagrammas | rādītas |
| Atkārtojuma režīms | No līnijas |
| Atkārtojuma ātrums | 1× |
| Cilpa | ieslēgta |

Neviens no šiem nav saglabāts; pārlādējot lapu, sākas ar noklusējumiem. Pārlūkā tiek atcerēts: valoda un auto nosaukumi, kas iegūti no apļu failiem (skatiet [Apļu ielāde](race-loading-laps.md#car-names)).

## Izstrādātājiem {#for-developers}

### Kas notiek, kad apļi tiek ielādēti {#what-happens-when-laps-are-loaded}

Ikreiz, kad mainās apļu kopa, atsauce vai valoda, viss analīze tiek veikta no jauna (`analyse` failā [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Katram aplim tiek pievienoti atvasinātie kanāli tur, kur spēle tos nenosūta: drifta leņķis, riteņu slīde no riteņu ātrumiem, gaisā, irdena zeme, griešanās ātrums ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Tiek izvēlēta atsauce, un katrs aplis tiek projicēts uz tās ceļu un pārparaugots ik 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. No apļiem tiek noteikts, vai spēles pasaule ir spoguļattēls ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Līkumi tiek atrasti atsaucē un sagrupēti segmentos no vienas bremzēšanas zonas līdz nākamajai ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Katram auto: tā aploksne (saķere, bremzēšana, vilkme pēc ātruma), tā profils, tā riepu līknes ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Katram aplim un segmentam: ko tas darīja (bremzēšanas punkts, lēnākais punkts, pilna gāze, ...) un līnija, pa kuru braukts ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Katram aplim: tā auto vadības notikumi, katrs salīdzināts ar apli, pret kuru tas tur tiek salīdzināts.
8. Katram aplim un segmentam: laika uzskaite pret tā salīdzinājuma apli un atradums vārdos.
9. Katram aplim — laika karte un cēloņu karte.

Teksti tiek veidoti tekošajā valodā; mainot valodu, analīze tiek palaista atkal (un demo apļi tiek pārdēvēti). Kļūme analīzē tiek rādīta zem pogām **Apļi** kā kļūda, un apļi paliek ielādēti.

### Avotu faili {#source-files}

| Fails | Loma |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | apļu failu lasīšana |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | apļa tips, nosaukumi, demo apļi |
| `src/race/derive.ts`, `handedness.ts` | atvasinātie kanāli, spoguļtrases |
| `src/race/align.ts`, `segments.ts`, `line.ts` | attāluma ass, līkumi, līnijas |
| `src/race/analysis.ts` | salīdzinātie līkumi, cēloņi, atradumi |
| `src/race/envelope.ts`, `profile.ts` | ko auto spēj |
| `src/race/control.ts`, `impacts.ts` | auto vadība, trāpījumi un avārijas |
| `src/race/stats.ts` | daudzi apļi |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | atkārtojums un zīmēšana |
| `src/race/schema.ts`, `graphs.ts` | kanālu tabula, diagrammu rindas |
| `src/ui/race/*` | sānjosla, diagrammas, HUD, etiķetes |
| `src/state/raceStore.ts` | cilnes stāvoklis un atkārtojuma pulkstenis |

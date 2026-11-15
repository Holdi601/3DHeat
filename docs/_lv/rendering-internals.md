---
title: "Renderēšanas iekšējā uzbūve"
nav_order: 22
has_children: true
lang: "lv"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Renderēšanas iekšējā uzbūve

Skatītājs zīmē miljonus punktu kā spīdošus plankumus un saskaita tos. Šī sadaļa izskaidro trikus, kas to tur ātrumā, un ko nozīmē skaitļi statistikas pārklājumā. Izlasiet to, ja skatītājs šķiet lēns vai ja vēlaties strādāt pie renderētāja.

```
data -> time window -> GPU filters -> sampling plan -> splat -> accumulate -> colour -> screen
```

Lai redzētu, cik labi klājas jūsu datoram, skatiet statistikas lodziņu skata augšējā labajā stūrī: [Veiktspējas panelis un statistika](performance-and-stats.md). Jaunie vārdi (GPU, rinda, spraits, siltuma karte) ir [glosārijā](glossary.md).

## Galvenā problēma {#the-core-problem}

Vairāku pārklājošos radiālo rampu summa maksā *N* × π*r*² sajauktus fragmentus katrā kadrā. Ar 100 miljoniem spraitu ar 8 px rādiusu tas ir 2 × 10¹⁰ fragmentu, ap sekundi darba augstas klases GPU. To nevar aprēķināt katru kadru, tāpēc skatītājs apvieno:

- **laika kārtotas rindas** — laika logs ir divi bināri meklējumi, un atskaņošanas izmaksas seko rindām logā, nevis visai datu kopai;
- **nekas katrai rindai CPU katrā kadrā** — rindas dzīvo GPU atmiņā, kvantētas; filtri, grupu zīmes, dzīvotspējas tests, logs, nogriešana un griezums tiek novērtēti virsotņu shaderī;
- **stratificēta paraugu ņemšana** ar kompensējošiem svariem, kad kadrs nevar zīmēt katru rindu, un **progresīva uzkrāšana**, kas konverģē uz precīzo atbildi par visām rindām, kamēr skats paliek nemainīgs ([Paraugu ņemšana un budžeti](sampling-and-budgets.md), [Uzkrāšana](accumulation.md));
- **divpakāpju droseļvārsts**, kas apmaina spraitus kadrā un pēc tam siltuma izšķirtspēju pret kadru ātrumu ([Paraugu ņemšana un budžeti](sampling-and-budgets.md#the-adaptive-budget));
- **ieviesti atmiņas budžeti**, lai dati, kas neietilpst, tiktu parādīti saīsināti un redzami, nevis avarētu ([GPU atmiņas saturs](gpu-memory.md)).

## Viens kadrs {#one-frame}

Kadra cilpa ir [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Viss, kas mainās ar kadra ātrumu — kamera, atskaņošanas galva, budžets — dzīvo dzinējā, nevis lietojumprogrammas stāvoklī. Tāpēc kadrs nemaksā nekādu React darbu: stāvoklis tiek nolasīts vienu reizi katrā kadrā un atpakaļ ierakstīts tikai zemas frekvences rādījumiem.

1. **Jauni dati?** Jauna datu kopa tiek paziņota (*Augšupielādē N rindas uz GPU*) vienā kadrā un augšupielādēta nākamajā, tāpēc ziņojums tiek parādīts, pirms darbs bloķē pavedienu. Jauns līmenis tiek nodots renderētājam; tiek veidoti vai atbrīvoti līniju siltuma maršruti.
2. **Atskaņošanas galva** virzās (ne vairāk kā 0,1 s reāllaika katrā kadrā), cikla vai apstājas.
3. **Kamera** nolasa taustiņus, peli un spēļu pulti; ass spogulis tiek ieklauts skata matricā; WebGPU dziļuma remap matrica pārvērš three.js OpenGL stila dziļuma diapazonu WebGPU diapazonā.
4. **Kas ir redzams**: laika diapazons no laika skalas un vēstures; grupu zīmju tabula (redzamība tikai sadalījumā pēc kolonnas); līdz četriem filtriem — kolonnu filtri un vienību atlase; starpības sadalījums.
5. **Krāsu un līkņu tabulas** tiek pārbūvētas, ja to iestatījumi ir mainījušies.
6. **Budžets**: adaptīvais kontrolieris nosaka šī kadra spraitu budžetu un siltuma izšķirtspēju. Ar *Zīmēt katru rindu katrā kadrā* budžets tiek paaugstināts, lai aptvertu katru kandidātu rindu.
7. **Paraksti** nosaka, ko uzkrāšanas bufers vēl nozīmē: izmaiņa jebkurā, kas maina, kuras rindas ieguldās vai kā (*ģeometrija*), laika logā, vai tikai tajā, kā rezultāts tiek krāsots (*kompozīcija*). Skatiet [Uzkrāšana](accumulation.md#what-restarts-it).
8. **Paraugu plāns**: kurus rindu blokus zīmēt ([Paraugu ņemšana un budžeti](sampling-and-budgets.md)).
9. **Uzkrāšanas režīms**: atiestatīt, paplašināt, slīdošais vidējais, darbojošais vidējais vai dīkstāve.
10. **Figūru pārklājuma ģeometrija** (kubi, pēdas) CPU, tikai šajā režīmā un tikai tad, kad nav dīkstāve.
11. **Renderēšana**: renderētājs zīmē ainu (līmenis, režģis, asis, kastes, pēdas, lineāls), izzīmē siltumu siltuma mērķī, sapludina to uzkrājējā un pārklāj siltumu pār ainu audeklam.
12. **Automātiskā ekspozīcija** iedarbojas, kad tās skaitīšana sasniedz nulli. Lineāla siltuma zonde nolasa vienu pikseli ne biežāk kā reizi 120 ms. Rādījumi tiek publicēti.

Dīkstāves kadrs — konverģējis, nekas nav mainījies — izlaiž ainu un izzīmēšanu, bet joprojām **pārkompozē**. WebGL audekls, kas izveidots bez `preserveDrawingBuffer`, pēc kompozīcijas satur nenoteiktu saturu, tāpēc nav droši paļauties, ka tas joprojām rādīs iepriekšējo kadru. Ainas un siltuma mērķi ir skatītāja paša kadru buferi, un tie saglabājas, tāpēc dīkstāves kadrs maksā vienu pilnekrāna piegājienu.

## Lappuses šajā sadaļā {#pages-in-this-section}

- [Abas renderēšanas metodes](backends.md) — WebGPU un WebGL2, kā tiek izvēlēta, URL slēdži
- [Uzkrāšana](accumulation.md) — atiestatīt, paplašināt, slīdošais vidējais, darbojošais vidējais
- [Paraugu ņemšana un budžeti](sampling-and-budgets.md) — stratificētais paraugu ņēmējs, precīzais režīms, adaptīvais budžets
- [Pusprecizitātes uzkrāšana](half-float-accumulation.md) — diapazons un precizitāte 16 bitu mērķos
- [GPU atmiņas saturs](gpu-memory.md) — kvantēta rindu glabāšana un ieviests GPU budžets
- [Programmatūras renderēšanas noteikšana](software-rendering.md)
- [Veiktspējas panelis un statistika](performance-and-stats.md)

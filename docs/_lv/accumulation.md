---
title: "Uzkrāšana"
parent: "Renderēšanas iekšējā uzbūve"
nav_order: 2
lang: "lv"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Uzkrāšana

Kad skatītājs nevar uzzīmēt visus punktus vienā kadrā, tas uzzīmē daļu, tad citu daļu, un saskaita attēlus, kamēr tu stāvi mierīgi. Attēls kļūst skaidrāks, kā fotogrāfija, kas attīstās. Kameras kustēšana sāk visu no jauna. Statistikas pārklājuma rinda **Pārklājums** rāda, cik tālu tas ir tikts.

![Statistikas pārklājums: Pārklājums rāda procentus, kamēr attēls attīstās, un *precīzs*, kad tas ir pabeigts](../assets/img/en/performance-stats-overlay.webp)

## Izstrādātājiem {#for-developers}

Kad viens kadrs nevar uzzīmēt katru rindu, tas uzzīmē paraugu un to pasvaru; attēls tad ir nenovirzīta, bet trokšņaina aplēse. **Uzkrāšana** apvieno secīgus kadrus, lai aplēse konverģētu uz precīzu atbildi, kamēr nekas nemainās. Katrs kadrs izvēlas vienu no pieciem režīmiem ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); pēdējais izmantotais ir `engine.live.accumMode`.

| Režīms | Kad | Kas notiek ar uzkrājēju |
|---|---|---|
| **reset** | kamera pakustējās, kaut kas, kas maina lauku, mainījās, progresīvā precizēšana ir izslēgta, aug logs sākas (pirmais atskaņošanas kadrs, pēc meklēšanas), vai atskaņotās līnijas siltums pakustējās | Aizstāts ar šī kadra aplēsi. |
| **extend** | logs **Kumulatīvi**, kas kopš pēdējā kadra tikai pieaudzis | Šis kadrs zīmē tikai rindas, kas tikko kļuva redzamas, pilnā svarā, un tās pieskaita. Nekas nesadalās. |
| **ema** | slīdošs logs (**Logs**, **Dzīves ilgums**) pakustējies | `acc = acc × (1 - 0.34) + frame × 0.34` — eksponenciāli slīdoša vidējā vērtība ap trim kadriem. |
| **mean** | nekas nav mainījies un aplēse nav pilnīga | `acc = acc × (1 - 1/n) + frame × 1/n` n-tajā kadrā: tekošais vidējais. |
| **skip** (dīkstāve) | konverģējis un nekas nav mainījies | Nekas netiek zīmēts; kadrs tikai pārsalikt. |

### Kāpēc katrs {#why-each}

- **Tekošais vidējais, nevis summa.** Bufera reizināšana ar 1 - 1/n un pievienošana 1/n no jaunā kadra algebriski ir tas pats, kas summēt un dalīt ar *n* beigās, bet bufers vienmēr satur vienu lauka vērtību. Summa sasniedz *n* reizes lauku, un 16 bitu mērķī tā piesātinās pie 65 504; ar dalītāju, kas aug, stāvošs skats tad izbalētu, jo ilgāk stāv, kamēr kustīga kamera, kas katru kadru atiestatās, izskatās pilnīgi pareizi. Dūmu testu komplekts apliecina, ka 16 apvienoti kadri satur 1,00× to, ko viens kadrs.
- **Extend kumulatīvai atskaņošanai.** Jau uzkrātās rindas joprojām ir redzamas, tāpēc kadram vajag tikai to sekundes daļu, kas tikko ienāca — kas ietilpst vienā kadrā, tāpēc tā ieiet precīzi. Aplēses atkārtošana citādi katrā kadrā apgaismotu citu nejaušu apakškopu un to izbalinātu; tas izskatītos kā uzliesmojumi, kas parādās un pazūd, un pauzēts kadrs turpinātu aizpildīties. Komplekts apliecina, ka kopējais pieaug monotoni atskaņošanas laikā un paliek 0,02% robežās 2,5 s pauzē.
- **Slīdošais vidējais slīdošiem logiem.** Tie patiesi mainās katru kadru. Fiksēts sajaukšanas svars seko slīdošajam logam (vidējais pa visiem kadriem kopš atskaņošanas sākuma atpaliktu no atskaņošanas galviņas) un ir daudz mierīgāks nekā sākt no jauna.
- **Atiestatīšana atskaņotām līnijām.** Līniju siltuma galvas pārvietojas katru kadru; slīdošais vidējais katru izstieptu svītrā, tāpēc katrs kadrs tiek zīmēts vesels, un astes izbalēšana ir paša attēla.
- **Daļēji kadri iet caur skrāpējuma mērķi.** Kadrs, kas apvienots ar daļēju pilnā svara daļu, tiek uzsplatīts atsevišķā mērķī no nulles un tad sajaukts uzkrājējā, nevis tieši uzsplatīts ar 1/n svaru. Tieši katrs spraits tiktu pieskaitīts ar 1/n no summas, kuru tas pievieno, ko pusprecīzais mērķis noapaļo —  vissliktāk tur, kur tas ir blīvākais ([Pusprecizitātes uzkrāšana](half-float-accumulation.md)).

### Konverģence {#convergence}

Katra kadra plāns zina, cik ir kandidātu rindu un cik no tām tas iesniedz, tāpēc kadru skaits, kas vajadzīgs, lai aptvertu katru rindu, ir ⌈kandidāti / iesniegti⌉. Kad tik daudz kadru ir apvienoti, skats ir **konverģējis**: statistikas pārklājuma rinda *Pārklājums* no procentiem mainās uz *precīzs*, un turpmākie kadri ir dīkstāvē. Ar ieslēgtu **Zīmēt katru rindu katrā kadrā** (noklusējums) viens kadrs parasti aptver visu, tāpēc konverģence ir tūlītēja, un progresīvais mehānisms vajadzīgs tikai tad, kad logā ir vairāk rindu, nekā viens zīmēšanas plāns var nest (apmēram 67 miljoni).

### Kas to atsāk {#what-restarts-it}

Iestatījumi iekrīt trīs grupās atkarībā no tā, ko uzkrātais bufers vēl nozīmē pēc to maiņas:

| Grupa | Maina | Efekts |
|---|---|---|
| **Ģeometrija** — kuras rindas dod ieguldījumu un cik daudz | skata režīms; līniju maršruti; spraita rādiuss, centra un malas intensitāte, kritums, gluds gradients, līkne, pikseļu ierobežojumi, saplacināšana; atmešana pēc attāluma tuvā, tālā un plakanā veidā; aizsegšana un paslēpšana aiz reljefa; griezums; audekla izmērs; siltuma izšķirtspēja; grupu redzamība un zīmes; starpības sadalīšana; Viss / Atskaņot; vēsture; kolonnu filtri un vienību atlase; pusprecizitātes pastiprinājums | Atiestatīt. |
| **Logs** — laika diapazons | atskaņošanas galviņas kustība; rezerves dzīves ilgums un izbalēšana | Paplašināt (kumulatīvs) vai slīdošais vidējais (slīdošs). |
| **Salikums** — tikai krāsošana | piesātinājums, blīvuma reakcija, minimālais siltums, krāsu skalas; līmeņa griešana; režģis un asis; kastes atkārtojuma iestatījumi un sesija; lauka dziļums | Pārzīmēt, neaizskarot siltumu. |

Kameras kustība vienmēr atiestata. Tāpēc piesātinājuma vai skalas vilkšana ir bez maksas; sprite rādiusa vilkšana pārstartē konverģenci katrā solī.

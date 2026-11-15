---
title: "Figūras figūru pārklājumā"
parent: "Figūras"
grand_parent: "Atskaņojums"
nav_order: 2
lang: "lv"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figūras figūru pārklājumā

Šī lapa ir par to, kā kastes pārvērst mazās 3D figūrās, kas parāda, kas katra vienība patiesībā bija, un par dūmiem un uguni, ko figūras atstāj aiz sevis. Atkārtojuma paša vadības elementi ir lapā [Spēles atkārtojums](match-replay.md).

[Figūru pārklājuma atkārtojumā](box-replay.md) un cilnes Mačs figūru atkārtojumā opcija **Figūras kastīšu vietā** (pēc noklusējuma ieslēgta) zīmē katru dzīvu personu kā figūru tam, kas tā ir: kājnieku, tanku, ko kāds vada, vai lidaparātu, ko attēlo Tacview trajektorija. Figūrai ir kastes krāsa, vieta un virziens. Lidaparātiem un raķetēm tai ir arī tangāža un, ja datiem ir Roll kolonna, sašķiebums. **Figūru izmērs** tās mēro; 1 reizi ir īstais izmērs. Klikšķi uz figūras atbild tāpat kā klikšķis uz tās kastes.

## Kura figūra {#which-figure}

Datu paša nosaukumu un tipa kolonnas izlemj. Pilni noteikumi ar kolonnu nosaukumiem ir lapā [Figūras](figures.md#which-figure-a-unit-gets). Dati bez nevienas no šīm kolonnām ir cilvēku dati: visi ir kājnieki.

Sakritība tiek glabāta kešatmiņā pēc etiķetes, tāpēc kadrs maksā tikai novietošanu. Datu vienība ir metrs, ja vien dati nesaka, cik liela ir viena izsekota lieta (CS2 eksports saka, ka spēlētājs ir 32 vienības plats); figūras tiek mērogotas atbilstoši.

Neobligāts jūsu pašu figūru komplekts var aizstāt katalogā esošās figūras jūsu datorā; skatiet [Figūras](figures.md#an-optional-local-figure-pack).

## Efekti {#effects}

Notikumu rindas, kas kādu laiku kaut ko atstāj aiz sevis, tiek zīmētas tajā vietā, kur tie notika, cik ilgi tas turas, tās personas krāsā, kas to izraisīja: dūmi (aptuveni 18 s), molotovs vai dedzinošā bumba (7 s), uzliesmojums (aptuveni sekunde) un HE sprādziens (mazāk par sekundi), mānekļis (15 s), uzspridzināts spridzeklis (40 s). Tie nāk no notikumu kolonnas (Event, Events), kuras etiķete ir `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` vai `plant`. CS2 eksports tos raksta detonācijas brīdī.

## Spēles atkārtojums: Tacview rīki {#match-replay-tacviews-tools}

Kameras, grāmatzīmes, taktiskais displejs, statistika, etiķetes, **Vertikālās līnijas**, notikumu saraksts un diagrammas logs ir aprakstīti lapā [Spēles atkārtojums](match-replay.md). [Tacview paritāte](tacview-parity.md) uzskaita katru Tacview funkciju un to stāvokli.

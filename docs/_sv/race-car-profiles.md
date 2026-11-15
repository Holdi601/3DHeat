---
title: "Bilprofiler och jämförelse"
parent: "Racinganalys"
nav_order: 56
lang: "sv"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Bilprofiler och jämförelse

En bil kan bara bromsa, svänga och accelerera så hårt. Visaren mäter hur hårt från dina egna varv, så den säger aldrig åt dig att göra något som din bil inte kan. Det förklarar också hur stor del av en förlorad sekund som var bilens fel och inte ditt.

![Bilarna jämförda: två bilar bredvid varandra med deras grepp, inbromsning och dragkraft](../assets/img/en/race-cars-compared.webp)

Analysen säger bara åt ett varv att bromsa hårdare, behålla mer fart eller accelerera tidigare där dess bil har visat att den kan det, och den tar ur en förlust det som bilarna själva förklarar. Varje bils gränser (dess *hölje*, nedan) och karaktär (dess *profil*) mäts därför från varje inläst varv av den. Den här sidan handlar om höljet, profilen, avsnittet **Bilarna jämförda** och vad bilarna avgör i varje kurva.

**En bil** = varv med samma bilnummer (eller namn, utan nummer) och samma prestandaindex: en annan inställning är en annan bil.

## Höljet: vad bilen kan göra vid varje fart {#the-envelope-what-the-car-can-do-at-each-speed}

Per bil, över varje inläst varv av den, i **fartband på 5 m/s** (24 band, upp till 120 m/s). Prov i luften, lugnande sig i 0,3 s efter en landning, och från 0,1 s före varje träff till 1 s efter den utelämnas, och accelerationer på 80 m/s² eller mer ignoreras (över vad någon bil med downforce klarar).

| Hölje | Prov | Värde per band | Behöver |
|---|---|---|---|
| **sidogrepp** | den sidledes acceleration **hållen i en halv sekund** (medelvärdet av dess absolutbelopp över ett centrerat 0,5 s-fönster), bara där bilen tog en kurva: minst en tredjedel av 99-percentilen av all den | 95-percentilen | 6 prov |
| **inbromsning** | broms > 0,3; längsgående acceleration som medianen av varje prov och dess två grannar | 95-percentilen av retardationen | 4 prov |
| **full gas-dragkraft** | gas > 0,95, broms under 0,05; samma median av tre | 90-percentilen | 4 prov |

Varför hållen i en halv sekund: en kantsten, en glidning som snäpper tillbaka, en bil som fångas, drar alla upp sidledes acceleration för ett ögonblick, och en bil som gör det ofta såg ut att ha mer grepp än den har. Varför median av tre: med fem meters avstånd är ett prov en lång sträcka, och en topp på ett enda prov är en kantsten, en stöt eller en vägg.

Att läsa höljet vid en fart interpolerar mellan bandens mittpunkter, och tar det närmaste band med data där ett band är tomt.

**Om två slags underlag.** När en bils varv körde en femtedel eller mer av sina prov på både asfalt och löst underlag, behålls ett eget hölje för varje, och varje kurva bedöms med det underlag som bilen står på vid sin långsammaste punkt.

**Övergången.** Farten från vilken dragkraften avtar som `1/v` (effektbegränsad) i stället för att hålla sig jämn (greppbegränsad): det första bandet vars `a·v` ligger inom 15 % av det högsta `a·v` som setts.

## Profilen: vilken sorts bil det är {#the-profile-what-kind-of-car-it-is}

`profile`, från samma varv (prov på marken, inte träffade, snabbare än 8 m/s):

| Mått | Hur |
|---|---|
| **grepp som hålls** (m/s²) | 95-percentilen av den halvsekunds hållna sidledes accelerationen |
| **dragkraft** till 50 km/h, 50–120, 120–200, över 200 (m/s²) | medelvärdet av höljets full gas-dragkraft över 3–14, 14–33, 33–56 och 56–90 m/s, vid farter bilen nådde (upp till dess snabbaste + 2 m/s), från minst tre steg om 1 m/s; och det mest den visade, och var |
| **inbromsning** (m/s²) | höljets inbromsning i medel från 60 till 160 km/h (16,7–44,4 m/s), det band jämförelsen anger |
| **snabbast** | den högsta fart den nådde |
| **nådde sitt tak vid** | där den slutade öka vid full gas på en rak (nedan) |
| **drar fortfarande vid sin snabbaste** | höljets dragkraft vid dess snabbaste fart: hur långt den ännu hade kvar |
| **bakdel fångad, per varv** | gånger per varv den gled och måste fångas (nedan) |
| **andel på gasen** | av dessa, andelen som började med gas > 0,5 och ingen broms |
| **släpper vid** | medianen av den hållna sidledes accelerationen 0,15 s före varje glidning började, som en andel av greppet |
| **över 10° drift, i hård kurvtagning** | av prov som tar en kurva på 60 % av sitt grepp eller mer, andelen som glider (10° på asfalt, 20° på löst underlag); behöver 30 prov |
| **median drift** | över samma prov |
| **balans** | framsidans minus bakre slipvinkel (multipler av nominell topp) där den tar en hård kurva och inte glider, medel av minst 30 prov: + trycker brett |
| **underlag** | över 80 % löst prov: löst; under 20 %: asfalt; annars blandat |

**Att nå taket.** Ett prov räknas när sekunden runt det (±0,5 s, minst 0,9 s data) var helt på full gas (> 0,95, ingen broms), på marken, kört **rakt** (|sidledes| under det större av 4 m/s² och en fjärdedel av dess grepp), ökande med under **0,35 m/s²**, snabbare än 25 m/s och inom 90 % av varvets snabbaste – full gas uppför en backe eller genom en lång kurva slutar också att öka, långt under bilens toppfart. Med minst **en sekund** av ett sådant platå över alla varv är medianen av de farterna där den når sitt tak. Annars finns ingen toppfart: där ingen rak var tillräckligt lång säger *drar fortfarande vid sin snabbaste* hur långt ifrån den var. Ingen gissning utöver det varven visar – växellåda och begränsaren gör slut på en bils dragkraft långt innan luftmotståndet gör det.

**Att tappa bakdelen.** Räknas där föraren var tvungen att fånga den: kurvtagning på 60 % av sitt grepp eller mer, glidning (drift över 10° på asfalt, 20° på löst underlag), med ratten (över 0,06) vriden **mot** kurvan. Vilket tecken på ratten som stämmer med vilket tecken på kurvkraften mäts per varv (prov som svänger utan att glida). En glidning räknas en gång tills bilen slutar glida. En bil som medvetet körs lite sidledes förlorar ingenting; en som behöver motstyrning gör det. Räknas lika för varje bil, så att två bilar kan jämföras. Kräver ratt och en driftvinkel.

## Bilarna jämförda {#cars-compared}

Sidofältets avsnitt heter **Bilen** med en bil, **Bilarna jämförda** med flera.

**Tabellen**: en kolumn per bil, en rad per mått som någon bil har ett värde för: Grepp som hålls; Dragkraft till 50 km/h, 50–120, 120–200, över 200; Inbromsning; Snabbast; Nådde sitt tak vid (”drar fortfarande” där den aldrig gjorde det); Drar fortfarande vid sin snabbaste; Bakdel fångad, per varv; Över 10° drift, i hård kurvtagning. Där bilarna skiljer sig med mer än 3 % markeras det bättre värdet (högre för grepp, dragkraft, inbromsning, farter; lägre för bakdelsglidningar).

**En bil ensam**: meningar om vad varven visar att den är – greppet den håller (m/s² och g), dess dragkraft i varje band, var den slutade öka på de långa raka (eller att den aldrig nådde sitt tak, och vad den ändå drog vid sin snabbaste), och hur ofta dess bakdel behövde fångas (”knappt någon gång” under en gång per varv, ”mest på gasen” när 60 % eller mer började där).

**Två bilar**: för varje par, en mening vardera om vad bilen är mot den andra (”X accelererar bättre, men kan inte svänga lika hårt, behöver längre för att stanna och förlorar bakdelen lättare”), tabellen, varje tydlig skillnad största först, och sedan **Så kör du var och en**. Med fler än **3** par visas ett par: det valda varvets bil mot en bil som väljs i en rullgardinslista (som standard den bil som har bästa varvet i sin klass, annars referensens, annars den första andra).

En skillnad sägs bara när varven visar den tydligt:

| Skillnad | Sägs från | Mening |
|---|---|---|
| grepp | **4 %** | ”X håller N % mer grepp genom kurvorna … det ger M % mer fart genom mitten av varje kurva” (fart = √ av greppkvoten) |
| dragkraft | **5 %**, i det första band båda bilarna har av 120–200, 50–120, över 200 km/h | ”X accelererar N % hårdare från 120 till 200 km/h”; även från start, eller ”men Y kommer iväg från start hårdare”, när starten skiljer sig med 8 % |
| toppfart | **4 km/h** | ”X når en högre topp: den slutade öka vid …” |
| toppfart, bara en | en bil nådde sitt tak, den andra inte | ”Y tog slut på dragkraft vid …; X ökade fortfarande när den bromsade” |
| toppfart, ingen | ingen nådde sitt tak | vad var och en ännu ökade vid sin snabbaste |
| inbromsning | **5 %** | ”X stannar N % hårdare … Y måste bromsa tidigare” |
| tappa bakdelen | minst en gång per varv oftare **och** en halv gång så ofta till | ”X tappar bakdelen lättare: den steg ut tillräckligt långt för att behöva motstyrning N gånger per varv mot M …” – mest på gasen (60 % +) eller mest vid inkörning och på släpp (30 % eller mindre), från ungefär P % av sitt grepp; på löst underlag ”en del av det är hur en bil vrids; fångandet är inte det”. |
| på tvären | **12 procentenheter** av hård kurvtagning över driftgränsen | ”X kör mer på tvären vid gränsen” |
| frambalans | **0,3** av den nominella toppen | ”X trycker mer i framvagnen … Den vill bromsas och vridas innan kurvans topp” |

Egenskaperna i sammanfattningen: *håller mer grepp* / *kan inte svänga lika hårt*, *accelererar bättre* / *drar mindre*, *når högre topp* / *når lägre topp*, *drar fortfarande vid rakornas slut* / *tar slut på dragkraft*, *bromsar hårdare* / *behöver längre för att stanna*, *är stabilare* / *tappar bakdelen lättare* (*är mycket mer glidig …* vid dubbelt så ofta plus en; *behöver fångas oftare* på löst underlag), *trycker i framvagnen*. ”Lite att skilja den från Y på de här varven” när det inte finns någon.

**Så kör du var och en:**

- en bil håller mer grepp och den andra drar mer: behåll farten genom mitten på en bred, rund linje (”U:et”) i den med mest grepp; bromsa rakt, vrid den i en kort, trång mitt och räta ut utgången (”V:et”) i den starka;
- en bil är sämre på båda: dess bästa varv är det renaste – bromsa rakt, största radien, full gas så tidigt som den håller;
- en bil som tappar bakdelen lättare: ge gasen bara när ratten rätar ut sig och kör snabbt upp i växlarna (glidningar på gasen), eller släpp bromsen mjukt och håll en jämn gas genom mitten (glidningar vid inkörningen).

Tipset under avsnittet upprepar hur var och en mäts.

## Vad bilarna avgör i en kurva {#what-the-cars-decide-in-a-corner}

När varven är i olika bilar slutar varje förlorad kurvs fynd med **Bilarna:** – vad av det bilarna avgör, och hur man får ut mesta möjliga av just den här bilen (`carNote`):

- **Genom mitten**, när den här bilen håller under 96 % av den andra bilens grepp, den andra var över 0,5 m/s snabbare vid den långsammaste punkten, och det här varvet inte låg långt under vad dess grepp förklarar (över 70 % av det): på den andra bilens linje tillåter den här bilens grepp `v_andra · √(grepp_mitt / grepp_andra)`. Om varvet bar det (inom 1 m/s) är gapet bilen, och ingen bromspunkt ändrar det; om mindre, hur mycket som ändå finns att vinna. Sedan var tiden kan vinnas i stället: på en rak, mellan två, eller i en bil som drar 5 % hårdare – efter apexen (bromsa rakt, sväng in senare, rikta den mot utgången tidigt); annars den största radien vägen tillåter.
- **En bakdel som släppte här** (en icke-delad glidning eller snurr, eller en drift över glidgränsen på väg in), i en bil som tappar den minst en gång per varv mer och halva gången till: vad man ska göra i den här bilen – gasen tillförs när ratten rätar ut sig (dess glidningar börjar på effekten 60 % eller mer av tiden) eller bromsen släpps mjukt utan att släppa gasen.
- **Rakan efter**: när bilarnas dragkraft förklarade 0,03 s eller mer, den andra bilens starkare dragkraft från samma fart, med båda bilarnas dragkraft från 120 till 200 km/h.
- **Toppfart**: när det här varvet nådde 98 % av var dess bil når sitt tak på en rak över 150 m lång, och den andra gick 1,5 m/s snabbare: det är bilens toppfart, och varje km/h mer ut ur kurvan hjälper fortfarande tills den nås.
- **Inbromsning**: när den andra bilen bromsar 5 % hårdare och det här varvet bromsade mer än 5 m tidigare, att en del av den tidigare inbromsningen är bilens.

Bilens andel tas också ut ur själva tiden – se [bilens andel](race-corner-analysis.md#the-cars-share) – och en kurva där bilen förklarar 60 % eller mer hänförs till bilen.

## För utvecklare {#for-developers}

Kod: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` i [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` i [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).

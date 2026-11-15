---
title: "Händelser för bilkontroll"
parent: "Racinganalys"
nav_order: 54
lang: "sv"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: true
---

# Händelser för bilkontroll

Visaren följer hur varje varv kördes och markerar var föraren fick bilen att glida, snurra, träffa något eller slösa grepp. Det är användbart, eftersom ett misstag som kostade tid är det snabbaste att rätta till.

![Avsnittet Bilkontroll: hur ofta varje varv låste ett hjul, snurrade eller gled ut brett, och listan över fel med ett öppnat](../assets/img/en/race-control-table.webp)

## Med enkla ord {#in-plain-words}

- **Låsning**: du bromsar så hårt att ett hjul slutar snurra och glider. Bilen bromsar sämre och kan inte styras.
- **Hjulspinn**: du trycker gasen så hårt att drivhjulen snurrar fortare än bilen rör sig. Du förlorar dragkraft.
- **Överstyrning**: bilens bakdel glider brett ut. Om den snurrar hela vägen runt är det en **snurr**.
- **Understyrning**: bilens framdel glider brett ut (”den trycker”). Om du vrider ratten mer hjälper det inte.
- **Träff** och **krasch**: bilen tog i något. En träff är en törn eller skrapning, en krasch är en hård kollision.
- **ABS** och **TC**: bilens egna hjälpsystem som verkar mot låsning och hjulspinn. De är inga misstag.

## Avsnittet Bilkontroll (vad du ser) {#the-car-control-section-what-you-see}

För det valda varvet visas det som varven har, även utan däckglid och utan driftvinkel. Det visar då det som ändå går att hitta i stället för ingenting (se nedan).

**Tabellen**: en rad för varje sorts händelse som något av varven visar: Låsta hjul, Hjulspinn, Bakdel glider ut (överstyrning och snurrar), Glider brett framåt, Haverier, Träffar, ABS verkar, TC verkar, Handbroms och I luften. Varje cell visar ”antal · sekunder”, för det valda varvet och för varvet det jämförs med. Om det finns en driftvinkel visas också *största driftvinkel* (den största på marken).

**Listan**: dess fel som inte delas med det andra varvet och som kostar minst 0,02 s, dyrast först, högst 12 stycken. Varje fel har sin rubrik och kostnad (och sin märkning för sort). Klicka på ett fel för att läsa dess tips, ställa upp bilarna 40 m före det och spela upp det. **Även vad båda varven gjorde där** lägger till varje fel, också de delade (märkning ”båda gjorde det”, kostnad ”—” under 0,01 s). Om det inte finns några: ”Det X gjorde med däcken kostade tid som Y inte gjorde också.”

**Tipset under den** säger vad upptäckten kunde se med: ”Från varje hjuls glid och slipvinkel, och bilens driftvinkel.” (eller glid och slipvinkel, glid och driftvinkel, bara glid, eller ”Endast från bilens driftvinkel – dessa varv har inget däckglid.”) Det anger också underlaget som gränserna mättes för (asfalt, löst, blandat: över 80 % löst prov är löst, under 20 % asfalt), vilket varv händelserna lades mot, och hur kostnaden räknas.

Med **inget däckglid och ingen driftvinkel** (en FH Companion-varvfil utan sin telemetri) visas tabellen och listan ändå, och tipset säger vad som ändå kunde hittas från det varven innehåller: ”Dessa varv har varken däckglid eller driftvinkel, så låsningar och hjulspinn kan inte märkas. Hittas ändå: utskjutningar, från ratten mot banan; träffar och krascher, från fart och acceleration.” Glidningar från girhastigheten nämns också där varven har den, och utskjutningar bara där de har ratt. Meningen om glid- och driftgränserna utelämnas, och ett andra tips säger: ”För Forza Horizon, välj även `.tele.gz`-filen bredvid varje FH Companion-varv: det är hela telemetrin, varje hjuls glid 64 gånger per sekund.”

Varvets **totala** kostnad för bilkontroll (används i sammanfattningar) räknar överlappande fel en gång: en låsning och glidningen den startar, inom 40 m, räknas en gång, till den dyraste i klustret.

## Så upptäcks det {#how-it-is-detected}

Resten av sidan är regelboken: varje sort, varje gräns.

Kod: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Resonemanget och litteraturen finns i [metoden](race-analytics.md).

## Sorterna {#the-kinds}

| Sort | Tabellrad | Ett fel? | Kortaste som räknas |
|---|---|---|---|
| `lock` | Låsta hjul | ja | 0,1 s |
| `wheelspin` | Hjulspinn | ja | 0,15 s |
| `oversteer` | Bakdel glider ut | ja | 0,2 s |
| `spin` | (räknas med Bakdel glider ut) | ja | 0,1 s |
| `understeer` | Glider brett framåt | ja | 0,25 s |
| `crash` | Haverier | ja | - |
| `hit` | Träffar | ja | - |
| `abs` | ABS verkar | nej | 0,2 s |
| `tc` | TC verkar | nej | 0,2 s |
| `handbrake` | Handbroms | nej | 0,1 s |
| `airborne` | I luften | nej | 0,15 s |

Kortare körningar är brus (en kantsten, en stöt, ett enstaka prov). Körningar av rutnätspunkter (var 2 m) som klarar ett test sammanfogas över luckor på upp till 2 punkter. Bara **fel** kan vara misstag och har en kostnad. De andra är vad bilen och föraren gjorde.

## Vad varje test kräver {#what-every-test-needs}

### Härledda kanaler {#derived-channels}

Innan något bedöms får varje varv det som dess spel inte skickar, under gemensamma namn (ett spels eget värde går alltid före):

| Kanal | Från |
|---|---|
| `bodySlip` (driftvinkel) | hastighetsvektorn i bilens riktning, `atan2(latVel, abs(longVel))`, där spelet skickar den (0 under 3 m/s); annars riktningen (spelets gir, anpassad till färdriktningen genom tecken och offset över prov snabbare än 10 m/s, och bara betrodd med en cirkulär varians under 0,05) mot färdriktningen (positioner minst 2 m från varandra), vid hastigheter över 3 m/s |
| `yawRate` | ändringen av `yaw` över tid, där det finns en riktning men ingen hastighet |
| `airborne` | varje hjuls markkontakt av (≤ 0,5); annars varje hjuls last under 5 % av dess median; annars varje fjädringsrörelse på eller under 0,02 (helt utsträckt). Ett enda avvikande prov är inte ett flyg |
| `slipRatio.<W>` | `(hjulets ytfart - bilens fart) / bilens fart` över 3 m/s, där spelet skickar hjulens ytfart; eller av hjulrotation × en rullradie uppmätt på varvet - medianen av `fart / rotation` medan bilen rullar rakt (fart > 10 m/s, gas < 0,3, broms < 0,05, abs(längsgående acceleration) < 3 m/s², inte i luften; varje prov över 10 m/s när det finns färre än 20), godtagen mellan 0,1 och 1 m. Märkt `physical` |
| `loose` | Forzas ytrumble på minst 2 hjul (> 0,001) under minst 0,33 s (en kantsten är kortare), luckor under 1 s överbryggas |

### På marken och lugnt {#on-the-ground-and-settled}

Inget bedöms i luften eller under **0,3 s efter en landning**. Fjädringen går i botten och accelerationerna skjuter i höjden, vilket inte är grepp, bromsning eller drivning. Ett prov måste dessutom vara **i rörelse**: snabbare än 5 m/s.

### Underlaget {#the-ground}

Varje provs underlag är **löst** där varvets kanal `loose` säger det (Forzas ytrumble, Trackmanias däckmaterial), annars varvets yta (se [disciplin och yta](race-loading-laps.md#discipline-and-surface)): asfalt, eller löst för allt annat. Kurvor, driftvanor och gränser hålls isär för asfalt och löst underlag.

### Glid, som en multipel av däckets nominella topp {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Spel skalar glid olika; `meta.slip` säger hur, och varje glid delas med en skala så att ungefär 1 är däckets nominella topp:

| `meta.slip` | Betydelse | Delas med |
|---|---|---|
| `peak` | normaliserad av spelet: över 1 förlorar man grepp (Forza Data Out) | 1 |
| `scaled` | fysisk glid delad med en asfalttopp (Kunos-inspelaren) | underlagets nominella topp delat med asfaltens |
| `index` | ett mått på glid från 0 till 1 (Trackmanias SlipCoef) | 0,5 |
| `physical` (eller okänt) | glidkvot som en andel, slipvinkel i radianer | underlagets nominella topp |

Nominella toppar, när inget bättre är känt:

| Underlag | Glidkvot | Slipvinkel |
|---|---|---|
| asfalt | 0,12 | 8° |
| blandat | 0,18 | 12° |
| löst (grus) | 0,25 | 15° |
| snö | 0,25 | 15° |
| is | 0,10 | 6° |

### Där greppet tar slut: varje bils däckkurvor {#where-grip-ends-each-cars-tyre-curves}

Var ett däck slutar ge mer mäts **per bil**, från varje inläst varv av den (`measureTyres`), för asfalt och löst underlag var för sig:

| Kurva | Prov (fart > 10 m/s, lugnt, accelerationer under 45 m/s²) | Glid (x) | Kraft (y) |
|---|---|---|---|
| bromsning | broms > 0,3, handbroms ≤ 0,2, kör rakt (sidledes under 30 % av det hårdaste) | abs(medelglidkvoten för de fyra hjulen) | retardation |
| dragkraft | gas > 0,8, broms ≤ 0,05, rakt, bilens fulla gaskraft vid den farten > 0,5 m/s² | glidkvoten för det största drivna hjulet | acceleration som andel av den kraften |
| fram | sidledes över 30 % av det hårdaste, bilens grepp vid den farten > 1 m/s² | den större slipvinkeln fram | sidacceleration som andel av det greppet |
| bak | samma | den större slipvinkeln bak | samma |

”Det hårdaste” är 99-percentilen av varvets abs(sidacceleration) på det underlaget (allt underlag när det finns färre än 50 prov). Drivlinan avgör vilka hjul som driver (framdrift: framhjulen, bakdrift: bakhjulen, fyrhjulsdrift: alla; okänt: alla).

Från minst **150 prov** delas glidningen in i 6 till 14 lika stora fack (ett per 40 prov). Varje fack får sin kraft från sin övre kvartil (vad däcket gav när föraren bad om det), utjämnad över grannfacken. Den **bästa** är facket med mest kraft. **Gränsen** är första facket efter den där kraften har sjunkit med **8 %**. En kurva som aldrig sjunker i datan har ingen gräns (oändlig). Att köra över ”toppen” kostar då inget i det spelet, och glid ensamt flaggar ingenting där (Forza Horizons kurv- och dragkraftskurvor är så). Med för få prov på ett underlag används det andra underlagets. Med för få prov totalt används den **nominella** gränsen: 1,5 gånger den nominella toppen.

Varje bil får också:

- sin **driftvana**: den övre kvartilen av dess driftvinkel där den tar en kurva på 60 % av sitt hårdaste eller mer (kräver 100 prov);
- sin **styrning per krökning** (`steerGain`), per hastighetsband på 5 m/s: medianen av abs(styrning) / bankrökning medan den tar en kurva ordentligt men väl inom sitt grepp (30–60 % av det hårdaste, krökning snävare än 400 m radie, styrning över 0,02; 25 prov per band). Banans krökning är girhastigheten delad med farten där spelet skickar en girhastighet, annars från positionerna ±5 m.

## Upptäckt, sort för sort {#detection-kind-by-kind}

| Sort | Test (på rörliga, lugna prov) | `peak` och `limit` |
|---|---|---|
| **lock** | broms > 0,05, handbroms inte över 0,2, och något hjuls glidkvot under minus bromsgränsen | den mest negativa glidningen (multipler av nominell topp); gränsen som negativ |
| **wheelspin** | gas > 0,2 (eller ingen gaskanal), och ett drivet hjuls glidkvot över dragkraftsgränsen | den största drivna glidningen; gränsen |
| **oversteer** (driftvinkel) | driftvinkeln över det större av underlagets golv och 1,5 gånger bilens driftvana där | den största driftvinkeln, radianer |
| **oversteer** (slipvinklar, ingen driftvinkel) | den större bakre slipvinkeln över bakgränsen och mer än 0,25 över den större främre | den bakre slipvinkeln (multipler av topp) |
| **oversteer** (ingen driftvinkel, men girhastighet och sidacceleration) | ”attitydhastigheten” – abs(girhastighet) minus abs(sidacceleration) / fart, över 8 m/s – över 0,2 rad/s, med styrningen mot svängen | rad/s; gräns 0,2 |
| **spin** | en överstyrningsbana vars driftvinkel nådde över **60°** | som överstyrning |
| **understeer** (slipvinklar) | ej glidande, den större främre slipvinkeln över den främre gränsen och mer än 0,3 över den bakre | den främre slipvinkeln; gränsen |
| **understeer** (inga slipvinklar) | snabbare än 12 m/s, ej glidande, ej motstyrning, sidacceleration över hälften av varvets hårdaste (99-percentilen), banan krökt hårdare än 300 m radie, och styrning mer än **1,6 gånger** vad bilens egen styrning per krökning säger att banan krävde | gånger den behövda styrningen; gräns 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` över 0,5 | - |
| **handbrake** | `handbrake` över 0,2 | - |
| **airborne** | `airborne` över 0,5 | - |
| **hit**, **crash** | se [Träffar och krascher](#hits-and-crashes) | farten som stöten tog |

Golven för driftvinkel per underlag: asfalt **7°**, blandat **10°**, löst och snö **15°**, is **10°**. En bil som glider mer som en självklarhet – en arkadmässig däckmodell, en grusspecialist – får en egen, högre gräns från sina egna varv (1,5 gånger dess vana).

**Vilket håll bilen svänger åt** (för ”mot svängen”): ändringen av varvets egen bana i riktning över ±6 m (minst 2 rutnätspunkter); snävare än 600 m radie räknas som sväng; höger eller vänster beroende på om världen är spegelvänd. Styrningen är **mot** svängen när abs(styrning) > 0,05 och dess tecken är motsatt svängen – en glidning som **fångas** med motstyrning.

**Pedalerna när det började** (`pedal`): *broms* när bromsen är över 0,1; *gas* över 0,3; *släppt* när gasen var över 0,5 inom de 8 rutnätspunkterna (16 m) före; *rullning* annars (eller utan gaskanal).

## Lagd mot det andra varvet {#laid-against-the-other-lap}

Varje händelse bedöms mot varvet som det valda varvet jämförs med på just den sträckan (det bästa i dess klass; för varvet själv, den i dess klass som var snabbast genom sträckan):

1. **Hur långt det andra varvet gick** över samma meter, ±8 m: det andra varvets egna händelser av samma familj (en snurr räknas som överstyrning, ett haveri som en träff) mätta i samma enheter, utan trösklar, med den andra bilens däckkurvor.
2. **Delad** när det andra varvet gick **80 %** så långt eller längre: så tas kurvan, inte ett misstag. Icke-felsorter är alltid ”delade”.
3. **Kostnad**, för ett ej delat fel: tiden detta varv förlorade mot det andra från 5 m före händelsen till **40 m efter** den (för en träff eller ett haveri, tills bilen har fått tillbaka sin fart – metrarna för att vinna tillbaka den med sin egen dragkraft, 40 till 400 m; utan uppmätt dragkraft, 5 m/s²). Aldrig negativ.
4. **Fart given bort** till bilens gräns: för en låsning, retardationen bilen visar sig kunna göra vid den farten minus vad den gjorde, summerad över händelsen; för hjulspinn, dess fulla gaskraft minus vad den gjorde; för en påverkan, farten som stöten tog. Anges när den är över 0,5 m/s (1,8 km/h).

Ett fel som inte är delat och kostade minst **0,02 s** listas ([banstatistiken](race-course-statistics.md) räknar bara fel på **0,03 s** eller mer, så att ett misstag som räknas över många varv är ett tydligt sådant), och kan bli orsaken till en kurvas förlust (se [Kurva för kurva](race-corner-analysis.md#car-control-faults-and-impacts)).

## Träffar och krascher {#hits-and-crashes}

`impacts.ts` läser träffar från varvets **egna prov**, före de samplas om – en träff är över på hundradels sekund. Däck kan inte skapa en träffs krafter, så en träff mäts mot varvets egen bil:

- **Dess grepp `G`**: 99-percentilen av dess horisontella acceleration `√(lat² + long²)` över varvet, på marken och snabbare än 5 m/s. Utan accelerationskanaler (eller under 3 m/s²): 15 m/s² – en vanlig vägbils grepp.
- **Tröskel**: `max(1,8 G, G + 18, 30)` m/s².
- **Träffat prov**: den horisontella accelerationen över tröskeln *och* hoppar mer än hälften av `G` från föregående prov; **eller** farten sjunker, inom 0,1 s, mer än tröskeln skulle ta på 0,1 s plus 1,5 m/s. Bara på marken och lugnt, och bara när bilen var snabbare än 5 m/s.
- Träffade prov inom **0,4 s** är en och samma träff.
- **Före / efter**: den högsta farten under de 0,15 s före; den lägsta fram till 0,3 s efter det sista träffade provet.
- **Inte en träff**: fart borta utan kraft bakom den – den högsta horisontella accelerationen inom 0,1 s under det större av `G` och 25 m/s² – är spelet som spolar tillbaka eller återställer bilen.
- **Krasch** när den tog **30 km/h** eller mer, eller tog bort mer än hälften av dess fart; **träff** annars – en törn, en skrapning längs en vägg.
- **Riktning**: längsgående acceleration större än sidledes, och negativ: *frontalt*; positiv: *bakifrån*; sidledes större: *längs sidan*. Utan accelerationer: frontalt.

Vad en bil kan göra mäts med alla träffar utelämnade, från 0,1 s före dem till 1 s efter (`struckMask`).

## Texterna {#the-texts}

Varje händelse beskrivs med båda varven nämnda, med var det är (meter längs referensen), farten den började med, hur långt över gränsen mot det andra varvet, och ett tips. Tipset följer av sorten och vad som mättes:

| Händelse | Tips |
|---|---|
| låsning, bara framhjul | ett låst framhjul kan inte styra: mindre tryck i början av zonen, släpp av det in i kurvan |
| låsning, bara bakhjul | ett låst bakhjul låter bilen rotera: bromsa mer rakt fram, släpp lite när du svänger in; flytta fördelningen framåt om det fortsätter |
| låsning, löst underlag | ett låst hjul plöjer: klämma till strax före låsning |
| låsning, annars | för mycket pedal för greppet: tryck mer gradvis |
| hjulspinn | ge gasen när ratten räta ut sig, kör snabbt upp i växlarna där dragkraften begränsar (på löst underlag: en högre växel mjukar upp vridmomentet) |
| snurr / överstyrning | efter pedalen: under bromsning (för hård trailbromsning, en för tidig nedväxling), släppt (släppgas-överstyrning: håll en jämn gas), på gasen (för mycket medan den ännu är vriden), ingen av dem (vred in för snabbt); ”fångad med motstyrning” när motstyrning användes; på löst underlag eller i rally, ”någon vinkel är det snabba sättet runt – den andra körningens räckte”. |
| understyrning | mer ratt gör ingenting när framdelen väl gått: kom in långsammare, dra lite broms för att ladda framdelen, räta ut; på löst underlag, vrid bilen med en lättning eller ett lätt tryck med vänster fot |
| träff / krasch | längs sidan: en meter marginal kostar mindre än skrapningen; bakifrån: en annan bil eller att man glider baklänges; ett frontalt haveri: bromsa tidigare; en törn fram: man tog i något. ”X träffade där också.” när den delas |

I Trackmania gäller dessutom: under cirka **400 km/h** (**300** på löst underlag: grus, gräs, plast) ger en glidning mindre drivkraft än att hålla greppet; över det ger en speedslide i rätt vinkel vinst, och den här kostade tid, så dess vinkel var fel.

## Vad varje källa tillåter {#what-each-source-allows}

| Varven innehåller | Låsningar / hjulspinn | Överstyrning / snurr | Understyrning |
|---|---|---|---|
| glidkvot och slipvinkel per hjul, bilens hastighetsvektor (Forza Data Out, AC-spelen) | från glid | från driftvinkel, eller bakre slipvinkel | från slipvinklar |
| hjulhastigheter, världens hastighetsvektor (rallyspel, BeamNG) | från härledd glid | från härledd driftvinkel | från styrning per krökning |
| gir och girhastighet, ingen glid (iRacing) | - | från driftvinkeln (den anpassade girningen mot färdriktningen); från attitydhastigheten med motstyrning bara när girningen inte kan litas på | från styrning per krökning |
| bara riktning | - | från riktningen mot färdriktningen | från styrning per krökning |
| enbart FH Companion-varvfil (ingen gir, ingen glid) | - | - | från styrning per krökning (den har styrning och accelerationer) |

Träffar och krascher behöver bara fart (bättre med accelerationer), så varje källa har dem. Avsnittet **Bilkontroll** visar vad varje källa tillåter: med enbart en FH Companion-varvfil dess utskjutningar från ratten och dess träffar, och tipset att läsa in `.tele.gz` för resten.

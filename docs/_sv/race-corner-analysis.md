---
title: "Kurva för kurva-analys"
parent: "Racinganalys"
nav_order: 55
lang: "sv"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Kurva för kurva-analys

Två varv på samma bana jämförs kurva för kurva. För varje kurva säger visaren vem som var snabbare, hur mycket tid det var värt och varför: bromsade för tidigt, kom på gasen sent, tog en bredare linje. Då vet du vad du ska öva på först.

![Ett fynd öppnat under Var det finns tid att hämta, bredvid tabellen Kurva för kurva](../assets/img/en/race-corner-finding.webp)

Ett utarbetat exempel: i kurva 3 bromsar Driver A 20 m tidigare än Driver B och förlorar 0,15 s på vägen dit, men är på gasen tidigare och vinner 0,15 s på vägen ut. Netto 0,00 s: kurvan är jämn, och ingen får höra att bromsa senare.

## Vad du ser {#what-you-see}

### Var det finns tid att hämta {#where-to-improve}

Sidopanelens avsnitt för det fokuserade varvet ("Läs in minst två varv av samma bana." tills dess).

**Rubriken:** "<varv> <tid> mot <referens> <tid>" och varvtidsskillnaden. För referensen står det i stället "mot det snabbaste andra varvet genom varje kurva (…)" och summan det förlorade. Bredvid den delas förlusten upp i *körning* och *bil / situation*.

**Fältet för uppdelning:** tiden som förlorats per orsaksgrupp (inbromsning, insväng, utgång, raka, bil, situation), i orsakernas färger, med en förklaring.

**Fynden**, tre listor:

1. Körförluster, dyrast först, högst **12** - eller "Ingenstans där annorlunda körning skulle vinna tid sticker ut."
2. **Visa vad bilen eller situationen kostade (X s)** - förluster för bil och situation, högst 8 (på som standard).
3. **Där <varv> är snabbare, eller jämnt på annat sätt (N)** - vinster och jämna kurvor, högst 10 (på som standard).

Varje fynd visar sin rang, sin titel (kurvan och vad som hände, med kostnaden för en förlust), omdömesraden, kostnaden (vinster med minus) med ett stapelfält, och en bricka: *inbromsning*, *insväng*, *utgång*, *raka* (körförluster, med "· bil X" när bilen förklarar 0,02 s eller mer), *bil*, *situation*, *snabbare*, *jämnt*. **Klicka på ett** för att ställa upp bilarna 40 m före den, rama in den och spela upp den, och öppna dess mätvärden:

- **Inbromsning:** var var och en bromsade (eller släppte gasen) och från vilken fart, och hur många meter tidigare eller senare (från 5 m);
- **Långsammast:** varje varvs lägsta fart och var;
- **Full gas:** var varje var platt, och hur mycket tidigare eller senare;
- **Linje:** skillnad i insväng, snävaste radier, hur långt in eller ut, och varje varvs linjeform och apex;
- **Raka till nästa kurva:** dess längd, båda farterna där båda var platta, vad den förlorade eller vann och av vad - startfarten, den andras starkare dragkraft, ett gassläpp, fart som skrubbades bort, hur den kördes (delar från 0,02 s);
- **Bilen:** hur stor del av förlusten som är bilen, och av vad (dragkraft, grepp, bromsar; när 0,02 s eller mer);

sedan tipset, **Bilarna:** (i olika bilar, se [Bilprofiler](race-car-profiles.md#what-the-cars-decide-in-a-corner)), och linjerådet.

### Kurva för kurva {#corner-by-corner}

En tabell (med två eller fler varv), en rad per sektion, för det fokuserade varvets klass när det finns flera klasser:

| Kolumn | Visar |
|---|---|
| Kurva | `T3`, `T11-T12` |
| Snabbast | varvet som var snabbast genom den (dess egen tid från sektionens början till slut) |
| med | dess marginal mot den näst snabbaste, s |
| linje | den snabbaste varvets form och apex ("V · sen", "U/V · mitt"); håll musen över för dess snävaste, insvängs- och utgångsradier; "åt båda hållen" för ett blandat komplex |
| (det fokuserade varvet) | hur långt bakom den snabbaste det var, eller ✓ när det var det snabbaste |

Om du klickar på en rad öppnas det fokuserade varvets fynd där (eller så ställs bilarna upp 40 m före sektionen). Under tabellen, när varje kurva har en tid: "Det snabbaste genom varje kurva, sammansatt: <tid> (± mot referensen / mot det bästa i klass X)" - de bästa sektionerna plus den snabbaste körningen till första kurvan när den är en egen sträcka.

## Så räknas det ut {#how-it-is-worked-out}

Den styrande regeln: **en kurva bedöms som en helhet**, från bromszonen för den till bromszonen för nästa. Ett varv som bromsar tidigare för att få bilen att svänga och få kraften tidigare, får kredit för utgången det köpte, och det får inte höra att bromsa senare.

## En sträckaxel {#one-distance-axis}

Varv jämförs efter sträcka, inte tid. En sekund efter befinner sig två varv i olika kurvor. Inte heller efter varje varvs egen mätare (en snävare linje täcker färre meter). Den **referens**-körda vägen för varvet är axeln:

- Varje annat varvs samplingar **projiceras** på referensens väg: varje sampling får `s`, hur långt längs referensen den är, och `d`, hur långt åt vänster (positivt) eller höger. Sökningen går framåt från föregående träff (8 vägsegment bakåt till 40 framåt), så ett varv som korsar sig själv över eller under hoppar aldrig över till den andra korsningen. Det första samplet söks i den första fjärdedelen av vägen (på en bana sammanfaller start och mål). När inget ligger inom 30 m, tas den närmaste punkten var som helst som inte ligger bakom sista träffen (efter ett snurr eller en utflykt). `s` minskar aldrig: ett sampel som projiceras bakom det föregående hålls kvar.
- Varje kanal **samplas om** till ett gemensamt rutnät, **var 2 m**, linjärt. Kanaler som hoppar (växel, flaggor) tar närmaste sampel. Utanför ett varvs eget intervall är värdena tomma.
- Ett varvs första och sista sampel projiceras något innanför referensens ändar, så varje varv **bärs upp till 15 m** förbi sina ändar med den fart det hade (tiden växer med sträcka delat med fart, resten hålls) - så dess delta vid mållinjen är dess varvtidsskillnad.
- `delta` = varvets tid vid varje rutnätspunkt minus referensens: gapet. `lateral` = `d` på rutnätet.

Den tid ett varv tog mer än ett annat mellan två rutnätspunkter är skillnaden mellan deras deltan: `rel(s)`. Allt nedan bygger på den.

## Kurvor {#corners}

Hittas på **referensen** (`findCorners`), med dess fart utjämnad över ±6 m och dess krökning (riktningsändring över ±5 sampel, utjämnad över ±10 m):

1. **Farts-minima med framträdande.** En punkt som är lägst inom ±40 m, vars fall från den högsta farten på vardera sidan (före ett lägre minimum) är minst `max(2,5 m/s, 6 % av farten)`.
2. **Knyckar.** En lokal topp i krökningen som är snävare än **300 m** radie utan något farts-minimum inom 80 m: en knyck som tas full gas är ändå en kurva att köra.
3. **Faser.** Från varje apex bakåt så länge referensen bromsar (> 0,1) eller inte är på full gas (< 0,95): insvängen; framåt så länge den inte är på full gas: utgången. En knyck som tas platt får ±30 m. Överlappande kurvor hålls isär men görs att täcka varvet tillsammans.
4. Numreras T1, T2 … i varvets ordning; **vänster eller höger** efter krökningens tecken och om världen är speglad (okänt räknas som speglat).

**Kurvfönstret** (där referensen svänger): ut från den snävaste punkten inom ±40 m från apex så länge krökningen ligger över en sjättedel av sin topp, plus 10 m på vardera sidan. Dess sida ger tecknet för "in".

## Sektioner: från bromszon till bromszon {#segments-braking-zone-to-braking-zone}

Varje kurva äger vägen halvvägs till apexen på vardera sidan. Där:

- **Varje varvs långsammaste punkt** är en verklig dipp i dess fart: ingenting långsammare inom 6 m (3 rutnätspunkter) på vardera sidan, och sökningen tittar förbi sträckans ändar, så att en föregående kurvas utgång som fortfarande accelererar in i den aldrig tas för den. Sökningen går från 15 m före kurvfönstret till 10 m efter det. Ett varv som aldrig saktade där placeras vid apex.
- **Var ett varv började sakta ner för den** (`entryOf`): bakåt från dess långsammaste punkt genom bromsningen eller gassläppet, över korta gasglimtar, tills det hade foten ner (gas ≥ 0,95, broms ≤ 0,1) i **10 m**. En gas som togs upp igen under de sista **30 m** före den långsammaste punkten hör fortfarande till kurvan. Helt på full gas hela vägen, är det den långsammaste punkten själv. Ett varv utan gaskanal, eller som aldrig hade foten ner sedan kurvan före, börjar vid sin snabbaste punkt däremellan.
- **Sektionen börjar** vid det första av alla varv som börjar sakta ner för den (4 m tidigare), och går till början av nästa, så att varje varvs inbromsning ligger inom den och sektionerna täcker varvet.

**Komplex.** Efter varandra följande kurvor som referensen aldrig kör full gas emellan - mindre än **40 m** full gas - är en sektion, "T11-T12", och körs som en. Ett komplex håller högst **tre** kurvor (en slingrig sektion som aldrig körs platt startar ett nytt). Ett komplex som svänger åt båda hållen är *blandat*: ingen enskild linjeform mäts för det.

**På en bana** (referensens slut ligger inom 50 m från där den började) fortsätter den sista sektionens raka över mållinjen till den första bromspunkten: ett flygande varv från mållinjen räknas med sista kurvan. Ett varv som startade stillastående eller vid en starttagning (se [Starten](#the-start)) håller den sträckan skild.

### Vad en kurva leder ut på {#what-a-corner-leads-onto}

Mäts på referensen: meter på full gas efter kurvan (från dess full gas till sektionens slut, plus sträckan över mållinjen) och före den (föregående sektionens "efter", eller från start).

| Typ | Regel |
|---|---|
| **mellan två raka** (`both`) | 200 m eller mer före **och** 120 m eller mer efter |
| **ut på en raka** | 200 m eller mer efter, eller 120 m eller mer efter och minst lika mycket som före |
| **efter en raka** | 200 m eller mer före |
| **länk** | allt annat |

## Vad varje varv gjorde i en kurva {#what-each-lap-did-in-a-corner}

`cornerMetrics`, per varv och sektion, på rutnätet (steg 2 m). Pedaler: broms räknas över 0,1, full gas är 0,95 och över.

| Mått | Regel |
|---|---|
| **bromspunkt** | den första bromsen under vilken gasen släpptes (under 0,5), eller som varade i **15 m** - en lätt beröring av vänsterfoten med effekt på är inte där inbromsningen började; med bara sådana beröringar, den första |
| **gas släppt** | utan broms, den första punkten där gasen gick under 0,8 |
| (inga pedaler) | punkten där varvet började sakta ner (ovan) |
| **bromsen släppt** | sista bromsningen upp till 30 m efter den långsammaste punkten |
| **fart vid bromspunkten**, **bromsmeter** | till den långsammaste punkten |
| **toppbromsning**, **topp-retardation** | över bromszonen (accelerationer över 45 m/s² ignoreras) |
| **trailbromsning** | meter med broms > 0,05 och |styrning| > 0,1 |
| **låsningsslip** | det mest negativa hjulets slipförhållande i zonen (när varvet har slip) |
| **långsammaste punkt**, **lägsta fart** | som ovan |
| **gas på** | efter släppet (eller den långsammaste punkten), den första gasen > 0,15 utan broms |
| **full gas** | den första punkten efter det som hölls på ≥ 0,95 i 10 m |
| **frirullning** | meter från släppet till gas på, med broms och gas båda under 0,05 |
| **gasdippar** | gånger gasen föll mer än 0,25 under sin löpande topp mellan gas på och full gas |
| **topp sidled** | den största sidaccelerationen från 20 m före släppet till det senare av full gas och 20 m efter den långsammaste punkten |
| **växel vid apex** | vid den långsammaste punkten |
| **hjulspinn** | det största drivna hjulets slipförhållande mellan gas på och full gas |
| **balans** | framför minus bak slipvinkel genom mitten (+ understyrning) |
| **raka på full gas** | andelen av sektionen efter full gas (och sträckan över mållinjen) på ≥ 0,95; det längsta gassläppet på den |
| **fart skrubbad bort** | den största farten som förlorats från en hög punkt med gas ≥ 0,9, ingen broms, på marken |
| **driftvinkel vid insvängen** | den största driftvinkeln från bromspunkten till 5 m efter den långsammaste punkten, på marken |
| **handbroms** | var den kom på (> 0,2), upp till 10 m efter den långsammaste punkten |
| **luft** | sekunder i luften över sektionen, och dess längsta flygning |

## Vem varje varv jämförs med {#who-each-lap-is-compared-with}

- Ett varv jämförs med **det snabbaste kompletta varvet i sin egen prestandaklass** (referensen, i referensens klass).
- Det klassbästa varvet självt (och referensen) jämförs, sektion för sektion, med **det andra varv i sin klass som var snabbast** genom den - eller med vilket varv som helst, när det är ensamt i sin klass.

Tidskartan, gapen i varvlistan, bilens kontrollhändelser och kurvtabellen följer samma jämförelse.

## Tidsredovisningen för en kurva {#the-time-account-of-a-corner}

`compareCorner`, för ett varv mot det andra över en sektion:

- **netto** = `rel(slut) - rel(start)` (plus sträckan över mållinjen på ett flygande varv): omdömet. Närmare än **0,03 s** är **jämnt**.
- **Uppdelningen** - var inne i kurvan den ledande svängde: på sträckan från första bromspunkten eller långsammaste punkten för något av varven till det senare av deras full gas- och långsammaste punkter, den största svängningen som varvet då gav tillbaka eller vann tillbaka, när den svängningen är över **0,04 s**; annars den senare av de två långsammaste punkterna.
- **Till apex** = `rel(delning) - rel(start)`; **efter den** = netto minus det. När båda är minst 0,04 s och av motsatt tecken, har varvet **tradat** det ena mot det andra.
- **Efter den** delas det igen där båda varven är full gas: **utgången** (delningen till den senare fulla gasen) och **rakan** (från där till slutet).
- **Rakan** delas på tre sätt:
  - *utgångsfart* (`byExit`) - mätt, inte modellerad: den långsammare bilen passerar den snabbare bilens startfart en bit nerför rakan, och därifrån är dess egen kurva vad den skulle ha gjort från den farten, med sin egen växling, luftmotstånd och lutning inbyggda. Förskjuten tillbaka till den punkten (och körd vidare med sin sluthastighet för de meter den vinner) är det dess tid från den snabbare startfarten. Skillnaden är utgångsfartens kostnad. När den långsammare bilen aldrig når den farten (eller bara i de sista 2 samplen), läggs dess egen acceleration längs sträckan tillbaka som effekt (`a·v` hålls), aldrig hårdare än dess hölje visar vid den farten (två gånger den uppmätta accelerationen utan hölje).
  - *bilarnas dragkraft* (`byPower`) - bara i olika bilar: båda bilarna från samma fart över samma meter, full gas, och integrerar den acceleration på full gas som var och en har visat vid varje fart.
  - *hur den kördes* (`driven`) - resten: ett gassläpp, fart skrubbad bort på full gas.

  Utgångsfarten förklarar aldrig mer än rakans kostnad (och aldrig med motsatt tecken), om inte ett gassläpp eller skrubbad fart tog något tillbaka. Ett varv **släppte gasen** på rakan när dess andel på full gas är under både 0,9 och den andras andel minus 0,05. Skrubbad fart räknas när de två skiljer sig med mer än 1 m/s. En meningsskiljaktighet under 0,02 s i tecken sätts till 0.

Varje sektions netto summerar till varvtidsskillnaden, och varje kurvas till-apex och efter-apex summerar till dess netto (testerna kontrollerar båda).

### Bilens andel {#the-cars-share}

Bara när varven är i **olika bilar** och varvet förlorade tid (`carShare`):

- **dragkraft**: bilarnas dragkraft nerför rakan (ovan), upp till förlusten;
- **grepp**: när varvet var vid sin bils gräns (sidaccelerationen i mitten minst **90 %** av vad dess bil håller vid den farten) och den andra bilen håller mer än **5 %** mer: av den lägre minsta farten som inte förklaras av en snävare radie, andelen `½ ln(grepp_annan / grepp_min) / ln(fart_annan / fart_min)` av den kvarvarande förlusten;
- **bromsar**: när varvet bromsade (inte släppte gasen), bromsar den andra bilen över **5 %** hårdare, och varvets *genomsnittliga* retardation över zonen var minst **80 %** av vad dess bil klarar: från `u` ner till `v` vid `a1` mot `a2`, och slutar på samma punkt, `(1/a1 - 1/a2)(u - v)² / 2u`, upp till det som återstår.

Bilens kostnad är summan, högst förlusten.

## Omdömet och fyndet {#the-verdict-and-the-finding}

`cornerFinding` skriver högst ett fynd per varv och kurva, prövat i denna ordning:

| Fall | Fynd | Utfall |
|---|---|---|
| netto inom ±0,03 s, en avvägning, mindre sidan ≥ **0,1 s** | **jämnt, två vägar genom** - vem som var långsam in och snabb ut, vem som gjorde tvärtom; med en rak efter den (ut på en raka, eller mellan två), är långsam-in-snabb-ut-vägen den att bygga på: behåll dess tidiga gas, vinn tillbaka insvängen genom att bromsa hårdare, inte senare | jämnt |
| netto inom ±0,03 s i övrigt | inget sägs | - |
| vunnit, en avvägning, förlorat till apex | **långsam in, snabb ut lönade sig**: behåll den, här är utgången värd mer | vinst |
| vunnit, en avvägning, vunnit till apex | **snabbare på vägen in**: insvängen är rätt, en tidigare full gas skulle behålla mer | vinst |
| vunnit, och det andra varvet har en förlust här | **snabbare - på grund av vad den andra gjorde**, dess orsak och dess tips sa "För det andra varvet: …" | vinst |
| vunnit i övrigt | **snabbare på vägen in / ut**, efter vilken halva som vann mer (bromsat senare, mer fart genom mitten; eller platt tidigare, starkare dragkraft) | vinst |
| förlorat, och en **träff eller krasch** kostade minst `max(0,05 s, 40 % av förlusten)` | nedslaget är kurvans historia, före bilarna | förlust |
| förlorat, och **bilens andel** är 60 % eller mer | **bilen**: dess dragkraft nerför rakan, dess grepp genom mitten, eller dess bromsar - den största delen; med förarens del (≥ 0,03 s) sagd som "De andra X s: …" | förlust |
| förlorat, och ett ensamt **fel i bilkontrollen** kostade minst `max(0,05 s, 40 %)` | det felet (se nedan), med hur tiden flyttade runt det | förlust |
| förlorat, och en **längre flygning** kostade minst `max(0,05 s, 40 %)` | flygningen | förlust |
| förlorat, en avvägning, vunnit till apex | **för snabbt in, långsamt ut**: utgångens orsak; ge upp lite insväng för att få bilen att vrida sig och platt tidigare, med det andra varvets broms- och full gas-punkter. Dess rot (`cause`, det som [statistiken](race-course-statistics.md) räknar): bromsat senare, när den bromsade några meter mer än den andra; annars utgångens orsak | förlust |
| förlorat, en avvägning, förlorat till apex | **gav bort mer på vägen in än utgången vann tillbaka**: insvängens orsak, som också är dess rot (`cause`); behåll utgången, förlora mindre på vägen in | förlust |
| förlorat, gassläppt på rakan, och den körda delen över hälften av förlusten | **inte full gas på rakan**: andelen av den på full gas mot den andras, var och hur länge gassläppet var | förlust |
| förlorat, bilarnas dragkraft över 60 % av förlusten och rakan över hälften | **bilens dragkraft nerför rakan** (med båda bilarnas dragkraft vid 160 km/h) | förlust |
| förlorat i övrigt | orsaken till den halva som förlorade mer (till apex ≥ efter den: insvängens; annars utgångens). Långsammare ut bara för att långsammare genom mitten (med mer än 1 m/s): i stället mittens orsak | förlust |

Ett fynd om en förlust kan också sluta med **Även:** - fart skrubbad bort på full gas, eller ett gassläpp på rakan - när den körda delen av rakan kostade mer än 0,04 s och det inte redan var orsaken.

Fynden sorteras: förluster först, dyrast först; sedan vinster och jämna kurvor.

### Orsaker på vägen in {#causes-on-the-way-in}

`entryCause`, den första som gäller (skillnader i minsta fart är i m/s; "5 m" är gränsen för när en tidigare eller senare punkt räknas):

| # | Orsak (misstag) | Regel |
|---|---|---|
| 1 | en träff eller krasch på vägen in | ett ensamt nedslag som börjar senast 10 m efter den långsammaste punkten |
| 2 | **nästan stannad** (incident) | lägsta fart under **60 %** av vad den här bilens grepp tillåter där den andra gick igenom (`v_annan · √(grepp_min / grepp_annan)` när den andra bilen har mer grepp, annars den andras fart), det andra varvet över 8 m/s - ett snurr, kontakt eller en missad kurva |
| 3 | ett fel i bilkontrollen på vägen in | ett ensamt lås, understyrning, snurr eller sladd som inte är på gasen, som börjar senast 10 m efter den långsammaste punkten, kostade ≥ 0,02 s |
| 4 | en längre flygning före den långsammaste punkten | se [rally](#rally-rotation-and-flights) |
| 5 | **gassläpp** där den andra förblev platt eller släppte 5 m eller mer senare | det här varvet bara släppte gasen |
| 6 | **bromsade där den andra bara släppte gasen** eller förblev platt | och var mer än 0,5 m/s långsammare genom mitten |
| 7 | **bromsade försiktigt** | det bromsade (inte släppte gasen), hade utrymme att bromsa hårdare - med däckdata, dess låsningsslip under **60 %** av slipen där den här bilens bromsar ger sitt bästa; utan den, en topp-retardation under **85 %** av vad den visar vid den farten - pedalen under 0,95, och det andra varvets topp-retardation mer än **15 %** högre |
| 8 | **bromsade tidigt** - eller **bilens bromsar** | bromsade mer än 5 m före den andra. I en annan bil vars bromsar är över 5 % starkare, och med högst 10 m marginal mot sträckan den här bilen behöver vid sin egen retardation: bilens bromsar. Annars bromsade tidigt, med "Bromsa senare - ungefär N m" (i en annan bil, metrarna över vad den behöver) |
| 9 | **frirullade** | mer än 10 m utan någon pedal, och 5 m mer än den andra |
| 10 | **långsammare genom mitten** | mer än 0,5 m/s långsammare vid den långsammaste punkten; delas efter `v² = a·R` (nedan) |
| 11 | **kom in långsammare** | över 1 m/s långsammare vid bromspunkten, inte bromsat tidigt: avgjort före - av kurvan före och bilens dragkraft, eller av en flygning i kurvan före som var 0,2 s längre. Bilens när bilarna skiljer sig åt |
| 12 | långsammare till apex | i övrigt: släpp bromsen mjukare och rulla in mer fart i mitten |

**Långsammare genom mitten** (`middleSplit`): varje varvs radie vid sin långsammaste punkt mäts från dess egen väg (±8 m), dess sidacceleration som `v²/R`, och

`ln(v_annan / v_min) = ½ ln(a_annan / a_min) + ½ ln(R_annan / R_min)`.

- Radien förklarar **hälften eller mer**: **för snäv linje** - "använd mer av vägen", med båda radierna och andelen.
- Vid bilens gräns (glider över 10° drift på asfalt / 20° på löst underlag, eller sidaccelerationen minst 90 % av vad den håller vid den farten) och den andra bilen har över 5 % mer grepp: **bilens grepp**; skydda utgången i stället.
- Glider genom den (drift över 10° / 20°) och det andra varvet gjorde inte det (dess driftvinkel vid insvängen minst 4° mindre): **på tvären** - bortom sitt grepp, inte under det; kom in lite långsammare. Sägs som bilens när den här bilen fångar sin bakvagn minst en gång per varv mer än den andra.
- I en annan bil som håller under **96 %** av den andras grepp, och varvet bar inom 1 m/s av `v_annan · √(grepp_min / grepp_annan)`: **bilens grepp** - "bromsa senare kommer inte att täcka det".
- Annars **grepp över**: sidaccelerationen mot den andras på en liknande radie, och vad den här bilen håller; bär mer fart till apex. Där den här bilens bakvagn släpper innan dess grepp är förbrukat (dess glidningar börjar under 85 % av dess grepp, och varvet var på 80 % av det), hitta resten i små steg.

### Orsaker på vägen ut {#causes-on-the-way-out}

`exitCause`, den första som gäller:

| # | Orsak (misstag) | Regel |
|---|---|---|
| 1 | ett fel i bilkontrollen på vägen ut | ensamt hjulspinn, snurr, sladd eller nedslag som slutar vid eller efter 10 m före den långsammaste punkten |
| 2 | **skrubbad fart** | mer än 1 m/s mer fart förlorad på full gas än den andra; över **7 m/s (25 km/h)** "mer likt en kontakt eller ett snurr än en sladd" |
| 3 | **vred bilen fel** (löst underlag) | se [rally](#rally-rotation-and-flights) |
| 4 | **på kraften senare** | gas på mer än 5 m senare, räknat från varje varvs egen långsammaste punkt också (ett varv vars långsammaste punkt är senare skylls inte för en senare gas) |
| 5 | **tvekade på gasen** | fler gasdippar än den andra |
| 6 | **körde brett och väntade** | mer än 1,5 m utanför den andra där båda var platta, och full gas mer än 5 m senare från dess egen långsammaste punkt |
| 7 | **full gas senare** | full gas mer än 5 m senare, även från dess egen långsammaste punkt; med bilens acceleration där |
| 8 | **bilens drivning** | i en annan bil som drar under 95 % av den andra vid den farten, och dragkraften förklarade en del av rakan |
| 9 | **långsammare ut ur kurvan** | i övrigt: en senare apex, så bilen är rak tidigare |

När de två varven var i olika växlar vid den långsammaste punkten, slutar tipset med "Växel N vid apex; den andra använde M."

### Fel i bilkontrollen och nedslag {#car-control-faults-and-impacts}

Ett fel från [Bilens kontrollhändelser](race-control-events.md) som orsak: ett lås är en *bromsorsak*, hjulspinn eller en sladd på gasen en *utgångsorsak*, resten *insväng*. Ett nedslag efter den långsammaste punkten är *utgång*, före den *insväng*. Tipset är händelsens eget, sedan "Det kostade ungefär X s fram till 40 m efter den" (eller "tills bilen hade fått tillbaka farten" för ett nedslag). Ett lås med en bromspunkt mer än 5 m tidigare än den andras lägger till att varvet bromsade tidigt också - med hjulen som snurrade hade det inte behövts.

### Rally: rotation och flygningar {#rally-rotation-and-flights}

På **löst underlag**, med driftvinklar på båda varven, och det här varvet på kraften (eller platt) mer än 5 m senare:

- **Vred bilen mindre**: det andra hade bilen vriden **12°** eller mer vid sin långsammaste punkt och minst **8°** mer än det här varvet. Tips: ett gassläpp eller en lätt tryckning på bromsen med vänsterfoten när bilen vrider in, med det andra varvets handbromspunkt när bara det använde en, eller handbromsen i en kurva långsammare än 15 m/s (54 km/h).
- **Vred den för långt**: det här varvet hade den vriden 12° eller mer och minst **12°** mer än det andra: den behövde räta upp innan kraften kunde gå på.

**En längre flygning**: i luften 0,2 s eller mer längre än den andra, och kostade minst 0,03 s från 10 m före avfärden till 40 m efter landningen (eller sektionens slut). Före den långsammaste punkten är det en insvängsorsak; det blir kurvans historia när den förklarar 40 % eller mer. Tipset: håll gasen på vid avfärden, ta krönet lite långsammare eller med en lätt tryckning på bromsen.

### Starten {#the-start}

Före första kurvan, på en sprint eller när något av varven började stillastående (under 5 m/s där båda är först på axeln) eller vid en starttagning (under 60 % av den andras fart), är sträckan till första bromspunkten ett eget fynd (kurva 0) när den skiljer sig med mer än 0,03 s: *Starten*, *Starten på loppet* eller *Till första kurvan*. En förlust där tillskrivs situationen (*situation*) när ett varv började vid en starttagning och det andra i fart, bilen när varven är i olika bilar, och föraren i övrigt. Tipsen: i en annan bil från stillastående, "mest bilen"; en stillastående start i samma bil, starta med mindre hjulspinn och växla i övre delen av effektbandet; en starttagning, jämför den med ett annat första varv; en flygande start, en bättre utgång från sista kurvan tas med över mållinjen.

## Den körda linjen {#the-driven-line}

`lineMetrics`, per varv och sektion (inte för blandade komplex), enbart från positioner (utjämnade ±2 sampel) över kurvfönstret:

| Mått | Regel |
|---|---|
| krökning | riktningsändring över ±8 m av varvets egna väg |
| **snävaste radie** | 1 / topp-krökningen |
| **insväng** / **utgång ut** | där krökningen först / sist överstiger en femtedel av sin topp |
| **mitt** | där varvet hade svängt halva sin riktningsändring |
| radie in / ut | körda meter över halva riktningsändringen, före / efter mitten |
| **form** | snävaste radie delat med medelradien under svängen: under **0,55** ett **V**, över **0,75** ett **U**, mellan "U/V" |
| **apex** | radie ut delat med radie in: över **1,25** sen, under **0,8** tidig, annars mitt |
| **farts-apex** | den långsammaste punkten mer än **15 m** före mitten: långsam in, snabb ut; mer än 15 m efter: fortfarande bromsande förbi mitten |

Mot det andra varvet: hur långt in (+) eller ut det körde vid insvängen, genom den snävaste delen och där båda var platta (sägs från 1 m); där var och en svängde in (sägs från 8 m).

### Vilken linje som passar bilen här {#which-line-suits-this-car-here}

`lineFor`, utifrån vad kurvan leder ut på och bilens karaktär i den kurvan:

- **effekt-mot-grepp** = bilens acceleration på full gas vid utgångsfarten delat med dess grepp vid minsta fart (från dess hölje). **Point and shoot** vid **0,45** och över; **momentum** vid **0,25** och under.
- **downforce**: grepp vid 151-252 km/h delat med grepp vid 54-108 km/h på **1,15** eller mer, för en kurva som tas vid **144 km/h** (40 m/s) eller snabbare - då är det en momentumkurva oavsett effekt. Bedöms inte på löst underlag.

| Kurvtyp | Bil | Linje |
|---|---|---|
| efter en raka | point and shoot / annan | V / U, apex i mitten: "bromszonen är priset" |
| mellan två raka | momentum / annan | U / V, sen apex |
| länk | momentum / annan | U / V, apex i mitten: "kör den för nästa kurvas utgång" |
| ut på en raka | momentum (eller en snabb downforce-kurva) | bred rund U, något sen apex |
| ut på en raka | point and shoot | V: bromsa rakt, sväng in sent, rotera i en kort, snäv mitt, rak tidigt |
| ut på en raka | något mittemellan | U med sen apex: långsamt in, snabbt ut |

Där utgången spelar roll (ut på en raka, mellan två) lägger drivlinan till en mening: **FWD** - rotera den på bromsen, lägg på kraft först när hjulet rullar ut; **RWD** med effekt-mot-grepp på 0,35 eller mer - räta upp den innan full gas; **AWD** - den kan ta kraft medan den fortfarande svänger. På löst underlag lägger varje linje till: vrid bilen på väg in.

Meningen säger sedan vad varvet körde, och om det passar: *långsammast sent binder upp utgången* eller *en tidig apex binder upp utgången* där en sen apex var önskad och varvet varken hade sen apex eller var långsammast tidigt; *rundare än den här bilen vill ha* där ett V var önskat; *kantigare än den här bilen vill ha* där ett U var önskat; annars *det passar*.

## För utvecklare {#for-developers}

Kod: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Resonemanget och dess källor: [metoden](race-analytics.md).

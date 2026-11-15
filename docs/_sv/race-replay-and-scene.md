---
title: "Uppspelning och 3D-scenen"
parent: "Racinganalys"
nav_order: 52
lang: "sv"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Uppspelning och 3D-scenen

Spela upp dina varv tillsammans, som ett lopp, och se var den ena bilen drar ifrån. Allt du ser i 3D-vyn på fliken **Racinganalys** beskrivs här: de körda linjerna, färgerna på banan, bilarna och etiketterna.

![Orsakskarta med bilarna uppställda 40 m före en kurva: färgad bana, två bilar och flaggstolpen](../assets/img/en/race-replay-lined-up.webp)

## Uppspelningsklockan {#the-replay-clock}

En klocka driver varje varv: sekunder av **referens**varvet. Motorn går
fram den varje bildruta under uppspelning (med bildtid × uppspelningshastighet); vid
slutet går den tillbaka till 0 när **Upprepa** är på, annars stannar den. Klockan är
med avsikt inte en del av lagret, så sidopanelen inte ritas om varje
bildruta; HUD:en och diagrammen prenumererar på den och uppdateras högst en gång per
bildruta.

**Uppspelningens längd** är det längsta något varv går på klockan: varje varvs
tid (minus dess förskjutning i *Uppställda*), eller referensens tid i
*Sida vid sida*.

## Transportfältet {#the-transport-bar}

Under vyn, från vänster till höger:

| Kontroll | Gör |
|---|---|
| ⏮ | tillbaka till början (även **Home**) |
| ▶ / ❚❚ | spela / pausa (även **K**) |
| hastighet | 0,25×, 0,5×, 1×, 2×, 4× |
| skrubbreglaget | ställer klockan direkt, i steg om 0,01 s |
| klocka | `tid / längd · meter`: klockan som varvtid, uppspelningens längd och hur långt på referensen referensbilen är |
| *Från start* / *Uppställda* / *Sida vid sida* | uppspelningsläget (nedan) |
| **Ställ upp här** | ställer varje bil där referensen är nu, och fortsätter därifrån |
| **Upprepa** | börja om vid slutet (på som standard) |
| **Dölj diagram** / **Visa diagram** | sträckdiagrammen under fältet |

Knapparna är inaktiverade tills varv är inlästa (ett varv räcker för att spela upp
det; jämförelser kräver två).

## Uppspelningslägen {#replay-modes}

Hur varje varvs egen tid följer av klockan:

| Läge | Varje varvs tid | Vad det visar |
|---|---|---|
| **Från start** (`start`) | klockan själv | varje varv från sin egen start: ett lopp mellan dem, gapet växer som det gjorde på banan |
| **Uppställda** (`anchor`) | klockan plus varvets förskjutning | varje bil på samma plats samma ögonblick, sedan släpps de - vad som händer från den punkten, inte från varvets start |
| **Sida vid sida** (`locked`) | tiden då varvet nådde referensens aktuella sträcka | varje bil hålls vid referensens sträcka hela varvet: hastigheter och pådrag jämförda meter för meter |

Använd det när:

- **Från start**: du vill se vem som leder och hur gapet växer.
- **Uppställda**: du vill veta vad som händer i en kurva eller på en raka, med alla jämnt startade där.
- **Sida vid sida**: du vill jämföra vad förarna gör med pedalerna och ratten på samma ställe på banan.

**Förskjutningar i *Uppställda*:** för ett ankare vid `s` meter längs referensen
är varje varvs förskjutning dess egen tid vid `s` minus referensens tid vid `s`,
båda lästa från de uppriktade varven (se
[en sträckaxel](race-corner-analysis.md#one-distance-axis)). Ett varv som
inte täcker `s` får förskjutningen 0. Att välja *Uppställda* från lägesknapparna
förankrar vid referensens aktuella sträcka.

En vit stolpe med en flagga (14 m hög) markerar ankaret i läget *Uppställda*.

### Uppställning {#lining-up}

| Åtgärd | Ankare | Klocka |
|---|---|---|
| **Ställ upp här** | där referensen är nu | oförändrad |
| Shift+klick på diagrammen | den klickade metern | 1,5 s innan referensen når den |
| ett fynd under *Var det finns tid att hämta*, en numrerad bricka på banan, en rad i *Kurva för kurva* med ett fynd | 40 m före där fyndets orsak börjar | 1,5 s innan den punkten; spelar sedan |
| en bilkontrollhändelse, en träffs etikett | 40 m före händelsen | 1,5 s innan; spelar sedan |
| ett varv i banstatistiken | som dess fynd eller händelse | som ovan, med det varvet i fokus |

Att titta på ett fynd ramar också in det med kameran - en sfär runt
mitten av fynder intervallet, med radien det största av 40 m och halva dess längd
plus 30 m (60 m för en händelse) - såvida inte kameran jagar en bil.

### Jaktkamera {#chase-camera}

⌖ i varvlistan gör att kameran följer den bilen: 2,5 + 4 × bilstorlek meter
bakom den och 0,9 + 1,1 × bilstorlek meter ovanför, riktad längs dess färdriktning,
lutad nedåt mot bilen, mjukt (20 % av vägen varje bildruta) så att den inte skakar vid varje
vingling. ⌖ igen släpper den. Den jagade bilen ritas något ljusare, med en vit ring på marken,
och dess kort markeras.

## Vydelen {#the-view-section}

| Kontroll | Standard | Gör |
|---|---|---|
| **Linjer** / **Tidskarta** / **Orsakskarta** / **Misstagskarta** | Tidskarta | vad som målas längs banan (nedan); *Linjer* målar ingenting |
| legend | - | *vinner ↔ förlorar* för tidskartan, orsakernas färger för orsakskartan, *få varv ↔ flest varv* för misstagskartan |
| **Körda linjer** | på | varje synligt varvs linje i dess färg |
| **Bilar** | på | bilarna och HUD-korten källor |
| **Däck & fjädring** | på | däcktemperatur, slipringar, fjäderstag och andra glyfer per hjul, och takljus på bilarna |
| **Etiketter** | på | kursnamn, numrerade brickor, träffetiketter och misstagskartans kurvetiketter |
| **Bana från varven** | på | en vägyta för en bana utan extraherad modell (dold när en banmodell är inläst) |
| **Alla värden på korten** | av | varje kanal som listas på varje HUD-kort |
| **Riktiga bilformer** | på | varje bil i formen av sin motsvarighet (se [Bilarna](#the-cars)); av: den öppna ensitsaren, som inte döljer något av telemetrin |
| **Bilstorlek** | 1× | 1× till 10× i steg om 0,5; 1× är bilens verkliga storlek, lika lång och bred som i spelet. Inget annat än detta reglage ändrar den |

## Körda linjer {#driven-lines}

Varje synligt varvs väg genom sina egna sampel, i dess färg, ritad
0,12 m under den inspelade positionen (en bils inspelade position är dess
referenspunkt, 0,28 till 0,47 m över vägen på extraherade Forza-banor).
En punkt behålls var 1,5 m; med fler än 10 synliga varv behåller de varv som inte
granskas en var 6 m (varje hörnpunkt skickas till GPU:n varje bildruta).

## Kartorna {#the-maps}

Alla tre är band längs **referens**vägen, 0,2 m under de
inspelade positionerna, en fyrhörning per 2 m rutnätssteg.

### Tidskarta (`where`) {#time-map-where}

För det fokuserade varvet: sekunder vunna eller förlorade per meter mot varvet det
jämförs med vid den punkten (det bästa i sin klass, eller för referensen det
snabbaste andra varvet genom varje sektion), från förändringen av det uppriktade
deltat per rutnätssteg, utjämnad över ±10 m. Rött där tid förloras, grönt
där den vinns, grått däremellan; färgskalan är 95:e percentilen av
de absoluta värdena, så toppar kapas och det mesta av varvet ligger inom intervallet.
6 m brett.

### Orsakskarta (`why`) {#cause-map-why}

För det fokuserade varvet: varje förlust målad över intervallet där dess **orsak**
finns (inte där tiden syns), färgad efter orsakens grupp, med det dyraste
fyndet som vinner där två överlappar. Bredd `3 + 9·√(kostnad / största kostnad)`
meter; där inget förlorades, en grå 2 m remsa. Fyndet som valts i
*Var det finns tid att hämta* målas vitt.

| Grupp | Färg | Fynd |
|---|---|---|
| inbromsning | orange | körförluster i bromsfasen |
| insväng | magenta | körförluster på vägen in och genom mitten |
| utgång | blå | körförluster på vägen ut |
| raka | gul | körförluster på rakan |
| bil | grå | det bilen förklarar |
| situation | mörkgrå | situationen (en starttagning mot ett flygande varv) |

### Misstagskarta {#mistake-map}

Hur många av alla varv (i de klasser som valts i banstatistiken) som gjorde ett
misstag vid varje meter - av alla slag, eller bara det som valts i
statistiken. Varje varv räknas en gång per meter; varje misstags intervall breddas
med 6 m på vardera sidan så att ett kort syns. Bredd `3 + 10·(varv / flest varv)`
meter och en färg från dämpat brunt till klart orange; grå 2 m där inget varv
gjorde ett. Se [Banstatistik](race-course-statistics.md#the-mistake-map).

## Bana från varven {#track-from-the-laps}

För ett spel vars bana inte har extraherats, ritas en väg under
linjerna: lika bred som varven sprider sig över referensen (sidoförskjutningar
inom 25 m räknas) plus 2 m på vardera sidan, minst 4 m på vardera sidan om
referenslinjen, utjämnad över ±8 rutnätspunkter (±16 m), i asfaltsgrå med
ljusa kantlinjer, 0,3 m under de inspelade positionerna. Dold när en banmodell
är inläst i **Nivå**.

## Träffar och krockar på banan {#hits-and-crashes-on-the-track}

Varje synligt varvs träffar och krockar (se
[Bilens kontrollhändelser](race-control-events.md#hits-and-crashes)) markeras
där de skedde, närhelst linjer eller bilar ritas: en spetsig stjärna - röd
för en krock, gul för en träff - på en stolpe, med en ring i varvets
färg vid foten, storlekad efter bilstorleken (krockar större). När en bil
passerar ögonblicket för en träff, sprider sig en stötvåg från den i 0,8 s.

## Hjälpläge {#help-mode}

**?** bredvid språkväljaren, eller tangenten **?** eller **F1**, slår på en nyckel till
varje färg på skärmen, på alla tre flikarna ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Valet finns kvar i den här webbläsaren.

- **Nyckeln** i hörnet på vyn listar färgerna för fliken och läget som används. Varje skala kommer från där vyn får den, så en värmeskala du har redigerat visas som redigerad. På racefliken listas bara det de inlästa varven har.
- **Varje bils kort** får en tabell över vad som ritas på dess hjul, efter namn, med varje hjuls värde i den färg det ritas i.
- **Bilen i fokus** får en etikett vid varje hjul som säger samma sak, placerad ute vid hörnen. Dold när bilen är för liten på skärmen för att de ska få plats.

## Bilarna {#the-cars}

**Varje bil i sin egen form**, i sitt varvs färg och i sin verkliga storlek. Formerna kommer från en bilfil, som görs en gång på datorn där spelet finns:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Utan en sådan fil ritas varje bil som **visarens egen bil** av dess slag och era:
sedan, kupé, halvkombi, kombi, sportbil, superbil, muscle car, terrängbil,
pickup, skåp eller mikrobil, var och en som en klassiker (före 1980), från 80- eller 90-talet, eller
modern ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). De byggs här från
allmänna proportioner: inga logotyper, inga modellnamn och inget från något spels
filer, så de levereras med visaren. Slaget kommer från bilens namn, eran från
årtalet i det; en bil med ingetdera tas från sin klass. Cirka hundra
verkliga generationer är kända via deras publicerade längd, bredd, höjd och
axelavstånd ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); en rad var, avrundad), så att en
3-serie från 1990-talet får den bilens storlek och hållning, fortfarande som en vanlig form utan
emblem eller grill.

Bilfilen görs på din egen dator av din egen kopia av spelet. Den innehåller en
lågdetaljerad modell av varje bil, cirka 900 trianglar, med
dess hjulpositioner (se [extraktorns kommando `cars`](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)).
**Läs in bilfil...** i vyinställningarna, eller att släppa filen på racefliken,
läser in den; den stannar i den här webbläsaren. Den innehåller spelets former, så
den är inget att skicka vidare, och visaren levereras utan några.

Vilken bil som står för ett varvs bil avgörs av vad som är inläst varje gång och
lagras aldrig, så en bil utan motsvarighet i dag får sin egen så snart en nyare
fil har den ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Varvets bil | Ritas som |
|---|---|
| dess nummer finns i filen för samma spel | just den bilen |
| samma märke, och ett ord av modellen i namnet | den modellen, närmast i år |
| samma märke, samma generation | märkets bil närmast i år |
| annat, med en bilfil | märkets närmaste om det finns en, annars samma slags kaross, närmast i år |
| en öppen hjulbil, efter sitt namn | ensitsaren nedan |
| ingen av de två första, och visaren känner igen bilen på dess storlek | visarens egen bil i den verkliga bilens storlek, med eller utan fil |
| annat utan fil | visarens egen bil av det slaget och den eran |

Så ett varv av en annan spelares 1990 BMW 3-serie visar en BMW från ungefär det året, och
en bil som är nyare än filen visar sin närmaste släkting tills filen görs om. Ett varvs verktygstips,
och raden under bilstorleken för varvet i fokus, säger vad den ritas som och hur nära det är.

Visarens egna bilar har mörka fönster. En bilfils modeller har en färg överallt,
eftersom filen saknar lack och glas att gå efter. Hjulen, bakljusen, lamporna och telemetriglyferna nedan ritas
som på ensitsaren; stötstången löper upp på utsidan av hjulet, där den syns, och
vishbonerna utelämnas.

**Ensitsaren** är en öppen hjulbil i varvets färg, så framsidan syns från varje vinkel och inget döljer hjulen: kaross, motorkåpa, sidolådor, förarhytt
med hjälm, halo, golv, fram- och bakvingar; fyra runda hjul, framhjulen vridna av
styrningen (upp till 0,5 rad vid full utslag), var och en på två
vishbones med styrled, spårstång (fram) eller drivaxel (bak), och en
stötstång. Modellen sänks 0,3 m från den inspelade positionen så att hjulen
ligger på vägen, och skalas med **Bilstorlek**.

**Karossen rör sig på sina fjädrar**: när varvet har alla fyra
fjäderutslagen, sjunker varje hörn med sitt utslag (överdrivet till 0,12 m
från full utfjädring till full ihopfjädring så att det syns från en jaktkamera), och
karossen sjunker, lutar i sidled och längsled på planet genom de fyra.

**Vad som ritas från telemetrin** (med *Däck & fjädring* på) följer
[kanaltabellen](race-charts-and-hud.md#the-channel-table):

| Glyf | Från | Ritning |
|---|---|---|
| däckfärg | `tireTemp` | däcket själv, blått kallt → cyan → grönt arbetande → gult → rött hett, över 40-130 °C |
| slipring | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (den största) | en ring på marken under hjulet, grön med grepp kvar, gul vid 0,66, röd vid 1 (greppets kant som spelet rapporterar den); svag under 0,3 |
| fjäderstång | `suspension` (0..1) | stötstången färgad efter utslag: blå utsträckt, vit i mitten, röd ihoptryckt |
| bromsglöd | `brakeTemp` (100-900 °C) | en skiva på hjulets yttre sida, mörk till orange |
| slitageband | `tireWear` (0..1) | ett band runt slitbanans kant, vitt när nytt → rött när slitet |
| lastmätare | `wheelLoad` (0-12 000 N) | en stolpe bredvid hjulet lika hög som lasten |

Bromsljusen (regnljus och vingändplattor) tänds med bromspedalen. Varje
`lamp`-kanal som är på (över halva sitt omfång) tänder en lampa
över luftintaget i dess färg: ABS i arbete, dragkontroll i arbete, DRS, depåbegränsaren,
handbromsen, i luften.

**I en folkmassa** (fler än 10 synliga), ritas de bilar som inte granskas
enkelt: kaross, vingar, hjul och bromsljus bara.

## Etiketter {#labels}

Fästa på banan och placerade varje bildruta från kamerans projektion
(utanför skärmen eller bakom kameran, dolda). Med **Etiketter** på:

| Etikett | Var | Klick |
|---|---|---|
| kursnamn (`T1`, `T2` …) | över varje kurvas apex på referensen | - |
| numrerade brickor 1-5 | det fokuserade varvets fem största körförluster, mitt i varje orsaks intervall, med kant i orsakens färg; håll musen över för titel och kostnad | ställ upp och spela upp det fyndet |
| träff- / krocketiketter | över varje skurs **fokuserade** varv: "Krock −45 km/h" / "Träff −12 km/h"; håll musen över för hela beskrivningen och tipset | ställ upp och spela upp nedslaget |
| misstagskartans kurvetiketter (i stället för kursnamn och brickor, när kartan är misstagskartan) | varje kurvas apex: "T3 · 5/40 tidig inbromsning" (det vanligaste misstaget, varv som gjorde det / varv som körde kurvan), "T3 · 5/40" när en slag valts, "T3 · ren" när inget; håll musen över för kurvans förluster och dess fem vanligaste misstag | öppna eller stäng kurvan i banstatistiken |

## Speglade världar {#mirrored-worlds}

Visarens värld är högerhänt med Y uppåt: sett uppifrån svänger en bil vars
färdriktning `atan2(dx, dz)` ökar åt vänster. Ett spel med en vänsterhänt värld - Forza bland dem - hamnar speglat: varje högersväng ritas som en vänstersväng, både banan och varven.

Varven säger det själva ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)):
genom att gå längs varje varv några meter (3 m) i taget jämförs vägens
kurvtagning med kompressionen i den yttre fjädringen (`suspension.FR` minus
`suspension.FL`) och, utan fjädring, med styrningen (positiv åt höger i varje adapter). Ett varv som svänger mindre än π totalt säger ingenting; bevis räknas när det överstiger 2 % av kurvtagningen. Varven röstar; ett lika resultat är "kan inte avgöra".

När varvens omdöme inte stämmer med den aktuella axelinversionen (ett udda antal inverterade axlar i **Kamera & scen → Invertera världens axel**), säger avsnittet **Varv** det under listan:

- spelet är speglat och inget är inverterat: "De här varven styr åt höger där banan ritas svänga åt vänster …" med **Invertera X**;
- axlar är inverterade men varven är inte speglade: "De inverterade axlarna ritar de här varven speglade …" med **Återställ axlarna**.

Bara ritningen ändras - en spegling som viks in i vymatrisen; datan,
analysen och varje koordinat som verktygen visar förblir spelets egna. Inversionen
sparas i webbläsaren. Analysen namnger kurvor vänster eller höger med samma
mätning (en okänd värld tas som speglad, precis som Forzas).

## För utvecklare {#for-developers}

Kod: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Vad en bil är i ett ögonblick {#what-a-car-is-at-a-moment}

`stateAt` interpolerar varje kanal mellan de två samplen runt
varvets tid. Kanaler som hoppar (växel, flaggor) tar närmaste sampel.
Ett varv som är slut parkeras på linjen.

**Kurs.** Färdriktningen kommer från positioner som ligger några meter isär (minst 2 m på vardera sidan, så att en vingling inte vrider bilen). Karossens kurs kommer från spelets gir bara när den har anpassats till
färdriktningen - tecken och förskjutning, med cirkelmedelvärde över sampel snabbare än
10 m/s (minst 20) - och bara om den då stämmer med den (cirkulär
varians under 0,05, cirka 18° spridning); annars pekar karossen längs
färdriktningen. Det håller en sladd synlig (karossen och färdriktningen isär)
utan att lita på ett spels vinkelkonvention.

**Styrning och sidor.** Vilket håll ett positivt styrutslag vrider bilen, och
vilken sida spelets högerhjul hör till, mäts från varvet: styrningen mot vägens
kurvtagning, och vilken sidas fjädring som pressas ihop på utsidan av kurvor (utan fjäderdata tas
Forza-spelen som speglade).

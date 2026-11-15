---
title: "Manövrar"
parent: "Insikter"
nav_order: 4
lang: "sv"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manövrar: så rör sig grupperna

**Insikter → Manövrar** följer hur enheterna på varje sida rör sig *som grupper* och ger namn åt de manövrar de gör – en flankattack, en tång, en genombrytning, ett bakhåll, en reträtt, ett missilförsvar, att korsa T. För varje manöver visas hur säker den är, siffrorna bakom den, om den lönade sig och dess paralleller i doktrin och historia. **Masanalys → Manövrar** räknar dem över tusentals matcher: hur ofta varje manöver görs per karta, läge och sida, och hur ofta den lönar sig.

Allt räknas ut i din webbläsare, i en egen arbetsprocess (`src/insights/maneuver`). En match med några hundra enheter tar 10–500 ms, ett tvåtimmars luftkrig med tusentals objekt ungefär en sekund.

## Så använder du den {#using-it}

- Öppna **Insikter**, fliken **Manövrar**. Den räknar när den öppnas första gången. Använd **Sök igen** efter att du ändrat filtren.
- **Säker / Trolig / Möjlig** väljer vilken säkerhet de visade manövrarna har (Trolig som standard).
- **Tidslinjen** har en bana per sida och en stapel per manöver. **Listan** under den visar samma sak, i tidsordning. Ett klick hoppar till repriset vid manöverns start, flyttar kameran dit och ritar upp den i 3D: varje grupps väg som en pil (en tångs båda armar är dess bågar), gruppernas konturer vid det viktiga ögonblicket (fiendens i sidans färg) och fiendens front som en vit linje. **Rita alla i 3D** lägger till matchens övriga manövrar, svagt. Linjerna skickas till grafikkortet en gång, när valet ändras, inte varje bildruta. Med 480 manövrar ritade under uppspelning är bildtiderna på ett riktigt grafikkort (WebGL2 och WebGPU, p99 18,0–18,5 ms, max 19,5–20,8 ms) desamma som utan dem.
- En öppnad manöver visar sitt utfall (dödade och förlorade enheter bland dem som gjorde den, medan den pågick och strax efter, jämfört med sidans eget utbyte under matchen), sina belägg och kunskapsbasens poster om den: doktrinen och de historiska parallellerna (Cannae för en tång, Sedan 1940 för en genombrytning, Tsushima för att korsa T, Operation Bolo för en skenmanöver …).
- Den lilla tabellen längst ner visar per slag och sida hur många som gjordes och hur många som lönade sig.

![En tång i den syntetiska demomatchen: båda armarnas pilar, fiendens kropp och dess front](../assets/img/en/maneuvers.webp)

## Så hittas grupperna {#how-groups-are-found}

Varje enhet läggs på en gemensam tidslinje (ett steg på 1 s till fots, annars 2 s, längre för mycket stora filer). Den hålls stilla vid en död, så att en återuppståndelse inte ritar en linje över kartan. Vid varje steg kopplas enheterna i en sida och ett slag (flygplan, fordon, fartyg, infanteri) ihop när de står nära varandra – 18 m till fots, 170 m för fordon, 3 km för fartyg och 5 km för flygplan – och rör sig likadant (hastigheterna inom hälften av den snabbares fart, eller att båda står stilla). Ett kluster behåller id:t för den grupp de flesta av medlemmarna tillhörde. En enhet utan klass räknas som fotgängare, fordon eller i luften efter sin fart.

En gruppens **form** läses mot dess riktning: en kolonn eller en linje efter hur de sprider sig längs och tvärs, en kil när mitten går först, ett echelon när medlemmarna står tillbaka åt ena sidan, en ruta när de håller hörnen.

Allt bedöms i matchens egen skala. **Engagemangsavståndet** `R` är det 75:e percentilen av avståndet mellan en dödare och dess offer (begränsat till domänens rimliga värden), och en manövers tider skalas efter enhetens slag (infanteriet en tredjedel av markens).

## Vad den hittar {#what-it-finds}

| Manöver | Hittas när |
|---|---|
| Formation | en grupp håller en form i 60 % av sina rörliga steg i 30 s |
| Frontalattack | en grupp närmar sig från utanför räckvidd till kontakt, ¾ R eller mer, från inom 35° av den riktning fienden vetter |
| Flankattack | samma sak från 50–130° (bakifrån bortom det); säker bara med en egen *fästkraft* som strider mot fienden där (dödade åt båda hållen) |
| Tång | två flankattacker från en sida mot samma fientliga kropp, från motsatta sidor (100° eller mer isär), inom 90 s; säker när armarna strider |
| Omringning | en kompakt fientlig grupp med minst lika många av den andra sidan runt sig inom 1,5 R, från två eller fler grupper, inga luckor över 100°, i en minut, avskuren från sin egen sida; säker när ringen slöts på ½ R och fickan stred |
| Genomträngning | en grupp passerar en hållen linje (fiender som står i 30 s både till vänster och höger om den, deras sidas mitt bortom dem); säker när den kommer ½ R bortom, stannar 20 s och strider där; en genombrytning ytterligare R bortom |
| Bunden bevakning | i en liten grupp rör sig en del medan resten står stilla, där rollerna byts fyra gånger eller oftare, med täckande eld från den stående delen |
| Koncentration / spridning | en sidas andel nära dess tätaste punkt stiger från 35 % till 60 % (enheter som kommer 1,5 R eller mer, sedan kontakt) – eller sjunker när sidan sprider sig |
| Skenmanöver | ett litet förband i kontakt drar två eller fler fiender från annanstans; en större grupp slår sedan fyra avstånd bort där fienden har färre |
| Reträtt / jakt | en grupp i kontakt vänder bort och lägger R mellan sig och platsen där den stred; säker när en fiende där just dödat en av dess enheter och gruppen kommit 2 R från dödaren (aldrig till fots: se nedan); fiender som rör sig åt samma håll och hänger med jagar |
| Försvar i djupet | stående enheter i två eller fler bälten tvärs över fiendens axel, R djupt, fienden kommer, eld från bältena |
| Omvänd sluttning | tre eller fler dödade på kort håll av stående enheter, där offren kommit över en ås |
| Bakhåll | en rörlig grupp möter fiender som stått still i 45 s; de skjuter först och rörarna förlorar två eller hälften av gruppen |
| Skärm | en eller två enheter som rör sig framför en kropp av tre eller fler, och möter fienden först |
| Inre linjer | en sidas grupper ligger tätt mellan den andras, och dess enheter flyttar mellan dem |
| Tempo | en sida som svarar på kontakt (vändning, fartändring, första skottet) 1,5 gånger snabbare, Mann-Whitney p under 0,05 |
| Vevning, skåra, släp, pump | målet för ett robotskott vänder skytten till 35–70°, 75–105°, över 140°, eller släpar och vänder tillbaka |
| Luftens tång, mur, ledare–följare, kvarnen | ett par som delar sig mot en fiende; tre sida vid sida mot fienden; ett element 5–20 km bakom ett annat; två som kretsar runt en punkt, en punkt isär |
| Stridsflygpatrull | kretsar runt en station i tre minuter |
| Energi- / vinkelstrid | i en närstrid – kurser 30° isär, var och en håller den andra på sin nos i tur och ordning, eller en död mellan dem – där höjd används och stiger, eller platt och svänger hårt medan den bromsar; säker när den ena dödade den andra |
| Anfallspaket, SEAD | en flyggrupp med blandade roller, av vilka några träffar marken; luftvärnets dödade före de flesta andra markdödade |
| Stridslinje, korsa T | tre fartyg i kolonn; en kolonn som ställer sig tvärs över huvudet på en fientlig kolonn |

Varje manöver säger vilka kunskapsbasens **mönster** den visar (`patterns-maneuver.ts`: formation, frontalattack, dubbelomslutning, omringning, genombrytning, eld och manöver, skenmanöver, reträtt, jakt, försvar i djupet, skärmning, spridning, missilförsvar, vinkelstrid, stridsflygpatrull, anfallspaket, stridslinje, korsa T) och de poster som ska läsas först. Äldre poster får de nya mönstren genom `knowledge/maneuver-tags.ts`. Se [Kunskapslinsen](knowledge.md).

**Lönade sig** jämför enheternas utbyte medan den pågick (och en minut efteråt) med deras sidas utbyte över matchen. En reträtt lönar sig när den förlorade färre enheter efter vändningen än före, ett missilförsvar när flygplanet överlever en minut, och en omringning när fickan förlorar hälften.

## Över många matcher {#over-many-matches}

Varje matchs sammanfattning (`src/mass/summarize.ts`, se [Masanalys](mass-analysis.md)) innehåller ett litet avsnitt `maneuvers`: per slag och sida gjorda (på Trolig eller högre), lönade sig, inte lönade sig, dödade och förlorade. **Masanalys → Manövrar** lägger ihop dem över de matcher som filtret släpper igenom – per karta och läge, eller över alla – med intervallet för andelen som lönade sig (Wilson-intervallet). En rad laddar de matcher den gjordes i. Sammanfattningar skrivna innan avsnittet fanns har inget sådant: kör `node tools/3dheat-summarize.mjs <mapp> --force` för att lägga till det.

## Hur säker den är {#how-sure-it-is}

Syntetiska matcher med inplanterade manövrar (`synth.ts`, körs av `maneuver.test.ts`): alla 28 inplanterade slag hittas på Trolig eller högre. Av 50 rapporterade manövrar är 31 det inplanterade slaget och de andra 19 finns också på riktigt (den rörliga gruppens formation, den frontala närmandet för den genomträngande kolonnen). Ingen är fel. På 30 nollmatcher – slumpvandringar isär och blandade, enheter som står slumpmässigt, flygplan på raka banor, en folkmassa som stökar omkring – rapporteras inget på Trolig eller högre.

På riktig data (dussintals markstrider, några långa uppdrag i luftkrig, ett dussin skyttematcher): frontalattacker, flanker, genombrytningar och omringningar i pansarslagen, formationer och närstrider i luften, missilförsvar, stridsflygpatrullernas kretsningar och ledare–följare-par i luftkrigsuppdragen, frontala avrättningar, kolonner och några få bakhåll och bundna par i skyttespelen. Tröskelvärdena är doktrinens former i spelets skala. Läs ett enskilt fynd med dess belägg, och tabellens andelar med deras intervall.

### Mot nollmodeller av samma matcher {#against-null-models-of-the-same-matches}

En detektor kan luras av marken och folkmassan: i ett virrvarr har varje grupp fiender runt om. Därför körs varje slag även på **nollmodeller** byggda av samma matcher (`nulls.ts`), där sidorna inte längre möts som de gjorde: en sidas tidslinje vrids runt med en tredjedel till två tredjedelar av matchen (*skift*), eller dess banor vrids runt kartans mitt (*rotera*); och lagetiketterna blandas (*lag*, som per konstruktion behåller ungefär hälften av de verkliga striderna). Strider räknas bara när dödanden parats med sina dödsfall, dödaren inom 2 R och offret på platsen – en nollmodell bryter de paren. Fynd på Trolig eller högre i en match, verkliga mot nollmodellerna (30 pansarstrider; 12 skyttematcher):

| Slag | Pansarstrider: verklig / skift / rotera | Skytte: verklig / skift / rotera |
|---|---|---|
| Omringning | 0 / 0 / 0 (var 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Genombrytning | 0,03 / 0,02 / 0,05 (var 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flank | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontalattack | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Reträtt | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (så aldrig säker till fots) |
| Bakhåll | – | 0,17 / 0,04 / 0,04 |
| Energistrid | 1,2 / 0,1 / 0,85 | – |
| Vinkelstrid | 0,6 / 0,07 / 0,3 | – |

Närstrider i luften över ett slagfälts mitt klarar en vändning runt den mitten, så kolumnen *rotera* smickrar dem mindre än den gör markslagen. Slag inom en sida – formation, stridsflygpatrull, kvarnen, anfallspaket, SEAD, bundna par, skärm – beror inte av den andra sidan och prövas inte på det här sättet. `maneuver.test.ts` kontrollerar att nollmodellerna tar bort den inplanterade flanken, tången, omringningen, genombrytningen, bakhållet och reträtten ur de syntetiska matcherna.

## Begränsningar {#limits}

- Grupper behöver positioner över tid; en fil med bara händelser har inga.
- Riktningen läses inte från datan: fiendens front är där stödstyrkan strider mot den, annars där den rör sig, annars där angriparen kom ifrån.
- Terrängen läses från enheternas egna höjder (den omvända sluttningen); det finns inget siktlinjetest.
- Mycket stora filer samplas med längre steg; korta luftmanövrar i dem läses fortfarande från steg på 2–4 s.

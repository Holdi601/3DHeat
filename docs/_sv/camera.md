---
title: "Kamera och styrning"
nav_order: 14
has_children: true
lang: "sv"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera och styrning

Du flyger genom scenen som en fågel: **W A S D** för att röra dig, dra med musen för att titta omkring. Använd den här sidan för att flyga, för att hoppa till en vy uppifrån eller från sidan, och för att läsa exakt var kameran står.

## Flyg i 4 steg {#fly-in-4-steps}

1. Klicka en gång på vyn så att den får tangentbordet.
2. Håll **W** för att flyga framåt, **S** bakåt, **A** och **D** åt sidan, **Mellanslag** upp, **Q** ner.
3. Håll ned vänster eller höger musknapp och dra för att titta omkring.
4. Tryck på **F** för att rama in all data igen.

Kameran är en fri flygkamera med perspektiv och parallell projektion, förinställda vyer, ett skrivet kameraläge och skärpedjup. Dess inställningar finns i panelen **Kamera & scen** längst ned i sidofältet (visas också i flikarna Racinganalys och Match). Implementeringen är [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Flygning {#flying}

| Indata | Effekt |
|---|---|
| `W` `A` `S` `D` eller piltangenterna | Framåt (längs vyn, inklusive nicket), vänster, bakåt, höger |
| `Space` eller `E` | Upp (världens upp) |
| `Q` eller vänster `Ctrl` | Ner |
| `Shift` (hållen) | 6× snabbare |
| vänster `Alt` (hållen) | 15 % fart |
| Dra med vänster eller höger musknapp | Titta omkring. Pekaren låses medan du drar. |
| Mushjulet | Flyghastighet ×1,5 per klick (perspektiv); zoom (parallell) |
| `F` | Rama in datan |
| Klick (utan att dra) | Visa vad som finns under pekaren ([Inspektera vyn](#inspecting-the-view)) |
| `C` | Kopiera kamerans position, gir och nick |
| `G` | Gå till en punkt du skriver in |
| `Esc` | Stäng platskortet (och sluta följa en enhet) |

### När du följer en enhet {#while-following-a-unit}

När kameran följer en enhet i en repris ([Matchrepris](match-replay.md)) gör flygtangenterna något annat:

| Indata | Effekt |
|---|---|
| Hjulet, `W` / `S` | Närmare enheten / längre bort (högre / lägre i satellitvyn) |
| `A` / `D`, `Q` / `E` | Kretsa runt enheten (jakt- och kretsvyerna) |
| Dra | Titta omkring kring enheten (cockpit: titta omkring inuti) |
| `V` / `Shift+V` | Nästa / föregående kameravy |
| `Esc` | Sluta titta på den andra enheten först, sedan sluta följa |

Rörelsetangenterna adderas med en [handkontroll](gamepad.md); se [tangentbordsreferensen](keyboard-reference.md) för allt annat. Tangenterna ignoreras medan en textruta eller en rullgardinslista har fokus. Nicket begränsas precis innan rakt upp och ned.

## Panelen Kamera & scen {#camera--scene-panel}

![Panelen Kamera & scen: Projektion, Förinställda vyer, knapparna för Synfält, Flyghastighet och Kameraläge](../assets/img/en/camera-panel.webp)

### Projektion {#projection}

**Projektion**: *Perspektiv* (standard) eller *Parallell*.

*Parallell* (ortografisk) tar bort förkortningen, så att två hot spots med lika täthet ser lika stora ut var som helst i bilden – den jämförelse som en kartvärmekarta finns för att stödja – och det är det som gör en isometrisk vy isometrisk. I parallellt läge zoomar mushjulet (det finns ingen framåtrörelse som ändrar skalan) och [hastighetsvisningen](#fly-speed) är dold.

**Att byta behåller samma storlek på motivet.** En parallell projektion har inget synfält, så dess frustums höjd har inget med kamerans avstånd att göra; ett enkelt byte zoomar vilt eller visar ingenting. När man går till parallell sätts frustums höjd till vad den perspektiviska kameran täcker på fokusavståndet (2 × avstånd × tan(fov / 2), där fokusavståndet är avståndet vid den senaste inramningen). Att gå tillbaka återställer det perspektiviska läge du lämnade, i samma synliga skala, i stället för vart den parallella vyn drev.

### Förinställda vyer {#preset-views}

| Grupp | Knappar | Orientering |
|---|---|---|
| **Isometrisk** | **NO**, **NV**, **SO**, **SV** | Parallell, nick -35,264° (= atan(1/√2), vinkeln där alla tre axlarna projiceras till samma längd), gir -45°, 45°, -135°, 135°. Fyra hörn, eftersom ett enda alltid döljer halva kartan bakom det som är närmare. |
| **Sidovyer** | **Ovan**, **Under**, **Fram**, **Bak**, **Vänster**, **Höger** | Parallell. Ovan tittar rakt ned (nick -89,9°), Under rakt upp, Fram längs -Z (gir 0°), Bak längs +Z (180°), Vänster längs -X (-90°), Höger längs +X (90°). |
| | **Tillbaka till perspektiv** | Går tillbaka till det perspektiviska läge du lämnade. Inaktiverad i perspektiv. |
| | **Trekvartsvy** | Perspektiv, gir -35°, nick -28°. |

Varje förinställning byter själva projektionen – i perspektiv konvergerar en ”uppifrånvy” fortfarande mot en försvinningspunkt, och lika stora ytor slutar se lika stora ut – och ramar in datan från den riktningen.

### Synfält {#field-of-view}

**Synfält** – den vertikala vinkeln. Standard 65°, 10–140° på skalan (179° med handtaget), med knapparna **Platt 20°**, **Lång 35°**, **Normal 50°**, **Vid 65°**, **Mycket vid 90°**. Smalt plattar till perspektivet och liknar mer en parallell projektion; vidvinkel överdriver djupet och gör avstånd svåra att bedöma. Det är levande även i parallellt läge, där det sätter den skala som bytet tillbaka räknar ut och det avstånd som **Bildruta** använder.

### Flyghastighet {#fly-speed}

**Flyghastighet** – världsenheter (meter) per sekund på full gas. Standard 120; vid varje inläsning datans horisontella utsträckning / 12. Logaritmisk, 0,02–20 000 (200 000 med handtaget; handtaget ändrar den med kvoter, inte belopp). Mushjulet multiplicerar eller dividerar den med 1,5 per klick, inom 0,02–200 000.

Samma värde visas nere till höger i vyn (bara perspektiv): farten i m/s eller km/s och tiden det tar att korsa datan (eller banan, när en 3D-bana är inläst) med den farten. Dra uppåt eller nedåt för att ändra farten.

### Nära och fjärran {#near-and-far}

**Nära** (standard 0,5) och **Fjärran** (standard 40 000) är klippavstånd. Båda räknas om från datan vid varje inläsning (nära = max(0,05; utsträckning / 20 000), fjärran = utsträckning × 12) och vidgas, aldrig smalnas, av en 3D-bana som är större ([Banor](levels.md#what-a-level-does-for-the-heat)). Deras förhållande sätter djupprecisionen som skymningen bygger på, så en mycket liten nära med en enorm fjärran försvagar [skymningen](depth-and-culling.md). Sett utifrån scenen eller högt över dess mark flyttas det nära planet som faktiskt används ut till 2 % av avståndet, så att en karta sedd långt uppifrån behåller tillräckligt med djupprecision för att vatten och strand inte ska flimra; rutan visar fortfarande det värde som är satt.

### Andra kontroller {#other-controls}

| Kontroll | Standard | Betydelse |
|---|---|---|
| **Invertera Y** | av | Vänder musens blick upp/ned. |
| **Skärpedjup** | av | Se nedan. |
| **Handkontroll** | aktiverad | Se [Handkontroll och HOTAS](gamepad.md). |
| **Kameraläge** | | Se nedan. |
| **Inspektera** | | Kameraavläsningen, klicka-för-att-välja, girkonventionen och *Gå till en punkt*; se [Inspektera vyn](#inspecting-the-view). |
| **Rama in datamängden (F)** | | Passar datan (i fliken Racinganalys: varven) i vyn och behåller den aktuella riktningen. Kameran placeras på r / tan(fov / 2) från mitten, där r är halva diagonalen av datans gränser. |
| **Rutnät**, **Axlar** | på, på | Ett markrutnät med ett 1/2/5 × 10ⁿ-avstånd på ungefär 1/40 av datans spann (sträcker sig till 1,5 × datan, mellan 8 och 120 rutnätssteg), och färgade axlar. |
| **Invertera världsaxel** X, Y, Z | av | Se nedan. |

### Kameraläge {#pose}

Fem sifferrutor – **X**, **Y**, **Z** och **gir °**, **nick °** – som följer kameran så länge ingen av dem har fokus. Skriv ett värde och tryck på `Enter` (eller lämna rutan) för att flytta kameran dit. **kopiera** lägger `pos X Y Z · gir A · nick B` på urklippet (med `(spelgir)` efter, när den konventionen väljs). Flygning är hur du utforskar; koordinater är hur du återskapar en vy. De är samma tal som [kameraavläsningen](#camera-readout): datans egna koordinater, även när en axel är inverterad, och girningen i vald [konvention](#yaw-conventions).

### Invertera världsaxel {#invert-world-axis}

**Invertera världsaxel X / Y / Z** ritar världen med den axeln omvänd. Ett spel som håller en vänsterhänt värld blir spegelvänt i denna högerhänta visare – högerkurvor ritade som vänsterkurvor – och att invertera X eller Z får tillbaka det. **Bara ritningen ändras**: datan, analysen och varje koordinat verktygen visar (kameraläge, linjal, skiva) förblir spelets egna. Vyn vänds på plats och du fortsätter titta på samma ställe. Inställningen kommer ihåg i webbläsaren (`localStorage`-nyckeln `heat3d.mirror`); jämför de [vändningar](axes-units-and-time.md#flips) som görs vid inläsning, som ändrar datan.

## Inspektera vyn {#inspecting-the-view}

Var kameran står, vad som finns under pekaren, och att gå till en punkt – blocket **Inspektera** i panelen Kamera & scen, och två överlägg uppe till vänster i vyn. Koden finns i [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) och [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Kontroll | Standard | Betydelse |
|---|---|---|
| **Kamerans position över vyn** | på | Kameraavläsningen, nedan. Stängs också med sitt **×**. |
| **Klick visar vad som finns där** | på | Klicka-för-att-välja, nedan. |
| **Girkonvention** | Visaren | Vilken gir avläsningen, kameralägesrutorna och hoppfältet visar och läser. |

Dessa tre kommer ihåg i webbläsaren (`localStorage`-nyckeln `heat3d.inspect`).

### Kameraavläsning {#camera-readout}

Uppe till vänster i vyn: kamerans **x**, **y**, **z**, **gir** och **nick**, levande, med en etikett som anger girkonventionen. Den visar samma tal som rutorna under [Kameraläge](#pose) och kostar ingenting medan du flyger (den skrivs till sidan på bildklockan, utan att panelerna ritas om).

- **kopiera** (eller `C` var som helst utanför en textruta) lägger `x X y Y z Z gir A nick B (visargir)` på urklippet, med `.` som decimaltecken oavsett språk – en rad som hoppfältet, och vilket skript som helst, läser tillbaka.
- **gå till** (eller `G`) öppnar en ruta under den: klistra in en punkt och tryck på `Enter` för att titta på den, eller klistra in ett helt kopierat läge för att stå i den vyn. `Esc` stänger rutan.

### Koordinater: datans egna ram {#coordinates-the-datas-own-frame}

Varje koordinat som inspektionsverktygen visar eller tar emot finns i **den inlästa datans egna ram**: [axelmappningen](axes-units-and-time.md) från inläsningen (upp-axel, vändningar, skala) är ogjord. En position avläst från vyn är det tal som källtabellen innehåller, och ett tal från tabellen som skrivs in i hoppfältet landar på just den platsen. När mappningen inte ändrar något (en Y-upp, oskalad inläsning – vilket är vad inspelningsverktygen och bananexportörerna skriver) är detta helt enkelt världen; annars bär avläsningen en etikett **datans ram**. Utan datamängd är koordinaterna världskoordinater. Gir och nick gäller alltid visarens värld, Y upp.

### Girkonventioner {#yaw-conventions}

| Konvention | Gir 0° tittar längs | Växer mot | Används av |
|---|---|---|---|
| **Visaren** | -Z | -X | flygkameran, [förinställda vyer](#preset-views) |
| **Spel / inspelningsverktyg** | +X | -Z | inspelningsverktygens kolumner `yaw` och lägen; i en bana exporterad i visarens ram, spelets egen gir |

Nick är detsamma i båda: uppåt från horisontalen. De två skiljer sig åt med ett kvarts varv och inget annat:

> visargir = spelgir - 90°

En riktning `d` är `(cos p · cos y, sin p, -cos p · sin y)` i spelkonventionen och `(-sin y · cos p, sin p, -cos y · cos p)` i visarens. Välj **Spel / inspelningsverktyg** för att skriva en gir rakt av en inspelningstabell, eller för att jämföra avläsningen med en.

### Gå till en punkt {#going-to-a-point}

**Gå till en punkt**, i blocket Inspektera (och avläsningens ruta **gå till**):

- textrutan tar `x, y, z` eller `x y z` (eller `x; y; z`), med en decimalpunkt eller ett decimalkomma – `-321.6, 137.8, -59.9` och `-321,6 137,8 -59,9` är samma punkt. Fem tal lägger till en gir och nick, och ett läge kopierat från avläsningen eller lägesrutorna läses helt, med etiketter och konvention;
- **gir °** och **nick °** (valfria) vrider kameran, i vald konvention;
- **Titta på** behåller riktningen (lutad så att den tittar nedåt minst 20° om den tittade rakt fram) och backar längs den till det aktuella avståndet, hållet mellan 0,3 % och 3 % av scenens bredd – 6 till 60 m på en tvåkilometersbana. Fokusavståndet, den parallella vyns höjd och flyghastigheten följer med, så att vyn blir användbar när den kommer fram;
- **Stå här** sätter kameran på punkten, vänd i den givna girningen och nicket, eller som den var.

Ett inklistrat läge med egen gir och nick står alltid i den vyn.

### Klicka-för-att-välja {#click-to-pick}

Ett klick på vyn – tryck och släpp utan att dra mer än 4 pixlar; ett drag tittar fortfarande omkring – visar ett kort uppe till vänster med vad som finns under pekaren. Medan [linjalen](measure.md) är på går klick i stället till linjalen.

**En ritad datapunkt vinner.** Det närmaste provet inom 8 pixlar från klicket, bland dem som faktiskt ritas: raderna i tidsfönstret och livstiden, som passerar [filtren](filters.md), de visade grupperna och differensdelningen, inom avståndsgallringen och en skiva som klipper värmen. I boxreplayen: en låda under pekaren (var som helst på den). Kortet listar varje kolumn raden bär, under källans egna kolumnnamn – tid (väggklocka, eller filens egna sekunder med `m:ss.ss`), person, grupp, session, varje behållen kolumn, positionen och blickriktningen – och avståndet från kameran. Bara kolumner som inläsningen behöll finns i minnet: en kolumn som inte valts som [filterkolumn](column-mapping.md) visas inte.

**Annars banans yta**: punkten där klickets stråle möter banans riktiga trianglar (inte linjalens referensplan), med **delen** den hör till (exportörens namn, `structure:props`, `ground:terrain …`), dess **typ** (mark, konstruktion, vatten, kartbild), koordinaterna och avståndet. Geometri som döljs av en skiva eller avståndsgallringen släpps igenom. Där banan har en [navigeringsmesh](model-levels.md#navigation-meshes) nämner en rad den och säger om platsen ligger på den (✓). Ett delnamn med prefixet `≈` gissades utifrån delarnas omslutande lådor, eftersom just den delen av banan förenklades vid inläsningen.

Kortet ligger kvar tills det stängs (**×**, `Esc`), ett nytt klick svarar på något annat, eller ett klick på tom yta. Ett cyanfärgat kors ritas vid punkten i scenen och en ring över den på skärmen. Dess knappar: **kopiera** (varje värde, och koordinaterna som `x, y, z`), **Titta på** och **Stå här** (på en datapunkt, med blicken som raden hade när den har en blickriktning; på en yta, 1,7 m ovanför den).

Banan indexeras för pekning vid det första klick som behöver det: ett rutnät av kolumner över dess fotavtryck, byggt några millisekunder i taget mellan bildrutor så att vyn aldrig stannar (ungefär en sekund arbete för en bana på flera miljoner trianglar), och behållet tills banan byts. Tills dess säger kortet *Förbereder banan för pekning* med en procentsats, och svarar på klicket när den är klar. En sökning efter datapunkt över fler än fyra miljoner ritade rader sprids över bildrutor på samma sätt.

## Skärpedjup {#depth-of-field}

Ett hopfällbart avsnitt i Kamera & scen, med rubriken *Skärpedjup - på* medan det är aktiverat. Av som standard: det är en presentationseffekt, och standardvyn ska visa datan snarare än en tolkning av den.

| Kontroll | Standard | Intervall (reglage) | Betydelse |
|---|---|---|---|
| **Aktiverat** | av | | |
| **Fokusera på det som ramades in** | på | | Fokus på det avstånd som den senaste inramningen använde (*Fokuserad på N m.*). |
| **Fokusavstånd** | 1000 | 1–200 000, logaritmiskt (10 000 000) | Visas när fokus är manuellt. |
| **Bländare** | ±35 % | ±2 % till ±200 %, logaritmiskt (±3200 %) | Djupet som hålls skarpt, som en andel av fokusavståndet – relativt i stället för ett f-tal, eftersom scener sträcker sig från ett rum till en karta på åtta kilometer. |
| **Maximal oskärpa** | 12 px | 1–48 (256) | Den största oskarphetsradien; kostnaden skalar med den. |

Den suddar ut **banan, rutnätet och lådorna** – *inte värmen*. Värmen i en pixel är summan av sprites på många djup, så den har inget enskilt djup att vara ur fokus på; att sudda ut den med vilken geometri som helst bakom den vore fel var den än svävar framför. Skarp data över mjukad kontext är dessutom det mer användbara av de två. Oskarpheten är en 24-stegs gyllene-vinkel-insamling i sammansättningspasset, viktad så att en skarp förgrund inte smetas utåt av den suddiga bakgrunden bakom den. Ändrar man den ritas om utan att värmeackumuleringen startas om.

## Canvasupplösning {#canvas-resolution}

Canvasen ritas i skärmens pixelförhållande, begränsat till 2. Värmebufferten kan ritas i lägre upplösning än så ([Värmeupplösning](performance-and-stats.md)).

## Sidor i det här avsnittet {#pages-in-this-section}

- [Handkontroll och HOTAS](gamepad.md)
- [Tangentbords- och musreferens](keyboard-reference.md)

---
title: "Taktiktavla"
nav_order: 12
has_children: true
lang: "sv"
source: "tactics-board.md"
source_hash: "e89ef050b0f2"
translated: true
outdated: false
---

# Taktiktavla

Fliken **Taktik** är en ritningstavla för en lagplan: du lägger små figurer på en karta, ritar pilar för vart de ska gå, och trycker på play för att se det hända. Använd den för att planera en runda eller ett anfall innan du spelar. Den delar duk, kamera och [bana](levels.md) med de andra flikarna och inget annat; en plan är inga data och ritar ingen värme.

## Din första plan {#your-first-plan}

1. Öppna fliken **Taktik**. Välj **Spel** (till exempel Counter-Strike 2) och, för Valorant, tryck **Läs in Valorant-kartor** och välj en **Karta**. Eller läs in en [bana](levels.md) först.
2. Välj en **Sida** (den styr färgen) och tryck **Vy ovanifrån**.
3. Välj **Plats**, välj en figur i **Figurer** (använd **Sök figurer** för att hitta en) och klicka på kartan. Placera två eller tre.
4. Välj **Pil**, klicka på en figur, klicka längs vägen den ska gå, och tryck **Enter** för att avsluta pilen.
5. Tryck **+** under vyn för att lägga till steg 2. Varje figur börjar där dess pil slutade. Rita fler pilar där.
6. Tryck **▶** (eller `K`) för att spela planen från det visade steget till slutet.
7. Ge planen ett namn i **Planens namn** och tryck **Spara**.

![Fliken Taktik i vy ovanifrån: spel, sidor och verktyg till vänster, tre figurer med Flytta-pilar, en rökkastbåge, ett område och stegen längs nedre kanten](../assets/img/sv/tactics.webp)

## Starta en plan {#starting-a-plan}

| Reglage | Vad det gör |
|---|---|
| **Spel** | Väljer sidorna och de figurer paletten erbjuder: Counter-Strike 2 (T, CT; spelare och hjälpmedel), Valorant (Anfall, Försvar; spelare och generiska förmågor), Battlefield, Squad, Arma (infanteri, markfordon, flygplan, båtar), DCS / War Thunder / IL-2 (jetplan, propellerplan, helikoptrar, luftvärn, mark, fartyg, vapen) och Annat. En plan som redan har figurer behåller sina sidor när spelet byts. |
| **Planens namn** | Namnet planen sparas under. |
| **Karta**, **Läs in Valorant-kartor** | När Valorant är valt: **Läs in Valorant-kartor** hämtar listan över kartor från [valorant-api.com](https://valorant-api.com); **Karta** lägger sedan den valda kartans minikarta som bana, inramad uppifrån. Bilden hämtas när den väljs och skeppas aldrig. Riots meddelande visas medan den är på skärmen (se nedan). |
| **Sida** | Sidan nästa figur, pil eller område hör till; den tar sidans färg. |

Utan bana är tavlan det platta markplanet. Läs in en bana under **Nivå** för att planera på en riktig karta: en CS2-karta exporterad med CS2-verktyget, en bana från biblioteket eller en kartbild.

## Verktyg {#tools}

| Verktyg | Klick | Anteckningar |
|---|---|---|
| **Välj** | En figur, en vägpunkt, en pil, ett område eller en anteckning väljer den. | Shift+klick lägger till eller tar bort; Shift+dra ritar en ruta runt det som ska läggas till. Markeringen får ett transformhandtag (se nedan); `Delete` eller `Backspace` tar bort den. `M` flyttar den valda figuren till nästa klick. |
| **Plats** | Lägger ner den valda figuren. | En figur väljs i palletten **Figurer** (med **Sök figurer**). När inget är valt vrider `R` nästa figur 15° innan den placeras (`Shift+R` åt andra hållet). |
| **Pil** | Varje klick lägger till en punkt; Enter, dubbelklick eller högerklick avslutar, Esc släpper den. | **Flytta**, **Anfall** (bredare spets) eller **Bevaka** (en tunn linje i ögonhöjd). En pil som börjar på en figur är den figurens väg i det här steget: när den spelas upp går figuren den, och nästa steg börjar där den slutade. |
| **Kast** | Kastaren, sedan var det landar. | En streckad båge från den ena till den andra, och det valda hjälpmedlet (rök, bländare, molotov, ...) visas där det landar och finns kvar från det här steget och framåt. |
| **Område** | Mitten, sedan kanten. | En skiva i sidans färg. |
| **Anteckning** | Var anteckningen ska ligga; frågar efter dess text. | Visas som en nål, och dess text över den. |
| **Radera** | En figur, pil, ett område eller en anteckning. | Tar bort den från det här steget och framåt; på dess första steg tar den bort den. |

**Ångra** och **Gör om** (`Ctrl+Z`; `Ctrl+Y` eller `Ctrl+Shift+Z`) går igenom varje ändring. En rad under planen visar hur många figurer, pilar och steg den har. **Vy ovanifrån** tittar rakt ner (ortografisk), **3D-vy** går tillbaka till perspektiv, **Bildruta** passar in planen, eller banan när planen är tom.

**Figurstorlek** skalar varje figur på tavlan; 1× är verklig storlek, vilket från långt upp är några pixlar för en person.

## Flytta, vrida och skala {#moving-turning-and-scaling}

Allt på tavlan kan flyttas som i en 3D-redigerare: figurer, hjälpmedel, markörer, enskilda vägpunkter och hela pilar, områden och anteckningar. Det som är valt får ett handtag mitt på sig:

| Läge | Tangenter | Handtag |
|---|---|---|
| **Flytta** | W (eller G) | En pil per axel (X röd, Y grön och uppåt, Z blå) flyttar längs den; en kvadrat flyttar tvärs över sitt plan; mitten flyttar över banan under pekaren. |
| **Rotera** | E (eller R) | En ring per axel vrider kring den. En enskild figurs ringar är dess egen gir, nick och rull; en grupp vrids kring världens axlar runt sin mitt. |
| **Skala** | R (eller S) | Sprider eller samlar markeringen från sin mitt längs en axel eller åt alla håll; ett områdes radie växer med den. |

**Nycklar** växlar mellan W / E / R (Unity, Unreal) och G / R / S (Blender); tangenterna väljer läge bara när något är valt, och flyger kameran annars. Så `R` betyder **Skala** med tangenterna W / E / R och **Rotera** med tangenterna G / R / S när något är valt, och vrider nästa figur att placera när inget är det. Alla tavelns tangenter finns i [tangentbordsreferensen](keyboard-reference.md#tactics-board). Håll **Ctrl** nedtryckt när du drar för att låsa en förflyttning till **Rutnät** (meter) eller en vridning till **Vinkelsteg**. **Fäst vid marken** (på som standard) lägger flyttade personer, fordon, markörer, vägpunkter och områden på banans yta; flygplan och helikoptrar behåller sin höjd, och ett drag längs Y-pilen fäster aldrig. Att dra i ett handtag flyttar aldrig kameran. **Esc** avbryter ett drag, och varje ändring är ett steg i Ångra.

Vägpunkter visas som punkter på det visade stegets pilar: klicka på en för att välja den, dra den för att flytta den, Delete för att ta bort den. Avsnittet **Valda** visar markeringens plats i meter, en figurs gir, nick och rull i grader och ett områdes radie, var och en går att skriva in.

## Tidtagning {#timing}

En figurs väg tidsätts: varje segment tar sin längd över banan – samplad på ytan var annan meter, så att en kulle eller en trappa mellan två punkter räknas – i hastigheten för figurens **läge** i det spelet, plus eventuell **väntan** vid en vägpunkt. Infanteri kryper, smygår, går (tyst), springer eller sprintar; fordon och båtar kryper, kör försiktigt, normalt eller på; flygplan och helikoptrar flyger långsamt, i kryssfart, i stridsfart eller på maximum. Ett läge som spelet inte har (CS2 har ingen sprint) tar det närmaste läget det har. Hur en backe bromsar beror på spelet: i CS2 och Valorant räknas bara den horisontella sträckan, som i spelen; militärsimulatorer bromsar infanteri i uppförsbacke (Toblers vandringsfunktion) och fordon efter lutning.

Hastigheterna kommer från tabeller per spel med sina källor (se [Rörelsehastigheter](tactics-speeds.md)): CS2 efter vapnet som hålls, från spelets vapendefinitioner; Valorant efter vapen; Battlefield, Squad, Arma och flygspelen efter fordonstyp och klass. **Rör sig som** väljer en figurs profil (ett vapen, en fordonstyp); **Egen (m/s)** åsidosätter vilket läge som helst för den figuren. Lägena heter som tavlan visar dem: *Kryp*, *Smygång*, *Gå (tyst)*, *Spring*, *Sprint*; *Försiktigt*, *Normalt*, *På*; *Långsamt*, *Kryssfart*, *Strid*, *Maximum*.

Varje vägpunkt visar tiden från den föregående och tiden sedan planens start ("+3,9 s · 0:12"). Den valda figurens väg listar varje segment med dess läge, längd och tid, väntan och ankomsten. **Ankomster** under **Tidtagning** lägger varje figur med väg på en tidslinje, första ankomsten överst. Med **Spela i realtid** (på som standard) varar ett steg tills dess långsammaste väg är framme, och varje figur rör sig i sin egen hastighet; **Sekunder** är då stegets minsta längd. **Baneenheter per meter** säger vad banan är i: 39,37 för CS2-kartor (spelets enheter), 1 för kartor i meter.

## Jämför med matchdata {#compare-with-match-data}

**Läs in matchfiler…** läser CS2-matchtabeller för kartan (CS2-verktygets Parquet-filer, så många man vill; bara de kolumner som behövs, i bakgrunden); **Använd inlästa data** tar den data som lästs in i betraktaren. Sedan:

- **Tidigaste ankomst på kartan** färgar kartan efter tiden sedan rundans start då en spelare först nådde varje plats – knappen **Snabbast** visar den snabbaste över alla rundor, **Typisk (median)** den mittersta rundan – grönt tidigt till rött sent, för en sida eller båda. Den visar vad som är möjligt och när.
- Den valda vägen jämförs med vad spelare åstadkom från dess start (eller från rundans start) till dess slut, varje slut en skiva med den angivna radien: "Snabbast observerat 14,2 s, p10 15,0 s, median 18,3 s över 41 körningar; din plan 15,1 s".
- De hastigheter spelare faktiskt rörde sig i – springande, gående, kryparande, från tabellernas gång- och ducka-kolumner – i m/s.

## Steg {#steps}

Raden under vyn har stegen. En plan börjar med ett; **+** lägger till ett, och varje figur börjar det där dess väg i det sista steget slutade; **−** tar bort det visade. **Sekunder** är hur lång tid det visade steget tar när det spelas. **▶** (K) spelar från det visade steget till slutet: figurer med en väg går den, figurer som flyttats till en ny plats i nästa steg glider dit, resten står still. Medan ett steg visas ritas varje figurs plats i nästa steg som en svag skugga, och det sista stegets pilar svagt under dem i det här steget.

## Spara {#saving}

Avsnittet **Fil** har **Spara**, **Öppna** och **Rensa**. **Spara** skriver planen som `<namn>.h3dplan.json` (ren JSON: sidor, steg, figurer med en plats per steg, pilar, områden, anteckningar); **Öppna** läser tillbaka en. En fil av en annan version, eller en som inte är en plan, avvisas med skälet. **Rensa** tömmer planen; Ångra för tillbaka den.

## Figurer {#figures}

Varje figur byggs av betraktaren själv: enkla former i en typs publicerade storlek, med de drag som skiljer den från grannarna – en stridsvagns väghjul och torn, kanonerna, missilerna och radarerna på ett luftvärnsfordon, ett flygplans vingplan, stjärt och motorer, en helikopters rotorer och stubbvingar. Inget hämtas från ett spel. En design som ett spel hittat på visas som den generiska figuren för sin klass. Se [Figurer](figures.md#which-figure-a-unit-gets) för hur data hittar sin figur.

## Riots meddelande {#riots-notice}

Valorant-kartor visas enligt Riot Games "Legal Jibber Jabber"-policy, som tillåter gratis gemenskapsprojekt att använda dem och kräver detta meddelande där de visas. Meddelandet står på engelska, som Riot kräver: *3DHeat was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.* Förmågorna på tavlan är generiska former, inte Riots konst.

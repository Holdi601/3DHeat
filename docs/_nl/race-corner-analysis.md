---
title: "Analyse bocht voor bocht"
parent: "Race-analyse"
nav_order: 55
lang: "nl"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analyse bocht voor bocht

Twee rondes van dezelfde baan worden bocht voor bocht vergeleken. Voor elke bocht zegt de viewer wie er sneller was, hoeveel tijd het waard was, en waarom - te laat geremd, te laat op het vermogen, een wijdere lijn - zodat je weet wat je het eerst moet oefenen.

![Een bevinding geopend in Waar tijd te winnen is, naast de tabel Bocht voor bocht](../assets/img/en/race-corner-finding.webp)

Een uitgewerkt voorbeeld: in bocht 3 remt Rijder A 20 m eerder dan Rijder B en verliest 0,15 s om er te komen, maar staat eerder op het gas en wint 0,15 s bij het uitkomen. Netto 0,00 s: de bocht is gelijk, en niemand krijgt te horen later te remmen.

## Wat je ziet {#what-you-see}

### Waar tijd te winnen is {#where-to-improve}

Het zijpaneel voor de gekozen ronde ("Laad minstens twee rondes op één baan." tot dan toe).

**De kop:** "<ronde> <tijd> tegen <referentie> <tijd>" en het verschil in rondetijd - of, voor de referentie, "tegen de snelste andere ronde in elke bocht (…)" en het totale verlies. Ernaast het verlies verdeeld in *rijstijl* en *auto / omstandigheden*.

**De balk met tijdverlies:** het verlies per oorzaakgroep (remmen, ingang, uitgang, recht stuk, auto, omstandigheden), in de kleuren van de oorzaken, met een legenda.

**De bevindingen**, drie lijsten:

1. Verlies door rijstijl, het duurste eerst, hooguit **12** - of "Nergens springt een plek eruit waar anders rijden tijd zou winnen."
2. **Tonen wat de auto of de omstandigheden kostten (X s)** - verlies door auto en omstandigheden, hooguit 8 (standaard aan).
3. **Waar <ronde> sneller is, of op een andere manier gelijk (N)** - winsten en gelijke bochten, hooguit 10 (standaard aan).

Elke bevinding toont haar rangnummer, de titel (de bocht en wat er gebeurde, met de kosten bij een verlies), de regel met het oordeel, de kosten (winsten met een min) met een balk, en een label: *remmen*, *ingang*, *uitgang*, *recht stuk* (verlies door rijstijl, met "· auto X" als de auto 0,02 s of meer verklaart), *auto*, *omstandigheden*, *sneller* of *gelijk*. **Klik erop** om de auto's 40 m ervoor op te stellen, het beeld erop in te stellen en het af te spelen, en om de metingen te openen:

- **Remmen:** waar elk remde (of losliet) en vanaf welke snelheid, en hoeveel meter eerder of later (vanaf 5 m);
- **Langzaamst:** de minimumsnelheid van elke ronde en waar;
- **Vol gas:** waar elk vlak was, en hoeveel eerder of later;
- **Lijn:** verschil in insturen, krapste stralen, hoe ver binnen of buiten, en de lijnvorm en het mikpunt van elke ronde;
- **Recht naar de volgende bocht:** de lengte, beide snelheden waar beide vlak waren, wat er verloren of gewonnen werd en waardoor - de startsnelheid, de sterkere trek van de ander, een lift, afgeremde snelheid, hoe er gereden werd (delen vanaf 0,02 s);
- **De auto:** hoeveel van het verlies de auto is, en waardoor (trek, grip, remmen; bij 0,02 s of meer);

daarna de tip, **De auto's:** (bij verschillende auto's, zie [Wagenprofielen](race-car-profiles.md#what-the-cars-decide-in-a-corner)), en het lijnadvies.

### Bocht voor bocht {#corner-by-corner}

Een tabel (bij twee of meer rondes), één rij per segment, van de klasse van de gekozen ronde als er meerdere klassen zijn:

| Kolom | Toont |
|---|---|
| Bocht | `T3`, `T11-T12` |
| Snelste | de ronde die er het snelst doorheen ging (zijn eigen tijd van begin tot eind van het segment) |
| met | zijn voorsprong op de op één na snelste, s |
| lijn | de vorm en het mikpunt van de snelste ronde ("V · laat", "U/V · midden"); zweef erop voor zijn krapste, ingangs- en uitgangsstralen; "beide manieren" voor een gemengd complex |
| (de gekozen ronde) | hoeveel hij achter de snelste lag, of ✓ als hij de snelste was |

Als je op een rij klikt, opent de bevinding van de gekozen ronde daar (of worden de auto's 40 m voor het segment opgesteld). Onder de tabel, als elke bocht een tijd heeft: "De snelste door elke bocht, samengevoegd: <tijd> (± op de referentie / op de beste van klasse X)" - de beste segmenten plus de snelste rit naar de eerste bocht, als dat een eigen stuk is.

## Hoe het berekend wordt {#how-it-is-worked-out}

De leidende regel: **een bocht wordt als geheel beoordeeld**, van de remzone ervoor tot de remzone van de volgende. Een ronde die eerder remt om de auto eerder te laten insturen en eerder op het vermogen te krijgen, krijgt de uitgang die hij daarmee kocht op zijn naam, en niet te horen dat hij later moet remmen.

## Eén afstandsas {#one-distance-axis}

Rondes worden vergeleken op afstand, niet op tijd: een seconde achter, zitten twee rondes op verschillende bochten. Ook niet op de eigen kilometerteller van elke ronde (een strakkere lijn legt minder meter af). Het gereden pad van de **referentie**-ronde is de as:

- De samples van elke andere ronde worden **geprojecteerd** op het referentiepad: elk sample krijgt `s`, hoe ver het langs de referentie zit, en `d`, hoe ver naar links (positief) of rechts. De zoektocht gaat vooruit vanaf de vorige match (8 padsegmenten terug tot 40 vooruit), zodat een ronde die zichzelf kruist of onderdoor gaat nooit naar de andere kruising springt. Het eerste sample wordt gezocht in het eerste kwart van het pad (op een circuit vallen start en finish samen); als niets binnen 30 m ligt, wordt het dichtstbijzijnde punt genomen dat niet achter de laatste match ligt (na een draai of een uitstapje). `s` daalt nooit: een sample dat achter het vorige projecteert, wordt vastgehouden.
- Elk kanaal wordt **geherbemonsterd** op één raster, **elke 2 m**, lineair; kanalen die in stappen veranderen (versnelling, vlaggen) krijgen het dichtstbijzijnde sample. Buiten het eigen bereik van een ronde zijn de waarden leeg.
- Het eerste en laatste sample van een ronde projecteren een stukje binnen de uiteinden van de referentie, dus elke ronde wordt **tot 15 m** voorbij zijn uiteinden doorgerekend tegen de snelheid die hij had (de tijd groeit met de afstand gedeeld door de snelheid, de rest blijft gelijk) - zodat zijn delta bij de finish zijn verschil in rondetijd is.
- `delta` = de tijd van de ronde op elk rasterpunt min die van de referentie: het verschil. `lateral` = `d` op het raster.

De tijd die één ronde meer nam dan een andere tussen twee rasterpunten is het verschil van hun deltas: `rel(s)`. Alles hieronder is daarop gebouwd.

## Bochten {#corners}

Gevonden op de **referentie** (`findCorners`), met zijn snelheid geglad over ±6 m en zijn kromming (koersverandering over ±5 samples, geglad over ±10 m):

1. **Snelheidsminima met prominentie.** Een punt dat het laagst is binnen ±40 m, waarvan de daling vanaf de hoogste snelheid aan elke kant (voor een lager minimum) minstens `max(2,5 m/s, 6% van de snelheid)` is.
2. **Knikken.** Een lokale piek van kromming strakker dan een straal van **300 m** zonder snelheidsminimum binnen 80 m: een knik die vol gas genomen wordt, is nog steeds een bocht om te rijden.
3. **Fasen.** Vanaf elk mikpunt terug zolang de referentie remt (> 0,1) of niet op vol gas is (< 0,95): de ingang; vooruit zolang er niet op vol gas wordt gereden: de uitgang. Een knik die vol gas genomen wordt, krijgt ±30 m. Overlappende bochten worden apart gehouden, maar zo gelegd dat ze de ronde vullen.
4. Genummerd T1, T2 … in rondevolgorde; **links of rechts** naar het teken van de kromming en of de wereld gespiegeld is (onbekend telt als gespiegeld).

**Het bochtvenster** (waar de referentie draait): uit het krapste punt binnen ±40 m van het mikpunt, zolang de kromming boven een zesde van haar piek blijft, plus 10 m aan elke kant. Haar zijde geeft het teken van "binnen".

## Segmenten: van remzone tot remzone {#segments-braking-zone-to-braking-zone}

Elke bocht bezit de weg tot halverwege de mikpunten aan elke kant. Daarin:

- **Het langzaamste punt van elke ronde** is een echte dip in zijn snelheid - niets langzamer binnen 6 m (3 rasterpunten) aan elke kant, gekeken voorbij de uiteinden van het stuk, zodat de uitgang van de vorige bocht, die nog optrekt, er nooit voor wordt aangezien - gezocht van 15 m voor het bochtvenster tot 10 m erna. Een ronde die daar nooit vertraagde, wordt op het mikpunt gezet.
- **Waar een ronde begon te vertragen voor de bocht** (`entryOf`): terug vanaf zijn langzaamste punt door de rem of het loslaten, over korte stukjes vol gas heen, tot hij zijn voet **10 m** lang op het pedaal had (gas ≥ 0,95, rem ≤ 0,1); een gashervatting in de laatste **30 m** voor het langzaamste punt hoort nog bij de bocht; helemaal vol gas, het langzaamste punt zelf. Een ronde zonder gaskanaal, of die sinds de vorige bocht nooit zijn voet op het pedaal had, begint op zijn snelste punt daartussen.
- **Het segment begint** bij de eerste van alle rondes die er begon te vertragen (4 m eerder), en loopt tot het begin van de volgende, zodat het remmen van elke ronde
  erin valt, en de segmenten vullen de ronde.

**Complexen.** Opeenvolgende bochten die de referentie nooit vol gas doorrijdt - minder dan **40 m** vol gas ertussen - zijn één segment, "T11-T12", en worden als één gereden. Een complex bevat hooguit **drie** bochten: een kronkelend stuk dat nooit vlak genomen wordt, begint een nieuw complex. Een complex dat naar beide kanten draait, is *gemengd*: er wordt geen enkele lijnvorm voor gemeten.

**Op een circuit** (de referentie eindigt binnen 50 m van waar hij begon) loopt het rechte stuk van het laatste segment door over de finish naar het eerste rempunt: de run van een vliegende ronde vanaf de finish telt mee bij de laatste bocht. Een ronde die stilstaand begon of bij een race-start (zie [De start](#the-start)), houdt die run apart.

### Waar een bocht naartoe leidt {#what-a-corner-leads-onto}

Gemeten op de referentie: meters op vol gas na de bocht (van zijn vol gas tot het eind van het segment, plus de run over de finish) en ervoor (de "na" van het vorige segment, of vanaf de start).

| Type | Regel |
|---|---|
| **tussen twee rechte stukken** (`both`) | 200 m of meer ervoor **en** 120 m of meer erna |
| **naar een recht stuk** | 200 m of meer erna, of 120 m of meer erna en minstens zoveel als ervoor |
| **na een recht stuk** | 200 m of meer ervoor |
| **verbinding** | al het andere |

## Wat elke ronde in een bocht deed {#what-each-lap-did-in-a-corner}

`cornerMetrics`, per ronde en segment, op het raster (stap 2 m). Pedalen: remmen telt boven 0,1; vol gas is 0,95 en hoger.

| Maat | Regel |
|---|---|
| **rempunt** | de eerste rem waaronder het gas eraf kwam (onder 0,5), of die **15 m** duurde - een tikje met de linkervoet met het vermogen erop is niet waar het remmen begon; bij alleen tikjes, het eerste tikje |
| **gelost** | zonder remmen, het eerste punt waar het gas onder 0,8 zakte |
| (geen pedalen) | het punt waar de ronde begon te vertragen (hierboven) |
| **rem losgelaten** | de laatste rem tot 30 m voorbij het langzaamste punt |
| **snelheid bij het rempunt**, **remmeters** | tot het langzaamste punt |
| **maximale rem**, **maximale vertraging** | over de remzone (versnellingen boven 45 m/s² worden genegeerd) |
| **trail braking** | meters met rem > 0,05 en \|stuur\| > 0,1 |
| **blokkeerslip** | de meest negatieve slipverhouding van een wiel in de zone (als de ronde slip heeft) |
| **langzaamste punt**, **minimumsnelheid** | zoals hierboven |
| **gas erbij** | na het loslaten (of het langzaamste punt) het eerste gas boven 0,15 zonder rem |
| **vol gas** | het eerste punt daarna dat 10 m lang op ≥ 0,95 bleef |
| **uitrollen** | meters van het loslaten tot gas erbij, met rem en gas beide onder 0,05 |
| **gasdips** | keren dat het gas meer dan 0,25 onder zijn lopende hoogste stand viel tussen gas erbij en vol gas |
| **piek zijdelings** | de meeste zijdelingse versnelling van 20 m voor het loslaten tot het later van vol gas en 20 m voorbij het langzaamste punt |
| **versnelling in het mikpunt** | bij het langzaamste punt |
| **slip bij het wegrijden** | de meeste slipverhouding van de aangedreven wielen tussen gas erbij en vol gas |
| **balans** | slipshoek voor min achter door het midden (+ onderstuur) |
| **recht stuk op vol gas** | het aandeel van het segment na vol gas (en de run over de finish) op ≥ 0,95; de langste lift erop |
| **afgeremde snelheid** | de meeste snelheid die verloren gaat vanaf een hoog punt met gas ≥ 0,9, geen rem, op de grond |
| **drift bij het insturen** | de grootste slipshoek van het rempunt tot 5 m voorbij het langzaamste punt, op de grond |
| **handrem** | waar hij aankwam (> 0,2), tot 10 m voorbij het langzaamste punt |
| **lucht** | seconden in de lucht over het segment, en de langste vlucht |

## Met wie elke ronde vergeleken wordt {#who-each-lap-is-compared-with}

- Een ronde wordt vergeleken met de **snelste volledige ronde van de eigen prestatieklasse** (de referentie, in de klasse van de referentie).
- Die beste ronde van de klasse zelf (en de referentie) wordt, segment voor segment, vergeleken met **de andere ronde van de klasse die er het snelst doorheen ging** - of met elke ronde, als hij alleen in zijn klasse zit.

De tijdkaart, de verschillen in de rondelijst, de gebeurtenissen bij wagenbeheersing en de bochtentabel volgen dezelfde vergelijking.

## De tijdrekening van een bocht {#the-time-account-of-a-corner}

`compareCorner`, voor een ronde tegenover de andere over een segment:

- **netto** = `rel(eind) - rel(begin)` (plus de run over de finish bij een vliegende ronde): het oordeel. Minder dan **0,03 s** is **gelijk**.
- **De verdeling** - waar in de bocht de voorsprong ontstond: in het stuk van het eerste rempunt of langzaamste punt van een van beide rondes tot het later van hun punten voor vol gas en langzaamste punt, de grootste schommeling die de ronde dan teruggaf of terugwon, als die schommeling meer dan **0,04 s** is; anders het later van de twee langzaamste punten.
- **Tot het mikpunt** = `rel(verdeling) - rel(begin)`; **erna** = netto min dat. Als beide minstens 0,04 s zijn en tegengesteld van teken, heeft de ronde de ene **getradet** voor de andere.
- **Erna** splitst het opnieuw waar beide rondes vol gas zijn: de **bochtuitgang** (verdeling tot het later vol gas) en het **recht stuk** (van daar tot het eind).
- **Het recht stuk** splitst op drie manieren:
  - *uitgangssnelheid* (`byExit`) - gemeten, niet gemodelleerd: de langzamere auto haalt een stuk verderop op het recht stuk de startsnelheid van de snellere auto, en vanaf daar is zijn eigen spoor wat hij vanaf die snelheid had gedaan, met zijn eigen overbrenging, luchtweerstand en helling erin. Teruggeschoven naar dat punt (en doorgerekend op zijn eindsnelheid voor de meters die hij wint), is het zijn tijd vanaf de snellere start; het verschil is de kost van de uitgangssnelheid. Als de langzamere auto die snelheid nooit bereikt (of alleen in de laatste 2 samples), wordt zijn eigen versnelling langs het stuk teruggezet als vermogen (`a·v` vastgehouden), en nooit harder dan zijn enveloppe bij die snelheid laat zien (twee keer de gemeten versnelling zonder enveloppe).
  - *de trek van de auto's* (`byPower`) - alleen bij verschillende auto's: beide auto's vanaf dezelfde snelheid over dezelfde meters, vol gas, met integratie van de versnelling op vol gas die elk bij elke snelheid heeft laten zien.
  - *hoe er gereden werd* (`driven`) - de rest: een lift, afgeremde snelheid op vol gas.

  De uitgangssnelheid verklaart nooit meer dan het verlies op het recht stuk (en nooit met het tegenovergestelde teken), tenzij een lift of afgeremde snelheid er iets van terugnam. Een ronde **liftte** op het recht stuk als zijn aandeel op vol gas lager is dan zowel 0,9 als het aandeel van de ander min 0,05. Afgeremde snelheid telt als de twee meer dan 1 m/s verschillen. Een meningsverschil onder 0,02 s in teken wordt op 0 gezet.

Elk netto van een segment telt op tot het verschil in rondetijd, en elk "tot het mikpunt" en "erna" van een bocht tot zijn netto (de tests controleren beide).

### Het aandeel van de auto {#the-cars-share}

Alleen als de rondes in **verschillende auto's** zijn en de ronde tijd verloor (`carShare`):

- **trek**: de trek van de auto's op het rechte stuk (hierboven), tot het verlies;
- **grip**: als de ronde op de grens van zijn auto zat (zijdelingse versnelling in het midden minstens **90%** van wat zijn auto bij die snelheid vasthoudt) en de andere auto meer dan **5%** meer vasthoudt: van de lagere minimumsnelheid die niet door een strakkere straal verklaard wordt, het aandeel `½ ln(grip_ander / grip_mijn) / ln(v_ander / v_mijn)` van het overgebleven verlies;
- **remmen**: als de ronde remde (niet liftte), de andere auto over **5%** harder remt, en de *gemiddelde* vertraging van de ronde over de zone minstens **80%** was van wat zijn auto kan: van `u` naar `v` bij `a1` tegenover `a2`, eindigend op hetzelfde punt, `(1/a1 - 1/a2)(u - v)² / 2u`, tot wat er over is.

De kost van de auto is de som, hoogstens het verlies.

## Het oordeel en de bevinding {#the-verdict-and-the-finding}

`cornerFinding` schrijft hooguit één bevinding per ronde en bocht, in deze volgorde geprobeerd:

| Geval | Bevinding | Uitkomst |
|---|---|---|
| netto binnen ±0,03 s, een tradeoff, kleinste kant ≥ **0,1 s** | **gelijk, twee wegen erdoor** - wie langzaam erin en snel eruit was, en wie het andersom deed; met een recht stuk erna (naar een recht stuk, of tussen twee), is de manier langzaam erin, snel eruit degene om op voort te bouwen: houd zijn vroege gas, win de ingang terug door harder te remmen, niet later | gelijk |
| netto binnen ±0,03 s anders | niets gezegd | - |
| gewonnen, een tradeoff, verloren tot het mikpunt | **langzaam erin, snel eruit heeft zich uitbetaald**: hou het vast, hier is de bochtuitgang meer waard | winst |
| gewonnen, een tradeoff, gewonnen tot het mikpunt | **sneller erin**: de ingang is goed, een eerder vol gas zou meer houden | winst |
| gewonnen, en de andere ronde heeft hier een verlies | **sneller - door wat de ander deed**, met zijn oorzaak en zijn tip: "Voor de andere ronde: …" | winst |
| anders gewonnen | **sneller erin / eruit**, naar welke helft meer won (later remmen, meer snelheid door het midden; of eerder vlak, sterkere trek) | winst |
| verloren, en een **klap of botsing** kostte minstens `max(0,05 s; 40% van het verlies)` | de impact is het verhaal van de bocht, vóór de auto's | verlies |
| verloren, en het **aandeel van de auto** is 60% of meer | **de auto**: zijn trek op het rechte stuk, zijn grip door het midden, of zijn remmen - het grootste deel; met het deel van de bestuurder (≥ 0,03 s) gezegd als "De andere X s: …" | verlies |
| verloren, en één niet gedeelde **fout in de wagenbeheersing** kostte minstens `max(0,05 s; 40%)` | die fout (zie hieronder), met hoe de tijd eromheen verschoof | verlies |
| verloren, en een **langere vlucht** kostte minstens `max(0,05 s; 40%)` | de vlucht | verlies |
| verloren, een tradeoff, gewonnen tot het mikpunt | **te snel erin, langzaam eruit**: de oorzaak van de bochtuitgang; geef wat ingang op om eerder te draaien en eerder vlak te zijn, met de rem- en vol-gaspunten van de andere ronde. Zijn wortel (`cause`, wat de [statistieken](race-course-statistics.md) tellen): later remmen, als hij meer dan een paar meter later remde dan de ander; anders de oorzaak van de bochtuitgang | verlies |
| verloren, een tradeoff, verloren tot het mikpunt | **gaf meer weg bij het insturen dan de bochtuitgang terugwon**: de oorzaak van de ingang, die ook zijn wortel is (`cause`); hou de uitgang, verlies minder bij het insturen | verlies |
| verloren, gelost op het recht stuk, en het gereden deel meer dan de helft van het verlies | **niet vol gas op het recht stuk**: aandeel op vol gas tegenover dat van de ander, waar en hoe lang de lift | verlies |
| verloren, de trek van de auto's meer dan 60% van het verlies en het recht stuk meer dan de helft | **de trek van de auto op het rechte stuk** (met de trek van beide auto's bij 160 km/u) | verlies |
| verloren anders | de oorzaak van de helft die meer verloor (naar het mikpunt ≥ erna: die van de ingang; anders die van de bochtuitgang). Langzamer eruit alleen omdat hij langzamer door het midden was (meer dan 1 m/s): in plaats daarvan de oorzaak van het midden | verlies |

Een bevinding over een verlies kan ook eindigen met **Ook:** - afgeremde snelheid op vol gas, of een lift op het recht stuk - als het gereden deel van het recht stuk meer dan 0,04 s kostte en dat niet al de oorzaak was.

Bevindingen worden gesorteerd: verliezen eerst, het duurste eerst; daarna winsten en gelijke bochten.

### Oorzaken bij het insturen {#causes-on-the-way-in}

`entryCause`, de eerste die van toepassing is (verschillen in minimumsnelheid staan in m/s; "5 m" is de drempel waarbij een eerder of later punt telt):

| # | Oorzaak (fout) | Regel |
|---|---|---|
| 1 | een klap of botsing bij het insturen | een niet gedeelde impact die begint tot 10 m voorbij het langzaamste punt |
| 2 | **bijna stil** (incident) | langzaamste snelheid onder **60%** van wat de grip van deze auto toelaat waar de ander doorging (`v_ander · √(grip_mijn / grip_ander)` als de andere auto meer grip heeft, anders de snelheid van de ander), de andere ronde boven 8 m/s - een draai, contact of een gemiste bocht |
| 3 | een fout in de wagenbeheersing bij het insturen | een niet gedeelde blokkering, duw, draai of slide die niet op het gas is, die begint tot 10 m voorbij het langzaamste punt, kostte ≥ 0,02 s |
| 4 | een langere vlucht vóór het langzaamste punt | zie [rally](#rally-rotation-and-flights) |
| 5 | **gelost** waar de ander vlak bleef of 5 m of meer later liftte | deze ronde liftte alleen |
| 6 | **geremd waar de ander alleen liftte** of vlak bleef | en was meer dan 0,5 m/s langzamer door het midden |
| 7 | **zacht geremd** | hij remde (niet gelost) en had ruimte om harder te remmen - met bandendata: zijn blokkeerslip onder **60%** van de slip waar de remmen van deze auto hun beste werk doen; zonder: een piekvertraging onder **85%** van wat hij bij die snelheid laat zien - het pedaal onder 0,95, en de piekvertraging van de andere ronde meer dan **15%** hoger |
| 8 | **te vroeg geremd** - of **de remmen van de auto** | meer dan 5 m eerder geremd dan de ander. In een andere auto wiens remmen meer dan 5% sterker zijn, en met niet meer dan 10 m speling ten opzichte van de afstand die deze auto nodig heeft bij zijn eigen vertraging: de remmen van de auto. Anders te vroeg geremd, met "Rem later - ongeveer N m" (in een andere auto: de meters boven wat hij nodig heeft) |
| 9 | **uitgerold** | meer dan 10 m met geen van beide pedalen, en 5 m meer dan de ander |
| 10 | **langzamer door het midden** | meer dan 0,5 m/s langzamer bij het langzaamste punt; verdeeld via `v² = a·R` (hieronder) |
| 11 | **langzamer aangekomen** | meer dan 1 m/s langzamer bij het rempunt, niet te vroeg geremd: al eerder bepaald - door de bocht ervoor en de trek van de auto, of door een vlucht in de bocht ervoor die 0,2 s langer was. De auto's als de auto's verschillen |
| 12 | langzamer tot het mikpunt | anders: laat de rem soepeler los en rol meer snelheid het midden in |

**Langzamer door het midden** (`middleSplit`): de straal van elke ronde in zijn langzaamste punt wordt gemeten uit zijn eigen pad (±8 m), zijn zijdelingse versnelling als `v²/R`, en

`ln(v_ander / v_mijn) = ½ ln(a_ander / a_mijn) + ½ ln(R_ander / R_mijn)`.

- De straal verklaart **de helft of meer**: **een te krappe lijn** - "gebruik meer van de weg", met beide stralen en het aandeel.
- Op de grens van de auto (slippend voorbij 10° drift op asfalt / 20° op losse ondergrond, of zijdelingse versnelling van minstens 90% van wat hij bij die snelheid vasthoudt) en de andere auto heeft meer dan 5% meer grip: **de grip van de auto**; bescherm de uitgang in plaats daarvan.
- Slippend erdoor (drift voorbij 10° / 20°) en de andere ronde niet (zijn drift bij het insturen minstens 4° minder): **zijwaarts** - voorbij zijn grip, niet eronder; kom wat langzamer aan. Gezegd als die van de auto, als deze auto zijn achterkant minstens één keer per ronde vaker vangt dan de ander.
- In een andere auto die minder dan **96%** van de grip van de ander vasthoudt, en waarvan de ronde binnen 1 m/s bleef van `v_ander · √(grip_mijn / grip_ander)`: **de grip van de auto** - "later remmen haalt dat niet in".
- Anders **grip over**: zijdelingse versnelling tegenover die van de ander op een vergelijkbare straal, en wat deze auto vasthoudt; neem meer snelheid mee het mikpunt in. Waar het achterwiel van deze auto loslaat voordat zijn grip op is (zijn slides beginnen onder 85% van zijn grip, en de ronde zat op 80% daarvan), zoek je de rest in kleine stappen.

### Oorzaken bij de bochtuitgang {#causes-on-the-way-out}

`exitCause`, de eerste die van toepassing is:

| # | Oorzaak (fout) | Regel |
|---|---|---|
| 1 | een fout in de wagenbeheersing bij de uitgang | niet gedeelde doorslip, draai, slide of klap die eindigt op of na 10 m voor het langzaamste punt |
| 2 | **afgeremde snelheid** | meer dan 1 m/s meer snelheid verloren op vol gas dan de ander; boven **7 m/s (25 km/u)** "eerder een botsing of een draai dan een slide" |
| 3 | **de auto verkeerd gedraaid** (losse ondergrond) | zie [rally](#rally-rotation-and-flights) |
| 4 | **later op het vermogen** | gas erbij meer dan 5 m later, ook geteld vanaf het eigen langzaamste punt van elke ronde (een ronde met een later langzaamste punt wordt niet afgerekend op een later gas) |
| 5 | **aarzelde op het gas** | meer gasdips dan de ander |
| 6 | **ging wijd en wachtte** | meer dan 1,5 m buiten de ander waar beide vlak waren, en vol gas meer dan 5 m later vanaf het eigen langzaamste punt |
| 7 | **vol gas later** | vol gas meer dan 5 m later, ook vanaf het eigen langzaamste punt; met de versnelling van de auto daar |
| 8 | **de aandrijving van de auto** | in een andere auto die bij die snelheid minder dan 95% van de ander trekt, en de trek een deel van het recht stuk verklaarde |
| 9 | **langzamer uit de bocht** | anders: een later mikpunt, zodat de auto eerder recht staat |

Als de twee rondes in het langzaamste punt in verschillende versnellingen zaten, eindigt de tip met "Versnelling N in het mikpunt; de andere gebruikte M."

### Fouten in de wagenbeheersing en klappen {#car-control-faults-and-impacts}

Een fout uit [Gebeurtenissen bij wagenbeheersing](race-control-events.md) als oorzaak: een blokkering is een *remmen*-oorzaak, doorslippen of een slide op het gas een *bochtuitgang*-oorzaak, de rest *ingang*; een klap na het langzaamste punt is *bochtuitgang*, ervoor *ingang*. De tip is die van de gebeurtenis zelf, daarna "Het kostte ongeveer X s tot 40 m erna" (of "tot de auto zijn snelheid weer had" bij een klap). Een blokkering met een rempunt meer dan 5 m eerder dan de ander voegt toe dat de ronde ook te vroeg remde - met wielen die blijven draaien, had dat niet nodig geweest.

### Rally: draaien en vluchten {#rally-rotation-and-flights}

Op **losse ondergrond**, met slipshoeken bij beide rondes, en deze ronde op het vermogen (of vlak) meer dan 5 m later:

- **De auto minder gedraaid**: de andere ronde had de auto **12°** of meer gedraaid bij zijn langzaamste punt, en minstens **8°** meer dan deze ronde. Tip: een lift of een tikje met de linkervoet-rem terwijl hij insturen, met het handremmoment van de andere ronde als alleen die er een gebruikte, of de handrem in een bocht langzamer dan 15 m/s (54 km/u).
- **Te ver gedraaid**: deze ronde had hem 12° of meer gedraaid en minstens **12°** meer dan de andere: hij moest rechtgezet worden voordat het vermogen erop kon.

**Een langere vlucht**: in de lucht 0,2 s of meer langer dan de andere, en minstens 0,03 s kostend van 10 m voor het afspringen tot 40 m na de landing (of het eind van het segment). Vóór het langzaamste punt is het een oorzaak bij het insturen; het wordt het verhaal van de bocht als het 40% of meer verklaart. De tip: houd het gas erop bij het afspringen, en neem de top iets langzamer of met een tikje op de rem.

### De start {#the-start}

Vóór de eerste bocht, bij een sprint of als een van beide rondes stilstaand begon (onder 5 m/s waar beide er eerst op de as zijn) of bij een race-start (onder 60% van de snelheid van de ander), is de run naar het eerste rempunt een eigen bevinding (bocht 0) als hij meer dan 0,03 s verschilt: *De start*, *De race-start* of *Naar de eerste bocht*. Een verlies daar wordt aan de situatie toegeschreven (*omstandigheden*) als de ene ronde bij een race-start begon en de andere met snelheid, aan de auto als de rondes in verschillende auto's zijn, en anders aan de bestuurder. Tips: in een andere auto vanuit stilstand, "vooral de auto"; een stand-start met dezelfde auto: wegrijden met minder doorslippen en schakelen bovenin het vermogensbereik; een race-start: vergelijk hem met een andere eerste ronde; een vliegende start: een betere uitgang uit de laatste bocht wordt meegenomen over de finish.

## De gereden lijn {#the-driven-line}

`lineMetrics`, per ronde en segment (niet voor gemengde complexen), alleen uit posities (geglad over ±2 samples) over het bochtvenster:

| Maat | Regel |
|---|---|
| kromming | koersverandering over ±8 m van het eigen pad van de ronde |
| **krapste straal** | 1 / de piekkromming |
| **insturen** / **uitsturen** | waar de kromming voor het eerst / laatst een vijfde van haar piek overschrijdt |
| **midden** | waar de ronde de helft van zijn koersverandering had gedraaid |
| straal in / uit | gereden meters over de helft van de koersverandering, voor / na het midden |
| **vorm** | krapste straal gedeeld door de gemiddelde straal tijdens het draaien: onder **0,55** een **V**, boven **0,75** een **U**, daartussen "U/V" |
| **mikpunt** | straal uit gedeeld door straal in: boven **1,25** laat, onder **0,8** vroeg, anders midden |
| **snelheidsmikpunt** | het langzaamste punt meer dan **15 m** vóór het midden: langzaam erin, snel eruit; meer dan 15 m erna: nog vertragend voorbij het midden |

Tegenover de andere ronde: hoe ver hij binnen (+) of buiten reed bij het insturen, door het krapste deel en waar beide vlak waren (gezegd vanaf 1 m); waar elk insturen (gezegd vanaf 8 m).

### Welke lijn bij deze auto hier past {#which-line-suits-this-car-here}

`lineFor`, uit wat de bocht naartoe leidt en het karakter van de auto in deze bocht:

- **vermogen-grip** = de versnelling op vol gas van de auto bij de uitgangssnelheid, gedeeld door zijn grip bij de minimumsnelheid (uit zijn enveloppe). **Point and shoot** vanaf **0,45** en hoger; **momentum** bij **0,25** en lager.
- **downforce**: grip bij 151-252 km/u gedeeld door grip bij 54-108 km/u van **1,15** of meer, voor een bocht die met **144 km/u** (40 m/s) of sneller genomen wordt - dan is het een momentum-bocht, wat het vermogen ook is. Niet beoordeeld op losse ondergrond.

| Type bocht | Auto | Lijn |
|---|---|---|
| na een recht stuk | point and shoot / andere | V / U, mikpunt in het midden: "de remzone is de buit" |
| tussen twee rechte stukken | momentum / andere | U / V, laat mikpunt |
| verbinding | momentum / andere | U / V, mikpunt in het midden: "rijd hem voor de uitgang van de volgende" |
| naar een recht stuk | momentum (of een snelle downforce-bocht) | brede ronde U, iets laat mikpunt |
| naar een recht stuk | point and shoot | V: recht remmen, laat insturen, draaien in een korte, strakke middenbocht, vroeg recht |
| naar een recht stuk | daartussen | U met laat mikpunt: langzaam erin, snel eruit |

Waar de uitgang telt (naar een recht stuk, tussen twee), voegt de aandrijving een zin toe: **FWD** - draai hem op de rem, voeg vermogen toe pas als het stuur terugdraait; **RWD** met een vermogen-grip van 0,35 of meer - maak hem recht voor vol gas; **AWD** - hij kan vermogen geven terwijl hij nog draait. Op losse ondergrond voegt elke lijn toe: draai de auto al bij het insturen.

De zin zegt dan wat de ronde reed, en of dat past: *langzaamste laat bindt de uitgang* of *een vroeg mikpunt bindt de uitgang* waar een laat mikpunt gewenst was en de ronde noch laat mikte noch vroeg het langzaamst was; *ronder dan deze auto wil* waar een V gewenst was; *hoekiger dan deze auto wil* waar een U gewenst was; anders *dat past*.

## Voor ontwikkelaars {#for-developers}

Code: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
De redenering en de bronnen: [de methode](race-analytics.md).

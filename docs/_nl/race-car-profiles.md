---
title: "Wagenprofielen en vergelijking"
parent: "Race-analyse"
nav_order: 56
lang: "nl"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Wagenprofielen en vergelijking

Een auto kan maar zo hard remmen, bochten nemen en optrekken. De viewer meet hoe hard, aan de hand van je eigen rondes. Zo vraagt hij nooit iets wat je auto niet kan. Het verklaart ook hoeveel van een verloren seconde aan de auto lag en niet aan jou.

![Auto's vergeleken: twee auto's naast elkaar met hun grip, remvermogen en trekkracht](../assets/img/en/race-cars-compared.webp)

De analyse zegt een ronde alleen dat ze harder moet remmen, meer snelheid moet houden of eerder moet optrekken, waar de auto heeft laten zien dat dat kan. Ook haalt hij uit een verlies wat de auto's zelf verklaren. Daarom worden de grenzen van elke auto (zijn *envelop*, hieronder) en zijn karakter (zijn *profiel*) gemeten uit elke geladen ronde met die auto. Deze pagina gaat over de envelop, het profiel, het gedeelte **Auto's vergeleken** en wat de auto's in elke bocht bepalen.

**Eén auto** = rondes met hetzelfde autonummer (of naam, zonder nummer) en
dezelfde prestatie-index. Een andere afstelling is een andere auto.

## De envelop: wat de auto bij elke snelheid kan {#the-envelope-what-the-car-can-do-at-each-speed}

Per auto, over elke geladen ronde ervan, in **bakken van 5 m/s** (24 bakken, tot
120 m/s). Samples in de lucht, samples die 0,3 s na een landing nog bewegen, en
samples van 0,1 s vóór tot 1 s na elke treffer, vallen af. Versnellingen van
80 m/s² of meer worden genegeerd (dat is meer dan welke auto met neerwaartse kracht ook houdt).

| Envelop | Samples | Waarde per bak | Heeft nodig |
|---|---|---|---|
| **zijdelingse grip** | de zijdelingse versnelling **die een halve seconde vastgehouden wordt** (het gemiddelde van de absolute waarde over een gecentreerd venster van 0,5 s), alleen waar de auto bochtte: minstens een derde van het 99e percentiel van alles | 95e percentiel | 6 samples |
| **remmen** | rem > 0,3; de langsversnelling als de mediaan van elk sample en zijn twee buren | 95e percentiel van de vertraging | 4 samples |
| **volle gas-trekkracht** | gas > 0,95, rem onder 0,05; dezelfde mediaan-van-drie | 90e percentiel | 4 samples |

Waarom een halve seconde vasthouden: een stoeprand, een slip die weer terugklapt, of een auto die wordt
ingehaald, geven allemaal een kortstondige piek in de zijdelingse versnelling. Een auto die dat vaak doet, leek grijper dan hij is. Waarom mediaan-van-drie: bij afstanden van vijf meter is één sample een hele stap. Een piek van één sample is een stoeprand, een hobbel of een muur.

Bij een snelheid wordt de envelop tussen de middens van de bakken geïnterpoleerd. Is een bak leeg, dan wordt de dichtstbijzijnde bak met gegevens gebruikt.

**Over twee soorten ondergrond.** Als de rondes van een auto een vijfde of meer van hun samples op elk van asfalt en los terrein reden, wordt voor elk een aparte envelop bewaard. Elke bocht wordt beoordeeld met de ondergrond onder de auto op zijn traagste punt.

**Overgang.** De snelheid vanaf waar de trekkracht daalt als `1/v` (begrensd door het vermogen), in plaats van vlak te blijven (begrensd door de grip). Dit is de eerste bak waarvan `a·v` binnen 15% ligt van de hoogste `a·v` die is gezien.

## Het profiel: wat voor auto het is {#the-profile-what-kind-of-car-it-is}

`profile`, uit dezelfde rondes (samples op de grond, niet geraakt, sneller dan 8 m/s):

| Maat | Hoe |
|---|---|
| **grip vastgehouden** (m/s²) | 95e percentiel van de halve-seconde vastgehouden zijdelingse versnelling |
| **trekkracht** tot 50 km/h, 50-120, 120-200, boven 200 (m/s²) | het gemiddelde van de volle-gas-trekkracht van de envelop over 3-14, 14-33, 33-56 en 56-90 m/s, bij snelheden die de auto haalde (tot zijn snelste + 2 m/s), uit minstens drie stappen van 1 m/s; en het meeste dat hij liet zien, en waar |
| **remmen** (m/s²) | het remmen van de envelop, gemiddeld van 60 tot 160 km/h (16,7-44,4 m/s), de band die de vergelijking noemt |
| **snelst** | de hoogste snelheid die hij haalde |
| **haalt zijn top bij** | waar hij bij volle gas op een rechte stuk stopte met winnen (hieronder) |
| **trekt nog bij zijn snelste** | de trekkracht van de envelop bij zijn snelste snelheid: hoeveel hij nog had te gaan |
| **achterkant gevangen, per ronde** | keren per ronde dat hij slipte en moest worden opgevangen (hieronder) |
| **aandeel op het gas** | van die keren, het aandeel dat begon met gas > 0,5 en geen rem |
| **laat los bij** | de mediaan van de vastgehouden zijdelingse versnelling 0,15 s vóór elke slip begon, als aandeel van de grip |
| **boven 10° slip, van hard bochten** | van samples die bochten bij 60% of meer van zijn grip, het aandeel dat slipte (10° op asfalt, 20° op los terrein); heeft 30 samples nodig |
| **mediane slip** | over dezelfde samples |
| **balans** | slipshoek voor min achter (veelvouden van de nominale piek) waar hard gebocht wordt en niet geslipt, gemiddelde van minstens 30 samples: + duwt naar buiten |
| **ondergrond** | bij meer dan 80% losse samples: los; onder 20%: asfalt; anders gemengd |

**Topsnelheid bereiken.** Een sample telt mee wanneer de seconde eromheen (±0,5 s, met minstens 0,9 s aan data) helemaal op volle gas lag (gas > 0,95, geen rem), op de grond, en **rechtdoor** werd gereden (|zijdelings| onder het grootste van 4 m/s² en een kwart van zijn grip), met winst onder **0,35 m/s²**, sneller dan 25 m/s en binnen 90% van de snelste van de ronde. Volle gas een heuvel op of door een lange bocht stopt ook met winnen, ver onder de topsnelheid van de auto. Zijn er bij alle rondes samen minstens **één seconde** zo'n plateau, dan is de mediaan van die snelheden waar hij zijn top bereikt. Anders is er geen topsnelheid. Was er geen rechtstuk lang genoeg, dan zegt *trekt nog bij zijn snelste* hoe ver hij daarvan af was. Er wordt niets geraden buiten wat de rondes laten zien. Versnellingsbak en begrenzer maken een einde aan de trekkracht van een auto lang voordat de luchtweerstand dat doet.

**De achterkant verliezen.** Geteld waar de bestuurder hem moest opvangen: bochtend bij 60% of meer van zijn grip, slippend (slip boven 10° op asfalt, 20° op los terrein), met het stuur (boven 0,06) **tegen** de bocht ingedraaid. Welk teken van het stuur bij welk teken van de bochtkracht hoort, wordt per ronde gemeten (samples die draaien zonder te slippen). Een slip telt één keer totdat de auto ophoudt te slippen. Een auto die bewust een beetje zijwaarts wordt gereden, verliest niets. Een auto die tegenstuur nodig heeft, wel. Het wordt voor elke auto hetzelfde geteld, zodat twee auto's vergeleken kunnen worden. Het vereist stuur en een slipshoek.

## Auto's vergeleken {#cars-compared}

Het zijbalkgedeelte is **De auto** bij één auto en **Auto's vergeleken** bij meerdere.

**De tabel**: een kolom per auto, een rij per maat waarvoor een van de auto's een waarde heeft: grip vastgehouden; trekkracht tot 50 km/h, 50-120, 120-200, boven 200; remmen; snelst; Topsnelheid bereikt ("trekt nog" waar hij die nooit haalde); trekt nog bij zijn snelste; achterkant gevangen, per ronde; boven 10° slip, van hard bochten. Waar de auto's meer dan 3% verschillen, is de betere waarde gemarkeerd (hoger voor grip, trekkracht, remmen en snelheden; lager voor achterslippen).

**Eén auto alleen**: zinnen over wat de rondes van hem laten zien: de grip die hij houdt (m/s² en g), zijn trekkracht in elke band, waar hij stopte met winnen op de lange rechte stukken (of dat hij nooit zijn top bereikte, en wat hij nog trok bij zijn snelste), en hoe vaak zijn achterkant moest worden opgevangen ("bijna nooit" onder één keer per ronde, "meestal op het gas" als 60% of meer daar begon).

**Twee auto's**: voor elk paar een zin per auto over hoe hij tegenover de ander staat ("X versnelt beter, maar kan niet zo hard draaien, heeft meer afstand nodig om te stoppen en verliest de achterkant makkelijker"), de tabel, elk duidelijk verschil het grootst eerst, en dan **Zo rijd je elke auto**. Bij meer dan **3** paren wordt er één paar getoond: de auto van de gekozen ronde tegen een auto die je kiest uit een keuzelijst (standaard de auto van de beste ronde van zijn klasse, anders die van de referentie, anders de eerste andere).

Een verschil wordt alleen genoemd als de rondes het duidelijk laten zien:

| Verschil | Genoemd vanaf | Zin |
|---|---|---|
| grip | **4%** | "X houdt N% meer grip door de bochten … dat is M% meer snelheid door het midden van elke bocht" (snelheid = √ van de grip-verhouding) |
| trekkracht | **5%**, in de eerste band die beide auto's hebben van 120-200, 50-120, boven 200 km/h | "X versnelt N% harder van 120 naar 200 km/h"; ook van de start, of "hoewel Y sneller van de start komt", als de start 8% verschilt |
| topsnelheid | **4 km/h** | "X haalt een hogere top: hij stopte met winnen bij …" |
| topsnelheid, slechts één | één auto haalde zijn top, de ander niet | "Y had geen trekkracht meer bij …; X won nog snelheid toen hij remde" |
| topsnelheid, geen van beide | geen van beide haalde zijn top | waar elk nog aan het winnen was bij zijn snelste |
| remmen | **5%** | "X stopt N% harder … Y moet eerder remmen" |
| achterkant verliezen | minstens één keer per ronde meer **en** de helft vaker | "X verliest de achterkant makkelijker: hij schoof ver genoeg weg om N keer per ronde tegenstuur nodig te hebben, tegen M bij …" - meestal op het gas (60%+) of meestal inzetten en loslaten (30% of minder), vanaf ongeveer P% van zijn grip; op los terrein "een deel daarvan is hoe een auto gestuurd wordt; het opvangen niet" |
| zijwaarts | **12 procentpunten** van hard bochten boven de slipgrens | "X rijdt meer zijwaarts aan de grens" |
| voorbalans | **0,3** van de nominale piek | "X duwt meer aan de voorkant … Hij wil eerder afgeremd en ingestuurd worden vóór het apex" |

De eigenschappen in de samenvatting: *houdt meer grip* / *kan niet zo hard draaien*,
*versnelt beter* / *trekt minder*, *haalt een hogere top* / *haalt een lagere top*,
*trekt nog aan het eind van de rechte stukken* / *heeft geen trekkracht meer*, *stopt
harder* / *heeft meer afstand nodig om te stoppen*, *is stabieler* / *verliest de
achterkant makkelijker* (*is veel slipperiger …* bij twee keer zo vaak plus één; *moet vaker
worden opgevangen* op los terrein), *duwt aan de voorkant*. "Weinig verschil met
Y op deze rondes" als er geen is.

**Zo rijd je elke auto:**

- de ene auto houdt meer grip en de andere trekt meer: houd snelheid door het midden op een brede, ronde lijn (de "U") bij de grippe auto; rem recht, draai hem in een korte, strakke middenbocht en rechtzet de uitgang (de "V") bij de sterke auto;
- de ene auto is in beide achter: zijn beste ronde is de schoonste - rem recht, de breedste radius, volle gas zo vroeg als het houdt;
- een auto die de achterkant makkelijker verliest: geef het gas pas toe als het stuur ontspant, en schakel kort (slippen op het gas), of laat de rem zacht los en houd door het midden een gelijkmatig gas (slippen bij het inzetten).

De hint onder het gedeelte herhaalt hoe elk gemeten wordt.

## Wat de auto's in een bocht bepalen {#what-the-cars-decide-in-a-corner}

Als de rondes in verschillende auto's gereden zijn, eindigt elke bevinding over een verloren bocht met
**De auto's:** - wat daarvan de auto's bepalen, en hoe je het meeste haalt uit deze auto (`carNote`):

- **Door het midden**, wanneer deze auto minder dan 96% van de grip van de ander houdt, de ander op het traagste punt meer dan 0,5 m/s sneller was, en deze ronde niet ver onder wat zijn grip verklaart lag (boven 70% ervan): op de lijn van de andere auto staat de grip van deze auto `v_andere · √(grip_mijn / grip_andere)` toe. Haalde de ronde dat (binnen 1 m/s), dan is het verschil de auto, en geen remmomentwijziging verandert dat. Haalde hij minder, dan wordt aangegeven hoeveel er nog te halen is. Dan waar de tijd nu wel te winnen is: op een rechte stuk, tussen twee, of in een auto die 5% harder trekt - na het apex (rem recht, stuur later in, wijs vroeg naar de uitgang); anders de breedste radius die de weg toelaat.
- **Een achterkant die hier losliet** (een niet-gedeelde slip of spin, of een slip voorbij de slipgrens op de weg naar binnen), in een auto die hem minstens één keer per ronde en de helft vaker verliest: wat je met deze auto moet doen - het gas geleidelijk toegeven terwijl het stuur ontspant (zijn slippen beginnen in 60% of meer van de tijd op vermogen) of de rem zacht loslaten zonder lift.
- **De rechte stuk erna**: wanneer de trekkracht van de auto's 0,03 s of meer verklaarde, de sterkere trekkracht van de andere auto vanaf dezelfde snelheid, met de trekkracht van beide auto's van 120 tot 200 km/h.
- **Topsnelheid**: wanneer deze ronde 98% bereikte van waar zijn auto op een rechte stuk van meer dan 150 m zijn top haalt, en de andere 1,5 m/s sneller ging: dat is de topsnelheid van de auto, en elke km/h meer uit de bocht helpt nog tot hij die bereikt.
- **Remmen**: wanneer de andere auto 5% harder remt en deze ronde meer dan 5 m eerder remde, dat een deel van het eerdere remmen aan de auto ligt.

Het aandeel van de auto wordt ook van de tijd zelf afgetrokken, zie
[het aandeel van de auto](race-corner-analysis.md#the-cars-share). Een bocht waar de auto 60% of meer verklaart, wordt aan de auto toegeschreven.

## Voor ontwikkelaars {#for-developers}

Code: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` in [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` in [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).

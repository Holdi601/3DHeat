---
title: "Manøvrer"
parent: "Innsikt"
nav_order: 4
lang: "no"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manøvrer: hvordan grupper beveger seg

**Innsikter → Manøvrer** følger hvordan enhetene på hver side beveger seg *som grupper*,
og gir navn til manøvrene de gjør: en flanke, en knipetang, et gjennombrudd, et
bakhold, en tilbaketrekning, et missilforsvar, å krysse T-en. For hver får du
hvor sikker den er, tallene bak den, om den lønte seg, og dens paralleller i
doktrine og historie. **Massanalyse → Manøvrer** teller dem over tusenvis av
kamper: hvor ofte hver blir gjort per kart, modus og side, og hvor ofte den
lønner seg.

Alt regnes ut i nettleseren din, i sin egen arbeider (`src/insights/maneuver`).
En kamp med noen hundre enheter tar 10–500 ms, en to timer lang luftkrig med
tusenvis av objekter tar omtrent ett sekund.

## Slik bruker du den {#using-it}

- Åpne **Innsikter**, fanen **Manøvrer**. Den teller når den åpnes første gang.
  Bruk **Finn igjen** etter at du har endret filtre.
- **Sikker / Sannsynlig / Mulig** velger hvilken sikkerhet som vises (Sannsynlig som standard).
- **Tidslinjen** har en bane per side og en stolpe per manøver; **listen** under
  den viser det samme, sortert etter tid. Et klikk hopper til starten av
  manøveren i reprisen, flytter kameraet dit og tegner den i 3D: hver gruppes
  vei som en pil (en knipetangs to armer er buene), gruppenes omriss på det
  avgjørende øyeblikket (fiendens i sidens farge), og fiendens front som en
  hvit linje. **Tegn alle i 3D** legger til kampens andre manøvrer, svakt.
  Linjene sendes til grafikkortet én gang, når valget endres, ikke hver
  bilde. Med 480 manøvrer tegnet under avspilling er bildetidene på et ekte
  grafikkort (WebGL2 og WebGPU, p99 18,0–18,5 ms, maks 19,5–20,8 ms) de samme
  som uten.
- En åpnet manøver viser utfallet (drap og tap blant enhetene som utførte den,
  mens den pågikk og rett etter, mot sidens eget bytteforhold over kampen), beviset
  og kunnskapsbasens oppføringer for den: doktrinen og de historiske parallellene
  (Cannae for en knipetang, Sedan 1940 for et gjennombrudd, Tsushima for å krysse
  T-en, Operation Bolo for en finte …).
- Den lille tabellen nederst: per type og side, utført og lønte seg.

![En knipetang i den syntetiske demokampen: begge armers piler, fiendens kropp og dens front](../assets/img/en/maneuvers.webp)

## Slik finnes gruppene {#how-groups-are-found}

Hver enhet plasseres på en felles tidslinje (et steg på 1 s til fots, ellers 2 s,
lengre for svært store filer). Den holdes stille ved en død, så en gjenoppstått
enhet ikke tegner en linje over kartet. Ved hvert steg knyttes enhetene til en
side og en type (fly, kjøretøy, skip, infanteri) sammen når de er nær hverandre
– 18 m til fots, 170 m for kjøretøy, 3 km for skip og 5 km for fly – og beveger seg
likt (hastighetene innen halvparten av den raskeste sin fart, eller begge står stille).
En klynge beholder id-en til gruppen de fleste av medlemmene var i. En enhet uten
klasse settes til fots, i kjøretøy eller i luften etter farten.

En gruppes **form** leses i forhold til retningen den vender: en kolonne eller en
linje etter hvor den er spredt langs og tvers, en kile der midten er foran, et
echelon der medlemmene trer tilbake til én side, en boks der de holder hjørnene.

Alt bedømmes i kampens egen skala: **engasjementsavstanden** `R` er 75-persentilen
av avstanden mellom en dreper og offeret (begrenset til domenets fornuft), og en
manøvers tider skaleres etter type enhet (infanteri en tredjedel av bakkens).

## Hva den finner {#what-it-finds}

| Manøvre | Funnet når |
|---|---|
| Formasjon | en gruppe beholder én form på 60 % av sine bevegelige steg i 30 s |
| Frontalangrep | en gruppe nærmer seg fra utenfor rekkevidde til kontakt, ¾ R eller mer, fra innenfor 35° av den veien fienden vender |
| Flankeangrep | det samme fra 50–130° (baksiden over det); sikkert bare med en venneklig *fiksende styrke* som kjemper mot fienden der (drap begge veier) |
| Knipetang | to flankeangrep fra én side mot samme fiendtlige kropp, fra motsatte sider (100° eller mer fra hverandre), innen 90 s; sikker når armene kjemper |
| Omringing | en kompakt fiendtlig gruppe med minst like mange av den andre siden rundt seg innen 1,5 R, fra to eller flere grupper, ingen mellomrom over 100°, i et minutt, avskåret fra sin egen side; sikker når ringen lukket seg med ½ R og kjempet om lommen |
| Gjennombrudd | en gruppe passerer en holdt linje (fiender som står i 30 s både til venstre og høyre for den, sidens senter bak dem); sikker når den kommer ½ R forbi, blir der i 20 s og kjemper der; et gjennombrudd en ekstra R forbi |
| Sprangvis fremrykking med dekning | i en liten gruppe beveger en del seg mens resten står, rollene byttes fire ganger eller mer, med dekkende ild fra den stående delen |
| Kraftsamling / spredning | en sides andel nær sitt tetteste punkt stiger fra 35 % til 60 % (enheter kommer 1,5 R eller mer, deretter kontakt) – eller synker når siden sprer seg |
| Finte | et lite element i kontakt trekker to eller flere fiender fra et annet sted; en større gruppe slår så til fire rekkevidder unna der fienden har færre |
| Tilbaketrekning / forfølgelse | en gruppe i kontakt vender bort og åpner R fra der den kjempet; sikker når en fiende der nettopp hadde drept en av den, og gruppen kom 2 R fra den som drepte (aldri til fots: se nedenfor); fiender som beveger seg samme vei og henger med, forfølger |
| Forsvar i dybden | stående enheter i to eller flere belter over fiendens akse, R dypt, fienden kommer, ild fra beltene |
| Forsvar i bakhellet | tre eller flere drap på kort hold av stående enheter, der ofrene kom over en rygg |
| Bakhold | en bevegelig gruppe møter fiender som sto i 45 s; de skyter først og bevegelige mister to eller halvparten av gruppen |
| Skjerm | en eller to enheter som beveger seg foran et legeme på tre eller flere, og møter fienden først |
| Indre linjer | en sides grupper er tett samlet mellom den andres, enhetene skifter mellom dem |
| Tempo | en side som svarer på kontakt (sving, fartsendring, første skudd) 1,5 ganger raskere, Mann-Whitney p under 0,05 |
| Crank, notch, drag, pump | målet for en missilavfyring vender skytteren til 35–70°, 75–105°, forbi 140°, eller drar og vender tilbake |
| Lufttang, mur, lead-trail, grinder | et par som deler seg mot én fiende; tre på linje mot fienden; et element 5–20 km bak et annet; to som kretser rundt ett punkt, ett punkt fra hverandre |
| Kampluftpatrulje | kretser rundt en stasjon i tre minutter |
| Energi- / vinkelkamp | i en nær kamp – kurser 30° fra hverandre, hver har den andre på nesen annenhver gang, eller et drap mellom dem – høyde brukes og stiger, eller flatt og svinger hardt mens farten synker; sikker når den ene drepte den andre |
| Angrepspakke, SEAD | en luftgruppe med blandede roller, hvorav noen treffer bakken; luftvernets drap før de fleste andre bakkedrap |
| Slagorden, krysse T-en | tre skip i kolonne; en kolonne som tvers over hodet på en fiendtlig kolonne |

Hver manøver sier hvilke kunnskapsbasens **mønstre** den viser
(`patterns-maneuver.ts`: formasjon, frontalangrep, dobbel omfatning,
omringing, gjennombrudd, ild og bevegelse, finte, tilbaketrekning, forfølgelse,
forsvar i dybden, skjerming, spredning, missilforsvar, vinkelkamp,
kampluftpatrulje, angrepspakke, slagorden og krysse T-en) og oppføringene
som bør leses først. Eldre oppføringer får de nye mønstrene gjennom
`knowledge/maneuver-tags.ts`. Se [Kunnskapslinsen](knowledge.md).

**Lønte seg** sammenligner enhetenes bytteforhold mens den pågikk (og et minutt etter)
med sidens over kampen. En tilbaketrekning lønner seg når den mistet færre enheter
etter å ha snudd enn før, et missilforsvar når flyet lever et minutt, og en
omringing når lommen mister halvparten.
## Over mange kamper {#over-many-matches}

Hver kamps sammendrag (`src/mass/summarize.ts`, se [Massanalyse](mass-analysis.md))
har en liten `maneuvers`-del: per type og side, utført (ved Sannsynlig eller høyere),
lønte seg, lønte seg ikke, drap og tap. **Massanalyse → Manøvrer** legger dem sammen
over de kampene filteret beholder – per kart og modus, eller samlet – med Wilson-intervallet
for andelen som lønte seg. En rad laster kampene den ble gjort i. Sammendrag skrevet før
denne delen fantes, har ingen; kjør `node tools/3dheat-summarize.mjs <mappe> --force`
for å legge den til.

## Hvor sikker den er {#how-sure-it-is}

Syntetiske kamper med innlagte manøvrer (`synth.ts`, kjørt av `maneuver.test.ts`): alle
28 innlagte typer finnes på Sannsynlig eller høyere; av 50 rapporterte manøvrer er 31 den
innlagte typen, og de andre 19 finnes også i virkeligheten (den bevegelige gruppens form,
innrykket til den gjennombrytende kolonnen). Ingen er feil. På 30 nullmodell-kamper –
tilfeldige gåturer hver for seg og blandet, enheter som står tilfeldig, fly på rette
baner, en folkemengde som sirkulerer – rapporteres ingenting på Sannsynlig eller høyere.

På ekte data (dusinvis av bakkeslag, noen få lange luftkrigsoppdrag, et dusin skytterkamper):
frontalangrep, flanker, gjennombrudd og omringinger i panserslagene, formasjoner og nære
kamper i luften, missilforsvar, kampluftpatruljens baner og lead-trail-par i luftkrigsoppdragene,
frontale utførelser, kolonner og noen få bakhold og sprangvise par i skytterspillet.
Terskelverdiene er doktrinens former i spillets skala; les ett enkelt funn med beviset sitt,
og tabellens andeler med deres intervaller.

### Mot nullmodeller av de samme kampene {#against-null-models-of-the-same-matches}

En detektor kan lures av terrenget og folkemengden: i et virvar har hver gruppe fiender
rundt seg. Derfor kjøres hver type også på **nullmodeller** bygget av de samme kampene
(`nulls.ts`), der sidene ikke lenger møtes slik de gjorde: den ene sidens tidslinje
snudd rundt en tredjedel til to tredjedeler av kampen (*shift*), eller dens baner snudd
rundt kartets senter (*rotate*); og lagetikettene blandet (*teams*, som per konstruksjon
beholder omtrent halvparten av de ekte kampene). Kamper telles bare når drap er parret med
sine dødsfall, med drapsmannen innen 2 R og offeret på stedet – en nullmodell bryter
disse. Funn på Sannsynlig eller høyere, ekte mot nullmodellene (30 panserslag; 12 skytterkamper):

| Type | Panserslag: ekte / shift / rotate | Skytter: ekte / shift / rotate |
|---|---|---|
| Omringing | 0 / 0 / 0 (var 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Gjennombrudd | 0,03 / 0,02 / 0,05 (var 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flanke | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontalangrep | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Tilbaketrekning | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (så aldri sikker til fots) |
| Bakhold | - | 0,17 / 0,04 / 0,04 |
| Energikamp | 1,2 / 0,1 / 0,85 | - |
| Vinkelkamp | 0,6 / 0,07 / 0,3 | - |

Nære luftkamper over et slagfelts midte overlever en svingning rundt det midtpunktet, så
rotate-kolonnen smigrer dem mindre enn den gjør bakkeartene. Typer innenfor én side –
formasjon, kampluftpatrulje, grinder, angrepspakke, SEAD, sprangvis fremrykking, skjerm – er
ikke avhengige av den andre siden og testes ikke slik. `maneuver.test.ts` sjekker at
nullmodellene fjerner den innlagte flanken, knipetangen, omringingen, gjennombruddet,
bakholdet og tilbaketrekningen fra de syntetiske kampene.

## Begrensninger {#limits}

- Grupper trenger posisjoner over tid; en fil med bare hendelser har ingen.
- Retningen leses ikke fra dataene: fiendens front er der den fiksende styrken møter den,
  ellers der den beveger seg, ellers der angriperen kom fra.
- Terrenget leses fra enhetenes egne høyder (bakhellet); det finnes ingen sikt-test.
- Svært store filer samples med lengre steg; korte luftmanøvrer i dem leses likevel fra
  2–4 s steg.

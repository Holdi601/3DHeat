---
title: "Figurer"
parent: "Repriser"
nav_order: 3
has_children: true
lang: "no"
source: "figures.md"
source_hash: "7040eba3b7ac"
translated: true
outdated: false
---

# Figurer

En **figur** er en liten 3D-modell av hva en enhet virkelig er: en stridsvogn, et jetfly, et skip, en soldat. [Avspillingen](match-replay.md) tegner hver enhet som sin figur i sann størrelse, i stedet for en vanlig boks.

Det finnes omtrent 2 000 navngitte kjøretøy, fly, skip, våpen og soldater, alle bygget av visningsprogrammet selv.

![Stridsvogner i demoen, tegnet som sine egne figurer](../assets/img/no/replay-tanks.webp)

## Hva som finnes i katalogen {#what-is-in-the-catalogue}

| Område | Eksempler |
|---|---|
| Personer | soldat stående, kne, liggende; snikskytter, panservernmann, sanitet, mannskap |
| Bakke | stridsvogner, infanteri-kampvogner, luftvern, artilleri, lastebiler og biler, tog og trikker |
| Luft | jagerfly, angrepsfly, bombefly, transportfly, helikoptre, fra toplanssfly til moderne jetfly |
| Sjø | krigsskip etter klasse, hangarskip, ubåter, båter, handelsskip |
| Våpen | missiler, raketter, bomber, torpedoer, blinkbluss og aluminiumsstrimler |
| Markører | røyk-, blink- og branngranater, plasserte bomber, flagg, startpunkter, veipunkter |
| Nærkamp | soldater i skuddsikre vester med automatgevær, maskinpistol, hagle, DMR, LMG, pistol eller skjold; droner, kameraer, piggtråd, skjold, veggforsterkning, barrikader, sprengladninger, feller, vinduer, granater, desarmeringsenheten |

## Slik lages figurene {#how-the-figures-are-made}

- **Bygget av publiserte mål.** De fleste figurer lages av visningsprogrammets egen figurbygger fra offentlige tall: lengde, bredde, høyde, veihjul, tårn og kanon, vinger og hale. Formen justeres deretter mot offentlige fotografier, tegninger og publiserte mål. Ingen spills modeller brukes.
- **Frie modeller.** Noen få figurer bruker frie 3D-modeller (CC0 eller CC BY) der de er mer riktige, noen ganger kombinert med det bygde skroget. Forfattere av CC BY-verk krediteres på [Kreditering av figurer](figure-credits.md); CC0-verk krever ingen kreditering og er ikke oppført der.
- Hver figur har en full, en grov og en fjern versjon (detaljnivåer, LOD), slik at tusenvis kan tegnes samtidig.

## Hvilken figur en enhet får {#which-figure-a-unit-gets}

Visningsprogrammet ser på dataens egne kolonner:

1. **Navn** - kolonner kalt *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* eller *Figure* - sammenlignes med katalogen: nøyaktig, gjennom omtrent 4 000 aliaser (spillenes enhets-id-er for flere spill), ved den lengste kjente starten (`F-16C_50` er F-16C), eller ved det korteste figurnavnet som starter med det.
2. Et navn hvis figur ikke passer til enhetens **type**, brukes ikke (en lastebil som heter *Typhoon* er ikke jagerflyet).
3. **Typer** - kolonner kalt *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* eller *Domain* - gir en klassefigur: Tacview-merker (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kartikoner, eller vanlige ord (tank, helikopter, infanteri).
4. Data med ingen av delene er data om personer: alle er soldater.

Den enkleste måten å få de riktige figurene på er derfor en `vehicle`-kolonne med de virkelige navnene, eller en `type`-kolonne med Tacview-merker.

**Enheten min vises som en boks eller en soldat.** Legg til en `vehicle`-kolonne med det virkelige navnet, eller en `type`-kolonne med et Tacview-merke. Hold musen over enheten for å se hvilket navn som ble matchet. Data som har slike kolonner, men ikke sier noe om en enhet, lar den bli en boks; data uten noen av dem tegnes som soldater.

## Nærkampfigurer (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Tabeller som er skrevet slik Rainbow Six Siege-avspillingsleseren skriver dem (kolonnene `operator`, `pawn`, `primaryClass`, `side`), får egne figurer:

- **Spillere** er operatøren sin: Hver av de 78 operatørene har en egen figur, omtrent 1,8 m høy, i egne klær – to eller tre farger for jakke, bukser og utstyr etter det vanlige offentlige utseendet deres (svart, oliven, sandfarget, urban grå, hvit, marineblå, med rødt, oransje eller blågrønt utstyr) – og med egne former, en tredjedel større enn i virkeligheten der de må synes ovenfra: hodeplagg (hjelmer, et visir eller en tung hjelm, capser, luer, beretter, en bred boonie-hatt eller pelslue, hetter, skjerf, hår), ansiktet (vernebriller, en gassmaske, briller, en maske, et skjegg, briller med tre linser), en lett, middels eller tung kroppsbygning (de tunge er brede, med store skulderplater og en krage), en lang frakk eller en dress, en ghilliedrakt, det de bærer på ryggen (en hammer, ladninger, droner, beholdere, en drivstofftank, et utskytningsrør, en armbrøst, paneler, en jammer, et skjold) eller på armen (en utskyter, en metallarm), sitt eget skjold (et høyt skjold, et opprørsskjold, et skjold med lys) og en aksentfarge på skuldrene. De holder klassen til primærvåpenet sitt. En operatør som visningsprogrammet ikke kjenner, er en vanlig soldat i skuddsikker vest i lagets farge.
- **Siden** vises atskilt fra klærne: en ring på bakken under hver operatør, **ravgul for angrep, lys cyan for forsvar**, med lagets farge inni, og arm- og hodebånd i samme farge. En `stance`-kolonne (stående, hukende, liggende) gir dem en stilling. Uten den står de.
- **Kan skilles fra hverandre på avspillingsavstand:** Når de tegnes 48 piksler høye ovenfra og skrått fra tre kvarte, skiller hvert par operatører på en side seg med en tydelig fargeforskjell eller en annen form (kontrollert av visningsprogrammets tester).
- **Etiketter** viser spilleren og operatøren som spilles i det øyeblikket, med operatørens rolle som symbol: ✸ hard bryter, ⚒ myk bryter, ➤ inntrenger, ✦ fragger, ✚ støtte, ⬟ skjold, ◉ etterretning, ◇ fleks, ↺ flankevakt, ⚓ anker, ✕ fellesetter, ⇄ streifer, ↯ anti-dings, ▣ anti-gjennombrudd.
- **Droner** er en kastbar drone på to hjul, omtrent 30 cm bred. Hver er et eget spor, oppkalt etter eieren («Ash · drone 2»).
- **Utplasserte duppeditter** står der de ble satt, fra da til runden slutter, hver som figuren for det den gjør: et kamera, piggtråd, et utfellbart skjold, en sprengladning, en ladning for hardt gjennombrudd, en liten klebeladning, en gulvfelle, en claymore med snubbellaseren sin, et enveisvindu, et panserpanel, en granat, en gassbeholder, en jammer, en sensor, en laserport, en forsyningskasse. Én figur brukes for alle duppeditter som gjør den samme jobben. En duppeditt der dataene ikke sier hva slags den er, er en liten enhet med et lys.
- **Desarmeringsenheten** står der den ble plassert, i sine 45 sekunder.

Hver drone og duppeditt blir et eget spor når filen lastes inn, så spillerens egen figur blir værende på spillerens kropp. Operatørene er forenklede former etter offentlige beskrivelser og bilder av dem (det de har på seg, enheten som er evnen deres), og duppedittene er formet etter det de gjør. Alle er visningsprogrammets egne design i tingens virkelige størrelse (en claymore er omtrent 22 cm bred, et panel på størrelse med en dør er 1 m ganger 2,1 m), ikke modeller fra spillet.

## Innstillinger {#settings}

Delen **Figurer** i sidepanelet for avspillingen setter størrelsen, den minste størrelsen på skjermen, hva fjerne enheter blir (figur, pil, symbol), og effektene som tegnes på dem. Se [Kampreplay](match-replay.md#figures). Røyk, brann og andre tidsbestemte effekter: [Figurer i figuroverlegget](figure-replay.md).

## En valgfri lokal figurpakke {#an-optional-local-figure-pack}

Du kan beholde en valgfri pakke med egne figurer på din egen maskin. Figurene erstatter katalogfigurer med samme navn. Den er aldri en del av depotet eller en publisert versjon; uten en pakke endres ingenting.

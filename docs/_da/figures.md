---
title: "Figurer"
parent: "Replay"
nav_order: 3
has_children: true
lang: "da"
source: "figures.md"
source_hash: "7040eba3b7ac"
translated: true
outdated: false
---

# Figurer

En **figur** er en lille 3D-model af, hvad en enhed egentlig er: en tank, et jetfly, et skib, en soldat. [Replayet](match-replay.md) tegner hver enhed som sin figur i sand størrelse i stedet for en simpel boks.

Der er cirka 2.000 navngivne køretøjer, fly, skibe, våben og soldater. Alle er bygget af fremviseren selv.

![Tanks fra demoen tegnet som deres egne figurer](../assets/img/da/replay-tanks.webp)

## Hvad der er i kataloget {#what-is-in-the-catalogue}

| Område | Eksempler |
|---|---|
| Mennesker | soldat stående, knælende, liggende; snigskytte, panserværnssoldat, sanitet, besætning |
| Jord | kampvogne, infanterikampkøretøjer, luftværn, artilleri, lastbiler og biler, tog og sporvogne |
| Luft | jagerfly, angrebsfly, bombefly, transportfly, helikoptere, fra biplaner til moderne jetfly |
| Hav | krigsskibe efter klasse, hangarskibe, ubåde, både, handelsskibe |
| Våben | missiler, raketter, bomber, torpedoer, signalblus og chaff |
| Markører | røg-, blitz- og brandgranater, plantede bomber, flag, spawnpunkter, vejpunkter |
| Nærkamp | soldater i skudsikre veste med stormgevær, maskinpistol, haglgevær, DMR, LMG, pistol eller skjold; droner, kameraer, pigtråd, skjolde, vægforstærkning, barrikader, sprængladninger, fælder, vinduer, granater, desarmeringsenheden |

## Sådan laves figurerne {#how-the-figures-are-made}

- **Bygget ud fra offentliggjorte mål.** De fleste figurer er lavet af fremviserens egen figurbygger ud fra offentlige tal: længde, bredde, højde, vejhjul, tårn og kanon, vinger og hale. Deres form tilpasses derefter offentlige fotos, tegninger og offentliggjorte mål. Ingen spils modeller bruges.
- **Frie modeller.** Nogle få figurer bruger frie 3D-modeller (CC0 eller CC BY), hvor de er mere korrekte. Nogle gange kombineres de med det byggede skrog. Ophavsmænd til CC BY-værker krediteres på [Figurkreditter](figure-credits.md). CC0-værker kræver ingen kreditering og står ikke listet der.
- Hver figur har en fuld, en grov og en fjern version (detaljeniveauer, LOD), så tusindvis kan tegnes på én gang.

## Hvilken figur en enhed får {#which-figure-a-unit-gets}

Fremviseren ser på dataenes egne kolonner:

1. **Navne**: kolonner, der hedder *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* eller *Figure*, matches mod kataloget. Matchet sker præcist, gennem omkring 4.000 aliasser (spilenes enheds-id'er), ved det længste kendte begyndelsesstykke (`F-16C_50` er F-16C) eller ved det korteste figurnavn, der starter med det.
2. Et navn, hvis figur ikke passer til enhedens **type**, bruges ikke. En lastbil ved navn *Typhoon* er ikke jagerflyet.
3. **Typer**: kolonner, der hedder *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* eller *Domain*, giver en klassefigur. Det kan være Tacview-tags (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kortikoner eller almindelige ord (tank, helikopter, infanteri).
4. Data uden nogen af dem er data om mennesker. Alle er en soldat.

Den nemmeste måde at få de rigtige figurer på er altså en `vehicle`-kolonne med de rigtige navne eller en `type`-kolonne med Tacview-tags.

**Min enhed vises som en boks eller en soldat.** Tilføj en `vehicle`-kolonne med det rigtige navn, eller en `type`-kolonne med et Tacview-tag. Hold musen over enheden for at se, hvilket navn der blev matchet. Data, der har sådanne kolonner, men intet siger om en enhed, lader den stå som en boks. Data uden nogen af dem tegnes som soldater.

## Nærkampsfigurer (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Tabeller, der er skrevet som dem fra Rainbow Six Siege-replaylæseren (kolonnerne `operator`, `pawn`, `primaryClass`, `side`), får deres egne figurer:

- **Spillere** er deres operatør: Hver af de 78 operatører har sin egen figur, cirka 1,8 m høj, i sit eget tøj – to eller tre farver til jakke, bukser og udstyr efter deres sædvanlige offentlige udseende (sort, oliven, sandfarvet, urban grå, hvid, marineblå, med rødt, orange eller petroleumsblåt udstyr) – og med deres egne former, en tredjedel større end i virkeligheden, hvor de skal kunne ses ovenfra: hovedbeklædning (hjelme, et visir eller en tung hjelm, kasketter, huer, baretter, en bred boonie-hat eller pelshue, hætter, tørklæder, hår), ansigtet (beskyttelsesbriller, en gasmaske, briller, en maske, et skæg, briller med tre linser), en let, mellem eller tung bygning (de tunge er brede, med store skulderplader og en krave), en lang frakke eller et jakkesæt, en ghillie-dragt, det, de bærer på ryggen (en hammer, ladninger, droner, beholdere, en brændstoftank, et affyringsrør, en armbrøst, paneler, en jammer, et skjold) eller på armen (en affyringsenhed, en metalarm), deres eget skjold (et højt skjold, et uropolitiskjold, et skjold med lys) og en accentfarve på skuldrene. De holder klassen af deres primære våben. En operatør, som fremviseren ikke kender, er en almindelig soldat i skudsikker vest i holdets farve.
- **Siden** vises adskilt fra tøjet: en ring på jorden under hver operatør, **ravgul for angreb, lys cyan for forsvar**, med holdets farve indeni, og arm- og hovedbånd i samme farve. En `stance`-kolonne (stå, sidde på hug, ligge) giver dem en stilling. Uden den står de.
- **Kan skelnes på replay-afstand:** Når de tegnes 48 pixels høje ovenfra og skråt fra tre fjerdedele, adskiller hvert par operatører på en side sig ved en tydelig farveforskel eller en anden form (tjekket af fremviserens tests).
- **Etiketter** viser spilleren og den operatør, der spilles i det øjeblik, med operatørens rolle som symbol: ✸ hård gennembryder, ⚒ blød gennembryder, ➤ indtrænger, ✦ fragger, ✚ støtte, ⬟ skjold, ◉ efterretning, ◇ fleks, ↺ flankevagt, ⚓ anker, ✕ fældesætter, ⇄ strejfer, ↯ anti-gadget, ▣ anti-gennembrud.
- **Droner** er en kastbar drone på to hjul, cirka 30 cm bred. Hver er sit eget spor, opkaldt efter sin ejer ("Ash · drone 2").
- **Placerede gadgets** står, hvor de blev sat, fra da af og til runden slutter, hver som figuren for det, den gør: et kamera, pigtråd, et udfoldeligt skjold, en sprængladning, en ladning til hårdt gennembrud, en lille klæbeladning, en gulvfælde, en claymore med sin snubbellaser, et envejsvindue, en panserplade, en granat, en gasbeholder, en jammer, en sensor, en laserport, en forsyningskasse. Én figur bruges til alle gadgets, der gør det samme. En gadget, hvis art dataene ikke oplyser, er en lille enhed med et lys.
- **Desarmeringsenheden** står, hvor den blev plantet, i sine 45 sekunder.

Hver drone og gadget bliver sit eget spor, når filen indlæses, så spillerens egen figur bliver ved spillerens krop. Operatørerne er forenklede former efter deres offentlige beskrivelser og kunst (det, de har på, og den enhed, der er deres evne), og gadgets er formet efter det, de gør. Alle er fremviserens egne designs i tingens virkelige størrelse (en claymore er cirka 22 cm bred, et panel på størrelse med en dør er 1 m gange 2,1 m), ikke modeller fra spillet.

## Indstillinger {#settings}

Afsnittet **Figurer** i replay-sidebaren sætter størrelsen, den mindste størrelse på skærmen, hvad fjerne enheder bliver til (figur, pil eller symbol) og de effekter, der tegnes på dem. Se [Kamp-replay](match-replay.md#figures). Røg, ild og andre tidsbestemte effekter: [Figurer i figuroverlejringen](figure-replay.md).

## En valgfri lokal figurpakke {#an-optional-local-figure-pack}

Du kan have en valgfri pakke med egne figurer på din egen maskine. Dens figurer træder i stedet for kataloget-figurer med samme navne. Pakken er aldrig en del af repositoryet eller en udgivet build. Uden en pakke ændres intet.

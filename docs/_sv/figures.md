---
title: "Figurer"
parent: "Repris"
nav_order: 3
has_children: true
lang: "sv"
source: "figures.md"
source_hash: "7040eba3b7ac"
translated: true
outdated: false
---

# Figurer

En **figur** är en liten 3D-modell av vad en enhet verkligen är: en stridsvagn, ett jetplan, ett fartyg eller en soldat. [Repriserna](match-replay.md) ritar varje enhet som sin figur i verklig storlek, i stället för som en vanlig låda.

Det finns ungefär 2 000 namngivna fordon, flygplan, fartyg, vapen och soldater. Alla är byggda av visaren själv.

![Stridsvagnar i demot, ritade som sina egna figurer](../assets/img/sv/replay-tanks.webp)

## Vad som finns i katalogen {#what-is-in-the-catalogue}

| Domän | Exempel |
|---|---|
| Personer | soldat stående, knästående, liggande; krypskytt, pansarvärn, sjukvårdare, besättning |
| Mark | stridsvagnar, stridsfordon för infanteri, luftvärn, artilleri, lastbilar och bilar, tåg och spårvagnar |
| Luft | jaktplan, attackplan, bombplan, transportplan och helikoptrar, från dubbeldäckare till moderna jetplan |
| Sjö | krigsfartyg efter klass, hangarfartyg, ubåtar, båtar och handelsfartyg |
| Vapen | robotar, raketer, bomber, torpeder, facklor och chaff |
| Markörer | rök-, blixt- och brandgranater, placerade bomber, flaggor, startpunkter och vägpunkter |
| Närstrid | soldater i skyddsvästar med automatkarbin, kulsprutepistol, hagelgevär, DMR, LMG, pistol eller sköld; drönare, kameror, taggtråd, sköldar, väggförstärkning, barrikader, sprängladdningar, fällor, fönster, granater, desarmeringsenheten |

## Så görs figurerna {#how-the-figures-are-made}

- **Byggda från publicerade mått.** De flesta figurer görs av visarens egna figurbyggare utifrån offentliga siffror: längd, bredd, höjd, bantalar, torn och kanon, vingar och stjärt. Formen justeras sedan mot offentliga fotografier, ritningar och publicerade mått. Inga spels modeller används.
- **Fria modeller.** Några figurer använder fria 3D-modeller (CC0 eller CC BY) där de är sannare, ibland kombinerade med det byggda skrovet. Upphovsmän till CC BY-verk krediteras på [Figurkrediter](figure-credits.md). CC0-verk kräver ingen kredit och listas inte där.
- Varje figur har en full, en grov och en långt bort-version (detaljnivåer, LOD), så att tusentals kan ritas samtidigt.

## Vilken figur en enhet får {#which-figure-a-unit-gets}

Visaren tittar på datans egna kolumner:

1. **Namn**: kolumner som heter *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* eller *Figure* jämförs med katalogen. Det sker exakt, via omkring 4 000 alias (spelens enhets-id för flera spel), på den längsta kända början (`F-16C_50` är F-16C), eller på det kortaste figurnamnet som börjar med det.
2. Ett namn vars figur inte passar enhetens **typ** används inte. En lastbil som heter *Typhoon* är inte jaktplanet.
3. **Typer**: kolumner som heter *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* eller *Domain* ger en klassfigur. Det kan vara Tacview-taggar (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kartikoner eller vanliga ord (tank, helikopter, infanteri).
4. Data med varken det ena eller det andra är data om personer. Alla är då soldater.

Det enklaste sättet att få rätt figurer är därför en `vehicle`-kolumn med de riktiga namnen, eller en `type`-kolumn med Tacview-taggar.

**Min enhet visas som en låda eller en soldat.** Lägg till en `vehicle`-kolumn med det riktiga namnet, eller en `type`-kolumn med en Tacview-tagg. För musen över enheten för att se vilket namn som matchades. Data som har sådana kolumner men inget om en enhet lämnar den som en låda. Data utan någon av dem ritas som soldater.

## Närstridsfigurer (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Tabeller som är skrivna som Rainbow Six Siege-reprisläsarens (kolumnerna `operator`, `pawn`, `primaryClass`, `side`) får egna figurer:

- **Spelare** är sin operatör: var och en av de 78 operatörerna har en egen figur, ungefär 1,8 m lång, i egna kläder – två eller tre färger för jacka, byxor och utrustning efter deras vanliga offentliga utseende (svart, oliv, sandfärgad, urban grå, vit, marinblå, med röd, orange eller blågrön utrustning) – och med egna former, en tredjedel större än i verkligheten där de måste synas uppifrån: huvudbonad (hjälmar, ett visir eller en tung hjälm, kepsar, mössor, baskrar, en bred boonie-hatt eller pälsmössa, huvor, halsdukar, hår), ansiktet (skyddsglasögon, en gasmask, glasögon, en mask, ett skägg, glasögon med tre linser), en lätt, medeltung eller tung kroppsbyggnad (de tunga breda, med stora axelplattor och en krage), en lång rock eller en kostym, en ghilliedräkt, det de bär på ryggen (en hammare, laddningar, drönare, behållare, en bränsletank, ett avfyrningsrör, ett armborst, paneler, en störsändare, en sköld) eller på armen (en avfyrare, en metallarm), sin egen sköld (en hög sköld, en kravallsköld, en sköld med lampor) och en accentfärg på axlarna. De håller klassen av sitt primärvapen. En operatör som visaren inte känner till är en vanlig soldat i skyddsväst i lagets färg.
- **Sidan** syns skild från kläderna: en ring på marken under varje operatör, **bärnstensgul för anfall, ljus cyan för försvar**, med lagets färg inuti, och arm- och huvudband i samma färg. En `stance`-kolumn (stående, hukande, liggande) ger dem en ställning. Utan den står de.
- **Går att skilja åt på reprisavstånd:** När de ritas 48 pixlar höga uppifrån och snett från tre fjärdedelar skiljer sig varje par operatörer på en sida åt med en tydlig färgskillnad eller en annan form (kontrollerat av visarens tester).
- **Etiketter** visar spelaren och den operatör som spelas just då, med operatörens roll som symbol: ✸ hård brytare, ⚒ mjuk brytare, ➤ inträde, ✦ fragger, ✚ stöd, ⬟ sköld, ◉ underrättelse, ◇ flex, ↺ flankvakt, ⚓ ankare, ✕ fällsättare, ⇄ strövare, ↯ anti-pryl, ▣ anti-intrång.
- **Drönare** är en kastbar drönare på två hjul, ungefär 30 cm bred. Var och en är ett eget spår, uppkallat efter sin ägare (”Ash · drone 2”).
- **Utplacerade prylar** står där de sattes, från då tills rundan slutar, var och en som figuren för det den gör: en kamera, taggtråd, en utfällbar sköld, en sprängladdning, en laddning för hårt intrång, en liten klisterladdning, en golvfälla, en claymore med sin snubbellaser, ett envägsfönster, en pansarpanel, en granat, en gasbehållare, en störsändare, en sensor, en lasergrind, en förrådslåda. En figur används för alla prylar som gör samma sak. En pryl vars sort data inte anger är en liten enhet med en lampa.
- **Desarmeringsenheten** står där den planterades under sina 45 sekunder.

Varje drönare och pryl blir ett eget spår när filen läses in, så att spelarens egen figur stannar på spelarens kropp. Operatörerna är förenklade former efter deras offentliga beskrivningar och bilder (det de har på sig, enheten som är deras förmåga), och prylarna är formade efter vad de gör. Alla är visarens egna designer i sakens verkliga storlek (en claymore är ungefär 22 cm bred, en panel stor som en dörr är 1 m gånger 2,1 m), inte modeller från spelet.

## Inställningar {#settings}

Avsnittet **Figurer** i repriserans sidofält styr storleken, den minsta storleken på skärmen och vad fjärran enheter blir (figur, pil eller symbol). Det styr också effekterna som ritas på dem. Se [Matchrepris](match-replay.md#figures). Rök, eld och andra tidsatta effekter: [Figurer i figuröverlägget](figure-replay.md).

## Ett valfritt lokalt figurpaket {#an-optional-local-figure-pack}

Du kan behålla ett valfritt paket med egna figurer på din egen dator. Dess figurer tar platsen för katalogfigurer med samma namn. Paketet är aldrig en del av förvaret eller en publicerad version. Utan ett paket ändras ingenting.

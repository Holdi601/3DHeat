---
title: "Leikgreining (CS2)"
nav_order: 10
lang: "is"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# Leikgreining (Counter-Strike 2)

Flipinn **Leikur** spilar upptöku til baka sem tölur, og fyrir Counter-Strike 2 leik sýnir hann líka stigatöfluna: hver vann hverja lotu, hvernig, og hverjir náðu fellingunum. Notaðu hann til að fara yfir leik lotu fyrir lotu, og hoppa síðan á sama augnablik í hitakortinu.

Flipinn Leikur spilar hvaða upptöku sem er sem tölur: upptöku War Thunder eða Tacview, eða CS2-demó, sem eru skráð undir **Leikir í endurspiluninni** ([Endurspilun leiks](match-replay.md)). CS2-skrá `.match.json` bætir við stigatöflunni sem lýst er á þessari síðu.

## Yfirfarðu CS2-leik {#review-a-cs2-match}

1. Breyttu demóinu ([hér að neðan](#where-the-data-comes-from)) í `.parquet`- og `.match.json`-skrár.
2. Á flipanum **Hitakort** skaltu hlaða `.parquet`-skránni undir **Uppruni**.
3. Opnaðu flipann **Leikur** og smelltu á **Hlaða leikjaskrám…**, eða slepptu `.match.json`-skránni á sýnina.
4. Smelltu á leik í **Leikjayfirliti**, og síðan á reit í loturöðinni til að opna þá lotu.
5. Smelltu á **Sýna lotu** til að sjá þá lotu í hitakortinu, eða **Endurspila lotu** til að horfa á hana sem tölur.

![Flipinn Leikur: loturöð með opinni lotu, fellingalisti og stigatafla](../assets/img/en/match-analysis-round.webp)

Orð eins og KAST, ADR, eco, force buy og trade eru í [orðasafninu](glossary.md#counter-strike-words).

## Hvaðan gögnin koma {#where-the-data-comes-from}

Demóbreytirinn í [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) breytir demóum í tvær skrár fyrir hvern leik, í möppu fyrir hvert kort:

```bash
python -m heat3d_cs2 demos <demóskrár eða möppur> -o out
```

| Skrá | Hlaðin í | Geymir |
|---|---|---|
| `<leikur>.parquet` | flipanum **Hitakort** (Uppruna-spjaldið, eins og hver Parquet-skrá - ein skrá, nokkrar, eða öll mappan) | staðsetningu hvers spilara átta sinnum á sekúndu, og hvern atburð þar sem hann átti sér stað: felling, dauða, sár, skot, kast, reyk, leiftur, HE, molotov, tálbeitu, blindun, sprengju sett, sprengju afvopnaða, sprengju sprungna; með `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, stefnu horfs, `weapon`, `place`, `opening`, `traded` … |
| `<leikur>.match.json` | flipanum **Leikur** | liðin, stig, hverja lotu (sigurvegara, hvernig, hagkerfi, sprengjuna, hverja fellingu í röð, hetjudáðir, eftirlifendur), stigatöfluröð hvers spilara |

Fóturinn á Parquet-skránni geymir leiðbeiningar um lestur (lykillinn `heat3d`), svo að hún opnast án þess að nokkuð þurfi að stilla: spilarinn sem persónan, liðshliðin sem hópurinn, hver lota (`roundId`, „<leikur> #NN“) sem seta, stefna horfs á, og heimurinn rétt snúinn (heimur CS2 er hægrihenda með Z upp; ef hann væri lesinn með sjálfgefnu Z-upp-kortlagningunni kæmi hann spegluður út). Sjá [Dálkakortlagning](column-mapping.md) og [Hleðsla skráa](loading-files.md). `python -m heat3d_cs2 map <kort>` flytur út rúmfræði kortsins í sama ramma, og hleðst í **Borð**.

Reglurnar á bak við tölurnar eru breytisins (eru settar fram í README hans og fylgja hverri samantekt): dauði telst **hefndur** þegar banamaður hans er felldur af einum liðsfélaga fórnarlambsins innan **5 s**; **KAST** er hlutfall lota með fellingu, stoðsendingu (leiftursstoðsending telst), lifun eða hefndum dauða; **skaði** er heilsa sem raunverulega tapaðist, aðeins óvina; **hetjudáð** er að vera síðasti lifandi í liði með óvini standandi, unnið þegar liðið vinnur; **innkaup** eftir liði út frá meðalverðmæti búnaðar í lok frostarins - fyrsta lota hvors venjulegs hálfleiks er skammbyssulota (engin í framlengingu), síðan undir 1.500 $ eco, undir 4.000 $ force buy, og allt annað full buy.

## Flipinn {#the-tab}

Hliðarstikan á flipanum Leikur hefur rofann fyrir hitakortsham og setuvalið efst, síðan leikjahlutana fyrir neðan, og síðan spjöldin **Síur**, **Borð** og **Myndavél** hitakortsins - sýnin er hitakortið af hvaða Parquet sem er hlaðið á flipanum Hitakort.

### Leikjayfirlit {#match-summaries}

| Stilling | Gerir |
|---|---|
| **Hlaða leikjaskrám…** | velur `.json`-skrár (nokkrar í einu): `.match.json`-samantektirnar |
| sleppa á sýnina | JSON-skrár sem sleppt er á sýnina meðan flipinn Leikur er opinn hlaðast eins (aðrar skrár eru hunsaðar) |
| **Hreinsa** | fjarlægir alla leiki |
| **Allir leikir** (með tveimur eða fleiri) | „N leikir, M lotur“: tölfræðin yfir þá alla |
| leikjalína | „LiðA 13 gegn LiðB 9“, kort · N lotur: opnar þann leik |

Skrá er samþykkt ef hún er JSON með `"format": "heat3d-cs2-match"` og fylkin `rounds`, `players` og `teams`. Villur eru skráðar undir hnöppunum: „<skrá>: ekki JSON“, „<skrá>: ekki samantekt CS2-leiks (heat3d-cs2-match)“, „<skrá>: rounds, players eða teams vantar“. Leikur sem er hlaðinn aftur (sama `match`-heiti) kemur í stað þess fyrri. Leikir eru raðaðir eftir korti, og síðan eftir heiti. Þegar nákvæmlega einn leikur er hlaðinn er hann opnaður; annars helst valið (allir leikir sjálfgefið).

Án þess að nokkuð sé hlaðið útskýrir hlutinn málið: breyttu með `python -m heat3d_cs2 demos`, hlaðið `.match.json`-skrám hér og `.parquet`-skrám á flipanum Hitakort.

### Leikur (einn leikur opinn) {#match-one-match-open}

**Hausinn:** bæði liðin með stigum sínum, kortið, hálfleikirnir - „hálfleikir 7-5, 6-6“: lotur 1-12 og 13-24 (keppnis- og atvinnuspilun MR12; lengd hálfleiks samantektarinnar sjálfrar þegar hún gefur hana upp, svo 1-15 og 16-30 fyrir MR15) - síðan, þegar leikurinn fór í framlengingu, stig hennar sér: „framlenging 4-2“, lotur eftir báða hálfleiki. Jafntefli í lotu telst fyrir hvorugt liðið. Og „N lotum skorið af í demóinu“ þegar samantektin telur upp ófullgerðar lotur.

**Loturöðin:** reitur fyrir hverja lotu, litaður eftir hliðinni sem vann, með númeri sínu og merki fyrir hvernig hún endaði. Jafntefli (enginn sigurvegari) er hlutlaus grár reitur merktur `=`, aldrei litur hliðar; ábendingin hans segir „Lota 30: jafntefli - hvorugt liðið vann hana“.

| Merki | Endað af |
|---|---|
| B | sprengjan sprakk |
| D | sprengjan afvopnuð |
| K | útrýmt |
| T | tíminn rann út |
| S | uppgjöf |
| = | jafntefli |
| ? | annað |

Skilrúm merkir upphaf seinni hálfleiks (lota 13, eða lotan á eftir lengd hálfleiks samantektarinnar) og hvers þriggja lota framlengingarhálfleiks (lotur 25, 28, 31, …). Sveimaðu yfir reit: „Lota 7: TeamA (T) - sprengjan sprakk, sett A“ („…, sett, staður óþekktur“ þegar samantektin hefur engan stað) og innkaup beggja hliða og verðmæti búnaðar. Smelltu til að opna lotuna; smelltu aftur til að loka henni („Smelltu á lotu fyrir fellingar hennar, hagkerfi og endurspilun.“).

**Lotan:**

- „Lota 7: <lið> vann - <hvernig>“ („Lota 30: jafntefli - hvorugt liðið vann hana“ fyrir jafntefli) og hve lengi lotan stóð (frostlok til útkljáðrar, m:ss);
- hagkerfið: lið hverrar hliðar, innkaup (skammbyssa, eco, force buy, full buy) og verðmæti búnaðar („$4.350“);
- sprengjan sett: staður, spilari og tími inn í lotuna (úr hvorri útgáfu samantektar sem er); „Sett af <spilari> klukkan 1:05, staður óþekktur“ þegar staðurinn er ekki þekktur;
- **fellingalistinn**, í röð: tími inn í lotuna, árásarmaður (í lit hliðarinnar; „world“ þegar enginn árásarmaður er), vopn, og merki - **HS** skot í höfuð, **WB** í gegnum vegg, **SM** í gegnum reyk; **open** fyrsta fellingin í lotunni, **trade** (hefndi liðsfélaga innan 5 s), **traded** (banamaðurinn var felldur innan 5 s), **team** liðsdráp (sjálfsvíg telst ekki). Fellingar eftir að lotan var útkljáð eru dofnaðar;
- hetjudáðirnar: „<spilari> (T) einn gegn 3: vann hetjudáðina“ / „tapaði henni“;
- hver var á lífi í lok lotu, eftir hliðum („enginn“);
- **Sýna lotu**: allt í þessari lotu, í hitakortinu;
- **Endurspila lotu**: spilar lotuna til baka sem kassa, frá upphafi hennar (hér að neðan).

Hnapparnir **Sýna á hitakortinu** (sjá [hér að neðan](#show-in-the-heatmap)) fyrir þennan leik, eða fyrir opnu lotuna.

### Stigatafla {#scoreboard}

Tafla fyrir hvert lið, ein röð fyrir hvern spilara:

| Dálkur | Er |
|---|---|
| K, D | fellingar, dauðsföll |
| A | stoðsendingar, þar með taldar leiftursstoðsendingar |
| ± | fellingar mínus dauðsföll (grænt yfir 0, rautt undir) |
| ADR | skaði á lotu, heilsa sem raunverulega tapaðist |
| KAST | % lota með fellingu, stoðsendingu, lifun eða hefndum dauða |
| HS | % fellinga í höfuð |
| Open | upphafseinvígi unnin-töpuð |
| Cl | hetjudáðir unnar/leiknar |

Sveimaðu yfir spilara: hefndarfellingar, skipti sem hefnt var, leiftursstoðsendingar, óvinir sem blindaðir voru, skaði með hjálpartækjum og lotur með mörgum fellingum („2×3k“). **Smelltu á spilara** til að sjá fellingar hans og dauðsföll í hitakortinu (þessum leik).

### Yfir leiki (Allir leikir) {#across-matches-all-matches}

Yfir alla leiki sem eru hlaðnir:

- „N leikir · M lotur · <kort>“, og „N lotur jafntefli, unnar af hvorugu liðinu“ þegar jafntefli voru;
- **Unnar lotur** eftir liðum: í heild, í **skammbyssu**lotum (skammbyssulotur samantektarinnar), og í **eco**-, **force**- og **full**-innkaupum (hvert sem hlutfall með leiknum lotum; sveimaðu fyrir „unnar af leiknum“). Jafntefli í lotu er leikið af báðum liðum og unnið af hvorugu;
- **Sprengja**: sett eftir stað, og hve oft T-liðið vann þær lotur á eftir („12 settar á A (T vann 67%)“), sett þar sem samantektin þekkir ekki staðinn sjálfstætt („2 settar á óþekktum stað (T vann 50%)“), eða „aldrei sett“; hvernig lotur enduðu, algengast fyrst;
- „Liðið sem tók upphafsfellinguna vann N% þessara lota.“ (sjálfsvíg er ekki upphafsfelling; jafntefli í lotu breytir engri opnun);
- **Upphafseinvígi, hvar**: tíu staðirnir með flestar upphafsfellingar (eftir því hvar fórnarlambið var; staðaheiti leiksins gerð læsileg, „TopofMid“ → „Top of Mid“), einvígin og hlutdeildin sem T-liðið vann;
- **Spilarar**: fimmtán bestu eftir fellingum mínus dauðsföllum, samanlagt yfir alla leiki þeirra (paraðir eftir Steam-auðkenni): leikir, K-D, ADR og KAST vegið eftir leiknum lotum, HS% vegið eftir fellingum, upphafseinvígi. **Smelltu á spilara** til að sjá fellingar hans og dauðsföll yfir alla leiki í hitakortinu.

Hnapparnir Sýna-á-hitakortinu fyrir alla hlaðna leiki eru undir þessu.

## Sýna á hitakortinu {#show-in-the-heatmap}

Sérhver tengill setur eignar **síur** hitakortsins, svo að það sem er sýnt sé áfram sýnilegt og breytanlegt í spjaldinu Síur, og **Sýna alla** hreinsar þær. Þær vinna á hitakortstöflunni sem er hlaðin á flipanum Hitakort; flipinn Leikur hleður henni aldrei sjálfur.

| Hnappur | Atburðir sem sýndir eru |
|---|---|
| **Staðsetningar** | `position` - hvar spilarar voru, átta sinnum á sekúndu |
| **Fellingar** | `kill` - hvar banamaðurinn stóð |
| **Dauðsföll** | `death` - hvar fórnarlambið féll |
| **Opnanir** | `kill` og `death` með `opening` = 1 - fyrsta felling hverrar lotu, þar sem báðir stóðu (aðeins boðið þegar taflan hefur dálkinn `opening`) |
| **Reyksprengjur** | `smoke` - hvar reykur lenti |
| **Leiftursprengjur** | `flash` - hvar leiftur sprakk |
| **Molotovar** | `molotov` - hvar molotovar og íkveikjusprengjur brunnu |
| **HE** | `he` - hvar HE-sprengjur sprungu |
| **Sprengja sett** | `plant` - hvar sprengjan var sett |
| **Skot** | `shot` - hvar skotum var hleypt af |

Afmarkað eftir því hvar hnapparnir eru: allir hlaðnir leikir, þessi leikur, eða þessi lota („Sýna á hitakortinu - lota 7“).

Það sem ekki er hægt að beita er sagt undir hnöppunum, en ekki síað í ekkert í hljóði: „enginn leikjadálkur geymdur - leikur ekki beitt“, „leikur: X ekki í hlöðnum gögnum“, það sama fyrir lotu og atburði, „leikmaður X ekki í hlöðnum gögnum“, „hlið X ekki í hlöðnum gögnum“, „engin hitakortsgögn hlaðin: hlaðið .parquet-skrám leikjanna á flipanum Hitakort“. Án hlaðinna gagna segja tenglarnir líka „Hlaðið .parquet-skrám leikjanna á flipanum Hitakort til að sjá þær á kortinu.“

**Endurspila lotu** skiptir auk þess hitakortinu yfir í **Kassaendurspilun**, tímalínunni í *spila*-ham með glugganum stilltum á *líftíma*, leitar að byrjun setu lotunnar og spilar. Þegar lotan er ekki seta í hlöðnu gögnunum: „þessi lota er ekki seta í hlöðnu gögnunum: ekkert til að endurspila“.

## Fyrir forritara {#for-developers}

Kóði: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Útgáfur samantekta {#summary-versions}

Flipinn les samantektir af útgáfu 1 og útgáfu 2 (`"version"` í skránni) hlið við hlið, og meðhöndlar þær eins:

| | Útgáfa 2 | Útgáfa 1 |
|---|---|---|
| tími sprengju sett | sekúndur inn í lotuna, eins og fellingarnar; flipinn dregur ekkert frá | sekúndur leiksins; flipinn dregur upphaf lotunnar frá |
| staður sprengju sett | `A` eða `B`; tómt þegar demóið segir það ekki | `A`, `B` eða eininganúmer - lesið sem óþekktur staður |
| lengd hálfleiks | `halfLength`, frá þeim stað þar sem liðin skiptast fyrst; 12 þegar það er null | 12 (MR12) |
| skammbyssulotur | `pistolRounds` (lota 1 og fyrsta lotan eftir hálfleikinn) | lotur þar sem innkaupin eru `pistol` |
| jafntefli í lotu | `winner` og `winnerTeam` tóm | - |
| sjálfsvíg | `suicide` á fellingunni, aldrei liðsdráp | gefið til kynna með því að árásarmaður og fórnarlamb eru sami spilarinn |

`noscope` og `attackerBlind` fellinga (útgáfa 2) eru ekki sýnd á flipanum Leikur, sem sýnir heldur engan stað úr hitakortstöflunni, svo að tómur `place`-reitur í sprengjulínu breytir engu hér.

Hvernig fókus verður að síum (`focusFilters`):

- **leikur** → flokkasía á dálkinn `match`;
- **lota** → sviðssía `round` = N á tölu-dálkinum `round` (flokkasía á flokkadálki), og seta lotunnar (`<leikur> #NN`) er valin í setuvalinu;
- **atburðir** → flokkasía á dálkinn `event`;
- **leikmaður** → persónusía á þann spilara;
- **hlið** → hópsía.

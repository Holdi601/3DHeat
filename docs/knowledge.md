---
title: The knowledge lens
---

# The knowledge lens

The Insights panel judges its findings the way a professional analyst would: through military doctrine and operations research, historical engagements, and the game design, level design and analytics literature. It does this offline, from a curated knowledge base in the viewer, and hands the same material to an external model when one writes the debrief.

## What the panel shows

- **Lens** picks the body of literature the findings are read through: *Auto* (chosen by the kinds of units in the data: aircraft, ships, ground vehicles, infantry), *Military doctrine*, *Air combat*, *Naval*, *Urban*, *Game design and balance*, *Esports*. Entries outside the picked lens are left out.
- Each opened finding shows its closest **doctrine and literature** entry and its closest **historical parallel**, with the full references folded underneath.
- **Lens metrics** lists the measures of operations analysis computed over the same rows (below), each with what it means and its literature.
- The **Debrief** adds lines for the leading findings and the lens metrics: "Doctrine and literature: ..." and "Historical parallel: ...", each with author-year citations and the references folded under it.
- **Write with AI** sends the most relevant entries (summary, lesson, the findings they relate to, full references) with the report, and asks the model to cite them by id - `{concept.lanchester-square}` - and to use no other sources.

The labels are translated; the knowledge itself is English.

## Lens metrics

Computed in the insight worker, in the same pass over the rows as the detectors (`src/insights/lensMetrics.ts`). Each is left out when the data cannot carry it.

| Metric | What it measures | Needs |
|---|---|---|
| Lanchester fit | Each side's losses per 20 s regressed on both sides' alive strengths (Poisson, quasi-likelihood errors); the exponents on enemy and own strength, tested against the square law (aimed fire) and the linear law (area fire) | time, teams, kills and deaths |
| Exchange ratio | Kills per death by side and by place; the share of deaths on the deadliest ground holding 5% of the time spent, against the share chance alone gives with that many deaths; Gini of deaths against time; Moran's I of death rates | kills and deaths |
| Local force ratio | Friendly and enemy units alive within engagement range of each kill (range set from the data: twice the median distance to the nearest enemy); the share of kills by the locally superior side, and its excess over what numbers alone predict | time, teams, persons |
| Fields of fire | Viewsheds of the busiest kill places on a 2.5D obstruction surface (level geometry up to wall height, or the ground walked) against the average place, and the rank correlation of view and kill share | positions; a loaded level makes it sharper; not for air |
| Energy state | Specific energy (height plus the height speed could buy) of air killers and air victims, compared by the Mann-Whitney statistic | aircraft classes, time, altitude |
| Key terrain | How often each place is among a match's three busiest kill places | several matches |
| Trades | Deaths answered by a teammate's kill within the engagement range and 5 s | time, teams |
| First strike | Engagements (kills split by 20 s of quiet) won by the side that scored first | time, teams |

## How findings meet the literature

Entries and findings meet through a **pattern taxonomy** (`src/insights/knowledge/patterns.ts`): concentration, local superiority, aimed and area fire, chokepoints, kill zones, fields of fire, reverse slope, flanking, mutual support, energy advantage, spawn pressure, balance and so on. Each detector kind and each lens metric says which patterns its numbers show (`src/insights/lens.ts`); each knowledge entry says which patterns it speaks to, with a weight. The relevance of an entry to a finding is the weighted overlap, scaled by how well the entry's domain (land, air, sea, urban) fits the data and by the finding's own strength. The rationale shown is the finding's numbers in a sentence followed by the entry's lesson.

## Adding entries

1. Pick the file by type: `concepts.ts`, `methods.ts`, `cases.ts`, `design.ts` (design principles and studies) in `src/insights/knowledge/`.
2. Give it a new id `<type>.<slug>` (never reuse one), its lenses, domains, and the patterns it speaks to with weights 0..1. Add a pattern to `patterns.ts` only when a finding can show it, and map it from a finding or metric in `lens.ts`.
3. Write the summary and the lesson **in your own words**. Quotes only from public-domain works (`pd: true` in the reference), and short.
4. Cite: add any new work to `refs.ts` with authors, year, title and publisher (journal with volume and pages); a URL or DOI where there is a public record.
5. Run `npx vitest run src/insights/lens.test.ts` (unique ids, known patterns, resolving references, public-domain quotes, cases with date and outcome) and `node tools/knowledge-doc.mjs` to refresh the catalogue below.

## Catalogue

<!-- kb:begin -->

The knowledge base holds 145 entries (44 concepts, 14 methods, 58 historical cases, 16 design principles, 13 studies) over 46 patterns, citing 164 references.

### Patterns (46)

| id | family | what it looks like in the data |
|---|---|---|
| `concentration` | force | The side that brings more units to one place wins that place by more than its numbers alone. |
| `local-superiority` | force | Kills go to whichever side outnumbers the other within engagement range, whatever the totals. |
| `attrition` | force | Losses follow the strengths of both sides over time; the fight is decided by who runs out first. |
| `exchange-ratio` | force | Kills per loss differ strongly by place, side or class. |
| `aimed-fire` | force | Losses grow with the enemy's numbers but not with one's own. |
| `area-fire` | force | Losses grow with the product of both sides' numbers: crowding is punished. |
| `defeat-in-detail` | force | A side is destroyed piecemeal as its parts arrive one at a time. |
| `mutual-support` | force | A loss is quickly answered by a nearby teammate: trades. |
| `combined-arms` | force | Classes do well together where each covers the other's weakness, and badly alone. |
| `class-counter` | force | One class wins disproportionately against a particular other class or in a particular place. |
| `initiative` | force | Whoever scores first in an engagement tends to win it. |
| `key-terrain` | terrain | The same few places decide fights in match after match. |
| `fields-of-fire` | terrain | Places that see far over the ground others must cross score more kills. |
| `high-ground` | terrain | Kills are made from above the ground the victims stand on. |
| `cover` | terrain | Deaths per time fall where geometry blocks sight and fire. |
| `open-ground` | terrain | Deaths per time rise where nothing blocks sight and fire. |
| `kill-zone` | terrain | Deaths concentrate where movement is forced through observed, fire-covered ground. |
| `chokepoint` | terrain | Many crossings squeezed through little ground, with losses there. |
| `reverse-slope` | terrain | Safety just behind a crest or wall, out of direct sight of the enemy. |
| `safe-ground` | terrain | A place where time is spent but few die. |
| `obstacle` | terrain | Routes bend round blocked ground into a few lanes. |
| `flank` | movement | A rarely used route leads to more kills than the main ones. |
| `avenue-of-approach` | movement | Movement flows along a few lanes between areas. |
| `mobility` | movement | Moving units die less (or more) per time than slow or static ones. |
| `static-exposure` | movement | Units standing still die more per time than moving ones. |
| `interior-lines` | movement | A side with short routes between its fights shifts strength faster than the other. |
| `envelopment` | movement | Kills come from several directions onto one side's position. |
| `ambush` | movement | Units moving along a route die quickly to enemies already in position. |
| `spawn-pressure` | time | Lives end soon after they start at one spawn. |
| `tempo` | time | The quicker side gets to the fight and scores before the other reacts. |
| `surprise` | time | Losses come in a burst before the victims fire back. |
| `energy-advantage` | air | Killers carry more height and speed than their victims. |
| `air-superiority` | air | One side's aircraft kill many times what they lose. |
| `sead` | air | Ground air defences take many aircraft until they are found and destroyed. |
| `bvr` | air | Kills happen at long range, before the victim can close. |
| `fleet-salvo` | sea | A force that lands its blow first loses little; the other little survives to answer. |
| `scouting` | sea | The side that finds the other first chooses the fight. |
| `urban-close` | urban | Short engagement ranges, many deaths among dense geometry, slow clearance. |
| `vertical` | urban | Kills from upper floors or rooftops onto streets. |
| `skill-dispersion` | people | A few players account for a large share of kills or deaths. |
| `ai-vs-player` | people | AI-controlled units fare differently from players in the same place. |
| `balance` | design | Sides, spawns or classes start with uneven chances. |
| `economy` | design | Resources earned, paid and lost concentrate in a few places or players. |
| `flow` | design | How players move through the level: loops, lanes, dead ends. |
| `sightlines` | design | Long lines of sight decide where fights start and who wins them. |
| `readability` | design | Deaths players cannot see coming: from behind, from out of sight. |

### Concepts (44)

| id | title | lenses | patterns | sources |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchester's square law (aimed fire) | military, air, naval, esports | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lanchester's linear law (area fire, one-on-one) | military, urban, esports | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Concentration of force (mass) | military, air, naval, esports | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Force ratios and the 3:1 rule | military | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Loss-exchange ratio | military, air, esports, design | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; USAF Tactical Fighter Weapons Center 1974; Dupuy 1979 |
| `concept.combat-power` | Combat power and its multipliers | military | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | The modern system of force employment | military | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | The OODA loop (observe-orient-decide-act) | military, air, esports | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Energy-maneuverability theory | air | energy-advantage, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Basic fighter maneuvers and air combat maneuvering | air | energy-advantage, initiative, surprise | Shaw 1985; USAF Tactical Fighter Weapons Center 1974 |
| `concept.terrain-ocoka` | Terrain analysis: OAKOC / KOCOA | military, design, urban | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: mission variables | military | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Key and decisive terrain | military, design, esports | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Observation and fields of fire | military, design, esports, urban | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Cover and concealment | military, urban, design | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Avenues of approach and mobility corridors | military, design | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Chokepoints and defiles | military, design, esports | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Engagement areas and kill zones | military, urban, design | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Reverse slope defence and defilade | military, design | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | The high ground | military, design | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Interior and exterior lines | military | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Defeat in detail | military, esports | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Mutual support | military, air, esports | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Combined arms | military, design | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Suppression | military, urban | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Suppression and destruction of enemy air defences (SEAD/DEAD) | air, military | sead, air-superiority, combined-arms | JP 3-01 2017; AFDP 3-01 2019; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Combat air patrol and air superiority | air | air-superiority, exchange-ratio, key-terrain | AFDP 3-01 2019; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Beyond-visual-range engagement | air | bvr, initiative, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | The indirect approach | military, esports, design | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Envelopment and encirclement | military | envelopment, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Ambush | military, esports, design | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Defence in depth | military | attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Friction and the fog of war | military, esports | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Culminating point of the attack | military | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Surprise | military, air, naval, esports | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Economy of force | military, esports | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Urban terrain | urban, military, esports | urban-close, vertical, cover, kill-zone | FM 3-06 2022; FM 90-10 1979 |
| `concept.sea-control` | Sea control and the decisive fleet battle | naval | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Hughes' salvo model: attack effectively first | naval, air | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Search and detection theory | naval, air, military | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Operations research: measures of effectiveness | military, air, naval, design | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Wargaming as analysis | military, design | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Manoeuvre warfare | military, esports | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Cohesion and the moral factor | military | mutual-support, defeat-in-detail | Ardant du Picq 1921 |

### Methods (14)

| id | title | patterns | sources |
|---|---|---|---|
| `method.lanchester-fit` | Fitting Lanchester exponents to engagement data | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Exchange ratio by side and by place | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Local force ratio at the moment of each kill | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Viewshed: line-of-sight fields of fire | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Specific energy at kills and deaths (air) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Hotspot persistence across matches | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Trade rate (mutual support) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Engagements and first-kill advantage | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Spatial autocorrelation of deaths (Moran's I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Rates against the map's own baseline with FDR control | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Intelligence preparation of the battlefield (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Paired-comparison rating models (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Win probability and action valuation | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Space control and pitch control | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |

### Historical cases (58)

| id | case | when | scale | patterns | sources |
|---|---|---|---|---|---|
| `case.thermopylae` | Thermopylae | 480 BC | battle | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamis | 480 BC | battle | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Marathon | 490 BC | battle | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuctra | 371 BC | battle | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 BC | battle | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Lake Trasimene | 217 BC | battle | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Cannae | 216 BC | battle | envelopment, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Teutoburg Forest | AD 9 | battle | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | battle | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Stirling Bridge | 1297 | battle | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Agincourt | 1415 | battle | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | battle | concentration, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | battle | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | battle | concentration, local-superiority, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | battle | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Marye's Heights | 1862 | engagement | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | engagement | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Pickett's Charge | 1863 | engagement | open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | battle | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | engagement | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | campaign | interior-lines, defeat-in-detail, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | The Somme, first day | 1 July 1916 | battle | open-ground, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | campaign | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutland | 1916 | battle | scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1919 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | battle | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan and the Ardennes | May 1940 | campaign | flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Arras counterattack | 21 May 1940 | engagement | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Battle of Britain | Jul-Oct 1940 | campaign | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Battle of the Atlantic: convoy operational research | 1939-45 | campaign | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | June 1942 | battle | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Second El Alamein | Oct-Nov 1942 | battle | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserine Pass | Feb 1943 | battle | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingrad | Aug 1942-Feb 1943 | campaign | urban-close, attrition, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | July 1943 | campaign | attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prokhorovka | 12 July 1943 | engagement | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13 June 1944 | engagement | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Normandy hedgerows | June-July 1944 | campaign | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operation Cobra | July 1944 | campaign | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Leyte Gulf | Oct 1944 | battle | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | Dec 1944 | battle | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Tsushima | May 1905 | battle | concentration, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inchon | Sept 1950 | campaign | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG Alley | 1950-53 | campaign | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | battle | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | Nov 1965 | engagement | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operation Bolo | 2 Jan 1967 | engagement | surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan: the Valley of Tears | Oct 1973 | battle | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinai: the Chinese Farm | Oct 1973 | battle | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Bekaa Valley (Operation Mole Cricket 19) | June 1982 | battle | sead, air-superiority, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Falklands air war | May-June 1982 | campaign | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Desert Storm air campaign | Jan-Feb 1991 | campaign | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26 Feb 1991 | engagement | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadishu | Oct 1993 | engagement | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozny | Dec 1994-Feb 1995 | battle | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2022 |
| `case.hue` | Hue | Jan-Mar 1968 | battle | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Kosovo air campaign | Mar-Jun 1999 | campaign | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Fallujah (Operation Al Fajr) | Nov 2004 | battle | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosul | 2016-17 | campaign | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |

### Game and level design (16)

| id | title | patterns | sources |
|---|---|---|---|
| `design.chokepoint` | Chokepoints in level design | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Flank routes and alternate paths | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Sightlines and engagement distance | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Cover placement and rhythm | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Spawn design and spawn protection | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Symmetric and asymmetric map balance | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Class balance and counters | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Flow, loops and readable layouts | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Game economies and feedback loops | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Matchmaking and skill spread | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | AI opponents as level probes | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Meaningful play and choice | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Trading and team play in shooters | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Map control | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Heatmaps and spatial telemetry in design | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Mastery, learning and fun | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |

### Studies (13)

| id | title | sources |
|---|---|---|
| `study.engel-1954` | Engel: Lanchester's square law at Iwo Jima | Engel 1954 |
| `study.bracken-1995` | Bracken: Lanchester models of the Ardennes | Bracken 1995 |
| `study.fricker-1998` | Fricker: attrition models of the Ardennes revisited | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas and Turkes: Kursk and Ardennes | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley and Helmbold: validating the square law | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | GIS analysis of player deaths | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: visualising competitive behaviour | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Valuing actions in Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Encounter detection in esports | Schubert et al. 2016 |
| `study.red-baron` | Project Red Baron: air combat over Vietnam | USAF Tactical Fighter Weapons Center 1974; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: quantified judgement of historical battles | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: force employment explains outcomes | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Survey of gameplay data visualisation | Wallner & Kriglstein 2013; Bowman et al. 2012 |

### Bibliography

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley.
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York.
- Anselin, L. (1995). Local indicators of spatial association - LISA. Geographical Analysis 27(2): 93-115.
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(public domain)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(public domain)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(public domain)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London.
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London.
- Beevor, A. (1998). Stalingrad. Viking, London.
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300.
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton.
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham.
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh.
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(public domain)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston.
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(public domain)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York.
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968.
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB.
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577.
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345.
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London.
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London.
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599.
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York.
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(public domain)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York.
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(public domain)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(public domain)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(public domain)*
- Corbett, J. S. (1919). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(public domain)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York.
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud.
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York.
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence.
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983.
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189.
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8.
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis.
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York.
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA.
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York.
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171.
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4).
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London.
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis.
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia.
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018.
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347.
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud.
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis.
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London.
- Fullerton, T. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington.
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206.
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(public domain)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence.
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence.
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394.
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012.
- Goldsworthy, A. (2001). Cannae. Cassell, London.
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London.
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(public domain)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170.
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC.
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633.
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(public domain)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(public domain)*
- Headquarters, Department of the Army (2022). FM 3-06 Urban Operations. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(public domain)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia.
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576.
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(public domain)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London.
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379.
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170.
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London.
- Hughes, W. P. (1995). A salvo model of warfare between missile-armed ships. Naval Research Logistics 42(2): 267-289.
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis.
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85.
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(public domain)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(public domain)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA.
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport.
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(public domain)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93.
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452.
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford.
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(public domain)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale.
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(public domain)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley.
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869.
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496.
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica.
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(public domain)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London.
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA.
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(public domain)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196.
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60.
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(public domain)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London.
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4).
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis.
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London.
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond.
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York.
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23.
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge.
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston.
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. MIT Press / Wiley, New York (first issued as OEG Report 54, 1946). *(public domain)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato.
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon.
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490.
- Overy, R. (2000). The Battle of Britain: The Myth and the Reality. Penguin, London.
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC.
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis.
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130.
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(public domain)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York.
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87.
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212.
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam.
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA.
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington.
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016.
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London.
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis.
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden.
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London.
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(public domain)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com.
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018.
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York.
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(public domain)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(public domain)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA.
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton.
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill.
- US Air Force (2019). AFDP 3-01 Counterair Operations. LeMay Center for Doctrine, Maxwell AFB. *(public domain)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(public domain)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(public domain)*
- USAF Tactical Fighter Weapons Center (1974). Project Red Baron III: Air-to-Air Encounters in Southeast Asia. Nellis AFB. *(public domain)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(public domain)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton.
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155.
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York.
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis.
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London.
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(public domain)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238.
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London.

<!-- kb:end -->

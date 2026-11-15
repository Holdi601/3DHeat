---
title: The knowledge lens
parent: Insights
nav_order: 1
---

# The knowledge lens

When [Insights](insights.md) finds something, this part explains it with ideas from military history, game design and sport analysis, and names the book or paper it comes from. Use it to learn *why* a pattern matters, not only that it exists.

## Try it

1. Load data and open **Insights**, then press **Find insights**.
2. Click a finding to open it.
3. Read **Doctrine and literature** and **Historical parallel**; the full references are folded underneath.
4. Change **Lens** (for example to *Military doctrine*) to read the same finding through another body of literature.

![An opened finding with its matching passage from the literature](assets/img/en/insights-finding.webp)

## How it works

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
| Mutual support (trades) | Deaths answered by a teammate's kill within the engagement range and 5 s | time, teams |
| First strike | Engagements - kills grouped by match, by 20 s of quiet and by three engagement ranges of distance - won by the side that scored first | time, teams |
| Salvo model | Hughes' salvo equation fitted to 20 s periods of ships in contact: ships put out of action per attacking ship, and saved per defending ship; a Lanchester fit on ships alone | ship classes, time, teams |
| Combat effectiveness | Kills per unit-hour in action of each side and the ratio of the two largest (a combat effectiveness value in Dupuy's sense) with its 95% interval, and each side's share of kills at even local numbers | time, teams |
| Engagement ranges | Distance to the nearest enemy at kills, at launches and at each life's first shot (detection to engagement), by kind of unit | time, teams; launches where the data has them |
| Kill chain | Seconds from the killer's last launch to the kill, and from its first shot of the fight to the kill | time; launches or fire events |
| Concentration or dispersion | In each 20 s period, the spread of the two largest sides and the share of kills taken by the tighter one | time, teams |
| Sorties | Per side: sorties (takeoffs, or aircraft spawns), landings, aircraft lost and kills by aircraft; loss rate and kills per sortie | aircraft classes; takeoffs or spawns |

Weapons, decoys and buildings are not counted as units. Where weapon rows name their launching unit (a `Shooter` or `Launcher` column, as Tacview-derived data has), the launch is credited to that unit, matched by its name or its object id.

## How findings meet the literature

Entries and findings meet through a **pattern taxonomy** (`src/insights/knowledge/patterns.ts`): concentration, local superiority, aimed and area fire, chokepoints, kill zones, fields of fire, reverse slope, flanking, mutual support, energy advantage, spawn pressure, balance and so on. Each detector kind and each lens metric says which patterns its numbers show (`src/insights/lens.ts`); each knowledge entry says which patterns it speaks to, with a weight. The relevance of an entry to a finding is the weighted overlap, scaled by how well the entry's domain (land, air, sea, urban) fits the data and by the finding's own strength. The rationale shown is the finding's numbers in a sentence followed by the entry's lesson.

## Catalogue

<!-- kb:begin -->

The knowledge base holds 478 entries (81 concepts, 20 methods, 275 historical cases, 16 design principles, 86 studies) over 64 patterns, citing 443 references.

### Patterns (64)

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
| `formation` | movement | Units of a side move together in a recognisable shape: line, column, wedge, echelon, box. |
| `frontal-assault` | movement | A group closes on the enemy straight into the face of its front. |
| `double-envelopment` | movement | Two groups strike both flanks of one enemy body at about the same time. |
| `encirclement` | movement | An enemy group ends up with the other side all round it and few ways out. |
| `penetration` | movement | A group passes through the enemy line where enemies stand on both sides of it. |
| `fire-and-maneuver` | movement | Part of a group moves while the rest stands and covers it, and the roles alternate. |
| `feint` | movement | A small group draws the enemy to one place; the main effort strikes elsewhere soon after. |
| `withdrawal` | movement | A group in contact turns away and opens the distance to the enemy. |
| `pursuit` | movement | A group follows an enemy that is moving away, keeping or closing the distance. |
| `defence-in-depth` | terrain | Defenders stand in several belts one behind the other along the enemy's axis of advance. |
| `screening` | movement | A small element moves well ahead of its main body and meets the enemy first. |
| `dispersion` | force | A side spreads out over time; fewer of its units share one place. |
| `missile-defence` | air | Aircraft under missile threat turn the threat to the side or the tail: crank, notch, drag, pump. |
| `angles-fight` | air | Close-range dogfight at low speed and high turn rate, fought for nose position rather than energy. |
| `cap` | air | Aircraft orbit a fixed station for minutes, waiting for the enemy to come. |
| `strike-package` | air | Aircraft of different roles fly together to a target; some attack the ground, others cover them. |
| `line-of-battle` | sea | Ships steam in column one behind another so that all broadsides bear. |
| `crossing-the-t` | sea | A column passes across the head of the enemy's column: all of its guns bear, few of the enemy's. |

### Concepts (81)

| id | title | lenses | patterns | sources |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchester's square law (aimed fire) | military, air, naval, esports | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lanchester's linear law (area fire, one-on-one) | military, urban, esports | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Concentration of force (mass) | military, air, naval, esports | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Force ratios and the 3:1 rule | military | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Loss-exchange ratio | military, air, esports, design | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Combat power and its multipliers | military | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | The modern system of force employment | military | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | The OODA loop (observe-orient-decide-act) | military, air, esports | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Energy-maneuverability theory | air | energy-advantage, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Basic fighter maneuvers and air combat maneuvering | air | energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
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
| `concept.centre-of-gravity` | Centre of gravity | military | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Decisive points | military, esports | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Lines of operation | military | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Strategies of annihilation and exhaustion | military | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Deep battle and deep operations | military | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | military, air | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Mission command (Auftragstaktik) | military, esports | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Breakthrough and exploitation | military | tempo, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Fire and movement | military, esports | mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Bounding overwatch | military, esports | mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Reconnaissance pull and infiltration | military, esports | flank, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | The reserve | military, esports | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Elastic defence and counterattack | military | kill-zone, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | The kill chain (find, fix, track, target, engage, assess) | military, air, naval | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Detection range versus engagement range | air, naval, military | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Combat effectiveness value | military, esports | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Dispersion on the battlefield | military, esports | area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Close air support | air, military | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Air interdiction | air, military | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Escort versus fighter sweep | air | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Energy fight versus turning fight | air | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Lead, pure and lag pursuit | air | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | The Thach weave | air | mutual-support, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | The finger-four and the fighting pair | air | mutual-support, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Fleet in being | naval | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Crossing the T | naval, military | local-superiority, fields-of-fire, concentration | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Convoy | naval | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Anti-access and area denial | naval, air, military | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Strongpoint defence in built-up areas | urban, military | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2022; FM 90-10 1979 |
| `concept.mouseholing` | Mouseholing and moving through buildings | urban, military, design | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Siege | military, urban | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2022 |
| `concept.guerrilla` | Guerrilla warfare | military, urban | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Counterinsurgency | military, urban | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Sanctuary | military, design | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Deception (maskirovka) | military, esports | surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Information advantage | military, esports | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Economy rounds and resource tempo | esports, design | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |

### Methods (20)

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
| `method.salvo-fit` | Salvo equation fitted to ships in contact | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Combat effectiveness ratio per unit-hour in action | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Detection-to-engagement and engagement ranges | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Kill-chain timing | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Dispersion against kill share (concentration of force in time) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Loss rate and kills per sortie | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |

### Historical cases (275)

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
| `case.jutland` | Jutland | 1916 | battle | scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
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
| `case.kadesh` | Kadesh | c. 1274 BC | battle | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issus | 333 BC | battle | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 BC | battle | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carrhae | 53 BC | battle | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Pharsalus | 48 BC | battle | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianople | AD 378 | battle | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Yarmouk | AD 636 | battle | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | battle | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattin | 1187 | battle | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | battle | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | battle | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | battle | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | battle | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | battle | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | battle | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | battle | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | battle | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | campaign | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | battle | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | battle | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | battle | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | battle | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | battle | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | battle | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | campaign | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | battle | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | battle | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | battle | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | battle | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | engagement | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | campaign | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | Nov 1917 | battle | surprise, combined-arms, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | Oct-Nov 1917 | campaign | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | The German spring offensive (Operation Michael) | Mar-Apr 1918 | campaign | tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | Aug 1918 | battle | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Khalkhin Gol (Nomonhan) | Aug 1939 | battle | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | The Polish campaign | Sept 1939 | campaign | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut and Gembloux | May 1940 | battle | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | May 1940 | engagement | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | The Dunkirk perimeter | May-June 1940 | campaign | obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operation Compass and Beda Fomm | Dec 1940-Feb 1941 | campaign | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operation Crusader and Sidi Rezegh | Nov-Dec 1941 | campaign | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | May-June 1942 | battle | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | Aug-Sept 1942 | battle | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | June 1941 | battle | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Kiev encirclement | Sept 1941 | campaign | envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moscow | Oct 1941-Jan 1942 | campaign | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rzhev and Operation Mars | 1942 | campaign | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Second Kharkov | May 1942 | battle | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Third Kharkov (Manstein's backhand blow) | Feb-Mar 1943 | campaign | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operation Bagration | June-Aug 1944 | campaign | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Korsun-Cherkassy pocket | Jan-Feb 1944 | battle | envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Kamenets-Podolsky pocket | Mar-Apr 1944 | campaign | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operation Epsom | June 1944 | battle | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operation Goodwood | July 1944 | battle | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operation Totalize | Aug 1944 | battle | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | Aug 1944 | battle | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Falaise pocket | Aug 1944 | campaign | envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden and Arnhem | Sept 1944 | campaign | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aachen | Oct 1944 | battle | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Hürtgen Forest | Sept 1944-Feb 1945 | campaign | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | Sept 1944 | battle | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | Dec 1944 | battle | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Elsenborn Ridge | Dec 1944 | battle | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Seelow Heights | Apr 1945 | battle | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlin | Apr-May 1945 | battle | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operation Spring Awakening | Mar 1945 | battle | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | Dec 1943 | battle | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Warsaw Uprising | Aug-Oct 1944 | campaign | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | Nov 1943 | battle | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | Sept-Nov 1944 | battle | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | Feb-Mar 1945 | battle | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | Apr-June 1945 | campaign | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | Feb-Mar 1945 | battle | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Manchuria (August Storm) | Aug 1945 | campaign | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Pusan perimeter | Aug-Sept 1950 | campaign | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Chosin Reservoir | Nov-Dec 1950 | campaign | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Imjin River | Apr 1951 | battle | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapyong | Apr 1951 | battle | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | Apr and July 1953 | engagement | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | Jan-Apr 1968 | battle | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | Nov 1967 | battle | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (Ap Bia Mountain) | May 1969 | engagement | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | June 1967 | battle | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | Oct 1973 | battle | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | June 1982 | engagement | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Siege of Beirut | June-Aug 1982 | campaign | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Lebanon 2006: Bint Jbeil and the anti-tank threat | July-Aug 2006 | campaign | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | Feb 1986 | battle | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | Jan-Feb 1987 | battle | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | Jan-Feb 1991 | battle | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Objective Norfolk | 26-27 Feb 1991 | battle | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina Ridge | 27 Feb 1991 | battle | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Wadi al-Batin feints | Feb 1991 | campaign | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasiriyah | Mar 2003 | battle | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Objective Peach | Apr 2003 | engagement | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | The Thunder Runs | Apr 2003 | battle | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Debecka Pass | Apr 2003 | engagement | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | campaign | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr City | Mar-May 2008 | battle | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operation Anaconda | Mar 2002 | battle | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | July 2008 | engagement | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | Oct 2009 | engagement | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala and the platoon houses | 2006-07 | campaign | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Battle of Algiers | 1956-57 | campaign | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Rhodesian Fireforce | 1974-79 | campaign | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Siege of Sarajevo | 1992-96 | campaign | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Grozny 1999-2000 | Dec 1999-Feb 2000 | battle | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Russo-Georgian War | Aug 2008 | campaign | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillia | July 2014 | engagement | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovaisk | Aug 2014 | battle | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debaltseve | Jan-Feb 2015 | battle | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Donetsk airport | Sept 2014-Jan 2015 | battle | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Hostomel airport | Feb 2022 | engagement | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | The Kyiv axis and the Brovary ambush | Mar 2022 | engagement | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupol and Azovstal | Feb-May 2022 | battle | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Kharkiv counteroffensive | Sept 2022 | campaign | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Siverskyi Donets crossing at Bilohorivka | May 2022 | engagement | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bakhmut | Aug 2022-May 2023 | battle | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Zaporizhzhia offensive | June-Nov 2023 | campaign | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Nagorno-Karabakh war | Sept-Nov 2020 | campaign | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | The Blitz | Sept 1940-May 1941 | campaign | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: the first day in the air | 22 June 1941 | battle | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Crete | May 1941 | battle | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | The siege of Malta | 1940-1942 | campaign | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | The Stalingrad airlift | Nov 1942-Feb 1943 | campaign | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Air battles over the Kuban | Apr-June 1943 | campaign | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursk in the air | July 1943 | battle | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operation Bagration in the air | June-Aug 1944 | campaign | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploesti (Operation Tidal Wave) | 1 Aug 1943 | engagement | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | The Dams Raid (Operation Chastise) | 16-17 May 1943 | engagement | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburg (Operation Gomorrah) | July-Aug 1943 | battle | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Regensburg | 17 Aug 1943 | battle | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Second Schweinfurt ("Black Thursday") | 14 Oct 1943 | engagement | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Big Week (Operation Argument) | Feb 1944 | campaign | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | The Nuremberg raid | 30-31 Mar 1944 | engagement | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operation Bodenplatte | 1 Jan 1945 | battle | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Battle of the Bismarck Sea | Mar 1943 | battle | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Neutralising Rabaul | 1943-1944 | campaign | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Philippine Sea ("Marianas Turkey Shoot") | June 1944 | battle | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Black Tuesday over Namsi | 23 Oct 1951 | engagement | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operation Rolling Thunder | 1965-1968 | campaign | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | The Thanh Hoa bridge | 1965-1972 | engagement | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | The Wild Weasels | 1965-1973 | campaign | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | The Ault report and Top Gun | 1968-1972 | campaign | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operation Linebacker | May-Oct 1972 | campaign | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II ("the Eleven-Day War") | Dec 1972 | campaign | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operation Focus (Moked) | 5 June 1967 | battle | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | War of Attrition: the missile belt | 1969-1970 | campaign | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | The SAM umbrella over the canal | Oct 1973 | battle | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (Operation Opera) | 7 June 1981 | engagement | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operation El Dorado Canyon | 15 Apr 1986 | engagement | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | The Iran-Iraq air war | 1980-1988 | campaign | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Black Buck raids | May-June 1982 | engagement | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: planning the Gulf air campaign | Aug 1990-Jan 1991 | campaign | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: the opening Apache strike | 17 Jan 1991 | engagement | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | The Great Scud Hunt | Jan-Feb 1991 | campaign | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Mutla Ridge ("Highway of Death") | 26-27 Feb 1991 | engagement | chokepoint, kill-zone, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operation Anaconda: Apaches in the Shahi-Kot | Mar 2002 | battle | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | The Karbala Apache attack | 24 Mar 2003 | engagement | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | The Libyan air campaign | Mar-Oct 2011 | campaign | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Nagorno-Karabakh: drones and air defences | Sept-Nov 2020 | campaign | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ukraine: the contested air | 2022 | campaign | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Hostomel airport | Feb 2022 | engagement | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | Feb-Mar 1971 | campaign | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operation Eagle Claw | Apr 1980 | engagement | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afghanistan: the Stinger | 1986-1989 | campaign | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | battle | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | The Spanish Armada | 1588 | campaign | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Quiberon Bay | 1759 | battle | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | The Chesapeake (Virginia Capes) | 1781 | battle | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | The Nile (Aboukir Bay) | 1798 | battle | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Copenhagen | 1801 | battle | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | Mar 1862 | engagement | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | battle | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | The Yalu | 1894 | battle | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Manila Bay | 1898 | battle | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Heligoland Bight | Aug 1914 | battle | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel and the Falklands | Nov-Dec 1914 | campaign | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | Jan 1915 | battle | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | The River Plate | Dec 1939 | battle | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | Nov 1940 | engagement | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Cape Matapan | Mar 1941 | battle | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Denmark Strait and the sinking of the Bismarck | May 1941 | campaign | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7 Dec 1941 | engagement | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales and Repulse | 10 Dec 1941 | engagement | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | The Java Sea | Feb 1942 | battle | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | The Coral Sea | May 1942 | battle | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Savo Island | Aug 1942 | battle | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | The Eastern Solomons | Aug 1942 | battle | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Cape Esperance | Oct 1942 | battle | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Santa Cruz Islands | Oct 1942 | battle | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Naval Battle of Guadalcanal | 12-15 Nov 1942 | battle | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | Nov 1942 | engagement | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | The Channel Dash | Feb 1942 | engagement | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operation Pedestal | Aug 1942 | battle | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Black May | May 1943 | campaign | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | North Cape | Dec 1943 | battle | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | The US submarine campaign against Japan | 1941-1945 | campaign | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Off Samar | 25 Oct 1944 | battle | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Surigao Strait | 25 Oct 1944 | battle | chokepoint, kill-zone, concentration, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: the kamikaze campaign | Apr-June 1945 | campaign | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | The sinking of the Eilat | Oct 1967 | engagement | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | Oct 1973 | battle | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | The sinking of the General Belgrano | 2 May 1982 | engagement | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | The loss of HMS Sheffield | 4 May 1982 | engagement | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17 May 1987 | engagement | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operation Praying Mantis | 18 Apr 1988 | battle | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | Aug 2004 | engagement | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | The Bisu revolution | Mar 2007 | battle | balance, class-counter, mobility | Team Liquid (Hot_Bid) 2007; Taylor 2012 |
| `case.dream-coil-ti3` | The Dream Coil at The International 2013 | Aug 2013 | engagement | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Faker's Zed against Ryu | Sep 2013 | engagement | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | The Overpass boost | Nov 2014 | engagement | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | The jumping AWP on Mirage | Apr 2016 | engagement | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis and the utility era | 2018 | campaign | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five against OG | Apr 2019 | battle | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar reaches grandmaster | 2019 | campaign | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |

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

### Studies (86)

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
| `study.red-baron` | Project Red Baron: air combat over Vietnam | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: quantified judgement of historical battles | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: force employment explains outcomes | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Survey of gameplay data visualisation | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester against three centuries of land battles | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: sixty Second World War engagements | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: combat models and the US Civil War | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: a statistical model of attrition data | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: rates of advance in land combat | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas and Dinges: circumstances matter more than the law | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | The Kursk Data Base | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | The Ardennes campaign database | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson and MacKay: the Battle of Britain as Lanchester data | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte and Schmidt: numbers still win battles | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: regularities of battle casualties | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuy's Tactical Numerical Deterministic Model | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: war by numbers | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: fighting power | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter and Stam: democracies at war | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: the adaptive dynamic model | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester and guerrilla warfare | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: the stochastic salvo model | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: the cornerstones of fleet tactics | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | The 3:1 rule debate | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: modelling armed conflicts | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | The Ault Report: missiles fired outside their envelope | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Blackett's circus | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Depth-charge settings in Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | White undersides for anti-submarine aircraft | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: armour where the returning bombers were not hit | Mangel & Samaniego 1984 |
| `study.optimal-search` | Optimal search: from submarines to AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: combat in hell | Glenn 1996; FM 3-06 2022 |
| `study.a2ad-2003` | Anti-access and area denial | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | How players lose interest | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Clustering player behaviour in the wild | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Detecting player frustration | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: telemetry dashboards in production | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: visual analytics of gameplay | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Avatar movement in World of Warcraft battlegrounds | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: instrumenting user tests at scale | Kim et al. 2008 |
| `study.game-data-science` | Game data science | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Artificial intelligence and games | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Skill and team movement in Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Combat patterns that predict MOBA wins | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Player roles in Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Predicting Dota 2 outcomes from drafts | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Live win prediction in professional esports | Hodge et al. 2021 |
| `study.rioult-2014` | Topology of player positions | Rioult et al. 2014 |
| `study.bednarek-2017` | Evaluating players in team shooters | Bednárek et al. 2017 |
| `study.katona-2019` | Predicting who dies next | Katona et al. 2019 |
| `study.block-2018` | Data-driven stories for esports audiences | Block et al. 2018 |
| `study.ggviz` | ggViz: searching game states at scale | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: large-scale reinforcement learning in Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: grandmaster level in StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Expected possession value in basketball | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: valuing on-ball actions in football | Decroos et al. 2019 |
| `study.pitch-control` | Pitch control and space creation | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | The spatial structure of defensive skill | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Team roles from tracking data | Lucey et al. 2013 |
| `study.shot-quality` | Expected goals and shot quality | Lucey et al. 2015; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: spatial shooting efficiency | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Spatio-temporal analysis of team sports | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripley's K: clustering at every scale | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark and Evans: nearest-neighbour dispersion | Clark & Evans 1954 |
| `study.getis-ord` | Getis-Ord hotspots | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Local indicators of spatial association | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | The spatial scan statistic | Kulldorff 1997 |
| `study.kde` | Kernel density estimation | Silverman 1986 |
| `study.knox-1964` | Space-time interaction | Knox 1964; Diggle 2013 |
| `study.maup` | The modifiable areal unit problem | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Isovists and visibility graphs | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Space syntax | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Mean crowding | Lloyd 1967 |
| `study.survival-analysis` | Survival analysis for time to death | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Generalised linear models for counts | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap and interval estimates | Efron 1979; Wilson 1927 |

### Bibliography

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley.
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723.
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York.
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(public domain)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(public domain)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca.
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115.
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(public domain)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station.
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(public domain)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(public domain)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(public domain)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(public domain)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston.
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(public domain)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton.
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill.
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York.
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London.
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London.
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(public domain)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer.
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London.
- Beevor, A. (1998). Stalingrad. Viking, London.
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London.
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65.
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300.
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton.
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham.
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh.
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia.
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York.
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41.
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(public domain)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston.
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(public domain)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York.
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968.
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB.
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577.
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345.
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022).
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York.
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London.
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk.
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(public domain)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London.
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London.
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68.
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599.
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York.
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London.
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(public domain)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London.
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence.
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453.
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(public domain)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York.
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York.
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(public domain)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(public domain)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(public domain)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(public domain)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London.
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London.
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford.
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto.
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(public domain)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(public domain)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(public domain)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(public domain)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(public domain)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder.
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220.
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago.
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago.
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York.
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud.
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York.
- D'Este, C. (1983). Decision in Normandy. Collins, London.
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London.
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(public domain)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln.
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47.
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton.
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence.
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden.
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983.
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189.
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8.
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170.
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(public domain)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York.
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis.
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York.
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA.
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(public domain)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26.
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125.
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA.
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York.
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London.
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC.
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4).
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York.
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London.
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis.
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA.
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia.
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London.
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018.
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347.
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(public domain)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud.
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington.
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington.
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York.
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121.
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis.
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London.
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington.
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(public domain)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York.
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York.
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(public domain)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206.
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(public domain)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(public domain)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London.
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London.
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London.
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton.
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence.
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud.
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence.
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence.
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394.
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012.
- Goldsworthy, A. (2001). Cannae. Cassell, London.
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London.
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(public domain)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(public domain)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York.
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London.
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York.
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge.
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170.
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud.
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC.
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC.
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence.
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607.
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633.
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London.
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London.
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence.
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(public domain)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(public domain)*
- Headquarters, Department of the Army (2022). FM 3-06 Urban Operations. US Army, Washington DC. *(public domain)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(public domain)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London.
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia.
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669.
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576.
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(public domain)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(public domain)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London.
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York.
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge.
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(public domain)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379.
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London.
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170.
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London.
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London.
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York.
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York.
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(public domain)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London.
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289.
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis.
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis.
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85.
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(public domain)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica.
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(public domain)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(public domain)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(public domain)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(public domain)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(public domain)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA.
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport.
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481.
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8.
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(public domain)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93.
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London.
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London.
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York.
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452.
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London.
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford.
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30.
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(public domain)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale.
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(public domain)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley.
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC.
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869.
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(public domain)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496.
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263.
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica.
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(public domain)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London.
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO.
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE.
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(public domain)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London.
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(public domain)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30.
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30.
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713.
- Lucey, P.; Bialkowski, A.; Monfort, M.; Carr, P.; Matthews, I. (2015). "Quality vs quantity": improved shot prediction in soccer using strategic features from spatiotemporal data. MIT Sloan Sports Analytics Conference 2015.
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis.
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis.
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(public domain)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA.
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(public domain)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York.
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(public domain)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(public domain)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(public domain)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196.
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267.
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60.
- Manstein, E. von (1958). Lost Victories. Methuen, London.
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York.
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York.
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London.
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(public domain)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(public domain)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston.
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York.
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152.
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London.
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC.
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374.
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York.
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis.
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco.
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London.
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London.
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London.
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London.
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London.
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243.
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond.
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(public domain)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York.
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23.
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge.
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston.
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston.
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston.
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston.
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston.
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston.
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston.
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(public domain)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica.
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(public domain)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge.
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT.
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York.
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384.
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato.
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato.
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York.
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra.
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica.
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich.
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306.
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York.
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon.
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490.
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'.
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London.
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge.
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London.
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca.
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC.
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis.
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130.
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London.
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London.
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(public domain)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln.
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550.
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(public domain)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London.
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston.
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York.
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford.
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(public domain)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York.
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York.
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585.
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton.
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis.
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87.
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212.
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London.
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York.
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(public domain)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam.
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica.
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London.
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London.
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London.
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York.
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA.
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London.
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(public domain)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington.
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016.
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven.
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston.
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London.
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford.
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37.
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC.
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis.
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden.
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London.
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(public domain)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(public domain)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London.
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com.
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge.
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(public domain)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018.
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(public domain)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York.
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York.
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London.
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(public domain)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London.
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(public domain)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996).
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York.
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA.
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA.
- Team Liquid (Hot_Bid) (2007). Revolutionary Magic. TeamLiquid.net feature. https://tl.net/forum/featured/56672-revolutionary-magic
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(public domain)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon.
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240.
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton.
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York.
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud.
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford.
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill.
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington.
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford.
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121.
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/
- US Air Force (2019). AFDP 3-01 Counterair Operations. LeMay Center for Doctrine, Maxwell AFB. *(public domain)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(public domain)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(public domain)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(public domain)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport.
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(public domain)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(public domain)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York.
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London.
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton.
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155.
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356.
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(public domain)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD.
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York.
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022).
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London.
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London.
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London.
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge.
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(public domain)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis.
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(public domain)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(public domain)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD.
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212.
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(public domain)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis.
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London.
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(public domain)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238.
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis.
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014).
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham.
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London.
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato.
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London.
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York.
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London.
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York.
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto.

<!-- kb:end -->

## For developers

### Adding entries

1. Pick the file by type: `concepts.ts` and `concepts-more.ts`, `methods.ts`, `cases.ts`, `cases-land.ts`, `cases-air-sea.ts`, `cases-esports.ts`, `design.ts` (design principles) or `studies.ts` in `src/insights/knowledge/`.
2. Give it a new id `<type>.<slug>` (never reuse one), its lenses, domains, and the patterns it speaks to with weights 0..1. Add a pattern to `patterns.ts` only when a finding can show it, and map it from a finding or metric in `lens.ts`.
3. Write the summary and the lesson **in your own words**. Quotes only from public-domain works (`pd: true` in the reference), and short.
4. Cite: add any new work to `refs.ts` with authors, year, title and publisher (journal with volume and pages); a URL or DOI where there is a public record.
5. Run `npx vitest run src/insights/lens.test.ts` (unique ids, known patterns, resolving references, public-domain quotes, cases with date and outcome) and `node tools/knowledge-doc.mjs` to refresh the catalogue above.

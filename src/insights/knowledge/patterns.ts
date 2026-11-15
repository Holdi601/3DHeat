/**
 * The pattern taxonomy: the measurable shapes a finding can take, grouped by
 * family. Findings and lens metrics are mapped onto these (`../lens.ts`);
 * knowledge entries say which they speak to. Add a pattern only when a
 * finding can show it - an entry that needs a new idea usually fits an
 * existing pattern.
 */

export type PatternFamily = 'force' | 'terrain' | 'movement' | 'time' | 'air' | 'sea' | 'urban' | 'people' | 'design';

export interface Pattern {
  id: string;
  family: PatternFamily;
  label: string;
  /** What it looks like in the data, in a sentence. */
  sign: string;
}

export const PATTERNS: Pattern[] = [
  // Force and attrition
  { id: 'concentration', family: 'force', label: 'Concentration of force', sign: 'The side that brings more units to one place wins that place by more than its numbers alone.' },
  { id: 'local-superiority', family: 'force', label: 'Local superiority', sign: 'Kills go to whichever side outnumbers the other within engagement range, whatever the totals.' },
  { id: 'attrition', family: 'force', label: 'Attrition', sign: 'Losses follow the strengths of both sides over time; the fight is decided by who runs out first.' },
  { id: 'exchange-ratio', family: 'force', label: 'Exchange ratio', sign: 'Kills per loss differ strongly by place, side or class.' },
  { id: 'aimed-fire', family: 'force', label: 'Aimed fire (square law)', sign: 'Losses grow with the enemy\'s numbers but not with one\'s own.' },
  { id: 'area-fire', family: 'force', label: 'Area fire (linear law)', sign: 'Losses grow with the product of both sides\' numbers: crowding is punished.' },
  { id: 'defeat-in-detail', family: 'force', label: 'Defeat in detail', sign: 'A side is destroyed piecemeal as its parts arrive one at a time.' },
  { id: 'mutual-support', family: 'force', label: 'Mutual support', sign: 'A loss is quickly answered by a nearby teammate: trades.' },
  { id: 'combined-arms', family: 'force', label: 'Combined arms', sign: 'Classes do well together where each covers the other\'s weakness, and badly alone.' },
  { id: 'class-counter', family: 'force', label: 'Class counter', sign: 'One class wins disproportionately against a particular other class or in a particular place.' },
  { id: 'initiative', family: 'force', label: 'Initiative and first strike', sign: 'Whoever scores first in an engagement tends to win it.' },
  // Terrain
  { id: 'key-terrain', family: 'terrain', label: 'Key terrain', sign: 'The same few places decide fights in match after match.' },
  { id: 'fields-of-fire', family: 'terrain', label: 'Observation and fields of fire', sign: 'Places that see far over the ground others must cross score more kills.' },
  { id: 'high-ground', family: 'terrain', label: 'High ground', sign: 'Kills are made from above the ground the victims stand on.' },
  { id: 'cover', family: 'terrain', label: 'Cover and concealment', sign: 'Deaths per time fall where geometry blocks sight and fire.' },
  { id: 'open-ground', family: 'terrain', label: 'Exposure on open ground', sign: 'Deaths per time rise where nothing blocks sight and fire.' },
  { id: 'kill-zone', family: 'terrain', label: 'Kill zone / engagement area', sign: 'Deaths concentrate where movement is forced through observed, fire-covered ground.' },
  { id: 'chokepoint', family: 'terrain', label: 'Chokepoint / defile', sign: 'Many crossings squeezed through little ground, with losses there.' },
  { id: 'reverse-slope', family: 'terrain', label: 'Reverse slope / defilade', sign: 'Safety just behind a crest or wall, out of direct sight of the enemy.' },
  { id: 'safe-ground', family: 'terrain', label: 'Safe ground / sanctuary', sign: 'A place where time is spent but few die.' },
  { id: 'obstacle', family: 'terrain', label: 'Obstacles channel movement', sign: 'Routes bend round blocked ground into a few lanes.' },
  // Movement
  { id: 'flank', family: 'movement', label: 'Flanking / indirect approach', sign: 'A rarely used route leads to more kills than the main ones.' },
  { id: 'avenue-of-approach', family: 'movement', label: 'Avenues of approach', sign: 'Movement flows along a few lanes between areas.' },
  { id: 'mobility', family: 'movement', label: 'Mobility and speed', sign: 'Moving units die less (or more) per time than slow or static ones.' },
  { id: 'static-exposure', family: 'movement', label: 'Static positions get found', sign: 'Units standing still die more per time than moving ones.' },
  { id: 'interior-lines', family: 'movement', label: 'Interior lines', sign: 'A side with short routes between its fights shifts strength faster than the other.' },
  { id: 'envelopment', family: 'movement', label: 'Envelopment / encirclement', sign: 'Kills come from several directions onto one side\'s position.' },
  { id: 'ambush', family: 'movement', label: 'Ambush', sign: 'Units moving along a route die quickly to enemies already in position.' },
  // Time
  { id: 'spawn-pressure', family: 'time', label: 'Spawn pressure', sign: 'Lives end soon after they start at one spawn.' },
  { id: 'tempo', family: 'time', label: 'Tempo and decision cycle', sign: 'The quicker side gets to the fight and scores before the other reacts.' },
  { id: 'surprise', family: 'time', label: 'Surprise', sign: 'Losses come in a burst before the victims fire back.' },
  // Air
  { id: 'energy-advantage', family: 'air', label: 'Energy advantage', sign: 'Killers carry more height and speed than their victims.' },
  { id: 'air-superiority', family: 'air', label: 'Air superiority', sign: 'One side\'s aircraft kill many times what they lose.' },
  { id: 'sead', family: 'air', label: 'Air defence and its suppression', sign: 'Ground air defences take many aircraft until they are found and destroyed.' },
  { id: 'bvr', family: 'air', label: 'Engagement range', sign: 'Kills happen at long range, before the victim can close.' },
  // Sea
  { id: 'fleet-salvo', family: 'sea', label: 'Striking first at sea', sign: 'A force that lands its blow first loses little; the other little survives to answer.' },
  { id: 'scouting', family: 'sea', label: 'Scouting and detection', sign: 'The side that finds the other first chooses the fight.' },
  // Urban
  { id: 'urban-close', family: 'urban', label: 'Close urban combat', sign: 'Short engagement ranges, many deaths among dense geometry, slow clearance.' },
  { id: 'vertical', family: 'urban', label: 'The vertical dimension', sign: 'Kills from upper floors or rooftops onto streets.' },
  // People and skill
  { id: 'skill-dispersion', family: 'people', label: 'Skill dispersion', sign: 'A few players account for a large share of kills or deaths.' },
  { id: 'ai-vs-player', family: 'people', label: 'AI and players differ', sign: 'AI-controlled units fare differently from players in the same place.' },
  // Design
  { id: 'balance', family: 'design', label: 'Balance', sign: 'Sides, spawns or classes start with uneven chances.' },
  { id: 'economy', family: 'design', label: 'Economy', sign: 'Resources earned, paid and lost concentrate in a few places or players.' },
  { id: 'flow', family: 'design', label: 'Level flow', sign: 'How players move through the level: loops, lanes, dead ends.' },
  { id: 'sightlines', family: 'design', label: 'Sightlines', sign: 'Long lines of sight decide where fights start and who wins them.' },
  { id: 'readability', family: 'design', label: 'Readability and fairness', sign: 'Deaths players cannot see coming: from behind, from out of sight.' },
];

export const PATTERN_BY_ID = new Map(PATTERNS.map((p) => [p.id, p]));

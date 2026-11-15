/**
 * Each maneuver's place in the knowledge base: the patterns it shows (the
 * taxonomy of `knowledge/patterns.ts`, movement ones in
 * `patterns-maneuver.ts`) and the entries - doctrine and historical
 * parallels - a reader is pointed to first. Ids only: the worker does not
 * load the knowledge base; `maneuver.test.ts` checks every id resolves.
 */

import type { ManeuverKind } from './types';

interface Link {
  patterns: Record<string, number>;
  kb: string[];
}

const BVR_DEF: Link = { patterns: { 'missile-defence': 1, bvr: 0.6 }, kb: ['concept.bvr-defensive', 'concept.bvr', 'concept.energy-maneuverability'] };

export const LINKS: Record<ManeuverKind, Link> = {
  formation: { patterns: { formation: 1 }, kb: ['concept.tactical-formations', 'concept.finger-four', 'concept.mutual-support'] },
  frontalAssault: { patterns: { 'frontal-assault': 1, attrition: 0.4, concentration: 0.3 }, kb: ['concept.frontal-attack', 'case.picketts-charge', 'case.somme-1916'] },
  flank: { patterns: { flank: 1, envelopment: 0.7 }, kb: ['concept.envelopment', 'concept.indirect-approach', 'case.leuthen', 'case.desert-storm-left-hook'] },
  pincer: { patterns: { 'double-envelopment': 1, envelopment: 0.8, flank: 0.5 }, kb: ['concept.double-envelopment', 'case.cannae', 'case.kiev-1941', 'case.falaise'] },
  encirclement: { patterns: { encirclement: 1, envelopment: 0.6, 'defeat-in-detail': 0.3 }, kb: ['concept.encirclement-pocket', 'case.cannae', 'case.stalingrad', 'case.korsun'] },
  penetration: { patterns: { penetration: 1 }, kb: ['concept.penetration', 'case.ardennes-1940', 'concept.exploitation', 'case.cambrai-1917'] },
  bounding: { patterns: { 'fire-and-maneuver': 1, 'mutual-support': 0.5 }, kb: ['concept.bounding-overwatch', 'concept.fire-and-movement', 'concept.suppression'] },
  concentration: { patterns: { concentration: 1, 'local-superiority': 0.7 }, kb: ['concept.concentration', 'concept.force-ratio', 'concept.lanchester-square', 'case.austerlitz'] },
  dispersion: { patterns: { dispersion: 1, 'area-fire': 0.4 }, kb: ['concept.dispersion', 'concept.lanchester-linear'] },
  feint: { patterns: { feint: 1, surprise: 0.5 }, kb: ['concept.feint-demonstration', 'concept.deception', 'case.leuthen', 'case.operation-bolo'] },
  withdrawal: { patterns: { withdrawal: 1 }, kb: ['concept.retrograde', 'concept.elastic-defence', 'case.dunkirk'] },
  pursuit: { patterns: { pursuit: 1 }, kb: ['concept.pursuit', 'concept.exploitation', 'case.highway-of-death-1991'] },
  defenceInDepth: { patterns: { 'defence-in-depth': 1 }, kb: ['concept.defence-in-depth', 'case.kursk', 'concept.elastic-defence'] },
  reverseSlope: { patterns: { 'reverse-slope': 1, 'defence-in-depth': 0.3 }, kb: ['concept.reverse-slope', 'case.waterloo'] },
  ambush: { patterns: { ambush: 1, surprise: 0.6, 'kill-zone': 0.5 }, kb: ['concept.ambush', 'concept.engagement-area', 'case.teutoburg', 'case.trasimene'] },
  screen: { patterns: { screening: 1, scouting: 0.5 }, kb: ['concept.security-operations', 'concept.reconnaissance-pull'] },
  interiorLines: { patterns: { 'interior-lines': 1 }, kb: ['concept.interior-lines', 'case.tannenberg'] },
  tempo: { patterns: { tempo: 1, initiative: 0.4 }, kb: ['concept.ooda', 'concept.manoeuvre-warfare'] },
  crank: BVR_DEF,
  notch: BVR_DEF,
  drag: BVR_DEF,
  pump: BVR_DEF,
  airPincer: { patterns: { 'double-envelopment': 0.7, bvr: 0.8 }, kb: ['concept.bvr-formations', 'concept.bvr'] },
  wall: { patterns: { formation: 0.7, bvr: 0.8 }, kb: ['concept.bvr-formations', 'concept.bvr'] },
  leadTrail: { patterns: { formation: 0.7, bvr: 0.8 }, kb: ['concept.bvr-formations', 'concept.bvr'] },
  grinder: { patterns: { cap: 0.8, bvr: 0.5, formation: 0.4 }, kb: ['concept.bvr-formations', 'concept.cap'] },
  cap: { patterns: { cap: 1 }, kb: ['concept.cap'] },
  energyFight: { patterns: { 'energy-advantage': 1 }, kb: ['concept.angles-energy-fight', 'concept.energy-maneuverability', 'concept.boom-zoom'] },
  anglesFight: { patterns: { 'angles-fight': 1 }, kb: ['concept.angles-energy-fight', 'concept.bfm-acm'] },
  strikePackage: { patterns: { 'strike-package': 1, sead: 0.4 }, kb: ['concept.strike-package', 'concept.escort-sweep', 'case.bekaa-1982'] },
  sead: { patterns: { sead: 1 }, kb: ['concept.sead', 'case.bekaa-1982', 'case.wild-weasel'] },
  lineOfBattle: { patterns: { 'line-of-battle': 1, formation: 0.5 }, kb: ['concept.line-of-battle', 'case.trafalgar'] },
  crossingT: { patterns: { 'crossing-the-t': 1, 'line-of-battle': 0.5 }, kb: ['concept.crossing-the-t', 'case.tsushima', 'case.surigao-1944'] },
};

export function linksOf(kind: ManeuverKind): Link {
  const l = LINKS[kind];
  return { patterns: { ...l.patterns }, kb: l.kb.slice() };
}

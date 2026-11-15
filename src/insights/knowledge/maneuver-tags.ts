/**
 * The movement patterns (`patterns-maneuver.ts`) that entries kept in the
 * other files also show, by entry id: merged into those entries when the
 * knowledge base is gathered (`index.ts`), so the maneuver detectors find
 * their historical parallels without the entry files changing. An entry's
 * own weight for a pattern wins over the one here.
 */

export const MANEUVER_TAGS: Record<string, Record<string, number>> = {
  // Envelopment, encirclement, the pincer
  'case.cannae': { 'double-envelopment': 1, encirclement: 0.9 },
  'case.kiev-1941': { encirclement: 1, 'double-envelopment': 0.8 },
  'case.falaise': { encirclement: 1, 'double-envelopment': 0.7 },
  'case.stalingrad': { encirclement: 1, 'double-envelopment': 0.7 },
  'case.korsun': { encirclement: 1 },
  'case.tannenberg': { 'double-envelopment': 0.8, encirclement: 0.8 },
  'concept.envelopment': { 'double-envelopment': 0.7, encirclement: 0.6 },
  // Flank, feint, deception
  'case.leuthen': { feint: 0.8, flank: 1 },
  'case.operation-bolo': { feint: 1 },
  'concept.deception': { feint: 1 },
  // Penetration and breakthrough
  'case.ardennes-1940': { penetration: 1 },
  'case.cambrai-1917': { penetration: 0.8 },
  'case.kaiserschlacht': { penetration: 0.9 },
  'concept.exploitation': { penetration: 0.6, pursuit: 0.7 },
  // Defence
  'case.kursk': { 'defence-in-depth': 1 },
  'concept.defence-in-depth': { 'defence-in-depth': 1 },
  'concept.elastic-defence': { 'defence-in-depth': 0.8, withdrawal: 0.5 },
  'case.dunkirk': { withdrawal: 1 },
  'case.highway-of-death-1991': { pursuit: 0.8, withdrawal: 0.6 },
  // Fire and movement
  'concept.bounding-overwatch': { 'fire-and-maneuver': 1 },
  'concept.fire-and-movement': { 'fire-and-maneuver': 1 },
  'concept.reconnaissance-pull': { screening: 0.7 },
  'concept.dispersion': { dispersion: 1 },
  // Frontal attack
  'case.picketts-charge': { 'frontal-assault': 1 },
  'case.somme-1916': { 'frontal-assault': 0.9 },
  // Air
  'concept.cap': { cap: 1 },
  'concept.bvr': { 'missile-defence': 0.5 },
  'concept.bfm-acm': { 'angles-fight': 0.8 },
  'concept.energy-maneuverability': { 'angles-fight': 0.5 },
  'concept.thach-weave': { formation: 0.6 },
  'concept.finger-four': { formation: 0.8 },
  'case.bekaa-1982': { 'strike-package': 0.8 },
  // Sea
  'concept.crossing-the-t': { 'crossing-the-t': 1, 'line-of-battle': 0.6 },
  'case.tsushima': { 'crossing-the-t': 1, 'line-of-battle': 0.8 },
  'case.jutland': { 'crossing-the-t': 0.8, 'line-of-battle': 0.8 },
  'case.surigao-1944': { 'crossing-the-t': 1, 'line-of-battle': 0.6 },
  'case.trafalgar': { 'line-of-battle': 0.9, penetration: 0.6 },
};

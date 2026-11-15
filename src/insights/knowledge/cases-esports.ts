/**
 * Documented competitive matches and moments usable as parallels: only those
 * covered by reputable press, books or peer-reviewed papers, with the source
 * given. What they show is stated in our own words; where accounts differ in
 * detail, only what they agree on is said.
 */

import type { Domain, KbEntry, LensId, Scale } from './types';

interface CaseIn {
  id: string;
  title: string;
  when: string;
  where: string;
  scale: Scale;
  lenses: LensId[];
  domains: Domain[];
  patterns: Record<string, number>;
  summary: string;
  outcome: string;
  lesson: string;
  refs: string[];
  see?: string[];
}
const k = (e: CaseIn): KbEntry => ({ type: 'case', ...e, id: `case.${e.id}` });

export const CASES_ESPORTS: KbEntry[] = [
  k({
    id: 'evo-moment-37', title: 'Evo Moment 37', when: 'Aug 2004', where: 'Evolution Championship Series, Street Fighter III: 3rd Strike', scale: 'engagement',
    lenses: ['esports'], domains: ['any'],
    patterns: { tempo: 0.8, initiative: 0.6, readability: 0.5 },
    summary: 'Facing elimination on one sliver of health, Daigo Umehara parried every hit of Justin Wong\'s super move - a sequence that demanded anticipating each hit - then counter-attacked to win the game.',
    outcome: 'Daigo won the match; the clip became one of the most viewed moments in competitive gaming.',
    lesson: 'A predictable finishing sequence can be read and punished: when the opponent\'s next move is certain, the defender owns the initiative.',
    refs: ['espn-2016-moment37'],
  }),
  k({
    id: 'bisu-revolution', title: 'The Bisu revolution', when: 'Mar 2007', where: 'GomTV MSL final, StarCraft: Brood War', scale: 'battle',
    lenses: ['esports', 'design'], domains: ['any'],
    patterns: { balance: 0.8, 'class-counter': 0.8, mobility: 0.5 },
    summary: 'Against the dominant player of the day, Bisu won the final 3-0 with a Protoss build against Zerg that combined an early expansion with harassing air units, refining an existing idea into a style that made the matchup playable at the top level.',
    outcome: 'Bisu won the title; the style shaped the matchup for years.',
    lesson: 'A matchup that looks unbalanced can be an unsolved strategy; a new approach can move win rates more than any patch.',
    refs: ['teamliquid-2007-revolution', 'taylor-2012'],
  }),
  k({
    id: 'dream-coil-ti3', title: 'The Dream Coil at The International 2013', when: 'Aug 2013', where: 'The International 3 grand final, Dota 2', scale: 'engagement',
    lenses: ['esports'], domains: ['any'],
    patterns: { 'interior-lines': 0.7, 'defeat-in-detail': 0.6, tempo: 0.6, initiative: 0.5 },
    summary: 'In the deciding game of the grand final, Alliance pushed Natus Vincere\'s base while Na\'Vi tried to teleport home to defend; a disabling area spell cancelled the teleports, and Alliance destroyed the base before the defenders could gather.',
    outcome: 'Alliance won the final 3-2.',
    lesson: 'Denying the defender\'s way back to the fight beats out-fighting him: cut his lines and the defence arrives piecemeal or not at all.',
    refs: ['pcgamer-2013-ti3'],
  }),
  k({
    id: 'faker-zed-2013', title: 'Faker\'s Zed against Ryu', when: 'Aug 2013', where: 'Korean regional qualifier for the 2013 World Championship, League of Legends', scale: 'engagement',
    lenses: ['esports'], domains: ['any'],
    patterns: { 'skill-dispersion': 1, initiative: 0.5, readability: 0.4 },
    summary: 'In a deciding game where both mid players picked the same champion, Faker evaded his opponent\'s committed attack and killed him at low health in a duel widely called the greatest outplay in the game\'s history.',
    outcome: 'SK Telecom T1 won the series and went on to win the 2013 World Championship.',
    lesson: 'In a mirror duel, outcomes measure the players: per-player outliers in identical setups are skill, not balance.',
    refs: ['riot-2013-regionals'],
  }),
  k({
    id: 'olofboost', title: 'The Overpass boost', when: 'Nov 2014', where: 'DreamHack Winter 2014 quarterfinal, Counter-Strike: Global Offensive', scale: 'engagement',
    lenses: ['esports', 'design'], domains: ['any'],
    patterns: { sightlines: 1, readability: 0.8, balance: 0.8, 'fields-of-fire': 0.6 },
    summary: 'Fnatic used a player boost to reach a position on the map that gave sight over much of a bombsite through surfaces meant to block it; organisers ruled the map should be replayed because of see-through textures, and Fnatic forfeited instead.',
    outcome: 'Fnatic forfeited; LDLC advanced and the position was removed.',
    lesson: 'A position whose viewshed exceeds what the level intends is a level bug, not a power position; flag hotspots with abnormal fields of fire.',
    refs: ['gamespot-2014-boost'],
    see: ['method.viewshed'],
  }),
  k({
    id: 'coldzera-jump', title: 'The jumping AWP on Mirage', when: 'Apr 2016', where: 'MLG Columbus Major semifinal, Counter-Strike: Global Offensive', scale: 'engagement',
    lenses: ['esports'], domains: ['any'],
    patterns: { surprise: 0.8, 'skill-dispersion': 0.8, chokepoint: 0.5, 'local-superiority': 0.4 },
    summary: 'Defending a bombsite alone against a rush that came through its narrow entrance, coldzera killed four attackers with jumping, unscoped sniper shots, two with one bullet, turning a nearly lost map.',
    outcome: 'Luminosity came back to win the map in overtime and later the Major; Valve marked the spot with a graffiti.',
    lesson: 'Attackers bunched in a choke can lose to one defender against all odds of numbers: crowding at a narrow entry is a liability.',
    refs: ['pcgamer-2016-csgo'],
    see: ['concept.chokepoint'],
  }),
  k({
    id: 'astralis-2018', title: 'Astralis and the utility era', when: '2018', where: 'International Counter-Strike circuit', scale: 'campaign',
    lenses: ['esports', 'military'], domains: ['any'],
    patterns: { 'combined-arms': 0.9, 'mutual-support': 0.9, 'kill-zone': 0.4 },
    summary: 'Astralis won most of the year\'s big finals with play built on coordinated grenades - smokes, flashes and incendiaries timed with entries and retakes - and disciplined trading rather than individual duels; critics called it methodical, rivals copied it.',
    outcome: 'Ten of twelve grand finals won in 2018 according to contemporary reports, and a Major title.',
    lesson: 'Utility timed with movement is combined arms: suppression and blinding let a team take ground at low cost; trades keep it.',
    refs: ['upcomer-2018-astralis'],
    see: ['concept.combined-arms', 'design.trading'],
  }),
  k({
    id: 'openai-five-og', title: 'OpenAI Five against OG', when: 'Apr 2019', where: 'OpenAI Five Finals, Dota 2', scale: 'battle',
    lenses: ['esports', 'design'], domains: ['any'],
    patterns: { 'ai-vs-player': 1, tempo: 0.7, concentration: 0.6 },
    summary: 'A reinforcement-learning team of five agents beat OG, the reigning champions of The International, in two straight games under a restricted hero pool, playing with relentless early aggression and grouping.',
    outcome: 'OpenAI Five won 2-0.',
    lesson: 'Self-taught agents converge on tempo and concentration; human teams lose when they let the opponent dictate both.',
    refs: ['berner-2019'],
    see: ['study.openai-five'],
  }),
  k({
    id: 'alphastar-2019', title: 'AlphaStar reaches grandmaster', when: '2019', where: 'StarCraft II ranked ladder', scale: 'campaign',
    lenses: ['esports', 'design'], domains: ['any'],
    patterns: { 'ai-vs-player': 1, 'skill-dispersion': 0.4 },
    summary: 'DeepMind\'s agent played anonymously on the public ladder with all three races under limits on actions and camera view, reaching grandmaster rank above the vast majority of ranked players.',
    outcome: 'Published in Nature; grandmaster level for all three races.',
    lesson: 'Under human-like limits AI strength comes from decisions; compare AI and players by their choices, not their speed.',
    refs: ['vinyals-2019'],
    see: ['study.alphastar'],
  }),
];
